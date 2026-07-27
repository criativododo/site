import { randomUUID } from "node:crypto";
import { briefingRepositorio } from "../briefing/briefing.repository.js";
import type { BlocoBriefing } from "../briefing/briefing.types.js";
import { parceiraRepositorio } from "../parceira/parceira.repository.js";
import { competenciaCorrente } from "./competencia.js";
import { entregaRepositorio } from "./entrega.repository.js";
import type { Entrega, FormatoEntrega, ItemDePendencia } from "./entrega.types.js";
import { armazenamentoDeMaterial } from "./material.storage.js";

/** UC-027.01: projeta Entregas em ItemDePendencia, em ordem cronológica por data de entrega. */
export function projetarPendencias(entregas: Entrega[]): ItemDePendencia[] {
  return entregas
    .map((entrega) => ({
      id: entrega.id,
      mesReferencia: entrega.mesReferencia,
      formato: entrega.formato,
      estado: entrega.estado,
      dataEntrega: entrega.dataEntrega,
    }))
    .sort((a, b) => a.dataEntrega.localeCompare(b.dataEntrega));
}

/**
 * Fachada do Portal de Conteúdo (SPEC-027 §6.3, UC-027.01): consulta as Entregas da
 * competência corrente da Parceira. CB-02: sem Entregas na competência → lista vazia, não é
 * erro.
 */
export async function listarPendencias(parceiraId: string): Promise<{
  mesReferencia: string;
  itens: ItemDePendencia[];
}> {
  const mesReferencia = competenciaCorrente();
  const entregas = await entregaRepositorio.listarPorParceiraECompetencia(parceiraId, mesReferencia);
  return { mesReferencia, itens: projetarPendencias(entregas) };
}

/**
 * UC-027.02: abre o bloco de briefing correspondente a uma Entrega (RN-03). PC-02 (Entrega
 * não pertence à Parceira) e "Entrega inexistente" recebem o mesmo retorno `null` — a rota
 * nunca deve revelar se o id pertence a outra Parceira (mesma disciplina de isolamento de
 * `parceiraDaSessao`).
 */
export async function obterBriefingDaEntrega(
  parceiraId: string,
  entregaId: string,
): Promise<{ entrega: ItemDePendencia; briefing: BlocoBriefing | null } | null> {
  const entrega = await entregaRepositorio.buscarPorId(entregaId);
  if (!entrega || entrega.parceiraId !== parceiraId) {
    return null;
  }

  const briefing = await briefingRepositorio.buscarBloco(
    entrega.parceiraId,
    entrega.mesReferencia,
    entrega.formato,
  );

  return { entrega: projetarPendencias([entrega])[0], briefing };
}

export type ResultadoEnvioMaterial =
  | { ok: true; entrega: ItemDePendencia }
  | { ok: false; motivo: "NAO_ENCONTRADA" | "ESTADO_INVALIDO" };

/**
 * UC-027.03 · Enviar material. RN-02 (SPEC-027)/RN-03 (SPEC-012): só transiciona
 * `AguardandoMaterial → EmRevisao` após a gravação do arquivo ser confirmada (PC-03: falha no
 * upload não deve alterar o estado — por isso a gravação acontece antes de qualquer mutação
 * de estado). CT-03 (SPEC-012): transição fora de `AGUARDANDO_MATERIAL` é inválida.
 */
export async function enviarMaterial(
  parceiraId: string,
  entregaId: string,
  arquivo: { buffer: Buffer; nomeOriginal: string },
): Promise<ResultadoEnvioMaterial> {
  const entrega = await entregaRepositorio.buscarPorId(entregaId);
  if (!entrega || entrega.parceiraId !== parceiraId) {
    return { ok: false, motivo: "NAO_ENCONTRADA" };
  }

  if (entrega.estado !== "AGUARDANDO_MATERIAL") {
    return { ok: false, motivo: "ESTADO_INVALIDO" };
  }

  const referenciaArquivo = await armazenamentoDeMaterial.salvar(entregaId, arquivo);

  const atualizada = await entregaRepositorio.atualizar({
    ...entrega,
    estado: "EM_REVISAO",
    materialEnviado: referenciaArquivo,
  });

  return { ok: true, entrega: projetarPendencias([atualizada])[0] };
}

/** Backoffice administrativo — leitura irrestrita de todas as Entregas (Administrador vê tudo). */
export async function listarTodasEntregas(): Promise<Entrega[]> {
  return entregaRepositorio.listarTodas();
}

const FORMATOS_VALIDOS: FormatoEntrega[] = ["Reel", "Carrossel", "Stories1", "Stories2"];
const REGEX_MES_REFERENCIA = /^\d{4}-(0[1-9]|1[0-2])$/;
const REGEX_DATA_ENTREGA = /^\d{4}-\d{2}-\d{2}$/;

export interface DadosNovaEntrega {
  parceiraId: string;
  mesReferencia: string;
  formato: FormatoEntrega;
  dataEntrega: string;
}

export type MotivoRejeicaoNovaEntrega =
  | "FORMATO_INVALIDO"
  | "MES_REFERENCIA_INVALIDO"
  | "DATA_ENTREGA_INVALIDA"
  | "PARCEIRA_INEXISTENTE"
  | "PARCEIRA_INATIVA";

type MotivoFormato = Extract<
  MotivoRejeicaoNovaEntrega,
  "FORMATO_INVALIDO" | "MES_REFERENCIA_INVALIDO" | "DATA_ENTREGA_INVALIDA"
>;

/** Validação pura de forma (sem consultar repositório) — reaproveitável e testável isoladamente. */
export function validarFormaDaNovaEntrega(
  dados: DadosNovaEntrega,
): { ok: true } | { ok: false; motivo: MotivoFormato } {
  if (!FORMATOS_VALIDOS.includes(dados.formato)) {
    return { ok: false, motivo: "FORMATO_INVALIDO" };
  }
  if (!REGEX_MES_REFERENCIA.test(dados.mesReferencia)) {
    return { ok: false, motivo: "MES_REFERENCIA_INVALIDO" };
  }
  if (!REGEX_DATA_ENTREGA.test(dados.dataEntrega)) {
    return { ok: false, motivo: "DATA_ENTREGA_INVALIDA" };
  }
  return { ok: true };
}

export type ResultadoNovaEntrega = { ok: true; entrega: Entrega } | { ok: false; motivo: MotivoRejeicaoNovaEntrega };

/**
 * Criação administrativa de Entrega (Backoffice, preparação para CRUD completo — só
 * GET/POST nesta entrega). Nasce sempre `AGUARDANDO_MATERIAL`/`materialEnviado: null`,
 * independente do que for enviado — mesma disciplina de RN-01 do módulo Parceira (nunca
 * confiar em estado vindo do cliente). Exige Parceira existente e `ATIVA` (lacuna apontada em
 * `docs/handoff/HANDOFF_CODEX_BACKOFFICE.md` §3 — até aqui nenhum módulo validava o vínculo).
 */
export async function criarEntregaAdministrativa(dados: DadosNovaEntrega): Promise<ResultadoNovaEntrega> {
  const validacaoDeForma = validarFormaDaNovaEntrega(dados);
  if (!validacaoDeForma.ok) {
    return validacaoDeForma;
  }

  const parceira = await parceiraRepositorio.buscarPorId(dados.parceiraId);
  if (!parceira) {
    return { ok: false, motivo: "PARCEIRA_INEXISTENTE" };
  }
  if (parceira.status !== "ATIVA") {
    return { ok: false, motivo: "PARCEIRA_INATIVA" };
  }

  const agora = new Date().toISOString();
  const entrega: Entrega = {
    id: randomUUID(),
    parceiraId: dados.parceiraId,
    mesReferencia: dados.mesReferencia,
    formato: dados.formato,
    estado: "AGUARDANDO_MATERIAL",
    dataEntrega: dados.dataEntrega,
    materialEnviado: null,
    dataCriacao: agora,
    dataAtualizacao: agora,
  };

  return { ok: true, entrega: await entregaRepositorio.criar(entrega) };
}
