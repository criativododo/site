import { describe, expect, it } from "vitest";
import type { BlocoBriefing } from "../briefing/briefing.types.js";
import type { Entrega } from "../conteudo/entrega.types.js";
import type { ObrigacaoFinanceira } from "../financeiro/obrigacao.types.js";
import type { Identidade } from "../identidade/identidade.types.js";
import type { SolicitacaoExclusao } from "../lgpd/exclusao.types.js";
import type { Parceira } from "../parceira/parceira.types.js";
import { calcularIndicadores, calcularProximosPrazos } from "./dashboard.service.js";

const condicaoComercial = {
  valorMensal: 2500,
  entregaveisReel: 2,
  entregaveisCarrossel: 1,
  entregaveisStories: 4,
  prazoUsoImagemDias: 90,
};

function parceira(overrides: Partial<Parceira> = {}): Parceira {
  return {
    id: "p1",
    chave: "CHAVE-1",
    nome: "Parceira",
    email: "p1@dodo.dev",
    cnpj: "",
    pix: "",
    status: "ATIVA",
    condicaoComercial,
    dataCriacao: "2026-07-01T00:00:00.000Z",
    ...overrides,
  };
}

function entrega(overrides: Partial<Entrega> = {}): Entrega {
  return {
    id: "e1",
    parceiraId: "p1",
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

function obrigacao(overrides: Partial<ObrigacaoFinanceira> = {}): ObrigacaoFinanceira {
  return {
    id: "o1",
    parceiraId: "p1",
    mesReferencia: "2026-07",
    valor: 1000,
    estado: "EM_ABERTO",
    ...overrides,
  };
}

function blocoBriefing(overrides: Partial<BlocoBriefing> = {}): BlocoBriefing {
  return {
    id: "b1",
    parceiraId: "p1",
    mesReferencia: "2026-07",
    formato: "Carrossel",
    look: "Look 1",
    dataEntrega: "2026-07-05",
    dataPostagem: "2026-07-20",
    orientacao: "orientação de teste",
    dataAprovacaoInterna: "2026-07-18",
    dataCriacao: "2026-07-01T00:00:00.000Z",
    dataAtualizacao: "2026-07-01T00:00:00.000Z",
    ...overrides,
  };
}

const semDados = {
  parceiras: [] as Parceira[],
  entregas: [] as Entrega[],
  obrigacoes: [] as ObrigacaoFinanceira[],
  contasPendentes: [] as Identidade[],
  solicitacoesExclusao: [] as SolicitacaoExclusao[],
  blocosBriefing: [] as BlocoBriefing[],
};

describe("calcularIndicadores", () => {
  it("sem nenhum dado, todos os indicadores são zero", () => {
    expect(calcularIndicadores(semDados)).toEqual({
      parceiras: { ativas: 0, inativas: 0, total: 0 },
      entregas: { aguardandoMaterial: 0, emRevisao: 0, atrasadas: 0 },
      financeiro: { pendentes: 0, valorPendente: 0 },
      lgpd: { solicitacoesExclusaoPendentes: 0 },
      moderacao: { contasPendentes: 0 },
      proximosPrazos: [],
    });
  });

  it("conta Parceiras Ativas e Inativas separadamente", () => {
    const resultado = calcularIndicadores({
      ...semDados,
      parceiras: [parceira({ status: "ATIVA" }), parceira({ id: "p2", status: "ATIVA" }), parceira({ id: "p3", status: "INATIVA" })],
    });
    expect(resultado.parceiras).toEqual({ ativas: 2, inativas: 1, total: 3 });
  });

  it("classifica Entregas por estado (aguardando material vs. em revisão)", () => {
    const resultado = calcularIndicadores({
      ...semDados,
      hoje: "2026-07-01",
      entregas: [
        entrega({ id: "a", estado: "AGUARDANDO_MATERIAL", dataEntrega: "2026-07-20" }),
        entrega({ id: "b", estado: "EM_REVISAO" }),
        entrega({ id: "c", estado: "APROVADO" }),
        entrega({ id: "d", estado: "PUBLICADO" }),
      ],
    });
    expect(resultado.entregas).toEqual({ aguardandoMaterial: 1, emRevisao: 1, atrasadas: 0 });
  });

  it("marca como atrasada só a Entrega AGUARDANDO_MATERIAL com dataEntrega no passado", () => {
    const resultado = calcularIndicadores({
      ...semDados,
      hoje: "2026-07-15",
      entregas: [
        entrega({ id: "atrasada", estado: "AGUARDANDO_MATERIAL", dataEntrega: "2026-07-10" }),
        entrega({ id: "no-prazo", estado: "AGUARDANDO_MATERIAL", dataEntrega: "2026-07-20" }),
        entrega({ id: "em-revisao-vencida", estado: "EM_REVISAO", dataEntrega: "2026-07-01" }),
      ],
    });
    expect(resultado.entregas.atrasadas).toBe(1);
  });

  it("soma como pendente tudo que não está PAGO, e só isso entra em valorPendente", () => {
    const resultado = calcularIndicadores({
      ...semDados,
      obrigacoes: [
        obrigacao({ id: "a", estado: "EM_ABERTO", valor: 1000 }),
        obrigacao({ id: "b", estado: "APROVADO", valor: 500 }),
        obrigacao({ id: "c", estado: "PAGO", valor: 2000 }),
      ],
    });
    expect(resultado.financeiro).toEqual({ pendentes: 2, valorPendente: 1500 });
  });

  it("conta solicitações LGPD e contas pendentes de moderação", () => {
    const resultado = calcularIndicadores({
      ...semDados,
      contasPendentes: [{ subProvider: "google:1" } as Identidade],
      solicitacoesExclusao: [{ id: "s1" } as SolicitacaoExclusao, { id: "s2" } as SolicitacaoExclusao],
    });
    expect(resultado.lgpd.solicitacoesExclusaoPendentes).toBe(2);
    expect(resultado.moderacao.contasPendentes).toBe(1);
  });

  it("preenche proximosPrazos a partir de Entregas e Blocos de Briefing recebidos", () => {
    const resultado = calcularIndicadores({
      ...semDados,
      hoje: "2026-07-15",
      parceiras: [parceira({ id: "p1", nome: "Parceira Um" })],
      entregas: [entrega({ estado: "AGUARDANDO_MATERIAL", dataEntrega: "2026-07-17" })],
      blocosBriefing: [],
    });
    expect(resultado.proximosPrazos).toEqual([
      { tipo: "entrega", parceiraNome: "Parceira Um", formato: "Reel", data: "2026-07-17", diasRestantes: 2 },
    ]);
  });
});

describe("calcularProximosPrazos", () => {
  const parceiras = [parceira({ id: "p1", nome: "Parceira Um" })];

  it("sem entregas nem blocos de briefing, retorna lista vazia", () => {
    expect(
      calcularProximosPrazos({ entregas: [], blocosBriefing: [], parceiras, hoje: "2026-07-15" }),
    ).toEqual([]);
  });

  it("inclui Entrega AGUARDANDO_MATERIAL com dataEntrega futura", () => {
    const resultado = calcularProximosPrazos({
      entregas: [entrega({ estado: "AGUARDANDO_MATERIAL", dataEntrega: "2026-07-17" })],
      blocosBriefing: [],
      parceiras,
      hoje: "2026-07-15",
    });
    expect(resultado).toEqual([
      { tipo: "entrega", parceiraNome: "Parceira Um", formato: "Reel", data: "2026-07-17", diasRestantes: 2 },
    ]);
  });

  it("não inclui Entrega já atrasada (já coberta pelo Bloco 1 de atenção agora)", () => {
    const resultado = calcularProximosPrazos({
      entregas: [entrega({ estado: "AGUARDANDO_MATERIAL", dataEntrega: "2026-07-10" })],
      blocosBriefing: [],
      parceiras,
      hoje: "2026-07-15",
    });
    expect(resultado).toEqual([]);
  });

  it("não inclui Entrega em outro estado (EM_REVISAO, APROVADO, PUBLICADO)", () => {
    const resultado = calcularProximosPrazos({
      entregas: [
        entrega({ id: "a", estado: "EM_REVISAO", dataEntrega: "2026-07-17" }),
        entrega({ id: "b", estado: "APROVADO", dataEntrega: "2026-07-18" }),
        entrega({ id: "c", estado: "PUBLICADO", dataEntrega: "2026-07-19" }),
      ],
      blocosBriefing: [],
      parceiras,
      hoje: "2026-07-15",
    });
    expect(resultado).toEqual([]);
  });

  it("inclui Bloco de Briefing com dataPostagem futura e exclui dataPostagem passada", () => {
    const resultado = calcularProximosPrazos({
      entregas: [],
      blocosBriefing: [
        blocoBriefing({ id: "futuro", dataPostagem: "2026-07-20" }),
        blocoBriefing({ id: "passado", dataPostagem: "2026-07-01" }),
      ],
      parceiras,
      hoje: "2026-07-15",
    });
    expect(resultado).toEqual([
      { tipo: "postagem", parceiraNome: "Parceira Um", formato: "Carrossel", data: "2026-07-20", diasRestantes: 5 },
    ]);
  });

  it("ordena Entregas e Blocos de Briefing juntos por proximidade de data", () => {
    const resultado = calcularProximosPrazos({
      entregas: [entrega({ id: "e1", estado: "AGUARDANDO_MATERIAL", dataEntrega: "2026-07-25" })],
      blocosBriefing: [blocoBriefing({ id: "b1", dataPostagem: "2026-07-16" })],
      parceiras,
      hoje: "2026-07-15",
    });
    expect(resultado.map((item) => item.data)).toEqual(["2026-07-16", "2026-07-25"]);
  });

  it("limita a 5 itens, mantendo os mais próximos", () => {
    const entregas = Array.from({ length: 7 }, (_, indice) =>
      entrega({
        id: `e${indice}`,
        estado: "AGUARDANDO_MATERIAL",
        dataEntrega: `2026-07-${String(16 + indice).padStart(2, "0")}`,
      }),
    );
    const resultado = calcularProximosPrazos({ entregas, blocosBriefing: [], parceiras, hoje: "2026-07-15" });
    expect(resultado).toHaveLength(5);
    expect(resultado[0].data).toBe("2026-07-16");
    expect(resultado[4].data).toBe("2026-07-20");
  });

  it("resolve diasRestantes = 0 para prazo hoje", () => {
    const resultado = calcularProximosPrazos({
      entregas: [entrega({ estado: "AGUARDANDO_MATERIAL", dataEntrega: "2026-07-15" })],
      blocosBriefing: [],
      parceiras,
      hoje: "2026-07-15",
    });
    expect(resultado[0].diasRestantes).toBe(0);
  });

  it("usa 'parceira' como nome de fallback quando parceiraId não é encontrado", () => {
    const resultado = calcularProximosPrazos({
      entregas: [entrega({ parceiraId: "inexistente", estado: "AGUARDANDO_MATERIAL", dataEntrega: "2026-07-17" })],
      blocosBriefing: [],
      parceiras,
      hoje: "2026-07-15",
    });
    expect(resultado[0].parceiraNome).toBe("parceira");
  });
});
