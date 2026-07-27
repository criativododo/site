import { describe, expect, it } from "vitest";
import { EntregaRepositorioEmMemoria } from "./entrega.repository.js";
import type { Entrega } from "./entrega.types.js";

function entrega(overrides: Partial<Entrega> = {}): Entrega {
  return {
    id: "e1",
    parceiraId: "parceira-1",
    mesReferencia: "2026-07",
    formato: "Reel",
    estado: "AGUARDANDO_MATERIAL",
    dataEntrega: "2026-07-10",
    materialEnviado: null,
    ...overrides,
  };
}

describe("EntregaRepositorioEmMemoria (RN-01, isolamento)", () => {
  it("só retorna Entregas da Parceira e competência pedidas", async () => {
    const repo = new EntregaRepositorioEmMemoria([
      entrega({ id: "minha", parceiraId: "parceira-1", mesReferencia: "2026-07" }),
      entrega({ id: "outra-parceira", parceiraId: "parceira-2", mesReferencia: "2026-07" }),
      entrega({ id: "outro-mes", parceiraId: "parceira-1", mesReferencia: "2026-06" }),
    ]);

    const resultado = await repo.listarPorParceiraECompetencia("parceira-1", "2026-07");

    expect(resultado.map((item) => item.id)).toEqual(["minha"]);
  });

  it("retorna lista vazia quando a Parceira não tem Entregas na competência (CB-02)", async () => {
    const repo = new EntregaRepositorioEmMemoria([]);
    const resultado = await repo.listarPorParceiraECompetencia("parceira-1", "2026-07");
    expect(resultado).toEqual([]);
  });
});

describe("EntregaRepositorioEmMemoria.buscarPorId (UC-027.02)", () => {
  it("encontra a Entrega pelo id, independente da Parceira", async () => {
    const repo = new EntregaRepositorioEmMemoria([entrega({ id: "e1", parceiraId: "parceira-1" })]);
    const encontrada = await repo.buscarPorId("e1");
    expect(encontrada?.parceiraId).toBe("parceira-1");
  });

  it("retorna null para id inexistente", async () => {
    const repo = new EntregaRepositorioEmMemoria([]);
    expect(await repo.buscarPorId("nao-existe")).toBeNull();
  });
});
