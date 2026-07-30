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
