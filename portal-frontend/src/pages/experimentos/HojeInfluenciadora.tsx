import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError, apiFetch } from "../../lib/api";
import { useSession } from "../../lib/session";
import { Item, ItemContent, ItemGroup, ItemTitle } from "../../components/ui/item";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "../../components/ui/empty";
import { formatarCompetencia, formatarMoedaPartes } from "../../lib/formatters";
import { rotuloFormatoEntrega, type EstadoEntrega, type FormatoEntrega } from "../../lib/statusLabels";
import imagemCampanha from "../../assets/mocks/campanha-essencia-labial.jpg";
import "./HojeInfluenciadora.css";

/**
 * Dashboard da Influenciadora — mesa de trabalho, não porta de entrada. Composição própria
 * (masthead editorial + faixa de trabalho + histórico), deliberadamente distinta do grid de
 * `/admin/hoje` e da Login: aqui a campanha é protagonista visual imediata, não um dos dois
 * lados de um grid simétrico.
 *
 * Wiring real (DOC SPRINT #2, sessão de implementação): substitui o fixture original por
 * `GET /api/portal/pendencias`, `GET /api/portal/entregas/:id/briefing` (só da próxima
 * entrega, para saber se o briefing já está disponível — sem N+1) e
 * `GET /api/portal/financeiro/:mesReferencia/resumo`. Manchete/eyebrow deixam de citar um
 * produto fictício ("batom matte") e passam a refletir só o que é real (formato + estado +
 * prazo), mesmo princípio de `artefatoPrincipal.ts` ("a frase reflete exatamente o que é
 * real", nunca fabricar urgência/fato). `diasRestantes` é calculado no cliente a partir de
 * `dataEntrega` — mesmo padrão já em produção em `Pendencias.tsx` (`entregaAtrasada`), não é
 * endpoint novo nem regra de negócio nova.
 *
 * Lacuna declarada (ADR-003, não presumida): "histórico recente" não tem endpoint equivalente
 * — nenhum módulo agrega eventos heterogêneos (publicações + pagamentos + briefings) numa
 * lista única para a Parceira. Mantido como estado vazio explícito, nunca dado inventado.
 *
 * Imagem da capa: placeholder editorial de campanha (DESIGN_LANGUAGE.md §8), não foto do
 * material real da parceira — ver `assets/mocks/README.md` para fonte/licença/troca futura.
 */

interface ItemDePendencia {
	id: string;
	mesReferencia: string;
	formato: FormatoEntrega;
	estado: EstadoEntrega;
	dataEntrega: string;
}

interface RespostaPendencias {
	mesReferencia: string;
	itens: ItemDePendencia[];
}

interface RespostaBriefing {
	entrega: ItemDePendencia;
	briefing: { orientacao: string } | null;
}

interface ResumoFinanceiro {
	mesReferencia: string;
	previsto: number;
	pago: number;
}

function diasRestantes(dataEntrega: string): number {
	const alvo = new Date(`${dataEntrega}T23:59:59`).getTime();
	const dias = Math.ceil((alvo - Date.now()) / (1000 * 60 * 60 * 24));
	return Math.max(dias, 0);
}

function formatarPrazo(dias: number): string {
	if (dias <= 0) return "vence hoje";
	if (dias === 1) return "vence amanhã";
	return `vence em ${dias} dias`;
}

/** Mesmo princípio de `artefatoPrincipal.ts`: reflete exatamente o que é real, sem inventar produto ou promessa. */
function manchetePara(item: ItemDePendencia): string {
	const formato = rotuloFormatoEntrega(item.formato);
	if (item.estado === "EM_REVISAO") return `seu ${formato} está em revisão.`;
	if (item.estado === "APROVADO") return `seu ${formato} foi aprovado — falta publicar.`;
	if (item.estado === "PUBLICADO") return `seu ${formato} já foi publicado.`;
	return `seu ${formato} está aguardando envio.`;
}

export function HojeInfluenciadoraPage() {
	const { sessao } = useSession();
	const [pendencias, setPendencias] = useState<RespostaPendencias | null>(null);
	const [briefingDisponivel, setBriefingDisponivel] = useState<boolean | null>(null);
	const [resumoFinanceiro, setResumoFinanceiro] = useState<ResumoFinanceiro | null>(null);
	const [erro, setErro] = useState<string | null>(null);
	const [carregando, setCarregando] = useState(true);

	useEffect(() => {
		if (sessao?.papelAtor !== "INFLUENCIADORA") return;
		let ativo = true;

		async function carregar() {
			try {
				const respostaPendencias = await apiFetch<RespostaPendencias>("/api/portal/pendencias");
				if (!ativo) return;
				setPendencias(respostaPendencias);

				const proximaEntrega = respostaPendencias.itens[0];
				const [respostaBriefing, respostaFinanceiro] = await Promise.all([
					proximaEntrega
						? apiFetch<RespostaBriefing>(`/api/portal/entregas/${proximaEntrega.id}/briefing`)
						: Promise.resolve(null),
					apiFetch<ResumoFinanceiro>(
						`/api/portal/financeiro/${respostaPendencias.mesReferencia}/resumo`,
					).catch((erroCapturado) => {
						if (erroCapturado instanceof ApiError && erroCapturado.status === 404) return null;
						throw erroCapturado;
					}),
				]);
				if (!ativo) return;
				setBriefingDisponivel(respostaBriefing ? respostaBriefing.briefing !== null : null);
				setResumoFinanceiro(respostaFinanceiro);
			} catch (erroCapturado) {
				if (!ativo) return;
				setErro(
					erroCapturado instanceof ApiError ? erroCapturado.message : "não foi possível carregar.",
				);
			} finally {
				if (ativo) setCarregando(false);
			}
		}

		carregar();
		return () => {
			ativo = false;
		};
	}, [sessao?.papelAtor]);

	if (sessao?.papelAtor !== "INFLUENCIADORA") {
		return (
			<section className="mesa-tela">
				<p className="mesa-strip-valor" style={{ padding: 32 }}>
					área restrita a parceiras.
				</p>
			</section>
		);
	}

	if (carregando) {
		return (
			<section className="mesa-tela">
				<p className="mesa-strip-valor" style={{ padding: 32 }}>
					carregando
				</p>
			</section>
		);
	}

	if (erro || !pendencias) {
		return (
			<section className="mesa-tela">
				<p className="mesa-strip-valor" style={{ padding: 32 }}>
					{erro ?? "não foi possível carregar."}
				</p>
			</section>
		);
	}

	const proximaEntrega = pendencias.itens[0] ?? null;
	const pendente = resumoFinanceiro ? resumoFinanceiro.previsto - resumoFinanceiro.pago : null;
	const { reais, centavos } = formatarMoedaPartes(pendente ?? 0);

	return (
		<div className="mesa-tela">
			<header className="mesa-nav">
				<span className="mesa-nav-marca">criativo dodô</span>
				<Link to="/pendencias" className="mesa-nav-link">
					ver todas as entregas
				</Link>
			</header>

			<div className="mesa-contexto">
				<p className="mesa-eyebrow">
					colaboração de {formatarCompetencia(pendencias.mesReferencia)}
				</p>
			</div>

			<section className="mesa-capa" aria-labelledby="mesa-manchete">
				<img className="mesa-capa-imagem" src={imagemCampanha} alt="" aria-hidden="true" />
				<div className="mesa-capa-grade" aria-hidden="true" />
				<div className="mesa-capa-legenda">
					<h1 id="mesa-manchete" className="mesa-manchete">
						{proximaEntrega ? manchetePara(proximaEntrega) : "nada pendente este mês."}
					</h1>
					<Link to="/pendencias" className="btn-primary is-medium mesa-cta">
						enviar material
					</Link>
				</div>
			</section>

			<section className="mesa-strip" aria-label="resumo do que precisa da sua atenção">
				<div className="mesa-strip-item is-urgente">
					<p className="mesa-strip-label">entrega</p>
					<p className="mesa-strip-valor">
						{proximaEntrega
							? `${rotuloFormatoEntrega(proximaEntrega.formato)} · ${formatarPrazo(diasRestantes(proximaEntrega.dataEntrega))}`
							: "nenhuma entrega pendente"}
					</p>
				</div>
				<div className="mesa-strip-item">
					<p className="mesa-strip-label">pagamento</p>
					<p className="mesa-strip-valor">
						{pendente !== null ? (
							<>
								{reais}
								<span className="mesa-strip-valor-centavos">{centavos}</span> pendente
							</>
						) : (
							"sem dados para o período"
						)}
					</p>
				</div>
				<div className="mesa-strip-item">
					<p className="mesa-strip-label">briefing</p>
					<p className="mesa-strip-valor">
						{briefingDisponivel === null
							? "sem entrega vinculada"
							: briefingDisponivel
								? "disponível para leitura"
								: "ainda não publicado"}
					</p>
				</div>
			</section>

			<section className="mesa-capitulo">
				<p className="mesa-capitulo-titulo">histórico recente</p>
				{pendencias.itens.length > 1 ? (
					<ItemGroup>
						{pendencias.itens.slice(1).map((item) => (
							<Item key={item.id} className="passo-item">
								<ItemContent>
									<ItemTitle>{rotuloFormatoEntrega(item.formato)}</ItemTitle>
								</ItemContent>
								<span className="mesa-strip-label">
									{formatarPrazo(diasRestantes(item.dataEntrega))}
								</span>
							</Item>
						))}
					</ItemGroup>
				) : (
					<Empty className="border-none p-0 text-left items-start">
						<EmptyHeader className="items-start text-left max-w-none">
							<EmptyTitle className="mesa-strip-label">nada mais por aqui.</EmptyTitle>
							<EmptyDescription className="mesa-strip-label">
								histórico consolidado (publicações e pagamentos passados) ainda não tem
								endpoint — lacuna declarada, ver relatório da sessão.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				)}
			</section>
		</div>
	);
}
