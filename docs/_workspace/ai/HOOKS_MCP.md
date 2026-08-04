# HOOKS_MCP — Critério de Evidência para Automação e Integração Estruturada

> **Estabilidade:** Permanente enquanto vazio (nenhum hook e nenhuma integração aprovados) — passa a Evolutiva no dia em que o primeiro item de qualquer uma das duas seções for aprovado
> **Depende de:** [CAPABILITY_MODEL.md](./CAPABILITY_MODEL.md) (modo de invocação automática; extensibilidade)
> **Dependido por:** [ROADMAP.md](./ROADMAP.md)
> **Frequência esperada de alteração:** baixíssima

---

## Nota de fusão

Este documento fundiu o que originalmente eram dois arquivos separados (`HOOKS.md` e `MCP.md`), criados durante a fase de documentação e fundidos logo em seguida, na auditoria de design documental: no estado em que o projeto se encontra, os dois tinham exatamente o mesmo conteúdo estrutural — estado vazio, critério de evidência, candidatos descartados, forma de revisitar — para dois eixos conceituais diferentes da taxonomia (modo de invocação automática vs. extensibilidade). Fundir eliminou repetição de estrutura sem perder nenhuma informação. Se um dos dois eixos ganhar conteúdo real e crescer o suficiente para justificar isolamento de novo, a divisão pode ser refeita — não é uma decisão irreversível.

---

## Parte 1 — Hooks (automação em resposta a evento)

**Estado atual:** nenhum hook próprio do projeto está aprovado. Automações eventualmente presentes num fornecedor específico (ver `CODEX_POLICY.md`) não são hooks deste projeto — são infraestrutura do fornecedor, documentada lá.

**Critério de aprovação** — as três condições abaixo, simultaneamente:
1. Existe evidência real e documentada — um incidente já registrado no estado operacional (capacidade C5c) onde a ausência da automação causou um problema concreto.
2. Não é contexto estático — se o hook existiria só para lembrar de uma regra permanente, a regra pertence à constituição (C5a), não a uma automação.
3. Não é bloqueio de segurança "hard" — controle de acesso e permissão tem mecanismo próprio; um hook é, na melhor das hipóteses, um filtro de melhor esforço.

**Candidatos já avaliados e descartados:**

| Candidato | Motivo do descarte |
|---|---|
| Bloquear conclusão de tarefa sem verificação mecânica ter rodado | Nenhuma evidência de que isso já falhou na prática |
| Lembrete automático de iniciar sessão documentada | Duplicaria o que a constituição já declara — contexto estático não é papel de hook |

---

## Parte 2 — Integração estruturada de ferramenta/serviço externo

**Estado atual:** o projeto já usa um pequeno número de integrações estruturadas ativas hoje (documentação de biblioteca, automação de navegador, componentes de UI) — essas já-ativas não são "novas decisões" a avaliar, são bindings já em uso.

**Critério para uma integração nova:**
1. A informação/ferramenta não cabe em leitura direta de arquivo.
2. Existe necessidade real e recorrente, não hipótese de conveniência futura.
3. Não duplica uma capacidade já servida — checar `MODEL_ROUTING.md` antes de integrar algo novo.

**Por que nenhuma integração nova é aprovada agora:** o estado operacional e a base de conhecimento de domínio são hoje pequenos o suficiente para leitura direta via os mecanismos já existentes.

---

## Como revisitar (comum às duas partes)

Quando um incidente real (para Hooks) ou uma necessidade real e recorrente (para integração) for registrado no estado operacional, ele deve ser trazido de volta a este documento como novo candidato, avaliado contra o critério da parte correspondente, e só então aprovado ou descartado novamente com justificativa registrada.
