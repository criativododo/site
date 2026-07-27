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
import type { IndicadoresAdministrativos } from "./dashboard.types.js";

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
  };
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
