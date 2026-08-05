import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError, apiFetch } from "../lib/api";
import { ORDEM_CATEGORIAS, rotuloCategoriaMensagem, type CategoriaModeloMensagem } from "../lib/comunicacaoLabels";
import {
	formatadorMoeda,
	formatarCompetencia,
	formatarData,
	formatarDiaMes,
	formatarPrazoRelativo,
} from "../lib/formatters";
import { useSession } from "../lib/session";
import {
	rotuloEstadoObrigacao,
	rotuloFormatoEntrega,
	rotuloStatusDocumento,
	rotuloStatusParceira,
	rotuloTipoDocumento,
	type EstadoObrigacao,
	type StatusDocumentoEmitido,
	type StatusParceira,
	type TipoDocumentoEmitido,
	type TipoObrigacao,
} from "../lib/statusLabels";
import "./CentralInfluenciadora.css";

/**
 * Central de Influenciadoras (Sprint 2) — ficha completa de uma Parceira. Mesma família visual
 * autônoma de `MarcaDashboard.tsx`/`AdminCampanha.tsx`/`pages/experimentos/PerfilInfluenciadora.tsx`:
 * página fora do shell de sidebar, narrativas em vez de tabela/grid administrativo.
 *
 * Diferente de `AdminCampanha.tsx`/`MarcaDashboard.tsx` (que abrem com a fotografia da campanha
 * como protagonista), esta tela segue a inversão já estabelecida em `PerfilInfluenciadoraPage`:
 * o nome da Parceira é o h1, não uma frase de estado — porque o assunto aqui é o livro inteiro
 * de uma parceria, não o capítulo de uma campanha. Sem fotografia: não existe retrato real da
 * Parceira nos dados hoje (lacuna declarada, ADR-003) — monograma editorial no lugar, mesma
 * solução de `PerfilInfluenciadoraPage`.
 *
 * `AdminParceiras.tsx` continua sendo a lista/índice administrativo (busca, cadastro, edição de
 * condição comercial, ativar/desativar) — esta tela é o destino ao abrir uma Parceira específica
 * a partir de lá, nunca sua substituta.
 *
 * Lacuna declarada (ADR-003, não presumida): não existe campo de Observações (notas livres do
 * Administrador) implementado neste repositório — a seção não aparece aqui, seguindo a mesma
 * disciplina de "produto honesto" já usada em `AdminCampanha.tsx` (ADR-023). "Cupom" não é uma
 * seção separada: é `parceira.chave` (ChaveInfluenciadora, SPEC-002 §6.2), exibida junto à
 * identidade. "Nota fiscal" não é um tipo de documento distinto hoje — o mais próximo existente
 * é "recibo", listado em Documentos como qualquer outro tipo emitido.
 *
 * "Enviar mensagem" (Comunicação, Sprint 2) abre um modal que resolve as variáveis `{{...}}` dos
 * modelos usando esta mesma Ficha já carregada (nome/cupom/pix/campanha/valor/prazo) — sem
 * round-trip extra ao backend para isso; o backend só recebe o texto final para persistir o
 * histórico (`POST /api/admin/comunicacao/preparar`). Sem telefone da Parceira modelado no
 * domínio hoje (só `pix`/`email`/`cnpj` em `Parceira`) — "abrir no WhatsApp" abre `wa.me` sem
 * destinatário pré-selecionado, só com o texto preenchido; o Administrador escolhe o contato.
 * Lacuna declarada (ADR-003), não presumida.
 */

interface CondicaoComercial {
	valorMensal: number;
	entregaveisReel: number;
	entregaveisCarrossel: number;
	entregaveisStories: number;
	prazoUsoImagemDias: number;
}

interface Parceira {
	id: string;
	chave: string;
	nome: string;
	email: string;
	cnpj: string;
	pix: string;
	status: StatusParceira;
	condicaoComercial: CondicaoComercial;
	dataCriacao: string;
}

interface ColaboracaoMensal {
	id: string;
	parceiraId: string;
	mesReferencia: string;
	condicaoComercial: CondicaoComercial;
	status: "COMPILADA";
	criadoPor: string;
	criadoEm: string;
	quantidadeRegistrosGerados: number;
}

interface ObrigacaoFinanceira {
	id: string;
	parceiraId: string;
	mesReferencia: string;
	valor: number;
	estado: EstadoObrigacao;
	tipo: TipoObrigacao;
	dataCriacao: string;
	dataAtualizacao: string;
	dataArquivamento: string | null;
}

interface DocumentoEmitido {
	id: string;
	tipo: TipoDocumentoEmitido;
	parceiraId: string;
	colaboracaoMensalId: string | null;
	geradoEm: string;
	geradoPor: string;
	status: StatusDocumentoEmitido;
	hash: string;
	urlStorage: string;
	storageFileId: string;
}

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

interface FichaParceira {
	parceira: Parceira;
	competenciaAtual: string;
	colaboracaoAtual: ColaboracaoMensal | null;
	historicoColaboracoes: ColaboracaoMensal[];
	entregas: { aguardandoMaterial: number; emRevisao: number; atrasadas: number };
	proximosPrazos: ProximoPrazo[];
	excecoes: ExcecaoOperacional[];
	financeiro: {
		obrigacoesPendentes: ObrigacaoFinanceira[];
		obrigacoesPagas: ObrigacaoFinanceira[];
		valorPendente: number;
	};
	documentos: DocumentoEmitido[];
}

interface ModeloMensagem {
	id: string;
	categoria: CategoriaModeloMensagem;
	titulo: string;
	corpo: string;
}

interface ReferenciaModelosMensagem {
	modelos: ModeloMensagem[];
	modelosPorCategoria: Record<CategoriaModeloMensagem, ModeloMensagem[]>;
}

function obterIniciais(nome: string): string {
	const partes = nome.trim().split(/\s+/).filter(Boolean);
	if (partes.length === 0) return "";
	const primeira = partes[0]?.[0] ?? "";
	const ultima = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? "") : "";
	return (primeira + ultima).toUpperCase();
}

function fraseDeEstado(excecoes: ExcecaoOperacional[]): string {
	if (excecoes.length === 0) {
		return "a colaboração segue dentro do esperado.";
	}
	return excecoes.length === 1
		? "1 item pede atenção nesta colaboração."
		: `${excecoes.length} itens pedem atenção nesta colaboração.`;
}

function narrativaDeEstado(entregas: FichaParceira["entregas"]): string {
	const noPrazo = entregas.aguardandoMaterial - entregas.atrasadas;
	const partes: string[] = [];
	if (noPrazo > 0) {
		partes.push(noPrazo === 1 ? "1 material segue dentro do prazo" : `${noPrazo} materiais seguem dentro do prazo`);
	}
	if (entregas.emRevisao > 0) {
		partes.push(
			entregas.emRevisao === 1
				? "1 conteúdo aguarda decisão da agência"
				: `${entregas.emRevisao} conteúdos aguardam decisão da agência`,
		);
	}
	return partes.length > 0 ? `${partes.join("; ")}.` : "nada em andamento no momento.";
}

function fraseDeAtencao(excecao: ExcecaoOperacional): string {
	const formato = rotuloFormatoEntrega(excecao.formato);
	if (excecao.tipo === "atrasado" && excecao.data) {
		return `o material de ${formato} previsto para ${formatarDiaMes(excecao.data)} ainda não foi enviado.`;
	}
	return `um conteúdo de ${formato} está aguardando aprovação da agência.`;
}

function fraseDeColaboracaoAtual(ficha: FichaParceira): string {
	if (!ficha.colaboracaoAtual) {
		return `a colaboração de ${formatarCompetencia(ficha.competenciaAtual)} ainda não foi compilada.`;
	}
	const quantidade = ficha.colaboracaoAtual.quantidadeRegistrosGerados;
	return quantidade === 1 ? "1 registro vinculado nesta competência." : `${quantidade} registros vinculados nesta competência.`;
}

function fraseDeFinanceiro(financeiro: FichaParceira["financeiro"]): string {
	if (financeiro.obrigacoesPendentes.length === 0) {
		return "nenhum pagamento pendente no momento.";
	}
	const quantidade =
		financeiro.obrigacoesPendentes.length === 1
			? "1 pagamento pendente"
			: `${financeiro.obrigacoesPendentes.length} pagamentos pendentes`;
	return `${quantidade}, somando ${formatadorMoeda.format(financeiro.valorPendente)}.`;
}

/**
 * Substitui as variáveis `{{...}}` de um modelo pelo contexto real da Ficha (Comunicação,
 * Sprint 2). `{{valor}}` prioriza a obrigação pendente mais próxima; sem pendência, cai para o
 * valor mensal contratado. `{{prazo}}` usa o próximo prazo da Ficha; sem prazo futuro, deixa um
 * texto de fallback visível (nunca uma data inventada) para o Administrador notar e ajustar.
 */
function resolverVariaveis(corpo: string, ficha: FichaParceira): string {
	const obrigacaoRelevante = ficha.financeiro.obrigacoesPendentes[0] ?? null;
	const proximoPrazo = ficha.proximosPrazos[0] ?? null;

	const valores: Record<string, string> = {
		"{{nome}}": ficha.parceira.nome,
		"{{campanha}}": formatarCompetencia(ficha.competenciaAtual),
		"{{valor}}": formatadorMoeda.format(
			obrigacaoRelevante ? obrigacaoRelevante.valor : ficha.parceira.condicaoComercial.valorMensal,
		),
		"{{pix}}": ficha.parceira.pix || "(pix não informado)",
		"{{prazo}}": proximoPrazo ? formatarDiaMes(proximoPrazo.data) : "(sem prazo definido no momento)",
		"{{cupom}}": ficha.parceira.chave,
	};

	return corpo.replace(/\{\{[a-z]+\}\}/g, (variavel) => valores[variavel] ?? variavel);
}

function ModalEnviarMensagem({
	ficha,
	referencia,
	aoFechar,
}: {
	ficha: FichaParceira;
	referencia: ReferenciaModelosMensagem;
	aoFechar: () => void;
}) {
	const primeiroModelo = referencia.modelos[0] ?? null;
	const [selecaoId, setSelecaoId] = useState<string>(primeiroModelo ? primeiroModelo.id : "PERSONALIZADA");
	const [corpo, setCorpo] = useState<string>(primeiroModelo ? resolverVariaveis(primeiroModelo.corpo, ficha) : "");
	const [enviando, setEnviando] = useState(false);
	const [erro, setErro] = useState<string | null>(null);

	useEffect(() => {
		function aoTeclar(evento: KeyboardEvent) {
			if (evento.key === "Escape") aoFechar();
		}
		document.addEventListener("keydown", aoTeclar);
		return () => document.removeEventListener("keydown", aoTeclar);
	}, [aoFechar]);

	function selecionar(novoId: string) {
		setSelecaoId(novoId);
		if (novoId === "PERSONALIZADA") {
			setCorpo("");
			return;
		}
		const modelo = referencia.modelos.find((candidato) => candidato.id === novoId);
		setCorpo(modelo ? resolverVariaveis(modelo.corpo, ficha) : "");
	}

	/** RN desta tela: o Portal nunca envia — só registra o histórico e abre o WhatsApp com o texto preenchido. */
	async function abrirNoWhatsapp() {
		if (!corpo.trim()) {
			setErro("escreva ou escolha uma mensagem antes de continuar.");
			return;
		}

		setEnviando(true);
		setErro(null);
		const modeloSelecionado = selecaoId === "PERSONALIZADA" ? null : referencia.modelos.find((m) => m.id === selecaoId) ?? null;

		try {
			await apiFetch("/api/admin/comunicacao/preparar", {
				method: "POST",
				body: JSON.stringify({
					parceiraId: ficha.parceira.id,
					categoria: modeloSelecionado ? modeloSelecionado.categoria : "PERSONALIZADA",
					modeloId: modeloSelecionado ? modeloSelecionado.id : null,
					corpoFinal: corpo,
				}),
			});
			window.open(`https://wa.me/?text=${encodeURIComponent(corpo)}`, "_blank", "noopener");
			aoFechar();
		} catch (erroCapturado) {
			setErro(
				erroCapturado instanceof ApiError ? erroCapturado.message : "não foi possível preparar a mensagem.",
			);
		} finally {
			setEnviando(false);
		}
	}

	return (
		<div className="ficha-modal-overlay" role="presentation" onClick={aoFechar}>
			<div
				className="ficha-modal"
				role="dialog"
				aria-modal="true"
				aria-labelledby="modal-enviar-mensagem-titulo"
				onClick={(evento) => evento.stopPropagation()}
			>
				<div className="ficha-modal-cabecalho">
					<p id="modal-enviar-mensagem-titulo" className="ficha-modal-titulo">
						enviar mensagem para {ficha.parceira.nome}
					</p>
					<button type="button" className="ficha-modal-fechar" onClick={aoFechar} aria-label="fechar">
						×
					</button>
				</div>

				<label className="ficha-modal-campo">
					modelo
					<select className="admin-select" value={selecaoId} onChange={(evento) => selecionar(evento.target.value)}>
						{ORDEM_CATEGORIAS.flatMap((categoria) =>
							(referencia.modelosPorCategoria[categoria] ?? []).map((modelo) => (
								<option key={modelo.id} value={modelo.id}>
									{rotuloCategoriaMensagem(categoria)} — {modelo.titulo}
								</option>
							)),
						)}
						<option value="PERSONALIZADA">mensagem personalizada</option>
					</select>
				</label>

				<label className="ficha-modal-campo">
					pré-visualização (edite se precisar)
					<textarea
						className="ficha-modal-textarea"
						rows={6}
						value={corpo}
						onChange={(evento) => setCorpo(evento.target.value)}
					/>
				</label>

				{erro && <p className="portal-page-feedback is-error">{erro}</p>}

				<div className="ficha-modal-acoes">
					<button type="button" className="btn-plain" onClick={aoFechar}>
						cancelar
					</button>
					<button
						type="button"
						className="btn-primary is-medium"
						disabled={enviando}
						onClick={() => void abrirNoWhatsapp()}
					>
						{enviando ? "preparando…" : "abrir no whatsapp"}
					</button>
				</div>
			</div>
		</div>
	);
}

export function CentralInfluenciadoraPage() {
	const { id } = useParams<{ id: string }>();
	const { sessao, logout } = useSession();
	const [ficha, setFicha] = useState<FichaParceira | null>(null);
	const [erro, setErro] = useState<string | null>(null);
	const [carregando, setCarregando] = useState(true);
	const [referenciaModelos, setReferenciaModelos] = useState<ReferenciaModelosMensagem | null>(null);
	const [modalAberto, setModalAberto] = useState(false);

	useEffect(() => {
		if (!id) return;
		let ativo = true;
		setCarregando(true);
		setErro(null);

		apiFetch<FichaParceira>(`/api/admin/parceiras/${id}/ficha`)
			.then((dados) => ativo && setFicha(dados))
			.catch((erroCapturado) => {
				if (!ativo) return;
				setErro(
					erroCapturado instanceof ApiError
						? erroCapturado.message
						: "não foi possível carregar a ficha desta parceira.",
				);
			})
			.finally(() => ativo && setCarregando(false));

		return () => {
			ativo = false;
		};
	}, [id]);

	/** Modelos de mensagem (Comunicação, Sprint 2) — carregados à parte da Ficha; se falhar, o
	 * botão "enviar mensagem" simplesmente não aparece, sem quebrar o resto da tela. */
	useEffect(() => {
		let ativo = true;
		apiFetch<ReferenciaModelosMensagem>("/api/admin/comunicacao/modelos")
			.then((dados) => ativo && setReferenciaModelos(dados))
			.catch(() => {});
		return () => {
			ativo = false;
		};
	}, []);

	if (sessao?.papelAtor !== "ADMINISTRADOR") {
		return (
			<div className="ficha-tela">
				<p style={{ padding: 32 }}>área restrita a administradores.</p>
			</div>
		);
	}

	return (
		<div className="ficha-tela">
			<header className="ficha-nav">
				<span className="ficha-nav-marca">criativo dodô</span>
				<div className="ficha-nav-acoes">
					<Link to="/admin/parceiras" className="ficha-nav-link">
						voltar à central de influenciadoras
					</Link>
					<button type="button" className="ficha-nav-sair" onClick={() => void logout()}>
						sair
					</button>
				</div>
			</header>

			{carregando && <p style={{ padding: 32 }}>carregando</p>}
			{!carregando && erro && (
				<p style={{ padding: 32 }} className="ficha-vazio">
					{erro}
				</p>
			)}

			{!carregando && !erro && ficha && (
				<>
					<div className="ficha-contexto">
						<div className="ficha-monograma" aria-hidden="true">
							<span>{obterIniciais(ficha.parceira.nome)}</span>
						</div>
						<p className="ficha-eyebrow">central de influenciadoras</p>
						<h1 className="ficha-nome">{ficha.parceira.nome}</h1>
						<p className="ficha-linha-identidade">
							<span
								className={`status-pill${ficha.parceira.status === "ATIVA" ? "" : " is-alert"}`}
							>
								{rotuloStatusParceira(ficha.parceira.status)}
							</span>
							<span className="ficha-cupom">cupom "{ficha.parceira.chave}"</span>
						</p>
						<p className="ficha-vinculo">
							parceira da criativo dodô desde {formatarData(ficha.parceira.dataCriacao)} ·{" "}
							{ficha.parceira.email}
						</p>
						{referenciaModelos && (
							<button
								type="button"
								className="btn-primary is-medium ficha-acao-mensagem"
								onClick={() => setModalAberto(true)}
							>
								enviar mensagem
							</button>
						)}
					</div>

					<div className="ficha-corpo">
						<section className="ficha-secao" aria-labelledby="secao-estado">
							<p id="secao-estado" className="ficha-secao-titulo">
								como está agora
							</p>
							<p className="ficha-secao-frase">{fraseDeEstado(ficha.excecoes)}</p>
							<p className="ficha-secao-texto">{narrativaDeEstado(ficha.entregas)}</p>
						</section>

						{ficha.excecoes.length > 0 && (
							<section className="ficha-secao" aria-labelledby="secao-atencao">
								<p id="secao-atencao" className="ficha-secao-titulo">
									pede atenção
								</p>
								<ul className="ficha-atencao-lista">
									{ficha.excecoes.map((excecao, indice) => (
										<li key={`${excecao.tipo}-${indice}`} className="ficha-atencao-item">
											<span className="ficha-atencao-marcador" aria-hidden="true" />
											<span className="ficha-atencao-texto">{fraseDeAtencao(excecao)}</span>
										</li>
									))}
								</ul>
							</section>
						)}

						<section className="ficha-secao" aria-labelledby="secao-timeline">
							<p id="secao-timeline" className="ficha-secao-titulo">
								o que vem a seguir
							</p>
							{ficha.proximosPrazos.length === 0 ? (
								<p className="ficha-vazio">nada previsto para os próximos dias.</p>
							) : (
								<ol className="ficha-timeline">
									{ficha.proximosPrazos.map((prazo, indice) => (
										<li
											key={`${prazo.tipo}-${prazo.data}-${indice}`}
											className={`ficha-timeline-passo${indice === 0 ? " is-atual" : ""}`}
										>
											<span className="ficha-timeline-marcador" aria-hidden="true" />
											<div className="ficha-timeline-conteudo">
												<span className="ficha-timeline-titulo">
													{prazo.tipo === "entrega" ? "entrega" : "postagem"} de{" "}
													{rotuloFormatoEntrega(prazo.formato)}
												</span>
												<span className="ficha-timeline-detalhe">
													{formatarPrazoRelativo(prazo.diasRestantes)}
												</span>
											</div>
										</li>
									))}
								</ol>
							)}
						</section>

						<section className="ficha-secao" aria-labelledby="secao-colaboracao">
							<p id="secao-colaboracao" className="ficha-secao-titulo">
								colaboração de {formatarCompetencia(ficha.competenciaAtual)}
							</p>
							<p className="ficha-secao-texto">{fraseDeColaboracaoAtual(ficha)}</p>
						</section>

						<section className="ficha-secao" aria-labelledby="secao-historico">
							<p id="secao-historico" className="ficha-secao-titulo">
								histórico de colaborações
							</p>
							{ficha.historicoColaboracoes.length === 0 ? (
								<p className="ficha-vazio">nenhuma colaboração anterior registrada.</p>
							) : (
								<ul className="ficha-lista-simples">
									{ficha.historicoColaboracoes.map((colaboracao) => (
										<li key={colaboracao.id} className="ficha-lista-simples-item">
											<span className="ficha-lista-simples-titulo">
												{formatarCompetencia(colaboracao.mesReferencia)}
											</span>
											<span className="ficha-lista-simples-detalhe">
												{colaboracao.quantidadeRegistrosGerados}{" "}
												{colaboracao.quantidadeRegistrosGerados === 1 ? "registro" : "registros"}
											</span>
										</li>
									))}
								</ul>
							)}
						</section>

						<section className="ficha-secao" aria-labelledby="secao-financeiro">
							<p id="secao-financeiro" className="ficha-secao-titulo">
								financeiro
							</p>
							<p className="ficha-secao-texto">{fraseDeFinanceiro(ficha.financeiro)}</p>
							{ficha.financeiro.obrigacoesPendentes.length > 0 && (
								<ul className="ficha-lista-simples">
									{ficha.financeiro.obrigacoesPendentes.map((obrigacao) => (
										<li key={obrigacao.id} className="ficha-lista-simples-item">
											<span className="ficha-lista-simples-titulo">
												{formatarCompetencia(obrigacao.mesReferencia)} · {formatadorMoeda.format(obrigacao.valor)}
											</span>
											<span className="ficha-lista-simples-detalhe">
												{rotuloEstadoObrigacao(obrigacao.estado)}
											</span>
										</li>
									))}
								</ul>
							)}
							{ficha.financeiro.obrigacoesPagas.length > 0 && (
								<p className="ficha-secao-nota">
									{ficha.financeiro.obrigacoesPagas.length}{" "}
									{ficha.financeiro.obrigacoesPagas.length === 1 ? "pagamento já concluído" : "pagamentos já concluídos"}{" "}
									no histórico.
								</p>
							)}
							<Link to="/admin/financeiro" className="ficha-secao-link">
								ver financeiro completo
							</Link>
						</section>

						<section className="ficha-secao" aria-labelledby="secao-documentos">
							<p id="secao-documentos" className="ficha-secao-titulo">
								documentos
							</p>
							{ficha.documentos.length === 0 ? (
								<p className="ficha-vazio">nenhum documento emitido ainda.</p>
							) : (
								<ul className="ficha-lista-simples">
									{ficha.documentos.map((documento) => (
										<li key={documento.id} className="ficha-lista-simples-item">
											<span className="ficha-lista-simples-titulo">
												{rotuloTipoDocumento(documento.tipo)}
											</span>
											<span className="ficha-lista-simples-detalhe">
												{rotuloStatusDocumento(documento.status)} · {formatarData(documento.geradoEm)}
											</span>
										</li>
									))}
								</ul>
							)}
						</section>
					</div>

					<section className="ficha-rodape" aria-label="fechamento">
						<p className="ficha-rodape-nota">
							essa é a ficha completa de {ficha.parceira.nome} — atualizamos assim que algo mudar.
						</p>
						<Link to="/admin/parceiras" className="ficha-rodape-acao">
							editar dados cadastrais na central de influenciadoras
						</Link>
					</section>

					{modalAberto && referenciaModelos && (
						<ModalEnviarMensagem
							ficha={ficha}
							referencia={referenciaModelos}
							aoFechar={() => setModalAberto(false)}
						/>
					)}
				</>
			)}
		</div>
	);
}
