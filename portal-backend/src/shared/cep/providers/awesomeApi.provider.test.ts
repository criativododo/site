import { afterEach, describe, expect, it, vi } from "vitest";
import { AwesomeApiProvider } from "./awesomeApi.provider.js";

function respostaFake(ok: boolean, corpo: unknown = {}) {
  return { ok, json: async () => corpo } as Response;
}

describe("AwesomeApiProvider", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("mapeia uma resposta válida (nomenclatura própria: address/district/state) para o modelo canônico", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        respostaFake(true, {
          address: "Avenida Paulista",
          district: "Bela Vista",
          city: "São Paulo",
          state: "SP",
        }),
      ),
    );

    const resultado = await new AwesomeApiProvider().buscar("01310100");

    expect(resultado).toEqual({
      logradouro: "Avenida Paulista",
      bairro: "Bela Vista",
      cidade: "São Paulo",
      uf: "SP",
    });
  });

  it("retorna null em HTTP 400 (CEP inválido/não encontrado)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respostaFake(false, { status: 400 })));
    const resultado = await new AwesomeApiProvider().buscar("00000000");
    expect(resultado).toBeNull();
  });

  it("propaga a falha quando o fetch rejeita", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    await expect(new AwesomeApiProvider().buscar("01310100")).rejects.toThrow();
  });
});
