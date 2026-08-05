import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ApiError, apiFetch } from "../lib/api";
import { ORDEM_CATEGORIAS, rotuloCategoriaMensagem, type CategoriaModeloMensagem } from "../lib/comunicacaoLabels";
import { formatarData } from "../lib/formatters";
import { useSession } from "../lib/session";
import "./AdminComunicacao.css";

/**
 * Comunicação (Sprint 2) — central de comunicação assistida, exclusiva do Administrador. Não é
 * chat, não é automação, não é CRM: o Portal só prepara texto (variáveis já resolvidas) e
 * registra o que foi preparado — quem manda a mensagem é o Administrador, pelo WhatsApp, fora
 * do Portal.
 *
 * Esta tela é referência e histórico, nunca o ponto de partida para escrever uma mensagem: a
 * spec é explícita — "nunca quero abrir uma tela vazia para escrever mensagens; sempre parto da
 * Parceira, da Campanha ou da Colaboração Mensal". O fluxo de envio (escolher modelo ou
 * personalizada, pré-visualizar, abrir no WhatsApp) mora dentro da Ficha da Parceira
 * (`pages/CentralInfluenciadora.tsx`, botão "enviar mensagem"), nunca aqui.
 *
 * Por isso esta tela não tem nenhuma ação de "nova mensagem": só os modelos disponíveis (por
 * categoria), as variáveis suportadas e o histórico geral ("mensagens recentes").
 *
 * Revisão editorial (auditoria obrigatória, sessão desta tarefa): a implementação/dados/estados
 * não mudaram — só o invólucro visual. Antes desta revisão, a tela vivia dentro do PortalLayout
 * com o vocabulário genérico de `.portal-page` (mesmo de `Perfil.tsx`, formulário operacional) —
 * não pertencia à família editorial autônoma das telas de referência (Publicação, Envio,
 * Identidade, Dashboard da Marca, Mesa da Campanha, Central de Influenciadoras). Passa a usar
 * exatamente o mesmo invólucro dessa família: nav sticky própria, coluna de 640px, eyebrow + h1,
 * seções com borda superior, rodapé — mesmo padrão de `CentralInfluenciadora.tsx`
 * (`ficha-*`)/`Publicacao.tsx` (`publicacao-*`), prefixo `comunicacao-` próprio.
 *
 * Sem telefone da Parceira modelado no domínio hoje (só `pix`/`email`/`cnpj` em `Parceira`) —
 * "abrir no WhatsApp" (na Ficha) abre `wa.me` sem destinatário pré-selecionado, só com o texto
 * preenchido; o Administrador escolhe o contato. Lacuna declarada (ADR-003), não presumida:
 * adicionar telefone ao cadastro é decisão de Produto fora do escopo desta tela.
 */

type CategoriaMensagemPreparada = CategoriaModeloMensagem | "PERSONALIZADA";

interface ModeloMensagem {
	id: string;
	categoria: CategoriaModeloMensagem;
	titulo: string;
	corpo: string;
}

interface VariavelSuportada {
	variavel: string;
	descricao: string;
}

interface ReferenciaModelos {
	modelos: ModeloMensagem[];
	modelosPorCategoria: Record<CategoriaModeloMensagem, ModeloMensagem[]>;
	variaveis: VariavelSuportada[];
}

interface MensagemPreparada {
	id: string;
	parceiraId: string;
	parceiraNome: string;
	categoria: CategoriaMensagemPreparada;
	modeloId: string | null;
	corpoFinal: string;
	preparadoPor: string;
	preparadoEm: string;
}

function formatarDataHora(iso: string): string {
	const data = new Date(iso);
	const hora = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
	return `${formatarData(iso)} às ${hora}`;
}

export function AdminComunicacaoPage() {
	const { sessao } = useSession();
	const [referencia, setReferencia] = useState<ReferenciaModelos | null>(null);
	const [recentes, setRecentes] = useState<MensagemPreparada[] | null>(null);
	const [erro, setErro] = useState<string | null>(null);
	const [carregando, setCarregando] = useState(true);

	useEffect(() => {
		let ativo = true;
		setCarregando(true);
		setErro(null);

		Promise.all([
			apiFetch<ReferenciaModelos>("/api/admin/comunicacao/modelos"),
			apiFetch<{ itens: MensagemPreparada[] }>("/api/admin/comunicacao/"),
		])
			.then(([dadosReferencia, dadosHistorico]) => {
				if (!ativo) return;
				setReferencia(dadosReferencia);
				setRecentes(dadosHistorico.itens);
			})
			.catch((erroCapturado) => {
				if (!ativo) return;
				setErro(
					erroCapturado instanceof ApiError
						? erroCapturado.message
						: "não foi possível carregar a central de comunicação.",
				);
			})
			.finally(() => ativo && setCarregando(false));

		return () => {
			ativo = false;
		};
	}, []);

	if (sessao?.papelAtor !== "ADMINISTRADOR") {
		return (
			<div className="comunicacao-tela">
				<p style={{ padding: 32 }}>área restrita a administradores.</p>
			</div>
		);
	}

	return (
		<div className="comunicacao-tela">
			<header className="comunicacao-nav">
				<span className="comunicacao-nav-marca">criativo dodô</span>
				<Link to="/admin/campanha" className="comunicacao-nav-link">
					voltar à mesa da campanha
				</Link>
			</header>

			{carregando && <p style={{ padding: 32 }}>carregando</p>}
			{!carregando && erro && (
				<p style={{ padding: 32 }} className="comunicacao-vazio">
					{erro}
				</p>
			)}

			{!carregando && !erro && referencia && (
				<>
					<div className="comunicacao-contexto">
						<p className="comunicacao-eyebrow">central de comunicação assistida</p>
						<h1 className="comunicacao-titulo">comunicação</h1>
						<p className="comunicacao-intro">
							modelos, variáveis e o histórico do que já foi preparado para as parceiras. para
							enviar uma mensagem, abra a ficha da parceira e use "enviar mensagem" — esta tela é
							só referência e histórico.
						</p>
					</div>

					<div className="comunicacao-corpo">
						<section className="comunicacao-secao" aria-labelledby="secao-modelos">
							<p id="secao-modelos" className="comunicacao-secao-titulo">
								modelos por categoria
							</p>
							<div className="comunicacao-categorias">
								{ORDEM_CATEGORIAS.map((categoria) => {
									const modelos = referencia.modelosPorCategoria[categoria] ?? [];
									if (modelos.length === 0) return null;
									return (
										<div className="comunicacao-categoria" key={categoria}>
											<p className="comunicacao-categoria-titulo">{rotuloCategoriaMensagem(categoria)}</p>
											<ul className="comunicacao-modelos-lista">
												{modelos.map((modelo) => (
													<li key={modelo.id} className="comunicacao-modelo-item">
														<span className="comunicacao-modelo-titulo">{modelo.titulo}</span>
														<span className="comunicacao-modelo-corpo">{modelo.corpo}</span>
													</li>
												))}
											</ul>
										</div>
									);
								})}
							</div>
						</section>

						<section className="comunicacao-secao" aria-labelledby="secao-variaveis">
							<p id="secao-variaveis" className="comunicacao-secao-titulo">
								variáveis disponíveis
							</p>
							<ul className="comunicacao-variaveis-lista">
								{referencia.variaveis.map((variavel) => (
									<li key={variavel.variavel} className="comunicacao-variavel-item">
										<code className="comunicacao-variavel-codigo">{variavel.variavel}</code>
										<span className="comunicacao-variavel-descricao">{variavel.descricao}</span>
									</li>
								))}
							</ul>
						</section>

						<section className="comunicacao-secao" aria-labelledby="secao-recentes">
							<p id="secao-recentes" className="comunicacao-secao-titulo">
								mensagens recentes
							</p>
							{!recentes || recentes.length === 0 ? (
								<p className="comunicacao-vazio">nenhuma mensagem preparada ainda.</p>
							) : (
								<ul className="comunicacao-historico-lista">
									{recentes.map((mensagem) => (
										<li key={mensagem.id} className="comunicacao-historico-item">
											<div className="comunicacao-historico-cabecalho">
												<span className="comunicacao-historico-parceira">{mensagem.parceiraNome}</span>
												<span className="comunicacao-historico-categoria">
													{rotuloCategoriaMensagem(mensagem.categoria)}
												</span>
											</div>
											<p className="comunicacao-historico-corpo">{mensagem.corpoFinal}</p>
											<span className="comunicacao-historico-meta">
												preparada em {formatarDataHora(mensagem.preparadoEm)}
											</span>
										</li>
									))}
								</ul>
							)}
						</section>
					</div>

					<section className="comunicacao-rodape" aria-label="fechamento">
						<p className="comunicacao-rodape-nota">
							essas são as ferramentas de comunicação disponíveis — atualizamos assim que um novo
							modelo entrar.
						</p>
					</section>
				</>
			)}
		</div>
	);
}
