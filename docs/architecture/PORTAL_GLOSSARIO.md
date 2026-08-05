# PORTAL_GLOSSARIO.md

> Glossário oficial do domínio, extraído de `CONTRATO_SOBERANO.md`, das SPECs numeradas, dos
> ADRs e do PRD. Onde dois vocabulários (Contrato Soberano vs. Sistema B) usam termos
> diferentes para o mesmo conceito, ambos são listados com a divergência explícita. Nenhuma
> definição foi inventada — cada termo cita sua fonte.

---

## Linguagem ubíqua oficial (Contrato Soberano)

**Parceira** — agregado raiz do domínio; fonte única da condição comercial e identidade da
colaboração. Não é sinônimo de "Influenciadora" enquanto papel de acesso — `Parceira` é o
conceito de negócio (dados, contrato, histórico); "Influenciadora" é o papel/ator que acessa
o Portal em nome dessa Parceira. *(`CONTRATO_SOBERANO.md` §6.1)*

**Cadastro** — entidade de entrada; candidata a promoção para `Parceira`. Nasce inativa;
ativação é sempre decisão manual da equipe. *(`CONTRATO_SOBERANO.md` §6.2; PRD RN-01)*

**Colaboração Mensal** — agregado raiz que representa o encontro `Parceira × MesReferencia`;
contém o Snapshot Comercial congelado no momento da compilação; materializada por Briefing,
Entrega, Envio e Pagamento. Termo canônico desde `knowledge/Arquitetura/ADR-003` (linguagem
ubíqua legada) — substitui "Ciclo Mensal", que é **termo banido**; formalizada como agregado
canônico de código (FK real, snapshot imutável) por `ADR-016` (`ARCHITECTURAL_DECISIONS.md`,
2026-07-29). *(`CONTRATO_SOBERANO.md` §4/§6.3; `knowledge/Arquitetura/ADR-003`; `ADR-016`)*

**Campanha** *(conceito de produto/UI, não de domínio nem de banco — desde `ADR-023`)* —
panorama agregado de leitura sobre toda a operação corrente do Criativo Dodô (Parceiras
ativas, Entregas, aprovações pendentes, financeiro da competência atual); hierarquicamente
**acima** de `Colaboração Mensal`, nunca sinônimo dela. Hierarquia oficial: `Campanha
(panorama) → Parceiras → Colaboração Mensal → Entrega → Material → Publicação`. Nunca vira
`type`, tabela ou campo de banco — é rótulo de tela ("Mesa da Campanha", `/admin/campanha`) e
de função de leitura (`calcularPanoramaCampanha`), que reaproveita os indicadores já
calculados para Entrega/Pagamento sem duplicar regra de negócio. Não confundir com o sentido
banido de "Campanha" como sinônimo do agregado mensal (ver Termos banidos), nem com o
`Campanha` do vocabulário legado do Sistema B (entidade com ciclo de vida próprio, nunca
implementada neste repositório — ver seção seguinte). *(`ARCHITECTURAL_DECISIONS.md`
`ADR-023`)*

**MesReferencia** — Value Object que representa o eixo temporal da competência, formato
`AAAA-MM`, ordenável e imutável. *(`CONTRATO_SOBERANO.md` §5; `ADR-002`)*

**Compilador do Mês** — serviço de domínio que materializa, para um dado `MesReferencia`,
uma `Colaboração Mensal` por Parceira Ativa. Existe como conceito de domínio mesmo sem
coluna física correspondente. *(`ADR-002`; `CONTRATO_SOBERANO.md` §3)*

**Snapshot Comercial da Colaboração** — fotografia imutável dos Termos Comerciais Vigentes
no ato da compilação do mês; garante que alteração posterior na Condição Comercial da
Parceira não afete competências já compiladas. *(`ADR-002`)*

**Briefing** (ou **Briefing da Colaboração**) — registro por formato (Reel/Carrossel/
Stories 1/Stories 2) com look, data de entrega, data de postagem e orientação criativa; 1:1
por Colaboração Mensal, até 4 blocos por formato. Data de aprovação interna é sempre
calculada automaticamente (postagem − 7 dias, avançada até o próximo dia útil do
**calendário operacional** — fim de semana, feriado nacional/estadual/municipal aplicável à
operação, ou ponto facultativo adotado oficialmente pela Criativo Dodô; critério
exclusivamente operacional, nunca a classificação jurídica), nunca editável manualmente.
*(`CONTRATO_SOBERANO.md` §4; SPEC-009 v1.2; PRD RN-04 — regra-base, superada quanto à
heurística de sexta-feira; ADR-014)*

**Entrega** — unidade de conteúdo contratada num formato; uma por unidade contratada.
Máquina de 4 estados: `AguardandoMaterial → EmRevisao → Aprovado → Publicado` (terminal,
arquiva automaticamente). Termo canônico desde `ADR-012` — substitui **"Ativação"**, que é
**termo banido** para este conceito (ressalva: "ativação"/"Ativa" referente ao vínculo da
Parceira, RN-01, é conceito diferente e **não** é afetado por esse banimento). *(SPEC-012;
`ADR-012`)*

**Envio** — registro do envio físico do produto a uma Parceira; duas máquinas de estado
independentes (revisão de dados: `AguardandoConfirmacao → Confirmado`; jornada física:
`Pendente → Expedido → Entregue/Cancelado`). Termo canônico desde `ADR-012` — substitui
**"Fluxo Logístico"**/**"EnvioLogistico"**, que são **termos banidos**. PII (endereço/PIX)
nunca é persistida na própria tabela de Envio — sempre lida ao vivo do cadastro (INV-04).
*(SPEC-016; `ADR-012`; `CONTRATO_SOBERANO.md`)*

**Pagamento** (ou **Obrigação Financeira da Colaboração**) — valor devido pela competência;
enum `EmAberto → Aprovado → Pago` (terminal, arquiva automaticamente). Avulsos são
permitidos fora do ciclo padrão e não passam pelo gate de elegibilidade. *(SPEC-020;
`CONTRATO_SOBERANO.md` §4)*

**Documento** — Contrato individual ou Briefing formal, gerado a partir de Parceira +
Briefing; Contrato só para Parceiras `Ativa`, Briefing formal só para as sinalizadas "SIM".
*(SPEC-023)*

**Arquivamento** — transição para estado terminal e imutável (competência "selada"),
automática por estado terminal (Publicado/Pago/Entregue) ou manual em lote. *(SPEC-034;
`CONTRATO_SOBERANO.md` §6.4)*

**Histórico** — registro arquivado de Entregas/Pagamentos, somente leitura, consultável por
período no Portal (SPEC-030). *(`CONTRATO_SOBERANO.md` §6.4; SPEC-030)*

---

## Value Objects (PII — nunca expostos em log)

**ChaveInfluenciadora** — identificador relacional oficial (`INFLU_KEY`) da Parceira.

**PIX** — chave de recebimento de pagamento; PII.

**CNPJ** — identificador fiscal da Parceira; PII.

**Endereco** — Value Object resolvido por CEP; PII. Falha do serviço de CEP não bloqueia
salvar os demais dados (degradação sem bloqueio).

**CondicaoComercial** — valor, entregáveis (quantidades por formato), prazo/canais de uso de
imagem — fonte única de verdade sobre o que foi contratado com a Parceira.

---

## Eventos de domínio (Contrato Soberano §8)

`CadastroRecebido`, `ParceiraPromovida`, `MesCompilado`, `BriefingPublicado`,
`ConteudoEnviado`, `ConteudoAprovado`, `ProdutoDespachado`, `ProdutoEntregue`,
`PagamentoLiberado`, `PagamentoConfirmado`, `CompetenciaArquivada`, `ConteudoPublicado`
(payload `entregaId`, `dataArquivamento`, adotado em 2026-07-15 para a transição
Publicado→arquivamento da Entrega).

---

## Termos oficialmente banidos do domínio

| Termo banido | Substituído por | Fonte |
|---|---|---|
| `Ciclo` / `Ciclo Mensal` | `Colaboração Mensal` | `CONTRATO_SOBERANO.md` §2; `knowledge/Arquitetura/ADR-003` |
| `Plano de Colaboracao` | (sem substituto único — decompor em Briefing/Entrega/Envio/Pagamento) | `CONTRATO_SOBERANO.md` §2 |
| `Campanha` (como sinônimo do agregado de domínio/banco `Colaboração Mensal`) | `Colaboração Mensal` | Banimento original: `knowledge/Arquitetura/ADR-003` (rejeitada como "terceiro termo", herança de marketing legado, PRD §6.2); reafirmado por `ADR-023` (`ARCHITECTURAL_DECISIONS.md`, 2026-08-05) — nota: desde `ADR-023`, "Campanha" passa a existir oficialmente como **conceito de produto/UI** (panorama de leitura acima de `Colaboração Mensal`, ver verbete próprio acima), nunca como tipo/tabela/campo de banco; esse uso não reabre o banimento aqui registrado. "Campanha" também reaparece com um terceiro sentido, não reconciliado, no vocabulário legado do Sistema B — ver seção seguinte |
| `Ativação` (agregado de conteúdo) | `Entrega` | `ADR-012` |
| `Fluxo Logístico` / `EnvioLogistico` | `Envio` | `ADR-012` |

**Ressalva importante:** "ativação"/"ativar"/"Ativa"/"Inativa" referentes ao **vínculo da
Parceira** (RN-01, SPEC-001/002) são um conceito diferente, homônimo, e **não** estão
banidos — continuam corretos nesse uso específico. *(`ADR-012`)*

---

## Vocabulário divergente — Sistema B (Laravel, código ausente deste repositório)

Estes termos **não fazem parte** da linguagem ubíqua oficial do Contrato Soberano, mas
aparecem em documentação do Sistema B como nomes de modelo equivalentes (não idênticos) a
conceitos acima. Listados aqui para rastreabilidade — **a reconciliação entre os dois
vocabulários é uma pendência aberta** (`PORTAL_BRIEFING.md` §13.2).

| Termo Sistema B | Equivalência aproximada no Contrato Soberano | Observação |
|---|---|---|
| `Campanha` | (sem equivalente direto — mais próximo de um agrupamento acima de `Colaboração Mensal`) | `Campanha` tem ciclo de vida próprio (`PLANEJADA→ATIVA→ENCERRADA|CANCELADA`) que `Colaboração Mensal` não tem. **Atenção:** não confundir com o `Campanha` de produto/UI sancionado por `ADR-023` (ver verbete acima) — este (Sistema B) é entidade de domínio real, com tabela e máquina de estados própria, nunca implementada neste repositório; aquele é só rótulo de tela/agregação de leitura, sem entidade de banco |
| `ParticipacaoNaCampanha` | `Colaboração Mensal` (aproximado) | Guarda termos comerciais + `congelado_em` (`ADR-018`) |
| `Material` | Conteúdo de uma `Entrega` | Estados diferentes: `PENDENTE→APROVADO|REPROVADO` vs. os 4 estados de `Entrega` |
| `Marca` | — (conceito novo, sem equivalente no Contrato Soberano) | Entidade de tenant externo, não modelada no Sistema A |
| `User` | `Usuario`/`Identidade` (SPEC-035, também um bounded context à parte) | Ambos são conceitos de identidade separados do agregado de negócio |

---

## Vocabulário de Identidade e Acesso (SPEC-035)

**Usuario** / **Identidade** — bounded context próprio, distinto do agregado soberano
`Parceira`; referencia `Parceira` só por `INFLU_KEY` (ligação fraca, nunca duplica atributos
de negócio).

**`sub` (SUB_PROVIDER)** — identificador imutável e permanente retornado pelo provedor de
identidade federado (Google); chave primária de `SIS_IDENTIDADES`. Nunca uma string mutável
(e-mail/nome) pode ser usada como chave relacional.

**Estados de conta:** `PENDING` (aguardando aprovação) → `ACTIVE` (aprovado, acesso
liberado) → pode ir a `INACTIVE` (suspenso, pode retornar a `ACTIVE`) ou, a partir de
`PENDING`, a `REJECTED` (terminal).

**Papéis (`PAPEL_ATOR`):** `ADMINISTRADOR`, `MARCA`, `INFLUENCIADORA` — um usuário só pode
ter um papel (RN-05 de SPEC-035).

**RBAC+SBAC** — modelo de autorização que combina Controle de Acesso Baseado em Papéis
(RBAC) com Controle de Acesso Baseado em Estados (SBAC): a concessão de privilégios depende
tanto do papel quanto do estado lógico da conta.

---

## Atores e papéis (ver `PORTAL_BRIEFING.md` §4 para detalhamento completo)

**Influenciadora / Parceira** — usuária autenticada do Portal; opera sobre os próprios
dados.

**Administrador** — equipe interna com privilégios globais; único papel que
aprova/rejeita/ativa/inativa contas.

**Marca** — empresa parceira comercial/cliente; **definido em SPEC-035, não implementado em
nenhuma fonte**, escopo pendente de decisão.

**Assessoria** — agência que representaria influenciadoras; **cogitada no backlog, não
implementada em nenhum sistema**.

---

## Nomenclatura de projeto (não é vocabulário de domínio, mas afeta toda a documentação)

**TEAR** — codinome técnico interno do projeto, hoje **legado**; aparece corretamente em
documentação histórica, mas não deve ser usado em conteúdo novo. *(`ADR-020`)*

**DODÔ** — nome oficial atual do projeto, comercial e técnico, substituindo "TEAR" e
"Estúdio Elã"/"ELÃ". *(`ADR-020`)*

**Influencia** — nome da plataforma (`plataforma Influencia`), **não** aposentado pela
decisão acima — continua em uso independentemente do nome do projeto.
