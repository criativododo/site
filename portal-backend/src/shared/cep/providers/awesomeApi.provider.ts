import type { CepProvider, EnderecoPostal } from "../tipos.js";

interface RespostaAwesomeApi {
  address?: string;
  district?: string;
  city?: string;
  state?: string;
  status?: number;
}

const TIMEOUT_PADRAO_MS = 3000;

/** AwesomeAPI usa nomenclatura própria (`address`/`district`/`state`) e HTTP 400 para CEP inválido. */
export class AwesomeApiProvider implements CepProvider {
  readonly nome = "AwesomeAPI";

  constructor(private readonly timeoutMs: number = TIMEOUT_PADRAO_MS) {}

  async buscar(cep: string): Promise<EnderecoPostal | null> {
    const controlador = new AbortController();
    const timeoutId = setTimeout(() => controlador.abort(), this.timeoutMs);

    try {
      const resposta = await fetch(`https://cep.awesomeapi.com.br/json/${cep}`, {
        signal: controlador.signal,
      });
      if (!resposta.ok) return null;

      const dados = (await resposta.json()) as RespostaAwesomeApi;
      if (!dados.address && !dados.city) return null;

      return {
        logradouro: dados.address ?? "",
        bairro: dados.district ?? "",
        cidade: dados.city ?? "",
        uf: dados.state ?? "",
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
