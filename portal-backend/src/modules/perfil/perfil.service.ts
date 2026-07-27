import { perfilRepositorio } from "./perfil.repository.js";
import type { PerfilParceira } from "./perfil.types.js";

/** UC-032.01 · Ver perfil (RN-03: só o próprio perfil — garantido por `parceiraId` vir da sessão). */
export async function obterPerfil(parceiraId: string): Promise<PerfilParceira | null> {
  return perfilRepositorio.buscarPorParceira(parceiraId);
}

/**
 * RN-04/CB-02 (SPEC-032/PP-02): único conjunto de campos que este módulo tem permissão de
 * escrever. Qualquer outra chave no corpo da requisição (ex.: campo comercial/vínculo,
 * propriedade de SPEC-002) é recusada explicitamente — nunca ignorada em silêncio.
 */
const CAMPOS_CONTATO_PERMITIDOS = ["pix", "email"] as const;

export type ResultadoAtualizarContato =
  | { ok: true; perfil: PerfilParceira }
  | { ok: false; motivo: "PERFIL_NAO_ENCONTRADO" }
  | { ok: false; motivo: "CAMPO_NAO_PERMITIDO"; campo: string };

/** UC-032.02 · Editar PIX/e-mail. */
export async function atualizarContato(
  parceiraId: string,
  dados: Record<string, unknown>,
): Promise<ResultadoAtualizarContato> {
  for (const campo of Object.keys(dados)) {
    if (!CAMPOS_CONTATO_PERMITIDOS.includes(campo as (typeof CAMPOS_CONTATO_PERMITIDOS)[number])) {
      return { ok: false, motivo: "CAMPO_NAO_PERMITIDO", campo };
    }
  }

  const perfilAtual = await perfilRepositorio.buscarPorParceira(parceiraId);
  if (!perfilAtual) {
    return { ok: false, motivo: "PERFIL_NAO_ENCONTRADO" };
  }

  const atualizado: PerfilParceira = {
    ...perfilAtual,
    pix: typeof dados.pix === "string" && dados.pix.trim() ? dados.pix.trim() : perfilAtual.pix,
    email: typeof dados.email === "string" && dados.email.trim() ? dados.email.trim() : perfilAtual.email,
  };

  return { ok: true, perfil: await perfilRepositorio.atualizar(atualizado) };
}
