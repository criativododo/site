import { describe, expect, it } from "vitest";
import { AuditLogPIIEmMemoria, ehPlaceholderPII } from "./documentos.auditLogPII.js";
import type { EventoAuditoriaPlaceholderPII } from "./documentos.auditLogPII.js";

describe("ehPlaceholderPII — whitelist oficial do domínio (Contrato Soberano §5: PIX, CNPJ, Endereco)", () => {
  it("reconhece parceira.cnpj como PII", () => {
    expect(ehPlaceholderPII("parceira.cnpj")).toBe(true);
  });

  it("reconhece parceira.pix como PII", () => {
    expect(ehPlaceholderPII("parceira.pix")).toBe(true);
  });

  it("reconhece qualquer caminho aninhado sob parceira.endereco como PII", () => {
    expect(ehPlaceholderPII("parceira.endereco.cidade")).toBe(true);
  });

  it("não reconhece parceira.nome como PII", () => {
    expect(ehPlaceholderPII("parceira.nome")).toBe(false);
  });

  it("não reconhece colaboracao.valor como PII", () => {
    expect(ehPlaceholderPII("colaboracao.valor")).toBe(false);
  });

  it("não confunde prefixo por substring — parceira.pixels não é parceira.pix", () => {
    expect(ehPlaceholderPII("parceira.pixels")).toBe(false);
  });
});

describe("AuditLogPIIEmMemoria", () => {
  it("registra um evento e o expõe para leitura", async () => {
    const auditLog = new AuditLogPIIEmMemoria();
    const evento: EventoAuditoriaPlaceholderPII = {
      caminho: "parceira.pix",
      templateVersaoId: "tv-1",
      parceiraId: "parceira-1",
      ator: "operador-1",
      ocorridoEm: new Date().toISOString(),
    };

    await auditLog.registrar(evento);

    expect(auditLog.eventosRegistrados()).toEqual([evento]);
  });

  it("é append-only — cada registro se acumula, nenhum é sobrescrito", async () => {
    const auditLog = new AuditLogPIIEmMemoria();
    await auditLog.registrar({
      caminho: "parceira.pix",
      templateVersaoId: "tv-1",
      parceiraId: "parceira-1",
      ator: "operador-1",
      ocorridoEm: new Date().toISOString(),
    });
    await auditLog.registrar({
      caminho: "parceira.cnpj",
      templateVersaoId: "tv-1",
      parceiraId: "parceira-1",
      ator: "operador-1",
      ocorridoEm: new Date().toISOString(),
    });

    expect(auditLog.eventosRegistrados()).toHaveLength(2);
  });
});
