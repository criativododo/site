/**
 * Vocabulário desta camada segue SPEC-020 (Obrigação Financeira, Estado do Pagamento).
 * SPEC-020 em si não está implementada neste EPIC — só o recorte mínimo necessário para o
 * Portal ter dado real de financeiro (PORTAL_BACKLOG.md EPIC 3 permite stub/seed).
 */

/** 3 estados canônicos do Pagamento (SPEC-020 §9 / ADR-001 §2.3). */
export type EstadoObrigacao = "EM_ABERTO" | "APROVADO" | "PAGO";

export interface ObrigacaoFinanceira {
  id: string;
  parceiraId: string;
  mesReferencia: string;
  valor: number;
  estado: EstadoObrigacao;
}
