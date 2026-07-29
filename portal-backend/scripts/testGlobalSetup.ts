import { pool } from "../src/config/database.js";

/**
 * `globalSetup` do Vitest (Fase 2 do Plano Mestre, ADR-015): roda uma única vez antes de toda
 * a suíte, num contexto de módulo separado dos arquivos de teste. Garante que cada execução
 * de `npm test` comece com as tabelas vazias — a mesma garantia que os Maps em memória davam
 * "de graça" antes da migração para PostgreSQL real. `schema_migrations` nunca é truncada
 * (controla o que já foi aplicado, não é dado de domínio).
 */
const TABELAS = [
  "identidades",
  "convites_cadastro",
  "parceiras",
  "entregas",
  "briefings",
  "obrigacoes_financeiras",
  "perfis_parceira",
  "solicitacoes_exclusao",
];

export default async function setup(): Promise<() => Promise<void>> {
  await pool.query(`TRUNCATE ${TABELAS.join(", ")} RESTART IDENTITY CASCADE`);

  return async () => {
    await pool.end();
  };
}
