import type { NextFunction, Request, Response } from "express";

export interface RegistroAuditoria {
  usuario: string | null;
  dataHora: string;
  ip: string | undefined;
  operacao: string;
  recurso: string;
}

/**
 * ADR-010 ponto 4 (LGPD): toda operação crítica gera trilha de auditoria (usuário, data,
 * horário, IP, operação, recurso). Este append-only em memória é um placeholder — nenhum
 * armazenamento de auditoria persistente/imutável foi decidido ainda (mesma pendência de
 * infraestrutura do §13 item 7). O ponto estrutural que já vale desde agora: os logs nunca
 * são alterados pela aplicação (só anexados), e nenhuma PII (`PIX`/`CNPJ`/`Endereco`) deve
 * ser incluída no campo `recurso` — só um identificador, nunca o dado em si.
 */
const trilha: RegistroAuditoria[] = [];

export function registrarAuditoria(req: Request, _res: Response, next: NextFunction) {
  trilha.push({
    usuario: req.sessao?.subProvider ?? null,
    dataHora: new Date().toISOString(),
    ip: req.ip,
    operacao: `${req.method} ${req.route?.path ?? req.path}`,
    recurso: req.path,
  });
  next();
}

/** Exposta só para inspeção em teste/debug — nunca para edição. */
export function trilhaAuditoriaSomenteLeitura(): readonly RegistroAuditoria[] {
  return trilha;
}
