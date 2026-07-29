import { describe, expect, it } from "vitest";
import { mensagemDeCamposObrigatoriosAusentes } from "./validacaoCampos.js";

describe("mensagemDeCamposObrigatoriosAusentes", () => {
  it("retorna null quando todos os campos estão presentes", () => {
    expect(
      mensagemDeCamposObrigatoriosAusentes(
        { a: "1", b: "2" },
        ["a", "b"],
      ),
    ).toBeNull();
  });

  it("retorna a mensagem listando TODOS os campos esperados quando falta um", () => {
    expect(
      mensagemDeCamposObrigatoriosAusentes({ a: "1" }, ["a", "b", "c"]),
    ).toBe("Campos obrigatórios: a, b, c.");
  });

  it("trata valores falsy (0, '', false) como ausentes", () => {
    expect(
      mensagemDeCamposObrigatoriosAusentes({ a: 0, b: "" }, ["a", "b"]),
    ).toBe("Campos obrigatórios: a, b.");
  });

  it("trata corpo vazio como todos ausentes", () => {
    expect(mensagemDeCamposObrigatoriosAusentes({}, ["a"])).toBe(
      "Campos obrigatórios: a.",
    );
  });
});
