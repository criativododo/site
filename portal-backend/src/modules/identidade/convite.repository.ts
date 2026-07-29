import type { ConviteCadastro } from "./convite.types.js";

/**
 * Armazenamento em memória — mesmo placeholder deliberado do restante do módulo de identidade
 * (ver identidade.repository.ts): nenhuma tecnologia de persistência foi decidida para o Portal.
 */
class ConviteRepositorioEmMemoria {
  private porToken = new Map<string, ConviteCadastro>();

  async criar(convite: ConviteCadastro): Promise<ConviteCadastro> {
    this.porToken.set(convite.token, convite);
    return convite;
  }

  async buscarPorToken(token: string): Promise<ConviteCadastro | null> {
    return this.porToken.get(token) ?? null;
  }

  async salvar(convite: ConviteCadastro): Promise<ConviteCadastro> {
    this.porToken.set(convite.token, convite);
    return convite;
  }

  async listarTodos(): Promise<ConviteCadastro[]> {
    return [...this.porToken.values()].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  }
}

export const conviteRepositorio = new ConviteRepositorioEmMemoria();
