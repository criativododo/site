import type { ConfiguracaoCalendarioOperacional } from "./tipos.js";

/**
 * Calendário operacional padrão do Portal DODÔ (ADR-014): cidade-base Nova Friburgo/RJ,
 * decisão do responsável do projeto em 2026-07-29. Parametrizável no futuro (multi-cidade),
 * mas hoje é single-tenant (ADR-008) — uma única configuração ativa.
 */
export const CALENDARIO_OPERACIONAL_PADRAO: ConfiguracaoCalendarioOperacional = {
  estado: "RJ",
  cidadeBase: "Nova Friburgo",

  feriadosEstaduais: [
    { mes: 4, dia: 23, nome: "Dia de São Jorge (feriado estadual do Rio de Janeiro)" },
  ],

  /**
   * Vazio deliberadamente: a data de aniversário/emancipação de Nova Friburgo (feriado
   * municipal) não foi confirmada com o responsável operacional (SPEC-009 §21, item D-02).
   * Não presumir uma data — preencher só após confirmação. Lista vazia não bloqueia as
   * demais camadas do calendário (nacional/estadual continuam ativas).
   */
  feriadosMunicipais: [],

  /**
   * Vazio por padrão: cadastro de pontos facultativos institucionais é responsabilidade
   * operacional da Criativo Dodô, não uma lista pré-populada por este módulo (SPEC-009 §21,
   * item D-03).
   */
  pontosFacultativosInstitucionais: [],
};
