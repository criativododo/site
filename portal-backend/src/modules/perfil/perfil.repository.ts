import type { Pool } from "pg";
import { pool } from "../../config/database.js";
import { env } from "../../config/env.js";
import type { PerfilParceira } from "./perfil.types.js";

/**
 * Seed de desenvolvimento/QA — usado pela versão em memória (fixtures de teste) e
 * reaproveitado pelo script de seed do Postgres (Fase 2, `scripts/seed.ts`).
 */
export function seedInicialPerfis(): PerfilParceira[] {
  if (!env.parceiraSeed.id) {
    return [];
  }

  return [
    {
      parceiraId: env.parceiraSeed.id,
      pix: "000.000.000-00",
      email: env.parceiraSeed.email || "parceira-seed@dodo.dev",
      endereco: null,
    },
  ];
}

/** Exportada (não só a instância) para permitir teste com fixtures isoladas. */
class PerfilRepositorioEmMemoria {
  private perfis: PerfilParceira[];

  constructor(perfis: PerfilParceira[] = seedInicialPerfis()) {
    this.perfis = perfis;
  }

  async buscarPorParceira(parceiraId: string): Promise<PerfilParceira | null> {
    return this.perfis.find((perfil) => perfil.parceiraId === parceiraId) ?? null;
  }

  async atualizar(perfilAtualizado: PerfilParceira): Promise<PerfilParceira> {
    const indice = this.perfis.findIndex((perfil) => perfil.parceiraId === perfilAtualizado.parceiraId);
    if (indice === -1) {
      this.perfis.push(perfilAtualizado);
      return perfilAtualizado;
    }
    this.perfis[indice] = perfilAtualizado;
    return perfilAtualizado;
  }
}

interface LinhaPerfil {
  parceiraId: string;
  pix: string;
  email: string;
  endereco: PerfilParceira["endereco"];
}

function paraPerfil(linha: LinhaPerfil): PerfilParceira {
  return {
    parceiraId: linha.parceiraId,
    pix: linha.pix,
    email: linha.email,
    endereco: linha.endereco,
  };
}

const SELECT_COLUNAS = `parceira_id AS "parceiraId", pix, email, endereco`;

/** Fase 2 do Plano Mestre (ADR-015): mesma interface pública da versão em memória. */
export class PerfilRepositorioPostgres {
  constructor(private readonly db: Pool) {}

  async buscarPorParceira(parceiraId: string): Promise<PerfilParceira | null> {
    const resultado = await this.db.query<LinhaPerfil>(
      `SELECT ${SELECT_COLUNAS} FROM perfis_parceira WHERE parceira_id = $1`,
      [parceiraId],
    );
    return resultado.rows[0] ? paraPerfil(resultado.rows[0]) : null;
  }

  /** Upsert — mesma semântica da versão em memória (cria se não existir, senão substitui). */
  async atualizar(perfilAtualizado: PerfilParceira): Promise<PerfilParceira> {
    const resultado = await this.db.query<LinhaPerfil>(
      `INSERT INTO perfis_parceira (parceira_id, pix, email, endereco)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (parceira_id) DO UPDATE SET
         pix = EXCLUDED.pix, email = EXCLUDED.email, endereco = EXCLUDED.endereco
       RETURNING ${SELECT_COLUNAS}`,
      [perfilAtualizado.parceiraId, perfilAtualizado.pix, perfilAtualizado.email, perfilAtualizado.endereco],
    );
    return paraPerfil(resultado.rows[0]);
  }
}

export { PerfilRepositorioEmMemoria };
export const perfilRepositorio = new PerfilRepositorioPostgres(pool);
