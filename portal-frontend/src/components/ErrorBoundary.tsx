import { AlertTriangle } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { relatarErroFrontend } from "../lib/errorReporting";
import { Button } from "./ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "./ui/empty";

interface ErrorBoundaryProps {
	children: ReactNode;
}

interface ErrorBoundaryState {
	temErro: boolean;
}

/**
 * Rede de segurança global (sprint 2 de observabilidade) — sem isso, um erro de render em
 * qualquer tela vira tela branca silenciosa: o React desmonta a árvore inteira quando nenhum
 * Error Boundary intercepta a falha. Envolve `<App />` inteiro em `main.tsx` (um único ponto,
 * cobre todas as rotas), sem alterar UX de nenhuma tela além desta própria tela de fallback.
 */
export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	state: ErrorBoundaryState = { temErro: false };

	static getDerivedStateFromError(): ErrorBoundaryState {
		return { temErro: true };
	}

	componentDidCatch(erro: Error, info: ErrorInfo): void {
		relatarErroFrontend("react-render", erro, {
			componentStack: info.componentStack?.trim().split("\n")[0],
		});
	}

	render(): ReactNode {
		if (!this.state.temErro) {
			return this.props.children;
		}

		return (
			<div className="flex min-h-screen w-full items-center justify-center p-6">
				<Empty className="max-w-sm">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<AlertTriangle />
						</EmptyMedia>
						<EmptyTitle>Algo deu errado</EmptyTitle>
						<EmptyDescription>
							Ocorreu um erro inesperado nesta tela. Recarregue a página para
							continuar.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button onClick={() => window.location.reload()}>
							Recarregar página
						</Button>
					</EmptyContent>
				</Empty>
			</div>
		);
	}
}
