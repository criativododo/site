/**
 * Camada única de tradução de estados funcionais (S11/Trilha 5 — Design Tokens Funcionais).
 *
 * Gap documental registrado nesta sessão: não existe, em nenhum lugar do repositório, um
 * documento chamado "Design Tokens Funcionais" (verificado com busca textual completa). O
 * único artefato com nome parecido é `design-system/TOKEN_RULES.md`, que trata de tokens
 * VISUAIS (cor/tipografia/espaçamento/motion) — um conceito diferente deste módulo, que
 * traduz estado técnico (enum do backend) → rótulo em português mostrado ao usuário. Na
 * ausência do documento de referência, nenhuma nomenclatura foi inventada: todo rótulo abaixo
 * é a consolidação, byte-a-byte, de mapeamentos idênticos que já existiam duplicados em
 * AdminBriefings, AdminEntregas, AdminObrigacoes, Financeiro, Pendencias e
 * CentralInfluenciadora (3 nomes de variável diferentes para o mesmo conceito:
 * `LABEL_ESTADO` / `LABEL_ESTADO_ENTREGA` / `RASTREIO_ESTADO_OBRIGACAO`). Nenhum comportamento
 * visual muda.
 *
 * Fora de escopo (excluído desta camada, não desta sessão por decisão de produto pendente):
 * `EstadoConta` (identidade.types.ts) — SPEC-035 §249-267 define rótulo oficial em PT para
 * PENDING/ACTIVE/INACTIVE/REJECTED, mas não para AGUARDANDO_CADASTRO; além disso, esse enum
 * hoje dirige telas inteiras com copy contextual (Login/Cadastro), não badges/chips de uma
 * palavra — categoria estrutural diferente da tratada aqui. Migrar exigiria decisão de Produto
 * sobre o rótulo de AGUARDANDO_CADASTRO, então foi registrado e mantido fora desta camada.
 *
 * Esta camada não contém regra de negócio, autorização ou workflow — apenas tradução.
 * Todo valor desconhecido (drift entre backend e frontend) cai no rótulo bruto (fallback),
 * nunca lança erro — é uma tela renderizando texto, não uma validação de contrato.
 */

export type FormatoEntrega = "Reel" | "Carrossel" | "Stories1" | "Stories2";

export type EstadoEntrega =
	| "AGUARDANDO_MATERIAL"
	| "EM_REVISAO"
	| "APROVADO"
	| "PUBLICADO";

export type EstadoObrigacao = "EM_ABERTO" | "APROVADO" | "PAGO";

export type TipoObrigacao = "MENSAL" | "AVULSO";

export type TipoDocumentoEmitido =
	| "CONTRATO"
	| "ADITIVO"
	| "DISTRATO"
	| "PROPOSTA"
	| "RECIBO"
	| "DECLARACAO";

export type StatusDocumentoEmitido =
	| "NAO_GERADO"
	| "GERADO"
	| "BAIXADO"
	| "ENVIADO"
	| "VISUALIZADO"
	| "ASSINADO"
	| "FINALIZADO"
	| "ARQUIVADO";

export type StatusParceira = "ATIVA" | "INATIVA";

export const ROTULOS_FORMATO_ENTREGA: Record<FormatoEntrega, string> = {
	Reel: "reel",
	Carrossel: "carrossel",
	Stories1: "stories 1",
	Stories2: "stories 2",
};

export const ROTULOS_ESTADO_ENTREGA: Record<EstadoEntrega, string> = {
	AGUARDANDO_MATERIAL: "aguardando material",
	EM_REVISAO: "em revisão",
	APROVADO: "aprovado",
	PUBLICADO: "publicado",
};

export const ROTULOS_ESTADO_OBRIGACAO: Record<EstadoObrigacao, string> = {
	EM_ABERTO: "em aberto",
	APROVADO: "aprovado",
	PAGO: "pago",
};

export const ROTULOS_TIPO_OBRIGACAO: Record<TipoObrigacao, string> = {
	MENSAL: "mensal",
	AVULSO: "avulso",
};

export const ROTULOS_TIPO_DOCUMENTO: Record<TipoDocumentoEmitido, string> = {
	CONTRATO: "contrato",
	ADITIVO: "aditivo",
	DISTRATO: "distrato",
	PROPOSTA: "proposta",
	RECIBO: "recibo",
	DECLARACAO: "declaração",
};

export const ROTULOS_STATUS_DOCUMENTO: Record<StatusDocumentoEmitido, string> = {
	NAO_GERADO: "não gerado",
	GERADO: "gerado",
	BAIXADO: "baixado",
	ENVIADO: "enviado",
	VISUALIZADO: "visualizado",
	ASSINADO: "assinado",
	FINALIZADO: "finalizado",
	ARQUIVADO: "arquivado",
};

export const ROTULOS_STATUS_PARCEIRA: Record<StatusParceira, string> = {
	ATIVA: "ativa",
	INATIVA: "inativa",
};

/** `formato` chega como `string` solto em alguns endpoints (ProximoPrazo/ExcecaoOperacional
 * do Dashboard da Influenciadora) — por isso o parâmetro aceita `string`, com fallback. */
export function rotuloFormatoEntrega(valor: string): string {
	return ROTULOS_FORMATO_ENTREGA[valor as FormatoEntrega] ?? valor;
}

export function rotuloEstadoEntrega(valor: EstadoEntrega): string {
	return ROTULOS_ESTADO_ENTREGA[valor] ?? valor;
}

export function rotuloEstadoObrigacao(valor: EstadoObrigacao): string {
	return ROTULOS_ESTADO_OBRIGACAO[valor] ?? valor;
}

export function rotuloTipoObrigacao(valor: TipoObrigacao): string {
	return ROTULOS_TIPO_OBRIGACAO[valor] ?? valor;
}

export function rotuloTipoDocumento(valor: TipoDocumentoEmitido): string {
	return ROTULOS_TIPO_DOCUMENTO[valor] ?? valor;
}

export function rotuloStatusDocumento(valor: StatusDocumentoEmitido): string {
	return ROTULOS_STATUS_DOCUMENTO[valor] ?? valor;
}

export function rotuloStatusParceira(valor: StatusParceira): string {
	return ROTULOS_STATUS_PARCEIRA[valor] ?? valor;
}
