import { Link } from "react-router-dom";
import { useSession } from "../../lib/session";
import { Item, ItemContent, ItemGroup, ItemTitle } from "../../components/ui/item";
import { formatarMoedaPartes } from "../../lib/formatters";
import imagemCampanha from "../../assets/mocks/campanha-essencia-labial.jpg";
import "./HojeInfluenciadora.css";

/**
 * Dashboard da Influenciadora — mesa de trabalho, não porta de entrada. Composição própria
 * (masthead editorial + faixa de trabalho + histórico), deliberadamente distinta do grid de
 * `/admin/hoje` e da Login: aqui a campanha é protagonista visual imediata, não um dos dois
 * lados de um grid simétrico. Dados fixture estática para aprovação visual (sessão desta
 * tarefa) — nenhum endpoint hoje agrega "campanha + pagamento + briefing" numa única
 * resposta para a parceira (lacuna declarada, ADR-003). Wiring real fica para depois da
 * aprovação.
 *
 * Imagem da capa: placeholder editorial de campanha (DESIGN_LANGUAGE.md §8), não foto do
 * material real da parceira — ver `assets/mocks/README.md` para fonte/licença/troca futura.
 */
const dadosFicticios = {
	campanha: "colaboração de agosto · essência labial",
	manchete: "seu reel do batom matte vai ao ar quinta.",
	entregaResumo: "reel · vence em 3 dias",
	pagamentoPendente: 2480,
	proximoBriefing: "setembro · disponível para leitura",
	historico: [
		{ titulo: "carrossel de julho", detalhe: "publicado" },
		{ titulo: "pagamento de julho", detalhe: "pago em 05 de julho" },
		{ titulo: "reel do batom matte", detalhe: "aguardando seu envio" },
		{ titulo: "briefing de setembro", detalhe: "leia antes do dia 20" },
	],
};

export function HojeInfluenciadoraPage() {
	const { sessao } = useSession();

	if (sessao?.papelAtor !== "INFLUENCIADORA") {
		return (
			<section className="mesa-tela">
				<p className="mesa-strip-valor" style={{ padding: 32 }}>
					área restrita a parceiras.
				</p>
			</section>
		);
	}

	const { reais, centavos } = formatarMoedaPartes(dadosFicticios.pagamentoPendente);

	return (
		<div className="mesa-tela">
			<header className="mesa-nav">
				<span className="mesa-nav-marca">criativo dodô</span>
				<Link to="/pendencias" className="mesa-nav-link">
					ver todas as entregas
				</Link>
			</header>

			<div className="mesa-contexto">
				<p className="mesa-eyebrow">{dadosFicticios.campanha}</p>
			</div>

			<section className="mesa-capa" aria-labelledby="mesa-manchete">
				<img
					className="mesa-capa-imagem"
					src={imagemCampanha}
					alt=""
					aria-hidden="true"
				/>
				<div className="mesa-capa-grade" aria-hidden="true" />
				<div className="mesa-capa-legenda">
					<h1 id="mesa-manchete" className="mesa-manchete">
						{dadosFicticios.manchete}
					</h1>
					<Link to="/pendencias" className="btn-primary is-medium mesa-cta">
						enviar material
					</Link>
				</div>
			</section>

			<section className="mesa-strip" aria-label="resumo do que precisa da sua atenção">
				<div className="mesa-strip-item is-urgente">
					<p className="mesa-strip-label">entrega</p>
					<p className="mesa-strip-valor">{dadosFicticios.entregaResumo}</p>
				</div>
				<div className="mesa-strip-item">
					<p className="mesa-strip-label">pagamento</p>
					<p className="mesa-strip-valor">
						{reais}
						<span className="mesa-strip-valor-centavos">{centavos}</span>{" "}
						pendente
					</p>
				</div>
				<div className="mesa-strip-item">
					<p className="mesa-strip-label">próximo briefing</p>
					<p className="mesa-strip-valor">{dadosFicticios.proximoBriefing}</p>
				</div>
			</section>

			<section className="mesa-capitulo">
				<p className="mesa-capitulo-titulo">histórico recente</p>
				<ItemGroup>
					{dadosFicticios.historico.map((item) => (
						<Item key={item.titulo} className="passo-item">
							<ItemContent>
								<ItemTitle>{item.titulo}</ItemTitle>
							</ItemContent>
							<span className="mesa-strip-label">{item.detalhe}</span>
						</Item>
					))}
				</ItemGroup>
			</section>
		</div>
	);
}
