# Ambiente Operacional — DODÔ

> **Single Source of Truth (SSOT) da infraestrutura do projeto.**
> Antes de qualquer investigação ou pergunta ao usuário sobre
> infraestrutura, consultar este documento primeiro. Novas descobertas
> permanentes devem ser registradas aqui. Hipóteses nunca substituem
> fatos confirmados.

Fonte destas informações: fornecidas diretamente pelo responsável do
projeto em 2026-07-24, registradas como fatos confirmados — não são
fruto de investigação ou inferência do agente.

## Identidade do projeto

| Campo | Valor |
|---|---|
| Nome oficial | DODÔ |
| Marca | Criativo Dodô |
| Domínio principal | criativododo.com.br |
| Portal | portal.criativododo.com.br |
| Repositório local atual | `/Users/danielperrut/criativododo` |

**Observação:** o diretório físico ainda possui nomenclatura histórica
(`criativododo`). Isso **não** representa o nome oficial do projeto
(ver `ADR-020`).

## Hospedagem

| Campo | Valor |
|---|---|
| Provedor | Locaweb |
| Plano | Hospedagem II Linux |
| Sistema Operacional | Rocky Linux 8 |
| PHP | 8.5 |
| Usuário FTP/SSH | `criativododo2` |
| Diretório inicial | `/home/criativododo2/` |
| IP compartilhado | 179.188.55.25 |
| Domínio temporário | criativododo2.hospedagemdesites.ws |
| SSL compartilhado | https://criativododo2.websiteseguro.com |

## Domínios

| Domínio | Tipo | SSL |
|---|---|---|
| criativododo.com.br | Apontamento | Let's Encrypt |
| portal.criativododo.com.br | Subdomínio (apontamento) | Let's Encrypt |

## FTP

| Campo | Valor |
|---|---|
| Host principal | ftp.criativododo.com.br |
| Host alternativo | ftp.criativododo2.hospedagemdesites.ws |
| Porta | 21 |
| Usuário | criativododo2 |

## SSH

| Campo | Valor |
|---|---|
| Painel | Habilitado |
| Porta | 22 |
| Host | ftp.criativododo.com.br |
| Status operacional | **Indisponível** |
| Motivo conhecido | Incidente na infraestrutura da Locaweb |
| Confirmado por | timeout; testes via IP; confirmação do suporte |

## Banco de dados

**Nenhum banco criado.**

O plano suporta: MySQL, PostgreSQL, SQL Server.

## Recursos disponíveis

| Recurso | Status |
|---|---|
| Git | Confirmado |
| SSH | Confirmado (ver seção SSH acima para status operacional) |
| FTP | Confirmado |
| Crontab | Confirmado |
| HTTP Tasks | Confirmado |
| WAF | Confirmado |
| Backup | Ainda não configurado |

## Monorepo

Estrutura confirmada:

```
backend/
frontend/
est-dio-el-design-system/
```

Laravel localizado em `backend/`.

## Laravel

| Campo | Valor |
|---|---|
| Versão | 13.21.1 |
| Requisito mínimo | PHP ^8.3 |
| Compatível com hospedagem | Sim (PHP 8.5) |

## Ambiente

| Ambiente | Arquivo |
|---|---|
| Desenvolvimento | `.env.example` |
| Produção | `.env.production.example` |

**Pendência de migração registrada:** `APP_NAME` ainda possui
referências antigas (ELÃ / TEAR).

## Deploy

| Campo | Valor |
|---|---|
| Situação atual | Projeto ainda não implantado |
| Estratégia atual | Preparação via FTP |
| Observação | Etapas finais dependerão da liberação do SSH |

## Convenções

- Este documento é a fonte oficial da infraestrutura do projeto.
- Consultar este documento antes de qualquer investigação ou pergunta
  ao usuário sobre infraestrutura.
- Novas descobertas permanentes devem ser registradas aqui.
- Hipóteses nunca substituem fatos.

---

## Resumo — Confirmado / Pendente / Observações

### Confirmado

- Identidade do projeto (nome, marca, domínios).
- Hospedagem: provedor, plano, SO, PHP, usuário, diretório inicial, IP
  compartilhado, domínio temporário, SSL compartilhado.
- Configuração de domínios (criativododo.com.br e
  portal.criativododo.com.br) e respectivo SSL.
- Configuração de FTP (hosts, porta, usuário).
- SSH habilitado no painel, mas **indisponível operacionalmente** por
  incidente na Locaweb (confirmado por timeout, teste via IP e suporte).
- Nenhum banco de dados criado; tipos suportados pelo plano.
- Recursos de hospedagem disponíveis (Git, SSH, FTP, Crontab, HTTP
  Tasks, WAF).
- Estrutura do monorepo e localização do Laravel.
- Versão do Laravel (13.21.1) e compatibilidade de PHP.
- Arquivos de ambiente de dev/produção.
- Projeto ainda não implantado; estratégia de deploy planejada via FTP.

### Pendente de confirmação

- Resolução do incidente de SSH na Locaweb (sem previsão registrada).
- Configuração de backup.
- Criação do banco de dados (qual motor será escolhido).
- Atualização de `APP_NAME` e demais referências ELÃ/TEAR remanescentes
  em `.env.production.example`.
- Execução efetiva do deploy (depende da liberação do SSH).

### Observações

- O nome do diretório local (`criativododo`) é nomenclatura legada e
  não deve ser tomado como nome oficial do projeto.
- Este documento não fez nenhuma investigação própria — todo o
  conteúdo reflete exatamente as informações fornecidas pelo
  responsável do projeto em 2026-07-24.
