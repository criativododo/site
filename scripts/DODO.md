# DODO
## ROTEADOR AUTOMÁTICO DE MODELO

Versão: 1.0

---

# Objetivo

`scripts/dodo` é um substituto externo do comando `claude`: escolhe o modelo mais
econômico com segurança antes de iniciar a sessão e então inicia o Claude Code
normalmente, repassando todos os argumentos.

```bash
./scripts/dodo                # em vez de: claude
./scripts/dodo "objetivo..."  # em vez de: claude "objetivo..."
```

O comando não decide sozinho quando não há evidência suficiente: nesse caso usa
Sonnet, que é o modelo de referência do projeto.

---

# Mecanismo oficial usado

A seleção é feita com a forma oficial documentada do Claude Code:

```bash
claude --model <alias> "$@"
```

`--model` tem prioridade sobre a variável de ambiente `ANTHROPIC_MODEL` e sobre o
campo `model` de settings — por isso é a forma usada aqui, e não a variável de
ambiente. Fonte: documentação oficial do Claude Code (CLI reference / model
config), validada na versão instalada (`claude --version`) antes da implementação.

---

# Arquitetura

```text
scripts/dodo                        — wrapper bash: chama dodo-model.mjs, depois `exec claude --model <alias>`
scripts/dodo-model.mjs              — decide o alias, imprime SOMENTE ele em stdout (diagnóstico vai para stderr)
                                       e grava cada decisão em scripts/logs/dodo-decisions.log
scripts/hooks/dodo-session-observer.mjs — hook de observação pura (SessionStart/SessionEnd); grava no mesmo log
scripts/logs/dodo-decisions.log     — log de auditoria append-only (gerado em runtime, ignorado pelo git via *.log)
```

Nenhum arquivo em `.claude/session-memory/` foi alterado. `/inicio` e `/fim`
continuam exatamente como estavam. `dodo-model.mjs` apenas invoca comandos
públicos e já existentes do CLI de memória (`journal`, `status`) e interpreta a
saída — a mesma saída que qualquer sessão já pode ler manualmente.

---

# Log de auditoria (`scripts/logs/dodo-decisions.log`)

Arquivo texto, append-only, uma linha por evento. Duas origens gravam nele:

1. **`dodo-model.mjs`** — uma linha por decisão de modelo, com o mesmo motivo
   já impresso no `stderr`:
   ```
   2026-08-05T17:26:48.735Z decision model=haiku reason="tag de complexidade do último journal"
   ```
2. **`scripts/hooks/dodo-session-observer.mjs`** — uma linha por início/fim de
   sessão do Claude Code, via hooks `SessionStart` e `SessionEnd`:
   ```
   2026-08-05T17:27:19.577Z sessionstart session_id=<id> detail="startup"
   2026-08-05T17:27:19.606Z sessionend session_id=<id> detail="other"
   ```

O arquivo é criado em runtime (`mkdirSync` recursivo) e cai no padrão global
`*.log` do `.gitignore` — nunca é versionado.

---

# Hooks (observação pura — Etapa 4 do MODELOS.md)

Registrados em `.claude/settings.json`, eventos `SessionStart` e `SessionEnd`,
apontando para `scripts/hooks/dodo-session-observer.mjs`.

Regras do hook, validadas contra a documentação oficial
(`code.claude.com/docs/en/hooks`) antes da implementação:

- Lê o payload JSON do stdin (`hook_event_name`, `session_id`, `source`/`reason`).
- Nunca decide, nunca bloqueia, nunca escreve em stdout de forma a interferir
  na sessão, sempre encerra com `exit 0` — inclusive com stdin vazio ou inválido.
- Não existe, na documentação oficial, nenhum campo de saída de hook capaz de
  alterar o `model` da sessão ativa. Por isso o observer só registra eventos;
  a decisão de modelo continua exclusivamente em `dodo-model.mjs`, executada
  antes do processo `claude` subir (ver `scripts/dodo`).
- `Stop` (fim de turno) foi descartado como evento de "fim de sessão": dispara
  a cada resposta do assistente, o que gera ruído no log. `SessionEnd` é o
  evento correto no nível de sessão.

---

# Ordem de prioridade da decisão

1. **Tag de complexidade gravada pelo `/fim`** no journal mais recente.
2. **Saída estruturada de `scripts/saude --json`.**
3. **Estado da sessão** (`session-memory.mjs status`): só empurra para `sonnet`
   quando há bloqueios ativos — não decide `haiku` nem `opus` sozinho.
4. **Fallback: `sonnet`.**

Nenhuma fonte lê palavras-chave em Markdown. Cada fonte falha em silêncio (log
em stderr) e cede para a próxima; nenhuma falha impede o lançamento do Claude
Code.

| Classificação | Modelo |
| --- | --- |
| LOW | haiku |
| MID | sonnet |
| HIGH | opus |

---

# Convenção: registrar a classificação da próxima sessão

Não é necessária nenhuma mudança em `/fim` para isso — o campo `tags` já existe
no schema de detalhes que `/fim` aceita hoje. Ao encerrar uma sessão, quem sabe
o tamanho da próxima tarefa pode incluir uma tag no formato:

```json
{ "tags": ["proxima-sessao:LOW"] }
```

Valores aceitos: `LOW`, `MID`, `HIGH` (maiúsculas ou minúsculas). Ausência da
tag não é erro — a decisão simplesmente passa para a próxima fonte da lista
acima.

---

# Gap conhecido

`scripts/saude` ainda não implementa `--json` nesta versão do repositório
(`scripts/render/json.js` existe mas está vazio; `scripts/core/main.js` não lê
argumentos). `dodo-model.mjs` detecta isso (arquivo vazio) e pula a fonte sem
executar o relatório completo, evitando custo desnecessário a cada
lançamento. Quando `--json` for implementado, a fonte passa a funcionar sem
nenhuma mudança em `scripts/dodo-model.mjs`, desde que a saída inclua um campo
`recommendedComplexity` com um dos valores `LOW`, `MID` ou `HIGH`.

---

# Regras

Nunca decide via keyword-matching em arquivos Markdown.

Nunca impede o lançamento do Claude Code por falha de qualquer fonte.

Nunca altera `/inicio` nem `/fim`.

Nunca imprime em stdout algo além do alias final do modelo.

Hooks (`scripts/hooks/`) nunca decidem nem alteram o modelo — apenas
observam e registram. A decisão de modelo é sempre feita antes do processo
`claude` subir, em `dodo-model.mjs`.

---

# Fase 3 — Prompt Intelligence Router

## Objetivo

Analisar cada prompt do usuário antes de ele chegar ao Claude, classificá-lo
e gerar recomendações via `additionalContext` — sem trocar o modelo em
execução (isso continua sendo a Fase 2, adiada) e sem nenhum recurso não
documentado.

## Arquitetura

```text
scripts/prompt-router/classify.mjs   — Classification Engine: função pura,
                                         recebe prompt_text, devolve o contrato
                                         estruturado. Não conhece hooks, não
                                         conhece additionalContext, sem I/O.
scripts/prompt-router/policy.mjs     — Policy Engine: função pura, recebe o
                                         contrato do Classification Engine,
                                         devolve additionalContext +
                                         recomendações. Não lê prompt_text.
scripts/hooks/dodo-prompt-router.mjs — Hook UserPromptSubmit: só orquestra
                                         (stdin → classify() → derivePolicy()
                                         → stdout + log). Nenhuma regra de
                                         negócio vive aqui.
scripts/prompt-router/*.test.mjs     — testes (node --test), cobrindo os dois
                                         motores isoladamente.
```

Validado contra `code.claude.com/docs/en/hooks.md`: `UserPromptSubmit`
dispara uma vez por turno, aceita `hookSpecificOutput.additionalContext` como
mecanismo de injeção de contexto, e **não** aceita nenhum campo capaz de
reescrever o prompt ou trocar o modelo — por isso o hook só recomenda, nunca
força.

## Contrato do Classification Engine (versionado)

```js
{
  version: "1.0.0",
  complexity: "LOW" | "MID" | "HIGH",
  taskType: "debug" | "feature" | "research" | "docs" | "other",
  confidence: number,        // 0–0.95, proporção de sinais heurísticos encontrados
  reasoning: string[],       // razões legíveis, para auditoria
  suggestedModel: "haiku" | "sonnet" | "opus",
  metadata: { source: "heuristic-v1", promptLength: number, matchedKeywords: string[] },
}
```

`source` identifica a origem da classificação. A V1 usa apenas heurísticas
locais e determinísticas (palavras-chave e tamanho do prompt) — nenhuma
chamada de rede, nenhuma dependência externa.

**Extensão futura sem quebrar a interface pública:** `classify(promptText,
context)` mantém essa assinatura mesmo se novas fontes de sinal forem
adicionadas (estado da sessão, tags de journal, estado do git). O
Classification Engine não faz I/O — quem coletar esses sinais externos é o
hook (que já faz I/O), passando-os pelo parâmetro `context`. Se a Anthropic
documentar oficialmente um hook `type: "prompt"`, a V1 heurística pode ser
substituída por uma implementação que delegue a esse hook — desde que
devolva o mesmo contrato (mudando apenas `metadata.source`, ex.:
`"prompt-hook-v1"`). `policy.mjs` e o orquestrador não mudam nesse cenário.

## Saída do Policy Engine

```js
{
  additionalContext: string,        // uma linha só, curta — o que o Claude vê
  suggestedApproach: string | null,
  suggestedTools: string[],
  suggestedSubagents: string[],
  suggestedReadStrategy: string | null,
}
```

## Regras

- `classify.mjs` e `policy.mjs` são funções puras: mesma entrada → mesma
  saída, sem efeito colateral, sem I/O.
- O hook nunca bloqueia o prompt por falha própria: qualquer erro de
  classificação/política cai em silêncio, sem `additionalContext`, e sai
  `exit 0` — igual à regra de observação da Fase 1.
- `additionalContext` é sempre uma única linha, sem quebras de linha, para
  minimizar consumo de contexto.
- Nenhuma troca de modelo é executada por este hook — `suggestedModel` é
  apenas texto que o Claude lê, nunca um comando de troca.

## Limitação conhecida

Hooks são carregados na inicialização da sessão (`SessionStart`). Registrar
`UserPromptSubmit` em `.claude/settings.json` durante uma sessão em execução
não altera o comportamento dessa sessão — só passa a valer a partir da
próxima inicialização do Claude Code.

---

# Status de implementação (MODELOS.md)

- **Fase 1 — MVP: concluída.** Launcher, Router (com log de auditoria
  persistente) e hooks de observação (`SessionStart`/`SessionEnd`) implementados
  e validados, todos com mecanismos oficiais do Claude Code.
- **Fase 2 — Session Intelligence (alternância de modelo durante a mesma
  sessão): adiada, não descartada.** Validado contra a documentação oficial de
  hooks: não existe, hoje, nenhum campo de saída de hook nem variável de
  ambiente documentada capaz de alterar o `model` de uma sessão em execução.
  A única via oficial de alternância é reiniciar a sessão (`scripts/dodo`
  decide de novo) ou o usuário digitar `/model` manualmente. Retomar apenas
  mediante aprovação explícita e/ou nova capacidade oficial documentada pela
  Anthropic.
- **Fase 3 — Inteligência Adaptativa: implementada (V1, heurística local).**
  Prompt Intelligence Router via `UserPromptSubmit` + `additionalContext`,
  com Classification Engine e Policy Engine separados e testados. Ver seção
  "Fase 3 — Prompt Intelligence Router" acima. Não altera Fase 1, não altera
  `/inicio`/`/fim`, não altera `session-memory`, não troca modelo em runtime.
