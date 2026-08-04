import { Link } from "react-router-dom";
import logoPrincipal from "../assets/brand/principal-cherry.svg";

/**
 * Página pública e estática — resume, em linguagem simples, os mecanismos de LGPD já
 * implementados no Portal (exportar dados e solicitar exclusão, ambos em `/perfil`, ADR-010).
 * Não define nova regra de negócio: só descreve o que já existe em código.
 */
export function PrivacidadePage() {
	return (
		<main className="portal-login">
			<header className="portal-login-header">
				<Link to="/login">
					<img className="portal-login-logo" src={logoPrincipal} alt="Criativo Dodô" />
				</Link>
			</header>

			<section className="portal-page is-prose">
				<p className="portal-eyebrow">privacidade</p>
				<h1 className="title-editorial portal-page-title is-tight">
					política de privacidade e lgpd
				</h1>

				<div className="portal-prose">
					<p>
						o portal criativo dodô trata os dados pessoais necessários para gerir a
						colaboração mensal com cada parceira: nome, e-mail, cnpj, pix e endereço,
						usados exclusivamente para identificação, pagamentos e comunicação sobre
						entregas e briefings.
					</p>
					<p>
						o acesso é feito por login com sua conta Google. o portal nunca armazena
						senha própria. seus dados só são visíveis para você e para a equipe
						administrativa do criativo dodô.
					</p>
					<p>
						a qualquer momento, na tela de <Link to="/perfil">perfil</Link>, você pode
						baixar uma cópia de todos os seus dados ou solicitar a exclusão da sua
						conta. o pedido é avaliado pela equipe e você recebe uma resposta.
					</p>
					<p>
						dúvidas sobre o tratamento dos seus dados podem ser enviadas para a equipe
						criativo dodô pelos canais de contato já usados na colaboração.
					</p>
				</div>
			</section>

			<footer className="portal-login-footer">
				<Link to="/login">voltar para o login</Link>
			</footer>
		</main>
	);
}
