-- Fase 5 do Plano Mestre (motor §1.4): DocumentoEmitido — histórico imutável de documentos
-- gerados a partir de uma TemplateVersao. Sem `marca_id`/`campanha_id` do design original
-- (`OTIMIZAÇÕES DODÔ.mk` §1.4): `Marca` está fora do MVP (ADR-008) e `Campanha` não é um
-- agregado definido em nenhuma SPEC/ADR deste projeto (ADR-003 — declarar a lacuna, não
-- presumir o campo).
--
-- `template_versao_id`, `parceira_id`, `colaboracao_mensal_id` sem FK — mesmo padrão sem FK já
-- vigente no schema (ver 0003_template_versoes.sql).
--
-- `status` é CHECK exaustivo (motor §1.7): NAO_GERADO→GERADO→BAIXADO→ENVIADO→VISUALIZADO→
-- ASSINADO→FINALIZADO→ARQUIVADO. Esta migração só define os valores válidos da coluna; o
-- workflow que valida as transições entre eles fica para uma etapa futura.
--
-- `hash` é UNIQUE (SHA-256 do PDF, motor §1.4: "DocumentoEmitido.hash obrigatório e único") —
-- geração de PDF está fora do escopo desta etapa, a coluna só persiste o que for informado.

CREATE TABLE documentos_emitidos (
  id                      text PRIMARY KEY,
  tipo                    text NOT NULL CHECK (tipo IN ('CONTRATO', 'ADITIVO', 'DISTRATO', 'PROPOSTA', 'RECIBO', 'DECLARACAO')),
  template_versao_id      text NOT NULL,
  parceira_id             text NOT NULL,
  colaboracao_mensal_id   text,
  gerado_em               timestamptz NOT NULL,
  gerado_por              text NOT NULL,
  status                  text NOT NULL CHECK (status IN
                             ('NAO_GERADO', 'GERADO', 'BAIXADO', 'ENVIADO', 'VISUALIZADO', 'ASSINADO', 'FINALIZADO', 'ARQUIVADO')),
  hash                    text NOT NULL UNIQUE,
  url_storage             text NOT NULL,
  storage_file_id         text NOT NULL
);
CREATE INDEX documentos_emitidos_parceira_id_idx ON documentos_emitidos (parceira_id);
CREATE INDEX documentos_emitidos_template_versao_id_idx ON documentos_emitidos (template_versao_id);
