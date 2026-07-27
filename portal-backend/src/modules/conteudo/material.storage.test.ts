import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ArmazenamentoLocalEmDisco } from "./material.storage.js";

const arquivosCriados: string[] = [];

afterEach(async () => {
  await Promise.all(
    arquivosCriados.splice(0).map((nome) =>
      rm(path.resolve(process.cwd(), "uploads", nome), { force: true }),
    ),
  );
});

describe("ArmazenamentoLocalEmDisco", () => {
  it("grava o conteúdo do arquivo e retorna uma referência única preservando a extensão", async () => {
    const storage = new ArmazenamentoLocalEmDisco();
    const referencia = await storage.salvar("entrega-1", {
      buffer: Buffer.from("conteudo de teste"),
      nomeOriginal: "video.mp4",
    });
    arquivosCriados.push(referencia);

    expect(referencia).toMatch(/^entrega-1-.+\.mp4$/);

    const gravado = await readFile(path.resolve(process.cwd(), "uploads", referencia), "utf8");
    expect(gravado).toBe("conteudo de teste");
  });
});
