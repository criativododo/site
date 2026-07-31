/**
 * Renderizador de placeholders (Fase 5, motor §1.5) — Incremento 1: só substituição de
 * `{{namespace.campo}}` por valor do contexto. Blocos condicionais em
 * `documentos.blocosCondicionais.ts` (Incremento 2); integração com AuditLog para PII em
 * `documentos.renderizadorAuditado.ts` (Incremento 3) — este módulo permanece puro de
 * propósito, nunca ganha o import da `Porta` de auditoria.
 *
 * Função pura: sem I/O, sem acesso a banco — quem chama monta o `ContextoRenderizacao` já
 * pronto. HTML é o formato oficial de `TemplateVersao.conteudo`: todo valor substituído sofre
 * HTML-escape por padrão; o renderer nunca interpreta HTML vindo do contexto (dado de
 * Parceira/Colaboração nunca vira markup), só o próprio template contém HTML real.
 */

export type ValorRenderizavel = string | number | boolean;

export type NoContexto = ValorRenderizavel | null | undefined | { [chave: string]: NoContexto };

export type ContextoRenderizacao = { [chave: string]: NoContexto };

/** Erro sintático: o texto do template não é um `{{...}}` válido (independe do contexto). */
export class TemplateInvalidoError extends Error {
  constructor(motivo: string) {
    super(`Template inválido: ${motivo}`);
    this.name = "TemplateInvalidoError";
  }
}

/** Erro semântico: caminho sintaticamente válido, mas sem valor renderizável no contexto. */
export class PlaceholderNaoResolvidoError extends Error {
  constructor(
    public readonly caminho: string,
    motivo: string,
  ) {
    super(`Placeholder "{{${caminho}}}" não pôde ser resolvido: ${motivo}`);
    this.name = "PlaceholderNaoResolvidoError";
  }
}

const CAMINHO_VALIDO = /^[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*$/;
const BLOCO_PLACEHOLDER = /\{\{(.*?)\}\}/gs;

const ESCAPES_HTML: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escaparHtml(valor: string): string {
  return valor.replace(/[&<>"']/g, (caractere) => ESCAPES_HTML[caractere] ?? caractere);
}

/**
 * Contagem simples de `{{`/`}}` — não é um parser completo, só pega o caso de uma chave
 * aberta sem par em lugar nenhum do documento (que, sem isso, passaria como texto literal
 * silenciosamente). Malformação dentro de um par `{{...}}` já é pega por `CAMINHO_VALIDO`.
 */
function verificarChavesBalanceadas(conteudo: string): void {
  const abrindo = conteudo.match(/\{\{/g)?.length ?? 0;
  const fechando = conteudo.match(/\}\}/g)?.length ?? 0;
  if (abrindo !== fechando) {
    throw new TemplateInvalidoError(`chaves desbalanceadas ("{{" × ${abrindo}, "}}" × ${fechando})`);
  }
}

/** Exportada para reuso por documentos.blocosCondicionais.ts (mesma navegação de caminho). */
export function resolverCaminho(contexto: ContextoRenderizacao, caminho: string): NoContexto {
  let atual: NoContexto = contexto;

  for (const segmento of caminho.split(".")) {
    if (atual === null || atual === undefined || typeof atual !== "object") {
      return undefined;
    }
    atual = atual[segmento];
  }

  return atual;
}

export function resolverPlaceholders(conteudo: string, contexto: ContextoRenderizacao): string {
  verificarChavesBalanceadas(conteudo);

  return conteudo.replace(BLOCO_PLACEHOLDER, (_correspondencia, caminhoBruto: string) => {
    const caminho = caminhoBruto.trim();

    if (!CAMINHO_VALIDO.test(caminho)) {
      throw new TemplateInvalidoError(`placeholder "{{${caminhoBruto}}}" não é um caminho válido`);
    }

    const valor = resolverCaminho(contexto, caminho);

    if (valor === null || valor === undefined) {
      throw new PlaceholderNaoResolvidoError(caminho, "valor ausente no contexto");
    }

    if (typeof valor === "object") {
      throw new PlaceholderNaoResolvidoError(caminho, "aponta para um objeto, não para um valor renderizável");
    }

    return escaparHtml(String(valor));
  });
}
