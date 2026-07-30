import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import type { ReadableStream as WebReadableStream } from "node:stream/web";
import { comRetentativa, chamarDriveApi, DRIVE_UPLOAD_API } from "./comRetentativa.js";
import { logEvento } from "../log.js";
import type { ProvedorDeArmazenamento } from "../provedorDeArmazenamento.js";
import type { PaginaDeRecursos, ParametrosDeEnvio, RecursoDeArmazenamento } from "../tipos.js";

const CONTEXTO_LOG = "ProvedorDeArmazenamentoGoogleDrive";
const MIME_TYPE_PASTA = "application/vnd.google-apps.folder";
const CAMPOS_ARQUIVO = "id,name,mimeType,size,createdTime,modifiedTime,appProperties";

interface ArquivoDriveJson {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime: string;
  modifiedTime: string;
  appProperties?: Record<string, string>;
}

function mapearArquivoDrive(json: ArquivoDriveJson): RecursoDeArmazenamento {
  return {
    id: json.id,
    nome: json.name,
    tipo: json.mimeType === MIME_TYPE_PASTA ? "pasta" : "arquivo",
    caminhoLogico: json.name,
    tamanhoBytes: json.size !== undefined ? Number(json.size) : undefined,
    tipoMime: json.mimeType,
    criadoEm: json.createdTime,
    atualizadoEm: json.modifiedTime,
  };
}

/** Escapa valor de string literal dentro de uma query da Drive API (`q=...`). */
function escaparValorQuery(valor: string): string {
  return valor.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function queryAppProperty(chave: string, valor: string): string {
  return `appProperties has { key='${escaparValorQuery(chave)}' and value='${escaparValorQuery(valor)}' }`;
}

function construirCorpoMultipart(
  metadata: Record<string, unknown>,
  conteudo: Buffer,
  tipoMime: string,
): { body: Buffer; contentType: string } {
  const boundary = `storage_dodo_${randomUUID()}`;
  const cabecalhoMetadata = Buffer.from(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`,
    "utf8",
  );
  const cabecalhoMedia = Buffer.from(`--${boundary}\r\nContent-Type: ${tipoMime}\r\n\r\n`, "utf8");
  const rodape = Buffer.from(`\r\n--${boundary}--`, "utf8");

  return {
    body: Buffer.concat([cabecalhoMetadata, cabecalhoMedia, conteudo, rodape]),
    contentType: `multipart/related; boundary=${boundary}`,
  };
}

/**
 * Implementação concreta de `ProvedorDeArmazenamento` sobre a Drive API v3, via `fetch`
 * nativo (§2.4 do TDD). Sem construtor de credencial: reaproveita `obterAccessTokenDrive()`
 * (ADR-017) por import, dentro de `comRetentativa()`/`chamarDriveApi()`.
 */
export class ProvedorDeArmazenamentoGoogleDrive implements ProvedorDeArmazenamento {
  async criarPasta(nome: string, pastaPaiId: string | null): Promise<RecursoDeArmazenamento> {
    const inicio = Date.now();
    const resultado = await comRetentativa(
      async () => {
        if (pastaPaiId !== null) {
          const existente = await this.buscarPastaPorNomeEPai(nome, pastaPaiId);
          if (existente) return existente;
        }

        const metadata: Record<string, unknown> = { name: nome, mimeType: MIME_TYPE_PASTA };
        if (pastaPaiId !== null) metadata.parents = [pastaPaiId];

        const resposta = await chamarDriveApi(`/files?fields=${CAMPOS_ARQUIVO}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(metadata),
        });
        return mapearArquivoDrive((await resposta.json()) as ArquivoDriveJson);
      },
      { operacao: "criarPasta" },
    );
    logEvento(CONTEXTO_LOG, {
      operacao: "criarPasta",
      recursoId: resultado.id,
      resultado: "sucesso",
      duracaoMs: Date.now() - inicio,
    });
    return resultado;
  }

  async enviarArquivo(params: ParametrosDeEnvio): Promise<RecursoDeArmazenamento> {
    const inicio = Date.now();
    const resultado = await comRetentativa(
      async () => {
        const existente = await this.buscarArquivoPorIdentidade(params.pastaId, params.identidadeDoRecurso);

        if (!existente) {
          const metadata = {
            name: params.nomeArquivo,
            parents: [params.pastaId],
            mimeType: params.tipoMime,
            appProperties: {
              identidadeDoRecurso: params.identidadeDoRecurso,
              chaveDeIdempotencia: params.chaveDeIdempotencia,
            },
          };
          const { body, contentType } = construirCorpoMultipart(metadata, params.conteudo, params.tipoMime);
          const resposta = await chamarDriveApi(
            `/files?uploadType=multipart&fields=${CAMPOS_ARQUIVO}`,
            { method: "POST", headers: { "Content-Type": contentType }, body },
            DRIVE_UPLOAD_API,
          );
          return mapearArquivoDrive((await resposta.json()) as ArquivoDriveJson);
        }

        const chaveArmazenada = existente.appProperties?.chaveDeIdempotencia;
        if (chaveArmazenada === params.chaveDeIdempotencia) {
          return mapearArquivoDrive(existente);
        }

        const metadataSubstituicao = { appProperties: { chaveDeIdempotencia: params.chaveDeIdempotencia } };
        const { body, contentType } = construirCorpoMultipart(metadataSubstituicao, params.conteudo, params.tipoMime);
        const resposta = await chamarDriveApi(
          `/files/${existente.id}?uploadType=multipart&fields=${CAMPOS_ARQUIVO}`,
          { method: "PATCH", headers: { "Content-Type": contentType }, body },
          DRIVE_UPLOAD_API,
        );
        return mapearArquivoDrive((await resposta.json()) as ArquivoDriveJson);
      },
      { operacao: "enviarArquivo", chaveDeIdempotencia: params.chaveDeIdempotencia },
    );
    logEvento(CONTEXTO_LOG, {
      operacao: "enviarArquivo",
      recursoId: resultado.id,
      chaveDeIdempotencia: params.chaveDeIdempotencia,
      tamanhoBytes: params.conteudo.byteLength,
      resultado: "sucesso",
      duracaoMs: Date.now() - inicio,
    });
    return resultado;
  }

  async baixarArquivo(
    recursoId: string,
  ): Promise<{ conteudo: NodeJS.ReadableStream; tipoMime: string; tamanhoBytes: number }> {
    const inicio = Date.now();
    const resultado = await comRetentativa(
      async () => {
        const resposta = await chamarDriveApi(`/files/${recursoId}?alt=media`);
        const tipoMime = resposta.headers.get("Content-Type") ?? "application/octet-stream";
        const tamanhoBytes = Number(resposta.headers.get("Content-Length") ?? 0);
        const conteudo = Readable.fromWeb(resposta.body as WebReadableStream<Uint8Array>);
        return { conteudo, tipoMime, tamanhoBytes };
      },
      { operacao: "baixarArquivo", recursoId },
    );
    logEvento(CONTEXTO_LOG, {
      operacao: "baixarArquivo",
      recursoId,
      tamanhoBytes: resultado.tamanhoBytes,
      resultado: "sucesso",
      duracaoMs: Date.now() - inicio,
    });
    return resultado;
  }

  async renomear(recursoId: string, novoNome: string): Promise<RecursoDeArmazenamento> {
    const inicio = Date.now();
    const resultado = await comRetentativa(
      async () => {
        const resposta = await chamarDriveApi(`/files/${recursoId}?fields=${CAMPOS_ARQUIVO}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: novoNome }),
        });
        return mapearArquivoDrive((await resposta.json()) as ArquivoDriveJson);
      },
      { operacao: "renomear", recursoId },
    );
    logEvento(CONTEXTO_LOG, { operacao: "renomear", recursoId, resultado: "sucesso", duracaoMs: Date.now() - inicio });
    return resultado;
  }

  async remover(recursoId: string): Promise<void> {
    const inicio = Date.now();
    await comRetentativa(
      async () => {
        await chamarDriveApi(`/files/${recursoId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trashed: true }),
        });
      },
      { operacao: "remover", recursoId },
    );
    logEvento(CONTEXTO_LOG, { operacao: "remover", recursoId, resultado: "sucesso", duracaoMs: Date.now() - inicio });
  }

  async listar(pastaId: string, tamanhoPagina?: number, tokenPagina?: string): Promise<PaginaDeRecursos> {
    const inicio = Date.now();
    const resultado = await comRetentativa(
      async () => {
        const q = `'${escaparValorQuery(pastaId)}' in parents and trashed=false`;
        const parametros = new URLSearchParams({
          q,
          fields: `nextPageToken,files(${CAMPOS_ARQUIVO})`,
        });
        if (tamanhoPagina !== undefined) parametros.set("pageSize", String(tamanhoPagina));
        if (tokenPagina !== undefined) parametros.set("pageToken", tokenPagina);

        const resposta = await chamarDriveApi(`/files?${parametros.toString()}`);
        const corpo = (await resposta.json()) as { files: ArquivoDriveJson[]; nextPageToken?: string };
        return {
          itens: corpo.files.map(mapearArquivoDrive),
          proximoToken: corpo.nextPageToken,
        };
      },
      { operacao: "listar", recursoId: pastaId },
    );
    logEvento(CONTEXTO_LOG, {
      operacao: "listar",
      recursoId: pastaId,
      resultado: "sucesso",
      duracaoMs: Date.now() - inicio,
    });
    return resultado;
  }

  async obterMetadados(recursoId: string): Promise<RecursoDeArmazenamento> {
    const inicio = Date.now();
    const resultado = await comRetentativa(
      async () => {
        const resposta = await chamarDriveApi(`/files/${recursoId}?fields=${CAMPOS_ARQUIVO}`);
        return mapearArquivoDrive((await resposta.json()) as ArquivoDriveJson);
      },
      { operacao: "obterMetadados", recursoId },
    );
    logEvento(CONTEXTO_LOG, {
      operacao: "obterMetadados",
      recursoId,
      resultado: "sucesso",
      duracaoMs: Date.now() - inicio,
    });
    return resultado;
  }

  /** Usado internamente por `criarPasta` — resolução por nome é suficiente (nome é a
   *  identidade estável de pasta, ao contrário de arquivo, ver §2.8 do TDD). */
  private async buscarPastaPorNomeEPai(nome: string, pastaPaiId: string): Promise<RecursoDeArmazenamento | null> {
    const q = `'${escaparValorQuery(pastaPaiId)}' in parents and name='${escaparValorQuery(nome)}' and mimeType='${MIME_TYPE_PASTA}' and trashed=false`;
    const resposta = await chamarDriveApi(`/files?q=${encodeURIComponent(q)}&fields=files(${CAMPOS_ARQUIVO})`);
    const corpo = (await resposta.json()) as { files: ArquivoDriveJson[] };
    return corpo.files[0] ? mapearArquivoDrive(corpo.files[0]) : null;
  }

  /** Usado internamente por `enviarArquivo` — identidade de arquivo via `appProperties`
   *  (§2.9 do TDD), não por nome (que pode variar de extensão entre reenvios). */
  private async buscarArquivoPorIdentidade(
    pastaId: string,
    identidadeDoRecurso: string,
  ): Promise<ArquivoDriveJson | null> {
    const q = `'${escaparValorQuery(pastaId)}' in parents and ${queryAppProperty("identidadeDoRecurso", identidadeDoRecurso)} and trashed=false`;
    const resposta = await chamarDriveApi(`/files?q=${encodeURIComponent(q)}&fields=files(${CAMPOS_ARQUIVO})`);
    const corpo = (await resposta.json()) as { files: ArquivoDriveJson[] };
    return corpo.files[0] ?? null;
  }
}
