import { env } from "../../config/env.js";
import { identidadeRepositorio } from "./identidade.repository.js";
import type { Identidade } from "./identidade.types.js";

export interface ClaimsGoogle {
  sub: string;
  email: string;
  emailVerificado: boolean;
  nome: string;
}

/**
 * Implementa o fluxo de resolução de identidade de SPEC-035 Cap. 5/9-10 (ADR-007):
 *
 *   sub existente            → conta já resolvida, só atualiza último acesso.
 *   sub inexistente           → nasce PENDING (INFLUENCIADORA), EXCETO se o e-mail estiver
 *                               na lista de bootstrap (RN-07), caso em que nasce ACTIVE
 *                               como ADMINISTRADOR.
 *
 * A vinculação de uma Parceira pré-existente a uma identidade nova por coincidência de
 * e-mail é, por decisão de SPEC-035 §5.1-A, sempre um fluxo de CONFIRMAÇÃO MANUAL EXPLÍCITA
 * da usuária — nunca associação automática silenciosa. Esse fluxo de confirmação (e o
 * próprio modelo de Parceira) ainda não existem neste EPIC (fundação); por isso toda conta
 * nova nasce sem `parceiraId`, independentemente de e-mail coincidente. Não inventar aqui um
 * atalho de auto-vinculação — ver ADR-003.
 */
export async function resolverOuCriarIdentidade(claims: ClaimsGoogle): Promise<Identidade> {
  const existente = await identidadeRepositorio.buscarPorSub(claims.sub);
  const agora = new Date().toISOString();

  if (existente) {
    const atualizada: Identidade = { ...existente, ultimoAcesso: agora };
    return identidadeRepositorio.salvar(atualizada);
  }

  const ehBootstrapAdministrador = env.adminBootstrapEmails.includes(
    claims.email.trim().toLowerCase(),
  );

  const nova: Identidade = {
    subProvider: claims.sub,
    emailPerfil: claims.email,
    nomeCompleto: claims.nome,
    papelAtor: ehBootstrapAdministrador ? "ADMINISTRADOR" : "INFLUENCIADORA",
    estadoConta: ehBootstrapAdministrador ? "ACTIVE" : "PENDING",
    parceiraId: null,
    dataCriacao: agora,
    ultimoAcesso: agora,
  };

  return identidadeRepositorio.salvar(nova);
}
