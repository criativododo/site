# TEAR — Transição do Sistema Legado para TEAR V2

> Narrativa oficial de transição, registrada em 2026-07-20 pelo responsável
> do projeto. Este documento é a referência oficial até que seja
> formalizada em ADR/TASK_ROUTER do repositório principal.

## Contexto

O TEAR original foi desenvolvido utilizando Google Sheets + Google Apps
Script. Ele permitiu operar campanhas de influenciadoras, porém apresentava
limitações de escala, manutenção e governança. O TEAR V2 foi criado como
uma nova plataforma utilizando arquitetura web moderna.

## Sistema A — Legado

Tecnologia: Google Sheets, Google Apps Script, Google Drive.

Papel:
- operação atual;
- histórico;
- referência de regras de negócio.

## Sistema B — TEAR V2

Tecnologia: Backend Laravel, Frontend React, banco relacional, APIs.

Papel:
- nova plataforma operacional;
- evolução futura do TEAR.

## Diferença principal

O legado era orientado a planilhas. O TEAR V2 é orientado a domínio:

```
Influenciadora
↓
Campanha
↓
Participação
↓
Briefing
↓
Material
↓
Aprovação
↓
Pagamento
```

## Regra fundamental

O TEAR V2 não replica a planilha. Ele transforma o conhecimento operacional
existente em um sistema estruturado.

---

## Decisão de governança (2026-07-20)

**`tear-v2-app` é o sucessor planejado do TEAR legado — não é protótipo
descartável nem esforço paralelo permanente.**

- O Sistema A (GAS) permanece a operação atual; nenhuma migração de dados
  foi iniciada, e nenhuma data foi definida para isso. Ele não será evoluído
  como produto principal a partir desta decisão — novas capacidades de
  negócio devem ser construídas no Sistema B.
- O Sistema A continua sendo a referência de domínio: o vocabulário e as
  regras de negócio de `CONTRATO_SOBERANO.md`, `docs/PRD.md` e das SPECs
  seguem valendo como fonte do que o negócio precisa, mesmo quando o
  Sistema B modela isso de forma diferente (ver `DOMAIN_MODEL.md` para
  divergências já conhecidas).
- Prioridade atual: consolidar documentação, arquitetura e mapa do sistema
  (`ARCHITECTURE.md`, `DOMAIN_MODEL.md`, `BUSINESS_FLOWS.md`, nesta pasta)
  antes de retomar desenvolvimento de novas features.

## Pendências de governança conhecidas (não resolvidas por este documento)

- O `docs/_workspace/TASK_ROUTER.md` do repositório principal ainda descreve
  `tear-v2-app` como "esforço paralelo" (§15) — precisa ser atualizado para
  refletir a decisão de sucessor planejado registrada aqui.
- Nenhum ADR formal do sistema GAS documenta esta decisão de sucessão;
  recomenda-se abrir um ADR quando o repositório principal for tocado de
  novo, para não depender só deste arquivo em `knowledge/`.
