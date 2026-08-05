import { useEffect, useState } from "react";
import { ApiError, apiFetch } from "../lib/api";
import { formatarDiaMes, formatarPrazoRelativo } from "../lib/formatters";
import { useSession } from "../lib/session";
import imagemCampanha from "../assets/mocks/campanha-essencia-labial.jpg";
import "./MarcaDashboard.css";

/**
 * Painel da Marca (ADR-022) — redesenho editorial (sessão de revisão de direção visual,
 * aprovação do responsável do projeto): a versão anterior usava o vocabulário do Dashboard
 * Administrativo (blocos `.dashboard-*`, números isolados) — correto para o Administrador
 * DODÔ, errado para a Marca. Esta tela pertence, visualmente, à mesma família de
 * `pages/experimentos/Publicacao.tsx`/`EnvioConteudo.tsx`/`PerfilInfluenciadora.tsx`: página
 * autônoma, fora do shell de sidebar, fotografia editorial como abertura, timeline
 * reaproveitada, narrativas em vez de cartões.
 *
 * Direção (aprovação do responsável do projeto):
 * 1. A foto não é "hero de dashboard" — é a própria campanha. Fica no topo, sem overlay de
 *    texto, com a legenda (campanha + assunto) logo abaixo, como matéria editorial.
 * 2. Coluna mais larga (900px) que as telas de uma entrega só (640px, Publicação/Envio):
 *    aqui o assunto é a campanha inteira, não um material.
 * 3. "Como está a campanha" não é um bloco separado — é a continuação direta da foto/legenda:
 *    frase de estado (calculada a partir de `excecoes`, nunca fabricada) + parágrafo narrativo.
 * 4. "Pede atenção" é uma lista de frases inteiras sobre pessoas reais (nome + o que está
 *    pendente), nunca cartão ou linha de tabela com número. Só aparece quando há exceção.
 * 5. Timeline única para "o que vem a seguir" (mesmo componente de Publicação/Aprovação,
 *    reaproveitado, não duplicado): não existe uma seção separada de "próximas publicações".
 * 6. Logística: `SPEC-016` (gestão logística de envio) não tem nenhum módulo implementado
 *    neste repositório hoje (nenhuma rota/tabela de kit/remessa existe) — texto fixture nesta
 *    seção, mesmo padrão de dado-sem-fonte-real já usado em `BriefingCampanha.tsx`/
 *    `EnvioConteudo.tsx` (ADR-003); substituir quando o módulo existir.
 * 7. Sem seção de "atividade recente": sem audit log persistente no backend (mesma decisão já
 *    registrada em `docs/superpowers/specs/2026-08-02-dashboard-editorial-design.md` para o
 *    Dashboard Administrativo) — decisão do responsável do projeto: não simular com proxy.
 *
 * Mesma fotografia editorial oficial da campanha reaproveitada em toda a família (regra do
 * projeto: uma única foto por campanha, nunca trocada entre telas).
 */

interface ProximoPrazo {
	tipo: "entrega" | "postagem";
	parceiraNome: string;
	formato: string;
	data: string;
	diasRestantes: number;
}

interface ExcecaoOperacional {
	tipo: "atrasado" | "em_revisao";
	parceiraNome: string;
	formato: string;
	data: string | null;
}

interface IndicadoresOperacionaisMarca {
	parceiras: { ativas: number; total: number };
	entregas: { aguardandoMaterial: number; emRevisao: number; atrasadas: number };
	proximosPrazos: ProximoPrazo[];
	excecoes: ExcecaoOperacional[];
}

/**
 * Lacuna declarada (ADR-003): sem módulo de logística implementado no backend (SPEC-016 é só
 * especificação). Texto fixture, mesmo padrão de `BriefingCampanha.tsx`/`EnvioConteudo.tsx`.
 */
const logisticaFixture = [
	"2 kits já chegaram até as parceiras.",
	"1 remessa ainda está a caminho.",
	"nenhum atraso registrado no envio dos produtos.",
];

const contexto = {
	campanha: "campanha de agosto",
	assunto: "essência labial",
};

function fraseDeEstado(excecoes: ExcecaoOperacional[]): string {
	if (excecoes.length === 0) {
		return "a campanha segue dentro do esperado.";
	}
	return excecoes.length === 1
		? "1 item pede atenção nesta campanha."
		: `${excecoes.length} itens pedem atenção nesta campanha.`;
}

function narrativaDeEstado(indicadores: IndicadoresOperacionaisMarca): string {
	if (indicadores.parceiras.total === 0) {
		return "nada em andamento ainda.";
	}

	const entregasNoPrazo = indicadores.entregas.aguardandoMaterial - indicadores.entregas.atrasadas;
	const partes: string[] = [
		indicadores.parceiras.ativas === 1
			? "1 parceira segue ativa nesta campanha"
			: `${indicadores.parceiras.ativas} parceiras seguem ativas nesta campanha`,
	];

	if (entregasNoPrazo > 0) {
		partes.push(
			entregasNoPrazo === 1
				? "1 material segue dentro do prazo"
				: `${entregasNoPrazo} materiais seguem dentro do prazo`,
		);
	}

	return `${partes.join("; ")}.`;
}

function fraseDeAtencao(excecao: ExcecaoOperacional): string {
	if (excecao.tipo === "atrasado" && excecao.data) {
		return `${excecao.parceiraNome} ainda não enviou o material previsto para ${formatarDiaMes(excecao.data)}.`;
	}
	return `${excecao.parceiraNome} tem um conteúdo aguardando aprovação.`;
}

export function MarcaDashboardPage() {
	const { sessao, logout } = useSession();
	const [indicadores, setIndicadores] = useState<IndicadoresOperacionaisMarca | null>(null);
	const [erro, setErro] = useState<string | null>(null);
	const [carregando, setCarregando] = useState(true);

	useEffect(() => {
		let ativo = true;
		setCarregando(true);
		setErro(null);

		apiFetch<IndicadoresOperacionaisMarca>("/api/marca/dashboard")
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

	// ADR-023: nível 5 (Administrador DODÔ) também satisfaz o gate de nível 2 — a Mesa da
	// Campanha linka para esta tela, e o Administrador precisa poder ver o que a Marca vê.
	if (sessao?.papelAtor !== "ADMINISTRADOR_MARCA" && sessao?.papelAtor !== "ADMINISTRADOR") {
		return (
			<div className="marca-tela">
				<p style={{ padding: 32 }}>área restrita ao administrador da marca.</p>
			</div>
		);
	}

	return (
		<div className="marca-tela">
			<header className="marca-nav">
				<span className="marca-nav-marca">criativo dodô</span>
				<button type="button" className="marca-nav-sair" onClick={() => void logout()}>
					sair
				</button>
			</header>

			{carregando && <p style={{ padding: 32 }}>carregando</p>}
			{!carregando && erro && (
				<p style={{ padding: 32 }} className="marca-vazio">
					{erro}
				</p>
			)}

			{!carregando && !erro && indicadores && (
				<>
					<figure className="marca-foto">
						<img src={imagemCampanha} alt="" aria-hidden="true" style={{ objectPosition: "center 45%" }} />
					</figure>

					<div className="marca-contexto">
						<p className="marca-eyebrow">{contexto.campanha}</p>
						<p className="marca-assunto">{contexto.assunto}</p>
						<h1 className="marca-frase">{fraseDeEstado(indicadores.excecoes)}</h1>
						<p className="marca-narrativa">{narrativaDeEstado(indicadores)}</p>
					</div>

					<div className="marca-corpo">
						{indicadores.excecoes.length > 0 && (
							<section className="marca-secao" aria-labelledby="secao-atencao">
								<p id="secao-atencao" className="marca-secao-titulo">
									pede atenção
								</p>
								<ul className="marca-atencao-lista">
									{indicadores.excecoes.map((excecao, indice) => (
										<li key={`${excecao.tipo}-${indice}`} className="marca-atencao-item">
											<span className="marca-atencao-marcador" aria-hidden="true" />
											<span className="marca-atencao-texto">{fraseDeAtencao(excecao)}</span>
										</li>
									))}
								</ul>
							</section>
						)}

						<section className="marca-secao" aria-labelledby="secao-timeline">
							<p id="secao-timeline" className="marca-secao-titulo">
								o que vem a seguir
							</p>
							{indicadores.proximosPrazos.length === 0 ? (
								<p className="marca-vazio">nada previsto para os próximos dias.</p>
							) : (
								<ol className="marca-timeline">
									{indicadores.proximosPrazos.map((prazo, indice) => (
										<li
											key={`${prazo.tipo}-${prazo.data}-${indice}`}
											className={`marca-timeline-passo${indice === 0 ? " is-atual" : ""}`}
										>
											<span className="marca-timeline-marcador" aria-hidden="true" />
											<div className="marca-timeline-conteudo">
												<span className="marca-timeline-titulo">
													{prazo.tipo === "entrega" ? "entrega" : "postagem"} de {prazo.parceiraNome}
												</span>
												<span className="marca-timeline-detalhe">
													{formatarPrazoRelativo(prazo.diasRestantes)}
												</span>
											</div>
										</li>
									))}
								</ol>
							)}
						</section>

						<section className="marca-secao" aria-labelledby="secao-logistica">
							<p id="secao-logistica" className="marca-secao-titulo">
								logística
							</p>
							<ul className="marca-logistica-lista">
								{logisticaFixture.map((linha) => (
									<li key={linha} className="marca-logistica-linha">
										{linha}
									</li>
								))}
							</ul>
						</section>
					</div>

					<section className="marca-rodape" aria-label="fechamento">
						<p className="marca-rodape-nota">
							esse é o retrato da campanha até agora — atualizamos assim que algo mudar.
						</p>
					</section>
				</>
			)}
		</div>
	);
}
