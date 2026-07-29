import { ehFeriadoNacional } from "./feriadosNacionais.js";
import type { ConfiguracaoCalendarioOperacional, ProvedorDeCalendarioOperacional } from "./tipos.js";

function mesmoDiaRecorrente(data: Date, mes: number, dia: number): boolean {
  return data.getUTCMonth() + 1 === mes && data.getUTCDate() === dia;
}

function mesmaDataISO(data: Date, iso: string): boolean {
  return data.toISOString().slice(0, 10) === iso;
}

/**
 * Composição das quatro camadas do calendário operacional (ADR-014). Todas as camadas são
 * consultadas e unidas (nenhuma tem prioridade sobre outra — é OU lógico, não cadeia com
 * parada no primeiro sucesso, ao contrário de `CepResolver`).
 */
export class CalendarioOperacionalProvider implements ProvedorDeCalendarioOperacional {
  constructor(private readonly configuracao: ConfiguracaoCalendarioOperacional) {}

  ehDiaUtil(data: Date): boolean {
    const diaDaSemana = data.getUTCDay(); // 0 = domingo, 6 = sábado
    if (diaDaSemana === 0 || diaDaSemana === 6) return false;
    if (ehFeriadoNacional(data)) return false;
    if (this.configuracao.feriadosEstaduais.some((f) => mesmoDiaRecorrente(data, f.mes, f.dia))) return false;
    if (this.configuracao.feriadosMunicipais.some((f) => mesmoDiaRecorrente(data, f.mes, f.dia))) return false;
    if (this.configuracao.pontosFacultativosInstitucionais.some((f) => mesmaDataISO(data, f.data))) return false;

    return true;
  }
}
