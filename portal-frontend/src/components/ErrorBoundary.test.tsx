import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as errorReporting from "../lib/errorReporting";
import { ErrorBoundary } from "./ErrorBoundary";

function TelaQueQuebra(): never {
	throw new Error("falha de render simulada");
}

describe("ErrorBoundary", () => {
	let consoleErroSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		// React também loga o erro capturado via console.error (comportamento nativo, não é o
		// nosso relatarErroFrontend) — silenciado aqui só para manter a saída do teste limpa.
		consoleErroSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		cleanup();
		consoleErroSpy.mockRestore();
		vi.restoreAllMocks();
	});

	it("renderiza os filhos normalmente quando não há erro", () => {
		render(
			<ErrorBoundary>
				<div>conteúdo normal</div>
			</ErrorBoundary>,
		);

		expect(screen.getByText("conteúdo normal")).toBeTruthy();
	});

	it("mostra o fallback em vez de tela branca quando um filho lança na renderização", () => {
		render(
			<ErrorBoundary>
				<TelaQueQuebra />
			</ErrorBoundary>,
		);

		expect(screen.getByText("Algo deu errado")).toBeTruthy();
	});

	it("reporta o erro via relatarErroFrontend com o contexto react-render", () => {
		const relatarSpy = vi.spyOn(errorReporting, "relatarErroFrontend");

		render(
			<ErrorBoundary>
				<TelaQueQuebra />
			</ErrorBoundary>,
		);

		expect(relatarSpy).toHaveBeenCalledWith(
			"react-render",
			expect.objectContaining({ message: "falha de render simulada" }),
			expect.any(Object),
		);
	});

	it("o botão de recarregar chama window.location.reload", () => {
		const reloadSpy = vi.fn();
		Object.defineProperty(window, "location", {
			value: { ...window.location, reload: reloadSpy },
			writable: true,
		});

		render(
			<ErrorBoundary>
				<TelaQueQuebra />
			</ErrorBoundary>,
		);

		screen.getByRole("button", { name: /recarregar/i }).click();

		expect(reloadSpy).toHaveBeenCalledTimes(1);
	});
});
