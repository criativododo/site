import { Link, NavLink, Outlet } from "react-router-dom";
import logoPrincipal from "../assets/brand/principal.svg";
import { PageHeaderProvider, usePageHeaderSlots } from "../lib/pageHeader";
import { useSession } from "../lib/session";

const navItems = [
	{ to: "/pendencias", label: "pendências" },
	{ to: "/financeiro", label: "financeiro" },
	{ to: "/perfil", label: "perfil" },
];

function PortalMain() {
	const { breadcrumb, acoes } = usePageHeaderSlots();
	const temCabecalho = breadcrumb.length > 0 || acoes !== null;

	return (
		<div className="portal-main">
			{temCabecalho && (
				<header className="portal-main-header container">
					<div className="portal-breadcrumb-slot">
						{breadcrumb.length > 0 && (
							<nav
								className="portal-breadcrumb"
								aria-label="Trilha de navegação"
							>
								{breadcrumb.map((item, indice) => (
									<span key={item.to ?? item.label}>
										{item.to ? (
											<Link to={item.to}>{item.label}</Link>
										) : (
											<span>{item.label}</span>
										)}
										{indice < breadcrumb.length - 1 && (
											<span aria-hidden="true"> / </span>
										)}
									</span>
								))}
							</nav>
						)}
					</div>
					{acoes && <div className="portal-context-actions">{acoes}</div>}
				</header>
			)}

			<main className="portal-content container">
				<Outlet />
			</main>
		</div>
	);
}

export function PortalLayout() {
	const { sessao, logout } = useSession();
	// Administrador não possui `parceiraId` de sessão (ADR-008, single-tenant): rotas de
	// self-service da Parceira (`navItems`) sempre falham para este papel (`parceiraDaSessao`
	// lança erro sem `parceiraId` — ver middleware/isolamento.ts), então nunca aparecem aqui.
	const itensNav =
		sessao?.papelAtor === "ADMINISTRADOR"
			? [
					{ to: "/admin/dashboard", label: "dashboard" },
					{ to: "/admin/parceiras", label: "parceiras" },
					{ to: "/admin/entregas", label: "entregas" },
					{ to: "/admin/briefings", label: "briefings" },
					{ to: "/admin/financeiro", label: "obrigações" },
					{ to: "/admin", label: "moderação" },
				]
			: navItems;

	return (
		<div className="portal-shell">
			<aside className="portal-sidebar">
				<div className="portal-sidebar-top">
					<Link to="/pendencias" className="portal-logo-link">
						<img
							className="portal-logo"
							src={logoPrincipal}
							alt="Criativo Dodô"
						/>
					</Link>

					<nav className="portal-sidebar-nav" aria-label="Navegação principal">
						{itensNav.map((item) => (
							<NavLink
								key={item.to}
								to={item.to}
								className={({ isActive }) =>
									`portal-nav-link${isActive ? " is-active" : ""}`
								}
							>
								{item.label}
							</NavLink>
						))}
					</nav>
				</div>

				<div className="portal-sidebar-user">
					<span className="portal-sidebar-user-name">{sessao?.nome}</span>
					<button
						type="button"
						className="btn-primary"
						onClick={() => void logout()}
					>
						sair
					</button>
				</div>
			</aside>

			<PageHeaderProvider>
				<PortalMain />
			</PageHeaderProvider>
		</div>
	);
}
