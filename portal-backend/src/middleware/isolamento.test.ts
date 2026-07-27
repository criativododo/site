import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { bloquearParceiraIdDeCliente, parceiraDaSessao } from "./isolamento.js";

function criarReq(overrides: Partial<Request> = {}): Request {
  return { query: {}, body: {}, params: {}, ...overrides } as Request;
}

function criarResMock() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe("bloquearParceiraIdDeCliente (Feature 1.3)", () => {
  it("deixa passar requisição sem parceiraId em query/body/params", () => {
    const next = vi.fn() as NextFunction;
    bloquearParceiraIdDeCliente(criarReq(), criarResMock(), next);
    expect(next).toHaveBeenCalledOnce();
  });

  it("recusa quando parceiraId vem na query string", () => {
    const next = vi.fn() as NextFunction;
    const res = criarResMock();
    bloquearParceiraIdDeCliente(criarReq({ query: { parceiraId: "outra-parceira" } }), res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("recusa quando parceiraId vem no body", () => {
    const next = vi.fn() as NextFunction;
    const res = criarResMock();
    bloquearParceiraIdDeCliente(criarReq({ body: { parceiraId: "outra-parceira" } }), res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("recusa a variante INFLU_KEY (chave legada da planilha)", () => {
    const next = vi.fn() as NextFunction;
    const res = criarResMock();
    bloquearParceiraIdDeCliente(criarReq({ query: { INFLU_KEY: "outra" } }), res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe("parceiraDaSessao", () => {
  it("retorna o parceiraId quando a sessão está ACTIVE e vinculada", () => {
    const req = criarReq({
      sessao: {
        subProvider: "sub-1",
        parceiraId: "parceira-1",
        papelAtor: "INFLUENCIADORA",
        estadoConta: "ACTIVE",
        email: "a@b.com",
        nome: "A",
        exp: Date.now() + 1000,
      },
    });
    expect(parceiraDaSessao(req)).toBe("parceira-1");
  });

  it("lança se chamado sem sessão ativa vinculada", () => {
    expect(() => parceiraDaSessao(criarReq())).toThrow();
  });
});
