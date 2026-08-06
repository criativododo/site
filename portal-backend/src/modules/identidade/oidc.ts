import * as client from "openid-client";
import { env } from "../../config/env.js";

const GOOGLE_ISSUER = new URL("https://accounts.google.com");

let configuracaoPromise: Promise<client.Configuration> | null = null;

/**
 * Descoberta OIDC do Google (Authorization Code Flow + PKCE, ADR-007). A configuração é
 * memoizada — a descoberta do documento `.well-known/openid-configuration` só precisa
 * acontecer uma vez por processo. Uma falha (rede, timeout, instabilidade do Google) limpa o
 * cache antes de propagar o erro, para que a próxima chamada tente de novo em vez de reusar a
 * mesma falha para sempre pelo resto da vida do processo (incidente de produção, 2026-08-06:
 * uma falha transitória travou `/auth/google/login` em 500 por 22h até o próximo restart).
 */
export function obterConfiguracaoGoogle(): Promise<client.Configuration> {
  if (!configuracaoPromise) {
    configuracaoPromise = client
      .discovery(GOOGLE_ISSUER, env.google.clientId, env.google.clientSecret)
      .catch((erro) => {
        configuracaoPromise = null;
        throw erro;
      });
  }
  return configuracaoPromise;
}
