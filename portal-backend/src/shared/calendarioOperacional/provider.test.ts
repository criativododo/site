import { describe, expect, it } from "vitest";
import { CalendarioOperacionalProvider } from "./provider.js";
import type { ConfiguracaoCalendarioOperacional } from "./tipos.js";

function data(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

const configuracaoDeTeste: ConfiguracaoCalendarioOperacional = {
  estado: "RJ",
  cidadeBase: "Nova Friburgo",
  feriadosEstaduais: [{ mes: 4, dia: 23, nome: "Dia de São Jorge" }],
  feriadosMunicipais: [{ mes: 6, dia: 15, nome: "Aniversário de teste da cidade" }],
  pontosFacultativosInstitucionais: [{ data: "2026-12-24", nome: "Véspera de Natal (facultativo institucional)" }],
};

describe("CalendarioOperacionalProvider", () => {
  const provider = new CalendarioOperacionalProvider(configuracaoDeTeste);

  it("sábado e domingo nunca são dia útil", () => {
    expect(provider.ehDiaUtil(data("2026-07-11"))).toBe(false); // sábado
    expect(provider.ehDiaUtil(data("2026-07-12"))).toBe(false); // domingo
  });

  it("feriado nacional não é dia útil", () => {
    expect(provider.ehDiaUtil(data("2026-09-07"))).toBe(false);
  });

  it("feriado estadual configurado não é dia útil", () => {
    expect(provider.ehDiaUtil(data("2026-04-23"))).toBe(false);
  });

  it("feriado municipal configurado não é dia útil", () => {
    expect(provider.ehDiaUtil(data("2026-06-15"))).toBe(false);
  });

  it("ponto facultativo institucional configurado não é dia útil", () => {
    expect(provider.ehDiaUtil(data("2026-12-24"))).toBe(false);
  });

  it("ponto facultativo NÃO adotado pela empresa é dia útil (CB-06)", () => {
    // 2026-11-27 é sexta-feira comum, sem nenhuma entrada nas listas configuradas.
    expect(provider.ehDiaUtil(data("2026-11-27"))).toBe(true);
  });

  it("dia útil comum, sem nenhuma camada aplicável", () => {
    expect(provider.ehDiaUtil(data("2026-07-08"))).toBe(true);
  });

  it("com listas vazias (config padrão sem estadual/municipal/institucional), só nacional e fim de semana valem", () => {
    const providerVazio = new CalendarioOperacionalProvider({
      estado: "RJ",
      cidadeBase: "Nova Friburgo",
      feriadosEstaduais: [],
      feriadosMunicipais: [],
      pontosFacultativosInstitucionais: [],
    });
    expect(providerVazio.ehDiaUtil(data("2026-04-23"))).toBe(true); // São Jorge não configurado aqui
    expect(providerVazio.ehDiaUtil(data("2026-09-07"))).toBe(false); // nacional continua valendo
  });
});
