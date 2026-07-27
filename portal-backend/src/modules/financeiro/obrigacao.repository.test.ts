import { describe, expect, it } from "vitest";
import { ObrigacaoRepositorioEmMemoria } from "./obrigacao.repository.js";
import type { ObrigacaoFinanceira } from "./obrigacao.types.js";

function obrigacao(overrides: Partial<ObrigacaoFinanceira> = {}): ObrigacaoFinanceira {
  return {
    id: "o1",
    parceiraId: "parceira-1",
    mesReferencia: "2026-07",
    valor: 1000,
    estado: "EM_ABERTO",
    tipo: "MENSAL",
    dataCriacao: "2026-07-01T00:00:00.000Z",
    dataAtualizacao: "2026-07-01T00:00:00.000Z",
    dataArquivamento: null,
    ...overrides,
  };
}

describe("ObrigacaoRepositorioEmMemoria (RN-05, isolamento)", () => {
  it("listarPorParceira só retorna Obrigações da Parceira pedida", async () => {
    const repo = new ObrigacaoRepositorioEmMemoria([
      obrigacao({ id: "minha", parceiraId: "parceira-1" }),
      obrigacao({ id: "de-outra", parceiraId: "parceira-2" }),
    ]);

    const resultado = await repo.listarPorParceira("parceira-1");
    expect(resultado.map((item) => item.id)).toEqual(["minha"]);
  });

  it("listarPorParceiraECompetencia filtra também por mesReferencia", async () => {
    const repo = new ObrigacaoRepositorioEmMemoria([
      obrigacao({ id: "julho", mesReferencia: "2026-07" }),
      obrigacao({ id: "junho", mesReferencia: "2026-06" }),
    ]);

    const resultado = await repo.listarPorParceiraECompetencia("parceira-1", "2026-07");
    expect(resultado.map((item) => item.id)).toEqual(["julho"]);
  });
});

describe("ObrigacaoRepositorioEmMemoria.criar/buscarPorId (Backoffice)", () => {
  it("adiciona a Obrigação e a torna visível para as demais consultas", async () => {
    const repo = new ObrigacaoRepositorioEmMemoria([]);
    const nova = obrigacao({ id: "nova" });

    const criada = await repo.criar(nova);

    expect(criada).toEqual(nova);
    expect(await repo.buscarPorId("nova")).toEqual(nova);
    expect(await repo.listarTodas()).toEqual([nova]);
  });

  it("retorna null para id inexistente", async () => {
    const repo = new ObrigacaoRepositorioEmMemoria([]);
    expect(await repo.buscarPorId("nao-existe")).toBeNull();
  });
});

describe("ObrigacaoRepositorioEmMemoria.atualizar", () => {
  it("carimba dataAtualizacao mesmo quando o chamador não a informa", async () => {
    const original = obrigacao({ id: "o1", dataAtualizacao: "2026-07-01T00:00:00.000Z" });
    const repo = new ObrigacaoRepositorioEmMemoria([original]);

    const atualizada = await repo.atualizar({ ...original, estado: "APROVADO" });

    expect(atualizada.estado).toBe("APROVADO");
    expect(atualizada.dataAtualizacao).not.toBe("2026-07-01T00:00:00.000Z");
  });

  it("lança erro ao tentar atualizar Obrigação inexistente", async () => {
    const repo = new ObrigacaoRepositorioEmMemoria([]);
    await expect(repo.atualizar(obrigacao({ id: "nao-existe" }))).rejects.toThrow();
  });
});

describe("ObrigacaoRepositorioEmMemoria.remover", () => {
  it("remove a Obrigação existente", async () => {
    const repo = new ObrigacaoRepositorioEmMemoria([obrigacao({ id: "o1" })]);
    await repo.remover("o1");
    expect(await repo.buscarPorId("o1")).toBeNull();
  });

  it("lança erro ao tentar remover Obrigação inexistente", async () => {
    const repo = new ObrigacaoRepositorioEmMemoria([]);
    await expect(repo.remover("nao-existe")).rejects.toThrow();
  });
});
