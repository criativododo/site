# ROADMAP — Matriz de Adoção Incremental

> **Estabilidade:** Volátil — operacional, não arquitetural; atualiza a cada fase concluída
> **Depende de:** todos os documentos desta família
> **Dependido por:** nenhum
> **Frequência esperada de alteração:** alta

---

## Estado da Fase de Arquitetura

**Concluída.** A taxonomia de capacidades, o modelo Capability→Contract→Binding→Execution Unit→Execution, o diagrama de camadas, a classificação de estabilidade, a regra de isolamento de nomes de fornecedor e o teste de substituição foram desenhados, revisados criticamente e aprovados.

## Estado da Fase de Documentação

**Concluída.** Os 14 documentos originais desta família foram escritos. Nenhum código, skill, hook ou subagent foi criado — só documentação, conforme autorizado.

## Estado da Auditoria de Design Documental

**Concluída.** Revisão crítica dos 14 documentos quanto a granularidade, economia de contexto, custo de manutenção, Single Source of Truth e teste de crescimento de 5 anos. Veredito: documentação superfragmentada em pontos específicos (não sistemicamente). Duas correções de defeito e três fusões foram aprovadas e aplicadas — ver "Decisões registradas" abaixo. A família passou de 14 para **11 documentos**.

---

## Matriz de adoção incremental

| Tier | Item | Status |
|---|---|---|
| **Implementado** | Os 11 documentos de `docs/_workspace/ai/` (14 originais, consolidados após auditoria) | Concluído |
| **Fase seguinte (Skills)** | Nenhuma mudança necessária — inventário atual mantido como está | Sem ação pendente, registrado em `SKILLS.md` |
| **Fase seguinte (Subagentes)** | Criar 1 por vez: Layout → Documentação → DevOps, cada um testado isoladamente antes do próximo | Especificado em `SUBAGENTS.md`, não implementado |
| **Fase seguinte (Hooks/MCP)** | Nenhum hook, nenhuma integração criados | Critério de reavaliação registrado em `HOOKS_MCP.md` |
| **Fase seguinte (Fornecedor de julgamento independente)** | Criar o arquivo de convenção externa (`AGENTS_POLICY.md`); primeiro teste real de revisão de rotina sobre um diff existente, sem aplicar nada | Não implementado |
| **Pode esperar** | Integração estruturada nova, empacotamento de skills como unidade distribuível, skills finas de performance/segurança | Sem evidência de necessidade ainda |
| **Nunca adotar (ou só sob aprovação explícita, caso a caso)** | Coordenação multi-agente como padrão do dia a dia; sub-mecanismos de paralelismo do próprio fornecedor de julgamento independente; portão automático de revisão obrigatória; subagent para capacidade C0; hook para lembrete de contexto estático; duas integrações cobrindo a mesma capacidade | Registrado como restrição permanente |

---

## Decisões registradas — Fase de Arquitetura e Documentação

1. Taxonomia funcional de 7 capacidades (C0-C6) substitui a lista original de 15 itens conflados.
2. Modelo "Capacidade + Provedores" foi substituído por "Capability → Contract → Binding → Execution Unit → Execution".
3. `AI_ORCHESTRATION.md` é puramente índice — nenhuma especificação normativa vive nele.
4. Regra de isolamento de nomes de fornecedor: confinada a `MODEL_ROUTING.md` (bloco de vinculação) e `CODEX_POLICY.md`.
5. Três subagentes aprovados para especificação (Layout, DevOps, Documentação); oito candidatos descartados com justificativa registrada em `SUBAGENTS.md`.
6. Nenhum hook, nenhuma integração estruturada nova aprovados nesta fase.
7. O portão automático de revisão obrigatória permanece desligado.

## Decisões registradas — Auditoria de Design Documental

8. **Defeito corrigido:** as listas "Dependido por" de `CAPABILITY_MODEL.md` estavam incompletas (faltavam `AGENTS_POLICY.md` e `SKILLS.md`, e a antiga `MEMORY_POLICY.md` declarava incorretamente não ter dependentes quando `AGENTS_POLICY.md` dependia dela diretamente) — corrigidas.
9. **Defeito corrigido:** `AI_ORCHESTRATION.md` referenciava "a nota de validação ao final deste documento" sem que essa seção existisse, e o teste de substituição nunca havia sido de fato registrado em nenhum documento, apesar de citado como "aprovado". A seção "Nota de validação — teste de substituição" foi escrita em `AI_ORCHESTRATION.md` com o cálculo real.
10. **Fusão aplicada:** `MEMORY_POLICY.md` incorporado como seção C5 de `CAPABILITY_MODEL.md` — mesmo ciclo de vida (Permanente, baixíssima frequência), sem motivo real de dissociação.
11. **Fusão aplicada:** `EFFORT_POLICY.md` incorporado como seção "Framework capacidade vs. esforço" de `MODEL_ROUTING.md` — já era citado como uma única linha da tabela de decisão desse documento.
12. **Fusão aplicada:** `HOOKS.md` e `MCP.md`, que tinham estrutura e conteúdo idênticos no estado vazio atual, fundidos em `HOOKS_MCP.md` com duas seções internas.
13. **Observação registrada, não resolvida:** o teste de substituição medido por contagem de arquivos é sensível à granularidade da própria documentação — fundir documentos reduz o denominador do teste sem alterar o acoplamento real a fornecedor. Ver detalhe em `AI_ORCHESTRATION.md`, seção "Nota de validação".
14. **Defeito corrigido:** `AGENTS_POLICY.md`, `CAPABILITY_MODEL.md` e `CONTEXT_POLICY.md` não listavam `ROADMAP.md` como dependente, apesar de `ROADMAP.md` declarar depender de todos os documentos da família — corrigido para consistência total do grafo.

## Pontos propositalmente em aberto para futuras ADRs

- **Ativação real do fornecedor de julgamento independente**: criação do arquivo de convenção externa e primeiro teste de uso real, hoje apenas normativo em `CODEX_POLICY.md`.
- **Criação dos arquivos de definição dos três subagentes aprovados**: a especificação existe em `SUBAGENTS.md`; a criação do mecanismo em si é passo de implementação, não de documentação.
- **Capacidade C6 (Observabilidade)**: reconhecida como lacuna em `CAPABILITY_MODEL.md`, sem Contract definido — decisão de quando e como implementá-la fica para quando a necessidade deixar de ser hipotética.
- **Poda do arquivo de constituição do projeto**: identificado durante a pesquisa que embasou esta arquitetura como candidato a simplificação (tamanho e redundância acima do recomendado), mas fora do escopo desta família de documentos — decisão a ser tomada separadamente, sobre um arquivo que esta arquitetura apenas referencia, nunca duplica.
- **Empacotamento das skills do projeto como unidade distribuível**: ganho reconhecido (versionamento, portabilidade), sem urgência declarada.
- **Verificação automatizada da fronteira de memória** (seção C5 de `CAPABILITY_MODEL.md`): não implementada; revisitar apenas se uma violação real for documentada.
- **Metodologia do teste de substituição**: mudar de contagem de arquivos para peso de conteúdo (linhas normativas reescritas ÷ linhas totais), para não penalizar futuras fusões de documentos que reduzam duplicação sem aumentar acoplamento real a fornecedor.
- **Reabertura de `SUBAGENTS.md`**: identificado no teste de crescimento de 5 anos como o primeiro documento a sofrer com volume (dezenas de subagentes) — sem ação necessária hoje, monitorar quando o inventário crescer significativamente.
- **Subpasta para documentos de fornecedor único**: se o número de fornecedores crescer além de poucos, mover documentos no padrão de `CODEX_POLICY.md` para uma subpasta própria, mantendo o nível superior de `docs/_workspace/ai/` dominado pelos documentos permanentes/evolutivos.
