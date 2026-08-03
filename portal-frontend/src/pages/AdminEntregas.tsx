import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { OperationalRowHeader } from "../components/OperationalRowHeader";
import { ApiError, apiFetch } from "../lib/api";
import { formatarData, mesReferenciaCorrente } from "../lib/formatters";
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
	dataArquivamento: string | null;
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
					: "não foi possível criar a entrega.",
			);
		} finally {
			setSalvando(false);
		}
	}

	return (
		<div className="admin-form-grid">
			{parceirasAtivas.length === 0 ? (
				<p className="portal-page-feedback is-error admin-form-error">
					nenhuma parceira ativa cadastrada — ative uma parceira antes de criar
					entregas.
				</p>
			) : (
				<>
					<label className="admin-field">
						parceira
						<select
							className="admin-select"
							value={parceiraId}
							onChange={(evento) => setParceiraId(evento.target.value)}
						>
							{parceirasAtivas.map((parceira) => (
								<option key={parceira.id} value={parceira.id}>
									{parceira.nome} ({parceira.chave})
								</option>
							))}
						</select>
					</label>
					<label className="admin-field">
						competência (aaaa-mm)
						<input
							className="admin-input"
							value={mesReferencia}
							onChange={(evento: ChangeEvent<HTMLInputElement>) =>
								setMesReferencia(evento.target.value)
							}
							placeholder="2026-07"
						/>
					</label>
					<label className="admin-field">
						formato
						<select
							className="admin-select"
							value={formato}
							onChange={(evento) =>
								setFormato(evento.target.value as FormatoEntrega)
							}
						>
							{Object.entries(LABEL_FORMATO).map(([valor, rotulo]) => (
								<option key={valor} value={valor}>
									{rotulo}
								</option>
							))}
						</select>
					</label>
					<label className="admin-field">
						data de entrega
						<input
							className="admin-input"
							type="date"
							value={dataEntrega}
							onChange={(evento) => setDataEntrega(evento.target.value)}
						/>
					</label>
				</>
			)}

			{erro && (
				<p className="portal-page-feedback is-error admin-form-error">
					{erro}
				</p>
			)}

			<div className="admin-form-actions">
				<button
					type="button"
					className="btn-primary is-compact"
					disabled={salvando || parceirasAtivas.length === 0}
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

function LinhaEntrega({
	entrega,
	nomeParceira,
	emAcao,
	aoAprovar,
	aoPublicar,
}: {
	entrega: Entrega;
	nomeParceira: string;
	emAcao: boolean;
	aoAprovar: () => void;
	aoPublicar: () => void;
}) {
	return (
		<li className="portal-list-row operational-row">
			<span
				className={`portal-list-row-status status-pill${entrega.estado === "AGUARDANDO_MATERIAL" ? " is-alert" : ""}`}
			>
				{LABEL_ESTADO[entrega.estado]}
			</span>

			<div>
				<strong className="portal-list-row-title">{nomeParceira}</strong>
				<p className="portal-list-row-meta">
					{LABEL_FORMATO[entrega.formato]} · competência {entrega.mesReferencia}
				</p>
			</div>

			<p className="portal-list-row-meta">{formatarData(entrega.dataEntrega)}</p>

			<p className="portal-list-row-meta">
				{entrega.materialEnviado ? "material enviado" : "sem material ainda"}
			</p>

			{/* Sempre ocupa a 5ª coluna do grid, mesmo sem ação disponível (AGUARDANDO_MATERIAL/
			    PUBLICADO) — do contrário a linha só tem 4 filhos e a grade de 5 colunas desalinha
			    com as linhas vizinhas que têm ação (achado de grid da Fase B). */}
			<div className="portal-list-row-actions">
				{entrega.estado === "EM_REVISAO" && (
					<button
						type="button"
						className="btn-primary is-compact"
						disabled={emAcao}
						onClick={aoAprovar}
					>
						{emAcao ? "..." : "aprovar"}
					</button>
				)}
				{entrega.estado === "APROVADO" && (
					<button
						type="button"
						className="btn-primary is-compact"
						disabled={emAcao}
						onClick={aoPublicar}
					>
						{emAcao ? "..." : "publicar"}
					</button>
				)}
			</div>
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
	const [idEmAcao, setIdEmAcao] = useState<string | null>(null);

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
						: "não foi possível carregar as entregas.",
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

	async function aprovar(entrega: Entrega) {
		setIdEmAcao(entrega.id);
		setErro(null);
		try {
			const atualizada = await apiFetch<Entrega>(
				`/api/admin/entregas/${entrega.id}/aprovar`,
				{ method: "PATCH" },
			);
			setEntregas((atual) =>
				atual
					? atual.map((item) => (item.id === atualizada.id ? atualizada : item))
					: atual,
			);
		} catch (erroCapturado) {
			setErro(
				erroCapturado instanceof ApiError
					? erroCapturado.message
					: "não foi possível aprovar a Entrega.",
			);
		} finally {
			setIdEmAcao(null);
		}
	}

	async function publicar(entrega: Entrega) {
		setIdEmAcao(entrega.id);
		setErro(null);
		try {
			const atualizada = await apiFetch<Entrega>(
				`/api/admin/entregas/${entrega.id}/publicar`,
				{ method: "PATCH" },
			);
			setEntregas((atual) =>
				atual
					? atual.map((item) => (item.id === atualizada.id ? atualizada : item))
					: atual,
			);
		} catch (erroCapturado) {
			setErro(
				erroCapturado instanceof ApiError
					? erroCapturado.message
					: "não foi possível publicar a Entrega.",
			);
		} finally {
			setIdEmAcao(null);
		}
	}

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
		<section className="portal-page is-admin-wide">
			<p className="portal-eyebrow">administração</p>
			<h1 className="title-editorial portal-page-title">entregas</h1>
			<p className="portal-page-intro">
				crie entregas para alimentar o portal das parceiras e acompanhe o estado
				de cada uma.
			</p>

			{carregando && (
				<p className="portal-page-feedback">carregando entregas...</p>
			)}
			{!carregando && erro && (
				<p className="portal-page-feedback is-error">{erro}</p>
			)}

			{!carregando && entregas && (
				<>
					<div className="admin-toolbar">
						<label className="admin-field is-wide">
							buscar por parceira
							<input
								className="admin-input"
								name="buscaParceira"
								placeholder="nome da parceira"
								value={busca}
								onChange={(evento) => setBusca(evento.target.value)}
							/>
						</label>
						<label className="admin-field is-narrow">
							estado
							<select
								className="admin-select"
								name="filtroEstado"
								value={filtroEstado}
								onChange={(evento) =>
									setFiltroEstado(evento.target.value as FiltroEstado)
								}
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
							className="btn-primary is-medium"
							onClick={() => setFormularioAberto((atual) => !atual)}
						>
							{formularioAberto ? "fechar" : "+ nova entrega"}
						</button>
					</div>

					{formularioAberto && (
						<div className="admin-form-panel">
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
								? "nenhuma entrega criada ainda."
								: "nenhuma entrega encontrada para esse filtro."}
						</p>
					)}

					{filtradas.length > 0 && (
						<>
							<OperationalRowHeader
								labels={["status", "parceira", "entrega em", "material", "ações"]}
							/>
							<ul className="portal-list">
								{filtradas.map((entrega) => (
									<LinhaEntrega
										key={entrega.id}
										entrega={entrega}
										nomeParceira={
											nomePorParceiraId.get(entrega.parceiraId) ??
											"parceira desconhecida"
										}
										emAcao={idEmAcao === entrega.id}
										aoAprovar={() => void aprovar(entrega)}
										aoPublicar={() => void publicar(entrega)}
									/>
								))}
							</ul>
						</>
					)}
				</>
			)}
		</section>
	);
}
