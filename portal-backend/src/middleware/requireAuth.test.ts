import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { requireAdmin } from "./requireAuth.js";

function criarReqComSessao(sessao: Partial<Request["sessao"]>): Request {
  return { sessao } as unknown as Request;
}

function criarResMock() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
}

describe("requireAdmin (RN-04/RN-05)", () => {
  it("deixa passar quando papelAtor é ADMINISTRADOR", () => {
    const next = vi.fn() as NextFunction;
    requireAdmin(criarReqComSessao({ papelAtor: "ADMINISTRADOR" }), criarResMock(), next);
    expect(next).toHaveBeenCalledOnce();
  });

  it("recusa com 403 quando papelAtor é INFLUENCIADORA", () => {
    const next = vi.fn() as NextFunction;
    const res = criarResMock();
    requireAdmin(criarReqComSessao({ papelAtor: "INFLUENCIADORA" }), res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("recusa quando não há sessão", () => {
    const next = vi.fn() as NextFunction;
    const res = criarResMock();
    requireAdmin({} as Request, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
