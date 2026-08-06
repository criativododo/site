import { randomUUID } from "node:crypto";
import path from "node:path";
import { ErroDeArmazenamento, ErroTransitorioDeArmazenamento } from "./erros.js";
import { logErro, logEvento } from "../log.js";
import type { ProvedorDeArmazenamento } from "./provedorDeArmazenamento.js";
import type { RecursoDeArmazenamento } from "./tipos.js";

const CONTEXTO_LOG = "ServicoDeArmazenamento";

/** Nome fixo, primeiro nível sob a raiz do Portal (§3.2 do TDD) — não é dimensão de domínio. */
const NOME_PASTA_PARCEIRAS = "Parceiras";

export interface ParametrosDeEnvioDeMaterial {
  entregaId: string;
  parceiraId: string;
  mesReferencia: string;
  formato: string;
  nomeOriginal: string;
  conteudo: Buffer;
  tipoMime: string;
}

export interface ServicoDeArmazenamento {
  /** Resolve, provisionando se necessário, a pasta Parceira × MesReferencia (§3 do TDD). */
  resolverPastaDaColaboracao(parceiraId: string, mesReferencia: string): Promise<RecursoDeArmazenamento>;

  enviarMaterialDaEntrega(params: ParametrosDeEnvioDeMaterial): Promise<RecursoDeArmazenamento>;
}

function traduzirErroDeArmazenamento(erro: unknown): Error {
  if (erro instanceof ErroDeArmazenamento) return erro;
  return new ErroTransitorioDeArmazenamento(
    erro instanceof Error ? erro.message : "Erro desconhecido de armazenamento.",
    erro,
  );
}

export class ServicoDeArmazenamentoImpl implements ServicoDeArmazenamento {
  constructor(
    private readonly provedor: ProvedorDeArmazenamento,
    private readonly pastaRaizId: string,
  ) {}

  async resolverPastaDaColaboracao(parceiraId: string, mesReferencia: string): Promise<RecursoDeArmazenamento> {
    const inicio = Date.now();
    try {
      const pastaParceiras = await this.resolverOuCriarPasta(NOME_PASTA_PARCEIRAS, this.pastaRaizId);
      const pastaParceira = await this.resolverOuCriarPasta(parceiraId, pastaParceiras.id);
      const pastaColaboracao = await this.resolverOuCriarPasta(mesReferencia, pastaParceira.id);
      logEvento(CONTEXTO_LOG, {
        operacao: "resolverPastaDaColaboracao",
        recursoId: pastaColaboracao.id,
        resultado: "sucesso",
        duracaoMs: Date.now() - inicio,
      });
      return pastaColaboracao;
    } catch (erro) {
      logErro(CONTEXTO_LOG, { operacao: "resolverPastaDaColaboracao", resultado: "erro", duracaoMs: Date.now() - inicio });
      throw traduzirErroDeArmazenamento(erro);
    }
  }

  async enviarMaterialDaEntrega(params: ParametrosDeEnvioDeMaterial): Promise<RecursoDeArmazenamento> {
    const inicio = Date.now();
    // Gerada uma vez por chamada; reaproveitada só pelas retentativas de rede de
    // comRetentativa() dentro desta mesma chamada — nunca entre chamadas distintas (§2.9).
    const chaveDeIdempotencia = randomUUID();
    try {
      const pastaColaboracao = await this.resolverPastaInterna(params.parceiraId, params.mesReferencia);
      const extensao = path.extname(params.nomeOriginal);
      const nomeArquivo = `${params.formato}-${params.entregaId}${extensao}`;

      const resultado = await this.provedor.enviarArquivo({
        pastaId: pastaColaboracao.id,
        nomeArquivo,
        conteudo: params.conteudo,
        tipoMime: params.tipoMime,
        identidadeDoRecurso: params.entregaId,
        chaveDeIdempotencia,
      });
      logEvento(CONTEXTO_LOG, {
        operacao: "enviarMaterialDaEntrega",
        recursoId: resultado.id,
        chaveDeIdempotencia,
        entregaId: params.entregaId,
        formato: params.formato,
        resultado: "sucesso",
        duracaoMs: Date.now() - inicio,
      });
      return resultado;
    } catch (erro) {
      logErro(CONTEXTO_LOG, {
        operacao: "enviarMaterialDaEntrega",
        chaveDeIdempotencia,
        entregaId: params.entregaId,
        resultado: "erro",
        duracaoMs: Date.now() - inicio,
      });
      throw traduzirErroDeArmazenamento(erro);
    }
  }

  /** Idêntico a `resolverPastaDaColaboracao`, sem o try/catch duplicado — evita traduzir o
   *  mesmo erro duas vezes quando chamado a partir de `enviarMaterialDaEntrega`. */
  private async resolverPastaInterna(parceiraId: string, mesReferencia: string): Promise<RecursoDeArmazenamento> {
    const pastaParceiras = await this.resolverOuCriarPasta(NOME_PASTA_PARCEIRAS, this.pastaRaizId);
    const pastaParceira = await this.resolverOuCriarPasta(parceiraId, pastaParceiras.id);
    return this.resolverOuCriarPasta(mesReferencia, pastaParceira.id);
  }

  /** Busca por nome dentro do pai (paginando se necessário); cria só se não encontrada. */
  private async resolverOuCriarPasta(nome: string, pastaPaiId: string): Promise<RecursoDeArmazenamento> {
    let tokenPagina: string | undefined;
    do {
      const pagina = await this.provedor.listar(pastaPaiId, undefined, tokenPagina);
      const encontrada = pagina.itens.find((item) => item.tipo === "pasta" && item.nome === nome);
      if (encontrada) return encontrada;
      tokenPagina = pagina.proximoToken;
    } while (tokenPagina !== undefined);

    return this.provedor.criarPasta(nome, pastaPaiId);
  }
}
