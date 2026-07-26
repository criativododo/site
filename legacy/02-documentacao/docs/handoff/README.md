# HANDOFF DO PROJETO

## Objetivo

Registrar apenas os grandes marcos do projeto.

Este documento NÃO é utilizado para controle de tarefas, estado da sessão ou documentação técnica.

Cada registro deve conter apenas:

- Data
- Marco alcançado
- Resumo
- Principais decisões
- Próxima fase

---

# Histórico

## 2026-07-23

### Marco

Arquitetura de comandos nativos do Claude Code implementada (Fases 1-2:
`/comecar` e `/fim` operacionais) e primeira base de conhecimento de
referências arquiteturais externas consolidada em `docs/knowledge/`.

### Principais decisões

- Comandos de projeto usam `.claude/commands/` (não Skills) — critério de
  migração documentado para quando um comando precisar de arquivos de
  apoio.
- `/comecar` e `/fim` passam a seguir rotina fixa e auditável (leitura
  condicional de documentos, checagem cruzada entre eles, nunca corrige
  automaticamente inconsistência encontrada).
- Pesquisa de mercado open source do domínio do Influencia consolidada
  como conhecimento permanente (`docs/knowledge/referencias-externas/`),
  sem métricas efêmeras (estrelas, atividade).

### Impacto

O projeto ganha um fluxo de abertura/encerramento de sessão padronizado e
auditável, e uma base de conhecimento arquitetural externa reutilizável
por qualquer sessão futura antes de desenhar módulos novos ou escrever
ADRs.

### Próxima fase

Fase 3 da arquitetura de comandos (`/prompt-gpt`, aguardando aprovação) e
nova pesquisa de mercado sobre arquiteturas modernas baseadas em MySQL.

## 2026-07-24

### Marco

Migração visual completa do frontend React para o Design System "criativo
DODÔ" concluída no código (`ADR-019`) — camada de tokens, 8 componentes
compartilhados, 2 shells e 24 páginas migrados, legado visual (assets e
tokens antigos) removido por completo do projeto.

### Principais decisões

- `est-dio-el-design-system/` (raiz) formalizado como SSOT visual do
  frontend via `ADR-019`, substituindo o sistema "TEAR Editorial".
- **Roxo (não laranja) é a cor-assinatura/primária dominante** (34%),
  laranja é secundária/apoio (14%) — decisão final e definitiva do
  responsável do projeto, registrada no Design System v2.0
  (`est-dio-el-design-system/tokens.json` → `migrationNote`). **Nota de
  correção (2026-07-24):** este bullet afirmava o oposto ("laranja, não
  roxo, é a cor dominante — corrigido durante a execução") após uma
  reversão anterior no mesmo dia; o responsável reverteu essa reversão de
  volta para roxo dominante, desta vez como decisão final. Mantido aqui
  para rastreabilidade do histórico de idas e vindas. **Nota de
  atualização (2026-07-25):** a decisão "final" de roxo dominante acima
  foi revertida de novo no dia seguinte — a paleta que de fato foi para
  produção (`frontend/src/theme/tokens.css`) é laranja-primária/
  roxo-secundária, oriunda de um import do Google Stitch posterior a
  `est-dio-el-design-system/`. O SSOT visual deixou de ser aquela pasta
  (hoje arquivada em `docs/design/archive/est-dio-el-design-system-v2-roxo/`)
  e passou a ser o **Manual de Design DODÔ v1.0**
  (`docs/design/manual/index.html`), que consolida as três gerações e o
  código real numa única referência — ver `ADR-019` (reescrita) para o
  registro completo.
- `Table`/`Pagination`/`Modal` como componentes compartilhados,
  deliberadamente fora de escopo desta sprint (tabelas cruas já herdam
  tokens corretos; extrair componente foi julgado refatoração
  desnecessária para o objetivo de cobertura rápida).
- Camada de compatibilidade (bridge de nomes antigos → tokens novos),
  criada para migração incremental sem quebrar o projeto, removida por
  completo ao final da mesma sessão — zero referência a token legado
  restante.

### Impacto

Frontend inteiro roda sobre os tokens oficiais do Dodô (cor, tipografia,
espaçamento, raio), sem dependência de fontes externas (Google Fonts
removido, fontes self-hosted). Nenhuma rota, controller, model ou regra de
negócio foi tocada — mudança estritamente visual.

### Próxima fase

Validação visual das 21 páginas autenticadas que só foram verificadas por
análise estática nesta sessão (sem backend/credencial de teste
disponível) — sprint dedicada de QA visual, prevista e aceita como próxima
etapa desde o início desta migração.

## 2026-07-25

### Marco

Manual de Design DODÔ v1.0 publicado (`docs/design/manual/index.html` +
`MANUAL_DODO_v1.0.pdf`) como SSOT visual oficial do projeto, encerrando
um histórico de três gerações de Design System em conflito entre si e
com o código real (`docs/design/archive/README.md` documenta as três).
`ADR-019` formalizada e commitada pela primeira vez, resolvendo a
contradição pendente desde `TASK_ROUTER.md` §71/§72. Auditoria completa
do frontend React contra o Manual concluída, com plano de implementação
em 6 sprints (`docs/design/PLANO_IMPLEMENTACAO_DESIGN_SYSTEM.md`) —
nenhum componente foi alterado.

### Principais decisões

- Manual construído a partir do Brand Foundations v0.1 (fonte principal),
  do import Google Stitch de 2026-07-25 e dos ativos válidos de
  `est-dio-el-design-system/brand`, com o React em produção como
  referência de implementação — nunca como algo a ser substituído.
- Ativos centrais da marca (logotipo, símbolo, paleta oficial, tipografia,
  naming) tratados como congelados nesta edição: documentados como
  existem hoje, não redesenhados. Evolução desses ativos exige briefing
  específico e aprovação explícita, fora de escopo.
- Único princípio de evolução deliberada nesta edição: curvatura de
  superfícies grandes (cards/containers/painéis), com proximidade humana
  como critério primário e papel funcional como secundário — registrado
  como princípio, sem token numérico fechado (decisão explícita do
  responsável, gated para uma etapa posterior).
- As três gerações anteriores (`docs/design/stitch-export/` pré-DODÔ,
  o import Stitch de 25/07, `est-dio-el-design-system/` v2.0
  roxo-primária) foram arquivadas em `docs/design/archive/` via `git mv`
  a partir do histórico restaurado — nenhum dado apagado.
- Commit único `d08e8fd` (149 arquivos), confirmado sem nenhuma alteração
  funcional de `frontend/`/`backend/` misturada — a paleta já aplicada em
  `frontend/src/theme/tokens.css` e ~54 arquivos de componentes/páginas
  permanece não commitada, deliberadamente fora desta frente.

### Impacto

O projeto passa a ter uma única referência visual oficial, navegável e
com o racional de cada decisão documentado — não mais uma escolha entre
pastas conflitantes. A auditoria do React confirmou que nenhuma tela ou
componente precisa ser reescrito do zero; os desvios encontrados
(capitalização decorativa, CTAs duplicados/competindo, um símbolo
decorativo fora do vocabulário de marca, e a lacuna estrutural do Portal
não ser mobile-first/bottom-nav) são pontuais e já estão priorizados no
plano de implementação.

### Próxima fase

Aprovação do responsável para `docs/design/PLANO_IMPLEMENTACAO_DESIGN_SYSTEM.md`,
seguida do Sprint 1 (correções de tipografia — risco mínimo, maior
alcance). Decisão pendente do responsável sobre a escala numérica de
radius antes do Sprint 5 (curvatura).