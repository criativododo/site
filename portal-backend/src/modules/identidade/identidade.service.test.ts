import { describe, expect, it } from "vitest";
import { identidadeRepositorio } from "./identidade.repository.js";
import { aprovarConta, listarContasPendentes, rejeitarConta } from "./identidade.service.js";
import type { Identidade } from "./identidade.types.js";

function identidade(overrides: Partial<Identidade> = {}): Identidade {
  return {
    subProvider: "sub-teste",
    emailPerfil: "teste@dodo.dev",
    nomeCompleto: "Teste",
    papelAtor: "INFLUENCIADORA",
    estadoConta: "PENDING",
    origemAcesso: "PADRAO",
    parceiraId: null,
    dataCriacao: new Date().toISOString(),
    ultimoAcesso: new Date().toISOString(),
    ...overrides,
  };
}

describe("moderação administrativa (Feature 5.3, RN-04)", () => {
  it("listarContasPendentes só retorna contas PENDING", async () => {
    await identidadeRepositorio.salvar(identidade({ subProvider: "sub-pendente-1", estadoConta: "PENDING" }));
    await identidadeRepositorio.salvar(identidade({ subProvider: "sub-ativa-1", estadoConta: "ACTIVE" }));

    const pendentes = await listarContasPendentes();
    const subs = pendentes.map((item) => item.subProvider);

    expect(subs).toContain("sub-pendente-1");
    expect(subs).not.toContain("sub-ativa-1");
  });

  it("aprovarConta transiciona PENDING → ACTIVE", async () => {
    await identidadeRepositorio.salvar(identidade({ subProvider: "sub-aprovar", estadoConta: "PENDING" }));

    const resultado = await aprovarConta("sub-aprovar");

    expect(resultado).toEqual({ ok: true, identidade: expect.objectContaining({ estadoConta: "ACTIVE" }) });
  });

  it("rejeitarConta transiciona PENDING → REJECTED", async () => {
    await identidadeRepositorio.salvar(identidade({ subProvider: "sub-rejeitar", estadoConta: "PENDING" }));

    const resultado = await rejeitarConta("sub-rejeitar");

    expect(resultado).toEqual({ ok: true, identidade: expect.objectContaining({ estadoConta: "REJECTED" }) });
  });

  it("recusa aprovar conta que não está PENDING, sem alterá-la", async () => {
    await identidadeRepositorio.salvar(identidade({ subProvider: "sub-ja-ativa", estadoConta: "ACTIVE" }));

    const resultado = await aprovarConta("sub-ja-ativa");

    expect(resultado).toEqual({ ok: false, motivo: "NAO_PENDENTE" });
    expect((await identidadeRepositorio.buscarPorSub("sub-ja-ativa"))?.estadoConta).toBe("ACTIVE");
  });

  it("retorna NAO_ENCONTRADA para subProvider inexistente", async () => {
    const resultado = await aprovarConta("sub-nao-existe");
    expect(resultado).toEqual({ ok: false, motivo: "NAO_ENCONTRADA" });
  });
});
