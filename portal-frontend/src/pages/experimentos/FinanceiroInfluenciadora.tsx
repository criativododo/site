import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError, apiFetch } from "../../lib/api";
import { useSession } from "../../lib/session";
import { formatarCompetencia, formatarData, formatarMoedaPartes, mesReferenciaCorrente } from "../../lib/formatters";
import imagemCampanha from "../../assets/mocks/campanha-essencia-labial.jpg";
import "./FinanceiroInfluenciadora.css";

/**
 * Financeiro (proposta: "reconhecimento") — sétima tela da família, continuação direta de
 * Publicacao.tsx.
 *
 * Wiring real (DOC SPRINT #2, sessão de implementação): consome
 * `GET /api/portal/financeiro/:mesReferencia/historico` (mesmo endpoint que alimenta o
 * `/financeiro` legado, `pages/Financeiro.tsx`) — `obrigacoes: ObrigacaoFinanceira[]` real,
 * com `estado`/`dataCriacao`/`dataAtualizacao`/`dataArquivamento`.
 *
 * A timeline fixture tinha 4 degraus (fechada/aprovado/enviado/pago); `EstadoObrigacao` só
 * tem 3 (`EM_ABERTO`→`APROVADO`→`PAGO`, sem transição "enviado" documentada) — o degrau
 * "enviado" não tem contrapartida real e foi removido (não inventar transição de estado,
 * ADR-003). Estrutura/CSS da timeline (`reconhecimento-timeline-passo is-X`) preservados.
 *
 * Lacuna declarada, ainda de pé: existe hoje uma rota `/financeiro` em produção
 * (pages/Financeiro.tsx, padrão de KPIs/tabela) — conflita com a diretriz desta tela.
 * `/reconhecimento` continua não colidindo; reconciliar as duas rotas fica para decisão
 * futura, fora do escopo desta sessão (mesma pendência já registrada antes desta sessão).
 *
 * "Ver comprovante": sem visualizador real (componente futuro, MELHORIAS_PRODUTO.md §16) —
 * botão preservado sem handler, mesma lacuna declarada da versão fixture.
 */

type EstadoObrigacao = "EM_ABERTO" | "APROVADO" | "PAGO";

interface ObrigacaoFinanceira {
	id: string;
	mesReferencia: string;
	valor: number;
	estado: EstadoObrigacao;
	tipo: "MENSAL" | "AVULSO";
	dataCriacao: string;
	dataAtualizacao: string;
	dataArquivamento: string | null;
}

interface ItemDeHistorico {
	obrigacoes: ObrigacaoFinanceira[];
}

interface DegrauTimeline {
	id: string;
	titulo: string;
	detalhe?: string;
	condicao: "concluido" | "atual" | "futuro";
}

function construirTimeline(obrigacao: ObrigacaoFinanceira): DegrauTimeline[] {
	return [
		{
			id: "lancada",
			titulo: "obrigação lançada",
			detalhe: formatarData(obrigacao.dataCriacao),
			condicao: "concluido",
		},
		{
			id: "aprovado",
			titulo: "aprovado para pagamento",
			detalhe: obrigacao.estado === "APROVADO" ? formatarData(obrigacao.dataAtualizacao) : undefined,
			condicao:
				obrigacao.estado === "APROVADO" || obrigacao.estado === "PAGO" ? "concluido" : "atual",
		},
		{
			id: "pago",
			titulo: "pago",
			detalhe:
				obrigacao.estado === "PAGO" && obrigacao.dataArquivamento
					? formatarData(obrigacao.dataArquivamento)
					: undefined,
			condicao:
				obrigacao.estado === "PAGO" ? "concluido" : obrigacao.estado === "APROVADO" ? "atual" : "futuro",
		},
	];
}

export function FinanceiroInfluenciadoraPage() {
	const { sessao } = useSession();
	const [historico, setHistorico] = useState<ItemDeHistorico | null>(null);
	const [mesReferencia, setMesReferencia] = useState(mesReferenciaCorrente());
	const [erro, setErro] = useState<string | null>(null);
	const [carregando, setCarregando] = useState(true);

	useEffect(() => {
		if (sessao?.papelAtor !== "INFLUENCIADORA") return;
		let ativo = true;
		const mes = mesReferenciaCorrente();
		apiFetch<ItemDeHistorico>(`/api/portal/financeiro/${mes}/historico`)
			.then((dados) => {
				if (!ativo) return;
				setHistorico(dados);
				setMesReferencia(mes);
			})
			.catch((erroCapturado) => {
				if (!ativo) return;
				if (erroCapturado instanceof ApiError && erroCapturado.status === 404) {
					setHistorico({ obrigacoes: [] });
					setMesReferencia(mes);
					return;
				}
				setErro(
					erroCapturado instanceof ApiError ? erroCapturado.message : "não foi possível carregar.",
				);
			})
			.finally(() => ativo && setCarregando(false));
		return () => {
			ativo = false;
		};
	}, [sessao?.papelAtor]);

	if (sessao?.papelAtor !== "INFLUENCIADORA") {
		return (
			<section className="reconhecimento-tela">
				<p style={{ padding: 32 }}>área restrita a parceiras.</p>
			</section>
		);
	}

	if (carregando) {
		return (
			<section className="reconhecimento-tela">
				<p style={{ padding: 32 }}>carregando</p>
			</section>
		);
	}

	if (erro || !historico) {
		return (
			<section className="reconhecimento-tela">
				<p style={{ padding: 32 }}>{erro ?? "não foi possível carregar."}</p>
			</section>
		);
	}

	if (historico.obrigacoes.length === 0) {
		return (
			<div className="reconhecimento-tela">
				<header className="reconhecimento-nav">
					<span className="reconhecimento-nav-marca">criativo dodô</span>
					<Link to="/hoje" className="reconhecimento-nav-link">
						voltar à sua mesa
					</Link>
				</header>
				<div className="reconhecimento-contexto">
					<p className="reconhecimento-eyebrow">
						colaboração de {formatarCompetencia(mesReferencia)}
					</p>
					<h1 className="reconhecimento-frase">
						nenhuma obrigação financeira registrada este mês ainda.
					</h1>
				</div>
			</div>
		);
	}

	const obrigacaoPrincipal =
		historico.obrigacoes.find((obrigacao) => obrigacao.tipo === "MENSAL") ?? historico.obrigacoes[0];
	const valorTotal = historico.obrigacoes.reduce((total, obrigacao) => total + obrigacao.valor, 0);
	const todasPagas = historico.obrigacoes.every((obrigacao) => obrigacao.estado === "PAGO");
	const timeline = construirTimeline(obrigacaoPrincipal);
	const { reais, centavos } = formatarMoedaPartes(valorTotal);

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
					<img src={imagemCampanha} alt="" style={{ objectPosition: "center 22%" }} />
				</div>
				<p className="reconhecimento-eyebrow">
					colaboração de {formatarCompetencia(mesReferencia)}
				</p>
				<h1 className="reconhecimento-frase">sua colaboração deste mês foi reconhecida.</h1>
			</div>

			<div className="reconhecimento-corpo">
				<section className="reconhecimento-valor" aria-labelledby="reconhecimento-valor-titulo">
					<p id="reconhecimento-valor-titulo" className="reconhecimento-valor-label">
						o reconhecimento por esta colaboração
					</p>
					<p className="reconhecimento-valor-numero">
						{reais}
						<span className="reconhecimento-valor-centavos">{centavos}</span>
					</p>
					<p className="reconhecimento-valor-estado">
						{todasPagas && obrigacaoPrincipal.dataArquivamento
							? `consolidado em ${formatarData(obrigacaoPrincipal.dataArquivamento)}`
							: "a caminho — você será avisada assim que for concluído"}
					</p>
				</section>

				<section className="reconhecimento-secao" aria-labelledby="secao-timeline">
					<p id="secao-timeline" className="reconhecimento-secao-titulo">
						acompanhamento
					</p>
					<ol className="reconhecimento-timeline">
						{timeline.map((passo) => (
							<li key={passo.id} className={`reconhecimento-timeline-passo is-${passo.condicao}`}>
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

					{todasPagas && (
						<button type="button" className="reconhecimento-acao-secundaria">
							ver comprovante
						</button>
					)}
				</section>
			</div>

			<section className="reconhecimento-rodape" aria-label="fechamento">
				<p className="reconhecimento-rodape-nota">
					a colaboração deste mês está completa. quando a próxima competência for aberta,
					você vê por aqui.
				</p>
				<button type="button" className="reconhecimento-divergencia">
					algo parece errado? avisar a agência
				</button>
			</section>
		</div>
	);
}
