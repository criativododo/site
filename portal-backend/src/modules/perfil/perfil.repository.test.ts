import { describe, expect, it } from "vitest";
import { PerfilRepositorioEmMemoria } from "./perfil.repository.js";
import type { PerfilParceira } from "./perfil.types.js";

function perfil(overrides: Partial<PerfilParceira> = {}): PerfilParceira {
  return {
    parceiraId: "parceira-1",
    pix: "000.000.000-00",
    email: "parceira@dodo.dev",
    endereco: null,
    ...overrides,
  };
}

describe("PerfilRepositorioEmMemoria (RN-03, isolamento)", () => {
  it("busca o perfil pela Parceira, ignorando outras", async () => {
    const repo = new PerfilRepositorioEmMemoria([
      perfil({ parceiraId: "parceira-1", email: "minha@dodo.dev" }),
      perfil({ parceiraId: "parceira-2", email: "de-outra@dodo.dev" }),
    ]);

    const encontrado = await repo.buscarPorParceira("parceira-1");
    expect(encontrado?.email).toBe("minha@dodo.dev");
  });

  it("retorna null quando a Parceira não tem perfil", async () => {
    const repo = new PerfilRepositorioEmMemoria([]);
    expect(await repo.buscarPorParceira("parceira-1")).toBeNull();
  });

  it("atualizar substitui o perfil existente pela mesma Parceira", async () => {
    const repo = new PerfilRepositorioEmMemoria([perfil({ email: "antigo@dodo.dev" })]);
    await repo.atualizar(perfil({ email: "novo@dodo.dev" }));

    const encontrado = await repo.buscarPorParceira("parceira-1");
    expect(encontrado?.email).toBe("novo@dodo.dev");
  });
});
