import { afterEach, describe, expect, it } from "vitest";
import { env } from "../../config/env.js";
import { identidadeRepositorio } from "./identidade.repository.js";
import {
  aprovarConta,
  listarContasPendentes,
  rejeitarConta,
  resolverOuCriarIdentidade,
} from "./identidade.service.js";
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

describe("bootstrap de Administrador (ADR-012)", () => {
  afterEach(() => {
    env.adminBootstrapEmails.length = 0;
  });

  it("promove a ADMINISTRADOR ACTIVE uma identidade existente cujo e-mail entrou depois em ADMIN_BOOTSTRAP_EMAILS", async () => {
    await identidadeRepositorio.salvar(
      identidade({
        subProvider: "sub-influenciadora-antiga",
        emailPerfil: "admin@dodo.dev",
        papelAtor: "INFLUENCIADORA",
        estadoConta: "PENDING",
      }),
    );
    env.adminBootstrapEmails.push("admin@dodo.dev");

    const resolvida = await resolverOuCriarIdentidade({
      sub: "sub-influenciadora-antiga",
      email: "admin@dodo.dev",
      emailVerificado: true,
      nome: "Admin",
    });

    expect(resolvida.papelAtor).toBe("ADMINISTRADOR");
    expect(resolvida.estadoConta).toBe("ACTIVE");
  });

  it("não rebaixa uma identidade ADMINISTRADOR ACTIVE quando o e-mail sai de ADMIN_BOOTSTRAP_EMAILS", async () => {
    await identidadeRepositorio.salvar(
      identidade({
        subProvider: "sub-admin-removido-da-lista",
        emailPerfil: "ex-admin@dodo.dev",
        papelAtor: "ADMINISTRADOR",
        estadoConta: "ACTIVE",
      }),
    );

    const resolvida = await resolverOuCriarIdentidade({
      sub: "sub-admin-removido-da-lista",
      email: "ex-admin@dodo.dev",
      emailVerificado: true,
      nome: "Ex Admin",
    });

    expect(resolvida.papelAtor).toBe("ADMINISTRADOR");
    expect(resolvida.estadoConta).toBe("ACTIVE");
  });

  it("não altera papel/estado de identidade existente cujo e-mail não está em ADMIN_BOOTSTRAP_EMAILS", async () => {
    await identidadeRepositorio.salvar(
      identidade({
        subProvider: "sub-influenciadora-comum",
        emailPerfil: "parceira@dodo.dev",
        papelAtor: "INFLUENCIADORA",
        estadoConta: "PENDING",
      }),
    );

    const resolvida = await resolverOuCriarIdentidade({
      sub: "sub-influenciadora-comum",
      email: "parceira@dodo.dev",
      emailVerificado: true,
      nome: "Parceira",
    });

    expect(resolvida.papelAtor).toBe("INFLUENCIADORA");
    expect(resolvida.estadoConta).toBe("PENDING");
  });
});
