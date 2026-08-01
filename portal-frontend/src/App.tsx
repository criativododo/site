import { Navigate, Route, Routes } from "react-router-dom";
import { PortalLayout } from "./components/PortalLayout";
import { RotaProtegida } from "./components/RotaProtegida";
import { useSession } from "./lib/session";
import { AdminPage } from "./pages/Admin";
import { AdminBriefingsPage } from "./pages/AdminBriefings";
import { AdminColaboracoesMensaisPage } from "./pages/AdminColaboracoesMensais";
import { AdminDashboardPage } from "./pages/AdminDashboard";
import { AdminEntregasPage } from "./pages/AdminEntregas";
import { AdminObrigacoesPage } from "./pages/AdminObrigacoes";
import { AdminParceirasPage } from "./pages/AdminParceiras";
import { CadastroPage } from "./pages/Cadastro";
import { ConvitePage } from "./pages/Convite";
import { FinanceiroPage } from "./pages/Financeiro";
import { LoginPage } from "./pages/Login";
import { PendenciasPage } from "./pages/Pendencias";
import { PerfilPage } from "./pages/Perfil";
import { PrivacidadePage } from "./pages/Privacidade";

/**
 * Espelha a regra de destino pós-login do backend (auth.routes.ts: callback do Google) para
 * os casos em que o app carrega direto na raiz ou numa rota não mapeada com sessão já
 * existente — sem isso, todo papel caía em /pendencias (exclusiva de Parceira).
 */
function RedirecionamentoInicial() {
	const { sessao, carregando } = useSession();

	if (carregando) {
		return null;
	}

	if (!sessao || sessao.estadoConta !== "ACTIVE") {
		return <Navigate to="/login" replace />;
	}

	const destino =
		sessao.papelAtor === "ADMINISTRADOR" ? "/admin/dashboard" : "/pendencias";
	return <Navigate to={destino} replace />;
}

function App() {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route path="/cadastro" element={<CadastroPage />} />
			<Route path="/convite/:token" element={<ConvitePage />} />
			<Route path="/privacidade" element={<PrivacidadePage />} />

			<Route
				element={
					<RotaProtegida>
						<PortalLayout />
					</RotaProtegida>
				}
			>
				<Route path="/pendencias" element={<PendenciasPage />} />
				<Route path="/financeiro" element={<FinanceiroPage />} />
				<Route path="/perfil" element={<PerfilPage />} />
				<Route path="/admin/dashboard" element={<AdminDashboardPage />} />
				<Route path="/admin/parceiras" element={<AdminParceirasPage />} />
				<Route path="/admin/entregas" element={<AdminEntregasPage />} />
				<Route path="/admin/briefings" element={<AdminBriefingsPage />} />
				<Route path="/admin/financeiro" element={<AdminObrigacoesPage />} />
				<Route
					path="/admin/colaboracoes-mensais"
					element={<AdminColaboracoesMensaisPage />}
				/>
				<Route path="/admin" element={<AdminPage />} />
			</Route>

			<Route path="/" element={<RedirecionamentoInicial />} />
			<Route path="*" element={<RedirecionamentoInicial />} />
		</Routes>
	);
}

export default App;
