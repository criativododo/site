import type { Pool } from "pg";
import { pool } from "../../config/database.js";
import type { ColaboracaoMensal } from "./colaboracaoMensal.types.js";

/** Armazenamento em memória — mantido só para fixtures isoladas de teste unitário. */
class ColaboracaoMensalRepositorioEmMemoria {
  private colaboracoes: ColaboracaoMensal[];

  constructor(colaboracoes: ColaboracaoMensal[] = []) {
    this.colaboracoes = colaboracoes;
  }

  async listarPorParceira(parceiraId: string): Promise<ColaboracaoMensal[]> {
    return this.colaboracoes.filter((colaboracao) => colaboracao.parceiraId === parceiraId);
  }

  async buscarPorParceiraECompetencia(parceiraId: string, mesReferencia: string): Promise<ColaboracaoMensal | null> {
    return (
      this.colaboracoes.find(
        (colaboracao) => colaboracao.parceiraId === parceiraId && colaboracao.mesReferencia === mesReferencia,
      ) ?? null
    );
  }

  /**
   * Idempotente (ADR-016 item 2): se já existir Colaboração Mensal para esta Parceira+
   * competência, retorna a existente sem sobrescrever o snapshot já gravado (item 4) —
   * nunca insere a candidata recebida por parâmetro nesse caso.
   */
  async criar(colaboracao: ColaboracaoMensal): Promise<ColaboracaoMensal> {
    const existente = await this.buscarPorParceiraECompetencia(colaboracao.parceiraId, colaboracao.mesReferencia);
    if (existente) {
      return existente;
    }
    this.colaboracoes.push(colaboracao);
    return colaboracao;
  }

  async atualizarQuantidadeRegistrosGerados(id: string, quantidade: number): Promise<ColaboracaoMensal> {
    const indice = this.colaboracoes.findIndex((colaboracao) => colaboracao.id === id);
    if (indice === -1) {
      throw new Error(`Colaboração Mensal inexistente para atualização: ${id}`);
    }
    const atualizada: ColaboracaoMensal = { ...this.colaboracoes[indice], quantidadeRegistrosGerados: quantidade };
    this.colaboracoes[indice] = atualizada;
    return atualizada;
  }
}

interface LinhaColaboracaoMensal {
  id: string;
  parceiraId: string;
  mesReferencia: string;
  condicaoComercial: ColaboracaoMensal["condicaoComercial"];
  status: ColaboracaoMensal["status"];
  criadoPor: string;
  criadoEm: Date;
  quantidadeRegistrosGerados: number;
}

function paraColaboracaoMensal(linha: LinhaColaboracaoMensal): ColaboracaoMensal {
  return {
    id: linha.id,
    parceiraId: linha.parceiraId,
    mesReferencia: linha.mesReferencia,
    condicaoComercial: linha.condicaoComercial,
    status: linha.status,
    criadoPor: linha.criadoPor,
    criadoEm: linha.criadoEm.toISOString(),
    quantidadeRegistrosGerados: linha.quantidadeRegistrosGerados,
  };
}

const SELECT_COLUNAS = `
  id, parceira_id AS "parceiraId", mes_referencia AS "mesReferencia",
  condicao_comercial AS "condicaoComercial", status, criado_por AS "criadoPor",
  criado_em AS "criadoEm", quantidade_registros_gerados AS "quantidadeRegistrosGerados"
`;

/**
 * Fase 3 do Plano Mestre (ADR-016): mesma interface pública da versão em memória. Etapa 3 —
 * arquitetura interna apenas; nenhum Endpoint/Controller chama esta classe ainda.
 */
export class ColaboracaoMensalRepositorioPostgres {
  constructor(private readonly db: Pool) {}

  async listarPorParceira(parceiraId: string): Promise<ColaboracaoMensal[]> {
    const resultado = await this.db.query<LinhaColaboracaoMensal>(
      `SELECT ${SELECT_COLUNAS} FROM colaboracoes_mensais WHERE parceira_id = $1`,
      [parceiraId],
    );
    return resultado.rows.map(paraColaboracaoMensal);
  }

  async buscarPorParceiraECompetencia(parceiraId: string, mesReferencia: string): Promise<ColaboracaoMensal | null> {
    const resultado = await this.db.query<LinhaColaboracaoMensal>(
      `SELECT ${SELECT_COLUNAS} FROM colaboracoes_mensais WHERE parceira_id = $1 AND mes_referencia = $2`,
      [parceiraId, mesReferencia],
    );
    return resultado.rows[0] ? paraColaboracaoMensal(resultado.rows[0]) : null;
  }

  /**
   * Idempotente via `UNIQUE (parceira_id, mes_referencia)` (ADR-016 item 2/6 — invariante
   * "uma competência por mês" garantida também no banco). Em conflito, não sobrescreve o
   * snapshot já gravado (item 4): re-busca e retorna a linha existente.
   */
  async criar(colaboracao: ColaboracaoMensal): Promise<ColaboracaoMensal> {
    const insercao = await this.db.query<LinhaColaboracaoMensal>(
      `INSERT INTO colaboracoes_mensais
         (id, parceira_id, mes_referencia, condicao_comercial, status, criado_por, criado_em, quantidade_registros_gerados)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (parceira_id, mes_referencia) DO NOTHING
       RETURNING ${SELECT_COLUNAS}`,
      [
        colaboracao.id,
        colaboracao.parceiraId,
        colaboracao.mesReferencia,
        colaboracao.condicaoComercial,
        colaboracao.status,
        colaboracao.criadoPor,
        colaboracao.criadoEm,
        colaboracao.quantidadeRegistrosGerados,
      ],
    );

    if (insercao.rows[0]) {
      return paraColaboracaoMensal(insercao.rows[0]);
    }

    const existente = await this.buscarPorParceiraECompetencia(colaboracao.parceiraId, colaboracao.mesReferencia);
    if (!existente) {
      throw new Error(
        `Conflito de criação sem linha correspondente encontrada: ${colaboracao.parceiraId}/${colaboracao.mesReferencia}`,
      );
    }
    return existente;
  }

  async atualizarQuantidadeRegistrosGerados(id: string, quantidade: number): Promise<ColaboracaoMensal> {
    const resultado = await this.db.query<LinhaColaboracaoMensal>(
      `UPDATE colaboracoes_mensais SET quantidade_registros_gerados = $2
       WHERE id = $1
       RETURNING ${SELECT_COLUNAS}`,
      [id, quantidade],
    );
    if (!resultado.rows[0]) {
      throw new Error(`Colaboração Mensal inexistente para atualização: ${id}`);
    }
    return paraColaboracaoMensal(resultado.rows[0]);
  }
}

export interface ContagemRegistrosVinculados {
  entregas: number;
  briefings: number;
  obrigacoes: number;
}

/**
 * Vínculo de Entrega/Briefing/Obrigação Financeira já existentes a uma Colaboração Mensal
 * (ADR-016 item 6, "Entidade Canônica") — mesma lógica do backfill retroativo (Etapa 2,
 * `scripts/backfillColaboracaoMensal.ts`), reaproveitada aqui para que uma compilação ao
 * vivo (Etapa 3+) também vincule qualquer registro que já exista para a Parceira+competência
 * no momento da compilação.
 *
 * Função avulsa, não método de `ColaboracaoMensalRepositorioPostgres`/EmMemoria: é uma
 * operação inerentemente cross-tabela (entregas/briefings/obrigacoes_financeiras), sem
 * equivalente significativo em memória sem violar o encapsulamento dos repositórios desses
 * três módulos — os quais permanecem intocados nesta etapa.
 */
export async function vincularRegistrosExistentes(
  parceiraId: string,
  mesReferencia: string,
  colaboracaoMensalId: string,
): Promise<ContagemRegistrosVinculados> {
  const entregas = await pool.query(
    `UPDATE entregas SET colaboracao_mensal_id = $1
     WHERE parceira_id = $2 AND mes_referencia = $3 AND colaboracao_mensal_id IS NULL`,
    [colaboracaoMensalId, parceiraId, mesReferencia],
  );
  const briefings = await pool.query(
    `UPDATE briefings SET colaboracao_mensal_id = $1
     WHERE parceira_id = $2 AND mes_referencia = $3 AND colaboracao_mensal_id IS NULL`,
    [colaboracaoMensalId, parceiraId, mesReferencia],
  );
  const obrigacoes = await pool.query(
    `UPDATE obrigacoes_financeiras SET colaboracao_mensal_id = $1
     WHERE parceira_id = $2 AND mes_referencia = $3 AND colaboracao_mensal_id IS NULL`,
    [colaboracaoMensalId, parceiraId, mesReferencia],
  );

  return {
    entregas: entregas.rowCount ?? 0,
    briefings: briefings.rowCount ?? 0,
    obrigacoes: obrigacoes.rowCount ?? 0,
  };
}

/** Total de registros atualmente vinculados a uma Colaboração Mensal — usado para manter `quantidadeRegistrosGerados` em sincronia, de forma idempotente, a cada chamada de compilação. */
export async function contarRegistrosVinculados(colaboracaoMensalId: string): Promise<ContagemRegistrosVinculados> {
  const entregas = await pool.query<{ total: number }>(
    "SELECT COUNT(*)::int AS total FROM entregas WHERE colaboracao_mensal_id = $1",
    [colaboracaoMensalId],
  );
  const briefings = await pool.query<{ total: number }>(
    "SELECT COUNT(*)::int AS total FROM briefings WHERE colaboracao_mensal_id = $1",
    [colaboracaoMensalId],
  );
  const obrigacoes = await pool.query<{ total: number }>(
    "SELECT COUNT(*)::int AS total FROM obrigacoes_financeiras WHERE colaboracao_mensal_id = $1",
    [colaboracaoMensalId],
  );

  return {
    entregas: entregas.rows[0].total,
    briefings: briefings.rows[0].total,
    obrigacoes: obrigacoes.rows[0].total,
  };
}

export { ColaboracaoMensalRepositorioEmMemoria };
export const colaboracaoMensalRepositorio = new ColaboracaoMensalRepositorioPostgres(pool);
