import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError, apiFetch } from "../../lib/api";
import { formatarPrazoRelativo } from "../../lib/formatters";
import { useSession } from "../../lib/session";
import { Button } from "../../components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "../../components/ui/empty";
import { Item, ItemContent, ItemGroup, ItemTitle } from "../../components/ui/item";
import {
	formatarEyebrow,
	formatarManchete,
	selecionarArtefatoPrincipal,
	type ProximoPrazo,
} from "./artefatoPrincipal";
import "./Hoje.css";

/**
 * Recorte mínimo de `IndicadoresAdministrativos` (ver `AdminDashboard.tsx`) que esta tela usa —
 * mesmo endpoint (`GET /api/admin/dashboard`), nenhum campo novo pedido ao backend.
 */
interface IndicadoresParaHoje {
	entregas: { emRevisao: number; atrasadas: number };
	financeiro: { pendentes: number };
	moderacao: { contasPendentes: number };
	proximosPrazos: ProximoPrazo[];
}

function fraseDoRestante(indicadores: IndicadoresParaHoje): string {
	const partes: string[] = [];
	if (indicadores.entregas.emRevisao > 0) {
		partes.push(
			indicadores.entregas.emRevisao === 1
				? "1 entrega em revisão"
				: `${indicadores.entregas.emRevisao} entregas em revisão`,
		);
	}
	if (indicadores.entregas.atrasadas > 0) {
		partes.push(
			indicadores.entregas.atrasadas === 1
				? "1 material atrasado"
				: `${indicadores.entregas.atrasadas} materiais atrasados`,
		);
	}
	if (indicadores.financeiro.pendentes > 0) {
		partes.push(
			indicadores.financeiro.pendentes === 1
				? "1 pagamento pendente"
				: `${indicadores.financeiro.pendentes} pagamentos pendentes`,
		);
	}
	if (indicadores.moderacao.contasPendentes > 0) {
		partes.push(
			indicadores.moderacao.contasPendentes === 1
				? "1 cadastro para moderar"
				: `${indicadores.moderacao.contasPendentes} cadastros para moderar`,
		);
	}
	if (partes.length === 0) return "nada mais pedindo atenção agora.";
	return `e também: ${partes.join("; ")}.`;
}

export function ExperimentoHojePage() {
	const { sessao } = useSession();
	const [indicadores, setIndicadores] = useState<IndicadoresParaHoje | null>(null);
	const [erro, setErro] = useState<string | null>(null);
	const [carregando, setCarregando] = useState(true);
	const capituloRef = useRef<HTMLDivElement>(null);
	const [capituloVisivel, setCapituloVisivel] = useState(false);

	useEffect(() => {
		let ativo = true;
		apiFetch<IndicadoresParaHoje>("/api/admin/dashboard")
			.then((dados) => ativo && setIndicadores(dados))
			.catch((erroCapturado) => {
				if (!ativo) return;
				setErro(
					erroCapturado instanceof ApiError
						? erroCapturado.message
						: "não foi possível carregar.",
				);
			})
			.finally(() => ativo && setCarregando(false));
		return () => {
			ativo = false;
		};
	}, []);

	useEffect(() => {
		const alvo = capituloRef.current;
		if (!alvo) return;
		const observador = new IntersectionObserver(
			([entrada]) => setCapituloVisivel(entrada.isIntersecting),
			{ threshold: 0.15 },
		);
		observador.observe(alvo);
		return () => observador.disconnect();
	}, [carregando]);

	if (sessao?.papelAtor !== "ADMINISTRADOR") {
		return (
			<section className="hoje-tela">
				<p className="hoje-zona-quieta-texto" style={{ padding: 32 }}>
					área restrita a administradores.
				</p>
			</section>
		);
	}

	const artefato = indicadores ? selecionarArtefatoPrincipal(indicadores.proximosPrazos) : null;

	return (
		<div className="hoje-tela">
			<header className="hoje-nav">
				<span className="hoje-nav-marca">criativo dodô</span>
				<Link to="/admin/dashboard" className="hoje-nav-link">
					painel completo
				</Link>
			</header>

			{carregando && (
				<p className="hoje-zona-quieta-texto" style={{ padding: 32 }}>
					carregando
				</p>
			)}
			{!carregando && erro && (
				<p className="hoje-zona-quieta-texto" style={{ padding: 32 }}>
					{erro}
				</p>
			)}

			{!carregando && !erro && indicadores && (
				<>
					<section className="hoje-abertura">
						<div className="hoje-imagem-wrap">
							<div className="hoje-imagem-placeholder">
								<p className="hoje-imagem-placeholder-legenda">
									material real da entrega: placeholder até existir endpoint de
									exposição do arquivo enviado (ver relatório, lacuna declarada).
								</p>
							</div>
						</div>

						<div className="hoje-texto">
							{artefato ? (
								<>
									<p className="hoje-eyebrow">{formatarEyebrow(artefato)}</p>
									<h1 className="hoje-manchete">{formatarManchete(artefato)}</h1>
									<p className="hoje-zona-quieta-texto">
										{formatarPrazoRelativo(artefato.diasRestantes)}
									</p>
									<div className="hoje-acao">
										<Button
											render={<Link to="/admin/entregas">ver e decidir</Link>}
											nativeButton={false}
											size="lg"
										/>
									</div>
								</>
							) : (
								<Empty className="border-none p-0 text-left items-start">
									<EmptyHeader className="items-start text-left max-w-none">
										<EmptyTitle className="hoje-manchete !text-3xl">
											nada previsto para os próximos dias.
										</EmptyTitle>
										<EmptyDescription className="hoje-zona-quieta-texto">
											{fraseDoRestante(indicadores)}
										</EmptyDescription>
									</EmptyHeader>
									<EmptyContent className="items-start max-w-none">
										<Button
											render={<Link to="/admin/entregas">ver tudo</Link>}
											nativeButton={false}
											variant="outline"
										/>
									</EmptyContent>
								</Empty>
							)}
						</div>
					</section>

					<section className="hoje-zona-quieta">
						<p className="hoje-zona-quieta-texto">{fraseDoRestante(indicadores)}</p>
					</section>

					<section
						ref={capituloRef}
						className="hoje-capitulo"
						style={{
							opacity: capituloVisivel ? 1 : 0.6,
							transition: "opacity 0.6s var(--ease-editorial, ease)",
						}}
					>
						<p className="hoje-capitulo-titulo">próximos prazos</p>
						<ItemGroup>
							{indicadores.proximosPrazos.map((prazo, indice) => (
								<Item key={`${prazo.tipo}-${prazo.data}-${indice}`}>
									<ItemContent>
										<ItemTitle>
											{prazo.tipo === "entrega" ? "entrega" : "postagem"} de{" "}
											{prazo.parceiraNome}
										</ItemTitle>
									</ItemContent>
									<span className="hoje-zona-quieta-texto">
										{formatarPrazoRelativo(prazo.diasRestantes)}
									</span>
								</Item>
							))}
						</ItemGroup>
					</section>
				</>
			)}
		</div>
	);
}
