import { calendarioOperacionalPadrao } from "../../shared/calendarioOperacional/index.js";
import type { ProvedorDeCalendarioOperacional } from "../../shared/calendarioOperacional/index.js";

/**
 * Calculadora de Aprovação (SPEC-009 §6.3/RN-01, v1.1): `dataAprovacaoInterna` é sempre
 * derivada de `dataPostagem`, nunca informada manualmente (INV-03). RN-01: 7 dias antes da
 * postagem; se a data resultante cair em dia não útil do **calendário operacional**
 * (ADR-014 — fim de semana, feriado nacional/estadual/municipal aplicável, ou ponto
 * facultativo institucional adotado pela empresa), avança dia a dia até o primeiro dia útil
 * seguinte. Esta função não conhece nenhuma dessas fontes — só consulta
 * `ProvedorDeCalendarioOperacional.ehDiaUtil`, permitindo configuração futura sem alterar
 * esta regra de domínio.
 */

const UM_DIA_MS = 24 * 60 * 60 * 1000;

function paraDataUTC(dataISO: string): Date {
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  return new Date(Date.UTC(ano, mes - 1, dia));
}

function paraISO(data: Date): string {
  return data.toISOString().slice(0, 10);
}

export function calcularDataAprovacaoInterna(
  dataPostagem: string,
  calendario: ProvedorDeCalendarioOperacional = calendarioOperacionalPadrao,
): string {
  let candidata = new Date(paraDataUTC(dataPostagem).getTime() - 7 * UM_DIA_MS);

  while (!calendario.ehDiaUtil(candidata)) {
    candidata = new Date(candidata.getTime() + UM_DIA_MS);
  }

  return paraISO(candidata);
}
