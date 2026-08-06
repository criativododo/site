/**
 * Log estruturado central do backend (sprint de observabilidade) — mesmo padrão já usado em
 * `middleware/errorHandler.ts`/`shared/cep/resolver.ts`: `console.*` com prefixo de contexto
 * `[NomeDoModulo] campo=valor ...`. Nenhuma biblioteca de log nova (decisão já registrada:
 * o porte do projeto — VPS única, PM2, Postgres — não justifica pino/winston/equivalente).
 *
 * Nasceu como `shared/storage/log.ts` (só o domínio de Storage/Drive) e foi generalizado para
 * `shared/log.ts` para ser reutilizável por qualquer módulo, evitando um segundo padrão de log
 * paralelo ao invés de um terceiro formato ad-hoc por arquivo.
 *
 * Nunca passar segredo (`access_token`/`refresh_token`/cookie/senha) ou conteúdo binário como
 * campo — só identificadores e metadados (mesma disciplina já seguida pelos usos existentes).
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
