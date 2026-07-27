import { describe, expect, it } from "vitest";
import {
  alterarStatusParceira,
  cadastrarParceira,
  editarParceira,
  listarParceiras,
} from "./parceira.service.js";

const condicaoComercial = {
  valorMensal: 2500,
  entregaveisReel: 2,
  entregaveisCarrossel: 1,
  entregaveisStories: 4,
  prazoUsoImagemDias: 90,
};

describe("cadastrarParceira (RN-01: nasce sempre INATIVA)", () => {
  it("cria a Parceira com status INATIVA independente do que for pedido", async () => {
    const parceira = await cadastrarParceira({
      chave: "PARCEIRA-TESTE-1",
      nome: "Parceira Teste",
      email: "parceira-teste-1@dodo.dev",
      cnpj: "",
      pix: "",
      condicaoComercial,
    });

    expect(parceira.status).toBe("INATIVA");
    expect(parceira.id).toBeTruthy();

    const todas = await listarParceiras();
    expect(todas.map((p) => p.id)).toContain(parceira.id);
  });
});

describe("editarParceira (UC-002.02)", () => {
  it("atualiza campos e retorna NAO_ENCONTRADA para id inexistente", async () => {
    const parceira = await cadastrarParceira({
      chave: "PARCEIRA-TESTE-2",
      nome: "Antes",
      email: "antes@dodo.dev",
      cnpj: "",
      pix: "",
      condicaoComercial,
    });

    const resultado = await editarParceira(parceira.id, { nome: "Depois" });
    expect(resultado).toEqual({ ok: true, parceira: expect.objectContaining({ nome: "Depois" }) });

    const semId = await editarParceira("id-inexistente", { nome: "X" });
    expect(semId).toEqual({ ok: false, motivo: "NAO_ENCONTRADA" });
  });
});

describe("alterarStatusParceira (UC-002.01 / RN-11: nunca exclui o registro)", () => {
  it("alterna INATIVA -> ATIVA -> INATIVA preservando o registro", async () => {
    const parceira = await cadastrarParceira({
      chave: "PARCEIRA-TESTE-3",
      nome: "Parceira Status",
      email: "status@dodo.dev",
      cnpj: "",
      pix: "",
      condicaoComercial,
    });

    const ativada = await alterarStatusParceira(parceira.id, "ATIVA");
    expect(ativada).toEqual({ ok: true, parceira: expect.objectContaining({ status: "ATIVA" }) });

    const inativada = await alterarStatusParceira(parceira.id, "INATIVA");
    expect(inativada).toEqual({ ok: true, parceira: expect.objectContaining({ status: "INATIVA", id: parceira.id }) });
  });
});
