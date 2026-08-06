import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Reproduz o bug de produção (2026-08-06): `obterConfiguracaoGoogle` memoiza a Promise de
 * `client.discovery` incondicionalmente. Uma falha transitória (rede, timeout, instabilidade
 * do endpoint do Google) rejeita essa Promise uma única vez — mas como o valor guardado
 * (`configuracaoPromise`) permanece truthy mesmo rejeitado, toda chamada seguinte recebe a
 * mesma Promise rejeitada para sempre, até o processo reiniciar. Em produção isso derrubou
 * `/auth/google/login` por 22h (500 em toda tentativa) sem nenhum log, porque o handler de
 * erro só loga fora de produção.
 */
describe("obterConfiguracaoGoogle", () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock("openid-client");
  });

  it("se uma chamada falhar, a próxima chamada tenta de novo em vez de reusar a falha para sempre", async () => {
    const discovery = vi
      .fn()
      .mockRejectedValueOnce(new Error("falha transitória de rede"))
      .mockResolvedValueOnce("configuracao-ok" as never);

    vi.doMock("openid-client", () => ({ discovery }));

    const { obterConfiguracaoGoogle } = await import("./oidc.js");

    await expect(obterConfiguracaoGoogle()).rejects.toThrow("falha transitória de rede");
    await expect(obterConfiguracaoGoogle()).resolves.toBe("configuracao-ok");
    expect(discovery).toHaveBeenCalledTimes(2);
  });
});
