import { formatarDiaMes } from "../../lib/formatters";

/**
 * Dado compartilhado entre a lista (`LogisticaCampanha.tsx`) e o detalhe
 * (`LogisticaEnvioDetalhe.tsx`) — mesmo padrão de módulo de fixture isolado que evita duplicar
 * o array de envios e a lógica de alerta nas duas telas.
 *
 * Lacuna declarada (ADR-003/ADR-023, mesmo padrão de `AdminCampanha.tsx:30` e SPEC-016): não
 * existe hoje nenhum módulo real de rastreamento — os envios abaixo são fixture, só para
 * validar a hierarquia visual e a lógica de alerta propostas. Consulta automática de
 * transportadora é trabalho de backend futuro.
 */

export type Etapa = "preparado" | "enviado" | "transporte" | "saiu_entrega" | "entregue" | "confirmado";

export interface PassoEnvio {
	etapa: Etapa;
	rotulo: string;
	data: string | null;
}

export type Transportadora = "correios" | "jadlog";

export interface Envio {
	id: string;
	parceiraNome: string;
	/** Somente dígitos, com DDI — formato exigido pelo deep link wa.me. */
	parceiraTelefone: string;
	kit: string;
	campanha: string;
	etapaAtual: Etapa;
	/** Data em que o envio entrou na etapa atual — base do cálculo de "parado há X dias". */
	dataEtapaAtual: string;
	transportadora: Transportadora | null;
	codigoRastreio: string | null;
	/** Data prevista para a etapa atual — base do cálculo de atraso. */
	prazoPrevisto: string | null;
	/** Motivo declarado pela transportadora (ex.: tentativa de entrega sem sucesso), quando existe. */
	excecaoTransportadora: string | null;
	/** Pendência anotada manualmente pela equipe DODÔ. */
	observacao: string | null;
	passos: PassoEnvio[];
}

export const ORDEM_ETAPAS: Etapa[] = ["preparado", "enviado", "transporte", "saiu_entrega", "entregue", "confirmado"];

export const ROTULO_ETAPA: Record<Etapa, string> = {
	preparado: "pedido preparado",
	enviado: "pedido enviado",
	transporte: "em transporte",
	saiu_entrega: "saiu para entrega",
	entregue: "entregue",
	confirmado: "recebimento confirmado",
};

export const ROTULO_STATUS: Record<Etapa, string> = {
	preparado: "preparando envio",
	enviado: "enviado",
	transporte: "em transporte",
	saiu_entrega: "saiu para entrega",
	entregue: "entregue",
	confirmado: "recebimento confirmado",
};

export const ROTULO_TRANSPORTADORA: Record<Transportadora, string> = {
	correios: "correios",
	jadlog: "jadlog",
};

/** Página oficial de rastreamento de cada transportadora — nenhuma delas confirma suporte a
 * parâmetro de código na URL hoje, então abrimos a página institucional e deixamos "copiar
 * código" resolver o preenchimento manual, em vez de linkar um formato de URL não confirmado. */
export const URL_RASTREAMENTO_TRANSPORTADORA: Record<Transportadora, string> = {
	correios: "https://www.correios.com.br/home-page-2024/rastreamento/acompanhe-seu-objeto",
	jadlog: "https://www.jadlog.com.br/tracking",
};

/** Data de referência fixa do fixture (mesmo recorte de "hoje" usado por `CalendarioEditorial.tsx`,
 * deslocado para depois de todos os eventos abaixo para que o cálculo de dias parado/atraso
 * produza valores positivos e demonstráveis). */
export const HOJE_ISO = "2026-08-13";

function paraData(dataIso: string): Date {
	const [ano, mes, dia] = dataIso.split("-").map(Number);
	return new Date(Date.UTC(ano, mes - 1, dia));
}

function diferencaEmDias(deIso: string, paraIso: string): number {
	const MS_POR_DIA = 1000 * 60 * 60 * 24;
	return Math.round((paraData(paraIso).getTime() - paraData(deIso).getTime()) / MS_POR_DIA);
}

function construirPassos(datas: Partial<Record<Etapa, string>>): PassoEnvio[] {
	return ORDEM_ETAPAS.map((etapa) => ({
		etapa,
		rotulo: ROTULO_ETAPA[etapa],
		data: datas[etapa] ?? null,
	}));
}

export const envios: Envio[] = [
	{
		id: "env1",
		parceiraNome: "Marina Duarte",
		parceiraTelefone: "5511987650001",
		kit: "kit essência labial",
		campanha: "essência labial",
		etapaAtual: "confirmado",
		dataEtapaAtual: "2026-08-05",
		transportadora: "correios",
		codigoRastreio: "BR482910557DO",
		prazoPrevisto: null,
		excecaoTransportadora: null,
		observacao: null,
		passos: construirPassos({
			preparado: "1 de agosto",
			enviado: "1 de agosto",
			transporte: "2 de agosto",
			saiu_entrega: "4 de agosto",
			entregue: "4 de agosto",
			confirmado: "5 de agosto",
		}),
	},
	{
		id: "env2",
		parceiraNome: "Laura Ferreira",
		parceiraTelefone: "5511987650002",
		kit: "kit essência labial",
		campanha: "essência labial",
		etapaAtual: "entregue",
		dataEtapaAtual: "2026-08-04",
		transportadora: "correios",
		codigoRastreio: "BR482910561DO",
		prazoPrevisto: null,
		excecaoTransportadora: null,
		observacao: "aguardando confirmação de recebimento da parceira.",
		passos: construirPassos({
			preparado: "1 de agosto",
			enviado: "2 de agosto",
			transporte: "3 de agosto",
			saiu_entrega: "4 de agosto",
			entregue: "4 de agosto",
		}),
	},
	{
		id: "env3",
		parceiraNome: "Camila Rocha",
		parceiraTelefone: "5511987650003",
		kit: "kit essência labial",
		campanha: "essência labial",
		etapaAtual: "transporte",
		dataEtapaAtual: "2026-08-09",
		transportadora: "jadlog",
		codigoRastreio: "JD773410298BR",
		prazoPrevisto: null,
		excecaoTransportadora: null,
		observacao: null,
		passos: construirPassos({
			preparado: "7 de agosto",
			enviado: "8 de agosto",
			transporte: "9 de agosto",
		}),
	},
	{
		id: "env4",
		parceiraNome: "Bianca Alves",
		parceiraTelefone: "5511987650004",
		kit: "kit essência labial",
		campanha: "essência labial",
		etapaAtual: "preparado",
		dataEtapaAtual: "2026-08-09",
		transportadora: null,
		codigoRastreio: null,
		prazoPrevisto: null,
		excecaoTransportadora: null,
		observacao: "aguardando definição de transportadora.",
		passos: construirPassos({
			preparado: "9 de agosto",
		}),
	},
	{
		id: "env5",
		parceiraNome: "Renata Souza",
		parceiraTelefone: "5511987650005",
		kit: "kit essência labial",
		campanha: "essência labial",
		etapaAtual: "transporte",
		dataEtapaAtual: "2026-08-10",
		transportadora: "jadlog",
		codigoRastreio: "JD773410311BR",
		prazoPrevisto: null,
		excecaoTransportadora: "tentativa de entrega sem sucesso — endereço não localizado.",
		observacao: null,
		passos: construirPassos({
			preparado: "8 de agosto",
			enviado: "9 de agosto",
			transporte: "10 de agosto",
		}),
	},
	{
		id: "env6",
		parceiraNome: "Juliana Prado",
		parceiraTelefone: "5511987650006",
		kit: "kit essência labial",
		campanha: "essência labial",
		etapaAtual: "saiu_entrega",
		dataEtapaAtual: "2026-08-11",
		transportadora: "correios",
		codigoRastreio: "BR482910579DO",
		prazoPrevisto: "2026-08-11",
		excecaoTransportadora: null,
		observacao: null,
		passos: construirPassos({
			preparado: "7 de agosto",
			enviado: "8 de agosto",
			transporte: "10 de agosto",
			saiu_entrega: "11 de agosto",
		}),
	},
];

export interface Alerta {
	tipo: "excecao" | "atraso" | "pendencia" | "estagnado";
	motivo: string;
}

const LIMIAR_DIAS_ESTAGNADO = 3;

/**
 * Critério combinado (decisão do responsável do projeto, 2026-08-06): exceção da transportadora
 * → atraso vs. prazo previsto → pendência registrada manualmente → parado há mais de
 * {@link LIMIAR_DIAS_ESTAGNADO} dias na mesma etapa. Prioridade nessa ordem quando mais de um se
 * aplica (motivo mais acionável primeiro) — só o primeiro motivo aplicável é exibido na lista;
 * o detalhe do envio mostra o estado completo.
 */
export function calcularAlerta(envio: Envio, hojeIso: string = HOJE_ISO): Alerta | null {
	if (envio.etapaAtual === "confirmado") {
		return null;
	}

	if (envio.excecaoTransportadora) {
		return { tipo: "excecao", motivo: `exceção da transportadora: ${envio.excecaoTransportadora}` };
	}

	if (envio.prazoPrevisto && hojeIso > envio.prazoPrevisto) {
		const diasAtraso = diferencaEmDias(envio.prazoPrevisto, hojeIso);
		return {
			tipo: "atraso",
			motivo: diasAtraso === 1 ? "atrasado há 1 dia em relação ao previsto" : `atrasado há ${diasAtraso} dias em relação ao previsto`,
		};
	}

	if (envio.observacao) {
		return { tipo: "pendencia", motivo: envio.observacao };
	}

	const diasNaEtapa = diferencaEmDias(envio.dataEtapaAtual, hojeIso);
	if (diasNaEtapa > LIMIAR_DIAS_ESTAGNADO) {
		return { tipo: "estagnado", motivo: diasNaEtapa === 1 ? "parado há 1 dia nesta etapa" : `parado há ${diasNaEtapa} dias nesta etapa` };
	}

	return null;
}

export function rastreioResumido(envio: Envio): string | null {
	if (!envio.transportadora || !envio.codigoRastreio) {
		return null;
	}
	return `${ROTULO_TRANSPORTADORA[envio.transportadora]} · ${envio.codigoRastreio}`;
}

export function ultimaAtualizacaoFormatada(envio: Envio): string {
	return formatarDiaMes(envio.dataEtapaAtual);
}

export function buscarEnvio(id: string): Envio | undefined {
	return envios.find((envio) => envio.id === id);
}
