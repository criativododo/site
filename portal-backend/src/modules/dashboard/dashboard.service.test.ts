import { describe, expect, it } from "vitest";
import type { Entrega } from "../conteudo/entrega.types.js";
import type { ObrigacaoFinanceira } from "../financeiro/obrigacao.types.js";
import type { Identidade } from "../identidade/identidade.types.js";
import type { SolicitacaoExclusao } from "../lgpd/exclusao.types.js";
import type { Parceira } from "../parceira/parceira.types.js";
import { calcularIndicadores } from "./dashboard.service.js";

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

const semDados = {
  parceiras: [] as Parceira[],
  entregas: [] as Entrega[],
  obrigacoes: [] as ObrigacaoFinanceira[],
  contasPendentes: [] as Identidade[],
  solicitacoesExclusao: [] as SolicitacaoExclusao[],
};

describe("calcularIndicadores", () => {
  it("sem nenhum dado, todos os indicadores são zero", () => {
    expect(calcularIndicadores(semDados)).toEqual({
      parceiras: { ativas: 0, inativas: 0, total: 0 },
      entregas: { aguardandoMaterial: 0, emRevisao: 0, atrasadas: 0 },
      financeiro: { pendentes: 0, valorPendente: 0 },
      lgpd: { solicitacoesExclusaoPendentes: 0 },
      moderacao: { contasPendentes: 0 },
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
});
