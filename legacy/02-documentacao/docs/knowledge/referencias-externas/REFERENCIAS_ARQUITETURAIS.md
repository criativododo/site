# Referências Arquiteturais — Panorama Open Source do Domínio Influencia

- **Tipo:** conhecimento de apoio para pesquisa/decisão futura — **não é ADR
  e não é decisão de arquitetura** (ver `docs/adrs/` para decisões formais;
  este documento não substitui nem antecipa nenhuma).
- **Data de consolidação:** 2026-07-23.
- **Fonte:** levantamento de mercado em projetos open source com
  funcionalidades análogas às do Influencia — GitHub Search API por
  categoria + consulta direta a projetos-âncora conhecidos do domínio.
- **Escopo:** conhecimento de domínio/arquitetura válido independente de
  qual sistema venha a implementar cada capacidade. A stack majoritária
  encontrada na pesquisa (TypeScript, Next.js, Postgres, Prisma) está mais
  próxima do Sistema B (`tear-v2-app`, ver `docs/knowledge/sistema-b/`) do
  que do Sistema A (GAS/Sheets) — mas as decisões de domínio e os padrões
  arquiteturais aqui registrados não pressupõem qual sistema os aplicará.

## Como usar este documento

Este documento não recomenda nenhuma stack, biblioteca ou reescrita. Ele
registra **o que o mercado open source já resolveu** para problemas
parecidos com os do Influencia, para ser consultado quando alguém for:

- desenhar um módulo novo (ex.: contratos, notificações, portal da
  influenciadora) e quiser ver como projetos maduros resolveram o mesmo
  problema antes de desenhar do zero;
- avaliar se vale a pena adotar/integrar uma dependência externa;
- escrever um ADR que precise justificar uma escolha de arquitetura com
  base em precedente de mercado.

Números de estrelas, popularidade e atividade recente **não** estão
registrados aqui de propósito — essas métricas envelhecem rápido e não
mudam o que é estruturalmente verdade sobre o problema que cada projeto
resolve. Para dados atualizados de um projeto específico, consultar o
repositório diretamente.

## Contexto

A pesquisa de mercado partiu da lista de funcionalidades do Influencia
(cadastro de influenciadoras, aprovação administrativa, campanhas,
briefings, upload de materiais, aprovação de conteúdo, pagamentos,
contratos, dashboards, notificações, autenticação, workflow de aprovação)
e buscou projetos open source que resolvem problemas equivalentes, mesmo
que parcialmente ou em outro domínio de negócio.

**Achado principal:** não existe, em código aberto, nenhum projeto maduro
que resolva "gestão de campanhas com influenciadoras" como categoria
própria — é a lacuna mais evidente do mercado OSS. O valor da pesquisa está
nas peças adjacentes, cada uma madura em seu próprio domínio: CRM (gestão
de relacionamento), portais de cliente/agência, motores de workflow e
aprovação, assinatura de contrato, notificação multi-canal, upload de
arquivo. Nenhuma delas resolve o problema do Influencia inteiro, mas cada
uma resolve bem uma fatia dele.

---

## Referências Arquiteturais

### CRM

Relacionamento com pipeline, status e histórico — a espinha dorsal mais
próxima de "gestão de campanhas com influenciadoras".

**Twenty** (CRM open-source de propósito geral, TypeScript)
- **Problema que resolve:** relacionamento B2B com pipeline, contatos e
  histórico, com um motor de objetos e campos totalmente customizáveis
  pelo usuário (não fixos em schema de código).
- **Vale estudar:** o motor de metadados de objeto/campo customizável, e o
  sistema de permissões por objeto + workspace (multi-tenant desde o
  desenho inicial, não adicionado depois).
- **Não vale copiar:** o código como base — é um produto CRM genérico
  completo; adaptá-lo para o domínio de campanhas custaria mais que
  construir sob medida. Licença mista (copyleft no core + termos
  proprietários em módulos enterprise) exige checagem jurídica antes de
  qualquer reuso de código, não só de conceito.
- **Decisões arquiteturais relevantes:** permissão por objeto em vez de só
  por papel global; workspace multi-tenant como conceito de primeira
  classe, não uma coluna `tenant_id` adicionada depois.

**NextCRM** (CRM em Next.js/Prisma/shadcn-ui)
- **Problema que resolve:** o mesmo relacionamento B2B, em escala bem menor
  e mais fácil de ler por completo.
- **Vale estudar:** como estruturar Prisma schema + shadcn/ui + Next.js App
  Router para um domínio B2B com pipeline e documentos anexos — é uma
  referência de "livro de estilo" de código, não de produto.
- **Não vale copiar:** o modelo de domínio (é CRM de vendas genérico, não
  tem o conceito de campanha/participação/briefing).
- **Decisões arquiteturais relevantes:** nenhuma fora do comum — o valor
  está no tamanho didático do código, não em uma decisão específica.

### Workflow & Aprovação

O padrão mais transferível para "workflow de aprovação de conteúdo" e
"acompanhamento do status da campanha".

**Plane** (gestão de projetos, alternativa a Jira/Linear)
- **Problema que resolve:** rastreamento de status/transição de trabalho em
  kanban, com boa UX e histórico de mudança de estado.
- **Vale estudar:** o modelo "estado + transição + automação" por trás do
  kanban — cada etapa de uma campanha (rascunho → briefing enviado → em
  produção → em aprovação → aprovado → publicado → pago) é a mesma forma
  de máquina de estados que uma issue nessas ferramentas.
- **Não vale copiar:** o código do produto — feature-set é gestão de
  projetos de software, não de campanhas de marketing.
- **Decisões arquiteturais relevantes:** separação clara entre "workspace"
  (tenant), "project" (equivalente a uma campanha) e "cycle" (equivalente a
  uma leva/rodada de campanha) — vocabulário de domínio vale como
  inspiração de nomenclatura.

**Frappe / ERPNext** (framework low-code + ERP construído sobre ele)
- **Problema que resolve:** workflow declarativo genérico — estado, quem
  pode mover para qual próximo estado, e hook a disparar em cada
  transição — aplicado a qualquer tipo de entidade de negócio.
- **Vale estudar profundamente:** é o exemplo mais maduro e testado em
  produção real, em todo o open source, de um motor de workflow **sem**
  precisar de um `if/else` hardcoded para cada transição — os estados e
  regras de quem pode movê-los são dados, não código.
- **Não vale copiar:** stack (Python/MariaDB, framework fechado sobre si
  mesmo) incompatível com o resto do ecossistema pesquisado — importar
  código daqui não faz sentido, só o modelo conceitual de workflow
  declarativo.
- **Decisões arquiteturais relevantes:** workflow como metadado (estado +
  regra + hook), não como lógica de aplicação espalhada.

**Motores de orquestração dedicados** (Temporal, Camunda, n8n)
- **Problema que resolve:** orquestração de processos de longa duração,
  cross-serviço, com retry e estado durável garantido pela plataforma.
- **Vale estudar:** só como referência conceitual de "quando" um motor
  dedicado passa a valer a pena — geralmente quando o processo de aprovação
  passa a envolver múltiplos serviços/sistemas externos com necessidade de
  garantia de entrega, não um workflow dentro de uma única aplicação.
- **Não vale copiar/adotar agora:** para o estágio atual do Influencia, um
  motor de workflow dedicado é provavelmente over-engineering — o padrão
  "status field + máquina de estados + log de transição" (visto em
  Plane/Frappe) resolve o mesmo problema com muito menos complexidade
  operacional.
- **Decisões arquiteturais relevantes:** nenhum motor de workflow dedicado
  e popular existe como biblioteca simples em TypeScript — é sempre ou um
  produto standalone pesado (Temporal/Camunda), ou construído sob medida
  dentro de cada aplicação. Essa ausência em si é um dado relevante.

### Contratos

**Documenso** (assinatura eletrônica de documentos, alternativa ao
DocuSign)
- **Problema que resolve:** assinatura de contrato com múltiplos
  signatários, campos posicionados em PDF, trilha de auditoria e
  notificação de conclusão.
- **Vale estudar profundamente:** é o único projeto de toda a pesquisa que
  resolve "contratos" como categoria própria e madura. O modelo de dados
  "documento → campos → signatários → eventos de auditoria imutável" é
  diretamente aplicável a qualquer necessidade de assinatura formal.
- **Não vale copiar:** rodar o produto inteiro embutido é uma decisão de
  arquitetura (fora do escopo deste documento) — a licença copyleft
  (obriga abertura de modificações distribuídas/hospedadas como serviço)
  precisa de checagem jurídica antes de qualquer integração que não seja
  via API externa.
- **Decisões arquiteturais relevantes:** trilha de auditoria imutável por
  assinatura — relevante para qualquer contrato juridicamente vinculante,
  independente de qual ferramenta o Influencia venha a usar.

### Upload & Armazenamento

**Uppy + upload direto para S3-compatible** (padrão de mercado, não um
único projeto — visto em Uppy, next-upload, better-upload e em todos os
boilerplates SaaS pesquisados)
- **Problema que resolve:** upload de arquivo do navegador direto para
  armazenamento de objeto, sem o servidor de aplicação precisar
  intermediar o binário.
- **Vale estudar/copiar o padrão:** cliente pede URL assinada ao backend →
  upload direto do browser para o storage (S3 ou compatível) → backend só
  grava o metadado. Esse padrão apareceu em praticamente todo projeto
  pesquisado que lida com upload de arquivo — não é "um projeto para
  copiar", é a arquitetura de referência do setor inteiro para "upload de
  materiais".
- **Não vale copiar:** nenhuma ressalva relevante — é o padrão dominante
  sem alternativa séria competindo.
- **Decisões arquiteturais relevantes:** desacoplar upload de binário do
  ciclo de requisição da aplicação é a decisão estrutural que todo o
  mercado convergiu para tomar.

**MinIO** (armazenamento de objeto self-hosted, compatível com API S3)
- **Problema que resolve:** ter um backend de armazenamento de objeto
  próprio, com a mesma API do S3, sem depender de um provedor gerenciado.
- **Vale estudar:** relevante só se/quando "armazenamento de arquivos"
  precisar sair de um provedor gerenciado sem reescrever a camada de
  upload — a compatibilidade de API é o ponto forte.
- **Não vale copiar:** é infraestrutura, não código de aplicação — não há
  "padrão" a extrair além de "existe essa opção".
- **Decisões arquiteturais relevantes:** nenhuma além da compatibilidade de
  API, que é o próprio motivo de ele existir.

**DAM dedicado** (ex.: AtroDAM, para gestão de ativos digitais com
metadados e versionamento)
- **Problema que resolve:** upload de material com metadados avançados,
  versionamento de arquivo e aprovação formal de asset — mais estruturado
  que um upload simples.
- **Vale estudar:** o modelo de metadados (tags, versão, status de
  aprovação por asset) — relevante se "upload de materiais" evoluir para
  precisar de versionamento formal (ex.: influenciadora reenvia material
  após reprovação).
- **Não vale copiar:** categoria pequena e pouco madura em open source —
  não há projeto de DAM dedicado maduro o bastante para adotar como
  dependência hoje.
- **Decisões arquiteturais relevantes:** nenhuma consolidada — é uma
  categoria ainda imatura no open source.

### Notificações

**Novu** (infraestrutura de notificação multi-canal)
- **Problema que resolve:** desacoplar "evento de domínio" (ex.: "conteúdo
  aprovado") de "canal de entrega" (email, SMS, push, in-app), com
  preferências de notificação configuráveis por usuário.
- **Vale estudar:** o padrão de motor de templates central + preferências
  por usuário/canal, em vez de chamadas de envio de e-mail espalhadas pelo
  código de negócio.
- **Não vale copiar:** adotar a infraestrutura inteira é decisão de
  arquitetura fora do escopo deste documento — o valor imediato está no
  modelo conceitual, não no código.
- **Decisões arquiteturais relevantes:** separação evento-de-domínio ↔
  canal-de-entrega como camada própria, não acoplada à lógica de negócio
  que dispara o evento.

### Portais (Cliente/Parceiro)

A categoria mais estruturalmente parecida com "dashboard da
influenciadora": uma área externa, com marca própria, onde um terceiro
não-funcionário acompanha status e envia material.

**Atrium** (portal de cliente self-hosted para agências e freelancers)
- **Problema que resolve:** área branded por conta, com escopo por
  projeto, compartilhamento de arquivo e acompanhamento de progresso — para
  o cliente de uma agência, não para um funcionário.
- **Vale estudar:** é a forma funcional mais próxima do "dashboard da
  influenciadora" encontrada na pesquisa inteira — vale ler o recorte de
  features e a separação de permissão entre a visão interna (agência) e a
  visão externa (cliente).
- **Não vale copiar:** projeto pequeno e de comunidade reduzida — não serve
  como dependência, só como referência de leitura; não há maturidade
  comprovada em escala.
- **Decisões arquiteturais relevantes:** branding customizável por conta —
  relevante só se o Influencia precisar de portal com identidade visual
  variável por marca/cliente, não apenas por influenciadora.

**Chatwoot** (suporte omnichannel, alternativa a Intercom/Zendesk)
- **Problema que resolve:** conversas e atendimento com duas visões
  distintas sobre o mesmo dado — "agente" (equipe interna) e "contato"
  (pessoa externa).
- **Vale estudar:** a separação de permissão e de UI entre a visão da
  equipe e a visão do terceiro externo sobre o mesmo modelo de dado é
  exatamente o mesmo padrão que separar o dashboard administrativo do
  dashboard da influenciadora sobre a mesma campanha.
- **Não vale copiar:** stack (Ruby on Rails) incompatível com o resto do
  ecossistema pesquisado — é referência de arquitetura conceitual, não de
  código.
- **Decisões arquiteturais relevantes:** dois papéis, duas superfícies de
  UI, um modelo de dado único — evita duplicar a fonte da verdade em dois
  sistemas separados.

### Dashboards Administrativos

**Frameworks que geram admin/CRUD a partir de schema** (ex.: Refine,
Appsmith)
- **Problema que resolve:** construir telas administrativas de CRUD
  rapidamente sobre uma API/banco já existente, sem escrever cada tela à
  mão.
- **Vale estudar:** frameworks headless (plugáveis sobre uma API já
  existente, sem exigir reescrever o backend) são candidatos realistas para
  acelerar telas novas do dashboard administrativo.
- **Não vale copiar:** para telas com lógica de negócio muito específica
  (aprovação multi-etapa, cálculo de pagamento), frameworks CRUD-first
  perdem valor — a regra de negócio complexa continua precisando ser
  escrita à mão.
- **Decisões arquiteturais relevantes:** UI gerada a partir de schema
  funciona bem para CRUD simples; não substitui telas de fluxo de negócio
  complexo.

**Templates de UI de dashboard** (shadcn/ui + Tailwind + Recharts/Tremor —
visto em múltiplos templates: TailAdmin, shadcn-admin e equivalentes)
- **Problema que resolve:** design system pronto para telas administrativas
  (tabelas, gráficos, navegação), sem lógica de backend acoplada.
- **Vale estudar/copiar:** é a combinação de UI quase universal no
  ecossistema TypeScript pesquisado para esse tipo de tela — útil como
  referência de componente, independente de framework de dados escolhido.
- **Não vale copiar:** nada de lógica de negócio — são só templates de UI.
- **Decisões arquiteturais relevantes:** nenhuma além da escolha de design
  system, que é preferência de produto, não arquitetura.

### SaaS Boilerplates & Multi-tenancy

**Boilerplates SaaS completos** (ex.: open-saas, SaaS-Boilerplate,
saas-starter-kit — múltiplos projetos convergindo no mesmo padrão)
- **Problema que resolve:** scaffolding completo de um SaaS B2B — auth,
  multi-tenancy, pagamento, e-mail, upload — integrados desde o início.
- **Vale estudar:** o padrão de RBAC + multi-tenancy construído do zero é
  referência de implementação para qualquer reforço futuro de permissões;
  a estrutura de pastas (Next.js App Router + Tailwind + shadcn/ui) é
  essencialmente o "livro de estilo" da stack moderna dessa categoria.
- **Não vale copiar:** rodar como base de um sistema já em produção — o
  custo de adaptar um boilerplate genérico a um domínio existente é maior
  que o benefício. Valor é como referência de padrão, não como ponto de
  partida.
- **Decisões arquiteturais relevantes:** multi-tenancy desde o desenho
  inicial (não adicionado depois) é o padrão consistente em todos os
  boilerplates maduros pesquisados.

### Headless CMS / Conteúdo Estruturado

Relevante para briefings, materiais e qualquer conteúdo com workflow de
aprovação — CMS headless resolveram "conteúdo estruturado + revisão +
publicação" há anos.

**Payload** (framework fullstack, não "só" CMS)
- **Problema que resolve:** gerar API + admin UI + controle de acesso a
  partir da definição de um schema de coleção, sem duplicar a definição de
  campo entre backend e frontend.
- **Vale estudar profundamente:** o padrão "define um schema → ganha API +
  admin UI + permissão" é exatamente o tipo de alavancagem que compensa
  para uma equipe pequena ao desenhar módulos novos (ex.: briefings,
  materiais). O conceito de hooks de campo/coleção (antes de gravar, depois
  de ler) é uma forma limpa de plugar regra de negócio sem espalhar lógica
  pela UI.
- **Não vale copiar:** adotar o produto inteiro como o CMS de fato — isso
  reescreveria o domínio de negócio em outro framework sem necessidade
  clara.
- **Decisões arquiteturais relevantes:** admin UI 100% gerada a partir de
  schema TypeScript, sem duas fontes da verdade (schema de banco vs.
  formulário de UI).

**Directus** — transforma qualquer banco existente em CMS headless com
API instantânea e permissão granular por campo.
- **Vale estudar:** o motor de permissão por campo (não só por
  tabela/objeto) é mais granular que a maioria dos exemplos desta lista.
- **Não vale copiar:** licença de código-fonte disponível, não permissiva
  no sentido tradicional — checar termos antes de qualquer uso comercial
  que dependa disso.

### Autenticação

**Better-Auth / NextAuth (Auth.js)** — as duas bibliotecas de autenticação
TypeScript mais maduras do ecossistema open source atual.
- **Problema que resolve:** login social, sessão, RBAC básico, sem
  depender de um provedor de identidade proprietário.
- **Vale estudar:** Better-Auth já vem com multi-tenancy/organizações
  nativas — um diferencial frente ao Auth.js, que historicamente exige mais
  código próprio para esse cenário.
- **Não vale copiar:** a escolha entre as duas (ou manter a solução atual)
  é decisão de arquitetura, fora do escopo deste documento.
- **Decisões arquiteturais relevantes:** nenhuma das duas depende de um
  provedor de identidade externo obrigatório — ambas suportam self-hosted
  puro.

### Marketplace / Commerce (multi-party money flows)

Plataformas de e-commerce headless já resolveram "múltiplas partes,
pagamento, aprovação de pedido" — o esqueleto de dados é reaproveitável
mentalmente para "marca paga → influenciadora entrega → pagamento
liberado".

**Medusa** (commerce platform headless)
- **Problema que resolve:** processos de negócio multi-etapa envolvendo
  dinheiro (pedido → pagamento → fulfillment), com necessidade de reverter
  uma etapa com segurança se uma etapa seguinte falhar.
- **Vale estudar profundamente:** o motor de workflow interno com passos
  compensáveis (padrão saga) é a peça mais transferível desta pesquisa
  inteira para "aprovar conteúdo → liberar pagamento" com rollback seguro
  em caso de erro no meio do processo.
- **Não vale copiar:** adotar a plataforma inteira — é e-commerce, o
  domínio de produto/carrinho não bate com campanhas de influenciadora.
- **Decisões arquiteturais relevantes:** state machine de pedido com
  histórico de transição auditável; passos de workflow compensáveis
  (rollback) em vez de só "sucesso ou falha total".

### Suporte / Comunicação multi-papel

Ver **Chatwoot**, já registrado em [Portais (Cliente/Parceiro)](#portais-clienteparceiro)
— o mesmo projeto cobre as duas categorias.

### Plataforma de backend all-in-one

**Supabase** (Postgres + Auth + Storage + Realtime + Edge Functions,
self-hostable)
- **Problema que resolve:** ter auth, storage de arquivo e notificação em
  tempo real resolvidos juntos, sobre um banco Postgres dedicado, sem
  integrar cada peça separadamente.
- **Vale estudar:** é o retrato mais didático de "quanto de auth + storage
  + realtime já vem resolvido junto" numa única plataforma madura — útil
  como referência de "o que uma plataforma madura considera tabela-stakes"
  ao avaliar o que construir versus o que integrar.
- **Não vale copiar:** não é recomendação de migração — é fora do escopo
  deste documento decidir se vale adotar.
- **Decisões arquiteturais relevantes:** nenhuma isolada — o valor está no
  conjunto (auth + storage + realtime + banco) vendido como uma unidade
  coesa, não em uma peça específica.

### Domínio específico (Influencer / Creator Economy)

**InPactAI** — único projeto encontrado que modela diretamente o triângulo
criador ↔ marca ↔ agência.
- **Problema que resolve:** conectar criadores de conteúdo, marcas e
  agências com matching orientado a dados e métricas de engajamento/ROI.
- **Vale estudar:** é o único projeto de toda a pesquisa que modela
  exatamente o domínio do Influencia — vale ler o modelo de dados (como
  eles representam Creator/Brand/Agency/Sponsorship) mesmo sem adotar
  código.
- **Não vale copiar:** projeto imaturo, sem sinal de uso em produção real —
  não sustenta auth, permissões nem testes no nível que produção exige.
- **Decisões arquiteturais relevantes:** nenhuma testada em escala —
  vale só pelo recorte de domínio, não pela implementação.

**Referral / Affiliate** (ex.: refref) — adjacente por resolver "parceiro
externo gera valor mensurável, é recompensado por isso", o mesmo padrão
por trás de comissão/incentivo de influenciadora.
- **Vale estudar:** o modelo de tracking de conversão (evento → comissão)
  é um padrão mental reaproveitável para "entrega aprovada → pagamento
  devido".
- **Não vale copiar:** licença copyleft (AGPL) exige checagem jurídica
  antes de qualquer reuso que não seja só conceitual.

---

## Padrões recorrentes

Observado de forma consistente através de praticamente todos os domínios
pesquisados:

- **Workflow/aprovação** é resolvido, na esmagadora maioria dos projetos
  maduros, como **status field + máquina de estados + log de transição
  com hooks** — não como motor de workflow dedicado (BPMN/Temporal). Motor
  dedicado só aparece em sistemas de escala muito maior que a de uma
  startup enxuta.
- **Upload de arquivo** converge universalmente para **URL assinada +
  upload direto do cliente para storage S3-compatible**, sem o servidor de
  aplicação intermediar o binário.
- **Permissão** evolui, nos projetos mais maduros, de RBAC simples (por
  papel) para permissão **por objeto/campo** — não fica só no nível global.
- **Multi-tenancy**, quando presente, é decisão de desenho desde o início
  do projeto — nunca vista como algo adicionado depois sem retrabalho
  significativo.
- **Não existe** uma biblioteca popular e independente de "workflow de
  aprovação" pronta para uso em TypeScript — é sempre construído sob
  medida dentro de cada produto, usando o padrão de status field acima.
- **Dois papéis, uma fonte de dado:** os projetos que resolvem bem "visão
  interna da equipe" vs. "visão externa de um terceiro" (Chatwoot, Atrium)
  o fazem com permissão/UI diferenciada sobre o mesmo modelo de dado —
  nunca duplicando a fonte da verdade em dois sistemas.

## Oportunidades

- Não existe projeto open source maduro o bastante para reaproveitar
  "quase inteiro" no domínio específico do Influencia — a lacuna de
  mercado é real, não é falta de busca.
- O maior ganho não está em adotar um projeto específico, mas em **os
  padrões de arquitetura recorrentes acima** (workflow como status field,
  upload via URL assinada, permissão por objeto, dois-papéis-uma-fonte) —
  esses sim, comprovadamente maduros e testados em produção real por
  múltiplos projetos independentes.
- Vale reler este documento antes de desenhar qualquer módulo novo que se
  encaixe em uma das categorias acima, para não redescobrir um padrão que
  o mercado já validou.

---

## Prioridade de estudo (registrada em 2026-07-23)

Os 5 projetos abaixo são os recomendados para estudo profundo nas
próximas semanas, em ordem de prioridade — critério: relevância direta
para uma lacuna funcional ainda em aberto do Influencia, não popularidade.

1. **Payload** — é o padrão mais diretamente aplicável ao maior número de
   módulos do Influencia ao mesmo tempo (briefings, materiais, qualquer
   conteúdo estruturado com aprovação): schema → API → admin UI gerado,
   sem duas fontes da verdade.
2. **Medusa** (foco no motor de workflow interno, não no produto de
   e-commerce) — é a única referência encontrada de como fazer "aprovar →
   liberar pagamento" com rollback seguro (padrão saga), diretamente
   relevante para RF de pagamento condicionado à aprovação de entrega.
3. **Frappe** (foco no motor de workflow declarativo, não no ERPNext
   inteiro) — é o exemplo mais maduro e testado em produção real de
   workflow como metadado em vez de `if/else` espalhado; mesmo sem adotar
   o framework, o modelo conceitual vale para desenhar o motor de
   aprovação do Influencia com mais rigor.
4. **Documenso** — única referência madura para "contratos"; se esse RF
   ainda não estiver implementado, vale estudar antes de desenhar do zero.
5. **Atrium** — mesmo pequeno, é a forma funcional mais próxima do
   "dashboard da influenciadora" encontrada em toda a pesquisa; vale
   estudar o recorte de features e a separação de permissão entre visão
   interna e externa antes de desenhar esse dashboard, se ainda não tiver
   sido desenhado.

Documentos técnicos completos de cada projeto ficam fora deste
documento — este é um índice de conhecimento, não uma cópia de
documentação de terceiros. Ao aprofundar em qualquer item acima, registrar
achados relevantes de volta neste arquivo (atualizando o campo
correspondente), não em um documento novo.
