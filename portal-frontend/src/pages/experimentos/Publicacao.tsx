import { Link } from "react-router-dom";
import { useSession } from "../../lib/session";
import imagemCampanha from "../../assets/mocks/campanha-essencia-labial.jpg";
import "./Publicacao.css";

/**
 * Publicação — sexta tela da família, continuação direta de Aprovacao.tsx: o estado "aprovado"
 * termina prometendo "a agência cuida da publicação a partir daqui" — esta tela é esse
 * cumprimento, contado como o mesmo dossiê, um capítulo adiante (MELHORIAS_PRODUTO.md, tabela de
 * metáforas §5.3: o estado "publicado" é a vitrine, do ponto de vista da influenciadora).
 *
 * Direção (sessão desta tarefa, aprovação do responsável do projeto):
 * 1. Protagonista é o conteúdo publicado, não o processo da agência — a fotografia do material
 *    ganha mais peso do que em Aprovacao.tsx (lá, thumb utilitário de 84px; aqui, imagem
 *    editorial de destaque), e "quem registrou" fica só como detalhe discreto dentro da
 *    timeline, nunca como bloco à parte.
 * 2. Sem "de quem é a vez": não há mais decisão pendente, então o bloco equivalente da Aprovação
 *    não existe aqui — a confirmação (data/hora, link do post) vira legenda da própria foto.
 * 3. Checklist removido deliberadamente: já cumpriu seu papel em Aprovação; repeti-lo aqui só
 *    olharia para trás, sem informação nova (decisão do responsável do projeto).
 * 4. Autoconfirmação da influenciadora fora de escopo: MELHORIAS_PRODUTO.md §21.1/§22 registram
 *    "quem declara a publicação" como lacuna de produto em aberto — por ADR-003, esta tela não
 *    inventa esse fluxo; a influenciadora só lê, a agência é quem publica.
 * 5. Rodapé é ponte narrativa para a colaboração do mês, nunca funcional nem financeira: nenhuma
 *    menção a pagamento, nenhum link para Financeiro (tela ainda não existe) — só prosa fechando
 *    o capítulo desta entrega.
 *
 * Mesma campanha e mesma imagem de assets/mocks/ das cinco telas anteriores — o mesmo reel,
 * agora no ar.
 */

type EstadoPublicacao = "com_link" | "sem_link";

const ESTADO_ATUAL: EstadoPublicacao = "com_link";

const contexto = {
	campanha: "colaboração de agosto · essência labial",
	entregavel: {
		legenda: "aplicação do vermelho na rotina real",
		tipo: "vídeo",
		meta: "00:38",
		foco: "center 22%",
	},
	pasta: "campanha agosto / reels / look 2",
	revisora: "Ana",
	publicadoEm: "4 de agosto, 14h32",
	link: "https://instagram.com/reel/exemplo",
};

interface DegrauTimeline {
	id: string;
	titulo: string;
	detalhe: string;
	condicao: "concluido" | "atual";
}

function construirTimeline(): DegrauTimeline[] {
	return [
		{
			id: "enviado",
			titulo: "material enviado",
			detalhe: `3 ago, 21h14 · guardado em ${contexto.pasta}`,
			condicao: "concluido",
		},
		{
			id: "revisao",
			titulo: "em revisão",
			detalhe: `revisado por ${contexto.revisora}`,
			condicao: "concluido",
		},
		{
			id: "aprovado",
			titulo: "aprovado",
			detalhe: `4 ago, 10h02 · por ${contexto.revisora}`,
			condicao: "concluido",
		},
		{
			id: "publicado",
			titulo: "publicado",
			detalhe: `${contexto.publicadoEm} · por ${contexto.revisora}`,
			condicao: "atual",
		},
	];
}

export function PublicacaoPage() {
	const { sessao } = useSession();

	if (sessao?.papelAtor !== "INFLUENCIADORA") {
		return (
			<section className="publicacao-tela">
				<p style={{ padding: 32 }}>área restrita a parceiras.</p>
			</section>
		);
	}

	const estado = ESTADO_ATUAL;
	const timeline = construirTimeline();

	return (
		<div className="publicacao-tela">
			<header className="publicacao-nav">
				<span className="publicacao-nav-marca">criativo dodô</span>
				<Link to="/hoje" className="publicacao-nav-link">
					voltar à sua mesa
				</Link>
			</header>

			<div className="publicacao-contexto">
				<p className="publicacao-eyebrow">{contexto.campanha}</p>
				<h1 className="publicacao-frase">seu reel já está no ar.</h1>
			</div>

			<figure className="publicacao-foto">
				<img
					src={imagemCampanha}
					alt=""
					aria-hidden="true"
					style={{ objectPosition: contexto.entregavel.foco }}
				/>
				<figcaption className="publicacao-foto-legenda">
					<span className="publicacao-foto-titulo">{contexto.entregavel.legenda}</span>
					<span className="publicacao-foto-meta">
						{contexto.entregavel.tipo} · {contexto.entregavel.meta}
					</span>
					{estado === "com_link" ? (
						<a
							href={contexto.link}
							target="_blank"
							rel="noreferrer"
							className="publicacao-foto-link"
						>
							no ar desde {contexto.publicadoEm} · ver o post
						</a>
					) : (
						<span className="publicacao-foto-pendente">
							no ar desde {contexto.publicadoEm} · o link chega assim que a agência atualizar
							aqui
						</span>
					)}
				</figcaption>
			</figure>

			<div className="publicacao-corpo">
				<section className="publicacao-secao" aria-labelledby="secao-timeline">
					<p id="secao-timeline" className="publicacao-secao-titulo">
						acompanhamento
					</p>
					<ol className="publicacao-timeline">
						{timeline.map((passo) => (
							<li
								key={passo.id}
								className={`publicacao-timeline-passo is-${passo.condicao}`}
							>
								<span className="publicacao-timeline-marcador" aria-hidden="true" />
								<div className="publicacao-timeline-conteudo">
									<span className="publicacao-timeline-titulo">{passo.titulo}</span>
									<span className="publicacao-timeline-detalhe">{passo.detalhe}</span>
								</div>
							</li>
						))}
					</ol>
				</section>
			</div>

			<section className="publicacao-rodape" aria-label="fechamento">
				<p className="publicacao-rodape-nota">
					essa entrega fecha um capítulo da colaboração de agosto.
				</p>
			</section>
		</div>
	);
}
