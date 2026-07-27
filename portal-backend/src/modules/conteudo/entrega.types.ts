/**
 * Vocabulário desta camada segue SPEC-012 (Entrega, Estado da Entrega) e SPEC-027 (Portal de
 * Conteúdo). SPEC-012 em si não está implementada neste EPIC — só o recorte mínimo de dados
 * necessário para o Portal ter Entregas reais para listar (PORTAL_BACKLOG.md EPIC 2).
 */

export type FormatoEntrega = "Reel" | "Carrossel" | "Stories1" | "Stories2";

/** 4 estados canônicos da Entrega (SPEC-012 §9 / ADR-001 §2.2). */
export type EstadoEntrega = "AGUARDANDO_MATERIAL" | "EM_REVISAO" | "APROVADO" | "PUBLICADO";

export interface Entrega {
  id: string;
  parceiraId: string;
  /** MesReferencia, formato `AAAA-MM` (SPEC-005 ADR-001 §3). */
  mesReferencia: string;
  formato: FormatoEntrega;
  estado: EstadoEntrega;
  /** Data prevista de entrega do material (espelhada do Briefing, SPEC-009 — não implementada aqui). */
  dataEntrega: string;
}

/** ItemDePendencia (SPEC-027 §6.1): projeção de leitura da Entrega para o Portal. */
export interface ItemDePendencia {
  id: string;
  mesReferencia: string;
  formato: FormatoEntrega;
  estado: EstadoEntrega;
  dataEntrega: string;
}
