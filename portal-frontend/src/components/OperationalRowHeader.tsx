/**
 * Cabeçalho de coluna para `.operational-row` (grade fixa de 5 colunas usada nas listas
 * administrativas — Parceiras/Entregas/Briefings/Obrigações). Puramente visual: a lista em si
 * é `<ul>/<li>`, não uma `<table>`, então o cabeçalho é decorativo para quem enxerga a grade
 * e `aria-hidden` para leitor de tela (achado P0-3 da auditoria de UX).
 */
export function OperationalRowHeader({ labels }: { labels: string[] }) {
	return (
		<div className="operational-row operational-row-header" aria-hidden="true">
			{labels.map((label, indice) => (
				<span key={indice}>{label}</span>
			))}
		</div>
	);
}
