import { Navigate } from "react-router-dom";
import logoPrincipal from "../assets/brand/principal.svg";
import { useSession } from "../lib/session";

export function LoginPage() {
	const { sessao, carregando, login } = useSession();

	if (carregando) {
		return (
			<main className="portal-login portal-login-loading" aria-live="polite">
				<img
					className="portal-login-logo"
					src={logoPrincipal}
					alt="criativo dodô"
				/>
				<span className="portal-login-loader" aria-hidden="true" />
				<p>verificando seu acesso…</p>
			</main>
		);
	}

	if (sessao?.estadoConta === "ACTIVE") {
		return <Navigate to="/pendencias" replace />;
	}

	return (
		<main className="portal-login">
			<header className="portal-login-header">
				<img
					className="portal-login-logo"
					src={logoPrincipal}
					alt="criativo dodô"
				/>
				<span>portal da parceira</span>
			</header>

			<section
				className="portal-login-content"
				aria-labelledby="portal-login-title"
			>
				{!sessao && (
					<>
						<p className="portal-login-overline">acesso da parceira</p>
						<h1 id="portal-login-title" className="portal-login-title">
							bem-vinda de volta.
						</h1>
						<p className="portal-login-description">
							entre com a conta google cadastrada para acompanhar conteúdos,
							pagamentos e seu perfil.
						</p>
						<button
							type="button"
							className="portal-login-button"
							onClick={login}
						>
							continuar com google <span aria-hidden="true">→</span>
						</button>
						<p className="portal-login-security">
							seu acesso é protegido pela sua conta google.
						</p>
					</>
				)}

				{sessao?.estadoConta === "PENDING" && (
					<>
						<p className="portal-login-overline">cadastro recebido</p>
						<h1 id="portal-login-title" className="portal-login-title">
							seu acesso está em análise.
						</h1>
						<p className="portal-login-description">
							assim que a equipe aprovar seu cadastro, você poderá entrar por
							aqui com a mesma conta google.
						</p>
					</>
				)}

				{(sessao?.estadoConta === "INACTIVE" ||
					sessao?.estadoConta === "REJECTED") && (
					<>
						<p className="portal-login-overline">acesso indisponível</p>
						<h1 id="portal-login-title" className="portal-login-title">
							não foi possível liberar seu acesso.
						</h1>
						<p className="portal-login-description">
							fale com a equipe criativo dodô para confirmar os dados do seu
							cadastro.
						</p>
					</>
				)}
			</section>

			<footer className="portal-login-footer">
				precisa de ajuda? fale com a equipe criativo dodô.
			</footer>
		</main>
	);
}
