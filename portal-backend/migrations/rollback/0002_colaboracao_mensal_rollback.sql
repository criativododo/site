-- Rollback manual da migration 0002_colaboracao_mensal.sql (ADR-016, estratégia de
-- rollback). NÃO é aplicado automaticamente pelo runner (`scripts/migrate.ts`) — o runner
-- só lê `.sql` diretamente em `migrations/`, não em subpastas. Executar manualmente via
-- psql apenas se for necessário reverter a Etapa 1, e só antes de qualquer dado real
-- depender das colunas/tabela abaixo.

ALTER TABLE obrigacoes_financeiras DROP COLUMN IF EXISTS colaboracao_mensal_id;
ALTER TABLE briefings DROP COLUMN IF EXISTS colaboracao_mensal_id;
ALTER TABLE entregas DROP COLUMN IF EXISTS colaboracao_mensal_id;

DROP TABLE IF EXISTS colaboracoes_mensais;

DELETE FROM schema_migrations WHERE nome_arquivo = '0002_colaboracao_mensal.sql';
