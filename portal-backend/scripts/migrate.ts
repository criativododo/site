import { readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../src/config/database.js";

/**
 * Runner de migração minimalista (Fase 2 do Plano Mestre, ADR-015): aplica, em ordem
 * alfabética, os arquivos `.sql` de `migrations/` ainda não registrados em
 * `schema_migrations`. Sem dependência de ferramenta externa — script pequeno o bastante
 * para não justificar uma (critério de simplicidade já aplicado no resto do projeto).
 */

const DIRETORIO_MIGRACOES = join(dirname(fileURLToPath(import.meta.url)), "..", "migrations");

async function garantirTabelaDeControle(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      nome_arquivo  text PRIMARY KEY,
      aplicada_em   timestamptz NOT NULL DEFAULT now()
    )
  `);
}

async function migracoesJaAplicadas(): Promise<Set<string>> {
  const resultado = await pool.query<{ nome_arquivo: string }>("SELECT nome_arquivo FROM schema_migrations");
  return new Set(resultado.rows.map((linha) => linha.nome_arquivo));
}

async function aplicarMigracoes(): Promise<void> {
  await garantirTabelaDeControle();
  const aplicadas = await migracoesJaAplicadas();

  const arquivos = (await readdir(DIRETORIO_MIGRACOES)).filter((arquivo) => arquivo.endsWith(".sql")).sort();

  for (const arquivo of arquivos) {
    if (aplicadas.has(arquivo)) {
      console.log(`[migrate] ${arquivo} — já aplicada, pulando.`);
      continue;
    }

    const sql = await readFile(join(DIRETORIO_MIGRACOES, arquivo), "utf8");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (nome_arquivo) VALUES ($1)", [arquivo]);
      await client.query("COMMIT");
      console.log(`[migrate] ${arquivo} — aplicada com sucesso.`);
    } catch (erro) {
      await client.query("ROLLBACK");
      throw new Error(`Falha ao aplicar migração ${arquivo}: ${(erro as Error).message}`);
    } finally {
      client.release();
    }
  }
}

aplicarMigracoes()
  .then(() => pool.end())
  .then(() => {
    console.log("[migrate] concluído.");
    process.exit(0);
  })
  .catch((erro) => {
    console.error("[migrate] erro:", erro);
    process.exit(1);
  });
