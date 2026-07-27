import { describe, expect, it } from "vitest";
import { alterarStatusParceira, cadastrarParceira } from "../parceira/parceira.service.js";
import { criarEntregaAdministrativa, projetarPendencias, validarFormaDaNovaEntrega } from "./conteudo.service.js";
import type { Entrega } from "./entrega.types.js";

function entrega(overrides: Partial<Entrega> = {}): Entrega {
  return {
    id: "e1",
    parceiraId: "parceira-1",
    mesReferencia: "2026-07",
    formato: "Reel",
    estado: "AGUARDANDO_MATERIAL",
    dataEntrega: "2026-07-10",
    materialEnviado: null,
    dataCriacao: "2026-07-01T00:00:00.000Z",
    dataAtualizacao: "2026-07-01T00:00:00.000Z",
    ...overrides,
  };
}

const condicaoComercial = {
  valorMensal: 2500,
  entregaveisReel: 2,
  entregaveisCarrossel: 1,
  entregaveisStories: 4,
  prazoUsoImagemDias: 90,
};

async function criarParceiraAtiva(chave: string) {
  const parceira = await cadastrarParceira({
    chave,
    nome: "Parceira Teste",
    email: `${chave.toLowerCase()}@dodo.dev`,
    cnpj: "",
    pix: "",
    condicaoComercial,
  });
  const ativada = await alterarStatusParceira(parceira.id, "ATIVA");
  if (!ativada.ok) throw new Error("falha ao preparar fixture de Parceira ativa");
  return ativada.parceira;
}

describe("projetarPendencias (UC-027.01)", () => {
  it("retorna lista vazia quando não há Entregas (CB-02)", () => {
    expect(projetarPendencias([])).toEqual([]);
  });

  it("ordena por data de entrega, em ordem cronológica", () => {
    const itens = projetarPendencias([
      entrega({ id: "e-15", dataEntrega: "2026-07-15" }),
      entrega({ id: "e-05", dataEntrega: "2026-07-05" }),
      entrega({ id: "e-10", dataEntrega: "2026-07-10" }),
    ]);

    expect(itens.map((item) => item.id)).toEqual(["e-05", "e-10", "e-15"]);
  });

  it("projeta apenas os campos de leitura do Portal, sem parceiraId", () => {
    const [item] = projetarPendencias([entrega()]);
    expect(item).toEqual({
      id: "e1",
      mesReferencia: "2026-07",
      formato: "Reel",
      estado: "AGUARDANDO_MATERIAL",
      dataEntrega: "2026-07-10",
    });
  });
});

describe("validarFormaDaNovaEntrega (Backoffice)", () => {
  const dadosValidos = {
    parceiraId: "irrelevante-nesta-validação",
    mesReferencia: "2026-07",
    formato: "Reel" as const,
    dataEntrega: "2026-07-10",
  };

  it("aceita dados bem formados", () => {
    expect(validarFormaDaNovaEntrega(dadosValidos)).toEqual({ ok: true });
  });

  it("rejeita formato fora de FormatoEntrega", () => {
    // @ts-expect-error propositalmente inválido para exercitar a validação
    const resultado = validarFormaDaNovaEntrega({ ...dadosValidos, formato: "Story" });
    expect(resultado).toEqual({ ok: false, motivo: "FORMATO_INVALIDO" });
  });

  it("rejeita mesReferencia fora do formato AAAA-MM", () => {
    const resultado = validarFormaDaNovaEntrega({ ...dadosValidos, mesReferencia: "07/2026" });
    expect(resultado).toEqual({ ok: false, motivo: "MES_REFERENCIA_INVALIDO" });
  });

  it("rejeita dataEntrega fora do formato AAAA-MM-DD", () => {
    const resultado = validarFormaDaNovaEntrega({ ...dadosValidos, dataEntrega: "10/07/2026" });
    expect(resultado).toEqual({ ok: false, motivo: "DATA_ENTREGA_INVALIDA" });
  });
});

describe("criarEntregaAdministrativa (Backoffice)", () => {
  it("cria a Entrega sempre AGUARDANDO_MATERIAL/materialEnviado nulo para Parceira ATIVA", async () => {
    const parceira = await criarParceiraAtiva("PARCEIRA-ENTREGA-1");

    const resultado = await criarEntregaAdministrativa({
      parceiraId: parceira.id,
      mesReferencia: "2026-07",
      formato: "Carrossel",
      dataEntrega: "2026-07-20",
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;
    expect(resultado.entrega).toEqual(
      expect.objectContaining({
        parceiraId: parceira.id,
        estado: "AGUARDANDO_MATERIAL",
        materialEnviado: null,
      }),
    );
    expect(resultado.entrega.id).toBeTruthy();
    expect(resultado.entrega.dataCriacao).toBe(resultado.entrega.dataAtualizacao);
  });

  it("rejeita Parceira inexistente", async () => {
    const resultado = await criarEntregaAdministrativa({
      parceiraId: "id-inexistente",
      mesReferencia: "2026-07",
      formato: "Reel",
      dataEntrega: "2026-07-10",
    });
    expect(resultado).toEqual({ ok: false, motivo: "PARCEIRA_INEXISTENTE" });
  });

  it("rejeita Parceira INATIVA (não cria Entrega para quem não está em colaboração ativa)", async () => {
    const parceira = await cadastrarParceira({
      chave: "PARCEIRA-ENTREGA-2",
      nome: "Parceira Inativa",
      email: "parceira-entrega-2@dodo.dev",
      cnpj: "",
      pix: "",
      condicaoComercial,
    });

    const resultado = await criarEntregaAdministrativa({
      parceiraId: parceira.id,
      mesReferencia: "2026-07",
      formato: "Reel",
      dataEntrega: "2026-07-10",
    });

    expect(resultado).toEqual({ ok: false, motivo: "PARCEIRA_INATIVA" });
  });
});
