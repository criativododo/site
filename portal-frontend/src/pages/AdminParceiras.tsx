import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { ApiError, apiFetch } from "../lib/api";
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

const formatadorMoeda = new Intl.NumberFormat("pt-BR", {
	style: "currency",
	currency: "BRL",
});

const ITENS_POR_PAGINA = 50;

const estiloInput = {
	height: 40,
	borderRadius: 8,
	border: "1px solid rgba(27, 23, 23, 0.2)",
	padding: "0 12px",
	fontSize: 14,
	fontWeight: 400,
} as const;

const estiloLabel = {
	display: "flex",
	flexDirection: "column",
	gap: 6,
	fontSize: 13,
	fontWeight: 700,
} as const;

const estiloBotaoOutlineNeutro = {
	height: 36,
	padding: "0 16px",
	fontSize: 13,
	borderRadius: 24,
	border: "1px solid rgba(27, 23, 23, 0.2)",
	background: "none",
} as const;

const estiloBotaoOutlineCherry = {
	height: 36,
	padding: "0 16px",
	fontSize: 13,
	borderRadius: 24,
	border: "1px solid var(--color-cherry)",
	background: "none",
	color: "var(--color-cherry)",
} as const;

const estiloBotaoPrimarioPequeno = {
	height: 36,
	padding: "0 16px",
	fontSize: 13,
} as const;

function formatarData(dataIso: string): string {
	return new Date(dataIso).toLocaleDateString("pt-BR");
}

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
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
				gap: 12,
				marginTop: 16,
				paddingTop: 16,
				borderTop: "1px solid rgba(27, 23, 23, 0.1)",
			}}
		>
			{!parceira && (
				<label style={estiloLabel}>
					chave
					<input {...campo("chave")} style={estiloInput} />
				</label>
			)}
			<label style={estiloLabel}>
				nome
				<input {...campo("nome")} style={estiloInput} />
			</label>
			<label style={estiloLabel}>
				e-mail
				<input type="email" {...campo("email")} style={estiloInput} />
			</label>
			<label style={estiloLabel}>
				cnpj
				<input {...campo("cnpj")} style={estiloInput} />
			</label>
			<label style={estiloLabel}>
				pix
				<input {...campo("pix")} style={estiloInput} />
			</label>
			<label style={estiloLabel}>
				valor mensal (r$)
				<input type="number" {...campo("valorMensal")} style={estiloInput} />
			</label>
			<label style={estiloLabel}>
				reels contratados
				<input
					type="number"
					{...campo("entregaveisReel")}
					style={estiloInput}
				/>
			</label>
			<label style={estiloLabel}>
				carrosséis contratados
				<input
					type="number"
					{...campo("entregaveisCarrossel")}
					style={estiloInput}
				/>
			</label>
			<label style={estiloLabel}>
				stories contratados
				<input
					type="number"
					{...campo("entregaveisStories")}
					style={estiloInput}
				/>
			</label>
			<label style={estiloLabel}>
				prazo de uso de imagem (dias)
				<input
					type="number"
					{...campo("prazoUsoImagemDias")}
					style={estiloInput}
				/>
			</label>

			{erro && (
				<p
					className="portal-page-feedback is-error"
					style={{ margin: 0, gridColumn: "1 / -1" }}
				>
					{erro}
				</p>
			)}

			<div
				style={{
					display: "flex",
					gap: 8,
					alignItems: "center",
					gridColumn: "1 / -1",
				}}
			>
				<button
					type="button"
					className="btn-primary"
					disabled={salvando}
					onClick={() => void salvar()}
					style={estiloBotaoPrimarioPequeno}
				>
					{salvando ? "salvando..." : "salvar"}
				</button>
				<button
					type="button"
					onClick={aoCancelar}
					style={{ ...estiloBotaoOutlineNeutro, border: "none" }}
				>
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
				className="portal-list-row-status"
				style={{
					fontWeight: 700,
					color: ativa ? "inherit" : "var(--color-cherry)",
				}}
			>
				{ativa ? "ativa" : "inativa"}
			</span>

			<button
				type="button"
				onClick={aoAlternarDetalhes}
				style={{
					textAlign: "left",
					background: "none",
					border: "none",
					padding: 0,
					cursor: "pointer",
				}}
			>
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
				<button
					type="button"
					onClick={aoAlternarEdicao}
					style={estiloBotaoOutlineNeutro}
				>
					{editando ? "fechar edição" : "editar"}
				</button>
				{ativa ? (
					<button
						type="button"
						disabled={emAcao}
						onClick={aoAlternarStatus}
						style={estiloBotaoOutlineCherry}
					>
						{emAcao ? "..." : "desativar"}
					</button>
				) : (
					<button
						type="button"
						className="btn-primary"
						disabled={emAcao}
						onClick={aoAlternarStatus}
						style={estiloBotaoPrimarioPequeno}
					>
						{emAcao ? "..." : "ativar"}
					</button>
				)}
			</div>

			{expandida && (
				<dl
					style={{
						gridColumn: "1 / -1",
						display: "grid",
						gridTemplateColumns: "auto 1fr",
						gap: "8px 20px",
						fontSize: 14,
						marginTop: 4,
						paddingTop: 12,
						borderTop: "1px solid rgba(27, 23, 23, 0.1)",
						width: "100%",
					}}
				>
					<dt style={{ fontWeight: 700 }}>cnpj</dt>
					<dd>{parceira.cnpj || "—"}</dd>
					<dt style={{ fontWeight: 700 }}>pix</dt>
					<dd>{parceira.pix || "—"}</dd>
					<dt style={{ fontWeight: 700 }}>entregáveis contratados</dt>
					<dd>
						{parceira.condicaoComercial.entregaveisReel} reel ·{" "}
						{parceira.condicaoComercial.entregaveisCarrossel} carrossel ·{" "}
						{parceira.condicaoComercial.entregaveisStories} stories
					</dd>
					<dt style={{ fontWeight: 700 }}>prazo de uso de imagem</dt>
					<dd>{parceira.condicaoComercial.prazoUsoImagemDias} dias</dd>
				</dl>
			)}

			{editando && (
				<div style={{ gridColumn: "1 / -1", width: "100%" }}>
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
		<section className="portal-page" style={{ maxWidth: 1080 }}>
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
					<div
						style={{
							display: "flex",
							flexWrap: "wrap",
							gap: 12,
							alignItems: "flex-end",
							marginBottom: 16,
						}}
					>
						<label style={{ ...estiloLabel, flex: "2 1 220px" }}>
							buscar
							<input
								placeholder="nome, chave, e-mail ou cnpj"
								value={busca}
								onChange={(evento) => setBusca(evento.target.value)}
								style={estiloInput}
							/>
						</label>
						<label style={{ ...estiloLabel, flex: "1 1 140px" }}>
							status
							<select
								value={filtroStatus}
								onChange={(evento) =>
									setFiltroStatus(evento.target.value as FiltroStatus)
								}
								style={estiloInput}
							>
								<option value="TODAS">todas</option>
								<option value="ATIVA">ativas</option>
								<option value="INATIVA">inativas</option>
							</select>
						</label>
						<label style={{ ...estiloLabel, flex: "1 1 170px" }}>
							ordenar por
							<select
								value={ordenacao}
								onChange={(evento) =>
									setOrdenacao(evento.target.value as Ordenacao)
								}
								style={estiloInput}
							>
								<option value="NOME">nome</option>
								<option value="RECENTES">cadastro mais recente</option>
								<option value="STATUS">status</option>
							</select>
						</label>
						<button
							type="button"
							className="btn-primary"
							onClick={() => setFormularioAberto((atual) => !atual)}
							style={{ height: 40, padding: "0 24px", fontSize: 14 }}
						>
							{formularioAberto ? "fechar" : "+ nova parceira"}
						</button>
					</div>

					{formularioAberto && (
						<div
							style={{
								marginBottom: 24,
								paddingBottom: 24,
								borderBottom: "1px solid rgba(27, 23, 23, 0.1)",
							}}
						>
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
								<div
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										gap: 16,
										marginTop: 24,
									}}
								>
									<button
										type="button"
										disabled={paginaVisivel === 1}
										onClick={() => setPagina(paginaVisivel - 1)}
										style={estiloBotaoOutlineNeutro}
									>
										anterior
									</button>
									<span style={{ fontSize: 14 }}>
										página {paginaVisivel} de {totalPaginas}
									</span>
									<button
										type="button"
										disabled={paginaVisivel === totalPaginas}
										onClick={() => setPagina(paginaVisivel + 1)}
										style={estiloBotaoOutlineNeutro}
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
