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
  return [
    {
      parceiraId: env.parceiraSeed.id,
      mesReferencia: mes,
      formato: "Reel",
      look: "Look 1 — casual",
      dataEntrega: `${mes}-10`,
      dataPostagem: `${mes}-20`,
      orientacao: "Reel de unboxing, tom leve, até 30s.",
    },
    {
      parceiraId: env.parceiraSeed.id,
      mesReferencia: mes,
      formato: "Carrossel",
      look: "Look 2 — noite",
      dataEntrega: `${mes}-05`,
      dataPostagem: `${mes}-18`,
      orientacao: "Carrossel de 5 fotos mostrando o produto em uso.",
    },
    {
      parceiraId: env.parceiraSeed.id,
      mesReferencia: mes,
      formato: "Stories1",
      look: "Look 1 — casual",
      dataEntrega: `${mes}-15`,
      dataPostagem: `${mes}-22`,
      orientacao: "Stories de bastidor, sem roteiro fixo.",
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
}

export const briefingRepositorio = new BriefingRepositorioEmMemoria();
