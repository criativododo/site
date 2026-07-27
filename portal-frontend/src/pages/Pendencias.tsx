import { useEffect, useState } from "react";
import { ApiError, apiFetch } from "../lib/api";

type Formato = "Reel" | "Carrossel" | "Stories1" | "Stories2";
type EstadoEntrega =
	| "AGUARDANDO_MATERIAL"
	| "EM_REVISAO"
	| "APROVADO"
	| "PUBLICADO";

interface ItemDePendencia {
	id: string;
	mesReferencia: string;
	formato: Formato;
	estado: EstadoEntrega;
	dataEntrega: string;
}

interface RespostaPendencias {
	mesReferencia: string;
	itens: ItemDePendencia[];
}

interface BlocoBriefing {
	look: string;
	dataEntrega: string;
	dataPostagem: string;
	orientacao: string;
}

interface RespostaBriefing {
	entrega: ItemDePendencia;
	briefing: BlocoBriefing | null;
}

const LABEL_FORMATO: Record<Formato, string> = {
	Reel: "reel",
	Carrossel: "carrossel",
	Stories1: "stories 1",
	Stories2: "stories 2",
};

const LABEL_ESTADO: Record<EstadoEntrega, string> = {
	AGUARDANDO_MATERIAL: "aguardando material",
	EM_REVISAO: "em revisão",
	APROVADO: "aprovado",
	PUBLICADO: "publicado",
};

function formatarData(dataEntrega: string): string {
	const [ano, mes, dia] = dataEntrega.split("-");
	return `${dia}/${mes}/${ano}`;
}

function formatarCompetencia(mesReferencia: string): string {
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
	return `${nomes[Number(mes) - 1]} de ${ano}`;
}

function entregaAtrasada(item: ItemDePendencia): boolean {
	return (
		item.estado === "AGUARDANDO_MATERIAL" &&
		new Date(`${item.dataEntrega}T23:59:59`).getTime() < Date.now()
	);
}

function prioridade(item: ItemDePendencia): number {
	if (entregaAtrasada(item)) return 0;
	if (item.estado === "AGUARDANDO_MATERIAL") return 1;
	if (item.estado === "EM_REVISAO") return 2;
	if (item.estado === "APROVADO") return 3;
	return 4;
}

function textoPrazo(item: ItemDePendencia): string {
	if (entregaAtrasada(item))
		return `atrasada desde ${formatarData(item.dataEntrega)}`;
	if (item.estado === "AGUARDANDO_MATERIAL")
		return `enviar até ${formatarData(item.dataEntrega)}`;
	return `prazo ${formatarData(item.dataEntrega)}`;
}

/** Só retorna texto para estados em que a parceira de fato precisa agir agora (RN de UI). */
function acaoDisponivel(item: ItemDePendencia): string | null {
	if (item.estado === "AGUARDANDO_MATERIAL") return "enviar material";
	return null;
}

function EnviarMaterial({
	entregaId,
	aoEnviarComSucesso,
}: {
	entregaId: string;
	aoEnviarComSucesso: (item: ItemDePendencia) => void;
}) {
	const [arquivo, setArquivo] = useState<File | null>(null);
	const [enviando, setEnviando] = useState(false);
	const [erro, setErro] = useState<string | null>(null);

	async function enviar() {
		if (!arquivo) return;
		setEnviando(true);
		setErro(null);

		try {
			const formData = new FormData();
			formData.append("arquivo", arquivo);
			const resposta = await apiFetch<{ entrega: ItemDePendencia }>(
				`/api/portal/entregas/${entregaId}/material`,
				{ method: "POST", body: formData },
			);
			aoEnviarComSucesso(resposta.entrega);
			setArquivo(null);
		} catch (erroCapturado) {
			setErro(
				erroCapturado instanceof ApiError
					? erroCapturado.message
					: "Não foi possível enviar o material.",
			);
		} finally {
			setEnviando(false);
		}
	}

	return (
		<div className="pendencia-upload">
			<div className="pendencia-upload-controls">
				<input
					type="file"
					onChange={(evento) => setArquivo(evento.target.files?.[0] ?? null)}
					disabled={enviando}
				/>
				<button
					type="button"
					className="btn-primary pendencia-submit"
					disabled={!arquivo || enviando}
					onClick={() => void enviar()}
					style={{ height: 36, padding: "0 20px", fontSize: 13 }}
				>
					{enviando ? "enviando..." : "enviar material"}
				</button>
			</div>
			{erro && <p className="pendencia-feedback">{erro}</p>}
		</div>
	);
}

function BriefingDoItem({ entregaId }: { entregaId: string }) {
	const [resposta, setResposta] = useState<RespostaBriefing | null>(null);
	const [erro, setErro] = useState<string | null>(null);
	const [carregando, setCarregando] = useState(true);

	useEffect(() => {
		let ativo = true;

		apiFetch<RespostaBriefing>(`/api/portal/entregas/${entregaId}/briefing`)
			.then((dados) => ativo && setResposta(dados))
			.catch((erroCapturado) => {
				if (!ativo) return;
				setErro(
					erroCapturado instanceof ApiError
						? erroCapturado.message
						: "Não foi possível carregar o briefing.",
				);
			})
			.finally(() => ativo && setCarregando(false));

		return () => {
			ativo = false;
		};
	}, [entregaId]);

	if (carregando) {
		return <p className="pendencia-feedback">carregando briefing...</p>;
	}

	if (erro) {
		return <p className="pendencia-feedback">{erro}</p>;
	}

	if (!resposta?.briefing) {
		return (
			<p className="pendencia-feedback">
				briefing ainda não publicado para esta entrega.
			</p>
		);
	}

	const { look, dataEntrega, dataPostagem, orientacao } = resposta.briefing;

	return (
		<dl className="pendencia-briefing">
			<dt>look</dt>
			<dd>{look}</dd>
			<dt>data de entrega</dt>
			<dd>{formatarData(dataEntrega)}</dd>
			<dt>data de postagem</dt>
			<dd>{formatarData(dataPostagem)}</dd>
			<dt>orientação</dt>
			<dd>{orientacao}</dd>
		</dl>
	);
}

function CardDeEntrega({
	item,
	aberto,
	aoAlternar,
	aoEnviarComSucesso,
}: {
	item: ItemDePendencia;
	aberto: boolean;
	aoAlternar: () => void;
	aoEnviarComSucesso: (item: ItemDePendencia) => void;
}) {
	const atrasada = entregaAtrasada(item);
	const acao = acaoDisponivel(item);

	return (
		<li
			className={`pendencia-item pendencia-${item.estado.toLowerCase()}${atrasada ? " is-overdue" : ""}${aberto ? " is-open" : ""}`}
		>
			<button
				type="button"
				onClick={aoAlternar}
				className="pendencia-trigger"
				aria-expanded={aberto}
			>
				<div>
					<strong className="pendencia-format">
						{LABEL_FORMATO[item.formato]}
					</strong>
					<p className="pendencia-date">{textoPrazo(item)}</p>
				</div>
				<div className="pendencia-status">
					<span className="pendencia-status-badge">
						<span className="pendencia-status-icon" aria-hidden="true">
							{atrasada
								? "!"
								: item.estado === "AGUARDANDO_MATERIAL"
									? "↑"
									: item.estado === "EM_REVISAO"
										? "·"
										: "✓"}
						</span>
						{LABEL_ESTADO[item.estado]}
					</span>
					{acao && <span className="pendencia-next-action">{acao}</span>}
					<span className="pendencia-icon" aria-hidden="true">
						↓
					</span>
				</div>
			</button>

			{aberto && (
				<div className="pendencia-details">
					<BriefingDoItem entregaId={item.id} />
					{item.estado === "AGUARDANDO_MATERIAL" && (
						<EnviarMaterial
							entregaId={item.id}
							aoEnviarComSucesso={aoEnviarComSucesso}
						/>
					)}
				</div>
			)}
		</li>
	);
}

export function PendenciasPage() {
	const [resposta, setResposta] = useState<RespostaPendencias | null>(null);
	const [erro, setErro] = useState<string | null>(null);
	const [carregando, setCarregando] = useState(true);
	const [itemAberto, setItemAberto] = useState<string | null>(null);

	useEffect(() => {
		let ativo = true;

		async function carregar() {
			try {
				const dados = await apiFetch<RespostaPendencias>(
					"/api/portal/pendencias",
				);
				if (ativo) {
					setResposta(dados);
				}
			} catch (erroCapturado) {
				if (!ativo) return;
				setErro(
					erroCapturado instanceof ApiError
						? erroCapturado.message
						: "Não foi possível carregar as pendências.",
				);
			} finally {
				if (ativo) {
					setCarregando(false);
				}
			}
		}

		void carregar();
		return () => {
			ativo = false;
		};
	}, []);

	function atualizarItem(itemAtualizado: ItemDePendencia) {
		setResposta((atual) =>
			atual
				? {
						...atual,
						itens: atual.itens.map((item) =>
							item.id === itemAtualizado.id ? itemAtualizado : item,
						),
					}
				: atual,
		);
	}

	const itensOrdenados = resposta
		? [...resposta.itens].sort((a, b) => prioridade(a) - prioridade(b))
		: [];
	const precisaDeVoce = itensOrdenados.filter(
		(item) => item.estado === "AGUARDANDO_MATERIAL",
	);
	const comEquipe = itensOrdenados.filter(
		(item) => item.estado !== "AGUARDANDO_MATERIAL",
	);

	return (
		<section className="portal-page pendencias-page">
			<p className="portal-eyebrow">conteúdo mensal</p>
			<h1 className="title-editorial portal-page-title">suas entregas</h1>
			<p className="portal-page-intro">
				{resposta
					? `acompanhe o que precisa acontecer em ${formatarCompetencia(resposta.mesReferencia)}.`
					: "acompanhe seus conteúdos, prazos e materiais do mês."}
			</p>

			{carregando && (
				<p className="portal-page-feedback">carregando suas entregas...</p>
			)}

			{!carregando && erro && (
				<p className="portal-page-feedback is-error">{erro}</p>
			)}

			{!carregando && !erro && resposta && resposta.itens.length === 0 && (
				<p className="portal-page-feedback">
					não há entregas pendentes em{" "}
					{formatarCompetencia(resposta.mesReferencia)}.
				</p>
			)}

			{!carregando && !erro && resposta && itensOrdenados.length > 0 && (
				<>
					{precisaDeVoce.length > 0 && (
						<div className="pendencias-group">
							<p className="pendencias-summary">
								{precisaDeVoce.length}{" "}
								{precisaDeVoce.length === 1
									? "entrega para você agora"
									: "entregas para você agora"}
							</p>
							<ul className="pendencias-list">
								{precisaDeVoce.map((item) => (
									<CardDeEntrega
										key={item.id}
										item={item}
										aberto={itemAberto === item.id}
										aoAlternar={() =>
											setItemAberto(itemAberto === item.id ? null : item.id)
										}
										aoEnviarComSucesso={atualizarItem}
									/>
								))}
							</ul>
						</div>
					)}

					{comEquipe.length > 0 && (
						<div className="pendencias-group">
							{precisaDeVoce.length === 0 && (
								<p className="pendencias-aviso">
									nada pendente da sua parte agora.
								</p>
							)}
							<p className="pendencias-summary is-quiet">
								{comEquipe.length === 1
									? "1 entrega com a equipe"
									: `${comEquipe.length} entregas com a equipe`}
							</p>
							<ul className="pendencias-list">
								{comEquipe.map((item) => (
									<CardDeEntrega
										key={item.id}
										item={item}
										aberto={itemAberto === item.id}
										aoAlternar={() =>
											setItemAberto(itemAberto === item.id ? null : item.id)
										}
										aoEnviarComSucesso={atualizarItem}
									/>
								))}
							</ul>
						</div>
					)}
				</>
			)}
		</section>
	);
}
