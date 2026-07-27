import { useEffect, useState } from "react";
import { ApiError, apiFetch } from "../lib/api";
import { useSession } from "../lib/session";

interface IndicadoresAdministrativos {
	parceiras: { ativas: number; inativas: number; total: number };
	entregas: { aguardandoMaterial: number; emRevisao: number; atrasadas: number };
	financeiro: { pendentes: number; valorPendente: number };
	lgpd: { solicitacoesExclusaoPendentes: number };
	moderacao: { contasPendentes: number };
}

const formatadorMoeda = new Intl.NumberFormat("pt-BR", {
	style: "currency",
	currency: "BRL",
});

function Indicador({
	label,
	valor,
	destaque,
}: {
	label: string;
	valor: string | number;
	destaque?: boolean;
}) {
	return (
		<div className={`financeiro-kpi${destaque ? " is-destaque" : ""}`}>
			<span className="financeiro-kpi-label">{label}</span>
			<p className="financeiro-kpi-value">{valor}</p>
		</div>
	);
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
						: "Não foi possível carregar o painel.",
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

	const requerAcao = indicadores
		? indicadores.entregas.atrasadas +
			indicadores.entregas.emRevisao +
			indicadores.moderacao.contasPendentes +
			indicadores.lgpd.solicitacoesExclusaoPendentes
		: 0;

	return (
		<section className="portal-page" style={{ maxWidth: 920 }}>
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
					<p className="pendencias-summary">
						{requerAcao === 0
							? "nada pendente de ação agora"
							: `requer sua ação (${requerAcao})`}
					</p>
					<div className="financeiro-kpis">
						<Indicador
							label="materiais atrasados"
							valor={indicadores.entregas.atrasadas}
							destaque={indicadores.entregas.atrasadas > 0}
						/>
						<Indicador
							label="aprovações aguardando"
							valor={indicadores.entregas.emRevisao}
							destaque={indicadores.entregas.emRevisao > 0}
						/>
						<Indicador
							label="cadastros para moderar"
							valor={indicadores.moderacao.contasPendentes}
							destaque={indicadores.moderacao.contasPendentes > 0}
						/>
						<Indicador
							label="solicitações lgpd"
							valor={indicadores.lgpd.solicitacoesExclusaoPendentes}
							destaque={indicadores.lgpd.solicitacoesExclusaoPendentes > 0}
						/>
					</div>

					<div className="portal-section-divider">
						<p className="pendencias-summary is-quiet">indicadores gerais</p>
						<div className="financeiro-kpis">
							<Indicador
								label="parceiras ativas"
								valor={indicadores.parceiras.ativas}
							/>
							<Indicador
								label="parceiras inativas"
								valor={indicadores.parceiras.inativas}
							/>
							<Indicador
								label="entregas pendentes"
								valor={indicadores.entregas.aguardandoMaterial}
							/>
							<Indicador
								label="pagamentos pendentes"
								valor={indicadores.financeiro.pendentes}
							/>
							<Indicador
								label="valor pendente"
								valor={formatadorMoeda.format(indicadores.financeiro.valorPendente)}
							/>
						</div>
					</div>
				</>
			)}
		</section>
	);
}
