import { describe, expect, it } from "vitest";
import { BriefingRepositorioEmMemoria } from "./briefing.repository.js";
import type { BlocoBriefing } from "./briefing.types.js";

function bloco(overrides: Partial<BlocoBriefing> = {}): BlocoBriefing {
  return {
    parceiraId: "parceira-1",
    mesReferencia: "2026-07",
    formato: "Reel",
    look: "Look 1",
    dataEntrega: "2026-07-10",
    dataPostagem: "2026-07-20",
    orientacao: "Orientação de teste.",
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
