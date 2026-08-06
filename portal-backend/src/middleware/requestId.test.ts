import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { requestId } from "./requestId.js";

function criarResMock() {
	return { setHeader: vi.fn() } as unknown as Response;
}

describe("requestId", () => {
	it("atribui um requestId único a req e o expõe no header X-Request-Id", () => {
		const req = {} as Request;
		const res = criarResMock();
		const next = vi.fn() as NextFunction;

		requestId(req, res, next);

		expect(req.requestId).toBeTruthy();
		expect(res.setHeader).toHaveBeenCalledWith("X-Request-Id", req.requestId);
		expect(next).toHaveBeenCalledOnce();
	});

	it("gera valores diferentes a cada requisição", () => {
		const req1 = {} as Request;
		const req2 = {} as Request;

		requestId(req1, criarResMock(), vi.fn() as NextFunction);
		requestId(req2, criarResMock(), vi.fn() as NextFunction);

		expect(req1.requestId).not.toBe(req2.requestId);
	});
});
