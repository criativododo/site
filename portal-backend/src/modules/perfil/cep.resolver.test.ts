import { describe, expect, it } from "vitest";
import { ResolvedorDeCepPortal } from "./cep.resolver.js";

describe("ResolvedorDeCepPortal", () => {
  it("mapeia logradouro (infraestrutura de CEP) para rua (vocabulário deste domínio)", async () => {
    const adaptador = new ResolvedorDeCepPortal({
      resolver: async () => ({
        logradouro: "Avenida Paulista",
        bairro: "Bela Vista",
        cidade: "São Paulo",
        uf: "SP",
      }),
    });

    await expect(adaptador.resolver("01310-100")).resolves.toEqual({
      rua: "Avenida Paulista",
      bairro: "Bela Vista",
      cidade: "São Paulo",
      uf: "SP",
    });
  });

  it("repassa null (RN-02 degradável) sem lançar quando a infraestrutura não resolve", async () => {
    const adaptador = new ResolvedorDeCepPortal({ resolver: async () => null });

    await expect(adaptador.resolver("00000-000")).resolves.toBeNull();
  });
});
