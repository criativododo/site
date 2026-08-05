import { randomUUID } from "node:crypto";
import { parceiraRepositorio } from "../parceira/parceira.repository.js";
import { agruparModelosPorCategoria, MODELOS_MENSAGEM, VARIAVEIS_SUPORTADAS } from "./comunicacao.modelos.js";
import { mensagemPreparadaRepositorio } from "./comunicacao.repository.js";
import type { CategoriaMensagemPreparada, MensagemPreparada } from "./comunicacao.types.js";

/** UC: referência exibida na tela Comunicação — modelos agrupados por categoria + variáveis suportadas. */
export function obterReferenciaModelos() {
  return {
    modelos: MODELOS_MENSAGEM,
    modelosPorCategoria: agruparModelosPorCategoria(),
    variaveis: VARIAVEIS_SUPORTADAS,
  };
}

export interface DadosPrepararMensagem {
  parceiraId: string;
  categoria: CategoriaMensagemPreparada;
  /** `null` para mensagem personalizada — a spec desta tela exige "modelo ou personalizada", nunca os dois. */
  modeloId: string | null;
  /**
   * Texto já com as variáveis substituídas — a resolução acontece no cliente
   * (`pages/CentralInfluenciadora.tsx`), que já tem o contexto da Ficha carregado. O backend só
   * persiste o histórico, nunca recalcula o texto (RN desta tela: o Portal não decide o
   * conteúdo, só registra o que foi preparado).
   */
  corpoFinal: string;
  preparadoPor: string;
}

export type ResultadoPrepararMensagem =
  | { ok: true; mensagem: MensagemPreparada }
  | { ok: false; motivo: "PARCEIRA_NAO_ENCONTRADA" };

/**
 * UC principal da tela Comunicação: registra no histórico uma mensagem preparada para abertura
 * no WhatsApp. Busca `parceira.nome` pelo id em vez de confiar no que o cliente envia — snapshot
 * denormalizado (mesmo padrão de `ColaboracaoMensal.condicaoComercial`), mas a fonte é sempre o
 * agregado real, nunca o corpo da requisição.
 */
export async function prepararMensagem(dados: DadosPrepararMensagem): Promise<ResultadoPrepararMensagem> {
  const parceira = await parceiraRepositorio.buscarPorId(dados.parceiraId);
  if (!parceira) {
    return { ok: false, motivo: "PARCEIRA_NAO_ENCONTRADA" };
  }

  const mensagem: MensagemPreparada = {
    id: randomUUID(),
    parceiraId: parceira.id,
    parceiraNome: parceira.nome,
    categoria: dados.categoria,
    modeloId: dados.modeloId,
    corpoFinal: dados.corpoFinal,
    preparadoPor: dados.preparadoPor,
    preparadoEm: new Date().toISOString(),
  };

  const salva = await mensagemPreparadaRepositorio.criar(mensagem);
  return { ok: true, mensagem: salva };
}

/** "Mensagens recentes" da tela Comunicação — histórico geral, todas as Parceiras. */
export async function obterHistoricoGeral(limite = 20): Promise<MensagemPreparada[]> {
  return mensagemPreparadaRepositorio.listarTodas(limite);
}

/** Histórico contextual dentro da Ficha de uma Parceira. */
export async function obterHistoricoPorParceira(parceiraId: string, limite = 10): Promise<MensagemPreparada[]> {
  return mensagemPreparadaRepositorio.listarPorParceira(parceiraId, limite);
}
