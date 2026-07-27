# PORTAL_BACKLOG.md

> Backlog do Portal do Criativo DODÔ, organizado em Épicos → Features → Histórias de
> usuário → Tarefas técnicas, na sequência recomendada de implementação. Baseado nas regras
> e SPECs documentadas em `PORTAL_BRIEFING.md`/`PORTAL_ARQUITETURA.md`. Onde uma tarefa
> depende de uma decisão ainda não tomada (ver `PORTAL_BRIEFING.md` §13), isso é sinalizado
> explicitamente — **nenhuma dessas decisões é assumida ou inventada aqui**.

---

## EPIC 0 — Decisões bloqueantes (pré-requisito de todo o resto)

**Objetivo:** resolver as decisões de produto/arquitetura que mudam o formato do schema e
da autenticação, para que nenhum código de domínio precise ser reescrito depois.
**Prioridade:** P0 — bloqueia todos os demais épicos.
**Dependências:** nenhuma (é o ponto de partida).

### Feature 0.1 — Definição de stack
- **História:** Como responsável do projeto, quero decidir a stack de backend/frontend do
  Portal, para que a implementação tenha um ponto de partida técnico único.
- **Tarefa técnica:** registrar a decisão (Laravel+React, outra stack, ou integração com
  legado) em um ADR novo. **Critério de aceite:** ADR aprovado e commitado antes de qualquer
  código de domínio ser escrito.

### Feature 0.2 — Reconciliação de vocabulário de domínio
- **História:** Como time de desenvolvimento, quero um único vocabulário de entidades
  (Contrato Soberano vs. Sistema B), para que o schema não misture duas linguagens.
- **Tarefa técnica:** decidir e registrar em ADR qual vocabulário rege o código novo (ver
  recomendação em `PORTAL_ARQUITETURA.md` §8). **Critério de aceite:** ADR aprovado listando
  o mapeamento de equivalência entre os dois vocabulários, para referência histórica.

### Feature 0.3 — Modelo de autenticação da Parceira
- **História:** Como Parceira, quero um mecanismo de login definido, para acessar o Portal
  com segurança.
- **Tarefa técnica:** decidir entre os 3 modelos documentados (cupom+CNPJ, e-mail/senha,
  Google OIDC) ou um quarto não documentado. **Critério de aceite:** ADR aprovado
  especificando o mecanismo escolhido e o motivo da escolha.

### Feature 0.4 — Escopo do ator Marca
- **História:** Como responsável do projeto, quero decidir se o Portal (e o sistema como um
  todo) suporta múltiplas Marcas como tenants externos, para dimensionar o modelo de dados
  corretamente desde o início.
- **Critério de aceite:** decisão registrada — "Marca implementado no MVP" ou "Marca fora do
  MVP, single-tenant".

### Feature 0.5 — Gate de elegibilidade de pagamento
- **História:** Como Administrador, quero uma regra única e não contraditória de quando um
  pagamento pode ser liberado, para evitar liberações incorretas.
- **Critério de aceite:** decisão registrada resolvendo a contradição entre Q-04 (Sistema A,
  "já resolvida") e P0-1 (Sistema B, "em aberto").

### Feature 0.6 — LGPD (Q-09)
- **História:** Como responsável pelo projeto, quero uma política de retenção/expurgo de
  PII antes de o Portal expor qualquer dado pessoal.
- **Critério de aceite:** política documentada (retenção, consentimento, direito ao
  esquecimento) — não pode continuar como "débito herdado" antes do go-live do Portal.

---

## EPIC 1 — Fundação (Acesso + base técnica)

**Objetivo:** ter login funcional e a identidade visual da Landing já conectada ao Portal,
antes de qualquer tela de negócio.
**Prioridade:** P0 — pré-requisito de todas as telas subsequentes.
**Dependências:** EPIC 0 (stack, auth, vocabulário decididos).

### Feature 1.1 — Setup do projeto
- **Histórias/Tarefas técnicas:**
  - Inicializar o repositório/estrutura do backend escolhido em EPIC 0.
  - Inicializar o frontend do Portal reaproveitando o ferramental já validado na Landing
    (React + Vite + TypeScript, `app/package.json` como referência de versões).
  - Conectar os tokens visuais extraídos de `app/src` (cor, tipografia, espaçamento) ao
    frontend do Portal — **nunca partir de `design-system/index.html` isoladamente**; ler o
    código de `app/` como fonte primária (ver `PORTAL_ARQUITETURA.md` §0).
  - **Critério de aceite:** primeira tela (mesmo que só Login) já nasce com a paleta/
    tipografia corretas, sem "scaffolding sem identidade visual" — problema registrado
    repetidamente nas tentativas anteriores documentadas.

### Feature 1.2 — Autenticação e sessão (SPEC-025 e/ou SPEC-035, conforme EPIC 0.3)
- **História:** Como Parceira, quero fazer login no Portal com o mecanismo decidido, para
  acessar minhas informações.
- **Tarefas técnicas:**
  - Implementar o mecanismo de autenticação escolhido.
  - Implementar sessão com expiração deslizante (RN-18: 6h, renovada a cada interação).
  - Se o modelo escolhido reaproveitar bloqueio por tentativas (só faz sentido para
    credencial adivinhável, não para OIDC — ver `PORTAL_ARQUITETURA.md` §9.2-A):
    bloqueio de 15 min após 5 tentativas (RN-17).
- **Critério de aceite:** Parceira autentica, recebe sessão; sessão expira após 6h de
  inatividade; se aplicável, bloqueio funciona após 5 tentativas falhas.

### Feature 1.3 — Middleware de isolamento de dados
- **História:** Como sistema, preciso garantir que toda consulta/escrita do Portal seja
  automaticamente restrita à Parceira da sessão corrente, nunca a um parâmetro vindo do
  cliente (SPEC-035 §8.3).
- **Critério de aceite:** tentativa de acessar dado de outra Parceira (via manipulação de
  parâmetro) é recusada em todos os endpoints do Portal.

---

## EPIC 2 — Conteúdo e Pendências (SPEC-027)

**Objetivo:** entregar o módulo de maior frequência de uso da Parceira.
**Prioridade:** P1.
**Dependências:** EPIC 1 (Acesso). Depende também da existência mínima de `Entrega`/
`Briefing` (mesmo que como dados gerados por seed ou por uma tela administrativa simples,
já que M4/M3 não são o foco desta missão mas precisam existir para o Portal ter dado real).

### Feature 2.1 — Ver pendências do mês (UC-027.01)
- **História:** Como Parceira, quero ver a lista de Entregas pendentes da minha competência
  corrente, em ordem cronológica, para saber o que preciso produzir.
- **Critério de aceite:** lista mostra só Entregas da Parceira autenticada; competência sem
  atividade mostra lista vazia (CB-02).

### Feature 2.2 — Ler briefing do item (UC-027.02)
- **História:** Como Parceira, quero abrir o briefing de uma Entrega específica, para saber
  o que produzir (look, data de entrega, data de postagem, orientação criativa).
- **Critério de aceite:** cada Entrega exibe o bloco de briefing correspondente ao seu
  formato (Reel/Carrossel/Stories 1/Stories 2).

### Feature 2.3 — Enviar material (UC-027.03)
- **História:** Como Parceira, quero enviar o arquivo de uma Entrega, para que a equipe
  possa revisar.
- **Tarefas técnicas:** implementar upload conforme fluxo de `PORTAL_ARQUITETURA.md` §5;
  transicionar Entrega para `EmRevisao` só após gravação confirmada.
- **Critério de aceite:** upload bem-sucedido move a Entrega para `EmRevisao`; falha no
  upload não altera o estado (PC-03); sessão expirada durante upload exige reautenticação
  (CB-01).

---

## EPIC 3 — Financeiro e Histórico (SPEC-030)

**Objetivo:** dar visibilidade financeira à Parceira.
**Prioridade:** P2.
**Dependências:** EPIC 2 (Entrega precisa existir para o gate de elegibilidade fazer
sentido) e existência mínima de `Pagamento`/`ObrigacaoFinanceira` (mesmo que como stub
gerido só pela equipe).

### Feature 3.1 — Selecionar período (UC-030.03)
- **História:** Como Parceira, quero escolher entre os meses em que tive atividade, para
  consultar meu financeiro/histórico daquele período.
- **Critério de aceite:** só aparecem períodos com atividade real da Parceira (RN-04/CB-01).

### Feature 3.2 — Ver financeiro do período (UC-030.01)
- **História:** Como Parceira, quero ver o total previsto e o total pago no período
  selecionado.
- **Critério de aceite:** pagamento `EmAberto` conta em previsto, não em pago (CB-02).

### Feature 3.3 — Consultar histórico (UC-030.02)
- **História:** Como Parceira, quero consultar meu histórico de conteúdo e pagamentos
  arquivados por período.
- **Critério de aceite:** histórico é somente leitura (INV-02); isolado por Parceira.

---

## EPIC 4 — Perfil (SPEC-032)

**Objetivo:** permitir que a Parceira mantenha seus próprios dados de contato/pagamento
atualizados.
**Prioridade:** P2 — pode ser paralelizado com EPIC 3 se houver mais de uma pessoa
disponível; menor risco e menos regras de negócio críticas entre os módulos do Portal.
**Dependências:** EPIC 1 (Acesso).

### Feature 4.1 — Ver perfil (UC-032.01)
- **História:** Como Parceira, quero ver meus dados de PIX, e-mail e endereço atuais.

### Feature 4.2 — Editar PIX/e-mail (UC-032.02)
- **História:** Como Parceira, quero atualizar meu PIX e e-mail de contato.
- **Critério de aceite:** edição não altera Condição Comercial nem vínculo Ativa/Inativa
  (RN-04/CB-02 — tentativa de editar campo comercial é recusada).

### Feature 4.3 — Editar endereço por CEP (UC-032.03)
- **História:** Como Parceira, quero informar meu CEP e ter o endereço recomposto
  automaticamente.
- **Critério de aceite:** falha do serviço de CEP não impede salvar os dados principais
  (RN-02/CB-01 — endereço pode ficar incompleto, mas o resto salva).

---

## EPIC 5 — Identidade e Acesso avançada (SPEC-035, condicional)

**Objetivo:** só se o modelo federado (Google OIDC) for escolhido em EPIC 0.3. Entrega
onboarding nativo e moderação administrativa.
**Prioridade:** P3 — evolução do mecanismo de sessão, não pré-requisito dele.
**Dependências:** EPIC 1 (mecanismo básico de autenticação já validado em uso real).

### Feature 5.1 — Onboarding federado (Cap. 5.1/5.3 da SPEC-035)
- **História:** Como novo usuário, quero fazer login com minha conta Google e preencher meu
  cadastro inicial, se ainda não existir.
- **Critério de aceite:** conta nasce `PENDING`; navegação operacional bloqueada até
  aprovação.

### Feature 5.2 — Vinculação de identidade a Parceira pré-existente (Cap. 5.1-A)
- **História:** Como Influenciadora já cadastrada, quero vincular meu login federado ao meu
  cadastro existente, com confirmação explícita minha.
- **Critério de aceite:** vinculação nunca é automática/silenciosa — exige confirmação
  manual da usuária (RN-02 de SPEC-035).

### Feature 5.3 — Moderação administrativa (Cap. 5.4/5.5)
- **História:** Como Administrador, quero aprovar ou rejeitar cadastros pendentes.
- **Critério de aceite:** só Administrador pode transicionar `PENDING → ACTIVE/REJECTED`
  (RN-04); nenhuma aprovação automática por prazo.

### Feature 5.4 — Bootstrap do primeiro Administrador (RN-07)
- **Tarefa técnica:** provisionar manualmente o primeiro registro Administrador `ACTIVE`,
  fora do fluxo padrão de onboarding.

---

## Transversal — Infraestrutura de produção

**Prioridade:** acompanhamento contínuo em paralelo a todas as fases, não deveria atrasar o
desenvolvimento, mas precisa de decisão antes do go-live.
**Itens:** confirmar disponibilidade real de PostgreSQL na Locaweb, resolver bloqueio de
SSH, reconfigurar o apontamento do subdomínio do Portal, criar banco de dados de produção.
Ver `knowledge/Deploy/INFRAESTRUTURA.md` para o detalhamento campo a campo.

---

## Ordem recomendada, resumida

```
EPIC 0 (decisões) → EPIC 1 (fundação/acesso) → EPIC 2 (conteúdo)
   → EPIC 3 (financeiro) ∥ EPIC 4 (perfil, paralelizável)
      → EPIC 5 (identidade avançada, só se aplicável)
[infraestrutura de produção corre em paralelo a partir de EPIC 1]
```
