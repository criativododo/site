import { describe, expect, it } from "vitest";
import { ehFeriadoNacional, feriadosNacionaisMoveisDoAno } from "./feriadosNacionais.js";

function data(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

describe("feriadosNacionaisMoveisDoAno (2026)", () => {
  it("deriva Carnaval, Sexta-feira Santa e Corpus Christi a partir da Páscoa", () => {
    const moveis = feriadosNacionaisMoveisDoAno(2026).map((d) => d.toISOString().slice(0, 10));
    expect(moveis).toEqual(["2026-02-16", "2026-02-17", "2026-04-03", "2026-06-04"]);
  });
});

describe("ehFeriadoNacional", () => {
  it("reconhece feriados fixos", () => {
    expect(ehFeriadoNacional(data("2026-01-01"))).toBe(true);
    expect(ehFeriadoNacional(data("2026-11-20"))).toBe(true);
    expect(ehFeriadoNacional(data("2026-12-25"))).toBe(true);
  });

  it("reconhece Carnaval e Corpus Christi como feriado, mesmo sendo ponto facultativo (critério operacional, ADR-014)", () => {
    expect(ehFeriadoNacional(data("2026-02-16"))).toBe(true);
    expect(ehFeriadoNacional(data("2026-02-17"))).toBe(true);
    expect(ehFeriadoNacional(data("2026-06-04"))).toBe(true);
  });

  it("reconhece Sexta-feira Santa", () => {
    expect(ehFeriadoNacional(data("2026-04-03"))).toBe(true);
  });

  it("rejeita dia útil comum", () => {
    expect(ehFeriadoNacional(data("2026-07-08"))).toBe(false);
  });
});
