# 01 — Mineração do Legado

## Objetivo

Este documento consolida todo o conhecimento extraído do legado do Projeto TEAR.

Seu propósito é preservar soluções já validadas, identificar padrões reutilizáveis e registrar lições aprendidas durante a evolução do sistema.

Este documento não define a arquitetura da V3 e não propõe novas soluções.

## Fontes analisadas

- Repositório atual
- Repositórios históricos
- Branches antigas
- Apps Script
- Documentação técnica
- Auditorias anteriores
- Conversas de arquitetura

## Evolução do Projeto

### Fase 1
Planilha Google Sheets

### Fase 2
Apps Script

### Fase 3
Portal Web

### Fase 4
Refatorações

### Fase 5
Preparação para Laravel

## Funcionalidades identificadas

- Cadastro público
- Login
- Aprovação
- Campanhas
- Participações
- Briefings
- Uploads
- Aprovação de materiais
- Pagamentos
- Contratos
- Histórico

## Implementações maduras

### Autenticação

Estado:
Validada

Observações:
...

---

### Upload

Estado:
Validado

Observações:
...

---

### Ownership

Estado:
Validado

Observações:
...

## Problemas identificados

- excesso de lógica no Apps Script

- dependência de planilhas

- duplicação de estados

- acoplamento

- nomenclaturas inconsistentes

...

## Padrões reutilizáveis

- operação mensal

- ownership

- snapshots

- workflow por estados

- timeline

- auditoria

- integração Drive

## Componentes reutilizáveis

Frontend

Backend

Validações

OAuth

Upload

Integração Drive

Jobs

Policies

## Lições aprendidas

O projeto demonstrou que...

...

...

...

## Conclusão

O legado não deve ser reproduzido integralmente.

Ele deve ser tratado como fonte de conhecimento técnico.

Toda implementação validada deve servir como referência para a V3, enquanto limitações arquiteturais e decisões obsoletas devem permanecer apenas como registro histórico.