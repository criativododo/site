import type { NextFunction, Request, Response } from "express";
import { afterEach, describe, expect, it, vi } from "vitest";
import { tratarErroGlobal } from "./errorHandler.js";

function criarReq(overrides: Partial<Request> = {}): Request {
	return {
		method: "GET",
		originalUrl: "/auth/google/login",
		requestId: "req-teste-123",
		...overrides,
	} as unknown as Request;
}

function criarResMock() {
	return {
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis(),
	} as unknown as Response;
}

describe("tratarErroGlobal (observabilidade de erros não tratados)", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("loga em produção — antes desta correção, nada era logado fora de ambiente não-produção", () => {
		const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
		const req = criarReq();
		const res = criarResMock();

		tratarErroGlobal(
			new Error("discovery falhou"),
			req,
			res,
			vi.fn() as NextFunction,
		);

		expect(spy).toHaveBeenCalled();
	});

	it("a linha de log inclui timestamp, requestId, method, rota, status e mensagem", () => {
		const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
		const req = criarReq({
			method: "POST",
			originalUrl: "/auth/cadastro",
			requestId: "abc-123",
		});
		const res = criarResMock();

		tratarErroGlobal(
			new Error("mensagem original do erro"),
			req,
			res,
			vi.fn() as NextFunction,
		);

		const primeiraLinha = spy.mock.calls[0]?.[0] as string;
		expect(primeiraLinha).toMatch(/timestamp=\d{4}-\d{2}-\d{2}T/);
		expect(primeiraLinha).toContain("requestId=abc-123");
		expect(primeiraLinha).toContain("method=POST");
		expect(primeiraLinha).toContain("rota=/auth/cadastro");
		expect(primeiraLinha).toMatch(/versao=\S+/);
		expect(primeiraLinha).toContain("status=500");
		expect(primeiraLinha).toContain("mensagem original do erro");
	});

	it("loga o stack trace separadamente quando o erro é uma instância de Error", () => {
		const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
		const erro = new Error("com stack");

		tratarErroGlobal(erro, criarReq(), criarResMock(), vi.fn() as NextFunction);

		const chamadaComStack = spy.mock.calls.find(([arg]) => arg === erro.stack);
		expect(chamadaComStack).toBeDefined();
	});

	it("registra requestId='-' quando a requisição não tem um (defensivo, não deve travar o log)", () => {
		const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
		const req = criarReq({ requestId: undefined });

		tratarErroGlobal(
			new Error("sem request id"),
			req,
			criarResMock(),
			vi.fn() as NextFunction,
		);

		expect(spy.mock.calls[0]?.[0]).toContain("requestId=-");
	});

	it("lida com valores não-Error lançados sem quebrar o log", () => {
		const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);

		expect(() =>
			tratarErroGlobal(
				"string lançada diretamente",
				criarReq(),
				criarResMock(),
				vi.fn() as NextFunction,
			),
		).not.toThrow();
		expect(spy.mock.calls[0]?.[0]).toContain("string lançada diretamente");
	});

	it("preserva o contrato de resposta HTTP existente: 500 + JSON genérico, sem vazar detalhe interno", () => {
		vi.spyOn(console, "error").mockImplementation(() => undefined);
		const res = criarResMock();

		tratarErroGlobal(
			new Error("detalhe interno sensível"),
			criarReq(),
			res,
			vi.fn() as NextFunction,
		);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({
			error: "Erro interno do servidor.",
		});
		expect(res.json).not.toHaveBeenCalledWith(
			expect.objectContaining({
				error: expect.stringContaining("detalhe interno sensível"),
			}),
		);
	});
});
