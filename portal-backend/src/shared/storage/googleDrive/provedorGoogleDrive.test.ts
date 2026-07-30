import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../googleDrive/googleDriveClient.js", () => ({
  obterAccessTokenDrive: vi.fn().mockResolvedValue("fake-token"),
  invalidarCacheAccessTokenDrive: vi.fn(),
}));

const { ProvedorDeArmazenamentoGoogleDrive } = await import("./provedorGoogleDrive.js");

function arquivoDriveMock(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "id-1",
    name: "nome-1",
    mimeType: "application/octet-stream",
    createdTime: "2026-07-30T00:00:00.000Z",
    modifiedTime: "2026-07-30T00:00:00.000Z",
    ...overrides,
  };
}

function respostaJson(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), { status, headers: { "Content-Type": "application/json" } });
}

describe("ProvedorDeArmazenamentoGoogleDrive", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  describe("criarPasta", () => {
    it("cria quando não existe pasta com o mesmo nome sob o mesmo pai", async () => {
      fetchMock
        .mockResolvedValueOnce(respostaJson({ files: [] }))
        .mockResolvedValueOnce(
          respostaJson(arquivoDriveMock({ id: "pasta-nova", name: "2026-07", mimeType: "application/vnd.google-apps.folder" })),
        );

      const provedor = new ProvedorDeArmazenamentoGoogleDrive();
      const resultado = await provedor.criarPasta("2026-07", "pai-1");

      expect(resultado).toMatchObject({ id: "pasta-nova", nome: "2026-07", tipo: "pasta" });
      expect(fetchMock).toHaveBeenCalledTimes(2);
      const [urlBusca] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(urlBusca).toContain("trashed%3Dfalse");
      const [, initCriar] = fetchMock.mock.calls[1] as [string, RequestInit];
      expect(initCriar.method).toBe("POST");
    });

    it("não cria de novo quando a pasta já existe sob o mesmo pai (idempotência de nome)", async () => {
      fetchMock.mockResolvedValueOnce(
        respostaJson({ files: [arquivoDriveMock({ id: "pasta-existente", name: "2026-07", mimeType: "application/vnd.google-apps.folder" })] }),
      );

      const provedor = new ProvedorDeArmazenamentoGoogleDrive();
      const resultado = await provedor.criarPasta("2026-07", "pai-1");

      expect(resultado.id).toBe("pasta-existente");
      expect(fetchMock).toHaveBeenCalledTimes(1); // só a busca, nenhum POST de criação
    });

    it("retentativa após timeout na criação reconsulta antes de criar de novo — sem pasta duplicada", async () => {
      fetchMock
        .mockResolvedValueOnce(respostaJson({ files: [] })) // 1ª tentativa: busca — não existe
        .mockRejectedValueOnce(new TypeError("fetch failed")) // 1ª tentativa: POST cai por timeout/rede
        .mockResolvedValueOnce(
          // 2ª tentativa (retry de comRetentativa): busca de novo — já existe (criada pela 1ª,
          // cuja resposta se perdeu) — não deve criar uma segunda
          respostaJson({ files: [arquivoDriveMock({ id: "pasta-unica", name: "2026-07", mimeType: "application/vnd.google-apps.folder" })] }),
        );

      const provedor = new ProvedorDeArmazenamentoGoogleDrive();
      const promessa = provedor.criarPasta("2026-07", "pai-1");
      await vi.runAllTimersAsync();
      const resultado = await promessa;

      expect(resultado.id).toBe("pasta-unica");
      expect(fetchMock).toHaveBeenCalledTimes(3); // busca, POST perdido, busca de novo — nunca um 2º POST
    });

    it("pastaPaiId=null não filtra por pai — cria direto sob a raiz visível ao OAuth Client", async () => {
      fetchMock.mockResolvedValueOnce(respostaJson(arquivoDriveMock({ id: "pasta-raiz", mimeType: "application/vnd.google-apps.folder" })));

      const provedor = new ProvedorDeArmazenamentoGoogleDrive();
      await provedor.criarPasta("raiz", null);

      expect(fetchMock).toHaveBeenCalledTimes(1); // sem busca prévia — não há pai para escopar a busca
      const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(JSON.parse(init.body as string)).not.toHaveProperty("parents");
    });
  });

  describe("enviarArquivo", () => {
    const parametrosBase = {
      pastaId: "pasta-1",
      nomeArquivo: "reel-entrega-1.mp4",
      conteudo: Buffer.from("conteudo"),
      tipoMime: "video/mp4",
      identidadeDoRecurso: "entrega-1",
      chaveDeIdempotencia: "chave-1",
    };

    it("identidadeDoRecurso nova → cria, grava identidadeDoRecurso e chaveDeIdempotencia", async () => {
      fetchMock
        .mockResolvedValueOnce(respostaJson({ files: [] }))
        .mockResolvedValueOnce(respostaJson(arquivoDriveMock({ id: "arquivo-1", name: parametrosBase.nomeArquivo })));

      const provedor = new ProvedorDeArmazenamentoGoogleDrive();
      const resultado = await provedor.enviarArquivo(parametrosBase);

      expect(resultado.id).toBe("arquivo-1");
      const [urlBusca] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(urlBusca).toContain("appProperties");
      expect(urlBusca).toContain("trashed%3Dfalse");
      const [urlCriar, initCriar] = fetchMock.mock.calls[1] as [string, RequestInit];
      expect(urlCriar).toContain("uploadType=multipart");
      expect(initCriar.method).toBe("POST");
      const corpoMultipart = initCriar.body as Buffer;
      expect(corpoMultipart.toString("utf8")).toContain('"identidadeDoRecurso":"entrega-1"');
      expect(corpoMultipart.toString("utf8")).toContain('"chaveDeIdempotencia":"chave-1"');
    });

    it("mesma chaveDeIdempotencia para identidadeDoRecurso já existente → retry, sem nova escrita (CT idempotência de operação)", async () => {
      fetchMock.mockResolvedValueOnce(
        respostaJson({
          files: [
            arquivoDriveMock({
              id: "arquivo-existente",
              name: parametrosBase.nomeArquivo,
              appProperties: { identidadeDoRecurso: "entrega-1", chaveDeIdempotencia: "chave-1" },
            }),
          ],
        }),
      );

      const provedor = new ProvedorDeArmazenamentoGoogleDrive();
      const resultado = await provedor.enviarArquivo(parametrosBase);

      expect(resultado.id).toBe("arquivo-existente");
      expect(fetchMock).toHaveBeenCalledTimes(1); // só a busca, nenhuma escrita
    });

    it("chaveDeIdempotencia diferente para identidadeDoRecurso já existente → substitui (CB-01), mantém o mesmo fileId", async () => {
      fetchMock
        .mockResolvedValueOnce(
          respostaJson({
            files: [
              arquivoDriveMock({
                id: "arquivo-existente",
                name: parametrosBase.nomeArquivo,
                appProperties: { identidadeDoRecurso: "entrega-1", chaveDeIdempotencia: "chave-antiga" },
              }),
            ],
          }),
        )
        .mockResolvedValueOnce(respostaJson(arquivoDriveMock({ id: "arquivo-existente", name: parametrosBase.nomeArquivo })));

      const provedor = new ProvedorDeArmazenamentoGoogleDrive();
      const resultado = await provedor.enviarArquivo({ ...parametrosBase, chaveDeIdempotencia: "chave-nova" });

      expect(resultado.id).toBe("arquivo-existente"); // mesmo fileId — "mantém identidade"
      const [urlSubstituir, initSubstituir] = fetchMock.mock.calls[1] as [string, RequestInit];
      expect(urlSubstituir).toContain("/files/arquivo-existente");
      expect(initSubstituir.method).toBe("PATCH");
      const corpoMultipart = initSubstituir.body as Buffer;
      expect(corpoMultipart.toString("utf8")).toContain('"chaveDeIdempotencia":"chave-nova"');
      expect(corpoMultipart.toString("utf8")).not.toContain("identidadeDoRecurso"); // PATCH não reenvia a identidade — merge do Drive preserva
    });

    it("retentativa após timeout na criação reconsulta por identidade antes de criar de novo — sem arquivo duplicado", async () => {
      fetchMock
        .mockResolvedValueOnce(respostaJson({ files: [] })) // 1ª tentativa: busca — não existe
        .mockRejectedValueOnce(new TypeError("fetch failed")) // 1ª tentativa: criação cai por timeout/rede
        .mockResolvedValueOnce(
          respostaJson({
            files: [
              arquivoDriveMock({
                id: "arquivo-unico",
                appProperties: { identidadeDoRecurso: "entrega-1", chaveDeIdempotencia: "chave-1" },
              }),
            ],
          }),
        ); // 2ª tentativa: busca de novo — já existe com a MESMA chave desta chamada → retorna, sem 2º POST

      const provedor = new ProvedorDeArmazenamentoGoogleDrive();
      const promessa = provedor.enviarArquivo(parametrosBase);
      await vi.runAllTimersAsync();
      const resultado = await promessa;

      expect(resultado.id).toBe("arquivo-unico");
      expect(fetchMock).toHaveBeenCalledTimes(3); // busca, POST perdido, busca de novo — nunca um 2º POST
    });
  });

  it("baixarArquivo: retorna stream, tipoMime e tamanhoBytes dos headers", async () => {
    const conteudo = new Response(Buffer.from("dados"), {
      status: 200,
      headers: { "Content-Type": "video/mp4", "Content-Length": "5" },
    });
    fetchMock.mockResolvedValueOnce(conteudo);

    const provedor = new ProvedorDeArmazenamentoGoogleDrive();
    const resultado = await provedor.baixarArquivo("arquivo-1");

    expect(resultado.tipoMime).toBe("video/mp4");
    expect(resultado.tamanhoBytes).toBe(5);
  });

  it("baixarArquivo: 404 lança RecursoDeArmazenamentoNaoEncontrado", async () => {
    fetchMock.mockResolvedValueOnce(respostaJson({}, 404));

    const provedor = new ProvedorDeArmazenamentoGoogleDrive();
    await expect(provedor.baixarArquivo("inexistente")).rejects.toMatchObject({ name: "RecursoDeArmazenamentoNaoEncontrado" });
  });

  it("renomear: PATCH metadata-only com o novo nome", async () => {
    fetchMock.mockResolvedValueOnce(respostaJson(arquivoDriveMock({ id: "arquivo-1", name: "novo-nome.mp4" })));

    const provedor = new ProvedorDeArmazenamentoGoogleDrive();
    const resultado = await provedor.renomear("arquivo-1", "novo-nome.mp4");

    expect(resultado.nome).toBe("novo-nome.mp4");
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body as string)).toEqual({ name: "novo-nome.mp4" });
  });

  it("remover: PATCH trashed=true, reversível (não DELETE definitivo)", async () => {
    fetchMock.mockResolvedValueOnce(respostaJson({}));

    const provedor = new ProvedorDeArmazenamentoGoogleDrive();
    await provedor.remover("arquivo-1");

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body as string)).toEqual({ trashed: true });
  });

  it("listar: sempre inclui trashed=false na query", async () => {
    fetchMock.mockResolvedValueOnce(respostaJson({ files: [] }));

    const provedor = new ProvedorDeArmazenamentoGoogleDrive();
    await provedor.listar("pasta-1");

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toContain("trashed%3Dfalse");
  });

  it("listar: propaga proximoToken corretamente entre páginas", async () => {
    fetchMock.mockResolvedValueOnce(respostaJson({ files: [arquivoDriveMock()], nextPageToken: "token-pagina-2" }));

    const provedor = new ProvedorDeArmazenamentoGoogleDrive();
    const pagina = await provedor.listar("pasta-1", 10);

    expect(pagina.proximoToken).toBe("token-pagina-2");
    expect(pagina.itens).toHaveLength(1);
    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toContain("pageSize=10");
  });

  it("obterMetadados: retorna o recurso mapeado", async () => {
    fetchMock.mockResolvedValueOnce(respostaJson(arquivoDriveMock({ id: "arquivo-1", size: "1024" })));

    const provedor = new ProvedorDeArmazenamentoGoogleDrive();
    const resultado = await provedor.obterMetadados("arquivo-1");

    expect(resultado).toMatchObject({ id: "arquivo-1", tamanhoBytes: 1024, tipo: "arquivo" });
  });
});
