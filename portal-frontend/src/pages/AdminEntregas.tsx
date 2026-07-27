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
	materialEnviado: string | null;
	dataCriacao: string;
	dataAtualizacao: string;
}

interface Parceira {
	id: string;
	nome: string;
	chave: string;
	status: "ATIVA" | "INATIVA";
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

function mesReferenciaCorrente(): string {
	const agora = new Date();
	const ano = agora.getUTCFullYear();
	const mes = String(agora.getUTCMonth() + 1).padStart(2, "0");
	return `${ano}-${mes}`;
}

function formatarData(dataIso: string): string {
	return new Date(dataIso).toLocaleDateString("pt-BR");
}

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

/**
 * UC administrativo (Backoffice, preparação para SPEC-012 escrita completa): permite à equipe
 * criar Entregas reais para alimentar o Portal da Parceira. Só GET/POST nesta entrega — edição
 * e exclusão administrativas ficam para quando o vínculo com Briefing (escrita) existir (ver
 * docs/handoff/HANDOFF_CODEX_BACKOFFICE.md §1).
 */
function FormularioEntrega({
	parceirasAtivas,
	aoSalvarComSucesso,
	aoCancelar,
}: {
	parceirasAtivas: Parceira[];
	aoSalvarComSucesso: (entrega: Entrega) => void;
	aoCancelar: () => void;
}) {
	const [parceiraId, setParceiraId] = useState(parceirasAtivas[0]?.id ?? "");
	const [mesReferencia, setMesReferencia] = useState(mesReferenciaCorrente());
	const [formato, setFormato] = useState<FormatoEntrega>("Reel");
	const [dataEntrega, setDataEntrega] = useState("");
	const [salvando, setSalvando] = useState(false);
	const [erro, setErro] = useState<string | null>(null);

	async function salvar() {
		if (!parceiraId || !mesReferencia.trim() || !dataEntrega) {
			setErro("parceira, competência e data de entrega são obrigatórias.");
			return;
		}

		setSalvando(true);
		setErro(null);
		try {
			const criada = await apiFetch<Entrega>("/api/admin/entregas", {
				method: "POST",
				body: JSON.stringify({
					parceiraId,
					mesReferencia,
					formato,
					dataEntrega,
				}),
			});
			aoSalvarComSucesso(criada);
		} catch (erroCapturado) {
			setErro(
				erroCapturado instanceof ApiError
					? erroCapturado.message
					: "não foi possível criar a Entrega.",
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
			{parceirasAtivas.length === 0 ? (
				<p
					className="portal-page-feedback is-error"
					style={{ margin: 0, gridColumn: "1 / -1" }}
				>
					nenhuma Parceira ATIVA cadastrada — ative uma Parceira antes de criar
					Entregas.
				</p>
			) : (
				<>
					<label style={estiloLabel}>
						parceira
						<select
							value={parceiraId}
							onChange={(evento) => setParceiraId(evento.target.value)}
							style={estiloInput}
						>
							{parceirasAtivas.map((parceira) => (
								<option key={parceira.id} value={parceira.id}>
									{parceira.nome} ({parceira.chave})
								</option>
							))}
						</select>
					</label>
					<label style={estiloLabel}>
						competência (aaaa-mm)
						<input
							value={mesReferencia}
							onChange={(evento: ChangeEvent<HTMLInputElement>) =>
								setMesReferencia(evento.target.value)
							}
							placeholder="2026-07"
							style={estiloInput}
						/>
					</label>
					<label style={estiloLabel}>
						formato
						<select
							value={formato}
							onChange={(evento) =>
								setFormato(evento.target.value as FormatoEntrega)
							}
							style={estiloInput}
						>
							{Object.entries(LABEL_FORMATO).map(([valor, rotulo]) => (
								<option key={valor} value={valor}>
									{rotulo}
								</option>
							))}
						</select>
					</label>
					<label style={estiloLabel}>
						data de entrega
						<input
							type="date"
							value={dataEntrega}
							onChange={(evento) => setDataEntrega(evento.target.value)}
							style={estiloInput}
						/>
					</label>
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
					disabled={salvando || parceirasAtivas.length === 0}
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

function LinhaEntrega({
	entrega,
	nomeParceira,
}: {
	entrega: Entrega;
	nomeParceira: string;
}) {
	return (
		<li className="portal-list-row operational-row">
			<span
				className="portal-list-row-status"
				style={{
					fontWeight: 700,
					color:
						entrega.estado === "AGUARDANDO_MATERIAL"
							? "var(--color-cherry)"
							: "inherit",
				}}
			>
				{LABEL_ESTADO[entrega.estado]}
			</span>

			<div>
				<strong className="portal-list-row-title">{nomeParceira}</strong>
				<p className="portal-list-row-meta">
					{LABEL_FORMATO[entrega.formato]} · competência {entrega.mesReferencia}
				</p>
			</div>

			<p className="portal-list-row-meta">
				entrega em {formatarData(entrega.dataEntrega)}
			</p>

			<p className="portal-list-row-meta">
				{entrega.materialEnviado ? "material enviado" : "sem material ainda"}
			</p>
		</li>
	);
}

type FiltroEstado = "TODOS" | EstadoEntrega;

export function AdminEntregasPage() {
	const { sessao } = useSession();
	const [entregas, setEntregas] = useState<Entrega[] | null>(null);
	const [parceiras, setParceiras] = useState<Parceira[] | null>(null);
	const [erro, setErro] = useState<string | null>(null);
	const [carregando, setCarregando] = useState(true);

	const [busca, setBusca] = useState("");
	const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("TODOS");
	const [formularioAberto, setFormularioAberto] = useState(false);

	useEffect(() => {
		let ativo = true;
		setCarregando(true);
		setErro(null);

		Promise.all([
			apiFetch<{ itens: Entrega[] }>("/api/admin/entregas"),
			apiFetch<{ itens: Parceira[] }>("/api/admin/parceiras"),
		])
			.then(([entregasResposta, parceirasResposta]) => {
				if (!ativo) return;
				setEntregas(entregasResposta.itens);
				setParceiras(parceirasResposta.itens);
			})
			.catch((erroCapturado) => {
				if (!ativo) return;
				setErro(
					erroCapturado instanceof ApiError
						? erroCapturado.message
						: "não foi possível carregar as Entregas.",
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

	const parceirasAtivas = useMemo(
		() => (parceiras ?? []).filter((parceira) => parceira.status === "ATIVA"),
		[parceiras],
	);

	const filtradas = useMemo(() => {
		if (!entregas) return [];
		const termo = busca.trim().toLowerCase();

		return entregas
			.filter((entrega) => {
				if (filtroEstado !== "TODOS" && entrega.estado !== filtroEstado) {
					return false;
				}
				if (!termo) return true;
				const nomeParceira =
					nomePorParceiraId.get(entrega.parceiraId)?.toLowerCase() ?? "";
				return nomeParceira.includes(termo);
			})
			.sort((a, b) => b.dataEntrega.localeCompare(a.dataEntrega));
	}, [entregas, busca, filtroEstado, nomePorParceiraId]);

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
			<h1 className="title-editorial portal-page-title">entregas</h1>
			<p className="portal-page-intro">
				crie Entregas para alimentar o Portal das Parceiras e acompanhe o estado
				de cada uma.
			</p>

			{carregando && (
				<p className="portal-page-feedback">carregando Entregas...</p>
			)}
			{!carregando && erro && (
				<p className="portal-page-feedback is-error">{erro}</p>
			)}

			{!carregando && entregas && (
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
							buscar por parceira
							<input
								placeholder="nome da parceira"
								value={busca}
								onChange={(evento) => setBusca(evento.target.value)}
								style={estiloInput}
							/>
						</label>
						<label style={{ ...estiloLabel, flex: "1 1 170px" }}>
							estado
							<select
								value={filtroEstado}
								onChange={(evento) =>
									setFiltroEstado(evento.target.value as FiltroEstado)
								}
								style={estiloInput}
							>
								<option value="TODOS">todos</option>
								{Object.entries(LABEL_ESTADO).map(([valor, rotulo]) => (
									<option key={valor} value={valor}>
										{rotulo}
									</option>
								))}
							</select>
						</label>
						<button
							type="button"
							className="btn-primary"
							onClick={() => setFormularioAberto((atual) => !atual)}
							style={{ height: 40, padding: "0 24px", fontSize: 14 }}
						>
							{formularioAberto ? "fechar" : "+ nova entrega"}
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
							<FormularioEntrega
								parceirasAtivas={parceirasAtivas}
								aoSalvarComSucesso={(nova) => {
									setEntregas((atual) => (atual ? [nova, ...atual] : [nova]));
									setFormularioAberto(false);
								}}
								aoCancelar={() => setFormularioAberto(false)}
							/>
						</div>
					)}

					<p className="pendencias-summary is-quiet">
						{entregas.length} {entregas.length === 1 ? "entrega" : "entregas"}
					</p>

					{filtradas.length === 0 && (
						<p className="portal-page-feedback">
							{entregas.length === 0
								? "nenhuma Entrega criada ainda."
								: "nenhuma Entrega encontrada para esse filtro."}
						</p>
					)}

					{filtradas.length > 0 && (
						<ul className="portal-list">
							{filtradas.map((entrega) => (
								<LinhaEntrega
									key={entrega.id}
									entrega={entrega}
									nomeParceira={
										nomePorParceiraId.get(entrega.parceiraId) ??
										"parceira desconhecida"
									}
								/>
							))}
						</ul>
					)}
				</>
			)}
		</section>
	);
}
