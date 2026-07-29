import { Router } from "express";
import * as client from "openid-client";
import { env } from "../../config/env.js";
import { requireAuth } from "../../middleware/requireAuth.js";
import { encerrarSessao, iniciarSessao, renovarSessao } from "../../middleware/session.js";
import type { EstadoConta, PapelAtor } from "./identidade.types.js";
import { identidadeRepositorio } from "./identidade.repository.js";
import { resolverOuCriarIdentidade, submeterCadastro } from "./identidade.service.js";
import { obterConfiguracaoGoogle } from "./oidc.js";

const NOME_COOKIE_OIDC = "dodo_portal_oidc_handshake";
const DURACAO_HANDSHAKE_MS = 5 * 60 * 1000;

interface HandshakeOidc {
  codeVerifier: string;
  state: string;
  /** ADR-011: token do link de convite, se o login começou por `/convite/:token` no frontend. */
  conviteToken: string | null;
}

export const authRoutes = Router();

/**
 * Início do Authorization Code Flow + PKCE (ADR-007). `codeVerifier`/`state` precisam
 * sobreviver ao round-trip até o Google e de volta — guardados num cookie httpOnly de
 * vida curta, nunca em sessão de aplicação (nunca teriam validade fora deste handshake).
 * `?convite=` (ADR-011), se presente, viaja no mesmo cookie pelo mesmo motivo.
 */
authRoutes.get("/google/login", async (req, res) => {
  const config = await obterConfiguracaoGoogle();

  const codeVerifier = client.randomPKCECodeVerifier();
  const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
  const state = client.randomState();

  const handshake: HandshakeOidc = {
    codeVerifier,
    state,
    conviteToken: typeof req.query.convite === "string" ? req.query.convite : null,
  };
  res.cookie(NOME_COOKIE_OIDC, Buffer.from(JSON.stringify(handshake)).toString("base64url"), {
    httpOnly: true,
    sameSite: "lax",
    secure: env.isProduction,
    path: "/auth/google",
    maxAge: DURACAO_HANDSHAKE_MS,
  });

  const redirectTo = client.buildAuthorizationUrl(config, {
    redirect_uri: env.google.redirectUri,
    scope: "openid email profile",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    state,
  });

  res.redirect(redirectTo.href);
});

authRoutes.get("/google/callback", async (req, res) => {
  const cookieBruto = req.cookies?.[NOME_COOKIE_OIDC];
  if (!cookieBruto || typeof cookieBruto !== "string") {
    res.status(400).json({ error: "Handshake OIDC ausente ou expirado — tente entrar novamente." });
    return;
  }

  let handshake: HandshakeOidc;
  try {
    handshake = JSON.parse(Buffer.from(cookieBruto, "base64url").toString("utf8"));
  } catch {
    res.status(400).json({ error: "Handshake OIDC inválido." });
    return;
  }

  res.clearCookie(NOME_COOKIE_OIDC, { path: "/auth/google" });

  try {
    const config = await obterConfiguracaoGoogle();
    const urlAtual = new URL(req.originalUrl, `${req.protocol}://${req.get("host")}`);

    const tokens = await client.authorizationCodeGrant(config, urlAtual, {
      pkceCodeVerifier: handshake.codeVerifier,
      expectedState: handshake.state,
    });

    const claims = tokens.claims();
    if (!claims?.sub || typeof claims.email !== "string") {
      // Falha fail-closed (PORTAL_ARQUITETURA.md §4.3): nunca aceitar identidade parcial.
      res.status(401).json({ error: "Token do Google não trouxe claims obrigatórias." });
      return;
    }

    const identidade = await resolverOuCriarIdentidade(
      {
        sub: claims.sub,
        email: claims.email,
        emailVerificado: claims.email_verified === true,
        nome: typeof claims.name === "string" ? claims.name : claims.email,
      },
      handshake.conviteToken,
    );

    iniciarSessao(res, {
      subProvider: identidade.subProvider,
      parceiraId: identidade.parceiraId,
      papelAtor: identidade.papelAtor,
      estadoConta: identidade.estadoConta,
      email: identidade.emailPerfil,
      nome: identidade.nomeCompleto,
    });

    // ADR-011: cadastro pendente de preenchimento manda para /cadastro antes de qualquer tela do Portal.
    const destino =
      identidade.papelAtor === "ADMINISTRADOR"
        ? "/admin/dashboard"
        : identidade.estadoConta === "AGUARDANDO_CADASTRO"
          ? "/cadastro"
          : "/pendencias";
    res.redirect(`${env.frontendUrl}${destino}`);
  } catch {
    // Nunca vazar detalhe interno do erro OIDC para o cliente (aud/iss/exp inválidos, etc.).
    res.status(401).json({ error: "Não foi possível concluir o login com o Google." });
  }
});

/**
 * Atalho de QA local — nunca ativo em produção (dupla trava: convém não montar isto num
 * ambiente de produção real, e o handler recusa mesmo assim caso a variável de ambiente seja
 * lida incorretamente, mesmo padrão de env.parceiraSeed em config/env.ts). Popula a sessão
 * diretamente, sem round-trip ao Google, só para exercitar o Portal com dados de teste.
 */
authRoutes.get("/dev-login", async (req, res) => {
  if (env.isProduction) {
    res.status(404).end();
    return;
  }

  const { email, nome, papelAtor, estadoConta, parceiraId } = req.query;
  if (
    typeof email !== "string" ||
    typeof nome !== "string" ||
    typeof papelAtor !== "string" ||
    typeof estadoConta !== "string"
  ) {
    res.status(400).json({ error: "Parâmetros obrigatórios: email, nome, papelAtor, estadoConta." });
    return;
  }

  const subProvider = `dev-qa:${email}`;
  const parceiraIdResolvido = typeof parceiraId === "string" ? parceiraId : null;

  iniciarSessao(res, {
    subProvider,
    parceiraId: parceiraIdResolvido,
    papelAtor: papelAtor as PapelAtor,
    estadoConta: estadoConta as EstadoConta,
    email,
    nome,
  });

  // Espelha o mesmo registro de Identidade que o round-trip real do Google cria (ADR-011):
  // sem isso, fluxos que leem por `subProvider` (ex.: /auth/cadastro) não encontram a conta
  // ao testar manualmente por este atalho.
  await identidadeRepositorio.salvar({
    subProvider,
    emailPerfil: email,
    nomeCompleto: nome,
    papelAtor: papelAtor as PapelAtor,
    estadoConta: estadoConta as EstadoConta,
    origemAcesso: "PADRAO",
    parceiraId: parceiraIdResolvido,
    dataCriacao: new Date().toISOString(),
    ultimoAcesso: new Date().toISOString(),
  });

  const destino =
    papelAtor === "ADMINISTRADOR"
      ? "/admin/dashboard"
      : estadoConta === "AGUARDANDO_CADASTRO"
        ? "/cadastro"
        : "/pendencias";
  res.redirect(`${env.frontendUrl}${destino}`);
});

authRoutes.get("/me", requireAuth, (req, res) => {
  const sessao = req.sessao!;
  res.json({
    parceiraId: sessao.parceiraId,
    nome: sessao.nome,
    email: sessao.email,
    estadoConta: sessao.estadoConta,
    papelAtor: sessao.papelAtor,
  });
});

/**
 * ADR-011 · Envio do formulário de cadastro. Só `requireAuth` (não `requireContaAtiva`,
 * ausente aqui de propósito): quem chama esta rota está, por definição, em
 * `AGUARDANDO_CADASTRO` — exigir conta ativa a tornaria inacessível ao seu único público.
 */
authRoutes.post("/cadastro", requireAuth, async (req, res) => {
  const sessao = req.sessao!;
  const { chave, nome, cnpj, pix, cep, numero, complemento } = req.body ?? {};

  if (
    typeof chave !== "string" || !chave.trim() ||
    typeof nome !== "string" || !nome.trim() ||
    typeof cnpj !== "string" || !cnpj.trim() ||
    typeof pix !== "string" || !pix.trim() ||
    typeof cep !== "string" || !cep.trim()
  ) {
    res.status(400).json({ error: "Preencha nome, chave, cnpj, pix e cep para enviar o cadastro." });
    return;
  }

  const resultado = await submeterCadastro(sessao.subProvider, {
    chave: chave.trim(),
    nome: nome.trim(),
    cnpj: cnpj.trim(),
    pix: pix.trim(),
    cep: cep.trim(),
    numero: typeof numero === "string" ? numero.trim() : "",
    complemento: typeof complemento === "string" ? complemento.trim() : "",
  });

  if (!resultado.ok) {
    if (resultado.motivo === "NAO_ENCONTRADA") {
      res.status(404).json({ error: "Conta não encontrada." });
      return;
    }
    res.status(409).json({ error: "Cadastro já foi enviado para esta conta." });
    return;
  }

  // Reemite o cookie de sessão já com o novo estadoConta/parceiraId — sem isso a próxima
  // requisição ainda leria a sessão antiga (AGUARDANDO_CADASTRO, sem parceiraId) do cookie.
  renovarSessao(res, {
    ...sessao,
    parceiraId: resultado.identidade.parceiraId,
    estadoConta: resultado.identidade.estadoConta,
    nome: resultado.identidade.nomeCompleto,
  });

  res.json({
    parceiraId: resultado.identidade.parceiraId,
    nome: resultado.identidade.nomeCompleto,
    email: resultado.identidade.emailPerfil,
    estadoConta: resultado.identidade.estadoConta,
    papelAtor: resultado.identidade.papelAtor,
  });
});

authRoutes.post("/logout", (_req, res) => {
  encerrarSessao(res);
  res.status(204).end();
});
