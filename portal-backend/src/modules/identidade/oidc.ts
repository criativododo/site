import * as client from "openid-client";
import { env } from "../../config/env.js";

const GOOGLE_ISSUER = new URL("https://accounts.google.com");

let configuracaoPromise: Promise<client.Configuration> | null = null;

/**
 * Descoberta OIDC do Google (Authorization Code Flow + PKCE, ADR-007). A configuração é
 * memoizada — a descoberta do documento `.well-known/openid-configuration` só precisa
 * acontecer uma vez por processo.
 */
export function obterConfiguracaoGoogle(): Promise<client.Configuration> {
  if (!configuracaoPromise) {
    configuracaoPromise = client.discovery(
      GOOGLE_ISSUER,
      env.google.clientId,
      env.google.clientSecret,
    );
  }
  return configuracaoPromise;
}
