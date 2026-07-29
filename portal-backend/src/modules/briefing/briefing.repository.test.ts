import { describe, expect, it } from "vitest";
import { calcularDataAprovacaoInterna } from "./briefing.calculadoraAprovacao.js";
import { BriefingRepositorioEmMemoria } from "./briefing.repository.js";
import type { BlocoBriefing } from "./briefing.types.js";

function bloco(overrides: Partial<BlocoBriefing> = {}): BlocoBriefing {
  const dataPostagem = overrides.dataPostagem ?? "2026-07-20";
  return {
    id: "briefing-1",
    parceiraId: "parceira-1",
    mesReferencia: "2026-07",
    formato: "Reel",
    look: "Look 1",
    dataEntrega: "2026-07-10",
    dataPostagem,
    orientacao: "Orientação de teste.",
    dataAprovacaoInterna: calcularDataAprovacaoInterna(dataPostagem),
    dataCriacao: "2026-07-01T00:00:00.000Z",
    dataAtualizacao: "2026-07-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("BriefingRepositorioEmMemoria", () => {
  it("encontra o bloco pela combinação parceiraId + mesReferencia + formato", async () => {
    const repo = new BriefingRepositorioEmMemoria([bloco()]);
    const encontrado = await repo.buscarBloco("parceira-1", "2026-07", "Reel");
    expect(encontrado?.look).toBe("Look 1");
  });

  it("retorna null quando não há bloco para o formato pedido", async () => {
    const repo = new BriefingRepositorioEmMemoria([bloco({ formato: "Reel" })]);
    const encontrado = await repo.buscarBloco("parceira-1", "2026-07", "Carrossel");
    expect(encontrado).toBeNull();
  });
});

describe("BriefingRepositorioEmMemoria.criar/buscarPorId/listarTodos (Backoffice)", () => {
  it("adiciona o Bloco e o torna visível para as demais consultas", async () => {
    const repo = new BriefingRepositorioEmMemoria([]);
    const novo = bloco({ id: "novo" });

    const criado = await repo.criar(novo);

    expect(criado).toEqual(novo);
    expect(await repo.buscarPorId("novo")).toEqual(novo);
    expect(await repo.listarTodos()).toEqual([novo]);
  });

  it("retorna null para id inexistente", async () => {
    const repo = new BriefingRepositorioEmMemoria([]);
    expect(await repo.buscarPorId("nao-existe")).toBeNull();
  });
});

describe("BriefingRepositorioEmMemoria.atualizar", () => {
  it("carimba dataAtualizacao mesmo quando o chamador não a informa", async () => {
    const original = bloco({ id: "b1", dataAtualizacao: "2026-07-01T00:00:00.000Z" });
    const repo = new BriefingRepositorioEmMemoria([original]);

    const atualizado = await repo.atualizar({ ...original, look: "Look novo" });

    expect(atualizado.look).toBe("Look novo");
    expect(atualizado.dataAtualizacao).not.toBe("2026-07-01T00:00:00.000Z");
  });

  it("lança erro ao tentar atualizar Bloco inexistente", async () => {
    const repo = new BriefingRepositorioEmMemoria([]);
    await expect(repo.atualizar(bloco({ id: "nao-existe" }))).rejects.toThrow();
  });
});

describe("BriefingRepositorioEmMemoria.remover", () => {
  it("remove o Bloco existente", async () => {
    const repo = new BriefingRepositorioEmMemoria([bloco({ id: "b1" })]);
    await repo.remover("b1");
    expect(await repo.buscarPorId("b1")).toBeNull();
  });

  it("lança erro ao tentar remover Bloco inexistente", async () => {
    const repo = new BriefingRepositorioEmMemoria([]);
    await expect(repo.remover("nao-existe")).rejects.toThrow();
  });
});
