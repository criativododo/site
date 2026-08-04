import { Link } from "react-router-dom";
import { useSession } from "../../lib/session";
import { Item, ItemContent, ItemGroup, ItemTitle } from "../../components/ui/item";
import imagemCampanha from "../../assets/mocks/campanha-essencia-labial.jpg";
import "./Aprovacao.css";

/**
 * Aprovação — quinta tela da família, continuação direta de EnvioConteudo.tsx: a confirmação de
 * envio termina em "status atual: em revisão"; esta tela é esse estado, contado como dossiê de
 * uma entrega específica, não como fila de aprovação corporativa (MELHORIAS_PRODUTO.md §11, §15).
 *
 * Direção (sessão desta tarefa, aprovação do responsável do projeto):
 * 1. A pergunta que a tela existe para responder: "onde está meu material, e de quem é a vez
 *    agora?" — respondida antes de qualquer outra informação (MELHORIAS_PRODUTO.md §15.3).
 * 2. A timeline é a espinha dorsal (MELHORIAS_PRODUTO.md §7): cada degrau carrega quem, quando,
 *    o quê. "publicado" aparece sempre como degrau futuro — prepara a tela de Publicação sem
 *    implementá-la.
 * 3. O checklist devolve, como conferência da agência, as mesmas diretrizes que a própria
 *    influenciadora relatou seguir em EnvioConteudo.tsx (`observacoes`) — o mesmo compromisso,
 *    visto de volta, reforça confiança em vez de repetir informação por acaso.
 * 4. Comentário estruturado (o que ajustar + comentário livre + novo prazo) só aparece no estado
 *    "ajuste solicitado" (MELHORIAS_PRODUTO.md §11.3); nos demais estados, um vazio editorial
 *    explica a ausência em vez de simplesmente omitir a seção (DESIGN_LANGUAGE.md §6.1).
 * 5. Os quatro estados obrigatórios (aguardando revisão · em revisão · ajuste solicitado ·
 *    aprovado) são reais na lógica de `construirTimeline`/`conteudoPorEstado`, não telas soltas —
 *    a mesma entrega, vista em momentos diferentes. O estado exibido nesta sessão é "em revisão",
 *    o ponto de chegada natural vindo do Envio.
 *
 * Mesma campanha e mesma imagem de `assets/mocks/` das quatro telas anteriores — o mesmo reel,
 * agora sendo revisado pela agência.
 *
 * Refinamento editorial do estado "revisão" (sessão seguinte, aprovação do responsável do
 * projeto): "ajuste" é o único estado que pede uma decisão da parceira — os outros três
 * (aguardando, revisão, aprovado) são leitura passiva e passam a compartilhar densidade
 * compacta (`.is-compacta`), por §4/§6 de DESIGN_LANGUAGE.md ("densidade elástica"). O título
 * do checklist muda de tom fora de "ajuste"/"aprovado": antes de a agência formar um veredito,
 * ele reflete o que a própria parceira relatou (não uma certificação antecipada da agência) —
 * a seção "comentários da agência" só existe quando há comentário real ("ajuste"), em vez de um
 * vazio editorial permanente que já era redundante com "de quem é a vez" (MELHORIAS_PRODUTO.md
 * §15.3, a informação mais importante da tela, e o único lugar que precisa dizer "nada a fazer").
 */

type EstadoEntrega = "aguardando" | "revisao" | "ajuste" | "aprovado";

const ESTADO_ATUAL: EstadoEntrega = "revisao";

function precisaDecisao(estado: EstadoEntrega): boolean {
	return estado === "ajuste";
}

const contexto = {
	campanha: "colaboração de agosto · essência labial",
	entregavel: {
		titulo: "reel · aplicação do vermelho na rotina real",
		legenda: "aplicação do vermelho na rotina real",
		tipo: "vídeo",
		meta: "00:38",
		foco: "center 22%",
	},
	pasta: "campanha agosto / reels / look 2",
	revisora: "Ana",
};

const checklist = [
	"preço da essência labial não foi mencionado",
	"produto reserva (tom nude) ficou fora do vídeo",
	"aplicação em até 30 segundos, sem making of",
];

interface DegrauTimeline {
	id: string;
	titulo: string;
	detalhe?: string;
	condicao: "concluido" | "atual" | "futuro";
}

function construirTimeline(estado: EstadoEntrega): DegrauTimeline[] {
	// "Aguardando revisão" só ganha degrau próprio enquanto é o estado atual — é o momento em
	// que a fila importa. Depois que a revisão começa, os 6 minutos de espera viram rodapé do
	// envio, não um capítulo à parte (excesso de granularidade de log, não de narrativa).
	const passos: DegrauTimeline[] =
		estado === "aguardando"
			? [
					{
						id: "enviado",
						titulo: "material enviado",
						detalhe: `3 ago, 21h14 · guardado em ${contexto.pasta}`,
						condicao: "concluido",
					},
					{
						id: "aguardando",
						titulo: "aguardando revisão",
						detalhe: "na fila da agência",
						condicao: "atual",
					},
					{
						id: "revisao",
						titulo: "em revisão",
						condicao: "futuro",
					},
				]
			: [
					{
						id: "enviado",
						titulo: "material enviado",
						detalhe: `3 ago, 21h14 · guardado em ${contexto.pasta} · recebido pela agência às 21h20`,
						condicao: "concluido",
					},
					{
						id: "revisao",
						titulo: "em revisão",
						detalhe:
							estado === "revisao"
								? `${contexto.revisora}, da agência, começou a revisar há 40 minutos`
								: `revisado por ${contexto.revisora}`,
						condicao: estado === "revisao" ? "atual" : "concluido",
					},
				];

	if (estado === "ajuste") {
		passos.push({
			id: "ajuste",
			titulo: "ajuste solicitado",
			detalhe: `${contexto.revisora} pediu um ajuste — veja o comentário abaixo`,
			condicao: "atual",
		});
	}

	passos.push({
		id: "aprovado",
		titulo: "aprovado",
		detalhe: estado === "aprovado" ? `4 ago, 10h02 · por ${contexto.revisora}` : undefined,
		condicao: estado === "aprovado" ? "atual" : "futuro",
	});

	passos.push({
		id: "publicado",
		titulo: "publicado",
		condicao: "futuro",
	});

	return passos;
}

const conteudoPorEstado: Record<
	EstadoEntrega,
	{ frase: string; vez: string; vezDetalhe: string; prazo: string }
> = {
	aguardando: {
		frase: "seu material chegou e está na fila de revisão.",
		vez: "vez da agência",
		vezDetalhe: "a agência ainda não abriu sua entrega — normal, a fila varia por dia.",
		prazo: "retorno previsto até 5 de agosto",
	},
	revisao: {
		frase: "seu material está em revisão.",
		vez: "vez da agência",
		vezDetalhe: `${contexto.revisora} está com sua entrega — nada para você fazer agora.`,
		prazo: "retorno previsto até 5 de agosto",
	},
	ajuste: {
		frase: "a agência pediu um ajuste no seu material.",
		vez: "sua vez",
		vezDetalhe: "reenvie o material com o ajuste pedido para voltar à revisão.",
		prazo: "novo prazo: até 7 de agosto",
	},
	aprovado: {
		frase: "seu material foi aprovado.",
		vez: "nada a fazer",
		vezDetalhe: "a agência cuida da publicação a partir daqui.",
		prazo: "publicação prevista para a próxima semana",
	},
};

export function AprovacaoPage() {
	const { sessao } = useSession();

	if (sessao?.papelAtor !== "INFLUENCIADORA") {
		return (
			<section className="aprovacao-tela">
				<p style={{ padding: 32 }}>área restrita a parceiras.</p>
			</section>
		);
	}

	const estado = ESTADO_ATUAL;
	const conteudo = conteudoPorEstado[estado];
	const timeline = construirTimeline(estado);
	const decisaoPendente = precisaDecisao(estado);
	const tituloChecklist =
		decisaoPendente || estado === "aprovado"
			? "diretrizes do briefing conferidas"
			: "o que você disse ter seguido";

	return (
		<div className="aprovacao-tela">
			<header className="aprovacao-nav">
				<span className="aprovacao-nav-marca">criativo dodô</span>
				<Link to="/hoje" className="aprovacao-nav-link">
					voltar à sua mesa
				</Link>
			</header>

			<div className="aprovacao-contexto">
				<p className="aprovacao-eyebrow">{contexto.campanha}</p>
				<h1 className="aprovacao-frase">{conteudo.frase}</h1>
			</div>

			<section className="aprovacao-vez" aria-label="de quem é a vez">
				<span className="aprovacao-vez-label">{conteudo.vez}</span>
				<p className="aprovacao-vez-detalhe">{conteudo.vezDetalhe}</p>
				<p className="aprovacao-vez-prazo">{conteudo.prazo}</p>
			</section>

			<div className={`aprovacao-corpo${decisaoPendente ? "" : " is-compacta"}`}>
				<section className="aprovacao-secao" aria-labelledby="secao-material">
					<p id="secao-material" className="aprovacao-secao-titulo">
						o que você entregou
					</p>
					<Item className="aprovacao-material-item">
						<figure className="aprovacao-material-thumb">
							<img
								src={imagemCampanha}
								alt=""
								aria-hidden="true"
								style={{ objectPosition: contexto.entregavel.foco }}
							/>
							<span className="aprovacao-material-play" aria-hidden="true" />
						</figure>
						<ItemContent>
							<ItemTitle className="aprovacao-material-nome">
								{contexto.entregavel.legenda}
							</ItemTitle>
							<span className="aprovacao-material-meta">
								{contexto.entregavel.tipo} · {contexto.entregavel.meta}
							</span>
						</ItemContent>
					</Item>
				</section>

				<section className="aprovacao-secao" aria-labelledby="secao-timeline">
					<p id="secao-timeline" className="aprovacao-secao-titulo">
						acompanhamento
					</p>
					<ol className="aprovacao-timeline">
						{timeline.map((passo) => (
							<li key={passo.id} className={`aprovacao-timeline-passo is-${passo.condicao}`}>
								<span className="aprovacao-timeline-marcador" aria-hidden="true" />
								<div className="aprovacao-timeline-conteudo">
									<span className="aprovacao-timeline-titulo">{passo.titulo}</span>
									{passo.detalhe ? (
										<span className="aprovacao-timeline-detalhe">{passo.detalhe}</span>
									) : null}
								</div>
							</li>
						))}
					</ol>
				</section>

				<section className="aprovacao-secao" aria-labelledby="secao-checklist">
					<p id="secao-checklist" className="aprovacao-secao-titulo">
						{tituloChecklist}
					</p>
					<ItemGroup className="aprovacao-checklist">
						{checklist.map((item) => (
							<Item key={item} className="aprovacao-checklist-item">
								<span className="aprovacao-checklist-marca" aria-hidden="true" />
								<ItemContent>
									<span className="aprovacao-checklist-texto">{item}</span>
								</ItemContent>
							</Item>
						))}
					</ItemGroup>
				</section>

				{decisaoPendente ? (
					<section className="aprovacao-secao" aria-labelledby="secao-comentarios">
						<p id="secao-comentarios" className="aprovacao-secao-titulo">
							comentários da agência
						</p>
						<div className="aprovacao-comentario">
							<p className="aprovacao-comentario-ajustar-titulo">o que ajustar</p>
							<ul className="aprovacao-comentario-ajustar-lista">
								<li>cortar o vídeo para até 30 segundos — o board da marca é vertical rápido</li>
							</ul>
							<p className="aprovacao-comentario-texto">
								o quote final ficou ótimo — só peço para não passar de 30 segundos. reenvia
								cortando os 6 segundos finais?
							</p>
							<p className="aprovacao-comentario-prazo">{conteudo.prazo}</p>
						</div>
					</section>
				) : null}
			</div>

			<section className="aprovacao-rodape" aria-label="próximo passo">
				{estado === "ajuste" ? (
					<Link to="/envio" className="btn-primary is-medium aprovacao-rodape-cta">
						enviar novo material
					</Link>
				) : estado === "aprovado" ? (
					<p className="aprovacao-rodape-nota">
						nada para fazer agora — a agência cuida da publicação a partir daqui.
					</p>
				) : (
					<Link to="/campanha" className="aprovacao-rodape-link">
						revisar o briefing enquanto espera
					</Link>
				)}
			</section>
		</div>
	);
}
