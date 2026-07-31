-- Fase 5 do Plano Mestre (motor §1): tabela Postgres para `Template` (agregado mutável de
-- metadados; o conteúdo versionado e imutável já está em `template_versoes`, migração 0003).
--
-- Sem `ALTER TABLE template_versoes ADD FOREIGN KEY (template_id) REFERENCES templates (id)`
-- de propósito: a coluna `template_id` foi deliberadamente modelada sem FK por consistência
-- de padrão de schema (ver comentário completo em 0003_template_versoes.sql), não porque
-- `templates` não existia ainda — agora existe, e a decisão permanece a mesma.

CREATE TABLE templates (
  id                 text PRIMARY KEY,
  nome               text NOT NULL,
  descricao          text NOT NULL,
  ativo              boolean NOT NULL,
  data_criacao       timestamptz NOT NULL,
  data_atualizacao   timestamptz NOT NULL
);
