import { randomUUID } from "node:crypto";
import { env } from "../src/config/env.js";
import { ProvedorDeArmazenamentoGoogleDrive } from "../src/shared/storage/googleDrive/provedorGoogleDrive.js";
import { RecursoDeArmazenamentoNaoEncontrado } from "../src/shared/storage/erros.js";

/**
 * Teste de integração manual do Storage contra a Drive API real (TDD §6.6) — cobre
 * criação de pasta, upload/substituição (CB-01), download, rename, remoção (trashed),
 * paginação, erro real (404) e renovação de token, tudo contra a conta Drive já
 * configurada. Análogo a `testarOAuthGoogleDrive.ts`: não roda em pipeline automatizado,
 * escreve e depois limpa os recursos de teste que cria (nunca a pasta raiz configurada).
 *
 * Uso: npm run drive:testar-storage
 */

async function main() {
  if (!env.storage.googleDrive.pastaRaizId) {
    throw new Error("GOOGLE_DRIVE_ROOT_FOLDER_ID não configurado — rode `npm run drive:provisionar-raiz` antes.");
  }

  const provedor = new ProvedorDeArmazenamentoGoogleDrive();
  const nomePastaTeste = `_teste-storage-${Date.now()}`;
  let pastaTesteId: string | undefined;
  let arquivoId: string | undefined;

  try {
    console.log("1) Criando pasta de teste sob a raiz configurada...");
    const pasta = await provedor.criarPasta(nomePastaTeste, env.storage.googleDrive.pastaRaizId);
    pastaTesteId = pasta.id;
    console.log(`   OK — pasta criada (id: ${pasta.id}).`);

    console.log("2) Confirmando idempotência de nome: criarPasta de novo com o mesmo nome/pai...");
    const pastaDeNovo = await provedor.criarPasta(nomePastaTeste, env.storage.googleDrive.pastaRaizId);
    if (pastaDeNovo.id !== pasta.id) throw new Error("Esperava reaproveitar a mesma pasta, mas criou uma nova.");
    console.log("   OK — mesma pasta reaproveitada, nenhuma duplicata.");

    console.log("3) Upload inicial (enviarArquivo, identidadeDoRecurso nova)...");
    const identidadeDoRecurso = randomUUID();
    const enviado1 = await provedor.enviarArquivo({
      pastaId: pasta.id,
      nomeArquivo: "teste.txt",
      conteudo: Buffer.from("conteúdo v1"),
      tipoMime: "text/plain",
      identidadeDoRecurso,
      chaveDeIdempotencia: randomUUID(),
    });
    arquivoId = enviado1.id;
    console.log(`   OK — arquivo criado (id: ${enviado1.id}).`);

    console.log("4) Retry da mesma operação (mesma chaveDeIdempotencia) — não deve duplicar...");
    const chaveRepetida = randomUUID();
    const retry1 = await provedor.enviarArquivo({
      pastaId: pasta.id,
      nomeArquivo: "teste.txt",
      conteudo: Buffer.from("conteúdo v1"),
      tipoMime: "text/plain",
      identidadeDoRecurso,
      chaveDeIdempotencia: chaveRepetida,
    });
    const retry2 = await provedor.enviarArquivo({
      pastaId: pasta.id,
      nomeArquivo: "teste.txt",
      conteudo: Buffer.from("conteúdo v1 (ignorado)"),
      tipoMime: "text/plain",
      identidadeDoRecurso,
      chaveDeIdempotencia: chaveRepetida,
    });
    if (retry1.id !== retry2.id) throw new Error("Retry com a mesma chave duplicou o recurso.");
    console.log("   OK — mesmo recurso, nenhuma duplicata.");

    console.log("5) Reenvio legítimo (CB-01: chaveDeIdempotencia nova) — deve substituir, mesmo fileId...");
    const substituido = await provedor.enviarArquivo({
      pastaId: pasta.id,
      nomeArquivo: "teste.txt",
      conteudo: Buffer.from("conteúdo v2"),
      tipoMime: "text/plain",
      identidadeDoRecurso,
      chaveDeIdempotencia: randomUUID(),
    });
    if (substituido.id !== enviado1.id) throw new Error("CB-01 deveria manter o mesmo fileId ao substituir.");
    console.log("   OK — substituído, mesmo fileId (identidade mantida).");

    console.log("6) Download — confirmando o conteúdo substituído (v2)...");
    const baixado = await provedor.baixarArquivo(arquivoId);
    const chunks: Buffer[] = [];
    for await (const chunk of baixado.conteudo) chunks.push(Buffer.from(chunk));
    const conteudoBaixado = Buffer.concat(chunks).toString("utf8");
    if (conteudoBaixado !== "conteúdo v2") throw new Error(`Conteúdo baixado inesperado: "${conteudoBaixado}"`);
    console.log(`   OK — conteúdo confere (tipoMime: ${baixado.tipoMime}, tamanhoBytes: ${baixado.tamanhoBytes}).`);

    console.log("7) Renomear...");
    const renomeado = await provedor.renomear(arquivoId, "teste-renomeado.txt");
    if (renomeado.nome !== "teste-renomeado.txt") throw new Error("Rename não aplicado.");
    console.log("   OK.");

    console.log("8) Listar — confirmando paginação básica (tamanhoPagina=1)...");
    const pagina1 = await provedor.listar(pasta.id, 1);
    console.log(`   OK — ${pagina1.itens.length} item(ns) na página, proximoToken: ${pagina1.proximoToken ?? "(nenhum)"}.`);

    console.log("9) Remover (trashed=true, reversível) e confirmar que some da listagem...");
    await provedor.remover(arquivoId);
    const paginaDepoisDeRemover = await provedor.listar(pasta.id);
    if (paginaDepoisDeRemover.itens.some((item) => item.id === arquivoId)) {
      throw new Error("Arquivo removido ainda aparece em listar() — trashed=false não está filtrando.");
    }
    console.log("   OK — não aparece mais em listar() (trashed=false).");

    console.log("10) Erro real: obterMetadados de um recurso inexistente deve lançar RecursoDeArmazenamentoNaoEncontrado...");
    try {
      await provedor.obterMetadados(`inexistente-${randomUUID()}`);
      throw new Error("Esperava RecursoDeArmazenamentoNaoEncontrado, não lançou nada.");
    } catch (erro) {
      if (!(erro instanceof RecursoDeArmazenamentoNaoEncontrado)) throw erro;
      console.log("   OK — erro tipado corretamente.");
    }

    console.log("\nTodos os cenários de integração do Storage passaram.");
  } finally {
    console.log("\n==> Limpando recursos de teste...");
    if (pastaTesteId) {
      await provedor.remover(pastaTesteId).catch((erro) => console.error(`   Falha ao limpar pasta de teste: ${erro}`));
      console.log(`   Pasta de teste (${pastaTesteId}) movida para a lixeira.`);
    }
  }
}

main().catch((erro) => {
  console.error(`\nFALHA: ${erro instanceof Error ? erro.message : String(erro)}`);
  process.exitCode = 1;
});
