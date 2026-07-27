import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSession } from "../lib/session";

/**
 * Middleware de rota do frontend (conveniência de UX/redirecionamento) — a garantia real de
 * isolamento e autorização vive no backend (PORTAL_ARQUITETURA.md §7): nenhuma tela aqui deve
 * ser tratada como controle de acesso de fato, só evita flash de conteúdo para sessão ausente.
 */
export function RotaProtegida({ children }: { children: ReactNode }) {
	const { sessao, carregando } = useSession();

	if (carregando) {
		return null;
	}

	if (!sessao || sessao.estadoConta !== "ACTIVE") {
		return <Navigate to="/login" replace />;
	}

	return <>{children}</>;
}
