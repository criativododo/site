# IMPLEMENTATION PLAN

Projeto: DODÔ

Ferramenta: SAÚDE

Versão: 1.0

Status: Em desenvolvimento

Documento complementar ao:

- SAUDE.md
- SAUDE_PRD.md

---

# Objetivo

Este documento define a ordem oficial de implementação da ferramenta SAÚDE.

Enquanto o SAUDE_PRD.md descreve o comportamento esperado da ferramenta, este documento descreve COMO a implementação será construída.

Nenhuma sprint pode alterar o comportamento definido no PRD.

Este documento é a fonte soberana da execução.

---

# Filosofia

A implementação deve ser incremental.

Cada sprint deve produzir uma entrega utilizável.

Nenhuma sprint deve depender de código ainda inexistente.

Toda sprint deve possuir:

- objetivo
- escopo
- arquivos envolvidos
- critérios de aceite
- forma de validação

Uma sprint somente é considerada concluída quando todos os critérios de aceite forem satisfeitos.

---

# Regras Gerais

Durante toda a implementação:

- nunca quebrar compatibilidade;
- nunca implementar funcionalidades fora do escopo da sprint;
- nunca misturar responsabilidades;
- preferir simplicidade à complexidade;
- manter baixo acoplamento;
- manter alta coesão;
- sempre preservar a característica "read only" da ferramenta.

---

# Estrutura Geral

A implementação será dividida nas seguintes fases:

Fase 1
Infraestrutura

Fase 2
Core

Fase 3
Coletores

Fase 4
Renderização

Fase 5
Prompt

Fase 6
Testes

Fase 7
Release

---

# FASE 1 — Infraestrutura

Objetivo

Criar toda a estrutura básica necessária para permitir o desenvolvimento do restante da ferramenta.

Nenhuma lógica de auditoria será implementada nesta fase.

---

# Sprint 01

Nome

Estrutura do projeto

Objetivo

Criar toda a estrutura inicial de diretórios.

Arquivos

scripts/

scripts/lib/

scripts/report/

scripts/config/

Critérios de aceite

✓ estrutura criada

✓ organização validada

✓ nenhuma lógica implementada

Validação

Executar:

./scripts/saude

Resultado esperado

Executável inicia corretamente.

---

# Sprint 02

Nome

Executável principal

Objetivo

Criar o comando oficial da ferramenta.

Arquivos

scripts/saude

Critérios

✓ executável criado

✓ permissões corretas

✓ cabeçalho exibido

✓ sem lógica de auditoria

Validação

./scripts/saude

Resultado esperado

Exibição do cabeçalho oficial:

DODÔ PROJECT HEALTH REPORT

---

# Sprint 03

Nome

Bootstrap

Objetivo

Implementar carregamento automático dos módulos.

Arquivos

scripts/saude

scripts/lib/

Critérios

✓ localizar raiz do projeto

✓ localizar módulos

✓ carregar módulos

✓ tratamento de erro

Validação

Todos os módulos carregados.

---

# Sprint 04

Nome

Configuração

Objetivo

Criar o sistema de configuração da ferramenta.

Arquivos

scripts/config/

Critérios

✓ configuração centralizada

✓ sem valores duplicados

✓ fácil expansão

Validação

Ferramenta inicia usando apenas configuração central.

---

# Sprint 05

Nome

Registry

Objetivo

Criar registro oficial dos coletores.

Arquivos

core/registry

Critérios

✓ registrar coletores

✓ registrar ordem

✓ registrar dependências

Validação

Registry consegue listar todos os coletores cadastrados.

---

# Sprint 06

Nome

Runner

Objetivo

Criar o coordenador responsável pela execução dos coletores.

Critérios

✓ executar coletores

✓ controlar ordem

✓ isolar falhas

✓ registrar tempo

Validação

Runner executa sem depender dos coletores reais.

---

# Sprint 07

Nome

Sistema de Logging

Objetivo

Criar toda a infraestrutura de logs internos da ferramenta.

Critérios

✓ mensagens padronizadas

✓ stderr separado de stdout

✓ suporte a modo quiet

Validação

Logs aparecem corretamente.

---

# Sprint 08

Nome

Tratamento de erros

Objetivo

Padronizar completamente todos os erros internos.

Critérios

✓ erros previsíveis

✓ mensagens consistentes

✓ falhas isoladas

Validação

Falha de um módulo não encerra a execução.

---

# Sprint 09

Nome

Temporização

Objetivo

Adicionar medição de tempo por módulo.

Critérios

✓ tempo individual

✓ tempo total

✓ registro consistente

Validação

Relatório apresenta tempos corretos.

---

# Sprint 10

Nome

Fim da Infraestrutura

Objetivo

Validar que toda a base da ferramenta está pronta para receber os coletores.

Critérios

✓ bootstrap funcionando

✓ runner funcionando

✓ registry funcionando

✓ configuração funcionando

✓ logging funcionando

✓ tratamento de erros funcionando

Resultado esperado

Infraestrutura considerada concluída.

A partir da Sprint 11 inicia-se a implementação dos coletores.

---

# FASE 2 — Coletores

Objetivo

Implementar todos os coletores responsáveis pela aquisição de informações.

Nenhum coletor poderá:

- alterar arquivos;
- criar arquivos;
- modificar o repositório;
- executar comandos destrutivos;
- depender de outro coletor.

Todos deverão produzir dados estruturados.

---

# Sprint 11

Nome

Collector System

Objetivo

Coletar informações do ambiente de execução.

Escopo

- Sistema operacional
- Arquitetura
- CPU
- Memória
- Espaço em disco
- Node
- npm
- Git
- Python
- Ferramentas instaladas

Critérios de aceite

✓ coleta completa

✓ tratamento para ausência de ferramentas

✓ saída estruturada

Validação

Comparar informações com o ambiente real.

---

# Sprint 12

Nome

Collector Git

Objetivo

Auditar completamente o estado do repositório Git.

Escopo

- branch atual
- upstream
- status
- commits pendentes
- objetos
- garbage
- packs
- stash
- tags
- tamanho do .git
- branches locais
- branches remotas
- blobs grandes
- Git LFS
- submodules

Critérios

✓ nenhuma escrita

✓ informações completas

✓ tratamento de erro

Validação

Comparar saída com comandos Git executados manualmente.

---

# Sprint 13

Nome

Collector Project

Objetivo

Mapear completamente a estrutura do projeto.

Escopo

- tamanho total
- quantidade de arquivos
- quantidade de diretórios
- profundidade
- distribuição por extensão
- arquivos vazios
- maiores diretórios
- maiores arquivos
- TODO
- FIXME
- HACK
- arquivos suspeitos

Critérios

✓ informações consistentes

✓ ordenação determinística

Validação

Comparação manual utilizando find, du e wc.

---

# Sprint 14

Nome

Collector Dependencies

Objetivo

Auditar todas as dependências do projeto.

Escopo

- package.json
- lockfiles
- node_modules
- duplicações
- tamanho
- dependências de produção
- desenvolvimento
- peer
- optional
- pacotes não utilizados
- versões divergentes

Critérios

✓ nenhuma instalação

✓ nenhuma atualização

✓ somente leitura

Validação

Comparar com npm list.

---

# Sprint 15

Nome

Collector Build

Objetivo

Auditar artefatos de build.

Escopo

- dist
- build
- out
- .output
- .vercel
- sourcemaps
- builds antigas
- diretórios rastreados

Critérios

✓ nenhuma execução de build

✓ somente inspeção

Validação

Comparação manual.

---

# Sprint 16

Nome

Collector Cache

Objetivo

Auditar todos os caches conhecidos.

Escopo

- .cache
- .vite
- .turbo
- .parcel-cache
- coverage
- node_modules/.cache
- .eslintcache
- .tsbuildinfo

Critérios

✓ identificar

✓ medir

✓ organizar

Validação

Comparação manual utilizando du.

---

# Sprint 17

Nome

Collector Large Files

Objetivo

Encontrar arquivos potencialmente problemáticos.

Escopo

- Top maiores arquivos
- tipo
- tamanho
- data
- categoria
- rastreado
- ignorado
- não rastreado

Critérios

✓ ordenação por tamanho

✓ caminhos relativos

Validação

Comparação manual utilizando find.

---

# Sprint 18

Nome

Collector Documentation

Objetivo

Inventariar toda a documentação do projeto.

Escopo

- README
- CHANGELOG
- LICENSE
- SECURITY
- AGENTS
- docs/
- markdown
- PDFs
- imagens
- links internos
- documentos órfãos

Critérios

✓ inventário completo

✓ sem interpretação

Validação

Comparação manual.

---

# Sprint 19

Nome

Collector Security

Objetivo

Detectar sinais básicos de riscos.

Escopo

- .env
- .pem
- .key
- certificados
- arquivos sensíveis
- segredos aparentes
- permissões
- arquivos rastreados

Critérios

✓ nunca exibir valores sensíveis

✓ apenas caminhos

✓ apenas fatos

Validação

Testes utilizando arquivos de exemplo.

---

# Sprint 20

Nome

Validação dos Coletores

Objetivo

Garantir que todos os coletores funcionam em conjunto.

Critérios

✓ todos registrados

✓ todos executam

✓ nenhum depende do outro

✓ falha isolada

✓ saída consistente

Resultado esperado

Todos os coletores disponíveis para utilização pelo Runner.

A Fase 2 encerra a camada de aquisição de dados.

Nenhuma renderização será implementada até este ponto.

---

# FASE 3 — Renderização

Objetivo

Transformar os dados coletados em um relatório consistente, determinístico e legível.

---

# Sprint 21

Nome

Renderer Text

Objetivo

Implementar o renderizador oficial em texto.

Escopo

- Cabeçalho
- Seções
- Tabelas
- Rodapés
- Separadores

Critérios

✓ saída legível

✓ largura de 80 colunas

✓ ordenação consistente

✓ sem dados perdidos

---

# Sprint 22

Nome

Renderer JSON

Objetivo

Gerar uma representação estruturada de todo o relatório.

Escopo

- JSON válido
- mesmas informações da versão texto
- schema consistente

Critérios

✓ JSON válido

✓ compatibilidade futura

✓ determinismo

---

# Sprint 23

Nome

Summary

Objetivo

Implementar o Resumo Executivo.

Escopo

- estatísticas gerais
- totais
- distribuição
- tempo total
- consumo de espaço

Critérios

✓ apenas fatos

✓ nenhuma interpretação

✓ nenhuma recomendação

---

# Sprint 24

Nome

Prompt Builder

Objetivo

Gerar automaticamente o prompt final para IA.

Escopo

- prompt completo
- template oficial
- pronto para copiar

Critérios

✓ sem edição manual

✓ compatível com Claude

✓ compatível com ChatGPT

✓ compatível com Gemini

---

# Sprint 25

Nome

Relatório Final

Objetivo

Integrar todas as seções.

Critérios

✓ ordem correta

✓ todas as seções presentes

✓ nenhuma seção duplicada

Resultado esperado

Primeira versão funcional do DODÔ PROJECT HEALTH REPORT.

---

# FASE 4 — Testes

Objetivo

Garantir estabilidade e comportamento determinístico.

---

# Sprint 26

Testes Unitários

Critérios

✓ coletores

✓ renderizadores

✓ parser

✓ utilitários

---

# Sprint 27

Testes de Integração

Critérios

✓ runner

✓ registry

✓ fluxo completo

✓ coletores em conjunto

---

# Sprint 28

Testes de Segurança

Critérios

✓ read only

✓ nenhuma escrita

✓ nenhum comando destrutivo

✓ nenhum segredo exposto

---

# Sprint 29

Testes de Performance

Critérios

✓ execução abaixo do tempo definido no PRD

✓ consumo de memória aceitável

✓ sem gargalos conhecidos

---

# FASE 5 — QA

Objetivo

Validar o comportamento da ferramenta em ambiente real.

---

# Sprint 30

QA Geral

Checklist

□ Linux

□ macOS

□ npm run saude

□ ./scripts/saude

□ saude

□ JSON

□ Texto

□ Prompt

□ Grandes projetos

□ Projetos pequenos

□ Monorepos

Resultado esperado

Ferramenta considerada estável.

---

# FASE 6 — Release

Objetivo

Preparar a primeira versão oficial.

---

# Sprint 31

Documentação

Arquivos

README

CHANGELOG

USAGE

Critérios

✓ documentação atualizada

---

# Sprint 32

Empacotamento

Critérios

✓ comando oficial

✓ package.json

✓ permissões

✓ instalação simplificada

---

# Sprint 33

Release Candidate

Objetivo

Congelar funcionalidades.

Critérios

✓ apenas correções

✓ nenhuma feature nova

---

# Sprint 34

Release v1.0

Objetivo

Publicação oficial.

Critérios

✓ documentação

✓ testes

✓ validação

✓ aprovação

---

# Sprint 35

Pós-release

Objetivo

Preparar evolução da ferramenta.

Escopo

- backlog

- melhorias

- novas ideias

- roadmap v2

---

# Definition of Done

Uma sprint somente será considerada concluída quando:

✓ todos os critérios de aceite forem atendidos

✓ testes executados

✓ nenhuma regressão identificada

✓ documentação atualizada quando necessário

✓ comportamento compatível com o SAUDE_PRD.md

✓ nenhuma violação da política "read only"

---

# Critérios para Release

A versão 1.0 somente poderá ser publicada quando:

✓ todas as 35 sprints estiverem concluídas

✓ todos os testes aprovados

✓ documentação finalizada

✓ relatório gerado corretamente

✓ JSON válido

✓ prompt final validado

✓ compatibilidade mantida

---

# Backlog da Versão 2

Itens previstos para evolução futura:

- histórico de execuções

- comparação entre snapshots

- saída HTML

- saída Markdown

- integração opcional com CI

- plugins

- novos coletores

- novos renderizadores

- múltiplos templates de prompt

- comparação entre projetos

---

# Encerramento

Este documento define a ordem oficial de implementação da ferramenta SAÚDE.

Toda implementação deve seguir rigorosamente:

1. SAUDE.md

2. SAUDE_PRD.md

3. IMPLEMENTATION_PLAN.md

Em caso de conflito:

SAUDE_PRD.md prevalece sobre IMPLEMENTATION_PLAN.md.

IMPLEMENTATION_PLAN.md prevalece sobre decisões de implementação.

Nenhuma funcionalidade pode ser implementada fora deste plano sem atualização prévia da documentação.

Fim do documento.