/**
 * Vocabulário desta camada segue SPEC-035 (Identidade e Acesso) e ADR-007
 * (knowledge/ARCHITECTURAL_DECISIONS.md): Google OIDC federado, sem senha local.
 */

/**
 * `ADMINISTRADOR_MARCA` (ADR-022, nível 2): visão operacional restrita da própria campanha —
 * não é um novo tenant, é um ator adicional dentro do mesmo domínio single-tenant.
 */
export type PapelAtor = "ADMINISTRADOR" | "ADMINISTRADOR_MARCA" | "INFLUENCIADORA";

/**
 * `AGUARDANDO_CADASTRO` (ADR-011): primeiro login com Google feito, mas o formulário de
 * cadastro ainda não foi enviado — precede `PENDING` no fluxo padrão. Toda conta nova nasce
 * aqui, exceto bootstrap de Administrador/seed de QA (que nascem `ACTIVE` diretamente).
 */
export type EstadoConta = "AGUARDANDO_CADASTRO" | "PENDING" | "ACTIVE" | "INACTIVE" | "REJECTED";

/**
 * ADR-011: de onde veio o acesso. `CONVITE_PREAPROVADO` pula a moderação manual — ao enviar o
 * cadastro, a conta vai direto para `ACTIVE` em vez de passar por `PENDING`.
 */
export type OrigemAcesso = "PADRAO" | "CONVITE_PREAPROVADO";

export interface Identidade {
  /** Claim `sub` do ID Token do Google — identificador imutável do provedor. */
  subProvider: string;
  emailPerfil: string;
  nomeCompleto: string;
  papelAtor: PapelAtor;
  estadoConta: EstadoConta;
  origemAcesso: OrigemAcesso;
  /**
   * Só relevante para papel INFLUENCIADORA. Nulo enquanto a conta não for vinculada a uma
   * Parceira — passa a ter valor quando o cadastro (ADR-011) é enviado e a Parceira é criada.
   */
  parceiraId: string | null;
  dataCriacao: string;
  ultimoAcesso: string;
}
