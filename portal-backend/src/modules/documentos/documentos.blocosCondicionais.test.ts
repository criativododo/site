import { describe, expect, it } from "vitest";
import type { ContextoRenderizacao } from "./documentos.renderizador.js";
import { TemplateInvalidoError } from "./documentos.renderizador.js";
import { CondicaoNaoAvaliavelError, resolverBlocosCondicionais } from "./documentos.blocosCondicionais.js";

describe("resolverBlocosCondicionais — truthy/existência", () => {
  it("mantém o bloco quando o caminho resolve para um objeto presente", () => {
    const contexto: ContextoRenderizacao = { parceira: { assessoria: { nome: "Ateliê X" } } };
    expect(resolverBlocosCondicionais("{{#se parceira.assessoria}}tem assessoria{{/se}}", contexto)).toBe(
      "tem assessoria",
    );
  });

  it("remove o bloco quando o caminho não existe no contexto", () => {
    const contexto: ContextoRenderizacao = { parceira: {} };
    expect(resolverBlocosCondicionais("{{#se parceira.assessoria}}tem assessoria{{/se}}", contexto)).toBe("");
  });

  it("remove o bloco quando o valor é false, 0 ou string vazia", () => {
    expect(resolverBlocosCondicionais("{{#se x}}A{{/se}}", { x: false })).toBe("");
    expect(resolverBlocosCondicionais("{{#se x}}A{{/se}}", { x: 0 })).toBe("");
    expect(resolverBlocosCondicionais("{{#se x}}A{{/se}}", { x: "" })).toBe("");
  });

  it("mantém o bloco quando o valor é true ou número diferente de zero", () => {
    expect(resolverBlocosCondicionais("{{#se x}}A{{/se}}", { x: true })).toBe("A");
    expect(resolverBlocosCondicionais("{{#se x}}A{{/se}}", { x: 5 })).toBe("A");
  });
});

describe("resolverBlocosCondicionais — igualdade", () => {
  const contexto: ContextoRenderizacao = { colaboracao: { pagamento: "PERMUTA" } };

  it("mantém o bloco quando o literal bate com o valor resolvido", () => {
    expect(resolverBlocosCondicionais("{{#se colaboracao.pagamento = PERMUTA}}sem cláusula{{/se}}", contexto)).toBe(
      "sem cláusula",
    );
  });

  it("remove o bloco quando o literal não bate", () => {
    expect(resolverBlocosCondicionais("{{#se colaboracao.pagamento = DINHEIRO}}sem cláusula{{/se}}", contexto)).toBe(
      "",
    );
  });

  it("remove o bloco (não lança erro) quando o caminho está ausente no contexto", () => {
    expect(resolverBlocosCondicionais("{{#se colaboracao.pagamento = PERMUTA}}X{{/se}}", { colaboracao: {} })).toBe(
      "",
    );
  });

  it("lança CondicaoNaoAvaliavelError quando o caminho aponta para um objeto", () => {
    expect(() =>
      resolverBlocosCondicionais("{{#se colaboracao = PERMUTA}}X{{/se}}", contexto),
    ).toThrow(CondicaoNaoAvaliavelError);
  });

  it("compara também valores numéricos e booleanos por string", () => {
    expect(resolverBlocosCondicionais("{{#se x = 12}}A{{/se}}", { x: 12 })).toBe("A");
    expect(resolverBlocosCondicionais("{{#se x = true}}A{{/se}}", { x: true })).toBe("A");
  });
});

describe("resolverBlocosCondicionais — maior que", () => {
  const contexto: ContextoRenderizacao = { colaboracao: { usoImagem: 18 } };

  it("mantém o bloco quando o valor numérico é maior que o literal", () => {
    expect(resolverBlocosCondicionais("{{#se colaboracao.usoImagem > 12}}cláusula estendida{{/se}}", contexto)).toBe(
      "cláusula estendida",
    );
  });

  it("remove o bloco quando o valor numérico não é maior que o literal", () => {
    expect(resolverBlocosCondicionais("{{#se colaboracao.usoImagem > 24}}X{{/se}}", contexto)).toBe("");
  });

  it("aceita valor em formato string numérica", () => {
    expect(resolverBlocosCondicionais("{{#se x > 10}}A{{/se}}", { x: "18" })).toBe("A");
  });

  it("remove o bloco (não lança erro) quando o caminho está ausente no contexto", () => {
    expect(resolverBlocosCondicionais("{{#se colaboracao.usoImagem > 12}}X{{/se}}", { colaboracao: {} })).toBe("");
  });

  it("lança CondicaoNaoAvaliavelError quando o valor não é numérico", () => {
    expect(() => resolverBlocosCondicionais("{{#se x > 10}}A{{/se}}", { x: "abc" })).toThrow(
      CondicaoNaoAvaliavelError,
    );
  });

  it("lança CondicaoNaoAvaliavelError quando o valor é booleano", () => {
    expect(() => resolverBlocosCondicionais("{{#se x > 10}}A{{/se}}", { x: true })).toThrow(
      CondicaoNaoAvaliavelError,
    );
  });

  it("lança CondicaoNaoAvaliavelError quando o valor é um objeto", () => {
    expect(() => resolverBlocosCondicionais("{{#se x > 10}}A{{/se}}", { x: { y: 1 } })).toThrow(
      CondicaoNaoAvaliavelError,
    );
  });
});

describe("resolverBlocosCondicionais — não interfere com placeholders", () => {
  it("preserva {{placeholder}} intacto dentro do corpo mantido, para resolverPlaceholders processar depois", () => {
    const contexto: ContextoRenderizacao = { x: true };
    expect(resolverBlocosCondicionais("{{#se x}}Olá, {{parceira.nome}}!{{/se}}", contexto)).toBe(
      "Olá, {{parceira.nome}}!",
    );
  });
});

describe("resolverBlocosCondicionais — múltiplos blocos não aninhados", () => {
  it("avalia cada bloco de forma independente", () => {
    const contexto: ContextoRenderizacao = { a: true, b: false };
    expect(resolverBlocosCondicionais("{{#se a}}A{{/se}}-{{#se b}}B{{/se}}", contexto)).toBe("A-");
  });
});

describe("resolverBlocosCondicionais — estrutura inválida", () => {
  it("lança TemplateInvalidoError para blocos aninhados", () => {
    const contexto: ContextoRenderizacao = { a: true, b: true };
    expect(() =>
      resolverBlocosCondicionais("{{#se a}}{{#se b}}X{{/se}}{{/se}}", contexto),
    ).toThrow(TemplateInvalidoError);
  });

  it("lança TemplateInvalidoError para abertura sem fechamento", () => {
    expect(() => resolverBlocosCondicionais("{{#se a}}X", { a: true })).toThrow(TemplateInvalidoError);
  });

  it("lança TemplateInvalidoError para fechamento sem abertura", () => {
    expect(() => resolverBlocosCondicionais("X{{/se}}", {})).toThrow(TemplateInvalidoError);
  });

  it("lança TemplateInvalidoError para operador não suportado", () => {
    expect(() => resolverBlocosCondicionais("{{#se a < 10}}X{{/se}}", { a: 5 })).toThrow(TemplateInvalidoError);
  });

  it("lança TemplateInvalidoError para condição com AND/OR", () => {
    expect(() => resolverBlocosCondicionais("{{#se a > 1 AND b > 2}}X{{/se}}", { a: 5, b: 5 })).toThrow(
      TemplateInvalidoError,
    );
  });
});

describe("resolverBlocosCondicionais — determinismo", () => {
  it("mesma entrada produz sempre a mesma saída", () => {
    const contexto: ContextoRenderizacao = { colaboracao: { usoImagem: 18 } };
    const template = "{{#se colaboracao.usoImagem > 12}}cláusula estendida{{/se}}";
    expect(resolverBlocosCondicionais(template, contexto)).toBe(resolverBlocosCondicionais(template, contexto));
  });
});
