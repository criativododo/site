import type { Pool } from "pg";
import { pool } from "../../config/database.js";
import { env } from "../../config/env.js";
import { competenciaAnterior, competenciaCorrente } from "../conteudo/competencia.js";
import type { ObrigacaoFinanceira } from "./obrigacao.types.js";

/**
 * Seed de desenvolvimento/QA — usado pela versão em memória (fixtures de teste) e
 * reaproveitado pelo script de seed do Postgres (Fase 2, `scripts/seed.ts`).
 */
export function seedInicialObrigacoes(): ObrigacaoFinanceira[] {
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
class ObrigacaoRepositorioEmMemoria {
  private obrigacoes: ObrigacaoFinanceira[];

  constructor(obrigacoes: ObrigacaoFinanceira[] = seedInicialObrigacoes()) {
    this.obrigacoes = obrigacoes;
  }

  async listarTodas(): Promise<ObrigacaoFinanceira[]> {
    return this.obrigacoes;
  }

  async listarPorParceira(parceiraId: string): Promise<ObrigacaoFinanceira[]> {
    return this.obrigacoes.filter((obrigacao) => obrigacao.parceiraId === parceiraId);
  }

  async listarPorParceiraECompetencia(parceiraId: string, mesReferencia: string): Promise<ObrigacaoFinanceira[]> {
    const doPeriodo = await this.listarPorParceira(parceiraId);
    return doPeriodo.filter((obrigacao) => obrigacao.mesReferencia === mesReferencia);
  }

  async buscarPorId(id: string): Promise<ObrigacaoFinanceira | null> {
    return this.obrigacoes.find((obrigacao) => obrigacao.id === id) ?? null;
  }

  async criar(obrigacao: ObrigacaoFinanceira): Promise<ObrigacaoFinanceira> {
    this.obrigacoes.push(obrigacao);
    return obrigacao;
  }

  async atualizar(obrigacaoAtualizada: ObrigacaoFinanceira): Promise<ObrigacaoFinanceira> {
    const indice = this.obrigacoes.findIndex((obrigacao) => obrigacao.id === obrigacaoAtualizada.id);
    if (indice === -1) {
      throw new Error(`Obrigação Financeira inexistente para atualização: ${obrigacaoAtualizada.id}`);
    }
    const atualizada: ObrigacaoFinanceira = { ...obrigacaoAtualizada, dataAtualizacao: new Date().toISOString() };
    this.obrigacoes[indice] = atualizada;
    return atualizada;
  }

  async remover(id: string): Promise<void> {
    const indice = this.obrigacoes.findIndex((obrigacao) => obrigacao.id === id);
    if (indice === -1) {
      throw new Error(`Obrigação Financeira inexistente para remoção: ${id}`);
    }
    this.obrigacoes.splice(indice, 1);
  }
}

interface LinhaObrigacao {
  id: string;
  parceiraId: string;
  mesReferencia: string;
  valor: string; // numeric do Postgres vem como string por padrão no node-postgres
  estado: ObrigacaoFinanceira["estado"];
  tipo: ObrigacaoFinanceira["tipo"];
  dataCriacao: Date;
  dataAtualizacao: Date;
  dataArquivamento: Date | null;
}

function paraObrigacao(linha: LinhaObrigacao): ObrigacaoFinanceira {
  return {
    id: linha.id,
    parceiraId: linha.parceiraId,
    mesReferencia: linha.mesReferencia,
    valor: Number(linha.valor),
    estado: linha.estado,
    tipo: linha.tipo,
    dataCriacao: linha.dataCriacao.toISOString(),
    dataAtualizacao: linha.dataAtualizacao.toISOString(),
    dataArquivamento: linha.dataArquivamento ? linha.dataArquivamento.toISOString() : null,
  };
}

const SELECT_COLUNAS = `
  id, parceira_id AS "parceiraId", mes_referencia AS "mesReferencia", valor, estado, tipo,
  data_criacao AS "dataCriacao", data_atualizacao AS "dataAtualizacao",
  data_arquivamento AS "dataArquivamento"
`;

/** Fase 2 do Plano Mestre (ADR-015): mesma interface pública da versão em memória. */
export class ObrigacaoRepositorioPostgres {
  constructor(private readonly db: Pool) {}

  async listarTodas(): Promise<ObrigacaoFinanceira[]> {
    const resultado = await this.db.query<LinhaObrigacao>(`SELECT ${SELECT_COLUNAS} FROM obrigacoes_financeiras`);
    return resultado.rows.map(paraObrigacao);
  }

  async listarPorParceira(parceiraId: string): Promise<ObrigacaoFinanceira[]> {
    const resultado = await this.db.query<LinhaObrigacao>(
      `SELECT ${SELECT_COLUNAS} FROM obrigacoes_financeiras WHERE parceira_id = $1`,
      [parceiraId],
    );
    return resultado.rows.map(paraObrigacao);
  }

  async listarPorParceiraECompetencia(parceiraId: string, mesReferencia: string): Promise<ObrigacaoFinanceira[]> {
    const resultado = await this.db.query<LinhaObrigacao>(
      `SELECT ${SELECT_COLUNAS} FROM obrigacoes_financeiras WHERE parceira_id = $1 AND mes_referencia = $2`,
      [parceiraId, mesReferencia],
    );
    return resultado.rows.map(paraObrigacao);
  }

  async buscarPorId(id: string): Promise<ObrigacaoFinanceira | null> {
    const resultado = await this.db.query<LinhaObrigacao>(
      `SELECT ${SELECT_COLUNAS} FROM obrigacoes_financeiras WHERE id = $1`,
      [id],
    );
    return resultado.rows[0] ? paraObrigacao(resultado.rows[0]) : null;
  }

  async criar(obrigacao: ObrigacaoFinanceira): Promise<ObrigacaoFinanceira> {
    const resultado = await this.db.query<LinhaObrigacao>(
      `INSERT INTO obrigacoes_financeiras
         (id, parceira_id, mes_referencia, valor, estado, tipo, data_criacao, data_atualizacao, data_arquivamento)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING ${SELECT_COLUNAS}`,
      [
        obrigacao.id,
        obrigacao.parceiraId,
        obrigacao.mesReferencia,
        obrigacao.valor,
        obrigacao.estado,
        obrigacao.tipo,
        obrigacao.dataCriacao,
        obrigacao.dataAtualizacao,
        obrigacao.dataArquivamento,
      ],
    );
    return paraObrigacao(resultado.rows[0]);
  }

  async atualizar(obrigacaoAtualizada: ObrigacaoFinanceira): Promise<ObrigacaoFinanceira> {
    const resultado = await this.db.query<LinhaObrigacao>(
      `UPDATE obrigacoes_financeiras SET
         valor = $2, estado = $3, data_arquivamento = $4, data_atualizacao = now()
       WHERE id = $1
       RETURNING ${SELECT_COLUNAS}`,
      [
        obrigacaoAtualizada.id,
        obrigacaoAtualizada.valor,
        obrigacaoAtualizada.estado,
        obrigacaoAtualizada.dataArquivamento,
      ],
    );
    if (!resultado.rows[0]) {
      throw new Error(`Obrigação Financeira inexistente para atualização: ${obrigacaoAtualizada.id}`);
    }
    return paraObrigacao(resultado.rows[0]);
  }

  async remover(id: string): Promise<void> {
    const resultado = await this.db.query(`DELETE FROM obrigacoes_financeiras WHERE id = $1`, [id]);
    if (resultado.rowCount === 0) {
      throw new Error(`Obrigação Financeira inexistente para remoção: ${id}`);
    }
  }
}

export { ObrigacaoRepositorioEmMemoria };
export const obrigacaoRepositorio = new ObrigacaoRepositorioPostgres(pool);
