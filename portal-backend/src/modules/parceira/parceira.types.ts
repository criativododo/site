/**
 * Vocabulário desta camada segue SPEC-002 (agregado Parceira, CondicaoComercial) e SPEC-001
 * (RN-01: nasce Inativa). Backoffice administrativo — primeiro módulo a modelar fisicamente
 * o agregado Parceira neste repositório (até aqui só existia `parceiraId` como referência).
 */

export type StatusParceira = "ATIVA" | "INATIVA";

/** CondicaoComercial (SPEC-002 §6.1): Value Object com valor e entregáveis contratados. */
export interface CondicaoComercial {
  valorMensal: number;
  entregaveisReel: number;
  entregaveisCarrossel: number;
  entregaveisStories: number;
  prazoUsoImagemDias: number;
}

export interface Parceira {
  id: string;
  /** ChaveInfluenciadora (SPEC-002 §6.2) — cupom/nome-chave, identidade de negócio. */
  chave: string;
  nome: string;
  email: string;
  cnpj: string;
  pix: string;
  status: StatusParceira;
  condicaoComercial: CondicaoComercial;
  dataCriacao: string;
}
