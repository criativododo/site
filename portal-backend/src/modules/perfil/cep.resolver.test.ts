import { describe, expect, it } from "vitest";
import { ResolvedorDeCepEmMemoria } from "./cep.resolver.js";

describe("ResolvedorDeCepEmMemoria", () => {
  it("resolve um CEP conhecido", async () => {
    const resolvido = await new ResolvedorDeCepEmMemoria().resolver("01310-100");
    expect(resolvido).toEqual({
      rua: "Avenida Paulista",
      bairro: "Bela Vista",
      cidade: "São Paulo",
      uf: "SP",
    });
  });

  it("retorna null (nunca lança) para CEP desconhecido — RN-02 degradável", async () => {
    const resolvido = await new ResolvedorDeCepEmMemoria().resolver("00000-000");
    expect(resolvido).toBeNull();
  });
});
