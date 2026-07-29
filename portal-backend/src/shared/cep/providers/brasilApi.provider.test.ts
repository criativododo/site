import { afterEach, describe, expect, it, vi } from "vitest";
import { BrasilApiProvider } from "./brasilApi.provider.js";

function respostaFake(ok: boolean, corpo: unknown = {}) {
  return { ok, json: async () => corpo } as Response;
}

describe("BrasilApiProvider", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("mapeia uma resposta válida para o modelo canônico", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        respostaFake(true, {
          street: "Avenida Paulista",
          neighborhood: "Bela Vista",
          city: "São Paulo",
          state: "SP",
        }),
      ),
    );

    const resultado = await new BrasilApiProvider().buscar("01310100");

    expect(resultado).toEqual({
      logradouro: "Avenida Paulista",
      bairro: "Bela Vista",
      cidade: "São Paulo",
      uf: "SP",
    });
  });

  it("retorna null em HTTP 404 (CEP não encontrado)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respostaFake(false)));

    const resultado = await new BrasilApiProvider().buscar("00000000");
    expect(resultado).toBeNull();
  });

  it("propaga a falha quando o fetch rejeita — CepResolver decide o fallback, não o provider", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    await expect(new BrasilApiProvider().buscar("01310100")).rejects.toThrow();
  });

  it("aborta e propaga falha após o timeout individual", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(
        (_url: string, init?: { signal?: AbortSignal }) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () => reject(new DOMException("timeout", "AbortError")));
          }),
      ),
    );

    const provider = new BrasilApiProvider(10);
    await expect(provider.buscar("01310100")).rejects.toThrow();
  });
});
