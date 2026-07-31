/**
 * AuditLog de PII do Motor de Documentos (Fase 5, motor §1.5) — Incremento 3.
 *
 * Whitelist oficial do domínio (`CONTRATO_SOBERANO.md` §5): PII = `PIX`, `CNPJ`, `Endereco`,
 * sempre associados à Parceira. `EventoAuditoriaPlaceholderPII` nunca carrega o valor
 * resolvido — só o caminho do placeholder (ex.: "parceira.pix"), nunca "PIX: 123..." —, mesma
 * regra já seguida por `middleware/auditoria.ts` (ADR-010 ponto 4: PII nunca em log).
 */

export interface EventoAuditoriaPlaceholderPII {
  caminho: string;
  templateVersaoId: string;
  parceiraId: string;
  ator: string;
  ocorridoEm: string;
}

export interface PortaAuditLogPII {
  registrar(evento: EventoAuditoriaPlaceholderPII): Promise<void>;
}

const PREFIXOS_PII = ["parceira.cnpj", "parceira.pix", "parceira.endereco"];

export function ehPlaceholderPII(caminho: string): boolean {
  return PREFIXOS_PII.some((prefixo) => caminho === prefixo || caminho.startsWith(`${prefixo}.`));
}

/** Placeholder de infraestrutura persistente — mesmo padrão de `middleware/auditoria.ts`. */
export class AuditLogPIIEmMemoria implements PortaAuditLogPII {
  private eventos: EventoAuditoriaPlaceholderPII[] = [];

  async registrar(evento: EventoAuditoriaPlaceholderPII): Promise<void> {
    this.eventos.push(evento);
  }

  /** Exposta só para inspeção em teste — nunca para edição (mesmo padrão de `trilhaAuditoriaSomenteLeitura`). */
  eventosRegistrados(): readonly EventoAuditoriaPlaceholderPII[] {
    return this.eventos;
  }
}
