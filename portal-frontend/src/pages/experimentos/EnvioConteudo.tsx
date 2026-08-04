import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSession } from "../../lib/session";
import { Item, ItemContent, ItemGroup, ItemTitle } from "../../components/ui/item";
import imagemCampanha from "../../assets/mocks/campanha-essencia-labial.jpg";
import "./EnvioConteudo.css";

/**
 * Envio de Conteúdo — quarta tela da família, e a que define o padrão visual das próximas
 * (Aprovação, Revisão, Histórico, Publicações). Por isso o cuidado incomum com estado: ao
 * contrário das três telas anteriores (fixture de um único estado feliz), esta mostra os três
 * estados de envio lado a lado — confirmado, enviando, erro — porque nenhuma etapa futura pode
 * herdar um vocabulário visual que nunca foi desenhado.
 *
 * Direção (sessão desta tarefa, aprovação do responsável do projeto):
 * 1. Protagonista não é o mecanismo de upload, é a confiança na entrega — cada decisão reforça
 *    "meu trabalho foi entregue corretamente", nunca "o arquivo subiu".
 * 2. Contexto antes da ação: campanha, entregável, objetivo e prazo aparecem antes de qualquer
 *    dropzone ou botão (mesmo objetivo já usado em BriefingCampanha.tsx, para continuidade).
 * 3. Mídia não é arquivo: sem nome de arquivo/extensão, sem ícone de pasta — cada item é uma
 *    peça com miniatura protagonista e legenda editorial.
 * 4. Confirmação é editorial, não um toast: "material recebido" + onde foi guardado + para onde
 *    vai agora, nunca só "upload concluído".
 * 5. A confirmação já fala a língua do próximo estado do domínio ("em revisão",
 *    MELHORIAS_PRODUTO.md §11.1) sem implementar a tela de Aprovação.
 * 6. Mobile-first: ação primária fixada ao alcance do polegar em telas pequenas (barra inferior
 *    fixa), linguagem de toque antes de arrastar, sem depender de drag-and-drop como único
 *    caminho.
 * 7. Nenhum estado é escondido — os três (enviando, erro, confirmado) coexistem na mesma tela
 *    fixture, com progresso real por item, nunca uma barra falsa (MELHORIAS_PRODUTO.md §9.3).
 *
 * O botão "tentar novamente" e a barra de progresso são funcionais (useState local) — não
 * porque exista um backend de upload real (não existe, mesma lacuna declarada em
 * HojeInfluenciadora.tsx e BriefingCampanha.tsx, ADR-003), mas porque a transição entre estados
 * é, ela mesma, parte do que está sendo aprovado nesta sessão.
 *
 * Reaproveita a mesma campanha fictícia e a mesma imagem de `assets/mocks/` das três telas
 * anteriores — é o mesmo reel citado em HojeInfluenciadora.tsx e BriefingCampanha.tsx, agora no
 * momento de envio.
 */

type EstadoMidia = "confirmado" | "enviando" | "erro";

interface Midia {
	id: string;
	legenda: string;
	tipo: string;
	meta: string;
	ehVideo: boolean;
	foco: string;
	estado: EstadoMidia;
	progresso?: number;
	pasta?: string;
	confirmadoEm?: string;
}

const contexto = {
	campanha: "colaboração de agosto · essência labial",
	entregavel: {
		titulo: "reel · aplicação do vermelho na rotina real",
		// Mesma frase de objetivo do capítulo "o conceito" em BriefingCampanha.tsx — a mesma
		// campanha vista por duas telas, não uma repetição por economia.
		objetivo:
			"objetivo: posicionar a essência labial como o item que fecha o look, não o que chama atenção sozinho.",
		prazo: "vence em 5 dias · 08 de agosto",
	},
	legenda:
		"o vermelho não precisa de ocasião. essa é a rotina de terça-feira, com a essência labial tom 03 aplicada em trinta segundos antes de sair — sem making of, sem filtro.",
	observacoes:
		"segui a diretriz do briefing: não citei preço nem comparei com outro batom. deixei o produto reserva (tom nude) fora do vídeo, como combinamos.",
	rascunho: "rascunho salvo automaticamente há 2 minutos",
};

const pastaDestino = "campanha agosto / reels / look 2";

const midiasIniciais: Midia[] = [
	{
		id: "reel",
		legenda: "aplicação do vermelho na rotina real",
		tipo: "vídeo",
		meta: "00:38",
		ehVideo: true,
		foco: "center 22%",
		estado: "confirmado",
		pasta: pastaDestino,
		confirmadoEm: "3 ago, 21h14",
	},
	{
		id: "still",
		legenda: "still · flagrante da aplicação",
		tipo: "imagem de apoio",
		meta: "alta resolução",
		ehVideo: false,
		foco: "center 68%",
		estado: "enviando",
		progresso: 62,
	},
	{
		id: "bastidor",
		legenda: "bastidor · segundo ângulo da rotina",
		tipo: "imagem de apoio",
		meta: "alta resolução",
		ehVideo: false,
		foco: "center 45%",
		estado: "erro",
	},
];

export function EnvioConteudoPage() {
	const { sessao } = useSession();
	const [midias, setMidias] = useState<Midia[]>(midiasIniciais);
	const [confirmado, setConfirmado] = useState(false);
	const timers = useRef<Record<string, ReturnType<typeof setInterval>>>({});

	useEffect(() => {
		const timersAtuais = timers.current;
		return () => {
			for (const intervalo of Object.values(timersAtuais)) {
				clearInterval(intervalo);
			}
		};
	}, []);

	if (sessao?.papelAtor !== "INFLUENCIADORA") {
		return (
			<section className="envio-tela">
				<p className="envio-recap-status" style={{ padding: 32 }}>
					área restrita a parceiras.
				</p>
			</section>
		);
	}

	function tentarNovamente(id: string) {
		setMidias((atual) =>
			atual.map((midia) =>
				midia.id === id ? { ...midia, estado: "enviando", progresso: 0 } : midia,
			),
		);

		const intervalo = setInterval(() => {
			setMidias((atual) =>
				atual.map((midia) => {
					if (midia.id !== id || midia.estado !== "enviando") return midia;
					const proximoProgresso = (midia.progresso ?? 0) + 20;
					if (proximoProgresso >= 100) {
						clearInterval(timers.current[id]);
						delete timers.current[id];
						return {
							...midia,
							estado: "confirmado",
							progresso: undefined,
							pasta: pastaDestino,
							confirmadoEm: "agora mesmo",
						};
					}
					return { ...midia, progresso: proximoProgresso };
				}),
			);
		}, 500);
		timers.current[id] = intervalo;
	}

	const tudoConfirmado = midias.every((midia) => midia.estado === "confirmado");
	const emAndamento = midias.some((midia) => midia.estado === "enviando");
	const pastaConfirmada =
		midias.find((midia) => midia.estado === "confirmado")?.pasta ?? pastaDestino;

	return (
		<div className="envio-tela">
			<header className="envio-nav">
				<span className="envio-nav-marca">criativo dodô</span>
				{emAndamento ? (
					<span className="envio-nav-status" role="status" aria-live="polite">
						enviando · não feche esta aba
					</span>
				) : (
					<Link to="/hoje" className="envio-nav-link">
						voltar à sua mesa
					</Link>
				)}
			</header>

			{confirmado ? (
				<section className="envio-confirmado" aria-live="polite">
					<p className="envio-confirmado-eyebrow">{contexto.campanha}</p>
					<h1 className="envio-confirmado-titulo">material recebido.</h1>
					<p className="envio-confirmado-linha">
						guardado com segurança em <strong>{pastaConfirmada}</strong> · agora
						mesmo
					</p>
					<p className="envio-confirmado-linha">
						enviado para revisão da agência — nada foi perdido no caminho.
					</p>
					<div className="envio-confirmado-status">
						<span className="envio-confirmado-status-label">status atual</span>
						<span className="envio-confirmado-status-valor">em revisão</span>
					</div>
					<p className="envio-confirmado-nota">
						normalmente a análise leva até 2 dias — avisamos assim que tiver retorno.
					</p>
					<Link to="/hoje" className="btn-primary is-medium envio-confirmado-cta">
						voltar à sua mesa
					</Link>
				</section>
			) : (
				<>
					<div className="envio-contexto">
						<p className="envio-eyebrow">{contexto.campanha}</p>
						<h1 className="envio-titulo">enviar material</h1>
					</div>

					<section className="envio-recap" aria-label="o que você está entregando">
						<ItemTitle className="envio-recap-titulo">
							{contexto.entregavel.titulo}
						</ItemTitle>
						<p className="envio-recap-objetivo">{contexto.entregavel.objetivo}</p>
						<p className="envio-recap-prazo">{contexto.entregavel.prazo}</p>
					</section>

					<div className="envio-corpo">
						<section className="envio-secao" aria-labelledby="secao-midias">
							<p id="secao-midias" className="envio-secao-titulo">
								o que você está enviando
							</p>
							<ItemGroup className="envio-midias-lista">
								{midias.map((midia) => (
									<Item
										key={midia.id}
										className={`envio-midia-item is-${midia.estado}`}
									>
										<figure className="envio-midia-thumb">
											<img
												src={imagemCampanha}
												alt=""
												aria-hidden="true"
												style={{ objectPosition: midia.foco }}
											/>
											{midia.ehVideo ? (
												<span className="envio-midia-play" aria-hidden="true" />
											) : null}
										</figure>
										<ItemContent>
											<ItemTitle className="envio-midia-nome">
												{midia.legenda}
											</ItemTitle>
											<span className="envio-midia-meta">
												{midia.tipo} · {midia.meta}
											</span>

											{midia.estado === "enviando" ? (
												<div
													className="envio-midia-progresso"
													role="progressbar"
													aria-valuenow={midia.progresso ?? 0}
													aria-valuemin={0}
													aria-valuemax={100}
												>
													<div className="envio-midia-progresso-trilho">
														<div
															className="envio-midia-progresso-barra"
															style={{ width: `${midia.progresso ?? 0}%` }}
														/>
													</div>
													<span className="envio-midia-progresso-texto">
														enviando · {midia.progresso ?? 0}%
													</span>
												</div>
											) : null}

											{midia.estado === "confirmado" ? (
												<span className="envio-midia-status is-confirmado">
													guardado em {midia.pasta} · {midia.confirmadoEm}
												</span>
											) : null}

											{midia.estado === "erro" ? (
												<span className="envio-midia-status is-erro">
													falha de rede — nada foi perdido.{" "}
													<button
														type="button"
														className="envio-midia-retomar"
														onClick={() => tentarNovamente(midia.id)}
													>
														tentar novamente
													</button>
												</span>
											) : null}
										</ItemContent>
									</Item>
								))}
							</ItemGroup>

							<button type="button" className="envio-upload">
								<p className="envio-upload-texto">
									toque para fotografar ou escolher da galeria
								</p>
								<p className="envio-upload-meta">
									vídeo até 4 minutos, ou até 3 imagens em alta resolução — também
									aceita arrastar aqui
								</p>
							</button>
						</section>

						<section className="envio-secao" aria-labelledby="secao-legenda">
							<p id="secao-legenda" className="envio-secao-titulo">
								legenda
							</p>
							<p className="envio-legenda-texto">{contexto.legenda}</p>
						</section>

						<section className="envio-secao" aria-labelledby="secao-observacoes">
							<p id="secao-observacoes" className="envio-secao-titulo">
								observações para a marca
							</p>
							<p className="envio-observacoes-texto">{contexto.observacoes}</p>
						</section>
					</div>

					<section className="envio-confirmacao" aria-label="confirmação de envio">
						<p className="envio-confirmacao-status">{contexto.rascunho}</p>
						{!tudoConfirmado ? (
							<p className="envio-confirmacao-aviso">
								nenhum material é considerado entregue até guardarmos tudo na pasta
								certa — aguarde a confirmação antes de enviar.
							</p>
						) : null}
						<p className="envio-confirmacao-texto">
							ao confirmar, a marca recebe este material para revisão. você ainda
							pode ajustar a legenda até lá — só o vídeo, depois de enviado, não pode
							ser trocado sem avisar a marca.
						</p>
						<div className="envio-confirmacao-acoes">
							<button
								type="button"
								className="btn-primary"
								disabled={!tudoConfirmado}
								onClick={() => setConfirmado(true)}
							>
								confirmar envio
							</button>
							<Link to="/campanha" className="envio-confirmacao-revisar">
								revisar o briefing antes
							</Link>
						</div>
					</section>
				</>
			)}
		</div>
	);
}
