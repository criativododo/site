-- Fase 2 do Plano Mestre (ADR-015): schema inicial, espelhando fielmente as entidades já
-- modeladas em cada `*.types.ts` — nenhum campo novo, nenhuma regra de negócio nova.
-- Colunas em snake_case (convenção idiomática do Postgres); os repositórios fazem o
-- mapeamento para o camelCase dos tipos TypeScript.

CREATE TABLE identidades (
  sub_provider   text PRIMARY KEY,
  email_perfil   text NOT NULL,
  nome_completo  text NOT NULL,
  papel_ator     text NOT NULL CHECK (papel_ator IN ('ADMINISTRADOR', 'INFLUENCIADORA')),
  estado_conta   text NOT NULL CHECK (estado_conta IN ('AGUARDANDO_CADASTRO', 'PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED')),
  origem_acesso  text NOT NULL CHECK (origem_acesso IN ('PADRAO', 'CONVITE_PREAPROVADO')),
  parceira_id    text,
  data_criacao   timestamptz NOT NULL,
  ultimo_acesso  timestamptz NOT NULL
);

CREATE TABLE convites_cadastro (
  token          text PRIMARY KEY,
  criado_por     text NOT NULL,
  criado_em      timestamptz NOT NULL,
  usado_em       timestamptz,
  usado_por_sub  text
);

CREATE TABLE parceiras (
  id                  text PRIMARY KEY,
  chave               text NOT NULL,
  nome                text NOT NULL,
  email               text NOT NULL,
  cnpj                text NOT NULL DEFAULT '',
  pix                 text NOT NULL DEFAULT '',
  status              text NOT NULL CHECK (status IN ('ATIVA', 'INATIVA')),
  condicao_comercial  jsonb NOT NULL,
  data_criacao        timestamptz NOT NULL
);

CREATE TABLE entregas (
  id                 text PRIMARY KEY,
  parceira_id        text NOT NULL,
  mes_referencia     text NOT NULL,
  formato            text NOT NULL CHECK (formato IN ('Reel', 'Carrossel', 'Stories1', 'Stories2')),
  estado             text NOT NULL CHECK (estado IN ('AGUARDANDO_MATERIAL', 'EM_REVISAO', 'APROVADO', 'PUBLICADO')),
  data_entrega       text NOT NULL,
  material_enviado   text,
  data_criacao       timestamptz NOT NULL,
  data_atualizacao   timestamptz NOT NULL,
  data_arquivamento  timestamptz
);
CREATE INDEX entregas_parceira_competencia_idx ON entregas (parceira_id, mes_referencia);

CREATE TABLE briefings (
  id                       text PRIMARY KEY,
  parceira_id              text NOT NULL,
  mes_referencia           text NOT NULL,
  formato                  text NOT NULL CHECK (formato IN ('Reel', 'Carrossel', 'Stories1', 'Stories2')),
  look                     text NOT NULL,
  data_entrega             text NOT NULL,
  data_postagem            text NOT NULL,
  orientacao               text NOT NULL,
  data_aprovacao_interna   text NOT NULL,
  data_criacao             timestamptz NOT NULL,
  data_atualizacao         timestamptz NOT NULL
);
CREATE INDEX briefings_chave_natural_idx ON briefings (parceira_id, mes_referencia, formato);

CREATE TABLE obrigacoes_financeiras (
  id                 text PRIMARY KEY,
  parceira_id        text NOT NULL,
  mes_referencia     text NOT NULL,
  valor              numeric(12, 2) NOT NULL,
  estado             text NOT NULL CHECK (estado IN ('EM_ABERTO', 'APROVADO', 'PAGO')),
  tipo               text NOT NULL CHECK (tipo IN ('MENSAL', 'AVULSO')),
  data_criacao       timestamptz NOT NULL,
  data_atualizacao   timestamptz NOT NULL,
  data_arquivamento  timestamptz
);
CREATE INDEX obrigacoes_parceira_competencia_idx ON obrigacoes_financeiras (parceira_id, mes_referencia);

CREATE TABLE perfis_parceira (
  parceira_id  text PRIMARY KEY,
  pix          text NOT NULL,
  email        text NOT NULL,
  endereco     jsonb
);

CREATE TABLE solicitacoes_exclusao (
  id                   text PRIMARY KEY,
  parceira_id          text NOT NULL,
  data_pedido          text NOT NULL,
  status               text NOT NULL CHECK (status IN ('PENDENTE', 'APROVADA', 'NEGADA')),
  responsavel_analise  text,
  fundamento_juridico  text,
  data_decisao         text
);
