import { describe, expect, it } from "vitest";
import { agruparModelosPorCategoria, MODELOS_MENSAGEM, VARIAVEIS_SUPORTADAS } from "./comunicacao.modelos.js";

describe("MODELOS_MENSAGEM", () => {
  it("tem exatamente 1 modelo para cada uma das 8 categorias pedidas na spec da tela", () => {
    const categorias = MODELOS_MENSAGEM.map((modelo) => modelo.categoria);
    expect(new Set(categorias).size).toBe(8);
    expect(categorias).toEqual([
      "BOAS_VINDAS",
      "BRIEFING",
      "LEMBRETE",
      "APROVACAO",
      "NOTA_FISCAL",
      "PAGAMENTO",
      "LOGISTICA",
      "ENCERRAMENTO",
    ]);
  });

  it("todo modelo tem id único", () => {
    const ids = MODELOS_MENSAGEM.map((modelo) => modelo.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("toda variável usada em algum corpo de modelo está declarada em VARIAVEIS_SUPORTADAS", () => {
    const variaveisDeclaradas = new Set(VARIAVEIS_SUPORTADAS.map((v) => v.variavel));
    const padraoVariavel = /\{\{[a-z]+\}\}/g;

    for (const modelo of MODELOS_MENSAGEM) {
      const variaveisNoCorpo = modelo.corpo.match(padraoVariavel) ?? [];
      for (const variavel of variaveisNoCorpo) {
        expect(variaveisDeclaradas.has(variavel)).toBe(true);
      }
    }
  });
});

describe("agruparModelosPorCategoria", () => {
  it("agrupa cada modelo sob sua própria categoria", () => {
    const agrupado = agruparModelosPorCategoria();
    for (const modelo of MODELOS_MENSAGEM) {
      expect(agrupado[modelo.categoria]).toContainEqual(modelo);
    }
  });
});
