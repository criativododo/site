/**
 * Motor de Documentos (Fase 5 do Plano Mestre, motor §1).
 * `Template` é o agregado mutável (metadados); o conteúdo versionado e imutável fica em
 * `TemplateVersao`, ainda não implementado nesta etapa (só o scaffold do módulo).
 */
export interface Template {
  id: string;
  nome: string;
  descricao: string;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}

/**
 * Conteúdo publicado de um `Template`, numa versão específica (Fase 5, motor §1, critério de
 * aceite: "TemplateVersao publicada é imutável; qualquer alteração cria nova versão").
 * Por isso não existe `dataAtualizacao` nem operação de atualização/remoção no repositório —
 * mudar o conteúdo sempre cria uma nova `TemplateVersao` com `numeroVersao` incrementado,
 * preservando as versões anteriores intactas para o histórico.
 */
export interface TemplateVersao {
  id: string;
  templateId: string;
  numeroVersao: number;
  conteudo: string;
  dataCriacao: string;
}
