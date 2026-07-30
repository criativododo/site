import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { pool } from "../../config/database.js";
import { briefingRepositorio } from "../briefing/briefing.repository.js";
import { entregaRepositorio } from "../conteudo/entrega.repository.js";
import { obrigacaoRepositorio } from "../financeiro/obrigacao.repository.js";
import { alterarStatusParceira, cadastrarParceira } from "../parceira/parceira.service.js";
import { buscarColaboracaoMensal, compilarCompetencia } from "./colaboracaoMensal.service.js";

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
    nome: `Parceira ${chave}`,
    email: `${chave.toLowerCase()}@dodo.dev`,
    cnpj: "",
    pix: "",
    condicaoComercial,
  });
  const ativada = await alterarStatusParceira(parceira.id, "ATIVA");
  if (!ativada.ok) {
    throw new Error("Falha ao ativar Parceira de teste");
  }
  return ativada.parceira;
}

describe("compilarCompetencia (ADR-016, Etapa 3 — capacidade interna, sem Endpoint)", () => {
  it("rejeita mesReferencia fora do formato AAAA-MM", async () => {
    const resultado = await compilarCompetencia("2031-13", "admin-teste");
    expect(resultado).toEqual({ ok: false, motivo: "MES_REFERENCIA_INVALIDO" });
  });

  it("cria Colaboração Mensal só para Parceira ATIVA, com snapshot da Condição Comercial", async () => {
    const ativa = await criarParceiraAtiva("COLAB-ATIVA-1");
    const inativa = await cadastrarParceira({
      chave: "COLAB-INATIVA-1",
      nome: "Parceira Inativa",
      email: "colab-inativa-1@dodo.dev",
      cnpj: "",
      pix: "",
      condicaoComercial,
    });

    const resultado = await compilarCompetencia("2031-01", "admin-teste");
    expect(resultado.ok).toBe(true);

    const colaboracaoAtiva = await buscarColaboracaoMensal(ativa.id, "2031-01");
    expect(colaboracaoAtiva).not.toBeNull();
    expect(colaboracaoAtiva?.status).toBe("COMPILADA");
    expect(colaboracaoAtiva?.criadoPor).toBe("admin-teste");
    expect(colaboracaoAtiva?.condicaoComercial).toEqual(condicaoComercial);

    const colaboracaoInativa = await buscarColaboracaoMensal(inativa.id, "2031-01");
    expect(colaboracaoInativa).toBeNull();
  });

  it("é idempotente: reexecutar para a mesma competência não duplica nem sobrescreve o snapshot", async () => {
    const parceira = await criarParceiraAtiva("COLAB-IDEMPOTENTE-1");

    const primeira = await compilarCompetencia("2031-02", "admin-primeira-execucao");
    const colaboracaoAposPrimeira = await buscarColaboracaoMensal(parceira.id, "2031-02");
    expect(colaboracaoAposPrimeira).not.toBeNull();

    const segunda = await compilarCompetencia("2031-02", "admin-segunda-execucao");
    const colaboracaoAposSegunda = await buscarColaboracaoMensal(parceira.id, "2031-02");

    expect(primeira.ok && segunda.ok).toBe(true);
    // Snapshot e execução original preservados — segunda chamada não sobrescreve.
    expect(colaboracaoAposSegunda).toEqual(colaboracaoAposPrimeira);
    expect(colaboracaoAposSegunda?.criadoPor).toBe("admin-primeira-execucao");
  });

  it("vincula Entregas/Briefings/Obrigações já existentes e mantém quantidadeRegistrosGerados sincronizada", async () => {
    const parceira = await criarParceiraAtiva("COLAB-VINCULO-1");
    const mesReferencia = "2031-03";
    const agora = new Date().toISOString();

    await entregaRepositorio.criar({
      id: randomUUID(),
      parceiraId: parceira.id,
      mesReferencia,
      formato: "Reel",
      estado: "AGUARDANDO_MATERIAL",
      dataEntrega: `${mesReferencia}-10`,
      materialEnviado: null,
      dataCriacao: agora,
      dataAtualizacao: agora,
      dataArquivamento: null,
    });
    await briefingRepositorio.criar({
      id: randomUUID(),
      parceiraId: parceira.id,
      mesReferencia,
      formato: "Reel",
      look: "look de teste",
      dataEntrega: `${mesReferencia}-10`,
      dataPostagem: `${mesReferencia}-12`,
      orientacao: "orientação de teste",
      dataAprovacaoInterna: `${mesReferencia}-08`,
      dataCriacao: agora,
      dataAtualizacao: agora,
    });
    await obrigacaoRepositorio.criar({
      id: randomUUID(),
      parceiraId: parceira.id,
      mesReferencia,
      valor: 2500,
      estado: "EM_ABERTO",
      tipo: "MENSAL",
      dataCriacao: agora,
      dataAtualizacao: agora,
      dataArquivamento: null,
    });

    const resultado = await compilarCompetencia(mesReferencia, "admin-teste");
    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.estatisticas.entregasVinculadas).toBeGreaterThanOrEqual(1);
    expect(resultado.estatisticas.briefingsVinculados).toBeGreaterThanOrEqual(1);
    expect(resultado.estatisticas.obrigacoesVinculadas).toBeGreaterThanOrEqual(1);

    const colaboracao = await buscarColaboracaoMensal(parceira.id, mesReferencia);
    expect(colaboracao?.quantidadeRegistrosGerados).toBe(3);

    const vinculos = await pool.query<{ colaboracao_mensal_id: string | null }>(
      "SELECT colaboracao_mensal_id FROM entregas WHERE parceira_id = $1 AND mes_referencia = $2",
      [parceira.id, mesReferencia],
    );
    expect(vinculos.rows[0].colaboracao_mensal_id).toBe(colaboracao?.id);
  });
});
