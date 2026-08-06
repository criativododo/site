import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	instalarCapturaGlobalDeErros,
	relatarErroFrontend,
} from "./errorReporting";

describe("relatarErroFrontend", () => {
	let consoleErroSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleErroSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		consoleErroSpy.mockRestore();
	});

	it("loga a tag [erro-nao-tratado] com contexto e mensagem", () => {
		relatarErroFrontend("react-render", new Error("tela quebrou"));

		const [primeiraLinha] = consoleErroSpy.mock.calls[0] as [string];
		expect(primeiraLinha).toContain("[erro-nao-tratado]");
		expect(primeiraLinha).toContain("contexto=react-render");
		expect(primeiraLinha).toContain('mensagem="tela quebrou"');
	});

	it("normaliza valores não-Error (string, objeto) para uma mensagem", () => {
		relatarErroFrontend("unhandled-rejection", "motivo em string");

		const [primeiraLinha] = consoleErroSpy.mock.calls[0] as [string];
		expect(primeiraLinha).toContain('mensagem="motivo em string"');
	});

	it("inclui campos extras no formato campo=valor", () => {
		relatarErroFrontend("react-render", new Error("x"), {
			componentStack: "em <PerfilPage>",
		});

		const [primeiraLinha] = consoleErroSpy.mock.calls[0] as [string];
		expect(primeiraLinha).toContain("componentStack=em <PerfilPage>");
	});

	it("omite campos extras com valor undefined", () => {
		relatarErroFrontend("window-onerror", new Error("x"), {
			arquivo: undefined,
			linha: 42,
		});

		const [primeiraLinha] = consoleErroSpy.mock.calls[0] as [string];
		expect(primeiraLinha).not.toContain("arquivo=");
		expect(primeiraLinha).toContain("linha=42");
	});

	it("loga o stack em uma segunda chamada quando disponível", () => {
		const erro = new Error("com stack");
		relatarErroFrontend("react-render", erro);

		expect(consoleErroSpy).toHaveBeenCalledTimes(2);
		expect(consoleErroSpy.mock.calls[1][0]).toBe(erro.stack);
	});
});

describe("instalarCapturaGlobalDeErros", () => {
	let consoleErroSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleErroSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		consoleErroSpy.mockRestore();
	});

	it("reporta erros despachados via window 'error'", () => {
		instalarCapturaGlobalDeErros();

		window.dispatchEvent(
			new ErrorEvent("error", {
				error: new Error("erro solto na window"),
				filename: "app.js",
				lineno: 7,
			}),
		);

		const chamada = consoleErroSpy.mock.calls.find(([linha]: [unknown]) =>
			String(linha).includes("contexto=window-onerror"),
		);
		expect(chamada).toBeDefined();
		expect(String(chamada?.[0])).toContain('mensagem="erro solto na window"');
		expect(String(chamada?.[0])).toContain("arquivo=app.js");
		expect(String(chamada?.[0])).toContain("linha=7");
	});

	it("reporta rejeições despachadas via window 'unhandledrejection'", () => {
		instalarCapturaGlobalDeErros();

		const evento = new Event("unhandledrejection") as Event & {
			reason: unknown;
		};
		evento.reason = new Error("promise rejeitada");
		window.dispatchEvent(evento);

		const chamada = consoleErroSpy.mock.calls.find(([linha]: [unknown]) =>
			String(linha).includes("contexto=unhandled-rejection"),
		);
		expect(chamada).toBeDefined();
		expect(String(chamada?.[0])).toContain('mensagem="promise rejeitada"');
	});

	it("é idempotente — chamar duas vezes não duplica o listener", () => {
		instalarCapturaGlobalDeErros();
		instalarCapturaGlobalDeErros();

		window.dispatchEvent(
			new ErrorEvent("error", { error: new Error("único") }),
		);

		const chamadas = consoleErroSpy.mock.calls.filter(([linha]: [unknown]) =>
			String(linha).includes("contexto=window-onerror"),
		);
		expect(chamadas).toHaveLength(1);
	});
});
