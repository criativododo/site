/**
 * ADR-010 ponto 7 (processo de expurgo): a solicitação de exclusão nunca apaga dado
 * automaticamente — só registra o pedido para avaliação do Administrador (existência de
 * obrigação legal de retenção, art. 16 LGPD, decidida caso a caso).
 */
export type StatusSolicitacaoExclusao = "PENDENTE" | "APROVADA" | "NEGADA";

export interface SolicitacaoExclusao {
  id: string;
  parceiraId: string;
  dataPedido: string;
  status: StatusSolicitacaoExclusao;
  responsavelAnalise: string | null;
  fundamentoJuridico: string | null;
  dataDecisao: string | null;
}
