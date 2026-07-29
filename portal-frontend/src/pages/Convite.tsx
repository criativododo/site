import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { CHAVE_CONVITE_TOKEN } from "../lib/session";
import { LoginPage } from "./Login";

/**
 * ADR-011 · Entrada de um link de convite pré-aprovado. Guarda o token para que `login()`
 * (session.tsx) o repasse ao backend no início do OIDC, e mostra a mesma tela de login normal
 * — o convite só muda o que acontece depois do cadastro ser enviado, nunca a UI aqui.
 */
export function ConvitePage() {
	const { token } = useParams<{ token: string }>();

	useEffect(() => {
		if (token) {
			sessionStorage.setItem(CHAVE_CONVITE_TOKEN, token);
		}
	}, [token]);

	return <LoginPage />;
}
