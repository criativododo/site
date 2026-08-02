import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { ApiError, apiFetch } from "../lib/api";
import {
	formatadorMoeda,
	formatarData,
	mesReferenciaCorrente,
} from "../lib/formatters";
import { useSession } from "../lib/session";

type FormatoEntrega = "Reel" | "Carrossel" | "Stories1" | "Stories2";
type EstadoEntrega =
	| "AGUARDANDO_MATERIAL"
	| "EM_REVISAO"
	| "APROVADO"
	| "PUBLICADO";
type EstadoObrigacao = "EM_ABERTO" | "APROVADO" | "PAGO";
type TipoObrigacao = "MENSAL" | "AVULSO";

interface ItemDePendencia {
	id: string;
	mesReferencia: string;
	formato: FormatoEntrega;
	estado: EstadoEntrega;
	dataEntrega: string;
}

interface ObrigacaoFinanceira {
	id: string;
	parceiraId: string;
	mesReferencia: string;
	valor: number;
	estado: EstadoObrigacao;
	tipo: TipoObrigacao;
	dataArquivamento: string | null;
	entregasDaCompetencia: ItemDePendencia[];
	elegivelParaLiberacao: boolean;
}

interface Parceira {
	id: string;
	nome: string;
	chave: string;
	status: "ATIVA" | "INATIVA";
}

const LABEL_ESTADO: Record<EstadoObrigacao, string> = {
	EM_ABERTO: "em aberto",
	APROVADO: "aprovado",
	PAGO: "pago",
};

const LABEL_TIPO: Record<TipoObrigacao, string> = {
	MENSAL: "mensal",
	AVULSO: "avulso",
};

const LABEL_FORMATO: Record<FormatoEntrega, string> = {
	Reel: "reel",
	Carrossel: "carrossel",
	Stories1: "stories 1",
	Stories2: "stories 2",
};

const LABEL_ESTADO_ENTREGA: Record<EstadoEntrega, string> = {
	AGUARDANDO_MATERIAL: "aguardando material",
	EM_REVISAO: "em revisão",
	APROVADO: "aprovado",
	PUBLICADO: "publicado",
};


/** UC-020.01 (Mensal) / UC-020.02 (Avulso) — Mensal só lista Parceiras ATIVA; Avulso, qualquer uma. */
function FormularioNovaObrigacao({
	parceiras,
	aoSalvarComSucesso,
	aoCancelar,
}: {
	parceiras: Parceira[];
	aoSalvarComSucesso: (obrigacao: ObrigacaoFinanceira) => void;
	aoCancelar: () => void;
}) {
	const [tipo, setTipo] = useState<TipoObrigacao>("MENSAL");
	const parceirasDisponiveis = useMemo(
		() =>
			tipo === "MENSAL"
				? parceiras.filter((parceira) => parceira.status === "ATIVA")
				: parceiras,
		[parceiras, tipo],
	);
	const [parceiraId, setParceiraId] = useState(
		parceirasDisponiveis[0]?.id ?? "",
	);
	const [mesReferencia, setMesReferencia] = useState(mesReferenciaCorrente());
	const [valor, setValor] = useState("");
	const [salvando, setSalvando] = useState(false);
	const [erro, setErro] = useState<string | null>(null);

	function aoTrocarTipo(novoTipo: TipoObrigacao) {
		setTipo(novoTipo);
		const disponiveis =
			novoTipo === "MENSAL"
				? parceiras.filter((parceira) => parceira.status === "ATIVA")
				: parceiras;
		setParceiraId(disponiveis[0]?.id ?? "");
	}

	async function salvar() {
		const valorNumerico = Number(valor);
		if (!parceiraId || !mesReferencia.trim() || !(valorNumerico > 0)) {
			setErro(
				"parceira, competência e valor (maior que zero) são obrigatórios.",
			);
			return;
		}

		setSalvando(true);
		setErro(null);
		try {
			const criada = await apiFetch<ObrigacaoFinanceira>(
				"/api/admin/obrigacoes",
				{
					method: "POST",
					body: JSON.stringify({
						parceiraId,
						mesReferencia,
						valor: valorNumerico,
						tipo,
					}),
				},
			);
			aoSalvarComSucesso(criada);
		} catch (erroCapturado) {
			setErro(
				erroCapturado instanceof ApiError
					? erroCapturado.message
					: "não foi possível lançar a obrigação.",
			);
		} finally {
			setSalvando(false);
		}
	}

	return (
		<div className="admin-form-grid">
			<label className="admin-field">
				tipo
				<select
					className="admin-select"
					value={tipo}
					onChange={(evento) =>
						aoTrocarTipo(evento.target.value as TipoObrigacao)
					}
				>
					<option value="MENSAL">mensal</option>
					<option value="AVULSO">avulso</option>
				</select>
			</label>

			{parceirasDisponiveis.length === 0 ? (
				<p className="portal-page-feedback is-error admin-form-error">
					{tipo === "MENSAL"
						? "nenhuma parceira ativa cadastrada — ative uma parceira antes de lançar obrigação mensal."
						: "nenhuma parceira cadastrada ainda."}
				</p>
			) : (
				<label className="admin-field">
					parceira
					<select
						className="admin-select"
						value={parceiraId}
						onChange={(evento) => setParceiraId(evento.target.value)}
					>
						{parceirasDisponiveis.map((parceira) => (
							<option key={parceira.id} value={parceira.id}>
								{parceira.nome} ({parceira.chave})
							</option>
						))}
					</select>
				</label>
			)}

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
				valor (r$)
				<input
					className="admin-input"
					type="number"
					value={valor}
					onChange={(evento) => setValor(evento.target.value)}
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
					disabled={salvando || parceirasDisponiveis.length === 0}
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

function FormularioEdicaoValor({
	obrigacao,
	aoSalvarComSucesso,
	aoCancelar,
}: {
	obrigacao: ObrigacaoFinanceira;
	aoSalvarComSucesso: (obrigacao: ObrigacaoFinanceira) => void;
	aoCancelar: () => void;
}) {
	const [valor, setValor] = useState(String(obrigacao.valor));
	const [salvando, setSalvando] = useState(false);
	const [erro, setErro] = useState<string | null>(null);

	async function salvar() {
		const valorNumerico = Number(valor);
		if (!(valorNumerico > 0)) {
			setErro("valor deve ser maior que zero.");
			return;
		}

		setSalvando(true);
		setErro(null);
		try {
			const salva = await apiFetch<ObrigacaoFinanceira>(
				`/api/admin/obrigacoes/${obrigacao.id}`,
				{ method: "PATCH", body: JSON.stringify({ valor: valorNumerico }) },
			);
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
		<div className="admin-form-inline">
			<label className="admin-field">
				valor (r$)
				<input
					className="admin-input"
					type="number"
					value={valor}
					onChange={(evento) => setValor(evento.target.value)}
				/>
			</label>
			{erro && (
				<p className="portal-page-feedback is-error admin-form-error">
					{erro}
				</p>
			)}
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
	);
}

function LinhaObrigacao({
	obrigacao,
	nomeParceira,
	expandida,
	editando,
	emAcao,
	aoAlternarDetalhes,
	aoAlternarEdicao,
	aoSalvarEdicao,
	aoLiberar,
	aoPagar,
	aoRemover,
}: {
	obrigacao: ObrigacaoFinanceira;
	nomeParceira: string;
	expandida: boolean;
	editando: boolean;
	emAcao: boolean;
	aoAlternarDetalhes: () => void;
	aoAlternarEdicao: () => void;
	aoSalvarEdicao: (obrigacao: ObrigacaoFinanceira) => void;
	aoLiberar: () => void;
	aoPagar: () => void;
	aoRemover: () => void;
}) {
	const podeLiberar =
		obrigacao.estado === "EM_ABERTO" && obrigacao.elegivelParaLiberacao;
	const motivoBloqueioLiberacao =
		obrigacao.tipo === "MENSAL" && !obrigacao.elegivelParaLiberacao
			? "há entregas da competência ainda não aprovadas/publicadas."
			: undefined;

	return (
		<li className="portal-list-row operational-row">
			<span
				className={`portal-list-row-status status-pill${obrigacao.estado !== "PAGO" ? " is-alert" : ""}`}
			>
				{LABEL_ESTADO[obrigacao.estado]}
			</span>

			<button
				type="button"
				className="admin-row-title-button"
				onClick={aoAlternarDetalhes}
			>
				<strong className="portal-list-row-title">{nomeParceira}</strong>
				<p className="portal-list-row-meta">
					{LABEL_TIPO[obrigacao.tipo]} · competência {obrigacao.mesReferencia}
				</p>
			</button>

			<p className="portal-list-row-meta">
				{formatadorMoeda.format(obrigacao.valor)}
			</p>

			<p className="portal-list-row-meta">
				{obrigacao.entregasDaCompetencia.length}{" "}
				{obrigacao.entregasDaCompetencia.length === 1
					? "entrega vinculada"
					: "entregas vinculadas"}
				{" · "}
				{obrigacao.elegivelParaLiberacao
					? "elegível para liberação"
					: "não elegível para liberação"}
			</p>

			<div className="portal-list-row-actions">
				{obrigacao.estado === "EM_ABERTO" && (
					<>
						<button type="button" className="btn-outline" onClick={aoAlternarEdicao}>
							{editando ? "fechar edição" : "editar"}
						</button>
						<button
							type="button"
							className="btn-primary is-compact"
							disabled={!podeLiberar || emAcao}
							onClick={aoLiberar}
							title={motivoBloqueioLiberacao}
						>
							{emAcao ? "..." : "liberar"}
						</button>
						<button
							type="button"
							className="btn-outline is-cherry"
							disabled={emAcao}
							onClick={aoRemover}
						>
							{emAcao ? "..." : "remover"}
						</button>
					</>
				)}
				{obrigacao.estado === "APROVADO" && (
					<button
						type="button"
						className="btn-primary is-compact"
						disabled={emAcao}
						onClick={aoPagar}
					>
						{emAcao ? "..." : "marcar como pago"}
					</button>
				)}
				{obrigacao.estado === "PAGO" && obrigacao.dataArquivamento && (
					<span className="portal-list-row-meta">
						pago em {formatarData(obrigacao.dataArquivamento)}
					</span>
				)}
			</div>

			{expandida && (
				<div className="admin-row-expanded">
					<p className="admin-row-expanded-heading">
						entregas da competência ({obrigacao.entregasDaCompetencia.length})
					</p>
					{obrigacao.entregasDaCompetencia.length === 0 ? (
						<p className="portal-list-row-meta">
							nenhuma entrega nesta competência.
						</p>
					) : (
						<ul className="portal-list is-tight">
							{obrigacao.entregasDaCompetencia.map((item) => (
								<li key={item.id} className="portal-list-row-meta">
									{LABEL_FORMATO[item.formato]} —{" "}
									{LABEL_ESTADO_ENTREGA[item.estado]} — entrega{" "}
									{formatarData(item.dataEntrega)}
								</li>
							))}
						</ul>
					)}
				</div>
			)}

			{editando && (
				<div className="admin-row-editing">
					<FormularioEdicaoValor
						obrigacao={obrigacao}
						aoSalvarComSucesso={aoSalvarEdicao}
						aoCancelar={aoAlternarEdicao}
					/>
				</div>
			)}
		</li>
	);
}

type FiltroEstado = "TODOS" | EstadoObrigacao;

export function AdminObrigacoesPage() {
	const { sessao } = useSession();
	const [obrigacoes, setObrigacoes] = useState<ObrigacaoFinanceira[] | null>(
		null,
	);
	const [parceiras, setParceiras] = useState<Parceira[] | null>(null);
	const [erro, setErro] = useState<string | null>(null);
	const [carregando, setCarregando] = useState(true);

	const [busca, setBusca] = useState("");
	const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("TODOS");
	const [formularioAberto, setFormularioAberto] = useState(false);
	const [expandidaId, setExpandidaId] = useState<string | null>(null);
	const [emEdicaoId, setEmEdicaoId] = useState<string | null>(null);
	const [idEmAcao, setIdEmAcao] = useState<string | null>(null);

	useEffect(() => {
		let ativo = true;
		setCarregando(true);
		setErro(null);

		Promise.all([
			apiFetch<{ itens: ObrigacaoFinanceira[] }>("/api/admin/obrigacoes"),
			apiFetch<{ itens: Parceira[] }>("/api/admin/parceiras"),
		])
			.then(([obrigacoesResposta, parceirasResposta]) => {
				if (!ativo) return;
				setObrigacoes(obrigacoesResposta.itens);
				setParceiras(parceirasResposta.itens);
			})
			.catch((erroCapturado) => {
				if (!ativo) return;
				setErro(
					erroCapturado instanceof ApiError
						? erroCapturado.message
						: "não foi possível carregar as obrigações.",
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

	function atualizarNaLista(atualizada: ObrigacaoFinanceira) {
		setObrigacoes((atual) =>
			atual
				? atual.map((obrigacao) =>
						obrigacao.id === atualizada.id ? atualizada : obrigacao,
					)
				: atual,
		);
	}

	async function liberar(obrigacao: ObrigacaoFinanceira) {
		setIdEmAcao(obrigacao.id);
		setErro(null);
		try {
			const atualizada = await apiFetch<ObrigacaoFinanceira>(
				`/api/admin/obrigacoes/${obrigacao.id}/liberar`,
				{ method: "PATCH" },
			);
			atualizarNaLista(atualizada);
		} catch (erroCapturado) {
			setErro(
				erroCapturado instanceof ApiError
					? erroCapturado.message
					: "não foi possível liberar a obrigação.",
			);
		} finally {
			setIdEmAcao(null);
		}
	}

	async function pagar(obrigacao: ObrigacaoFinanceira) {
		setIdEmAcao(obrigacao.id);
		setErro(null);
		try {
			const atualizada = await apiFetch<ObrigacaoFinanceira>(
				`/api/admin/obrigacoes/${obrigacao.id}/pagar`,
				{ method: "PATCH" },
			);
			atualizarNaLista(atualizada);
		} catch (erroCapturado) {
			setErro(
				erroCapturado instanceof ApiError
					? erroCapturado.message
					: "não foi possível marcar como pago.",
			);
		} finally {
			setIdEmAcao(null);
		}
	}

	async function remover(obrigacao: ObrigacaoFinanceira) {
		setIdEmAcao(obrigacao.id);
		setErro(null);
		try {
			await apiFetch<void>(`/api/admin/obrigacoes/${obrigacao.id}`, {
				method: "DELETE",
			});
			setObrigacoes((atual) =>
				atual ? atual.filter((item) => item.id !== obrigacao.id) : atual,
			);
		} catch (erroCapturado) {
			setErro(
				erroCapturado instanceof ApiError
					? erroCapturado.message
					: "não foi possível remover a obrigação.",
			);
		} finally {
			setIdEmAcao(null);
		}
	}

	const filtradas = useMemo(() => {
		if (!obrigacoes) return [];
		const termo = busca.trim().toLowerCase();

		return obrigacoes
			.filter((obrigacao) => {
				if (filtroEstado !== "TODOS" && obrigacao.estado !== filtroEstado) {
					return false;
				}
				if (!termo) return true;
				const nomeParceira =
					nomePorParceiraId.get(obrigacao.parceiraId)?.toLowerCase() ?? "";
				return nomeParceira.includes(termo);
			})
			.sort((a, b) => b.mesReferencia.localeCompare(a.mesReferencia));
	}, [obrigacoes, busca, filtroEstado, nomePorParceiraId]);

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
			<h1 className="title-editorial portal-page-title">obrigações</h1>
			<p className="portal-page-intro">
				lance, acompanhe e libere as obrigações financeiras de cada parceira por
				competência.
			</p>

			{carregando && (
				<p className="portal-page-feedback">carregando obrigações...</p>
			)}
			{!carregando && erro && (
				<p className="portal-page-feedback is-error">{erro}</p>
			)}

			{!carregando && obrigacoes && (
				<>
					<div className="admin-toolbar">
						<label className="admin-field is-wide">
							buscar por parceira
							<input
								className="admin-input"
								placeholder="nome da parceira"
								value={busca}
								onChange={(evento) => setBusca(evento.target.value)}
							/>
						</label>
						<label className="admin-field is-narrow">
							estado
							<select
								className="admin-select"
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
							{formularioAberto ? "fechar" : "+ nova obrigação"}
						</button>
					</div>

					{formularioAberto && (
						<div className="admin-form-panel">
							<FormularioNovaObrigacao
								parceiras={parceiras ?? []}
								aoSalvarComSucesso={(nova) => {
									setObrigacoes((atual) => (atual ? [nova, ...atual] : [nova]));
									setFormularioAberto(false);
								}}
								aoCancelar={() => setFormularioAberto(false)}
							/>
						</div>
					)}

					<p className="pendencias-summary is-quiet">
						{obrigacoes.length}{" "}
						{obrigacoes.length === 1 ? "obrigação" : "obrigações"}
					</p>

					{filtradas.length === 0 && (
						<p className="portal-page-feedback">
							{obrigacoes.length === 0
								? "nenhuma obrigação lançada ainda."
								: "nenhuma obrigação encontrada para esse filtro."}
						</p>
					)}

					{filtradas.length > 0 && (
						<ul className="portal-list">
							{filtradas.map((obrigacao) => (
								<LinhaObrigacao
									key={obrigacao.id}
									obrigacao={obrigacao}
									nomeParceira={
										nomePorParceiraId.get(obrigacao.parceiraId) ??
										"parceira desconhecida"
									}
									expandida={expandidaId === obrigacao.id}
									editando={emEdicaoId === obrigacao.id}
									emAcao={idEmAcao === obrigacao.id}
									aoAlternarDetalhes={() =>
										setExpandidaId((atual) =>
											atual === obrigacao.id ? null : obrigacao.id,
										)
									}
									aoAlternarEdicao={() =>
										setEmEdicaoId((atual) =>
											atual === obrigacao.id ? null : obrigacao.id,
										)
									}
									aoSalvarEdicao={(atualizada) => {
										atualizarNaLista(atualizada);
										setEmEdicaoId(null);
									}}
									aoLiberar={() => void liberar(obrigacao)}
									aoPagar={() => void pagar(obrigacao)}
									aoRemover={() => void remover(obrigacao)}
								/>
							))}
						</ul>
					)}
				</>
			)}
		</section>
	);
}
