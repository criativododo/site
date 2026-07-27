import { describe, expect, it } from "vitest";
import { atualizarContato } from "./perfil.service.js";

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
