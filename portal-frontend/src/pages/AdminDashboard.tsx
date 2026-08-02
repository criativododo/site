import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
	Card,
	CardAction,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { apiFetch, ApiError } from "../lib/api";
import { formatadorMoeda } from "../lib/formatters";
import { useSession } from "../lib/session";
import { cn } from "../lib/utils";

interface IndicadoresAdministrativos {
	parceiras: { ativas: number; inativas: number; total: number };
	entregas: { aguardandoMaterial: number; emRevisao: number; atrasadas: number };
	financeiro: { pendentes: number; valorPendente: number };
	lgpd: { solicitacoesExclusaoPendentes: number };
	moderacao: { contasPendentes: number };
}

function Indicador({
	label,
	valor,
	destaque,
	href,
}: {
	label: string;
	valor: string | number;
	destaque?: boolean;
	href?: string;
}) {
	const card = (
		<Card
			size="sm"
			className={cn(
				"transition-all",
				href && "cursor-pointer group-hover:-translate-y-0.5 group-hover:shadow-md",
				destaque && "bg-primary/[0.04] ring-primary/25",
			)}
		>
			<CardHeader>
				<CardDescription className="text-[13px]">{label}</CardDescription>
				<CardTitle
					className={cn(
						"text-[22px] font-bold",
						destaque ? "text-primary" : "text-card-foreground",
					)}
				>
					{valor}
				</CardTitle>
				{href && (
					<CardAction>
						<ArrowRight
							aria-hidden="true"
							className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
						/>
					</CardAction>
				)}
			</CardHeader>
		</Card>
	);

	if (href) {
		return (
			<Link
				to={href}
				className="group block no-underline"
				aria-label={`${label}: ${valor}. ver lista.`}
			>
				{card}
			</Link>
		);
	}

	return card;
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

	const requerAcao = indicadores
		? indicadores.entregas.atrasadas +
			indicadores.entregas.emRevisao +
			indicadores.moderacao.contasPendentes +
			indicadores.lgpd.solicitacoesExclusaoPendentes
		: 0;

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
					<p className="pendencias-summary">
						{requerAcao === 0
							? "nada pendente de ação agora"
							: `requer sua ação (${requerAcao})`}
					</p>
					<div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8">
						<Indicador
							label="materiais atrasados"
							valor={indicadores.entregas.atrasadas}
							destaque={indicadores.entregas.atrasadas > 0}
							href="/admin/entregas"
						/>
						<Indicador
							label="aprovações aguardando"
							valor={indicadores.entregas.emRevisao}
							destaque={indicadores.entregas.emRevisao > 0}
							href="/admin/entregas"
						/>
						<Indicador
							label="cadastros para moderar"
							valor={indicadores.moderacao.contasPendentes}
							destaque={indicadores.moderacao.contasPendentes > 0}
							href="/admin"
						/>
						<Indicador
							label="solicitações lgpd"
							valor={indicadores.lgpd.solicitacoesExclusaoPendentes}
							destaque={indicadores.lgpd.solicitacoesExclusaoPendentes > 0}
							href="/admin"
						/>
					</div>

					<div className="portal-section-divider">
						<p className="pendencias-summary is-quiet">indicadores gerais</p>
						<div className="grid grid-cols-2 gap-4 md:grid-cols-5">
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
