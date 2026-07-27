import { briefingRepositorio } from "../briefing/briefing.repository.js";
import type { BlocoBriefing } from "../briefing/briefing.types.js";
import { competenciaCorrente } from "./competencia.js";
import { entregaRepositorio } from "./entrega.repository.js";
import type { Entrega, ItemDePendencia } from "./entrega.types.js";

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
