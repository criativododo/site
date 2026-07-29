import type { CepProvider, EnderecoPostal } from "../tipos.js";

interface RespostaViaCep {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

const TIMEOUT_PADRAO_MS = 3000;

/** ViaCEP nunca responde 404 — CEP inexistente vem como HTTP 200 com `{ erro: true }`. */
export class ViaCepProvider implements CepProvider {
  readonly nome = "ViaCEP";

  constructor(private readonly timeoutMs: number = TIMEOUT_PADRAO_MS) {}

  async buscar(cep: string): Promise<EnderecoPostal | null> {
    const controlador = new AbortController();
    const timeoutId = setTimeout(() => controlador.abort(), this.timeoutMs);

    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
        signal: controlador.signal,
      });
      if (!resposta.ok) return null;

      const dados = (await resposta.json()) as RespostaViaCep;
      if (dados.erro) return null;

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
