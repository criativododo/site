import { useEffect, useState } from "react";
import { ApiError, apiFetch } from "../lib/api";

interface Endereco {
	cep: string;
	rua: string;
	bairro: string;
	cidade: string;
	uf: string;
	numero: string;
	complemento: string;
}

interface PerfilParceira {
	parceiraId: string;
	pix: string;
	email: string;
	endereco: Endereco | null;
}

const estiloInput = {
	height: 40,
	borderRadius: 8,
	border: "1px solid rgba(27, 23, 23, 0.2)",
	padding: "0 12px",
	fontSize: 14,
	fontWeight: 400,
} as const;

const estiloLabel = {
	display: "flex",
	flexDirection: "column",
	gap: 6,
	fontSize: 13,
	fontWeight: 700,
} as const;

function BotaoCancelar({ aoClicar }: { aoClicar: () => void }) {
	return (
		<button
			type="button"
			onClick={aoClicar}
			style={{
				alignSelf: "flex-start",
				height: 40,
				padding: "0 4px",
				fontSize: 14,
				border: "none",
				background: "none",
				color: "rgba(27, 23, 23, 0.7)",
			}}
		>
			cancelar
		</button>
	);
}

function EditarContato({
	perfil,
	aoSalvarComSucesso,
	aoCancelar,
}: {
	perfil: PerfilParceira;
	aoSalvarComSucesso: (perfil: PerfilParceira) => void;
	aoCancelar: () => void;
}) {
	const [pix, setPix] = useState(perfil.pix);
	const [email, setEmail] = useState(perfil.email);
	const [salvando, setSalvando] = useState(false);
	const [erro, setErro] = useState<string | null>(null);

	const formularioValido = pix.trim().length > 0 && email.trim().length > 0 && email.includes("@");

	async function salvar() {
		setSalvando(true);
		setErro(null);

		try {
			const atualizado = await apiFetch<PerfilParceira>(
				"/api/portal/perfil/contato",
				{
					method: "PATCH",
					body: JSON.stringify({ pix, email }),
				},
			);
			aoSalvarComSucesso(atualizado);
		} catch (erroCapturado) {
			setErro(
				erroCapturado instanceof ApiError
					? erroCapturado.message
					: "não foi possível salvar.",
			);
		} finally {
			setSalvando(false);
		}
	}

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: 12,
				maxWidth: 360,
				marginTop: 16,
			}}
		>
			<label style={estiloLabel}>
				pix
				<input
					value={pix}
					onChange={(evento) => setPix(evento.target.value)}
					style={estiloInput}
				/>
			</label>
			<label style={estiloLabel}>
				e-mail
				<input
					type="email"
					value={email}
					onChange={(evento) => setEmail(evento.target.value)}
					style={estiloInput}
				/>
			</label>

			{erro && <p className="portal-page-feedback is-error">{erro}</p>}

			<div style={{ display: "flex", alignItems: "center", gap: 4 }}>
				<button
					type="button"
					className="btn-primary"
					disabled={salvando || !formularioValido}
					onClick={() => void salvar()}
					style={{
						alignSelf: "flex-start",
						height: 40,
						padding: "0 24px",
						fontSize: 14,
					}}
				>
					{salvando ? "salvando..." : "salvar"}
				</button>
				<BotaoCancelar aoClicar={aoCancelar} />
			</div>
		</div>
	);
}

function mascararCep(valor: string): string {
	const digitos = valor.replace(/\D/g, "").slice(0, 8);
	return digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos;
}

function cepCompletoOuVazio(valor: string): boolean {
	const digitos = valor.replace(/\D/g, "");
	return digitos.length === 0 || digitos.length === 8;
}

function EditarEndereco({
	perfil,
	aoSalvarComSucesso,
	aoCancelar,
}: {
	perfil: PerfilParceira;
	aoSalvarComSucesso: (perfil: PerfilParceira) => void;
	aoCancelar: () => void;
}) {
	const [cep, setCep] = useState(mascararCep(perfil.endereco?.cep ?? ""));
	const [numero, setNumero] = useState(perfil.endereco?.numero ?? "");
	const [complemento, setComplemento] = useState(
		perfil.endereco?.complemento ?? "",
	);
	const [salvando, setSalvando] = useState(false);
	const [aviso, setAviso] = useState<string | null>(null);

	async function salvar() {
		setSalvando(true);
		setAviso(null);

		try {
			const resposta = await apiFetch<{
				perfil: PerfilParceira;
				cepResolvido: boolean;
			}>("/api/portal/perfil/endereco", {
				method: "PATCH",
				body: JSON.stringify({ cep, numero, complemento }),
			});
			aoSalvarComSucesso(resposta.perfil);
			if (!resposta.cepResolvido) {
				setAviso(
					"cep não encontrado — número e complemento foram salvos mesmo assim.",
				);
			}
		} catch (erroCapturado) {
			setAviso(
				erroCapturado instanceof ApiError
					? erroCapturado.message
					: "não foi possível salvar.",
			);
		} finally {
			setSalvando(false);
		}
	}

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: 12,
				maxWidth: 360,
				marginTop: 16,
			}}
		>
			<label style={estiloLabel}>
				cep
				<input
					value={cep}
					onChange={(evento) => setCep(mascararCep(evento.target.value))}
					placeholder="00000-000"
					inputMode="numeric"
					style={estiloInput}
				/>
			</label>
			{!cepCompletoOuVazio(cep) && (
				<p className="portal-page-feedback is-error">cep incompleto — precisa de 8 dígitos.</p>
			)}
			<label style={estiloLabel}>
				número
				<input
					value={numero}
					onChange={(evento) => setNumero(evento.target.value)}
					style={estiloInput}
				/>
			</label>
			<label style={estiloLabel}>
				complemento
				<input
					value={complemento}
					onChange={(evento) => setComplemento(evento.target.value)}
					style={estiloInput}
				/>
			</label>

			{aviso && <p className="portal-page-feedback">{aviso}</p>}

			<div style={{ display: "flex", alignItems: "center", gap: 4 }}>
				<button
					type="button"
					className="btn-primary"
					disabled={salvando || !cepCompletoOuVazio(cep)}
					onClick={() => void salvar()}
					style={{
						alignSelf: "flex-start",
						height: 40,
						padding: "0 24px",
						fontSize: 14,
					}}
				>
					{salvando ? "salvando..." : "salvar endereço"}
				</button>
				<BotaoCancelar aoClicar={aoCancelar} />
			</div>
		</div>
	);
}

function MeusDadosLgpd() {
	const [aviso, setAviso] = useState<string | null>(null);
	const [processando, setProcessando] = useState(false);

	async function exportar() {
		setProcessando(true);
		setAviso(null);
		try {
			const dados = await apiFetch<unknown>("/api/portal/lgpd/exportar");
			const blob = new Blob([JSON.stringify(dados, null, 2)], {
				type: "application/json",
			});
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = "meus-dados-dodo.json";
			link.click();
			URL.revokeObjectURL(url);
		} catch (erroCapturado) {
			setAviso(
				erroCapturado instanceof ApiError
					? erroCapturado.message
					: "não foi possível exportar.",
			);
		} finally {
			setProcessando(false);
		}
	}

	async function solicitarExclusao() {
		setProcessando(true);
		setAviso(null);
		try {
			await apiFetch("/api/portal/lgpd/exclusao", { method: "POST" });
			setAviso(
				"pedido de exclusão registrado. a equipe avaliará e retornará sobre a decisão.",
			);
		} catch (erroCapturado) {
			setAviso(
				erroCapturado instanceof ApiError
					? erroCapturado.message
					: "não foi possível registrar o pedido.",
			);
		} finally {
			setProcessando(false);
		}
	}

	return (
		<div className="portal-section-divider">
			<p className="pendencias-summary is-quiet">seus dados (lgpd)</p>
			<div
				style={{
					display: "flex",
					flexWrap: "wrap",
					gap: 12,
					marginTop: 12,
				}}
			>
				<button
					type="button"
					disabled={processando}
					onClick={() => void exportar()}
					style={{
						height: 36,
						padding: "0 16px",
						fontSize: 13,
						borderRadius: 24,
						border: "1px solid rgba(27, 23, 23, 0.2)",
						background: "none",
					}}
				>
					baixar meus dados
				</button>
				<button
					type="button"
					disabled={processando}
					onClick={() => void solicitarExclusao()}
					style={{
						height: 36,
						padding: "0 16px",
						fontSize: 13,
						borderRadius: 24,
						border: "1px solid var(--color-cherry)",
						background: "none",
						color: "var(--color-cherry)",
					}}
				>
					solicitar exclusão de conta
				</button>
			</div>
			{aviso && (
				<p className="portal-page-feedback" style={{ marginTop: 8 }}>
					{aviso}
				</p>
			)}
		</div>
	);
}

/**
 * Cada linha só aparece se tiver conteúdo — um endereço parcial (ex.: CEP não resolvido por
 * nenhum provider, RN-02) nunca deve gerar pontuação solta (", 12 – , /").
 */
function linhasDeEndereco(endereco: Endereco): string[] {
	const ruaNumero = [endereco.rua, endereco.numero].filter(Boolean).join(", ");
	const linha1 = [ruaNumero, endereco.complemento].filter(Boolean).join(" – ");
	const cidadeUf = [endereco.cidade, endereco.uf].filter(Boolean).join("/");
	return [linha1, endereco.bairro, cidadeUf, endereco.cep].filter(Boolean);
}

function LinhaDePerfil({
	rotulo,
	valor,
	editando,
	aoEditar,
}: {
	rotulo: string;
	valor: string;
	editando: boolean;
	aoEditar: () => void;
}) {
	return (
		<>
			<dt style={{ fontWeight: 700 }}>{rotulo}</dt>
			<dd style={{ display: "flex", alignItems: "center", gap: 12 }}>
				{valor}
				{!editando && (
					<button
						type="button"
						onClick={aoEditar}
						style={{
							border: "none",
							background: "none",
							padding: 0,
							fontSize: 13,
							fontWeight: 700,
							color: "var(--color-cherry)",
						}}
					>
						editar
					</button>
				)}
			</dd>
		</>
	);
}

export function PerfilPage() {
	const [perfil, setPerfil] = useState<PerfilParceira | null>(null);
	const [erro, setErro] = useState<string | null>(null);
	const [carregando, setCarregando] = useState(true);
	const [editandoContato, setEditandoContato] = useState(false);
	const [editandoEndereco, setEditandoEndereco] = useState(false);

	useEffect(() => {
		let ativo = true;

		apiFetch<PerfilParceira>("/api/portal/perfil/")
			.then((dados) => ativo && setPerfil(dados))
			.catch((erroCapturado) => {
				if (!ativo) return;
				// 404 aqui é "perfil ainda não configurado", não uma falha real — o backend só
				// grava um registro de Perfil no primeiro PATCH (contato/endereço), então toda
				// Parceira nova chega sem um até editar pela primeira vez. Trata como formulário
				// vazio editável em vez de erro sem saída.
				if (erroCapturado instanceof ApiError && erroCapturado.status === 404) {
					setPerfil({ parceiraId: "", pix: "", email: "", endereco: null });
					return;
				}
				setErro(
					erroCapturado instanceof ApiError
						? erroCapturado.message
						: "não foi possível carregar o perfil.",
				);
			})
			.finally(() => ativo && setCarregando(false));

		return () => {
			ativo = false;
		};
	}, []);

	return (
		<section className="portal-page">
			<p className="portal-eyebrow">sua conta</p>
			<h1 className="title-editorial portal-page-title">perfil</h1>
			<p className="portal-page-intro">
				seus dados de contato e pagamento.
			</p>

			{carregando && (
				<p className="portal-page-feedback">carregando perfil...</p>
			)}

			{!carregando && erro && (
				<p className="portal-page-feedback is-error">{erro}</p>
			)}

			{!carregando && !erro && perfil && (
				<>
					<dl
						style={{
							display: "grid",
							gridTemplateColumns: "auto 1fr",
							gap: "14px 20px",
							fontSize: 15,
							maxWidth: 480,
						}}
					>
						<LinhaDePerfil
							rotulo="pix"
							valor={perfil.pix}
							editando={editandoContato}
							aoEditar={() => setEditandoContato(true)}
						/>
						<LinhaDePerfil
							rotulo="e-mail"
							valor={perfil.email}
							editando={editandoContato}
							aoEditar={() => setEditandoContato(true)}
						/>

						<>
							<dt style={{ fontWeight: 700 }}>endereço</dt>
							<dd style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
								{perfil.endereco && linhasDeEndereco(perfil.endereco).length > 0 ? (
									<>
										<div style={{ display: "flex", flexDirection: "column" }}>
											{linhasDeEndereco(perfil.endereco).map((linha, indice) => (
												<span key={indice}>{linha}</span>
											))}
										</div>
										{!editandoEndereco && (
											<button
												type="button"
												onClick={() => setEditandoEndereco(true)}
												style={{
													border: "none",
													background: "none",
													padding: 0,
													fontSize: 13,
													fontWeight: 700,
													color: "var(--color-cherry)",
												}}
											>
												editar
											</button>
										)}
									</>
								) : (
									!editandoEndereco && (
										<button
											type="button"
											onClick={() => setEditandoEndereco(true)}
											style={{
												border: "none",
												background: "none",
												padding: 0,
												fontSize: 15,
												fontWeight: 700,
												color: "var(--color-cherry)",
											}}
										>
											adicionar endereço →
										</button>
									)
								)}
							</dd>
						</>
					</dl>

					{editandoContato && (
						<EditarContato
							perfil={perfil}
							aoSalvarComSucesso={(atualizado) => {
								setPerfil(atualizado);
								setEditandoContato(false);
							}}
							aoCancelar={() => setEditandoContato(false)}
						/>
					)}
					{editandoEndereco && (
						<EditarEndereco
							perfil={perfil}
							aoSalvarComSucesso={(atualizado) => {
								setPerfil(atualizado);
								setEditandoEndereco(false);
							}}
							aoCancelar={() => setEditandoEndereco(false)}
						/>
					)}

					<MeusDadosLgpd />
				</>
			)}
		</section>
	);
}
