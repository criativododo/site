import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import logoPrincipal from "../assets/brand/principal-cherry.svg";
import { ApiError, apiFetch } from "../lib/api";
import { useSession } from "../lib/session";

const estiloInput = {
	height: 44,
	borderRadius: 8,
	border: "1px solid rgba(27, 23, 23, 0.2)",
	padding: "0 14px",
	fontSize: 15,
	fontWeight: 400,
} as const;

const estiloLabel = {
	display: "flex",
	flexDirection: "column",
	gap: 6,
	fontSize: 13,
	fontWeight: 700,
} as const;

interface RespostaCadastro {
	estadoConta: "PENDING" | "ACTIVE" | string;
}

export function CadastroPage() {
	const { sessao, carregando, recarregar } = useSession();

	const [chave, setChave] = useState("");
	const [nome, setNome] = useState("");
	const [nomePreenchidoPelaSessao, setNomePreenchidoPelaSessao] = useState(false);
	const [cnpj, setCnpj] = useState("");
	const [pix, setPix] = useState("");
	const [cep, setCep] = useState("");
	const [numero, setNumero] = useState("");
	const [complemento, setComplemento] = useState("");
	const [enviando, setEnviando] = useState(false);
	const [erro, setErro] = useState<string | null>(null);
	const [concluido, setConcluido] = useState<"PENDING" | "ACTIVE" | null>(null);

	// A sessão carrega de forma assíncrona (SessionProvider) — no primeiro render, antes dela
	// chegar, `sessao` ainda é `null`. Prefilar direto no `useState` travaria "nome" em "" para
	// sempre (o inicializador só roda uma vez); por isso o preenchimento espera aqui, só uma
	// vez, sem sobrescrever o que a usuária já tiver digitado.
	useEffect(() => {
		if (sessao?.nome && !nomePreenchidoPelaSessao) {
			setNome(sessao.nome);
			setNomePreenchidoPelaSessao(true);
		}
	}, [sessao?.nome, nomePreenchidoPelaSessao]);

	if (carregando) {
		return null;
	}

	if (!sessao) {
		return <Navigate to="/login" replace />;
	}

	if (!concluido && sessao.estadoConta !== "AGUARDANDO_CADASTRO") {
		return <Navigate to={sessao.estadoConta === "ACTIVE" ? "/pendencias" : "/login"} replace />;
	}

	if (concluido === "ACTIVE") {
		return <Navigate to="/pendencias" replace />;
	}
	if (concluido === "PENDING") {
		return <Navigate to="/login" replace />;
	}

	async function enviar() {
		setEnviando(true);
		setErro(null);
		try {
			const resposta = await apiFetch<RespostaCadastro>("/auth/cadastro", {
				method: "POST",
				body: JSON.stringify({ chave, nome, cnpj, pix, cep, numero, complemento }),
			});
			await recarregar();
			setConcluido(resposta.estadoConta === "ACTIVE" ? "ACTIVE" : "PENDING");
		} catch (erroCapturado) {
			setErro(
				erroCapturado instanceof ApiError
					? erroCapturado.message
					: "não foi possível enviar o cadastro.",
			);
		} finally {
			setEnviando(false);
		}
	}

	const formularioValido =
		chave.trim() && nome.trim() && cnpj.trim() && pix.trim() && cep.trim();

	return (
		<main className="portal-login">
			<header className="portal-login-header">
				<img className="portal-login-logo" src={logoPrincipal} alt="Criativo Dodô" />
			</header>

			<section
				className="portal-login-content"
				style={{ width: "min(100% - 48px, 480px)" }}
				aria-labelledby="portal-cadastro-title"
			>
				<p className="portal-login-overline">quase lá</p>
				<h1 id="portal-cadastro-title" className="portal-login-title" style={{ fontSize: 30 }}>
					complete seu cadastro.
				</h1>
				<p className="portal-login-description">
					esses dados são usados para identificação, pagamentos e comunicação sobre
					suas entregas.
				</p>

				<form
					onSubmit={(evento) => {
						evento.preventDefault();
						if (formularioValido) void enviar();
					}}
					style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 28 }}
				>
					<label style={estiloLabel}>
						nome completo
						<input
							value={nome}
							onChange={(evento) => setNome(evento.target.value)}
							style={estiloInput}
							required
						/>
					</label>
					<label style={estiloLabel}>
						chave / nome artístico
						<input
							value={chave}
							onChange={(evento) => setChave(evento.target.value)}
							style={estiloInput}
							placeholder="como você quer ser identificada"
							required
						/>
					</label>
					<label style={estiloLabel}>
						cnpj
						<input
							value={cnpj}
							onChange={(evento) => setCnpj(evento.target.value)}
							style={estiloInput}
							required
						/>
					</label>
					<label style={estiloLabel}>
						pix
						<input
							value={pix}
							onChange={(evento) => setPix(evento.target.value)}
							style={estiloInput}
							required
						/>
					</label>

					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
						<label style={estiloLabel}>
							cep
							<input
								value={cep}
								onChange={(evento) => setCep(evento.target.value)}
								style={estiloInput}
								required
							/>
						</label>
						<label style={estiloLabel}>
							número
							<input
								value={numero}
								onChange={(evento) => setNumero(evento.target.value)}
								style={estiloInput}
							/>
						</label>
					</div>
					<label style={estiloLabel}>
						complemento
						<input
							value={complemento}
							onChange={(evento) => setComplemento(evento.target.value)}
							style={estiloInput}
						/>
					</label>

					{erro && <p className="portal-page-feedback is-error">{erro}</p>}

					<button
						type="submit"
						className="btn-primary portal-login-button"
						disabled={enviando || !formularioValido}
					>
						{enviando ? "enviando..." : "enviar cadastro"} <span aria-hidden="true">→</span>
					</button>
				</form>
			</section>

			<footer className="portal-login-footer">
				<a href="/privacidade">política de privacidade (lgpd)</a>
			</footer>
		</main>
	);
}
