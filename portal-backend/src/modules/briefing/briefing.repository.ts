import type { Pool } from "pg";
import { pool } from "../../config/database.js";
import { env } from "../../config/env.js";
import { competenciaCorrente } from "../conteudo/competencia.js";
import { calcularDataAprovacaoInterna } from "./briefing.calculadoraAprovacao.js";
import type { BlocoBriefing } from "./briefing.types.js";

/**
 * Seed de desenvolvimento/QA — usado pela versão em memória (fixtures de teste) e
 * reaproveitado pelo script de seed do Postgres (Fase 2, `scripts/seed.ts`).
 */
export function seedInicialBriefings(): BlocoBriefing[] {
  if (!env.parceiraSeed.id) {
    return [];
  }

  const mes = competenciaCorrente();
  const agora = new Date().toISOString();
  return [
    {
      id: "briefing-seed-1",
      parceiraId: env.parceiraSeed.id,
      mesReferencia: mes,
      formato: "Reel",
      look: "Look 1 — casual",
      dataEntrega: `${mes}-10`,
      dataPostagem: `${mes}-20`,
      orientacao: "Reel de unboxing, tom leve, até 30s.",
      dataAprovacaoInterna: calcularDataAprovacaoInterna(`${mes}-20`),
      dataCriacao: agora,
      dataAtualizacao: agora,
    },
    {
      id: "briefing-seed-2",
      parceiraId: env.parceiraSeed.id,
      mesReferencia: mes,
      formato: "Carrossel",
      look: "Look 2 — noite",
      dataEntrega: `${mes}-05`,
      dataPostagem: `${mes}-18`,
      orientacao: "Carrossel de 5 fotos mostrando o produto em uso.",
      dataAprovacaoInterna: calcularDataAprovacaoInterna(`${mes}-18`),
      dataCriacao: agora,
      dataAtualizacao: agora,
    },
    {
      id: "briefing-seed-3",
      parceiraId: env.parceiraSeed.id,
      mesReferencia: mes,
      formato: "Stories1",
      look: "Look 1 — casual",
      dataEntrega: `${mes}-15`,
      dataPostagem: `${mes}-22`,
      orientacao: "Stories de bastidor, sem roteiro fixo.",
      dataAprovacaoInterna: calcularDataAprovacaoInterna(`${mes}-22`),
      dataCriacao: agora,
      dataAtualizacao: agora,
    },
  ];
}

/** Exportada (não só a instância) para permitir teste com fixtures isoladas. */
class BriefingRepositorioEmMemoria {
  private blocos: BlocoBriefing[];

  constructor(blocos: BlocoBriefing[] = seedInicialBriefings()) {
    this.blocos = blocos;
  }

  async buscarBloco(
    parceiraId: string,
    mesReferencia: string,
    formato: BlocoBriefing["formato"],
  ): Promise<BlocoBriefing | null> {
    return (
      this.blocos.find(
        (bloco) =>
          bloco.parceiraId === parceiraId && bloco.mesReferencia === mesReferencia && bloco.formato === formato,
      ) ?? null
    );
  }

  async listarTodos(): Promise<BlocoBriefing[]> {
    return this.blocos;
  }

  async buscarPorId(id: string): Promise<BlocoBriefing | null> {
    return this.blocos.find((bloco) => bloco.id === id) ?? null;
  }

  async criar(bloco: BlocoBriefing): Promise<BlocoBriefing> {
    this.blocos.push(bloco);
    return bloco;
  }

  async atualizar(blocoAtualizado: BlocoBriefing): Promise<BlocoBriefing> {
    const indice = this.blocos.findIndex((bloco) => bloco.id === blocoAtualizado.id);
    if (indice === -1) {
      throw new Error(`Bloco de Briefing inexistente para atualização: ${blocoAtualizado.id}`);
    }
    const atualizado: BlocoBriefing = { ...blocoAtualizado, dataAtualizacao: new Date().toISOString() };
    this.blocos[indice] = atualizado;
    return atualizado;
  }

  async remover(id: string): Promise<void> {
    const indice = this.blocos.findIndex((bloco) => bloco.id === id);
    if (indice === -1) {
      throw new Error(`Bloco de Briefing inexistente para remoção: ${id}`);
    }
    this.blocos.splice(indice, 1);
  }
}

interface LinhaBriefing {
  id: string;
  parceiraId: string;
  mesReferencia: string;
  formato: BlocoBriefing["formato"];
  look: string;
  dataEntrega: string;
  dataPostagem: string;
  orientacao: string;
  dataAprovacaoInterna: string;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

function paraBloco(linha: LinhaBriefing): BlocoBriefing {
  return {
    id: linha.id,
    parceiraId: linha.parceiraId,
    mesReferencia: linha.mesReferencia,
    formato: linha.formato,
    look: linha.look,
    dataEntrega: linha.dataEntrega,
    dataPostagem: linha.dataPostagem,
    orientacao: linha.orientacao,
    dataAprovacaoInterna: linha.dataAprovacaoInterna,
    dataCriacao: linha.dataCriacao.toISOString(),
    dataAtualizacao: linha.dataAtualizacao.toISOString(),
  };
}

const SELECT_COLUNAS = `
  id, parceira_id AS "parceiraId", mes_referencia AS "mesReferencia", formato, look,
  data_entrega AS "dataEntrega", data_postagem AS "dataPostagem", orientacao,
  data_aprovacao_interna AS "dataAprovacaoInterna",
  data_criacao AS "dataCriacao", data_atualizacao AS "dataAtualizacao"
`;

/** Fase 2 do Plano Mestre (ADR-015): mesma interface pública da versão em memória. */
export class BriefingRepositorioPostgres {
  constructor(private readonly db: Pool) {}

  async buscarBloco(
    parceiraId: string,
    mesReferencia: string,
    formato: BlocoBriefing["formato"],
  ): Promise<BlocoBriefing | null> {
    const resultado = await this.db.query<LinhaBriefing>(
      `SELECT ${SELECT_COLUNAS} FROM briefings WHERE parceira_id = $1 AND mes_referencia = $2 AND formato = $3`,
      [parceiraId, mesReferencia, formato],
    );
    return resultado.rows[0] ? paraBloco(resultado.rows[0]) : null;
  }

  async listarTodos(): Promise<BlocoBriefing[]> {
    const resultado = await this.db.query<LinhaBriefing>(`SELECT ${SELECT_COLUNAS} FROM briefings`);
    return resultado.rows.map(paraBloco);
  }

  async buscarPorId(id: string): Promise<BlocoBriefing | null> {
    const resultado = await this.db.query<LinhaBriefing>(`SELECT ${SELECT_COLUNAS} FROM briefings WHERE id = $1`, [
      id,
    ]);
    return resultado.rows[0] ? paraBloco(resultado.rows[0]) : null;
  }

  async criar(bloco: BlocoBriefing): Promise<BlocoBriefing> {
    const resultado = await this.db.query<LinhaBriefing>(
      `INSERT INTO briefings
         (id, parceira_id, mes_referencia, formato, look, data_entrega, data_postagem, orientacao, data_aprovacao_interna, data_criacao, data_atualizacao)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING ${SELECT_COLUNAS}`,
      [
        bloco.id,
        bloco.parceiraId,
        bloco.mesReferencia,
        bloco.formato,
        bloco.look,
        bloco.dataEntrega,
        bloco.dataPostagem,
        bloco.orientacao,
        bloco.dataAprovacaoInterna,
        bloco.dataCriacao,
        bloco.dataAtualizacao,
      ],
    );
    return paraBloco(resultado.rows[0]);
  }

  async atualizar(blocoAtualizado: BlocoBriefing): Promise<BlocoBriefing> {
    const resultado = await this.db.query<LinhaBriefing>(
      `UPDATE briefings SET
         look = $2, data_entrega = $3, data_postagem = $4, orientacao = $5,
         data_aprovacao_interna = $6, data_atualizacao = now()
       WHERE id = $1
       RETURNING ${SELECT_COLUNAS}`,
      [
        blocoAtualizado.id,
        blocoAtualizado.look,
        blocoAtualizado.dataEntrega,
        blocoAtualizado.dataPostagem,
        blocoAtualizado.orientacao,
        blocoAtualizado.dataAprovacaoInterna,
      ],
    );
    if (!resultado.rows[0]) {
      throw new Error(`Bloco de Briefing inexistente para atualização: ${blocoAtualizado.id}`);
    }
    return paraBloco(resultado.rows[0]);
  }

  async remover(id: string): Promise<void> {
    const resultado = await this.db.query(`DELETE FROM briefings WHERE id = $1`, [id]);
    if (resultado.rowCount === 0) {
      throw new Error(`Bloco de Briefing inexistente para remoção: ${id}`);
    }
  }
}

export { BriefingRepositorioEmMemoria };
export const briefingRepositorio = new BriefingRepositorioPostgres(pool);
