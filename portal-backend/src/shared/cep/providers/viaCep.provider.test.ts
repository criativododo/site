import { afterEach, describe, expect, it, vi } from "vitest";
import { ViaCepProvider } from "./viaCep.provider.js";

function respostaFake(ok: boolean, corpo: unknown = {}) {
  return { ok, json: async () => corpo } as Response;
}

describe("ViaCepProvider", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("mapeia uma resposta válida para o modelo canônico", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        respostaFake(true, {
          logradouro: "Avenida Rio Branco",
          bairro: "Centro",
          localidade: "Rio de Janeiro",
          uf: "RJ",
        }),
      ),
    );

    const resultado = await new ViaCepProvider().buscar("20040020");

    expect(resultado).toEqual({
      logradouro: "Avenida Rio Branco",
      bairro: "Centro",
      cidade: "Rio de Janeiro",
      uf: "RJ",
    });
  });

  it("retorna null quando a API responde 200 com { erro: true } (peculiaridade do ViaCEP)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respostaFake(true, { erro: true })));

    const resultado = await new ViaCepProvider().buscar("00000000");
    expect(resultado).toBeNull();
  });

  it("propaga a falha quando o fetch rejeita", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    await expect(new ViaCepProvider().buscar("20040020")).rejects.toThrow();
  });
});
