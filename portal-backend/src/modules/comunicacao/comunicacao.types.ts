/**
 * Comunicação (Sprint 2) — central de comunicação assistida, exclusiva do Administrador
 * (`ADMINISTRADOR`; nem Marca nem Influenciadora têm acesso). Não é chat, não é automação, não
 * é CRM: o Portal só prepara o texto (substitui variáveis a partir do contexto da Parceira) e
 * registra o histórico do que foi preparado — quem efetivamente manda a mensagem é o
 * Administrador, pelo WhatsApp Desktop/Web, fora do Portal.
 */
export type CategoriaModeloMensagem =
  | "BOAS_VINDAS"
  | "BRIEFING"
  | "LEMBRETE"
  | "APROVACAO"
  | "NOTA_FISCAL"
  | "PAGAMENTO"
  | "LOGISTICA"
  | "ENCERRAMENTO";

/** Histórico também aceita mensagem sem modelo ("escrever mensagem personalizada"). */
export type CategoriaMensagemPreparada = CategoriaModeloMensagem | "PERSONALIZADA";

/** Modelo de mensagem — estático (definido em `comunicacao.modelos.ts`), sem CRUD nesta etapa: a tela não pediu edição de modelos, só escolha entre os existentes ou texto livre. */
export interface ModeloMensagem {
  id: string;
  categoria: CategoriaModeloMensagem;
  titulo: string;
  /** Corpo com variáveis `{{...}}` — a substituição acontece no cliente, que já tem o contexto da Ficha carregado (ver `pages/CentralInfluenciadora.tsx`). */
  corpo: string;
}

export interface VariavelSuportada {
  variavel: string;
  descricao: string;
}

/**
 * Histórico de uma mensagem preparada pelo Portal (nunca enviada por ele — RN desta tela).
 * `parceiraNome` é snapshot: o histórico deve continuar legível mesmo que o nome da Parceira
 * mude depois (mesmo padrão de `condicaoComercial` em `ColaboracaoMensal`).
 */
export interface MensagemPreparada {
  id: string;
  parceiraId: string;
  parceiraNome: string;
  categoria: CategoriaMensagemPreparada;
  /** `null` quando a mensagem foi personalizada (sem modelo de origem). */
  modeloId: string | null;
  corpoFinal: string;
  preparadoPor: string;
  preparadoEm: string;
}
