import { Router } from "express";
import * as client from "openid-client";
import { env } from "../../config/env.js";
import { requireAuth } from "../../middleware/requireAuth.js";
import { encerrarSessao, iniciarSessao } from "../../middleware/session.js";
import { resolverOuCriarIdentidade } from "./identidade.service.js";
import { obterConfiguracaoGoogle } from "./oidc.js";

const NOME_COOKIE_OIDC = "dodo_portal_oidc_handshake";
const DURACAO_HANDSHAKE_MS = 5 * 60 * 1000;

interface HandshakeOidc {
  codeVerifier: string;
  state: string;
}

export const authRoutes = Router();

/**
 * Início do Authorization Code Flow + PKCE (ADR-007). `codeVerifier`/`state` precisam
 * sobreviver ao round-trip até o Google e de volta — guardados num cookie httpOnly de
 * vida curta, nunca em sessão de aplicação (nunca teriam validade fora deste handshake).
 */
authRoutes.get("/google/login", async (_req, res) => {
  const config = await obterConfiguracaoGoogle();

  const codeVerifier = client.randomPKCECodeVerifier();
  const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
  const state = client.randomState();

  const handshake: HandshakeOidc = { codeVerifier, state };
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

    const identidade = await resolverOuCriarIdentidade({
      sub: claims.sub,
      email: claims.email,
      emailVerificado: claims.email_verified === true,
      nome: typeof claims.name === "string" ? claims.name : claims.email,
    });

    iniciarSessao(res, {
      subProvider: identidade.subProvider,
      parceiraId: identidade.parceiraId,
      papelAtor: identidade.papelAtor,
      estadoConta: identidade.estadoConta,
      email: identidade.emailPerfil,
      nome: identidade.nomeCompleto,
    });

    const destino = identidade.papelAtor === "ADMINISTRADOR" ? "/admin/dashboard" : "/pendencias";
    res.redirect(`${env.frontendUrl}${destino}`);
  } catch {
    // Nunca vazar detalhe interno do erro OIDC para o cliente (aud/iss/exp inválidos, etc.).
    res.status(401).json({ error: "Não foi possível concluir o login com o Google." });
  }
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

authRoutes.post("/logout", (_req, res) => {
  encerrarSessao(res);
  res.status(204).end();
});
