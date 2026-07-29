import { describe, expect, it } from "vitest";
import { normalizarCep, normalizarEndereco } from "./normalizador.js";

describe("normalizarCep", () => {
  it("aceita CEP com máscara e devolve só os dígitos", () => {
    expect(normalizarCep("01310-100")).toBe("01310100");
  });

  it("aceita CEP já sem máscara", () => {
    expect(normalizarCep("01310100")).toBe("01310100");
  });

  it("rejeita CEP com menos de 8 dígitos", () => {
    expect(normalizarCep("123")).toBeNull();
  });

  it("rejeita string vazia", () => {
    expect(normalizarCep("")).toBeNull();
  });

  it("rejeita CEP com mais de 8 dígitos", () => {
    expect(normalizarCep("013101001")).toBeNull();
  });
});

describe("normalizarEndereco", () => {
  it("remove espaços e coloca UF em caixa alta", () => {
    const normalizado = normalizarEndereco({
      logradouro: "  Avenida Paulista  ",
      bairro: " Bela Vista ",
      cidade: " São Paulo ",
      uf: "sp",
    });

    expect(normalizado).toEqual({
      logradouro: "Avenida Paulista",
      bairro: "Bela Vista",
      cidade: "São Paulo",
      uf: "SP",
    });
  });
});
