# PRD — Ferramenta SAÚDE

**Projeto:** DODÔ
**Componente:** SAÚDE (auditoria técnica do repositório)
**Versão do documento:** 1.0
**Status:** Fonte soberana da implementação
**Natureza:** Especificação técnica — nenhum código é definido aqui

---

## 1. Resumo

SAÚDE é a ferramenta oficial de auditoria técnica do projeto DODÔ. Ela inspeciona o repositório
e o ambiente local, coleta métricas objetivas e emite um relatório textual chamado
**DODÔ PROJECT HEALTH REPORT**.

A ferramenta é **estritamente somente-leitura**. Ela não corrige, não limpa, não instala e não
opina. Toda interpretação é delegada a um agente de IA, através de um prompt pronto emitido ao
final do relatório.

---

## 2. Filosofia

> O terminal coleta. A IA interpreta.

Quatro princípios inegociáveis:

1. **Coleta sem julgamento.** O script mede; não conclui. Nenhum limiar de "bom/ruim" é
   codificado além de classificações puramente descritivas e documentadas.
2. **Inteligência fora do script.** Heurísticas, priorização e recomendação vivem no prompt de IA,
   não no código. Isso mantém o script estável enquanto a análise evolui.
3. **Dados confiáveis acima de dados completos.** Um dado ausente e explicitamente marcado como
   indisponível vale mais que um dado inferido.
4. **Zero efeitos colaterais.** Executar SAÚDE mil vezes deve deixar o repositório byte-idêntico.

---

## 3. Objetivos

### 3.1 Objetivos do produto

- Dar visibilidade contínua sobre o estado técnico do repositório DODÔ.
- Detectar crescimento anormal, lixo técnico e resíduos de build antes que virem problema.
- Produzir uma saída determinística, comparável entre execuções e entre máquinas.
- Servir de entrada estruturada para auditoria feita por IA.
- Ser executável por qualquer pessoa da equipe sem conhecimento prévio da ferramenta.

### 3.2 Não-objetivos

- Não é um linter, formatador ou type-checker (pode reportar a existência deles, não substituí-los).
- Não é um scanner de vulnerabilidades completo (reporta sinais, não faz CVE matching profundo).
- Não é um dashboard, serviço web ou UI. É um comando de terminal.
- Não é CI gate na v1 (ver roadmap).
- Não faz nenhuma alteração no projeto, em nenhuma circunstância.

---

## 4. Contrato de execução

### 4.1 Invocações suportadas

As três formas abaixo devem produzir **exatamente o mesmo resultado**:

```
saude
./scripts/saude
npm run saude
```

Requisitos:

- `./scripts/saude` é o executável canônico. As demais formas são apenas encaminhamentos.
- `saude` no PATH é um link simbólico ou wrapper que executa o canônico a partir da raiz do repositório.
- `npm run saude` é um script em `package.json` que invoca o canônico.
- Nenhuma das formas pode aceitar comportamento divergente por padrão. Flags são idênticas nas três.
- O diretório de trabalho não pode influenciar o resultado: a ferramenta resolve a raiz do
  repositório antes de qualquer coleta.

### 4.2 Flags (v1)

| Flag | Efeito |
|---|---|
| _(nenhuma)_ | Relatório completo em texto no stdout |
| `--json` | Emite o mesmo conteúdo como JSON estruturado |
| `--section <nome>` | Executa apenas a(s) seção(ões) indicada(s) |
| `--no-color` | Desliga cores ANSI |
| `--quiet` | Suprime progresso; mantém apenas o relatório |
| `--timeout <ms>` | Sobrescreve o timeout por coletor |
| `--version` | Versão da ferramenta |
| `--help` | Uso e lista de seções |

Regras: flags desconhecidas causam erro de uso (exit 2) com mensagem clara. Nenhuma flag pode
habilitar escrita.

### 4.3 Códigos de saída

| Código | Significado |
|---|---|
| `0` | Auditoria concluída (independentemente do que foi encontrado) |
| `1` | Falha interna da ferramenta (ex.: não é um repositório Git) |
| `2` | Erro de uso (flag inválida) |

**Importante:** achados negativos no relatório **não** alteram o código de saída na v1. SAÚDE
reporta, não reprova.

### 4.4 Canais de saída

- **stdout:** exclusivamente o relatório (texto ou JSON).
- **stderr:** progresso, avisos, erros de coletor.

Isso garante que `saude --json > relatorio.json` produza JSON válido sempre.

---

## 5. Arquitetura

### 5.1 Visão geral

```text
scripts/saude                  executável — apenas coordena
scripts/saude/
  core/
    runner                     orquestra coletores, aplica timeouts
    context                    raiz do repo, flags, ambiente, relógio
    registry                   registro declarativo de coletores
    errors                     tipos de erro e degradação
    exec                       execução de comando externo, somente-leitura
    fs                         varredura de arquivos, somente-leitura
    format                     tabelas, unidades, cores, truncamento
  collectors/
    system
    git
    project
    dependencies
    build
    cache
    large-files
    docs
    security
  report/
    header
    sections
    summary
    prompt
    renderer-text
    renderer-json
  config/
    defaults                   limiares descritivos, listas de padrões
```

### 5.2 Regras de arquitetura

1. **Um módulo, uma responsabilidade.** Nenhum arquivo acumula coleta + formatação + decisão.
2. **O executável não coleta.** `scripts/saude` resolve contexto, chama o runner, entrega ao
   renderer, encerra.
3. **Coletores são puros em relação ao disco.** Só leem. Nunca escrevem, nunca criam temporários
   dentro do repositório.
4. **Coletores não formatam.** Devolvem dados estruturados. Formatação é do renderer.
5. **Coletores não conhecem uns aos outros.** Sem dependência cruzada. Se dois precisam do mesmo
   dado, o dado vira um utilitário em `core/`.
6. **Falha de coletor é isolada.** Um coletor que falha marca sua seção como degradada; os demais
   continuam.
7. **Configuração é declarativa.** Padrões de caminho, extensões e limiares vivem em `config/`,
   não espalhados no código.

### 5.3 Contrato de coletor

Cada coletor declara:

| Campo | Descrição |
|---|---|
| `id` | Identificador estável, usado por `--section` |
| `title` | Título humano da seção |
| `order` | Posição no relatório |
| `requires` | Pré-requisitos (ex.: `git`, `node`) |
| `timeout` | Tempo máximo de execução |
| `run` | Executa a coleta e devolve dados estruturados |

Cada coletor retorna:

| Campo | Descrição |
|---|---|
| `status` | `ok` \| `degraded` \| `skipped` \| `failed` |
| `data` | Dados estruturados da seção |
| `notes` | Observações factuais (ex.: "git-lfs não instalado") |
| `durationMs` | Tempo de coleta |

Nenhum coletor retorna severidade, nota ou recomendação. Isso é responsabilidade da IA.

### 5.4 Determinismo

- Listas sempre ordenadas por critério explícito (tamanho desc., depois caminho asc.).
- Caminhos sempre relativos à raiz do repositório, com `/` como separador.
- Tamanhos sempre em bytes no JSON; unidades legíveis apenas no texto.
- Timestamps em ISO-8601 UTC.
- Nada de aleatoriedade, nada de ordem de sistema de arquivos.
- Campos voláteis (timestamp, duração) isolados no cabeçalho para permitir diff entre execuções.

### 5.5 Desempenho

- Alvo: repositório de porte médio auditado em menos de 15 segundos.
- Coletores independentes podem rodar em paralelo; a ordem no relatório é sempre a declarada.
- Uma única travessia do sistema de arquivos alimenta os coletores que precisam dela.
- Timeout padrão por coletor: 10s. Estouro vira `degraded`, nunca trava a execução.
- Diretórios ignorados por padrão na travessia profunda: `.git/objects`, `node_modules`
  (exceto para métricas agregadas de tamanho), e caminhos declarados em `config/defaults`.

---

## 6. O relatório

Nome oficial: **DODÔ PROJECT HEALTH REPORT**

Ordem fixa das seções:

1. Cabeçalho
2. Informações do sistema
3. Saúde do Git
4. Saúde do projeto
5. Dependências
6. Build
7. Cache
8. Arquivos grandes
9. Documentação
10. Segurança
11. Resumo executivo
12. Histórico (planejado)
13. Prompt pronto para IA

Toda seção sempre aparece, mesmo quando vazia ou indisponível — com o motivo declarado.

### 6.1 Cabeçalho

- Título do relatório
- Nome do projeto e caminho da raiz
- Versão da ferramenta SAÚDE
- Data e hora da execução (ISO-8601 UTC e hora local)
- Branch e commit curto atuais
- Duração total da coleta
- Aviso explícito: execução somente-leitura, nenhum arquivo alterado

### 6.2 Informações do sistema

- Sistema operacional, versão e arquitetura
- Runtime Node e gerenciador de pacotes detectado (com versão)
- Versão do Git
- Núcleos de CPU e memória total
- Espaço livre no disco da raiz do repositório
- Presença de ferramentas relevantes no PATH (git, node, package manager, docker, etc.)
- Se está rodando em CI (por variável de ambiente), sem imprimir valores de variáveis

Nunca imprimir valores de variáveis de ambiente — apenas presença/ausência de chaves conhecidas.

### 6.3 Saúde do Git

- Branch atual, upstream configurado, commits à frente/atrás
- Estado da árvore de trabalho: modificados, staged, não rastreados, ignorados (contagens)
- Lista dos arquivos não rastreados mais volumosos (limitada e ordenada)
- Total de commits, data do primeiro e do último commit
- Autores distintos e contagem de commits por autor (top N)
- Tamanho de `.git` e de `.git/objects`
- Objetos soltos vs. empacotados
- Existência de stashes e quantidade
- Branches locais e remotas; branches locais já mescladas
- Tags
- Presença e tamanho de `.gitignore`; padrões duplicados
- Arquivos rastreados que casam com padrões típicos de artefato (sinal de commit indevido)
- Maiores blobs no histórico (top N), quando obtível dentro do timeout
- Presença de submódulos e de Git LFS

### 6.4 Saúde do projeto

- Total de arquivos e diretórios rastreados
- Distribuição por extensão (contagem e bytes, top N)
- Tamanho total do repositório vs. tamanho apenas dos arquivos rastreados
- Profundidade máxima de diretórios e caminhos mais longos
- Arquivos vazios
- Arquivos com nomes suspeitos: `copy`, `old`, `bak`, `tmp`, `final`, `v2`, `teste`, `backup`
- Arquivos duplicados por conteúdo (hash), limitado aos maiores
- Diretórios com crescimento desproporcional (top N por bytes)
- Presença dos arquivos estruturais esperados (`package.json`, `README`, `.gitignore`, config de
  build, config de TypeScript, config de lint)
- Contagem de marcadores `TODO`, `FIXME`, `HACK`, `XXX` por diretório

### 6.5 Dependências

- Gerenciador de pacotes detectado e lockfiles presentes (mais de um lockfile é reportado como fato)
- Contagem de dependências diretas: produção, desenvolvimento, peer, optional
- Contagem total de pacotes instalados e tamanho de `node_modules`
- Profundidade máxima da árvore de dependências
- Pacotes duplicados: mesmo nome em múltiplas versões
- Dependências declaradas e não instaladas; instaladas e não declaradas
- Dependências declaradas e aparentemente não importadas no código (sinal, não veredito)
- Versões fixadas vs. faixas abertas
- Coerência entre lockfile e `package.json`
- Tamanho dos maiores pacotes instalados (top N)
- Pacotes com licença ausente ou não identificada

Nunca executar instalação, atualização, `audit fix` ou qualquer comando que escreva.

### 6.6 Build

- Scripts declarados em `package.json`
- Diretórios de saída de build detectados (`dist`, `build`, `.output`, `out`, `.vercel`, etc.)
- Para cada um: existência, tamanho, número de arquivos, data de modificação mais recente
- Idade da build relativa ao commit mais recente (sinal de build esquecida)
- Se os diretórios de build estão ignorados pelo Git; se algum está rastreado
- Presença de sourcemaps em saída de produção
- Artefatos de build fora dos diretórios esperados
- Presença de arquivos de configuração de build e sua data de modificação

A ferramenta **não executa o build**.

### 6.7 Cache

- Diretórios de cache conhecidos dentro do repositório: `.cache`, `node_modules/.cache`,
  `.turbo`, `.next/cache`, `.vite`, `.parcel-cache`, `.eslintcache`, `.tsbuildinfo`, `coverage`,
  `.nyc_output`, e outros declarados em `config/defaults`
- Para cada um: tamanho, contagem de arquivos, última modificação
- Total agregado ocupado por cache
- Percentual do repositório ocupado por cache
- Caches rastreados pelo Git (fato relevante)
- Caches globais fora do repositório são reportados apenas como tamanho informativo, sem listagem

A ferramenta **não limpa cache**.

### 6.8 Arquivos grandes

- Top N arquivos por tamanho, com caminho, bytes, extensão, data de modificação
- Marcação de cada um: rastreado / ignorado / não rastreado
- Agrupamento por categoria (mídia, binário, dados, dependência, build, cache, código)
- Limiar padrão configurável (sugerido: 1 MB para listagem, 10 MB para destaque)
- Total de bytes acima do limiar e sua fração do repositório
- Arquivos grandes presentes no histórico Git mesmo que ausentes na árvore atual

### 6.9 Documentação

- Presença e tamanho de: `README`, `CHANGELOG`, `CONTRIBUTING`, `LICENSE`, `SECURITY`, `AGENTS`
- Inventário de `docs/`: arquivos, tamanho, data de modificação
- Documentos não modificados há muito tempo em relação ao código que documentam
- Links internos quebrados em Markdown (apenas caminhos locais)
- Blocos de código sem linguagem declarada
- Documentos órfãos: arquivos em `docs/` não referenciados por nenhum outro documento
- Razão entre linhas de documentação e linhas de código

### 6.10 Segurança

Escopo v1: sinais superficiais e verificáveis, sem análise profunda.

- Presença de arquivos `.env*` e se estão ignorados pelo Git
- Arquivos de segredo rastreados pelo Git (`.env`, `.pem`, `.key`, `.p12`, `.keystore`)
- Padrões de credencial em arquivos rastreados (chaves de API, tokens, blocos de chave privada),
  reportados por caminho e linha — **nunca imprimindo o valor detectado**
- Segredos presentes no histórico Git, quando detectáveis dentro do timeout
- Permissões excessivamente abertas em arquivos sensíveis
- Presença e validade sintática de arquivos de política (`SECURITY.md`, `.gitignore`)
- Resultado agregado de auditoria de dependências do gerenciador de pacotes em modo somente-leitura,
  se disponível offline; caso contrário, seção marcada como indisponível

Redação obrigatória: qualquer valor sensível é substituído por marcador. O relatório nunca pode
virar um vetor de vazamento.

### 6.11 Resumo executivo

Um panorama **puramente factual**, sem julgamento:

- Tamanho total do repositório, dividido em: código, dependências, build, cache, mídia, `.git`
- Contagens principais: arquivos, dependências, commits, branches
- Os cinco maiores consumidores de espaço
- Contagem de achados por seção (quantidade, não gravidade)
- Seções degradadas ou puladas, com motivo
- Duração total e por seção

Proibido no resumo: notas, scores, adjetivos avaliativos, recomendações.

### 6.12 Histórico (planejado)

Na v1 esta seção existe e declara-se como planejada, explicando o que virá:

- Snapshots de execuções anteriores armazenados fora do repositório
- Deltas entre execuções: crescimento de tamanho, dependências, cache
- Tendências ao longo do tempo
- Detecção de crescimento anormal por comparação, não por limiar fixo

A v1 não grava nada. Isso é intencional e coerente com a regra de somente-leitura no repositório.

### 6.13 Prompt pronto para IA

Última seção. Bloco contínuo, delimitado, pronto para copiar e colar no Claude. Deve conter:

**Papel e contexto.** Auditor técnico sênior analisando o DODÔ a partir de um relatório coletado
por ferramenta somente-leitura.

**Instrução de busca.** Procurar explicitamente por:

- lixo técnico
- crescimento anormal
- builds esquecidas
- caches
- arquivos temporários
- arquivos grandes
- dependências duplicadas
- problemas de Git
- riscos futuros
- oportunidades reais de melhoria

**Restrições da análise:**

- Não sugerir otimização prematura.
- Não recomendar ação sem evidência no relatório.
- Distinguir fato observado de hipótese.
- Priorizar por impacto real, não por facilidade.
- Declarar explicitamente o que não é possível concluir com os dados disponíveis.
- Não propor reescritas amplas de arquitetura a partir de métricas de tamanho.

**Formato de resposta esperado:**

1. Diagnóstico em uma frase
2. Achados críticos com evidência citada do relatório
3. Achados relevantes
4. Observações menores
5. Riscos futuros
6. Ações recomendadas, ordenadas por impacto, cada uma com o dado que a justifica
7. O que ficou inconclusivo e qual dado adicional resolveria

O prompt é gerado a partir de um template versionado em `report/prompt`, com os dados do relatório
embutidos ou referenciados. Alterar o template não exige alterar coletores.

---

## 7. Regras invioláveis

A ferramenta **nunca** pode:

- remover arquivos
- alterar arquivos
- executar `git clean`
- executar `rm`
- instalar dependências
- atualizar dependências
- modificar qualquer parte do projeto

Regras derivadas, de cumprimento obrigatório:

1. Todo comando externo passa pelo módulo `core/exec`, que só aceita comandos de uma allowlist
   explícita de invocações somente-leitura.
2. Comandos com potencial de escrita são proibidos por construção, não por convenção.
3. Nenhum arquivo temporário é criado dentro do repositório. Se um temporário for indispensável,
   vai para o diretório temporário do sistema e é removido; e mesmo isso deve ser evitado.
4. Nenhuma escrita em `stdout` que não seja o relatório.
5. Nenhuma requisição de rede na v1.
6. Nenhuma variável de ambiente é impressa.
7. A ausência de efeitos colaterais é verificada por teste: hash da árvore antes e depois da
   execução deve ser idêntico.

---

## 8. Critérios de sucesso

A v1 está pronta quando:

| # | Critério |
|---|---|
| 1 | As três formas de invocação produzem saída idêntica |
| 2 | O repositório permanece byte-idêntico após execução (verificado por teste) |
| 3 | Todas as 13 seções sempre aparecem, com motivo declarado quando indisponíveis |
| 4 | Falha de um coletor não impede o relatório completo |
| 5 | Execução completa em menos de 15s em repositório de porte médio |
| 6 | `--json` produz JSON válido e com o mesmo conteúdo do texto |
| 7 | Duas execuções consecutivas sem mudanças no repositório diferem apenas nos campos voláteis |
| 8 | Nenhum valor sensível aparece na saída |
| 9 | O prompt final é copiável e autossuficiente |
| 10 | Adicionar um coletor novo não exige alterar o executável principal |
| 11 | Funciona sem rede |
| 12 | Funciona em Linux e macOS |

---

## 9. Extensibilidade

Adicionar uma seção nova deve exigir exatamente três passos:

1. Criar o módulo em `collectors/`.
2. Registrá-lo em `core/registry` com `id`, `title` e `order`.
3. Adicionar o renderizador da seção em `report/sections`.

Nenhuma alteração no executável, no runner ou em outros coletores.

Pontos de extensão previstos:

- Novos coletores (testes, performance, acessibilidade, i18n, banco de dados)
- Novos renderers (Markdown, HTML, SARIF)
- Novos templates de prompt por objetivo de auditoria
- Configuração por projeto em arquivo dedicado, sobrescrevendo `config/defaults`
- Coletores de terceiros carregados por convenção de diretório

Compatibilidade: o esquema JSON é versionado. Mudança incompatível exige incremento de versão maior
do esquema e nota de migração.

---

## 10. Manutenção

- **Dependências:** a ferramenta deve depender do mínimo possível; idealmente nada além do runtime
  e de utilitários já presentes no ambiente de desenvolvimento.
- **Degradação:** ferramenta externa ausente nunca quebra a execução — vira `skipped` com motivo.
- **Testes obrigatórios:** somente-leitura verificada, determinismo, cada coletor com repositório
  de fixture, validade do JSON, presença de todas as seções, tolerância a falha de coletor.
- **Documentação:** este PRD é a fonte soberana. Mudança de comportamento exige atualização deste
  documento na mesma entrega.
- **Versionamento:** SemVer para a ferramenta. Mudança em nome de seção ou chave JSON é breaking.
- **Propriedade:** o time do DODÔ mantém; qualquer pessoa pode adicionar coletores seguindo o contrato.

---

## 11. Convenções

- Nome do comando: `saude`, minúsculo, sem acento.
- Título do relatório: `DODÔ PROJECT HEALTH REPORT`, com acento, em maiúsculas.
- Identificadores de seção: minúsculos, com hífen (`large-files`).
- Chaves JSON: `camelCase`.
- Caminhos: relativos à raiz, separador `/`.
- Tamanhos: bytes no JSON; unidades binárias legíveis no texto.
- Datas: ISO-8601 UTC no JSON.
- Listas longas: truncadas em N itens, sempre informando o total omitido.
- Linguagem do relatório: português, exceto o título oficial e o prompt de IA, que segue o
  template definido em `report/prompt`.
- Cores: apenas realce estrutural; desativadas automaticamente sem TTY ou com `--no-color`.
- A saída em texto deve permanecer legível com largura de 80 colunas.

---

## 12. Roadmap

### Versão 1 — Coleta

- Executável canônico e as três formas de invocação
- Arquitetura modular com registry de coletores
- As nove seções de coleta, resumo executivo, histórico declarado como planejado e prompt de IA
- Renderers texto e JSON
- Garantia de somente-leitura com testes
- Sem rede, sem persistência

### Versão 2 — Histórico e comparação

- Persistência de snapshots fora do repositório
- Deltas entre execuções e detecção de crescimento anormal por tendência
- `--compare <snapshot>` e `--since <data>`
- Renderer Markdown
- Configuração por projeto

### Versão 3 — Integração

- Modo CI com códigos de saída configuráveis por política
- Política declarativa de limiares definida pelo time, não pela ferramenta
- Comentário automático em pull request
- Renderer SARIF
- Coletores de testes e cobertura
- Segurança aprofundada com base de vulnerabilidades offline

### Versão 4 — Inteligência assistida

- Execução opcional da auditoria de IA a partir da própria ferramenta
- Múltiplos perfis de prompt (performance, segurança, limpeza, onboarding)
- Séries temporais e projeção de crescimento
- Sugestões de correção apresentadas como plano, jamais aplicadas automaticamente
- Comparação entre repositórios do projeto DODÔ

A regra de somente-leitura permanece válida em todas as versões.

---

## 13. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Script escreve por acidente | Allowlist de comandos em `core/exec`; teste de imutabilidade |
| Vazamento de segredo no relatório | Redação obrigatória; nunca imprimir valores |
| Execução lenta em repositório grande | Travessia única, paralelismo, timeouts, truncamento |
| Heurística virar regra no código | Interpretação fica no prompt; script só mede |
| Relatório ilegível de tão longo | Truncamento com totais; `--section` |
| Divergência entre as três invocações | Executável canônico único; teste comparando as três saídas |
| Coletor quebrado derruba tudo | Isolamento por coletor com status `degraded` |

---

## 14. Glossário

- **Coletor:** módulo que produz os dados de uma seção.
- **Runner:** componente que executa coletores, aplica timeouts e agrega resultados.
- **Renderer:** componente que transforma dados agregados em saída.
- **Seção:** bloco nomeado do relatório.
- **Snapshot:** captura persistida de uma execução (a partir da v2).
- **Degradado:** seção presente com dados parciais e motivo declarado.
- **Lixo técnico:** artefato sem função atual: temporários, builds antigas, caches, duplicatas,
  arquivos órfãos.
