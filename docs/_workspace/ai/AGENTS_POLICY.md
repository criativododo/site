# AGENTS_POLICY — Regra para Arquivos de Convenção Externa

> **Estabilidade:** Permanente
> **Depende de:** [CAPABILITY_MODEL.md](./CAPABILITY_MODEL.md) (capacidade C5a)
> **Dependido por:** [CODEX_POLICY.md](./CODEX_POLICY.md), [ROADMAP.md](./ROADMAP.md)
> **Frequência esperada de alteração:** muito baixa

---

## O problema que esta política resolve

Existe hoje uma convenção aberta, adotada por diversas ferramentas de terceiros (não específica de um único fornecedor), de ler um arquivo de instruções na raiz de um repositório para entender comandos de build/lint/test e convenções do projeto. Essa convenção **não define nenhuma precedência** com a constituição já existente do projeto (a capacidade C5a, hoje um arquivo próprio na raiz). Sem uma regra explícita, dois riscos reais existem:

1. Uma ferramenta externa que leia esse arquivo de convenção nunca vê a hierarquia de decisão do projeto, o vocabulário de domínio soberano, ou a regra de que Produto prevalece sobre decisão técnica — ela avalia tudo no vácuo.
2. Se o conteúdo da constituição for duplicado dentro desse arquivo "para garantir que a ferramenta externa veja", cria-se exatamente a múltipla fonte de verdade que o projeto proíbe — os dois arquivos divergem com o tempo porque ninguém edita os dois ao mesmo tempo, sempre.

---

## A regra

Qualquer arquivo de convenção externa criado neste repositório para uma ferramenta de terceiros:

1. **Nunca duplica** o conteúdo da constituição (capacidade C5a) — só referencia.
2. **Sempre defere** explicitamente: a primeira instrução do arquivo é ler a constituição e o índice de fontes de verdade do projeto antes de qualquer análise.
3. **Só adiciona** o que é estritamente de execução e não cabe na constituição — comandos de build/lint/test por aplicação, formato de saída esperado por uma ferramenta específica.
4. **Nunca nomeia** qual fornecedor de IA está do outro lado lendo o arquivo — a regra vale para qualquer ferramenta externa presente ou futura que venha a ler esse arquivo, não só a que motivou sua criação.

Esta regra é permanente porque não depende de qual ferramenta específica lê o arquivo — só depende de existir uma convenção aberta de arquivo-de-instruções-na-raiz, o que é, em si, independente de fornecedor.

---

## Status de implementação

**Nenhum arquivo de convenção externa foi criado ainda.** A criação do arquivo em si (na raiz do repositório, fora desta família de documentos em `docs/_workspace/ai/`) é uma decisão de implementação, não de documentação — fica registrada como item em aberto no `ROADMAP.md`, associada à Fase em que a relação com o fornecedor de julgamento independente (ver `CODEX_POLICY.md`) for ativada de fato.

Quando esse arquivo for criado, seu conteúdo deve seguir integralmente a regra acima — nada além disso precisa ser decidido no momento da criação, porque já está decidido aqui.
