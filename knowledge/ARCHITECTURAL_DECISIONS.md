# ARCHITECTURAL_DECISIONS.md

> Registro de decisões arquiteturais permanentes deste projeto (Criativo DODÔ), no formato
> ADR (Architecture Decision Record). **Esta é uma série própria**, iniciada em 2026-07-26,
> distinta da série `knowledge/Arquitetura/ADR-002/012/015/016/017/018/019/020.md` — aquela
> documenta decisões tomadas para o "Sistema B" (Laravel), um código que não existe mais
> fisicamente neste repositório. Esta série documenta decisões de governança e método que
> se aplicam ao projeto como um todo, independentemente de qual stack venha a ser escolhida
> para o Portal. Onde uma decisão desta série se sobrepõe a algo dito na série antiga, isso é
> declarado explicitamente dentro do próprio ADR.

---

## ADR-001 — A Landing Page (`app/`) é a implementação oficial do Design System do Criativo DODÔ

- **Status:** Aceito.
- **Data:** 2026-07-26.
- **Autor da decisão:** responsável do projeto.

### Contexto
O projeto já teve, segundo `knowledge/Arquitetura/ADR-019-design-system-dodo-como-ssot-
visual.md`, três gerações de identidade visual documentadas, culminando na proposta de um
"Manual de Design DODÔ" em `docs/design/manual/`. Esse caminho **não existe fisicamente**
neste repositório. O que existe é `app/` (Landing Page em produção, React+Vite+GSAP) e
`design-system/index.html`/`DESIGN.md` (documentação auxiliar extraída do código de `app/`
numa sessão anterior).

### Decisão
A **Landing Page implementada em `app/`** é, a partir desta data, a implementação oficial da
identidade visual do Criativo DODÔ. Cobre: identidade visual, aplicação da marca,
componentes, tipografia, paleta de cores, espaçamentos, grid, animações/motion,
responsividade, comportamento visual e linguagem de interface.

Em qualquer divergência entre a Landing (`app/`), o Design System HTML
(`design-system/index.html`) e qualquer documentação (incluindo `ADR-019` da série antiga),
**a Landing sempre prevalece**, até que um novo Design System oficial seja formalmente
aprovado.

### Consequências
- `design-system/index.html`/`DESIGN.md` passam a ser tratados como documentação auxiliar,
  não fonte primária — podem ser completamente refeitos no futuro sem impacto na Landing.
- Esta decisão **substitui, para fins práticos deste repositório**, o que `ADR-019` (série
  antiga) declara sobre `docs/design/manual/` — não revoga aquele ADR como registro
  histórico do Sistema B, apenas estabelece que, neste repositório, a referência corrente é
  outra.
- Toda evolução visual do Portal deve derivar da Landing existente (ver `ADR-004`).

---

## ADR-002 — A documentação descreve um Portal completo; a implementação existente hoje é apenas a Landing

- **Status:** Aceito.
- **Data:** 2026-07-26.

### Contexto
`knowledge/` contém dezenas de SPECs e ADRs descrevendo um sistema de gestão de parcerias
com influenciadoras — incluindo um Portal da Influenciadora inteiramente especificado
(SPEC-025/027/030/032/035) — com notas de "implementado" e "testes verdes". Uma auditoria
completa do repositório (`find`, `git log --all`, busca por `composer.json`/`*.php`) confirma
que nenhum desse código existe fisicamente aqui.

### Decisão
Registra-se formalmente, como fato de estado do projeto: **a documentação em `knowledge/`
descreve requisitos e regras de negócio, não o estado físico atual do código.** O único
código de produto que existe neste repositório é a Landing Page (`app/`). Toda sessão futura
deve tratar as SPECs/ADRs como especificação a implementar, nunca como inventário de código
disponível para importar ou referenciar como dependência.

### Consequências
- Nenhuma tarefa de implementação do Portal pode presumir a existência de um backend, banco
  de dados, ou camada de autenticação já funcionando.
- Ver `PORTAL_BRIEFING.md` §0 para o detalhamento completo deste achado.

---

## ADR-003 — Nenhum requisito funcional deve ser inventado quando não estiver presente na documentação

- **Status:** Aceito.
- **Data:** 2026-07-26.

### Contexto
A documentação em `knowledge/` contém lacunas, contradições entre si (ex.: gate de
elegibilidade de pagamento, Q-04 vs. P0-1) e pendências explicitamente não resolvidas (Q-05,
Q-07, Q-08, Q-09, escopo do ator Marca). Existe o risco, em sessões futuras, de uma dessas
lacunas ser preenchida por suposição, em vez de por decisão explícita do responsável do
projeto.

### Decisão
Toda sessão de trabalho neste projeto deve seguir a regra: **onde uma informação não existir
ou for contraditória entre fontes, isso deve ser marcado explicitamente como `PENDENTE` (ou
equivalente), nunca resolvido por suposição, dedução ou inferência de "boa prática
genérica".** Decisões de produto (não de implementação técnica de uma decisão já tomada) são
sempre do responsável do projeto.

### Consequências
- `PORTAL_BRIEFING.md` §13, `PORTAL_BACKLOG.md` EPIC 0, e as tabelas de pendências em
  `PORTAL_GLOSSARIO.md`/`USER_JOURNEYS.md` (jornada de Marca) seguem essa regra e devem
  continuar sendo o ponto de checagem antes de qualquer implementação nas áreas marcadas.
- Uma sessão que precisar avançar sobre um item pendente deve primeiro obter a decisão do
  responsável do projeto e só então atualizar o documento correspondente (idealmente como um
  novo ADR nesta série).

---

## ADR-004 — Toda evolução visual do Portal deve derivar da Landing existente, nunca criar uma identidade paralela

- **Status:** Aceito.
- **Data:** 2026-07-26.
- **Relaciona-se com:** ADR-001 (desta série).

### Contexto
Como o Portal será um código novo, construído separadamente da Landing, existe o risco de
que a implementação do frontend do Portal comece do zero visualmente (nova paleta, nova
tipografia, novos componentes), gerando uma segunda identidade visual dentro do mesmo
produto.

### Decisão
Todo componente, página, token de cor/tipografia/espaçamento e padrão de motion novo criado
para o Portal deve ser uma **expansão dos padrões já existentes na Landing (`app/`)**, nunca
uma identidade visual paralela. Isso inclui reaproveitar a stack de frontend já validada
(React + Vite + TypeScript, mesma versão de referência de `app/package.json`) sempre que a
decisão de stack do Portal (pendência aberta, ver `ARCHITECTURAL_DECISIONS.md`/`PORTAL_
BRIEFING.md` §13.1) permitir.

### Consequências
- Antes de estilizar qualquer tela nova do Portal, ler o código de `app/src` diretamente
  (não só o Design System HTML).
- Se a decisão de stack (pendência §13.1) escolher uma tecnologia de frontend incompatível
  com reaproveitar componentes React diretamente, os **tokens visuais** (cor, tipografia,
  espaçamento, motion) extraídos de `app/` continuam sendo a referência obrigatória — só a
  camada de implementação de componente muda, não a identidade.

---

## ADR-005 — Stack do Portal: backend Node.js/TypeScript, frontend React+Vite+TypeScript

- **Status:** Aceito.
- **Data:** 2026-07-26.
- **Autor da decisão:** responsável do projeto.
- **Relaciona-se com:** ADR-004 (desta série); resolve `PORTAL_BRIEFING.md` §13 item 1 /
  `PORTAL_BACKLOG.md` EPIC 0 Feature 0.1.

### Contexto
Nenhuma stack de backend existe fisicamente neste repositório (ver ADR-002). Três caminhos
estavam abertos: recomeçar em Laravel+React (como o "Sistema B", código ausente,
descrevia), adotar outra stack, ou integrar com um sistema legado. O frontend da Landing
(`app/`) já usa React + Vite + TypeScript e é a fonte de verdade visual (ADR-001).

### Decisão
O backend do Portal será construído em **Node.js/TypeScript**. O frontend do Portal reaproveita
a stack já validada da Landing — **React + Vite + TypeScript**, mesma versão de referência de
`app/package.json` — conforme já determinado em ADR-004. Motivos registrados pelo
responsável do projeto: manter uma única linguagem em todo o projeto (TypeScript
ponta-a-ponta), reaproveitar o ecossistema já existente, reduzir carga cognitiva/manutenção
para um desenvolvedor solo, e ausência de qualquer backend legado que justifique introduzir
PHP.

### Consequências
- Nenhum código ou padrão do "Sistema B" (Laravel) é herdado como implementação — só como
  referência de raciocínio de regra de negócio (já era a posição de ADR-002).
- O setup do EPIC 1 (Feature 1.1) inicializa um backend Node/TypeScript novo, do zero.
- Escolhas de framework específicas dentro do Node (ex.: Express/Fastify/Nest, ORM, etc.) são
  detalhe de implementação desta decisão, não uma nova decisão arquitetural permanente —
  não precisam de ADR próprio salvo se se mostrarem estruturalmente relevantes.

---

## ADR-006 — Vocabulário de domínio do código novo: Contrato Soberano

- **Status:** Aceito.
- **Data:** 2026-07-26.
- **Autor da decisão:** responsável do projeto.
- **Relaciona-se com:** resolve `PORTAL_BRIEFING.md` §13 item 2 / `PORTAL_BACKLOG.md` EPIC 0
  Feature 0.2.

### Contexto
Duas linguagens de domínio não reconciliadas coexistiam em `knowledge/`: o vocabulário
"Contrato Soberano" (`Colaboração Mensal`/`Entrega`/`Envio`/`Obrigação Financeira`, usado
pelas SPECs numeradas do Portal, SPEC-025/027/030/032) e o vocabulário "Sistema B"
(`Campanha`/`ParticipacaoNaCampanha`/`Pagamento`, do Laravel removido).

### Decisão
O vocabulário oficial de todo código, documentação, entidades, serviços, eventos, APIs,
testes e banco de dados novos do Portal é o do **Contrato Soberano**: `Colaboração Mensal`,
`Entrega`, `Envio`, `Obrigação Financeira`, e os demais termos definidos em
`knowledge/Historico/CONTRATO_SOBERANO.md`. O vocabulário do Sistema B (`Campanha`,
`Participação`, etc.) não deve ser usado no código novo, salvo quando estritamente necessário
para migração ou compatibilidade com dado legado.

### Consequências
- Os termos oficialmente banidos do domínio (`Ciclo`, `Plano de Colaboracao`, `Ativação` para
  o agregado de conteúdo, `Fluxo Logístico`/`EnvioLogistico`) permanecem banidos também no
  código novo (já eram banidos na documentação, `ADR-012` da série antiga).
- Toda modelagem de schema/entidade do EPIC 1 em diante usa os nomes do Contrato Soberano.
- Se, no futuro, for necessário importar dado do Sistema B (não há decisão de fazê-lo), o
  mapeamento de equivalência entre os dois vocabulários (`PORTAL_ARQUITETURA.md` §8) deve ser
  usado como camada de tradução na borda, nunca vazado para o domínio novo.

---

## ADR-007 — Autenticação da Parceira: Google OIDC federado

- **Status:** Aceito.
- **Data:** 2026-07-26.
- **Autor da decisão:** responsável do projeto.
- **Relaciona-se com:** resolve `PORTAL_BRIEFING.md` §13 item 3 (Q-07 real) /
  `PORTAL_BACKLOG.md` EPIC 0 Feature 0.3 e Feature 1.2.

### Contexto
Três modelos de autenticação da Parceira, incompatíveis entre si e nenhum implementado neste
repositório, coexistiam na documentação: Cupom+CNPJ (legado, a própria documentação
recomendava abandono por baixa entropia), e-mail/senha via Laravel (Sistema B, sem bloqueio
por tentativas), e Google OIDC (SPEC-035, com fluxo `PENDING→ACTIVE`). SPEC-035 só resolvia a
integração arquitetural entre um mecanismo OIDC e uma sessão já existente — não escolhia o
mecanismo de credencial em si.

### Decisão
O MVP do Portal usa **Google como Identity Provider via OIDC**, com **Authorization Code Flow
+ PKCE**. Não será implementada autenticação por e-mail/senha no MVP, nem o modelo legado de
Cupom+CNPJ. O fluxo de conta segue o previsto em SPEC-035: toda conta nasce `PENDING` e só
passa a `ACTIVE` mediante aprovação de um Administrador; a vinculação de uma Parceira
pré-existente a uma identidade OIDC é sempre um fluxo explícito de confirmação manual, nunca
associação automática silenciosa (SPEC-035 §5.1-A).

### Consequências
- Bloqueio por tentativas (RN-17, pensado para credencial adivinhável) não se aplica a este
  modelo — não deve ser implementado para o fluxo OIDC (coerente com a ressalva já registrada
  em `PORTAL_ARQUITETURA.md` §9.2-A).
- Sessão deslizante de 6h (RN-18) continua valendo, agora sobre a sessão da aplicação
  estabelecida após o login OIDC, não sobre uma credencial local.
- É necessário provisionar um app OAuth Google (client id/secret) e o bootstrap manual do
  primeiro Administrador `ACTIVE` (RN-07 de SPEC-035, já que a ativação de qualquer conta
  depende de um Administrador já ativo) antes de qualquer Parceira conseguir logar.
- `BASE_ADMINISTRADORES`/`SIS_IDENTIDADES` (SPEC-035 §9) servem de referência de modelagem
  para a tabela de identidade, traduzidos para o vocabulário do ADR-006 onde aplicável.

---

## ADR-008 — Escopo do MVP: ator "Marca" fora do MVP, sistema single-tenant

- **Status:** Superseded por [ADR-022](#adr-022--ator-marca-entra-no-mvp-dois-níveis-administrativos-sistema-permanece-single-tenant).
- **Data:** 2026-07-26.
- **Autor da decisão:** responsável do projeto.
- **Relaciona-se com:** resolve `PORTAL_BRIEFING.md` §13 item 4 / `PORTAL_BACKLOG.md` EPIC 0
  Feature 0.4.

### Contexto
SPEC-035 §4.2 descrevia "Marca" como ator com acesso restrito aos próprios
dados/campanhas/briefings/orçamentos, mas a própria SPEC marcava isso como decisão de escopo
que só o responsável do projeto poderia tomar — nenhuma fonte confirmava Marca como requisito
do MVP, e o PRD original (V1) tratava o sistema como single-tenant.

### Decisão
O ator **Marca não entra no MVP**. O sistema é **single-tenant**, operado exclusivamente
para o Criativo DODÔ. Multi-tenancy e a entidade `Marca` como conceito de domínio não são
implementados nesta fase.

### Consequências
- O modelo de dados do EPIC 1 em diante não inclui `Marca`/`tenant_id` como conceito de
  primeira classe.
- A arquitetura deve permanecer capaz de evoluir para multi-tenant no futuro (ex.: evitar
  acoplamentos que tornem essa evolução artificialmente cara), mas nenhuma complexidade extra
  é adicionada antecipando essa evolução agora.
- Caso a necessidade de múltiplas Marcas seja validada no futuro, ela é tratada como um novo
  ADR e como EPIC 5 (`PORTAL_BACKLOG.md`), nunca implementada silenciosamente.
- `GESTOR_MARCA`/`Assessoria` (papéis citados sem comportamento definido, `PORTAL_BRIEFING.md`
  §4.4) permanecem fora de escopo pela mesma razão.

---

## ADR-009 — Gate de elegibilidade de pagamento: todas as Entregas Aprovadas

- **Status:** Aceito.
- **Data:** 2026-07-26.
- **Autor da decisão:** responsável do projeto.
- **Relaciona-se com:** resolve `PORTAL_BRIEFING.md` §13 item 5 / `PORTAL_BACKLOG.md` EPIC 0
  Feature 0.5.

### Contexto
Duas fontes discordavam sobre a regra de liberação de pagamento de uma Colaboração Mensal:
uma ("Q-04") tratava como já resolvido que bastava todas as Entregas estarem Aprovadas; outra
("P0-1", Sistema B) tratava a mesma questão como pendência em aberto, deixando ambíguo se
Publicado seria exigido.

### Decisão
A elegibilidade para pagamento de uma Colaboração Mensal ocorre quando **todas as Entregas
previstas nessa Colaboração Mensal estiverem em estado `Aprovado`**. A publicação
(`Publicado`) do conteúdo **não é pré-requisito** para liberar o pagamento — a publicação
continua sendo acompanhada pelo Portal para fins operacionais, métricas e acompanhamento da
campanha, mas não bloqueia a Obrigação Financeira.

### Consequências
- Esta é a regra oficial de domínio para todas as entidades, workflows, APIs e regras de
  negócio relacionadas a pagamentos (RN-09/RN-10 de `PORTAL_BRIEFING.md` §7.1 devem ser lidas
  em conjunto com esta decisão).
- O cálculo de elegibilidade (EPIC 3, Feature 3.2) verifica o estado de todas as Entregas da
  Colaboração Mensal, não o estado de publicação.
- Resolve definitivamente a contradição entre Q-04 e P0-1 citada em `PORTAL_BRIEFING.md` §12.

---

## ADR-010 — Política de proteção de dados pessoais (LGPD), Privacy by Design/Default

- **Status:** Aceito.
- **Data:** 2026-07-26.
- **Autor da decisão:** responsável do projeto.
- **Relaciona-se com:** resolve `PORTAL_BRIEFING.md` §13 item 6 (Q-09) / `PORTAL_BACKLOG.md`
  EPIC 0 Feature 0.6.

### Contexto
Nenhuma SPEC do Portal resolvia retenção/expurgo de PII antes do Portal expor dados pessoais
(PIX, CNPJ, Endereço); a pendência era repetidamente citada como "débito herdado, não
bloqueante", o que o `ADR-003` desta série já proibia tratar como suposição implícita.

### Decisão
A política de proteção de dados pessoais do Portal é implementada **desde o início do
projeto**, seguindo a LGPD por padrão (**Privacy by Design e Privacy by Default**):

1. **Bases legais.** O Portal só trata dado pessoal mediante base legal válida da LGPD.
   Bases esperadas para o MVP: execução de contrato; procedimentos preliminares solicitados
   pela Parceira; cumprimento de obrigação legal/regulatória; exercício regular de direitos;
   legítimo interesse, quando aplicável e documentado. Consentimento só é usado quando
   realmente necessário.
2. **Classificação de dados**, em três níveis:
   - **Público** (ex.: nome artístico, cidade, redes sociais públicas).
   - **Operacional** (ex.: e-mail, telefone, histórico de acessos, briefings, entregas).
   - **Financeiro** (ex.: PIX, CPF/CNPJ, endereço, comprovantes) — proteção reforçada.
3. **Menor privilégio.** Cada usuário acessa só o dado necessário à própria função.
   Administradores têm acesso integral apenas quando necessário. Parceiras nunca visualizam
   dado de outra Parceira (reforça RN-27.01 e a Feature 1.3, middleware de isolamento).
4. **Auditoria.** Toda operação crítica gera trilha de auditoria: usuário, data, horário, IP
   (quando disponível), operação executada, recurso afetado. Logs de auditoria não podem ser
   alterados pela aplicação.
5. **Direitos do titular.** O Portal permite atender: confirmação de tratamento, acesso,
   correção, atualização, portabilidade (quando aplicável), anonimização, bloqueio,
   eliminação quando juridicamente possível. Todo pedido de eliminação é avaliado quanto à
   existência de obrigação legal que imponha conservação (art. 16 da LGPD).
6. **Retenção**, por categoria (não há prazo único arbitrário):
   - Parceira **Ativa** → mantém todos os dados necessários à operação.
   - Parceira **Inativa** → acesso desativado imediatamente.
   - Dados financeiros/fiscais/contratuais → mantidos pelo prazo exigido pela legislação
     aplicável.
   - Dados operacionais sem necessidade jurídica → anonimizados ou eliminados após o
     encerramento da finalidade.
7. **Processo de expurgo.** Pedidos de exclusão são processados pelo Administrador. O sistema
   registra: data do pedido, responsável pela análise, fundamento jurídico, decisão, data do
   expurgo/anonimização. Havendo obrigação legal de retenção, o Portal informa que os dados
   correspondentes permanecem armazenados só para essa finalidade.
8. **Backups.** Backups não são usados como ambiente operacional. Se houver restauração,
   pedidos de eliminação anteriores devem ser reaplicados aos dados restaurados.
9. **Privacy by Design.** Todo novo módulo deve responder, antes de ser aprovado: quais dados
   coleta, por quê, sob qual base legal, quem acessa, onde armazena, por quanto tempo, e
   quando é anonimizado/eliminado. Nenhuma funcionalidade é aprovada sem essas respostas.

### Consequências
- Esta política é requisito de primeira classe desde o EPIC 1, não um débito a ser resolvido
  antes do EPIC 3/4 — qualquer módulo que colete/exiba PII deve satisfazer os 9 pontos acima
  antes de ser aprovado.
- O middleware de isolamento (Feature 1.3) e a auditoria (ponto 4) devem nascer juntos: toda
  rota que acessa dado de Parceira precisa registrar a trilha de auditoria descrita acima.
- O modelo de dados de EPIC 1 em diante já nasce com a classificação de dados (ponto 2)
  refletida — por exemplo, campos financeiros isolados/marcados para proteção reforçada.
- Detalhes de implementação (formato exato do log de auditoria, ferramenta de anonimização,
  prazos legais específicos por categoria) são elaborados durante o EPIC correspondente, sem
  reabrir esta decisão de princípio.

---

## ADR-011 — Fluxo de cadastro (self-service) da Influenciadora e links de convite pré-aprovado

- **Status:** Aceito.
- **Data:** 2026-07-29.
- **Autor da decisão:** responsável do projeto.
- **Relaciona-se com:** SPEC-035 Cap. 5/7/9-10, ADR-007 (fluxo `PENDING→ACTIVE`), ADR-008
  (agregado Parceira modelado no Backoffice Administrativo).

### Contexto
O fluxo original de ADR-007 (`PENDING→ACTIVE`) fazia toda conta nova nascer `PENDING` já no
primeiro login com Google, sem nenhum dado além de nome/e-mail do provedor — não existia
etapa de preenchimento de cadastro antes da moderação, e o Administrador não tinha como gerar
acesso pré-aprovado para parceiras já combinadas fora do Portal.

### Decisão
1. **Novo estado `AGUARDANDO_CADASTRO`**, anterior a `PENDING`: toda conta nova (exceto
   bootstrap de Administrador/seed de QA) nasce aqui após o primeiro login com Google, e só
   avança ao enviar o formulário de cadastro (nome, chave/nome artístico, cnpj, pix,
   endereço).
2. **Ao enviar o cadastro**, o Portal cria fisicamente o agregado Parceira (nasce `INATIVA`,
   RN-01 inalterada) e o Perfil (pix/endereço) correspondentes, vincula `parceiraId` à
   Identidade, e decide o próximo estado:
   - `PENDING` no caminho padrão (aguarda moderação do Administrador, como já era).
   - `ACTIVE` direto, se a conta nasceu a partir de um link de convite pré-aprovado (item 3).
3. **Links de convite pré-aprovado**: o Administrador gera um token de uso único
   (`/api/admin/convites`); quem acessa `/convite/:token`, faz login com Google e envia o
   cadastro pula a fila de moderação manual.
4. **A Condição Comercial da Parceira** (valor mensal, entregáveis contratados) não é
   preenchida pela própria Influenciadora — nasce zerada no cadastro e é ajustada pelo
   Administrador depois, no mesmo fluxo de edição já existente em `AdminParceiras`.

### Consequências
- `EstadoConta` passa a ter 5 valores (`AGUARDANDO_CADASTRO | PENDING | ACTIVE | INACTIVE |
  REJECTED`); qualquer código que trate `estadoConta` de forma exaustiva precisa considerar o
  novo valor.
- A vinculação Identidade↔Parceira deixa de ser uma lacuna do EPIC 1 (ver §5.1-A citado em
  `identidade.service.ts`) para o caminho de auto-cadastro — a vinculação por confirmação
  manual explícita (parceira pré-existente por e-mail coincidente) continua não implementada e
  continua fora de escopo desta decisão.
- Links de convite são armazenados em memória (mesmo placeholder de persistência do restante
  do módulo de identidade) — não sobrevivem a um restart do processo.

---

## ADR-012 — `ADMIN_BOOTSTRAP_EMAILS` promove identidades já existentes, nunca rebaixa

- **Status:** Aceito.
- **Data:** 2026-07-29.
- **Autor da decisão:** responsável do projeto.
- **Relaciona-se com:** SPEC-035 RN-07 (bootstrap do primeiro Administrador), ADR-011
  (fluxo de cadastro self-service).

### Contexto
`resolverOuCriarIdentidade` (`portal-backend/src/modules/identidade/identidade.service.ts`)
só consultava `env.adminBootstrapEmails` no ramo de **criação** de uma nova `Identidade`
(`sub` inexistente). Uma vez que o registro já existia no repositório — por exemplo, uma
conta que fez login e completou o cadastro como `INFLUENCIADORA` antes de seu e-mail ser
incluído em `ADMIN_BOOTSTRAP_EMAILS`, ou antes do próximo restart do processo — logins
seguintes só atualizavam `ultimoAcesso`; `papelAtor`/`estadoConta` gravados na criação
ficavam permanentes, e incluir o e-mail na variável de ambiente depois não tinha nenhum
efeito. Foi o que causou, em produção (2026-07-29), a conta bootstrap
`criativododo@gmail.com` ver a tela de "acesso em análise" (`estadoConta = PENDING`) em vez
do painel administrativo.

### Decisão
1. `ADMIN_BOOTSTRAP_EMAILS` passa a ser reavaliado em **todo login**, inclusive para
   identidades já existentes: se o e-mail estiver na lista e a conta ainda não for
   `ADMINISTRADOR`/`ACTIVE`, ela é promovida nesse mesmo login.
2. A promoção **nunca é revertida automaticamente**: remover um e-mail de
   `ADMIN_BOOTSTRAP_EMAILS` não rebaixa a conta correspondente. Rebaixar um Administrador
   continua sendo ação manual explícita (mesmo modelo de `moderarConta`, RN-04/RN-05) — fora
   do escopo desta decisão, pois não existe hoje um fluxo de rebaixamento de Administrador.
3. `ADMIN_BOOTSTRAP_EMAILS` funciona, portanto, como mecanismo tanto de bootstrap (primeiro
   Administrador, RN-07) quanto de **recuperação administrativa** (reconceder o papel a uma
   conta que o perdeu ou nunca o teve, sem depender de acesso direto ao armazenamento).

### Consequências
- `resolverOuCriarIdentidade` promove no ramo de identidade existente, não só no de criação;
  coberto por teste em `identidade.service.test.ts` (promove, não rebaixa ao sair da lista,
  não altera conta fora da lista).
- Continua não existindo fluxo de rebaixamento automático ou manual de Administrador —
  qualquer necessidade futura disso é uma decisão nova, fora desta ADR.
- Como o repositório de identidade é em memória (placeholder, ver ADR-011), a promoção não
  sobrevive a um restart do processo por si só — mas passa a ser reaplicada automaticamente
  no próximo login após qualquer restart, o que resolve o cenário observado em produção.
- **Correção complementar (mesma data, validada em produção):** a promoção só se aplica num
  login novo (`/auth/google/callback`), mas `portal-frontend/src/pages/Login.tsx` só exibia o
  botão "continuar com google" quando não havia nenhuma sessão (`!sessao`) — uma conta presa
  em `PENDING` (sessão de cookie deslizante de até 6h) nunca conseguia disparar um login novo
  pela própria tela, mesmo já promovível pela lista de bootstrap. Corrigido com um botão "sair
  e tentar novamente" nos estados `PENDING`/`INACTIVE`/`REJECTED`, que só encerra a sessão
  (reaproveita `logout()` já existente) — não antecipa nem contorna a promoção em si.

---

## ADR-013 — Infraestrutura de resolução de CEP: cache + cadeia de providers com fallback

- **Status:** Aceito.
- **Data:** 2026-07-29.
- **Autor da decisão:** responsável do projeto.
- **Relaciona-se com:** SPEC-032 §6.3 (Adaptador de CEP, RN-01/RN-02), `PORTAL_ARQUITETURA.md`.

### Contexto
`ResolvedorDeCep` (porta definida em SPEC-032 §6.3) só tinha uma implementação:
`ResolvedorDeCepEmMemoria`, um stub com dois CEPs fixos de teste, sem nenhuma integração
externa real — decisão de infraestrutura deliberadamente adiada (comentário original: "nenhuma
integração externa foi decidida"). Em produção, isso significava que **nenhum CEP real jamais
resolvia**: `rua`/`bairro`/`cidade`/`uf` ficavam sempre vazios para qualquer Influenciadora
real, e a tela de Perfil exibia o endereço com pontuação quebrada (achado de QA, 2026-07-29).

Uma única API pública de CEP tem disponibilidade e taxa de erro não desprezíveis. O sistema
legado deste projeto endereçava isso com múltiplas fontes de CEP em cadeia — filosofia que
esta decisão mantém, sem herdar código dele (nunca existiu fisicamente neste repositório).

### Decisão
Criar `portal-backend/src/shared/cep/` como infraestrutura própria de resolução de CEP,
independente do domínio de Perfil/Identidade (que continuam só conhecendo a porta
`ResolvedorDeCep`/`DadosDeEndereco` já existente em `modules/perfil/cep.resolver.ts`):

1. **Strategy + Chain of Responsibility.** `CepProvider` é a interface de uma fonte de CEP
   (`buscar(cep): Promise<EnderecoPostal | null>`); `CepResolver` percorre uma lista ordenada
   de providers, parando no primeiro que resolver. Falha de um provider (timeout, rede,
   "não encontrado") nunca lança — o próprio provider devolve `null`/propaga erro, e
   `CepResolver` decide passar para o próximo. Falha de todos retorna `null` (RN-02,
   degradável), nunca exceção.
2. **Ordem de fallback:** `BrasilAPI → ViaCEP → OpenCEP → AwesomeAPI`
   (`shared/cep/index.ts::criarCepResolverPadrao`). Cada provider é um arquivo isolado em
   `shared/cep/providers/`, com timeout individual (`AbortController`, padrão 3s) e
   conhecimento exclusivo do formato de resposta da sua própria API — nenhum outro ponto do
   sistema conhece nomes de campo como `logradouro`/`street`/`address` ou peculiaridades como
   o `{ erro: true }` do ViaCEP (200 OK) vs. HTTP 404 de BrasilAPI/OpenCEP vs. HTTP 400 da
   AwesomeAPI.
3. **Normalização.** Independentemente de qual provider respondeu, `CepResolver` sempre
   devolve o mesmo modelo canônico (`EnderecoPostal`: `logradouro`, `bairro`, `cidade`, `uf`),
   já passado por `normalizarEndereco` (trim, UF em caixa alta). `modules/perfil/cep.resolver.ts`
   (`ResolvedorDeCepPortal`) é o único ponto que traduz `logradouro` → `rua` (vocabulário do
   domínio de Perfil) — a fronteira entre infraestrutura de CEP e domínio.
4. **Cache.** `CepCache`, em memória (mesma decisão de persistência do resto do Portal hoje,
   ver `START_HERE_NEXT_SESSION.md`), TTL de 30 dias, guarda só resoluções bem-sucedidas —
   uma falha total dos providers não é cacheada, por ser tratada como possivelmente
   transitória.
5. **Extensão futura.** Adicionar um novo provider é criar uma classe `CepProvider` em
   `shared/cep/providers/` e incluí-la na lista de `criarCepResolverPadrao`; remover um
   provider é remover a linha correspondente — nenhum outro arquivo do sistema muda.

### Consequências
- `ResolvedorDeCepEmMemoria` (stub) foi removida; `resolvedorDeCep` (singleton consumido por
  `perfil.service.ts` e `identidade.service.ts`) passa a resolver CEPs reais.
- Cobertura de teste em `shared/cep/**/*.test.ts`: normalização (CEP e endereço), cache (hit,
  expiração por TTL, não-cache de falha total), cada provider isoladamente (mapeamento de
  resposta, "não encontrado", propagação de falha/timeout com `fetch` mockado — nenhum teste
  faz chamada de rede real) e a cadeia completa (fallback entre providers, parar no primeiro
  sucesso, cache evita nova chamada).
- Sem novas dependências de terceiros: usa `fetch` nativo do Node (já disponível na versão
  usada pelo projeto).
- Continua existindo o mesmo tech debt já documentado de persistência 100% em memória — o
  cache de CEP some num restart, sem risco de dado incorreto (só custa uma nova resolução).

---

## ADR-014 — Dia útil de `dataAprovacaoInterna` segue calendário operacional próprio, não classificação jurídica

- **Status:** Aceito.
- **Data:** 2026-07-29.
- **Autor da decisão:** responsável do projeto.
- **Relaciona-se com:** SPEC-009 §10 RN-01 (v1.1), `PORTAL_BRIEFING.md` (tabela de RNs),
  `PORTAL_GLOSSARIO.md` (verbete "Briefing").

### Contexto
RN-01 original (SPEC-009 v1.0, PRD §7 RN-04) considerava só sábado/domingo como dia não
útil no cálculo de `dataAprovacaoInterna` — regra herdada do sistema legado
(`Código.js:317-345`, `calcularDataAprovacao()`), que nunca considerou feriados.

Decisão de negócio do responsável do projeto (2026-07-29): dia não útil passa a ser
**qualquer dia em que a operação da Criativo Dodô esteja paralisada**, explicitamente:
sábados, domingos, feriados nacionais, feriados estaduais aplicáveis à operação, feriados
municipais da cidade-base da operação, e pontos facultativos adotados oficialmente pela
empresa. O critério é **exclusivamente operacional — nunca a classificação jurídica**
(feriado × ponto facultativo): por isso Carnaval e Corpus Christi contam sempre como não
úteis, enquanto outros pontos facultativos só contam quando fizerem parte do calendário
operacional oficial da empresa.

Essa combinação de fontes (nacional + estadual + municipal + institucional) não é uma
classificação legal única e não existe como uma única API pública gratuita e confiável —
diferente do caso de CEP (ADR-013), onde múltiplas APIs públicas cobrem o mesmo dado.

### Decisão
1. **Abstração:** `ProvedorDeCalendarioOperacional` (interface análoga ao `CepProvider` do
   ADR-013): `ehDiaUtil(data: Date): boolean` — **síncrona**, já que nenhuma das quatro
   fontes (ponto 2) faz I/O. Nenhuma regra de domínio (`calcularDataAprovacaoInterna`)
   conhece a origem de cada fonte — só consome a resposta binária "é dia útil?".
2. **Composição interna (Strategy, não Chain — todas as fontes são consultadas e unidas,
   não há "parar no primeiro que responder"):**
   - **Nacional (fixo + móvel):** calculado localmente, sem dependência externa — datas
     fixas (1/1, 21/4, 1/5, 7/9, 12/10, 2/11, 15/11, 20/11, 25/12) e datas móveis derivadas
     do algoritmo da Páscoa (Sexta-feira Santa, Carnaval segunda+terça, Corpus Christi).
     Determinístico, testável, sem chamada de rede — e, principalmente, **não depende da
     classificação de nenhuma API de terceiro** (coerente com "critério operacional, não
     jurídico": Carnaval e Corpus Christi entram nesta lista incondicionalmente, nunca
     como pergunta a uma fonte externa).
   - **Estadual aplicável à operação:** lista configurável por estado. Cidade-base definida
     pelo responsável do projeto em 2026-07-29: **Nova Friburgo/RJ** — configuração padrão
     inclui hoje só o feriado de 23/04 (Dia de São Jorge, feriado estadual do Rio de
     Janeiro); demais datas estaduais ficam para revisão futura se necessário.
   - **Municipal da cidade-base:** lista configurável por cidade — **a data de
     aniversário/emancipação de Nova Friburgo não foi confirmada** e a lista nasce vazia
     (ver Pendência abaixo); não bloqueia as demais camadas.
   - **Pontos facultativos institucionais:** lista própria, mantida manualmente pela
     Criativo Dodô (não vem de nenhuma fonte pública) — vazia por padrão até ser
     populada.
3. **Sem novo fornecedor externo:** ao contrário do rascunho inicial desta decisão (que
   cogitava reaproveitar BrasilAPI, já em uso para CEP — ADR-013), a versão final não
   depende de nenhuma API de terceiro: o critério é operacional/institucional, não uma
   classificação pública, e as quatro fontes acima cobrem o requisito sem chamada de rede.
4. **Extensão futura:** adicionar uma quinta fonte (ex.: calendário de outra unidade/cidade,
   se a operação se expandir) é estender a composição interna do provider — a interface
   consumida pelo domínio não muda.

### Ruptura deliberada com a heurística do sistema legado (confirmada pelo responsável do projeto, 2026-07-29)
A regra antiga (PRD §7 RN-04) tratava especificamente "cair numa sexta-feira" como gatilho
de ajuste (+3 dias, para segunda), mesmo sexta sendo dia útil comum — uma heurística
implícita (provável intenção: "garantir folga antes do fim de semana"), nunca formalizada
como regra de negócio própria nem como conceito de dia não útil.

**Decisão oficial do projeto:** essa heurística não é preservada. O Calendário Operacional
(`ProvedorDeCalendarioOperacional`) passa a ser a **única fonte da verdade** para dia útil,
em qualquer cálculo do Portal. Consequência direta:

- Sexta-feira comum é dia útil — nunca dispara ajuste por si só.
- Não existe ajuste automático "por ser sexta-feira" ou qualquer outro dia da semana
  específico fora de sábado/domingo.
- Somente dias marcados como não operacionais no Calendário Operacional (fim de semana,
  feriado nacional/estadual/municipal aplicável, ponto facultativo institucional adotado)
  são ignorados no cálculo.
- **Princípio permanente para todo o projeto:** qualquer exceção futura ao cálculo de dia
  útil deve ser registrada como regra de negócio explícita (SPEC + ADR, se arquitetural) —
  nunca reintroduzida como heurística implícita embutida em código.

### Pendências (declaradas, não presumidas — ADR-003)
- **Escopo inicial de implementação (decisão do responsável, 2026-07-29):** apenas feriados
  nacionais + feriados estaduais do RJ + mecanismo configurável de Calendário Operacional.
  Feriados municipais de Nova Friburgo ficam para quando o calendário operacional oficial da
  empresa for levantado — lista nasce vazia, não bloqueia as demais camadas (SPEC-009 §21,
  item D-02).
- **Lista de pontos facultativos institucionais** (SPEC-009 §21, item D-03) começa vazia;
  cadastro é responsabilidade operacional do Administrador, não uma lista pré-populada por
  este ADR.

### Consequências
- `calcularDataAprovacaoInterna` deixa de ser uma função pura sem dependências — passa a
  receber um `ProvedorDeCalendarioOperacional` por injeção (parâmetro com valor padrão
  apontando para o calendário operacional real), testável com um provider fake em memória,
  sem qualquer chamada de rede em teste. Permanece **síncrona** (ver ponto 1) — nenhum
  ponto de chamada precisou virar `async`.
- Sem novo custo, sem novo vendor, sem vendor lock-in — consistente com os critérios de
  simplicidade e baixo custo já aplicados no restante do projeto.
- Implementado em `portal-backend/src/shared/calendarioOperacional/` (mesmo padrão de
  `shared/cep/`): `pascoa.ts` (algoritmo de Gauss/Meeus, validado contra datas de Páscoa
  conhecidas 2020-2027), `feriadosNacionais.ts`, `configuracaoPadrao.ts` (Nova Friburgo/RJ),
  `provider.ts` (composição das 4 camadas) — 19 testes próprios, mais 9 testes atualizados
  em `briefing.calculadoraAprovacao.test.ts` cobrindo os casos de borda de SPEC-009 §16
  (CB-01 a CB-06).

---

## ADR-015 — Persistência real: PostgreSQL substitui os repositórios em memória (Fase 2 do Plano Mestre)

- **Status:** Aceito.
- **Data:** 2026-07-29.
- **Autor da decisão:** responsável do projeto (Fase 2 aprovada em `criativododo-interno/PLANO_MESTRE_IMPLEMENTACAO_PORTAL_DODO.md`).
- **Relaciona-se com:** `docs/handoff/PROJECT_STATUS.md` (dívida #3 — persistência em
  memória, P0 antes de go-live), todos os módulos de domínio do backend.

### Contexto
`portal-backend/` operava com persistência 100% em memória (`*RepositorioEmMemoria`, array
ou `Map` por módulo) — decisão deliberada até aqui (não uma lacuna), mas bloqueante para
qualquer ambiente real: reiniciar o processo apagava todo dado. PostgreSQL já era
infraestrutura confirmada do projeto (VPS Ubuntu), só não usada em código ainda.

### Decisão
1. **Sem ORM.** Acesso via `pg` (node-postgres) direto, SQL parametrizado manual — mesma
   disciplina de simplicidade já aplicada em `shared/cep/` e `shared/calendarioOperacional/`
   (nenhuma dependência pesada onde uma pequena resolve).
2. **Schema espelha fielmente os `*.types.ts` existentes** (`migrations/0001_init.sql`) —
   nenhum campo novo, nenhuma regra de negócio nova. Colunas em snake_case; os repositórios
   fazem o mapeamento para o camelCase dos tipos via alias na própria consulta SQL
   (`SELECT parceira_id AS "parceiraId", ...`). Objetos aninhados (`condicaoComercial`,
   `endereco`) viram colunas `jsonb` — são sempre lidos/escritos como unidade, nunca
   consultados por subcampo no código atual.
3. **Migração sem ferramenta externa:** `scripts/migrate.ts`, runner mínimo que aplica, em
   ordem, os `.sql` de `migrations/` ainda não registrados numa tabela de controle
   (`schema_migrations`) — pequeno o bastante para não justificar uma dependência dedicada.
4. **Repositórios em memória preservados, não removidos.** Cada módulo mantém sua classe
   `*RepositorioEmMemoria` (agora não-exportada, uso interno do arquivo) — a suíte de
   testes unitários (`*.service.test.ts`, `*.repository.test.ts`) que já instanciava essas
   classes diretamente com fixtures isoladas continua funcionando sem alteração. Só o
   **singleton exportado** de cada módulo passou a apontar para a nova
   `*RepositorioPostgres`, então todo o resto do sistema (rotas, `app` do Express, testes de
   contrato HTTP da Fase 1) passa a rodar contra Postgres real sem precisar saber disso.
5. **Sem constraint nova de regra de negócio.** Deliberadamente não foram adicionadas
   constraints de unicidade (ex.: Briefing por chave natural, Obrigação Mensal única por
   competência) além das chaves primárias já implícitas nos ids — essas regras já são
   verificadas pelo `*.service.ts` antes de qualquer escrita; adicionar constraint
   duplicada no banco arriscaria um novo modo de falha (erro de constraint do Postgres em
   vez da resposta de negócio já testada) fora do escopo desta fase.
6. **Seed de desenvolvimento** (`scripts/seed.ts`) — mesma trava de `env.parceiraSeed`
   (inerte em produção), agora com `INSERT ... ON CONFLICT DO NOTHING` para ser
   idempotente entre execuções.
7. **Banco de teste isolado do de desenvolvimento:** `.env.test` (`DATABASE_URL` própria,
   nunca commitado) sobrepõe `.env` quando `NODE_ENV=test` (Vitest já define isso
   automaticamente). `globalSetup` do Vitest (`scripts/testGlobalSetup.ts`) faz `TRUNCATE`
   de todas as tabelas de domínio uma única vez antes de toda a suíte.
8. **Suíte roda com arquivos sequenciais (`fileParallelism: false`).** Muitos
   `*.service.test.ts` já existentes usam o singleton do repositório diretamente (não uma
   instância isolada) — antes seguro, porque cada arquivo de teste reimportava um `Map` em
   memória vazio; com Postgres real (recurso verdadeiramente compartilhado), paralelismo
   entre arquivos arriscaria corrida. Sequencial elimina o risco sem exigir reescrever a
   suíte existente.

### Consequências
- Reiniciar o processo do backend não apaga mais dado — validado por smoke test manual
  (criar Parceira via API → matar processo → subir de novo → Parceira ainda presente).
- Nenhuma regra de negócio dos `*.service.ts` foi alterada — só a implementação dos
  `*.repository.ts`.
- Suíte completa (36 arquivos, 222 testes) validada 3× consecutivas contra Postgres real,
  sem nenhuma asserção alterada.
- `numeric` do Postgres retorna como `string` no `node-postgres` (evita perda de precisão) —
  `ObrigacaoRepositorioPostgres` converte para `number` na leitura, mantendo o tipo já
  declarado em `ObrigacaoFinanceira.valor`.
- Dependências novas: `pg`, `@types/pg` (dev). Nenhuma outra.
- Ambiente local de desenvolvimento usa PostgreSQL 16 via Homebrew (`brew services start
  postgresql@16`); produção usa a instância já confirmada na VPS Ubuntu — nenhuma mudança de
  infraestrutura de produção decidida por este ADR além de apontar `DATABASE_URL` para ela.

---

## ADR-016 — Colaboração Mensal como agregado formal e canônico do domínio (Fase 3 do Plano Mestre)

- **Status:** Aceito.
- **Data:** 2026-07-29.
- **Autor da decisão:** responsável do projeto (Fase 3 aprovada em
  `criativododo-interno/PLANO_MESTRE_IMPLEMENTACAO_PORTAL_DODO.md`).
- **Relaciona-se com:** `knowledge/Historico/CONTRATO_SOBERANO.md` §4 e §6.3 (linguagem
  ubíqua `Colaboracao Mensal`/`Compilador do Mes`; fronteira por competência), SPEC-005,
  ADR-006 (vocabulário de domínio), ADR-009 (gate de elegibilidade de pagamento), ADR-014
  (Calendário Operacional), ADR-015 (persistência PostgreSQL), `docs/handoff/
  PROJECT_STATUS.md` ("Decisões de produto pendentes" e "Fluxos incompletos").

### Contexto

`mesReferencia` é hoje um campo livre, preenchido manualmente em cada Entrega/Briefing/
Obrigação Financeira — a associação entre esses registros e uma competência existe só por
convenção de chave natural (`parceiraId` + `mesReferencia` [+ `formato`]), nunca como
entidade própria. Isso é a maior lacuna estrutural identificada nos handoffs de 2026-07-27
e é registrado como pendência explícita em `PROJECT_STATUS.md` ("Colaboração Mensal (SPEC-005)
não existe como agregado formal").

O Contrato Soberano já antecipava esse conceito antes mesmo de existir código de Portal:
`Colaboracao Mensal` está na linguagem ubíqua oficial (§4) e é descrita como "fronteira por
competência" (§6.3, "Parceira x MesReferencia"); `Compilador do Mes` também já está na
linguagem ubíqua (§4), embora nunca tenha sido implementado. Este ADR não introduz conceito
novo de domínio — apenas decide **como e quando** ele é materializado em código, o que era a
decisão de produto pendente que bloqueava a Fase 3 (gatilho de compilação).

Pré-requisito técnico já satisfeito: Fase 2 (ADR-015) trouxe PostgreSQL real, tornando
viável um relacionamento por FK verdadeira em vez de convenção de chave natural solta.

### Decisão

#### 1. Colaboração Mensal torna-se a entidade canônica do domínio

Novo módulo de domínio `colaboracao-mensal`, seguindo as mesmas 4 camadas de todos os
módulos existentes (`*.types.ts` / `*.repository.ts` / `*.service.ts` / `*.routes.ts`).
Entidade `ColaboracaoMensal`: `parceiraId`, `mesReferencia`, `condicaoComercial` (snapshot —
ver item 4), `status`, `criadoPor`, `criadoEm`, `quantidadeRegistrosGerados`.

A partir desta fase, `ColaboracaoMensal` é a **fonte canônica** de agrupamento por
competência: Entrega, Briefing e Obrigação Financeira passam a se relacionar a ela por FK
real (`colaboracaoMensalId`), não apenas por coincidirem em `parceiraId`+`mesReferencia`. A
convenção de chave natural não é abandonada — continua sendo a chave de negócio usada para
localizar/gerar a `ColaboracaoMensal` correspondente — mas deixa de ser o único vínculo
estrutural entre os registros de uma competência.

#### 2. Gatilho de compilação: ação manual do Administrador (sem automação nesta fase)

A criação de uma competência (`ColaboracaoMensal` para o conjunto de Parceiras `ATIVA`s
elegíveis) ocorre **exclusivamente por ação manual de um Administrador autenticado**, via
endpoint dedicado. Regras de negócio da operação de compilação:

- **Uma competência por mês.** Não é possível compilar duas vezes o mesmo `mesReferencia`
  para a mesma Parceira — tentativa de recompilar uma competência já existente não cria
  duplicata (ver idempotência abaixo) nem sobrescreve o snapshot já gravado.
- **Idempotente.** Executar a operação de compilação mais de uma vez para a mesma
  competência não gera registros duplicados nem altera o snapshot já materializado na
  primeira execução.
- **Snapshot oficial da competência.** No instante da compilação, a Condição Comercial
  vigente de cada Parceira `ATIVA` é congelada dentro da `ColaboracaoMensal` gerada (ver
  item 4) — a competência criada é, a partir desse momento, o registro oficial e imutável
  daquele mês para aquelas Parceiras.
- **Escopo de participação:** todas as Parceiras com status `ATIVA` **no momento da
  execução da compilação** participam. Uma Parceira que se torna `ATIVA` depois da
  compilação de um mês não entra retroativamente nessa competência já compilada — só
  participa da próxima compilação, a menos que uma intervenção administrativa explícita e
  futura (fora do escopo desta fase) decida incluí-la.
- **Auditoria obrigatória.** Toda execução da operação registra, via `registrarAuditoria`
  (mesmo middleware transversal já aplicado a toda rota autenticada — `portal-backend/src/
  middleware/auditoria.ts`): identidade do Administrador executor, data/hora, e a quantidade
  de registros gerados (Parceiras compiladas nessa execução).
- **Sem cron, sem automação, sem virada de mês automática nesta fase.** Não existe job
  agendado. A automação do gatilho (se algum dia vier a existir) é decisão de produto
  separada, fora do escopo deste ADR e desta fase.

#### 3. Calendário Operacional continua sendo a única fonte de dia útil (reafirmação do ADR-014)

Nenhum cálculo de data introduzido por esta fase (ex.: referência ao mês corrente para
efeito de validação da competência a compilar) cria heurística própria de dia da semana.
Onde qualquer cálculo desta fase precisar determinar dia útil, ele reutiliza
`ProvedorDeCalendarioOperacional` (`portal-backend/src/shared/calendarioOperacional/`) — nunca
reintroduz tratamento especial para sexta-feira ou qualquer outro dia específico fora do que
o Calendário Operacional já define. Isso reafirma explicitamente, no contexto desta fase, o
princípio permanente já registrado no ADR-014: exceção ao cálculo de dia útil é sempre regra
de negócio explícita, nunca heurística implícita embutida em código.

#### 4. Condição Comercial: snapshot imutável, nunca referência viva

No momento da compilação, os valores efetivos da Condição Comercial vigente de cada Parceira
são **copiados** para dentro da `ColaboracaoMensal` gerada (campo `condicaoComercial`,
`jsonb`, mesmo padrão de objeto aninhado já usado em `Endereco`/`condicaoComercial` desde o
ADR-015). A partir da compilação:

- A `ColaboracaoMensal` já compilada é um registro histórico **imutável** — alterações
  futuras na Condição Comercial cadastrada na `Parceira` **não** propagam, nem automática
  nem retroativamente, para competências já compiladas.
- A `Parceira` continua sendo a fonte única de verdade da Condição Comercial **apenas para
  competências futuras** (ainda não compiladas).
- Toda leitura de relatório, pagamento, auditoria ou histórico referente a uma competência
  já compilada usa exclusivamente o snapshot gravado na própria `ColaboracaoMensal` — nunca
  faz join para ler a Condição Comercial atual da Parceira.
- Correção excepcional de um snapshot já gravado exige processo administrativo explícito
  (fora do escopo desta fase definir esse processo em detalhe) — nunca é feita por
  atualização automática decorrente de uma edição cadastral da Parceira.

#### 5. Migração retroativa do dado histórico

Script de migração de dados (não uma migration de schema — ver item "Impactos
arquiteturais" para a distinção), executado uma única vez por ambiente, que:

- Cria uma `ColaboracaoMensal` para cada combinação única `parceiraId`+`mesReferencia` já
  existente no histórico (Entregas/Briefings/Obrigações Financeiras criados manualmente nas
  fases anteriores).
- Vincula automaticamente todos os registros históricos correspondentes
  (`colaboracaoMensalId`) à `ColaboracaoMensal` recém-criada ou já existente para aquela
  combinação.
- É **idempotente**: reexecutar o script não cria `ColaboracaoMensal` duplicada nem
  revincula registros já vinculados.
- Roda **dentro de transação** (o driver `pg` já em uso desde o ADR-015 suporta
  transação explícita via `BEGIN`/`COMMIT`/`ROLLBACK` manual, sem necessidade de ORM).
- **Preserva integralmente** os dados históricos — nenhuma Entrega, Briefing ou Obrigação
  Financeira tem qualquer campo de negócio alterado; a migração só adiciona o vínculo novo.
- Para o snapshot de Condição Comercial dos registros históricos (que não foram compilados
  por um Administrador, e portanto não têm um momento de compilação real): o snapshot é
  reconstruído a partir da Condição Comercial da Parceira **no momento em que o script de
  migração roda** — é a melhor aproximação disponível para dado que nunca teve um evento de
  compilação real, e é uma limitação conhecida, não uma regra de negócio nova (ver
  "Pendências" abaixo).
- Ao final, produz um relatório com: quantidade de `ColaboracaoMensal` criadas, quantidade
  de registros vinculados (por módulo), e inconsistências encontradas (ex.: registro
  histórico cujo `mesReferencia` não segue o formato esperado) — sem interromper a migração
  por uma inconsistência isolada, apenas reportando-a.

#### 6. Responsabilidades, ciclo de vida e invariantes

**Responsabilidades da `ColaboracaoMensal`:**
- É a fronteira formal de competência (Parceira × MesReferencia) — responsabilidade que o
  Contrato Soberano já atribuía a este conceito (§6.3).
- É a única detentora do snapshot de Condição Comercial de uma competência já compilada.
- É o destino do vínculo (`colaboracaoMensalId`) de Entrega, Briefing e Obrigação
  Financeira — mas **não** controla nem participa do ciclo de estado interno de nenhum
  desses três (ver responsabilidades por módulo abaixo).

**Ciclo de vida da `ColaboracaoMensal`:**
```
(inexistente) → COMPILADA (snapshot gravado, imutável)
```
Não há, nesta fase, nenhum estado intermediário nem transição de volta — uma vez compilada,
uma competência não é "descompilada"; correção excepcional é processo administrativo à
parte (item 4), não uma transição de estado modelada.

**Invariantes do domínio:**
- Não existem duas `ColaboracaoMensal` para a mesma combinação `parceiraId`+`mesReferencia`
  (unicidade — reforçada por constraint de banco, ver "Impactos arquiteturais").
- Uma `ColaboracaoMensal` compilada nunca tem seu `condicaoComercial` sobrescrito por
  processo automático.
- Todo registro de Entrega/Briefing/Obrigação Financeira criado **a partir desta fase** para
  uma competência que já tem `ColaboracaoMensal` correspondente nasce vinculado a ela.

**Regras de integridade:**
- `colaboracaoMensalId` é FK real (Postgres) nas três tabelas relacionadas, com `ON DELETE
  RESTRICT` (nenhuma exclusão de `ColaboracaoMensal` que tenha registros vinculados —
  consistente com "Não apagar dados" das restrições permanentes do projeto).
- Constraint de unicidade `(parceira_id, mes_referencia)` na tabela `colaboracoes_mensais`
  garante a invariante de "uma competência por mês" também no nível de banco, não só no
  `service` — mesma disciplina de defesa em profundidade já usada para as chaves primárias
  desde o ADR-015, mas aqui justificada porque a regra de unicidade é o núcleo da decisão de
  idempotência do item 2, não um detalhe de implementação a adicionar depois.

**Responsabilidades de cada módulo existente (inalteradas fora do vínculo novo):**
- `conteudo` (Entrega), `briefing`, `financeiro` (Obrigação Financeira): continuam donos
  exclusivos do próprio ciclo de estado (`AGUARDANDO_MATERIAL→EM_REVISAO→APROVADO→
  PUBLICADO`; `EM_ABERTO→APROVADO→PAGO`) e das próprias regras de negócio — a única mudança
  desta fase é ganhar uma referência (`colaboracaoMensalId`) à competência formal a que
  pertencem.
- Gate de elegibilidade de pagamento (ADR-009) não muda de comportamento: continua
  verificando o estado de todas as Entregas da competência, agora localizadas por
  `colaboracaoMensalId` em vez de por `parceiraId`+`mesReferencia` solto — mudança de
  implementação de acesso ao dado, não de regra de negócio.

### O que NÃO faz parte desta fase

- Nenhum dos 7 motores de `OTIMIZAÇÕES DODÔ.mk` (Documentos, Comunicação, Briefings, Envios,
  Planejamento Editorial, Armazenamento/Workspace Provisioning, Endurecimento transversal) —
  vêm depois, apoiados neste agregado, conforme já delimitado no Plano Mestre.
- Automação do gatilho de compilação (cron, virada de mês automática) — decisão de produto
  separada, não tomada por este ADR.
- Qualquer automação de lançamento financeiro além do necessário para materializar a
  Colaboração Mensal (ex.: régua de cobrança).
- As demais decisões de produto pendentes listadas em `PROJECT_STATUS.md` que não bloqueiam
  esta fase e não foram tratadas aqui: "Reprovar" Entrega (SPEC-012 não documenta esse
  estado); unicidade de `chave`/e-mail/CNPJ em Parceira; migração de `Endereco` para
  `Parceira`. Nenhuma delas é decidida ou antecipada por este ADR.
- Processo administrativo detalhado de correção excepcional de um snapshot já compilado
  (mencionado no item 4 como necessidade futura, não especificado aqui).

### Riscos conhecidos

- **Migração retroativa toca três tabelas de domínio simultaneamente** sobre dado real em
  PostgreSQL — mitigado por transação explícita, idempotência e execução única controlada
  por ambiente (não automática, não repetida sem necessidade).
- **Condição Comercial incompleta ou inconsistente em dado legado** pode gerar um snapshot
  incompleto na migração retroativa — o script reporta a inconsistência (item 5) em vez de
  presumir um valor; decisão sobre como tratar cada caso reportado é do responsável do
  projeto, não do código.
- **Registro órfão pós-migração**, se a migração falhar parcialmente fora de uma transação —
  mitigado por rodar a migração de dados inteira dentro de uma única transação por
  execução.
- **Violação de idempotência se a constraint de unicidade de banco não for criada junto com
  a migration de schema** — por isso a constraint (item 6) é parte obrigatória da migration
  de schema desta fase, não um follow-up.
- **Regressão silenciosa no gate de pagamento (ADR-009)** se a mudança de "acesso por chave
  natural" para "acesso por FK" não for coberta por teste de regressão dedicado — mitigado
  pela exigência de teste específico (ver Plano de Execução da Fase 3).

### Impactos arquiteturais

- Novo módulo de domínio `portal-backend/src/modules/colaboracao-mensal/`, seguindo o padrão
  de 4 camadas já estabelecido.
- Nova tabela `colaboracoes_mensais` (migration de **schema**, `portal-backend/migrations/
  0002_colaboracao_mensal.sql`, aplicada pelo runner já existente — `scripts/migrate.ts`) e
  nova coluna `colaboracao_mensal_id` (FK) nas tabelas `entregas`, `briefings` e
  `obrigacoes_financeiras`.
- Script de migração de **dados** (retroativo, item 5) é artefato distinto da migration de
  schema — roda uma vez por ambiente, não faz parte do pipeline automático de
  `scripts/migrate.ts` (mesma separação entre "aplicar schema" e "popular/transformar dado"
  que o projeto já usa entre `migrate.ts` e `seed.ts`, desde o ADR-015).
- Endpoints HTTP administrativos implementados em `portal-backend/src/modules/
  colaboracao-mensal/admin.routes.ts` — `POST /admin/colaboracoes-mensais/compilar`,
  `GET /admin/colaboracoes-mensais` (histórico por Parceira) e
  `GET /admin/colaboracoes-mensais/:parceiraId/:mesReferencia` (consulta pontual) —
  registrados em `portal-backend/src/routes/api.routes.ts` sob `requireAdmin`, reaproveitando
  a auditoria transversal já existente (`middleware/auditoria.ts`). Controllers finos — toda
  regra permanece em `colaboracaoMensal.service.ts`.
- Nenhuma mudança na infraestrutura de produção além da nova migration de schema — mesma
  instância PostgreSQL já em uso desde o ADR-015.

### Estratégia de rollback da migration

Dado que o projeto não usa ORM nem ferramenta de migration com suporte nativo a `down`
automático (ADR-015 — runner mínimo que só aplica `.sql` novos em ordem), o rollback desta
fase segue a mesma disciplina de simplicidade, em duas camadas:

1. **Rollback de schema:** a migration `0002_colaboracao_mensal.sql` só faz alterações
   aditivas (nova tabela, novas colunas FK nullable até a migração de dados terminar).
   Um script de reversão correspondente (`0002_colaboracao_mensal_rollback.sql`) é mantido
   junto à migration, mas **não é executado automaticamente pelo runner** — é invocado
   manualmente, apenas se necessário, e remove as colunas novas e a tabela
   `colaboracoes_mensais` (seguro porque, até a migração de dados rodar, nenhuma outra
   tabela depende delas).
2. **Rollback de dados:** o script de migração retroativa (item 5) é idempotente e sua
   reversão (se necessária) é um script irmão, também não automático, que zera
   `colaboracao_mensal_id` nas três tabelas afetadas e esvazia `colaboracoes_mensais` — sem
   apagar nenhum dado das tabelas originais (`entregas`, `briefings`,
   `obrigacoes_financeiras`), em conformidade com a restrição permanente "Não apagar dados".
3. **Pré-condição obrigatória antes de rodar a migração de dados em qualquer ambiente com
   dado real:** backup (`pg_dump`) do banco correspondente — exigência explícita desta fase,
   não deixada implícita, dado que esta é a primeira migração de dados retroativa (em
   oposição a apenas de schema) desde a adoção do Postgres real (ADR-015).

### Consequências

- `ColaboracaoMensal` passa a ser a entidade de referência para qualquer relatório,
  auditoria ou processo futuro que precise agrupar por competência — os 7 motores futuros do
  Plano Mestre são construídos sobre este agregado, não sobre a convenção de chave natural
  solta que existia até aqui.
- Nenhuma regra de negócio do ciclo de estado de Entrega, Briefing ou Obrigação Financeira
  muda — apenas a forma como esses registros se relacionam à sua competência.
- O gate de pagamento (ADR-009) e o Calendário Operacional (ADR-014) permanecem exatamente
  como definidos — este ADR os reafirma, não os reabre.
- Toda automação futura do gatilho de compilação (cron, virada de mês) exigirá uma nova
  decisão de produto e, se alterar arquitetura, um novo ADR — não está pré-aprovada por este
  documento.

### Quadro-resumo

| Decisão tomada | Alternativas descartadas | Justificativa | Impacto esperado na arquitetura |
|---|---|---|---|
| `ColaboracaoMensal` como entidade canônica, com FK real ligando Entrega/Briefing/Obrigação Financeira | Manter apenas a convenção de chave natural (`parceiraId`+`mesReferencia`), sem agregado formal | Fecha a lacuna estrutural repetidamente registrada nos handoffs; é pré-requisito documental (Contrato Soberano §6.3) e técnico (base para os 7 motores futuros do Plano Mestre) | Novo módulo de domínio; nova tabela; FK real substituindo convenção implícita nas 3 tabelas relacionadas |
| Gatilho de compilação: ação manual do Administrador, sem automação | Cron automático; virada de mês calendário automática | Permite validar o fluxo de compilação com uso real antes de qualquer automação; auditável por ação humana explícita; evita compilar competência incorreta sem supervisão nesta fase inicial | Endpoint administrativo novo; sem job agendado; auditoria obrigatória por execução |
| Condição Comercial congelada por snapshot no momento da compilação | Referência viva à Condição Comercial atual da Parceira | Garante histórico imutável e auditável; pagamentos e relatórios de competências já compiladas não podem mudar retroativamente por uma edição cadastral | Coluna `jsonb` de snapshot na `ColaboracaoMensal`; nenhuma leitura histórica faz join com o cadastro atual da Parceira |
| Migração retroativa automática e idempotente de todo o histórico | FK opcional/nullable permanente, aplicando o vínculo só a dado novo | Evita dois regimes de dado (com e sem `ColaboracaoMensal`) convivendo indefinidamente; `ColaboracaoMensal` só é de fato canônica se cobrir também o histórico | Script de migração de dados transacional e idempotente; relatório de migração; FK torna-se ponto de referência único assim que a migração roda |
| Reafirmação do Calendário Operacional (ADR-014) como única fonte de dia útil, sem heurística nova nesta fase | Introduzir regra própria de data para a operação de compilação | Evita reintroduzir heurística implícita — princípio permanente já registrado no ADR-014 | Nenhuma mudança no `ProvedorDeCalendarioOperacional`; reaproveitado sem extensão |
| Rollback em duas camadas (schema aditivo + script de reversão manual, não automático) com backup obrigatório antes da migração de dados | Ferramenta de migration com suporte nativo a `down` | Mantém a mesma disciplina de simplicidade do projeto (sem ORM, sem dependência nova) já usada desde o ADR-015; suficiente porque as alterações de schema desta fase são aditivas | Dois scripts SQL adicionais (rollback de schema e de dados), nenhum executado automaticamente pelo runner existente |

---

## ADR-017 — OAuth dedicado do Google Drive: conta única administrada, refresh token de longa duração (início da Fase 4 do Plano Mestre)

- **Status:** Aceito.
- **Data:** 2026-07-30.
- **Autor da decisão:** responsável do projeto (início da Fase 4 aprovado nesta data, via
  `criativododo-interno/PLANO_MESTRE_IMPLEMENTACAO_PORTAL_DODO.md`).
- **Relaciona-se com:** ADR-007 (OAuth de login, Authorization Code + PKCE), ADR-008 (ator
  Marca fora do MVP, sistema single-tenant), PORTAL_ARQUITETURA.md §6 (Google Drive/S3/disco
  como opções de armazenamento de material).

### Contexto

A Fase 4 do Plano Mestre (Armazenamento + Workspace Provisioning) precisa de acesso
programático a uma conta do Google Drive para, em fases seguintes, provisionar pastas de
trabalho por Parceira/competência. Este ADR cobre **apenas** o provisionamento do OAuth
necessário para esse acesso — não a funcionalidade de Storage em si (criação de
pastas por Parceira, upload de material via Drive), que permanece fora de escopo até
decisão de produto e ADR próprios.

Já existe, desde o ADR-007, um OAuth Client Google para login federado da Parceira
(Authorization Code + PKCE, escopo `openid`/`email`/`profile`). Esse client **não** é
reaproveitável aqui: é do tipo Web App vinculado ao redirect de login, e delegação por
usuário final não se aplica a este caso — o sistema é single-tenant (ADR-008) e o Drive
provisionado pertence à operação do Criativo Dodô, não a cada Parceira individualmente.
Por isso, um segundo OAuth Client, dedicado, é necessário — não é duplicação nem resíduo
de configuração antiga.

### Decisão

1. **Um segundo OAuth Client, dedicado exclusivamente ao Google Drive**, distinto do client
   de login (ADR-007), provisionado no mesmo projeto Google Cloud (`criativo-dodo`). Escopo
   único: `https://www.googleapis.com/auth/drive.file` (não sensível, não exige verificação
   do Google) — nenhum escopo mais amplo é usado.
2. **Modelo de conta única administrada**, não delegação por usuário: o consentimento OAuth
   é concedido uma única vez por um Administrador, contra uma conta Google Drive que
   pertence à operação do Criativo Dodô (não a uma Parceira individual) — consistente com o
   sistema ser single-tenant (ADR-008).
3. **Refresh token de longa duração armazenado como variável de ambiente**
   (`GOOGLE_DRIVE_CLIENT_ID`/`GOOGLE_DRIVE_CLIENT_SECRET`/`GOOGLE_DRIVE_REFRESH_TOKEN`),
   mesmo padrão de segredo de infraestrutura já usado para `GOOGLE_CLIENT_SECRET`/
   `SESSION_SECRET` — nunca commitado (`.env` já coberto por `.gitignore`). Diferente do
   login (ADR-007), não há troca de Authorization Code em tempo de requisição: o access
   token é obtido sob demanda a partir do refresh token já provisionado, sem fluxo de
   consentimento interativo no caminho de execução normal da aplicação.
4. **Sem biblioteca cliente nova.** A troca refresh-token→access-token e as chamadas à Drive
   API usam `fetch` nativo (Node 22+, já em uso no projeto), evitando adicionar
   `googleapis`/`google-auth-library` como dependência para o que hoje é só validação de
   conectividade — se a Storage em si vier a precisar de mais superfície da API, a decisão de
   adotar uma biblioteca cliente é reavaliada nesse momento, não antecipada aqui.
5. **Escopo físico desta fase:** módulo `portal-backend/src/shared/googleDrive/` (helper de
   obtenção de access token) e script de validação `portal-backend/scripts/
   testarOAuthGoogleDrive.ts` (conectividade + prova de escrita sob `drive.file`, sem rota
   HTTP permanente, sem persistência de domínio). Nenhuma rota, service ou regra de negócio
   de Storage é criada por este ADR.

### Consequências

- O client de login (ADR-007) permanece intocado — nenhuma correção deste ADR envolve trocar
  ou remover o client de login existente.
- Fases seguintes de Storage (provisionamento de pasta por Parceira/competência, upload via
  Drive) reaproveitam o helper de access token deste ADR, mas exigem decisão de produto e
  ADR próprios antes de qualquer código de domínio.
- Revogação ou expiração do refresh token administrado exige nova concessão manual de
  consentimento por um Administrador — não há fluxo automático de re-consentimento.

### Quadro-resumo

| Decisão tomada | Alternativas descartadas | Justificativa | Impacto esperado na arquitetura |
|---|---|---|---|
| Segundo OAuth Client dedicado ao Drive, distinto do client de login | Reaproveitar o client de login (ADR-007) para também acessar o Drive | Propósitos e modelos de concessão diferentes (login por usuário via PKCE vs. conta única administrada); evita acoplar renovação/escopo de um ao outro | Duas credenciais Google distintas coexistindo por design, não por resíduo |
| Conta única administrada (não delegação por Parceira) | OAuth por Parceira, cada uma autorizando seu próprio Drive | Sistema é single-tenant (ADR-008); simplicidade operacional; nenhuma Parceira interage com o provisionamento de Storage | Um único refresh token para toda a operação, não um por Parceira |
| Refresh token de longa duração via variável de ambiente | Fluxo de consentimento interativo a cada acesso | Acesso é server-to-server, sem usuário final no caminho; consistente com o padrão já usado para outros segredos de infraestrutura | Renovação de access token é chamada de rede simples, sem UI |
| `fetch` nativo em vez de `googleapis`/`google-auth-library` | Adotar biblioteca cliente oficial do Google já nesta fase | Escopo desta fase é só validar conectividade OAuth, não construir a Storage inteira; evita dependência nova para uso ainda mínimo | Nenhuma dependência nova no `package.json` nesta fase |

---

## ADR-018 — Memória operacional de sessão em repositório Git privado separado

- **Status:** Aceito.
- **Data:** 2026-07-30.
- **Relaciona-se com:** ADR-003 (não inventar requisito), ADR-016/017 (registro de decisões
  e continuidade entre sessões).

### Contexto

O estado operacional vinha sendo mantido por handoffs extensos dentro do repositório da
aplicação. Isso repete contexto, mistura histórico com estado vigente e torna a retomada de
uma sessão dependente de leitura manual de múltiplos documentos. Esse material não compõe a
aplicação, nem deve seguir para deploy ou VPS.

### Decisão

1. O estado operacional passa a viver no repositório Git privado
   `criativododo/criativododo-memory`, clonado como diretório irmão do repositório da
   aplicação por padrão.
2. O repositório da aplicação versiona apenas o kit genérico em `.claude/session-memory/` e
   as skills `/inicio`, `/fim`, `/status`, `/journal`, `/roadmap`, `/check` e `/release`.
   O kit não integra build, runtime ou deploy da aplicação.
3. `/inicio <objetivo>` sincroniza com `pull --ff-only`, registra baseline Git inclusive em
   árvore de trabalho pré-existente e apresenta estado/journals verificáveis. `/fim` compila
   o journal a partir do baseline e dos fatos explicitamente informados, valida o índice e
   publica por commit/push. Divergências ou mudanças não commitadas bloqueiam a operação;
   nunca há merge automático ou force-push.
4. `START_HERE_NEXT_SESSION.md` e `docs/handoff/` locais são preservados como histórico
   legado. Após a ativação, a memória externa é a única fonte do estado operacional atual.
5. O sistema nunca registra conteúdo de `.env`, tokens, chaves ou outros segredos; nomes de
   arquivos sensíveis são redigidos nos journals.

### Consequências

- Um clone novo precisa apenas de Git, Node e acesso ao repositório privado para recuperar
  contexto; não depende de instalação global de comandos.
- O primeiro bootstrap exige credencial GitHub válida para criar ou clonar o repositório
  privado. Falhas de rede preservam o trabalho local e exigem recuperação explícita.
- Os documentos em `docs/handoff/` não devem mais ser atualizados como estado presente;
  referências históricas continuam válidas para racional e auditoria.

### Quadro-resumo

| Decisão tomada | Alternativas descartadas | Justificativa | Impacto esperado na arquitetura |
|---|---|---|---|
| Memória operacional em repositório Git privado separado | Continuar handoffs no repositório da aplicação; banco externo | Mantém histórico auditável, reduz contexto repetido e separa operação de deploy | Clone irmão de documentação e workflow de sessão versionado |
| Skills + CLI Node sem dependências | Instalação global/manual; automação opaca por IA | Comandos são reproduzíveis em qualquer clone e a coleta Git é determinística | `.claude/skills/` e `.claude/session-memory/` passam a ser infraestrutura de desenvolvimento |
| Sync/push somente fast-forward | Merge ou sobrescrita automática | Conflitos de memória não podem apagar contexto de outra sessão | Divergências interrompem o fluxo com recuperação manual |

---

## ADR-019 — Escopo OAuth do Google Drive para o Portal: `drive.file`, não `drive` completo (Gate 1 da Fase 4)

- **Status:** Aceito.
- **Data:** 2026-07-30.
- **Autor da decisão:** responsável do projeto (Gate 1 da Fase 4 do Plano Mestre, análise
  técnica solicitada explicitamente nesta sessão).
- **Resolve:** o bloqueio único registrado como pendente pela Fase 4
  (`docs/handoff/2026-07-30_oauth-drive-fase4-adr017-conflito.md`) — conflito entre `ADR-017`
  desta série (escopo `drive.file`) e `knowledge/Arquitetura/ADR-017-oauth-conta-dedicada-
  google-drive.md` (série "Sistema B", escopo `drive` completo, adendo de 2026-07-22).
- **Relaciona-se com:** ADR-017 desta série, ADR-017 legado (`knowledge/Arquitetura/`),
  ADR-003 (não inventar requisito), `PORTAL_ARQUITETURA.md` §5/§6, `PORTAL_BRIEFING.md` §8.

### Contexto

O ADR-017 desta série decidiu escopo `drive.file` para o OAuth do Drive sem confrontar
explicitamente o ADR-017 legado, que decide `drive` completo pelo motivo — registrado em seu
adendo de 2026-07-22 — de que uma estrutura de pastas já existia, criada manualmente sob o
Sistema B (Laravel, nunca chegou a produção neste repositório), e `drive.file` só concede
acesso a arquivo/pasta criado pelo próprio app sob a nova autorização.
`PORTAL_ARQUITETURA.md` §6 e `PORTAL_BRIEFING.md` §8 citam esse ADR legado sem essa ressalva,
criando a aparência de uma decisão vigente para a stack atual.

Auditoria do domínio real do Portal (Node.js/TypeScript) para responder às seis perguntas do
Gate 1:

1. **O Portal precisa acessar arquivo existente criado fora do aplicativo?** Não. Nenhuma
   rota, service ou repositório do `portal-backend` lê, lista ou consome arquivo que o
   próprio Portal não tenha criado. `material.storage.ts` (`ArmazenamentoLocalEmDisco`) só
   grava o arquivo recebido no upload da Parceira; não há rota de download nem de leitura
   reversa (`entrega.repository.ts` só persiste o nome do arquivo salvo).
2. **O Portal precisa reorganizar estrutura antiga do Drive?** Não. Nenhuma SPEC, ADR desta
   série ou seção de `PORTAL_ARQUITETURA.md`/`PORTAL_BRIEFING.md` define esse requisito para
   a stack atual. `PORTAL_ARQUITETURA.md` §6 já marca a integração citando o ADR legado como
   "**[DOCUMENTADO, mas específico de outra stack]**".
3. **A estrutura histórica do Drive continuará sendo utilizada?** Não documentado como
   requisito — declarando a lacuna em vez de presumir (ADR-003). É possível, não confirmado,
   que a conta testada nesta sessão (`elafashionmkt@gmail.com`) seja a mesma conta
   institucional citada no ADR legado (`elafashionmkt-org`); mesmo assim, nenhuma fonte
   oficial do Portal pede que essa estrutura manual seja lida ou reaproveitada.
4. **O Storage administrará apenas arquivo criado pelo Portal?** Sim — é exatamente o
   desenho de `SPEC-027`/`PORTAL_ARQUITETURA.md` §5: a Parceira envia, o backend grava, a
   Entrega muda de estado. Nenhum fluxo documentado ou implementado depende de arquivo
   pré-existente.
5. **`drive.file` atende completamente aos requisitos?** Sim, por 1–4: todo uso real e
   documentado do Drive nesta fase e nas seguintes (provisionamento de pasta por
   Parceira/competência, upload de material) opera só sobre recurso criado pelo próprio
   Portal — exatamente o que `drive.file` cobre.
6. **Justificativa para `drive` completo, caso `drive.file` não atendesse:** não se aplica —
   pergunta condicional a uma premissa (5) que não se confirmou.

### Decisão

1. O escopo OAuth do Google Drive para o Portal (stack Node.js/TypeScript deste repositório)
   é **`drive.file`**, conforme já implementado e validado por ADR-017 desta série. Não é
   adotado `drive` completo.
2. O ADR-017 legado (`knowledge/Arquitetura/ADR-017-oauth-conta-dedicada-google-drive.md`,
   incluindo seu adendo) é declarado **não vinculante para esta stack**: sua justificativa
   para `drive` completo depende de uma estrutura de pastas criada por um sistema (Sistema B)
   que nunca chegou a produção neste repositório, e nenhum requisito documentado do Portal
   atual depende dela. O ADR legado permanece válido como registro histórico de raciocínio
   daquela stack, não como decisão vigente para esta.
3. `PORTAL_ARQUITETURA.md` §6 e `PORTAL_BRIEFING.md` §8 são atualizados nesta mesma sessão
   para citar este ADR e parar de referenciar o ADR legado como se fosse a decisão vigente
   sem ressalva.
4. **Risco residual documentado, não bloqueante:** se uma decisão de produto futura exigir
   que o Portal acesse ou migre a estrutura de pastas manual eventualmente existente na conta
   Google Drive usada (`ROOT/Materiais/Backup/Temporarios/Contratos/Exportacoes`, citada no
   ADR legado), esta decisão precisa ser reaberta com um novo ADR — `drive.file` não permite
   esse acesso por design.

### Consequências

- Nenhuma mudança de código: o mecanismo já implementado e validado por ADR-017
  (`googleDriveClient.ts`, script de validação) permanece como está.
- Escopo de menor privilégio mantido: `drive.file` não exige verificação do Google nem
  concede acesso além do que o Portal cria.
- Gate 1 da Fase 4 concluído — desbloqueia o Gate 2 (arquitetura do Storage).

### Quadro-resumo

| Decisão tomada | Alternativas descartadas | Justificativa | Impacto esperado na arquitetura |
|---|---|---|---|
| Escopo `drive.file`, ADR legado declarado não vinculante para esta stack | Escopo `drive` completo, seguindo o padrão do ADR-017 legado | Nenhum requisito documentado ou implementado do Portal atual depende de arquivo pré-existente fora do próprio app | Menor privilégio mantido; nenhuma credencial/OAuth Client nova necessária |

---

## ADR-020 — Isolamento de ambiente do Storage: mesma conta Google Drive, pasta raiz exclusiva por ambiente (Gate 3 da Fase 4)

- **Status:** Aceito.
- **Data:** 2026-07-30.
- **Autor da decisão:** responsável do projeto (Gate 3 da Fase 4 do Plano Mestre, decisão
  tomada ao constatar, durante a implementação, que o client OAuth do Drive já provisionado
  por `ADR-017` está rotulado nas próprias variáveis de ambiente como "Portal DODÔ
  Produção", sem conta separada para desenvolvimento/staging).
- **Relaciona-se com:** ADR-017 (OAuth dedicado do Drive, conta única administrada), ADR-019
  (escopo `drive.file`), `docs/TDD_STORAGE_GOOGLE_DRIVE.md` §3.3 (pasta raiz).

### Contexto

Durante a implementação do Gate 3 (Storage), ao validar o script de provisionamento da pasta
raiz (`npm run drive:provisionar-raiz`), constatou-se que o único client OAuth do Drive
configurado (`ADR-017`) é o client de produção — não existe conta/Drive separada para
ambiente de desenvolvimento ou staging. O TDD (§3.3) já previa que a pasta raiz é criada
manualmente uma única vez, fora de tempo de request, com o ID persistido em
`GOOGLE_DRIVE_ROOT_FOLDER_ID`, mas não decidia explicitamente se ambientes distintos
deveriam compartilhar a mesma pasta raiz dentro dessa conta única, ou ter pastas raiz
distintas. Sem essa decisão, uma pasta raiz criada durante validação manual em
desenvolvimento local ficaria, por omissão, na mesma árvore que a futura pasta raiz de
produção — risco de material de teste se misturar com material real de Parceira.

### Decisão

1. **Uma única conta Google Drive administrada** continua servindo todos os ambientes por
   enquanto (dev, staging, produção) — nenhuma conta/Drive nova é provisionada nesta decisão,
   reafirma `ADR-017`.
2. **Pasta raiz exclusiva por ambiente.** Cada ambiente (dev, staging, produção) tem sua
   própria pasta raiz, criada independentemente pelo script de provisionamento, com seu
   próprio valor de `GOOGLE_DRIVE_ROOT_FOLDER_ID` — nenhum ambiente reaproveita a pasta raiz
   de outro. Isolamento é por pasta (`drive.file` já garante que uma pasta raiz só é
   acessível a quem tem o ID), não por conta.
3. **Toda diferenciação de ambiente passa exclusivamente por `GOOGLE_DRIVE_ROOT_FOLDER_ID`**
   — nenhuma lógica condicional de ambiente (`if NODE_ENV === ...`) é introduzida no código
   de Storage; o valor correto é responsabilidade do `.env` de cada ambiente, nunca de
   branching em código.
4. **A pasta raiz de desenvolvimento local já criada** (id `15QbT0dgS2hxoM9NQqa7FK9dfnAk31a7g`,
   criada em 2026-07-30 durante validação manual do script de provisionamento) é adotada como
   a pasta raiz oficial do ambiente de desenvolvimento local — não recriada, não removida.
5. **Migração futura para contas separadas por ambiente permanece aberta, sem custo de
   redesenho:** como toda a arquitetura resolve a raiz por `GOOGLE_DRIVE_ROOT_FOLDER_ID`
   (config), nunca por caminho fixo em código, trocar de conta é só trocar
   `GOOGLE_DRIVE_CLIENT_ID`/`SECRET`/`REFRESH_TOKEN` + `GOOGLE_DRIVE_ROOT_FOLDER_ID` no `.env`
   do ambiente correspondente — nenhuma camada acima de `ProvedorDeArmazenamentoGoogleDrive`
   precisa mudar.

### Consequências

- `docs/TDD_STORAGE_GOOGLE_DRIVE.md` §3.3 é atualizado para declarar esta decisão (pasta raiz
  por ambiente, não por conta) e registrar a proveniência da pasta de desenvolvimento já
  criada.
- Cada ambiente que vier a existir (staging, produção) precisa rodar `npm run
  drive:provisionar-raiz` (ou equivalente manual) uma vez, com seu próprio `.env`, antes do
  primeiro uso de Storage nesse ambiente — nenhuma automação cria pasta raiz em tempo de
  deploy.
- Nenhuma mudança de código é exigida por esta ADR além da atualização de documentação — o
  mecanismo já implementado (`GOOGLE_DRIVE_ROOT_FOLDER_ID` como único ponto de configuração
  de raiz) já satisfaz a decisão.
- Risco residual aceito, não bloqueante: enquanto a conta for única, quota de armazenamento e
  de API é compartilhada entre todos os ambientes — reavaliar (conta dedicada por ambiente)
  só se isso se tornar um problema real.

### Quadro-resumo

| Decisão tomada | Alternativas descartadas | Justificativa | Impacto esperado na arquitetura |
|---|---|---|---|
| Uma conta, pasta raiz exclusiva por ambiente, diferenciação só via `GOOGLE_DRIVE_ROOT_FOLDER_ID` | Conta Drive dedicada por ambiente agora | Nenhum requisito documentado exige isolamento de conta hoje; pasta raiz já isola por `drive.file`; menor custo operacional | Nenhuma mudança de código; só disciplina de configuração por ambiente |

---

## ADR-021 — Arquitetura de memória multi-agente: localização canônica fixa, artefatos gerados, isolamento por worktree

- **Status:** Aceito. Implementação em migração incremental por fases (ver `Decisão`, item 5).
- **Data:** 2026-08-03.
- **Relaciona-se com:** ADR-003 (não inventar requisito onde a documentação for omissa —
  aplicado aqui ao tratar o diagnóstico já validado como fato, não à decisão de arquitetura
  em si), ADR-018 (decisão original que introduziu o repositório `criativododo-memory`; esta
  ADR refina sua implementação sem reverter seus princípios de segurança).

### Contexto

A ADR-018 estabeleceu `criativododo-memory` como clone irmão do repositório da aplicação,
com sincronização estritamente fast-forward e bloqueio de qualquer estado sujo — desenhada
para uma sessão por vez, sempre invocada a partir da raiz do checkout principal.

Esse pressuposto deixou de valer. O ambiente passou a rodar múltiplas sessões em paralelo,
cada uma isolada em um `git worktree` sob `.claude/worktrees/<nome>/`. O kit
`.claude/session-memory/` resolve `memoryDirectory` (`../criativododo-memory`, em
`config.json`) como caminho relativo a `process.cwd()`. Rodando a partir de um worktree,
`..` sobe para `.claude/worktrees/`, não para a raiz do checkout — então
`../criativododo-memory` passou a apontar para `.claude/worktrees/criativododo-memory`, um
clone físico diferente do canônico (`/Users/danielperrut/criativododo-memory`), criado
silenciosamente pela primeira sessão em worktree que rodou `/inicio` sem esse diretório
existir ainda.

Como todo worktree resolve para esse mesmo caminho acidental (o segmento específico do
worktree se cancela na matemática do `..`), múltiplas sessões concorrentes passaram a
compartilhar esse único diretório de trabalho Git sem nenhuma coordenação — sem lock, sem
fila, sem retry — enquanto sessões rodando a partir do checkout principal continuavam
usando o clone canônico. Isso produziu dois históricos divergentes do mesmo repositório
remoto e, adicionalmente, um problema de modelo de dados independente do bug de path:
`journals/INDEX.md`, `PROJECT_STATUS.md` e `START_HERE_NEXT_SESSION.md` são arquivos
editados diretamente por cada sessão ao final (`/fim`); duas sessões terminando em janela
próxima disputam as mesmas linhas de texto, o que gera conflito de merge real (não apenas
mecânico) mesmo depois de corrigido o caminho.

Diagnóstico e evidências completas (dois clones divergentes confirmados por hash de commit,
ausência de qualquer lock/mutex/retry no código-fonte de `.claude/session-memory/lib/`,
worktrees concorrentes ativos no momento da investigação) foram levantados e validados nesta
sessão antes desta decisão; não repetidos aqui.

### Decisão

1. **Localização canônica deixa de ser derivada de `process.cwd()`.** Passa a ser resolvida
   por uma variável de ambiente fixa (`CRIATIVODODO_MEMORY_DIR`), com fallback padrão seguro
   e documentado, independente de checkout principal, worktree ou diretório de invocação.
2. **`journals/INDEX.md`, `PROJECT_STATUS.md` e `START_HERE_NEXT_SESSION.md` deixam de ser
   editados diretamente.** Passam a ser artefatos **gerados** por funções puras a partir do
   conjunto de journals (fonte de verdade única, um arquivo por sessão, já
   inerentemente sem conflito por ter nome único). Critério de regeneração:
   `endedAt` mais recente define o estado vigente; desempate por `session-id` em caso de
   colisão de timestamp. Isso elimina a possibilidade estrutural de conflito de merge nesses
   três arquivos — duas sessões que regeneram concorrentemente produzem o mesmo resultado,
   por ser função pura sobre os mesmos dados, não edição de texto.
3. **Cada sessão passa a operar em um `git worktree` efêmero e isolado do repositório de
   memória**, criado por `/inicio` a partir do clone canônico e removido por `/fim` —
   nenhum processo volta a compartilhar working tree com outro. `/fim` grava o journal e os
   artefatos regenerados nesse worktree isolado, commita, e integra com o remoto por um
   laço curto de `fetch` → rebase → `push` → retry em caso de rejeição — seguro por
   construção, já que o commit local de uma sessão nunca toca o journal de outra. O
   princípio de segurança da ADR-018 (nunca merge automático de conteúdo divergente,
   nunca force-push) é preservado: o que muda é que, com journals únicos por sessão e
   artefatos regenerados, não sobra conteúdo divergente para mesclar — só um rebase
   trivial e uma regeneração determinística.
4. `/inicio`, `/check` e `/fim` mantêm a mesma interface externa (flags, resumo executivo
   retornado). A mudança é inteiramente interna à implementação do kit.
5. **Migração incremental, não big-bang**, com validação completa e aprovação explícita
   entre cada fase antes de avançar:
   - Fase 0 — higienização: reconciliar journals divergentes entre o clone canônico e o
     clone acidental, descartar o acidental, confirmar repositório único.
   - Fase 1 — path canônico fixo (`CRIATIVODODO_MEMORY_DIR` + fallback + testes).
   - Fase 2 — artefatos gerados (funções puras de regeneração + testes), ainda operando no
     repositório único, sem isolamento por worktree.
   - Fase 3 — isolamento por sessão via `git worktree` efêmero + retry de
     fetch/rebase/push + limpeza automática de worktrees órfãos.
   - Fase 4 — validação final: sessão única, duas sessões paralelas, múltiplos worktrees,
     início/fim simultâneos, recuperação após interrupção.

### Consequências

- O erro "alterações não commitadas" motivado por outra sessão deixa de poder ocorrer
  depois da Fase 3: não existe mais working tree compartilhada para sujar.
- Edição manual de `journals/INDEX.md`, `PROJECT_STATUS.md` ou `START_HERE_NEXT_SESSION.md`
  fora do protocolo passa a ser sobrescrita na próxima regeneração (reforça a instrução já
  presente no cabeçalho do `INDEX.md`, agora garantida tecnicamente, não só por convenção).
- Sessões que travam sem rodar `/fim` deixam worktrees órfãos; a Fase 4 inclui limpeza
  automática (`git worktree prune` + remoção de worktrees sem sessão de runtime
  correspondente) como parte do critério de aceite, não como melhoria futura.
- O histórico já divergente entre os dois clones hoje precisa de reconciliação manual única
  na Fase 0 antes de a regeneração determinística ter uma fonte completa de journals — sem
  essa etapa, journals legítimos de sessões passadas poderiam ficar ausentes do estado
  regenerado.
- Nenhuma mudança de infraestrutura remota: o repositório GitHub `criativododo-memory` e o
  branch único `main` continuam sendo o destino final; muda apenas como os clones locais são
  localizados, isolados e integrados a esse remoto.

### Quadro-resumo

| Decisão tomada | Alternativas descartadas | Justificativa | Impacto esperado na arquitetura |
|---|---|---|---|
| Caminho canônico fixo via variável de ambiente, independente de `cwd` | Calcular o caminho a partir da raiz real do repositório (`git rev-parse --git-common-dir`) | A alternativa ainda depende de introspecção de contexto de invocação; um caminho fixo por máquina elimina a categoria inteira de bug, incluindo layouts de worktree futuros e imprevistos | `config.mjs` resolve `CRIATIVODODO_MEMORY_DIR` uma única vez, sem matemática de path relativo |
| `journals/INDEX.md`/`PROJECT_STATUS.md`/`START_HERE_NEXT_SESSION.md` como artefatos gerados por função pura | Lock/mutex protegendo edição concorrente dos mesmos arquivos; fila de acesso serializando sessões | Lock e fila resolvem a mecânica de escrita mas não o problema semântico: dois "next task" concorrentes continuam se sobrescrevendo, só que um de cada vez; regeneração determinística elimina o próprio conceito de edição concorrente desses arquivos | `documents.mjs` ganha `renderIndex`/`renderStatus`/`renderNextSession` puras, testáveis sem Git |
| Worktree efêmero por sessão + retry de fetch/rebase/push | Clone completo por sessão (mais pesado, sem compartilhar objects/refs); um único diretório protegido por lock global (serializa todas as sessões, contradiz o requisito de paralelismo) | `git worktree` é a primitiva nativa do próprio Git para múltiplos working trees seguros sobre um único object store — já usada neste ambiente para isolar código por sessão; reaproveitar o mesmo padrão para a memória é consistente e não introduz mecanismo novo | `/inicio` cria e `/fim` remove um worktree do repositório de memória por sessão |
| Migração em 5 fases, cada uma com testes e aprovação antes da próxima | Reescrita completa em uma única mudança | Reduz risco de regressão em um componente crítico (memória operacional de todas as sessões); cada fase é validável isoladamente com os testes já existentes em `.claude/session-memory/test/` | Nenhuma fase altera o comportamento externo de `/inicio`, `/check`, `/fim` antes da Fase 4 confirmar tudo |

---

## ADR-022 — Ator "Marca" entra no MVP: dois níveis administrativos, sistema permanece single-tenant

- **Status:** Aceito. Supersede ADR-008.
- **Data:** 2026-08-05.
- **Autor da decisão:** responsável do projeto.
- **Relaciona-se com:** ADR-008 (decisão substituída), SPEC-035 (Identidade e Acesso),
  `PORTAL_GLOSSARIO.md`, `PORTAL_BRIEFING.md` §4.3/§9.3.

### Contexto

O ADR-008 (2026-07-26) havia deixado o ator "Marca" fora do MVP, com o sistema permanecendo
single-tenant. O responsável do projeto validou, nesta sessão, a decisão de produto de trazer
esse ator para o escopo, para que o cliente (Marca) tenha uma visão operacional da própria
campanha dentro do Portal — sem reabrir a arquitetura geral, o domínio principal, o RBAC
existente, a política de LGPD ou os fluxos operacionais já definidos.

### Decisão

O Portal passa a ter **dois níveis administrativos**:

- **Administrador DODÔ** (nível 5) — o papel `ADMINISTRADOR` já existente, acesso total,
  inalterado por este ADR.
- **Administrador da Marca** (nível 2) — novo papel, autenticado, com permissões limitadas à
  própria operação/campanha. Não é um novo tenant nem uma nova dimensão de particionamento de
  dados: é um ator com um recorte mais restrito de leitura sobre o mesmo domínio single-tenant.

O sistema **permanece single-tenant**. A Marca não introduz `tenant_id`, isolamento de banco,
nem qualquer conceito de multi-tenancy — ela é apenas um ator autenticado adicional, com RBAC
mais restrito, dentro da mesma instância operada exclusivamente para o Criativo DODÔ.

### Consequências

- `PapelAtor` ganha um terceiro valor (`ADMINISTRADOR_MARCA`) ao lado de `ADMINISTRADOR` e
  `INFLUENCIADORA` — sem remover nem alterar o comportamento dos dois papéis existentes.
- Nenhuma entidade `Marca`/`tenant_id` é introduzida no modelo de dados por este ADR; a
  visão operacional do Administrador da Marca lê o mesmo domínio single-tenant, com o
  conjunto de campos restrito ao necessário para acompanhar a campanha (sem dados financeiros
  internos da agência, sem dados de moderação de conta, sem solicitações LGPD de terceiros).
- Provisionamento (como uma conta chega a ter o papel `ADMINISTRADOR_MARCA`) não é definido
  por este ADR — fica para uma decisão futura sobre o fluxo de convite/cadastro desse papel;
  este ADR autoriza apenas o papel e a tela de leitura, não o ciclo de vida completo da conta.
- ADR-008 passa a **Status: Superseded** — o registro histórico permanece no documento, mas
  deixa de ser a decisão vigente.
- Documentos que ainda descrevem "Marca fora do MVP" como decisão vigente (`PORTAL_BACKLOG.md`
  Feature 0.4, `PORTAL_BRIEFING.md` §9.3, `PORTAL_GLOSSARIO.md`) ficam desatualizados por este
  ADR e devem ser revisados; ver seção "Legado a Revisar" abaixo.

### Legado a Revisar

Os documentos a seguir descrevem "Marca fora do MVP" como decisão vigente e precisam de
revisão editorial para refletir este ADR (não bloqueiam a implementação — registrados aqui
para rastreabilidade, correção fica para sessão de documentação):

- `docs/business/PORTAL_BACKLOG.md` (Feature 0.4 — "Marca fora do MVP").
- `docs/business/PORTAL_BRIEFING.md` §9.3 (schema `BASE_MARCAS` marcado como não
  implementada por decisão de escopo).
- `docs/architecture/PORTAL_GLOSSARIO.md` (verbete "Marca" citando "não implementado").
- `USER_JOURNEYS.md` (seção "Marca (ator) — jornada não documentada como implementável").
- `knowledge/Produto/SPEC-035-identidade-e-acesso.md` §4.2 (nota de revisão que condicionava
  a implementação a validação futura — agora validada por este ADR).
- Auditorias de 2026-08-03/04 em `docs/_workspace/auditorias/` que citam ADR-008 como vigente
  para justificar não modelar Marca como entidade de domínio.

---

## ADR-023 — Mesa da Campanha: novo hub pós-login do Administrador; "Campanha" como panorama, não sinônimo de Colaboração Mensal

- **Status:** Aceito.
- **Data:** 2026-08-05.
- **Autor da decisão:** responsável do projeto.
- **Relaciona-se com:** ADR-002 (banimento original de "Campanha" como sinônimo de
  Colaboração Mensal), ADR-016 (Colaboração Mensal), ADR-022 (ator Marca, dois níveis
  administrativos).

### Contexto

O responsável do projeto pediu uma nova tela, "Mesa da Campanha", para ser o hub central de
navegação do Administrador — o ponto de partida de onde se acessa Dashboard da Marca, Central
de Influenciadoras, Aprovação e Financeiro, respondendo primeiro "como está esta campanha?"
antes de qualquer detalhe operacional.

O nome colide, à primeira vista, com uma decisão já registrada: `ARCHITECTURAL_DECISIONS.md`
(tabela de termos banidos, ADR-002) lista `Campanha` como sinônimo banido do agregado
`Colaboração Mensal`, e `docs/architecture/PORTAL_GLOSSARIO.md` documenta ainda um terceiro
sentido de "Campanha" no vocabulário do Sistema B legado (ciclo de vida próprio, não
reconciliado). Nenhum dos dois é o que esta tela representa.

### Decisão

1. **"Campanha" passa a existir como conceito de produto, não como entidade de banco nem
   sinônimo de `Colaboração Mensal`.** É o panorama agregado de toda a operação corrente do
   Criativo DODÔ — todas as Parceiras ativas, todas as Entregas, todas as aprovações
   pendentes, toda a logística narrativa, o financeiro da competência atual — sempre superior,
   nunca substituto, a uma Colaboração Mensal individual. Hierarquia oficial:
   `Campanha (panorama) → Parceiras → Colaboração Mensal → Entrega → Material → Publicação`.
   O código-fonte, os tipos e as tabelas continuam usando exclusivamente `ColaboracaoMensal`
   como nome de entidade — "Campanha"/"Mesa da Campanha" nunca vira `type`, tabela ou campo de
   banco; é rótulo de tela e de agregação de leitura (`PanoramaCampanha`, ver Consequências).
2. **Mesa da Campanha (`/admin/campanha`) passa a ser o destino pós-login do papel
   `ADMINISTRADOR`**, substituindo `/admin/dashboard` nesse papel específico.
   `/admin/dashboard` (Dashboard Administrativo, Sprint 2) **permanece intacto, com todas as
   suas funcionalidades**, acessível a partir da Mesa da Campanha e do menu administrativo —
   deixa de ser a porta de entrada, não deixa de existir.
3. **RBAC amplia por hierarquia de nível, não por papel isolado**: o Administrador da Marca
   (ADR-022, nível 2) e o Administrador DODÔ (nível 5) coexistiam sem sobreposição de acesso —
   `requireAdministradorMarca` recusava `ADMINISTRADOR`. Como a Mesa da Campanha precisa linkar
   para a visão da Marca (o Administrador precisa poder ver o que a Marca vê), nível 5 passa a
   também satisfazer os gates de nível 2. Isso não amplia o que o nível 2 vê — só reconhece que
   nível 5 é superconjunto de nível 2.
4. **Sem placeholder para módulos inexistentes**: Comunicação e Resultados não têm nenhuma
   implementação hoje — não aparecem na Mesa da Campanha, nem como "em breve", nem
   desabilitados. Logística (SPEC-016) também não tem módulo — aparece só como seção
   narrativa de texto dentro da própria tela, nunca como atalho de navegação. A lista de
   atalhos é dado (array), não JSX fixo, para que Comunicação/Resultados entrem por adição de
   item, não por reescrita da tela, quando forem implementados.

### Consequências

- Novo endpoint de leitura `GET /api/admin/campanha` (`requireAdmin`), função pura
  `calcularPanoramaCampanha` — reaproveita integralmente `calcularIndicadores`/
  `obterIndicadoresAdministrativos` (zero duplicação da regra de negócio já testada); soma só
  o que é genuinamente novo: nomes das Parceiras ativas (para "participantes") e pagamentos
  pendentes **filtrados pela competência atual** (`mesReferencia` do mês corrente) — diferente
  do Financeiro administrativo, que é histórico completo sem recorte de mês.
- `requireAdministradorMarca` (middleware) e o gate de papel em `MarcaDashboard.tsx` passam a
  aceitar `ADMINISTRADOR` além de `ADMINISTRADOR_MARCA`.
- Destino pós-login do `ADMINISTRADOR` muda em três lugares que precisam ficar consistentes:
  `auth.routes.ts` (`/google/callback` e `/dev-login`) e `App.tsx`
  (`RedirecionamentoInicial`) — todos passam a apontar para `/admin/campanha`.
- `PortalLayout.tsx` ganha "mesa da campanha" como primeiro item do menu administrativo e como
  destino do logo, para a tela ser alcançável de qualquer página `/admin/*`, não só no login.
- Este ADR não reabre nem reverte ADR-002/ADR-016: `Colaboração Mensal` continua sendo o único
  nome de agregado no domínio; "Campanha" nunca aparece em `knowledge/Historico/`
  `CONTRATO_SOBERANO.md` nem em nomes de tabela/tipo do backend.

---

## ADR-024 — Unidade Oficial de Entrega: 1 Entrega = 1 Material = 1 Publicação

- **Status:** Aceito.
- **Data:** 2026-08-06.
- **Autor da decisão:** responsável do projeto (sessão de decisão de Produto dedicada).
- **Relaciona-se com:** `SPEC-012` (Gestão de Conteúdo e Ativações, §4/§6/§16), `ADR-012` da
  série antiga (`knowledge/Arquitetura/ADR-012-renome-ativacao-fluxo-logistico.md`,
  introduziu o termo "Entrega"), `docs/architecture/PORTAL_GLOSSARIO.md`,
  `docs/TDD_STORAGE_GOOGLE_DRIVE.md`, `ADR-023` (hierarquia
  `Campanha → Parceiras → Colaboração Mensal → Entrega → Material → Publicação`).

### Contexto

Uma investigação arquitetural identificou conflito entre o domínio oficial e uma interface
experimental do Portal, que modela uma Entrega como contendo múltiplas mídias (vídeo
principal + still + bastidor — "materiais de apoio"), conceito ausente de toda SPEC, ADR e
do schema físico. A interface em questão é uma fixture de Layout, aprovada numa sessão de
design visual, sem base em nenhuma decisão de Produto; a adequação de implementações
concretas ao modelo aqui decidido é tratada como tarefa futura (ver Consequências), não como
parte desta decisão arquitetural.

Uma sessão de decisão de Produto dedicada avaliou a questão desde o negócio (não desde a
implementação) e concluiu que o domínio já documentado responde à questão corretamente:

- `SPEC-012` §4/§6.2 já define **Entrega** como agregado com **um** "material enviado"
  (singular), e RN-01 já resolve o caso de múltiplas peças por competência: **"cada unidade
  contratada de cada formato gera uma Entrega"** — i.e., Stories 1 e Stories 2, por exemplo,
  já são duas Entregas, não uma Entrega com dois materiais.
- `SPEC-012` §16 CB-01 já define reenvio como **substituição** do material existente
  ("mantém identidade"), não como adição a uma coleção.
- `docs/TDD_STORAGE_GOOGLE_DRIVE.md` já projeta a camada de armazenamento inteira (Google
  Drive) sobre a premissa de um único arquivo por Entrega, com substituição via `PATCH` no
  mesmo `fileId` — auditado e aprovado no Gate 2 da Fase 4.
- `docs/architecture/PORTAL_GLOSSARIO.md` já registra a hierarquia
  `Entrega → Material → Publicação`, com **Material** definido como "conteúdo de uma
  Entrega" (singular).
- O schema físico (`entrega.repository.ts`, `entrega.types.ts`, coluna
  `material_enviado`) já é singular (`string | null`).

Ou seja: nenhum dos documentos soberanos precisou ser corrigido — todos já expressavam o
modelo correto. A lacuna era a ausência de um registro explícito, no nível de ADR, que
fechasse a ambiguidade levantada e declarasse formalmente que "materiais de apoio" não é um
conceito do domínio.

Esta ADR é declarativa: não cria um modelo novo, apenas formaliza, num único registro
arquitetural, o modelo já refletido em `SPEC-012`, no schema físico, no TDD de Storage e na
documentação de domínio existente. Seu objetivo é eliminar ambiguidade para implementações
futuras, não introduzir uma regra nova.

### Decisão

1. **1 Entrega = 1 Material = 1 Publicação** é a unidade oficial vigente do domínio de
   conteúdo do Portal, enquanto este modelo não for revisto por uma nova decisão de Produto
   documentada. Uma Entrega nunca contém uma coleção de arquivos.
2. **Múltiplas peças de uma campanha continuam sendo modeladas como múltiplas Entregas** —
   uma por unidade contratada de cada formato (RN-01, `SPEC-012`), nunca como itens dentro de
   uma mesma Entrega.
3. **Reenvio de material substitui o material existente da mesma Entrega**, mantendo a
   identidade do recurso (CB-01, `SPEC-012` §16) — nunca cria um segundo item associado à
   mesma Entrega.
4. **"Materiais de apoio" (still, bastidor, making of, thumbnail, arquivo auxiliar) não são
   um conceito oficial do domínio do Portal.** Não há Produto, UX ou Arquitetura aprovados
   para esse conceito. Nenhuma implementação deve assumi-lo.
5. `SPEC-012`, `PORTAL_GLOSSARIO.md`, `CONTRATO_SOBERANO.md` e
   `docs/TDD_STORAGE_GOOGLE_DRIVE.md` permanecem **inalterados** — já expressavam
   corretamente esta decisão antes dela ser formalizada aqui. Este ADR não corrige conteúdo
   divergente; consolida e declara oficial um modelo que já era, de fato, o modelo vigente.

### Consequências

- Qualquer interface que modele uma Entrega contendo múltiplos materiais é considerada
  divergente do domínio oficial definido nesta ADR. A adequação de implementações existentes
  a este modelo (reduzir para um único material por Entrega, onde aplicável) é tarefa de
  implementação futura, fora do escopo desta decisão de Produto, e deve ser tratada como
  consumo desta ADR, não como reabertura da decisão.
- Nenhuma SPEC, glossário ou TDD precisou de correção — esta ADR é puramente declarativa
  sobre um modelo já correto, fechando a ambiguidade para sessões futuras.
- Qualquer proposta futura de "materiais de apoio" exige uma nova sessão de decisão de
  Produto, com dor de negócio documentada (não uma tela de UI como origem), e revisão
  explícita desta ADR — nunca implementação direta por suposição (`CLAUDE.md`, regra
  permanente: nunca criar funcionalidade por suposição).

---

## ADR-025 — Design System Criativo Dodô: nova fonte de verdade da identidade visual, ADR-019 (série antiga) superada

- **Status:** Aceito.
- **Data:** 2026-08-06.
- **Autor da decisão:** responsável do projeto (sessão de decisão de governança dedicada).
- **Relaciona-se com:** `knowledge/Arquitetura/ADR-019-design-system-dodo-como-ssot-visual.md`
  (série antiga), `knowledge/PROJECT_SOURCE_OF_TRUTH.md` §1 e §8, `design-system/` (estado
  atual do repositório), `docs/design/archive/` (gerações já arquivadas por ADR-019 antiga),
  `criativododo-interno/MATERIAL PARA DESIGN SYSTEM FINAL/` (fonte de trabalho externa ao
  repositório git, mesmo padrão de `criativododo-interno/PLANO_MESTRE_IMPLEMENTACAO_PORTAL_
  DODO.md` citado em `PROJECT_SOURCE_OF_TRUTH.md` §5).

### Contexto

O repositório chega a esta decisão com uma ADR já vigente sobre identidade visual: `ADR-019`
da série antiga (`knowledge/Arquitetura/`), que declarou `design-system/` (paleta
laranja-primária `#f14f28` / roxo-secundária `#504ea1`) como SSOT visual do frontend React, ao
final de um histórico de três gerações de Design System em conflito entre si.

Paralelamente, o responsável do projeto conduziu uma fase de descoberta dedicada, resultando
num briefing fechado (`BRIEFING-FINAL-CLAUDE-CODE.md`, versão 1.0, 06/08/2026, 31 decisões
numeradas, 15 conflitos resolvidos), construído a partir das 41 telas aprovadas do Portal
Dodô e do kit de marca oficial (`LOGOS/`, `KIT DE MARCA/`) — material com paleta Cotton
`#EDEBDD` / Cherry `#810100` / Maroon `#630000` / Noir `#1B1717`, sem relação com a paleta de
`ADR-019` antiga. Todo esse material — briefing, telas aprovadas, kit de marca e demais
insumos — está concentrado em `/Users/danielperrut/criativododo-interno/MATERIAL PARA DESIGN
SYSTEM FINAL/`, pasta externa ao repositório git (mesmo padrão de tratamento já usado para
`PLANO_MESTRE_IMPLEMENTACAO_PORTAL_DODO.md`, `PROJECT_SOURCE_OF_TRUTH.md` §5).

O responsável do projeto decidiu que esse material passa a ser a única fonte de verdade da
identidade visual do projeto, desconsiderando qualquer versão anterior de Design System,
Brand Book ou Manual de Marca. Como `CLAUDE.md` proíbe alterar arquitetura sem ADR e proíbe a
existência de múltiplas fontes de verdade para o mesmo assunto, essa substituição precisa de
registro arquitetural formal antes de qualquer conteúdo novo ser produzido.

Esta ADR resolve exclusivamente a governança dessa transição. Não define, sugere ou antecipa
nenhum token, cor, tipografia, componente ou qualquer outra decisão de design — essas decisões
pertencem ao próprio Design System em construção, não a este registro.

### Decisão

1. **Passa a existir uma única fonte de verdade para a identidade visual e o sistema de
   design do projeto: o Design System Criativo Dodô**, em construção a partir do material
   consolidado em `criativododo-interno/MATERIAL PARA DESIGN SYSTEM FINAL/` (briefing, 41
   telas aprovadas do Portal Dodô, kit de marca — ver item 3). Nenhum outro documento de marca
   ou Design System, anterior a esta ADR, é considerado fonte de decisão a partir de agora.
2. **Governança do Design System Criativo Dodô como ativo independente.** O Design System
   Criativo Dodô é um ativo próprio do ecossistema Criativo Dodô, com governança, evolução e
   ciclo de vida independentes — não pertence ao Portal Dodô, à Landing (`app/`), nem a
   qualquer outro produto específico do ecossistema, presente ou futuro. Portal, Landing e
   qualquer produto futuro **consomem** o Design System Criativo Dodô; nenhum deles o define.
   A guarda operacional do Design System Criativo Dodô é exercida por um responsável
   institucional designado pelo projeto, não por um produto ou área específica do ecossistema.
   Quem exerce essa guarda pode mudar ao longo do tempo — isso é detalhe operacional, não uma
   alteração desta ADR — desde que o modelo de governança aqui definido (ativo independente,
   consumido por Portal, Landing e produtos futuros, nunca definido por eles) seja preservado.
   Esta é uma decisão de governança — a forma técnica pela qual cada produto consome o Design
   System (empacotamento, distribuição, sincronização de tokens etc.) não é definida por esta
   ADR.
3. **Fonte de trabalho durante a construção.** Enquanto o Design System Criativo Dodô está em
   construção, a fonte de verdade operacional é a pasta `criativododo-interno/MATERIAL PARA
   DESIGN SYSTEM FINAL/` (externa ao repositório git, mesmo padrão de
   `PLANO_MESTRE_IMPLEMENTACAO_PORTAL_DODO.md`, `PROJECT_SOURCE_OF_TRUTH.md` §5) — concentra o
   briefing, as telas aprovadas e o kit de marca. Essa localização é provisória: quando o
   Design System Criativo Dodô for publicado, a localização oficial da documentação passa a
   ser a registrada em `PROJECT_SOURCE_OF_TRUTH.md` §8 (ver item 7), não mais esta pasta de
   trabalho.
4. **`ADR-019` da série antiga é considerada superada para fins de identidade visual.**
   Permanece no repositório apenas como registro histórico e rastreabilidade, nunca mais como
   referência normativa.
5. **Toda documentação de Design System anterior é arquivada, nunca apagada.** Isso inclui o
   conteúdo atual de `design-system/` e qualquer geração já preservada em
   `docs/design/archive/`. Arquivar aqui significa: deixa de ser consultada como fonte de
   decisão; continua fisicamente disponível para consulta histórica pontual, quando
   necessário.
6. **Nenhum arquivo legado é considerado referência ativa apenas por existir no
   repositório.** A partir desta ADR, todo material anterior ao Design System Criativo Dodô
   passa automaticamente para estado de arquivo histórico, independentemente de já ter sido
   movido fisicamente para uma pasta de arquivo.
7. `knowledge/PROJECT_SOURCE_OF_TRUTH.md` §8 ("Design System HTML") passa a apontar para o
   Design System Criativo Dodô. A localização física definitiva do Design System Criativo Dodô
   será registrada em `PROJECT_SOURCE_OF_TRUTH.md` no momento em que a primeira entrega for
   publicada.
8. **Escopo e evolução do sistema.** O Design System Criativo Dodô documenta seus componentes
   em duas classificações: **Existente** (já presente e validado nas 41 telas aprovadas do
   Portal Dodô) e **Proposto** (componente novo, necessário para uma tela ou fluxo futuro,
   ainda sem validação nas telas aprovadas). Todo componente criado depois desta ADR nasce
   classificado como Proposto até ser validado. Essa classificação é parte da filosofia e do
   escopo do Design System Criativo Dodô — organiza como ele é documentado e ampliado — e é
   responsabilidade distinta da política de versionamento (item 9).
9. **Política de versionamento.** A partir desta ADR, o Design System Criativo Dodô passa a
   ter uma política oficial de versionamento. Essa política é mantida como documento próprio,
   separado desta ADR — este registro arquitetural estabelece apenas a obrigatoriedade de sua
   existência, não suas regras de manutenção do dia a dia. A localização física da política
   acompanha a do próprio Design System Criativo Dodô (item 7) e será registrada em
   `PROJECT_SOURCE_OF_TRUTH.md` no momento em que a primeira entrega for publicada.
10. **Relação entre o Design System Criativo Dodô e o Portal.** Nesta fase, o Portal Dodô (as
    41 telas aprovadas) é utilizado exclusivamente como **referência visual** para extrair
    padrões e consolidar o Design System Criativo Dodô — não como algo a ser alterado.
    Concluído o Design System Criativo Dodô, será realizada uma **auditoria** comparando o
    sistema construído com o portal existente (`app/`, `portal-frontend/`); somente essa
    auditoria pode gerar propostas de atualização do portal. A existência do Design System
    Criativo Dodô, por si só, **não implica** alteração automática do produto — qualquer
    mudança no portal decorrente da auditoria segue o fluxo normal do projeto (Produto → UX →
    Layout → Implementação, `CLAUDE.md`).
11. Esta ADR **não** resolve `PROJECT_SOURCE_OF_TRUTH.md` §1 (identidade visual da Landing,
    hoje `app/`). Fica como pendência explícita, separada, a decidir apenas quando houver
    decisão de Produto e UX dedicada sobre migrar a Landing para o Design System Criativo
    Dodô — nunca por extensão automática desta ADR nem da auditoria citada no item 10.

### Consequências

- O Design System Criativo Dodô é construído sem consultar `design-system/` atual,
  `docs/design/archive/*`, `SOBRE A DODÔ.md` (saída de NotebookLM já identificada como
  parcialmente contaminada) ou qualquer Design System citado por skills antigas, exceto para
  eventual consulta histórica pontual e explicitamente marcada como tal.
- As skills que hoje citam o Design System antigo (`tom-dodo`, `planilhas-dodo`, e outras a
  identificar) precisam ser atualizadas para apontar para o Design System Criativo Dodô, como
  tarefa de implementação subsequente — não é parte desta ADR.
- **Nenhuma tela, componente ou token do portal (`app/`, `portal-frontend/`) é alterado por
  esta ADR.** A migração, se e quando decidida, só pode nascer da auditoria descrita no item
  10 da Decisão — nunca como consequência automática da publicação do Design System Criativo
  Dodô. Consistente com a regra do próprio briefing de que "o Design System descreve, não
  altera o portal".
- Divergência entre `ADR-019` antiga (paleta laranja/roxo) e o Design System Criativo Dodô
  (paleta Cotton/Cherry/Maroon/Noir) deixa de ser tratada como conflito a partir desta ADR:
  `ADR-019` está superada, não há duas fontes concorrentes.
- A política de versionamento (item 9) e a classificação Existente/Proposto (item 8) são
  regras operacionais do próprio Design System Criativo Dodô, não desta ADR. Detalhá-las ou
  alterá-las é responsabilidade do documento correspondente e não exige nova ADR, salvo se a
  mudança alterar a decisão de governança registrada aqui.
- A governança como ativo independente (item 2) é a decisão permanente; quem exerce a guarda
  operacional pode mudar ao longo do tempo sem reabrir esta ADR — o que não muda é o próprio
  modelo de governança (ativo independente, consumido por Portal, Landing e produtos futuros,
  nunca definido por eles). Qualquer detalhe técnico de como cada produto consome o Design
  System Criativo Dodô é implementação, não uma reabertura desta ADR.
- `criativododo-interno/MATERIAL PARA DESIGN SYSTEM FINAL/` (item 3) não é versionado neste
  repositório git — mesma situação já aceita para `PLANO_MESTRE_IMPLEMENTACAO_PORTAL_DODO.md`
  (`PROJECT_SOURCE_OF_TRUTH.md` §5). Referenciá-la aqui não a torna parte do controle de
  versão do projeto, nem elimina a necessidade de registrar a localização oficial final em
  `PROJECT_SOURCE_OF_TRUTH.md` quando a primeira entrega for publicada.

---

## ADR-026 — Claude Design como ambiente nativo/operacional do Design System Criativo Dodô; Markdown passa a artefato de apoio

- **Status:** Aceito.
- **Data:** 2026-08-07.
- **Autor da decisão:** responsável do projeto (diretriz explícita em sessão dedicada).
- **Relaciona-se com:** `ADR-025` (acima), `BRIEFING-FINAL-CLAUDE-CODE.md` §2.2 (formatos de
  entrega, parcialmente substituída por esta ADR), `knowledge/PROJECT_SOURCE_OF_TRUTH.md` §8,
  ferramenta `DesignSync` (MCP de leitura/escrita de projetos `claude.ai/design`).

### Contexto

`ADR-025` declarou o Design System Criativo Dodô ativo independente, com
`criativododo-interno/MATERIAL PARA DESIGN SYSTEM FINAL/` como fonte de trabalho provisória, e
deixou registrado como bloqueio a migração para uma conta institucional dedicada ao Design
System (pendência presente em `/inicio` desde 06/08/2026).

O `BRIEFING-FINAL-CLAUDE-CODE.md` (documento de descoberta, não arquitetural), em sua §2.2,
propôs o Markdown como "fonte única de verdade", com HTML, PDF e Figma "gerados a partir dele e
nunca editados diretamente". Essa proposta foi feita antes de existir a conta institucional
definitiva do Claude Design, sem poder testar a ferramenta real de sincronização.

Nesta sessão (07/08/2026), o responsável do projeto confirma que a conta institucional atual é
a conta definitiva do Design System Criativo Dodô, e determina que o Claude Design passa a ser
o ambiente nativo do projeto — invertendo a hierarquia de formatos proposta no briefing.

Verificação técnica feita nesta sessão via `DesignSync`:

- `list_projects` na conta atual retornou zero projetos — nenhum Design System existe ainda
  nesta conta, precisa ser criado.
- O modelo de sincronização da ferramenta é push explícito, em três passos obrigatórios:
  listar/ler → `finalize_plan` (define exatamente o que será escrito/apagado, com aprovação do
  usuário) → `write_files`/`delete_files`. **Não existe edição ao vivo dentro do Claude Design
  que se propague automaticamente de volta para os arquivos locais** — quem edita é sempre a
  sessão local (Markdown/HTML/CSS), que depois empurra para o Claude Design.
- O projeto legado (`5724e6f6-f23e-47fd-b827-ada036276ee7`, citado nas skills `tom-dodo` e
  `planilhas-dodo`, arquivado em
  `docs/design/archive/design-system-legado-laranja-roxo/.design-sync/config.json`) mostra que o
  formato nativo do Claude Design combina três coisas: um pacote CSS (tokens + classes de
  componente), páginas de "guidelines" carregadas de arquivos Markdown locais (campo
  `guidelinesGlob`), e cards de preview HTML por componente (marcador `@dsCard`). Ou seja, tanto
  tokens/componentes quanto o texto narrativo do manual (hoje em Markdown) têm lugar nativo
  dentro do Claude Design — não é só um catálogo de componentes.

### Decisão

1. **O Claude Design passa a ser o ambiente operacional nativo do Design System Criativo Dodô.**
   Toda estrutura que possa existir nativamente lá (tokens de cor/tipografia/espaço como
   variáveis CSS, componentes como cards com preview, páginas de guideline a partir de Markdown)
   deve ser modelada preferencialmente para esse destino.
2. **O Markdown deixa de ser "fonte única de verdade" e passa a artefato de apoio**, com papel
   explícito e limitado a: registrar decisões, documentar regras, facilitar auditoria, preservar
   histórico, apoiar exportações (PDF e outros formatos estáticos que o Claude Design não
   produz). Isso substitui a regra de sincronia do briefing §2.2 ("Markdown é a fonte; HTML, PDF
   e Figma nunca editados diretamente") apenas na direção Markdown → Claude Design; a regra de
   que artefatos derivados nunca são editados manualmente continua valendo para HTML e PDF
   gerados.
3. **Fluxo de sincronização.** Autoria acontece localmente (Markdown para guidelines, HTML+CSS
   para tokens/componentes/preview); a atualização do Claude Design é um passo explícito de push
   (`DesignSync`: listar → `finalize_plan` aprovado pelo usuário → `write_files`). O Claude
   Design não é editado diretamente como fonte primária nesta arquitetura — é o destino
   operacional, não o editor.
4. **Figma (briefing §2.1, pendência A09) permanece decisão separada**, não resolvida por esta
   ADR. Continua bloqueada pela ausência de autorização do conector remoto do Figma.
5. **PDF estático (briefing §15.3) continua sendo gerado a partir do Markdown**, porque o Claude
   Design não produz esse formato. Essa é uma das funções explícitas que o Markdown mantém como
   artefato de apoio (item 2).
6. Esta ADR não define a localização física definitiva do Design System Criativo Dodô no
   repositório (permanece pendência de `ADR-025` item 7, resolvida quando a primeira entrega for
   publicada) — trata exclusivamente de qual ambiente é operacionalmente central durante a
   construção.

### Consequências

- O plano de construção da Fase 2 em diante prioriza produzir tokens e componentes já no formato
  nativo do Claude Design (CSS + preview HTML com marcador `@dsCard`), com as páginas de
  guideline (texto de marca, regras de uso) escritas em Markdown e sincronizadas via
  `guidelinesGlob`, em vez de produzir primeiro um manual Markdown monolítico e só depois
  derivar o Claude Design.
- Cada entrega de conteúdo para o Claude Design exige um `finalize_plan` explícito, aprovado
  pelo usuário, antes de qualquer escrita — não há atalho de escrita direta.
- O projeto Claude Design legado (`5724e6f6-...`) permanece arquivado, apenas consulta pontual,
  nunca reaproveitado como base.
- HTML e PDF continuam existindo como formatos derivados do Markdown (briefing §2.2), não do
  Claude Design — o Claude Design não substitui a função desses dois formatos.

---

## ADR-027 — Núcleo do Design System Criativo Dodô (Fundação, Tokens, Componentes) congelado como versão 1.0

- **Status:** Aceito.
- **Data:** 2026-08-07.
- **Autor da decisão:** responsável do projeto (diretriz explícita em sessão dedicada).
- **Relaciona-se com:** `ADR-025` (Design System como ativo independente), `ADR-026` (Claude
  Design como ambiente nativo), projeto Claude Design `d7120c51-f816-43ee-87fa-092906548e99`
  ("Design System — Criativo Dodô").

### Contexto

Ao longo desta sessão (07/08/2026), as três camadas fundamentais do Design System Criativo Dodô
foram construídas por ciclos incrementais, sempre com aprovação do responsável do projeto ao
final de cada etapa: Fundação (identidade, princípios, tipografia, espaçamento, grid), Tokens
(cor, tipografia, espaçamento, raio, sombra, movimento, estrutura) e Componentes (13 famílias,
18 componentes reais catalogados). Uma auditoria cruzada de consistência foi executada entre as
três camadas, seguida de um ciclo de consolidação que corrigiu os erros encontrados, e uma
segunda auditoria confirmou ausência de referências quebradas, componentes órfãos, tokens
órfãos, páginas duplicadas ou conceitos documentados em mais de um lugar.

Com o núcleo auditado e consolidado, o responsável do projeto determina que essas três camadas
passam a um regime de estabilidade, para que a construção das camadas seguintes (Padrões,
Templates, Aplicações) consuma o núcleo já construído em vez de reabri-lo continuamente.

### Decisão

1. **Fundação, Tokens e Componentes do Design System Criativo Dodô são congelados como versão
   1.0 do núcleo**, a partir de 07/08/2026.
2. **Alteração de qualquer conteúdo dessas três camadas só é permitida por um destes motivos:**
   correção de erro comprovado (não opinião ou preferência), evolução arquitetural do próprio
   Design System, ou decisão explícita do responsável do projeto. Refatoração espontânea ou
   melhoria incremental contínua, sem um desses três motivos, não é permitida.
3. **Padrões, Templates e Aplicações consomem o núcleo, nunca o reconstroem.** Inconsistência
   encontrada durante a construção dessas camadas é registrada normalmente (mesma disciplina de
   classificação de pendências já em uso: bloqueante, importante, editorial, futura). Só cabe
   propor alteração do núcleo quando a inconsistência impedir estruturalmente a evolução do
   sistema — o caso comum é registrar e seguir usando o núcleo como está.
4. Esta ADR não impede a criação de tokens ou componentes genuinamente novos nas camadas
   seguintes, quando um padrão realmente novo e reutilizável surgir — impede é a reabertura ou
   reavaliação do que já foi construído e auditado no núcleo, sem um dos três motivos do item 2.

### Consequências

- Decisões já registradas como "divergência exige decisão humana" (raio médio, nomenclatura da
  camada z-index, `texto-terciario`) continuam abertas exatamente como estão — resolvê-las é uma
  decisão explícita do responsável do projeto (item 2), não uma tarefa automática desta ADR.
- Um novo ADR ou decisão explícita registrada é o único caminho para reabrir o núcleo; não é
  reaberto por interpretação de conveniência durante Padrões, Templates ou Aplicações.

---

## Como usar este documento

Toda decisão arquitetural nova e permanente deste projeto (que não seja um detalhe de
implementação de uma decisão já tomada) deve ser adicionada aqui como um novo ADR
sequencial (`ADR-005`, `ADR-006`, ...), seguindo o mesmo formato: Status, Data, Contexto,
Decisão, Consequências. Não reutilizar a numeração da série antiga
(`knowledge/Arquitetura/ADR-*.md`) — são índices independentes.
