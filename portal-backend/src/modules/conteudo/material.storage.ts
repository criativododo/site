import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Armazenamento em disco local — placeholder deliberado (mesma decisão de
 * entrega.repository.ts): nenhuma tecnologia de armazenamento foi decidida para o Portal
 * (PORTAL_BRIEFING.md §13 item 7; PORTAL_ARQUITETURA.md §6 lista Google Drive/S3/disco como
 * equivalentes até essa decisão existir). Isolado atrás desta interface para que trocar de
 * storage não exija mudar conteudo.service.ts.
 */
export interface ArmazenamentoDeMaterial {
  salvar(entregaId: string, arquivo: { buffer: Buffer; nomeOriginal: string }): Promise<string>;
}

const DIRETORIO_UPLOADS = path.resolve(process.cwd(), "uploads");

export class ArmazenamentoLocalEmDisco implements ArmazenamentoDeMaterial {
  async salvar(entregaId: string, arquivo: { buffer: Buffer; nomeOriginal: string }): Promise<string> {
    await mkdir(DIRETORIO_UPLOADS, { recursive: true });

    const extensao = path.extname(arquivo.nomeOriginal);
    const nomeArmazenado = `${entregaId}-${randomUUID()}${extensao}`;
    const caminhoCompleto = path.join(DIRETORIO_UPLOADS, nomeArmazenado);

    await writeFile(caminhoCompleto, arquivo.buffer);

    return nomeArmazenado;
  }
}

export const armazenamentoDeMaterial: ArmazenamentoDeMaterial = new ArmazenamentoLocalEmDisco();
