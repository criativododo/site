import type { NextFunction, Request, Response } from "express";
import { logEvento } from "../shared/log.js";

/**
 * Access log mínimo (sprint de observabilidade) — hoje não existe nenhum registro de
 * requisição bem-sucedida: `nginx` roda com `access_log off` (`deploy/nginx.conf`) e o
 * backend só loga quando algo falha (`errorHandler.ts`). Sem isso não dá pra reconstituir
 * tráfego/latência/jornada de um usuário a menos que um erro tenha acontecido no meio.
 *
 * Uma linha por requisição, emitida em `res.on("finish")` (depois que a resposta já foi
 * enviada, sem atrasar nada) — nível "info", baixo volume por natureza (não loga corpo/
 * headers/query, só os 6 campos pedidos). `req.path` descarta a query string deliberadamente:
 * o callback OIDC do Google carrega `code`/`state` na query, e nenhuma dessas informações deve
 * ir parar em log.
 *
 * `req.path` é capturado **aqui, antes de `next()`** — não dentro do callback de `finish`. O
 * Express reescreve `req.url`/`req.path` conforme a requisição desce por sub-routers
 * (`app.use("/auth", authRoutes)` etc.), e por `finish` a requisição já percorreu tudo; ler
 * `req.path` só então devolve o caminho relativo ao último sub-router (ex.: `/me` em vez de
 * `/auth/me`), não o caminho completo — perderia justamente o dado que dá sinal ao log.
 */
export function accessLog(req: Request, res: Response, next: NextFunction): void {
  const inicio = process.hrtime.bigint();
  const rota = req.path;

  res.on("finish", () => {
    const duracaoMs = Number(process.hrtime.bigint() - inicio) / 1_000_000;
    logEvento("access", {
      timestamp: new Date().toISOString(),
      method: req.method,
      rota,
      status: res.statusCode,
      duracaoMs: Math.round(duracaoMs),
      requestId: req.requestId,
    });
  });

  next();
}
