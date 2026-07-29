import { pool } from "../src/config/database.js";
import { seedInicialBriefings } from "../src/modules/briefing/briefing.repository.js";
import { seedInicialEntregas } from "../src/modules/conteudo/entrega.repository.js";
import { seedInicialObrigacoes } from "../src/modules/financeiro/obrigacao.repository.js";
import { seedInicialPerfis } from "../src/modules/perfil/perfil.repository.js";

/**
 * Seed idempotente de desenvolvimento/QA (Fase 2 do Plano Mestre, ADR-015) — equivalente ao
 * que cada `*RepositorioEmMemoria` fazia sozinho no construtor (se `PARCEIRA_SEED_ID`
 * estiver configurado). `ON CONFLICT (id) DO NOTHING` torna seguro rodar este script quantas
 * vezes for preciso (ex.: a cada `npm run dev`) sem duplicar nem sobrescrever dado já
 * existente. Não roda em produção — mesma trava de `env.parceiraSeed` (`isProduction`
 * força os campos a vazio).
 */
async function seed(): Promise<void> {
  const entregas = seedInicialEntregas();
  const briefings = seedInicialBriefings();
  const obrigacoes = seedInicialObrigacoes();
  const perfis = seedInicialPerfis();

  if (entregas.length === 0) {
    console.log("[seed] PARCEIRA_SEED_ID não configurado — nada a semear.");
    return;
  }

  for (const entrega of entregas) {
    await pool.query(
      `INSERT INTO entregas
         (id, parceira_id, mes_referencia, formato, estado, data_entrega, material_enviado, data_criacao, data_atualizacao, data_arquivamento)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO NOTHING`,
      [
        entrega.id,
        entrega.parceiraId,
        entrega.mesReferencia,
        entrega.formato,
        entrega.estado,
        entrega.dataEntrega,
        entrega.materialEnviado,
        entrega.dataCriacao,
        entrega.dataAtualizacao,
        entrega.dataArquivamento,
      ],
    );
  }

  for (const bloco of briefings) {
    await pool.query(
      `INSERT INTO briefings
         (id, parceira_id, mes_referencia, formato, look, data_entrega, data_postagem, orientacao, data_aprovacao_interna, data_criacao, data_atualizacao)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO NOTHING`,
      [
        bloco.id,
        bloco.parceiraId,
        bloco.mesReferencia,
        bloco.formato,
        bloco.look,
        bloco.dataEntrega,
        bloco.dataPostagem,
        bloco.orientacao,
        bloco.dataAprovacaoInterna,
        bloco.dataCriacao,
        bloco.dataAtualizacao,
      ],
    );
  }

  for (const obrigacao of obrigacoes) {
    await pool.query(
      `INSERT INTO obrigacoes_financeiras
         (id, parceira_id, mes_referencia, valor, estado, tipo, data_criacao, data_atualizacao, data_arquivamento)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO NOTHING`,
      [
        obrigacao.id,
        obrigacao.parceiraId,
        obrigacao.mesReferencia,
        obrigacao.valor,
        obrigacao.estado,
        obrigacao.tipo,
        obrigacao.dataCriacao,
        obrigacao.dataAtualizacao,
        obrigacao.dataArquivamento,
      ],
    );
  }

  for (const perfil of perfis) {
    await pool.query(
      `INSERT INTO perfis_parceira (parceira_id, pix, email, endereco)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (parceira_id) DO NOTHING`,
      [perfil.parceiraId, perfil.pix, perfil.email, perfil.endereco],
    );
  }

  console.log(
    `[seed] concluído: ${entregas.length} entregas, ${briefings.length} briefings, ${obrigacoes.length} obrigações, ${perfis.length} perfis (idempotente).`,
  );
}

seed()
  .then(() => pool.end())
  .then(() => process.exit(0))
  .catch((erro) => {
    console.error("[seed] erro:", erro);
    process.exit(1);
  });
