import { describe, expect, it } from "vitest";
import type { ContextoRenderizacao } from "./documentos.renderizador.js";
import { PlaceholderNaoResolvidoError, TemplateInvalidoError, resolverPlaceholders } from "./documentos.renderizador.js";

const contextoBase: ContextoRenderizacao = {
  parceira: {
    nome: "Ateliê Silva & Cia",
    endereco: {
      cidade: "Nova Friburgo",
    },
  },
  colaboracao: {
    valor: 1500,
    ativa: true,
  },
};

describe("resolverPlaceholders — substituição simples", () => {
  it("substitui um único placeholder de primeiro nível dentro de um namespace", () => {
    expect(resolverPlaceholders("Olá, {{parceira.nome}}!", contextoBase)).toBe("Olá, Ateliê Silva &amp; Cia!");
  });

  it("substitui placeholder aninhado em mais de um nível", () => {
    expect(resolverPlaceholders("{{parceira.endereco.cidade}}", contextoBase)).toBe("Nova Friburgo");
  });

  it("substitui múltiplos placeholders na mesma string", () => {
    expect(resolverPlaceholders("{{parceira.nome}} — {{parceira.endereco.cidade}}", contextoBase)).toBe(
      "Ateliê Silva &amp; Cia — Nova Friburgo",
    );
  });

  it("tolera espaço em branco dentro das chaves", () => {
    expect(resolverPlaceholders("{{ parceira.nome }}", contextoBase)).toBe("Ateliê Silva &amp; Cia");
  });

  it("converte valor numérico e booleano para string", () => {
    expect(resolverPlaceholders("{{colaboracao.valor}} / {{colaboracao.ativa}}", contextoBase)).toBe("1500 / true");
  });

  it("preserva texto literal fora de placeholders, inclusive HTML do próprio template", () => {
    expect(resolverPlaceholders("<p>{{parceira.nome}}</p>", contextoBase)).toBe("<p>Ateliê Silva &amp; Cia</p>");
  });

  it("template sem nenhum placeholder retorna o texto inalterado", () => {
    expect(resolverPlaceholders("<p>Texto fixo, sem variável.</p>", contextoBase)).toBe(
      "<p>Texto fixo, sem variável.</p>",
    );
  });
});

describe("resolverPlaceholders — HTML-escape", () => {
  it("escapa &, <, >, aspas duplas e aspas simples no valor resolvido", () => {
    const contexto: ContextoRenderizacao = { x: `& < > " '` };
    expect(resolverPlaceholders("{{x}}", contexto)).toBe("&amp; &lt; &gt; &quot; &#39;");
  });

  it("não interpreta HTML vindo do contexto — tags no dado viram texto escapado, não markup", () => {
    const contexto: ContextoRenderizacao = { x: "<script>alert(1)</script>" };
    expect(resolverPlaceholders("{{x}}", contexto)).toBe("&lt;script&gt;alert(1)&lt;/script&gt;");
  });
});

describe("resolverPlaceholders — placeholder não resolvido", () => {
  it("lança PlaceholderNaoResolvidoError quando o caminho não existe no contexto", () => {
    expect(() => resolverPlaceholders("{{parceira.cnpj}}", contextoBase)).toThrow(PlaceholderNaoResolvidoError);
  });

  it("lança PlaceholderNaoResolvidoError quando o valor é null", () => {
    const contexto: ContextoRenderizacao = { parceira: { cnpj: null } };
    expect(() => resolverPlaceholders("{{parceira.cnpj}}", contexto)).toThrow(PlaceholderNaoResolvidoError);
  });

  it("lança PlaceholderNaoResolvidoError quando o caminho aponta para um objeto, não uma folha", () => {
    expect(() => resolverPlaceholders("{{parceira}}", contextoBase)).toThrow(PlaceholderNaoResolvidoError);
  });

  it("lança PlaceholderNaoResolvidoError quando tenta navegar dentro de um valor primitivo", () => {
    expect(() => resolverPlaceholders("{{colaboracao.valor.subcampo}}", contextoBase)).toThrow(
      PlaceholderNaoResolvidoError,
    );
  });

  it("nunca renderiza parcialmente — erro no segundo placeholder impede qualquer substituição no retorno", () => {
    expect(() => resolverPlaceholders("{{parceira.nome}} {{parceira.cnpj}}", contextoBase)).toThrow(
      PlaceholderNaoResolvidoError,
    );
  });
});

describe("resolverPlaceholders — template inválido", () => {
  it("lança TemplateInvalidoError para chaves desbalanceadas (abertura sem fechamento)", () => {
    expect(() => resolverPlaceholders("{{parceira.nome", contextoBase)).toThrow(TemplateInvalidoError);
  });

  it("lança TemplateInvalidoError para caminho com caractere inválido", () => {
    expect(() => resolverPlaceholders("{{parceira nome}}", contextoBase)).toThrow(TemplateInvalidoError);
  });

  it("lança TemplateInvalidoError para placeholder vazio", () => {
    expect(() => resolverPlaceholders("{{}}", contextoBase)).toThrow(TemplateInvalidoError);
  });

  it("lança TemplateInvalidoError para caminho com segmento vazio (pontos consecutivos)", () => {
    expect(() => resolverPlaceholders("{{parceira..nome}}", contextoBase)).toThrow(TemplateInvalidoError);
  });
});

describe("resolverPlaceholders — determinismo", () => {
  it("mesma entrada produz sempre a mesma saída", () => {
    const resultado1 = resolverPlaceholders("{{parceira.nome}} — {{colaboracao.valor}}", contextoBase);
    const resultado2 = resolverPlaceholders("{{parceira.nome}} — {{colaboracao.valor}}", contextoBase);
    expect(resultado1).toBe(resultado2);
  });
});
