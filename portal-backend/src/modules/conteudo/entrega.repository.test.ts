import { describe, expect, it } from "vitest";
import { EntregaRepositorioEmMemoria } from "./entrega.repository.js";
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

describe("EntregaRepositorioEmMemoria (RN-01, isolamento)", () => {
  it("só retorna Entregas da Parceira e competência pedidas", async () => {
    const repo = new EntregaRepositorioEmMemoria([
      entrega({ id: "minha", parceiraId: "parceira-1", mesReferencia: "2026-07" }),
      entrega({ id: "outra-parceira", parceiraId: "parceira-2", mesReferencia: "2026-07" }),
      entrega({ id: "outro-mes", parceiraId: "parceira-1", mesReferencia: "2026-06" }),
    ]);

    const resultado = await repo.listarPorParceiraECompetencia("parceira-1", "2026-07");

    expect(resultado.map((item) => item.id)).toEqual(["minha"]);
  });

  it("retorna lista vazia quando a Parceira não tem Entregas na competência (CB-02)", async () => {
    const repo = new EntregaRepositorioEmMemoria([]);
    const resultado = await repo.listarPorParceiraECompetencia("parceira-1", "2026-07");
    expect(resultado).toEqual([]);
  });
});

describe("EntregaRepositorioEmMemoria.buscarPorId (UC-027.02)", () => {
  it("encontra a Entrega pelo id, independente da Parceira", async () => {
    const repo = new EntregaRepositorioEmMemoria([entrega({ id: "e1", parceiraId: "parceira-1" })]);
    const encontrada = await repo.buscarPorId("e1");
    expect(encontrada?.parceiraId).toBe("parceira-1");
  });

  it("retorna null para id inexistente", async () => {
    const repo = new EntregaRepositorioEmMemoria([]);
    expect(await repo.buscarPorId("nao-existe")).toBeNull();
  });
});

describe("EntregaRepositorioEmMemoria.listarPorParceira (UC-030.03)", () => {
  it("lista Entregas da Parceira em todas as competências, ignorando outras Parceiras", async () => {
    const repo = new EntregaRepositorioEmMemoria([
      entrega({ id: "julho", parceiraId: "parceira-1", mesReferencia: "2026-07" }),
      entrega({ id: "junho", parceiraId: "parceira-1", mesReferencia: "2026-06" }),
      entrega({ id: "de-outra", parceiraId: "parceira-2", mesReferencia: "2026-07" }),
    ]);

    const resultado = await repo.listarPorParceira("parceira-1");
    expect(new Set(resultado.map((item) => item.id))).toEqual(new Set(["julho", "junho"]));
  });
});

describe("EntregaRepositorioEmMemoria.criar (Backoffice)", () => {
  it("adiciona a Entrega e a torna visível para as demais consultas", async () => {
    const repo = new EntregaRepositorioEmMemoria([]);
    const nova = entrega({ id: "nova" });

    const criada = await repo.criar(nova);

    expect(criada).toEqual(nova);
    expect(await repo.buscarPorId("nova")).toEqual(nova);
    expect(await repo.listarTodas()).toEqual([nova]);
  });
});

describe("EntregaRepositorioEmMemoria.atualizar", () => {
  it("carimba dataAtualizacao mesmo quando o chamador não a informa", async () => {
    const original = entrega({ id: "e1", dataAtualizacao: "2026-07-01T00:00:00.000Z" });
    const repo = new EntregaRepositorioEmMemoria([original]);

    const atualizada = await repo.atualizar({ ...original, estado: "EM_REVISAO" });

    expect(atualizada.estado).toBe("EM_REVISAO");
    expect(atualizada.dataAtualizacao).not.toBe("2026-07-01T00:00:00.000Z");
  });

  it("lança erro ao tentar atualizar Entrega inexistente", async () => {
    const repo = new EntregaRepositorioEmMemoria([]);
    await expect(repo.atualizar(entrega({ id: "nao-existe" }))).rejects.toThrow();
  });
});
