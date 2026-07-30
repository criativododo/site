-- Fase 3 do Plano Mestre (ADR-016): schema da Colaboração Mensal como agregado formal.
-- Etapa 1 — apenas infraestrutura de banco (tabela, FKs, índices, constraints). Sem
-- backfill de dado histórico e sem ativação de uso pelos módulos existentes: as 3 colunas
-- de FK nascem nullable e não são lidas/escritas por nenhum repository ainda — isso fica
-- para as próximas etapas da Fase 3.

CREATE TABLE colaboracoes_mensais (
  id                            text PRIMARY KEY,
  parceira_id                   text NOT NULL,
  mes_referencia                text NOT NULL,
  -- Snapshot imutável da Condição Comercial no momento da compilação (ADR-016 item 4).
  condicao_comercial            jsonb NOT NULL,
  -- Ciclo de vida desta fase não tem estado intermediário (ADR-016 item 6): só existe
  -- 'COMPILADA'. O CHECK já reflete isso — não é lacuna, é a modelagem completa da fase.
  status                        text NOT NULL CHECK (status IN ('COMPILADA')),
  criado_por                    text NOT NULL,
  criado_em                     timestamptz NOT NULL,
  quantidade_registros_gerados  integer NOT NULL,
  -- Invariante "uma competência por mês" (ADR-016 item 2), garantida também no banco.
  UNIQUE (parceira_id, mes_referencia)
);

ALTER TABLE entregas
  ADD COLUMN colaboracao_mensal_id text
    REFERENCES colaboracoes_mensais (id) ON DELETE RESTRICT;
CREATE INDEX entregas_colaboracao_mensal_idx ON entregas (colaboracao_mensal_id);

ALTER TABLE briefings
  ADD COLUMN colaboracao_mensal_id text
    REFERENCES colaboracoes_mensais (id) ON DELETE RESTRICT;
CREATE INDEX briefings_colaboracao_mensal_idx ON briefings (colaboracao_mensal_id);

ALTER TABLE obrigacoes_financeiras
  ADD COLUMN colaboracao_mensal_id text
    REFERENCES colaboracoes_mensais (id) ON DELETE RESTRICT;
CREATE INDEX obrigacoes_colaboracao_mensal_idx ON obrigacoes_financeiras (colaboracao_mensal_id);
