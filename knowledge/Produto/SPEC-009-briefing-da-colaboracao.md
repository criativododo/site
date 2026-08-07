# SPEC-009 · Briefing da Colaboração

**Status:** Refinada — pronta para Gate Arquitetural
**Versão:** 1.2 (2026-07-29 — RN-01 usa calendário operacional como única fonte da verdade; heurística legada de sexta-feira abandonada, ver §22 Histórico)
**Módulo:** M3 · Briefing
**Fase:** 4 · Especificação de Módulos
**Depende de:** SPEC-005 · Colaboração Mensal
**Fonte de verdade:** `CONTRATO_SOBERANO.md`

---

## 1. Objetivo

Especificar o módulo que comunica, por Parceira e por formato, **o que produzir**
em uma Colaboração Mensal: peça/look, data de entrega, data de postagem e
orientação criativa — calculando automaticamente a data de aprovação interna.

Não define tecnologia, persistência física, API HTTP ou UI.

---

## 2. Escopo

**Contempla**
- Registro do Briefing da Colaboração por formato (Reel, Carrossel, Stories 1, Stories 2).
- Cálculo automático da data de aprovação interna (RN-04).
- Importação opcional de "looks" de planilha externa por Parceira.
- Publicação do evento `BriefingPublicado`.

**Não contempla**
- Estado de produção do conteúdo (SPEC-012).
- Envio físico do produto (SPEC-016).
- Leitura do briefing no Portal (SPEC-027).

---

## 3. Referências

| Documento | Seções | Uso |
|---|---|---|
| `PRD.md` | §5.3, §6.3, §7 (RN-04, RN-06), §9 (RF-008, RF-009, RF-010) | Requisitos |
| `knowledge/ARCHITECTURAL_DECISIONS.md` | ADR-014 | Calendário operacional (dia útil) de RN-01, v1.1 |
| `CONTRATO_SOBERANO.md` | §4, §6.3, §8 | Linguagem, agregado, evento `BriefingPublicado` |
| `ADR — Linguagem Ubíqua` | §4 | `Briefing da Colaboração`, `Entrega` |

---

## 4. Linguagem Ubíqua (obrigatória)

| Termo oficial | Definição sintética |
|---|---|
| **Briefing da Colaboração** | Conjunto de orientações e prazos, por formato, de uma Colaboração Mensal. |
| **Bloco de formato** | Unidade do briefing para um formato (Reel/Carrossel/Stories). |
| **Data de aprovação interna** | Data-limite de revisão, derivada da data de postagem (RN-04). |

Termos banidos: `Ciclo`, `Combinado do Ciclo` (Contrato §2).

---

## 5. Visão Geral

```
   MesCompilado (SPEC-005) ──▶ Briefing recriado por Parceira/competência
          │ equipe preenche por formato
          ▼
   Bloco[Reel|Carrossel|Stories1|Stories2] = { look, dataEntrega, dataPostagem, orientacao }
          │ deriva
          ▼
   dataAprovacaoInterna = f(dataPostagem)   (RN-04)
          │
          ▼
   Publica BriefingPublicado
```

O Briefing é **recriado a cada compilação** (reage a `MesCompilado`).

---

## 6. Modelo do Domínio

### 6.1 Value Objects
- **DataAprovacaoInterna**: derivada; nunca informada manualmente.
- **OrientacaoCriativa**: texto livre por bloco.

### 6.2 Entidades e Agregado
- **Briefing da Colaboração (agregado raiz)** — identidade `(parceiraId, mesReferencia)`;
  contém até 4 blocos de formato (um por formato contratado).

### 6.3 Serviço de Domínio
- **Calculadora de Aprovação**: aplica RN-04 sobre `dataPostagem`.

### 6.4 O que NÃO pertence
- Estado da Entrega (SPEC-012), Envio (SPEC-016), Pagamento (SPEC-020).

---

## 7. Capacidades cobertas

| Capacidade | Coberta por |
|---|---|
| Descrever entrega por formato | UC-009.01 |
| Calcular prazo de aprovação | RN-04, UC-009.01 |
| Importar looks externos | UC-009.02 |

---

## 8. Casos de Uso

### UC-009.01 · Preencher Briefing
- **Ator:** Operador Criativo Dodô.
- **Pré-condições:** existe Colaboração Mensal compilada para a competência.
- **Fluxo:** para cada bloco de formato, informa look, data de entrega, data de
  postagem e orientação → sistema calcula a data de aprovação interna (RN-04).
- **Pós-condição:** `BriefingPublicado` publicado.

### UC-009.02 · Importar Looks
- **Ator:** Operador Criativo Dodô.
- Importa os looks definidos em planilha externa por Parceira para dentro do briefing.

---

## 9. Máquina de Estados

```
Rascunho ──(preenchido e publicado)──▶ Publicado
```
- A cada nova compilação, o rascunho anterior é limpo (PRD §5.2).

---

## 10. Regras de Negócio

| ID | Regra | Origem |
|---|---|---|
| RN-01 | A data de aprovação interna é 7 dias antes da postagem; se a data resultante cair em dia não útil do **calendário operacional** — sábado, domingo, feriado nacional, feriado estadual aplicável à operação, feriado municipal da cidade-base da operação, ou ponto facultativo adotado oficialmente pela Criativo Dodô —, avança dia a dia até o primeiro dia útil seguinte. Critério **exclusivamente operacional, nunca jurídico**: Carnaval e Corpus Christi contam sempre como não úteis; demais pontos facultativos só contam quando fizerem parte do calendário operacional oficial da empresa | PRD §7 RN-04 (regra-base: 7 dias + fim de semana); calendário operacional — decisão do responsável do projeto, 2026-07-29, sem fonte no legado/PRD; ADR-014 |
| RN-02 | Há um bloco de briefing por formato contratado (Reel, Carrossel, Stories 1, Stories 2) | PRD §7 RN-06 |
| RN-03 | O briefing é recriado a cada compilação da competência | PRD §5.2 |
| RN-04 | A data de aprovação é espelhada com a Entrega correspondente (SPEC-012) | PRD §6.3 |

---

## 11. Invariantes
- INV-01 Todo Briefing pertence a exatamente uma Colaboração Mensal.
- INV-02 Todo bloco corresponde a um formato contratado da Parceira.
- INV-03 A data de aprovação interna é sempre derivada, nunca arbitrária.

---

## 12. Eventos de Domínio

| Evento | Payload lógico | Consumidores |
|---|---|---|
| `BriefingPublicado` | `parceiraId`, `mesReferencia`, `blocos[]` | Ativação (SPEC-012), Portal (SPEC-027), Contratos (SPEC-023) |

Nome conforme catálogo (Contrato §8).

---

## 13. Papéis e Permissões

| Operação | Administrador | Operador | Parceira |
|---|---|---|---|
| Preencher briefing | ✅ | ✅ | ❌ |
| Importar looks | ✅ | ✅ | ❌ |
| Ler briefing | ✅ | ✅ | ✅ (o próprio, no Portal) |

---

## 14. Contratos entre Módulos

### 14.1 Consome
| Fonte | Dado | Uso |
|---|---|---|
| SPEC-005 | `MesCompilado` | Gatilho de recriação do briefing |

### 14.2 Fornece
| Consumidor | Dado | Meio |
|---|---|---|
| SPEC-012 | Data de aprovação por Entrega | Espelhamento |
| SPEC-027 | Briefing por bloco | Query |
| SPEC-023 | Dados de briefing | Query (briefing formal) |

---

## 15. Requisitos Não Funcionais
| ID | Requisito |
|---|---|
| RNF-01 | Cálculo de data determinístico e testável. |
| RNF-02 | Independente da tecnologia de persistência. |

---

## 16. Casos de Borda
| ID | Cenário | Resultado |
|---|---|---|
| CB-01 | Data de postagem em fim de semana | Aprovação ajustada por RN-01 |
| CB-02 | Nova compilação com briefing anterior preenchido | Rascunho anterior limpo antes de novo preenchimento |
| CB-03 | Parceira sem formato contratado | Nenhum bloco criado |
| CB-04 | Data resultante cai em sequência de dias não úteis (ex.: feriado numa segunda logo após um fim de semana, ou ponto facultativo institucional emendado a um feriado) | Aprovação avança até o primeiro dia útil real, independentemente de quantos dias não úteis consecutivos existirem |
| CB-05 | Data resultante cai em Carnaval ou Corpus Christi | Sempre tratado como não útil — critério operacional, não a classificação jurídica de "ponto facultativo" |
| CB-06 | Data resultante cai em ponto facultativo que não faz parte do calendário operacional oficial da Criativo Dodô | Nenhum ajuste — o dia é considerado útil |

---

## 17. Tratamento de Erros
| Código | Situação |
|---|---|
| BR-01 | Colaboração Mensal inexistente para a competência |
| BR-02 | Data de postagem inválida |
| BR-03 | Operação não autorizada |

---

## 18. Rastreabilidade
| Item | Origem |
|---|---|
| RN-01 (aprovação) | PRD §7 RN-04 (regra-base); ADR-014 (calendário operacional, v1.1) |
| RN-02 (blocos) | PRD §7 RN-06 |
| Evento | Contrato §8 |

---

## 19. Definition of Done
- Cálculo de aprovação conforme RN-04 (testado nos 4 casos de borda de dia).
- Um bloco por formato contratado.
- Recriação por compilação.
- `BriefingPublicado` publicado.
- Gate Arquitetural aprovado.

---

## 20. Plano de Testes (essenciais)
| Cenário | Esperado |
|---|---|
| Postagem em dia útil | Aprovação = postagem − 7 |
| Postagem cujo cálculo cai em sexta-feira comum, sem feriado | **Nenhum ajuste** — sexta é dia útil; heurística legada do sistema anterior (sexta como gatilho) foi deliberadamente descartada (ADR-014) |
| Postagem que cai em sábado/domingo | Ajuste até o próximo dia útil |
| Postagem cujo cálculo cai em feriado nacional isolado | Ajuste +1 dia útil |
| Postagem cujo cálculo cai em feriado estadual/municipal aplicável à operação | Ajuste avança até o próximo dia útil real |
| Postagem cujo cálculo cai em Carnaval ou Corpus Christi | Sempre ajustado, mesmo sendo ponto facultativo |
| Postagem cujo cálculo cai em ponto facultativo institucional **não** adotado pela empresa | Nenhum ajuste — dia considerado útil |
| Postagem cujo cálculo cai em sequência de dias não úteis (feriado emendado a fim de semana) | Ajuste avança até o primeiro dia útil real |
| Recompilar competência | Briefing anterior limpo |

---

## 21. Pendências de Design
| ID | Item | Origem |
|---|---|---|
| D-01 | Persistência física do briefing (sem carimbo de mês em `BRIEFING`) | Contrato §7.2; ADR futuro |
| D-02 | Estado (RJ) e cidade-base (Nova Friburgo) já declarados e implementados; **feriado municipal de Nova Friburgo** ainda não — fica para quando o calendário operacional oficial da empresa for levantado (decisão do responsável, 2026-07-29). Não bloqueia nacional/estadual, já ativos | ADR-014 |
| D-03 | Lista de pontos facultativos institucionais adotados oficialmente pela Criativo Dodô — calendário próprio, mantido manualmente, ainda não populado | ADR-014 |

---

## 22. Histórico
| Versão | Data | Alteração |
|---|---|---|
| 1.0 | 2026-07-14 | Especificação inicial do Briefing (padrão SPEC-005). |
| 1.1 | 2026-07-29 | RN-01 estendida: dia útil passa a seguir um **calendário operacional** (feriados nacionais, estaduais/municipais aplicáveis, pontos facultativos institucionais), critério exclusivamente operacional — nunca jurídico. Decisão de negócio do responsável do projeto, sem fonte no PRD/legado. Ver ADR-014. |
| 1.2 | 2026-07-29 | Confirmado e oficializado: a heurística legada de tratar sexta-feira como gatilho de ajuste **não é preservada** — sexta comum é dia útil, sem ajuste automático. Escopo inicial de implementação declarado: feriados nacionais + estaduais do RJ + mecanismo configurável; municipal de Nova Friburgo fica para levantamento oficial futuro. Ver ADR-014. |
