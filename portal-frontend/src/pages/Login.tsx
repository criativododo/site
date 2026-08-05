import { Navigate } from "react-router-dom";
import emblema from "../assets/brand/icon.svg";
import logoPrincipal from "../assets/brand/principal-cherry.svg";
import { Button } from "../components/ui/button";
import { useSession } from "../lib/session";

function GoogleLogo() {
	return (
		<svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
			<path
				fill="#4285F4"
				d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
			/>
			<path
				fill="#34A853"
				d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
			/>
			<path
				fill="#FBBC05"
				d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
			/>
			<path
				fill="#EA4335"
				d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
			/>
		</svg>
	);
}

export function LoginPage() {
	const { sessao, carregando, login, logout } = useSession();

	if (carregando) {
		return (
			<main className="portal-login portal-login-loading" aria-live="polite">
				<img
					className="portal-login-logo"
					src={logoPrincipal}
					alt="Criativo Dodô"
				/>
				<span className="dodo-mark dodo-mark--loading" style={{ fontSize: 28 }} aria-hidden="true">
					Ô
				</span>
				<p>verificando seu acesso</p>
			</main>
		);
	}

	if (sessao?.estadoConta === "ACTIVE") {
		return <Navigate to="/pendencias" replace />;
	}

	if (sessao?.estadoConta === "AGUARDANDO_CADASTRO") {
		return <Navigate to="/cadastro" replace />;
	}

	if (!sessao) {
		return (
			<main className="portal-entrada">
				<img
					className="portal-entrada-emblem"
					src={emblema}
					alt=""
					aria-hidden="true"
				/>
				<section
					className="portal-entrada-content"
					aria-labelledby="portal-entrada-title"
				>
					<img
						className="portal-entrada-wordmark"
						src={logoPrincipal}
						alt="Criativo Dodô"
					/>
					<p className="portal-entrada-eyebrow">acesso ao portal</p>
					<h1 id="portal-entrada-title" className="portal-entrada-title">
						bem-vinda
						<br />
						de volta.
					</h1>
					<p className="portal-entrada-description">
						entre com a conta Google cadastrada para acompanhar conteúdos,
						pagamentos e seu perfil.
					</p>
					<div className="portal-entrada-auth">
						<Button
							type="button"
							variant="outline"
							className="portal-entrada-oauth is-google"
							onClick={login}
						>
							<GoogleLogo />
							<span>Continuar com o Google</span>
						</Button>
					</div>
				</section>
				<footer className="portal-login-footer">
					<span>precisa de ajuda? fale com a equipe criativo dodô.</span>
					<a href="/privacidade">política de privacidade (lgpd)</a>
				</footer>
			</main>
		);
	}

	return (
		<main className="portal-login">
			<img className="portal-login-emblem" src={emblema} alt="" aria-hidden="true" />
			<header className="portal-login-header">
				<img
					className="portal-login-logo"
					src={logoPrincipal}
					alt="Criativo Dodô"
				/>
			</header>

			<section
				className="portal-login-content"
				aria-labelledby="portal-login-title"
			>
				{sessao.estadoConta === "PENDING" && (
					<>
						<p className="portal-login-overline">cadastro recebido</p>
						<h1 id="portal-login-title" className="portal-login-title">
							seu acesso está em análise.
						</h1>
						<p className="portal-login-description">
							assim que a equipe aprovar seu cadastro, você poderá entrar por
							aqui com a mesma conta Google.
						</p>
						<button
							type="button"
							className="btn-outline portal-login-retry"
							onClick={logout}
						>
							sair e tentar novamente
						</button>
					</>
				)}

				{(sessao.estadoConta === "INACTIVE" ||
					sessao.estadoConta === "REJECTED") && (
					<>
						<p className="portal-login-overline">acesso indisponível</p>
						<h1 id="portal-login-title" className="portal-login-title">
							não foi possível liberar seu acesso.
						</h1>
						<p className="portal-login-description">
							fale com a equipe criativo dodô para confirmar os dados do seu
							cadastro.
						</p>
						<button
							type="button"
							className="btn-outline portal-login-retry"
							onClick={logout}
						>
							sair e tentar novamente
						</button>
					</>
				)}
			</section>

			<footer className="portal-login-footer">
				<span>precisa de ajuda? fale com a equipe criativo dodô.</span>
				<a href="/privacidade">política de privacidade (lgpd)</a>
			</footer>
		</main>
	);
}
