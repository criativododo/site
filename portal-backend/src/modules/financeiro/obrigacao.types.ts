/**
 * Vocabulário desta camada segue SPEC-020 (Obrigação Financeira, Estado do Pagamento).
 * CRUD administrativo completo (lançamento, edição, liberação, pagamento, remoção) implementado
 * em financeiro.service.ts/financeiro/admin.routes.ts, seguindo SPEC-020/ADR-009.
 */

/** 3 estados canônicos do Pagamento (SPEC-020 §9 / ADR-001 §2.3). */
export type EstadoObrigacao = "EM_ABERTO" | "APROVADO" | "PAGO";

/**
 * SPEC-020 §5/§9: `MENSAL` é a Obrigação da Colaboração Mensal (1 por Parceira×competência,
 * RN análoga a RN-01), passa pelo gate de elegibilidade de ADR-009 (todas as Entregas da
 * competência Aprovadas/Publicadas). `AVULSO` é o pagamento extra/UGC (RN-04/CB-01) — permitido
 * fora do mês padrão, liberação manual do Admin, nunca passa pelo gate.
 */
export type TipoObrigacao = "MENSAL" | "AVULSO";

export interface ObrigacaoFinanceira {
  id: string;
  parceiraId: string;
  mesReferencia: string;
  valor: number;
  estado: EstadoObrigacao;
  tipo: TipoObrigacao;
  /** Auditoria mínima (ISO 8601) — mesmo padrão de entrega.types.ts/briefing.types.ts. */
  dataCriacao: string;
  dataAtualizacao: string;
  /** RN-03/INV-03 (SPEC-020): carimbada ao virar PAGO; a partir daí o registro é somente leitura. */
  dataArquivamento: string | null;
}
