import { useEffect, useState } from "react";
import { ApiError, apiFetch } from "../lib/api";
import { formatadorMoeda } from "../lib/formatters";

interface ResumoFinanceiro {
	mesReferencia: string;
	previsto: number;
	pago: number;
}

function ResumoDoPeriodo({ mesReferencia }: { mesReferencia: string }) {
	const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null);
	const [erro, setErro] = useState<string | null>(null);
	const [carregando, setCarregando] = useState(true);

	useEffect(() => {
		let ativo = true;
		setCarregando(true);
		setErro(null);

		apiFetch<ResumoFinanceiro>(`/api/portal/financeiro/${mesReferencia}/resumo`)
			.then((dados) => ativo && setResumo(dados))
			.catch((erroCapturado) => {
				if (!ativo) return;
				setErro(
					erroCapturado instanceof ApiError
						? erroCapturado.message
						: "não foi possível carregar o financeiro do período.",
				);
			})
			.finally(() => ativo && setCarregando(false));

		return () => {
			ativo = false;
		};
	}, [mesReferencia]);

	if (carregando) {
		return <p className="portal-page-feedback">carregando este período...</p>;
	}

	if (erro) {
		return <p className="portal-page-feedback is-error">{erro}</p>;
	}

	if (!resumo) {
		return null;
	}

	const aReceber = resumo.previsto - resumo.pago;

	return (
		<div className="financeiro-kpis">
			<div className="financeiro-kpi is-destaque">
				<span className="financeiro-kpi-label">a receber</span>
				<p className="financeiro-kpi-value">
					{formatadorMoeda.format(aReceber)}
				</p>
			</div>
			<div className="financeiro-kpi">
				<span className="financeiro-kpi-label">já pago</span>
				<p className="financeiro-kpi-value">
					{formatadorMoeda.format(resumo.pago)}
				</p>
			</div>
			<div className="financeiro-kpi">
				<span className="financeiro-kpi-label">previsto no período</span>
				<p className="financeiro-kpi-value">
					{formatadorMoeda.format(resumo.previsto)}
				</p>
			</div>
		</div>
	);
}

type Formato = "Reel" | "Carrossel" | "Stories1" | "Stories2";
type EstadoEntrega =
	| "AGUARDANDO_MATERIAL"
	| "EM_REVISAO"
	| "APROVADO"
	| "PUBLICADO";
type EstadoObrigacao = "EM_ABERTO" | "APROVADO" | "PAGO";

interface ItemEntregaHistorico {
	id: string;
	formato: Formato;
	estado: EstadoEntrega;
	dataEntrega: string;
}

interface ItemObrigacaoHistorico {
	id: string;
	valor: number;
	estado: EstadoObrigacao;
}

interface RespostaHistorico {
	entregas: ItemEntregaHistorico[];
	obrigacoes: ItemObrigacaoHistorico[];
}

const LABEL_FORMATO: Record<Formato, string> = {
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

const LABEL_ESTADO_OBRIGACAO: Record<EstadoObrigacao, string> = {
	EM_ABERTO: "em aberto",
	APROVADO: "aprovado",
	PAGO: "pago",
};

function HistoricoDoPeriodo({ mesReferencia }: { mesReferencia: string }) {
	const [historico, setHistorico] = useState<RespostaHistorico | null>(null);
	const [erro, setErro] = useState<string | null>(null);
	const [carregando, setCarregando] = useState(true);

	useEffect(() => {
		let ativo = true;
		setCarregando(true);
		setErro(null);

		apiFetch<RespostaHistorico>(
			`/api/portal/financeiro/${mesReferencia}/historico`,
		)
			.then((dados) => ativo && setHistorico(dados))
			.catch((erroCapturado) => {
				if (!ativo) return;
				setErro(
					erroCapturado instanceof ApiError
						? erroCapturado.message
						: "não foi possível carregar o histórico do período.",
				);
			})
			.finally(() => ativo && setCarregando(false));

		return () => {
			ativo = false;
		};
	}, [mesReferencia]);

	if (carregando) {
		return <p className="portal-page-feedback">carregando histórico...</p>;
	}

	if (erro) {
		return <p className="portal-page-feedback is-error">{erro}</p>;
	}

	if (!historico) {
		return null;
	}

	const semHistorico =
		historico.entregas.length === 0 && historico.obrigacoes.length === 0;

	return (
		<div className="portal-section-divider">
			<p className="pendencias-summary is-quiet">histórico do período</p>

			{semHistorico && (
				<p className="portal-page-feedback">sem histórico neste período.</p>
			)}

			{historico.entregas.length > 0 && (
				<>
					<p className="portal-list-row-meta">conteúdos entregues</p>
					<ul className="portal-list is-spaced-bottom">
						{historico.entregas.map((entrega) => (
							<li key={entrega.id} className="portal-list-row">
								<span className="portal-list-row-title">
									{LABEL_FORMATO[entrega.formato]}
								</span>
								<span className="portal-list-row-status">
									{LABEL_ESTADO_ENTREGA[entrega.estado]}
								</span>
							</li>
						))}
					</ul>
				</>
			)}

			{historico.obrigacoes.length > 0 && (
				<>
					<p className="portal-list-row-meta">pagamentos</p>
					<ul className="portal-list">
						{historico.obrigacoes.map((obrigacao) => (
							<li key={obrigacao.id} className="portal-list-row">
								<span className="portal-list-row-title">
									{formatadorMoeda.format(obrigacao.valor)}
								</span>
								<span className="portal-list-row-status">
									{LABEL_ESTADO_OBRIGACAO[obrigacao.estado]}
								</span>
							</li>
						))}
					</ul>
				</>
			)}
		</div>
	);
}

function labelPeriodo(mesReferencia: string): string {
	const [ano, mes] = mesReferencia.split("-");
	const nomes = [
		"janeiro",
		"fevereiro",
		"março",
		"abril",
		"maio",
		"junho",
		"julho",
		"agosto",
		"setembro",
		"outubro",
		"novembro",
		"dezembro",
	];
	return `${nomes[Number(mes) - 1]}/${ano}`;
}

export function FinanceiroPage() {
	const [periodos, setPeriodos] = useState<string[] | null>(null);
	const [periodoSelecionado, setPeriodoSelecionado] = useState<string | null>(
		null,
	);
	const [erro, setErro] = useState<string | null>(null);
	const [carregando, setCarregando] = useState(true);

	useEffect(() => {
		let ativo = true;

		apiFetch<{ periodos: string[] }>("/api/portal/financeiro/periodos")
			.then((dados) => {
				if (!ativo) return;
				setPeriodos(dados.periodos);
				setPeriodoSelecionado(dados.periodos[0] ?? null);
			})
			.catch((erroCapturado) => {
				if (!ativo) return;
				setErro(
					erroCapturado instanceof ApiError
						? erroCapturado.message
						: "não foi possível carregar os períodos.",
				);
			})
			.finally(() => ativo && setCarregando(false));

		return () => {
			ativo = false;
		};
	}, []);

	return (
		<section className="portal-page">
			<p className="portal-eyebrow">pagamentos</p>
			<h1 className="title-editorial portal-page-title">
				financeiro e histórico
			</h1>
			<p className="portal-page-intro">
				acompanhe o previsto, o já pago e o histórico por competência.
			</p>

			{carregando && (
				<p className="portal-page-feedback">carregando períodos...</p>
			)}

			{!carregando && erro && (
				<p className="portal-page-feedback is-error">{erro}</p>
			)}

			{!carregando && !erro && periodos && periodos.length === 0 && (
				<p className="portal-page-feedback">
					nenhum período com atividade ainda.
				</p>
			)}

			{!carregando && !erro && periodos && periodos.length > 0 && (
				<>
					<label className="portal-field">
						<span className="portal-field-label">período</span>
						<select
							className="portal-field-select"
							value={periodoSelecionado ?? ""}
							onChange={(evento) => setPeriodoSelecionado(evento.target.value)}
						>
							{periodos.map((periodo) => (
								<option key={periodo} value={periodo}>
									{labelPeriodo(periodo)}
								</option>
							))}
						</select>
					</label>

					{periodoSelecionado && (
						<>
							<ResumoDoPeriodo mesReferencia={periodoSelecionado} />
							<HistoricoDoPeriodo mesReferencia={periodoSelecionado} />
						</>
					)}
				</>
			)}
		</section>
	);
}
