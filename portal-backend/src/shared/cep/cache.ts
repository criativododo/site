import type { EnderecoPostal } from "./tipos.js";

const TRINTA_DIAS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Cache em memória — mesma decisão de persistência do resto do Portal hoje (repositórios em
 * memória, ver `START_HERE_NEXT_SESSION.md`). TTL longo por padrão: o endereço postal de um
 * CEP praticamente nunca muda, então perder o cache num restart só custa uma nova resolução,
 * nunca dado incorreto.
 *
 * Só guarda resoluções bem-sucedidas — uma falha de todos os providers (RN-02, degradável) é
 * tratada como possivelmente transitória, nunca lembrada como permanente.
 */
export class CepCache {
  private readonly entradas = new Map<string, { valor: EnderecoPostal; expiraEm: number }>();

  constructor(private readonly ttlMs: number = TRINTA_DIAS_MS) {}

  obter(cep: string): EnderecoPostal | undefined {
    const entrada = this.entradas.get(cep);
    if (!entrada) return undefined;
    if (Date.now() > entrada.expiraEm) {
      this.entradas.delete(cep);
      return undefined;
    }
    return entrada.valor;
  }

  definir(cep: string, valor: EnderecoPostal): void {
    this.entradas.set(cep, { valor, expiraEm: Date.now() + this.ttlMs });
  }

  limpar(): void {
    this.entradas.clear();
  }
}
