import type { PaginaDeRecursos, ParametrosDeEnvio, RecursoDeArmazenamento } from "./tipos.js";

/**
 * Contrato puro de infraestrutura: pasta e arquivo, nada além disso. Não sabe o que é uma
 * Entrega — quem traduz vocabulário de domínio é `ServicoDeArmazenamento`.
 */
export interface ProvedorDeArmazenamento {
  criarPasta(nome: string, pastaPaiId: string | null): Promise<RecursoDeArmazenamento>;
  enviarArquivo(params: ParametrosDeEnvio): Promise<RecursoDeArmazenamento>;
  baixarArquivo(recursoId: string): Promise<{
    conteudo: NodeJS.ReadableStream;
    tipoMime: string;
    tamanhoBytes: number;
  }>;
  renomear(recursoId: string, novoNome: string): Promise<RecursoDeArmazenamento>;
  remover(recursoId: string): Promise<void>;
  listar(pastaId: string, tamanhoPagina?: number, tokenPagina?: string): Promise<PaginaDeRecursos>;
  obterMetadados(recursoId: string): Promise<RecursoDeArmazenamento>;
}
