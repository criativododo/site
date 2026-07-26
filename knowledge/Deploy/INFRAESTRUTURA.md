# INFRAESTRUTURA.md — Fonte oficial de dados de infraestrutura (DODÔ)

**Criado em:** 2026-07-24.
**Propósito:** único lugar onde dados estáveis e verificados da
infraestrutura (provedor, domínios, hospedagem, FTP, SSH, PHP, banco,
DNS, SSL) ficam registrados, para que nenhum agente precise reinvestigar
ou perguntar de novo o que já foi confirmado. **Não é runbook nem plano —
para deploy ver `docs/deployment/`.**

## Regras deste documento

- Cada campo carrega uma classificação: **Confirmado**, **Pendente de
  confirmação** ou **Não identificado** — nunca um valor sem
  classificação.
- Cada campo cita a fonte (documento + seção, ou evidência de
  rede/painel) que sustenta o valor. Um campo sem fonte citável não deve
  ser escrito aqui.
- **Nada foi inventado ou inferido para este documento.** Todo valor
  abaixo já estava registrado em `docs/deployment/*`,
  `docs/_workspace/TASK_ROUTER.md`, ADRs, `.env.production.example`, ou
  nas capturas de tela de `docs/infrastructure/assets/`.
- Segredos reais (senhas, `CLIENT_SECRET`, `REFRESH_TOKEN`) nunca vão
  neste arquivo, mesmo que confirmados — só a existência/localização do
  campo.
- Ao atualizar: só substituir um valor quando houver evidência nova
  (resposta do suporte, teste de rede real, confirmação explícita do
  responsável do projeto). Nunca copiar um dado do ambiente antigo
  (Hospedagem I) para o novo (Hospedagem II) sem rótulo de origem — ver
  "Divergências conhecidas" abaixo, é o erro mais fácil de cometer aqui.

---

## 1. Conta Locaweb

| Campo | Valor | Status | Fonte |
|---|---|---|---|
| Código de cliente | `1101016193` | Confirmado | `AUDITORIA_LOCAWEB.md` §1.3 (2026-07-22) |
| Usuário do painel | `dperrut` | Confirmado | `AUDITORIA_LOCAWEB.md` §1.3; visível nos screenshots de `docs/infrastructure/assets/` |
| CNPJ / razão social | `44.277.880/0001-13`, Daniel Perrut Dos Reis | Confirmado | `AUDITORIA_LOCAWEB.md` §1.3 |
| 2FA na conta | Ativada | Confirmado | `AUDITORIA_LOCAWEB.md` §1.3 |

---

## 2. Domínio e hospedagem vigentes (ambiente DODÔ)

> Domínio institucional e hospedagem contratados em 2026-07-23,
> substituindo o ambiente legado `estudioela.com`/`elafashionmkt.com.br`
> (Hospedagem I). Ver §7 para a distinção completa entre os dois
> ambientes — **não misturar dados de um com o outro**.

| Campo | Valor | Status | Fonte |
|---|---|---|---|
| Domínio principal | `criativododo.com.br` | Confirmado | `TASK_ROUTER.md` §53/§54 |
| Subdomínio da aplicação | `portal.criativododo.com.br` | Confirmado, existe e está Ativo | `TASK_ROUTER.md` §53/§54 |
| Tipo do subdomínio no painel | "Subdomínio → Apontamento" | Confirmado — **e é um bloqueio real**: Apontamento só espelha o domínio principal, estruturalmente incompatível com servir o `public/` do Laravel isoladamente. Precisa ser trocado para "Conteúdo da pasta" antes do deploy funcionar | `TASK_ROUTER.md` §54 (confirmado contra a página oficial de ajuda da Locaweb via `WebFetch`) |
| IP do host | `179.188.55.25` | Confirmado | `TASK_ROUTER.md` §55/§56 (via `dig` + `nc`, reconfirmado em múltiplas sessões) |
| Hostnames que resolvem para o mesmo IP | `ftp.criativododo.com.br`, `ftp.criativododo2.hospedagemdesites.ws` | Confirmado | `TASK_ROUTER.md` §55 |
| Usuário FTP/SSH da hospedagem-alvo | `criativododo2` | Confirmado | `TASK_ROUTER.md` §54 |
| Diretório raiz | `/home/criativododo2/` | Confirmado | `TASK_ROUTER.md` §54 |
| Plano contratado | Locaweb Hospedagem II Linux | Confirmado (contratação) | `ARQUITETURA_PRODUCAO.md` §1, `DEPLOY.md` nota de revisão 2026-07-23 |

---

## 3. Sistema operacional, PHP e software do host

| Campo | Valor | Status | Fonte |
|---|---|---|---|
| SO do host `criativododo2` | — | **Não identificado** — nunca auditado; o SO confirmado (Rocky Linux 8) é do plano antigo, não deste | — |
| PHP ativo em `criativododo2` (web/PHP-FPM) | **8.5.7** | Confirmado por evidência de rede real — header `X-Powered-By` retornado por `curl` contra `/index.php` | `TASK_ROUTER.md` §56 |
| Servidor web em `criativododo2` | nginx/1.22.1 | Confirmado por header `Server` em resposta HTTP real | `TASK_ROUTER.md` §56 |
| Composer instalado globalmente em `criativododo2` | — | **Pendente de confirmação** — ausência confirmada só no host antigo (Rocky Linux 8.10, PHP 8.4.22); não reconfirmado para este host. Irrelevante na prática: `ADR-016` já decidiu rodar Composer só no runner do CI, independente do host | `ARQUITETURA_PRODUCAO.md` §3/§14 (achado do host antigo) |
| Extensões PHP (`pdo_pgsql`, `mbstring`, `ext-fileinfo` etc.) em `criativododo2` | — | **Não identificado** — checagem depende de SSH, que está bloqueado | `AUDITORIA_LOCAWEB.md` §2.1 (checklist pendente, nunca fechado) |
| Crontab nativo disponível em `criativododo2` | — | **Pendente de confirmação** — disponibilidade confirmada só no plano antigo | `AUDITORIA_LOCAWEB.md` §1.1 (plano antigo) |
| Quota de disco/CPU em `criativododo2` | — | **Não identificado** | `AUDITORIA_LOCAWEB.md` §3 (pendência já registrada no plano antigo, nunca fechada em nenhum dos dois) |

---

## 4. Banco de dados

| Campo | Valor | Status | Fonte |
|---|---|---|---|
| Motor decidido (arquitetura) | PostgreSQL gerenciado pelo plano Locaweb | Confirmado como **decisão arquitetural** — não é o mesmo que disponibilidade real confirmada | `ARQUITETURA_PRODUCAO.md` §2 |
| PostgreSQL realmente habilitado em `criativododo2` | — | **Pendente de confirmação — alerta ativo.** No plano antigo (Hospedagem I) o painel listava PostgreSQL como disponível, mas o **suporte oficial da Locaweb confirmou depois que o plano contratado não o habilitava de fato** (só aparecia como opção de interface). O mesmo risco não foi descartado para a Hospedagem II. O responsável afirmou, em conversa (não por evidência de painel/suporte), que a Hospedagem II contratada suporta PostgreSQL — tratar como declaração, não como confirmação técnica, até validar criando um banco de teste ou confirmando com o suporte | `ARQUITETURA_PRODUCAO.md` §2 (alerta), `TASK_ROUTER.md` §27 (achado original) e §51 (declaração do responsável) |
| Banco de produção criado | Não | Confirmado | `TASK_ROUTER.md` §53 ("PostgreSQL disponível para criação, ainda não criado"); `CHECKLIST_GO_LIVE.md` §1, item não marcado |

---

## 5. SSH

| Campo | Valor | Status | Fonte |
|---|---|---|---|
| Porta 22 em `criativododo2` (IP `179.188.55.25` e os 2 hostnames) | Bloqueada — timeout sem SYN-ACK/RST, testado repetidamente | Confirmado, extensivamente — testado de 3 origens de rede independentes (agente + 2 do responsável) e de 3 pontos externos (Alemanha, Irã, Japão via `check-host.net`) | `TASK_ROUTER.md` §53/§55/§56/§60/§62 |
| Habilitação manual pelo responsável no painel | Feita, não resolveu o bloqueio | Confirmado | `TASK_ROUTER.md` §53/§60 |
| Hipótese "expira em 3h" | Descartada — reabilitado e testado na sequência, mesmo sintoma | Confirmado | `TASK_ROUTER.md` §55 |
| Portas SSH alternativas (22022, 2222, 2200, 2022, 22222) | Sem resposta em nenhuma | Confirmado | `TASK_ROUTER.md` §55 |
| Chamado aberto com suporte Locaweb | Sim, sem retorno **na porta 22 em si**; mas há evidência de atividade do suporte no ambiente (teste de PHP no document root de `portal.criativododo.com.br`, confirmado pelo responsável), sem ETA para a porta 22 | Confirmado | `TASK_ROUTER.md` §53/§55/§62/§67 |
| Comportamento do SSH no plano **antigo** (Hospedagem I) | Desabilitado por padrão; habilitação manual válida por 3h; renovação manual; autenticação por senha (mesma do FTP) | Confirmado, mas só para o plano antigo | `AUDITORIA_LOCAWEB.md` §1.1/§4.1; screenshot `screencapture-...-ssh-...13_44_03.png` (é do domínio `elafashionmkt.com.br`) |
| O mesmo comportamento (3h/senha) se aplica à Hospedagem II | — | **Pendente de confirmação** — impossível testar enquanto a porta não responde | — |

---

## 6. FTP

| Campo | Valor | Status | Fonte |
|---|---|---|---|
| Porta 21 em `criativododo2` | Aberta, conecta instantaneamente | Confirmado | `TASK_ROUTER.md` §53/§55 |
| Usuário FTP | `criativododo2` | Confirmado | `TASK_ROUTER.md` §54 |
| Document root serve a aplicação Laravel | Não — serve a página padrão de erro da Locaweb | Confirmado por evidência de rede (`curl` para `/`, `/up`, `/api/health`, `/build/manifest.json`, `/robots.txt` → 404 com corpo idêntico à página padrão; `/index.php` → 404 vindo do próprio PHP-FPM, ou seja PHP ativo mas sem `index.php` no diretório) | `TASK_ROUTER.md` §56 |
| Conta `criativododo2` 100% vazia | — | **Pendente de confirmação** — a fonte já registra esse limite explicitamente: sem listagem direta via FTP/SSH, só se confirma que o document root atual não serve Laravel, não que não haja nenhum outro arquivo em outro lugar da conta | `TASK_ROUTER.md` §56 (limite de evidência declarado na própria entrada) |
| Credenciais reais (senha) | — | Não registradas aqui por princípio (segredo) — ver gestor de senhas do responsável | — |

---

## 7. DNS e SSL

| Campo | Valor | Status | Fonte |
|---|---|---|---|
| `criativododo.com.br` — domínio principal | Ativo | Confirmado | `TASK_ROUTER.md` §53 |
| `portal.criativododo.com.br` — SSL | Let's Encrypt, renovação automática, funcionando | Confirmado por evidência de rede (`openssl`/`curl`) | `TASK_ROUTER.md` §53/§54 |
| `criativododo.com.br` — SSL do domínio raiz | Ativo (Let's Encrypt) | Confirmado | `TASK_ROUTER.md` §53 |
| Nameservers configurados para `criativododo.com.br` | — | **Não identificado** — nenhuma evidência capturada aponta os NS realmente ativos para este domínio. O popup "Como configurar DNS" visto em screenshot é do domínio antigo e só mostra os servidores padrão genéricos da Locaweb (`ns1`/`ns2`/`ns3.locaweb.com.br`), não uma confirmação para `criativododo.com.br` | `docs/infrastructure/assets/screencapture-...-dashboard-...png` (ver ressalva em §9) |

---

## 8. Web server / stack observado em produção

| Campo | Valor | Status | Fonte |
|---|---|---|---|
| Servidor web | nginx/1.22.1 | Confirmado por header HTTP real | `TASK_ROUTER.md` §56 |
| PHP-FPM ativo | Sim, versão 8.5.7 | Confirmado por header HTTP real | `TASK_ROUTER.md` §56 |
| Laravel implantado | **Não** | Confirmado — `/up`, `/api/health`, `/build/manifest.json` continuam 404 | `TASK_ROUTER.md` §56/§67; `CHECKLIST_GO_LIVE.md` (100% dos itens de deploy não marcados) |
| Conteúdo do document root em `portal.criativododo.com.br` | Mudou desde `§56`: `/` e `/index.php` agora retornam 200 servindo um script de teste PHP básico (não Laravel), com escrita em disco confirmada (`teste.txt`) | Confirmado por evidência de rede real (`curl`); origem confirmada pelo responsável — **feito pelo suporte da Locaweb** durante a investigação do chamado de SSH | `TASK_ROUTER.md` §67 (2026-07-24/25) |

---

## 9. E-mail / SMTP

| Campo | Valor | Status | Fonte |
|---|---|---|---|
| Host/porta do relay SMTP incluso no plano | — | **Não identificado** — seção "Email Locaweb" existe no painel, mas host/porta nunca foram localizados em nenhuma auditoria | `AUDITORIA_LOCAWEB.md` §2.1/§3; `backend/.env.production.example` (`MAIL_HOST=CHANGE_ME`, `MAIL_PORT=587` é valor-padrão de template, não confirmado) |

---

## 10. Backup e WAF

| Campo | Valor | Status | Fonte |
|---|---|---|---|
| Backup nativo Locaweb ativado | Não (estado do plano antigo) | **Pendente de confirmação** para a Hospedagem II — nunca auditada | `AUDITORIA_LOCAWEB.md` §4.5 |
| Estratégia de backup decidida (independente do nativo) | `pg_dump` + Crontab + upload para Google Drive | Confirmado como decisão de arquitetura; execução real ainda pendente | `ARQUITETURA_PRODUCAO.md` §7 |
| WAF ativa por padrão | Sim (estado do plano antigo, nas duas hospedagens de então) | **Pendente de confirmação** para a Hospedagem II | `AUDITORIA_LOCAWEB.md` §1.1/§4.4 |

---

## 11. Armazenamento externo — Google Drive (fora da Locaweb)

| Campo | Valor | Status | Fonte |
|---|---|---|---|
| Método de autenticação | OAuth 2.0, conta dedicada pessoal (não Service Account Key — bloqueado por Org Policy `iam.disableServiceAccountKeyCreation` em `elafashionmkt-org`) | Confirmado | `ADR-017` |
| Pasta raiz (Material) | ID `1uSmA2qt8apAkNP54z9yBChhitYXSw2y4` | Confirmado | `backend/.env.production.example` |
| Pasta de backup | ID `1c_ImyhRDHGox509kRjTJKHkyiIc5zzBE` | Confirmado | `backend/.env.production.example` |
| `CLIENT_ID`/`CLIENT_SECRET`/`REFRESH_TOKEN` reais | — | Não registrados aqui por princípio (segredos) | — |

---

## 12. Divergências conhecidas entre fontes (registradas, não resolvidas)

Para evitar que um agente futuro recrie um erro já cometido:

1. **`AUDITORIA_LOCAWEB.md` (2026-07-22) descreve o ambiente ANTIGO**
   (Hospedagem I, domínios `elafashionmkt.com.br`/`estudioela.com`,
   IPs `179.188.55.78`/`191.252.83.211`). Essa auditoria **nunca foi
   repetida** para a Hospedagem II/`criativododo2`. Boa parte dos "✅
   Confirmado" daquele documento (PHP 8.3 no painel, Rocky Linux 8,
   ausência de Composer, janela de SSH de 3h) valem só para o plano
   antigo — não foram transportados para este documento como fatos do
   ambiente atual, só como contexto histórico explícito nas tabelas
   acima.
2. **PostgreSQL:** painel do plano antigo listava como disponível, mas o
   suporte oficial da Locaweb desmentiu depois (`TASK_ROUTER.md` §27).
   Mesmo risco não descartado para a Hospedagem II — ver §4 acima.
3. **PHP:** plano antigo confirmado em 8.3 (painel, web) / 8.4.22 (CLI,
   via auditoria SSH anterior); ambiente atual (`criativododo2`)
   responde como PHP **8.5.7** via header HTTP real. São hospedagens
   diferentes — não usar um valor para inferir o outro.
4. **Capturas de tela de `docs/infrastructure/assets/`** (datadas
   2026-07-23, 13:42–13:44) são **todas do painel de
   `elafashionmkt.com.br`** (Hospedagem I) — confirmado pelo breadcrumb
   visível em cada imagem. Apesar de estarem fisicamente na pasta
   `docs/infrastructure/`, **não são evidência do ambiente atual**
   (`criativododo2`/Hospedagem II). Ver inventário em §13.

---

## 13. Evidências (screenshots) em `docs/infrastructure/assets/`

| Arquivo | Conteúdo | Domínio/hospedagem retratado |
|---|---|---|
| `screencapture-...-dashboard-...png` | Painel inicial de hospedagem, resumo de uso, DNS, SSL, IP | `elafashionmkt.com.br` — **Hospedagem I, ambiente antigo** |
| `screencapture-...-databases-wizard-...png` | Assistente de criação de banco (MySQL/PostgreSQL/MSSQL) | `elafashionmkt.com.br` — **Hospedagem I** |
| `screencapture-...-ftp-...png` | Página "Gestão de Arquivos e FTP" | `elafashionmkt.com.br` — **Hospedagem I** |
| `screencapture-...-ssh-...13_44_03.png` | Página "SSH" (status, credenciais) | `elafashionmkt.com.br` — **Hospedagem I** |
| `screencapture-...-ssh-...14_05_20.png` / `...14_05_32.png` | Página "SSH", instantes diferentes | Não reabertas nesta sessão — mesmo padrão do arquivo acima, tratar como Hospedagem I até verificação |
| `screencapture-...-netscheduler-...png` | Agendador de tarefas (cron) do painel | Não reaberta nesta sessão — mesmo padrão, tratar como Hospedagem I até verificação |
| `screencapture-...-php-configuration-...png` (2 arquivos, mesmo conteúdo) | Configuração de versão PHP | Não reaberta nesta sessão — mesmo padrão, tratar como Hospedagem I até verificação |

**Nenhuma captura de tela do painel específico de `criativododo2`/Hospedagem
II foi encontrada nesta sessão.** Se e quando existirem, adicionar aqui com
a mesma tabela.

---

## 14. Pendências de investigação (ordenadas por bloqueio)

1. **SSH porta 22 em `criativododo2`** — bloqueado, chamado aberto na
   Locaweb, sem ETA. Bloqueia `migrate`, cache warmup, `admin:create`,
   `crontab -e` (ver contingência FTP em
   `docs/deployment/RUNBOOK_DEPLOY_E_ROLLBACK.md`).
2. **Disponibilidade real de PostgreSQL na Hospedagem II** — não
   confirmada por painel/suporte, só por declaração verbal do
   responsável.
3. **Tipo do subdomínio `portal.criativododo.com.br`** — hoje
   "Apontamento", precisa virar "Conteúdo da pasta" para servir o
   Laravel.
4. **SO, extensões PHP, quota de disco, IP do proxy reverso
   (`TRUSTED_PROXIES`)** de `criativododo2` — nunca auditados (dependem
   de SSH).
5. **Host/porta do relay SMTP** do plano — nunca localizado no painel.
6. **Backup nativo e WAF na Hospedagem II** — comportamento herdado do
   plano antigo, não reconfirmado.

---

## Fontes consultadas para este documento

`docs/deployment/AUDITORIA_LOCAWEB.md` (§1, §2, §2.1, §3, §4), `docs/deployment/ARQUITETURA_PRODUCAO.md` (§1, §2, §3, §6, §7, §14), `docs/deployment/DEPLOY.md` (notas de revisão), `docs/deployment/CHECKLIST_GO_LIVE.md`, `docs/_workspace/TASK_ROUTER.md` §27, §51, §53, §54, §55, §56, §60, §62, `docs/adrs/ADR-016-composer-no-ci-deploy-manual.md`, `docs/adrs/ADR-017-oauth-conta-dedicada-google-drive.md`, `backend/.env.production.example`, capturas de tela em `docs/infrastructure/assets/` (inventariadas em §13).
