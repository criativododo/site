import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { ApiError, apiFetch } from "../lib/api";
import { formatadorMoeda, formatarData } from "../lib/formatters";
import { useSession } from "../lib/session";

type StatusParceira = "ATIVA" | "INATIVA";

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

const ITENS_POR_PAGINA = 50;

interface DadosFormularioParceira {
	chave: string;
	nome: string;
	email: string;
	cnpj: string;
	pix: string;
	valorMensal: string;
	entregaveisReel: string;
	entregaveisCarrossel: string;
	entregaveisStories: string;
	prazoUsoImagemDias: string;
}

function dadosIniciais(parceira?: Parceira): DadosFormularioParceira {
	if (!parceira) {
		return {
			chave: "",
			nome: "",
			email: "",
			cnpj: "",
			pix: "",
			valorMensal: "",
			entregaveisReel: "",
			entregaveisCarrossel: "",
			entregaveisStories: "",
			prazoUsoImagemDias: "",
		};
	}
	return {
		chave: parceira.chave,
		nome: parceira.nome,
		email: parceira.email,
		cnpj: parceira.cnpj,
		pix: parceira.pix,
		valorMensal: String(parceira.condicaoComercial.valorMensal),
		entregaveisReel: String(parceira.condicaoComercial.entregaveisReel),
		entregaveisCarrossel: String(
			parceira.condicaoComercial.entregaveisCarrossel,
		),
		entregaveisStories: String(
			parceira.condicaoComercial.entregaveisStories,
		),
		prazoUsoImagemDias: String(
			parceira.condicaoComercial.prazoUsoImagemDias,
		),
	};
}

/** UC-002.02/RF-001: cadastro (POST) e edição (PATCH) reaproveitam o mesmo formulário — a
 * chave só é editável na criação (backend não a expõe em CamposEditaveisParceira). */
function FormularioParceira({
	parceira,
	aoSalvarComSucesso,
	aoCancelar,
}: {
	parceira?: Parceira;
	aoSalvarComSucesso: (parceira: Parceira) => void;
	aoCancelar: () => void;
}) {
	const [dados, setDados] = useState(dadosIniciais(parceira));
	const [salvando, setSalvando] = useState(false);
	const [erro, setErro] = useState<string | null>(null);

	function campo(nomeCampo: keyof DadosFormularioParceira) {
		return {
			value: dados[nomeCampo],
			onChange: (evento: ChangeEvent<HTMLInputElement>) =>
				setDados((atual) => ({ ...atual, [nomeCampo]: evento.target.value })),
		};
	}

	async function salvar() {
		if (!dados.chave.trim() || !dados.nome.trim() || !dados.email.trim()) {
			setErro("chave, nome e e-mail são obrigatórios.");
			return;
		}

		setSalvando(true);
		setErro(null);

		const condicaoComercial: CondicaoComercial = {
			valorMensal: Number(dados.valorMensal) || 0,
			entregaveisReel: Number(dados.entregaveisReel) || 0,
			entregaveisCarrossel: Number(dados.entregaveisCarrossel) || 0,
			entregaveisStories: Number(dados.entregaveisStories) || 0,
			prazoUsoImagemDias: Number(dados.prazoUsoImagemDias) || 0,
		};

		try {
			const salva = parceira
				? await apiFetch<Parceira>(`/api/admin/parceiras/${parceira.id}`, {
						method: "PATCH",
						body: JSON.stringify({
							nome: dados.nome,
							email: dados.email,
							cnpj: dados.cnpj,
							pix: dados.pix,
							condicaoComercial,
						}),
					})
				: await apiFetch<Parceira>("/api/admin/parceiras", {
						method: "POST",
						body: JSON.stringify({
							chave: dados.chave,
							nome: dados.nome,
							email: dados.email,
							cnpj: dados.cnpj,
							pix: dados.pix,
							condicaoComercial,
						}),
					});
			aoSalvarComSucesso(salva);
		} catch (erroCapturado) {
			setErro(
				erroCapturado instanceof ApiError
					? erroCapturado.message
					: "não foi possível salvar.",
			);
		} finally {
			setSalvando(false);
		}
	}

	return (
		<div className="admin-form-grid">
			{!parceira && (
				<label className="admin-field">
					chave
					<input className="admin-input" {...campo("chave")} />
				</label>
			)}
			<label className="admin-field">
				nome
				<input className="admin-input" {...campo("nome")} />
			</label>
			<label className="admin-field">
				e-mail
				<input className="admin-input" type="email" {...campo("email")} />
			</label>
			<label className="admin-field">
				cnpj
				<input className="admin-input" {...campo("cnpj")} />
			</label>
			<label className="admin-field">
				pix
				<input className="admin-input" {...campo("pix")} />
			</label>
			<label className="admin-field">
				valor mensal (r$)
				<input
					className="admin-input"
					type="number"
					{...campo("valorMensal")}
				/>
			</label>
			<label className="admin-field">
				reels contratados
				<input
					className="admin-input"
					type="number"
					{...campo("entregaveisReel")}
				/>
			</label>
			<label className="admin-field">
				carrosséis contratados
				<input
					className="admin-input"
					type="number"
					{...campo("entregaveisCarrossel")}
				/>
			</label>
			<label className="admin-field">
				stories contratados
				<input
					className="admin-input"
					type="number"
					{...campo("entregaveisStories")}
				/>
			</label>
			<label className="admin-field">
				prazo de uso de imagem (dias)
				<input
					className="admin-input"
					type="number"
					{...campo("prazoUsoImagemDias")}
				/>
			</label>

			{erro && (
				<p className="portal-page-feedback is-error admin-form-error">
					{erro}
				</p>
			)}

			<div className="admin-form-actions">
				<button
					type="button"
					className="btn-primary is-compact"
					disabled={salvando}
					onClick={() => void salvar()}
				>
					{salvando ? "salvando..." : "salvar"}
				</button>
				<button type="button" className="btn-plain" onClick={aoCancelar}>
					cancelar
				</button>
			</div>
		</div>
	);
}

function LinhaParceira({
	parceira,
	expandida,
	editando,
	emAcao,
	aoAlternarDetalhes,
	aoAlternarEdicao,
	aoAlternarStatus,
	aoSalvarEdicao,
}: {
	parceira: Parceira;
	expandida: boolean;
	editando: boolean;
	emAcao: boolean;
	aoAlternarDetalhes: () => void;
	aoAlternarEdicao: () => void;
	aoAlternarStatus: () => void;
	aoSalvarEdicao: (parceira: Parceira) => void;
}) {
	const ativa = parceira.status === "ATIVA";

	return (
		<li className="portal-list-row operational-row">
			<span
				className={`portal-list-row-status status-pill${ativa ? "" : " is-alert"}`}
			>
				{ativa ? "ativa" : "inativa"}
			</span>

			<button type="button" className="admin-row-title-button" onClick={aoAlternarDetalhes}>
				<strong className="portal-list-row-title">{parceira.nome}</strong>
				<p className="portal-list-row-meta">
					{parceira.chave} · {parceira.email}
				</p>
			</button>

			<p className="portal-list-row-meta">
				{formatarData(parceira.dataCriacao)}
			</p>

			<p className="portal-list-row-meta">
				{formatadorMoeda.format(parceira.condicaoComercial.valorMensal)}/mês
			</p>

			<div className="portal-list-row-actions">
				<button type="button" className="btn-outline" onClick={aoAlternarEdicao}>
					{editando ? "fechar edição" : "editar"}
				</button>
				{ativa ? (
					<button
						type="button"
						className="btn-outline is-cherry"
						disabled={emAcao}
						onClick={aoAlternarStatus}
					>
						{emAcao ? "..." : "desativar"}
					</button>
				) : (
					<button
						type="button"
						className="btn-primary is-compact"
						disabled={emAcao}
						onClick={aoAlternarStatus}
					>
						{emAcao ? "..." : "ativar"}
					</button>
				)}
			</div>

			{expandida && (
				<div className="admin-row-expanded">
					<dl>
						<dt>cnpj</dt>
						<dd>{parceira.cnpj || "—"}</dd>
						<dt>pix</dt>
						<dd>{parceira.pix || "—"}</dd>
						<dt>entregáveis contratados</dt>
						<dd>
							{parceira.condicaoComercial.entregaveisReel} reel ·{" "}
							{parceira.condicaoComercial.entregaveisCarrossel} carrossel ·{" "}
							{parceira.condicaoComercial.entregaveisStories} stories
						</dd>
						<dt>prazo de uso de imagem</dt>
						<dd>{parceira.condicaoComercial.prazoUsoImagemDias} dias</dd>
					</dl>
				</div>
			)}

			{editando && (
				<div className="admin-row-editing">
					<FormularioParceira
						parceira={parceira}
						aoSalvarComSucesso={aoSalvarEdicao}
						aoCancelar={aoAlternarEdicao}
					/>
				</div>
			)}
		</li>
	);
}

type FiltroStatus = "TODAS" | "ATIVA" | "INATIVA";
type Ordenacao = "NOME" | "RECENTES" | "STATUS";

export function AdminParceirasPage() {
	const { sessao } = useSession();
	const [parceiras, setParceiras] = useState<Parceira[] | null>(null);
	const [erro, setErro] = useState<string | null>(null);
	const [carregando, setCarregando] = useState(true);

	const [busca, setBusca] = useState("");
	const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("TODAS");
	const [ordenacao, setOrdenacao] = useState<Ordenacao>("NOME");
	const [pagina, setPagina] = useState(1);

	const [formularioAberto, setFormularioAberto] = useState(false);
	const [parceiraExpandidaId, setParceiraExpandidaId] = useState<
		string | null
	>(null);
	const [parceiraEmEdicaoId, setParceiraEmEdicaoId] = useState<
		string | null
	>(null);
	const [idEmAcao, setIdEmAcao] = useState<string | null>(null);

	useEffect(() => {
		let ativo = true;
		setCarregando(true);
		setErro(null);

		apiFetch<{ itens: Parceira[] }>("/api/admin/parceiras")
			.then((dados) => ativo && setParceiras(dados.itens))
			.catch((erroCapturado) => {
				if (!ativo) return;
				setErro(
					erroCapturado instanceof ApiError
						? erroCapturado.message
						: "não foi possível carregar as parceiras.",
				);
			})
			.finally(() => ativo && setCarregando(false));

		return () => {
			ativo = false;
		};
	}, []);

	useEffect(() => {
		setPagina(1);
	}, [busca, filtroStatus, ordenacao]);

	function atualizarNaLista(atualizada: Parceira) {
		setParceiras((atual) =>
			atual
				? atual.map((parceira) =>
						parceira.id === atualizada.id ? atualizada : parceira,
					)
				: atual,
		);
	}

	async function alternarStatus(parceira: Parceira) {
		setIdEmAcao(parceira.id);
		setErro(null);
		try {
			const novoStatus: StatusParceira =
				parceira.status === "ATIVA" ? "INATIVA" : "ATIVA";
			const atualizada = await apiFetch<Parceira>(
				`/api/admin/parceiras/${parceira.id}/status`,
				{ method: "PATCH", body: JSON.stringify({ status: novoStatus }) },
			);
			atualizarNaLista(atualizada);
		} catch (erroCapturado) {
			setErro(
				erroCapturado instanceof ApiError
					? erroCapturado.message
					: "não foi possível alterar o status.",
			);
		} finally {
			setIdEmAcao(null);
		}
	}

	const filtradas = useMemo(() => {
		if (!parceiras) return [];
		const termo = busca.trim().toLowerCase();

		const resultado = parceiras.filter((parceira) => {
			if (filtroStatus !== "TODAS" && parceira.status !== filtroStatus) {
				return false;
			}
			if (!termo) return true;
			return (
				parceira.nome.toLowerCase().includes(termo) ||
				parceira.chave.toLowerCase().includes(termo) ||
				parceira.email.toLowerCase().includes(termo) ||
				parceira.cnpj.toLowerCase().includes(termo)
			);
		});

		resultado.sort((a, b) => {
			if (ordenacao === "NOME") return a.nome.localeCompare(b.nome);
			if (ordenacao === "RECENTES") {
				return b.dataCriacao.localeCompare(a.dataCriacao);
			}
			return a.status.localeCompare(b.status);
		});

		return resultado;
	}, [parceiras, busca, filtroStatus, ordenacao]);

	const totalPaginas = Math.max(
		1,
		Math.ceil(filtradas.length / ITENS_POR_PAGINA),
	);
	const paginaVisivel = Math.min(pagina, totalPaginas);
	const itensDaPagina = filtradas.slice(
		(paginaVisivel - 1) * ITENS_POR_PAGINA,
		paginaVisivel * ITENS_POR_PAGINA,
	);

	const totalAtivas =
		parceiras?.filter((parceira) => parceira.status === "ATIVA").length ?? 0;
	const totalInativas =
		parceiras?.filter((parceira) => parceira.status === "INATIVA").length ??
		0;

	if (sessao?.papelAtor !== "ADMINISTRADOR") {
		return (
			<section className="portal-page">
				<p className="portal-page-feedback">área restrita a administradores.</p>
			</section>
		);
	}

	return (
		<section className="portal-page is-admin-wide">
			<p className="portal-eyebrow">administração</p>
			<h1 className="title-editorial portal-page-title">parceiras</h1>
			<p className="portal-page-intro">
				busque, avalie a situação e aja sobre qualquer parceira em poucos
				cliques.
			</p>

			{carregando && (
				<p className="portal-page-feedback">carregando parceiras...</p>
			)}
			{!carregando && erro && (
				<p className="portal-page-feedback is-error">{erro}</p>
			)}

			{!carregando && parceiras && (
				<>
					<div className="admin-toolbar">
						<label className="admin-field is-wide">
							buscar
							<input
								className="admin-input"
								name="buscaParceiras"
								placeholder="nome, chave, e-mail ou cnpj"
								value={busca}
								onChange={(evento) => setBusca(evento.target.value)}
							/>
						</label>
						<label className="admin-field is-compact">
							status
							<select
								className="admin-select"
								name="filtroStatus"
								value={filtroStatus}
								onChange={(evento) =>
									setFiltroStatus(evento.target.value as FiltroStatus)
								}
							>
								<option value="TODAS">todas</option>
								<option value="ATIVA">ativas</option>
								<option value="INATIVA">inativas</option>
							</select>
						</label>
						<label className="admin-field is-narrow">
							ordenar por
							<select
								className="admin-select"
								name="ordenacao"
								value={ordenacao}
								onChange={(evento) =>
									setOrdenacao(evento.target.value as Ordenacao)
								}
							>
								<option value="NOME">nome</option>
								<option value="RECENTES">cadastro mais recente</option>
								<option value="STATUS">status</option>
							</select>
						</label>
						<button
							type="button"
							className="btn-primary is-medium"
							onClick={() => setFormularioAberto((atual) => !atual)}
						>
							{formularioAberto ? "fechar" : "+ nova parceira"}
						</button>
					</div>

					{formularioAberto && (
						<div className="admin-form-panel">
							<FormularioParceira
								aoSalvarComSucesso={(nova) => {
									setParceiras((atual) => (atual ? [nova, ...atual] : [nova]));
									setFormularioAberto(false);
								}}
								aoCancelar={() => setFormularioAberto(false)}
							/>
						</div>
					)}

					<p className="pendencias-summary is-quiet">
						{parceiras.length}{" "}
						{parceiras.length === 1 ? "parceira" : "parceiras"} ·{" "}
						{totalAtivas} ativas · {totalInativas} inativas
					</p>

					{filtradas.length === 0 && (
						<p className="portal-page-feedback">
							{parceiras.length === 0
								? "nenhuma parceira cadastrada ainda."
								: "nenhuma parceira encontrada para esse filtro."}
						</p>
					)}

					{filtradas.length > 0 && (
						<>
							<ul className="portal-list">
								{itensDaPagina.map((parceira) => (
									<LinhaParceira
										key={parceira.id}
										parceira={parceira}
										expandida={parceiraExpandidaId === parceira.id}
										editando={parceiraEmEdicaoId === parceira.id}
										emAcao={idEmAcao === parceira.id}
										aoAlternarDetalhes={() =>
											setParceiraExpandidaId((atual) =>
												atual === parceira.id ? null : parceira.id,
											)
										}
										aoAlternarEdicao={() =>
											setParceiraEmEdicaoId((atual) =>
												atual === parceira.id ? null : parceira.id,
											)
										}
										aoAlternarStatus={() => void alternarStatus(parceira)}
										aoSalvarEdicao={(atualizada) => {
											atualizarNaLista(atualizada);
											setParceiraEmEdicaoId(null);
										}}
									/>
								))}
							</ul>

							{totalPaginas > 1 && (
								<div className="admin-pagination">
									<button
										type="button"
										className="btn-outline"
										disabled={paginaVisivel === 1}
										onClick={() => setPagina(paginaVisivel - 1)}
									>
										anterior
									</button>
									<span>
										página {paginaVisivel} de {totalPaginas}
									</span>
									<button
										type="button"
										className="btn-outline"
										disabled={paginaVisivel === totalPaginas}
										onClick={() => setPagina(paginaVisivel + 1)}
									>
										próxima
									</button>
								</div>
							)}
						</>
					)}
				</>
			)}
		</section>
	);
}
