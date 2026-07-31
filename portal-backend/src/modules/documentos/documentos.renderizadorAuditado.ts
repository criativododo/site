/**
 * Integração entre o renderizador de placeholders (Incremento 1) e o AuditLog de PII
 * (Incremento 3, motor §1.5). Efeito colateral isolado: `documentos.renderizador.ts`
 * permanece uma função pura, sem I/O — este módulo só compõe essa função pura com a `Porta`
 * de auditoria, nunca o contrário.
 *
 * Fail-closed por decisão explícita do responsável do projeto (31/07/2026): se o AuditLog
 * falhar, o erro propaga e o texto renderizado não é retornado — quem orquestra a emissão do
 * documento decide o que fazer com essa falha (este módulo não conhece `DocumentoEmitido` nem
 * regras de emissão, só resolve texto + audita).
 */

import type { ContextoRenderizacao } from "./documentos.renderizador.js";
import { resolverPlaceholders } from "./documentos.renderizador.js";
import type { PortaAuditLogPII } from "./documentos.auditLogPII.js";
import { ehPlaceholderPII } from "./documentos.auditLogPII.js";

export interface MetadadosAuditoriaRenderizacao {
  templateVersaoId: string;
  parceiraId: string;
  ator: string;
}

const BLOCO_PLACEHOLDER = /\{\{(.*?)\}\}/gs;

function extrairCaminhosPII(conteudo: string): string[] {
  const caminhos: string[] = [];
  for (const [, caminhoBruto] of conteudo.matchAll(BLOCO_PLACEHOLDER)) {
    const caminho = caminhoBruto.trim();
    if (ehPlaceholderPII(caminho)) {
      caminhos.push(caminho);
    }
  }
  return caminhos;
}

export async function resolverPlaceholdersAuditado(
  conteudo: string,
  contexto: ContextoRenderizacao,
  portaAuditLog: PortaAuditLogPII,
  metadados: MetadadosAuditoriaRenderizacao,
): Promise<string> {
  const resultado = resolverPlaceholders(conteudo, contexto);

  for (const caminho of extrairCaminhosPII(conteudo)) {
    await portaAuditLog.registrar({
      caminho,
      templateVersaoId: metadados.templateVersaoId,
      parceiraId: metadados.parceiraId,
      ator: metadados.ator,
      ocorridoEm: new Date().toISOString(),
    });
  }

  return resultado;
}
