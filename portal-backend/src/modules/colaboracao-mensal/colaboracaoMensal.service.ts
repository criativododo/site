import { randomUUID } from "node:crypto";
import { listarParceiras } from "../parceira/parceira.service.js";
import {
  colaboracaoMensalRepositorio,
  contarRegistrosVinculados,
  vincularRegistrosExistentes,
} from "./colaboracaoMensal.repository.js";
import type { ColaboracaoMensal } from "./colaboracaoMensal.types.js";

/** MesReferencia, formato `AAAA-MM` — mesma convenção de `conteudo/competencia.ts`. */
const FORMATO_MES_REFERENCIA = /^\d{4}-(0[1-9]|1[0-2])$/;

export interface EstatisticasCompilacao {
  mesReferencia: string;
  parceirasElegiveis: number;
  colaboracoesCriadas: number;
  colaboracoesJaExistentes: number;
  entregasVinculadas: number;
  briefingsVinculados: number;
  obrigacoesVinculadas: number;
}

export type ResultadoCompilacaoCompetencia =
  | { ok: true; estatisticas: EstatisticasCompilacao }
  | { ok: false; motivo: "MES_REFERENCIA_INVALIDO" };

/**
 * ADR-016 item 2 — gatilho manual do Administrador (Etapa 3: capacidade interna, ainda sem
 * Endpoint que a exponha). Uma competência por mês, idempotente: reexecutar para a mesma
 * competência não duplica `ColaboracaoMensal` nem altera snapshot já gravado (item 4) —
 * apenas religa registros ainda não vinculados e mantém `quantidadeRegistrosGerados`
 * sincronizada com o total real de Entregas+Briefings+Obrigações vinculados.
 *
 * Escopo desta fase (declarado, não presumido — ADR-003): NÃO gera Entregas, Briefings ou
 * Obrigações Financeiras a partir da Condição Comercial da Parceira. Essa fórmula de geração
 * (quantos itens de cada formato, datas, valores) nunca foi decidida pelo responsável do
 * projeto — inventá-la aqui seria regra de negócio nova não autorizada. Esta função apenas
 * materializa a Colaboração Mensal (com snapshot da Condição Comercial vigente) e vincula o
 * que já existir manualmente para aquela Parceira+competência no momento da chamada.
 *
 * Calendário Operacional (ADR-016 item 3): nenhuma heurística de dia útil é introduzida
 * aqui — `criadoEm` é só o instante de execução (auditoria), não um cálculo de prazo.
 */
export async function compilarCompetencia(
  mesReferencia: string,
  executadoPor: string,
): Promise<ResultadoCompilacaoCompetencia> {
  if (!FORMATO_MES_REFERENCIA.test(mesReferencia)) {
    return { ok: false, motivo: "MES_REFERENCIA_INVALIDO" };
  }

  const parceirasAtivas = (await listarParceiras()).filter((parceira) => parceira.status === "ATIVA");

  const estatisticas: EstatisticasCompilacao = {
    mesReferencia,
    parceirasElegiveis: parceirasAtivas.length,
    colaboracoesCriadas: 0,
    colaboracoesJaExistentes: 0,
    entregasVinculadas: 0,
    briefingsVinculados: 0,
    obrigacoesVinculadas: 0,
  };

  for (const parceira of parceirasAtivas) {
    const candidata: ColaboracaoMensal = {
      id: randomUUID(),
      parceiraId: parceira.id,
      mesReferencia,
      // Snapshot imutável (ADR-016 item 4) — cópia da Condição Comercial vigente agora;
      // `criar` nunca sobrescreve se já existir uma Colaboração Mensal para esta competência.
      condicaoComercial: parceira.condicaoComercial,
      status: "COMPILADA",
      criadoPor: executadoPor,
      criadoEm: new Date().toISOString(),
      quantidadeRegistrosGerados: 0,
    };

    const persistida = await colaboracaoMensalRepositorio.criar(candidata);
    if (persistida.id === candidata.id) {
      estatisticas.colaboracoesCriadas += 1;
    } else {
      estatisticas.colaboracoesJaExistentes += 1;
    }

    const vinculados = await vincularRegistrosExistentes(parceira.id, mesReferencia, persistida.id);
    estatisticas.entregasVinculadas += vinculados.entregas;
    estatisticas.briefingsVinculados += vinculados.briefings;
    estatisticas.obrigacoesVinculadas += vinculados.obrigacoes;

    const totais = await contarRegistrosVinculados(persistida.id);
    await colaboracaoMensalRepositorio.atualizarQuantidadeRegistrosGerados(
      persistida.id,
      totais.entregas + totais.briefings + totais.obrigacoes,
    );
  }

  return { ok: true, estatisticas };
}

/** Consulta interna (ainda não usada por nenhum Endpoint) — leitura de uma Colaboração Mensal específica. */
export async function buscarColaboracaoMensal(
  parceiraId: string,
  mesReferencia: string,
): Promise<ColaboracaoMensal | null> {
  return colaboracaoMensalRepositorio.buscarPorParceiraECompetencia(parceiraId, mesReferencia);
}

/** Consulta interna (ainda não usada por nenhum Endpoint) — histórico de competências de uma Parceira. */
export async function listarColaboracoesDaParceira(parceiraId: string): Promise<ColaboracaoMensal[]> {
  return colaboracaoMensalRepositorio.listarPorParceira(parceiraId);
}
