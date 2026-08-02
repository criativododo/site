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
