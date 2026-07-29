import { env } from "../../config/env.js";
import { cadastrarParceira } from "../parceira/parceira.service.js";
import { montarEndereco } from "../perfil/perfil.service.js";
import { perfilRepositorio } from "../perfil/perfil.repository.js";
import { resolvedorDeCep } from "../perfil/cep.resolver.js";
import { buscarConviteValido, consumirConvite } from "./convite.service.js";
import { identidadeRepositorio } from "./identidade.repository.js";
import type { Identidade } from "./identidade.types.js";

export interface ClaimsGoogle {
  sub: string;
  email: string;
  emailVerificado: boolean;
  nome: string;
}

/**
 * Implementa o fluxo de resolução de identidade de SPEC-035 Cap. 5/9-10 (ADR-007/ADR-011):
 *
 *   sub existente             → conta já resolvida, só atualiza último acesso — EXCETO se o
 *                                e-mail estiver na lista de bootstrap e a conta ainda não for
 *                                ADMINISTRADOR ACTIVE, caso em que é promovida nesse mesmo
 *                                login (ADR-012). Promoção nunca é revertida automaticamente
 *                                — sair da lista não rebaixa ninguém; rebaixar continua sendo
 *                                ação manual do Administrador (RN-04/RN-05).
 *   sub inexistente            → nasce AGUARDANDO_CADASTRO (INFLUENCIADORA), EXCETO se o
 *                                e-mail estiver na lista de bootstrap (RN-07), caso em que
 *                                nasce ACTIVE como ADMINISTRADOR. Se vier de um link de
 *                                convite válido (ADR-011), nasce com `origemAcesso =
 *                                CONVITE_PREAPROVADO`, o que pula a moderação manual assim
 *                                que o cadastro for enviado (ver `submeterCadastro`).
 *
 * A vinculação de uma Parceira pré-existente a uma identidade nova por coincidência de
 * e-mail é, por decisão de SPEC-035 §5.1-A, sempre um fluxo de CONFIRMAÇÃO MANUAL EXPLÍCITA
 * da usuária — nunca associação automática silenciosa. Não inventar aqui um atalho de
 * auto-vinculação — ver ADR-003.
 */
export async function resolverOuCriarIdentidade(
  claims: ClaimsGoogle,
  conviteToken?: string | null,
): Promise<Identidade> {
  const existente = await identidadeRepositorio.buscarPorSub(claims.sub);
  const agora = new Date().toISOString();

  const ehBootstrapAdministrador = env.adminBootstrapEmails.includes(
    claims.email.trim().toLowerCase(),
  );

  if (existente) {
    const precisaPromoverBootstrap =
      ehBootstrapAdministrador &&
      (existente.papelAtor !== "ADMINISTRADOR" || existente.estadoConta !== "ACTIVE");

    const atualizada: Identidade = precisaPromoverBootstrap
      ? { ...existente, papelAtor: "ADMINISTRADOR", estadoConta: "ACTIVE", ultimoAcesso: agora }
      : { ...existente, ultimoAcesso: agora };
    return identidadeRepositorio.salvar(atualizada);
  }

  // Seed de dev/QA (env.parceiraSeed, ver config/env.ts) — substitui, só para este e-mail
  // fixo, o fluxo real de vinculação de SPEC-035 §5.1-A que ainda não existe fisicamente.
  const ehParceiraSeed =
    !ehBootstrapAdministrador &&
    env.parceiraSeed.email.length > 0 &&
    claims.email.trim().toLowerCase() === env.parceiraSeed.email;

  const convite = ehBootstrapAdministrador || ehParceiraSeed || !conviteToken
    ? null
    : await buscarConviteValido(conviteToken);

  const nova: Identidade = {
    subProvider: claims.sub,
    emailPerfil: claims.email,
    nomeCompleto: claims.nome,
    papelAtor: ehBootstrapAdministrador ? "ADMINISTRADOR" : "INFLUENCIADORA",
    estadoConta: ehBootstrapAdministrador || ehParceiraSeed ? "ACTIVE" : "AGUARDANDO_CADASTRO",
    origemAcesso: convite ? "CONVITE_PREAPROVADO" : "PADRAO",
    parceiraId: ehParceiraSeed ? env.parceiraSeed.id : null,
    dataCriacao: agora,
    ultimoAcesso: agora,
  };

  const salva = await identidadeRepositorio.salvar(nova);
  if (convite) {
    await consumirConvite(convite.token, claims.sub);
  }
  return salva;
}

export interface DadosCadastro {
  chave: string;
  nome: string;
  cnpj: string;
  pix: string;
  cep: string;
  numero: string;
  complemento: string;
}

export type ResultadoCadastro =
  | { ok: true; identidade: Identidade }
  | { ok: false; motivo: "NAO_ENCONTRADA" }
  | { ok: false; motivo: "CADASTRO_JA_ENVIADO" };

/**
 * ADR-011 · Novo fluxo de cadastro: recebida a submissão do formulário, cria a Parceira (nasce
 * `INATIVA`, RN-01 — ativação comercial continua decisão manual do Administrador) e o Perfil
 * (pix/endereço) correspondentes, vincula `parceiraId` à Identidade e decide o próximo estado —
 * `PENDING` (moderação manual) ou `ACTIVE` direto, se a origem foi um convite pré-aprovado.
 *
 * A Condição Comercial (valor/entregáveis contratados) não é preenchida pela própria
 * Influenciadora — nasce zerada e fica para o Administrador ajustar depois, em
 * `AdminParceiras`, no mesmo passo em que decide a Condição Comercial de qualquer Parceira.
 */
export async function submeterCadastro(
  subProvider: string,
  dados: DadosCadastro,
): Promise<ResultadoCadastro> {
  const identidade = await identidadeRepositorio.buscarPorSub(subProvider);
  if (!identidade) {
    return { ok: false, motivo: "NAO_ENCONTRADA" };
  }
  if (identidade.estadoConta !== "AGUARDANDO_CADASTRO") {
    return { ok: false, motivo: "CADASTRO_JA_ENVIADO" };
  }

  const parceira = await cadastrarParceira({
    chave: dados.chave,
    nome: dados.nome,
    email: identidade.emailPerfil,
    cnpj: dados.cnpj,
    pix: dados.pix,
    condicaoComercial: {
      valorMensal: 0,
      entregaveisReel: 0,
      entregaveisCarrossel: 0,
      entregaveisStories: 0,
      prazoUsoImagemDias: 0,
    },
  });

  const dadosResolvidos = await resolvedorDeCep.resolver(dados.cep);
  const endereco = montarEndereco(
    { cep: dados.cep, numero: dados.numero, complemento: dados.complemento },
    dadosResolvidos,
    null,
  );
  await perfilRepositorio.atualizar({
    parceiraId: parceira.id,
    pix: dados.pix,
    email: identidade.emailPerfil,
    endereco,
  });

  const atualizada: Identidade = {
    ...identidade,
    nomeCompleto: dados.nome,
    parceiraId: parceira.id,
    estadoConta: identidade.origemAcesso === "CONVITE_PREAPROVADO" ? "ACTIVE" : "PENDING",
  };

  return { ok: true, identidade: await identidadeRepositorio.salvar(atualizada) };
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
