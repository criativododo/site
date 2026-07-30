/** Recurso genérico de armazenamento (arquivo ou pasta), opaco quanto ao provedor concreto. */
export interface RecursoDeArmazenamento {
  /** ID do recurso no provedor (fileId/folderId do Drive). Opaco para quem chama. */
  id: string;
  nome: string;
  tipo: "arquivo" | "pasta";
  /** Só para log/depuração — nunca usado para localizar o recurso de novo. */
  caminhoLogico: string;
  tamanhoBytes?: number;
  tipoMime?: string;
  criadoEm: string; // ISO 8601
  atualizadoEm: string;
}

export interface PaginaDeRecursos {
  itens: RecursoDeArmazenamento[];
  proximoToken?: string;
}

export interface ParametrosDeEnvio {
  pastaId: string;
  nomeArquivo: string;
  conteudo: Buffer;
  tipoMime: string;
  /**
   * Identidade lógica do recurso (hoje, sempre `entregaId`) — decide CRIAR (primeira vez)
   * vs. SUBSTITUIR (já existe recurso com esta identidade). Estável entre chamadas
   * distintas de `enviarMaterialDaEntrega` para a mesma Entrega.
   */
  identidadeDoRecurso: string;
  /**
   * Identifica uma tentativa lógica de upload (uma "operação"), não a Entrega. Gerado uma
   * vez por chamada a `enviarMaterialDaEntrega` e reaproveitado apenas pelas retentativas de
   * rede dentro dessa mesma chamada — nunca entre chamadas distintas. Protege só contra
   * duplicação por retry de rede da mesma operação; NÃO impede reenvio legítimo (CB-01,
   * `SPEC-012` §16) — reenvio é sempre uma operação nova, com uma nova chaveDeIdempotencia.
   */
  chaveDeIdempotencia: string;
}

export interface ConfiguracaoDeArmazenamento {
  tipo: "google-drive";
  googleDrive: {
    /** GOOGLE_DRIVE_ROOT_FOLDER_ID — raiz do Portal, provisionada uma única vez fora de
     *  tempo de request (script de provisionamento). Consumida por
     *  ServicoDeArmazenamentoImpl, não pelo provedor: ProvedorDeArmazenamento não conhece
     *  caminho lógico nenhum. */
    pastaRaizId: string;
  };
}
