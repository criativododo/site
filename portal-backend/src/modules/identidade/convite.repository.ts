import type { Pool } from "pg";
import { pool } from "../../config/database.js";
import type { ConviteCadastro } from "./convite.types.js";

/** Armazenamento em memória — mantido só para fixtures isoladas de teste unitário. */
class ConviteRepositorioEmMemoria {
  private porToken = new Map<string, ConviteCadastro>();

  async criar(convite: ConviteCadastro): Promise<ConviteCadastro> {
    this.porToken.set(convite.token, convite);
    return convite;
  }

  async buscarPorToken(token: string): Promise<ConviteCadastro | null> {
    return this.porToken.get(token) ?? null;
  }

  async salvar(convite: ConviteCadastro): Promise<ConviteCadastro> {
    this.porToken.set(convite.token, convite);
    return convite;
  }

  async listarTodos(): Promise<ConviteCadastro[]> {
    return [...this.porToken.values()].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  }
}

interface LinhaConvite {
  token: string;
  criadoPor: string;
  criadoEm: Date;
  usadoEm: Date | null;
  usadoPorSub: string | null;
}

function paraConvite(linha: LinhaConvite): ConviteCadastro {
  return {
    token: linha.token,
    criadoPor: linha.criadoPor,
    criadoEm: linha.criadoEm.toISOString(),
    usadoEm: linha.usadoEm ? linha.usadoEm.toISOString() : null,
    usadoPorSub: linha.usadoPorSub,
  };
}

const SELECT_COLUNAS = `
  token, criado_por AS "criadoPor", criado_em AS "criadoEm",
  usado_em AS "usadoEm", usado_por_sub AS "usadoPorSub"
`;

/** Fase 2 do Plano Mestre (ADR-015): mesma interface pública da versão em memória. */
export class ConviteRepositorioPostgres {
  constructor(private readonly db: Pool) {}

  private async upsert(convite: ConviteCadastro): Promise<ConviteCadastro> {
    const resultado = await this.db.query<LinhaConvite>(
      `INSERT INTO convites_cadastro (token, criado_por, criado_em, usado_em, usado_por_sub)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (token) DO UPDATE SET
         criado_por = EXCLUDED.criado_por,
         criado_em = EXCLUDED.criado_em,
         usado_em = EXCLUDED.usado_em,
         usado_por_sub = EXCLUDED.usado_por_sub
       RETURNING ${SELECT_COLUNAS}`,
      [convite.token, convite.criadoPor, convite.criadoEm, convite.usadoEm, convite.usadoPorSub],
    );
    return paraConvite(resultado.rows[0]);
  }

  async criar(convite: ConviteCadastro): Promise<ConviteCadastro> {
    return this.upsert(convite);
  }

  async salvar(convite: ConviteCadastro): Promise<ConviteCadastro> {
    return this.upsert(convite);
  }

  async buscarPorToken(token: string): Promise<ConviteCadastro | null> {
    const resultado = await this.db.query<LinhaConvite>(
      `SELECT ${SELECT_COLUNAS} FROM convites_cadastro WHERE token = $1`,
      [token],
    );
    return resultado.rows[0] ? paraConvite(resultado.rows[0]) : null;
  }

  async listarTodos(): Promise<ConviteCadastro[]> {
    const resultado = await this.db.query<LinhaConvite>(
      `SELECT ${SELECT_COLUNAS} FROM convites_cadastro ORDER BY criado_em DESC`,
    );
    return resultado.rows.map(paraConvite);
  }
}

export { ConviteRepositorioEmMemoria };
export const conviteRepositorio = new ConviteRepositorioPostgres(pool);
