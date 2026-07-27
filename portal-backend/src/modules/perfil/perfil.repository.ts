import { env } from "../../config/env.js";
import type { PerfilParceira } from "./perfil.types.js";

/** Armazenamento em memória — mesma decisão de entrega.repository.ts. */
function seedInicial(): PerfilParceira[] {
  if (!env.parceiraSeed.id) {
    return [];
  }

  return [
    {
      parceiraId: env.parceiraSeed.id,
      pix: "000.000.000-00",
      email: env.parceiraSeed.email || "parceira-seed@dodo.dev",
      endereco: null,
    },
  ];
}

/** Exportada (não só a instância) para permitir teste com fixtures isoladas. */
export class PerfilRepositorioEmMemoria {
  private perfis: PerfilParceira[];

  constructor(perfis: PerfilParceira[] = seedInicial()) {
    this.perfis = perfis;
  }

  async buscarPorParceira(parceiraId: string): Promise<PerfilParceira | null> {
    return this.perfis.find((perfil) => perfil.parceiraId === parceiraId) ?? null;
  }

  async atualizar(perfilAtualizado: PerfilParceira): Promise<PerfilParceira> {
    const indice = this.perfis.findIndex((perfil) => perfil.parceiraId === perfilAtualizado.parceiraId);
    if (indice === -1) {
      this.perfis.push(perfilAtualizado);
      return perfilAtualizado;
    }
    this.perfis[indice] = perfilAtualizado;
    return perfilAtualizado;
  }
}

export const perfilRepositorio = new PerfilRepositorioEmMemoria();
