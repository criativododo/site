import { describe, expect, it } from "vitest";
import type { ProvedorDeCalendarioOperacional } from "../../shared/calendarioOperacional/index.js";
import { calcularDataAprovacaoInterna } from "./briefing.calculadoraAprovacao.js";

describe("calcularDataAprovacaoInterna (SPEC-009 RN-01, v1.1 — calendário operacional, ADR-014)", () => {
  it("dia útil comum: aprovação = postagem − 7, sem ajuste", () => {
    expect(calcularDataAprovacaoInterna("2026-07-08")).toBe("2026-07-01");
  });

  it("sexta-feira comum é dia útil sob o critério operacional — não ajusta (diferente da regra legada, que tratava sexta como gatilho de ajuste)", () => {
    expect(calcularDataAprovacaoInterna("2026-07-10")).toBe("2026-07-03");
  });

  it("sábado: aprovação avança para a segunda-feira seguinte", () => {
    expect(calcularDataAprovacaoInterna("2026-07-11")).toBe("2026-07-06");
  });

  it("domingo: aprovação avança para a segunda-feira seguinte", () => {
    expect(calcularDataAprovacaoInterna("2026-07-12")).toBe("2026-07-06");
  });

  it("CB: cálculo cai em feriado nacional fixo isolado (Tiradentes) — avança 1 dia útil", () => {
    expect(calcularDataAprovacaoInterna("2026-04-28")).toBe("2026-04-22");
  });

  it("CB-05: cálculo cai em Carnaval (segunda) — avança até o próximo dia útil real, mesmo emendando dois feriados seguidos (segunda+terça de Carnaval)", () => {
    expect(calcularDataAprovacaoInterna("2026-02-23")).toBe("2026-02-18");
  });

  it("feriado estadual do calendário padrão (São Jorge, RJ — cidade-base Nova Friburgo/RJ, ADR-014) é respeitado", () => {
    expect(calcularDataAprovacaoInterna("2026-04-30")).toBe("2026-04-24");
  });

  it("CB-06: ponto facultativo institucional não adotado pela empresa não altera o cálculo (calendário padrão tem a lista vazia)", () => {
    // 2026-12-24 (véspera de Natal) é quinta-feira comum no calendário padrão — só passaria a
    // ser não útil se cadastrado como ponto facultativo institucional (não está, por padrão).
    expect(calcularDataAprovacaoInterna("2026-12-31")).toBe("2026-12-24");
  });

  it("aceita um ProvedorDeCalendarioOperacional customizado, sem alterar a regra de domínio (injeção de dependência)", () => {
    const calendarioFake: ProvedorDeCalendarioOperacional = {
      ehDiaUtil(data) {
        // Fake que trata toda quarta-feira como não útil, só para provar a injeção.
        return data.getUTCDay() !== 3;
      },
    };

    // 2026-07-08 é quarta-feira — não útil neste calendário fake, avança para quinta.
    expect(calcularDataAprovacaoInterna("2026-07-15", calendarioFake)).toBe("2026-07-09");
  });
});
