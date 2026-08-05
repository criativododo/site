import type { FormatoEntrega } from "../conteudo/entrega.types.js";

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
