import { describe, expect, it, vi } from "vitest";
import { CepCache } from "./cache.js";
import { CepResolver } from "./resolver.js";
import type { CepProvider, EnderecoPostal } from "./tipos.js";

const ENDERECO_EXEMPLO: EnderecoPostal = {
  logradouro: "Avenida Paulista",
  bairro: "Bela Vista",
  cidade: "São Paulo",
  uf: "SP",
};

function providerFake(nome: string, comportamento: () => Promise<EnderecoPostal | null>): CepProvider {
  return { nome, buscar: vi.fn(comportamento) };
}

describe("CepResolver (chain of responsibility)", () => {
  it("retorna null sem consultar nenhum provider para CEP em formato inválido", async () => {
    const provider = providerFake("A", async () => ENDERECO_EXEMPLO);
    const resolvedor = new CepResolver([provider]);

    const resultado = await resolvedor.resolver("123");

    expect(resultado).toBeNull();
    expect(provider.buscar).not.toHaveBeenCalled();
  });

  it("usa o primeiro provider que resolver, sem tentar os seguintes", async () => {
    const primeiro = providerFake("primeiro", async () => ENDERECO_EXEMPLO);
    const segundo = providerFake("segundo", async () => ENDERECO_EXEMPLO);
    const resolvedor = new CepResolver([primeiro, segundo]);

    const resultado = await resolvedor.resolver("01310-100");

    expect(resultado).toEqual(ENDERECO_EXEMPLO);
    expect(primeiro.buscar).toHaveBeenCalledTimes(1);
    expect(segundo.buscar).not.toHaveBeenCalled();
  });

  it("cai para o próximo provider quando o primeiro retorna null (não encontrado)", async () => {
    const primeiro = providerFake("primeiro", async () => null);
    const segundo = providerFake("segundo", async () => ENDERECO_EXEMPLO);
    const resolvedor = new CepResolver([primeiro, segundo]);

    const resultado = await resolvedor.resolver("01310-100");

    expect(resultado).toEqual(ENDERECO_EXEMPLO);
    expect(segundo.buscar).toHaveBeenCalledTimes(1);
  });

  it("cai para o próximo provider quando o primeiro lança (timeout/rede)", async () => {
    const primeiro = providerFake("primeiro", async () => {
      throw new Error("timeout");
    });
    const segundo = providerFake("segundo", async () => ENDERECO_EXEMPLO);
    const resolvedor = new CepResolver([primeiro, segundo]);

    const resultado = await resolvedor.resolver("01310-100");

    expect(resultado).toEqual(ENDERECO_EXEMPLO);
  });

  it("RN-02: retorna null (nunca lança) quando todos os providers falham", async () => {
    const primeiro = providerFake("primeiro", async () => null);
    const segundo = providerFake("segundo", async () => {
      throw new Error("timeout");
    });
    const resolvedor = new CepResolver([primeiro, segundo]);

    await expect(resolvedor.resolver("01310-100")).resolves.toBeNull();
  });

  it("cacheia uma resolução bem-sucedida e não chama providers de novo para o mesmo CEP", async () => {
    const provider = providerFake("único", async () => ENDERECO_EXEMPLO);
    const cache = new CepCache();
    const resolvedor = new CepResolver([provider], cache);

    await resolvedor.resolver("01310-100");
    const segundaChamada = await resolvedor.resolver("01310-100");

    expect(segundaChamada).toEqual(ENDERECO_EXEMPLO);
    expect(provider.buscar).toHaveBeenCalledTimes(1);
  });

  it("não cacheia falha total — tenta os providers de novo na próxima chamada", async () => {
    const provider = providerFake("único", async () => null);
    const resolvedor = new CepResolver([provider]);

    await resolvedor.resolver("01310-100");
    await resolvedor.resolver("01310-100");

    expect(provider.buscar).toHaveBeenCalledTimes(2);
  });
});
