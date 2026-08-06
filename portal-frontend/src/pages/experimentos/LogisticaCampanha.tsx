import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSession } from "../../lib/session";
import { ROTULO_STATUS, calcularAlerta, envios, rastreioResumido } from "./logisticaFixture";
import "./LogisticaCampanha.css";

/**
 * Logística (DOC SPRINT #2, item 6) — décima primeira tela da família. Redesenho de 2026-08-06
 * (decisão do responsável do projeto): deixa de ser editorial/narrativa e passa a ser
 * operacional — preserva só a identidade visual do Portal (tipografia, cor, espaçamento, nav),
 * não a linguagem de "página de campanha" do resto da família A.
 *
 * Direção (aprovada em sessão de brainstorming, 2026-08-06):
 * 1. Sem fotografia hero — a informação operacional ocupa a primeira dobra. Cabeçalho é um bloco
 *    de estatísticas tipográficas (reaproveita o padrão de indicador do Relatório: rótulo +
 *    valor, sem card), não uma frase editorial grande.
 * 2. Lista compacta (não tabela) — cada linha mostra só parceira, status, motivo do alerta (se
 *    houver) e rastreio resumido. Nenhuma ação fica na lista: clicar na linha inteira navega
 *    para o detalhe (`/admin/logistica/:id`, mesmo padrão de rota de `/admin/parceiras/:id`).
 *    Timeline completa, rastreamento, observações, comprovante e ações vivem só no detalhe.
 * 3. Filtro por estado reaproveita o alternador de texto sublinhado de `CalendarioEditorial.tsx`
 *    (`.calendario-controle` → aqui `.logistica-filtro`), nenhum componente de aba/pílula novo.
 * 4. Critério de alerta e prioridade de motivo: ver `calcularAlerta` em `logisticaFixture.ts`
 *    (decisão do responsável do projeto — exceção > atraso > pendência > estagnação).
 * 5. Gate exclusivo Administrador (mesmo padrão de `AdminCampanhaPage`/`AdminComunicacaoPage`):
 *    o doc de origem (§6) restringe rastreio/observações internas à visão DODÔ.
 * 6. Lacuna declarada (ADR-003/ADR-023, SPEC-016): sem módulo real de rastreamento — fixture em
 *    `logisticaFixture.ts`, só leitura.
 */

type Filtro = "todos" | "atencao" | "concluidos";

const ROTULO_FILTRO: Record<Filtro, string> = {
	todos: "todos",
	atencao: "precisam de atenção",
	concluidos: "concluídos",
};

export function LogisticaCampanhaPage() {
	const { sessao, logout } = useSession();
	const [filtro, setFiltro] = useState<Filtro>("todos");

	const linhas = useMemo(
		() =>
			envios.map((envio) => ({
				envio,
				alerta: calcularAlerta(envio),
			})),
		[],
	);

	const contagem = useMemo(() => {
		const precisamAtencao = linhas.filter((linha) => linha.alerta !== null).length;
		const concluidos = linhas.filter((linha) => linha.envio.etapaAtual === "confirmado").length;
		return { total: linhas.length, precisamAtencao, concluidos };
	}, [linhas]);

	const linhasFiltradas = useMemo(() => {
		if (filtro === "atencao") {
			return linhas.filter((linha) => linha.alerta !== null);
		}
		if (filtro === "concluidos") {
			return linhas.filter((linha) => linha.envio.etapaAtual === "confirmado");
		}
		return linhas;
	}, [linhas, filtro]);

	if (sessao?.papelAtor !== "ADMINISTRADOR") {
		return (
			<div className="logistica-tela">
				<p style={{ padding: 32 }}>área restrita à equipe dodô.</p>
			</div>
		);
	}

	return (
		<div className="logistica-tela">
			<header className="logistica-nav">
				<span className="logistica-nav-marca">criativo dodô</span>
				<button type="button" className="logistica-nav-sair" onClick={() => void logout()}>
					sair
				</button>
			</header>

			<div className="logistica-cabecalho">
				<p className="logistica-eyebrow">logística</p>
				<div className="logistica-stats">
					<div className="logistica-stat">
						<p className="logistica-stat-valor">{contagem.total}</p>
						<p className="logistica-stat-rotulo">envios</p>
					</div>
					<div className={`logistica-stat${contagem.precisamAtencao > 0 ? " is-alerta" : ""}`}>
						<p className="logistica-stat-valor">{contagem.precisamAtencao}</p>
						<p className="logistica-stat-rotulo">precisam de atenção</p>
					</div>
					<div className="logistica-stat">
						<p className="logistica-stat-valor">{contagem.concluidos}</p>
						<p className="logistica-stat-rotulo">concluídos</p>
					</div>
				</div>

				<div className="logistica-filtros" role="group" aria-label="filtrar envios">
					{(Object.keys(ROTULO_FILTRO) as Filtro[]).map((valor) => (
						<button
							key={valor}
							type="button"
							className={`logistica-filtro${filtro === valor ? " is-ativo" : ""}`}
							aria-pressed={filtro === valor}
							onClick={() => setFiltro(valor)}
						>
							{ROTULO_FILTRO[valor]}
						</button>
					))}
				</div>
			</div>

			<div className="logistica-corpo">
				{linhasFiltradas.length === 0 ? (
					<p className="logistica-vazio">nenhum envio neste filtro.</p>
				) : (
					<ul className="logistica-lista">
						{linhasFiltradas.map(({ envio, alerta }) => (
							<li key={envio.id}>
								<Link to={`/admin/logistica/${envio.id}`} className="logistica-linha">
									<div className="logistica-linha-topo">
										<span className="logistica-linha-parceira">{envio.parceiraNome}</span>
										<span className="logistica-linha-status">{ROTULO_STATUS[envio.etapaAtual]}</span>
									</div>
									{alerta && <p className="logistica-linha-alerta">{alerta.motivo}</p>}
									{rastreioResumido(envio) && <p className="logistica-linha-rastreio">{rastreioResumido(envio)}</p>}
								</Link>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}
