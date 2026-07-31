-- Fase 5 do Plano Mestre (motor §1): TemplateVersao — conteúdo publicado e imutável de um
-- Template (critério de aceite: "TemplateVersao publicada é imutável; qualquer alteração
-- cria nova versão"). Sem coluna `data_atualizacao` de propósito: não existe update.
--
-- `template_id` é texto sem FK: `templates` ainda não tem tabela Postgres (Template segue só
-- em memória, fora do escopo desta etapa) — mesma convenção já usada em `parceira_id` nas
-- migrações 0001/0002 (referência por id em texto, sem FK, quando a tabela referenciada não
-- existe ou o vínculo formal ainda não foi decidido).
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
