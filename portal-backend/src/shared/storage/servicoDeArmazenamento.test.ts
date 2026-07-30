import { describe, expect, it, vi } from "vitest";
import { ErroDeAutorizacaoStorage, ErroTransitorioDeArmazenamento } from "./erros.js";
import { ServicoDeArmazenamentoImpl } from "./servicoDeArmazenamento.js";
import type { ProvedorDeArmazenamento } from "./provedorDeArmazenamento.js";
import type { ParametrosDeEnvio, PaginaDeRecursos, RecursoDeArmazenamento } from "./tipos.js";

interface RecursoFake extends RecursoDeArmazenamento {
  pastaPaiId: string | null;
  appProperties?: { identidadeDoRecurso: string; chaveDeIdempotencia: string };
}

/** Fake em memória, sem rede (§6.2 do TDD) — implementação completa da interface. */
class ProvedorDeArmazenamentoFake implements ProvedorDeArmazenamento {
  private recursos: RecursoFake[] = [];
  private contador = 0;

  criarPasta = vi.fn(async (nome: string, pastaPaiId: string | null): Promise<RecursoDeArmazenamento> => {
    const recurso: RecursoFake = {
      id: `pasta-${++this.contador}`,
      nome,
      tipo: "pasta",
      caminhoLogico: nome,
      criadoEm: "2026-07-30T00:00:00.000Z",
      atualizadoEm: "2026-07-30T00:00:00.000Z",
      pastaPaiId,
    };
    this.recursos.push(recurso);
    return recurso;
  });

  enviarArquivo = vi.fn(async (params: ParametrosDeEnvio): Promise<RecursoDeArmazenamento> => {
    const existente = this.recursos.find(
      (r) => r.pastaPaiId === params.pastaId && r.appProperties?.identidadeDoRecurso === params.identidadeDoRecurso,
    );
    if (existente) {
      existente.appProperties = { identidadeDoRecurso: params.identidadeDoRecurso, chaveDeIdempotencia: params.chaveDeIdempotencia };
      return existente;
    }
    const recurso: RecursoFake = {
      id: `arquivo-${++this.contador}`,
      nome: params.nomeArquivo,
      tipo: "arquivo",
      caminhoLogico: params.nomeArquivo,
      criadoEm: "2026-07-30T00:00:00.000Z",
      atualizadoEm: "2026-07-30T00:00:00.000Z",
      pastaPaiId: params.pastaId,
      appProperties: { identidadeDoRecurso: params.identidadeDoRecurso, chaveDeIdempotencia: params.chaveDeIdempotencia },
    };
    this.recursos.push(recurso);
    return recurso;
  });

  listar = vi.fn(async (pastaId: string): Promise<PaginaDeRecursos> => {
    return { itens: this.recursos.filter((r) => r.pastaPaiId === pastaId) };
  });

  async baixarArquivo(): Promise<{ conteudo: NodeJS.ReadableStream; tipoMime: string; tamanhoBytes: number }> {
    throw new Error("não usado nestes testes");
  }

  async renomear(): Promise<RecursoDeArmazenamento> {
    throw new Error("não usado nestes testes");
  }

  async remover(): Promise<void> {
    throw new Error("não usado nestes testes");
  }

  async obterMetadados(): Promise<RecursoDeArmazenamento> {
    throw new Error("não usado nestes testes");
  }
}

const PASTA_RAIZ_ID = "raiz-1";

describe("ServicoDeArmazenamentoImpl", () => {
  it("provisiona pasta só na primeira chamada por Parceira × MesReferencia; reusa nas seguintes", async () => {
    const provedor = new ProvedorDeArmazenamentoFake();
    const servico = new ServicoDeArmazenamentoImpl(provedor, PASTA_RAIZ_ID);

    const primeira = await servico.resolverPastaDaColaboracao("parceira-1", "2026-07");
    const segunda = await servico.resolverPastaDaColaboracao("parceira-1", "2026-07");

    expect(primeira.id).toBe(segunda.id);
    // 3 níveis (Parceiras, parceira-1, 2026-07) criados só na 1ª chamada — nenhum novo na 2ª
    expect(provedor.criarPasta).toHaveBeenCalledTimes(3);
  });

  it("resolve em cadeia de 3 níveis a partir de pastaRaizId (Parceiras → parceiraId → mesReferencia)", async () => {
    const provedor = new ProvedorDeArmazenamentoFake();
    const servico = new ServicoDeArmazenamentoImpl(provedor, PASTA_RAIZ_ID);

    await servico.resolverPastaDaColaboracao("parceira-1", "2026-07");

    const chamadas = provedor.criarPasta.mock.calls;
    expect(chamadas[0]).toEqual(["Parceiras", PASTA_RAIZ_ID]);
    expect(chamadas[1][0]).toBe("parceira-1");
    expect(chamadas[2][0]).toBe("2026-07");

    // "Parceiras" (nível fixo) é reaproveitada, não recriada, ao resolver uma 2ª Parceira
    await servico.resolverPastaDaColaboracao("parceira-2", "2026-07");
    expect(provedor.criarPasta).toHaveBeenCalledTimes(5); // +parceira-2, +2026-07 (sob parceira-2); Parceiras não se repete
  });

  it("duas chamadas distintas a enviarMaterialDaEntrega para a mesma Entrega geram duas chaveDeIdempotencia diferentes (CB-01)", async () => {
    const provedor = new ProvedorDeArmazenamentoFake();
    const servico = new ServicoDeArmazenamentoImpl(provedor, PASTA_RAIZ_ID);

    const params = {
      entregaId: "entrega-1",
      parceiraId: "parceira-1",
      mesReferencia: "2026-07",
      formato: "reel",
      nomeOriginal: "video.mp4",
      conteudo: Buffer.from("a"),
      tipoMime: "video/mp4",
    };

    await servico.enviarMaterialDaEntrega(params);
    await servico.enviarMaterialDaEntrega(params);

    const chaves = provedor.enviarArquivo.mock.calls.map(([p]) => p.chaveDeIdempotencia);
    expect(chaves).toHaveLength(2);
    expect(chaves[0]).not.toBe(chaves[1]);
  });

  it("nomeia o arquivo como {formato}-{entregaId}.{extensão}, preservando a extensão original", async () => {
    const provedor = new ProvedorDeArmazenamentoFake();
    const servico = new ServicoDeArmazenamentoImpl(provedor, PASTA_RAIZ_ID);

    await servico.enviarMaterialDaEntrega({
      entregaId: "entrega-1",
      parceiraId: "parceira-1",
      mesReferencia: "2026-07",
      formato: "reel",
      nomeOriginal: "video final.mov",
      conteudo: Buffer.from("a"),
      tipoMime: "video/quicktime",
    });

    const [params] = provedor.enviarArquivo.mock.calls[0];
    expect(params.nomeArquivo).toBe("reel-entrega-1.mov");
    expect(params.identidadeDoRecurso).toBe("entrega-1");
  });

  it("erro já tipado do provedor (ErroDeArmazenamento) é propagado como está, nunca cru", async () => {
    const provedor = new ProvedorDeArmazenamentoFake();
    const erroOriginal = new ErroDeAutorizacaoStorage("sem permissão");
    provedor.criarPasta.mockRejectedValueOnce(erroOriginal);

    const servico = new ServicoDeArmazenamentoImpl(provedor, PASTA_RAIZ_ID);

    await expect(servico.resolverPastaDaColaboracao("parceira-1", "2026-07")).rejects.toBe(erroOriginal);
  });

  it("erro cru (não ErroDeArmazenamento) do provedor é traduzido, nunca vaza sem tipo de domínio", async () => {
    const provedor = new ProvedorDeArmazenamentoFake();
    provedor.criarPasta.mockRejectedValueOnce(new TypeError("falha inesperada de rede"));

    const servico = new ServicoDeArmazenamentoImpl(provedor, PASTA_RAIZ_ID);

    await expect(servico.resolverPastaDaColaboracao("parceira-1", "2026-07")).rejects.toBeInstanceOf(
      ErroTransitorioDeArmazenamento,
    );
  });
});
