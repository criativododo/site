import type { FormatoEntrega } from "../conteudo/entrega.types.js";

/**
 * Bloco de formato (SPEC-009 §6.2): unidade do Briefing da Colaboração para um formato.
 * O agregado Briefing da Colaboração em si (identidade `parceiraId × mesReferencia`) não
 * está implementado neste EPIC — só o recorte de leitura que UC-027.02 precisa.
 */
export interface BlocoBriefing {
  /** Identidade própria do Bloco (Backoffice) — a busca do Portal continua pela chave natural (`buscarBloco`). */
  id: string;
  parceiraId: string;
  mesReferencia: string;
  formato: FormatoEntrega;
  look: string;
  dataEntrega: string;
  dataPostagem: string;
  orientacao: string;
  /** DataAprovacaoInterna (SPEC-009 RN-01/INV-03): sempre derivada de `dataPostagem`, nunca informada manualmente. */
  dataAprovacaoInterna: string;
  /** Auditoria mínima (ISO 8601) — mesmo padrão de entrega.types.ts. */
  dataCriacao: string;
  dataAtualizacao: string;
  /**
   * FK para ColaboracaoMensal (ADR-016, Fase 3). Espelha a coluna já criada em
   * `migrations/0002_colaboracao_mensal.sql`; ainda não lida/escrita por
   * `briefing.repository.ts` (Etapa 1 é só schema) — sempre `undefined` até a etapa que
   * atualizar o repository.
   */
  colaboracaoMensalId?: string | null;
}
