import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError, apiFetch } from "../lib/api";
import { formatadorMoeda, formatarPrazoRelativo } from "../lib/formatters";
import { useSession } from "../lib/session";

interface ProximoPrazo {
	tipo: "entrega" | "postagem";
	parceiraNome: string;
	formato: string;
	data: string;
	diasRestantes: number;
}

interface IndicadoresAdministrativos {
	parceiras: { ativas: number; inativas: number; total: number };
	entregas: { aguardandoMaterial: number; emRevisao: number; atrasadas: number };
	financeiro: { pendentes: number; valorPendente: number };
	lgpd: { solicitacoesExclusaoPendentes: number };
	moderacao: { contasPendentes: number };
	proximosPrazos: ProximoPrazo[];
}

interface ItemAtencao {
	label: string;
	valor: number;
	href: string;
	destaque?: boolean;
	justificativa?: string;
}

function ItemDeAtencao({ item }: { item: ItemAtencao }) {
	return (
		<Link
			to={item.href}
			className={`dashboard-acao-item${item.destaque ? " is-destaque" : ""}`}
			aria-label={`${item.label}: ${item.valor}. ver lista.`}
		>
			<span className="dashboard-acao-item-label">
				{item.label}
				{item.justificativa && (
					<span className="dashboard-acao-item-justificativa">{item.justificativa}</span>
				)}
			</span>
			<span className="dashboard-acao-item-valor">{item.valor}</span>
		</Link>
	);
}

function fraseDeNormalidade(indicadores: IndicadoresAdministrativos): string {
	const entregasNoPrazo = indicadores.entregas.aguardandoMaterial - indicadores.entregas.atrasadas;
	const partes: string[] = [
		indicadores.parceiras.ativas === 1
			? "1 parceira segue ativa"
			: `${indicadores.parceiras.ativas} parceiras seguem ativas`,
	];

	if (entregasNoPrazo > 0) {
		partes.push(
			entregasNoPrazo === 1
				? "1 entrega aguarda material dentro do prazo"
				: `${entregasNoPrazo} entregas aguardam material dentro do prazo`,
		);
	}

	if (indicadores.financeiro.pendentes > 0) {
		partes.push(`${formatadorMoeda.format(indicadores.financeiro.valorPendente)} em pagamentos pendentes`);
	}

	return `o restante está dentro do esperado: ${partes.join("; ")}.`;
}

export function AdminDashboardPage() {
	const { sessao } = useSession();
	const [indicadores, setIndicadores] = useState<IndicadoresAdministrativos | null>(
		null,
	);
	const [erro, setErro] = useState<string | null>(null);
	const [carregando, setCarregando] = useState(true);

	useEffect(() => {
		let ativo = true;
		setCarregando(true);
		setErro(null);

		apiFetch<IndicadoresAdministrativos>("/api/admin/dashboard")
			.then((dados) => ativo && setIndicadores(dados))
			.catch((erroCapturado) => {
				if (!ativo) return;
				setErro(
					erroCapturado instanceof ApiError
						? erroCapturado.message
						: "não foi possível carregar o painel.",
				);
			})
			.finally(() => ativo && setCarregando(false));

		return () => {
			ativo = false;
		};
	}, []);

	if (sessao?.papelAtor !== "ADMINISTRADOR") {
		return (
			<section className="portal-page">
				<p className="portal-page-feedback">área restrita a administradores.</p>
			</section>
		);
	}

	const itensAtencao: ItemAtencao[] = indicadores
		? (
				[
					indicadores.entregas.atrasadas > 0 && {
						label: "materiais atrasados",
						valor: indicadores.entregas.atrasadas,
						href: "/admin/entregas",
						destaque: true,
						justificativa: "já passaram da data prevista",
					},
					indicadores.entregas.emRevisao > 0 && {
						label: "aprovações aguardando",
						valor: indicadores.entregas.emRevisao,
						href: "/admin/entregas",
					},
					indicadores.moderacao.contasPendentes > 0 && {
						label: "cadastros para moderar",
						valor: indicadores.moderacao.contasPendentes,
						href: "/admin",
					},
					indicadores.lgpd.solicitacoesExclusaoPendentes > 0 && {
						label: "solicitações lgpd pendentes",
						valor: indicadores.lgpd.solicitacoesExclusaoPendentes,
						href: "/admin",
					},
				] as Array<ItemAtencao | false>
			).filter((item): item is ItemAtencao => item !== false)
		: [];

	return (
		<section className="portal-page is-admin-wide">
			<p className="portal-eyebrow">administração</p>
			<h1 className="title-editorial portal-page-title">
				painel administrativo
			</h1>
			<p className="portal-page-intro">
				onde você precisa agir agora, num só lugar.
			</p>

			{carregando && <p className="portal-page-feedback">carregando...</p>}
			{!carregando && erro && (
				<p className="portal-page-feedback is-error">{erro}</p>
			)}

			{!carregando && !erro && indicadores && (
				<>
					<div className="dashboard-bloco is-atencao">
						<p className="pendencias-summary">
							{itensAtencao.length === 0
								? "nada pendente de ação agora"
								: `requer sua ação (${itensAtencao.length})`}
						</p>
						{itensAtencao.map((item) => (
							<ItemDeAtencao key={item.label} item={item} />
						))}
					</div>

					<div className="portal-section-divider dashboard-bloco">
						<p className="pendencias-summary is-quiet">próximos prazos</p>
						{indicadores.proximosPrazos.length === 0 ? (
							<p className="dashboard-prazo-vazio">nada previsto para os próximos dias.</p>
						) : (
							<ul className="dashboard-prazo-lista">
								{indicadores.proximosPrazos.map((prazo) => (
									<li
										key={`${prazo.tipo}-${prazo.parceiraNome}-${prazo.data}`}
										className="dashboard-prazo-item"
									>
										<span>
											{prazo.tipo === "entrega" ? "entrega" : "postagem"} de {prazo.parceiraNome}
										</span>
										<span className="dashboard-prazo-item-quando">
											{formatarPrazoRelativo(prazo.diasRestantes)}
										</span>
									</li>
								))}
							</ul>
						)}
					</div>

					<div className="dashboard-bloco is-normalidade">
						<p className="dashboard-normalidade">{fraseDeNormalidade(indicadores)}</p>
					</div>
				</>
			)}
		</section>
	);
}
