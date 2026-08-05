import { Link } from "react-router-dom";
import { useSession } from "../../lib/session";
import { formatarMoedaPartes } from "../../lib/formatters";
import imagemCampanha from "../../assets/mocks/campanha-essencia-labial.jpg";
import "./RelatorioCampanha.css";

/**
 * Relatório (DOC SPRINT #2, item 3) — nona tela da família, mesmo padrão aditivo das oito
 * anteriores. Rota própria (`/relatorio`, sem colisão com nenhuma rota legada).
 *
 * Direção (sessão de aprovação editorial):
 * 1. Não é dashboard nem BI: por instrução do próprio doc de origem ("mais próxima de uma
 *    apresentação executiva do que de um painel de BI"), os indicadores aparecem como blocos
 *    tipográficos (rótulo + número + explicação em uma frase), nunca como grade de cartões com
 *    borda/sombra — mesma disciplina que `FinanceiroInfluenciadora.tsx` já aplicou ao rejeitar
 *    o padrão de KPI do `Financeiro.tsx` legado.
 * 2. Receita é o único "número herói" (mesmo tratamento de `reconhecimento-valor-numero`); os
 *    demais indicadores são secundários, menores, em grade — a hierarquia segue a pergunta que
 *    o doc define como central: "o que aconteceu e o que isso significa", não uma lista plana.
 * 3. "Evolução" e "origem dos resultados" são prosa (frase completa por linha), não gráfico —
 *    nenhuma tela da família usa gráfico/sparkline hoje; introduzir um aqui seria linguagem
 *    visual nova sem aprovação (regra da sessão: nunca criar padrão visual novo).
 * 4. "Funil" reaproveita a espinha dorsal de timeline já usada em Reconhecimento/Publicação/
 *    Painel da Marca — cada etapa mostra a contagem em vez de uma data, mesmo componente.
 * 5. Explicações de métrica ficam inline, abaixo do número, sem tooltip/popover — o doc permite
 *    qualquer uma dessas formas; inline é a que já existe na linguagem da família (nenhuma tela
 *    hoje usa tooltip), evitando inventar interação nova.
 * 6. Sem geração/acesso por link público nesta proposta: todas as telas "propostas" desta
 *    família vivem atrás de `RotaProtegida` para permitir validação visual via `/auth/dev-login`
 *    (mesmo padrão das oito anteriores) — o modelo real de acesso da Marca (link exclusivo
 *    imutável, sem login) descrito no doc de origem é decisão de arquitetura/backend, fora do
 *    escopo desta sessão de layout.
 * 7. Sem seletor de campanha/competência: cada relatório é uma fotografia de um momento
 *    específico (decisão do doc de origem, "não existe edição posterior") — navegar entre
 *    relatórios publicados é função de uma tela futura, não desta.
 *
 * Lacuna declarada (ADR-003, mesmo padrão de `MarcaDashboard.tsx`/`BriefingCampanha.tsx`): não
 * existe hoje nenhum módulo de analytics/relatório no backend (nenhuma rota, nenhuma tabela) —
 * todo o conteúdo abaixo é fixture, só para validar a hierarquia visual proposta.
 */

interface Indicador {
	id: string;
	rotulo: string;
	valor: string;
	explicacao: string;
}

interface EtapaFunil {
	id: string;
	titulo: string;
	valor: string;
	destaque?: boolean;
}

interface OrigemResultado {
	canal: string;
	percentual: string;
}

const contexto = {
	campanha: "campanha de agosto",
	assunto: "essência labial",
	periodo: "1 a 31 de agosto",
	publicadoEm: "3 de setembro, 10h15",
};

const resumo = {
	frase: "essa campanha trouxe mais gente para a loja e mais gente comprando.",
	narrativa:
		"a receita cresceu em relação ao mês anterior e a taxa de conversão melhorou — sinal de que quem chegou pelo conteúdo das parceiras estava mais decidido a comprar. o maior espaço de melhoria segue sendo o checkout, onde parte das visitantes ainda desiste antes de concluir.",
};

const receitaTotal = 46800;

const indicadoresSecundarios: Indicador[] = [
	{
		id: "sessoes",
		rotulo: "sessões",
		valor: "8.400",
		explicacao: "quantas vezes o conteúdo levou alguém até a loja.",
	},
	{
		id: "usuarios",
		rotulo: "usuários",
		valor: "6.150",
		explicacao: "quantas pessoas diferentes visitaram, sem contar repetições.",
	},
	{
		id: "taxa-conversao",
		rotulo: "taxa de conversão",
		valor: "3,7%",
		explicacao: "percentual de visitantes que compraram durante o período.",
	},
	{
		id: "compras",
		rotulo: "compras",
		valor: "312",
		explicacao: "número de pedidos concluídos com origem nesta campanha.",
	},
];

const evolucao = [
	"receita cresceu 18% em relação a julho.",
	"sessões seguem estáveis, variação de 2%.",
	"taxa de conversão melhorou 0,4 ponto percentual.",
];

const funil: EtapaFunil[] = [
	{ id: "visualizacao", titulo: "visualização de produto", valor: "8.400" },
	{ id: "carrinho", titulo: "adicionar ao carrinho", valor: "1.120" },
	{ id: "checkout", titulo: "início do checkout", valor: "480" },
	{ id: "compra", titulo: "compra", valor: "312", destaque: true },
];

const origemResultados: OrigemResultado[] = [
	{ canal: "instagram", percentual: "42%" },
	{ canal: "direct", percentual: "23%" },
	{ canal: "google", percentual: "18%" },
	{ canal: "orgânico", percentual: "11%" },
	{ canal: "outros", percentual: "6%" },
];

export function RelatorioCampanhaPage() {
	const { sessao } = useSession();

	if (sessao?.papelAtor !== "ADMINISTRADOR_MARCA" && sessao?.papelAtor !== "ADMINISTRADOR") {
		return (
			<section className="relatorio-tela">
				<p style={{ padding: 32 }}>área restrita ao administrador da marca.</p>
			</section>
		);
	}

	const { reais, centavos } = formatarMoedaPartes(receitaTotal);

	return (
		<div className="relatorio-tela">
			<header className="relatorio-nav">
				<span className="relatorio-nav-marca">criativo dodô</span>
				<Link to="/marca/dashboard" className="relatorio-nav-link">
					voltar ao painel
				</Link>
			</header>

			<figure className="relatorio-foto">
				<img src={imagemCampanha} alt="" aria-hidden="true" style={{ objectPosition: "center 45%" }} />
			</figure>

			<div className="relatorio-contexto">
				<p className="relatorio-eyebrow">
					{contexto.campanha} · {contexto.assunto}
				</p>
				<p className="relatorio-periodo">
					relatório de {contexto.periodo} · publicado em {contexto.publicadoEm}
				</p>
				<h1 className="relatorio-frase">{resumo.frase}</h1>
				<p className="relatorio-narrativa">{resumo.narrativa}</p>
			</div>

			<div className="relatorio-corpo">
				<section className="relatorio-secao" aria-labelledby="secao-receita">
					<p id="secao-receita" className="relatorio-secao-titulo">
						principais indicadores
					</p>

					<div className="relatorio-receita">
						<p className="relatorio-receita-label">receita gerada pela campanha</p>
						<p className="relatorio-receita-numero">
							{reais}
							<span className="relatorio-receita-centavos">{centavos}</span>
						</p>
					</div>

					<div className="relatorio-indicadores-grade">
						{indicadoresSecundarios.map((indicador) => (
							<div key={indicador.id} className="relatorio-indicador">
								<p className="relatorio-indicador-rotulo">{indicador.rotulo}</p>
								<p className="relatorio-indicador-valor">{indicador.valor}</p>
								<p className="relatorio-indicador-explicacao">{indicador.explicacao}</p>
							</div>
						))}
					</div>
				</section>

				<section className="relatorio-secao" aria-labelledby="secao-evolucao">
					<p id="secao-evolucao" className="relatorio-secao-titulo">
						evolução da campanha
					</p>
					<ul className="relatorio-evolucao-lista">
						{evolucao.map((linha) => (
							<li key={linha} className="relatorio-evolucao-item">
								<span className="relatorio-evolucao-marcador" aria-hidden="true" />
								<span className="relatorio-evolucao-texto">{linha}</span>
							</li>
						))}
					</ul>
				</section>

				<section className="relatorio-secao" aria-labelledby="secao-funil">
					<p id="secao-funil" className="relatorio-secao-titulo">
						funil
					</p>
					<ol className="relatorio-timeline">
						{funil.map((etapa) => (
							<li
								key={etapa.id}
								className={`relatorio-timeline-passo${etapa.destaque ? " is-destaque" : ""}`}
							>
								<span className="relatorio-timeline-marcador" aria-hidden="true" />
								<div className="relatorio-timeline-conteudo">
									<span className="relatorio-timeline-titulo">{etapa.titulo}</span>
									<span className="relatorio-timeline-detalhe">{etapa.valor}</span>
								</div>
							</li>
						))}
					</ol>
				</section>

				<section className="relatorio-secao" aria-labelledby="secao-origem">
					<p id="secao-origem" className="relatorio-secao-titulo">
						origem dos resultados
					</p>
					<ul className="relatorio-origem-lista">
						{origemResultados.map((origem) => (
							<li key={origem.canal} className="relatorio-origem-item">
								<span className="relatorio-origem-canal">{origem.canal}</span>
								<span className="relatorio-origem-percentual">{origem.percentual}</span>
							</li>
						))}
					</ul>
				</section>
			</div>

			<section className="relatorio-rodape" aria-label="fechamento">
				<p className="relatorio-rodape-nota">
					este relatório retrata a campanha até {contexto.periodo.split(" a ")[1]}. um novo será
					publicado assim que houver o que contar.
				</p>
			</section>
		</div>
	);
}
