/**
 * Blocos condicionais (Fase 5, motor §1.6) — Incremento 2: `{{#se <condicao>}}...{{/se}}`.
 *
 * Decide qual trecho do template sobrevive; não resolve `{{placeholder}}` dentro do corpo
 * que mantém — isso continua sendo responsabilidade exclusiva de `resolverPlaceholders`
 * (Incremento 1), chamado depois, sobre o texto já filtrado por este módulo. Função pura,
 * sem I/O, sem conhecimento da sintaxe de placeholder simples.
 *
 * Suporta só os 3 padrões do design aprovado, nenhum outro:
 *   {{#se caminho}}              → truthy/existência
 *   {{#se caminho = LITERAL}}    → igualdade (literal alfanumérico não citado)
 *   {{#se caminho > 12}}         → comparação numérica
 * Sem aninhamento, sem AND/OR, sem outros operadores, sem expressão.
 */

import type { ContextoRenderizacao } from "./documentos.renderizador.js";
import { TemplateInvalidoError, resolverCaminho } from "./documentos.renderizador.js";

/** Condição sintaticamente válida, mas com dado de tipo incompatível com o operador usado. */
export class CondicaoNaoAvaliavelError extends Error {
  constructor(
    public readonly condicao: string,
    motivo: string,
  ) {
    super(`Condição "{{#se ${condicao}}}" não pôde ser avaliada: ${motivo}`);
    this.name = "CondicaoNaoAvaliavelError";
  }
}

const CAMINHO = "[a-zA-Z0-9_]+(?:\\.[a-zA-Z0-9_]+)*";
const CONDICAO_TRUTHY = new RegExp(`^(${CAMINHO})$`);
const CONDICAO_IGUALDADE = new RegExp(`^(${CAMINHO})\\s*=\\s*([a-zA-Z0-9_]+)$`);
const CONDICAO_MAIOR_QUE = new RegExp(`^(${CAMINHO})\\s*>\\s*(\\d+(?:\\.\\d+)?)$`);

/** Só os marcadores estruturais (abertura/fechamento), para o scan linear de aninhamento. */
const MARCADOR_ESTRUTURAL = /\{\{#se\b[^}]*\}\}|\{\{\/se\}\}/g;
const BLOCO_CONDICIONAL = /\{\{#se\s+(.*?)\}\}(.*?)\{\{\/se\}\}/gs;

/**
 * Scan linear (contador de profundidade, não recursivo) — garante blocos balanceados e
 * rejeita aninhamento explicitamente, em vez de deixar o regex de extração mispareá-los
 * silenciosamente. Mesma ideia da checagem de chaves de `resolverPlaceholders`, uma etapa a
 * mais porque aqui existe abertura/fechamento com nome, não só pares de chave.
 */
function verificarBlocosBemFormados(conteudo: string): void {
  let profundidade = 0;

  for (const marcador of conteudo.match(MARCADOR_ESTRUTURAL) ?? []) {
    if (marcador.startsWith("{{#se")) {
      if (profundidade > 0) {
        throw new TemplateInvalidoError("blocos condicionais aninhados não são suportados nesta versão");
      }
      profundidade = 1;
    } else {
      if (profundidade === 0) {
        throw new TemplateInvalidoError('"{{/se}}" sem "{{#se ...}}" correspondente');
      }
      profundidade = 0;
    }
  }

  if (profundidade !== 0) {
    throw new TemplateInvalidoError('bloco "{{#se ...}}" sem "{{/se}}" correspondente');
  }
}

function avaliarCondicao(condicaoBruta: string, contexto: ContextoRenderizacao): boolean {
  const condicao = condicaoBruta.trim();

  const truthy = condicao.match(CONDICAO_TRUTHY);
  if (truthy) {
    return Boolean(resolverCaminho(contexto, truthy[1]));
  }

  const igualdade = condicao.match(CONDICAO_IGUALDADE);
  if (igualdade) {
    const [, caminho, literal] = igualdade;
    const valor = resolverCaminho(contexto, caminho);
    if (valor === null || valor === undefined) {
      return false;
    }
    if (typeof valor === "object") {
      throw new CondicaoNaoAvaliavelError(
        condicao,
        `"${caminho}" aponta para um objeto, não comparável a um literal`,
      );
    }
    return String(valor) === literal;
  }

  const maiorQue = condicao.match(CONDICAO_MAIOR_QUE);
  if (maiorQue) {
    const [, caminho, literal] = maiorQue;
    const valor = resolverCaminho(contexto, caminho);
    if (valor === null || valor === undefined) {
      return false;
    }
    if (typeof valor !== "number" && typeof valor !== "string") {
      throw new CondicaoNaoAvaliavelError(condicao, `"${caminho}" não é um valor numérico comparável`);
    }
    const numero = typeof valor === "number" ? valor : Number(valor);
    if (Number.isNaN(numero)) {
      throw new CondicaoNaoAvaliavelError(condicao, `"${caminho}" não é um valor numérico comparável`);
    }
    return numero > Number(literal);
  }

  throw new TemplateInvalidoError(
    `condição "{{#se ${condicaoBruta}}}" não corresponde a nenhuma sintaxe suportada ` +
      `(caminho, "caminho = literal" ou "caminho > numero")`,
  );
}

export function resolverBlocosCondicionais(conteudo: string, contexto: ContextoRenderizacao): string {
  verificarBlocosBemFormados(conteudo);

  return conteudo.replace(BLOCO_CONDICIONAL, (_correspondencia, condicao: string, corpo: string) =>
    avaliarCondicao(condicao, contexto) ? corpo : "",
  );
}
