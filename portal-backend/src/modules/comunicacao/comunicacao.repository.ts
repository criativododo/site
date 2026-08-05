import type { Pool } from "pg";
import { pool } from "../../config/database.js";
import type { MensagemPreparada } from "./comunicacao.types.js";

/** Armazenamento em memória — mantido só para fixtures isoladas de teste unitário. */
class MensagemPreparadaRepositorioEmMemoria {
  private mensagens: MensagemPreparada[];

  constructor(mensagens: MensagemPreparada[] = []) {
    this.mensagens = mensagens;
  }

  async criar(mensagem: MensagemPreparada): Promise<MensagemPreparada> {
    const copia = { ...mensagem };
    this.mensagens.push(copia);
    return { ...copia };
  }

  /** Mais recente primeiro — mesma ordenação da versão Postgres. */
  async listarTodas(limite = 20): Promise<MensagemPreparada[]> {
    return [...this.mensagens]
      .sort((a, b) => b.preparadoEm.localeCompare(a.preparadoEm))
      .slice(0, limite)
      .map((mensagem) => ({ ...mensagem }));
  }

  async listarPorParceira(parceiraId: string, limite = 10): Promise<MensagemPreparada[]> {
    return [...this.mensagens]
      .filter((mensagem) => mensagem.parceiraId === parceiraId)
      .sort((a, b) => b.preparadoEm.localeCompare(a.preparadoEm))
      .slice(0, limite)
      .map((mensagem) => ({ ...mensagem }));
  }
}

interface LinhaMensagemPreparada {
  id: string;
  parceiraId: string;
  parceiraNome: string;
  categoria: MensagemPreparada["categoria"];
  modeloId: string | null;
  corpoFinal: string;
  preparadoPor: string;
  preparadoEm: Date;
}

function paraMensagemPreparada(linha: LinhaMensagemPreparada): MensagemPreparada {
  return {
    id: linha.id,
    parceiraId: linha.parceiraId,
    parceiraNome: linha.parceiraNome,
    categoria: linha.categoria,
    modeloId: linha.modeloId,
    corpoFinal: linha.corpoFinal,
    preparadoPor: linha.preparadoPor,
    preparadoEm: linha.preparadoEm.toISOString(),
  };
}

const SELECT_COLUNAS = `
  id, parceira_id AS "parceiraId", parceira_nome AS "parceiraNome", categoria,
  modelo_id AS "modeloId", corpo_final AS "corpoFinal", preparado_por AS "preparadoPor",
  preparado_em AS "preparadoEm"
`;

export class MensagemPreparadaRepositorioPostgres {
  constructor(private readonly db: Pool) {}

  async criar(mensagem: MensagemPreparada): Promise<MensagemPreparada> {
    const resultado = await this.db.query<LinhaMensagemPreparada>(
      `INSERT INTO mensagens_preparadas
         (id, parceira_id, parceira_nome, categoria, modelo_id, corpo_final, preparado_por, preparado_em)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING ${SELECT_COLUNAS}`,
      [
        mensagem.id,
        mensagem.parceiraId,
        mensagem.parceiraNome,
        mensagem.categoria,
        mensagem.modeloId,
        mensagem.corpoFinal,
        mensagem.preparadoPor,
        mensagem.preparadoEm,
      ],
    );
    return paraMensagemPreparada(resultado.rows[0]);
  }

  async listarTodas(limite = 20): Promise<MensagemPreparada[]> {
    const resultado = await this.db.query<LinhaMensagemPreparada>(
      `SELECT ${SELECT_COLUNAS} FROM mensagens_preparadas ORDER BY preparado_em DESC LIMIT $1`,
      [limite],
    );
    return resultado.rows.map(paraMensagemPreparada);
  }

  async listarPorParceira(parceiraId: string, limite = 10): Promise<MensagemPreparada[]> {
    const resultado = await this.db.query<LinhaMensagemPreparada>(
      `SELECT ${SELECT_COLUNAS} FROM mensagens_preparadas
       WHERE parceira_id = $1 ORDER BY preparado_em DESC LIMIT $2`,
      [parceiraId, limite],
    );
    return resultado.rows.map(paraMensagemPreparada);
  }
}

export { MensagemPreparadaRepositorioEmMemoria };
export const mensagemPreparadaRepositorio = new MensagemPreparadaRepositorioPostgres(pool);
