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
