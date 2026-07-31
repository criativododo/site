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

export type TipoDocumentoEmitido = "CONTRATO" | "ADITIVO" | "DISTRATO" | "PROPOSTA" | "RECIBO" | "DECLARACAO";

/** Motor §1.7: pipeline exaustivo — qualquer código que trate `status` deve cobrir todos. */
export type StatusDocumentoEmitido =
  | "NAO_GERADO"
  | "GERADO"
  | "BAIXADO"
  | "ENVIADO"
  | "VISUALIZADO"
  | "ASSINADO"
  | "FINALIZADO"
  | "ARQUIVADO";

/**
 * Documento gerado a partir de uma `TemplateVersao` (Fase 5, motor §1.4) — histórico imutável
 * (motor §1.3): nenhum campo é reescrito depois de criado nesta etapa. Transição de `status`
 * ao longo do pipeline (motor §1.7) é workflow de emissão, propositalmente fora do escopo
 * desta etapa (só entidade e persistência); por isso o repositório não expõe `atualizar`.
 *
 * `marcaId`/`campanhaId` do design original (`OTIMIZAÇÕES DODÔ.mk` §1.4) ficam de fora: `Marca`
 * está fora do MVP (ADR-008) e `Campanha` não é um agregado definido em nenhuma SPEC/ADR deste
 * projeto — declarar a lacuna em vez de presumir o campo (ADR-003).
 */
export interface DocumentoEmitido {
  id: string;
  tipo: TipoDocumentoEmitido;
  templateVersaoId: string;
  parceiraId: string;
  colaboracaoMensalId: string | null;
  geradoEm: string;
  geradoPor: string;
  status: StatusDocumentoEmitido;
  /** SHA-256 do PDF (motor §1.4) — geração de PDF fora do escopo desta etapa; campo persiste o que o chamador informar. */
  hash: string;
  urlStorage: string;
  storageFileId: string;
}
