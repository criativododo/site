import type { NextFunction, Request, Response } from "express";
import { logAviso } from "../shared/log.js";

const CHAVES_BLOQUEADAS = ["parceiraId", "parceira_id", "influKey", "INFLU_KEY"];

/**
 * Feature 1.3 (PORTAL_BACKLOG.md): garante mecanicamente que nenhuma rota do Portal aceite
 * o identificador da Parceira vindo do cliente (SPEC-035 §8.3 / ADR-010 ponto 3, menor
 * privilégio). Toda rota de negócio deve obter a Parceira sempre de `req.sessao.parceiraId`
 * (populado por `requireAuth`), nunca de query/params/body — este middleware recusa a
 * requisição inteira se detectar a tentativa, em vez de silenciosamente ignorar o valor.
 */
export function bloquearParceiraIdDeCliente(req: Request, res: Response, next: NextFunction) {
  const fontes = [req.query, req.body, req.params];
  const tentouEnviar = fontes.some(
    (fonte) => fonte && typeof fonte === "object" && CHAVES_BLOQUEADAS.some((chave) => chave in fonte),
  );

  if (tentouEnviar) {
    logAviso("isolamento", {
      motivo: "tentativa de enviar identificador de Parceira pelo cliente",
      rota: req.originalUrl,
      requestId: req.requestId,
    });
    res.status(400).json({ error: "não foi possível concluir a operação." });
    return;
  }

  next();
}

/**
 * Único ponto autorizado a resolver a Parceira corrente. Lança se chamado sem `requireAuth`
 * + `requireContaAtiva` já terem rodado — nunca deve haver acesso a dado de negócio sem os
 * dois passarem antes.
 */
export function parceiraDaSessao(req: Request): string {
  if (!req.sessao || req.sessao.estadoConta !== "ACTIVE" || !req.sessao.parceiraId) {
    throw new Error(
      "parceiraDaSessao chamado sem sessão ativa vinculada a uma Parceira — verifique a ordem dos middlewares.",
    );
  }
  return req.sessao.parceiraId;
}
