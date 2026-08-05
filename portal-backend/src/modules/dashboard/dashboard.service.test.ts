import { describe, expect, it } from "vitest";
import type { BlocoBriefing } from "../briefing/briefing.types.js";
import type { ColaboracaoMensal } from "../colaboracao-mensal/colaboracaoMensal.types.js";
import type { Entrega } from "../conteudo/entrega.types.js";
import type { DocumentoEmitido } from "../documentos/documentos.types.js";
import type { ObrigacaoFinanceira } from "../financeiro/obrigacao.types.js";
import type { Identidade } from "../identidade/identidade.types.js";
import type { SolicitacaoExclusao } from "../lgpd/exclusao.types.js";
import type { Parceira } from "../parceira/parceira.types.js";
import {
  calcularExcecoesOperacionais,
  calcularFichaParceira,
  calcularIndicadores,
  calcularIndicadoresMarca,
  calcularPagamentosCompetencia,
  calcularPanoramaCampanha,
  calcularProximosPrazos,
} from "./dashboard.service.js";

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

function colaboracaoMensal(overrides: Partial<ColaboracaoMensal> = {}): ColaboracaoMensal {
  return {
    id: "cm1",
    parceiraId: "p1",
    mesReferencia: "2026-07",
    condicaoComercial,
    status: "COMPILADA",
    criadoPor: "admin@dodo.dev",
    criadoEm: "2026-07-01T00:00:00.000Z",
    quantidadeRegistrosGerados: 3,
    ...overrides,
  };
}

function documentoEmitido(overrides: Partial<DocumentoEmitido> = {}): DocumentoEmitido {
  return {
    id: "doc1",
    tipo: "CONTRATO",
    templateVersaoId: "tv1",
    parceiraId: "p1",
    colaboracaoMensalId: null,
    geradoEm: "2026-07-01T00:00:00.000Z",
    geradoPor: "admin@dodo.dev",
    status: "GERADO",
    hash: "hash1",
    urlStorage: "https://storage.example/doc1.pdf",
    storageFileId: "file1",
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

describe("calcularIndicadoresMarca", () => {
  it("projeta só os campos operacionais, sem financeiro/lgpd/moderacao (ADR-022)", () => {
    const indicadores = calcularIndicadores({
      parceiras: [parceira({ status: "ATIVA" }), parceira({ id: "p2", status: "INATIVA" })],
      entregas: [
        entrega({ estado: "AGUARDANDO_MATERIAL", dataEntrega: "2026-07-17" }),
        entrega({ id: "e2", estado: "EM_REVISAO", dataEntrega: "2026-07-18" }),
      ],
      obrigacoes: [],
      contasPendentes: [],
      solicitacoesExclusao: [],
      blocosBriefing: [],
      hoje: "2026-07-15",
    });

    expect(calcularIndicadoresMarca(indicadores, [])).toEqual({
      parceiras: { ativas: 1, total: 2 },
      entregas: { aguardandoMaterial: 1, emRevisao: 1, atrasadas: 0 },
      proximosPrazos: indicadores.proximosPrazos,
      excecoes: [],
    });
  });

  it("sem nenhum dado, todos os indicadores operacionais são zero", () => {
    const indicadores = calcularIndicadores({
      parceiras: [],
      entregas: [],
      obrigacoes: [],
      contasPendentes: [],
      solicitacoesExclusao: [],
      blocosBriefing: [],
      hoje: "2026-07-15",
    });

    expect(calcularIndicadoresMarca(indicadores, [])).toEqual({
      parceiras: { ativas: 0, total: 0 },
      entregas: { aguardandoMaterial: 0, emRevisao: 0, atrasadas: 0 },
      proximosPrazos: [],
      excecoes: [],
    });
  });
});

describe("calcularExcecoesOperacionais", () => {
  const parceiras = [parceira({ id: "p1", nome: "Maria" }), parceira({ id: "p2", nome: "Juliana" })];

  it("sem entregas, retorna lista vazia", () => {
    expect(calcularExcecoesOperacionais({ entregas: [], parceiras, hoje: "2026-07-15" })).toEqual([]);
  });

  it("inclui Entrega AGUARDANDO_MATERIAL com dataEntrega já vencida como 'atrasado'", () => {
    const resultado = calcularExcecoesOperacionais({
      entregas: [
        entrega({ parceiraId: "p1", estado: "AGUARDANDO_MATERIAL", dataEntrega: "2026-07-10" }),
      ],
      parceiras,
      hoje: "2026-07-15",
    });
    expect(resultado).toEqual([
      { tipo: "atrasado", parceiraNome: "Maria", formato: "Reel", data: "2026-07-10" },
    ]);
  });

  it("não inclui Entrega AGUARDANDO_MATERIAL com dataEntrega ainda no futuro", () => {
    const resultado = calcularExcecoesOperacionais({
      entregas: [
        entrega({ parceiraId: "p1", estado: "AGUARDANDO_MATERIAL", dataEntrega: "2026-07-20" }),
      ],
      parceiras,
      hoje: "2026-07-15",
    });
    expect(resultado).toEqual([]);
  });

  it("inclui Entrega EM_REVISAO independentemente da data, sem campo data", () => {
    const resultado = calcularExcecoesOperacionais({
      entregas: [entrega({ parceiraId: "p2", estado: "EM_REVISAO", dataEntrega: "2026-07-20" })],
      parceiras,
      hoje: "2026-07-15",
    });
    expect(resultado).toEqual([
      { tipo: "em_revisao", parceiraNome: "Juliana", formato: "Reel", data: null },
    ]);
  });

  it("não inclui Entrega APROVADO nem PUBLICADO", () => {
    const resultado = calcularExcecoesOperacionais({
      entregas: [
        entrega({ id: "a", estado: "APROVADO", dataEntrega: "2026-07-10" }),
        entrega({ id: "b", estado: "PUBLICADO", dataEntrega: "2026-07-10" }),
      ],
      parceiras,
      hoje: "2026-07-15",
    });
    expect(resultado).toEqual([]);
  });

  it("usa 'parceira' como nome de fallback quando parceiraId não é encontrado", () => {
    const resultado = calcularExcecoesOperacionais({
      entregas: [
        entrega({ parceiraId: "inexistente", estado: "EM_REVISAO", dataEntrega: "2026-07-20" }),
      ],
      parceiras,
      hoje: "2026-07-15",
    });
    expect(resultado[0].parceiraNome).toBe("parceira");
  });
});

describe("calcularPagamentosCompetencia", () => {
  it("sem obrigações, retorna zero", () => {
    expect(calcularPagamentosCompetencia({ obrigacoes: [], competencia: "2026-08" })).toEqual({
      pendentes: 0,
      valorPendente: 0,
    });
  });

  it("soma só obrigações da competência informada, ignorando outros meses", () => {
    const resultado = calcularPagamentosCompetencia({
      obrigacoes: [
        obrigacao({ id: "a", mesReferencia: "2026-08", valor: 1000, estado: "EM_ABERTO" }),
        obrigacao({ id: "b", mesReferencia: "2026-08", valor: 500, estado: "APROVADO" }),
        obrigacao({ id: "c", mesReferencia: "2026-07", valor: 2000, estado: "EM_ABERTO" }),
      ],
      competencia: "2026-08",
    });
    expect(resultado).toEqual({ pendentes: 2, valorPendente: 1500 });
  });

  it("não inclui obrigação já PAGA, mesmo na competência certa", () => {
    const resultado = calcularPagamentosCompetencia({
      obrigacoes: [obrigacao({ mesReferencia: "2026-08", valor: 1000, estado: "PAGO" })],
      competencia: "2026-08",
    });
    expect(resultado).toEqual({ pendentes: 0, valorPendente: 0 });
  });
});

describe("calcularPanoramaCampanha", () => {
  it("agrega indicadores + nomes de parceiras ativas + pagamentos da competência atual", () => {
    const parceirasDaCampanha = [
      parceira({ id: "p1", nome: "Maria", status: "ATIVA" }),
      parceira({ id: "p2", nome: "Juliana", status: "ATIVA" }),
      parceira({ id: "p3", nome: "Inativa", status: "INATIVA" }),
    ];
    const entregasDaCampanha = [
      entrega({ parceiraId: "p1", estado: "AGUARDANDO_MATERIAL", dataEntrega: "2026-07-10" }),
    ];
    const obrigacoesDaCampanha = [obrigacao({ mesReferencia: "2026-07", valor: 800, estado: "EM_ABERTO" })];
    const indicadores = calcularIndicadores({
      parceiras: parceirasDaCampanha,
      entregas: entregasDaCampanha,
      obrigacoes: [],
      contasPendentes: [],
      solicitacoesExclusao: [],
      blocosBriefing: [],
      hoje: "2026-07-15",
    });

    const resultado = calcularPanoramaCampanha({
      indicadores,
      parceiras: parceirasDaCampanha,
      entregas: entregasDaCampanha,
      obrigacoes: obrigacoesDaCampanha,
      hoje: "2026-07-15",
    });

    expect(resultado).toEqual({
      competenciaAtual: "2026-07",
      parceiras: { ativas: 2, inativas: 1, total: 3, nomesAtivas: ["Maria", "Juliana"] },
      entregas: indicadores.entregas,
      proximosPrazos: indicadores.proximosPrazos,
      excecoes: [{ tipo: "atrasado", parceiraNome: "Maria", formato: "Reel", data: "2026-07-10" }],
      pagamentos: { pendentes: 1, valorPendente: 800 },
    });
  });
});

describe("calcularFichaParceira", () => {
  const dadosBase = {
    parceira: parceira({ id: "p1", nome: "Maria" }),
    colaboracoesMensais: [] as ColaboracaoMensal[],
    entregas: [] as Entrega[],
    blocosBriefing: [] as BlocoBriefing[],
    obrigacoes: [] as ObrigacaoFinanceira[],
    documentos: [] as DocumentoEmitido[],
    hoje: "2026-07-15",
  };

  it("identifica a Colaboração Mensal da competência corrente como colaboracaoAtual", () => {
    const resultado = calcularFichaParceira({
      ...dadosBase,
      colaboracoesMensais: [
        colaboracaoMensal({ id: "atual", mesReferencia: "2026-07" }),
        colaboracaoMensal({ id: "antiga", mesReferencia: "2026-06" }),
      ],
    });
    expect(resultado.colaboracaoAtual?.id).toBe("atual");
  });

  it("colaboracaoAtual é null quando a competência corrente ainda não foi compilada", () => {
    const resultado = calcularFichaParceira({
      ...dadosBase,
      colaboracoesMensais: [colaboracaoMensal({ id: "antiga", mesReferencia: "2026-06" })],
    });
    expect(resultado.colaboracaoAtual).toBeNull();
    expect(resultado.competenciaAtual).toBe("2026-07");
  });

  it("historicoColaboracoes exclui a atual e ordena da mais recente para a mais antiga", () => {
    const resultado = calcularFichaParceira({
      ...dadosBase,
      colaboracoesMensais: [
        colaboracaoMensal({ id: "atual", mesReferencia: "2026-07" }),
        colaboracaoMensal({ id: "maio", mesReferencia: "2026-05" }),
        colaboracaoMensal({ id: "junho", mesReferencia: "2026-06" }),
      ],
    });
    expect(resultado.historicoColaboracoes.map((c) => c.id)).toEqual(["junho", "maio"]);
  });

  it("separa obrigações pendentes de pagas e soma valorPendente só das pendentes", () => {
    const resultado = calcularFichaParceira({
      ...dadosBase,
      obrigacoes: [
        obrigacao({ id: "a", estado: "EM_ABERTO", valor: 1000 }),
        obrigacao({ id: "b", estado: "APROVADO", valor: 500 }),
        obrigacao({ id: "c", estado: "PAGO", valor: 2000 }),
      ],
    });
    expect(resultado.financeiro.obrigacoesPendentes.map((o) => o.id)).toEqual(["a", "b"]);
    expect(resultado.financeiro.obrigacoesPagas.map((o) => o.id)).toEqual(["c"]);
    expect(resultado.financeiro.valorPendente).toBe(1500);
  });

  it("conta entregas por estado, igual a calcularIndicadores, escopado a esta Parceira", () => {
    const resultado = calcularFichaParceira({
      ...dadosBase,
      entregas: [
        entrega({ id: "atrasada", estado: "AGUARDANDO_MATERIAL", dataEntrega: "2026-07-10" }),
        entrega({ id: "no-prazo", estado: "AGUARDANDO_MATERIAL", dataEntrega: "2026-07-20" }),
        entrega({ id: "revisao", estado: "EM_REVISAO" }),
      ],
    });
    expect(resultado.entregas).toEqual({ aguardandoMaterial: 2, emRevisao: 1, atrasadas: 1 });
  });

  it("documentos vem ordenado do mais recente para o mais antigo", () => {
    const resultado = calcularFichaParceira({
      ...dadosBase,
      documentos: [
        documentoEmitido({ id: "antigo", geradoEm: "2026-05-01T00:00:00.000Z" }),
        documentoEmitido({ id: "recente", geradoEm: "2026-07-01T00:00:00.000Z" }),
      ],
    });
    expect(resultado.documentos.map((d) => d.id)).toEqual(["recente", "antigo"]);
  });

  it("sem nenhum dado vinculado, retorna listas vazias e contagens zeradas", () => {
    const resultado = calcularFichaParceira(dadosBase);
    expect(resultado.colaboracaoAtual).toBeNull();
    expect(resultado.historicoColaboracoes).toEqual([]);
    expect(resultado.entregas).toEqual({ aguardandoMaterial: 0, emRevisao: 0, atrasadas: 0 });
    expect(resultado.proximosPrazos).toEqual([]);
    expect(resultado.excecoes).toEqual([]);
    expect(resultado.financeiro).toEqual({ obrigacoesPendentes: [], obrigacoesPagas: [], valorPendente: 0 });
    expect(resultado.documentos).toEqual([]);
  });
});
