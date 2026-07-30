export abstract class ErroDeArmazenamento extends Error {
  constructor(message: string, public readonly causaOriginal?: unknown) {
    super(message);
    this.name = this.constructor.name;
  }
}

/** 401 persistente após uma renovação de token. */
export class ErroDeAutenticacaoStorage extends ErroDeArmazenamento {}

/** 403 que não é rate limit (ex.: `insufficientPermissions`). */
export class ErroDeAutorizacaoStorage extends ErroDeArmazenamento {}

/** 404 — recurso inexistente ou fora do escopo `drive.file`. */
export class RecursoDeArmazenamentoNaoEncontrado extends ErroDeArmazenamento {}

/** 429 após esgotar as retentativas de `comRetentativa()`. */
export class LimiteDeRequisicaoExcedido extends ErroDeArmazenamento {}

/** 5xx ou erro de rede/timeout após esgotar as retentativas de `comRetentativa()`. */
export class ErroTransitorioDeArmazenamento extends ErroDeArmazenamento {}

/** 400 — bug de chamada (tipo/tamanho inválido, corpo malformado), não instabilidade. */
export class ErroDeValidacaoDeArmazenamento extends ErroDeArmazenamento {}
