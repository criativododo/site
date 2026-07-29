import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { criarEntregaAdministrativa } from "../conteudo/conteudo.service.js";
import { entregaRepositorio } from "../conteudo/entrega.repository.js";
import { alterarStatusParceira, cadastrarParceira } from "../parceira/parceira.service.js";
import { calcularDataAprovacaoInterna } from "./briefing.calculadoraAprovacao.js";
import { briefingRepositorio } from "./briefing.repository.js";
import {
  criarBriefingParaEntrega,
  editarBriefing,
  listarBriefingsAdministrativos,
  removerBriefing,
} from "./briefing.service.js";

const condicaoComercial = {
  valorMensal: 2500,
  entregaveisReel: 2,
  entregaveisCarrossel: 1,
  entregaveisStories: 4,
  prazoUsoImagemDias: 90,
};

async function criarEntregaDeTeste(sufixo: string) {
  const parceira = await cadastrarParceira({
    chave: `PARCEIRA-BRIEFING-${sufixo}`,
    nome: "Parceira Teste",
    email: `parceira-briefing-${sufixo.toLowerCase()}@dodo.dev`,
    cnpj: "",
    pix: "",
    condicaoComercial,
  });
  const ativada = await alterarStatusParceira(parceira.id, "ATIVA");
  if (!ativada.ok) throw new Error("falha ao preparar fixture de Parceira ativa");

  const resultado = await criarEntregaAdministrativa({
    parceiraId: parceira.id,
    mesReferencia: "2026-07",
    formato: "Reel",
    dataEntrega: "2026-07-10",
  });
  if (!resultado.ok) throw new Error("falha ao preparar fixture de Entrega");
  return resultado.entrega;
}

const conteudoValido = {
  look: "Look 1 — casual",
  dataEntrega: "2026-07-10",
  dataPostagem: "2026-07-20",
  orientacao: "Reel de unboxing, tom leve.",
};

describe("criarBriefingParaEntrega (Backoffice)", () => {
  it("copia parceiraId/mesReferencia/formato da Entrega escolhida", async () => {
    const entrega = await criarEntregaDeTeste("1");

    const resultado = await criarBriefingParaEntrega({ entregaId: entrega.id, ...conteudoValido });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;
    expect(resultado.briefing).toEqual(
      expect.objectContaining({
        parceiraId: entrega.parceiraId,
        mesReferencia: entrega.mesReferencia,
        formato: entrega.formato,
        look: conteudoValido.look,
        entregaId: entrega.id,
        estadoEntregaVinculada: "AGUARDANDO_MATERIAL",
      }),
    );
    expect(resultado.briefing.id).toBeTruthy();
  });

  it("rejeita Entrega inexistente", async () => {
    const resultado = await criarBriefingParaEntrega({ entregaId: "id-inexistente", ...conteudoValido });
    expect(resultado).toEqual({ ok: false, motivo: "ENTREGA_INEXISTENTE" });
  });

  it("rejeita criação duplicada para a mesma Entrega", async () => {
    const entrega = await criarEntregaDeTeste("2");
    await criarBriefingParaEntrega({ entregaId: entrega.id, ...conteudoValido });

    const segunda = await criarBriefingParaEntrega({ entregaId: entrega.id, ...conteudoValido });

    expect(segunda).toEqual({ ok: false, motivo: "BRIEFING_JA_EXISTE_PARA_ENTREGA" });
  });

  it("rejeita conteúdo inválido (look vazio, datas fora do formato)", async () => {
    const entrega = await criarEntregaDeTeste("3");

    expect(await criarBriefingParaEntrega({ entregaId: entrega.id, ...conteudoValido, look: "  " })).toEqual({
      ok: false,
      motivo: "LOOK_OBRIGATORIO",
    });
    expect(
      await criarBriefingParaEntrega({ entregaId: entrega.id, ...conteudoValido, dataEntrega: "10/07/2026" }),
    ).toEqual({ ok: false, motivo: "DATA_ENTREGA_INVALIDA" });
    expect(
      await criarBriefingParaEntrega({ entregaId: entrega.id, ...conteudoValido, dataPostagem: "20/07/2026" }),
    ).toEqual({ ok: false, motivo: "DATA_POSTAGEM_INVALIDA" });
  });
});

describe("editarBriefing (Backoffice)", () => {
  it("atualiza conteúdo e retorna NAO_ENCONTRADO para id inexistente", async () => {
    const entrega = await criarEntregaDeTeste("4");
    const criado = await criarBriefingParaEntrega({ entregaId: entrega.id, ...conteudoValido });
    if (!criado.ok) throw new Error("fixture inválida");

    const resultado = await editarBriefing(criado.briefing.id, { look: "Look atualizado" });
    expect(resultado).toEqual({
      ok: true,
      briefing: expect.objectContaining({
        look: "Look atualizado",
        entregaId: entrega.id,
        estadoEntregaVinculada: "AGUARDANDO_MATERIAL",
      }),
    });

    const semId = await editarBriefing("id-inexistente", { look: "X" });
    expect(semId).toEqual({ ok: false, motivo: "NAO_ENCONTRADO" });
  });

  it("rejeita edição que deixa o conteúdo inválido", async () => {
    const entrega = await criarEntregaDeTeste("5");
    const criado = await criarBriefingParaEntrega({ entregaId: entrega.id, ...conteudoValido });
    if (!criado.ok) throw new Error("fixture inválida");

    const resultado = await editarBriefing(criado.briefing.id, { orientacao: "" });
    expect(resultado).toEqual({ ok: false, motivo: "ORIENTACAO_OBRIGATORIA" });
  });

  it("recalcula dataAprovacaoInterna (RN-01/INV-03) ao editar dataPostagem, nunca herda o valor anterior", async () => {
    const entrega = await criarEntregaDeTeste("9");
    const criado = await criarBriefingParaEntrega({ entregaId: entrega.id, ...conteudoValido });
    if (!criado.ok) throw new Error("fixture inválida");
    expect(criado.briefing.dataAprovacaoInterna).toBe(calcularDataAprovacaoInterna(conteudoValido.dataPostagem));

    const novaDataPostagem = "2026-07-11"; // sábado — exercita o ajuste RN-01 (+2)
    const resultado = await editarBriefing(criado.briefing.id, { dataPostagem: novaDataPostagem });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) throw new Error("resultado inesperado");
    expect(resultado.briefing.dataAprovacaoInterna).toBe(calcularDataAprovacaoInterna(novaDataPostagem));
    expect(resultado.briefing.dataAprovacaoInterna).not.toBe(criado.briefing.dataAprovacaoInterna);
  });
});

describe("removerBriefing (Backoffice)", () => {
  it("remove quando a Entrega vinculada ainda está AGUARDANDO_MATERIAL", async () => {
    const entrega = await criarEntregaDeTeste("6");
    const criado = await criarBriefingParaEntrega({ entregaId: entrega.id, ...conteudoValido });
    if (!criado.ok) throw new Error("fixture inválida");

    const resultado = await removerBriefing(criado.briefing.id);
    expect(resultado).toEqual({ ok: true });

    const editarDepoisDeRemovido = await editarBriefing(criado.briefing.id, { look: "X" });
    expect(editarDepoisDeRemovido).toEqual({ ok: false, motivo: "NAO_ENCONTRADO" });
  });

  it("rejeita remoção quando a Entrega vinculada já saiu de AGUARDANDO_MATERIAL", async () => {
    const entrega = await criarEntregaDeTeste("7");
    const criado = await criarBriefingParaEntrega({ entregaId: entrega.id, ...conteudoValido });
    if (!criado.ok) throw new Error("fixture inválida");

    await entregaRepositorio.atualizar({ ...entrega, estado: "EM_REVISAO" });

    const resultado = await removerBriefing(criado.briefing.id);
    expect(resultado).toEqual({ ok: false, motivo: "ENTREGA_EM_ANDAMENTO" });
  });

  it("retorna NAO_ENCONTRADO para id inexistente", async () => {
    const resultado = await removerBriefing("id-inexistente");
    expect(resultado).toEqual({ ok: false, motivo: "NAO_ENCONTRADO" });
  });

  it("permite remoção de Bloco órfão (sem Entrega correspondente)", async () => {
    const orfao = await briefingRepositorio.criar({
      id: randomUUID(),
      parceiraId: "parceira-sem-entrega",
      mesReferencia: "2026-07",
      formato: "Carrossel",
      look: "Look órfão",
      dataEntrega: "2026-07-10",
      dataPostagem: "2026-07-20",
      orientacao: "Orientação órfã.",
      dataAprovacaoInterna: calcularDataAprovacaoInterna("2026-07-20"),
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
    });

    expect(await removerBriefing(orfao.id)).toEqual({ ok: true });
  });
});

describe("listarBriefingsAdministrativos (Backoffice)", () => {
  it("anota cada Bloco com a Entrega vinculada, e null quando órfão", async () => {
    const entrega = await criarEntregaDeTeste("8");
    const criado = await criarBriefingParaEntrega({ entregaId: entrega.id, ...conteudoValido });
    if (!criado.ok) throw new Error("fixture inválida");

    const orfao = await briefingRepositorio.criar({
      id: randomUUID(),
      parceiraId: "parceira-sem-entrega-2",
      mesReferencia: "2026-07",
      formato: "Stories2",
      look: "Look órfão 2",
      dataEntrega: "2026-07-10",
      dataPostagem: "2026-07-20",
      orientacao: "Orientação órfã 2.",
      dataAprovacaoInterna: calcularDataAprovacaoInterna("2026-07-20"),
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
    });

    const lista = await listarBriefingsAdministrativos();

    const vinculado = lista.find((item) => item.id === criado.briefing.id);
    expect(vinculado).toEqual(
      expect.objectContaining({ entregaId: entrega.id, estadoEntregaVinculada: "AGUARDANDO_MATERIAL" }),
    );

    const orfaoNaLista = lista.find((item) => item.id === orfao.id);
    expect(orfaoNaLista).toEqual(expect.objectContaining({ entregaId: null, estadoEntregaVinculada: null }));
  });
});
