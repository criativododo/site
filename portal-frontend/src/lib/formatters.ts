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
