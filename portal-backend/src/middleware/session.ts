import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import { env } from "../config/env.js";
import type { EstadoConta, PapelAtor } from "../modules/identidade/identidade.types.js";

export const NOME_COOKIE_SESSAO = "dodo_portal_sessao";

/** RN-18 (SPEC-025): sessão de 6h, renovada a cada interação autenticada. */
const DURACAO_SESSAO_MS = 6 * 60 * 60 * 1000;

export interface SessaoAutenticada {
  subProvider: string;
  parceiraId: string | null;
  papelAtor: PapelAtor;
  estadoConta: EstadoConta;
  email: string;
  nome: string;
  /** Epoch ms de expiração — controla a expiração deslizante independente do `maxAge` do cookie. */
  exp: number;
}

function assinar(conteudo: string): string {
  return createHmac("sha256", env.sessionSecret).update(conteudo).digest("base64url");
}

function codificar(sessao: SessaoAutenticada): string {
  const payload = Buffer.from(JSON.stringify(sessao), "utf8").toString("base64url");
  const assinatura = assinar(payload);
  return `${payload}.${assinatura}`;
}

function decodificar(valorCookie: string): SessaoAutenticada | null {
  const [payload, assinatura] = valorCookie.split(".");
  if (!payload || !assinatura) {
    return null;
  }

  const assinaturaEsperada = assinar(payload);
  const bufferRecebido = Buffer.from(assinatura);
  const bufferEsperado = Buffer.from(assinaturaEsperada);
  if (
    bufferRecebido.length !== bufferEsperado.length ||
    !timingSafeEqual(bufferRecebido, bufferEsperado)
  ) {
    return null;
  }

  try {
    const sessao = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessaoAutenticada;
    if (typeof sessao.exp !== "number" || sessao.exp <= Date.now()) {
      return null;
    }
    return sessao;
  } catch {
    return null;
  }
}

function definirCookie(res: Response, sessao: SessaoAutenticada) {
  res.cookie(NOME_COOKIE_SESSAO, codificar(sessao), {
    httpOnly: true,
    sameSite: "lax",
    secure: env.isProduction,
    path: "/",
    maxAge: DURACAO_SESSAO_MS,
  });
}

/** Cria a sessão inicial após um login OIDC bem-sucedido. */
export function iniciarSessao(res: Response, dados: Omit<SessaoAutenticada, "exp">) {
  definirCookie(res, { ...dados, exp: Date.now() + DURACAO_SESSAO_MS });
}

/** Renovação deslizante (RN-18): reemite o cookie com nova expiração a cada requisição válida. */
export function renovarSessao(res: Response, sessao: SessaoAutenticada) {
  definirCookie(res, { ...sessao, exp: Date.now() + DURACAO_SESSAO_MS });
}

export function lerSessao(req: Request): SessaoAutenticada | null {
  const valorCookie = req.cookies?.[NOME_COOKIE_SESSAO];
  if (!valorCookie || typeof valorCookie !== "string") {
    return null;
  }
  return decodificar(valorCookie);
}

export function encerrarSessao(res: Response) {
  res.clearCookie(NOME_COOKIE_SESSAO, { path: "/" });
}
