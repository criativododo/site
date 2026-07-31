import { describe, expect, it, vi } from "vitest";
import type { ContextoRenderizacao } from "./documentos.renderizador.js";
import { PlaceholderNaoResolvidoError, resolverPlaceholders } from "./documentos.renderizador.js";
import { AuditLogPIIEmMemoria } from "./documentos.auditLogPII.js";
import type { PortaAuditLogPII } from "./documentos.auditLogPII.js";
import { resolverPlaceholdersAuditado } from "./documentos.renderizadorAuditado.js";

const contexto: ContextoRenderizacao = {
  parceira: {
    nome: "Ateliê Silva & Cia",
    cnpj: "12.345.678/0001-90",
    pix: "chave-pix-123",
    endereco: { cidade: "Nova Friburgo" },
  },
  colaboracao: { valor: 1500 },
};

const metadados = { templateVersaoId: "tv-1", parceiraId: "parceira-1", ator: "operador-1" };

describe("resolverPlaceholdersAuditado — registro de PII", () => {
  it("registra um evento de auditoria para cada placeholder de PII resolvido", async () => {
    const auditLog = new AuditLogPIIEmMemoria();

    await resolverPlaceholdersAuditado("{{parceira.pix}} / {{parceira.cnpj}}", contexto, auditLog, metadados);

    const eventos = auditLog.eventosRegistrados();
    expect(eventos).toHaveLength(2);
    expect(eventos.map((e) => e.caminho).sort()).toEqual(["parceira.cnpj", "parceira.pix"]);
    expect(eventos[0]).toMatchObject(metadados);
  });

  it("não registra nada quando não há placeholder de PII no template", async () => {
    const auditLog = new AuditLogPIIEmMemoria();

    await resolverPlaceholdersAuditado("{{parceira.nome}} — {{colaboracao.valor}}", contexto, auditLog, metadados);

    expect(auditLog.eventosRegistrados()).toHaveLength(0);
  });

  it("registra uma vez por ocorrência, não uma vez por caminho distinto", async () => {
    const auditLog = new AuditLogPIIEmMemoria();

    await resolverPlaceholdersAuditado("{{parceira.pix}} e de novo {{parceira.pix}}", contexto, auditLog, metadados);

    expect(auditLog.eventosRegistrados()).toHaveLength(2);
  });

  it("nenhum evento registrado carrega o valor resolvido, só o caminho do placeholder", async () => {
    const auditLog = new AuditLogPIIEmMemoria();

    await resolverPlaceholdersAuditado("{{parceira.pix}}", contexto, auditLog, metadados);

    const [evento] = auditLog.eventosRegistrados();
    expect(Object.values(evento)).not.toContain("chave-pix-123");
  });
});

describe("resolverPlaceholdersAuditado — determinismo", () => {
  it("produz exatamente o mesmo texto que resolverPlaceholders sem auditoria", async () => {
    const template = "{{parceira.nome}}: {{parceira.pix}} / {{colaboracao.valor}}";
    const semAuditoria = resolverPlaceholders(template, contexto);
    const comAuditoria = await resolverPlaceholdersAuditado(template, contexto, new AuditLogPIIEmMemoria(), metadados);

    expect(comAuditoria).toBe(semAuditoria);
  });

  it("é determinístico entre chamadas — mesma entrada produz sempre o mesmo texto", async () => {
    const template = "{{parceira.nome}} / {{parceira.pix}}";
    const primeira = await resolverPlaceholdersAuditado(template, contexto, new AuditLogPIIEmMemoria(), metadados);
    const segunda = await resolverPlaceholdersAuditado(template, contexto, new AuditLogPIIEmMemoria(), metadados);

    expect(primeira).toBe(segunda);
  });
});

describe("resolverPlaceholdersAuditado — erros", () => {
  it("propaga o erro do renderizador e nunca chama o AuditLog quando o template não resolve", async () => {
    const registrar = vi.fn();
    const auditLogEspiao: PortaAuditLogPII = { registrar };

    await expect(
      resolverPlaceholdersAuditado("{{parceira.inexistente}}", contexto, auditLogEspiao, metadados),
    ).rejects.toThrow(PlaceholderNaoResolvidoError);

    expect(registrar).not.toHaveBeenCalled();
  });

  it("propaga a falha do AuditLog (fail-closed) e não retorna o texto renderizado", async () => {
    const falhaAuditLog = new Error("indisponível");
    const auditLogFalho: PortaAuditLogPII = { registrar: vi.fn().mockRejectedValue(falhaAuditLog) };

    await expect(
      resolverPlaceholdersAuditado("{{parceira.pix}}", contexto, auditLogFalho, metadados),
    ).rejects.toThrow(falhaAuditLog);
  });

  it("interrompe no primeiro placeholder de PII cujo registro falha — não tenta os seguintes", async () => {
    const registrar = vi.fn().mockRejectedValueOnce(new Error("indisponível"));
    const auditLogFalho: PortaAuditLogPII = { registrar };

    await expect(
      resolverPlaceholdersAuditado("{{parceira.pix}} / {{parceira.cnpj}}", contexto, auditLogFalho, metadados),
    ).rejects.toThrow();

    expect(registrar).toHaveBeenCalledTimes(1);
  });
});
