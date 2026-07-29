import { calcularDomingoDePascoa } from "./pascoa.js";
import type { FeriadoRecorrente } from "./tipos.js";

const UM_DIA_MS = 24 * 60 * 60 * 1000;

/**
 * Feriados nacionais de data fixa (Lei 6.802/1980 e alterações; Lei 14.759/2023 incluiu
 * Consciência Negra). Calculados localmente — nenhuma fonte externa arbitra esta lista
 * (ADR-014: critério é operacional, não a classificação jurídica de terceiro).
 */
export const FERIADOS_NACIONAIS_FIXOS: FeriadoRecorrente[] = [
  { mes: 1, dia: 1, nome: "Confraternização Universal" },
  { mes: 4, dia: 21, nome: "Tiradentes" },
  { mes: 5, dia: 1, nome: "Dia do Trabalho" },
  { mes: 9, dia: 7, nome: "Independência do Brasil" },
  { mes: 10, dia: 12, nome: "Nossa Senhora Aparecida" },
  { mes: 11, dia: 2, nome: "Finados" },
  { mes: 11, dia: 15, nome: "Proclamação da República" },
  { mes: 11, dia: 20, nome: "Dia Nacional de Zumbi e da Consciência Negra" },
  { mes: 12, dia: 25, nome: "Natal" },
];

/**
 * Feriados nacionais móveis, derivados da Páscoa do ano. Carnaval e Corpus Christi são
 * juridicamente "pontos facultativos" em grande parte do país, não feriados estatutários —
 * mas ADR-014/SPEC-009 RN-01 (v1.1) são explícitos: aqui contam sempre como não úteis,
 * incondicionalmente, por critério operacional.
 */
export function feriadosNacionaisMoveisDoAno(ano: number): Date[] {
  const pascoa = calcularDomingoDePascoa(ano);
  const somarDias = (dias: number) => new Date(pascoa.getTime() + dias * UM_DIA_MS);

  return [
    somarDias(-48), // Carnaval — segunda-feira
    somarDias(-47), // Carnaval — terça-feira
    somarDias(-2), // Sexta-feira Santa
    somarDias(60), // Corpus Christi
  ];
}

function mesmaData(a: Date, mes: number, dia: number): boolean {
  return a.getUTCMonth() + 1 === mes && a.getUTCDate() === dia;
}

export function ehFeriadoNacional(data: Date): boolean {
  const ehFixo = FERIADOS_NACIONAIS_FIXOS.some((feriado) => mesmaData(data, feriado.mes, feriado.dia));
  if (ehFixo) return true;

  const moveis = feriadosNacionaisMoveisDoAno(data.getUTCFullYear());
  return moveis.some(
    (movel) =>
      movel.getUTCFullYear() === data.getUTCFullYear() &&
      movel.getUTCMonth() === data.getUTCMonth() &&
      movel.getUTCDate() === data.getUTCDate(),
  );
}
