import { resolvedorDeCep, type DadosDeEndereco } from "./cep.resolver.js";
import { perfilRepositorio } from "./perfil.repository.js";
import type { Endereco, PerfilParceira } from "./perfil.types.js";

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

/**
 * RN-01: recompõe rua/bairro/cidade/uf a partir do CEP resolvido. RN-02 (degradável): se o
 * CEP não resolver, cep/número/complemento são salvos do mesmo jeito — rua/bairro/cidade/uf
 * mantêm o valor anterior (ou vazio, se nunca houve endereço), nunca bloqueiam o salvamento.
 */
export function montarEndereco(
  dados: { cep: string; numero: string; complemento: string },
  dadosResolvidos: DadosDeEndereco | null,
  enderecoAnterior: Endereco | null,
): Endereco {
  return {
    cep: dados.cep,
    numero: dados.numero,
    complemento: dados.complemento,
    rua: dadosResolvidos?.rua ?? enderecoAnterior?.rua ?? "",
    bairro: dadosResolvidos?.bairro ?? enderecoAnterior?.bairro ?? "",
    cidade: dadosResolvidos?.cidade ?? enderecoAnterior?.cidade ?? "",
    uf: dadosResolvidos?.uf ?? enderecoAnterior?.uf ?? "",
  };
}

export type ResultadoAtualizarEndereco =
  | { ok: true; perfil: PerfilParceira; cepResolvido: boolean }
  | { ok: false; motivo: "PERFIL_NAO_ENCONTRADO" };

/** UC-032.03 · Editar endereço por CEP. */
export async function atualizarEndereco(
  parceiraId: string,
  dados: { cep: string; numero: string; complemento: string },
): Promise<ResultadoAtualizarEndereco> {
  const perfilAtual = await perfilRepositorio.buscarPorParceira(parceiraId);
  if (!perfilAtual) {
    return { ok: false, motivo: "PERFIL_NAO_ENCONTRADO" };
  }

  const dadosResolvidos = await resolvedorDeCep.resolver(dados.cep);
  const endereco = montarEndereco(dados, dadosResolvidos, perfilAtual.endereco);
  const atualizado = await perfilRepositorio.atualizar({ ...perfilAtual, endereco });

  return { ok: true, perfil: atualizado, cepResolvido: dadosResolvidos !== null };
}
