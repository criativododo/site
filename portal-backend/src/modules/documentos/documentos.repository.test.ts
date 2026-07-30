import { describe, expect, it } from "vitest";
import { TemplateRepositorioEmMemoria } from "./documentos.repository.js";
import type { Template } from "./documentos.types.js";

function template(overrides: Partial<Template> = {}): Template {
  return {
    id: "template-1",
    nome: "Contrato de Colaboração Mensal",
    descricao: "Template padrão para contrato mensal com Parceira.",
    ativo: true,
    dataCriacao: "2026-07-01T00:00:00.000Z",
    dataAtualizacao: "2026-07-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("TemplateRepositorioEmMemoria.criar/buscarPorId/listarTodos", () => {
  it("adiciona o Template e o torna visível para as demais consultas", async () => {
    const repo = new TemplateRepositorioEmMemoria([]);
    const novo = template({ id: "novo" });

    const criado = await repo.criar(novo);

    expect(criado).toEqual(novo);
    expect(await repo.buscarPorId("novo")).toEqual(novo);
    expect(await repo.listarTodos()).toEqual([novo]);
  });

  it("retorna null para id inexistente", async () => {
    const repo = new TemplateRepositorioEmMemoria([]);
    expect(await repo.buscarPorId("nao-existe")).toBeNull();
  });
});

describe("TemplateRepositorioEmMemoria.atualizar", () => {
  it("carimba dataAtualizacao mesmo quando o chamador não a informa", async () => {
    const original = template({ id: "t1", dataAtualizacao: "2026-07-01T00:00:00.000Z" });
    const repo = new TemplateRepositorioEmMemoria([original]);

    const atualizado = await repo.atualizar({ ...original, nome: "Nome novo" });

    expect(atualizado.nome).toBe("Nome novo");
    expect(atualizado.dataAtualizacao).not.toBe("2026-07-01T00:00:00.000Z");
  });

  it("lança erro ao tentar atualizar Template inexistente", async () => {
    const repo = new TemplateRepositorioEmMemoria([]);
    await expect(repo.atualizar(template({ id: "nao-existe" }))).rejects.toThrow();
  });
});

describe("TemplateRepositorioEmMemoria.remover", () => {
  it("remove o Template existente", async () => {
    const repo = new TemplateRepositorioEmMemoria([template({ id: "t1" })]);
    await repo.remover("t1");
    expect(await repo.buscarPorId("t1")).toBeNull();
  });

  it("lança erro ao tentar remover Template inexistente", async () => {
    const repo = new TemplateRepositorioEmMemoria([]);
    await expect(repo.remover("nao-existe")).rejects.toThrow();
  });
});
