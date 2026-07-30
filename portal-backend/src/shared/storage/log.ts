/**
 * Log estruturado do Storage (TDD §2.11) — mesmo padrão já usado em `shared/cep/resolver.ts`
 * (`console.*` com prefixo de contexto `[NomeDoModulo] ...`). Nenhuma biblioteca de log nova.
 *
 * Nunca passar `access_token`/`refresh_token`/conteúdo binário/nome original do arquivo em
 * texto puro como campo — só `recursoId`/`formato`/`entregaId` (via `nomeArquivo`, já
 * derivado, nunca `nomeOriginal`).
 */

type CampoDeLog = string | number | boolean | undefined;

function formatar(campos: Record<string, CampoDeLog>): string {
  return Object.entries(campos)
    .filter(([, valor]) => valor !== undefined)
    .map(([chave, valor]) => `${chave}=${valor}`)
    .join(" ");
}

export function logEvento(contexto: string, campos: Record<string, CampoDeLog>): void {
  console.info(`[${contexto}] ${formatar(campos)}`);
}

export function logAviso(contexto: string, campos: Record<string, CampoDeLog>): void {
  console.warn(`[${contexto}] ${formatar(campos)}`);
}

export function logErro(contexto: string, campos: Record<string, CampoDeLog>): void {
  console.error(`[${contexto}] ${formatar(campos)}`);
}
