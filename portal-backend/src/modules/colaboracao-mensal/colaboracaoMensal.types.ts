import type { CondicaoComercial } from "../parceira/parceira.types.js";

/**
 * Vocabulário desta camada segue o Contrato Soberano (§4/§6.3, "Colaboracao Mensal") e
 * ADR-016 (Fase 3 do Plano Mestre). Etapa 1: apenas a forma dos dados que o schema já
 * modela (`migrations/0002_colaboracao_mensal.sql`) — repository/service/routes ficam
 * para as próximas etapas desta fase.
 */

/** Ciclo de vida da Colaboração Mensal (ADR-016 item 6): sem estado intermediário nesta fase. */
export type StatusColaboracaoMensal = "COMPILADA";

export interface ColaboracaoMensal {
  id: string;
  parceiraId: string;
  /** MesReferencia, formato `AAAA-MM` (mesma convenção de entrega.types.ts/briefing.types.ts). */
  mesReferencia: string;
  /** Snapshot imutável da Condição Comercial no momento da compilação (ADR-016 item 4). */
  condicaoComercial: CondicaoComercial;
  status: StatusColaboracaoMensal;
  criadoPor: string;
  criadoEm: string;
  quantidadeRegistrosGerados: number;
}
