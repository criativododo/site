import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { ApiError, apiFetch } from "../lib/api";
import { useSession } from "../lib/session";

type FormatoEntrega = "Reel" | "Carrossel" | "Stories1" | "Stories2";
type EstadoEntrega =
	| "AGUARDANDO_MATERIAL"
	| "EM_REVISAO"
	| "APROVADO"
	| "PUBLICADO";

interface Entrega {
	id: string;
	parceiraId: string;
	mesReferencia: string;
	formato: FormatoEntrega;
	estado: EstadoEntrega;
	dataEntrega: string;
}

interface Parceira {
	id: string;
	nome: string;
	chave: string;
	status: "ATIVA" | "INATIVA";
}

interface Briefing {
	id: string;
	parceiraId: string;
	mesReferencia: string;
	formato: FormatoEntrega;
	look: string;
	dataEntrega: string;
	dataPostagem: string;
	orientacao: string;
	entregaId: string | null;
	estadoEntregaVinculada: EstadoEntrega | null;
}

interface ConteudoBriefing {
	look: string;
	dataEntrega: string;
	dataPostagem: string;
	orientacao: string;
}

const LABEL_FORMATO: Record<FormatoEntrega, string> = {
	Reel: "reel",
	Carrossel: "carrossel",
	Stories1: "stories 1",
	Stories2: "stories 2",
};

const LABEL_ESTADO: Record<EstadoEntrega, string> = {
	AGUARDANDO_MATERIAL: "aguardando material",
	EM_REVISAO: "em revisão",
	APROVADO: "aprovado",
	PUBLICADO: "publicado",
};

function formatarData(dataIso: string): string {
	return new Date(dataIso).toLocaleDateString("pt-BR");
}

/** Remoção só é permitida sem Entrega vinculada, ou enquanto ela ainda está AGUARDANDO_MATERIAL (briefing.service.ts::removerBriefing). */
function remocaoPermitida(
	estadoEntregaVinculada: EstadoEntrega | null,
): boolean {
	return (
		estadoEntregaVinculada === null ||
		estadoEntregaVinculada === "AGUARDANDO_MATERIAL"
	);
}

const estiloInput = {
	height: 40,
	borderRadius: 8,
	border: "1px solid rgba(27, 23, 23, 0.2)",
	padding: "0 12px",
	fontSize: 14,
	fontWeight: 400,
} as const;

const estiloTextarea = {
	...estiloInput,
	height: "auto",
	minHeight: 80,
	padding: 12,
	resize: "vertical",
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

function CamposDeConteudo({
	dados,
	setDados,
}: {
	dados: ConteudoBriefing;
	setDados: (
		atualizador: (atual: ConteudoBriefing) => ConteudoBriefing,
	) => void;
}) {
	function campo(nomeCampo: keyof ConteudoBriefing) {
		return {
			value: dados[nomeCampo],
			onChange: (evento: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
				setDados((atual) => ({ ...atual, [nomeCampo]: evento.target.value })),
		};
	}

	return (
		<>
			<label style={estiloLabel}>
				look
				<input {...campo("look")} style={estiloInput} />
			</label>
			<label style={estiloLabel}>
				data de entrega do material
				<input type="date" {...campo("dataEntrega")} style={estiloInput} />
			</label>
			<label style={estiloLabel}>
				data de postagem
				<input type="date" {...campo("dataPostagem")} style={estiloInput} />
			</label>
			<label style={{ ...estiloLabel, gridColumn: "1 / -1" }}>
				orientação criativa
				<textarea {...campo("orientacao")} style={estiloTextarea} />
			</label>
		</>
	);
}

function conteudoInicial(briefing?: Briefing): ConteudoBriefing {
	if (!briefing) {
		return { look: "", dataEntrega: "", dataPostagem: "", orientacao: "" };
	}
	return {
		look: briefing.look,
		dataEntrega: briefing.dataEntrega,
		dataPostagem: briefing.dataPostagem,
		orientacao: briefing.orientacao,
	};
}

/** UC administrativo (Backoffice, SPEC-009): cria Briefing sempre vinculado a uma Entrega já existente — nunca por chave digitada à mão. */
function FormularioNovoBriefing({
	entregasSemBriefing,
	descreverEntrega,
	aoSalvarComSucesso,
	aoCancelar,
}: {
	entregasSemBriefing: Entrega[];
	descreverEntrega: (entrega: Entrega) => string;
	aoSalvarComSucesso: (briefing: Briefing) => void;
	aoCancelar: () => void;
}) {
	const [entregaId, setEntregaId] = useState(entregasSemBriefing[0]?.id ?? "");
	const [dados, setDados] = useState<ConteudoBriefing>(conteudoInicial());
	const [salvando, setSalvando] = useState(false);
	const [erro, setErro] = useState<string | null>(null);

	async function salvar() {
		if (
			!entregaId ||
			!dados.look.trim() ||
			!dados.dataEntrega ||
			!dados.dataPostagem ||
			!dados.orientacao.trim()
		) {
			setErro("entrega, look, datas e orientação são obrigatórios.");
			return;
		}

		setSalvando(true);
		setErro(null);
		try {
			const criado = await apiFetch<Briefing>("/api/admin/briefings", {
				method: "POST",
				body: JSON.stringify({ entregaId, ...dados }),
			});
			aoSalvarComSucesso(criado);
		} catch (erroCapturado) {
			setErro(
				erroCapturado instanceof ApiError
					? erroCapturado.message
					: "não foi possível criar o Briefing.",
			);
		} finally {
			setSalvando(false);
		}
	}

	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
				gap: 12,
				marginTop: 16,
				paddingTop: 16,
				borderTop: "1px solid rgba(27, 23, 23, 0.1)",
			}}
		>
			{entregasSemBriefing.length === 0 ? (
				<p
					className="portal-page-feedback is-error"
					style={{ margin: 0, gridColumn: "1 / -1" }}
				>
					todas as Entregas já têm Briefing — crie uma nova Entrega antes de
					criar outro Briefing.
				</p>
			) : (
				<>
					<label style={{ ...estiloLabel, gridColumn: "1 / -1" }}>
						entrega
						<select
							value={entregaId}
							onChange={(evento) => setEntregaId(evento.target.value)}
							style={estiloInput}
						>
							{entregasSemBriefing.map((entrega) => (
								<option key={entrega.id} value={entrega.id}>
									{descreverEntrega(entrega)}
								</option>
							))}
						</select>
					</label>
					<CamposDeConteudo dados={dados} setDados={setDados} />
				</>
			)}

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
					disabled={salvando || entregasSemBriefing.length === 0}
					onClick={() => void salvar()}
					style={{ height: 36, padding: "0 16px", fontSize: 13 }}
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

function FormularioEdicaoBriefing({
	briefing,
	aoSalvarComSucesso,
	aoCancelar,
}: {
	briefing: Briefing;
	aoSalvarComSucesso: (briefing: Briefing) => void;
	aoCancelar: () => void;
}) {
	const [dados, setDados] = useState<ConteudoBriefing>(
		conteudoInicial(briefing),
	);
	const [salvando, setSalvando] = useState(false);
	const [erro, setErro] = useState<string | null>(null);

	async function salvar() {
		if (
			!dados.look.trim() ||
			!dados.dataEntrega ||
			!dados.dataPostagem ||
			!dados.orientacao.trim()
		) {
			setErro("look, datas e orientação são obrigatórios.");
			return;
		}

		setSalvando(true);
		setErro(null);
		try {
			const salvo = await apiFetch<Briefing>(
				`/api/admin/briefings/${briefing.id}`,
				{ method: "PATCH", body: JSON.stringify(dados) },
			);
			aoSalvarComSucesso(salvo);
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
				gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
				gap: 12,
				marginTop: 16,
				paddingTop: 16,
				borderTop: "1px solid rgba(27, 23, 23, 0.1)",
			}}
		>
			<CamposDeConteudo dados={dados} setDados={setDados} />

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
					style={{ height: 36, padding: "0 16px", fontSize: 13 }}
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

function LinhaBriefing({
	briefing,
	nomeParceira,
	editando,
	removendo,
	aoAlternarEdicao,
	aoSalvarEdicao,
	aoRemover,
}: {
	briefing: Briefing;
	nomeParceira: string;
	editando: boolean;
	removendo: boolean;
	aoAlternarEdicao: () => void;
	aoSalvarEdicao: (briefing: Briefing) => void;
	aoRemover: () => void;
}) {
	const podeRemover = remocaoPermitida(briefing.estadoEntregaVinculada);

	return (
		<li className="portal-list-row operational-row">
			<span
				className="portal-list-row-status"
				style={{
					fontWeight: 700,
					color: briefing.entregaId ? "inherit" : "var(--color-cherry)",
				}}
			>
				{briefing.estadoEntregaVinculada
					? LABEL_ESTADO[briefing.estadoEntregaVinculada]
					: "sem entrega vinculada"}
			</span>

			<div>
				<strong className="portal-list-row-title">{nomeParceira}</strong>
				<p className="portal-list-row-meta">
					{LABEL_FORMATO[briefing.formato]} · competência{" "}
					{briefing.mesReferencia} · {briefing.look}
				</p>
			</div>

			<p className="portal-list-row-meta">
				entrega {formatarData(briefing.dataEntrega)} · postagem{" "}
				{formatarData(briefing.dataPostagem)}
			</p>

			<div className="portal-list-row-actions">
				<button
					type="button"
					onClick={aoAlternarEdicao}
					style={estiloBotaoOutlineNeutro}
				>
					{editando ? "fechar edição" : "editar"}
				</button>
				<button
					type="button"
					disabled={!podeRemover || removendo}
					onClick={aoRemover}
					title={
						podeRemover
							? undefined
							: "a Entrega vinculada já saiu de 'aguardando material' — remover perderia o rastro do que a orientou."
					}
					style={estiloBotaoOutlineCherry}
				>
					{removendo ? "removendo..." : "remover"}
				</button>
			</div>

			{editando && (
				<div style={{ gridColumn: "1 / -1", width: "100%" }}>
					<FormularioEdicaoBriefing
						briefing={briefing}
						aoSalvarComSucesso={aoSalvarEdicao}
						aoCancelar={aoAlternarEdicao}
					/>
				</div>
			)}
		</li>
	);
}

export function AdminBriefingsPage() {
	const { sessao } = useSession();
	const [briefings, setBriefings] = useState<Briefing[] | null>(null);
	const [entregas, setEntregas] = useState<Entrega[] | null>(null);
	const [parceiras, setParceiras] = useState<Parceira[] | null>(null);
	const [erro, setErro] = useState<string | null>(null);
	const [carregando, setCarregando] = useState(true);

	const [busca, setBusca] = useState("");
	const [formularioAberto, setFormularioAberto] = useState(false);
	const [briefingEmEdicaoId, setBriefingEmEdicaoId] = useState<string | null>(
		null,
	);
	const [idRemovendo, setIdRemovendo] = useState<string | null>(null);

	useEffect(() => {
		let ativo = true;
		setCarregando(true);
		setErro(null);

		Promise.all([
			apiFetch<{ itens: Briefing[] }>("/api/admin/briefings"),
			apiFetch<{ itens: Entrega[] }>("/api/admin/entregas"),
			apiFetch<{ itens: Parceira[] }>("/api/admin/parceiras"),
		])
			.then(([briefingsResposta, entregasResposta, parceirasResposta]) => {
				if (!ativo) return;
				setBriefings(briefingsResposta.itens);
				setEntregas(entregasResposta.itens);
				setParceiras(parceirasResposta.itens);
			})
			.catch((erroCapturado) => {
				if (!ativo) return;
				setErro(
					erroCapturado instanceof ApiError
						? erroCapturado.message
						: "não foi possível carregar os Briefings.",
				);
			})
			.finally(() => ativo && setCarregando(false));

		return () => {
			ativo = false;
		};
	}, []);

	const nomePorParceiraId = useMemo(() => {
		const mapa = new Map<string, string>();
		for (const parceira of parceiras ?? []) {
			mapa.set(parceira.id, parceira.nome);
		}
		return mapa;
	}, [parceiras]);

	function descreverEntrega(entrega: Entrega): string {
		const nomeParceira =
			nomePorParceiraId.get(entrega.parceiraId) ?? "parceira desconhecida";
		return `${nomeParceira} · ${LABEL_FORMATO[entrega.formato]} · competência ${entrega.mesReferencia} · entrega ${formatarData(entrega.dataEntrega)}`;
	}

	const entregasSemBriefing = useMemo(() => {
		if (!entregas || !briefings) return [];
		const comBriefing = new Set(
			briefings.map((briefing) => briefing.entregaId).filter(Boolean),
		);
		return entregas.filter((entrega) => !comBriefing.has(entrega.id));
	}, [entregas, briefings]);

	const filtrados = useMemo(() => {
		if (!briefings) return [];
		const termo = busca.trim().toLowerCase();
		if (!termo) return briefings;
		return briefings.filter((briefing) => {
			const nomeParceira =
				nomePorParceiraId.get(briefing.parceiraId)?.toLowerCase() ?? "";
			return (
				nomeParceira.includes(termo) ||
				briefing.look.toLowerCase().includes(termo)
			);
		});
	}, [briefings, busca, nomePorParceiraId]);

	function atualizarNaLista(atualizado: Briefing) {
		setBriefings((atual) =>
			atual
				? atual.map((briefing) =>
						briefing.id === atualizado.id ? atualizado : briefing,
					)
				: atual,
		);
	}

	async function remover(briefing: Briefing) {
		setIdRemovendo(briefing.id);
		setErro(null);
		try {
			await apiFetch<void>(`/api/admin/briefings/${briefing.id}`, {
				method: "DELETE",
			});
			setBriefings((atual) =>
				atual ? atual.filter((item) => item.id !== briefing.id) : atual,
			);
		} catch (erroCapturado) {
			setErro(
				erroCapturado instanceof ApiError
					? erroCapturado.message
					: "não foi possível remover o Briefing.",
			);
		} finally {
			setIdRemovendo(null);
		}
	}

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
			<h1 className="title-editorial portal-page-title">briefings</h1>
			<p className="portal-page-intro">
				crie o Briefing de cada Entrega para que a Parceira saiba o que
				produzir, e mantenha o conteúdo atualizado.
			</p>

			{carregando && (
				<p className="portal-page-feedback">carregando Briefings...</p>
			)}
			{!carregando && erro && (
				<p className="portal-page-feedback is-error">{erro}</p>
			)}

			{!carregando && briefings && (
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
							buscar por parceira ou look
							<input
								placeholder="nome da parceira ou look"
								value={busca}
								onChange={(evento) => setBusca(evento.target.value)}
								style={estiloInput}
							/>
						</label>
						<button
							type="button"
							className="btn-primary"
							onClick={() => setFormularioAberto((atual) => !atual)}
							style={{ height: 40, padding: "0 24px", fontSize: 14 }}
						>
							{formularioAberto ? "fechar" : "+ novo briefing"}
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
							<FormularioNovoBriefing
								entregasSemBriefing={entregasSemBriefing}
								descreverEntrega={descreverEntrega}
								aoSalvarComSucesso={(novo) => {
									setBriefings((atual) => (atual ? [novo, ...atual] : [novo]));
									setFormularioAberto(false);
								}}
								aoCancelar={() => setFormularioAberto(false)}
							/>
						</div>
					)}

					<p className="pendencias-summary is-quiet">
						{briefings.length}{" "}
						{briefings.length === 1 ? "briefing" : "briefings"}
					</p>

					{filtrados.length === 0 && (
						<p className="portal-page-feedback">
							{briefings.length === 0
								? "nenhum Briefing criado ainda."
								: "nenhum Briefing encontrado para essa busca."}
						</p>
					)}

					{filtrados.length > 0 && (
						<ul className="portal-list">
							{filtrados.map((briefing) => (
								<LinhaBriefing
									key={briefing.id}
									briefing={briefing}
									nomeParceira={
										nomePorParceiraId.get(briefing.parceiraId) ??
										"parceira desconhecida"
									}
									editando={briefingEmEdicaoId === briefing.id}
									removendo={idRemovendo === briefing.id}
									aoAlternarEdicao={() =>
										setBriefingEmEdicaoId((atual) =>
											atual === briefing.id ? null : briefing.id,
										)
									}
									aoSalvarEdicao={(atualizado) => {
										atualizarNaLista(atualizado);
										setBriefingEmEdicaoId(null);
									}}
									aoRemover={() => void remover(briefing)}
								/>
							))}
						</ul>
					)}
				</>
			)}
		</section>
	);
}
