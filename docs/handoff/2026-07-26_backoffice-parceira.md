# Handoff — Backoffice Administrativo, unidade 1: módulo Parceira

**Data:** 2026-07-26
**Fase do projeto:** Backoffice Administrativo (nova fase, iniciada nesta sessão, ainda em andamento)
**Commit desta unidade:** `8d86618` — `feat(portal): backoffice — módulo Parceira (SPEC-001/SPEC-002)`

> **ATUALIZAÇÃO 2026-07-27 — fase concluída.** As pendências priorizadas na §6 abaixo (tela de
> `AdminParceiras.tsx`, CRUD de Entrega/Briefing, CRUD de Obrigação Financeira, Dashboard)
> foram todas implementadas nas sessões seguintes. Ver
> `docs/handoff/2026-07-27_backoffice-administrativo-consolidacao.md` para o estado atual.
> Este documento (o handoff mais antigo da fase) é mantido só como histórico da unidade 1.

---

## 1. Estado atual

Esta sessão fechou uma auditoria completa de prontidão para produção do Portal
DODÔ (7 commits de correções de segurança/robustez — rate limiting, helmet,
handler JSON de erro/404, trust proxy, trava de seed em produção, filtro de
tipo de upload, UI de admin para fila de exclusão LGPD) e, em seguida, abriu a
fase **Backoffice Administrativo**, autorizada explicitamente pelo responsável
do projeto para transformar o Portal de "só leitura pela Parceira" em
"operação interna completa".

**O que foi entregue nesta unidade de trabalho:** só o backend do módulo
Parceira — o primeiro agregado de domínio physicamente modelado no
repositório (até aqui só existia a string solta `parceiraId` referenciada por
Entrega/Perfil/Obrigação/Identidade, sem nenhum registro central).

**O que NÃO foi feito ainda:** nenhuma tela de frontend para o Backoffice.
`npm run dev` do frontend mostra exatamente as mesmas telas de antes (Login,
Pendências, Financeiro, Perfil, Admin de moderação/LGPD) — nada navegável
para Parceira ainda. Isso é a pendência #1 da próxima sessão (ver §6).

---

## 2. Arquitetura utilizada (sem mudança de padrão — só um novo módulo)

Mesmo padrão em camadas já usado em todo o Portal (`identidade`, `conteudo`,
`financeiro`, `perfil`, `lgpd`):

```
Repository (persistência pura, em memória)
      ↓
Service (regra de negócio, RN-01/UC-002.x)
      ↓
Routes (tradução HTTP fina, sem lógica)
```

- Persistência: `ParceiraRepositorioEmMemoria`, array em memória — **mesma
  decisão deliberada de todos os outros módulos** (nenhuma tecnologia de
  banco foi escolhida para o Portal; ver auditoria desta sessão, item 🔴 #1).
  Isso significa: **reiniciar o processo apaga todas as Parceiras
  cadastradas.** Não é regressão desta unidade, é a mesma limitação de todo
  o backend hoje.
- Autorização: rotas montadas em `/admin/parceiras` atrás de `requireAdmin`
  (mesmo middleware usado por `admin.routes.ts` e `lgpd.routes.ts` —
  `papelAtor === "ADMINISTRADOR"`).
- Nenhuma rota de Parceira passa por `bloquearParceiraIdDeCliente` /
  `parceiraDaSessao` — correto, porque este módulo *é* administrativo, não
  uma consulta isolada por sessão de Parceira.

---

## 3. Arquivos criados

Todos em `portal-backend/src/modules/parceira/` (módulo novo):

| Arquivo | Responsabilidade |
|---|---|
| `parceira.types.ts` | `Parceira` (id, chave, nome, email, cnpj, pix, status, condicaoComercial, dataCriacao) + VO `CondicaoComercial` (valorMensal, entregaveisReel/Carrossel/Stories, prazoUsoImagemDias) |
| `parceira.repository.ts` | `ParceiraRepositorioEmMemoria` — `listarTodas`, `buscarPorId`, `criar`, `atualizar` |
| `parceira.service.ts` | `cadastrarParceira` (RN-01: força `status: "INATIVA"` sempre, ignora qualquer valor recebido), `listarParceiras`, `buscarParceira`, `editarParceira` (UC-002.02), `alterarStatusParceira` (UC-002.01) |
| `parceira.routes.ts` | `GET /`, `POST /`, `PATCH /:id`, `PATCH /:id/status` |
| `parceira.service.test.ts` | 3 `describe` cobrindo nascimento INATIVA, edição (incl. `NAO_ENCONTRADA`), alternância de status preservando o registro (RN-11) |

## 4. Arquivos modificados

- `portal-backend/src/routes/api.routes.ts` — importa `requireAdmin` (já
  existia, só não estava usado neste arquivo) e `parceiraRoutes`; monta
  `apiRoutes.use("/admin/parceiras", requireAdmin, parceiraRoutes)`.

Nenhum arquivo de frontend foi tocado nesta unidade.

---

## 5. Decisões tomadas nesta unidade (e por quê)

1. **Campos do agregado Parceira**: usei o conjunto confirmado por
   SPEC-001 §3/RF-001 e SPEC-002 §6, mas **simplificado** para o mínimo
   navegável agora — `condicaoComercial` guarda contagens de entregáveis
   (`entregaveisReel/Carrossel/Stories`) em vez de um VO mais rico com
   looks/canais/prazo detalhado por canal. Endereço **não** foi incluído no
   agregado Parceira nesta unidade — `Endereco`/CEP já existe como
   responsabilidade do módulo `perfil` (`PerfilParceira.endereco`), e migrar
   essa responsabilidade para `Parceira` é uma decisão de modelagem que a
   próxima unidade deve tomar explicitamente (ver §6, item 2).
2. **`chave`** (ChaveInfluenciadora/cupom, SPEC-002 §6.2) é obrigatória no
   cadastro, mas **sem validação de unicidade** ainda — SPEC-001 §7 lista
   "critérios de unicidade" como decisão arquitetural pendente. Se a próxima
   unidade decidir aplicar unicidade, o ponto de entrada é
   `parceira.service.ts::cadastrarParceira`.
3. **RN-01 é aplicada no Service, não confiando no Router nem no cliente**:
   mesmo que o `POST /admin/parceiras` receba um `status` no corpo, ele é
   ignorado — `cadastrarParceira` sempre grava `"INATIVA"`. Isso segue o
   mesmo padrão de "nunca confiar em estado vindo do cliente" já usado em
   `conteudo.service.ts`/`identidade.service.ts`.
4. **Sem endpoint de exclusão** — SPEC-002 RN-11/INV-02 são explícitos:
   inativar nunca apaga o registro. Não existe (e não deveria existir sem
   novo ADR) nenhuma forma de deletar uma Parceira.
5. **Não implementei a Máquina de Estados completa da Obrigação Financeira**
   (`EM_ABERTO → APROVADO → PAGO`, com o gate de elegibilidade do Q-04 de
   SPEC-020 — liberação só após todas as Entregas da competência estarem
   `APROVADO`/`PUBLICADO`) nesta unidade. O enum já tem os 3 estados
   corretos em `obrigacao.types.ts` (herdado de sessão anterior), mas o
   Service do Financeiro (`financeiro.service.ts`) só lê/soma — não tem
   nenhuma rota de escrita ainda. Isso é a pendência #3 de §6.

---

## 6. Pendências priorizadas para a próxima sessão/agente

1. **🔴 P0 — Tela de frontend para Parceiras.** Backend já serve
   `GET/POST /api/admin/parceiras` e `PATCH /api/admin/parceiras/:id[/status]`,
   mas não existe nenhuma UI. Este é o item que vai gerar a "mudança visível
   no localhost" que o responsável do projeto pediu e que esta unidade
   **não chegou a entregar** (foi interrompida para fechamento/handoff antes
   da tela existir). Recomendo:
   - Criar `portal-frontend/src/pages/AdminParceiras.tsx` seguindo o mesmo
     padrão visual/estrutural de `Admin.tsx` (lista + formulário inline,
     sem biblioteca de UI nova).
   - Adicionar rota `/admin/parceiras` em `App.tsx` e item de nav condicional
     (`papelAtor === "ADMINISTRADOR"`) em `PortalLayout.tsx`, ao lado de
     "Moderação".
   - Funcionalidade mínima: listar, cadastrar (form com os campos de
     `DadosCadastroParceira`), editar campos, alternar Ativa/Inativa.
   - Validar rodando `npm run dev` nos dois projetos e abrindo no navegador
     (Chrome via ferramenta de automação, se disponível) — login como
     `ADMINISTRADOR` requer e-mail em `ADMIN_BOOTSTRAP_EMAILS` no `.env`.

2. **🟡 P1 — Decidir se `Endereco` migra de `PerfilParceira` para
   `Parceira`.** Hoje há duas fontes de endereço em potencial (perfil da
   sessão da própria Parceira vs. cadastro administrativo). SPEC-001 RF-003
   trata endereço como parte do cadastro administrativo. Recomendo consolidar
   em `Parceira` e fazer `perfil.service.ts` ler de lá — mas isso é uma
   decisão de modelagem que deve ser explícita, não implícita.

3. **🔴 P0 (bloqueia "criar Obrigações Financeiras" pedido pelo usuário) —
   CRUD administrativo de Obrigação Financeira.** Hoje só existe leitura
   (`financeiro.service.ts`). Precisa: rota `POST /admin/financeiro` para
   lançamento manual (mensal ou avulso, RN-04 SPEC-020), rota para transição
   `EM_ABERTO → APROVADO` (aplicando o gate de elegibilidade do Q-04: todas
   as Entregas da competência devem estar `APROVADO`/`PUBLICADO`) e
   `APROVADO → PAGO` (arquiva, RN-03). Novo módulo
   `portal-backend/src/modules/financeiro/` já existe — adicionar aos
   arquivos existentes, não criar módulo paralelo.

4. **🔴 P0 (bloqueia "criar/editar Briefings" e "criar Entregas" pedidos
   pelo usuário) — CRUD administrativo de Entrega e Briefing.** Hoje
   `EntregaRepositorioEmMemoria` e `BriefingRepositorioEmMemoria` só têm
   métodos de leitura + um `atualizar` de Entrega usado internamente pelo
   fluxo de upload da Parceira. Faltam: `criar`/`atualizar` expostos por
   rota administrativa para Entrega (formato, mesReferencia, dataEntrega) e
   Briefing (look, dataEntrega, dataPostagem, orientacao — com o cálculo de
   `dataAprovacaoInterna` de SPEC-009 RN-01: postagem − 7 dias, ajustado se
   cair em sexta/sábado/domingo — **este cálculo ainda não existe em nenhum
   lugar do código**, precisa ser escrito do zero).
   `BlocoBriefing` hoje **não tem `id`** — é identificado só pela tripla
   `(parceiraId, mesReferencia, formato)`; ao adicionar `criar`/`atualizar`
   administrativos, usar essa mesma chave composta como identidade (evita
   duplicar convenção).

5. **🟡 P1 — Dashboard administrativo.** Pedido explícito do usuário
   ("visualizar dashboards administrativos"), ainda não iniciado. Sugestão de
   escopo mínimo: contagem de Parceiras Ativas/Inativas, Entregas por estado
   na competência corrente, total previsto x pago no mês — tudo dado que já
   existe nos repositórios atuais, só falta uma rota de agregação e uma tela.

6. **Sem bloqueio de negócio identificado até agora nesta fase** — todos os
   campos que a auditoria anterior apontava como ambíguos (Feature 5.1/5.2,
   "quais campos o self-service deveria preencher") **não se aplicam aqui**:
   backoffice é 100% preenchido pela equipe, não pela Parceira, então a
   ambiguidade de "self-service vs. time" que bloqueava aquela feature não
   bloqueia esta.

---

## 7. Próxima feature recomendada (ordem sugerida, não obrigatória)

1. Tela `AdminParceiras.tsx` (P0 #1 acima) — **fazer isso primeiro**, é o
   que dá o "resultado visível no localhost" que ainda falta.
2. CRUD administrativo de Entrega + Briefing (P0 #4) — desbloqueia
   "criar Briefings/Entregas" pedido pelo usuário.
3. CRUD administrativo de Obrigação Financeira com o gate de elegibilidade
   Q-04 (P0 #3) — desbloqueia "criar Obrigações/acompanhar pagamentos".
4. Dashboard administrativo (P1 #5) — depende dos três anteriores existirem
   para ter dado real para agregar.
5. Decisão de modelagem do Endereço (P1 #2) — pode ser feita a qualquer
   momento, não bloqueia as demais.

Manter o mesmo ciclo desta sessão: uma feature → build → typecheck → teste
→ commit → próxima. Não reabrir a auditoria nem refatorar módulos estáveis
(`identidade`, `conteudo`, `financeiro` de leitura, `perfil`, `lgpd`) fora do
que estas pendências exigem.

---

## 8. Riscos conhecidos (herdados + novos)

- **Sem persistência real** (herdado): tudo em memória, restart apaga dado.
  Cadastrar Parceiras de teste manualmente a cada sessão de dev é esperado
  até isso ser decidido.
- **Sem unicidade de `chave`/e-mail/CNPJ** (novo, decisão adiada
  conscientemente — SPEC-001 §7): cadastro duplicado é aceito silenciosamente
  hoje. Se isso incomodar QA, é um ajuste pequeno em
  `parceira.service.ts::cadastrarParceira`, não uma mudança de arquitetura.
- **Nenhuma rota de Parceira tem teste de contrato HTTP** (mesma lacuna já
  registrada na auditoria desta sessão para o resto do backend) — só o
  Service tem teste unitário. Rotas foram verificadas por leitura de código
  e pelo build/typecheck, não por chamada HTTP real nesta unidade.
- **`condicaoComercial` é obrigatório e não validado internamente** — o
  Router rejeita se `condicaoComercial` estiver ausente, mas não valida os
  subcampos (`valorMensal` negativo, por exemplo, passaria). Aceitável para
  o estágio atual; endurecer se virar problema real.

---

## 9. Comandos para subir o projeto

```bash
# Backend (porta 4000)
cd portal-backend
npm install       # só se node_modules não existir
npm run typecheck
npm test
npm run build
npm run dev        # tsx watch src/server.ts

# Frontend (porta 5173)
cd portal-frontend
npm install       # só se node_modules não existir
npm run lint
npm run build
npm run dev        # vite
```

Variáveis de ambiente necessárias (`portal-backend/.env`, ver
`.env.example`): `SESSION_SECRET`, `GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI`
(login real exige credenciais Google OIDC reais), `ADMIN_BOOTSTRAP_EMAILS`
(e-mail que deve nascer `ADMINISTRADOR` no primeiro login — **necessário
para testar qualquer rota `/admin/*`, incluindo Parceiras**),
`PARCEIRA_SEED_EMAIL`/`PARCEIRA_SEED_ID` (opcional, dev/QA — dá `parceiraId`
a uma conta INFLUENCIADORA para exercitar Pendências/Financeiro/Perfil do
Portal; **não tem relação com o novo módulo Parceira do Backoffice**, que
não depende desse seed).

Para testar `/admin/parceiras` sem depender de OAuth Google real: assinar
manualmente um cookie de sessão com `papelAtor: "ADMINISTRADOR"` e
`estadoConta: "ACTIVE"` usando o mesmo HMAC-SHA256 de
`portal-backend/src/middleware/session.ts` (`SESSION_SECRET` do `.env`) —
mesma técnica usada nas sessões anteriores para validar rotas sem OAuth.

---

## 10. Contexto adicional para quem continuar

- A sessão anterior a esta (registrada em `PORTAL_BACKLOG.md`) tratou
  `Parceira`/SPEC-002 como **fora do escopo do Portal** (ver
  `PORTAL_ARQUITETURA.md` §3). O responsável do projeto **revogou
  explicitamente essa fronteira nesta sessão** ao pedir o Backoffice — não
  tratar a ausência de Parceira como bloqueio em nenhuma feature futura
  deste Backoffice; ela agora é parte do Portal.
- `docs/_workspace/auditorias/` e `docs/_workspace/releases/` contêm 4
  arquivos gerados automaticamente por comando de shell numa sessão
  anterior (dumps de `git status`/`find`, incluindo `node_modules`) — são
  ruído, não documentação revisada; não usar como fonte de verdade.
- O relatório completo da auditoria de prontidão para produção (que
  antecedeu esta fase) está só no histórico da conversa desta sessão, não
  em arquivo — se for necessário revisá-lo, os 7 commits de correção
  (`5445bf2`..`9327422`, mais `e2226fa`) documentam cada achado no próprio
  corpo do commit.
