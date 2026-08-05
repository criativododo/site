import { briefingRepositorio } from "../briefing/briefing.repository.js";
import type { BlocoBriefing } from "../briefing/briefing.types.js";
import { colaboracaoMensalRepositorio } from "../colaboracao-mensal/colaboracaoMensal.repository.js";
import type { ColaboracaoMensal } from "../colaboracao-mensal/colaboracaoMensal.types.js";
import type { Entrega } from "../conteudo/entrega.types.js";
import { entregaRepositorio } from "../conteudo/entrega.repository.js";
import { documentoEmitidoRepositorio } from "../documentos/documentos.repository.js";
import type { DocumentoEmitido } from "../documentos/documentos.types.js";
import type { Identidade } from "../identidade/identidade.types.js";
import { obrigacaoRepositorio } from "../financeiro/obrigacao.repository.js";
import type { ObrigacaoFinanceira } from "../financeiro/obrigacao.types.js";
import { listarContasPendentes } from "../identidade/identidade.service.js";
import { listarSolicitacoesPendentes } from "../lgpd/exclusao.service.js";
import type { SolicitacaoExclusao } from "../lgpd/exclusao.types.js";
import { parceiraRepositorio } from "../parceira/parceira.repository.js";
import type { Parceira } from "../parceira/parceira.types.js";
import type {
  ExcecaoOperacional,
  FichaParceira,
  IndicadoresAdministrativos,
  IndicadoresOperacionaisMarca,
  PanoramaCampanha,
  ProximoPrazo,
} from "./dashboard.types.js";

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
  blocosBriefing: BlocoBriefing[];
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
    proximosPrazos: calcularProximosPrazos({
      entregas: dados.entregas,
      blocosBriefing: dados.blocosBriefing,
      parceiras: dados.parceiras,
      hoje,
    }),
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
  const [parceiras, entregas, obrigacoes, contasPendentes, solicitacoesExclusao, blocosBriefing] = await Promise.all([
    parceiraRepositorio.listarTodas(),
    entregaRepositorio.listarTodas(),
    obrigacaoRepositorio.listarTodas(),
    listarContasPendentes(),
    listarSolicitacoesPendentes(),
    briefingRepositorio.listarTodos(),
  ]);

  return calcularIndicadores({ parceiras, entregas, obrigacoes, contasPendentes, solicitacoesExclusao, blocosBriefing });
}

/**
 * Núcleo puro (testável sem repositório): projeta `IndicadoresAdministrativos` para o recorte
 * do Administrador da Marca (ADR-022) — só seleciona campos já calculados, não introduz
 * cálculo novo nem consulta módulo algum diretamente.
 */
export function calcularIndicadoresMarca(
  indicadores: IndicadoresAdministrativos,
  excecoes: ExcecaoOperacional[],
): IndicadoresOperacionaisMarca {
  return {
    parceiras: {
      ativas: indicadores.parceiras.ativas,
      total: indicadores.parceiras.total,
    },
    entregas: {
      aguardandoMaterial: indicadores.entregas.aguardandoMaterial,
      emRevisao: indicadores.entregas.emRevisao,
      atrasadas: indicadores.entregas.atrasadas,
    },
    proximosPrazos: indicadores.proximosPrazos,
    excecoes,
  };
}

/**
 * Núcleo puro (testável sem repositório): "pede atenção" da visão da Marca — Entregas que já
 * são exceção agora (atrasada ou em revisão), resolvidas para nome de Parceira. Diferente de
 * `calcularProximosPrazos` (prazo futuro, ainda não vencido), aqui é o que já aconteceu e
 * ainda não foi resolvido.
 */
export function calcularExcecoesOperacionais(dados: {
  entregas: Entrega[];
  parceiras: Parceira[];
  hoje?: string;
}): ExcecaoOperacional[] {
  const hoje = dados.hoje ?? hojeISO();
  const nomePorParceira = new Map(dados.parceiras.map((parceira) => [parceira.id, parceira.nome]));

  const atrasadas: ExcecaoOperacional[] = dados.entregas
    .filter((entrega) => entrega.estado === "AGUARDANDO_MATERIAL" && entrega.dataEntrega < hoje)
    .map((entrega) => ({
      tipo: "atrasado" as const,
      parceiraNome: nomePorParceira.get(entrega.parceiraId) ?? "parceira",
      formato: entrega.formato,
      data: entrega.dataEntrega,
    }));

  const emRevisao: ExcecaoOperacional[] = dados.entregas
    .filter((entrega) => entrega.estado === "EM_REVISAO")
    .map((entrega) => ({
      tipo: "em_revisao" as const,
      parceiraNome: nomePorParceira.get(entrega.parceiraId) ?? "parceira",
      formato: entrega.formato,
      data: null,
    }));

  return [...atrasadas, ...emRevisao];
}

/** UC do Administrador da Marca (ADR-022): mesma agregação administrativa, recorte restrito. */
export async function obterIndicadoresOperacionaisMarca(): Promise<IndicadoresOperacionaisMarca> {
  const [indicadores, parceiras, entregas] = await Promise.all([
    obterIndicadoresAdministrativos(),
    parceiraRepositorio.listarTodas(),
    entregaRepositorio.listarTodas(),
  ]);

  const excecoes = calcularExcecoesOperacionais({ entregas, parceiras });
  return calcularIndicadoresMarca(indicadores, excecoes);
}

/**
 * Núcleo puro (testável sem repositório): pagamentos pendentes **da competência atual**
 * (`mesReferencia` do mês corrente) — diferente de `IndicadoresAdministrativos.financeiro`,
 * que é histórico completo sem recorte de mês. Usado só pela Mesa da Campanha (ADR-023).
 */
export function calcularPagamentosCompetencia(dados: {
  obrigacoes: ObrigacaoFinanceira[];
  competencia: string;
}): { pendentes: number; valorPendente: number } {
  const daCompetencia = dados.obrigacoes.filter((obrigacao) => obrigacao.mesReferencia === dados.competencia);
  const pendentes = daCompetencia.filter((obrigacao) => obrigacao.estado !== "PAGO");
  return {
    pendentes: pendentes.length,
    valorPendente: pendentes.reduce((total, obrigacao) => total + obrigacao.valor, 0),
  };
}

/**
 * Núcleo puro (testável sem repositório): panorama da Mesa da Campanha (ADR-023) — reaproveita
 * integralmente `IndicadoresAdministrativos` (zero regra de negócio duplicada), acrescentando
 * só o que é genuinamente novo desta tela: nomes das Parceiras ativas e pagamentos escopados
 * pela competência atual.
 */
export function calcularPanoramaCampanha(dados: {
  indicadores: IndicadoresAdministrativos;
  parceiras: Parceira[];
  entregas: Entrega[];
  obrigacoes: ObrigacaoFinanceira[];
  hoje?: string;
}): PanoramaCampanha {
  const hoje = dados.hoje ?? hojeISO();
  const competenciaAtual = hoje.slice(0, 7);
  const parceirasAtivas = dados.parceiras.filter((parceira) => parceira.status === "ATIVA");

  return {
    competenciaAtual,
    parceiras: {
      ativas: dados.indicadores.parceiras.ativas,
      inativas: dados.indicadores.parceiras.inativas,
      total: dados.indicadores.parceiras.total,
      nomesAtivas: parceirasAtivas.map((parceira) => parceira.nome),
    },
    entregas: dados.indicadores.entregas,
    proximosPrazos: dados.indicadores.proximosPrazos,
    excecoes: calcularExcecoesOperacionais({ entregas: dados.entregas, parceiras: dados.parceiras, hoje }),
    pagamentos: calcularPagamentosCompetencia({ obrigacoes: dados.obrigacoes, competencia: competenciaAtual }),
  };
}

/** UC da Mesa da Campanha (ADR-023): mesma agregação administrativa, panorama do hub. */
export async function obterPanoramaCampanha(): Promise<PanoramaCampanha> {
  const [indicadores, parceiras, entregas, obrigacoes] = await Promise.all([
    obterIndicadoresAdministrativos(),
    parceiraRepositorio.listarTodas(),
    entregaRepositorio.listarTodas(),
    obrigacaoRepositorio.listarTodas(),
  ]);

  return calcularPanoramaCampanha({ indicadores, parceiras, entregas, obrigacoes });
}

/**
 * Núcleo puro (testável sem repositório): ficha completa de uma Parceira (Central de
 * Influenciadoras, Sprint 2). Reaproveita `calcularProximosPrazos`/`calcularExcecoesOperacionais`
 * já existentes, passando só esta Parceira — zero regra de negócio duplicada.
 */
export function calcularFichaParceira(dados: {
  parceira: Parceira;
  colaboracoesMensais: ColaboracaoMensal[];
  entregas: Entrega[];
  blocosBriefing: BlocoBriefing[];
  obrigacoes: ObrigacaoFinanceira[];
  documentos: DocumentoEmitido[];
  hoje?: string;
}): FichaParceira {
  const hoje = dados.hoje ?? hojeISO();
  const competenciaAtual = hoje.slice(0, 7);

  const colaboracaoAtual =
    dados.colaboracoesMensais.find((colaboracao) => colaboracao.mesReferencia === competenciaAtual) ?? null;
  const historicoColaboracoes = dados.colaboracoesMensais
    .filter((colaboracao) => colaboracao.mesReferencia !== competenciaAtual)
    .sort((a, b) => b.mesReferencia.localeCompare(a.mesReferencia));

  const obrigacoesPendentes = dados.obrigacoes.filter((obrigacao) => obrigacao.estado !== "PAGO");
  const obrigacoesPagas = dados.obrigacoes.filter((obrigacao) => obrigacao.estado === "PAGO");

  const parceiras = [dados.parceira];

  return {
    parceira: dados.parceira,
    competenciaAtual,
    colaboracaoAtual,
    historicoColaboracoes,
    entregas: {
      aguardandoMaterial: dados.entregas.filter((entrega) => entrega.estado === "AGUARDANDO_MATERIAL").length,
      emRevisao: dados.entregas.filter((entrega) => entrega.estado === "EM_REVISAO").length,
      atrasadas: dados.entregas.filter(
        (entrega) => entrega.estado === "AGUARDANDO_MATERIAL" && entrega.dataEntrega < hoje,
      ).length,
    },
    proximosPrazos: calcularProximosPrazos({ entregas: dados.entregas, blocosBriefing: dados.blocosBriefing, parceiras, hoje }),
    excecoes: calcularExcecoesOperacionais({ entregas: dados.entregas, parceiras, hoje }),
    financeiro: {
      obrigacoesPendentes,
      obrigacoesPagas,
      valorPendente: obrigacoesPendentes.reduce((total, obrigacao) => total + obrigacao.valor, 0),
    },
    documentos: [...dados.documentos].sort((a, b) => b.geradoEm.localeCompare(a.geradoEm)),
  };
}

/** UC da Central de Influenciadoras (Sprint 2): agrega os módulos existentes para uma Parceira. Retorna `null` se o id não existir. */
export async function obterFichaParceira(parceiraId: string): Promise<FichaParceira | null> {
  const parceira = await parceiraRepositorio.buscarPorId(parceiraId);
  if (!parceira) {
    return null;
  }

  const [colaboracoesMensais, entregas, obrigacoes, documentos, blocosBriefingTodos] = await Promise.all([
    colaboracaoMensalRepositorio.listarPorParceira(parceiraId),
    entregaRepositorio.listarPorParceira(parceiraId),
    obrigacaoRepositorio.listarPorParceira(parceiraId),
    documentoEmitidoRepositorio.listarPorParceiraId(parceiraId),
    briefingRepositorio.listarTodos(),
  ]);

  const blocosBriefing = blocosBriefingTodos.filter((bloco) => bloco.parceiraId === parceiraId);

  return calcularFichaParceira({ parceira, colaboracoesMensais, entregas, blocosBriefing, obrigacoes, documentos });
}
