import type { Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { encerrarSessao, iniciarSessao, lerSessao, renovarSessao } from "./session.js";

function criarResMock() {
  const cookies: Record<string, unknown> = {};
  const res = {
    cookie: vi.fn((nome: string, valor: string) => {
      cookies[nome] = valor;
    }),
    clearCookie: vi.fn((nome: string) => {
      delete cookies[nome];
    }),
  } as unknown as Response;
  return { res, cookies };
}

function criarReqComCookie(valorCookie: string | undefined) {
  return { cookies: valorCookie ? { dodo_portal_sessao: valorCookie } : {} } as any;
}

const dadosBase = {
  subProvider: "sub-1",
  parceiraId: "parceira-1",
  papelAtor: "INFLUENCIADORA" as const,
  estadoConta: "ACTIVE" as const,
  email: "parceira@exemplo.com",
  nome: "Parceira Teste",
};

describe("sessão deslizante (RN-18)", () => {
  it("permite ler de volta uma sessão recém-iniciada", () => {
    const { res, cookies } = criarResMock();
    iniciarSessao(res, dadosBase);

    const sessao = lerSessao(criarReqComCookie(cookies.dodo_portal_sessao as string));
    expect(sessao?.parceiraId).toBe("parceira-1");
    expect(sessao?.estadoConta).toBe("ACTIVE");
  });

  it("rejeita cookie com assinatura adulterada", () => {
    const { res, cookies } = criarResMock();
    iniciarSessao(res, dadosBase);

    const [payload] = (cookies.dodo_portal_sessao as string).split(".");
    const adulterado = `${payload}.assinatura-forjada`;

    expect(lerSessao(criarReqComCookie(adulterado))).toBeNull();
  });

  it("rejeita cookie cujo payload foi trocado por outro payload válido mas assinatura antiga", () => {
    const { res, cookies } = criarResMock();
    iniciarSessao(res, dadosBase);
    const [, assinaturaOriginal] = (cookies.dodo_portal_sessao as string).split(".");

    const payloadForjado = Buffer.from(
      JSON.stringify({ ...dadosBase, parceiraId: "outra-parceira", exp: Date.now() + 1000 }),
      "utf8",
    ).toString("base64url");

    expect(lerSessao(criarReqComCookie(`${payloadForjado}.${assinaturaOriginal}`))).toBeNull();
  });

  it("rejeita sessão expirada", () => {
    const { res, cookies } = criarResMock();
    iniciarSessao(res, dadosBase);

    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 7 * 60 * 60 * 1000); // +7h, além das 6h de RN-18
    expect(lerSessao(criarReqComCookie(cookies.dodo_portal_sessao as string))).toBeNull();
    vi.useRealTimers();
  });

  it("renovarSessao emite um cookie com expiração futura renovada", () => {
    const { res, cookies } = criarResMock();
    iniciarSessao(res, dadosBase);
    const sessaoInicial = lerSessao(criarReqComCookie(cookies.dodo_portal_sessao as string))!;

    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 60 * 1000);
    renovarSessao(res, sessaoInicial);
    const sessaoRenovada = lerSessao(criarReqComCookie(cookies.dodo_portal_sessao as string))!;
    vi.useRealTimers();

    expect(sessaoRenovada.exp).toBeGreaterThan(sessaoInicial.exp);
  });

  it("encerrarSessao limpa o cookie", () => {
    const { res, cookies } = criarResMock();
    iniciarSessao(res, dadosBase);
    encerrarSessao(res);
    expect(cookies.dodo_portal_sessao).toBeUndefined();
  });
});
