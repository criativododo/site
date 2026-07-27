import { randomUUID } from "node:crypto";
import { exclusaoRepositorio } from "./exclusao.repository.js";
import type { SolicitacaoExclusao } from "./exclusao.types.js";

/** ADR-010 ponto 7: Parceira solicita exclusão — nunca apaga dado, só registra o pedido. */
export async function solicitarExclusao(parceiraId: string): Promise<SolicitacaoExclusao> {
  return exclusaoRepositorio.criar({
    id: randomUUID(),
    parceiraId,
    dataPedido: new Date().toISOString(),
    status: "PENDENTE",
    responsavelAnalise: null,
    fundamentoJuridico: null,
    dataDecisao: null,
  });
}

/** ADR-010 ponto 7: fila de moderação do Administrador. */
export async function listarSolicitacoesPendentes(): Promise<SolicitacaoExclusao[]> {
  return exclusaoRepositorio.listarPorStatus("PENDENTE");
}

export type ResultadoDecisaoExclusao =
  | { ok: true; solicitacao: SolicitacaoExclusao }
  | { ok: false; motivo: "NAO_ENCONTRADA" }
  | { ok: false; motivo: "NAO_PENDENTE" };

/**
 * ADR-010 ponto 7: só o Administrador decide (garantido por `requireAdmin` na rota); registra
 * responsável, fundamento jurídico e data da decisão — nunca executa o expurgo físico aqui
 * (mecanismo de anonimização/eliminação real depende da tecnologia de persistência, ainda não
 * decidida — mesma pendência de infraestrutura do §13 item 7 do PORTAL_BRIEFING.md).
 */
export async function decidirExclusao(
  id: string,
  decisao: { aprovada: boolean; fundamentoJuridico: string; responsavelAnalise: string },
): Promise<ResultadoDecisaoExclusao> {
  const solicitacao = await exclusaoRepositorio.buscarPorId(id);
  if (!solicitacao) {
    return { ok: false, motivo: "NAO_ENCONTRADA" };
  }
  if (solicitacao.status !== "PENDENTE") {
    return { ok: false, motivo: "NAO_PENDENTE" };
  }

  const atualizada = await exclusaoRepositorio.atualizar({
    ...solicitacao,
    status: decisao.aprovada ? "APROVADA" : "NEGADA",
    fundamentoJuridico: decisao.fundamentoJuridico,
    responsavelAnalise: decisao.responsavelAnalise,
    dataDecisao: new Date().toISOString(),
  });

  return { ok: true, solicitacao: atualizada };
}
