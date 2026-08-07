/**
 * Formatadores repetidos em várias páginas Admin* (moeda BRL e data pt-BR) — extraídos aqui
 * para eliminar a duplicação exata que existia em AdminParceiras, AdminObrigacoes,
 * AdminDashboard, Financeiro (formatadorMoeda) e AdminParceiras, AdminObrigacoes,
 * AdminBriefings, AdminEntregas (formatarData). Comportamento preservado byte-a-byte — ver
 * nota sobre fuso horário abaixo.
 */
export const formatadorMoeda = new Intl.NumberFormat("pt-BR", {
	style: "currency",
	currency: "BRL",
});

/**
 * Assinatura "número com precisão visível" (ART_DIRECTION_GUIDE.md §5): separa a parte que
 * importa (reais) da parte que só confirma exatidão (centavos), para renderizar a primeira
 * em peso maior e a segunda menor, na mesma linha. `formatadorMoeda` sempre produz 2 casas
 * decimais (Intl currency), então a vírgula decimal é sempre a última da string formatada.
 */
export function formatarMoedaPartes(valor: number): {
	reais: string;
	centavos: string;
} {
	const formatado = formatadorMoeda.format(valor);
	const indiceVirgula = formatado.lastIndexOf(",");
	return {
		reais: formatado.slice(0, indiceVirgula),
		centavos: formatado.slice(indiceVirgula),
	};
}

/**
 * Usada tanto com data pura "AAAA-MM-DD" (`dataEntrega`, `dataPostagem`,
 * `dataAprovacaoInterna`) quanto com timestamp ISO completo ("AAAA-MM-DDTHH:mm:ss.sssZ",
 * ex. `dataCriacao`/`dataArquivamento`/`criadoEm`/`geradoEm`) — os dois formatos convivem nas
 * páginas Admin* que chamam esta função. Bug corrigido (sprint de hardening, 2026-08-06): para
 * data pura, `new Date(dataIso)` interpretava-a como meia-noite UTC e, em fusos negativos (ex.
 * America/Sao_Paulo, UTC-3, o fuso real de operação do Portal), `toLocaleDateString` exibia o
 * dia anterior — reproduzido: `new Date("2026-08-06").toLocaleDateString("pt-BR")` ⇒
 * "05/08/2026" sob TZ=America/Sao_Paulo. Causa raiz: ausência de componente de hora faz o
 * `Date` nascer em UTC, mas a formatação usa o fuso local do navegador. Correção: para data
 * pura (sem "T"), split manual + `Date.UTC` + `timeZone: "UTC"` na formatação — mesma técnica
 * já usada por `formatarDiaMes`/`formatarDiaSemana` abaixo, que nunca tiveram este bug. Para
 * timestamp completo, mantido `new Date(dataIso).toLocaleDateString("pt-BR")` inalterado: aí o
 * fuso local do navegador é o comportamento correto (a data exibida é a data-calendário local
 * do instante real em que o evento ocorreu, não uma data pura sem fuso).
 */
export function formatarData(dataIso: string): string {
	if (dataIso.includes("T")) {
		return new Date(dataIso).toLocaleDateString("pt-BR");
	}
	const [ano, mes, dia] = dataIso.split("-").map(Number);
	return new Date(Date.UTC(ano, mes - 1, dia)).toLocaleDateString("pt-BR", {
		timeZone: "UTC",
	});
}

/**
 * Competência corrente no formato AAAA-MM, usada como valor inicial de filtro/formulário em
 * AdminEntregas e AdminObrigacoes (duplicada identicamente nas duas antes desta extração).
 */
export function mesReferenciaCorrente(): string {
	const agora = new Date();
	const ano = agora.getUTCFullYear();
	const mes = String(agora.getUTCMonth() + 1).padStart(2, "0");
	return `${ano}-${mes}`;
}

/**
 * Bloco 2 do Dashboard editorial ("o que vem a seguir") — traduz a contagem de dias que o
 * backend já calculou (`ProximoPrazo.diasRestantes`) para a frase em português; o Portal não
 * recalcula a data, só formata.
 */
export function formatarPrazoRelativo(diasRestantes: number): string {
	if (diasRestantes <= 0) return "vence hoje";
	if (diasRestantes === 1) return "vence amanhã";
	return `vence em ${diasRestantes} dias`;
}

/**
 * "5 de agosto" — dia por extenso a partir de uma data pura `AAAA-MM-DD`. Faz split manual
 * (mesma técnica de `Pendencias.tsx`) em vez de `new Date(dataIso)` para não sofrer o desvio
 * de fuso documentado em `formatarData` acima.
 */
export function formatarDiaMes(dataIso: string): string {
	const [ano, mes, dia] = dataIso.split("-").map(Number);
	return new Date(Date.UTC(ano, mes - 1, dia)).toLocaleDateString("pt-BR", {
		day: "numeric",
		month: "long",
		timeZone: "UTC",
	});
}

/**
 * "quarta-feira" — dia da semana por extenso a partir de uma data pura `AAAA-MM-DD`. Mesma
 * técnica de split manual de `formatarDiaMes` (evita o desvio de fuso de `new Date(dataIso)`).
 */
export function formatarDiaSemana(dataIso: string): string {
	const [ano, mes, dia] = dataIso.split("-").map(Number);
	return new Date(Date.UTC(ano, mes - 1, dia)).toLocaleDateString("pt-BR", {
		weekday: "long",
		timeZone: "UTC",
	});
}

const MESES_PT = [
	"janeiro",
	"fevereiro",
	"março",
	"abril",
	"maio",
	"junho",
	"julho",
	"agosto",
	"setembro",
	"outubro",
	"novembro",
	"dezembro",
];

/**
 * "agosto de 2026" — competência por extenso a partir de `AAAA-MM` (`PanoramaCampanha.competenciaAtual`).
 * Split manual, mesma técnica de `formatarDiaMes` — sem instanciar `Date` a partir de string.
 */
export function formatarCompetencia(mesReferencia: string): string {
	const [ano, mes] = mesReferencia.split("-").map(Number);
	return `${MESES_PT[mes - 1]} de ${ano}`;
}
