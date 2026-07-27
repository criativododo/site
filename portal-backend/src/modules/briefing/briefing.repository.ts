import { env } from "../../config/env.js";
import { competenciaCorrente } from "../conteudo/competencia.js";
import type { BlocoBriefing } from "./briefing.types.js";

/**
 * Armazenamento em memória — mesma decisão de entrega.repository.ts. Seed alinhado aos
 * mesmos (parceiraId, mesReferencia, formato) das Entregas seedadas em
 * conteudo/entrega.repository.ts, já que Briefing (SPEC-009) não está implementado
 * fisicamente aqui.
 */
function seedInicial(): BlocoBriefing[] {
  if (!env.parceiraSeed.id) {
    return [];
  }

  const mes = competenciaCorrente();
  const agora = new Date().toISOString();
  return [
    {
      id: "briefing-seed-1",
      parceiraId: env.parceiraSeed.id,
      mesReferencia: mes,
      formato: "Reel",
      look: "Look 1 — casual",
      dataEntrega: `${mes}-10`,
      dataPostagem: `${mes}-20`,
      orientacao: "Reel de unboxing, tom leve, até 30s.",
      dataCriacao: agora,
      dataAtualizacao: agora,
    },
    {
      id: "briefing-seed-2",
      parceiraId: env.parceiraSeed.id,
      mesReferencia: mes,
      formato: "Carrossel",
      look: "Look 2 — noite",
      dataEntrega: `${mes}-05`,
      dataPostagem: `${mes}-18`,
      orientacao: "Carrossel de 5 fotos mostrando o produto em uso.",
      dataCriacao: agora,
      dataAtualizacao: agora,
    },
    {
      id: "briefing-seed-3",
      parceiraId: env.parceiraSeed.id,
      mesReferencia: mes,
      formato: "Stories1",
      look: "Look 1 — casual",
      dataEntrega: `${mes}-15`,
      dataPostagem: `${mes}-22`,
      orientacao: "Stories de bastidor, sem roteiro fixo.",
      dataCriacao: agora,
      dataAtualizacao: agora,
    },
  ];
}

/** Exportada (não só a instância) para permitir teste com fixtures isoladas. */
export class BriefingRepositorioEmMemoria {
  private blocos: BlocoBriefing[];

  constructor(blocos: BlocoBriefing[] = seedInicial()) {
    this.blocos = blocos;
  }

  async buscarBloco(
    parceiraId: string,
    mesReferencia: string,
    formato: BlocoBriefing["formato"],
  ): Promise<BlocoBriefing | null> {
    return (
      this.blocos.find(
        (bloco) =>
          bloco.parceiraId === parceiraId &&
          bloco.mesReferencia === mesReferencia &&
          bloco.formato === formato,
      ) ?? null
    );
  }

  /** Backoffice — leitura irrestrita de todos os Blocos (Administrador vê tudo). */
  async listarTodos(): Promise<BlocoBriefing[]> {
    return this.blocos;
  }

  async buscarPorId(id: string): Promise<BlocoBriefing | null> {
    return this.blocos.find((bloco) => bloco.id === id) ?? null;
  }

  /** Criação administrativa. Persistência pura — unicidade por chave natural é responsabilidade do service. */
  async criar(bloco: BlocoBriefing): Promise<BlocoBriefing> {
    this.blocos.push(bloco);
    return bloco;
  }

  /** Carimba `dataAtualizacao` aqui, mesma disciplina de entrega.repository.ts::atualizar. */
  async atualizar(blocoAtualizado: BlocoBriefing): Promise<BlocoBriefing> {
    const indice = this.blocos.findIndex((bloco) => bloco.id === blocoAtualizado.id);
    if (indice === -1) {
      throw new Error(`Bloco de Briefing inexistente para atualização: ${blocoAtualizado.id}`);
    }
    const atualizado: BlocoBriefing = { ...blocoAtualizado, dataAtualizacao: new Date().toISOString() };
    this.blocos[indice] = atualizado;
    return atualizado;
  }

  /** Remoção administrativa (RN de "quando permitido" é responsabilidade do service). */
  async remover(id: string): Promise<void> {
    const indice = this.blocos.findIndex((bloco) => bloco.id === id);
    if (indice === -1) {
      throw new Error(`Bloco de Briefing inexistente para remoção: ${id}`);
    }
    this.blocos.splice(indice, 1);
  }
}

export const briefingRepositorio = new BriefingRepositorioEmMemoria();
