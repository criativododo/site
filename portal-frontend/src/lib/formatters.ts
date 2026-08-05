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
 * NOTA: usa `new Date(dataIso)`, que interpreta uma data pura "AAAA-MM-DD" como meia-noite
 * UTC — em fusos negativos (ex. America/Sao_Paulo, UTC-3) `toLocaleDateString` pode exibir o
 * dia anterior. `Pendencias.tsx` tem seu próprio `formatarData` que evita isso fazendo split
 * manual da string; esta função replica o comportamento pré-existente das páginas Admin*
 * sem alterá-lo (potencial bug de fuso horário, fora do escopo desta limpeza).
 */
export function formatarData(dataIso: string): string {
	return new Date(dataIso).toLocaleDateString("pt-BR");
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
