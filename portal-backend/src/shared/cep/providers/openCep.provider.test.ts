import { afterEach, describe, expect, it, vi } from "vitest";
import { OpenCepProvider } from "./openCep.provider.js";

function respostaFake(ok: boolean, corpo: unknown = {}) {
  return { ok, json: async () => corpo } as Response;
}

describe("OpenCepProvider", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("mapeia uma resposta válida para o modelo canônico", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        respostaFake(true, {
          logradouro: "Avenida Paulista",
          bairro: "Bela Vista",
          localidade: "São Paulo",
          uf: "SP",
        }),
      ),
    );

    const resultado = await new OpenCepProvider().buscar("01310100");

    expect(resultado).toEqual({
      logradouro: "Avenida Paulista",
      bairro: "Bela Vista",
      cidade: "São Paulo",
      uf: "SP",
    });
  });

  it("retorna null em HTTP 404 (CEP não encontrado)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respostaFake(false)));
    const resultado = await new OpenCepProvider().buscar("00000000");
    expect(resultado).toBeNull();
  });

  it("propaga a falha quando o fetch rejeita", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    await expect(new OpenCepProvider().buscar("01310100")).rejects.toThrow();
  });
});
