import type { CepProvider, EnderecoPostal } from "../tipos.js";

interface RespostaBrasilApi {
  street?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

const TIMEOUT_PADRAO_MS = 3000;

export class BrasilApiProvider implements CepProvider {
  readonly nome = "BrasilAPI";

  constructor(private readonly timeoutMs: number = TIMEOUT_PADRAO_MS) {}

  async buscar(cep: string): Promise<EnderecoPostal | null> {
    const controlador = new AbortController();
    const timeoutId = setTimeout(() => controlador.abort(), this.timeoutMs);

    try {
      const resposta = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`, {
        signal: controlador.signal,
      });
      if (!resposta.ok) return null;

      const dados = (await resposta.json()) as RespostaBrasilApi;
      if (!dados.street && !dados.city) return null;

      return {
        logradouro: dados.street ?? "",
        bairro: dados.neighborhood ?? "",
        cidade: dados.city ?? "",
        uf: dados.state ?? "",
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
