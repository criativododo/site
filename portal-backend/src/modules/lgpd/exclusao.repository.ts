import type { Pool } from "pg";
import { pool } from "../../config/database.js";
import type { SolicitacaoExclusao, StatusSolicitacaoExclusao } from "./exclusao.types.js";

/** Armazenamento em memória — mantido só para fixtures isoladas de teste unitário. */
class ExclusaoRepositorioEmMemoria {
  private solicitacoes: SolicitacaoExclusao[];

  constructor(solicitacoes: SolicitacaoExclusao[] = []) {
    this.solicitacoes = solicitacoes;
  }

  async criar(solicitacao: SolicitacaoExclusao): Promise<SolicitacaoExclusao> {
    this.solicitacoes.push(solicitacao);
    return solicitacao;
  }

  async listarPorStatus(status: StatusSolicitacaoExclusao): Promise<SolicitacaoExclusao[]> {
    return this.solicitacoes.filter((solicitacao) => solicitacao.status === status);
  }

  async buscarPorId(id: string): Promise<SolicitacaoExclusao | null> {
    return this.solicitacoes.find((solicitacao) => solicitacao.id === id) ?? null;
  }

  async atualizar(solicitacaoAtualizada: SolicitacaoExclusao): Promise<SolicitacaoExclusao> {
    const indice = this.solicitacoes.findIndex((solicitacao) => solicitacao.id === solicitacaoAtualizada.id);
    if (indice === -1) {
      throw new Error(`Solicitação inexistente para atualização: ${solicitacaoAtualizada.id}`);
    }
    this.solicitacoes[indice] = solicitacaoAtualizada;
    return solicitacaoAtualizada;
  }
}

interface LinhaExclusao {
  id: string;
  parceiraId: string;
  dataPedido: string;
  status: StatusSolicitacaoExclusao;
  responsavelAnalise: string | null;
  fundamentoJuridico: string | null;
  dataDecisao: string | null;
}

function paraSolicitacao(linha: LinhaExclusao): SolicitacaoExclusao {
  return {
    id: linha.id,
    parceiraId: linha.parceiraId,
    dataPedido: linha.dataPedido,
    status: linha.status,
    responsavelAnalise: linha.responsavelAnalise,
    fundamentoJuridico: linha.fundamentoJuridico,
    dataDecisao: linha.dataDecisao,
  };
}

const SELECT_COLUNAS = `
  id, parceira_id AS "parceiraId", data_pedido AS "dataPedido", status,
  responsavel_analise AS "responsavelAnalise", fundamento_juridico AS "fundamentoJuridico",
  data_decisao AS "dataDecisao"
`;

/** Fase 2 do Plano Mestre (ADR-015): mesma interface pública da versão em memória. */
export class ExclusaoRepositorioPostgres {
  constructor(private readonly db: Pool) {}

  async criar(solicitacao: SolicitacaoExclusao): Promise<SolicitacaoExclusao> {
    const resultado = await this.db.query<LinhaExclusao>(
      `INSERT INTO solicitacoes_exclusao
         (id, parceira_id, data_pedido, status, responsavel_analise, fundamento_juridico, data_decisao)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${SELECT_COLUNAS}`,
      [
        solicitacao.id,
        solicitacao.parceiraId,
        solicitacao.dataPedido,
        solicitacao.status,
        solicitacao.responsavelAnalise,
        solicitacao.fundamentoJuridico,
        solicitacao.dataDecisao,
      ],
    );
    return paraSolicitacao(resultado.rows[0]);
  }

  async listarPorStatus(status: StatusSolicitacaoExclusao): Promise<SolicitacaoExclusao[]> {
    const resultado = await this.db.query<LinhaExclusao>(
      `SELECT ${SELECT_COLUNAS} FROM solicitacoes_exclusao WHERE status = $1`,
      [status],
    );
    return resultado.rows.map(paraSolicitacao);
  }

  async buscarPorId(id: string): Promise<SolicitacaoExclusao | null> {
    const resultado = await this.db.query<LinhaExclusao>(
      `SELECT ${SELECT_COLUNAS} FROM solicitacoes_exclusao WHERE id = $1`,
      [id],
    );
    return resultado.rows[0] ? paraSolicitacao(resultado.rows[0]) : null;
  }

  async atualizar(solicitacaoAtualizada: SolicitacaoExclusao): Promise<SolicitacaoExclusao> {
    const resultado = await this.db.query<LinhaExclusao>(
      `UPDATE solicitacoes_exclusao SET
         status = $2, responsavel_analise = $3, fundamento_juridico = $4, data_decisao = $5
       WHERE id = $1
       RETURNING ${SELECT_COLUNAS}`,
      [
        solicitacaoAtualizada.id,
        solicitacaoAtualizada.status,
        solicitacaoAtualizada.responsavelAnalise,
        solicitacaoAtualizada.fundamentoJuridico,
        solicitacaoAtualizada.dataDecisao,
      ],
    );
    if (!resultado.rows[0]) {
      throw new Error(`Solicitação inexistente para atualização: ${solicitacaoAtualizada.id}`);
    }
    return paraSolicitacao(resultado.rows[0]);
  }
}

export { ExclusaoRepositorioEmMemoria };
export const exclusaoRepositorio = new ExclusaoRepositorioPostgres(pool);
