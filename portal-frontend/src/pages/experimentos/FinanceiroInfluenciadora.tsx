import { Link } from "react-router-dom";
import { useSession } from "../../lib/session";
import { formatarMoedaPartes } from "../../lib/formatters";
import imagemCampanha from "../../assets/mocks/campanha-essencia-labial.jpg";
import "./FinanceiroInfluenciadora.css";

/**
 * Financeiro (proposta: "reconhecimento") — sétima tela da família, continuação direta de
 * Publicacao.tsx: o rodapé daquela tela promete "essa entrega fecha um capítulo da colaboração
 * de agosto" sem nunca linkar para cá porque a tela não existia. Esta tela cumpre essa promessa
 * e completa o fio já aberto por HojeInfluenciadora.tsx (faixa "pagamento · R$2.480 pendente").
 *
 * Direção (sessão de aprovação editorial, aprovação do responsável do projeto):
 * 1. Mudança de metáfora oficial (substitui "extrato" de MELHORIAS_PRODUTO.md §5.3): esta tela
 *    não é onde a parceira confere um saldo, é onde ela é lembrada de que o trabalho foi
 *    reconhecido. O valor é a prova, nunca o assunto — por isso um único bloco de reconhecimento
 *    (frase + valor), nunca uma grade de cards de KPI (o padrão do Financeiro.tsx legado em
 *    pages/, que esta tela deliberadamente não segue).
 * 2. Frase de abertura escalável (ajuste pós-aprovação): não depende de texto por campanha/
 *    formato — funciona para qualquer competência, sem exigir copy nova a cada mês.
 * 3. Fotografia reduzida a lembrança (ajuste pós-aprovação): mesmo arquivo de
 *    `assets/mocks/campanha-essencia-labial.jpg` de todas as telas anteriores — regra
 *    permanente do projeto, uma única fotografia editorial por campanha, reaproveitada em toda
 *    a jornada, nunca trocada entre telas. Aqui ela é a menor de toda a família (a mesma
 *    disciplina de Aprovacao.tsx→thumb utilitário levada adiante): um círculo pequeno, decorativo
 *    (`alt=""`), sem legenda — uma lembrança, não mais um conteúdo a descrever. O conteúdo já
 *    teve seu momento de protagonismo em Publicação; aqui o protagonista é a frase de
 *    reconhecimento.
 * 4. Valor nunca anunciado como "você recebeu" (ajuste pós-aprovação): rótulo acima do número diz
 *    o que ele significa ("o reconhecimento por esta colaboração"), não um recibo de conta
 *    corrente.
 * 5. "Ver comprovante" sai do bloco principal e vira ação secundária abaixo da timeline (ajuste
 *    pós-aprovação) — consulta, não parte da mensagem de reconhecimento. Sem visualizador real
 *    nesta sessão (o "visualizador de comprovante" é componente futuro declarado em
 *    MELHORIAS_PRODUTO.md §16, fora do escopo desta tela): o botão existe para validar a
 *    hierarquia visual, a ação em si fica para quando o endpoint existir.
 * 6. Timeline cobre só território novo (fechamento → pagamento), sem repetir os passos de
 *    entrega já contados em Aprovação/Publicação — mesmo princípio que descartou o checklist em
 *    Publicação. Mesma espinha dorsal de Aprovacao.css/Publicacao.css (MELHORIAS_PRODUTO.md §7,
 *    "mesmo motor, mesma linguagem, públicos diferentes"); extração para componente
 *    compartilhado seguue adiada (seria a 3ª tela consumidora), não bloqueia esta tela.
 * 7. Divergência (§14.6) como microlink de baixa ênfase no rodapé, nunca ação primária — é
 *    exceção documentada, não a narrativa da tela.
 * 8. Sem seletor de competência: navegar entre meses passados é função da futura tela Histórico
 *    ("arquivo pessoal"), não desta. Incluir aqui reintroduziria o padrão extrato.
 *
 * Lacuna declarada (ADR-003, não presumida): existe hoje uma rota `/financeiro` em produção
 * (pages/Financeiro.tsx, dentro do PortalLayout) com padrão de KPIs/tabela — conflita com a
 * diretriz desta sessão. Esta tela usa `/reconhecimento` para não colidir; reconciliar as duas
 * fica para decisão futura, fora do escopo desta tarefa.
 */

type EstadoReconhecimento = "pago" | "processando";

const ESTADO_ATUAL: EstadoReconhecimento = "pago";

const contexto = {
	campanha: "colaboração de agosto · essência labial",
	entregavel: {
		foco: "center 22%",
	},
	valor: 2480,
	fechadoEm: "4 de agosto, 14h32",
	aprovadoEm: "4 de setembro, 09h10",
	enviadoEm: "5 de setembro, 08h00",
	pagoEm: "5 de setembro, 14h32",
	proximoBriefing: "setembro",
};

interface DegrauTimeline {
	id: string;
	titulo: string;
	detalhe?: string;
	condicao: "concluido" | "atual" | "futuro";
}

function construirTimeline(estado: EstadoReconhecimento): DegrauTimeline[] {
	return [
		{
			id: "fechada",
			titulo: "colaboração de agosto fechada",
			detalhe: contexto.fechadoEm,
			condicao: "concluido",
		},
		{
			id: "aprovado",
			titulo: "pagamento aprovado",
			detalhe: contexto.aprovadoEm,
			condicao: "concluido",
		},
		{
			id: "enviado",
			titulo: "pagamento enviado",
			detalhe: contexto.enviadoEm,
			condicao: estado === "pago" ? "concluido" : "atual",
		},
		{
			id: "pago",
			titulo: "pago",
			detalhe: estado === "pago" ? contexto.pagoEm : undefined,
			condicao: estado === "pago" ? "atual" : "futuro",
		},
	];
}

export function FinanceiroInfluenciadoraPage() {
	const { sessao } = useSession();

	if (sessao?.papelAtor !== "INFLUENCIADORA") {
		return (
			<section className="reconhecimento-tela">
				<p style={{ padding: 32 }}>área restrita a parceiras.</p>
			</section>
		);
	}

	const estado = ESTADO_ATUAL;
	const timeline = construirTimeline(estado);
	const { reais, centavos } = formatarMoedaPartes(contexto.valor);

	return (
		<div className="reconhecimento-tela">
			<header className="reconhecimento-nav">
				<span className="reconhecimento-nav-marca">criativo dodô</span>
				<Link to="/hoje" className="reconhecimento-nav-link">
					voltar à sua mesa
				</Link>
			</header>

			<div className="reconhecimento-contexto">
				<div className="reconhecimento-memoria" aria-hidden="true">
					<img
						src={imagemCampanha}
						alt=""
						style={{ objectPosition: contexto.entregavel.foco }}
					/>
				</div>
				<p className="reconhecimento-eyebrow">{contexto.campanha}</p>
				<h1 className="reconhecimento-frase">
					sua colaboração deste mês foi reconhecida.
				</h1>
			</div>

			<div className="reconhecimento-corpo">
				<section
					className="reconhecimento-valor"
					aria-labelledby="reconhecimento-valor-titulo"
				>
					<p id="reconhecimento-valor-titulo" className="reconhecimento-valor-label">
						o reconhecimento por esta colaboração
					</p>
					<p className="reconhecimento-valor-numero">
						{reais}
						<span className="reconhecimento-valor-centavos">{centavos}</span>
					</p>
					<p className="reconhecimento-valor-estado">
						{estado === "pago"
							? `consolidado em ${contexto.pagoEm}`
							: "a caminho — você será avisada assim que for concluído"}
					</p>
				</section>

				<section className="reconhecimento-secao" aria-labelledby="secao-timeline">
					<p id="secao-timeline" className="reconhecimento-secao-titulo">
						acompanhamento
					</p>
					<ol className="reconhecimento-timeline">
						{timeline.map((passo) => (
							<li
								key={passo.id}
								className={`reconhecimento-timeline-passo is-${passo.condicao}`}
							>
								<span className="reconhecimento-timeline-marcador" aria-hidden="true" />
								<div className="reconhecimento-timeline-conteudo">
									<span className="reconhecimento-timeline-titulo">{passo.titulo}</span>
									{passo.detalhe && (
										<span className="reconhecimento-timeline-detalhe">{passo.detalhe}</span>
									)}
								</div>
							</li>
						))}
					</ol>

					{estado === "pago" && (
						<button type="button" className="reconhecimento-acao-secundaria">
							ver comprovante
						</button>
					)}
				</section>
			</div>

			<section className="reconhecimento-rodape" aria-label="fechamento">
				<p className="reconhecimento-rodape-nota">
					a colaboração deste mês está completa. quando o briefing de{" "}
					{contexto.proximoBriefing} chegar, você vê por aqui.
				</p>
				<button type="button" className="reconhecimento-divergencia">
					algo parece errado? avisar a agência
				</button>
			</section>
		</div>
	);
}
