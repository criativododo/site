import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CepCache } from "./cache.js";

const ENDERECO_EXEMPLO = {
  logradouro: "Avenida Paulista",
  bairro: "Bela Vista",
  cidade: "São Paulo",
  uf: "SP",
};

describe("CepCache", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("retorna undefined para CEP nunca resolvido", () => {
    const cache = new CepCache();
    expect(cache.obter("01310100")).toBeUndefined();
  });

  it("devolve o valor guardado dentro do TTL", () => {
    const cache = new CepCache(1000);
    cache.definir("01310100", ENDERECO_EXEMPLO);
    expect(cache.obter("01310100")).toEqual(ENDERECO_EXEMPLO);
  });

  it("expira a entrada após o TTL", () => {
    vi.useFakeTimers();
    const cache = new CepCache(1000);
    cache.definir("01310100", ENDERECO_EXEMPLO);

    vi.advanceTimersByTime(1001);

    expect(cache.obter("01310100")).toBeUndefined();
  });

  it("limpar() remove todas as entradas", () => {
    const cache = new CepCache();
    cache.definir("01310100", ENDERECO_EXEMPLO);
    cache.limpar();
    expect(cache.obter("01310100")).toBeUndefined();
  });
});
