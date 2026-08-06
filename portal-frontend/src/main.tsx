import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { instalarCapturaGlobalDeErros } from "./lib/errorReporting";
import { SessionProvider } from "./lib/session";

instalarCapturaGlobalDeErros();

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ErrorBoundary>
			<BrowserRouter>
				<SessionProvider>
					<App />
				</SessionProvider>
			</BrowserRouter>
		</ErrorBoundary>
	</StrictMode>,
);
