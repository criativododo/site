# PORTAL_BRIEFING.md

> Documento executivo de entrada para a próxima sessão de desenvolvimento do **Portal do
> Criativo DODÔ**. Produzido por leitura integral (ou, onde o arquivo excedia limite de
> leitura, por amostragem dirigida) de `knowledge/`, `design-system/`, `README.md`,
> `CLAUDE.md`, `DESIGN.md`, todos os ADRs de `knowledge/Arquitetura/`, e da estrutura atual
> de `app/src`.
>
> **Regra seguida na produção deste documento:** nada foi inventado. Onde a documentação
> existente diverge, contradiz a si mesma, ou está incompleta, isso é reportado como tal —
> nunca resolvido silenciosamente. Onde uma informação simplesmente não existe em nenhuma
> fonte lida, isso é dito explicitamente e marcado **PENDENTE**.

---

## 0. O achado mais importante — leia isto antes de tudo

Este repositório (`/Users/danielperrut/criativododo`) contém **apenas a Landing Page**
(`app/`, React + Vite + GSAP, poucos commits, branch única `main`). Não existe, neste
repositório, nenhum código de backend, nenhum frontend de Portal, nenhuma pasta `backend/`,
`frontend/`, `src/` (Apps Script) ou `composer.json`/`*.php` — confirmado por busca em toda
a árvore.

Ao mesmo tempo, `knowledge/` contém uma documentação de produto e arquitetura **muito rica e
madura** — dezenas de SPECs marcadas `[x]` implementadas, ADRs aprovados, testes "verdes" —
mas **todo esse código e ambiente pertencem a um repositório e uma implantação que não
existem mais neste projeto** (diretório antigo `/Users/danielperrut/ela-influencia`,
removido intencionalmente). A infraestrutura Locaweb descrita nunca chegou a servir essa
aplicação em produção.

**Consequência prática:** tudo em `knowledge/` deve ser lido como **especificação de
requisitos e histórico de decisões de domínio**, não como descrição do estado físico atual
do produto. A próxima sessão de implementação do Portal começa de uma base de código vazia
(só a Landing existe).

**Fonte de verdade visual (decisão registrada nesta sessão, ver §11):** a **Landing Page
implementada em `app/`** é hoje a implementação oficial da identidade visual do Criativo
DODÔ e deve servir de principal referência para toda evolução visual do Portal — linguagem
visual, composição, hierarquia, tipografia, paleta, espaçamentos, componentes, animações,
responsividade e aplicação de marca devem ser extraídos dela. O `design-system/index.html`
e o `DESIGN.md` produzidos nesta mesma sessão são **documentação auxiliar derivada do
código**, não a referência principal, e podem ser refeitos no futuro. Em caso de qualquer
divergência entre o Design System HTML e a Landing Page real, **a Landing Page prevalece**.
Isso também substitui, para fins práticos deste projeto, o que `ADR-019` (ver §11) declara
sobre um "Manual de Design DODÔ" em `docs/design/manual/` — esse caminho não existe
fisicamente neste repositório; a Landing em `app/` é a referência corrente até que um novo
Design System oficial seja produzido e aprovado.

---

## 1. Visão Geral

**O que é o Portal:** a superfície onde a **parceira/influenciadora** acompanha, sozinha e
sem depender da equipe, as suas colaborações comerciais com o Criativo Dodô — pendências de
conteúdo do mês, o briefing de cada entrega, o financeiro (previsto x pago), o histórico e o
próprio perfil (PIX, e-mail, endereço). É um módulo dentro de um sistema maior de gestão do
programa de parcerias (cadastro, campanhas, briefings, upload e aprovação de material,
pagamentos, logística, contratos, histórico), mas é o único módulo operado pela própria
influenciadora — todo o resto é operado pela equipe interna (Administrador).

## 2. Objetivo do Portal

Conforme `knowledge/Produto/PRD.md`, oferecer "uma plataforma única para gerenciamento do
ciclo operacional das parcerias comerciais... e o Portal onde a própria influenciadora
acompanha suas colaborações." Objetivo funcional central: dar autoatendimento à
influenciadora sobre o próprio ciclo de colaboração — o que precisa entregar, quando, e
quanto vai receber — sem depender de mensagens manuais da equipe.

**Nota de nomenclatura:** em nenhum dos ~40 arquivos de `knowledge/Produto/` o nome
"DODÔ"/"Criativo Dodô" aparece — foram escritos sob os nomes "ELÃ | influência" e "TEAR"
(pré-`ADR-020`). A ponte nome-antigo → nome-atual só existe em `ADR-020` e nos documentos de
`Workspace/`/`Deploy/`. Trate o conteúdo de `knowledge/Produto/` como válido em regra de
negócio, mesmo com o nome de marca desatualizado.

## 3. Problema que resolve

Hoje (na documentação-fonte, referente ao legado) a influenciadora dependia de mensagens
manuais da equipe para saber o que precisa entregar, quando, e quanto vai receber. O Portal
existe para dar a ela autoatendimento sobre o próprio ciclo de colaboração, com isolamento
estrito de dados (só vê o que é dela — regra repetida em toda SPEC do Portal, SPEC-025/027/
030/032, ligada à pendência de LGPD Q-09, ver §12).

## 4. Perfis de usuários

Existem **descrições conflitantes** do modelo de papéis entre os documentos. Reporto cada
uma com a fonte, sem resolver qual prevalece — é a pendência mais crítica do §13.

### 4.1 Influenciadora / Parceira
- **Quem é:** parceira de conteúdo contratada para produzir e publicar material em troca de
  produto e/ou pagamento (`PRD.md` §8).
- **O que faz:** recebe briefing mensal, produz conteúdo (Reel/Carrossel/Stories), envia
  material, acompanha pagamento e histórico.
- **O que vê/edita no Portal:** pendências de conteúdo do mês, briefing do item, financeiro
  (previsto x pago) e histórico por período, perfil (PIX, e-mail, endereço). **Não edita**
  Condição Comercial nem o próprio vínculo Ativa/Inativa.
- **Isolamento:** só vê os próprios dados/entregas/pagamentos.
- **Modelo de autenticação — três descrições incompatíveis coexistem, nenhuma em código
  neste repositório:**
  1. Cupom + senha = 5 primeiros dígitos do CNPJ (PRD/V1) — "segredo de baixa entropia por
     desenho atual", recomendado para abandono.
  2. E-mail/senha via Laravel (Sistema B) — sem bloqueio por tentativas.
  3. Login federado Google Identity/OIDC (SPEC-035) — sem senha local, conta nasce
     `PENDING`, precisa aprovação de Administrador para virar `ACTIVE`; a Influenciadora
     pré-existente passa por um fluxo explícito de vinculação de identidade por confirmação
     manual (§5.1-A da SPEC-035), nunca associação automática silenciosa.
  Pendência aberta explícita (Q-07), mesmo SPEC-035 se descrevendo como tendo "resolvido a
  arquitetura de sessão" — o mecanismo de credencial em si permanece indefinido para o
  produto a ser implementado do zero.

### 4.2 Administrador
- Equipe interna com "privilégios globais de leitura e escrita em todo o ecossistema"
  (SPEC-035 §4.1); único papel que aprova/rejeita/ativa/inativa contas (RN-04 de SPEC-035).
- No PRD (V1) e em boa parte das SPECs numeradas, tratado como **um único operador sem
  papéis diferenciados** — "papéis e permissões diferentes dentro da equipe" é
  explicitamente fora de escopo do PRD (§12).
- No Sistema B (Laravel, código ausente deste repo), só `ADMIN` era de fato aplicado nas
  rotas; `GESTOR_MARCA`/`INFLUENCIADORA` existiam só como rótulo.
- **Bootstrap do primeiro Administrador (RN-07, SPEC-035):** como a ativação depende de um
  Administrador já `ACTIVE`, o primeiro registro Administrador é provisionado manualmente
  (fora do fluxo de onboarding padrão) — exceção operacional documentada, não decidida aqui
  para o produto a ser implementado do zero.

### 4.3 Marca (ator)
- Definido em SPEC-035 §4.2 como "empresas parceiras comerciais e clientes", acesso restrito
  aos próprios dados/campanhas/briefings/orçamentos.
- **Explicitamente não implementado em nenhuma fonte** — a própria SPEC-035 marca isso como
  "decisão de escopo de produto que só o responsável do projeto pode tomar", "não inferível
  de nenhum documento existente". O PRD (V1) trata o sistema como single-tenant.

### 4.4 Papéis citados mas sem comportamento definido
- `GESTOR_MARCA` — valor de enum no Sistema B, nenhuma tela/regra o trata diferente de
  Influenciadora/Admin.
- `Assessoria` — entidade cogitada (agência que representa influenciadoras), backlog V2.6,
  classificada SHOULD, **não existe em nenhum sistema**. Quem recebe pagamento quando há
  Assessoria é decisão de produto pendente.

**Pendência transversal (LGPD, Q-09):** citada em quase toda SPEC do Portal como "débito
herdado, não bloqueante", nunca resolvida formalmente antes do Portal expor dados pessoais.

## 5. Módulos

Conforme `TASK_ROUTER.md` (EPIC 08 — Portal da Influenciadora) e as SPECs numeradas:

| Módulo | Escopo | SPEC |
|---|---|---|
| M1 · Cadastro e Base | Formulário externo, ativação manual, dados contratuais | SPEC-001/002/003 |
| M2 · Colaboração Mensal | Compilação do mês, snapshot comercial | SPEC-005 |
| M3 · Briefing | Registro por formato, cálculo automático de datas | SPEC-009 |
| M4 · Conteúdo/Entregas | Máquina de 4 estados, upload, aprovação, publicação | SPEC-012 |
| M5 · Logística/Envio | Confirmação de endereço, rastreio | SPEC-016 |
| M6 · Financeiro/Pagamentos | Lançamento, gate de elegibilidade | SPEC-020 |
| M7 · Contratos/Documentos | Geração de Contrato/Briefing formal | SPEC-023 |
| **M8 · Portal da Parceira** | **Acesso, Conteúdo, Financeiro/Histórico, Perfil** | **SPEC-025/027/030/032** |
| M9 · Arquivamento/Histórico | Automático e manual, selagem de competência | SPEC-034 |
| M-ID · Identidade e Acesso | Onboarding federado, moderação de conta (se adotado) | SPEC-035 |

**M8 é o escopo direto desta missão**, mas depende funcionalmente de M1–M7/M9 (a
influenciadora só vê o que esses módulos já produziram) e opcionalmente de M-ID (se o
modelo federado de autenticação for escolhido — ver §13).

## 6. Funcionalidades

### 6.1 M8 · Portal da Parceira — detalhamento por sub-módulo

- **Acesso (SPEC-025):** autenticar Parceira; bloquear por tentativas (modelo legado, 5
  tentativas → 15 min); manter sessão deslizante (6h, renovada a cada interação).
- **Conteúdo (SPEC-027):** ver pendências do mês (lista de Entregas da competência
  corrente, ordem cronológica); ler o briefing por item; enviar material (upload → Entrega
  passa a `EmRevisao`).
- **Financeiro/Histórico (SPEC-030):** ver total previsto x total pago no período
  selecionado; consultar histórico de conteúdo e pagamentos por período; selecionar período
  (só competências com atividade da Parceira).
- **Perfil (SPEC-032):** ver perfil (PIX, e-mail, endereço); editar PIX/e-mail; editar
  endereço (recomposição automática por CEP, RN-01; falha de CEP não bloqueia salvar,
  RN-02); **não** edita Condição Comercial nem vínculo Ativa/Inativa.

### 6.2 Funcionalidades explicitamente não implementadas em nenhum sistema existente
(backlog `V2.6`, por prioridade): geração de contrato em PDF (MUST), suporte a CPF (MUST),
consentimento LGPD no cadastro público (MUST), tela de Documentos/Histórico não-placeholder
(MUST), modelagem de Logística (MUST), assinatura eletrônica (SHOULD), cadastro/vínculo de
Assessorias (SHOULD), importação de histórico V1→Postgres (SHOULD), janela de escolha de
looks/Permutas (SHOULD).

### 6.3 Explicitamente fora de escopo (PRD §12) — não presumir como requisito herdado
Negociação/recusa de briefing pela influenciadora; papéis diferentes na equipe da marca;
integração com gateway de pagamento (PIX é só informado/cobrado por mensagem; pagamento
acontece fora do sistema); notificações automáticas; múltiplas marcas/clientes; app móvel
nativo; dashboards de gestão.

## 7. Regras de negócio

### 7.1 Regras definidas (numeração do PRD/SPECs)

| ID | Regra | Origem |
|---|---|---|
| RN-01 | Toda influenciadora nasce `STATUS = OFF`; ativação é decisão manual da equipe | PRD |
| RN-02 | Endereço resolvido automaticamente por CEP; CEP automático nunca sobrescreve dado manual | PRD |
| RN-03 | Só influenciadoras `ON`/`Ativa` entram em novo ciclo mensal ou geração de contrato | PRD |
| RN-04 | Data de aprovação interna = data de postagem − 7 dias, avançada até o próximo dia útil do **Calendário Operacional** (única fonte da verdade — fim de semana, feriado nacional/estadual/municipal aplicável, ou ponto facultativo institucional adotado pela empresa); critério operacional, não jurídico; heurística legada de sexta-feira como gatilho **abandonada deliberadamente**; sempre derivada | PRD (regra-base, superada quanto à sexta-feira) + SPEC-009 v1.2 (ADR-014) |
| RN-05 | Texto "mês+ano" interpretado; sem ano, assume o ano corrente | PRD |
| RN-06 | Uma pendência por unidade contratada de cada formato | PRD |
| RN-07 | Ciclo de vida da Entrega: 4 estados (`AguardandoMaterial→EmRevisao→Aprovado→Publicado`) | SPEC-012 |
| RN-08 | Ao publicar, arquivamento automático | SPEC-012/034 |
| RN-09 | Todo pagamento nasce `EmAberto` | SPEC-020 |
| RN-10 | Visão financeira no Portal: pendente → aprovado → pago | SPEC-030 |
| RN-11 | Ao pagar, arquivamento automático | SPEC-020/034 |
| RN-12 | Pagamentos avulsos permitidos fora do ciclo padrão | SPEC-020 |
| RN-13 | Toda influenciadora ativa recebe, por mês, registro logístico `Aguardando Confirmação` | SPEC-016 |
| RN-14 | Ao ser entregue, arquivamento automático | SPEC-016/034 |
| RN-15 | Contrato só para `ON`/Ativa; briefing formal só para sinalizadas "SIM" | SPEC-023 |
| RN-16 | Acesso por cupom + senha (5 dígitos do CNPJ) — modelo legado, recomendado abandono | PRD/SPEC-025 |
| RN-17 | Bloqueio de 15 min após 5 tentativas incorretas | SPEC-025 |
| RN-18 | Sessão de 6h com renovação deslizante | SPEC-025 |
| RN-27.01 | A Parceira só vê as próprias Entregas | SPEC-027 |
| RN-27.02 | Ao concluir upload, Entrega passa a `EmRevisao` | SPEC-027 |
| RN-30.04 | Período selecionável = competências com atividade da Parceira | SPEC-030 |
| RN-32.01 | Endereço recomposto a partir do CEP em qualquer edição de CEP/número/complemento | SPEC-032 |
| RN-32.02 | Falha do serviço de CEP não impede salvar os dados principais | SPEC-032 |

### 7.2 Regras adicionais (auditoria do Sistema B, Laravel — código ausente deste repo,
regras ainda válidas como referência)
- Consentimento LGPD obrigatório a cada edição de dados da Parceira.
- Campos contratuais (razão social, canais/prazo de uso de imagem) só editáveis pela equipe.
- Perfil considerado incompleto se faltar CEP, rua, cidade ou UF.
- Tipo de entregável imutável após criado.
- Upload de material bloqueado se não houver briefing publicado para aquele tipo, ou se a
  cota contratada já foi atingida.
- Aprovar/reprovar material só quando pendente; não é possível reprovar duas vezes.
- Congelamento de participação (`ADR-018`, Sistema B): trava simples de 4 campos comerciais
  (`valor_contratado`, `reels_qtd`, `carrossel_qtd`, `stories_qtd`) após `congelado_em` ser
  gravado — **não** copia dados relacionados nem audita quem congelou; Briefing vinculado
  continua 100% editável mesmo após o congelamento (gap consciente, não corrigido).

### 7.3 PENDENTE — ver tabela completa em §13.

## 8. Integrações

| Integração | Propósito | Status |
|---|---|---|
| CEP (BrasilAPI no PRD / ViaCEP no Sistema B) | Preenchimento automático de endereço | Nomes de provedor divergem entre fontes — flag, não resolvido |
| Transportadora (BRComerce) | Rastreio logístico | Só no domínio do Sistema A |
| Google Drive | Armazenamento de material enviado | `ADR-017`: OAuth de conta dedicada (refresh_token via Authorization Code + loopback local), não Service Account Key (bloqueada por Org Policy `iam.disableServiceAccountKeyCreation`); nenhum ambiente de produção está de fato servindo hoje |
| Google Docs/AutoCrat (legado) → dompdf/Browsershot (proposto) | Geração de Contrato/Briefing formal | Não implementado em nenhum sistema vivo |
| Adobe Acrobat Sign | Assinatura eletrônica | Proposto (SHOULD), não implementado; risco de custo recorrente sinalizado |
| Google Identity (OIDC/OAuth2) | Autenticação federada da influenciadora | Especificado em detalhe (SPEC-035 Cap. 9-10), nunca implementado no que sobrevive neste repositório |
| SMTP/e-mail transacional | Convite, reset de senha | Descrito como inexistente até no Sistema B (`MAIL_MAILER=log`) |
| Gateway de pagamento | — | **Explicitamente fora de escopo** — PIX é só informado/cobrado por mensagem |

## 9. Entidades

Há **dois vocabulários de entidade não reconciliados** nas fontes. Reporto os dois.

### 9.1 Vocabulário "Contrato Soberano" (Sistema A / SPECs — linguagem ubíqua oficial,
`CONTRATO_SOBERANO.md`, `ADR-002`/`ADR-012`)

- **Parceira** (agregado raiz) — fonte única da condição comercial e identidade da
  colaboração. VO `CondicaoComercial` (valor, entregáveis, prazo/canais de uso).
- **Cadastro** — entidade de entrada, candidata a promoção para Parceira.
- **Colaboração Mensal** (agregado raiz) — chave `(Parceira × MesReferencia)`; contém
  Snapshot Comercial imutável; materializada por Briefing, Entrega, Envio, Pagamento.
- **Briefing** — 1:1 por Colaboração Mensal, até 4 blocos por formato.
- **Entrega** (canônico desde `ADR-012`; termo banido: `Ativação`) — 1 unidade de conteúdo;
  enum `AguardandoMaterial|EmRevisao|Aprovado|Publicado`.
- **Envio** (canônico desde `ADR-012`; termos banidos: `Fluxo Logístico`/`EnvioLogistico`) —
  2 máquinas de estado (revisão de dados / jornada física); PII nunca persistida na própria
  tabela.
- **Pagamento** (Obrigação Financeira da Colaboração) — enum `EmAberto|Aprovado|Pago`.
- **Documento** — Contrato/Briefing formal, gerado a partir de Parceira + Briefing.
- **Usuario/Identidade** (SPEC-035) — bounded context próprio, referencia Parceira só por
  `INFLU_KEY` (ligação fraca, nunca duplica atributos de negócio).
- **Value Objects:** `ChaveInfluenciadora`, `MesReferencia`, `PIX`, `CNPJ`, `Endereco`,
  `CondicaoComercial` — PII (`PIX`, `CNPJ`, `Endereco`) nunca deve ser exposta em logs.
- **Eventos de domínio:** `CadastroRecebido`, `ParceiraPromovida`, `MesCompilado`,
  `BriefingPublicado`, `ConteudoEnviado`, `ConteudoAprovado`, `ProdutoDespachado`,
  `ProdutoEntregue`, `PagamentoLiberado`, `PagamentoConfirmado`, `CompetenciaArquivada`,
  `ConteudoPublicado`.
- **Termos oficialmente banidos do domínio:** `Ciclo`, `Plano de Colaboracao`, `Ativação`
  (para o agregado de conteúdo), `Fluxo Logístico`/`EnvioLogistico` (para o agregado de
  logística) — ver ressalva de homônimo no `ADR-012`: "ativação"/"Ativa" do vínculo da
  Parceira (RN-01) **não** é afetado, é conceito diferente.

### 9.2 Vocabulário Sistema B (Laravel — modelos citados na documentação; código ausente
deste repo)

`User` (1:1 opcional com Parceira) · `Parceira` (Ativa/Inativa) · `Marca` (Ativa/Inativa,
tem muitas Campanhas) · `Campanha` (`PLANEJADA→ATIVA→ENCERRADA|CANCELADA`) ·
`ParticipacaoNaCampanha` (link Campanha×Parceira + termos comerciais, `ATIVA|CANCELADA`,
campo `congelado_em` desde `ADR-018`) · `Briefing` (1:1 com Participação) · `Material`
(`PENDENTE→APROVADO|REPROVADO`) · `Pagamento` (1:1 com Participação,
`PENDENTE→APROVADO→PAGO`).

Convenção: todas as FKs `restrictOnDelete()`; nenhum recurso tem `destroy` — cancelamento é
sempre soft (mudança de status).

**Divergência explícita, não reconciliada:** `Campanha`/`ParticipacaoNaCampanha` não existem
no vocabulário do Contrato Soberano (que usa `Colaboração Mensal`/`MesReferencia`); `Marca`
como entidade própria também é conceito novo do Sistema B.

### 9.3 Vocabulário de Identidade/Acesso (SPEC-035 — abas `SIS_IDENTIDADES`,
`BASE_ADMINISTRADORES`, `BASE_MARCAS`)

- **`SIS_IDENTIDADES`** — chave `SUB_PROVIDER` (id imutável do provedor OIDC), colunas
  `EMAIL_PERFIL`, `PAPEL_ATOR` (`ADMINISTRADOR|MARCA|INFLUENCIADORA`), `ESTADO_CONTA`
  (`PENDING|ACTIVE|INACTIVE|REJECTED`), `DATA_CRIACAO`, `ULTIMO_ACESSO`.
- **`BASE_ADMINISTRADORES`** — FK `SUB_PROVIDER`, `NOME_COMPLETO`, `AREA_RESPONSABILIDADE`.
- **`BASE_MARCAS`** — 🟠 não implementada (depende da decisão de escopo do ator Marca); FK
  `SUB_PROVIDER`, `CNPJ_EMPRESA`, `RAZAO_SOCIAL`, `NOME_FANTASIA`, `TELEFONE_CORPORATIVO`.
- **`BASE DE DADOS` (extensão)** — coluna `SUB_PROVIDER` injetada, associada à chave
  soberana `INFLU_KEY` (nunca a substitui).

### 9.4 Schema físico legado (planilha oficial `TEAR_V2_OFICIAL.xlsx`, mapeado em
`PLANILHA_TEAR_2.0_MAPA.md`)

11 abas: `CADASTROS`, `NVScriptsProperties`, `BASE DE DADOS` (fonte da verdade, 961 linhas,
30 colunas: `STATUS`, `INFLU_KEY`, `CUPOM`, `CHAVE_PIX`, `INFLUENCIADORA_CNPJ`, endereço
completo, `VALOR_TOTAL`, quantidades por formato, `CANAIS_USO_IMAGEM`,
`PRAZO_USO_IMAGEM`), `FLUXO LOGÍSTICO`, `ATIVAÇÕES`, `BRIEFING`, `PAGAMENTOS`, 3 abas de
histórico, e 1 aba de infraestrutura do add-on AutoCrat. Chave de junção `INFLU_KEY` aparece
com grafias divergentes entre abas (`INFLU KEY` com espaço em `FLUXO LOGÍSTICO`,
`INFLUENCIADORA` em `BRIEFING`) — inconsistência física conhecida e documentada.

## 10. Restrições

- Nenhum backend/frontend de Portal existe fisicamente neste repositório — tudo começa do
  zero (§0).
- PII (`PIX`, `CNPJ`, `Endereco`, credenciais) nunca deve ser exposta em logs (Contrato
  Soberano §5; repetido em toda SPEC do Portal).
- Termos de domínio banidos não podem aparecer em código/specs/eventos novos: `Ciclo`,
  `Plano de Colaboracao`, `Ativação` (conteúdo), `Fluxo Logístico`/`EnvioLogistico`.
- Gateway de pagamento real está fora de escopo por decisão de produto (PRD §12).
- Restrição soberana de custo: nenhuma peça de infraestrutura nova com custo recorrente sem
  necessidade forte — motivou a escolha de OAuth de conta dedicada em vez de Workload
  Identity Federation (`ADR-017`) e a decisão de manter deploy manual via SSH em vez de
  contratar automação adicional (`ADR-016`).
- A Landing Page (`app/`) é a fonte de verdade visual corrente (ver §0/§11) — qualquer
  construção de UI do Portal deve derivar dela, não do `design-system/index.html`.

## 11. Decisões já tomadas

Estas são decisões **formalmente registradas** (ADRs aceitos) — diferentes das pendências
de §13, que seguem em aberto. Nem todas foram implementadas fisicamente neste repositório
(a maioria pertence ao Sistema B/Apps Script ausentes) — são reaproveitáveis como referência
de raciocínio arquitetural, não como código herdável.

| Decisão | Fonte | Nota |
|---|---|---|
| Linguagem ubíqua oficial: `Colaboração Mensal`/`MesReferencia`/`Compilador do Mês`, não `Ciclo Mensal` | `ADR-002`/`ADR-003` | Migração documental, não reaproveitável como código |
| `Entrega`/`Envio` são os nomes canônicos (não `Ativação`/`Fluxo Logístico`) | `ADR-012` | Ressalva: "ativação" do vínculo Parceira (RN-01) é conceito diferente, não afetado |
| Frontend servido pelo mesmo processo do backend (sem subdomínio separado, sem CORS em produção) | `ADR-015` | Decisão do Sistema B (Laravel+Vite); não implementada fisicamente neste repo — é referência de padrão, não vinculante para a stack ainda não escolhida (§13 item 1) |
| Deploy: Composer só roda no CI, nunca no host; disparo manual (`workflow_dispatch`), não automático por push | `ADR-016` | Decisão de infraestrutura do Sistema B; relevante só se a mesma hospedagem Locaweb for reutilizada |
| Armazenamento de arquivo: OAuth de conta dedicada Google Drive (`refresh_token`), nunca Service Account Key | `ADR-017` | Motivada por Org Policy do Google Cloud (`iam.disableServiceAccountKeyCreation`), não por preferência técnica |
| Congelamento de Participação: trava simples de 4 campos comerciais, sem cópia de dados nem trilha de auditoria própria | `ADR-018` | Gap consciente registrado, não corrigido — Briefing de participação congelada continua editável |
| **Landing Page (`app/`) é a fonte de verdade visual atual do projeto** | Instrução do responsável do projeto, registrada nesta sessão (2026-07-26) | Substitui, para fins práticos deste repositório, o que `ADR-019` declarava sobre `docs/design/manual/` (caminho inexistente aqui) |
| "DODÔ" é o nome oficial do projeto, substituindo o codinome técnico "TEAR" | `ADR-020` | Documentos históricos não são reescritos retroativamente |
| Q-08 (papéis Administrador/Influenciadora) resolvida para esses dois papéis | SPEC-035 (nota de revisão 2) | `Marca` como tenant externo segue **fora** dessa resolução |
| Q-07 (auth) "resolvida" arquiteturalmente por SPEC-035 reaproveitando a stack de sessão de SPEC-025 | SPEC-035 §9.2-A | Só decide a *arquitetura de integração* entre um mecanismo OIDC e uma sessão já existente — **não decide** qual mecanismo de credencial o produto a ser implementado do zero deve usar (permanece pendência real, §13 item 3) |

## 12. Riscos

| Risco | Descrição | Impacto se não mitigado |
|---|---|---|
| Retrabalho por decisão de stack não tomada | Construir Portal sem decidir stack/vocabulário/auth (Fase 0, §14) pode forçar reescrita do núcleo depois | Alto — retrabalho de schema e autenticação |
| Vazamento de PII | PIX/CNPJ/Endereço/credenciais nunca podem ir a log, mas essa disciplina não está automatizada em nenhuma fonte viva | Alto — risco legal/reputacional (LGPD) |
| Contradição não resolvida no gate de pagamento | Dois documentos discordam se "todas Entregas Aprovadas" já é regra decidida (Q-04 vs P0-1) | Médio-alto — pagamento liberado incorretamente se a regra errada for assumida |
| Infra de produção não confirmada tecnicamente | PostgreSQL, SSH e apontamento de subdomínio na Locaweb têm apenas declaração verbal, não confirmação técnica | Médio — pode bloquear go-live tardiamente |
| Confusão de fonte visual | Coexistência de `app/` (Landing, SSOT real), `design-system/index.html` (auxiliar) e o que `ADR-019` descreve (caminho inexistente) pode levar a decisões visuais inconsistentes se não houver disciplina de checar `app/` primeiro | Médio |
| Vocabulário de domínio duplicado no código | Se a implementação misturar termos do Contrato Soberano com termos do Sistema B sem decisão explícita, o modelo de dados fica ambíguo | Alto |
| Autenticação sem modelo decidido | Implementar qualquer um dos 3 modelos documentados sem validação explícita do responsável do projeto pode exigir migração de credenciais depois | Alto |
| Ator Marca implementado por engano | Nenhuma fonte confirma que Marca deve entrar no MVP; implementá-lo sem decisão de escopo é trabalho não solicitado | Médio |

## 13. Pendências

**Itens 1-6 resolvidos em 2026-07-26** — decisões do responsável do projeto, registradas em
`knowledge/ARCHITECTURAL_DECISIONS.md` ADR-005 a ADR-010:

1. ~~**Stack e ponto de partida.**~~ **Resolvido:** backend Node.js/TypeScript; frontend
   React+Vite+TypeScript reaproveitando `app/`. Ver ADR-005.
2. ~~**Reconciliação de vocabulário de domínio.**~~ **Resolvido:** Contrato Soberano
   (`Colaboração Mensal`/`Entrega`/`Envio`/`Obrigação Financeira`) rege todo código novo. Ver
   ADR-006.
3. ~~**Modelo de autenticação da Parceira (Q-07 real).**~~ **Resolvido:** Google OIDC
   federado, Authorization Code Flow + PKCE, fluxo `PENDING→ACTIVE` de SPEC-035. Ver ADR-007.
4. ~~**Escopo do ator "Marca".**~~ **Resolvido:** fora do MVP; sistema single-tenant. Ver
   ADR-008.
5. ~~**Gate de elegibilidade de pagamento.**~~ **Resolvido:** todas as Entregas `Aprovado`;
   `Publicado` não é pré-requisito. Ver ADR-009.
6. ~~**LGPD (Q-09).**~~ **Resolvido:** política completa de Privacy by Design/Default (bases
   legais, classificação de dados, menor privilégio, auditoria, direitos do titular, retenção
   por categoria, processo de expurgo, backups). Ver ADR-010.

Pendências que seguem em aberto — precisam de decisão explícita do responsável do projeto,
nenhuma deve ser assumida:

7. **Infraestrutura real de produção.** Domínio e hospedagem Locaweb existem, mas SSH
   bloqueado por incidente, PostgreSQL não confirmado tecnicamente, subdomínio configurado
   incompatível com backend isolado, banco de produção nunca criado. Ver
   `knowledge/Deploy/INFRAESTRUTURA.md`.
8. **Sitemap do Portal.** Não existe um sitemap oficial — proposta em `PORTAL_ARQUITETURA.md`
   é inferência a partir das 4 SPECs de Portal, precisa de validação.
9. **`README.md`/`CLAUDE.md` desatualizados.** Descrevem estrutura de pastas (`backend/`,
   `frontend/`, `docs/`) que não existe neste repositório.
10. **Contradição interna em `knowledge/Arquitetura/02-arquitetura-alvo.md`** — autodeclara
    "Status: Aprovado" mas o corpo é um template vazio.
11. **Quem recebe pagamento quando há Assessoria** (influenciadora ou assessoria) — não
    definido.
12. **Rótulos crus de estados de Envio** (SPEC-016) — "a confirmar por ADR", não decidido.

**Não invente regras para nenhum destes itens.** Onde a implementação precisar de uma
decisão aqui, pare e peça definição ao responsável do projeto.

---

## Fontes usadas neste briefing

`README.md`, `CLAUDE.md`, `DESIGN.md`, `design-system/README.md`, `design-system/index.html`
(estrutura), `app/src/**` (estrutura atual), `app/package.json`; e, em `knowledge/`: toda a
pasta `Produto/` (21 arquivos, incluindo SPEC-025/027/030/032/035 lidas na íntegra), toda a
pasta `Arquitetura/` incluindo todos os 8 ADRs (002/012/015/016/017/018/019/020) lidos na
íntegra, `sistema-b/` e `referencias-externas/`, `Historico/CONTRATO_SOBERANO.md` (íntegra),
`Historico/PLANILHA_TEAR_2.0_MAPA.md`, `Governanca/GOVERNANCA_DO_PROJETO.md`,
`Workspace/AMBIENTE_OPERACIONAL_DODO.md`, `Deploy/INFRAESTRUTURA.md`,
`Deploy/CHECKLIST_GO_LIVE.md`, `Workspace/TASK_ROUTER.md` (5575 linhas, lido por amostragem
dirigida: cabeçalho/convenções e a seção completa do roteador de Portal, EPIC 08). Os demais
arquivos de `knowledge/Deploy/` (`ARQUITETURA_PRODUCAO.md`, `AUDITORIA_LOCAWEB.md`,
`CONFIGURACAO_PRODUCAO.md`, `DEPLOY.md`, `IMPLEMENTACAO_TECNICA.md`, `MONITORING.md`,
`PLANO_DE_IMPLANTACAO.md`, `RUNBOOK_DEPLOY_E_ROLLBACK.md`, `release/*.md`) e
`Workspace/ROTEIRO_HOMOLOGACAO_TEAR_V2.md` não foram lidos linha a linha — `Deploy/
INFRAESTRUTURA.md` se declara consolidação oficial e mais recente desses documentos.

Nenhum arquivo existente foi alterado por esta missão. Nenhum código foi implementado.
