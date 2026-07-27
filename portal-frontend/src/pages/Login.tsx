import { Navigate } from "react-router-dom";
import { useSession } from "../lib/session";
import logoPrincipal from "../assets/brand/principal.svg";

export function LoginPage() {
  const { sessao, carregando, login } = useSession();

  if (carregando) {
    return null;
  }

  if (sessao?.estadoConta === "ACTIVE") {
    return <Navigate to="/pendencias" replace />;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        textAlign: "center",
        padding: "0 24px",
      }}
    >
      <img src={logoPrincipal} alt="Criativo DODÔ" style={{ width: 160 }} />

      <div style={{ maxWidth: 380 }}>
        <h1 className="title-editorial" style={{ fontSize: 28, marginBottom: 12 }}>
          Portal da Parceira
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.6 }}>
          Acompanhe suas pendências de conteúdo, financeiro e perfil.
        </p>
      </div>

      {sessao?.estadoConta === "PENDING" && (
        <p style={{ fontSize: 14, color: "var(--color-cherry)" }}>
          Seu acesso foi solicitado e está aguardando aprovação da equipe.
        </p>
      )}

      {(sessao?.estadoConta === "INACTIVE" || sessao?.estadoConta === "REJECTED") && (
        <p style={{ fontSize: 14, color: "var(--color-cherry)" }}>
          Seu acesso não está disponível no momento. Fale com a equipe Criativo DODÔ.
        </p>
      )}

      {!sessao && (
        <button type="button" className="btn-primary" onClick={login}>
          Entrar com Google
        </button>
      )}
    </main>
  );
}
