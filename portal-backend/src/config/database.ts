import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

/**
 * Fase 2 do Plano Mestre (ADR-015): pool único de conexão PostgreSQL, compartilhado por
 * todos os repositórios. Nenhum módulo de domínio importa `pg` diretamente — só os
 * `*.repository.postgres.ts`, mesma disciplina de isolamento já usada para `shared/cep`.
 */
export const pool = new Pool({ connectionString: env.databaseUrl });
