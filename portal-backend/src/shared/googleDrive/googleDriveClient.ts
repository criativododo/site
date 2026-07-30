import { env } from "../../config/env.js";

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

/** Margem de segurança antes de considerar o access token vencido (ADR-017). */
const MARGEM_EXPIRACAO_MS = 60_000;

interface RespostaTokenGoogle {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

interface RespostaErroGoogle {
  error: string;
  error_description?: string;
}

export class ErroOAuthGoogleDrive extends Error {
  constructor(
    public readonly statusHttp: number,
    public readonly codigoGoogle: string,
    descricao: string | undefined,
  ) {
    super(`OAuth Google Drive falhou (HTTP ${statusHttp}, ${codigoGoogle}): ${descricao ?? "sem descrição"}`);
    this.name = "ErroOAuthGoogleDrive";
  }
}

let cache: { accessToken: string; expiraEm: number } | null = null;

/**
 * Força a próxima chamada a `obterAccessTokenDrive()` a trocar um access token novo, mesmo
 * que o cache ainda não tenha expirado por tempo — usado por `comRetentativa()`
 * (`shared/storage/googleDrive/`) quando o Drive responde 401 a um token que o cache local
 * ainda considerava válido (ex.: revogação manual). Acréscimo mínimo à Fase 4 (Storage,
 * `docs/TDD_STORAGE_GOOGLE_DRIVE.md` §2.8/§4.5); não altera nenhum comportamento existente.
 */
export function invalidarCacheAccessTokenDrive(): void {
  cache = null;
}

/**
 * Troca o refresh token administrado (ADR-017) por um access token válido, memoizando até
 * perto da expiração real informada pelo Google — evita uma chamada de rede por uso.
 */
export async function obterAccessTokenDrive(): Promise<string> {
  if (cache && cache.expiraEm - MARGEM_EXPIRACAO_MS > Date.now()) {
    return cache.accessToken;
  }

  if (!env.googleDrive.clientId || !env.googleDrive.clientSecret || !env.googleDrive.refreshToken) {
    throw new Error(
      "Credenciais do OAuth Drive ausentes (GOOGLE_DRIVE_CLIENT_ID/CLIENT_SECRET/REFRESH_TOKEN) — ver ADR-017.",
    );
  }

  const resposta = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.googleDrive.clientId,
      client_secret: env.googleDrive.clientSecret,
      refresh_token: env.googleDrive.refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const corpo = (await resposta.json()) as RespostaTokenGoogle | RespostaErroGoogle;

  if (!resposta.ok || !("access_token" in corpo)) {
    const erro = corpo as RespostaErroGoogle;
    throw new ErroOAuthGoogleDrive(resposta.status, erro.error ?? "desconhecido", erro.error_description);
  }

  cache = {
    accessToken: corpo.access_token,
    expiraEm: Date.now() + corpo.expires_in * 1000,
  };
  return cache.accessToken;
}
