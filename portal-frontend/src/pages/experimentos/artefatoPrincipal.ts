/**
 * Mesma forma de `ProximoPrazo` em `AdminDashboard.tsx` (não importada de lá deliberadamente —
 * este experimento não deve gerar nenhum diff no restante do Portal; ver Escopo no relatório
 * final). Espelha o contrato real já retornado por `GET /api/admin/dashboard`
 * (`dashboard.types.ts` no backend), não um formato inventado para esta tela.
 */
export interface ProximoPrazo {
	tipo: "entrega" | "postagem";
	parceiraNome: string;
	formato: "Reel" | "Carrossel" | "Stories1" | "Stories2";
	data: string;
	diasRestantes: number;
}

/**
 * Núcleo puro da tela-bandeira "hoje" (Concept Book / Design Brief aprovados) — escolhe o
 * artefato real que domina a abertura. Não introduz agregado novo: `proximosPrazos` já é
 * calculado pelo backend (`dashboard.service.ts`, `calcularProximosPrazos`), ordenado por
 * proximidade; aqui só se lê o primeiro item real, sem inventar critério de "urgência"
 * artificial (nota de revisão do Design Brief, item 1 — nunca fabricar urgência).
 */
export function selecionarArtefatoPrincipal(
	proximosPrazos: ProximoPrazo[],
): ProximoPrazo | null {
	return proximosPrazos[0] ?? null;
}

const ROTULO_TIPO: Record<ProximoPrazo["tipo"], string> = {
	entrega: "entrega",
	postagem: "postagem",
};

/**
 * Manchete editorial da abertura — frase antes do número (ART_DIRECTION_GUIDE.md §1). Nunca
 * anuncia "aguardando decisão" quando o dado real é só um prazo futuro (não há, hoje, projeção
 * de qual Entrega EM_REVISAO pertence a qual Parceira — só a contagem agregada
 * `indicadores.entregas.emRevisao`); a frase reflete exatamente o que é real.
 */
export function formatarManchete(artefato: ProximoPrazo): string {
	const sujeito = artefato.tipo === "entrega" ? "a entrega" : "a postagem";
	return `${sujeito} de ${artefato.parceiraNome} é a próxima no prazo.`;
}

export function formatarEyebrow(artefato: ProximoPrazo): string {
	return ROTULO_TIPO[artefato.tipo];
}
