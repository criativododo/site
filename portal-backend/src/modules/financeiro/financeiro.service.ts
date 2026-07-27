import { randomUUID } from "node:crypto";
import { projetarPendencias } from "../conteudo/conteudo.service.js";
import { entregaRepositorio } from "../conteudo/entrega.repository.js";
import type { Entrega, ItemDePendencia } from "../conteudo/entrega.types.js";
import { parceiraRepositorio } from "../parceira/parceira.repository.js";
import { obrigacaoRepositorio } from "./obrigacao.repository.js";
import type { ObrigacaoFinanceira, TipoObrigacao } from "./obrigacao.types.js";

/**
 * UC-030.03 · Selecionar período (RN-04): só competências com atividade real da Parceira —
 * união dos meses em que houve Entrega (SPEC-012) ou Obrigação Financeira (SPEC-020). Mais
 * recente primeiro.
 */
export async function listarPeriodosComAtividade(parceiraId: string): Promise<string[]> {
  const [entregas, obrigacoes] = await Promise.all([
    entregaRepositorio.listarPorParceira(parceiraId),
    obrigacaoRepositorio.listarPorParceira(parceiraId),
  ]);

  const periodos = new Set([
    ...entregas.map((entrega) => entrega.mesReferencia),
    ...obrigacoes.map((obrigacao) => obrigacao.mesReferencia),
  ]);

  return [...periodos].sort().reverse();
}

async function periodoTemAtividade(parceiraId: string, mesReferencia: string): Promise<boolean> {
  const periodos = await listarPeriodosComAtividade(parceiraId);
  return periodos.includes(mesReferencia);
}

/** CB-02: `EM_ABERTO`/`APROVADO` contam em previsto, não em pago — só `PAGO` conta como pago. */
export function calcularResumoFinanceiro(obrigacoes: ObrigacaoFinanceira[]): {
  previsto: number;
  pago: number;
} {
  const previsto = obrigacoes.reduce((total, obrigacao) => total + obrigacao.valor, 0);
  const pago = obrigacoes
    .filter((obrigacao) => obrigacao.estado === "PAGO")
    .reduce((total, obrigacao) => total + obrigacao.valor, 0);

  return { previsto, pago };
}

/**
 * UC-030.01 · Ver financeiro do período. PF-02: período sem atividade da Parceira → null
 * (rota traduz para 404, mesma disciplina de não revelar dado de outra Parceira/período).
 */
export async function obterResumoFinanceiro(
  parceiraId: string,
  mesReferencia: string,
): Promise<{ mesReferencia: string; previsto: number; pago: number } | null> {
  if (!(await periodoTemAtividade(parceiraId, mesReferencia))) {
    return null;
  }

  const obrigacoes = await obrigacaoRepositorio.listarPorParceiraECompetencia(parceiraId, mesReferencia);
  return { mesReferencia, ...calcularResumoFinanceiro(obrigacoes) };
}

export interface ItemDeHistorico {
  entregas: ItemDePendencia[];
  obrigacoes: ObrigacaoFinanceira[];
}

/**
 * UC-030.02 · Consultar histórico (INV-02: somente leitura). PF-02: mesmo tratamento de
 * `obterResumoFinanceiro`.
 */
export async function obterHistorico(
  parceiraId: string,
  mesReferencia: string,
): Promise<ItemDeHistorico | null> {
  if (!(await periodoTemAtividade(parceiraId, mesReferencia))) {
    return null;
  }

  const [entregas, obrigacoes] = await Promise.all([
    entregaRepositorio.listarPorParceiraECompetencia(parceiraId, mesReferencia),
    obrigacaoRepositorio.listarPorParceiraECompetencia(parceiraId, mesReferencia),
  ]);

  return { entregas: projetarPendencias(entregas), obrigacoes };
}

/**
 * ADR-009/SPEC-020 §9 (PG-05): elegível para liberação quando todas as Entregas estão
 * `APROVADO`/`PUBLICADO` (`Publicado` já passou por `Aprovado`, SPEC-012 §9); sem Entregas na
 * competência, vacuamente elegível (nada pendente de aprovação).
 */
export function calcularElegibilidadeMensal(entregas: Entrega[]): boolean {
  return entregas.every((entrega) => entrega.estado === "APROVADO" || entrega.estado === "PUBLICADO");
}

/** Backoffice — projeção administrativa: cada Obrigação com as Entregas da sua competência e a elegibilidade calculada. */
export interface ObrigacaoComEntregas extends ObrigacaoFinanceira {
  entregasDaCompetencia: ItemDePendencia[];
  elegivelParaLiberacao: boolean;
}

/**
 * Monta a projeção administrativa a partir das Entregas já buscadas. Único ponto que decide
 * `elegivelParaLiberacao` — toda rota (listar/criar/editar/liberar/pagar) passa por aqui, para
 * que a resposta da API nunca varie de formato entre si (mesma lição aprendida em
 * briefing.service.ts: devolver o registro cru sem o vínculo fazia a UI perder de vista a
 * elegibilidade logo após criar/liberar).
 */
function comEntregas(obrigacao: ObrigacaoFinanceira, entregas: Entrega[]): ObrigacaoComEntregas {
  return {
    ...obrigacao,
    entregasDaCompetencia: projetarPendencias(entregas),
    elegivelParaLiberacao: obrigacao.tipo === "AVULSO" || calcularElegibilidadeMensal(entregas),
  };
}

async function buscarEntregasDaCompetencia(obrigacao: ObrigacaoFinanceira): Promise<Entrega[]> {
  return entregaRepositorio.listarPorParceiraECompetencia(obrigacao.parceiraId, obrigacao.mesReferencia);
}

/**
 * Backoffice — leitura irrestrita de todas as Obrigações (Administrador vê tudo), cada uma
 * anotada com as Entregas da mesma competência (PORTAL_ARQUITETURA.md §7: junção só leitura,
 * mesmo padrão de briefing.service.ts::listarBriefingsAdministrativos). Obrigação `AVULSO`
 * nunca passa pelo gate (RN-04/CB-01) — sempre `elegivelParaLiberacao: true`.
 */
export async function listarObrigacoesAdministrativas(): Promise<ObrigacaoComEntregas[]> {
  const obrigacoes = await obrigacaoRepositorio.listarTodas();
  const entregasPorCompetencia = new Map<string, Entrega[]>();

  const resultado: ObrigacaoComEntregas[] = [];
  for (const obrigacao of obrigacoes) {
    const chave = `${obrigacao.parceiraId}::${obrigacao.mesReferencia}`;
    let entregas = entregasPorCompetencia.get(chave);
    if (!entregas) {
      entregas = await buscarEntregasDaCompetencia(obrigacao);
      entregasPorCompetencia.set(chave, entregas);
    }

    resultado.push(comEntregas(obrigacao, entregas));
  }

  return resultado;
}

const REGEX_MES_REFERENCIA = /^\d{4}-(0[1-9]|1[0-2])$/;

export interface DadosNovaObrigacao {
  parceiraId: string;
  mesReferencia: string;
  valor: number;
  tipo: TipoObrigacao;
}

export type MotivoRejeicaoNovaObrigacao =
  | "MES_REFERENCIA_INVALIDO"
  | "VALOR_INVALIDO"
  | "PARCEIRA_INEXISTENTE"
  | "PARCEIRA_INATIVA"
  | "OBRIGACAO_MENSAL_JA_EXISTE";

function validarFormaDaNovaObrigacao(
  dados: DadosNovaObrigacao,
): { ok: true } | { ok: false; motivo: "MES_REFERENCIA_INVALIDO" | "VALOR_INVALIDO" } {
  if (!REGEX_MES_REFERENCIA.test(dados.mesReferencia)) {
    return { ok: false, motivo: "MES_REFERENCIA_INVALIDO" };
  }
  if (!(dados.valor > 0)) {
    return { ok: false, motivo: "VALOR_INVALIDO" };
  }
  return { ok: true };
}

export type ResultadoNovaObrigacao =
  | { ok: true; obrigacao: ObrigacaoComEntregas }
  | { ok: false; motivo: MotivoRejeicaoNovaObrigacao };

/**
 * UC-020.01 (Mensal) / UC-020.02 (Avulso) — lançamento administrativo. Nasce sempre
 * `EM_ABERTO` (RN-01), independente do que for enviado. Mensal exige Parceira `ATIVA`
 * (UC-020.01: "por Parceira Ativa") e é único por competência (SPEC-020 §5: "1 Obrigação por
 * Parceira"); Avulso permite qualquer Parceira e não tem restrição de unicidade (UC-020.02:
 * "para qualquer Parceira e período", RN-04).
 */
export async function lancarObrigacao(dados: DadosNovaObrigacao): Promise<ResultadoNovaObrigacao> {
  const validacaoDeForma = validarFormaDaNovaObrigacao(dados);
  if (!validacaoDeForma.ok) {
    return validacaoDeForma;
  }

  const parceira = await parceiraRepositorio.buscarPorId(dados.parceiraId);
  if (!parceira) {
    return { ok: false, motivo: "PARCEIRA_INEXISTENTE" };
  }

  if (dados.tipo === "MENSAL") {
    if (parceira.status !== "ATIVA") {
      return { ok: false, motivo: "PARCEIRA_INATIVA" };
    }

    const existentes = await obrigacaoRepositorio.listarPorParceiraECompetencia(dados.parceiraId, dados.mesReferencia);
    if (existentes.some((obrigacao) => obrigacao.tipo === "MENSAL")) {
      return { ok: false, motivo: "OBRIGACAO_MENSAL_JA_EXISTE" };
    }
  }

  const agora = new Date().toISOString();
  const obrigacao: ObrigacaoFinanceira = {
    id: randomUUID(),
    parceiraId: dados.parceiraId,
    mesReferencia: dados.mesReferencia,
    valor: dados.valor,
    estado: "EM_ABERTO",
    tipo: dados.tipo,
    dataCriacao: agora,
    dataAtualizacao: agora,
    dataArquivamento: null,
  };

  const criada = await obrigacaoRepositorio.criar(obrigacao);
  const entregas = await buscarEntregasDaCompetencia(criada);
  return { ok: true, obrigacao: comEntregas(criada, entregas) };
}

export type MotivoRejeicaoEdicaoObrigacao = "NAO_ENCONTRADA" | "VALOR_INVALIDO" | "OBRIGACAO_ARQUIVADA";
export type ResultadoEdicaoObrigacao =
  | { ok: true; obrigacao: ObrigacaoComEntregas }
  | { ok: false; motivo: MotivoRejeicaoEdicaoObrigacao };

/** INV-03 (SPEC-020): Obrigação `PAGO` é arquivada e somente leitura — edição de valor até `APROVADO`. */
export async function editarValorObrigacao(id: string, valor: number): Promise<ResultadoEdicaoObrigacao> {
  const existente = await obrigacaoRepositorio.buscarPorId(id);
  if (!existente) {
    return { ok: false, motivo: "NAO_ENCONTRADA" };
  }
  if (existente.estado === "PAGO") {
    return { ok: false, motivo: "OBRIGACAO_ARQUIVADA" };
  }
  if (!(valor > 0)) {
    return { ok: false, motivo: "VALOR_INVALIDO" };
  }

  const atualizada = await obrigacaoRepositorio.atualizar({ ...existente, valor });
  const entregas = await buscarEntregasDaCompetencia(atualizada);
  return { ok: true, obrigacao: comEntregas(atualizada, entregas) };
}

export type MotivoRejeicaoLiberacao = "NAO_ENCONTRADA" | "TRANSICAO_INVALIDA" | "CONTEUDO_NAO_APROVADO";
export type ResultadoLiberacao =
  | { ok: true; obrigacao: ObrigacaoComEntregas }
  | { ok: false; motivo: MotivoRejeicaoLiberacao };

/**
 * ADR-009/SPEC-020 §9 (PG-05): libera (`EM_ABERTO → APROVADO`) uma Obrigação `MENSAL` só
 * quando `calcularElegibilidadeMensal` for verdadeiro para as Entregas da mesma competência.
 * `AVULSO` nunca passa por este gate — liberação manual do Admin (RN-04/CB-01).
 */
export async function liberarObrigacao(id: string): Promise<ResultadoLiberacao> {
  const existente = await obrigacaoRepositorio.buscarPorId(id);
  if (!existente) {
    return { ok: false, motivo: "NAO_ENCONTRADA" };
  }
  if (existente.estado !== "EM_ABERTO") {
    return { ok: false, motivo: "TRANSICAO_INVALIDA" };
  }

  const entregas = await buscarEntregasDaCompetencia(existente);
  if (existente.tipo === "MENSAL" && !calcularElegibilidadeMensal(entregas)) {
    return { ok: false, motivo: "CONTEUDO_NAO_APROVADO" };
  }

  const atualizada = await obrigacaoRepositorio.atualizar({ ...existente, estado: "APROVADO" });
  return { ok: true, obrigacao: comEntregas(atualizada, entregas) };
}

export type MotivoRejeicaoPagamento = "NAO_ENCONTRADA" | "TRANSICAO_INVALIDA";
export type ResultadoPagamento =
  | { ok: true; obrigacao: ObrigacaoComEntregas }
  | { ok: false; motivo: MotivoRejeicaoPagamento };

/** RN-03 (SPEC-020): ao pagar, arquiva com `dataArquivamento`. CB-02: já `PAGO` → recusa (transição terminal). */
export async function marcarObrigacaoPaga(id: string): Promise<ResultadoPagamento> {
  const existente = await obrigacaoRepositorio.buscarPorId(id);
  if (!existente) {
    return { ok: false, motivo: "NAO_ENCONTRADA" };
  }
  if (existente.estado !== "APROVADO") {
    return { ok: false, motivo: "TRANSICAO_INVALIDA" };
  }

  const atualizada = await obrigacaoRepositorio.atualizar({
    ...existente,
    estado: "PAGO",
    dataArquivamento: new Date().toISOString(),
  });
  const entregas = await buscarEntregasDaCompetencia(atualizada);
  return { ok: true, obrigacao: comEntregas(atualizada, entregas) };
}

export type MotivoRejeicaoRemocaoObrigacao = "NAO_ENCONTRADA" | "JA_LIBERADA";
export type ResultadoRemocaoObrigacao = { ok: true } | { ok: false; motivo: MotivoRejeicaoRemocaoObrigacao };

/**
 * Backoffice — SPEC-020 não documenta exclusão (só a máquina de estados); decisão análoga à
 * remoção de Briefing: permitida só enquanto `EM_ABERTO`, antes de qualquer liberação/cobrança
 * ter sido comunicada à Parceira.
 */
export async function removerObrigacao(id: string): Promise<ResultadoRemocaoObrigacao> {
  const existente = await obrigacaoRepositorio.buscarPorId(id);
  if (!existente) {
    return { ok: false, motivo: "NAO_ENCONTRADA" };
  }
  if (existente.estado !== "EM_ABERTO") {
    return { ok: false, motivo: "JA_LIBERADA" };
  }

  await obrigacaoRepositorio.remover(id);
  return { ok: true };
}
