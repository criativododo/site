# Reconciliação Arquitetural — Ator "Marca" vs. Marca como Dado

> Documento de análise (workspace), não é ADR. Não altera código, migrations, ou decisões
> vigentes. Produzido a pedido do responsável do projeto após a auditoria de
> 2026-08-05 que identificou trabalho não commitado implementando ADR-022 (ator Marca).
>
> **Legenda de camada de confiança**, usada ao longo do documento:
> **[E]** Evidência — verificado diretamente em código/doc/teste, nesta sessão.
> **[I]** Inferência — conclusão minha a partir de evidências, não escrita em nenhum documento.
> **[H]** Hipótese — minha suposição, precisa de confirmação humana antes de virar decisão.

---

## Sumário executivo

A implementação encontrada (ADR-022 + RBAC `ADMINISTRADOR_MARCA` + dashboard + tela) é
**internamente consistente e tecnicamente sólida** — compila limpo, 24/24 testes passam,
segue os padrões já estabelecidos no projeto. **Mas ela não é, sozinha, uma peça completa da
arquitetura de Identidade**: falta o provisionamento (como uma conta ganha esse papel) e falta
o isolamento de dados por Marca (hoje o dashboard da Marca lê os dados de **toda** a agência,
não só os da própria organização — funciona por acidente, porque hoje só existe uma Marca
real). Ela também diverge, sem reconciliação formal, da definição já existente do ator `Marca`
em SPEC-035 §4.2 (nome do papel, forma de acesso, tabela de dados).

A entidade de domínio `marcas` (S5 original) **não é redundante** com o trabalho de RBAC — é
pré-requisito dele, e também da Trilha Google Drive. Recomendo: ratificar ADR-022 como decisão
de produto aceita, mas abrir uma segunda decisão (nova ADR) que resolve exatamente essas duas
lacunas antes de considerar a feature pronta para produção.

---

## 1. A implementação atual de "Marca como ator" é tecnicamente consistente?

**[E] Sim, no que foi construído.** Evidências:

- `tsc --noEmit` limpo em `portal-backend` e `portal-frontend`.
- `vitest run dashboard.service.test.ts` → 24/24 passam, incluindo os 6 casos novos para
  `calcularIndicadoresMarca`/`calcularExcecoesOperacionais`.
- Cadeia de middleware correta: `apiRoutes.use("/marca/dashboard", requireAdministradorMarca,
  dashboardMarcaRoutes)` herda `requireAuth → requireContaAtiva → registrarAuditoria` do
  `apiRoutes.use(...)` global (`api.routes.ts:24`) — não há bypass de autenticação/auditoria.
- Migration (`0006_administrador_marca.sql`) tem rollback simétrico e correto.
- Segue o padrão já estabelecido no projeto de "núcleo puro testável sem repositório"
  (`calcularIndicadoresMarca`, `calcularExcecoesOperacionais` são funções puras, só
  `obterIndicadoresOperacionaisMarca` toca repositório) — mesmo estilo do resto de
  `dashboard.service.ts`.
- Justificativa de minimização de dados (LGPD/ADR-010) documentada em comentário no próprio
  tipo (`dashboard.types.ts`), citando explicitamente por que `financeiro`/`lgpd`/`moderacao`
  ficam de fora do recorte da Marca.

**[E] Mas há duas lacunas concretas, verificadas em código, que tornam a feature incompleta
para uso real:**

### 1.1 Não existe provisionamento — o papel é inatingível em produção

`identidade.service.ts:75` — o único ponto do sistema que atribui `papelAtor` numa conta real
(fora do endpoint de teste `/dev-login`) é:

```ts
papelAtor: ehBootstrapAdministrador ? "ADMINISTRADOR" : "INFLUENCIADORA",
```

Não existe nenhum caminho de código, em produção, que resulte em `papelAtor =
"ADMINISTRADOR_MARCA"`. O próprio texto do ADR-022 admite isso: *"Provisionamento... não é
definido por este ADR."* Ou seja: hoje a feature é 100% inacessível fora de testes manuais via
query string do `/dev-login`. Isso não é um bug — é uma decisão explicitamente adiada — mas
significa que a feature, como está, não pode ir para produção sem uma segunda decisão.

### 1.2 Não existe isolamento de dados por Marca — o "recorte" é só de campos, não de linhas

`dashboard.service.ts` (código novo, função `obterIndicadoresOperacionaisMarca`):

```ts
export async function obterIndicadoresOperacionaisMarca(): Promise<IndicadoresOperacionaisMarca> {
  const [indicadores, parceiras, entregas] = await Promise.all([
    obterIndicadoresAdministrativos(),   // ← mesma agregação GLOBAL do dashboard do Administrador
    parceiraRepositorio.listarTodas(),   // ← TODAS as Parceiras, de qualquer Marca
    entregaRepositorio.listarTodas(),    // ← TODAS as Entregas, de qualquer Marca
  ]);
  ...
}
```

Não existe `marcaId` em `Parceira`, `Entrega`, ou em `Identidade` — **[E]** confirmado por
`grep` em `parceira.types.ts` e `identidade.types.ts` (nenhuma ocorrência). O recorte que
ADR-022 promete ("visão restrita à própria operação/campanha") hoje só remove **campos**
(financeiro, lgpd, moderação) — não filtra **linhas**. Um `ADMINISTRADOR_MARCA`, se existisse,
veria as Parceiras e Entregas de **toda a agência**, não só as da sua organização.

**[I] Isso funciona sem incidente hoje só porque o sistema é single-tenant de fato (uma única
Marca real, Jescri).** No momento em que existir uma segunda Marca, esse mesmo código vaza
dado operacional entre clientes — silenciosamente, sem erro, sem teste que capture isso (os
testes novos verificam a forma dos dados, não o escopo). Isto é o achado tecnicamente mais
importante desta revisão.

---

## 2. Ela respeita o restante da arquitetura do Portal?

**Respeita:**
- **[E]** Padrão de RBAC existente (`requireAdmin`/`requireAdministradorMarca` seguem a mesma
  forma).
- **[E]** ADR-008/single-tenant, na letra: nenhum `tenant_id` foi introduzido, nenhum
  particionamento de banco.
- **[E]** Disciplina de migration + rollback do projeto.
- **[E]** LGPD/ADR-010 ponto 2 (classificação de dados) — a exclusão de `financeiro`/`lgpd` do
  recorte da Marca é coerente com "menor privilégio".

**Não respeita, ou deixa pendências abertas, sem reconciliação formal:**

- **[E]** **SPEC-035 §4.2** — a especificação soberana de Identidade e Acesso já descreve um
  ator `Marca` **diferente** do que ADR-022 implementou:

  | | SPEC-035 §4.2 (sovereign, pré-existente) | ADR-022 (implementado) |
  |---|---|---|
  | Nome do papel | `MARCA` | `ADMINISTRADOR_MARCA` |
  | Natureza | Terceiro ator peer (como Influenciadora) | "Nível 2" administrativo |
  | Onboarding | Self-service, formulário próprio, `PENDING→ACTIVE` via moderação do Administrador (igual Influenciadora) | Indefinido ("fica para decisão futura") |
  | Isolamento de dados | Implícito por `SUB_PROVIDER` (chave da própria conta) — SPEC-035 §11.2/§8.2.2 | Nenhum (ver §1.2 acima) |
  | Tabela de domínio | `BASE_MARCAS` (§10.2.3): `SUB_PROVIDER`, `CNPJ_EMPRESA`, `RAZAO_SOCIAL`, `NOME_FANTASIA`, `TELEFONE_CORPORATIVO` | Nenhuma — ADR-022 declara explicitamente "nenhuma entidade Marca/tenant_id é introduzida" |
  | Chamada explícita de risco | 🟠 "escopo de negócio novo (suporte a múltiplos clientes/tenants)... decisão real de produto" (SPEC-035, revisão 2026-07-17) | "não é um novo tenant" |

  ADR-022 lista SPEC-035 como documento relacionado, mas **não formalmente supera/emenda** o
  §4.2 — apenas cita "PORTAL_GLOSSARIO.md" e outros como "Legado a Revisar" (ainda pendente:
  `docs/architecture/PORTAL_GLOSSARIO.md:151` ainda lista o papel como `MARCA`, não
  `ADMINISTRADOR_MARCA`, e descreve Marca como "Entidade de tenant externo" — linguagem que o
  próprio ADR-022 diz que não se aplica).

- **[I]** Isso não é um erro de implementação — é uma **decisão de produto diferente da
  registrada em SPEC-035**, tomada sem atualizar a fonte que a precede. Hoje o repositório
  tem três definições de "Marca" competindo (S4 desta sessão: dado puro; ADR-022: admin
  restrito; SPEC-035/Glossário: tenant externo com onboarding próprio) e nenhuma delas venceu
  formalmente sobre as outras.

---

## 3. Quais ADRs precisariam ser alteradas para oficializar essa implementação?

1. **ADR-022** — precisa deixar de estar "Aceito" com lacunas silenciosas e assumir
   explicitamente duas decisões que hoje faltam (ou ganhar uma ADR companheira que as
   resolva — ver item 2 abaixo): (a) mecanismo de provisionamento; (b) se o isolamento por
   linha (marca_id) é adiado deliberadamente (risco aceito e documentado) ou exigido antes de
   ir para produção.
2. **Nova ADR de reconciliação** (ex.: ADR-023) — a peça que falta. Deve:
   - Ratificar ADR-022 como caminho aceito (ou revertê-lo — decisão sua, não minha).
   - Declarar formalmente o que SPEC-035 §4.2/§10.2.3 deixam de valer (nome do papel `MARCA`
     → `ADMINISTRADOR_MARCA`; onboarding self-service → provisionamento administrativo;
     `BASE_MARCAS` → sucedida por uma entidade de domínio equivalente, ver Seção 4).
   - Autorizar explicitamente a entidade de domínio `Marca` (tabela `marcas`) como
     **complementar**, não como alternativa, a ADR-022 — resolvendo a contradição que motivou
     esta pausa.
3. **SPEC-035 §4.2 e §10.2.3** — precisam de nota de revisão apontando para a nova ADR (mesmo
   padrão editorial já usado em outras seções da própria SPEC).
4. **Documentos "Legado a Revisar" já listados pelo próprio ADR-022** (ainda não executados):
   `PORTAL_BACKLOG.md` Feature 0.4, `PORTAL_BRIEFING.md` §9.3, `docs/architecture/
   PORTAL_GLOSSARIO.md`, `USER_JOURNEYS.md`.

---

## 4. É possível preservar o benefício esperado para o Google Drive sem complexidade desnecessária?

**[I] Sim — e a entidade de domínio `Marca` (o núcleo do S5 original) continua sendo o caminho
certo, independente de qual lado do debate RBAC vencer.**

Motivo, com evidência: **[E]** ADR-020 (`ARCHITECTURAL_DECISIONS.md:1207`) já resolveu o
isolamento de ambiente (uma `GOOGLE_DRIVE_ROOT_FOLDER_ID` por ambiente: dev/staging/prod) —
mas isso é **uma pasta raiz por ambiente**, não uma por Marca. Nada no repositório hoje
oferece um lugar para guardar "a pasta raiz do Drive desta Marca". A trilha planejada (Marca →
Ano → Mês → Influenciadora → Tipo de Conteúdo) não tem onde pendurar o primeiro nível sem essa
tabela.

Além disso — e este é o ponto novo que a auditoria revelou —, **a mesma tabela também é
pré-requisito para corrigir a lacuna 1.2 (isolamento de dados)**: sem um `marca_id` em
`Parceira` (e, por extensão, em `Entrega`), não há como o dashboard do `ADMINISTRADOR_MARCA`
filtrar por linha, e o vazamento entre Marcas descrito acima permanece latente.

**Proposta de escopo mínimo (evita reabrir SPEC-035 por inteiro):**

- Tabela `marcas`: `id`, `nome`, `pasta_raiz_drive_id`, `created_at`, `updated_at` — exatamente
  o que S5 já propunha.
- `Parceira.marcaId` (FK opcional, nullable) — não obrigatório retroativamente, só passa a
  existir para dado novo (mesmo padrão de FK opcional já usado em outras evoluções do
  projeto, ex. `ColaboracaoMensal`).
- **Não** implementar ainda: filtragem de query por `marcaId` em todos os endpoints (isso só
  importa quando existir uma segunda Marca real — YAGNI), onboarding self-service de Marca,
  `BASE_MARCAS` completa com CNPJ/razão social (SPEC-035 tem mais campos do que o Drive
  precisa agora).
- Isso é aditivo e não colide com nenhuma linha de código já escrita em ADR-022 — os dois
  conjuntos de mudança tocam arquivos diferentes, exceto `Parceira`, onde a mudança é só
  adicionar um campo opcional.

---

## 5. Impacto no Plano Mestre

| Sessão original | Situação |
|---|---|
| **S4** (ADR-022 "Marca é só dado, nunca ator") | **Invalidada como estava escrita.** Já existe um ADR-022 dizendo o oposto, com trabalho substancial por trás. Não pode ser reescrita com o mesmo número/conteúdo — vira a nova ADR de reconciliação descrita na Seção 3. |
| **S5** (tabela `marcas`, `marca_id` em Parceira, `nomeProfissional`) | **Majoritariamente válida, precisa de rescopo.** A tabela `marcas` e o `marca_id` continuam necessários (Seção 4) — só a justificativa muda: não é mais "para provar que Marca não é ator", é "pré-requisito do Drive e do isolamento de dados de ADR-022". `nomeProfissional` é ortogonal ao debate — segue válido como está. |
| **S6** (Perfil: campo `nomeProfissional`) | **Válida, sem alteração.** Não depende de qual lado do debate RBAC vence. |

**Sessões novas necessárias, não previstas no Plano Mestre original:**

- Fechar o trabalho não commitado (Grupo A da auditoria anterior): reexecutar build/lint/test,
  apresentar o resumo que o protocolo original exigia, e só então commitar — sem reabrir o
  código.
- Escrever a ADR de reconciliação (Seção 3).
- Decidir e implementar o provisionamento de `ADMINISTRADOR_MARCA` (lacuna 1.1) — decisão de
  produto real: convite manual pelo Administrador? campo novo em `BASE_MARCAS`? Não é
  inferível do que existe hoje.
- Higiene editorial dos documentos listados na Seção 3, item 4.

---

## 6. Proposta de Plano Mestre atualizado — Trilha 2 (Domínio: Marca)

```
S4' — ADR de reconciliação (substitui a S4 original)
  · Ratifica ADR-022 como decisão de produto aceita (ou formalmente a reverte — decisão do
    responsável do projeto, não desta sessão).
  · Resolve a divergência com SPEC-035 §4.2/§10.2.3 (nome do papel, natureza do ator).
  · Autoriza explicitamente a entidade de domínio `Marca` como complementar a ADR-022.
  · Não toca código.

S5' — Fechamento do trabalho existente (Grupo A da auditoria de 2026-08-05)
  · Reexecuta build/lint/test sobre o código já escrito (RBAC, migration, dashboard, tela).
  · Apresenta o resumo que o protocolo da sessão original exigia.
  · Um único commit, sem reabrir/redesenhar o que já existe.
  · Dependência: S4' aprovada.

S6' — Domínio Marca mínimo (substitui e reduz a S5 original)
  · Tabela `marcas` (id, nome, pasta_raiz_drive_id, created_at, updated_at).
  · `Parceira.marcaId` (FK opcional).
  · Sem filtragem de query por marca ainda (fora de escopo — ver S7').
  · Dependência: S4' aprovada. Independente de S5' (pode rodar em paralelo).

S7' — Provisionamento de ADMINISTRADOR_MARCA (nova, resolve lacuna 1.1)
  · Decisão de produto: como uma conta ganha esse papel.
  · Implementação mínima do fluxo escolhido.
  · Dependência: S4' + S6'.

S8' (era S6 original) — Perfil: campo nomeProfissional
  · Sem alteração de escopo. Pode rodar a qualquer momento, independente das demais.

S9' — Higiene editorial
  · PORTAL_GLOSSARIO.md, PORTAL_BACKLOG.md Feature 0.4, PORTAL_BRIEFING.md §9.3,
    USER_JOURNEYS.md, SPEC-035 §4.2/§10.2.3 — alinhar com a ADR de reconciliação (S4').
  · Dependência: S4' aprovada.

→ Trilha Google Drive (planejada, fora desta Trilha 2) passa a ter seu pré-requisito de dados
  (pasta_raiz_drive_id por Marca) satisfeito a partir de S6'.
```

**Nota sobre o isolamento de dados (lacuna 1.2):** não incluí uma sessão dedicada a "filtrar
por marca_id em todo endpoint administrativo" porque, **[H]** enquanto existir uma única Marca
real, isso é trabalho sem valor observável hoje (YAGNI) — mas recomendo que S7' ou a ADR de
reconciliação registrem explicitamente que esse é um risco aceito e conhecido, não um
esquecimento, para que não vire surpresa quando uma segunda Marca for cadastrada.
