import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/Login";
import { PendenciasPage } from "./pages/Pendencias";
import { FinanceiroPage } from "./pages/Financeiro";
import { PerfilPage } from "./pages/Perfil";
import { PortalLayout } from "./components/PortalLayout";
import { RotaProtegida } from "./components/RotaProtegida";

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
      </Route>

      <Route path="/" element={<Navigate to="/pendencias" replace />} />
      <Route path="*" element={<Navigate to="/pendencias" replace />} />
    </Routes>
  );
}

export default App;
