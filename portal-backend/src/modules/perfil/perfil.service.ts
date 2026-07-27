import { perfilRepositorio } from "./perfil.repository.js";
import type { PerfilParceira } from "./perfil.types.js";

/** UC-032.01 · Ver perfil (RN-03: só o próprio perfil — garantido por `parceiraId` vir da sessão). */
export async function obterPerfil(parceiraId: string): Promise<PerfilParceira | null> {
  return perfilRepositorio.buscarPorParceira(parceiraId);
}
