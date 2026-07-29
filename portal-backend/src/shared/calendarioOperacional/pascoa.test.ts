import { describe, expect, it } from "vitest";
import { calcularDomingoDePascoa } from "./pascoa.js";

function iso(data: Date): string {
  return data.toISOString().slice(0, 10);
}

describe("calcularDomingoDePascoa", () => {
  it.each([
    [2020, "2020-04-12"],
    [2023, "2023-04-09"],
    [2024, "2024-03-31"],
    [2025, "2025-04-20"],
    [2026, "2026-04-05"],
    [2027, "2027-03-28"],
  ])("Páscoa de %i cai em %s", (ano, esperado) => {
    expect(iso(calcularDomingoDePascoa(ano))).toBe(esperado);
  });
});
