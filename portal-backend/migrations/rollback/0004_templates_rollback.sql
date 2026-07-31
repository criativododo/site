-- Rollback manual da migration 0004_templates.sql. NÃO é aplicado automaticamente pelo
-- runner (`scripts/migrate.ts`) — o runner só lê `.sql` diretamente em `migrations/`, não em
-- subpastas. Executar manualmente via psql apenas se for necessário reverter, e só antes de
-- qualquer dado real depender da tabela abaixo.

DROP TABLE IF EXISTS templates;

DELETE FROM schema_migrations WHERE nome_arquivo = '0004_templates.sql';
