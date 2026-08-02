import type { BlocoBriefing } from "../briefing/briefing.types.js";
import type { Entrega } from "../conteudo/entrega.types.js";
import type { Identidade } from "../identidade/identidade.types.js";
import { entregaRepositorio } from "../conteudo/entrega.repository.js";
import { obrigacaoRepositorio } from "../financeiro/obrigacao.repository.js";
import type { ObrigacaoFinanceira } from "../financeiro/obrigacao.types.js";
import { listarContasPendentes } from "../identidade/identidade.service.js";
import { listarSolicitacoesPendentes } from "../lgpd/exclusao.service.js";
import type { SolicitacaoExclusao } from "../lgpd/exclusao.types.js";
import { parceiraRepositorio } from "../parceira/parceira.repository.js";
import type { Parceira } from "../parceira/parceira.types.js";
import type { IndicadoresAdministrativos, ProximoPrazo } from "./dashboard.types.js";

/** `AAAA-MM-DD` de hoje (UTC) — comparável lexicograficamente com `Entrega.dataEntrega`. */
function hojeISO(referencia: Date = new Date()): string {
  return referencia.toISOString().slice(0, 10);
}

/**
 * Núcleo puro (testável sem repositório): painel operacional do Administrador — responde
 * "onde eu preciso agir agora" em contagens, sem gráfico. Não introduz agregado novo, só
 * conta/soma o que os módulos existentes já expõem.
 */
export function calcularIndicadores(dados: {
  parceiras: Parceira[];
  entregas: Entrega[];
  obrigacoes: ObrigacaoFinanceira[];
  contasPendentes: Identidade[];
  solicitacoesExclusao: SolicitacaoExclusao[];
  hoje?: string;
}): IndicadoresAdministrativos {
  const hoje = dados.hoje ?? hojeISO();
  const obrigacoesPendentes = dados.obrigacoes.filter((obrigacao) => obrigacao.estado !== "PAGO");

  return {
    parceiras: {
      ativas: dados.parceiras.filter((parceira) => parceira.status === "ATIVA").length,
      inativas: dados.parceiras.filter((parceira) => parceira.status === "INATIVA").length,
      total: dados.parceiras.length,
    },
    entregas: {
      aguardandoMaterial: dados.entregas.filter((entrega) => entrega.estado === "AGUARDANDO_MATERIAL").length,
      emRevisao: dados.entregas.filter((entrega) => entrega.estado === "EM_REVISAO").length,
      atrasadas: dados.entregas.filter(
        (entrega) => entrega.estado === "AGUARDANDO_MATERIAL" && entrega.dataEntrega < hoje,
      ).length,
    },
    financeiro: {
      pendentes: obrigacoesPendentes.length,
      valorPendente: obrigacoesPendentes.reduce((total, obrigacao) => total + obrigacao.valor, 0),
    },
    lgpd: {
      solicitacoesExclusaoPendentes: dados.solicitacoesExclusao.length,
    },
    moderacao: {
      contasPendentes: dados.contasPendentes.length,
    },
    proximosPrazos: [],
  };
}

/**
 * Núcleo puro (testável sem repositório): "o que vem a seguir" — Entregas
 * AGUARDANDO_MATERIAL e postagens de Briefing ainda não vencidas, mais próximas primeiro.
 * Prazos já vencidos não entram aqui — já estão cobertos por `entregas.atrasadas` no Bloco
 * de atenção agora (ART_DIRECTION_GUIDE.md, Dashboard Sprint 2).
 */
export function calcularProximosPrazos(dados: {
  entregas: Entrega[];
  blocosBriefing: BlocoBriefing[];
  parceiras: Parceira[];
  hoje?: string;
  limite?: number;
}): ProximoPrazo[] {
  const hoje = dados.hoje ?? hojeISO();
  const limite = dados.limite ?? 5;
  const nomePorParceira = new Map(dados.parceiras.map((parceira) => [parceira.id, parceira.nome]));

  function diasRestantes(data: string): number {
    return Math.round((Date.parse(`${data}T00:00:00Z`) - Date.parse(`${hoje}T00:00:00Z`)) / 86_400_000);
  }

  const deEntregas: ProximoPrazo[] = dados.entregas
    .filter((entrega) => entrega.estado === "AGUARDANDO_MATERIAL" && entrega.dataEntrega >= hoje)
    .map((entrega) => ({
      tipo: "entrega" as const,
      parceiraNome: nomePorParceira.get(entrega.parceiraId) ?? "parceira",
      formato: entrega.formato,
      data: entrega.dataEntrega,
      diasRestantes: diasRestantes(entrega.dataEntrega),
    }));

  const deBriefings: ProximoPrazo[] = dados.blocosBriefing
    .filter((bloco) => bloco.dataPostagem >= hoje)
    .map((bloco) => ({
      tipo: "postagem" as const,
      parceiraNome: nomePorParceira.get(bloco.parceiraId) ?? "parceira",
      formato: bloco.formato,
      data: bloco.dataPostagem,
      diasRestantes: diasRestantes(bloco.dataPostagem),
    }));

  return [...deEntregas, ...deBriefings].sort((a, b) => a.data.localeCompare(b.data)).slice(0, limite);
}

/** UC administrativo: reúne o estado atual de todos os módulos e aplica `calcularIndicadores`. */
export async function obterIndicadoresAdministrativos(): Promise<IndicadoresAdministrativos> {
  const [parceiras, entregas, obrigacoes, contasPendentes, solicitacoesExclusao] = await Promise.all([
    parceiraRepositorio.listarTodas(),
    entregaRepositorio.listarTodas(),
    obrigacaoRepositorio.listarTodas(),
    listarContasPendentes(),
    listarSolicitacoesPendentes(),
  ]);

  return calcularIndicadores({ parceiras, entregas, obrigacoes, contasPendentes, solicitacoesExclusao });
}
