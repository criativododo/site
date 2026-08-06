import type { NextFunction, Request, Response } from "express";
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { app } from "../app.js";
import { accessLog } from "./accessLog.js";

function criarReq(overrides: Partial<Request> = {}): Request {
	return {
		method: "GET",
		path: "/health",
		requestId: "req-teste-123",
		...overrides,
	} as unknown as Request;
}

function criarResMock(statusCode = 200) {
	const listeners: Record<string, (() => void)[]> = {};
	return {
		statusCode,
		on: vi.fn((evento: string, cb: () => void) => {
			(listeners[evento] ??= []).push(cb);
		}),
		emitir(evento: string) {
			listeners[evento]?.forEach((cb) => cb());
		},
	} as unknown as Response & { emitir: (evento: string) => void };
}

describe("accessLog", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("chama next() imediatamente, sem esperar a resposta terminar", () => {
		const next = vi.fn() as NextFunction;

		accessLog(criarReq(), criarResMock(), next);

		expect(next).toHaveBeenCalledOnce();
	});

	it("só loga depois que a resposta termina (evento 'finish'), com os 6 campos pedidos", () => {
		const spy = vi.spyOn(console, "info").mockImplementation(() => undefined);
		const req = criarReq({ method: "POST", path: "/auth/cadastro", requestId: "abc-123" });
		const res = criarResMock(201);

		accessLog(req, res, vi.fn() as NextFunction);
		expect(spy).not.toHaveBeenCalled();

		res.emitir("finish");

		expect(spy).toHaveBeenCalledOnce();
		const linha = spy.mock.calls[0]?.[0] as string;
		expect(linha).toMatch(/timestamp=\d{4}-\d{2}-\d{2}T/);
		expect(linha).toContain("method=POST");
		expect(linha).toContain("rota=/auth/cadastro");
		expect(linha).toContain("status=201");
		expect(linha).toContain("requestId=abc-123");
		expect(linha).toMatch(/duracaoMs=\d+/);
	});

	it("usa req.path (sem query string) — nunca vaza code/state do callback OIDC no log", () => {
		const spy = vi.spyOn(console, "info").mockImplementation(() => undefined);
		const req = criarReq({
			method: "GET",
			path: "/auth/google/callback",
			// Express expõe só o path em `req.path`; a query (`code`/`state`) mora em `req.query`,
			// nunca lida por este middleware — este teste documenta essa garantia.
		});
		const res = criarResMock(302);

		accessLog(req, res, vi.fn() as NextFunction);
		res.emitir("finish");

		const linha = spy.mock.calls[0]?.[0] as string;
		expect(linha).toContain("rota=/auth/google/callback");
		expect(linha).not.toContain("code=");
		expect(linha).not.toContain("state=");
	});

	/**
	 * Regressão real encontrada em smoke test manual: `req.path` lido dentro do callback de
	 * `finish` reflete o path já reescrito pelo sub-router (`/me`, relativo a `app.use("/auth",
	 * authRoutes)`), não o path completo (`/auth/me`) — o app real tem sub-routers
	 * (`/auth`, `/api`), o mock plano dos testes acima não reproduz isso. Só um teste de
	 * integração contra o `app` de verdade pega esse tipo de bug.
	 */
	it("[integração] registra o path completo (com prefixo do sub-router), não o relativo", async () => {
		const spy = vi.spyOn(console, "info").mockImplementation(() => undefined);

		await request(app).get("/auth/me");

		const linhaDeAcesso = spy.mock.calls
			.map(([arg]) => arg as string)
			.find((linha) => linha.startsWith("[access]"));
		expect(linhaDeAcesso).toContain("rota=/auth/me");
	});
});
