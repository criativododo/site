import { entregaRepositorio } from "../conteudo/entrega.repository.js";
import type { ItemDePendencia } from "../conteudo/entrega.types.js";
import { projetarPendencias } from "../conteudo/conteudo.service.js";
import { obrigacaoRepositorio } from "./obrigacao.repository.js";
import type { ObrigacaoFinanceira } from "./obrigacao.types.js";

/**
 * UC-030.03 · Selecionar período (RN-04): só competências com atividade real da Parceira —
 * união dos meses em que houve Entrega (SPEC-012) ou Obrigação Financeira (SPEC-020). Mais
 * recente primeiro.
 */
export async function listarPeriodosComAtividade(parceiraId: string): Promise<string[]> {
  const [entregas, obrigacoes] = await Promise.all([
    entregaRepositorio.listarPorParceira(parceiraId),
    obrigacaoRepositorio.listarPorParceira(parceiraId),
  ]);

  const periodos = new Set([
    ...entregas.map((entrega) => entrega.mesReferencia),
    ...obrigacoes.map((obrigacao) => obrigacao.mesReferencia),
  ]);

  return [...periodos].sort().reverse();
}

async function periodoTemAtividade(parceiraId: string, mesReferencia: string): Promise<boolean> {
  const periodos = await listarPeriodosComAtividade(parceiraId);
  return periodos.includes(mesReferencia);
}

/** CB-02: `EM_ABERTO`/`APROVADO` contam em previsto, não em pago — só `PAGO` conta como pago. */
export function calcularResumoFinanceiro(obrigacoes: ObrigacaoFinanceira[]): {
  previsto: number;
  pago: number;
} {
  const previsto = obrigacoes.reduce((total, obrigacao) => total + obrigacao.valor, 0);
  const pago = obrigacoes
    .filter((obrigacao) => obrigacao.estado === "PAGO")
    .reduce((total, obrigacao) => total + obrigacao.valor, 0);

  return { previsto, pago };
}

/**
 * UC-030.01 · Ver financeiro do período. PF-02: período sem atividade da Parceira → null
 * (rota traduz para 404, mesma disciplina de não revelar dado de outra Parceira/período).
 */
export async function obterResumoFinanceiro(
  parceiraId: string,
  mesReferencia: string,
): Promise<{ mesReferencia: string; previsto: number; pago: number } | null> {
  if (!(await periodoTemAtividade(parceiraId, mesReferencia))) {
    return null;
  }

  const obrigacoes = await obrigacaoRepositorio.listarPorParceiraECompetencia(parceiraId, mesReferencia);
  return { mesReferencia, ...calcularResumoFinanceiro(obrigacoes) };
}

export interface ItemDeHistorico {
  entregas: ItemDePendencia[];
  obrigacoes: ObrigacaoFinanceira[];
}

/**
 * UC-030.02 · Consultar histórico (INV-02: somente leitura). PF-02: mesmo tratamento de
 * `obterResumoFinanceiro`.
 */
export async function obterHistorico(
  parceiraId: string,
  mesReferencia: string,
): Promise<ItemDeHistorico | null> {
  if (!(await periodoTemAtividade(parceiraId, mesReferencia))) {
    return null;
  }

  const [entregas, obrigacoes] = await Promise.all([
    entregaRepositorio.listarPorParceiraECompetencia(parceiraId, mesReferencia),
    obrigacaoRepositorio.listarPorParceiraECompetencia(parceiraId, mesReferencia),
  ]);

  return { entregas: projetarPendencias(entregas), obrigacoes };
}
