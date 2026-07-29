import { useEffect, useState } from "react";
import { ApiError, apiFetch } from "../lib/api";
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
			.then((dados) => setPendentes(dados.itens))
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
				<p className="portal-page-feedback">carregando...</p>
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
									className="btn-primary"
									disabled={emAcao === solicitacao.id}
									onClick={() => void decidir(solicitacao.id, true)}
									style={{ height: 36, padding: "0 20px", fontSize: 13 }}
								>
									aprovar
								</button>
								<button
									type="button"
									disabled={emAcao === solicitacao.id}
									onClick={() => void decidir(solicitacao.id, false)}
									style={{
										height: 36,
										padding: "0 20px",
										fontSize: 13,
										borderRadius: 24,
										border: "1px solid var(--color-cherry)",
										background: "none",
										color: "var(--color-cherry)",
									}}
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
			.then((dados) => setPendentes(dados.itens))
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

			{carregando && <p className="portal-page-feedback">carregando...</p>}
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
									className="btn-primary"
									disabled={emAcao === conta.subProvider}
									onClick={() => void decidir(conta.subProvider, "aprovar")}
									style={{ height: 36, padding: "0 20px", fontSize: 13 }}
								>
									aprovar
								</button>
								<button
									type="button"
									disabled={emAcao === conta.subProvider}
									onClick={() => void decidir(conta.subProvider, "rejeitar")}
									style={{
										height: 36,
										padding: "0 20px",
										fontSize: 13,
										borderRadius: 24,
										border: "1px solid var(--color-cherry)",
										background: "none",
										color: "var(--color-cherry)",
									}}
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
