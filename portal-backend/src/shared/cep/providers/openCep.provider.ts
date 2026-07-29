import type { CepProvider, EnderecoPostal } from "../tipos.js";

interface RespostaOpenCep {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
}

const TIMEOUT_PADRAO_MS = 3000;

export class OpenCepProvider implements CepProvider {
  readonly nome = "OpenCEP";

  constructor(private readonly timeoutMs: number = TIMEOUT_PADRAO_MS) {}

  async buscar(cep: string): Promise<EnderecoPostal | null> {
    const controlador = new AbortController();
    const timeoutId = setTimeout(() => controlador.abort(), this.timeoutMs);

    try {
      const resposta = await fetch(`https://opencep.com/v1/${cep}`, {
        signal: controlador.signal,
      });
      if (!resposta.ok) return null;

      const dados = (await resposta.json()) as RespostaOpenCep;
      if (!dados.logradouro && !dados.localidade) return null;

      return {
        logradouro: dados.logradouro ?? "",
        bairro: dados.bairro ?? "",
        cidade: dados.localidade ?? "",
        uf: dados.uf ?? "",
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
