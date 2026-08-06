import { Navigate, Route, Routes } from "react-router-dom";
import { PortalLayout } from "./components/PortalLayout";
import { RotaProtegida } from "./components/RotaProtegida";
import { useSession } from "./lib/session";
import { AdminCampanhaPage } from "./pages/AdminCampanha";
import { AdminPage } from "./pages/Admin";
import { AdminBriefingsPage } from "./pages/AdminBriefings";
import { AdminColaboracoesMensaisPage } from "./pages/AdminColaboracoesMensais";
import { AdminComunicacaoPage } from "./pages/AdminComunicacao";
import { AdminDashboardPage } from "./pages/AdminDashboard";
import { AdminEntregasPage } from "./pages/AdminEntregas";
import { AdminObrigacoesPage } from "./pages/AdminObrigacoes";
import { AdminParceirasPage } from "./pages/AdminParceiras";
import { CadastroPage } from "./pages/Cadastro";
import { CentralInfluenciadoraPage } from "./pages/CentralInfluenciadora";
import { ConvitePage } from "./pages/Convite";
import { FinanceiroPage } from "./pages/Financeiro";
import { LoginPage } from "./pages/Login";
import { MarcaDashboardPage } from "./pages/MarcaDashboard";
import { PendenciasPage } from "./pages/Pendencias";
import { PerfilPage } from "./pages/Perfil";
import { PrivacidadePage } from "./pages/Privacidade";
import { ExperimentoHojePage } from "./pages/experimentos/Hoje";
import { HojeInfluenciadoraPage } from "./pages/experimentos/HojeInfluenciadora";
import { BriefingCampanhaPage } from "./pages/experimentos/BriefingCampanha";
import { EnvioConteudoPage } from "./pages/experimentos/EnvioConteudo";
import { AprovacaoPage } from "./pages/experimentos/Aprovacao";
import { PublicacaoPage } from "./pages/experimentos/Publicacao";
import { FinanceiroInfluenciadoraPage } from "./pages/experimentos/FinanceiroInfluenciadora";
import { PerfilInfluenciadoraPage } from "./pages/experimentos/PerfilInfluenciadora";
import { RelatorioCampanhaPage } from "./pages/experimentos/RelatorioCampanha";
import { CalendarioEditorialPage } from "./pages/experimentos/CalendarioEditorial";
import { LogisticaCampanhaPage } from "./pages/experimentos/LogisticaCampanha";
import { LogisticaEnvioDetalhePage } from "./pages/experimentos/LogisticaEnvioDetalhe";

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

	// ADR-023: Mesa da Campanha é o destino pós-login do Administrador (não mais /admin/dashboard).
	const destino =
		sessao.papelAtor === "ADMINISTRADOR"
			? "/admin/campanha"
			: sessao.papelAtor === "ADMINISTRADOR_MARCA"
				? "/marca/dashboard"
				: "/pendencias";
	return <Navigate to={destino} replace />;
}

function App() {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route path="/cadastro" element={<CadastroPage />} />
			<Route path="/convite/:token" element={<ConvitePage />} />
			<Route path="/privacidade" element={<PrivacidadePage />} />

			{/*
			 * Experimento isolado (Concept Book / Design Brief) — deliberadamente fora do
			 * PortalLayout: a tela-bandeira testa um shell próprio, sem sidebar fixa. Rota
			 * aditiva, não substitui /admin/dashboard; remover esta linha + a pasta
			 * pages/experimentos descarta o experimento sem tocar em mais nada.
			 */}
			<Route
				path="/admin/hoje"
				element={
					<RotaProtegida>
						<ExperimentoHojePage />
					</RotaProtegida>
				}
			/>

			{/*
			 * Proposta de Dashboard da Influenciadora (sessão de aprovação visual) — mesmo
			 * padrão de tela-bandeira de /admin/hoje, aditiva, não substitui /pendencias como
			 * destino pós-login. Rota some se a proposta não for aprovada.
			 */}
			<Route
				path="/hoje"
				element={
					<RotaProtegida>
						<HojeInfluenciadoraPage />
					</RotaProtegida>
				}
			/>

			{/*
			 * Proposta de Briefing da Campanha (sessão de aprovação visual) — terceira tela da
			 * família, mesmo padrão aditivo das duas anteriores. Rota some se a proposta não
			 * for aprovada.
			 */}
			<Route
				path="/campanha"
				element={
					<RotaProtegida>
						<BriefingCampanhaPage />
					</RotaProtegida>
				}
			/>

			{/*
			 * Proposta de Envio de Conteúdo (sessão de aprovação visual) — quarta tela da
			 * família, mesmo padrão aditivo das três anteriores. Rota some se a proposta não
			 * for aprovada.
			 */}
			<Route
				path="/envio"
				element={
					<RotaProtegida>
						<EnvioConteudoPage />
					</RotaProtegida>
				}
			/>

			{/*
			 * Proposta de Aprovação (sessão de aprovação visual) — quinta tela da família, mesmo
			 * padrão aditivo das quatro anteriores. Rota some se a proposta não for aprovada.
			 */}
			<Route
				path="/aprovacao"
				element={
					<RotaProtegida>
						<AprovacaoPage />
					</RotaProtegida>
				}
			/>

			{/*
			 * Proposta de Publicação (sessão de aprovação visual) — sexta tela da família, mesmo
			 * padrão aditivo das cinco anteriores. Rota some se a proposta não for aprovada.
			 */}
			<Route
				path="/publicacao"
				element={
					<RotaProtegida>
						<PublicacaoPage />
					</RotaProtegida>
				}
			/>

			{/*
			 * Proposta de Financeiro/"reconhecimento" (sessão de aprovação editorial) — sétima tela
			 * da família, mesmo padrão aditivo das seis anteriores. Rota própria (`/reconhecimento`,
			 * não `/financeiro`) porque `/financeiro` já é servida por pages/Financeiro.tsx dentro
			 * do PortalLayout — reconciliação das duas fica para decisão futura, fora do escopo
			 * desta tarefa. Rota some se a proposta não for aprovada.
			 */}
			<Route
				path="/reconhecimento"
				element={
					<RotaProtegida>
						<FinanceiroInfluenciadoraPage />
					</RotaProtegida>
				}
			/>

			{/*
			 * Proposta de Perfil/"identidade" (sessão de aprovação editorial) — oitava tela da
			 * família, mesmo padrão aditivo das sete anteriores. Rota própria (`/identidade`, não
			 * `/perfil`) porque `/perfil` já é servida por pages/Perfil.tsx (formulário
			 * operacional de PIX/endereço) — mesmo padrão de desambiguação já usado para
			 * `/reconhecimento` vs. `/financeiro` legado. Rota some se a proposta não for
			 * aprovada.
			 */}
			<Route
				path="/identidade"
				element={
					<RotaProtegida>
						<PerfilInfluenciadoraPage />
					</RotaProtegida>
				}
			/>

			{/*
			 * Painel da Marca (ADR-022) — pertence, visualmente, à família de páginas autônomas
			 * acima (Publicação/Envio/Identidade), não ao shell administrativo do
			 * PortalLayout: nav própria, fotografia editorial, sem sidebar. Diferente das
			 * "propostas" acima, esta rota já é RBAC-real (`ADMINISTRADOR_MARCA`, ADR-022), não
			 * some se não aprovada — só sua direção visual passou por revisão nesta sessão.
			 */}
			<Route
				path="/marca/dashboard"
				element={
					<RotaProtegida>
						<MarcaDashboardPage />
					</RotaProtegida>
				}
			/>

			{/*
			 * Mesa da Campanha (ADR-023) — hub pós-login do Administrador, mesma família visual
			 * autônoma acima. Substitui /admin/dashboard como porta de entrada; a Dashboard
			 * Administrativa permanece intacta e acessível a partir daqui e do menu.
			 */}
			<Route
				path="/admin/campanha"
				element={
					<RotaProtegida>
						<AdminCampanhaPage />
					</RotaProtegida>
				}
			/>

			{/*
			 * Central de Influenciadoras (Sprint 2) — ficha completa de uma Parceira, mesma família
			 * visual autônoma de /marca/dashboard e /admin/campanha acima. /admin/parceiras (dentro
			 * do PortalLayout, abaixo) continua sendo a lista/índice administrativo; esta rota é o
			 * destino ao abrir uma Parceira específica a partir de lá.
			 */}
			<Route
				path="/admin/parceiras/:id"
				element={
					<RotaProtegida>
						<CentralInfluenciadoraPage />
					</RotaProtegida>
				}
			/>

			{/*
			 * Comunicação (Sprint 2) — mesma família visual autônoma acima (revisão editorial,
			 * auditoria obrigatória desta sessão: antes vivia dentro do PortalLayout com o
			 * vocabulário genérico de `.portal-page`, não pertencia à família). O menu do
			 * PortalLayout continua linkando para `/admin/comunicacao` normalmente — mesmo padrão
			 * de /admin/campanha e /admin/parceiras/:id, que também são linkados a partir da
			 * sidebar mas vivem fora do shell.
			 */}
			<Route
				path="/admin/comunicacao"
				element={
					<RotaProtegida>
						<AdminComunicacaoPage />
					</RotaProtegida>
				}
			/>

			{/*
			 * Proposta de Relatório (DOC SPRINT #2, item 3) — nona tela da família, mesmo padrão
			 * aditivo das oito anteriores. Rota própria (`/relatorio`, sem colisão com nenhuma rota
			 * legada). Modelo real de acesso da Marca (link exclusivo, sem login) é decisão de
			 * arquitetura/backend fora do escopo desta sessão de layout — ver comentário no topo de
			 * `RelatorioCampanha.tsx`. Rota some se a proposta não for aprovada.
			 */}
			<Route
				path="/relatorio"
				element={
					<RotaProtegida>
						<RelatorioCampanhaPage />
					</RotaProtegida>
				}
			/>

			{/*
			 * Proposta de Calendário Editorial (DOC SPRINT #2, item 8) — décima tela da família,
			 * mesmo padrão aditivo das nove anteriores. Rota própria (`/admin/calendario`, sem
			 * colisão com nenhuma rota legada). Gate de acesso duplo (Administrador e
			 * Administrador da Marca), mesmo padrão de /relatorio e /marca/dashboard. Rota some
			 * se a proposta não for aprovada.
			 */}
			<Route
				path="/admin/calendario"
				element={
					<RotaProtegida>
						<CalendarioEditorialPage />
					</RotaProtegida>
				}
			/>

			{/*
			 * Proposta de Logística (DOC SPRINT #2, item 6) — décima primeira tela da família, mesmo
			 * padrão aditivo das dez anteriores. Rota própria (`/admin/logistica`, sem colisão com
			 * nenhuma rota legada). Gate exclusivo Administrador (visão interna com rastreio e
			 * observações — ver comentário no topo de `LogisticaCampanha.tsx`). Rota some se a
			 * proposta não for aprovada.
			 */}
			<Route
				path="/admin/logistica"
				element={
					<RotaProtegida>
						<LogisticaCampanhaPage />
					</RotaProtegida>
				}
			/>

			{/*
			 * Detalhe do envio de Logística (redesenho operacional de 2026-08-06) — mesmo padrão de
			 * rota de `/admin/parceiras/:id`: a lista fica enxuta, o detalhe concentra timeline
			 * completa, rastreamento, observações, comprovante e ações.
			 */}
			<Route
				path="/admin/logistica/:id"
				element={
					<RotaProtegida>
						<LogisticaEnvioDetalhePage />
					</RotaProtegida>
				}
			/>

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
