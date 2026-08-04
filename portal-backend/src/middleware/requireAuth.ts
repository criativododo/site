import type { NextFunction, Request, Response } from "express";
import { lerSessao, renovarSessao } from "./session.js";

/**
 * Exige sessão válida (SPEC-025). Em caso de sucesso, aplica a renovação deslizante de
 * RN-18 e disponibiliza `req.sessao` para o restante da cadeia — nenhuma rota downstream
 * deve ler o cookie diretamente.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const sessao = lerSessao(req);
  if (!sessao) {
    res.status(401).json({ error: "sua sessão expirou. faça login novamente." });
    return;
  }

  renovarSessao(res, sessao);
  req.sessao = sessao;
  next();
}

/**
 * Exige, além de sessão válida, `estadoConta = ACTIVE` (SPEC-035 Cap. 7). A regra de
 * reconciliação de SPEC-035 §8.1 ("prevalece a condição mais restritiva" entre estado de
 * conta e `Parceira.status`) só pode ser aplicada por inteiro quando o agregado Parceira
 * existir fisicamente (fora do escopo deste EPIC 1) — por ora só a condição de estado de
 * conta é verificável.
 */
export function requireContaAtiva(req: Request, res: Response, next: NextFunction) {
  if (req.sessao?.estadoConta !== "ACTIVE") {
    res.status(403).json({ error: "esta conta ainda não está ativa." });
    return;
  }
  next();
}

/** RN-04/RN-05 (SPEC-035): moderação é privilégio exclusivo do papel Administrador. */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.sessao?.papelAtor !== "ADMINISTRADOR") {
    res.status(403).json({ error: "área restrita a administradores." });
    return;
  }
  next();
}
