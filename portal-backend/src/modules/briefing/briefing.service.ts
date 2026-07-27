import { randomUUID } from "node:crypto";
import { entregaRepositorio } from "../conteudo/entrega.repository.js";
import type { Entrega, EstadoEntrega } from "../conteudo/entrega.types.js";
import { briefingRepositorio } from "./briefing.repository.js";
import type { BlocoBriefing } from "./briefing.types.js";

/** Projeção administrativa: cada Bloco acompanhado da Entrega que ele orienta (se existir). */
export interface BriefingComVinculo extends BlocoBriefing {
  entregaId: string | null;
  estadoEntregaVinculada: EstadoEntrega | null;
}

/** Junção pela chave natural parceiraId × mesReferencia × formato — não existe FK física entre os dois agregados (ver entrega.types.ts). */
function encontrarEntregaVinculada(
  bloco: Pick<BlocoBriefing, "parceiraId" | "mesReferencia" | "formato">,
  entregas: Entrega[],
): Entrega | undefined {
  return entregas.find(
    (candidata) =>
      candidata.parceiraId === bloco.parceiraId &&
      candidata.mesReferencia === bloco.mesReferencia &&
      candidata.formato === bloco.formato,
  );
}

function comVinculo(bloco: BlocoBriefing, entrega: Entrega | undefined): BriefingComVinculo {
  return { ...bloco, entregaId: entrega?.id ?? null, estadoEntregaVinculada: entrega?.estado ?? null };
}

/**
 * Backoffice — leitura irrestrita de todos os Blocos, cada um já anotado com a Entrega
 * correspondente. A junção fica aqui, não na rota nem no repository, mesmo padrão de
 * dashboard.service.ts::obterIndicadoresAdministrativos.
 */
export async function listarBriefingsAdministrativos(): Promise<BriefingComVinculo[]> {
  const [blocos, entregas] = await Promise.all([briefingRepositorio.listarTodos(), entregaRepositorio.listarTodas()]);
  return blocos.map((bloco) => comVinculo(bloco, encontrarEntregaVinculada(bloco, entregas)));
}

/**
 * Backoffice — um único Bloco já com o vínculo resolvido. Usada por criar/editar para que a
 * resposta da API tenha sempre o mesmo formato de `listarBriefingsAdministrativos` (nunca o
 * `BlocoBriefing` cru, que faria a UI perder de vista a Entrega vinculada logo após salvar).
 */
export async function buscarBriefingComVinculoPorId(id: string): Promise<BriefingComVinculo | null> {
  const bloco = await briefingRepositorio.buscarPorId(id);
  if (!bloco) {
    return null;
  }
  const entregas = await entregaRepositorio.listarTodas();
  return comVinculo(bloco, encontrarEntregaVinculada(bloco, entregas));
}

export interface ConteudoBriefing {
  look: string;
  dataEntrega: string;
  dataPostagem: string;
  orientacao: string;
}

const REGEX_DATA = /^\d{4}-\d{2}-\d{2}$/;

type MotivoConteudoInvalido = "LOOK_OBRIGATORIO" | "ORIENTACAO_OBRIGATORIA" | "DATA_ENTREGA_INVALIDA" | "DATA_POSTAGEM_INVALIDA";

/** Validação pura de conteúdo (sem repositório) — reaproveitada por criação e edição. */
function validarConteudo(dados: ConteudoBriefing): { ok: true } | { ok: false; motivo: MotivoConteudoInvalido } {
  if (!dados.look.trim()) {
    return { ok: false, motivo: "LOOK_OBRIGATORIO" };
  }
  if (!dados.orientacao.trim()) {
    return { ok: false, motivo: "ORIENTACAO_OBRIGATORIA" };
  }
  if (!REGEX_DATA.test(dados.dataEntrega)) {
    return { ok: false, motivo: "DATA_ENTREGA_INVALIDA" };
  }
  if (!REGEX_DATA.test(dados.dataPostagem)) {
    return { ok: false, motivo: "DATA_POSTAGEM_INVALIDA" };
  }
  return { ok: true };
}

export interface DadosNovoBriefing extends ConteudoBriefing {
  entregaId: string;
}

export type MotivoRejeicaoNovoBriefing = MotivoConteudoInvalido | "ENTREGA_INEXISTENTE" | "BRIEFING_JA_EXISTE_PARA_ENTREGA";
export type ResultadoNovoBriefing =
  | { ok: true; briefing: BriefingComVinculo }
  | { ok: false; motivo: MotivoRejeicaoNovoBriefing };

/**
 * Criação sempre vinculada a uma Entrega existente (nunca a parceiraId/mesReferencia/formato
 * digitados à mão): a chave natural do Bloco nasce copiada da Entrega escolhida, eliminando por
 * construção o risco de um Briefing apontar para uma combinação sem Entrega correspondente.
 * Rejeita se já existir Bloco para essa mesma Entrega (unicidade por chave natural).
 */
export async function criarBriefingParaEntrega(dados: DadosNovoBriefing): Promise<ResultadoNovoBriefing> {
  const validacao = validarConteudo(dados);
  if (!validacao.ok) {
    return validacao;
  }

  const entrega = await entregaRepositorio.buscarPorId(dados.entregaId);
  if (!entrega) {
    return { ok: false, motivo: "ENTREGA_INEXISTENTE" };
  }

  const existente = await briefingRepositorio.buscarBloco(entrega.parceiraId, entrega.mesReferencia, entrega.formato);
  if (existente) {
    return { ok: false, motivo: "BRIEFING_JA_EXISTE_PARA_ENTREGA" };
  }

  const agora = new Date().toISOString();
  const briefing: BlocoBriefing = {
    id: randomUUID(),
    parceiraId: entrega.parceiraId,
    mesReferencia: entrega.mesReferencia,
    formato: entrega.formato,
    look: dados.look,
    dataEntrega: dados.dataEntrega,
    dataPostagem: dados.dataPostagem,
    orientacao: dados.orientacao,
    dataCriacao: agora,
    dataAtualizacao: agora,
  };

  const criado = await briefingRepositorio.criar(briefing);
  return { ok: true, briefing: comVinculo(criado, entrega) };
}

export type CamposEditaveisBriefing = ConteudoBriefing;
export type MotivoRejeicaoEdicaoBriefing = MotivoConteudoInvalido | "NAO_ENCONTRADO";
export type ResultadoEdicaoBriefing =
  | { ok: true; briefing: BriefingComVinculo }
  | { ok: false; motivo: MotivoRejeicaoEdicaoBriefing };

/** UC administrativo: edita conteúdo do Bloco. Nunca reatribui parceiraId/mesReferencia/formato (chave natural imutável). */
export async function editarBriefing(
  id: string,
  campos: Partial<CamposEditaveisBriefing>,
): Promise<ResultadoEdicaoBriefing> {
  const existente = await briefingRepositorio.buscarPorId(id);
  if (!existente) {
    return { ok: false, motivo: "NAO_ENCONTRADO" };
  }

  const candidato: BlocoBriefing = { ...existente, ...campos };
  const validacao = validarConteudo(candidato);
  if (!validacao.ok) {
    return validacao;
  }

  const atualizado = await briefingRepositorio.atualizar(candidato);
  const entregas = await entregaRepositorio.listarTodas();
  return { ok: true, briefing: comVinculo(atualizado, encontrarEntregaVinculada(atualizado, entregas)) };
}

export type MotivoRejeicaoRemocaoBriefing = "NAO_ENCONTRADO" | "ENTREGA_EM_ANDAMENTO";
export type ResultadoRemocaoBriefing = { ok: true } | { ok: false; motivo: MotivoRejeicaoRemocaoBriefing };

/**
 * Remoção só permitida enquanto a Entrega correspondente ainda não saiu de
 * `AGUARDANDO_MATERIAL` — depois disso a Parceira pode já ter produzido o material com base
 * neste Briefing (mesma disciplina de conteudo.service.ts::enviarMaterial: nunca perder o
 * rastro do que orientou uma Entrega já em revisão/aprovada/publicada). Sem Entrega
 * correspondente (Bloco órfão), a remoção é sempre permitida.
 */
export async function removerBriefing(id: string): Promise<ResultadoRemocaoBriefing> {
  const existente = await briefingRepositorio.buscarPorId(id);
  if (!existente) {
    return { ok: false, motivo: "NAO_ENCONTRADO" };
  }

  const entregasDaCompetencia = await entregaRepositorio.listarPorParceiraECompetencia(
    existente.parceiraId,
    existente.mesReferencia,
  );
  const entregaCorrespondente = entregasDaCompetencia.find((entrega) => entrega.formato === existente.formato);

  if (entregaCorrespondente && entregaCorrespondente.estado !== "AGUARDANDO_MATERIAL") {
    return { ok: false, motivo: "ENTREGA_EM_ANDAMENTO" };
  }

  await briefingRepositorio.remover(id);
  return { ok: true };
}
