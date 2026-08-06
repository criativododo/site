import { logAviso, logEvento } from "../log.js";
import { CepCache } from "./cache.js";
import { normalizarCep, normalizarEndereco } from "./normalizador.js";
import type { CepProvider, EnderecoPostal } from "./tipos.js";

/**
 * Chain of Responsibility sobre múltiplas fontes de CEP — mesma filosofia do sistema legado
 * (nenhuma fonte única é confiável o bastante para ser a única, ver ADR sobre infraestrutura
 * de CEP em `knowledge/ARCHITECTURAL_DECISIONS.md`). Cada `CepProvider` é uma Strategy
 * independente, testável e removível sem afetar as demais.
 *
 * Falha de um provider (timeout, rede, "não encontrado") nunca impede tentar o próximo — só
 * falha de todos é reportada ao chamador, e mesmo assim como `null` (RN-02, degradável),
 * nunca como exceção.
 */
export class CepResolver {
  constructor(
    private readonly providers: CepProvider[],
    private readonly cache: CepCache = new CepCache(),
  ) {}

  async resolver(cepBruto: string): Promise<EnderecoPostal | null> {
    const cep = normalizarCep(cepBruto);
    if (!cep) return null;

    const emCache = this.cache.obter(cep);
    if (emCache) return emCache;

    for (const provider of this.providers) {
      let resultado: EnderecoPostal | null;
      try {
        resultado = await provider.buscar(cep);
      } catch (erro) {
        logAviso("CepResolver", {
          provider: provider.nome,
          cep,
          mensagem: erro instanceof Error ? erro.message : String(erro),
        });
        continue;
      }

      if (resultado) {
        const normalizado = normalizarEndereco(resultado);
        this.cache.definir(cep, normalizado);
        logEvento("CepResolver", { cep, resolvidoPor: provider.nome });
        return normalizado;
      }
    }

    logAviso("CepResolver", { cep, motivo: "não resolvido por nenhum provider" });
    return null;
  }
}
