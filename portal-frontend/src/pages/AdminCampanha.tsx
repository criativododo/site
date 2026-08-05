import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError, apiFetch } from "../lib/api";
import { formatadorMoeda, formatarCompetencia, formatarDiaMes, formatarPrazoRelativo } from "../lib/formatters";
import { useSession } from "../lib/session";
import imagemCampanha from "../assets/mocks/campanha-essencia-labial.jpg";
import "./AdminCampanha.css";

/**
 * Mesa da Campanha (ADR-023) — hub pós-login do Administrador. "Campanha" aqui é conceito de
 * produto (o panorama agregado de toda a operação corrente), nunca sinônimo de
 * `ColaboracaoMensal` (ADR-002 continua vigente no domínio) — ver ADR-023 para a decisão
 * completa e a reconciliação de vocabulário.
 *
 * Mesma língua visual de `MarcaDashboard.tsx`/`pages/experimentos/Publicacao.tsx`: página
 * autônoma, fora do shell de sidebar, fotografia editorial como abertura, timeline
 * reaproveitada, narrativas em vez de tabela/grid administrativo.
 *
 * Direção (ADR-023, aprovação do responsável do projeto):
 * 1. Responde só "como está esta campanha?" primeiro — frase de estado + narrativa, antes de
 *    qualquer seção de detalhe.
 * 2. "Pede atenção" reaproveita a mesma exceção operacional da Dashboard da Marca (mesmo dado,
 *    outra plateia — o Administrador vê a mesma verdade que a Marca vê).
 * 3. Timeline única para "o que vem a seguir" (mesmo componente estrutural da família).
 * 4. Pagamentos é escopado à competência atual (`PanoramaCampanha.competenciaAtual`) —
 *    diferente do Financeiro administrativo (`/admin/financeiro`), que é histórico completo.
 * 5. Atalhos são dado (array), não JSX fixo — Comunicação/Resultados entram por adição de
 *    item quando existirem, nunca antes: nenhum "em breve"/placeholder para módulo que não
 *    existe (decisão explícita do responsável do projeto — "produto honesto").
 * 6. Logística (SPEC-016) não tem módulo implementado — aparece só como narrativa, nunca como
 *    atalho de navegação (mesmo texto fixture de `MarcaDashboard.tsx`, mesma lacuna).
 * 7. `/admin/dashboard` (Dashboard Administrativo, Sprint 2) permanece intacto — deixa de ser
 *    o destino pós-login, não deixa de existir; alcançável pelo menu administrativo.
 */

interface ProximoPrazo {
	tipo: "entrega" | "postagem";
	parceiraNome: string;
	formato: string;
	data: string;
	diasRestantes: number;
}

interface ExcecaoOperacional {
	tipo: "atrasado" | "em_revisao";
	parceiraNome: string;
	formato: string;
	data: string | null;
}

interface PanoramaCampanha {
	competenciaAtual: string;
	parceiras: { ativas: number; inativas: number; total: number; nomesAtivas: string[] };
	entregas: { aguardandoMaterial: number; emRevisao: number; atrasadas: number };
	proximosPrazos: ProximoPrazo[];
	excecoes: ExcecaoOperacional[];
	pagamentos: { pendentes: number; valorPendente: number };
}

interface Atalho {
	titulo: string;
	descricao: string;
	href: string;
}

/** ADR-023: só os 4 módulos que existem hoje — nunca "em breve" para o que não existe. */
const atalhos: Atalho[] = [
	{
		titulo: "dashboard da marca",
		descricao: "o que a marca está vendo agora sobre esta campanha.",
		href: "/marca/dashboard",
	},
	{
		titulo: "central de influenciadoras",
		descricao: "todas as parceiras, ativas e inativas.",
		href: "/admin/parceiras",
	},
	{
		titulo: "aprovação",
		descricao: "materiais aguardando decisão da agência.",
		href: "/admin/entregas",
	},
	{
		titulo: "financeiro",
		descricao: "obrigações e pagamentos de todas as competências.",
		href: "/admin/financeiro",
	},
];

const contexto = {
	campanha: "mesa da campanha",
	assunto: "essência labial",
};

/** Lacuna declarada (ADR-003/ADR-023): sem módulo de logística implementado (SPEC-016 é só especificação). */
const logisticaFixture = [
	"2 kits já chegaram até as parceiras.",
	"1 remessa ainda está a caminho.",
	"nenhum atraso registrado no envio dos produtos.",
];

function fraseDeEstado(excecoes: ExcecaoOperacional[]): string {
	if (excecoes.length === 0) {
		return "a campanha segue dentro do esperado.";
	}
	return excecoes.length === 1
		? "1 item pede atenção nesta campanha."
		: `${excecoes.length} itens pedem atenção nesta campanha.`;
}

function narrativaDeEstado(panorama: PanoramaCampanha): string {
	if (panorama.parceiras.total === 0) {
		return "nada em andamento ainda.";
	}

	const entregasNoPrazo = panorama.entregas.aguardandoMaterial - panorama.entregas.atrasadas;
	const partes: string[] = [
		panorama.parceiras.ativas === 1
			? "1 parceira segue ativa nesta campanha"
			: `${panorama.parceiras.ativas} parceiras seguem ativas nesta campanha`,
	];

	if (entregasNoPrazo > 0) {
		partes.push(
			entregasNoPrazo === 1
				? "1 material segue dentro do prazo"
				: `${entregasNoPrazo} materiais seguem dentro do prazo`,
		);
	}

	return `${partes.join("; ")}.`;
}

function fraseDeAtencao(excecao: ExcecaoOperacional): string {
	if (excecao.tipo === "atrasado" && excecao.data) {
		return `${excecao.parceiraNome} ainda não enviou o material previsto para ${formatarDiaMes(excecao.data)}.`;
	}
	return `${excecao.parceiraNome} tem um conteúdo aguardando aprovação.`;
}

function frasesDeParticipantes(nomesAtivas: string[]): string {
	if (nomesAtivas.length === 0) {
		return "nenhuma parceira ativa no momento.";
	}
	const limite = 5;
	const nomes = nomesAtivas.slice(0, limite).join(", ");
	const resto = nomesAtivas.length - limite;
	return resto > 0 ? `${nomes} e mais ${resto}.` : `${nomes}.`;
}

function fraseDeMateriais(entregas: PanoramaCampanha["entregas"]): string {
	if (entregas.aguardandoMaterial === 0) {
		return "nenhum material aguardando envio no momento.";
	}
	const partes = [
		entregas.aguardandoMaterial === 1
			? "1 material aguarda envio"
			: `${entregas.aguardandoMaterial} materiais aguardam envio`,
	];
	if (entregas.atrasadas > 0) {
		partes.push(entregas.atrasadas === 1 ? "1 já atrasado" : `${entregas.atrasadas} já atrasados`);
	}
	return `${partes.join(", ")}.`;
}

function fraseDeAprovacoes(emRevisao: number): string {
	if (emRevisao === 0) {
		return "nada aguardando decisão da agência agora.";
	}
	return emRevisao === 1
		? "1 conteúdo aguarda aprovação da agência."
		: `${emRevisao} conteúdos aguardam aprovação da agência.`;
}

function fraseDePagamentos(pagamentos: PanoramaCampanha["pagamentos"], competencia: string): string {
	if (pagamentos.pendentes === 0) {
		return `nenhum pagamento pendente na competência de ${formatarCompetencia(competencia)}.`;
	}
	const quantidade = pagamentos.pendentes === 1 ? "1 pagamento pendente" : `${pagamentos.pendentes} pagamentos pendentes`;
	return `${quantidade} na competência de ${formatarCompetencia(competencia)}, somando ${formatadorMoeda.format(pagamentos.valorPendente)}.`;
}

export function AdminCampanhaPage() {
	const { sessao, logout } = useSession();
	const [panorama, setPanorama] = useState<PanoramaCampanha | null>(null);
	const [erro, setErro] = useState<string | null>(null);
	const [carregando, setCarregando] = useState(true);

	useEffect(() => {
		let ativo = true;
		setCarregando(true);
		setErro(null);

		apiFetch<PanoramaCampanha>("/api/admin/campanha")
			.then((dados) => ativo && setPanorama(dados))
			.catch((erroCapturado) => {
				if (!ativo) return;
				setErro(
					erroCapturado instanceof ApiError
						? erroCapturado.message
						: "não foi possível carregar a mesa da campanha.",
				);
			})
			.finally(() => ativo && setCarregando(false));

		return () => {
			ativo = false;
		};
	}, []);

	if (sessao?.papelAtor !== "ADMINISTRADOR") {
		return (
			<div className="campanha-tela">
				<p style={{ padding: 32 }}>área restrita a administradores.</p>
			</div>
		);
	}

	return (
		<div className="campanha-tela">
			<header className="campanha-nav">
				<span className="campanha-nav-marca">criativo dodô</span>
				<button type="button" className="campanha-nav-sair" onClick={() => void logout()}>
					sair
				</button>
			</header>

			{carregando && <p style={{ padding: 32 }}>carregando</p>}
			{!carregando && erro && (
				<p style={{ padding: 32 }} className="campanha-vazio">
					{erro}
				</p>
			)}

			{!carregando && !erro && panorama && (
				<>
					<figure className="campanha-foto">
						<img src={imagemCampanha} alt="" aria-hidden="true" style={{ objectPosition: "center 45%" }} />
					</figure>

					<div className="campanha-contexto">
						<p className="campanha-eyebrow">{contexto.campanha}</p>
						<p className="campanha-assunto">{contexto.assunto}</p>
						<h1 className="campanha-frase">{fraseDeEstado(panorama.excecoes)}</h1>
						<p className="campanha-narrativa">{narrativaDeEstado(panorama)}</p>
					</div>

					<div className="campanha-corpo">
						{panorama.excecoes.length > 0 && (
							<section className="campanha-secao" aria-labelledby="secao-atencao">
								<p id="secao-atencao" className="campanha-secao-titulo">
									pede atenção
								</p>
								<ul className="campanha-atencao-lista">
									{panorama.excecoes.map((excecao, indice) => (
										<li key={`${excecao.tipo}-${indice}`} className="campanha-atencao-item">
											<span className="campanha-atencao-marcador" aria-hidden="true" />
											<span className="campanha-atencao-texto">{fraseDeAtencao(excecao)}</span>
										</li>
									))}
								</ul>
							</section>
						)}

						<section className="campanha-secao" aria-labelledby="secao-timeline">
							<p id="secao-timeline" className="campanha-secao-titulo">
								o que vem a seguir
							</p>
							{panorama.proximosPrazos.length === 0 ? (
								<p className="campanha-vazio">nada previsto para os próximos dias.</p>
							) : (
								<ol className="campanha-timeline">
									{panorama.proximosPrazos.map((prazo, indice) => (
										<li
											key={`${prazo.tipo}-${prazo.data}-${indice}`}
											className={`campanha-timeline-passo${indice === 0 ? " is-atual" : ""}`}
										>
											<span className="campanha-timeline-marcador" aria-hidden="true" />
											<div className="campanha-timeline-conteudo">
												<span className="campanha-timeline-titulo">
													{prazo.tipo === "entrega" ? "entrega" : "postagem"} de {prazo.parceiraNome}
												</span>
												<span className="campanha-timeline-detalhe">
													{formatarPrazoRelativo(prazo.diasRestantes)}
												</span>
											</div>
										</li>
									))}
								</ol>
							)}
						</section>

						<section className="campanha-secao" aria-labelledby="secao-participantes">
							<p id="secao-participantes" className="campanha-secao-titulo">
								participantes
							</p>
							<p className="campanha-secao-texto">{frasesDeParticipantes(panorama.parceiras.nomesAtivas)}</p>
							<Link to="/admin/parceiras" className="campanha-secao-link">
								ver central de influenciadoras
							</Link>
						</section>

						<section className="campanha-secao" aria-labelledby="secao-materiais">
							<p id="secao-materiais" className="campanha-secao-titulo">
								materiais
							</p>
							<p className="campanha-secao-texto">{fraseDeMateriais(panorama.entregas)}</p>
							<Link to="/admin/entregas" className="campanha-secao-link">
								ver entregas
							</Link>
						</section>

						<section className="campanha-secao" aria-labelledby="secao-aprovacoes">
							<p id="secao-aprovacoes" className="campanha-secao-titulo">
								aprovações
							</p>
							<p className="campanha-secao-texto">{fraseDeAprovacoes(panorama.entregas.emRevisao)}</p>
							<Link to="/admin/entregas" className="campanha-secao-link">
								revisar agora
							</Link>
						</section>

						<section className="campanha-secao" aria-labelledby="secao-logistica">
							<p id="secao-logistica" className="campanha-secao-titulo">
								logística
							</p>
							<ul className="campanha-logistica-lista">
								{logisticaFixture.map((linha) => (
									<li key={linha} className="campanha-logistica-linha">
										{linha}
									</li>
								))}
							</ul>
						</section>

						<section className="campanha-secao" aria-labelledby="secao-pagamentos">
							<p id="secao-pagamentos" className="campanha-secao-titulo">
								pagamentos
							</p>
							<p className="campanha-secao-texto">
								{fraseDePagamentos(panorama.pagamentos, panorama.competenciaAtual)}
							</p>
							<Link to="/admin/financeiro" className="campanha-secao-link">
								ver financeiro
							</Link>
						</section>

						<section className="campanha-secao" aria-labelledby="secao-atalhos">
							<p id="secao-atalhos" className="campanha-secao-titulo">
								ir para
							</p>
							<div className="campanha-atalhos-lista">
								{atalhos.map((atalho) => (
									<Link key={atalho.href} to={atalho.href} className="campanha-atalho">
										<span className="campanha-atalho-titulo">{atalho.titulo}</span>
										<span className="campanha-atalho-descricao">{atalho.descricao}</span>
									</Link>
								))}
							</div>
						</section>
					</div>

					<section className="campanha-rodape" aria-label="fechamento">
						<p className="campanha-rodape-nota">
							esse é o retrato da campanha até agora — atualizamos assim que algo mudar.
						</p>
					</section>
				</>
			)}
		</div>
	);
}
