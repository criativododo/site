import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { ApiError, apiFetch } from "../lib/api";
import { formatarData } from "../lib/formatters";
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
	dataAprovacaoInterna: string;
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

/** Remoção só é permitida sem Entrega vinculada, ou enquanto ela ainda está AGUARDANDO_MATERIAL (briefing.service.ts::removerBriefing). */
function remocaoPermitida(
	estadoEntregaVinculada: EstadoEntrega | null,
): boolean {
	return (
		estadoEntregaVinculada === null ||
		estadoEntregaVinculada === "AGUARDANDO_MATERIAL"
	);
}

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
			<label className="admin-field">
				look
				<input className="admin-input" {...campo("look")} />
			</label>
			<label className="admin-field">
				data de entrega do material
				<input className="admin-input" type="date" {...campo("dataEntrega")} />
			</label>
			<label className="admin-field">
				data de postagem
				<input className="admin-input" type="date" {...campo("dataPostagem")} />
			</label>
			<label className="admin-field is-full">
				orientação criativa
				<textarea className="admin-input admin-textarea" {...campo("orientacao")} />
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
					: "não foi possível criar o briefing.",
			);
		} finally {
			setSalvando(false);
		}
	}

	return (
		<div className="admin-form-grid is-wide">
			{entregasSemBriefing.length === 0 ? (
				<p className="portal-page-feedback is-error admin-form-error">
					todas as entregas já têm briefing — crie uma nova entrega antes de
					criar outro briefing.
				</p>
			) : (
				<>
					<label className="admin-field is-full">
						entrega
						<select
							className="admin-select"
							value={entregaId}
							onChange={(evento) => setEntregaId(evento.target.value)}
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
				<p className="portal-page-feedback is-error admin-form-error">
					{erro}
				</p>
			)}

			<div className="admin-form-actions">
				<button
					type="button"
					className="btn-primary is-compact"
					disabled={salvando || entregasSemBriefing.length === 0}
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
		<div className="admin-form-grid is-wide">
			<CamposDeConteudo dados={dados} setDados={setDados} />

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
				className={`portal-list-row-status status-pill${briefing.entregaId ? "" : " is-alert"}`}
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
				{formatarData(briefing.dataPostagem)} · aprovação interna{" "}
				{formatarData(briefing.dataAprovacaoInterna)}
			</p>

			<div className="portal-list-row-actions">
				<button type="button" className="btn-outline" onClick={aoAlternarEdicao}>
					{editando ? "fechar edição" : "editar"}
				</button>
				<button
					type="button"
					className="btn-outline is-cherry"
					disabled={!podeRemover || removendo}
					onClick={aoRemover}
					title={
						podeRemover
							? undefined
							: "a entrega vinculada já saiu de 'aguardando material' — remover perderia o rastro do que a orientou."
					}
				>
					{removendo ? "removendo..." : "remover"}
				</button>
			</div>

			{editando && (
				<div className="admin-row-editing">
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
						: "não foi possível carregar os briefings.",
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
					: "não foi possível remover o briefing.",
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
		<section className="portal-page is-admin-wide">
			<p className="portal-eyebrow">administração</p>
			<h1 className="title-editorial portal-page-title">briefings</h1>
			<p className="portal-page-intro">
				crie o briefing de cada entrega para que a parceira saiba o que
				produzir, e mantenha o conteúdo atualizado.
			</p>

			{carregando && (
				<p className="portal-page-feedback">carregando briefings...</p>
			)}
			{!carregando && erro && (
				<p className="portal-page-feedback is-error">{erro}</p>
			)}

			{!carregando && briefings && (
				<>
					<div className="admin-toolbar">
						<label className="admin-field is-wide">
							buscar por parceira ou look
							<input
								className="admin-input"
								placeholder="nome da parceira ou look"
								value={busca}
								onChange={(evento) => setBusca(evento.target.value)}
							/>
						</label>
						<button
							type="button"
							className="btn-primary is-medium"
							onClick={() => setFormularioAberto((atual) => !atual)}
						>
							{formularioAberto ? "fechar" : "+ novo briefing"}
						</button>
					</div>

					{formularioAberto && (
						<div className="admin-form-panel">
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
								? "nenhum briefing criado ainda."
								: "nenhum briefing encontrado para essa busca."}
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
