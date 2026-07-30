import { describe, expect, it } from "vitest";
import { ColaboracaoMensalRepositorioEmMemoria } from "./colaboracaoMensal.repository.js";
import type { ColaboracaoMensal } from "./colaboracaoMensal.types.js";

const condicaoComercial = {
  valorMensal: 2500,
  entregaveisReel: 2,
  entregaveisCarrossel: 1,
  entregaveisStories: 4,
  prazoUsoImagemDias: 90,
};

function colaboracao(overrides: Partial<ColaboracaoMensal> = {}): ColaboracaoMensal {
  return {
    id: "c1",
    parceiraId: "parceira-1",
    mesReferencia: "2026-07",
    condicaoComercial,
    status: "COMPILADA",
    criadoPor: "admin-1",
    criadoEm: "2026-07-29T00:00:00.000Z",
    quantidadeRegistrosGerados: 0,
    ...overrides,
  };
}

describe("ColaboracaoMensalRepositorioEmMemoria (ADR-016)", () => {
  it("buscarPorParceiraECompetencia retorna null quando não existe", async () => {
    const repo = new ColaboracaoMensalRepositorioEmMemoria([]);
    const resultado = await repo.buscarPorParceiraECompetencia("parceira-1", "2026-07");
    expect(resultado).toBeNull();
  });

  it("listarPorParceira só retorna Colaborações Mensais da Parceira pedida", async () => {
    const repo = new ColaboracaoMensalRepositorioEmMemoria([
      colaboracao({ id: "minha", parceiraId: "parceira-1" }),
      colaboracao({ id: "outra", parceiraId: "parceira-2" }),
    ]);
    const resultado = await repo.listarPorParceira("parceira-1");
    expect(resultado.map((c) => c.id)).toEqual(["minha"]);
  });

  it("criar é idempotente: não duplica nem sobrescreve o snapshot já gravado (ADR-016 item 2/4)", async () => {
    const repo = new ColaboracaoMensalRepositorioEmMemoria([]);

    const primeira = await repo.criar(colaboracao({ id: "c1", quantidadeRegistrosGerados: 0 }));
    expect(primeira.id).toBe("c1");

    const condicaoComercialDiferente = { ...condicaoComercial, valorMensal: 9999 };
    const segunda = await repo.criar(
      colaboracao({ id: "c2", condicaoComercial: condicaoComercialDiferente, quantidadeRegistrosGerados: 5 }),
    );

    // Mesma Parceira+competência: retorna a primeira, ignora a candidata (id/snapshot novos).
    expect(segunda).toEqual(primeira);
    expect(segunda.id).toBe("c1");
    expect(segunda.condicaoComercial.valorMensal).toBe(2500);

    const todas = await repo.listarPorParceira("parceira-1");
    expect(todas).toHaveLength(1);
  });

  it("atualizarQuantidadeRegistrosGerados atualiza o total e lança erro para id inexistente", async () => {
    const repo = new ColaboracaoMensalRepositorioEmMemoria([colaboracao({ id: "c1" })]);

    const atualizada = await repo.atualizarQuantidadeRegistrosGerados("c1", 7);
    expect(atualizada.quantidadeRegistrosGerados).toBe(7);

    await expect(repo.atualizarQuantidadeRegistrosGerados("inexistente", 1)).rejects.toThrow(
      "Colaboração Mensal inexistente para atualização: inexistente",
    );
  });
});
