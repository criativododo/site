import { describe, expect, it } from "vitest";
import type { Entrega } from "./entrega.types.js";
import { projetarPendencias } from "./conteudo.service.js";

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

describe("projetarPendencias (UC-027.01)", () => {
  it("retorna lista vazia quando não há Entregas (CB-02)", () => {
    expect(projetarPendencias([])).toEqual([]);
  });

  it("ordena por data de entrega, em ordem cronológica", () => {
    const itens = projetarPendencias([
      entrega({ id: "e-15", dataEntrega: "2026-07-15" }),
      entrega({ id: "e-05", dataEntrega: "2026-07-05" }),
      entrega({ id: "e-10", dataEntrega: "2026-07-10" }),
    ]);

    expect(itens.map((item) => item.id)).toEqual(["e-05", "e-10", "e-15"]);
  });

  it("projeta apenas os campos de leitura do Portal, sem parceiraId", () => {
    const [item] = projetarPendencias([entrega()]);
    expect(item).toEqual({
      id: "e1",
      mesReferencia: "2026-07",
      formato: "Reel",
      estado: "AGUARDANDO_MATERIAL",
      dataEntrega: "2026-07-10",
    });
  });
});
