import { invalidarCacheAccessTokenDrive, obterAccessTokenDrive } from "../../googleDrive/googleDriveClient.js";
import {
  ErroDeAutenticacaoStorage,
  ErroDeAutorizacaoStorage,
  ErroDeValidacaoDeArmazenamento,
  ErroTransitorioDeArmazenamento,
  LimiteDeRequisicaoExcedido,
  RecursoDeArmazenamentoNaoEncontrado,
} from "../erros.js";
import { logAviso, logErro } from "../log.js";

const CONTEXTO_LOG = "ProvedorDeArmazenamentoGoogleDrive";

const DRIVE_API = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";

const TENTATIVAS_MAX_PADRAO = 5; // 1 original + 4 retentativas
const ATRASO_BASE_MS = 250;
const TETO_ATRASO_MS = 8_000;
const JITTER = 0.2;

interface ErroGoogleDrive {
  error?: {
    errors?: { reason?: string }[];
    message?: string;
  };
}

/**
 * Erro interno de transporte — nunca cruza a fronteira de `ProvedorDeArmazenamentoGoogleDrive`.
 * `comRetentativa()` sempre o traduz para a hierarquia pública (`erros.ts`) antes de propagar.
 */
export class ErroHttpBrutoDrive extends Error {
  constructor(
    public readonly status: number,
    public readonly corpo: unknown,
    public readonly retryAfterMs?: number,
  ) {
    super(`Drive API respondeu HTTP ${status}`);
    this.name = "ErroHttpBrutoDrive";
  }
}

function razaoGoogle(corpo: unknown): string | undefined {
  return (corpo as ErroGoogleDrive)?.error?.errors?.[0]?.reason;
}

function ehRateLimit403(status: number, corpo: unknown): boolean {
  if (status !== 403) return false;
  const razao = razaoGoogle(corpo);
  return razao === "rateLimitExceeded" || razao === "userRateLimitExceeded";
}

function ehRetryable(erro: ErroHttpBrutoDrive): boolean {
  if (erro.status === 429) return true;
  if (erro.status === 0) return true; // erro de rede/timeout do fetch
  if (erro.status >= 500 && erro.status <= 504) return true;
  return ehRateLimit403(erro.status, erro.corpo);
}

function parsearRetryAfter(header: string | null): number | undefined {
  if (!header) return undefined;
  const segundos = Number(header);
  if (Number.isFinite(segundos)) return segundos * 1000;
  const dataAlvo = Date.parse(header);
  if (!Number.isNaN(dataAlvo)) return Math.max(0, dataAlvo - Date.now());
  return undefined;
}

function calcularBackoffMs(numeroTentativaQueFalhou: number, retryAfterMs?: number): number {
  const base = Math.min(TETO_ATRASO_MS, ATRASO_BASE_MS * 2 ** (numeroTentativaQueFalhou - 1));
  const fatorJitter = 1 + (Math.random() * 2 - 1) * JITTER;
  const calculado = base * fatorJitter;
  if (retryAfterMs !== undefined && retryAfterMs > calculado) return retryAfterMs;
  return calculado;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Traduz um `ErroHttpBrutoDrive` terminal (não retryable, ou retries esgotados) para `erros.ts`. */
function traduzirErroTerminal(erro: ErroHttpBrutoDrive): Error {
  if (erro.status === 400) return new ErroDeValidacaoDeArmazenamento(erro.message, erro);
  if (erro.status === 404) return new RecursoDeArmazenamentoNaoEncontrado(erro.message, erro);
  if (erro.status === 429 || ehRateLimit403(erro.status, erro.corpo)) {
    return new LimiteDeRequisicaoExcedido(erro.message, erro);
  }
  if (erro.status === 403) return new ErroDeAutorizacaoStorage(erro.message, erro);
  // 5xx / erro de rede (status 0), depois de esgotar as retentativas de comRetentativa().
  return new ErroTransitorioDeArmazenamento(erro.message, erro);
}

export interface OpcoesRetentativa {
  tentativasMax?: number;
  /** Só para log (§2.11) — nome da operação, correlação por recurso/operação lógica. */
  operacao?: string;
  recursoId?: string;
  chaveDeIdempotencia?: string;
}

/**
 * Backoff exponencial com jitter (§2.8 do TDD). `fn` encapsula uma única chamada de rede
 * (operação naturalmente segura de repetir) OU a sequência completa de
 * verificação-de-existência + escrita (operação não-idempotente — `criarPasta`/
 * `enviarArquivo`, §2.9 revisado): cada retentativa reexecuta `fn` do início, nunca reenvia
 * uma escrita isolada às cegas.
 */
export async function comRetentativa<T>(fn: () => Promise<T>, opcoes: OpcoesRetentativa = {}): Promise<T> {
  const tentativasMax = opcoes.tentativasMax ?? TENTATIVAS_MAX_PADRAO;
  const camposDeLog = { operacao: opcoes.operacao, recursoId: opcoes.recursoId, chaveDeIdempotencia: opcoes.chaveDeIdempotencia };
  let tentativa = 0;
  let jaTentouRenovarToken = false;

  for (;;) {
    tentativa++;
    try {
      return await fn();
    } catch (erroBruto) {
      if (!(erroBruto instanceof ErroHttpBrutoDrive)) throw erroBruto;

      if (erroBruto.status === 401) {
        if (jaTentouRenovarToken) {
          logErro(CONTEXTO_LOG, { ...camposDeLog, resultado: "erro", tentativaNumero: tentativa, codigoErroGoogle: 401 });
          throw new ErroDeAutenticacaoStorage(
            "Autenticação Drive falhou mesmo após renovação de access token.",
            erroBruto,
          );
        }
        jaTentouRenovarToken = true;
        invalidarCacheAccessTokenDrive();
        logAviso(CONTEXTO_LOG, { ...camposDeLog, resultado: "retentativa", motivo: "401-renovacao-token", tentativaNumero: tentativa });
        tentativa--; // renovação de token não consome orçamento de backoff (§4.5)
        continue;
      }

      const codigoErroGoogle = razaoGoogle(erroBruto.corpo) ?? erroBruto.status;

      if (!ehRetryable(erroBruto)) {
        logErro(CONTEXTO_LOG, { ...camposDeLog, resultado: "erro", tentativaNumero: tentativa, codigoErroGoogle });
        throw traduzirErroTerminal(erroBruto);
      }

      if (tentativa >= tentativasMax) {
        logErro(CONTEXTO_LOG, { ...camposDeLog, resultado: "erro", tentativaNumero: tentativa, codigoErroGoogle });
        throw traduzirErroTerminal(erroBruto);
      }

      const atrasoMs = calcularBackoffMs(tentativa, erroBruto.retryAfterMs);
      logAviso(CONTEXTO_LOG, { ...camposDeLog, resultado: "retentativa", tentativaNumero: tentativa, codigoErroGoogle, atrasoMs: Math.round(atrasoMs) });
      await sleep(atrasoMs);
    }
  }
}

/** Chamada única (sem retry) à Drive API, autenticada, lançando `ErroHttpBrutoDrive` em falha. */
export async function chamarDriveApi(caminho: string, init: RequestInit = {}, base = DRIVE_API): Promise<Response> {
  const accessToken = await obterAccessTokenDrive();

  let resposta: Response;
  try {
    resposta = await fetch(`${base}${caminho}`, {
      ...init,
      headers: { ...init.headers, Authorization: `Bearer ${accessToken}` },
    });
  } catch (erroDeRede) {
    throw new ErroHttpBrutoDrive(0, erroDeRede);
  }

  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => undefined);
    throw new ErroHttpBrutoDrive(resposta.status, corpo, parsearRetryAfter(resposta.headers.get("Retry-After")));
  }

  return resposta;
}

export { DRIVE_UPLOAD_API };
