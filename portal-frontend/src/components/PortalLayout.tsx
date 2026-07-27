import { NavLink, Outlet } from "react-router-dom";
import { useSession } from "../lib/session";
import logoPrincipal from "../assets/brand/principal.svg";

const navItems = [
  { to: "/pendencias", label: "Pendências" },
  { to: "/financeiro", label: "Financeiro" },
  { to: "/perfil", label: "Perfil" },
];

export function PortalLayout() {
  const { sessao, logout } = useSession();
  const itensNav = sessao?.papelAtor === "ADMINISTRADOR" ? [...navItems, { to: "/admin", label: "Moderação" }] : navItems;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "24px 40px",
          borderBottom: "1px solid rgba(27, 23, 23, 0.1)",
        }}
      >
        <img src={logoPrincipal} alt="Criativo DODÔ" style={{ width: 96 }} />

        <nav style={{ display: "flex", gap: 24 }}>
          {itensNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="nav-link"
              style={({ isActive }) => ({
                fontWeight: isActive ? 700 : 600,
                color: "var(--color-cherry)",
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 14 }}>{sessao?.nome}</span>
          <button type="button" className="btn-primary" onClick={() => void logout()}>
            Sair
          </button>
        </div>
      </header>

      <main className="container" style={{ flex: 1, padding: "60px 40px" }}>
        <Outlet />
      </main>
    </div>
  );
}
