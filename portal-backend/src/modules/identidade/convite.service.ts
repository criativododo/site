import { randomUUID } from "node:crypto";
import { conviteRepositorio } from "./convite.repository.js";
import type { ConviteCadastro } from "./convite.types.js";

export async function gerarConvite(criadoPor: string): Promise<ConviteCadastro> {
  const convite: ConviteCadastro = {
    token: randomUUID(),
    criadoPor,
    criadoEm: new Date().toISOString(),
    usadoEm: null,
    usadoPorSub: null,
  };
  return conviteRepositorio.criar(convite);
}

export async function listarConvites(): Promise<ConviteCadastro[]> {
  return conviteRepositorio.listarTodos();
}

/** Válido só se existir e ainda não tiver sido usado — convite é sempre de uso único. */
export async function buscarConviteValido(token: string): Promise<ConviteCadastro | null> {
  const convite = await conviteRepositorio.buscarPorToken(token);
  if (!convite || convite.usadoEm) {
    return null;
  }
  return convite;
}

export async function consumirConvite(token: string, subProvider: string): Promise<void> {
  const convite = await conviteRepositorio.buscarPorToken(token);
  if (!convite || convite.usadoEm) {
    return;
  }
  await conviteRepositorio.salvar({
    ...convite,
    usadoEm: new Date().toISOString(),
    usadoPorSub: subProvider,
  });
}
