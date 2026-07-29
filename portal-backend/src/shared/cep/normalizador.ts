import type { EnderecoPostal } from "./tipos.js";

const REGEX_CEP_VALIDO = /^\d{8}$/;

/** Aceita qualquer máscara de entrada (`00000-000`, `00000000`, com espaços) — só dígitos importam. */
export function normalizarCep(cepBruto: string): string | null {
  const digitos = cepBruto.replace(/\D/g, "");
  return REGEX_CEP_VALIDO.test(digitos) ? digitos : null;
}

/** Sanitização final aplicada independentemente de qual provider respondeu (espaços, UF em caixa alta). */
export function normalizarEndereco(bruto: EnderecoPostal): EnderecoPostal {
  return {
    logradouro: bruto.logradouro.trim(),
    bairro: bruto.bairro.trim(),
    cidade: bruto.cidade.trim(),
    uf: bruto.uf.trim().toUpperCase(),
  };
}
