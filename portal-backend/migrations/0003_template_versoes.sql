-- Fase 5 do Plano Mestre (motor §1): TemplateVersao — conteúdo publicado e imutável de um
-- Template (critério de aceite: "TemplateVersao publicada é imutável; qualquer alteração
-- cria nova versão"). Sem coluna `data_atualizacao` de propósito: não existe update.
--
-- `template_id` é texto sem FK. Decisão de consistência de padrão de schema, não limitação
-- técnica: este projeto já convive com referências sem FK apontando para tabelas que existem
-- (`parceira_id` em `entregas`/`briefings`/`obrigacoes_financeiras` nunca teve FK para
-- `parceiras`, mesmo com a tabela presente desde 0001_init.sql). `templates` ainda não tem
-- tabela Postgres nesta etapa, mas mesmo quando a migração 0004 criar essa tabela, esta coluna
-- permanece intencionalmente sem `REFERENCES templates (id)` — não é um FK adiado a ser
-- "corrigido" depois, é o padrão vigente do schema. Só migrações que formalizam um vínculo
-- novo (ex.: 0002_colaboracao_mensal.sql, ADR-016) adicionam FK explícito.
--
-- UNIQUE (template_id, numero_versao) garante no banco que a numeração de versão nunca colide
-- para o mesmo template, reforçando a imutabilidade a nível de dado.

CREATE TABLE template_versoes (
  id             text PRIMARY KEY,
  template_id    text NOT NULL,
  numero_versao  integer NOT NULL CHECK (numero_versao > 0),
  conteudo       text NOT NULL,
  data_criacao   timestamptz NOT NULL,
  UNIQUE (template_id, numero_versao)
);
CREATE INDEX template_versoes_template_id_idx ON template_versoes (template_id);
