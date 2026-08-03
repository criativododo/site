# Fase 0 — Descomissionamento do Design System Legado

**Data:** 2026-08-03
**Status:** proposto, aguardando aprovação. **Nada foi apagado, movido, alterado ou escrito
nesta etapa** — este documento é só inventário + classificação + plano.
**Por que agora:** a sessão em curso concluiu que o Design System atual (`DESIGN.md` +
`design-system/`) representa um momento anterior do projeto — token/componente primeiro, não
linguagem primeiro. Antes de escrever qualquer documento da nova arquitetura (`docs/design/`,
já especificada em `docs/superpowers/specs/2026-08-03-arquitetura-criativa-portal-design.md`,
spec aprovado mas execução pausada), o responsável do projeto pediu para aposentar o antigo
corretamente: inventariar, classificar, planejar a descontinuação, definir o arquivo histórico.

---

## Etapa 1 — Inventário completo

Levantamento feito por leitura direta do repositório (`find`, `grep -rl`, leitura de arquivo),
não por suposição.

### A. Documentação

| Item | Linhas | O que é |
|---|---|---|
| `DESIGN.md` (raiz) | 573 | Documento monolítico — identidade (Parte I, §01–07) + tokens/componentes/padrões/acessibilidade/engenharia/governança (Partes II–VI, §08–34) |
| `ART_DIRECTION_GUIDE.md` (raiz) | 206 | Princípios, anti-princípios, gramática visual, linguagem editorial, assinaturas, critérios de revisão — já principle-first, não token-first |
| `design-system/index.html` | 1151 | Versão navegável do mesmo conteúdo de `DESIGN.md` ("são o mesmo conteúdo em dois formatos", `design-system/README.md`) |
| `design-system/README.md` | 14 | Descreve o pacote `design-system/` |
| `design-system/docs/00-fundamentos-da-marca.md` | 55 | Versão condensada de `DESIGN.md` §01–07, para a ferramenta `.design-sync` |
| `design-system/docs/01-tokens-e-uso.md` | 64 | Versão condensada de `DESIGN.md` §09–13 |
| `design-system/docs/02-componentes.md` | 38 | Versão condensada de `DESIGN.md` §16–24 |
| `design-system/docs/03-logos-e-icones.md` | 140 | Versão condensada de `DESIGN.md` §08, §14 |

### B. Tokens e componentes (código, não consumido por `app/` nem `portal-frontend/` — confirmado via `grep -rl "design-system" app/src portal-frontend/src`, resultado vazio)

| Item | O que é | Fonte real |
|---|---|---|
| `design-system/src/styles/tokens.css` (62 linhas) | Cópia de tokens CSS, com comentário explícito: "Fonte: `portal-frontend/src/styles/tokens.css` (código real, autoridade final)" | Derivado, não autoritativo |
| `design-system/src/styles/components.css` (187 linhas) | Classes `.dodo-*` consolidando os 5 objetos de estilo inline duplicados diagnosticados em `DESIGN.md` §06/§34.7 | Trabalho original, não duplicado em nenhum outro lugar |
| `design-system/src/components/index.tsx` (114 linhas) | 13 componentes React reais (`Button`, `Card`, `Callout`, `Chip`, `TextField`, `StatusBadge`, `KpiTile`, `ListRow`, `PendenciaItem`, `NavLink`, `Container`, `Eyebrow`, `PageTitle`) | Trabalho original, não duplicado, **não importado por nenhum código de produto** |
| `design-system/package.json` | `@criativododo/design-system` v3.1.0, privado, nunca publicado (`dist/` não existe) | — |
| `design-system/.design-sync/config.json`, `conventions.md` | Configuração de uma ferramenta de sync externa (`DesignSync`, presente na lista de ferramentas desta sessão) apontando para este pacote | Possível integração externa ativa — ver Risco 1 |
| `design-system/tsconfig.json`, `.gitignore` | Scaffolding do pacote | — |

### C. Assets de marca (duplicados — canônicos vivem em `app/src/assets/brand/` e `portal-frontend/src/assets/brand/`, confirmados via `find`)

| Item | Duplica |
|---|---|
| `design-system/icon.svg`, `wordmark.svg`, `logo-secondary.svg`, `cores.jpg` | `app/src/assets/brand/{icon,principal,principal-cherry,secundario}.svg` (canônico) |
| `design-system/fonts/ElmsSans.ttf`, `WorkSans.ttf` | `@font-face` já declarado localmente em `app/src/index.css` e `portal-frontend/src/styles/tokens.css` (canônico) |
| `design-system/icons/*.svg` (15 arquivos) | Nenhum — não consumidos por nenhum código real (`grep` vazio). Dois carregam vocabulário banido do "Sistema B" (`02-campanhas.svg`, `03-marcas.svg`, ver `DESIGN.md` §05) |

### D. Decisões (ADRs relacionadas)

| ADR | Papel |
|---|---|
| `ADR-001` (`knowledge/ARCHITECTURAL_DECISIONS.md`) | Declara Landing como SSOT visual; já trata `design-system/index.html`/`DESIGN.md` como "documentação auxiliar, nunca fonte primária" |
| `ADR-004` (idem) | Exige que o Portal derive da Landing |
| `ADR-019` (`knowledge/Arquitetura/`, série antiga) | Nomeava um "Manual de Design DODÔ" nunca existente fisicamente aqui — já historicamente superada pela própria `ADR-001` |
| `ADR-021` (redigida nesta sessão, **ainda não commitada** — pausada, ver nota abaixo) | Nova hierarquia de produto; substituiria parcialmente `ADR-001`/`ADR-004` |

### E. Índices e links (arquivos que citam `design-system/` ou `DESIGN.md` como referência)

Encontrados via `grep -rl "design-system/\|DESIGN\.md"` em todo o repositório:

| Arquivo | O que diz hoje |
|---|---|
| `knowledge/PROJECT_SOURCE_OF_TRUTH.md` (linhas 21, 85) | "documentação auxiliar, nunca fonte primária" |
| `README.md` (raiz, linha 30) | idem |
| `knowledge/FRONTEND_PHILOSOPHY.md` (linhas 12, 66) | idem |
| `PORTAL_ARQUITETURA.md` (linhas 23, 27, 33, 55) | idem, + cita `ADR-019` explicitamente |
| `PORTAL_BRIEFING.md` (linhas 5–6, 40–41, 336, 366, 415) | idem, documento com mais menções |
| `PORTAL_BACKLOG.md` (linha 61) | "nunca partir de `design-system/index.html` isoladamente" |
| `START_HERE_NEXT_SESSION.md` | idem — já marcado como "arquivo legado" pelo próprio `CLAUDE.md` |
| `docs/_workspace/auditorias/*.md` (5 arquivos), `docs/_workspace/releases/*.md` (1 arquivo) | Snapshots datados (2026-07-26/29) — histórico congelado, não editável por convenção do projeto |
| `knowledge/Workspace/TASK_ROUTER.md`, `AMBIENTE_OPERACIONAL_DODO.md` | Congelados desde 2026-07-25 por `CLAUDE.md` — não editáveis |
| `docs/superpowers/specs/2026-08-03-arquitetura-criativa-portal-design.md`, `docs/superpowers/plans/2026-08-03-arquitetura-criativa-portal.md` | **Escritos nesta mesma sessão**, antes desta Fase 0 — descrevem um mecanismo de migração (banner in-place) já superado por este plano |
| `docs/superpowers/specs/2026-08-02-dashboard-editorial-design.md`, `docs/superpowers/plans/2026-08-02-dashboard-editorial-sprint2.md` | Registro histórico de sprint já executada — não editável (retrataria o que era verdade no momento) |

### F. Fora do escopo (não pertence ao Design System legado, apesar de aparecer na busca)

- `app/src/assets/brand/*`, `portal-frontend/src/styles/tokens.css`, `app/src/index.css` — **código de produção real**, não documentação do Design System. Regra explícita desta etapa: não alterar código.
- `referencias/2025-Hulu-Brand-Guidelines.pdf`, `referencias/GitHub-BrandGuidelines-2026.pdf` — material de referência de terceiros, citado pelo antigo `design-system/README.md` como influência só de navegação, nunca de identidade. Continua legítimo como insumo de pesquisa (poderia até alimentar `03_REFERENCE_LIBRARY.md` no futuro).

---

## Etapa 2 — Classificação

Quatro categorias, uma por item — quando um documento tem partes com destino diferente
(caso de `DESIGN.md`), a classificação é feita por seção, não pelo arquivo inteiro.

| Item | Classificação | Justificativa |
|---|---|---|
| `DESIGN.md` Parte I (§01–07: manifesto, história, personalidade, como pensamos/escrevemos, o que nunca fazemos, branding/produto/engenharia) | **B) Migrar** | Absorvido por `00_MANIFESTO.md`/`01_VISION_BOOK.md` — já citado literalmente no plano de execução pausado (Tasks 4–5) |
| `DESIGN.md` Partes II–VI (§08–34: tokens, componentes, padrões, acessibilidade, engenharia, governança, pendências) | **Arquivar (condicionado)** — nem A nem C ainda | É a única referência técnica detalhada existente (contraste WCAG calculado, razões de escala tipográfica, lista de pendências reais). Arquivar agora perderia conhecimento sem substituto — fica ativa até `10_DESIGN_SYSTEM.md` ser reescrito por completo e chegar a `Vigente`. Só então migra fisicamente para o arquivo histórico. |
| `ART_DIRECTION_GUIDE.md` (inteiro) | **B) Migrar, depois Arquivar (condicionado)** | Conteúdo é absorvido por `04_CREATIVE_DIRECTION.md`/`05`/`06`/`07`/`12` (já especificado no spec aprovado). O arquivo original só vai para o histórico depois que os documentos novos existirem e forem conferidos contra ele — não antes, para não perder a única fonte hoje "vigente" de Creative Direction real. |
| `design-system/index.html` | **C) Arquivar** | Mesmo conteúdo de `DESIGN.md` em outro formato — nenhum conhecimento exclusivo |
| `design-system/README.md` | **C) Arquivar** | Descreve o próprio pacote arquivado |
| `design-system/docs/*.md` (4 arquivos) | **C) Arquivar** | Versões condensadas de `DESIGN.md`, sem conteúdo exclusivo |
| `design-system/.design-sync/*` | **C) Arquivar** — com ressalva | Ver Risco 1 antes de mover de fato |
| `design-system/package.json`, `tsconfig.json`, `.gitignore` | **C) Arquivar** | Scaffolding do pacote arquivado |
| `design-system/src/styles/tokens.css` | **C) Arquivar** | Derivado, não autoritativo (a autoridade real é `portal-frontend/src/styles/tokens.css`, fora de escopo) |
| `design-system/src/styles/components.css` | **C) Arquivar, com nota técnica** | Trabalho original sem duplicata — sinalizar explicitamente no README do arquivo como candidato de referência para quando `11_COMPONENTS.md` for escrito de verdade, não descartar da memória do projeto |
| `design-system/src/components/index.tsx` | **C) Arquivar, com nota técnica** | Mesma ressalva — é a única tentativa já feita de resolver a duplicação de estilo inline diagnosticada em `DESIGN.md` §06/§34.7. Arquivar não é descartar: é tirar da arquitetura ativa mantendo consultável. |
| `design-system/{icon,wordmark,logo-secondary}.svg`, `cores.jpg`, `fonts/*.ttf` | **C) Arquivar** | Cópias redundantes; os originais canônicos (`app/src/assets/brand/`, fontes locais) continuam ativos, fora de escopo desta decisão |
| `design-system/icons/*.svg` (13 sem vocabulário banido) | **C) Arquivar** | Não usados por nenhum código, sem urgência de remoção |
| `design-system/icons/02-campanhas.svg`, `03-marcas.svg` | **D) Remover** (candidato — não executar ainda) | Únicos itens do inventário que carregam vocabulário do "Sistema B" já explicitamente banido de texto de interface novo (`DESIGN.md` §05). Diferem do resto por serem ativamente contraindicados, não só obsoletos. |
| `ADR-001`, `ADR-004` (`knowledge/ARCHITECTURAL_DECISIONS.md`) | **A) Preservar** (como registro), **impactadas** | ADRs não são reabertas nem editadas por convenção do projeto — continuam no arquivo como estão, com `ADR-021` (quando commitada) registrando que as substitui parcialmente |
| `ADR-019` (`knowledge/Arquitetura/`) | **A) Preservar** | Já corretamente tratada como histórico há mais de uma sessão — nenhuma ação nova |
| `knowledge/PROJECT_SOURCE_OF_TRUTH.md`, `README.md`, `FRONTEND_PHILOSOPHY.md`, `PORTAL_ARQUITETURA.md`, `PORTAL_BRIEFING.md`, `PORTAL_BACKLOG.md` | **B) Migrar (texto)** | Precisam de edição pontual (trocar "documentação auxiliar" por "arquivo histórico, ver `docs/archive/design-system-v1/`") — conteúdo migra, arquivo continua existindo e ativo |
| `START_HERE_NEXT_SESSION.md`, `docs/_workspace/*`, `knowledge/Workspace/TASK_ROUTER.md`, `AMBIENTE_OPERACIONAL_DODO.md` | **A) Preservar, sem edição** | Já congelados/históricos por convenção do próprio `CLAUDE.md` — editá-los agora falsificaria um registro datado |
| `docs/superpowers/specs/2026-08-03-arquitetura-criativa-portal-design.md`, `.../plans/2026-08-03-arquitetura-criativa-portal.md` | **B) Migrar (revisar)** | Já marcado como pausado (ver nota no topo do plano); precisa de revisão pontual do mecanismo de migração antes de retomar a execução |
| `docs/superpowers/specs/2026-08-02-*.md`, `.../plans/2026-08-02-*.md` | **A) Preservar, sem edição** | Registro histórico de sprint já executada |
| `app/src/assets/brand/*`, tokens reais em `app/src/index.css`/`portal-frontend/src/styles/tokens.css` | **A) Preservar — fora de escopo** | Código de produção, não Design System documental. Esta Fase 0 não os toca. |
| `referencias/*.pdf` | **A) Preservar — fora de escopo** | Material de terceiros, não pertence ao Design System do Dodô |

---

## Etapa 3 — Plano de descontinuação

### Arquivos afetados (resumo)

- **Movidos integralmente (Etapa 4):** toda a pasta `design-system/` (17 arquivos).
- **Editados pontualmente (referência trocada, conteúdo majoritário preservado):**
  `knowledge/PROJECT_SOURCE_OF_TRUTH.md`, `README.md`, `knowledge/FRONTEND_PHILOSOPHY.md`,
  `PORTAL_ARQUITETURA.md`, `PORTAL_BRIEFING.md`, `PORTAL_BACKLOG.md` (6 arquivos).
- **Recebem banner de superseded, mas continuam no lugar por enquanto:** `DESIGN.md`,
  `ART_DIRECTION_GUIDE.md` — movidos para o arquivo histórico só depois que `00`/`01` e
  `04`–`07`/`12` estiverem escritos e conferidos.
- **Não tocados nesta Fase 0 nem na fase seguinte:** todo o resto (ADRs vigentes, histórico
  congelado, código de produção).

### Ordem de migração proposta (para quando este plano for aprovado — nada disso executa agora)

1. Verificar, fora do repositório, se há integração ativa da ferramenta `DesignSync` apontando
   para `design-system/.design-sync/config.json` (Risco 1) — checagem, não execução de código.
2. Criar `docs/archive/design-system-v1/README.md` (conteúdo definido na Etapa 4).
3. `git mv design-system/ docs/archive/design-system-v1/design-system/` — um `git mv` real,
   preserva histórico de commit por arquivo (diferente da migração de `DESIGN.md`/
   `ART_DIRECTION_GUIDE.md`, que é redistribuição de conteúdo, não rename 1:1).
4. Editar os 6 arquivos de índice/governança listados acima, trocando a referência.
5. Commitar `ADR-021` em `knowledge/ARCHITECTURAL_DECISIONS.md` (já redigida no spec aprovado,
   pausada nesta sessão) — só depois do arquivamento, porque o texto da ADR cita a migração
   como consequência já em curso, não como promessa futura.
6. Revisar `docs/superpowers/specs/2026-08-03-arquitetura-criativa-portal-design.md` e
   `.../plans/2026-08-03-arquitetura-criativa-portal.md` para refletir arquivamento físico em
   vez de banner in-place nas Tasks 2/3/17.
7. Retomar a escrita dos 13 documentos de `docs/design/`.
8. Só depois de `00_MANIFESTO`, `01_VISION_BOOK`, `04_CREATIVE_DIRECTION`, `05_VISUAL_LANGUAGE`,
   `06_SIGNATURE_MOMENTS`, `07_EDITORIAL_PATTERNS`, `12_ANTI_PATTERNS` existirem e passarem a
   `Vigente`: mover `ART_DIRECTION_GUIDE.md` para o arquivo histórico.
9. Só depois de `10_DESIGN_SYSTEM.md` ser reescrito por completo e passar a `Vigente`: mover
   `DESIGN.md` para o arquivo histórico (gate por conteúdo, não por data).

### Riscos

1. **Integração externa não visível.** `.design-sync/config.json` sugere uma ferramenta de
   sync automatizado real (`DesignSync` está na lista de ferramentas desta sessão). Mover a
   pasta sem checar pode quebrar um pipeline fora do repositório. Mitigação: Step 1 da ordem
   de migração, antes de qualquer `git mv`.
2. **Perda de referência técnica antes da hora.** `DESIGN.md` Partes II–VI contêm a única
   tabela de contraste WCAG calculada e a única escala tipográfica documentada em detalhe.
   Mitigação: arquivamento condicionado à reescrita de `10_DESIGN_SYSTEM.md`, não a uma data.
3. **Referências quebradas em 6+13 arquivos.** Ver tabela "Índices e links" da Etapa 1 —
   qualquer sessão futura (humana ou IA) que siga um desses documentos sem eles terem sido
   atualizados encontra um link morto. Mitigação: Step 4 da ordem de migração é obrigatório
   antes de considerar a Fase 0 concluída, não opcional.
4. **Código funcional esquecido.** `design-system/src/components/index.tsx` e
   `components.css` resolvem um problema real já diagnosticado (duplicação de estilo inline em
   5 telas administrativas) e não têm duplicata em nenhum outro lugar. Arquivar sem nota
   separada corre o risco de essa solução ser esquecida quando `11_COMPONENTS.md` for escrito
   de verdade. Mitigação: nota explícita no README do arquivo (Etapa 4).
5. **Este próprio spec/plano ficarem desatualizados.** O spec e o plano de execução já escritos
   nesta sessão (2026-08-03, antes desta Fase 0) descrevem um mecanismo diferente do que este
   documento propõe. Mitigação: Step 6 da ordem de migração.

### ADRs impactadas

- `ADR-001`, `ADR-004` — já parcialmente substituídas pela `ADR-021` (redigida, pausada).
  Nenhuma edição retroativa nelas — convenção do projeto é nunca reabrir ADR.
- `ADR-019` (série antiga) — nenhum impacto novo, já tratada como histórico.
- `ADR-021` — sua criação física (commit em `knowledge/ARCHITECTURAL_DECISIONS.md`) passa a
  depender da conclusão desta Fase 0, conforme a ordem de migração acima (item 5).

### Documentação que precisará ser atualizada

Lista fechada, igual à tabela "Índices e links" da Etapa 1, seção com classificação
B) Migrar (texto): `knowledge/PROJECT_SOURCE_OF_TRUTH.md`, `README.md`,
`knowledge/FRONTEND_PHILOSOPHY.md`, `PORTAL_ARQUITETURA.md`, `PORTAL_BRIEFING.md`,
`PORTAL_BACKLOG.md`. Nenhum outro arquivo do repositório precisa de edição para esta Fase 0.

---

## Etapa 4 — Estrutura do arquivo histórico

```
docs/archive/design-system-v1/
├── README.md                     ← novo, conteúdo abaixo
└── design-system/                ← toda a pasta atual, movida via git mv, estrutura interna intacta
    ├── index.html
    ├── README.md
    ├── docs/
    │   ├── 00-fundamentos-da-marca.md
    │   ├── 01-tokens-e-uso.md
    │   ├── 02-componentes.md
    │   └── 03-logos-e-icones.md
    ├── .design-sync/
    ├── icons/                    (15 arquivos, incl. os 2 com vocabulário banido)
    ├── fonts/
    ├── src/
    │   ├── styles/{tokens,components}.css
    │   ├── components/index.tsx
    │   └── index.js
    ├── icon.svg, wordmark.svg, logo-secondary.svg, cores.jpg
    └── package.json, tsconfig.json, .gitignore
```

`DESIGN.md` e `ART_DIRECTION_GUIDE.md` **não entram aqui agora** — entram como
`docs/archive/design-system-v1/DESIGN.md` e `.../ART_DIRECTION_GUIDE.md` numa fase posterior,
cada um só quando seu gate de conteúdo (Etapa 3, itens 8–9) for cumprido.

### `docs/archive/design-system-v1/README.md` — conteúdo definido nesta etapa

```markdown
# Design System v1 — arquivo histórico

Este diretório é o registro histórico do primeiro Design System documentado do Criativo Dodô
(`design-system/`, v3.1.0, auditado pela última vez em 28/07/2026). Ele foi descontinuado em
2026-08-03 pela `ADR-021`, que institui uma arquitetura de produto orientada por linguagem
(`docs/design/`) em vez de tokens/componentes.

**O que isto significa:**

- Este material pertence à história do projeto — mostra como o Dodô documentou sua identidade
  visual antes da Fase 0 desta sessão.
- **Não é mais fonte de verdade.** Nenhum valor, componente ou princípio aqui deve ser tratado
  como vigente.
- **Nenhuma decisão futura de identidade deve consultar este diretório.** A fonte de verdade
  vigente é `docs/design/` (`ADR-021`).

**Exceção técnica, não de identidade:** `design-system/src/components/index.tsx` e
`design-system/src/styles/components.css` contêm a única implementação já tentada da
consolidação de estilo inline duplicado diagnosticada em `DESIGN.md` §06/§34.7 (5 telas
administrativas com objetos de estilo quase idênticos copiados e colados). Quando
`docs/design/11_COMPONENTS.md` for escrito de verdade, este código é uma referência técnica
legítima de ponto de partida — não uma decisão de identidade a reconsultar, um artefato de
engenharia a avaliar.

Documentação técnica ainda ativa, fora deste arquivo, até serem formalmente reescritas: os
valores reais de cor/tipografia/espaçamento vivem em `app/src/index.css` e
`portal-frontend/src/styles/tokens.css` (código de produção, sempre a autoridade final) e,
descritivamente, em `DESIGN.md` (raiz do repositório) até `docs/design/10_DESIGN_SYSTEM.md`
estar completo.
```

---

## Fora de escopo desta Fase 0

- Mover `git mv design-system/` de fato — planejado, não executado.
- Editar os 6 arquivos de índice — planejado, não executado.
- Commitar `ADR-021` — planejado, não executado (permanece pausada).
- Escrever qualquer um dos 13 documentos de `docs/design/`.
- Qualquer alteração em código, componente ou token técnico.
- Mover `DESIGN.md` ou `ART_DIRECTION_GUIDE.md` — gate de conteúdo ainda não cumprido.

## Critério de aceite desta Fase 0

- [ ] Inventário (Etapa 1) confere com o estado real do repositório — nenhum item inventado,
      nenhum item real omitido.
- [ ] Toda linha do inventário tem exatamente uma classificação A/B/C/D (ou "condicionado",
      declarado como tal, nunca como ambiguidade não resolvida).
- [ ] Plano de descontinuação (Etapa 3) cobre arquivos afetados, ordem, riscos, referências
      quebradas e ADRs impactadas — sem lacuna não declarada.
- [ ] Estrutura de arquivo (Etapa 4) definida com README explícito sobre os três pontos
      pedidos: pertence à história, não é fonte de verdade, não deve ser consultado para
      decisões futuras.
- [ ] Nenhum arquivo foi apagado, movido ou alterado nesta etapa.
- [ ] Aprovação do responsável do projeto antes de qualquer execução.
