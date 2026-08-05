-- Sprint 2 (tela Comunicação): histórico de mensagens preparadas pelo Portal para abertura no
-- WhatsApp. O Portal NÃO envia mensagens e NÃO sincroniza com o WhatsApp (nem lê conversas, nem
-- integração bidirecional) — esta tabela só registra o que foi preparado por aqui, para efeito
-- de histórico administrativo.
--
-- `parceira_nome` é snapshot (mesmo padrão de `condicao_comercial` em `colaboracoes_mensais`):
-- o histórico deve continuar legível mesmo que o nome da Parceira mude depois.
--
-- `modelo_id` sem FK — modelos de mensagem são estáticos (definidos em código, não em tabela
-- própria nesta etapa; sem CRUD de modelos pedido no escopo desta tela), mesmo padrão sem FK já
-- vigente no schema para referências a agregados fora do banco (ver `documentos_emitidos`).
--
-- `categoria` inclui `PERSONALIZADA` (mensagem sem modelo, escrita livremente) além das 8
-- categorias de modelo.

CREATE TABLE mensagens_preparadas (
  id              text PRIMARY KEY,
  parceira_id     text NOT NULL,
  parceira_nome   text NOT NULL,
  categoria       text NOT NULL CHECK (categoria IN
                     ('BOAS_VINDAS', 'BRIEFING', 'LEMBRETE', 'APROVACAO', 'NOTA_FISCAL',
                      'PAGAMENTO', 'LOGISTICA', 'ENCERRAMENTO', 'PERSONALIZADA')),
  modelo_id       text,
  corpo_final     text NOT NULL,
  preparado_por   text NOT NULL,
  preparado_em    timestamptz NOT NULL
);
CREATE INDEX mensagens_preparadas_parceira_id_idx ON mensagens_preparadas (parceira_id);
CREATE INDEX mensagens_preparadas_preparado_em_idx ON mensagens_preparadas (preparado_em DESC);
