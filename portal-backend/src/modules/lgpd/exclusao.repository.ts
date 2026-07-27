import type { SolicitacaoExclusao, StatusSolicitacaoExclusao } from "./exclusao.types.js";

/** Armazenamento em memória — mesma decisão de placeholder dos demais repositórios do Portal. */
export class ExclusaoRepositorioEmMemoria {
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

export const exclusaoRepositorio = new ExclusaoRepositorioEmMemoria();
