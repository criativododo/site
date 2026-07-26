# Sprint 1 — Fundação do Projeto

Data: sáb 25 jul 2026 13:11:42 -03

## Objetivo

Migrar oficialmente o projeto DODÔ para a nova infraestrutura GitHub.

---

## Git

Branch:
docs/governance-phase2

Remote:

origin	https://github.com/criativododo/portal.git (fetch)
origin	https://github.com/criativododo/portal.git (push)

---

## Status

A  .claude/commands/prompt-gpt.md
A  .claude/settings.json
M  .gitignore
A  "IMPORTANTE Webmail_Codigos_de_backup.txt"
M  backend/.env.production.example
A  docs/_workspace/AMBIENTE_OPERACIONAL_DODO.md
A  docs/_workspace/DOCS_INVENTARIO.txt
A  docs/_workspace/UX/BRIEFING_TELAS_E_COMPONENTES_DODO.md
A  docs/_workspace/UX/PLANO_REDESIGN_FRONTEND.md
M  docs/arquitetura/01-mineracao-do-legado.md
M  docs/arquitetura/02-arquitetura-alvo.md
M  docs/arquitetura/03-plano-mestre-de-implementacao.md
M  docs/arquitetura/README.md
M  docs/deployment/ARQUITETURA_PRODUCAO.md
M  docs/deployment/AUDITORIA_LOCAWEB.md
M  docs/deployment/CHECKLIST_GO_LIVE.md
M  docs/deployment/DEPLOY.md
M  docs/deployment/IMPLEMENTACAO_TECNICA.md
M  docs/deployment/PLANO_DE_IMPLANTACAO.md
M  docs/deployment/RUNBOOK_DEPLOY_E_ROLLBACK.md
M  docs/governanca/GOVERNANCA_DO_PROJETO.md
A  docs/infrastructure/INFRAESTRUTURA.md
A  "docs/infrastructure/assets/Captura de Tela 2026-07-23 \303\240s 13.42.26.png"
A  "docs/infrastructure/assets/Captura de Tela 2026-07-23 \303\240s 13.43.12.png"
A  docs/infrastructure/assets/screencapture-painelhospedagem-locaweb-br-configs-73068156-git-2026-07-23-13_43_42.png
A  docs/infrastructure/assets/screencapture-painelhospedagem-locaweb-br-dashboard-73068156-2026-07-23-13_42_00.png
A  docs/infrastructure/assets/screencapture-painelhospedagem-locaweb-br-databases-wizard-73068156-shared-2026-07-23-13_42_47.png
A  docs/infrastructure/assets/screencapture-painelhospedagem-locaweb-br-ftp-73068156-2026-07-23-13_43_01.png
A  docs/infrastructure/assets/screencapture-painelhospedagem-locaweb-br-tools-73068156-netscheduler-2026-07-23-13_43_35.png
A  docs/infrastructure/assets/screencapture-painelhospedagem-locaweb-br-tools-73068156-php-configuration-2026-07-23-13_43_55.png
A  docs/infrastructure/assets/screencapture-painelhospedagem-locaweb-br-tools-73068156-php-configuration-2026-07-23-13_44_17.png
A  docs/infrastructure/assets/screencapture-painelhospedagem-locaweb-br-tools-73068156-ssh-2026-07-23-13_44_03.png
A  docs/infrastructure/assets/screencapture-painelhospedagem-locaweb-br-tools-73068156-ssh-2026-07-23-14_05_20.png
A  docs/infrastructure/assets/screencapture-painelhospedagem-locaweb-br-tools-73068156-ssh-2026-07-23-14_05_32.png
M  docs/knowledge/README.md
A  docs/knowledge/referencias-externas/REFERENCIAS_ARQUITETURAIS.md
M  docs/release/GATE_FINAL_GO_LIVE.md
M  frontend/index.html
A  frontend/public/horizontal-branco.svg
A  frontend/public/horizontal-preto.svg
D  frontend/public/icons.svg
A  frontend/public/icons/01-dashboard.svg
A  frontend/public/icons/02-campanhas.svg
A  frontend/public/icons/03-marcas.svg
A  frontend/public/icons/04-parceiras.svg
A  frontend/public/icons/05-briefings.svg
A  frontend/public/icons/06-conteudos.svg
A  frontend/public/icons/07-upload.svg
A  frontend/public/icons/08-aprovacao.svg
A  frontend/public/icons/09-revisao.svg
A  frontend/public/icons/10-pagamentos.svg
A  frontend/public/icons/11-calendario.svg
A  frontend/public/icons/12-mensagens.svg
A  frontend/public/icons/13-notificacoes.svg
A  frontend/public/icons/14-perfil.svg
A  frontend/public/icons/15-configuracoes.svg
M  frontend/src/App.module.css
A  frontend/src/assets/fonts/ElmsSans-OFL.txt
A  frontend/src/assets/fonts/ElmsSans.ttf
A  frontend/src/assets/fonts/WorkSans-OFL.txt
A  frontend/src/assets/fonts/WorkSans.ttf
M  frontend/src/components/AppShell.tsx
M  frontend/src/components/AuthSplitLayout.tsx
M  frontend/src/components/EmptyState.module.css
A  frontend/src/components/Pagination.module.css
A  frontend/src/components/Pagination.tsx
M  frontend/src/components/PlaceholderPage.module.css
M  frontend/src/components/PortalShell.tsx
D  frontend/src/components/StatusBadge.module.css
D  frontend/src/components/StatusBadge.tsx
M  frontend/src/index.css
M  frontend/src/lib/marcas.ts
M  frontend/src/lib/parceiras.ts
M  frontend/src/pages/BriefingFormPage.module.css
M  frontend/src/pages/CampanhaDetailPage.module.css
M  frontend/src/pages/CampanhaDetailPage.tsx
M  frontend/src/pages/CampanhaFormPage.module.css
M  frontend/src/pages/CampanhasListPage.module.css
M  frontend/src/pages/CampanhasListPage.tsx
M  frontend/src/pages/Dashboard.module.css
M  frontend/src/pages/Dashboard.tsx
M  frontend/src/pages/ForgotPasswordPage.tsx
M  frontend/src/pages/LandingPage.module.css
M  frontend/src/pages/Login.module.css
M  frontend/src/pages/Login.tsx
M  frontend/src/pages/LogisticaPage.module.css
M  frontend/src/pages/MarcaFormPage.module.css
M  frontend/src/pages/MarcasListPage.module.css
M  frontend/src/pages/MarcasListPage.tsx
M  frontend/src/pages/MateriaisPage.module.css
M  frontend/src/pages/PagamentoPage.module.css
M  frontend/src/pages/ParceiraFormPage.module.css
M  frontend/src/pages/ParceiraProfilePage.module.css
M  frontend/src/pages/ParceiraProfilePage.tsx
M  frontend/src/pages/ParceirasListPage.module.css
M  frontend/src/pages/ParceirasListPage.tsx
M  frontend/src/pages/portal/PortalDashboardPage.tsx
M  frontend/src/pages/portal/PortalParticipacaoPage.module.css
A  frontend/src/theme/tokens.css
M  mcp/tear-mcp-server/src/index.js
A  mcp/tear-mcp-server/src/tools/design_system.js
A  scripts/rebranding/README.md
A  scripts/rebranding/helpers.sh
A  scripts/rebranding/migrate-brand.sh
A  scripts/rebranding/migrate-code.sh
A  scripts/rebranding/migrate-docs.sh
A  scripts/rebranding/rollback-brand.sh
A  scripts/rebranding/validate-brand.sh
A  skills-dodo/REINSTALL.md
A  skills-dodo/branding/SKILL.md
A  skills-dodo/branding/assets/prompts-coleta.md
A  skills-dodo/branding/references/lingerie-benchmark.md
A  skills-dodo/branding/references/moda-brasil-benchmark.md
A  skills-dodo/consultoria/SKILL.md
A  skills-dodo/consultoria/references/diretrizes.md
A  skills-dodo/consultoria/references/linguagem.md
A  skills-dodo/dani-pessoal/SKILL.md
A  skills-dodo/dodo/SKILL.md
A  skills-dodo/financeiro/SKILL.md
A  skills-dodo/financeiro/assets/template-precificacao.md
A  skills-dodo/financeiro/references/calculo-hora.md
A  skills-dodo/financeiro/references/contexto-regional.md
A  skills-dodo/financeiro/references/impostos-mei.md
A  skills-dodo/financeiro/references/mercado-precificacao.md
A  skills-dodo/financeiro/references/precificacao-mercado.md
A  skills-dodo/humanizar/SKILL.md
A  skills-dodo/humanizar/references/modo-dani.md
A  skills-dodo/humanizar/references/modo-neutro.md
A  skills-dodo/humanizar/references/modo-pepinos.md
A  skills-dodo/humanizar/references/modo-redes.md
A  skills-dodo/jescri/SKILL.md
A  skills-dodo/mensagens-influ/SKILL.md
A  skills-dodo/mensagens-influ/references/briefing-atraso.md
A  skills-dodo/mensagens-influ/references/briefing.md
A  skills-dodo/mensagens-influ/references/cobranca.md
A  skills-dodo/mensagens-influ/references/csv-massa.md
A  skills-dodo/mensagens-influ/references/envio.md
A  skills-dodo/mensagens-influ/references/followup.md
A  skills-dodo/mensagens-influ/references/livre.md
A  skills-dodo/mensagens-influ/references/negociacao.md
A  skills-dodo/mensagens-influ/references/pepinos.md
A  skills-dodo/mensagens-influ/references/recusa.md
A  skills-dodo/planilhas-dodo/SKILL.md
A  skills-dodo/tendencias/SKILL.md
A  skills-dodo/tom-dodo/SKILL.md
A  skills-dodo/traducao-marketing/SKILL.md
?? docs/_workspace/logs/2026-07-25_MIGRACAO_GITHUB_DODO.md
?? docs/_workspace/logs/2026-07-25_SPRINT1_FOUNDATION.md
?? docs/_workspace/logs/README.md

---

## Arquivos preparados

     146

---

## Conquistas

- Conta GitHub criativododo criada
- Repositórios portal e site criados
- GitHub CLI autenticado
- Origin migrado
- Pré-commit validado
- Branch de segurança criada

---

## Pendências

- Primeiro commit
- Primeiro push
- Revisão do README
- Revisão do CHANGELOG

---

## Próxima Sprint

Sprint 2 — Marca DODÔ
