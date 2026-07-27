/**
 * Vocabulário desta camada segue SPEC-035 (Identidade e Acesso) e ADR-007
 * (knowledge/ARCHITECTURAL_DECISIONS.md): Google OIDC federado, sem senha local.
 */

export type PapelAtor = "ADMINISTRADOR" | "INFLUENCIADORA";

export type EstadoConta = "PENDING" | "ACTIVE" | "INACTIVE" | "REJECTED";

export interface Identidade {
  /** Claim `sub` do ID Token do Google — identificador imutável do provedor. */
  subProvider: string;
  emailPerfil: string;
  nomeCompleto: string;
  papelAtor: PapelAtor;
  estadoConta: EstadoConta;
  /**
   * Só relevante para papel INFLUENCIADORA. Nulo enquanto a conta não for vinculada a uma
   * Parceira (ver ADR-006/ADR-008 — modelo de Parceira ainda não existe fisicamente neste
   * EPIC; a vinculação real fica para o EPIC em que Parceira for modelada).
   */
  parceiraId: string | null;
  dataCriacao: string;
  ultimoAcesso: string;
}
