import { describe, expect, it } from "vitest";
import {
  DocumentoEmitidoRepositorioEmMemoria,
  TemplateRepositorioEmMemoria,
  TemplateVersaoRepositorioEmMemoria,
} from "./documentos.repository.js";
import type { DocumentoEmitido, Template, TemplateVersao } from "./documentos.types.js";

function template(overrides: Partial<Template> = {}): Template {
  return {
    id: "template-1",
    nome: "Contrato de Colaboração Mensal",
    descricao: "Template padrão para contrato mensal com Parceira.",
    ativo: true,
    dataCriacao: "2026-07-01T00:00:00.000Z",
    dataAtualizacao: "2026-07-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("TemplateRepositorioEmMemoria.criar/buscarPorId/listarTodos", () => {
  it("adiciona o Template e o torna visível para as demais consultas", async () => {
    const repo = new TemplateRepositorioEmMemoria([]);
    const novo = template({ id: "novo" });

    const criado = await repo.criar(novo);

    expect(criado).toEqual(novo);
    expect(await repo.buscarPorId("novo")).toEqual(novo);
    expect(await repo.listarTodos()).toEqual([novo]);
  });

  it("retorna null para id inexistente", async () => {
    const repo = new TemplateRepositorioEmMemoria([]);
    expect(await repo.buscarPorId("nao-existe")).toBeNull();
  });
});

describe("TemplateRepositorioEmMemoria.atualizar", () => {
  it("carimba dataAtualizacao mesmo quando o chamador não a informa", async () => {
    const original = template({ id: "t1", dataAtualizacao: "2026-07-01T00:00:00.000Z" });
    const repo = new TemplateRepositorioEmMemoria([original]);

    const atualizado = await repo.atualizar({ ...original, nome: "Nome novo" });

    expect(atualizado.nome).toBe("Nome novo");
    expect(atualizado.dataAtualizacao).not.toBe("2026-07-01T00:00:00.000Z");
  });

  it("lança erro ao tentar atualizar Template inexistente", async () => {
    const repo = new TemplateRepositorioEmMemoria([]);
    await expect(repo.atualizar(template({ id: "nao-existe" }))).rejects.toThrow();
  });
});

describe("TemplateRepositorioEmMemoria.remover", () => {
  it("remove o Template existente", async () => {
    const repo = new TemplateRepositorioEmMemoria([template({ id: "t1" })]);
    await repo.remover("t1");
    expect(await repo.buscarPorId("t1")).toBeNull();
  });

  it("lança erro ao tentar remover Template inexistente", async () => {
    const repo = new TemplateRepositorioEmMemoria([]);
    await expect(repo.remover("nao-existe")).rejects.toThrow();
  });
});

function templateVersao(overrides: Partial<TemplateVersao> = {}): TemplateVersao {
  return {
    id: "versao-1",
    templateId: "template-1",
    numeroVersao: 1,
    conteudo: "Contrato de Colaboração Mensal entre {{parceira.nome}} e Criativo Dodô.",
    dataCriacao: "2026-07-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("TemplateVersaoRepositorioEmMemoria.criar/buscarPorId/listarPorTemplateId", () => {
  it("adiciona a TemplateVersao e a torna visível para as demais consultas", async () => {
    const repo = new TemplateVersaoRepositorioEmMemoria([]);
    const nova = templateVersao({ id: "nova" });

    const criada = await repo.criar(nova);

    expect(criada).toEqual(nova);
    expect(await repo.buscarPorId("nova")).toEqual(nova);
    expect(await repo.listarPorTemplateId("template-1")).toEqual([nova]);
  });

  it("retorna null para id inexistente", async () => {
    const repo = new TemplateVersaoRepositorioEmMemoria([]);
    expect(await repo.buscarPorId("nao-existe")).toBeNull();
  });

  it("lista apenas as versões do templateId pedido", async () => {
    const repo = new TemplateVersaoRepositorioEmMemoria([
      templateVersao({ id: "v1", templateId: "template-a" }),
      templateVersao({ id: "v2", templateId: "template-b" }),
    ]);

    expect(await repo.listarPorTemplateId("template-a")).toEqual([
      templateVersao({ id: "v1", templateId: "template-a" }),
    ]);
  });
});

describe("TemplateVersaoRepositorioEmMemoria — imutabilidade", () => {
  it("preserva a versão anterior intacta quando uma nova versão é criada para o mesmo template", async () => {
    const repo = new TemplateVersaoRepositorioEmMemoria([]);
    const v1 = await repo.criar(templateVersao({ id: "v1", numeroVersao: 1, conteudo: "Texto original" }));
    await repo.criar(templateVersao({ id: "v2", numeroVersao: 2, conteudo: "Texto revisado" }));

    expect(await repo.buscarPorId("v1")).toEqual(v1);
    expect((await repo.buscarPorId("v1"))?.conteudo).toBe("Texto original");
  });

  it("não expõe operação de atualização ou remoção — alterar conteúdo exige criar nova versão", () => {
    const repo = new TemplateVersaoRepositorioEmMemoria([]);
    expect((repo as unknown as Record<string, unknown>).atualizar).toBeUndefined();
    expect((repo as unknown as Record<string, unknown>).remover).toBeUndefined();
  });

  it("não é afetada por mutação do objeto original após a criação (cópia defensiva)", async () => {
    const repo = new TemplateVersaoRepositorioEmMemoria([]);
    const original = templateVersao({ id: "v1" });

    await repo.criar(original);
    original.conteudo = "Alterado depois de criar — não deve refletir no repositório";

    expect((await repo.buscarPorId("v1"))?.conteudo).not.toBe(original.conteudo);
  });
});

function documentoEmitido(overrides: Partial<DocumentoEmitido> = {}): DocumentoEmitido {
  return {
    id: "documento-1",
    tipo: "CONTRATO",
    templateVersaoId: "versao-1",
    parceiraId: "parceira-1",
    colaboracaoMensalId: null,
    geradoEm: "2026-07-01T00:00:00.000Z",
    geradoPor: "operador-1",
    status: "GERADO",
    hash: "hash-1",
    urlStorage: "https://storage.example/documentos/documento-1.pdf",
    storageFileId: "storage-file-1",
    ...overrides,
  };
}

describe("DocumentoEmitidoRepositorioEmMemoria.criar/buscarPorId/listarPorParceiraId", () => {
  it("adiciona o DocumentoEmitido e o torna visível para as demais consultas", async () => {
    const repo = new DocumentoEmitidoRepositorioEmMemoria([]);
    const novo = documentoEmitido({ id: "novo" });

    const criado = await repo.criar(novo);

    expect(criado).toEqual(novo);
    expect(await repo.buscarPorId("novo")).toEqual(novo);
    expect(await repo.listarPorParceiraId("parceira-1")).toEqual([novo]);
  });

  it("retorna null para id inexistente", async () => {
    const repo = new DocumentoEmitidoRepositorioEmMemoria([]);
    expect(await repo.buscarPorId("nao-existe")).toBeNull();
  });

  it("lista apenas os documentos da parceiraId pedida", async () => {
    const repo = new DocumentoEmitidoRepositorioEmMemoria([
      documentoEmitido({ id: "d1", parceiraId: "parceira-a", hash: "hash-a" }),
      documentoEmitido({ id: "d2", parceiraId: "parceira-b", hash: "hash-b" }),
    ]);

    expect(await repo.listarPorParceiraId("parceira-a")).toEqual([
      documentoEmitido({ id: "d1", parceiraId: "parceira-a", hash: "hash-a" }),
    ]);
  });
});

describe("DocumentoEmitidoRepositorioEmMemoria — hash único", () => {
  it("lança erro ao tentar criar um DocumentoEmitido com hash já registrado em outro", async () => {
    const repo = new DocumentoEmitidoRepositorioEmMemoria([documentoEmitido({ id: "d1", hash: "hash-repetido" })]);

    await expect(repo.criar(documentoEmitido({ id: "d2", hash: "hash-repetido" }))).rejects.toThrow();
  });
});

describe("DocumentoEmitidoRepositorioEmMemoria — imutabilidade", () => {
  it("preserva o documento anterior intacto quando um novo é criado", async () => {
    const repo = new DocumentoEmitidoRepositorioEmMemoria([]);
    const d1 = await repo.criar(documentoEmitido({ id: "d1", hash: "hash-1", status: "GERADO" }));
    await repo.criar(documentoEmitido({ id: "d2", hash: "hash-2" }));

    expect(await repo.buscarPorId("d1")).toEqual(d1);
  });

  it("não expõe operação de atualização ou remoção nesta etapa (workflow de emissão fora de escopo)", () => {
    const repo = new DocumentoEmitidoRepositorioEmMemoria([]);
    expect((repo as unknown as Record<string, unknown>).atualizar).toBeUndefined();
    expect((repo as unknown as Record<string, unknown>).remover).toBeUndefined();
  });

  it("não é afetada por mutação do objeto original após a criação (cópia defensiva)", async () => {
    const repo = new DocumentoEmitidoRepositorioEmMemoria([]);
    const original = documentoEmitido({ id: "d1" });

    await repo.criar(original);
    original.status = "ARQUIVADO";

    expect((await repo.buscarPorId("d1"))?.status).not.toBe(original.status);
  });
});
