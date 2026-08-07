import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as errorReporting from "./errorReporting";

vi.mock("./api", () => {
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

import { apiFetch } from "./api";
import { SessionProvider, useSession } from "./session";

const apiFetchMock = apiFetch as unknown as ReturnType<typeof vi.fn>;

describe("SessionProvider", () => {
	let consoleErroSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleErroSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		apiFetchMock.mockReset();
	});

	afterEach(() => {
		consoleErroSpy.mockRestore();
		vi.restoreAllMocks();
	});

	it("não deixa escapar rejeição não tratada quando /auth/me falha com erro genérico (não-401)", async () => {
		apiFetchMock.mockRejectedValue(new Error("Failed to fetch"));
		const relatarSpy = vi.spyOn(errorReporting, "relatarErroFrontend");

		const { result } = renderHook(() => useSession(), {
			wrapper: SessionProvider,
		});

		await waitFor(() => {
			expect(result.current.carregando).toBe(false);
		});

		expect(result.current.sessao).toBeNull();
		expect(relatarSpy).toHaveBeenCalledWith(
			"sessao-carregar",
			expect.objectContaining({ message: "Failed to fetch" }),
		);
	});

	it("logout não lança quando POST /auth/logout falha, e reporta via relatarErroFrontend", async () => {
		apiFetchMock.mockImplementation((path: string) => {
			if (path === "/auth/logout") {
				return Promise.reject(new Error("Failed to fetch"));
			}
			return Promise.resolve(null);
		});
		const relatarSpy = vi.spyOn(errorReporting, "relatarErroFrontend");

		const { result } = renderHook(() => useSession(), {
			wrapper: SessionProvider,
		});

		await waitFor(() => {
			expect(result.current.carregando).toBe(false);
		});

		await act(async () => {
			await expect(result.current.logout()).resolves.toBeUndefined();
		});

		expect(relatarSpy).toHaveBeenCalledWith(
			"sessao-logout",
			expect.objectContaining({ message: "Failed to fetch" }),
		);
	});
});
