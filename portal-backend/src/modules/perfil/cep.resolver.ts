/**
 * Porta de resolução de CEP (SPEC-032 §6.3 "Adaptador de CEP"). Nenhuma integração externa
 * foi decidida (mesma pendência de infraestrutura do §13 item 7) — isolado atrás desta
 * interface para que a service nunca dependa de qual provedor resolve o CEP. RN-02: qualquer
 * falha (CEP desconhecido, provedor indisponível) deve retornar `null`, nunca lançar — quem
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

/**
 * Stub em memória — sem chamada de rede (mantém o teste determinístico e evita decidir, sem
 * ADR, qual provedor de CEP usar em produção). CEPs fora do mapa são tratados como falha
 * (RN-02), não como erro.
 */
const CEPS_CONHECIDOS: Record<string, DadosDeEndereco> = {
  "01310-100": { rua: "Avenida Paulista", bairro: "Bela Vista", cidade: "São Paulo", uf: "SP" },
  "20040-020": { rua: "Avenida Rio Branco", bairro: "Centro", cidade: "Rio de Janeiro", uf: "RJ" },
};

export class ResolvedorDeCepEmMemoria implements ResolvedorDeCep {
  async resolver(cep: string): Promise<DadosDeEndereco | null> {
    return CEPS_CONHECIDOS[cep] ?? null;
  }
}

export const resolvedorDeCep: ResolvedorDeCep = new ResolvedorDeCepEmMemoria();
