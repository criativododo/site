import { describe, expect, it } from "vitest";
import { calcularResumoFinanceiro } from "./financeiro.service.js";
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

describe("calcularResumoFinanceiro (UC-030.01, CB-02)", () => {
  it("EM_ABERTO conta em previsto, não em pago", () => {
    const resultado = calcularResumoFinanceiro([obrigacao({ estado: "EM_ABERTO", valor: 1000 })]);
    expect(resultado).toEqual({ previsto: 1000, pago: 0 });
  });

  it("APROVADO conta em previsto, não em pago", () => {
    const resultado = calcularResumoFinanceiro([obrigacao({ estado: "APROVADO", valor: 1000 })]);
    expect(resultado).toEqual({ previsto: 1000, pago: 0 });
  });

  it("PAGO conta em previsto e em pago", () => {
    const resultado = calcularResumoFinanceiro([obrigacao({ estado: "PAGO", valor: 1000 })]);
    expect(resultado).toEqual({ previsto: 1000, pago: 1000 });
  });

  it("soma múltiplas Obrigações em estados diferentes", () => {
    const resultado = calcularResumoFinanceiro([
      obrigacao({ id: "a", estado: "PAGO", valor: 1000 }),
      obrigacao({ id: "b", estado: "EM_ABERTO", valor: 500 }),
    ]);
    expect(resultado).toEqual({ previsto: 1500, pago: 1000 });
  });

  it("sem Obrigações, tudo é zero", () => {
    expect(calcularResumoFinanceiro([])).toEqual({ previsto: 0, pago: 0 });
  });
});
