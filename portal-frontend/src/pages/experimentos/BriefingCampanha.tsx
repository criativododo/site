import { Link } from "react-router-dom";
import { useSession } from "../../lib/session";
import { Item, ItemContent, ItemGroup, ItemTitle } from "../../components/ui/item";
import imagemCampanha from "../../assets/mocks/campanha-essencia-labial.jpg";
import "./BriefingCampanha.css";

/**
 * Briefing da Campanha — terceira tela da família, função narrativa (DESIGN_LANGUAGE.md §3:
 * "Campanha = narrativa"). Não é formulário nem grid de cards: é uma peça editorial lida do
 * início ao fim, capítulo por capítulo, na mesma ordem sempre (sequência fixa de leitura,
 * ART_DIRECTION_GUIDE.md §1). Reaproveita deliberadamente a mesma campanha fictícia do
 * Dashboard (`HojeInfluenciadora.tsx`) — "colaboração de agosto · essência labial" — e a mesma
 * imagem de `assets/mocks/` (ver README ali para fonte/fotógrafo/licença): é a mesma campanha
 * vista por duas telas com funções diferentes, não uma campanha nova.
 *
 * Dados fixture estática para aprovação visual (sessão desta tarefa) — nenhum endpoint hoje
 * agrega briefing + entregáveis + cronograma numa única resposta para a parceira (mesma
 * lacuna declarada em HojeInfluenciadora.tsx, ADR-003). Wiring real fica para depois da
 * aprovação.
 */
const briefing = {
	campanha: "colaboração de agosto · essência labial",
	titulo: "briefing",
	abertura:
		"aqui está tudo que você precisa saber sobre o mês com a essência labial — leia uma vez, sem pressa.",
	conceito:
		"a campanha é um convite para redescobrir o vermelho como decisão, não como ousadia. a marca quer mostrar como a essência labial vira parte da rotina de quem já sabe o que quer — sem making of, sem filtro, só a cor certa aplicada com calma.",
	objetivo:
		"objetivo: posicionar a essência labial como o item que fecha o look, não o que chama atenção sozinho.",
	produtos: [
		{
			nome: "essência labial matte · tom vermelho 03",
			nota: "produto principal da campanha, uso em todos os conteúdos",
		},
		{
			nome: "essência labial matte · tom nude 01",
			nota: "reserva, caso o vermelho não converse com sua pele",
		},
		{
			nome: "cartela de referência de aplicação",
			nota: "impressa, enviada junto com os produtos pelo correio",
		},
	],
	entregaveis: [
		{
			titulo: "reel · aplicação do vermelho na rotina real",
			prazo: "vence em 5 dias",
			status: "aguardando seu envio",
			urgente: true,
		},
		{
			titulo: "carrossel · bastidor da produção",
			prazo: "vence em 12 dias",
			status: "aguardando seu envio",
			urgente: false,
		},
		{
			titulo: "stories · reação no primeiro uso",
			prazo: "publicado em 30 de julho",
			status: "concluído",
			urgente: false,
		},
	],
	diretriz:
		"queremos que o vermelho pareça decisão sua, não instrução nossa. evite comparar com outros batons, evite mencionar preço, e nunca poste antes de aprovarmos o carrossel.",
	cronograma: [
		{ data: "02 de agosto", evento: "aprovação interna do conceito", feito: true },
		{ data: "08 de agosto", evento: "prazo para envio do reel", feito: false },
		{ data: "15 de agosto", evento: "prazo para envio do carrossel", feito: false },
		{ data: "20 de agosto", evento: "data de publicação combinada", feito: false },
	],
};

export function BriefingCampanhaPage() {
	const { sessao } = useSession();

	if (sessao?.papelAtor !== "INFLUENCIADORA") {
		return (
			<section className="narrativa-tela">
				<p className="narrativa-paragrafo" style={{ padding: 32 }}>
					área restrita a parceiras.
				</p>
			</section>
		);
	}

	return (
		<div className="narrativa-tela">
			<header className="narrativa-nav">
				<span className="narrativa-nav-marca">criativo dodô</span>
				<Link to="/hoje" className="narrativa-nav-link">
					voltar à sua mesa
				</Link>
			</header>

			<div className="narrativa-contexto">
				<p className="narrativa-eyebrow">{briefing.campanha}</p>
				<h1 className="narrativa-titulo">{briefing.titulo}</h1>
				<p className="narrativa-abertura">{briefing.abertura}</p>
			</div>

			<figure className="narrativa-capa">
				<div className="narrativa-capa-moldura">
					<img
						className="narrativa-capa-imagem"
						src={imagemCampanha}
						alt=""
						aria-hidden="true"
					/>
					<div className="narrativa-capa-grade" aria-hidden="true" />
				</div>
				<figcaption className="narrativa-capa-legenda">
					essência labial · tom vermelho 03 — imagem de referência da campanha
				</figcaption>
			</figure>

			<div className="narrativa-corpo">
				<section className="narrativa-capitulo" aria-labelledby="capitulo-conceito">
					<p id="capitulo-conceito" className="narrativa-capitulo-titulo">
						o conceito
					</p>
					<p className="narrativa-paragrafo">{briefing.conceito}</p>
					<p className="narrativa-paragrafo narrativa-paragrafo-objetivo">
						{briefing.objetivo}
					</p>
				</section>

				<section className="narrativa-capitulo" aria-labelledby="capitulo-produtos">
					<p id="capitulo-produtos" className="narrativa-capitulo-titulo">
						o que você recebeu
					</p>
					<ItemGroup>
						{briefing.produtos.map((produto) => (
							<Item key={produto.nome} className="narrativa-linha">
								<ItemContent>
									<ItemTitle>{produto.nome}</ItemTitle>
								</ItemContent>
								<span className="narrativa-linha-nota">{produto.nota}</span>
							</Item>
						))}
					</ItemGroup>
				</section>

				<section className="narrativa-capitulo" aria-labelledby="capitulo-entregaveis">
					<p id="capitulo-entregaveis" className="narrativa-capitulo-titulo">
						o que você precisa entregar
					</p>
					<ItemGroup>
						{briefing.entregaveis.map((entrega) => (
							<Item
								key={entrega.titulo}
								className={`narrativa-linha${entrega.urgente ? " is-urgente" : ""}`}
							>
								<ItemContent>
									<ItemTitle>{entrega.titulo}</ItemTitle>
									<span className="narrativa-linha-nota">{entrega.prazo}</span>
								</ItemContent>
								<span className="narrativa-linha-status">{entrega.status}</span>
							</Item>
						))}
					</ItemGroup>
				</section>

				<section className="narrativa-capitulo" aria-labelledby="capitulo-diretriz">
					<p id="capitulo-diretriz" className="narrativa-capitulo-titulo">
						como a marca pensa sobre isso
					</p>
					<blockquote className="narrativa-citacao">
						{briefing.diretriz}
					</blockquote>
					<p className="narrativa-citacao-atribuicao">
						— observação registrada no briefing interno da marca
					</p>
				</section>

				<section className="narrativa-capitulo" aria-labelledby="capitulo-cronograma">
					<p id="capitulo-cronograma" className="narrativa-capitulo-titulo">
						cronograma
					</p>
					<ItemGroup>
						{briefing.cronograma.map((passo) => (
							<Item
								key={passo.evento}
								className={`narrativa-linha${passo.feito ? " is-feito" : ""}`}
							>
								<ItemContent>
									<ItemTitle>{passo.evento}</ItemTitle>
								</ItemContent>
								<span className="narrativa-linha-nota">{passo.data}</span>
							</Item>
						))}
					</ItemGroup>
				</section>

				<section className="narrativa-fechamento">
					<p className="narrativa-paragrafo">
						é isso. quando tiver dúvida, volte a este briefing — ele não muda no meio
						do mês.
					</p>
					<Link to="/pendencias" className="narrativa-fechamento-link">
						ver suas entregas pendentes
					</Link>
				</section>
			</div>
		</div>
	);
}
