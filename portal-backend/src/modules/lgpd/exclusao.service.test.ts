import { describe, expect, it } from "vitest";
import { decidirExclusao, listarSolicitacoesPendentes, solicitarExclusao } from "./exclusao.service.js";

describe("processo de expurgo (ADR-010 ponto 7)", () => {
  it("solicitarExclusao nasce PENDENTE e nunca decidida", async () => {
    const solicitacao = await solicitarExclusao("parceira-x");
    expect(solicitacao.status).toBe("PENDENTE");
    expect(solicitacao.dataDecisao).toBeNull();
  });

  it("aparece na fila de pendentes até ser decidida", async () => {
    const solicitacao = await solicitarExclusao("parceira-y");
    const pendentes = await listarSolicitacoesPendentes();
    expect(pendentes.map((item) => item.id)).toContain(solicitacao.id);
  });

  it("decidirExclusao (aprovada) registra fundamento jurídico e responsável, some da fila", async () => {
    const solicitacao = await solicitarExclusao("parceira-z");

    const resultado = await decidirExclusao(solicitacao.id, {
      aprovada: true,
      fundamentoJuridico: "Sem obrigação legal de retenção.",
      responsavelAnalise: "admin@dodo.dev",
    });

    expect(resultado).toEqual({
      ok: true,
      solicitacao: expect.objectContaining({ status: "APROVADA", fundamentoJuridico: "Sem obrigação legal de retenção." }),
    });

    const pendentes = await listarSolicitacoesPendentes();
    expect(pendentes.map((item) => item.id)).not.toContain(solicitacao.id);
  });

  it("recusa decidir a mesma solicitação duas vezes", async () => {
    const solicitacao = await solicitarExclusao("parceira-w");
    await decidirExclusao(solicitacao.id, {
      aprovada: false,
      fundamentoJuridico: "Obrigação fiscal de retenção por 5 anos.",
      responsavelAnalise: "admin@dodo.dev",
    });

    const segundaTentativa = await decidirExclusao(solicitacao.id, {
      aprovada: true,
      fundamentoJuridico: "x",
      responsavelAnalise: "y",
    });

    expect(segundaTentativa).toEqual({ ok: false, motivo: "NAO_PENDENTE" });
  });

  it("retorna NAO_ENCONTRADA para id inexistente", async () => {
    const resultado = await decidirExclusao("id-nao-existe", {
      aprovada: true,
      fundamentoJuridico: "x",
      responsavelAnalise: "y",
    });
    expect(resultado).toEqual({ ok: false, motivo: "NAO_ENCONTRADA" });
  });
});
