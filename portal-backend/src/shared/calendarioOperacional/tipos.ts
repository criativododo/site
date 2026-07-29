/**
 * ADR-014 (`knowledge/ARCHITECTURAL_DECISIONS.md`): dia útil é definido por um calendário
 * **operacional** (a empresa está ou não parada naquele dia), nunca pela classificação
 * jurídica (feriado × ponto facultativo). Nenhum consumidor deste módulo (ex.:
 * `briefing.calculadoraAprovacao.ts`) deve conhecer as fontes que compõem a resposta — só o
 * resultado de `ehDiaUtil`.
 */
export interface ProvedorDeCalendarioOperacional {
  ehDiaUtil(data: Date): boolean;
}

/** Data recorrente todo ano (feriado estadual/municipal fixo) — sem ano associado. */
export interface FeriadoRecorrente {
  mes: number; // 1-12
  dia: number; // 1-31
  nome: string;
}

/**
 * Ponto facultativo institucional: decisão pontual da operação, ano a ano (ex.: "este ano
 * emendamos a segunda após tal feriado") — por isso carrega data completa, não recorrente.
 */
export interface FeriadoInstitucional {
  data: string; // AAAA-MM-DD
  nome: string;
}

/**
 * SPEC-009 §21 (D-02/D-03): estado e cidade-base definem qual conjunto de feriados
 * estaduais/municipais se aplica; as duas listas + os pontos facultativos institucionais são
 * responsabilidade operacional, não uma fonte pública — podem começar vazias/incompletas sem
 * bloquear as demais camadas do calendário.
 */
export interface ConfiguracaoCalendarioOperacional {
  estado: string;
  cidadeBase: string;
  feriadosEstaduais: FeriadoRecorrente[];
  feriadosMunicipais: FeriadoRecorrente[];
  pontosFacultativosInstitucionais: FeriadoInstitucional[];
}
