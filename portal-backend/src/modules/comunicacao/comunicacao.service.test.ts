import { describe, expect, it } from "vitest";
import { cadastrarParceira } from "../parceira/parceira.service.js";
import { obterHistoricoGeral, obterHistoricoPorParceira, obterReferenciaModelos, prepararMensagem } from "./comunicacao.service.js";

const condicaoComercial = {
  valorMensal: 2500,
  entregaveisReel: 2,
  entregaveisCarrossel: 1,
  entregaveisStories: 4,
  prazoUsoImagemDias: 90,
};

async function novaParceiraDeTeste(chave: string) {
  return cadastrarParceira({
    chave,
    nome: `Parceira ${chave}`,
    email: `${chave.toLowerCase()}@dodo.dev`,
    cnpj: "",
    pix: "chave-pix-teste",
    condicaoComercial,
  });
}

describe("obterReferenciaModelos", () => {
  it("expõe os modelos, o agrupamento por categoria e as variáveis suportadas", () => {
    const referencia = obterReferenciaModelos();
    expect(referencia.modelos.length).toBe(8);
    expect(Object.keys(referencia.modelosPorCategoria).length).toBe(8);
    expect(referencia.variaveis.length).toBeGreaterThan(0);
  });
});

describe("prepararMensagem", () => {
  it("persiste o histórico com o nome da Parceira resolvido pelo id (nunca confia no que o cliente envia)", async () => {
    const parceira = await novaParceiraDeTeste("COMUNICACAO-TESTE-1");

    const resultado = await prepararMensagem({
      parceiraId: parceira.id,
      categoria: "LEMBRETE",
      modeloId: "lembrete-prazo",
      corpoFinal: `Oi, ${parceira.nome}! Passando para lembrar...`,
      preparadoPor: "admin-teste@dodo.dev",
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;
    expect(resultado.mensagem.parceiraNome).toBe(parceira.nome);
    expect(resultado.mensagem.id).toBeTruthy();
    expect(resultado.mensagem.preparadoEm).toBeTruthy();
  });

  it("retorna PARCEIRA_NAO_ENCONTRADA para id inexistente, sem persistir nada", async () => {
    const resultado = await prepararMensagem({
      parceiraId: "id-inexistente",
      categoria: "PERSONALIZADA",
      modeloId: null,
      corpoFinal: "mensagem qualquer",
      preparadoPor: "admin-teste@dodo.dev",
    });

    expect(resultado).toEqual({ ok: false, motivo: "PARCEIRA_NAO_ENCONTRADA" });
  });

  it("aceita categoria PERSONALIZADA com modeloId null (mensagem sem modelo de origem)", async () => {
    const parceira = await novaParceiraDeTeste("COMUNICACAO-TESTE-2");

    const resultado = await prepararMensagem({
      parceiraId: parceira.id,
      categoria: "PERSONALIZADA",
      modeloId: null,
      corpoFinal: "mensagem escrita livremente para esta parceira",
      preparadoPor: "admin-teste@dodo.dev",
    });

    expect(resultado).toEqual({
      ok: true,
      mensagem: expect.objectContaining({ categoria: "PERSONALIZADA", modeloId: null }),
    });
  });
});

describe("obterHistoricoGeral / obterHistoricoPorParceira", () => {
  it("histórico geral inclui mensagens de qualquer Parceira; histórico por parceira só as dela", async () => {
    const parceiraA = await novaParceiraDeTeste("COMUNICACAO-TESTE-3A");
    const parceiraB = await novaParceiraDeTeste("COMUNICACAO-TESTE-3B");

    await prepararMensagem({
      parceiraId: parceiraA.id,
      categoria: "BOAS_VINDAS",
      modeloId: "boas-vindas-padrao",
      corpoFinal: "mensagem para A",
      preparadoPor: "admin-teste@dodo.dev",
    });
    await prepararMensagem({
      parceiraId: parceiraB.id,
      categoria: "BOAS_VINDAS",
      modeloId: "boas-vindas-padrao",
      corpoFinal: "mensagem para B",
      preparadoPor: "admin-teste@dodo.dev",
    });

    const historicoGeral = await obterHistoricoGeral(50);
    expect(historicoGeral.some((m) => m.parceiraId === parceiraA.id)).toBe(true);
    expect(historicoGeral.some((m) => m.parceiraId === parceiraB.id)).toBe(true);

    const historicoA = await obterHistoricoPorParceira(parceiraA.id);
    expect(historicoA.every((m) => m.parceiraId === parceiraA.id)).toBe(true);
    expect(historicoA.some((m) => m.corpoFinal === "mensagem para A")).toBe(true);
  });
});
