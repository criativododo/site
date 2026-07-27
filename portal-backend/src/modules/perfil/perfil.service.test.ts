import { describe, expect, it } from "vitest";
import { atualizarContato, montarEndereco } from "./perfil.service.js";

describe("atualizarContato (RN-04/CB-02)", () => {
  it("recusa tentativa de editar campo comercial/não permitido, sem tocar o perfil", async () => {
    const resultado = await atualizarContato("qualquer-parceira", {
      pix: "novo-pix",
      condicaoComercial: "1000",
    });

    expect(resultado).toEqual({
      ok: false,
      motivo: "CAMPO_NAO_PERMITIDO",
      campo: "condicaoComercial",
    });
  });

  it("recusa qualquer chave fora de pix/email, mesmo isolada", async () => {
    const resultado = await atualizarContato("qualquer-parceira", { status: "Ativa" });
    expect(resultado).toEqual({ ok: false, motivo: "CAMPO_NAO_PERMITIDO", campo: "status" });
  });
});

describe("montarEndereco (UC-032.03, RN-01/RN-02)", () => {
  it("RN-01: recompõe rua/bairro/cidade/uf a partir do CEP resolvido", () => {
    const endereco = montarEndereco(
      { cep: "01310-100", numero: "1000", complemento: "Sala 1" },
      { rua: "Avenida Paulista", bairro: "Bela Vista", cidade: "São Paulo", uf: "SP" },
      null,
    );

    expect(endereco).toEqual({
      cep: "01310-100",
      numero: "1000",
      complemento: "Sala 1",
      rua: "Avenida Paulista",
      bairro: "Bela Vista",
      cidade: "São Paulo",
      uf: "SP",
    });
  });

  it("RN-02: CEP não resolvido não impede salvar cep/número/complemento (degradável)", () => {
    const endereco = montarEndereco({ cep: "00000-000", numero: "42", complemento: "" }, null, null);

    expect(endereco).toEqual({
      cep: "00000-000",
      numero: "42",
      complemento: "",
      rua: "",
      bairro: "",
      cidade: "",
      uf: "",
    });
  });

  it("RN-02: CEP não resolvido preserva rua/bairro/cidade/uf anteriores em vez de apagar", () => {
    const endereco = montarEndereco(
      { cep: "00000-000", numero: "42", complemento: "" },
      null,
      { cep: "01310-100", numero: "1000", complemento: "", rua: "Avenida Paulista", bairro: "Bela Vista", cidade: "São Paulo", uf: "SP" },
    );

    expect(endereco.rua).toBe("Avenida Paulista");
    expect(endereco.cep).toBe("00000-000");
  });
});
