# SUBAGENTS — Especificação dos Subagentes Aprovados

> **Estabilidade:** Evolutiva
> **Depende de:** [CAPABILITY_MODEL.md](./CAPABILITY_MODEL.md), [MODEL_ROUTING.md](./MODEL_ROUTING.md), [CONTEXT_POLICY.md](./CONTEXT_POLICY.md)
> **Dependido por:** [ROADMAP.md](./ROADMAP.md)
> **Frequência esperada de alteração:** média-alta — cresce conforme novos subagentes são aprovados

---

## Critério de criação (herdado de MODEL_ROUTING.md)

Um subagent dedicado só se justifica quando o mesmo papel, com as mesmas instruções e ferramentas, seria recriado repetidamente. Uma necessidade pontual usa execução isolada ad-hoc, não um subagent registrado aqui.

Dos onze candidatos avaliados durante a fase de arquitetura (Layout, Editorial, Produto, DevOps, QA, Bug Investigator, Security, Performance, Code Reviewer, Documentação, Explore), oito foram descartados por já terem um Binding equivalente em outra capacidade (C3 nativo, C4 via `CODEX_POLICY.md`, ou uma skill já existente) ou por representarem um risco direto contra a capacidade C0 (o caso de um subagent "Produto", nunca aprovado — decisão de Produto exige a hierarquia completa de fontes de verdade, que um subagent recém-instanciado não carrega). Três foram aprovados:

---

## Layout

**Responsabilidade:** verificar aderência ao sistema de identidade visual e design já consolidado antes de qualquer tela nova ser implementada.

**Capacidade servida:** C3 (exploração/recuperação — não emite julgamento de aprovação final, só levanta o que já existe e onde a nova tela diverge).

**Modo de execução:** isolado síncrono, sem escrita — ferramentas restritas a leitura/busca, nunca edição.

**Skills pré-carregadas:** as skills de design/frontend já existentes no projeto.

**Isolamento:** total — não herda o histórico da sessão principal além do necessário para saber qual tela está sendo avaliada.

**Quando usar:** antes de implementar qualquer tela nova, para checar aderência ao design system oficial.

**Quando NÃO usar:** para implementar a tela em si (isso é C1, sessão principal), ou para trabalho exclusivamente back-end.

---

## DevOps

**Responsabilidade:** possuir formalmente a etapa de validação em produção pós-deploy — etapa que a constituição do projeto já exige, mas que hoje não tem dono consistente.

**Capacidade servida:** C2 (verificação mecânica, primariamente) com escalonamento para C3 quando a validação exige investigar logs/estado real.

**Modo de execução:** isolado síncrono, com acesso restrito a comandos de leitura/diagnóstico — nunca a comandos que alteram infraestrutura.

**Skills pré-carregadas:** nenhuma skill de terceiros — usa diretamente os scripts de verificação já definidos pelo projeto.

**Isolamento:** total.

**Quando usar:** imediatamente após qualquer deploy, para confirmar que o comportamento em produção corresponde ao aprovado.

**Quando NÃO usar:** para decidir *se* um deploy deve acontecer (isso é C0) ou para executar o deploy em si (isso é C1 na sessão principal, sob aprovação humana).

---

## Documentação

**Responsabilidade:** checar se uma mudança de código deixou decisão arquitetural ou documentação de domínio desatualizada.

**Capacidade servida:** C3 (recuperação — encontra divergência) com saída que alimenta C0 (decisão humana sobre se e como corrigir).

**Modo de execução:** isolado síncrono. Edição restrita a documentação — nunca a código-fonte.

**Skills pré-carregadas:** nenhuma — lê diretamente os documentos de domínio e arquitetura já existentes no projeto.

**Isolamento:** total.

**Quando usar:** antes do encerramento de uma sessão de trabalho, quando a mudança feita tocou em arquitetura, domínio ou processo.

**Quando NÃO usar:** para editar código-fonte, nunca — mesmo que o problema encontrado esteja no código, este subagent só aponta, não corrige.

---

## Status de implementação

Nenhum dos três subagentes foi criado como arquivo de definição ainda — esta é a especificação aprovada, a criação do arquivo de definição em si é um passo de implementação registrado no `ROADMAP.md`, fora do escopo desta fase de documentação.
