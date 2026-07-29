import { describe, expect, it } from "vitest";
import { aprovarEntrega, criarEntregaAdministrativa } from "../conteudo/conteudo.service.js";
import { entregaRepositorio } from "../conteudo/entrega.repository.js";
import { alterarStatusParceira, cadastrarParceira } from "../parceira/parceira.service.js";
import {
  calcularElegibilidadeMensal,
  calcularResumoFinanceiro,
  editarValorObrigacao,
  lancarObrigacao,
  liberarObrigacao,
  listarObrigacoesAdministrativas,
  marcarObrigacaoPaga,
  removerObrigacao,
} from "./financeiro.service.js";
import type { ObrigacaoFinanceira } from "./obrigacao.types.js";

function obrigacao(overrides: Partial<ObrigacaoFinanceira> = {}): ObrigacaoFinanceira {
  return {
    id: "o1",
    parceiraId: "parceira-1",
    mesReferencia: "2026-07",
    valor: 1000,
    estado: "EM_ABERTO",
    tipo: "MENSAL",
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

describe("calcularResumoFinanceiro (UC-030.01, CB-02)", () => {
  it("EM_ABERTO conta em previsto, não em pago", () => {
    const resultado = calcularResumoFinanceiro([obrigacao({ estado: "EM_ABERTO", valor: 1000 })]);
    expect(resultado).toEqual({ previsto: 1000, pago: 0 });
  });

  it("APROVADO conta em previsto, não em pago", () => {
    const resultado = calcularResumoFinanceiro([obrigacao({ estado: "APROVADO", valor: 1000 })]);
    expect(resultado).toEqual({ previsto: 1000, pago: 0 });
  });

  it("PAGO conta em previsto e em pago", () => {
    const resultado = calcularResumoFinanceiro([obrigacao({ estado: "PAGO", valor: 1000 })]);
    expect(resultado).toEqual({ previsto: 1000, pago: 1000 });
  });

  it("soma múltiplas Obrigações em estados diferentes", () => {
    const resultado = calcularResumoFinanceiro([
      obrigacao({ id: "a", estado: "PAGO", valor: 1000 }),
      obrigacao({ id: "b", estado: "EM_ABERTO", valor: 500 }),
    ]);
    expect(resultado).toEqual({ previsto: 1500, pago: 1000 });
  });

  it("sem Obrigações, tudo é zero", () => {
    expect(calcularResumoFinanceiro([])).toEqual({ previsto: 0, pago: 0 });
  });
});

describe("calcularElegibilidadeMensal (ADR-009/SPEC-020 §9)", () => {
  it("vacuamente elegível quando não há Entregas na competência", () => {
    expect(calcularElegibilidadeMensal([])).toBe(true);
  });

  it("elegível quando todas as Entregas estão APROVADO ou PUBLICADO", () => {
    const entrega = (estado: "APROVADO" | "PUBLICADO") => ({
      id: "e1",
      parceiraId: "p1",
      mesReferencia: "2026-07",
      formato: "Reel" as const,
      estado,
      dataEntrega: "2026-07-10",
      materialEnviado: null,
      dataCriacao: "2026-07-01T00:00:00.000Z",
      dataAtualizacao: "2026-07-01T00:00:00.000Z",
    });
    expect(calcularElegibilidadeMensal([entrega("APROVADO")])).toBe(true);
    expect(calcularElegibilidadeMensal([entrega("PUBLICADO")])).toBe(true);
  });

  it("não elegível se alguma Entrega estiver AGUARDANDO_MATERIAL ou EM_REVISAO", () => {
    const base = {
      id: "e1",
      parceiraId: "p1",
      mesReferencia: "2026-07",
      formato: "Reel" as const,
      dataEntrega: "2026-07-10",
      materialEnviado: null,
      dataCriacao: "2026-07-01T00:00:00.000Z",
      dataAtualizacao: "2026-07-01T00:00:00.000Z",
    };
    expect(
      calcularElegibilidadeMensal([
        { ...base, estado: "APROVADO" },
        { ...base, id: "e2", estado: "EM_REVISAO" },
      ]),
    ).toBe(false);
  });
});

describe("lancarObrigacao (Backoffice)", () => {
  it("nasce sempre EM_ABERTO, mesmo que outro estado seja enviado", async () => {
    const parceira = await criarParceiraAtiva("PARCEIRA-OBRIGACAO-1");

    const resultado = await lancarObrigacao({
      parceiraId: parceira.id,
      mesReferencia: "2026-07",
      valor: 2500,
      tipo: "MENSAL",
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;
    expect(resultado.obrigacao).toEqual(
      expect.objectContaining({
        estado: "EM_ABERTO",
        tipo: "MENSAL",
        dataArquivamento: null,
        entregasDaCompetencia: [],
        elegivelParaLiberacao: true,
      }),
    );
    expect(resultado.obrigacao.dataCriacao).toBe(resultado.obrigacao.dataAtualizacao);
  });

  it("rejeita Parceira inexistente", async () => {
    const resultado = await lancarObrigacao({
      parceiraId: "id-inexistente",
      mesReferencia: "2026-07",
      valor: 1000,
      tipo: "MENSAL",
    });
    expect(resultado).toEqual({ ok: false, motivo: "PARCEIRA_INEXISTENTE" });
  });

  it("rejeita Obrigação MENSAL para Parceira INATIVA", async () => {
    const parceira = await cadastrarParceira({
      chave: "PARCEIRA-OBRIGACAO-2",
      nome: "Parceira Inativa",
      email: "parceira-obrigacao-2@dodo.dev",
      cnpj: "",
      pix: "",
      condicaoComercial,
    });

    const resultado = await lancarObrigacao({
      parceiraId: parceira.id,
      mesReferencia: "2026-07",
      valor: 1000,
      tipo: "MENSAL",
    });

    expect(resultado).toEqual({ ok: false, motivo: "PARCEIRA_INATIVA" });
  });

  it("permite Obrigação AVULSA para Parceira INATIVA (UC-020.02: qualquer Parceira)", async () => {
    const parceira = await cadastrarParceira({
      chave: "PARCEIRA-OBRIGACAO-3",
      nome: "Parceira Inativa 2",
      email: "parceira-obrigacao-3@dodo.dev",
      cnpj: "",
      pix: "",
      condicaoComercial,
    });

    const resultado = await lancarObrigacao({
      parceiraId: parceira.id,
      mesReferencia: "2026-07",
      valor: 300,
      tipo: "AVULSO",
    });

    expect(resultado.ok).toBe(true);
  });

  it("rejeita segunda Obrigação MENSAL para a mesma Parceira/competência (SPEC-020 §5)", async () => {
    const parceira = await criarParceiraAtiva("PARCEIRA-OBRIGACAO-4");
    await lancarObrigacao({ parceiraId: parceira.id, mesReferencia: "2026-08", valor: 2500, tipo: "MENSAL" });

    const segunda = await lancarObrigacao({
      parceiraId: parceira.id,
      mesReferencia: "2026-08",
      valor: 2500,
      tipo: "MENSAL",
    });

    expect(segunda).toEqual({ ok: false, motivo: "OBRIGACAO_MENSAL_JA_EXISTE" });
  });

  it("permite Obrigação AVULSA mesmo já havendo uma MENSAL na mesma competência", async () => {
    const parceira = await criarParceiraAtiva("PARCEIRA-OBRIGACAO-5");
    await lancarObrigacao({ parceiraId: parceira.id, mesReferencia: "2026-09", valor: 2500, tipo: "MENSAL" });

    const avulsa = await lancarObrigacao({
      parceiraId: parceira.id,
      mesReferencia: "2026-09",
      valor: 300,
      tipo: "AVULSO",
    });

    expect(avulsa.ok).toBe(true);
  });

  it("rejeita valor inválido e mesReferencia fora do formato", async () => {
    const parceira = await criarParceiraAtiva("PARCEIRA-OBRIGACAO-6");

    expect(
      await lancarObrigacao({ parceiraId: parceira.id, mesReferencia: "2026-07", valor: 0, tipo: "MENSAL" }),
    ).toEqual({ ok: false, motivo: "VALOR_INVALIDO" });
    expect(
      await lancarObrigacao({ parceiraId: parceira.id, mesReferencia: "07/2026", valor: 100, tipo: "AVULSO" }),
    ).toEqual({ ok: false, motivo: "MES_REFERENCIA_INVALIDO" });
  });
});

describe("editarValorObrigacao (Backoffice)", () => {
  it("atualiza o valor e retorna NAO_ENCONTRADA para id inexistente", async () => {
    const parceira = await criarParceiraAtiva("PARCEIRA-OBRIGACAO-7");
    const criada = await lancarObrigacao({
      parceiraId: parceira.id,
      mesReferencia: "2026-07",
      valor: 1000,
      tipo: "MENSAL",
    });
    if (!criada.ok) throw new Error("fixture inválida");

    const resultado = await editarValorObrigacao(criada.obrigacao.id, 1500);
    expect(resultado).toEqual({ ok: true, obrigacao: expect.objectContaining({ valor: 1500 }) });

    expect(await editarValorObrigacao("id-inexistente", 100)).toEqual({ ok: false, motivo: "NAO_ENCONTRADA" });
  });

  it("rejeita edição de Obrigação já PAGA (INV-03, arquivada)", async () => {
    const parceira = await criarParceiraAtiva("PARCEIRA-OBRIGACAO-8");
    const criada = await lancarObrigacao({
      parceiraId: parceira.id,
      mesReferencia: "2026-07",
      valor: 1000,
      tipo: "AVULSO",
    });
    if (!criada.ok) throw new Error("fixture inválida");

    await liberarObrigacao(criada.obrigacao.id);
    await marcarObrigacaoPaga(criada.obrigacao.id);

    expect(await editarValorObrigacao(criada.obrigacao.id, 2000)).toEqual({
      ok: false,
      motivo: "OBRIGACAO_ARQUIVADA",
    });
  });
});

describe("liberarObrigacao (ADR-009/SPEC-020 §9)", () => {
  it("libera Obrigação AVULSA sempre, sem checar Entregas", async () => {
    const parceira = await criarParceiraAtiva("PARCEIRA-OBRIGACAO-9");
    const criada = await lancarObrigacao({
      parceiraId: parceira.id,
      mesReferencia: "2026-07",
      valor: 300,
      tipo: "AVULSO",
    });
    if (!criada.ok) throw new Error("fixture inválida");

    const resultado = await liberarObrigacao(criada.obrigacao.id);
    expect(resultado).toEqual({ ok: true, obrigacao: expect.objectContaining({ estado: "APROVADO" }) });
  });

  it("libera Obrigação MENSAL sem Entregas na competência (vacuamente elegível)", async () => {
    const parceira = await criarParceiraAtiva("PARCEIRA-OBRIGACAO-10");
    const criada = await lancarObrigacao({
      parceiraId: parceira.id,
      mesReferencia: "2026-07",
      valor: 2500,
      tipo: "MENSAL",
    });
    if (!criada.ok) throw new Error("fixture inválida");

    const resultado = await liberarObrigacao(criada.obrigacao.id);
    expect(resultado.ok).toBe(true);
  });

  it("rejeita liberar Obrigação MENSAL com Entrega ainda AGUARDANDO_MATERIAL (PG-05)", async () => {
    const parceira = await criarParceiraAtiva("PARCEIRA-OBRIGACAO-11");
    await criarEntregaAdministrativa({
      parceiraId: parceira.id,
      mesReferencia: "2026-07",
      formato: "Reel",
      dataEntrega: "2026-07-10",
    });
    const criada = await lancarObrigacao({
      parceiraId: parceira.id,
      mesReferencia: "2026-07",
      valor: 2500,
      tipo: "MENSAL",
    });
    if (!criada.ok) throw new Error("fixture inválida");

    const resultado = await liberarObrigacao(criada.obrigacao.id);
    expect(resultado).toEqual({ ok: false, motivo: "CONTEUDO_NAO_APROVADO" });
  });

  it("libera Obrigação MENSAL quando a Entrega já está APROVADO", async () => {
    const parceira = await criarParceiraAtiva("PARCEIRA-OBRIGACAO-12");
    const entregaResultado = await criarEntregaAdministrativa({
      parceiraId: parceira.id,
      mesReferencia: "2026-07",
      formato: "Reel",
      dataEntrega: "2026-07-10",
    });
    if (!entregaResultado.ok) throw new Error("fixture inválida");
    await entregaRepositorio.atualizar({ ...entregaResultado.entrega, estado: "APROVADO" });

    const criada = await lancarObrigacao({
      parceiraId: parceira.id,
      mesReferencia: "2026-07",
      valor: 2500,
      tipo: "MENSAL",
    });
    if (!criada.ok) throw new Error("fixture inválida");

    const resultado = await liberarObrigacao(criada.obrigacao.id);
    expect(resultado.ok).toBe(true);
  });

  it("integração ponta a ponta: Entrega aprovada via aprovarEntrega (não via repositório direto) torna a Obrigação MENSAL elegível", async () => {
    const parceira = await criarParceiraAtiva("PARCEIRA-OBRIGACAO-11B");
    const entregaResultado = await criarEntregaAdministrativa({
      parceiraId: parceira.id,
      mesReferencia: "2026-07",
      formato: "Reel",
      dataEntrega: "2026-07-10",
    });
    if (!entregaResultado.ok) throw new Error("fixture inválida");
    await entregaRepositorio.atualizar({ ...entregaResultado.entrega, estado: "EM_REVISAO" });

    const criada = await lancarObrigacao({
      parceiraId: parceira.id,
      mesReferencia: "2026-07",
      valor: 2500,
      tipo: "MENSAL",
    });
    if (!criada.ok) throw new Error("fixture inválida");
    expect(criada.obrigacao.elegivelParaLiberacao).toBe(false);

    const aprovacao = await aprovarEntrega(entregaResultado.entrega.id);
    expect(aprovacao.ok).toBe(true);

    const resultado = await liberarObrigacao(criada.obrigacao.id);
    expect(resultado.ok).toBe(true);
  });

  it("rejeita liberar Obrigação que não está EM_ABERTO", async () => {
    const parceira = await criarParceiraAtiva("PARCEIRA-OBRIGACAO-13");
    const criada = await lancarObrigacao({
      parceiraId: parceira.id,
      mesReferencia: "2026-07",
      valor: 300,
      tipo: "AVULSO",
    });
    if (!criada.ok) throw new Error("fixture inválida");

    await liberarObrigacao(criada.obrigacao.id);
    const segunda = await liberarObrigacao(criada.obrigacao.id);
    expect(segunda).toEqual({ ok: false, motivo: "TRANSICAO_INVALIDA" });
  });

  it("retorna NAO_ENCONTRADA para id inexistente", async () => {
    expect(await liberarObrigacao("id-inexistente")).toEqual({ ok: false, motivo: "NAO_ENCONTRADA" });
  });
});

describe("marcarObrigacaoPaga (RN-03/CB-02, SPEC-020)", () => {
  it("marca como paga e carimba dataArquivamento", async () => {
    const parceira = await criarParceiraAtiva("PARCEIRA-OBRIGACAO-14");
    const criada = await lancarObrigacao({
      parceiraId: parceira.id,
      mesReferencia: "2026-07",
      valor: 300,
      tipo: "AVULSO",
    });
    if (!criada.ok) throw new Error("fixture inválida");
    await liberarObrigacao(criada.obrigacao.id);

    const resultado = await marcarObrigacaoPaga(criada.obrigacao.id);
    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;
    expect(resultado.obrigacao.estado).toBe("PAGO");
    expect(resultado.obrigacao.dataArquivamento).toBeTruthy();
  });

  it("rejeita pagar Obrigação ainda EM_ABERTO (precisa liberar antes)", async () => {
    const parceira = await criarParceiraAtiva("PARCEIRA-OBRIGACAO-15");
    const criada = await lancarObrigacao({
      parceiraId: parceira.id,
      mesReferencia: "2026-07",
      valor: 300,
      tipo: "AVULSO",
    });
    if (!criada.ok) throw new Error("fixture inválida");

    expect(await marcarObrigacaoPaga(criada.obrigacao.id)).toEqual({ ok: false, motivo: "TRANSICAO_INVALIDA" });
  });

  it("rejeita pagar uma Obrigação já paga (CB-02, terminal)", async () => {
    const parceira = await criarParceiraAtiva("PARCEIRA-OBRIGACAO-16");
    const criada = await lancarObrigacao({
      parceiraId: parceira.id,
      mesReferencia: "2026-07",
      valor: 300,
      tipo: "AVULSO",
    });
    if (!criada.ok) throw new Error("fixture inválida");
    await liberarObrigacao(criada.obrigacao.id);
    await marcarObrigacaoPaga(criada.obrigacao.id);

    expect(await marcarObrigacaoPaga(criada.obrigacao.id)).toEqual({ ok: false, motivo: "TRANSICAO_INVALIDA" });
  });
});

describe("removerObrigacao (Backoffice)", () => {
  it("remove quando ainda EM_ABERTO", async () => {
    const parceira = await criarParceiraAtiva("PARCEIRA-OBRIGACAO-17");
    const criada = await lancarObrigacao({
      parceiraId: parceira.id,
      mesReferencia: "2026-07",
      valor: 300,
      tipo: "AVULSO",
    });
    if (!criada.ok) throw new Error("fixture inválida");

    expect(await removerObrigacao(criada.obrigacao.id)).toEqual({ ok: true });
  });

  it("rejeita remoção depois de liberada (JA_LIBERADA)", async () => {
    const parceira = await criarParceiraAtiva("PARCEIRA-OBRIGACAO-18");
    const criada = await lancarObrigacao({
      parceiraId: parceira.id,
      mesReferencia: "2026-07",
      valor: 300,
      tipo: "AVULSO",
    });
    if (!criada.ok) throw new Error("fixture inválida");
    await liberarObrigacao(criada.obrigacao.id);

    expect(await removerObrigacao(criada.obrigacao.id)).toEqual({ ok: false, motivo: "JA_LIBERADA" });
  });

  it("retorna NAO_ENCONTRADA para id inexistente", async () => {
    expect(await removerObrigacao("id-inexistente")).toEqual({ ok: false, motivo: "NAO_ENCONTRADA" });
  });
});

describe("listarObrigacoesAdministrativas (Backoffice)", () => {
  it("anota elegivelParaLiberacao=true para AVULSO sempre, e calcula para MENSAL conforme as Entregas", async () => {
    const parceira = await criarParceiraAtiva("PARCEIRA-OBRIGACAO-19");
    await criarEntregaAdministrativa({
      parceiraId: parceira.id,
      mesReferencia: "2026-10",
      formato: "Reel",
      dataEntrega: "2026-10-10",
    });
    const mensal = await lancarObrigacao({
      parceiraId: parceira.id,
      mesReferencia: "2026-10",
      valor: 2500,
      tipo: "MENSAL",
    });
    const avulsa = await lancarObrigacao({
      parceiraId: parceira.id,
      mesReferencia: "2026-10",
      valor: 300,
      tipo: "AVULSO",
    });
    if (!mensal.ok || !avulsa.ok) throw new Error("fixture inválida");

    const lista = await listarObrigacoesAdministrativas();

    const itemMensal = lista.find((item) => item.id === mensal.obrigacao.id);
    expect(itemMensal).toEqual(
      expect.objectContaining({ elegivelParaLiberacao: false, entregasDaCompetencia: expect.any(Array) }),
    );
    expect(itemMensal?.entregasDaCompetencia).toHaveLength(1);

    const itemAvulso = lista.find((item) => item.id === avulsa.obrigacao.id);
    expect(itemAvulso).toEqual(expect.objectContaining({ elegivelParaLiberacao: true }));
  });
});
