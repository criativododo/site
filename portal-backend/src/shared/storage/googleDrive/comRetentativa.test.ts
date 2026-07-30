import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ErroDeAutenticacaoStorage,
  ErroDeValidacaoDeArmazenamento,
  ErroTransitorioDeArmazenamento,
  LimiteDeRequisicaoExcedido,
  RecursoDeArmazenamentoNaoEncontrado,
} from "../erros.js";

const invalidarCacheAccessTokenDriveMock = vi.fn();

vi.mock("../../googleDrive/googleDriveClient.js", () => ({
  obterAccessTokenDrive: vi.fn().mockResolvedValue("fake-token"),
  invalidarCacheAccessTokenDrive: invalidarCacheAccessTokenDriveMock,
}));

const { comRetentativa, ErroHttpBrutoDrive } = await import("./comRetentativa.js");

beforeEach(() => {
  vi.useFakeTimers();
  invalidarCacheAccessTokenDriveMock.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("comRetentativa", () => {
  it("429 seguido de sucesso na 2ª tentativa retorna sucesso", async () => {
    let chamadas = 0;
    const fn = vi.fn(async () => {
      chamadas++;
      if (chamadas === 1) throw new ErroHttpBrutoDrive(429, {});
      return "ok";
    });

    const promessa = comRetentativa(fn);
    await vi.runAllTimersAsync();

    await expect(promessa).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("503 esgotando as 5 tentativas lança ErroTransitorioDeArmazenamento, sem tentativa a mais", async () => {
    const fn = vi.fn(async () => {
      throw new ErroHttpBrutoDrive(503, {});
    });

    const promessa = comRetentativa(fn);
    const asserçaoDeRejeicao = expect(promessa).rejects.toBeInstanceOf(ErroTransitorioDeArmazenamento);
    await vi.runAllTimersAsync();
    await asserçaoDeRejeicao;
    expect(fn).toHaveBeenCalledTimes(5);
  });

  it("404 falha imediatamente, zero retentativas", async () => {
    const fn = vi.fn(async () => {
      throw new ErroHttpBrutoDrive(404, {});
    });

    await expect(comRetentativa(fn)).rejects.toBeInstanceOf(RecursoDeArmazenamentoNaoEncontrado);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("400 falha imediatamente como erro de validação, zero retentativas", async () => {
    const fn = vi.fn(async () => {
      throw new ErroHttpBrutoDrive(400, {});
    });

    await expect(comRetentativa(fn)).rejects.toBeInstanceOf(ErroDeValidacaoDeArmazenamento);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("429 esgotado lança LimiteDeRequisicaoExcedido", async () => {
    const fn = vi.fn(async () => {
      throw new ErroHttpBrutoDrive(429, {});
    });

    const promessa = comRetentativa(fn);
    const asserçaoDeRejeicao = expect(promessa).rejects.toBeInstanceOf(LimiteDeRequisicaoExcedido);
    await vi.runAllTimersAsync();
    await asserçaoDeRejeicao;
  });

  it("403 com razão de rate limit é tratado como retryable (mesmo bucket de 429)", async () => {
    let chamadas = 0;
    const fn = vi.fn(async () => {
      chamadas++;
      if (chamadas === 1) throw new ErroHttpBrutoDrive(403, { error: { errors: [{ reason: "userRateLimitExceeded" }] } });
      return "ok";
    });

    const promessa = comRetentativa(fn);
    await vi.runAllTimersAsync();

    await expect(promessa).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("Retry-After presente e maior que o backoff calculado é o atraso usado", async () => {
    const setTimeoutSpy = vi.spyOn(global, "setTimeout");
    let chamadas = 0;
    const fn = vi.fn(async () => {
      chamadas++;
      if (chamadas === 1) throw new ErroHttpBrutoDrive(429, {}, 30_000);
      return "ok";
    });

    const promessa = comRetentativa(fn);
    await vi.runAllTimersAsync();
    await promessa;

    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 30_000);
  });

  it("401 invalida o cache de token e renova 1x; se o retry seguinte suceder, resolve normalmente", async () => {
    let chamadas = 0;
    const fn = vi.fn(async () => {
      chamadas++;
      if (chamadas === 1) throw new ErroHttpBrutoDrive(401, {});
      return "ok";
    });

    const promessa = comRetentativa(fn);
    await vi.runAllTimersAsync();

    await expect(promessa).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
    expect(invalidarCacheAccessTokenDriveMock).toHaveBeenCalledTimes(1);
  });

  it("401 persistente após a renovação lança ErroDeAutenticacaoStorage, sem loop infinito", async () => {
    const fn = vi.fn(async () => {
      throw new ErroHttpBrutoDrive(401, {});
    });

    const promessa = comRetentativa(fn);
    const asserçaoDeRejeicao = expect(promessa).rejects.toBeInstanceOf(ErroDeAutenticacaoStorage);
    await vi.runAllTimersAsync();
    await asserçaoDeRejeicao;
    expect(fn).toHaveBeenCalledTimes(2); // tentativa original + 1 renovação, nunca mais
    expect(invalidarCacheAccessTokenDriveMock).toHaveBeenCalledTimes(1);
  });

  it("erro de rede (status 0) é retryable, mesmo bucket de 5xx", async () => {
    let chamadas = 0;
    const fn = vi.fn(async () => {
      chamadas++;
      if (chamadas === 1) throw new ErroHttpBrutoDrive(0, undefined);
      return "ok";
    });

    const promessa = comRetentativa(fn);
    await vi.runAllTimersAsync();

    await expect(promessa).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("cada retentativa reexecuta fn do início — não apenas a última chamada de rede (§2.8)", async () => {
    // fn representa a sequência composta "verificação de existência + escrita"; a primeira
    // chamada simula sucesso na verificação mas timeout na escrita — a retentativa precisa
    // reexecutar a verificação também, não pular direto para uma nova escrita.
    let tentativasCompletas = 0;
    const fn = vi.fn(async () => {
      tentativasCompletas++;
      const verificacaoOk = true;
      if (!verificacaoOk) throw new Error("nunca deveria falhar aqui neste teste");
      if (tentativasCompletas === 1) throw new ErroHttpBrutoDrive(503, {});
      return "recurso-criado";
    });

    const promessa = comRetentativa(fn);
    await vi.runAllTimersAsync();

    await expect(promessa).resolves.toBe("recurso-criado");
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
