import type { ColaboracaoMensal } from "../colaboracao-mensal/colaboracaoMensal.types.js";
import type { FormatoEntrega } from "../conteudo/entrega.types.js";
import type { DocumentoEmitido } from "../documentos/documentos.types.js";
import type { ObrigacaoFinanceira } from "../financeiro/obrigacao.types.js";
import type { Parceira } from "../parceira/parceira.types.js";

/**
 * Painel operacional do Administrador: agregações de leitura sobre Parceira (SPEC-001/002),
 * Entrega (SPEC-012), Obrigação Financeira (SPEC-020), LGPD (ADR-010) e moderação de contas
 * (SPEC-035). Não introduz agregado novo — só soma/conta o que os módulos existentes já
 * expõem via `listarTodas`.
 */
export interface IndicadoresAdministrativos {
  parceiras: {
    ativas: number;
    inativas: number;
    total: number;
  };
  entregas: {
    /** Estado `AGUARDANDO_MATERIAL` — depende de ação da Parceira. */
    aguardandoMaterial: number;
    /** Estado `EM_REVISAO` — depende de ação do Administrador (aprovar/reprovar material). */
    emRevisao: number;
    /** `AGUARDANDO_MATERIAL` com `dataEntrega` já vencida (RN-02, prazo perdido). */
    atrasadas: number;
  };
  financeiro: {
    /** Obrigações em `EM_ABERTO` ou `APROVADO` — ainda não `PAGO`. */
    pendentes: number;
    /** Soma de `valor` das obrigações pendentes (não pagas). */
    valorPendente: number;
  };
  lgpd: {
    solicitacoesExclusaoPendentes: number;
  };
  moderacao: {
    contasPendentes: number;
  };
  /** "O que vem a seguir" (Sprint 2) — ordenado por proximidade, limitado a 5 itens. */
  proximosPrazos: ProximoPrazo[];
}

/**
 * Item de "o que vem a seguir" (ART_DIRECTION_GUIDE.md, Dashboard Sprint 2): prazo futuro
 * de Entrega ou de postagem de Briefing, já resolvido para nome de Parceira e dias
 * restantes — o Portal não recalcula data, só formata o que o backend já decidiu.
 */
export interface ProximoPrazo {
  tipo: "entrega" | "postagem";
  parceiraNome: string;
  formato: FormatoEntrega;
  /** `AAAA-MM-DD` do prazo (dataEntrega da Entrega, ou dataPostagem do Bloco de Briefing). */
  data: string;
  /** Inteiro, pode ser 0 (vence hoje); nunca negativo (prazos vencidos não entram na lista). */
  diasRestantes: number;
}

/**
 * Visão operacional da campanha para o Administrador da Marca (ADR-022, nível 2) — recorte
 * de `IndicadoresAdministrativos` por minimização de dados (LGPD/ADR-010): sem `financeiro`
 * (valores pagos pela agência), sem `lgpd` (solicitações de exclusão de terceiros) e sem
 * `moderacao` (cadastros pendentes de outras Parceiras) — nenhum desses campos diz respeito
 * à operação da própria campanha da Marca.
 */
export interface IndicadoresOperacionaisMarca {
  parceiras: {
    ativas: number;
    total: number;
  };
  entregas: {
    aguardandoMaterial: number;
    emRevisao: number;
    atrasadas: number;
  };
  proximosPrazos: ProximoPrazo[];
  excecoes: ExcecaoOperacional[];
}

/**
 * Item de "pede atenção" da visão da Marca (ADR-022) — mesmo espírito de `ProximoPrazo`, mas
 * para Entregas que já são exceção agora (atrasada ou em revisão), não prazo futuro. Nome da
 * Parceira já é exposto em `ProximoPrazo` para este mesmo ator, então não é dado novo de LGPD.
 */
export interface ExcecaoOperacional {
  tipo: "atrasado" | "em_revisao";
  parceiraNome: string;
  formato: FormatoEntrega;
  /** `AAAA-MM-DD` do prazo perdido. Só existe para `tipo: "atrasado"`. */
  data: string | null;
}

/**
 * Panorama da Mesa da Campanha (ADR-023) — hub pós-login do Administrador. "Campanha" aqui é
 * conceito de produto (o retrato agregado de toda a operação corrente), nunca sinônimo de
 * `ColaboracaoMensal` (ADR-002 continua banindo esse uso no domínio) — este tipo só agrega
 * leitura sobre o que os módulos já expõem, reaproveitando integralmente
 * `IndicadoresAdministrativos` (zero regra de negócio duplicada).
 */
/**
 * Ficha completa de uma Parceira (Central de Influenciadoras, Sprint 2) — agregação só
 * leitura sobre Parceira, ColaboracaoMensal (ADR-016), Entrega (SPEC-012), Briefing (SPEC-009),
 * Obrigação Financeira (SPEC-020) e Documento Emitido (Motor de Documentos, Fase 5). Reaproveita
 * `ProximoPrazo`/`ExcecaoOperacional` já existentes, só escopados a uma única Parceira.
 *
 * Lacunas declaradas (ADR-003, não presumidas — mesmo padrão de `MarcaDashboard.tsx`/
 * `AdminCampanha.tsx`): não existe módulo de Comunicação (mensagens/histórico de contato) nem
 * campo de Observações (notas livres do Administrador) implementado neste repositório hoje —
 * nenhum dos dois aparece neste tipo. "Cupom" não é entidade própria: é `Parceira.chave`
 * (ChaveInfluenciadora, SPEC-002 §6.2), já presente em `parceira`. "Nota fiscal" não é um
 * `TipoDocumentoEmitido` distinto hoje — o mais próximo existente é `RECIBO`, incluído em
 * `documentos` como qualquer outro tipo.
 */
export interface FichaParceira {
  parceira: Parceira;
  /** `AAAA-MM` — mês corrente, para exibir mesmo quando `colaboracaoAtual` for `null`. */
  competenciaAtual: string;
  /** ColaboracaoMensal da competência corrente (`AAAA-MM` de hoje), ou `null` se ainda não compilada. */
  colaboracaoAtual: ColaboracaoMensal | null;
  /** Demais competências, mais recente primeiro — nunca inclui `colaboracaoAtual`. */
  historicoColaboracoes: ColaboracaoMensal[];
  entregas: {
    aguardandoMaterial: number;
    emRevisao: number;
    atrasadas: number;
  };
  proximosPrazos: ProximoPrazo[];
  excecoes: ExcecaoOperacional[];
  financeiro: {
    obrigacoesPendentes: ObrigacaoFinanceira[];
    obrigacoesPagas: ObrigacaoFinanceira[];
    valorPendente: number;
  };
  /** Todos os `DocumentoEmitido` desta Parceira (contratos, aditivos, recibos, etc.), mais recente primeiro. */
  documentos: DocumentoEmitido[];
}

export interface PanoramaCampanha {
  /** `AAAA-MM` — mês corrente, usado para escopar `pagamentos` (diferente do Financeiro administrativo, que é histórico completo). */
  competenciaAtual: string;
  parceiras: {
    ativas: number;
    inativas: number;
    total: number;
    /** Nomes das Parceiras ativas — para a seção "participantes"; mesma classe de dado já exposta em `ProximoPrazo`. */
    nomesAtivas: string[];
  };
  entregas: {
    aguardandoMaterial: number;
    emRevisao: number;
    atrasadas: number;
  };
  proximosPrazos: ProximoPrazo[];
  excecoes: ExcecaoOperacional[];
  pagamentos: {
    /** Obrigações da competência atual em `EM_ABERTO` ou `APROVADO` — ainda não `PAGO`. */
    pendentes: number;
    valorPendente: number;
  };
}
