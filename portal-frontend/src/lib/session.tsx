import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { ApiError, apiFetch } from "./api";

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

/**
 * Espelha o estado de conta de SPEC-035 Cap. 7 (ADR-007/ADR-011): toda conta nasce
 * AGUARDANDO_CADASTRO, passa a PENDING ao enviar o formulário de cadastro (ou direto a ACTIVE,
 * se veio de um convite pré-aprovado) e só passa a ACTIVE por ação de um Administrador nos
 * demais casos. INACTIVE/REJECTED bloqueiam acesso.
 */
export type EstadoConta =
	| "AGUARDANDO_CADASTRO"
	| "PENDING"
	| "ACTIVE"
	| "INACTIVE"
	| "REJECTED";

/** ADR-011: chave usada para carregar o token de convite (`/convite/:token`) até o login. */
export const CHAVE_CONVITE_TOKEN = "dodo_convite_token";

/**
 * `ADMINISTRADOR_MARCA` (ADR-022, nível 2): visão operacional restrita da própria campanha —
 * não é um novo tenant, é um ator adicional dentro do mesmo domínio single-tenant.
 */
export type PapelAtor = "ADMINISTRADOR" | "ADMINISTRADOR_MARCA" | "INFLUENCIADORA";

export interface SessaoParceira {
	parceiraId: string | null;
	nome: string;
	email: string;
	estadoConta: EstadoConta;
	papelAtor: PapelAtor;
}

interface SessionContextValue {
	sessao: SessaoParceira | null;
	carregando: boolean;
	login: () => void;
	logout: () => Promise<void>;
	recarregar: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | undefined>(
	undefined,
);

export function SessionProvider({ children }: { children: ReactNode }) {
	const [sessao, setSessao] = useState<SessaoParceira | null>(null);
	const [carregando, setCarregando] = useState(true);

	async function carregarSessao() {
		setCarregando(true);
		try {
			const atual = await apiFetch<SessaoParceira>("/auth/me");
			setSessao(atual);
		} catch (erro) {
			if (erro instanceof ApiError && erro.status === 401) {
				setSessao(null);
			} else {
				throw erro;
			}
		} finally {
			setCarregando(false);
		}
	}

	useEffect(() => {
		void carregarSessao();
	}, []);

	function login() {
		// Authorization Code Flow + PKCE (ADR-007) começa e termina no backend;
		// o frontend só redireciona, nunca manipula token OIDC diretamente. Se a visita veio de
		// um link de convite (ADR-011, `/convite/:token`), o token guardado viaja como query
		// param — o backend o carrega no handshake OIDC e o repassa até a criação da conta.
		const conviteToken = sessionStorage.getItem(CHAVE_CONVITE_TOKEN);
		const query = conviteToken ? `?convite=${encodeURIComponent(conviteToken)}` : "";
		window.location.href = `${API_BASE_URL}/auth/google/login${query}`;
	}

	async function logout() {
		await apiFetch("/auth/logout", { method: "POST" });
		setSessao(null);
	}

	return (
		<SessionContext.Provider
			value={{ sessao, carregando, login, logout, recarregar: carregarSessao }}
		>
			{children}
		</SessionContext.Provider>
	);
}

export function useSession(): SessionContextValue {
	const context = useContext(SessionContext);
	if (!context) {
		throw new Error("useSession precisa estar dentro de <SessionProvider>");
	}
	return context;
}
