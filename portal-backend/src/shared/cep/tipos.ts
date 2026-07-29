/**
 * Modelo canônico de endereço postal resolvido por CEP. Nenhum consumidor deste módulo (nem
 * `providers/`, nem quem chama `CepResolver`) deve depender do formato bruto de qualquer
 * provider específico — só deste tipo.
 */
export interface EnderecoPostal {
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
}

/**
 * Strategy de uma fonte de CEP (ADR sobre infraestrutura de CEP, `knowledge/ARCHITECTURAL_DECISIONS.md`).
 * Cada implementação conhece a URL/formato de resposta do seu provider e devolve `null` para
 * "não encontrado" ou qualquer falha (timeout, rede, resposta malformada) — nunca lança. Quem
 * decide o que fazer com uma falha (tentar o próximo da cadeia) é `CepResolver`, não o provider.
 */
export interface CepProvider {
  readonly nome: string;
  buscar(cep: string): Promise<EnderecoPostal | null>;
}
