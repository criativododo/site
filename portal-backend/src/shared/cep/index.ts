import { AwesomeApiProvider } from "./providers/awesomeApi.provider.js";
import { BrasilApiProvider } from "./providers/brasilApi.provider.js";
import { OpenCepProvider } from "./providers/openCep.provider.js";
import { ViaCepProvider } from "./providers/viaCep.provider.js";
import { CepResolver } from "./resolver.js";

export type { EnderecoPostal, CepProvider } from "./tipos.js";
export { CepResolver } from "./resolver.js";
export { CepCache } from "./cache.js";

/** Ordem de fallback definida na ADR de infraestrutura de CEP: BrasilAPI → ViaCEP → OpenCEP → AwesomeAPI. */
export function criarCepResolverPadrao(): CepResolver {
  return new CepResolver([
    new BrasilApiProvider(),
    new ViaCepProvider(),
    new OpenCepProvider(),
    new AwesomeApiProvider(),
  ]);
}
