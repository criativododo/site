import { env } from "../../config/env.js";
import { identidadeRepositorio } from "./identidade.repository.js";
import type { Identidade } from "./identidade.types.js";

export interface ClaimsGoogle {
  sub: string;
  email: string;
  emailVerificado: boolean;
  nome: string;
}

/**
 * Implementa o fluxo de resolução de identidade de SPEC-035 Cap. 5/9-10 (ADR-007):
 *
 *   sub existente            → conta já resolvida, só atualiza último acesso.
 *   sub inexistente           → nasce PENDING (INFLUENCIADORA), EXCETO se o e-mail estiver
 *                               na lista de bootstrap (RN-07), caso em que nasce ACTIVE
 *                               como ADMINISTRADOR.
 *
 * A vinculação de uma Parceira pré-existente a uma identidade nova por coincidência de
 * e-mail é, por decisão de SPEC-035 §5.1-A, sempre um fluxo de CONFIRMAÇÃO MANUAL EXPLÍCITA
 * da usuária — nunca associação automática silenciosa. Esse fluxo de confirmação (e o
 * próprio modelo de Parceira) ainda não existem neste EPIC (fundação); por isso toda conta
 * nova nasce sem `parceiraId`, independentemente de e-mail coincidente. Não inventar aqui um
 * atalho de auto-vinculação — ver ADR-003.
 */
export async function resolverOuCriarIdentidade(claims: ClaimsGoogle): Promise<Identidade> {
  const existente = await identidadeRepositorio.buscarPorSub(claims.sub);
  const agora = new Date().toISOString();

  if (existente) {
    const atualizada: Identidade = { ...existente, ultimoAcesso: agora };
    return identidadeRepositorio.salvar(atualizada);
  }

  const ehBootstrapAdministrador = env.adminBootstrapEmails.includes(
    claims.email.trim().toLowerCase(),
  );

  // Seed de dev/QA (env.parceiraSeed, ver config/env.ts) — substitui, só para este e-mail
  // fixo, o fluxo real de vinculação de SPEC-035 §5.1-A que ainda não existe fisicamente.
  const ehParceiraSeed =
    !ehBootstrapAdministrador &&
    env.parceiraSeed.email.length > 0 &&
    claims.email.trim().toLowerCase() === env.parceiraSeed.email;

  const nova: Identidade = {
    subProvider: claims.sub,
    emailPerfil: claims.email,
    nomeCompleto: claims.nome,
    papelAtor: ehBootstrapAdministrador ? "ADMINISTRADOR" : "INFLUENCIADORA",
    estadoConta: ehBootstrapAdministrador || ehParceiraSeed ? "ACTIVE" : "PENDING",
    parceiraId: ehParceiraSeed ? env.parceiraSeed.id : null,
    dataCriacao: agora,
    ultimoAcesso: agora,
  };

  return identidadeRepositorio.salvar(nova);
}

/** UC-035 (Feature 5.3) · Fila de moderação: contas aguardando decisão do Administrador. */
export async function listarContasPendentes(): Promise<Identidade[]> {
  return identidadeRepositorio.listarPorEstado("PENDING");
}

export type ResultadoModeracao =
  | { ok: true; identidade: Identidade }
  | { ok: false; motivo: "NAO_ENCONTRADA" }
  | { ok: false; motivo: "NAO_PENDENTE" };

/**
 * RN-04: só Administrador decide (garantido por `requireAdmin` na rota); só uma conta
 * `PENDING` pode transicionar — decisão já tomada (`ACTIVE`/`REJECTED`) não é reaberta aqui.
 */
async function moderarConta(
  subProvider: string,
  novoEstado: "ACTIVE" | "REJECTED",
): Promise<ResultadoModeracao> {
  const identidade = await identidadeRepositorio.buscarPorSub(subProvider);
  if (!identidade) {
    return { ok: false, motivo: "NAO_ENCONTRADA" };
  }
  if (identidade.estadoConta !== "PENDING") {
    return { ok: false, motivo: "NAO_PENDENTE" };
  }

  const atualizada = await identidadeRepositorio.salvar({ ...identidade, estadoConta: novoEstado });
  return { ok: true, identidade: atualizada };
}

/** UC-035 (Feature 5.3) · Aprovar: PENDING → ACTIVE. */
export function aprovarConta(subProvider: string): Promise<ResultadoModeracao> {
  return moderarConta(subProvider, "ACTIVE");
}

/** UC-035 (Feature 5.3) · Rejeitar: PENDING → REJECTED. */
export function rejeitarConta(subProvider: string): Promise<ResultadoModeracao> {
  return moderarConta(subProvider, "REJECTED");
}
