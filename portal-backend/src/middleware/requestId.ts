import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

/**
 * Correlaciona uma requisição com sua linha de log de erro (ver `errorHandler.ts`). Precisa
 * estar antes de qualquer rota/middleware que possa lançar, para que `req.requestId` sempre
 * exista quando o handler global de erros rodar.
 */
export function requestId(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	req.requestId = randomUUID();
	res.setHeader("X-Request-Id", req.requestId);
	next();
}
