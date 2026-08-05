import { describe, expect, it } from "vitest";
import { MensagemPreparadaRepositorioEmMemoria } from "./comunicacao.repository.js";
import type { MensagemPreparada } from "./comunicacao.types.js";

function mensagemPreparada(overrides: Partial<MensagemPreparada> = {}): MensagemPreparada {
  return {
    id: "m1",
    parceiraId: "parceira-1",
    parceiraNome: "Parceira Um",
    categoria: "LEMBRETE",
    modeloId: "lembrete-prazo",
    corpoFinal: "Oi, Parceira Um! Passando para lembrar...",
    preparadoPor: "admin@dodo.dev",
    preparadoEm: "2026-07-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("MensagemPreparadaRepositorioEmMemoria.criar/listarTodas/listarPorParceira", () => {
  it("adiciona a MensagemPreparada e a torna visível para as demais consultas", async () => {
    const repo = new MensagemPreparadaRepositorioEmMemoria([]);
    const nova = mensagemPreparada({ id: "nova" });

    const criada = await repo.criar(nova);

    expect(criada).toEqual(nova);
    expect(await repo.listarTodas()).toEqual([nova]);
    expect(await repo.listarPorParceira("parceira-1")).toEqual([nova]);
  });

  it("listarTodas ordena da mais recente para a mais antiga", async () => {
    const repo = new MensagemPreparadaRepositorioEmMemoria([
      mensagemPreparada({ id: "antiga", preparadoEm: "2026-06-01T00:00:00.000Z" }),
      mensagemPreparada({ id: "recente", preparadoEm: "2026-07-01T00:00:00.000Z" }),
    ]);

    expect((await repo.listarTodas()).map((m) => m.id)).toEqual(["recente", "antiga"]);
  });

  it("listarTodas respeita o limite pedido", async () => {
    const repo = new MensagemPreparadaRepositorioEmMemoria([
      mensagemPreparada({ id: "a", preparadoEm: "2026-07-03T00:00:00.000Z" }),
      mensagemPreparada({ id: "b", preparadoEm: "2026-07-02T00:00:00.000Z" }),
      mensagemPreparada({ id: "c", preparadoEm: "2026-07-01T00:00:00.000Z" }),
    ]);

    expect((await repo.listarTodas(2)).map((m) => m.id)).toEqual(["a", "b"]);
  });

  it("listarPorParceira filtra por parceiraId e ordena da mais recente para a mais antiga", async () => {
    const repo = new MensagemPreparadaRepositorioEmMemoria([
      mensagemPreparada({ id: "de-outra", parceiraId: "parceira-2", preparadoEm: "2026-07-05T00:00:00.000Z" }),
      mensagemPreparada({ id: "antiga", parceiraId: "parceira-1", preparadoEm: "2026-07-01T00:00:00.000Z" }),
      mensagemPreparada({ id: "recente", parceiraId: "parceira-1", preparadoEm: "2026-07-03T00:00:00.000Z" }),
    ]);

    expect((await repo.listarPorParceira("parceira-1")).map((m) => m.id)).toEqual(["recente", "antiga"]);
  });
});
