/** Vocabulário da tela Comunicação (Sprint 2) — categorias de modelo de mensagem. */
export type CategoriaModeloMensagem =
	| "BOAS_VINDAS"
	| "BRIEFING"
	| "LEMBRETE"
	| "APROVACAO"
	| "NOTA_FISCAL"
	| "PAGAMENTO"
	| "LOGISTICA"
	| "ENCERRAMENTO";

export type CategoriaMensagemPreparada = CategoriaModeloMensagem | "PERSONALIZADA";

export const ORDEM_CATEGORIAS: CategoriaModeloMensagem[] = [
	"BOAS_VINDAS",
	"BRIEFING",
	"LEMBRETE",
	"APROVACAO",
	"NOTA_FISCAL",
	"PAGAMENTO",
	"LOGISTICA",
	"ENCERRAMENTO",
];

const ROTULOS_CATEGORIA: Record<CategoriaModeloMensagem, string> = {
	BOAS_VINDAS: "boas-vindas",
	BRIEFING: "briefing",
	LEMBRETE: "lembrete",
	APROVACAO: "aprovação",
	NOTA_FISCAL: "nota fiscal",
	PAGAMENTO: "pagamento",
	LOGISTICA: "logística",
	ENCERRAMENTO: "encerramento",
};

export function rotuloCategoriaMensagem(categoria: CategoriaMensagemPreparada): string {
	if (categoria === "PERSONALIZADA") return "personalizada";
	return ROTULOS_CATEGORIA[categoria] ?? categoria;
}
