import type { Pool } from "pg";
import { pool } from "../../config/database.js";
import type { EstadoConta, Identidade } from "./identidade.types.js";

/**
 * Armazenamento em memória — mantido só para fixtures isoladas de teste unitário
 * (`*.service.test.ts` instancia esta classe diretamente). O singleton exportado no fim
 * deste arquivo usa `IdentidadeRepositorioPostgres` (Fase 2 do Plano Mestre, ADR-015).
 */
class IdentidadeRepositorioEmMemoria {
  private porSub = new Map<string, Identidade>();

  async buscarPorSub(subProvider: string): Promise<Identidade | null> {
    return this.porSub.get(subProvider) ?? null;
  }

  async buscarPorEmail(email: string): Promise<Identidade | null> {
    const emailNormalizado = email.trim().toLowerCase();
    for (const identidade of this.porSub.values()) {
      if (identidade.emailPerfil.toLowerCase() === emailNormalizado) {
        return identidade;
      }
    }
    return null;
  }

  async salvar(identidade: Identidade): Promise<Identidade> {
    this.porSub.set(identidade.subProvider, identidade);
    return identidade;
  }

  /** UC-035 (Feature 5.3, Moderação): lista contas por estado, para a fila de aprovação do Administrador. */
  async listarPorEstado(estadoConta: Identidade["estadoConta"]): Promise<Identidade[]> {
    return [...this.porSub.values()].filter((identidade) => identidade.estadoConta === estadoConta);
  }
}

interface LinhaIdentidade {
  subProvider: string;
  emailPerfil: string;
  nomeCompleto: string;
  papelAtor: Identidade["papelAtor"];
  estadoConta: EstadoConta;
  origemAcesso: Identidade["origemAcesso"];
  parceiraId: string | null;
  dataCriacao: Date;
  ultimoAcesso: Date;
}

function paraIdentidade(linha: LinhaIdentidade): Identidade {
  return {
    subProvider: linha.subProvider,
    emailPerfil: linha.emailPerfil,
    nomeCompleto: linha.nomeCompleto,
    papelAtor: linha.papelAtor,
    estadoConta: linha.estadoConta,
    origemAcesso: linha.origemAcesso,
    parceiraId: linha.parceiraId,
    dataCriacao: linha.dataCriacao.toISOString(),
    ultimoAcesso: linha.ultimoAcesso.toISOString(),
  };
}

const SELECT_COLUNAS = `
  sub_provider AS "subProvider", email_perfil AS "emailPerfil", nome_completo AS "nomeCompleto",
  papel_ator AS "papelAtor", estado_conta AS "estadoConta", origem_acesso AS "origemAcesso",
  parceira_id AS "parceiraId", data_criacao AS "dataCriacao", ultimo_acesso AS "ultimoAcesso"
`;

/** Fase 2 do Plano Mestre (ADR-015): mesma interface pública da versão em memória. */
export class IdentidadeRepositorioPostgres {
  constructor(private readonly db: Pool) {}

  async buscarPorSub(subProvider: string): Promise<Identidade | null> {
    const resultado = await this.db.query<LinhaIdentidade>(
      `SELECT ${SELECT_COLUNAS} FROM identidades WHERE sub_provider = $1`,
      [subProvider],
    );
    return resultado.rows[0] ? paraIdentidade(resultado.rows[0]) : null;
  }

  async buscarPorEmail(email: string): Promise<Identidade | null> {
    const resultado = await this.db.query<LinhaIdentidade>(
      `SELECT ${SELECT_COLUNAS} FROM identidades WHERE lower(email_perfil) = lower($1)`,
      [email.trim()],
    );
    return resultado.rows[0] ? paraIdentidade(resultado.rows[0]) : null;
  }

  async salvar(identidade: Identidade): Promise<Identidade> {
    const resultado = await this.db.query<LinhaIdentidade>(
      `INSERT INTO identidades
         (sub_provider, email_perfil, nome_completo, papel_ator, estado_conta, origem_acesso, parceira_id, data_criacao, ultimo_acesso)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (sub_provider) DO UPDATE SET
         email_perfil = EXCLUDED.email_perfil,
         nome_completo = EXCLUDED.nome_completo,
         papel_ator = EXCLUDED.papel_ator,
         estado_conta = EXCLUDED.estado_conta,
         origem_acesso = EXCLUDED.origem_acesso,
         parceira_id = EXCLUDED.parceira_id,
         ultimo_acesso = EXCLUDED.ultimo_acesso
       RETURNING ${SELECT_COLUNAS}`,
      [
        identidade.subProvider,
        identidade.emailPerfil,
        identidade.nomeCompleto,
        identidade.papelAtor,
        identidade.estadoConta,
        identidade.origemAcesso,
        identidade.parceiraId,
        identidade.dataCriacao,
        identidade.ultimoAcesso,
      ],
    );
    return paraIdentidade(resultado.rows[0]);
  }

  async listarPorEstado(estadoConta: EstadoConta): Promise<Identidade[]> {
    const resultado = await this.db.query<LinhaIdentidade>(
      `SELECT ${SELECT_COLUNAS} FROM identidades WHERE estado_conta = $1`,
      [estadoConta],
    );
    return resultado.rows.map(paraIdentidade);
  }
}

export { IdentidadeRepositorioEmMemoria };
export const identidadeRepositorio = new IdentidadeRepositorioPostgres(pool);
