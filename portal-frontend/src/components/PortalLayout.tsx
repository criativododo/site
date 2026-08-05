import { Link, NavLink, Outlet } from "react-router-dom";
import logoPrincipal from "../assets/brand/principal-cherry.svg";
import { PageHeaderProvider, usePageHeaderSlots } from "../lib/pageHeader";
import { useSession } from "../lib/session";

const navItems = [
	{ to: "/pendencias", label: "pendências" },
	{ to: "/financeiro", label: "financeiro" },
	{ to: "/perfil", label: "perfil" },
];

/**
 * Navegação do admin em 2 grupos — trabalho do dia (o que se checa/faz todo dia) separado de
 * administração (cadastro e ciclo financeiro, de uso menos frequente). Divisão por espaço
 * puro na sidebar, ver .portal-nav-group em index.css.
 */
const gruposNavAdmin = [
	[
		{ to: "/admin/campanha", label: "mesa da campanha" },
		{ to: "/admin/dashboard", label: "dashboard" },
		{ to: "/admin/entregas", label: "entregas" },
		{ to: "/admin/briefings", label: "briefings" },
	],
	[
		{ to: "/admin/parceiras", label: "parceiras" },
		{ to: "/admin/financeiro", label: "obrigações" },
		{ to: "/admin/colaboracoes-mensais", label: "colaboração mensal" },
		{ to: "/admin", label: "moderação" },
	],
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
	// Administrador da Marca (ADR-022) não usa este shell — página autônoma própria, ver
	// App.tsx — então nunca chega a renderizar `PortalLayout`.
	const gruposNav = sessao?.papelAtor === "ADMINISTRADOR" ? gruposNavAdmin : [navItems];
	// ADR-023: Mesa da Campanha é a porta de entrada do Administrador — o logo volta para lá,
	// não mais para o Dashboard Administrativo (que continua existindo, ver "dashboard" acima).
	const destinoLogo = sessao?.papelAtor === "ADMINISTRADOR" ? "/admin/campanha" : "/pendencias";

	return (
		<div className="portal-shell">
			<aside className="portal-sidebar">
				<div className="portal-sidebar-top">
					<Link to={destinoLogo} className="portal-logo-link">
						<img
							className="portal-logo"
							src={logoPrincipal}
							alt="Criativo Dodô"
						/>
					</Link>

					<nav className="portal-sidebar-nav" aria-label="Navegação principal">
						{gruposNav.map((grupo) => (
							<div className="portal-nav-group" key={grupo[0].to}>
								{grupo.map((item) => (
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
							</div>
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
