import type { Identidade } from "./identidade.types.js";

/**
 * Armazenamento em memória — placeholder deliberado. Nenhuma tecnologia de persistência foi
 * decidida para o Portal (pendência aberta `PORTAL_BRIEFING.md` §13 item 7, infraestrutura de
 * produção); esta camada isola o resto do módulo de identidade dessa decisão futura. Trocar
 * a implementação por um repositório real (Postgres ou o que for decidido) não deve exigir
 * mudança em `identidade.service.ts`.
 */
class IdentidadeRepositorioEmMemoria {
  private porSub = new Map<string, Identidade>();

  async buscarPorSub(subProvider: string): Promise<Identidade | null> {
    return this.porSub.get(subProvider) ?? null;
  }

  async buscarPorEmail(email: string): Promise<Identidade | null> {
    const emailNormalizado = email.trim().toLowerCase();
    for (const identidade of this.porSub.values()) {
      if (identidade.emailPerfil.toLowerCase() === emailNormalizado) {
        return identidade;
      }
    }
    return null;
  }

  async salvar(identidade: Identidade): Promise<Identidade> {
    this.porSub.set(identidade.subProvider, identidade);
    return identidade;
  }

  /** UC-035 (Feature 5.3, Moderação): lista contas por estado, para a fila de aprovação do Administrador. */
  async listarPorEstado(estadoConta: Identidade["estadoConta"]): Promise<Identidade[]> {
    return [...this.porSub.values()].filter((identidade) => identidade.estadoConta === estadoConta);
  }
}

export const identidadeRepositorio = new IdentidadeRepositorioEmMemoria();
