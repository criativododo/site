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
scripts/dodo             — wrapper bash: chama dodo-model.mjs, depois `exec claude --model <alias>`
scripts/dodo-model.mjs   — decide o alias e imprime SOMENTE ele em stdout (diagnóstico vai para stderr)
```

Nenhum arquivo em `.claude/session-memory/` foi alterado. `/inicio` e `/fim`
continuam exatamente como estavam. `dodo-model.mjs` apenas invoca comandos
públicos e já existentes do CLI de memória (`journal`, `status`) e interpreta a
saída — a mesma saída que qualquer sessão já pode ler manualmente.

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
