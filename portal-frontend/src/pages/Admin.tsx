import { useEffect, useState } from "react";
import { ApiError, apiFetch } from "../lib/api";
import { relatarErroFrontend } from "../lib/errorReporting";
import { useSession } from "../lib/session";

interface ContaPendente {
	subProvider: string;
	email: string;
	nome: string;
	papelAtor: string;
	dataCriacao: string;
}

interface SolicitacaoExclusao {
	id: string;
	parceiraId: string;
	dataPedido: string;
	status: "PENDENTE" | "APROVADA" | "NEGADA";
}

interface Convite {
	token: string;
	url: string;
	criadoEm: string;
	usadoEm: string | null;
}

/** ADR-011 · Gera links de convite pré-aprovado: quem se cadastra por eles pula a moderação. */
export function GerarConvite() {
	const [convites, setConvites] = useState<Convite[] | null>(null);
	const [carregando, setCarregando] = useState(true);
	const [gerando, setGerando] = useState(false);
	const [copiado, setCopiado] = useState<string | null>(null);
	const [erro, setErro] = useState<string | null>(null);

	function carregar() {
		setCarregando(true);
		apiFetch<{ itens: Convite[] }>("/api/admin/convites")
			.then((dados) => {
				setConvites(dados.itens);
				setErro(null);
			})
			.catch((erroCapturado) => {
				relatarErroFrontend("admin-convites-carregar", erroCapturado);
				setErro(
					erroCapturado instanceof ApiError
						? erroCapturado.message
						: "não foi possível carregar os links de convite.",
				);
				setConvites([]);
			})
			.finally(() => setCarregando(false));
	}

	useEffect(() => {
		carregar();
	}, []);

	async function gerar() {
		setGerando(true);
		setErro(null);
		try {
			await apiFetch<Convite>("/api/admin/convites", { method: "POST" });
			carregar();
		} catch (erroCapturado) {
			setErro(
				erroCapturado instanceof ApiError
					? erroCapturado.message
					: "não foi possível gerar o convite.",
			);
		} finally {
			setGerando(false);
		}
	}

	async function copiar(url: string) {
		try {
			await navigator.clipboard.writeText(url);
			setCopiado(url);
			setTimeout(() => setCopiado(null), 2000);
		} catch (erroCapturado) {
			relatarErroFrontend("admin-convites-copiar", erroCapturado);
			setErro("não foi possível copiar o link — copie manualmente.");
		}
	}

	return (
		<div className="portal-section-divider">
			<p className="pendencias-summary is-quiet">links de convite pré-aprovado</p>
			<p className="portal-page-feedback is-caption">
				quem se cadastra por um destes links entra direto, sem passar pela fila de
				aprovação abaixo.
			</p>

			<button
				type="button"
				className="btn-primary is-compact"
				disabled={gerando}
				onClick={() => void gerar()}
			>
				{gerando ? "gerando" : "gerar novo link"}
			</button>

			{carregando && <p className="portal-page-feedback">carregando</p>}
			{erro && <p className="portal-page-feedback is-error">{erro}</p>}

			{!carregando && convites && convites.length > 0 && (
				<ul className="portal-list is-spaced">
					{convites.map((convite) => (
						<li key={convite.token} className="portal-list-row">
							<div className="portal-list-row-body">
								<strong className="portal-list-row-title text-truncate">
									{convite.url}
								</strong>
								<p className="portal-list-row-meta">
									{convite.usadoEm ? "já utilizado" : "ainda não utilizado"}
								</p>
							</div>
							<div className="portal-list-row-actions">
								<button
									type="button"
									className="btn-outline"
									onClick={() => void copiar(convite.url)}
								>
									{copiado === convite.url ? "copiado" : "copiar"}
								</button>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

function FilaDeExclusao({
	responsavelAnalise,
}: {
	responsavelAnalise: string;
}) {
	const [pendentes, setPendentes] = useState<SolicitacaoExclusao[] | null>(
		null,
	);
	const [erro, setErro] = useState<string | null>(null);
	const [carregando, setCarregando] = useState(true);
	const [emAcao, setEmAcao] = useState<string | null>(null);

	function carregar() {
		setCarregando(true);
		apiFetch<{ itens: SolicitacaoExclusao[] }>(
			"/api/admin/lgpd/exclusao/pendentes",
		)
			.then((dados) => {
				setPendentes(dados.itens);
				setErro(null);
			})
			.catch((erroCapturado) => {
				setErro(
					erroCapturado instanceof ApiError
						? erroCapturado.message
						: "não foi possível carregar as solicitações de exclusão.",
				);
			})
			.finally(() => setCarregando(false));
	}

	useEffect(() => {
		carregar();
	}, []);

	async function decidir(id: string, aprovada: boolean) {
		const fundamentoJuridico = window.prompt(
			aprovada
				? "fundamento jurídico da aprovação (ex.: sem obrigação legal de retenção):"
				: "fundamento jurídico da negativa (ex.: obrigação fiscal de retenção por 5 anos):",
		);
		if (!fundamentoJuridico) return;

		setEmAcao(id);
		setErro(null);
		try {
			await apiFetch(`/api/admin/lgpd/exclusao/${id}/decidir`, {
				method: "PATCH",
				body: JSON.stringify({
					aprovada,
					fundamentoJuridico,
					responsavelAnalise,
				}),
			});
			carregar();
		} catch (erroCapturado) {
			setErro(
				erroCapturado instanceof ApiError
					? erroCapturado.message
					: "não foi possível registrar a decisão sobre a exclusão.",
			);
		} finally {
			setEmAcao(null);
		}
	}

	return (
		<div className="portal-section-divider">
			<p className="pendencias-summary is-quiet">
				solicitações de exclusão de conta (lgpd)
			</p>

			{carregando && (
				<p className="portal-page-feedback">carregando</p>
			)}
			{!carregando && erro && (
				<p className="portal-page-feedback is-error">{erro}</p>
			)}
			{!carregando && !erro && pendentes && pendentes.length === 0 && (
				<p className="portal-page-feedback">
					nenhuma solicitação de exclusão pendente.
				</p>
			)}

			{!carregando && !erro && pendentes && pendentes.length > 0 && (
				<ul className="portal-list">
					{pendentes.map((solicitacao) => (
						<li key={solicitacao.id} className="portal-list-row">
							<div>
								<strong className="portal-list-row-title">
									{solicitacao.parceiraId}
								</strong>
								<p className="portal-list-row-meta">
									pedido em {solicitacao.dataPedido}
								</p>
							</div>
							<div className="portal-list-row-actions">
								<button
									type="button"
									className="btn-primary is-compact"
									disabled={emAcao === solicitacao.id}
									onClick={() => void decidir(solicitacao.id, true)}
								>
									aprovar
								</button>
								<button
									type="button"
									className="btn-outline is-cherry"
									disabled={emAcao === solicitacao.id}
									onClick={() => void decidir(solicitacao.id, false)}
								>
									negar
								</button>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

export function AdminPage() {
	const { sessao } = useSession();
	const [pendentes, setPendentes] = useState<ContaPendente[] | null>(null);
	const [erro, setErro] = useState<string | null>(null);
	const [carregando, setCarregando] = useState(true);
	const [emAcao, setEmAcao] = useState<string | null>(null);

	function carregar() {
		setCarregando(true);
		apiFetch<{ itens: ContaPendente[] }>("/api/admin/identidades/pendentes")
			.then((dados) => {
				setPendentes(dados.itens);
				setErro(null);
			})
			.catch((erroCapturado) => {
				setErro(
					erroCapturado instanceof ApiError
						? erroCapturado.message
						: "não foi possível carregar os cadastros pendentes.",
				);
			})
			.finally(() => setCarregando(false));
	}

	useEffect(() => {
		carregar();
	}, []);

	async function decidir(subProvider: string, decisao: "aprovar" | "rejeitar") {
		setEmAcao(subProvider);
		setErro(null);
		try {
			await apiFetch(`/api/admin/identidades/${subProvider}/${decisao}`, {
				method: "PATCH",
			});
			carregar();
		} catch (erroCapturado) {
			setErro(
				erroCapturado instanceof ApiError
					? erroCapturado.message
					: "não foi possível registrar a decisão sobre o cadastro.",
			);
		} finally {
			setEmAcao(null);
		}
	}

	if (sessao?.papelAtor !== "ADMINISTRADOR") {
		return (
			<section className="portal-page">
				<p className="portal-page-feedback">área restrita a administradores.</p>
			</section>
		);
	}

	return (
		<section className="portal-page">
			<p className="portal-eyebrow">administração</p>
			<h1 className="title-editorial portal-page-title">
				moderação de cadastros
			</h1>
			<p className="portal-page-intro">
				aprove ou rejeite contas novas e pedidos de exclusão.
			</p>

			<GerarConvite />

			{carregando && <p className="portal-page-feedback">carregando</p>}
			{!carregando && erro && (
				<p className="portal-page-feedback is-error">{erro}</p>
			)}

			{!carregando && !erro && pendentes && pendentes.length === 0 && (
				<p className="portal-page-feedback">
					nenhum cadastro aguardando aprovação.
				</p>
			)}

			{!carregando && !erro && pendentes && pendentes.length > 0 && (
				<ul className="portal-list">
					{pendentes.map((conta) => (
						<li key={conta.subProvider} className="portal-list-row">
							<div>
								<strong className="portal-list-row-title">
									{conta.nome}
								</strong>
								<p className="portal-list-row-meta">{conta.email}</p>
							</div>
							<div className="portal-list-row-actions">
								<button
									type="button"
									className="btn-primary is-compact"
									disabled={emAcao === conta.subProvider}
									onClick={() => void decidir(conta.subProvider, "aprovar")}
								>
									aprovar
								</button>
								<button
									type="button"
									className="btn-outline is-cherry"
									disabled={emAcao === conta.subProvider}
									onClick={() => void decidir(conta.subProvider, "rejeitar")}
								>
									rejeitar
								</button>
							</div>
						</li>
					))}
				</ul>
			)}

			<FilaDeExclusao responsavelAnalise={sessao.email} />
		</section>
	);
}
