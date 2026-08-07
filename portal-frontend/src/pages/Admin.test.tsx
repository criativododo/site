import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as errorReporting from "../lib/errorReporting";

vi.mock("../lib/api", () => {
	class ApiError extends Error {
		status: number;

		constructor(status: number, message: string) {
			super(message);
			this.status = status;
		}
	}

	return {
		ApiError,
		apiFetch: vi.fn(),
	};
});

import { ApiError, apiFetch } from "../lib/api";
import { GerarConvite } from "./Admin";

const apiFetchMock = apiFetch as unknown as ReturnType<typeof vi.fn>;

describe("GerarConvite", () => {
	let consoleErroSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleErroSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		apiFetchMock.mockReset();
	});

	afterEach(() => {
		cleanup();
		consoleErroSpy.mockRestore();
		vi.restoreAllMocks();
	});

	it("mostra mensagem de erro visível quando GET /api/admin/convites falha, e reporta via relatarErroFrontend", async () => {
		apiFetchMock.mockRejectedValue(new ApiError(500, "erro interno do servidor."));
		const relatarSpy = vi.spyOn(errorReporting, "relatarErroFrontend");

		render(<GerarConvite />);

		expect(
			await screen.findByText("erro interno do servidor."),
		).toBeTruthy();
		expect(relatarSpy).toHaveBeenCalledWith(
			"admin-convites-carregar",
			expect.objectContaining({ message: "erro interno do servidor." }),
		);
	});

	it("usa mensagem de fallback quando a falha não é um ApiError", async () => {
		apiFetchMock.mockRejectedValue(new Error("Failed to fetch"));

		render(<GerarConvite />);

		expect(
			await screen.findByText("não foi possível carregar os links de convite."),
		).toBeTruthy();
		await waitFor(() => {
			expect(consoleErroSpy).toHaveBeenCalled();
		});
	});
});
