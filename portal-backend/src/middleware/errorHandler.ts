import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";

/**
 * Handler global de erros (último `app.use`, identificado pelo Express via aridade 4). Loga
 * sempre — inclusive em produção. Antes desta correção, o log só rodava fora de produção
 * (`if (!env.isProduction) console.error(err)`), o que deixou uma exceção real em produção
 * (discovery OIDC do Google travado, 2026-08-06) 22h sem nenhum rastro. A resposta HTTP ao
 * cliente não muda: nunca vaza stack/mensagem interna, só o texto genérico de sempre.
 */
export function tratarErroGlobal(
	err: unknown,
	req: Request,
	res: Response,
	_next: NextFunction,
): void {
	const erro = err instanceof Error ? err : new Error(String(err));

	console.error(
		`[erro-nao-tratado] timestamp=${new Date().toISOString()} requestId=${req.requestId ?? "-"} ` +
			`method=${req.method} rota=${req.originalUrl} status=500 versao=${env.versao} ` +
			`mensagem=${JSON.stringify(erro.message)}`,
	);
	if (erro.stack) {
		console.error(erro.stack);
	}

	res.status(500).json({ error: "Erro interno do servidor." });
}
