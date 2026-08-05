# SAÚDE
## DODÔ PROJECT HEALTH REPORT

Versão: 1.0
Status: Em desenvolvimento

---

# Objetivo

O comando `saude` é a ferramenta oficial de auditoria técnica do projeto DODÔ.

Seu objetivo é produzir um relatório completo da saúde do repositório para análise humana ou por IA.

O comando NÃO toma decisões.

O comando NÃO modifica arquivos.

O comando NÃO executa limpezas.

O comando NÃO instala dependências.

O comando apenas observa, mede, organiza e reporta.

---

# Filosofia

O terminal coleta.

A IA interpreta.

O comando deve gerar o máximo de contexto possível.

Nenhuma análise complexa deve ser feita pelo script.

---

# Saída

Toda execução deve gerar:

1. Cabeçalho

DODÔ PROJECT HEALTH REPORT

2. Relatório técnico

3. Prompt pronto para IA

4. Relatório bruto

---

# Seções obrigatórias

## SYSTEM

Sistema operacional

CPU

Memória

Espaço livre

Versões:

Node

npm

Git

Python

---

## PROJECT

Tamanho total

Quantidade de arquivos

Quantidade de diretórios

50 maiores pastas

50 maiores arquivos

Arquivos recentes

---

## GIT

Status

Branch

Commits pendentes

Arquivos modificados

Arquivos não rastreados

Objetos

Garbage

Packfiles

Tamanho do .git

---

## NODE

node_modules

Dependências

Versões

Duplicidades

---

## BUILD

dist

build

.next

.vite

coverage

storybook

---

## CACHE

.cache

.turbo

.parcel-cache

.vite

tmp

---

## DOCUMENTAÇÃO

Quantidade de:

Markdown

PDF

PNG

SVG

JPG

---

## SEGURANÇA

Dependências vulneráveis

Dependências desatualizadas

---

## OBSERVAÇÕES

Itens potencialmente incomuns.

Sem sugestões.

Sem decisões.

Apenas fatos.

---

# Prompt

Ao final do relatório deverá existir um prompt pronto para IA.

O usuário apenas copia e cola.

Nenhuma edição manual deve ser necessária.

---

# Regras

Nunca remover arquivos.

Nunca alterar arquivos.

Nunca executar git clean.

Nunca executar rm.

Nunca executar npm install.

Nunca executar npm update.

Nunca modificar o projeto.

---

# Objetivo final

Manter o projeto saudável durante todo o ciclo de desenvolvimento.

Detectar problemas antes que se tornem problemas reais.

Criar histórico técnico da evolução do projeto.
