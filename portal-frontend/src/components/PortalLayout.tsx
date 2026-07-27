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
    <div className="portal-shell">
      <header className="portal-header">
        <div className="portal-header-content container">
          <img className="portal-logo" src={logoPrincipal} alt="Criativo DODÔ" />

          <nav className="portal-nav" aria-label="Navegação principal">
          {itensNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `portal-nav-link${isActive ? " is-active" : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
          </nav>

          <div className="portal-account">
            <span className="portal-account-name">{sessao?.nome}</span>
            <button type="button" className="btn-primary" onClick={() => void logout()}>
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="portal-content container">
        <Outlet />
      </main>
    </div>
  );
}
