import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiFetch, ApiError } from "./api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

/**
 * Espelha o estado de conta de SPEC-035 Cap. 7 (ADR-007): toda conta nasce PENDING e só
 * passa a ACTIVE por ação de um Administrador. INACTIVE/REJECTED bloqueiam acesso.
 */
export type EstadoConta = "PENDING" | "ACTIVE" | "INACTIVE" | "REJECTED";

export interface SessaoParceira {
  parceiraId: string | null;
  nome: string;
  email: string;
  estadoConta: EstadoConta;
}

interface SessionContextValue {
  sessao: SessaoParceira | null;
  carregando: boolean;
  login: () => void;
  logout: () => Promise<void>;
  recarregar: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

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
    // o frontend só redireciona, nunca manipula token OIDC diretamente.
    window.location.href = `${API_BASE_URL}/auth/google/login`;
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
