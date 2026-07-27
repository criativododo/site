import { Navigate, Route, Routes } from "react-router-dom";
import { PortalLayout } from "./components/PortalLayout";
import { RotaProtegida } from "./components/RotaProtegida";
import { AdminPage } from "./pages/Admin";
import { AdminBriefingsPage } from "./pages/AdminBriefings";
import { AdminDashboardPage } from "./pages/AdminDashboard";
import { AdminEntregasPage } from "./pages/AdminEntregas";
import { AdminParceirasPage } from "./pages/AdminParceiras";
import { FinanceiroPage } from "./pages/Financeiro";
import { LoginPage } from "./pages/Login";
import { PendenciasPage } from "./pages/Pendencias";
import { PerfilPage } from "./pages/Perfil";

function App() {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />

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
				<Route path="/admin" element={<AdminPage />} />
			</Route>

			<Route path="/" element={<Navigate to="/pendencias" replace />} />
			<Route path="*" element={<Navigate to="/pendencias" replace />} />
		</Routes>
	);
}

export default App;
