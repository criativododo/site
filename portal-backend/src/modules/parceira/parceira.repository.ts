import type { Parceira } from "./parceira.types.js";

/** Armazenamento em memória — mesma decisão de entrega.repository.ts (nenhum banco decidido ainda). */
export class ParceiraRepositorioEmMemoria {
  private parceiras: Parceira[];

  constructor(parceiras: Parceira[] = []) {
    this.parceiras = parceiras;
  }

  async listarTodas(): Promise<Parceira[]> {
    return this.parceiras;
  }

  async buscarPorId(id: string): Promise<Parceira | null> {
    return this.parceiras.find((parceira) => parceira.id === id) ?? null;
  }

  async criar(parceira: Parceira): Promise<Parceira> {
    this.parceiras.push(parceira);
    return parceira;
  }

  async atualizar(parceiraAtualizada: Parceira): Promise<Parceira> {
    const indice = this.parceiras.findIndex((parceira) => parceira.id === parceiraAtualizada.id);
    if (indice === -1) {
      throw new Error(`Parceira inexistente para atualização: ${parceiraAtualizada.id}`);
    }
    this.parceiras[indice] = parceiraAtualizada;
    return parceiraAtualizada;
  }
}

export const parceiraRepositorio = new ParceiraRepositorioEmMemoria();
