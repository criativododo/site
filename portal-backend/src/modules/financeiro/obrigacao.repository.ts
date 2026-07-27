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
  const agora = new Date().toISOString();

  return [
    {
      id: "obrigacao-seed-1",
      parceiraId: env.parceiraSeed.id,
      mesReferencia: mesCorrente,
      valor: 2500,
      estado: "EM_ABERTO",
      tipo: "MENSAL",
      dataCriacao: agora,
      dataAtualizacao: agora,
      dataArquivamento: null,
    },
    {
      id: "obrigacao-seed-2",
      parceiraId: env.parceiraSeed.id,
      mesReferencia: mesAnterior,
      valor: 2500,
      estado: "PAGO",
      tipo: "MENSAL",
      dataCriacao: agora,
      dataAtualizacao: agora,
      dataArquivamento: agora,
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

  async buscarPorId(id: string): Promise<ObrigacaoFinanceira | null> {
    return this.obrigacoes.find((obrigacao) => obrigacao.id === id) ?? null;
  }

  /** Lançamento administrativo (Backoffice). Persistência pura — validações no service. */
  async criar(obrigacao: ObrigacaoFinanceira): Promise<ObrigacaoFinanceira> {
    this.obrigacoes.push(obrigacao);
    return obrigacao;
  }

  /** Carimba `dataAtualizacao` aqui, mesma disciplina de entrega.repository.ts/briefing.repository.ts. */
  async atualizar(obrigacaoAtualizada: ObrigacaoFinanceira): Promise<ObrigacaoFinanceira> {
    const indice = this.obrigacoes.findIndex((obrigacao) => obrigacao.id === obrigacaoAtualizada.id);
    if (indice === -1) {
      throw new Error(`Obrigação Financeira inexistente para atualização: ${obrigacaoAtualizada.id}`);
    }
    const atualizada: ObrigacaoFinanceira = { ...obrigacaoAtualizada, dataAtualizacao: new Date().toISOString() };
    this.obrigacoes[indice] = atualizada;
    return atualizada;
  }

  /** Remoção administrativa (RN de "quando permitido" é responsabilidade do service). */
  async remover(id: string): Promise<void> {
    const indice = this.obrigacoes.findIndex((obrigacao) => obrigacao.id === id);
    if (indice === -1) {
      throw new Error(`Obrigação Financeira inexistente para remoção: ${id}`);
    }
    this.obrigacoes.splice(indice, 1);
  }
}

export const obrigacaoRepositorio = new ObrigacaoRepositorioEmMemoria();
