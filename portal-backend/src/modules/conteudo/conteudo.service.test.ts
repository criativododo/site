import { describe, expect, it } from "vitest";
import { alterarStatusParceira, cadastrarParceira } from "../parceira/parceira.service.js";
import {
  aprovarEntrega,
  criarEntregaAdministrativa,
  projetarPendencias,
  publicarEntrega,
  validarFormaDaNovaEntrega,
} from "./conteudo.service.js";
import { entregaRepositorio } from "./entrega.repository.js";
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
    dataArquivamento: null,
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

describe("aprovarEntrega (Backoffice, UC-012.03 parte 1)", () => {
  it("aprova uma Entrega EM_REVISAO", async () => {
    const parceira = await criarParceiraAtiva("PARCEIRA-ENTREGA-3");
    const criada = await criarEntregaAdministrativa({
      parceiraId: parceira.id,
      mesReferencia: "2026-07",
      formato: "Reel",
      dataEntrega: "2026-07-10",
    });
    if (!criada.ok) throw new Error("fixture inválida");
    await entregaRepositorio.atualizar({ ...criada.entrega, estado: "EM_REVISAO" });

    const resultado = await aprovarEntrega(criada.entrega.id);
    expect(resultado).toEqual({ ok: true, entrega: expect.objectContaining({ estado: "APROVADO" }) });
  });

  it("rejeita aprovar Entrega ainda AGUARDANDO_MATERIAL (CT-03)", async () => {
    const parceira = await criarParceiraAtiva("PARCEIRA-ENTREGA-4");
    const criada = await criarEntregaAdministrativa({
      parceiraId: parceira.id,
      mesReferencia: "2026-07",
      formato: "Reel",
      dataEntrega: "2026-07-10",
    });
    if (!criada.ok) throw new Error("fixture inválida");

    expect(await aprovarEntrega(criada.entrega.id)).toEqual({ ok: false, motivo: "TRANSICAO_INVALIDA" });
  });

  it("rejeita aprovar Entrega já APROVADA (CT-03, sem repetir a transição)", async () => {
    const parceira = await criarParceiraAtiva("PARCEIRA-ENTREGA-5");
    const criada = await criarEntregaAdministrativa({
      parceiraId: parceira.id,
      mesReferencia: "2026-07",
      formato: "Reel",
      dataEntrega: "2026-07-10",
    });
    if (!criada.ok) throw new Error("fixture inválida");
    await entregaRepositorio.atualizar({ ...criada.entrega, estado: "EM_REVISAO" });
    await aprovarEntrega(criada.entrega.id);

    expect(await aprovarEntrega(criada.entrega.id)).toEqual({ ok: false, motivo: "TRANSICAO_INVALIDA" });
  });

  it("rejeita aprovar Entrega já PUBLICADA (CT-03, terminal)", async () => {
    const parceira = await criarParceiraAtiva("PARCEIRA-ENTREGA-6");
    const criada = await criarEntregaAdministrativa({
      parceiraId: parceira.id,
      mesReferencia: "2026-07",
      formato: "Reel",
      dataEntrega: "2026-07-10",
    });
    if (!criada.ok) throw new Error("fixture inválida");
    await entregaRepositorio.atualizar({ ...criada.entrega, estado: "PUBLICADO" });

    expect(await aprovarEntrega(criada.entrega.id)).toEqual({ ok: false, motivo: "TRANSICAO_INVALIDA" });
  });

  it("retorna NAO_ENCONTRADA para id inexistente", async () => {
    expect(await aprovarEntrega("id-inexistente")).toEqual({ ok: false, motivo: "NAO_ENCONTRADA" });
  });
});

describe("publicarEntrega (Backoffice, UC-012.03 parte 2, RN-04/RNF-03)", () => {
  it("publica uma Entrega APROVADA e carimba dataArquivamento", async () => {
    const parceira = await criarParceiraAtiva("PARCEIRA-ENTREGA-7");
    const criada = await criarEntregaAdministrativa({
      parceiraId: parceira.id,
      mesReferencia: "2026-07",
      formato: "Reel",
      dataEntrega: "2026-07-10",
    });
    if (!criada.ok) throw new Error("fixture inválida");
    await entregaRepositorio.atualizar({ ...criada.entrega, estado: "APROVADO" });

    const resultado = await publicarEntrega(criada.entrega.id);
    expect(resultado.ok).toBe(true);
    if (!resultado.ok) throw new Error("resultado inesperado");
    expect(resultado.entrega.estado).toBe("PUBLICADO");
    expect(resultado.entrega.dataArquivamento).not.toBeNull();
  });

  it("rejeita publicar Entrega ainda EM_REVISAO (transição inválida)", async () => {
    const parceira = await criarParceiraAtiva("PARCEIRA-ENTREGA-8");
    const criada = await criarEntregaAdministrativa({
      parceiraId: parceira.id,
      mesReferencia: "2026-07",
      formato: "Reel",
      dataEntrega: "2026-07-10",
    });
    if (!criada.ok) throw new Error("fixture inválida");
    await entregaRepositorio.atualizar({ ...criada.entrega, estado: "EM_REVISAO" });

    expect(await publicarEntrega(criada.entrega.id)).toEqual({ ok: false, motivo: "TRANSICAO_INVALIDA" });
  });

  it("rejeita publicar Entrega já PUBLICADA (terminal, não republica)", async () => {
    const parceira = await criarParceiraAtiva("PARCEIRA-ENTREGA-9");
    const criada = await criarEntregaAdministrativa({
      parceiraId: parceira.id,
      mesReferencia: "2026-07",
      formato: "Reel",
      dataEntrega: "2026-07-10",
    });
    if (!criada.ok) throw new Error("fixture inválida");
    await entregaRepositorio.atualizar({ ...criada.entrega, estado: "APROVADO" });
    await publicarEntrega(criada.entrega.id);

    expect(await publicarEntrega(criada.entrega.id)).toEqual({ ok: false, motivo: "TRANSICAO_INVALIDA" });
  });

  it("retorna NAO_ENCONTRADA para id inexistente", async () => {
    expect(await publicarEntrega("id-inexistente")).toEqual({ ok: false, motivo: "NAO_ENCONTRADA" });
  });
});
