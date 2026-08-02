import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import logoPrincipal from "../assets/brand/principal-cherry.svg";
import { ApiError, apiFetch } from "../lib/api";
import { useSession } from "../lib/session";

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
				className="portal-login-content is-wide"
				aria-labelledby="portal-cadastro-title"
			>
				<p className="portal-login-overline">quase lá</p>
				<h1 id="portal-cadastro-title" className="portal-login-title is-compact">
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
					className="portal-login-form"
				>
					<label className="portal-login-field">
						nome completo
						<input
							className="portal-login-input"
							value={nome}
							onChange={(evento) => setNome(evento.target.value)}
							required
						/>
					</label>
					<label className="portal-login-field">
						chave / nome artístico
						<input
							className="portal-login-input"
							value={chave}
							onChange={(evento) => setChave(evento.target.value)}
							placeholder="como você quer ser identificada"
							required
						/>
					</label>
					<label className="portal-login-field">
						cnpj
						<input
							className="portal-login-input"
							value={cnpj}
							onChange={(evento) => setCnpj(evento.target.value)}
							required
						/>
					</label>
					<label className="portal-login-field">
						pix
						<input
							className="portal-login-input"
							value={pix}
							onChange={(evento) => setPix(evento.target.value)}
							required
						/>
					</label>

					<div className="portal-login-form-row">
						<label className="portal-login-field">
							cep
							<input
								className="portal-login-input"
								value={cep}
								onChange={(evento) => setCep(evento.target.value)}
								required
							/>
						</label>
						<label className="portal-login-field">
							número
							<input
								className="portal-login-input"
								value={numero}
								onChange={(evento) => setNumero(evento.target.value)}
							/>
						</label>
					</div>
					<label className="portal-login-field">
						complemento
						<input
							className="portal-login-input"
							value={complemento}
							onChange={(evento) => setComplemento(evento.target.value)}
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
