# Estado Atual

> Referência oficial e única do estado atual do projeto Criativo Dodô — plataforma
> Influencia. Contém apenas o presente; não histórico, não decisões já superadas. Para
> racional de como se chegou aqui, ver `docs/handoff/` (documentos datados) e
> `knowledge/ARCHITECTURAL_DECISIONS.md`.

## Módulos concluídos

| Módulo | Backend | Frontend |
|---|---|---|
| Identidade/Acesso (login Google OIDC, sessão, moderação de conta) | ✅ | ✅ |
| Parceiras (cadastro, edição, ativar/inativar) | ✅ | ✅ |
| Entregas (criação administrativa, aprovação) | ✅ | ✅ |
| Briefings (CRUD vinculado a uma Entrega) | ✅ | ✅ |
| Obrigação Financeira (lançamento, edição, liberação, pagamento) | ✅ | ✅ |
| Dashboard administrativo (agregação real de todos os módulos) | ✅ | ✅ |
| Financeiro — leitura pela Parceira (previsto x pago, histórico) | ✅ | ✅ |
| Perfil — self-service da Parceira (PIX, e-mail, endereço) | ✅ | ✅ |
| LGPD (exportação de dados, fila de exclusão) | ✅ | ✅ |

Landing Page (`app/`) também implementada e é a fonte de verdade visual de todo o Portal.

## Fluxos completos

- Parceira → Entrega → Aprovação → Obrigação Financeira elegível → Liberação → Pagamento.
- Parceira → Entrega → Briefing (criação/edição vinculada por chave natural).
- Cadastro → Ativação de Parceira → Entregas/Obrigações podem ser criadas para ela (validação
  cruzada de `parceiraId` existente/`ATIVA` em todos os pontos de escrita).
- Moderação de conta (`PENDING→ACTIVE/REJECTED`) e fila de exclusão LGPD.
- Login Google OIDC real, sessão deslizante de 6h, isolamento de dados por Parceira.

## Fluxos incompletos

- Sem "Reprovar" Entrega — SPEC-012 não documenta um 5º estado ou transição de rejeição; não
  é lacuna de implementação, é ausência real na especificação.
- Sem tela administrativa de Perfil/Endereço — só a própria Parceira edita o seu.
- "Colaboração Mensal" (SPEC-005) não existe como agregado formal — Entrega/Briefing/
  Obrigação nascem por criação manual do admin, não por compilação automática de competência.
  (Fase 3 do Plano Mestre — `criativododo-interno/PLANO_MESTRE_IMPLEMENTACAO_PORTAL_DODO.md`.)

## Arquitetura atual

Duas aplicações independentes, sem workspace compartilhado:

- `portal-backend/` — Node.js + TypeScript + Express 5, **persistência real em PostgreSQL**
  desde 29/07/2026 (Fase 2 do Plano Mestre, ADR-015). `npm run db:migrate` aplica o schema;
  `npm run db:seed` popula dado de desenvolvimento (idempotente).
- `portal-frontend/` — React 19 + Vite + TypeScript, reaproveitando a identidade visual de
  `app/`.

Todo módulo de domínio segue as mesmas 4 camadas, sem exceção:

```
*.types.ts       → interfaces puras, sem lógica
*.repository.ts  → *RepositorioPostgres (singleton exportado, produção/dev) +
                    *RepositorioEmMemoria (preservada, só para fixtures de teste unitário)
*.service.ts     → regras de negócio, validações, transições de estado (union types Resultado)
*.routes.ts      → tradução HTTP fina, zero lógica de negócio
```

Relação entre agregados (sempre por chave natural `parceiraId`+`mesReferencia`[+`formato`],
nunca FK física):

```
Parceira (cadastro, status ATIVA/INATIVA)
   ↓
Entrega (AGUARDANDO_MATERIAL → EM_REVISAO → APROVADO → [PUBLICADO, não implementado])
   ↓  (leitura por junção)
Obrigação Financeira (EM_ABERTO → APROVADO → PAGO, agregado por Parceira × Competência)
   ↓
Pagamento (PAGO = terminal, arquivado)

Briefing — paralelo a Entrega, mesma chave natural, sem relação de estado com ela
Dashboard — leitura agregada sobre todos os módulos acima, sem escrita própria
Identidade/LGPD — transversal, não participa do fluxo operacional Parceira→Pagamento
```

Auditoria (`registrarAuditoria`) é global, aplicada a toda rota autenticada — nenhum módulo
novo precisa implementar a própria.

## Próxima prioridade

**Colaboração Mensal como agregado formal** — Fase 3 do Plano Mestre
(`criativododo-interno/PLANO_MESTRE_IMPLEMENTACAO_PORTAL_DODO.md`), **bloqueada por decisão
de produto pendente** (gatilho de compilação de competência — ver "Decisões de produto
pendentes" abaixo). Não iniciar sem essa decisão.

## Dívidas técnicas reais

| # | Dívida | Prioridade |
|---|---|---|
| 1 | Sem validação de unicidade de `chave`/e-mail/CNPJ em Parceira (SPEC-001 §7) | P2 |
| 2 | `Endereco` duplicado: vive só em `PerfilParceira`, não em `Parceira` | P2 |

**Resolvidas em 29/07/2026 (Fase 1 do Plano Mestre):** "Publicar Entrega"
(`APROVADO→PUBLICADO`, com arquivamento automático), `dataAprovacaoInterna` do Briefing
(SPEC-009 RN-01, testada nos 4 casos de borda de dia da semana) e testes de contrato HTTP
(`supertest`) cobrindo Parceiras, Entregas (incluindo aprovar/publicar via upload real),
Briefings e Obrigação Financeira, além da borda de autenticação/autorização de `api.routes.ts`.

**Adicionado em 29/07/2026 (decisão de negócio intercalada antes da Fase 2 — ADR-014):**
`portal-backend/src/shared/calendarioOperacional/` — `ProvedorDeCalendarioOperacional`,
**única fonte da verdade** do Portal para dia útil (feriados nacionais calculados localmente
via algoritmo de Páscoa; feriado estadual do RJ configurado — cidade-base Nova Friburgo;
municipal e pontos facultativos institucionais configuráveis, hoje vazios — municipal fica
para quando o calendário operacional oficial da empresa for levantado). `dataAprovacaoInterna`
do Briefing (SPEC-009 RN-01 v1.1) usa esse calendário. **Ruptura oficial e confirmada com o
legado:** a heurística antiga que tratava toda sexta-feira como gatilho de ajuste foi
deliberadamente abandonada — sexta-feira comum é dia útil, sem ajuste automático. Qualquer
exceção futura ao cálculo de dia útil deve ser regra de negócio explícita, nunca heurística
implícita (princípio registrado em ADR-014).

**Resolvida em 29/07/2026 (Fase 2 do Plano Mestre, ADR-015):** persistência 100% em memória
substituída por **PostgreSQL real** em todos os 8 módulos com repositório (Identidade,
Convite, Parceira, Entrega, Briefing, Obrigação Financeira, Perfil, Exclusão LGPD). Reiniciar
o processo não apaga mais dado — validado por smoke test manual (criar via API → matar
processo → subir de novo → dado ainda presente) e pela suíte completa (36 arquivos, 222
testes) rodando 3× consecutivas contra Postgres real. Sem ORM (`pg` direto); sem alteração de
regra de negócio; repositórios em memória preservados só para fixtures de teste unitário.

## Decisões de produto pendentes

- Endereço: migra para `Parceira` ou fica formalizado como responsabilidade definitiva de
  `Perfil`?
- "Reprovar" Entrega: existe? Se sim, para qual estado ela volta?
- Unicidade de `chave`/e-mail/CNPJ em Parceira: aplicar ou aceitar duplicado indefinidamente?
- Gatilho da futura automação de "Colaboração Mensal" (cron? ação manual do admin? virada de
  mês calendário?) — bloqueia a Fase 3 do Plano Mestre; decisão do responsável do projeto.

## Próxima Sprint recomendada

Ver `criativododo-interno/PLANO_MESTRE_IMPLEMENTACAO_PORTAL_DODO.md` — roadmap oficial,
executado uma fase por vez, sempre com aprovação explícita antes de avançar. Fase 1
(fechamentos de baixo risco) e Fase 2 (persistência PostgreSQL) concluídas em 29/07/2026.
Fase 3 (Colaboração Mensal) aguardando decisão de produto (gatilho de compilação) antes de
poder começar.

## Última atualização

2026-07-29.
