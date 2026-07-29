import type { Pool } from "pg";
import { pool } from "../../config/database.js";
import { env } from "../../config/env.js";
import { competenciaCorrente } from "./competencia.js";
import type { Entrega } from "./entrega.types.js";

/**
 * Seed de desenvolvimento/QA (EPIC 2) — usado pela versão em memória (fixtures de teste) e
 * reaproveitado pelo script de seed do Postgres (Fase 2, `scripts/seed.ts`).
 */
export function seedInicialEntregas(): Entrega[] {
  if (!env.parceiraSeed.id) {
    return [];
  }

  const mes = competenciaCorrente();
  const agora = new Date().toISOString();
  return [
    {
      id: "entrega-seed-1",
      parceiraId: env.parceiraSeed.id,
      mesReferencia: mes,
      formato: "Reel",
      estado: "AGUARDANDO_MATERIAL",
      dataEntrega: `${mes}-10`,
      materialEnviado: null,
      dataCriacao: agora,
      dataAtualizacao: agora,
      dataArquivamento: null,
    },
    {
      id: "entrega-seed-2",
      parceiraId: env.parceiraSeed.id,
      mesReferencia: mes,
      formato: "Carrossel",
      estado: "AGUARDANDO_MATERIAL",
      dataEntrega: `${mes}-05`,
      materialEnviado: null,
      dataCriacao: agora,
      dataAtualizacao: agora,
      dataArquivamento: null,
    },
    {
      id: "entrega-seed-3",
      parceiraId: env.parceiraSeed.id,
      mesReferencia: mes,
      formato: "Stories1",
      estado: "EM_REVISAO",
      dataEntrega: `${mes}-15`,
      materialEnviado: null,
      dataCriacao: agora,
      dataAtualizacao: agora,
      dataArquivamento: null,
    },
  ];
}

/** Exportada (não só a instância) para permitir teste de RN-01/CB-02 com fixtures isoladas. */
class EntregaRepositorioEmMemoria {
  private entregas: Entrega[];

  constructor(entregas: Entrega[] = seedInicialEntregas()) {
    this.entregas = entregas;
  }

  async listarTodas(): Promise<Entrega[]> {
    return this.entregas;
  }

  async listarPorParceira(parceiraId: string): Promise<Entrega[]> {
    return this.entregas.filter((entrega) => entrega.parceiraId === parceiraId);
  }

  async listarPorParceiraECompetencia(parceiraId: string, mesReferencia: string): Promise<Entrega[]> {
    const daParceira = await this.listarPorParceira(parceiraId);
    return daParceira.filter((entrega) => entrega.mesReferencia === mesReferencia);
  }

  async buscarPorId(id: string): Promise<Entrega | null> {
    return this.entregas.find((entrega) => entrega.id === id) ?? null;
  }

  async criar(entrega: Entrega): Promise<Entrega> {
    this.entregas.push(entrega);
    return entrega;
  }

  async atualizar(entregaAtualizada: Entrega): Promise<Entrega> {
    const indice = this.entregas.findIndex((entrega) => entrega.id === entregaAtualizada.id);
    if (indice === -1) {
      throw new Error(`Entrega inexistente para atualização: ${entregaAtualizada.id}`);
    }
    const atualizada: Entrega = { ...entregaAtualizada, dataAtualizacao: new Date().toISOString() };
    this.entregas[indice] = atualizada;
    return atualizada;
  }
}

interface LinhaEntrega {
  id: string;
  parceiraId: string;
  mesReferencia: string;
  formato: Entrega["formato"];
  estado: Entrega["estado"];
  dataEntrega: string;
  materialEnviado: string | null;
  dataCriacao: Date;
  dataAtualizacao: Date;
  dataArquivamento: Date | null;
}

function paraEntrega(linha: LinhaEntrega): Entrega {
  return {
    id: linha.id,
    parceiraId: linha.parceiraId,
    mesReferencia: linha.mesReferencia,
    formato: linha.formato,
    estado: linha.estado,
    dataEntrega: linha.dataEntrega,
    materialEnviado: linha.materialEnviado,
    dataCriacao: linha.dataCriacao.toISOString(),
    dataAtualizacao: linha.dataAtualizacao.toISOString(),
    dataArquivamento: linha.dataArquivamento ? linha.dataArquivamento.toISOString() : null,
  };
}

const SELECT_COLUNAS = `
  id, parceira_id AS "parceiraId", mes_referencia AS "mesReferencia", formato, estado,
  data_entrega AS "dataEntrega", material_enviado AS "materialEnviado",
  data_criacao AS "dataCriacao", data_atualizacao AS "dataAtualizacao",
  data_arquivamento AS "dataArquivamento"
`;

/** Fase 2 do Plano Mestre (ADR-015): mesma interface pública da versão em memória. */
export class EntregaRepositorioPostgres {
  constructor(private readonly db: Pool) {}

  async listarTodas(): Promise<Entrega[]> {
    const resultado = await this.db.query<LinhaEntrega>(`SELECT ${SELECT_COLUNAS} FROM entregas`);
    return resultado.rows.map(paraEntrega);
  }

  async listarPorParceira(parceiraId: string): Promise<Entrega[]> {
    const resultado = await this.db.query<LinhaEntrega>(
      `SELECT ${SELECT_COLUNAS} FROM entregas WHERE parceira_id = $1`,
      [parceiraId],
    );
    return resultado.rows.map(paraEntrega);
  }

  async listarPorParceiraECompetencia(parceiraId: string, mesReferencia: string): Promise<Entrega[]> {
    const resultado = await this.db.query<LinhaEntrega>(
      `SELECT ${SELECT_COLUNAS} FROM entregas WHERE parceira_id = $1 AND mes_referencia = $2`,
      [parceiraId, mesReferencia],
    );
    return resultado.rows.map(paraEntrega);
  }

  async buscarPorId(id: string): Promise<Entrega | null> {
    const resultado = await this.db.query<LinhaEntrega>(`SELECT ${SELECT_COLUNAS} FROM entregas WHERE id = $1`, [id]);
    return resultado.rows[0] ? paraEntrega(resultado.rows[0]) : null;
  }

  async criar(entrega: Entrega): Promise<Entrega> {
    const resultado = await this.db.query<LinhaEntrega>(
      `INSERT INTO entregas
         (id, parceira_id, mes_referencia, formato, estado, data_entrega, material_enviado, data_criacao, data_atualizacao, data_arquivamento)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING ${SELECT_COLUNAS}`,
      [
        entrega.id,
        entrega.parceiraId,
        entrega.mesReferencia,
        entrega.formato,
        entrega.estado,
        entrega.dataEntrega,
        entrega.materialEnviado,
        entrega.dataCriacao,
        entrega.dataAtualizacao,
        entrega.dataArquivamento,
      ],
    );
    return paraEntrega(resultado.rows[0]);
  }

  /** `data_atualizacao` sempre carimbada com `now()` no banco — mesma disciplina da versão em memória. */
  async atualizar(entregaAtualizada: Entrega): Promise<Entrega> {
    const resultado = await this.db.query<LinhaEntrega>(
      `UPDATE entregas SET
         estado = $2, material_enviado = $3, data_arquivamento = $4, data_atualizacao = now()
       WHERE id = $1
       RETURNING ${SELECT_COLUNAS}`,
      [entregaAtualizada.id, entregaAtualizada.estado, entregaAtualizada.materialEnviado, entregaAtualizada.dataArquivamento],
    );
    if (!resultado.rows[0]) {
      throw new Error(`Entrega inexistente para atualização: ${entregaAtualizada.id}`);
    }
    return paraEntrega(resultado.rows[0]);
  }
}

export { EntregaRepositorioEmMemoria };
export const entregaRepositorio = new EntregaRepositorioPostgres(pool);
