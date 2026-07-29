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

- **Status:** Aceito.
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

## Como usar este documento

Toda decisão arquitetural nova e permanente deste projeto (que não seja um detalhe de
implementação de uma decisão já tomada) deve ser adicionada aqui como um novo ADR
sequencial (`ADR-005`, `ADR-006`, ...), seguindo o mesmo formato: Status, Data, Contexto,
Decisão, Consequências. Não reutilizar a numeração da série antiga
(`knowledge/Arquitetura/ADR-*.md`) — são índices independentes.
