import { randomUUID } from "node:crypto";
import { pool } from "../src/config/database.js";

/**
 * Migração de dados retroativa da Fase 3 do Plano Mestre (ADR-016, item 5) — distinta da
 * migration de schema (`migrations/0002_colaboracao_mensal.sql`, Etapa 1): este script só
 * popula/relaciona dado já existente, não altera schema. Roda por fora do runner de
 * `scripts/migrate.ts` (mesma separação já usada entre `migrate.ts`/`seed.ts` desde o
 * ADR-015) e por fora de qualquer Repository/Service — não é lido por nenhuma camada de
 * domínio ainda (Etapa 2 é só backfill; ativação fica para as próximas etapas da Fase 3).
 *
 * Idempotente: `ON CONFLICT (parceira_id, mes_referencia) DO NOTHING` na criação da
 * Colaboração Mensal, e `WHERE colaboracao_mensal_id IS NULL` em cada vínculo — reexecutar
 * não duplica `ColaboracaoMensal` nem revincula registro já vinculado.
 *
 * Snapshot de Condição Comercial (ADR-016 item 5): para dado histórico, que nunca teve um
 * evento de compilação real, o snapshot é a Condição Comercial da Parceira no momento em
 * que este script roda — melhor aproximação disponível, não uma regra de negócio nova.
 *
 * `criadoPor`: dado histórico não tem um Administrador executor real — marcado com um
 * identificador operacional próprio da migração (`CRIADO_POR_MIGRACAO`), nunca confundido
 * com uma compilação manual real (que terá a identidade do Administrador autenticado).
 */

const CRIADO_POR_MIGRACAO = "MIGRACAO_RETROATIVA_FASE3_ADR-016";

interface ComboHistorico {
  parceiraId: string;
  mesReferencia: string;
  condicaoComercial: unknown | null; // null => Parceira não encontrada (inconsistência)
}

interface ContagemPorCombo {
  entregas: number;
  briefings: number;
  obrigacoes: number;
}

interface Inconsistencia {
  parceiraId: string;
  mesReferencia: string;
  motivo: string;
  registrosAfetados: number;
}

interface RelatorioMigracao {
  totalParceiras: number;
  totalCompetencias: number;
  colaboracoesMensaisCriadas: number;
  colaboracoesMensaisJaExistentes: number;
  entregasVinculadas: number;
  briefingsVinculados: number;
  obrigacoesVinculadas: number;
  registrosIgnorados: number;
  inconsistencias: Inconsistencia[];
  entregasOrfasAoFinal: number;
  briefingsOrfaosAoFinal: number;
  obrigacoesOrfasAoFinal: number;
  duracaoMs: number;
}

async function buscarCombosHistoricos(client: import("pg").PoolClient): Promise<ComboHistorico[]> {
  const resultado = await client.query<{
    parceira_id: string;
    mes_referencia: string;
    condicao_comercial: unknown | null;
  }>(`
    WITH combos AS (
      SELECT DISTINCT parceira_id, mes_referencia FROM entregas
      UNION
      SELECT DISTINCT parceira_id, mes_referencia FROM briefings
      UNION
      SELECT DISTINCT parceira_id, mes_referencia FROM obrigacoes_financeiras
    )
    SELECT c.parceira_id, c.mes_referencia, p.condicao_comercial
    FROM combos c
    LEFT JOIN parceiras p ON p.id = c.parceira_id
    ORDER BY c.parceira_id, c.mes_referencia
  `);

  return resultado.rows.map((linha) => ({
    parceiraId: linha.parceira_id,
    mesReferencia: linha.mes_referencia,
    condicaoComercial: linha.condicao_comercial,
  }));
}

async function contarRegistrosDoCombo(
  client: import("pg").PoolClient,
  parceiraId: string,
  mesReferencia: string,
): Promise<ContagemPorCombo> {
  // Consultas sequenciais: uma única conexão `pg` (`client`, dentro da transação) não
  // suporta queries concorrentes — `Promise.all` aqui seria um bug, não uma otimização.
  const entregas = await client.query(
    "SELECT COUNT(*)::int AS total FROM entregas WHERE parceira_id = $1 AND mes_referencia = $2",
    [parceiraId, mesReferencia],
  );
  const briefings = await client.query(
    "SELECT COUNT(*)::int AS total FROM briefings WHERE parceira_id = $1 AND mes_referencia = $2",
    [parceiraId, mesReferencia],
  );
  const obrigacoes = await client.query(
    "SELECT COUNT(*)::int AS total FROM obrigacoes_financeiras WHERE parceira_id = $1 AND mes_referencia = $2",
    [parceiraId, mesReferencia],
  );

  return {
    entregas: entregas.rows[0].total,
    briefings: briefings.rows[0].total,
    obrigacoes: obrigacoes.rows[0].total,
  };
}

async function executarBackfill(): Promise<RelatorioMigracao> {
  const inicio = Date.now();
  const client = await pool.connect();

  const relatorio: RelatorioMigracao = {
    totalParceiras: 0,
    totalCompetencias: 0,
    colaboracoesMensaisCriadas: 0,
    colaboracoesMensaisJaExistentes: 0,
    entregasVinculadas: 0,
    briefingsVinculados: 0,
    obrigacoesVinculadas: 0,
    registrosIgnorados: 0,
    inconsistencias: [],
    entregasOrfasAoFinal: 0,
    briefingsOrfaosAoFinal: 0,
    obrigacoesOrfasAoFinal: 0,
    duracaoMs: 0,
  };

  try {
    await client.query("BEGIN");

    const combos = await buscarCombosHistoricos(client);
    relatorio.totalParceiras = new Set(combos.map((combo) => combo.parceiraId)).size;
    relatorio.totalCompetencias = new Set(combos.map((combo) => combo.mesReferencia)).size;

    for (const combo of combos) {
      const contagem = await contarRegistrosDoCombo(client, combo.parceiraId, combo.mesReferencia);

      if (combo.condicaoComercial === null) {
        // Parceira referenciada pelo dado histórico não existe (mais) em `parceiras` —
        // inconsistência real de dado legado (ver ADR-016 item 5), não interrompe a
        // migração dos demais combos. Registros deste combo permanecem sem vínculo.
        relatorio.inconsistencias.push({
          parceiraId: combo.parceiraId,
          mesReferencia: combo.mesReferencia,
          motivo: "Parceira não encontrada em `parceiras` — snapshot de Condição Comercial indisponível.",
          registrosAfetados: contagem.entregas + contagem.briefings + contagem.obrigacoes,
        });
        relatorio.registrosIgnorados += contagem.entregas + contagem.briefings + contagem.obrigacoes;
        continue;
      }

      const idNovo = randomUUID();
      const quantidadeRegistrosGerados = contagem.entregas + contagem.briefings + contagem.obrigacoes;

      const insercao = await client.query(
        `INSERT INTO colaboracoes_mensais
           (id, parceira_id, mes_referencia, condicao_comercial, status, criado_por, criado_em, quantidade_registros_gerados)
         VALUES ($1, $2, $3, $4, 'COMPILADA', $5, now(), $6)
         ON CONFLICT (parceira_id, mes_referencia) DO NOTHING`,
        [idNovo, combo.parceiraId, combo.mesReferencia, combo.condicaoComercial, CRIADO_POR_MIGRACAO, quantidadeRegistrosGerados],
      );

      if ((insercao.rowCount ?? 0) > 0) {
        relatorio.colaboracoesMensaisCriadas += 1;
      } else {
        relatorio.colaboracoesMensaisJaExistentes += 1;
      }

      const idExistente = await client.query<{ id: string }>(
        "SELECT id FROM colaboracoes_mensais WHERE parceira_id = $1 AND mes_referencia = $2",
        [combo.parceiraId, combo.mesReferencia],
      );
      const colaboracaoMensalId = idExistente.rows[0].id;

      const entregasAtualizadas = await client.query(
        `UPDATE entregas SET colaboracao_mensal_id = $1
         WHERE parceira_id = $2 AND mes_referencia = $3 AND colaboracao_mensal_id IS NULL`,
        [colaboracaoMensalId, combo.parceiraId, combo.mesReferencia],
      );
      relatorio.entregasVinculadas += entregasAtualizadas.rowCount ?? 0;

      const briefingsAtualizados = await client.query(
        `UPDATE briefings SET colaboracao_mensal_id = $1
         WHERE parceira_id = $2 AND mes_referencia = $3 AND colaboracao_mensal_id IS NULL`,
        [colaboracaoMensalId, combo.parceiraId, combo.mesReferencia],
      );
      relatorio.briefingsVinculados += briefingsAtualizados.rowCount ?? 0;

      const obrigacoesAtualizadas = await client.query(
        `UPDATE obrigacoes_financeiras SET colaboracao_mensal_id = $1
         WHERE parceira_id = $2 AND mes_referencia = $3 AND colaboracao_mensal_id IS NULL`,
        [colaboracaoMensalId, combo.parceiraId, combo.mesReferencia],
      );
      relatorio.obrigacoesVinculadas += obrigacoesAtualizadas.rowCount ?? 0;
    }

    await client.query("COMMIT");
  } catch (erro) {
    await client.query("ROLLBACK");
    throw new Error(`Falha no backfill de Colaboração Mensal — rollback completo aplicado: ${(erro as Error).message}`);
  } finally {
    client.release();
  }

  // Validação automática pós-migração (requisito 6) — leitura, fora da transação de escrita.
  const [entregasOrfas, briefingsOrfaos, obrigacoesOrfas] = await Promise.all([
    pool.query("SELECT COUNT(*)::int AS total FROM entregas WHERE colaboracao_mensal_id IS NULL"),
    pool.query("SELECT COUNT(*)::int AS total FROM briefings WHERE colaboracao_mensal_id IS NULL"),
    pool.query("SELECT COUNT(*)::int AS total FROM obrigacoes_financeiras WHERE colaboracao_mensal_id IS NULL"),
  ]);
  relatorio.entregasOrfasAoFinal = entregasOrfas.rows[0].total;
  relatorio.briefingsOrfaosAoFinal = briefingsOrfaos.rows[0].total;
  relatorio.obrigacoesOrfasAoFinal = obrigacoesOrfas.rows[0].total;

  relatorio.duracaoMs = Date.now() - inicio;
  return relatorio;
}

function imprimirRelatorio(relatorio: RelatorioMigracao): void {
  console.log("[backfill-colaboracao-mensal] Relatório de migração retroativa (ADR-016):");
  console.log(`  Total de Parceiras (distintas nos combos históricos): ${relatorio.totalParceiras}`);
  console.log(`  Total de Competências (mesReferencia distintos): ${relatorio.totalCompetencias}`);
  console.log(`  Colaborações Mensais criadas nesta execução: ${relatorio.colaboracoesMensaisCriadas}`);
  console.log(`  Colaborações Mensais já existentes (execução anterior): ${relatorio.colaboracoesMensaisJaExistentes}`);
  console.log(`  Entregas vinculadas nesta execução: ${relatorio.entregasVinculadas}`);
  console.log(`  Briefings vinculados nesta execução: ${relatorio.briefingsVinculados}`);
  console.log(`  Obrigações Financeiras vinculadas nesta execução: ${relatorio.obrigacoesVinculadas}`);
  console.log(`  Registros ignorados (Parceira não encontrada): ${relatorio.registrosIgnorados}`);
  console.log(`  Inconsistências encontradas: ${relatorio.inconsistencias.length}`);
  for (const inconsistencia of relatorio.inconsistencias) {
    console.log(
      `    - parceiraId=${inconsistencia.parceiraId} mesReferencia=${inconsistencia.mesReferencia}: ${inconsistencia.motivo} (${inconsistencia.registrosAfetados} registros afetados)`,
    );
  }
  console.log(
    `  Registros órfãos ao final (sem colaboracao_mensal_id): entregas=${relatorio.entregasOrfasAoFinal}, briefings=${relatorio.briefingsOrfaosAoFinal}, obrigacoes=${relatorio.obrigacoesOrfasAoFinal}`,
  );
  console.log(`  Tempo de execução: ${relatorio.duracaoMs}ms`);
}

executarBackfill()
  .then(async (relatorio) => {
    imprimirRelatorio(relatorio);
    await pool.end();
    process.exit(0);
  })
  .catch(async (erro) => {
    console.error("[backfill-colaboracao-mensal] erro:", erro);
    await pool.end();
    process.exit(1);
  });
