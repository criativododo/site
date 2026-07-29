import type { Pool } from "pg";
import { pool } from "../../config/database.js";
import type { Parceira } from "./parceira.types.js";

/** Armazenamento em memória — mantido só para fixtures isoladas de teste unitário. */
class ParceiraRepositorioEmMemoria {
  private parceiras: Parceira[];

  constructor(parceiras: Parceira[] = []) {
    this.parceiras = parceiras;
  }

  async listarTodas(): Promise<Parceira[]> {
    return this.parceiras;
  }

  async buscarPorId(id: string): Promise<Parceira | null> {
    return this.parceiras.find((parceira) => parceira.id === id) ?? null;
  }

  async criar(parceira: Parceira): Promise<Parceira> {
    this.parceiras.push(parceira);
    return parceira;
  }

  async atualizar(parceiraAtualizada: Parceira): Promise<Parceira> {
    const indice = this.parceiras.findIndex((parceira) => parceira.id === parceiraAtualizada.id);
    if (indice === -1) {
      throw new Error(`Parceira inexistente para atualização: ${parceiraAtualizada.id}`);
    }
    this.parceiras[indice] = parceiraAtualizada;
    return parceiraAtualizada;
  }
}

interface LinhaParceira {
  id: string;
  chave: string;
  nome: string;
  email: string;
  cnpj: string;
  pix: string;
  status: Parceira["status"];
  condicaoComercial: Parceira["condicaoComercial"];
  dataCriacao: Date;
}

function paraParceira(linha: LinhaParceira): Parceira {
  return {
    id: linha.id,
    chave: linha.chave,
    nome: linha.nome,
    email: linha.email,
    cnpj: linha.cnpj,
    pix: linha.pix,
    status: linha.status,
    condicaoComercial: linha.condicaoComercial,
    dataCriacao: linha.dataCriacao.toISOString(),
  };
}

const SELECT_COLUNAS = `
  id, chave, nome, email, cnpj, pix, status,
  condicao_comercial AS "condicaoComercial", data_criacao AS "dataCriacao"
`;

/** Fase 2 do Plano Mestre (ADR-015): mesma interface pública da versão em memória. */
export class ParceiraRepositorioPostgres {
  constructor(private readonly db: Pool) {}

  async listarTodas(): Promise<Parceira[]> {
    const resultado = await this.db.query<LinhaParceira>(`SELECT ${SELECT_COLUNAS} FROM parceiras`);
    return resultado.rows.map(paraParceira);
  }

  async buscarPorId(id: string): Promise<Parceira | null> {
    const resultado = await this.db.query<LinhaParceira>(`SELECT ${SELECT_COLUNAS} FROM parceiras WHERE id = $1`, [
      id,
    ]);
    return resultado.rows[0] ? paraParceira(resultado.rows[0]) : null;
  }

  async criar(parceira: Parceira): Promise<Parceira> {
    const resultado = await this.db.query<LinhaParceira>(
      `INSERT INTO parceiras (id, chave, nome, email, cnpj, pix, status, condicao_comercial, data_criacao)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING ${SELECT_COLUNAS}`,
      [
        parceira.id,
        parceira.chave,
        parceira.nome,
        parceira.email,
        parceira.cnpj,
        parceira.pix,
        parceira.status,
        parceira.condicaoComercial,
        parceira.dataCriacao,
      ],
    );
    return paraParceira(resultado.rows[0]);
  }

  async atualizar(parceiraAtualizada: Parceira): Promise<Parceira> {
    const resultado = await this.db.query<LinhaParceira>(
      `UPDATE parceiras SET
         chave = $2, nome = $3, email = $4, cnpj = $5, pix = $6, status = $7, condicao_comercial = $8
       WHERE id = $1
       RETURNING ${SELECT_COLUNAS}`,
      [
        parceiraAtualizada.id,
        parceiraAtualizada.chave,
        parceiraAtualizada.nome,
        parceiraAtualizada.email,
        parceiraAtualizada.cnpj,
        parceiraAtualizada.pix,
        parceiraAtualizada.status,
        parceiraAtualizada.condicaoComercial,
      ],
    );
    if (!resultado.rows[0]) {
      throw new Error(`Parceira inexistente para atualização: ${parceiraAtualizada.id}`);
    }
    return paraParceira(resultado.rows[0]);
  }
}

export { ParceiraRepositorioEmMemoria };
export const parceiraRepositorio = new ParceiraRepositorioPostgres(pool);
