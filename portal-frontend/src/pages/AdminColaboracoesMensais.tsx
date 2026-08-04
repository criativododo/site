import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import { ApiError, apiFetch } from "../lib/api";
import {
	formatadorMoeda,
	formatarData,
	mesReferenciaCorrente,
} from "../lib/formatters";
import { useSession } from "../lib/session";

interface Parceira {
	id: string;
	nome: string;
	chave: string;
	status: "ATIVA" | "INATIVA";
}

interface CondicaoComercial {
	valorMensal: number;
	entregaveisReel: number;
	entregaveisCarrossel: number;
	entregaveisStories: number;
	prazoUsoImagemDias: number;
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

interface EstatisticasCompilacao {
	mesReferencia: string;
	parceirasElegiveis: number;
	colaboracoesCriadas: number;
	colaboracoesJaExistentes: number;
	entregasVinculadas: number;
	briefingsVinculados: number;
	obrigacoesVinculadas: number;
}

/**
 * ADR-016 item 2 — gatilho manual do Administrador. Não gera Entregas/Briefings/Obrigações
 * automaticamente (regra do Service, não desta tela): só materializa a Colaboração Mensal
 * para cada Parceira ATIVA e vincula o que já existir para aquela competência.
 */
function FormularioCompilacao({
	aoCompilarComSucesso,
}: {
	aoCompilarComSucesso: (estatisticas: EstatisticasCompilacao) => void;
}) {
	const [mesReferencia, setMesReferencia] = useState(mesReferenciaCorrente());
	const [compilando, setCompilando] = useState(false);
	const [erro, setErro] = useState<string | null>(null);

	async function compilar() {
		if (!mesReferencia.trim()) {
			setErro("competência é obrigatória.");
			return;
		}

		setCompilando(true);
		setErro(null);
		try {
			const estatisticas = await apiFetch<EstatisticasCompilacao>(
				"/api/admin/colaboracoes-mensais/compilar",
				{ method: "POST", body: JSON.stringify({ mesReferencia }) },
			);
			aoCompilarComSucesso(estatisticas);
		} catch (erroCapturado) {
			setErro(
				erroCapturado instanceof ApiError
					? erroCapturado.message
					: "não foi possível compilar a competência.",
			);
		} finally {
			setCompilando(false);
		}
	}

	return (
		<>
			<div className="admin-toolbar">
				<label className="admin-field">
					competência para compilar (aaaa-mm)
					<input
						className="admin-input"
						name="mesReferenciaCompilacao"
						value={mesReferencia}
						onChange={(evento: ChangeEvent<HTMLInputElement>) =>
							setMesReferencia(evento.target.value)
						}
						placeholder="2026-08"
					/>
				</label>
				<button
					type="button"
					className="btn-primary is-medium"
					disabled={compilando}
					onClick={() => void compilar()}
				>
					{compilando ? "compilando" : "compilar competência"}
				</button>
			</div>
			{erro && <p className="portal-page-feedback is-error">{erro}</p>}
		</>
	);
}

function LinhaColaboracaoMensal({
	colaboracao,
	expandida,
	aoAlternarDetalhes,
}: {
	colaboracao: ColaboracaoMensal;
	expandida: boolean;
	aoAlternarDetalhes: () => void;
}) {
	return (
		<li className="portal-list-row operational-row">
			<span className="portal-list-row-status status-pill">
				{colaboracao.status.toLowerCase()}
			</span>

			<button
				type="button"
				className="admin-row-title-button"
				onClick={aoAlternarDetalhes}
			>
				<strong className="portal-list-row-title">
					competência {colaboracao.mesReferencia}
				</strong>
				<p className="portal-list-row-meta">
					compilada em {formatarData(colaboracao.criadoEm)} por{" "}
					{colaboracao.criadoPor}
				</p>
			</button>

			<p className="portal-list-row-meta">
				{colaboracao.quantidadeRegistrosGerados}{" "}
				{colaboracao.quantidadeRegistrosGerados === 1
					? "registro vinculado"
					: "registros vinculados"}
			</p>

			{expandida && (
				<div className="admin-row-expanded">
					<dl>
						<dt>valor mensal (congelado na compilação)</dt>
						<dd>
							{formatadorMoeda.format(
								colaboracao.condicaoComercial.valorMensal,
							)}
						</dd>
						<dt>entregáveis contratados (congelado na compilação)</dt>
						<dd>
							{colaboracao.condicaoComercial.entregaveisReel} reel ·{" "}
							{colaboracao.condicaoComercial.entregaveisCarrossel} carrossel ·{" "}
							{colaboracao.condicaoComercial.entregaveisStories} stories
						</dd>
					</dl>
				</div>
			)}
		</li>
	);
}

export function AdminColaboracoesMensaisPage() {
	const { sessao } = useSession();

	const [parceiras, setParceiras] = useState<Parceira[] | null>(null);
	const [erroParceiras, setErroParceiras] = useState<string | null>(null);
	const [carregandoParceiras, setCarregandoParceiras] = useState(true);

	const [parceiraSelecionadaId, setParceiraSelecionadaId] = useState("");
	const [colaboracoes, setColaboracoes] = useState<ColaboracaoMensal[] | null>(
		null,
	);
	const [erroHistorico, setErroHistorico] = useState<string | null>(null);
	const [carregandoHistorico, setCarregandoHistorico] = useState(false);
	const [expandidaId, setExpandidaId] = useState<string | null>(null);

	const [ultimaCompilacao, setUltimaCompilacao] =
		useState<EstatisticasCompilacao | null>(null);
	// Incrementado após cada compilação bem-sucedida para forçar o useEffect de histórico a
	// recarregar mesmo quando `parceiraSelecionadaId` não muda (a Parceira em exibição pode
	// ter acabado de ganhar uma Colaboração Mensal nova).
	const [versaoHistorico, setVersaoHistorico] = useState(0);

	useEffect(() => {
		let ativo = true;
		setCarregandoParceiras(true);
		setErroParceiras(null);

		apiFetch<{ itens: Parceira[] }>("/api/admin/parceiras")
			.then((dados) => {
				if (!ativo) return;
				setParceiras(dados.itens);
				const primeiraAtiva = dados.itens.find(
					(parceira) => parceira.status === "ATIVA",
				);
				setParceiraSelecionadaId(primeiraAtiva?.id ?? dados.itens[0]?.id ?? "");
			})
			.catch((erroCapturado) => {
				if (!ativo) return;
				setErroParceiras(
					erroCapturado instanceof ApiError
						? erroCapturado.message
						: "não foi possível carregar as parceiras.",
				);
			})
			.finally(() => ativo && setCarregandoParceiras(false));

		return () => {
			ativo = false;
		};
	}, []);

	useEffect(() => {
		if (!parceiraSelecionadaId) {
			setColaboracoes(null);
			return;
		}

		let ativo = true;
		setCarregandoHistorico(true);
		setErroHistorico(null);

		apiFetch<{ itens: ColaboracaoMensal[] }>(
			`/api/admin/colaboracoes-mensais?parceiraId=${encodeURIComponent(parceiraSelecionadaId)}`,
		)
			.then((dados) => ativo && setColaboracoes(dados.itens))
			.catch((erroCapturado) => {
				if (!ativo) return;
				setErroHistorico(
					erroCapturado instanceof ApiError
						? erroCapturado.message
						: "não foi possível carregar o histórico de competências.",
				);
			})
			.finally(() => ativo && setCarregandoHistorico(false));

		return () => {
			ativo = false;
		};
	}, [parceiraSelecionadaId, versaoHistorico]);

	function aoCompilarComSucesso(estatisticas: EstatisticasCompilacao) {
		setUltimaCompilacao(estatisticas);
		setVersaoHistorico((atual) => atual + 1);
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
			<h1 className="title-editorial portal-page-title">colaboração mensal</h1>
			<p className="portal-page-intro">
				compile manualmente uma competência para as parceiras ativas e consulte
				o histórico de competências já compiladas.
			</p>

			{carregandoParceiras && (
				<p className="portal-page-feedback">carregando parceiras</p>
			)}
			{!carregandoParceiras && erroParceiras && (
				<p className="portal-page-feedback is-error">{erroParceiras}</p>
			)}

			{!carregandoParceiras && parceiras && parceiras.length === 0 && (
				<p className="portal-page-feedback">
					nenhuma parceira cadastrada ainda. cadastre uma parceira antes de
					compilar uma competência.
				</p>
			)}

			{!carregandoParceiras && parceiras && parceiras.length > 0 && (
				<>
					<FormularioCompilacao aoCompilarComSucesso={aoCompilarComSucesso} />

					{ultimaCompilacao && (
						<p className="portal-page-feedback">
							competência {ultimaCompilacao.mesReferencia}:{" "}
							{ultimaCompilacao.colaboracoesCriadas}{" "}
							{ultimaCompilacao.colaboracoesCriadas === 1
								? "colaboração criada"
								: "colaborações criadas"}{" "}
							· {ultimaCompilacao.colaboracoesJaExistentes} já existente(s) ·
							vínculos: {ultimaCompilacao.entregasVinculadas} entregas,{" "}
							{ultimaCompilacao.briefingsVinculados} briefings,{" "}
							{ultimaCompilacao.obrigacoesVinculadas} obrigações.
						</p>
					)}

					<div className="portal-section-divider">
						<p className="pendencias-summary is-quiet">
							histórico de competências por parceira
						</p>

						<div className="admin-toolbar">
							<label className="admin-field is-wide">
								parceira
								<select
									className="admin-select"
									name="parceiraSelecionada"
									value={parceiraSelecionadaId}
									onChange={(evento) =>
										setParceiraSelecionadaId(evento.target.value)
									}
								>
									{parceiras.map((parceira) => (
										<option key={parceira.id} value={parceira.id}>
											{parceira.nome} ({parceira.chave})
											{parceira.status === "INATIVA" ? " (inativa)" : ""}
										</option>
									))}
								</select>
							</label>
						</div>

						{carregandoHistorico && (
							<p className="portal-page-feedback">
								carregando histórico da parceira
							</p>
						)}
						{!carregandoHistorico && erroHistorico && (
							<p className="portal-page-feedback is-error">{erroHistorico}</p>
						)}

						{!carregandoHistorico &&
							!erroHistorico &&
							colaboracoes &&
							colaboracoes.length === 0 && (
								<p className="portal-page-feedback">
									nenhuma colaboração mensal compilada para esta parceira
									ainda.
								</p>
							)}

						{!carregandoHistorico &&
							!erroHistorico &&
							colaboracoes &&
							colaboracoes.length > 0 && (
								<ul className="portal-list">
									{colaboracoes
										.slice()
										.sort((a, b) =>
											b.mesReferencia.localeCompare(a.mesReferencia),
										)
										.map((colaboracao) => (
											<LinhaColaboracaoMensal
												key={colaboracao.id}
												colaboracao={colaboracao}
												expandida={expandidaId === colaboracao.id}
												aoAlternarDetalhes={() =>
													setExpandidaId((atual) =>
														atual === colaboracao.id ? null : colaboracao.id,
													)
												}
											/>
										))}
								</ul>
							)}
					</div>
				</>
			)}
		</section>
	);
}
