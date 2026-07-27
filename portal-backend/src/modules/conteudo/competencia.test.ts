import { describe, expect, it } from "vitest";
import { competenciaAnterior } from "./competencia.js";

describe("competenciaAnterior", () => {
  it("retorna o mês anterior dentro do mesmo ano", () => {
    expect(competenciaAnterior("2026-07")).toBe("2026-06");
  });

  it("vira o ano ao cruzar janeiro", () => {
    expect(competenciaAnterior("2026-01")).toBe("2025-12");
  });
});
