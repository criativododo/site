import { describe, expect, it } from "vitest";
import { exportarDadosDaParceira } from "./exportacao.service.js";

describe("exportarDadosDaParceira (ADR-010 ponto 5, acesso/portabilidade)", () => {
  it("retorna estrutura com perfil/entregas/obrigações mesmo sem nenhum dado (Parceira sem seed)", async () => {
    const exportado = await exportarDadosDaParceira("parceira-sem-dado-nenhum");

    expect(exportado.parceiraId).toBe("parceira-sem-dado-nenhum");
    expect(exportado.perfil).toBeNull();
    expect(exportado.entregas).toEqual([]);
    expect(exportado.obrigacoesFinanceiras).toEqual([]);
    expect(typeof exportado.geradoEm).toBe("string");
  });
});
