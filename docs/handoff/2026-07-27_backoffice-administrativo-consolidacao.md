# Backoffice Administrativo — Consolidação de Fase e Roadmap

**Data:** 2026-07-27
**Tipo:** encerramento de fase (checkpoint arquitetural), não uma nova unidade de trabalho.
**Supersede, para fins de "o que falta fazer":** `docs/handoff/HANDOFF_CODEX_BACKOFFICE.md` e
`docs/handoff/2026-07-26_backoffice-parceira.md` (mantidos como histórico do racional de
design de cada decisão, não como estado atual).
**Commit mais recente no momento deste documento:** `6dc7434` (Vertical Slice Financeiro),
mais o trabalho de Aprovação de Entregas desta sessão (ainda não commitado nesta data).

---

## 1. Módulos concluídos

Todos seguem exatamente o mesmo padrão em 4 camadas (`*.types.ts` → `*.repository.ts` →
`*.service.ts` → `*.routes.ts`), sem exceção:

| Módulo | Backend | Frontend | Observação |
|---|---|---|---|
| **Identidade/Acesso** | ✅ | ✅ (`Login.tsx`, `Admin.tsx` — moderação) | Google OIDC real, PKCE, sessão deslizante 6h, moderação `PENDING→ACTIVE/REJECTED` |
| **Parceiras** | ✅ | ✅ (`AdminParceiras.tsx`) | Cadastro, edição, ativar/inativar (nunca exclui — RN-11/INV-02) |
| **Entregas** | ✅ | ✅ (`AdminEntregas.tsx`) | Criação administrativa + Aprovação (`EM_REVISAO→APROVADO`) |
| **Briefings** | ✅ | ✅ (`AdminBriefings.tsx`) | CRUD vinculado sempre a uma Entrega existente |
| **Obrigação Financeira** | ✅ | ✅ (`AdminObrigacoes.tsx`) | Lançamento (Mensal/Avulso), edição, liberação com gate ADR-009, pagamento |
| **Dashboard administrativo** | ✅ | ✅ (`AdminDashboard.tsx`) | Agrega Parceiras/Entregas/Obrigações/Identidade/LGPD com dado real, não hardcoded |
| **Perfil** (self-service) | ✅ | ✅ (`Perfil.tsx`) | Só a própria Parceira edita o seu — não há tela administrativa equivalente |
| **LGPD** | ✅ | ✅ (fila em `Admin.tsx`) | Exportação de dados, decisão de exclusão |
| **Financeiro** (leitura, Parceira) | ✅ | ✅ (`Financeiro.tsx`) | Previsto x pago, histórico por período |

**Nota de correção de registro:** os dois handoffs anteriores (`HANDOFF_CODEX_BACKOFFICE.md`,
`2026-07-26_backoffice-parceira.md`) descreviam o Dashboard como "não iniciado" e o Backoffice
como "~10% concluído". Isso está desatualizado — o Dashboard já existe com agregação real, e
todos os módulos administrativos listados acima estão implementados, testados e validados
manualmente com sessão OAuth real.

## 2. Fluxos completos

- **Parceira → Entrega → Aprovação → Obrigação Financeira elegível → Liberação → Pagamento** —
  validado ponta a ponta, inclusive o caso de bloqueio parcial (competência com 3 Entregas, só
  1 aprovada, gate corretamente recusa liberação — ADR-009 exige *todas*).
- **Parceira → Entrega → Briefing** (criação/edição vinculada por chave natural).
- **Moderação de conta** (`PENDING→ACTIVE/REJECTED`) e **fila de exclusão LGPD**.
- **Cadastro → Ativação de Parceira → Entregas/Obrigações passam a poder ser criadas para
  ela** (validação cruzada de `parceiraId` existente/`ATIVA`, resolvendo a lacuna que o
  handoff original de 2026-07-26 registrava como aberta).

## 3. Fluxos parcialmente concluídos

- **Ciclo de vida da Entrega para em `APROVADO`.** SPEC-012 define um 4º estado,
  `PUBLICADO` (com arquivamento automático, RN-04), nunca exposto no Backoffice. O gate do
  Financeiro já aceita `APROVADO` como suficiente, então isso não bloqueia pagamento — mas o
  ciclo de conteúdo documentado não é executável até o fim pela UI.
- **Briefing sem `dataAprovacaoInterna`.** SPEC-009 RN-01/INV-03 definem esse campo como
  derivado (`dataPostagem − 7 dias`, com ajuste de fim de semana) e nunca arbitrário. O tipo
  `BlocoBriefing` simplesmente não tem esse campo — o admin registra `dataPostagem` livremente
  e nenhum prazo de aprovação é calculado.
- **"Reprovar" Entrega não existe** — e, após auditoria de SPEC-012 §9/RN-02 (4 estados
  canônicos, sem 5º estado de rejeição), não é uma lacuna de implementação, é ausência real na
  especificação. Não deve ser implementado sem decisão de produto nova.

## 4. Dívidas técnicas reais

| # | Dívida | Impacto | Prioridade |
|---|---|---|---|
| 1 | `dataAprovacaoInterna` do Briefing nunca implementada (SPEC-009 RN-01) | Médio — regra documentada e testável, ausente | P1 |
| 2 | Sem validação de unicidade de `chave`/e-mail/CNPJ em Parceira (SPEC-001 §7) | Baixo hoje, cresce com volume | P2 |
| 3 | `Endereco` duplicado por decisão adiada: vive só em `PerfilParceira`, não em `Parceira`, apesar de SPEC-001 RF-003 tratá-lo como cadastro administrativo | Baixo/médio — inconsistência de modelagem, não bug funcional | P2 |
| 4 | Sem "Publicar" Entrega nem "Reprovar" Entrega no Backoffice | Baixo para o gate financeiro; médio para o ciclo de conteúdo completo | P2 (Publicar) / decisão de produto pendente (Reprovar) |
| 5 | Nenhuma rota tem teste de contrato HTTP (`supertest` ou equivalente) — toda validação de rota é manual | Médio — o mesmo bug (endpoint de escrita devolvendo shape diferente do GET) já apareceu 2x, seria pego mais cedo por um teste de rota | P1 |
| 6 | Persistência 100% em memória — reiniciar o processo apaga todo dado | Alto para produção, aceitável para o estágio atual | P0 antes de qualquer go-live, P3 agora |

Não incluídas como dívida desta fase (sem mudança de status, já documentadas antes): falta de
CI/CD, falta de logger estruturado.

## 5. Decisões de produto ainda pendentes

- **Endereço: migra para `Parceira` ou fica formalizado como responsabilidade definitiva de
  `Perfil`?** Decisão adiada desde a primeira unidade do Backoffice (2026-07-26), nunca
  revisitada.
- **"Reprovar" Entrega: existe ou não?** Se existir, para qual estado ela volta —
  `AGUARDANDO_MATERIAL` (pede reenvio) ou um 5º estado novo? SPEC-012 não responde isso hoje;
  exige decisão de PO antes de qualquer código.
- **Unicidade de `chave`/e-mail/CNPJ em Parceira** — aceitar duplicado para sempre, ou aplicar
  regra de unicidade? SPEC-001 §7 marca como decisão arquitetural em aberto.

---

## 6. Roadmap proposto

### Fechamentos de baixo risco (continuação da fase atual, mesmo padrão arquitetural)

1. **Publicar Entrega** (`APROVADO→PUBLICADO`, RN-04/RNF-03 SPEC-012) — mesmo padrão exato de
   `aprovarEntrega`, já validado 3x no projeto (Financeiro, Aprovação). Fecha o ciclo de
   conteúdo documentado.
2. **`dataAprovacaoInterna` do Briefing** (dívida #1) — função pura testável, sem risco de
   regressão, cobrindo os 4 casos de borda de dia da semana da própria SPEC-009.
3. **Pequenos refinamentos de UX** identificados nas auditorias das últimas slices (nenhum
   pendente crítico no momento — última varredura não encontrou item aberto).

### Evoluções estruturais (nova fase arquitetural — não continuação desta Sprint)

1. **"Colaboração Mensal" como agregado formal** (SPEC-005). Hoje Entrega/Briefing/Obrigação
   nascem individualmente por ação manual do admin — não existe o conceito de "virar o mês" e
   materializar automaticamente as Entregas/Briefings de todas as Parceiras `ATIVA`s conforme
   sua `CondicaoComercial`. Esta é a maior lacuna estrutural entre o que a documentação de
   domínio descreve e o que o código faz.
2. **Geração automática de competência** — depende do item anterior; hoje `mesReferencia` é
   um campo livre preenchido pelo admin em cada criação, não derivado de uma "virada de mês"
   do sistema.
3. **Automações de ciclo mensal** (ex.: lançamento automático da Obrigação Mensal ao compilar
   a competência, ao invés de lançamento manual) — depende dos dois itens anteriores.

Justificativa para tratar isso como fase separada: os itens acima não são extensões pontuais
de um módulo existente (como Publicar/dataAprovacaoInterna) — eles introduzem um agregado de
domínio novo (`ColaboracaoMensal`) que hoje não existe fisicamente em nenhum lugar do código,
mudam a forma como todos os módulos atuais nascem (de "criação manual pontual" para "reação a
uma compilação"), e exigem decisão de produto sobre o gatilho dessa automação (cron? ação
manual do admin? fim de mês calendário?) antes de qualquer linha de código — exatamente o tipo
de decisão que este projeto trata como bloqueio a declarar, não a presumir.
