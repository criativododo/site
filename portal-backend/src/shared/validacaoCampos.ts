/**
 * Validação genérica de "campos obrigatórios" usada nas rotas administrativas: várias
 * rotas de `*.routes.ts` repetiam a mesma forma — checar truthiness de uma lista de campos
 * do corpo da requisição e, se algum faltar, responder 400 listando TODOS os campos
 * esperados (não só os ausentes) — extraída aqui para eliminar a duplicação sem mudar essa
 * mensagem nem o comportamento de nenhuma rota.
 */
export function mensagemDeCamposObrigatoriosAusentes(
  corpo: Record<string, unknown>,
  campos: string[],
): string | null {
  const algumAusente = campos.some((campo) => !corpo[campo]);
  if (!algumAusente) {
    return null;
  }
  return `Campos obrigatórios: ${campos.join(", ")}.`;
}
