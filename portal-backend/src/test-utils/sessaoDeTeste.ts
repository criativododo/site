import type { Response } from "express";
import type { EstadoConta, PapelAtor } from "../modules/identidade/identidade.types.js";
import { iniciarSessao, NOME_COOKIE_SESSAO } from "../middleware/session.js";

/**
 * Helper só de teste: reaproveita `iniciarSessao` (mesma assinatura HMAC de produção, sem
 * duplicar `session.ts`) para produzir o cabeçalho `Cookie` que `supertest` precisa para
 * simular uma sessão autenticada, sem depender do fluxo real de login OIDC (fora do escopo
 * de um teste de contrato HTTP).
 */
export function cookieDeSessao(dados: {
  papelAtor: PapelAtor;
  estadoConta?: EstadoConta;
  parceiraId?: string | null;
  subProvider?: string;
  email?: string;
  nome?: string;
}): string {
  let valorCapturado = "";
  const resFalso = {
    cookie: (_nome: string, valor: string) => {
      valorCapturado = valor;
    },
  } as unknown as Response;

  iniciarSessao(resFalso, {
    subProvider: dados.subProvider ?? "sub-teste",
    parceiraId: dados.parceiraId ?? null,
    papelAtor: dados.papelAtor,
    estadoConta: dados.estadoConta ?? "ACTIVE",
    email: dados.email ?? "teste@dodo.dev",
    nome: dados.nome ?? "Usuária de Teste",
  });

  return `${NOME_COOKIE_SESSAO}=${valorCapturado}`;
}

export function cookieDeAdministrador(): string {
  return cookieDeSessao({ papelAtor: "ADMINISTRADOR" });
}
