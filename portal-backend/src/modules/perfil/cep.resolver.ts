import { criarCepResolverPadrao, type CepResolver, type EnderecoPostal } from "../../shared/cep/index.js";

/**
 * Porta de resolução de CEP (SPEC-032 §6.3 "Adaptador de CEP"). RN-02: qualquer falha (CEP
 * desconhecido, todos os providers indisponíveis) deve retornar `null`, nunca lançar — quem
 * chama decide o comportamento degradável.
 */
export interface DadosDeEndereco {
  rua: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface ResolvedorDeCep {
  resolver(cep: string): Promise<DadosDeEndereco | null>;
}

function paraDadosDeEndereco(resolvido: EnderecoPostal): DadosDeEndereco {
  return {
    rua: resolvido.logradouro,
    bairro: resolvido.bairro,
    cidade: resolvido.cidade,
    uf: resolvido.uf,
  };
}

/**
 * Adapta a infraestrutura real de resolução de CEP (`shared/cep` — cache + cadeia
 * BrasilAPI → ViaCEP → OpenCEP → AwesomeAPI, ver ADR sobre infraestrutura de CEP em
 * `knowledge/ARCHITECTURAL_DECISIONS.md`) ao vocabulário deste domínio (`rua`, não
 * `logradouro`). Só este arquivo conhece esse mapeamento — `perfil.service.ts` e
 * `identidade.service.ts` continuam a depender só de `ResolvedorDeCep`/`DadosDeEndereco`.
 */
export class ResolvedorDeCepPortal implements ResolvedorDeCep {
  constructor(private readonly resolvedor: Pick<CepResolver, "resolver"> = criarCepResolverPadrao()) {}

  async resolver(cep: string): Promise<DadosDeEndereco | null> {
    const resolvido = await this.resolvedor.resolver(cep);
    return resolvido ? paraDadosDeEndereco(resolvido) : null;
  }
}

export const resolvedorDeCep: ResolvedorDeCep = new ResolvedorDeCepPortal();
