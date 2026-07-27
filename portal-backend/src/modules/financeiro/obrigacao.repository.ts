import { competenciaAnterior, competenciaCorrente } from "../conteudo/competencia.js";
import { env } from "../../config/env.js";
import type { ObrigacaoFinanceira } from "./obrigacao.types.js";

/**
 * Armazenamento em memória — mesma decisão de entrega.repository.ts. Seed cobre a
 * competência corrente (ainda `EM_ABERTO`, alinhada às Entregas seedadas em
 * conteudo/entrega.repository.ts) e a anterior (já `PAGO`), para exercitar seleção de
 * período (Feature 3.1) com mais de uma competência real.
 */
function seedInicial(): ObrigacaoFinanceira[] {
  if (!env.parceiraSeed.id) {
    return [];
  }

  const mesCorrente = competenciaCorrente();
  const mesAnterior = competenciaAnterior(mesCorrente);

  return [
    {
      id: "obrigacao-seed-1",
      parceiraId: env.parceiraSeed.id,
      mesReferencia: mesCorrente,
      valor: 2500,
      estado: "EM_ABERTO",
    },
    {
      id: "obrigacao-seed-2",
      parceiraId: env.parceiraSeed.id,
      mesReferencia: mesAnterior,
      valor: 2500,
      estado: "PAGO",
    },
  ];
}

/** Exportada (não só a instância) para permitir teste com fixtures isoladas. */
export class ObrigacaoRepositorioEmMemoria {
  private obrigacoes: ObrigacaoFinanceira[];

  constructor(obrigacoes: ObrigacaoFinanceira[] = seedInicial()) {
    this.obrigacoes = obrigacoes;
  }

  async listarTodas(): Promise<ObrigacaoFinanceira[]> {
    return this.obrigacoes;
  }

  async listarPorParceira(parceiraId: string): Promise<ObrigacaoFinanceira[]> {
    return this.obrigacoes.filter((obrigacao) => obrigacao.parceiraId === parceiraId);
  }

  async listarPorParceiraECompetencia(
    parceiraId: string,
    mesReferencia: string,
  ): Promise<ObrigacaoFinanceira[]> {
    const doPeriodo = await this.listarPorParceira(parceiraId);
    return doPeriodo.filter((obrigacao) => obrigacao.mesReferencia === mesReferencia);
  }
}

export const obrigacaoRepositorio = new ObrigacaoRepositorioEmMemoria();
