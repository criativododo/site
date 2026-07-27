import { env } from "../../config/env.js";
import { competenciaCorrente } from "./competencia.js";
import type { Entrega } from "./entrega.types.js";

/**
 * Armazenamento em memória — placeholder deliberado (mesma decisão de
 * identidade.repository.ts): nenhuma tecnologia de persistência foi decidida para o Portal.
 * Seed inicial existe só para dar dado real à Parceira de dev/QA (env.parceiraSeed), já que
 * SPEC-012 (Entrega) não está implementada fisicamente neste repositório (PORTAL_BACKLOG.md
 * EPIC 2 permite dado gerado por seed).
 */
function seedInicial(): Entrega[] {
  if (!env.parceiraSeed.id) {
    return [];
  }

  const mes = competenciaCorrente();
  return [
    {
      id: "entrega-seed-1",
      parceiraId: env.parceiraSeed.id,
      mesReferencia: mes,
      formato: "Reel",
      estado: "AGUARDANDO_MATERIAL",
      dataEntrega: `${mes}-10`,
      materialEnviado: null,
    },
    {
      id: "entrega-seed-2",
      parceiraId: env.parceiraSeed.id,
      mesReferencia: mes,
      formato: "Carrossel",
      estado: "AGUARDANDO_MATERIAL",
      dataEntrega: `${mes}-05`,
      materialEnviado: null,
    },
    {
      id: "entrega-seed-3",
      parceiraId: env.parceiraSeed.id,
      mesReferencia: mes,
      formato: "Stories1",
      estado: "EM_REVISAO",
      dataEntrega: `${mes}-15`,
      materialEnviado: null,
    },
  ];
}

/** Exportada (não só a instância) para permitir teste de RN-01/CB-02 com fixtures isoladas. */
export class EntregaRepositorioEmMemoria {
  private entregas: Entrega[];

  constructor(entregas: Entrega[] = seedInicial()) {
    this.entregas = entregas;
  }

  async listarPorParceiraECompetencia(parceiraId: string, mesReferencia: string): Promise<Entrega[]> {
    return this.entregas.filter(
      (entrega) => entrega.parceiraId === parceiraId && entrega.mesReferencia === mesReferencia,
    );
  }

  async buscarPorId(id: string): Promise<Entrega | null> {
    return this.entregas.find((entrega) => entrega.id === id) ?? null;
  }

  /**
   * Substitui a Entrega pelo seu id. Persistência pura — a regra de qual transição é válida
   * (RN-02/CT-03) é responsabilidade do service (conteudo.service.ts), não deste repositório.
   */
  async atualizar(entregaAtualizada: Entrega): Promise<Entrega> {
    const indice = this.entregas.findIndex((entrega) => entrega.id === entregaAtualizada.id);
    if (indice === -1) {
      throw new Error(`Entrega inexistente para atualização: ${entregaAtualizada.id}`);
    }
    this.entregas[indice] = entregaAtualizada;
    return entregaAtualizada;
  }
}

export const entregaRepositorio = new EntregaRepositorioEmMemoria();
