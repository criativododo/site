# USER_JOURNEYS.md

> Jornadas de uso documentadas para cada perfil identificado no projeto (ver
> `PORTAL_BRIEFING.md` §4). Baseadas nas SPECs e no PRD — nada inventado. Onde uma jornada
> não é descrita em nenhuma fonte (Marca), isso é declarado explicitamente.

---

## 1. Influenciadora / Parceira — jornada completa no ecossistema

Esta é a jornada de ponta a ponta documentada no PRD/SPECs (`PORTAL_BRIEFING.md` §3 do
briefing original de arquitetura). A Parceira participa ativamente só nos passos marcados
**(Portal)** — os demais são conduzidos pela equipe/sistema e afetam o que ela vê depois.

```
Cadastro (formulário externo)
   ↓  nasce STATUS = OFF (RN-01)
Ativação pela equipe (Inativa → Ativa; edição de Condição Comercial)
   ↓  só Parceiras Ativa entram no próximo passo
Abertura do ciclo mensal ("Compilação do Mês")
   ↓  gera Colaboração Mensal + Snapshot Comercial congelado
Briefing publicado pela equipe (por formato: Reel/Carrossel/Stories)
   ↓
(Portal) Login — SPEC-025/035
   ↓
(Portal) Ver pendências do mês — SPEC-027 UC-027.01
   ↓
(Portal) Ler briefing do item — SPEC-027 UC-027.02
   ↓
Produção do conteúdo (fora do sistema)
   ↓
(Portal) Enviar material — SPEC-027 UC-027.03 → Entrega passa a EmRevisao
   ↓
Revisão e aprovação pela equipe → Entrega: EmRevisao → Aprovado → Publicado
   ↓  ao publicar, arquivamento automático (RN-08)
Logística: equipe confirma endereço, registra envio físico (se aplicável)
   ↓
Pagamento: Obrigação Financeira nasce EmAberto
   ↓  gate de elegibilidade (todas as Entregas da competência Aprovado/Publicado — Q-04,
   ↓  ver contradição registrada em PORTAL_BRIEFING.md §13.5)
Pagamento: EmAberto → Aprovado → Pago (arquivamento automático)
   ↓
(Portal) Ver financeiro do período (previsto x pago) — SPEC-030 UC-030.01
   ↓
(Portal) Consultar histórico — SPEC-030 UC-030.02
   ↓
(Portal, a qualquer momento) Ver/editar perfil (PIX, e-mail, endereço) — SPEC-032
```

**Pontos de decisão/estado relevantes para UX:**
- Se a Parceira for inativada com pendências abertas, o comportamento **não está
  definido** (pendência Q-05 — não presumir).
- Sessão expira após 6h de inatividade (RN-18) — a jornada de upload (Feature 2.3 do
  backlog) precisa lidar com reautenticação no meio de um envio longo (CB-01 de SPEC-027).
- Falha no serviço de CEP durante a edição de perfil não deve interromper a jornada de
  salvar os demais dados (RN-02 de SPEC-032).

---

## 2. Administrador — jornada completa no ecossistema

```
Cadastro externo chega → aparece na área de gestão
   ↓
Administrador ativa/inativa Parceira; edita Condição Comercial
   ↓
Administrador (ou processo automático) abre a Compilação do Mês
   ↓
Administrador registra o Briefing por formato para cada Colaboração Mensal
   ↓  data de aprovação interna é sempre calculada automaticamente (RN-04), nunca editada
Administrador acompanha produção (Entregas em EmRevisao)
   ↓
Administrador aprova ou rejeita o material enviado
   ↓  Aprovado → Publicado (arquivamento automático)
Administrador confirma dados logísticos e registra rastreio
   ↓
Administrador libera pagamento (EmAberto → Aprovado → Pago), respeitando o gate de
elegibilidade (ver contradição Q-04/P0-1)
   ↓
Administrador gera documentos (Contrato — só Parceiras Ativa; Briefing formal — só
sinalizadas "SIM")
   ↓
Encerramento/arquivamento da competência (automático por estado terminal, ou manual em
lote — pode "selar" a competência como imutável)
```

**Se o modelo federado de identidade (SPEC-035) for adotado**, o Administrador também:

```
Acessa a área de moderação de contas
   ↓
Revisa cadastros no estado Pendente (Marca e/ou Influenciadora)
   ↓
Aprova → conta vira Ativa (dispara evento, libera acesso operacional)
   ou
Rejeita → conta fica bloqueada permanentemente para aquele registro
```

**Nota sobre papéis internos:** nenhuma fonte descreve papéis diferenciados dentro da
equipe além de "Administrador" — o PRD marca isso explicitamente como fora de escopo (§12).
Não presumir jornadas separadas para "Operador"/"Financeiro"/etc.

---

## 3. Marca (ator) — jornada **não documentada como implementável**

Nenhuma fonte lida descreve uma jornada operacional completa para o ator Marca dentro do
Portal ou do sistema administrativo — apenas a intenção de escopo (SPEC-035 §4.2): "acesso
restrito aos próprios dados, campanhas, briefings e orçamentos".

A única jornada parcialmente descrita, exclusiva do fluxo de Identidade e Acesso (se o
modelo federado for adotado), é:

```
Marca faz login federado pela primeira vez
   ↓
Preenche formulário nativo de onboarding corporativo (dados da empresa)
   ↓  conta nasce Pendente
Aguarda aprovação do Administrador
   ↓
Conta vira Ativa → pode gerenciar perfil corporativo
```

Isso é o único trecho documentado (Cap. 5 da SPEC-035) — o restante da jornada (criar
campanha, ver briefings, acompanhar orçamento) **não é descrito em nenhuma fonte** porque o
próprio SPEC-035 marca o ator Marca como "decisão de escopo de produto que só o responsável
do projeto pode tomar", não implementável sem essa decisão (ver `PORTAL_BRIEFING.md` §13.4).
**Não inventar os passos intermediários dessa jornada.**

---

## 4. Papéis sem jornada definida

- **`GESTOR_MARCA`** — citado como valor de enum no Sistema B, sem nenhuma tela ou fluxo
  próprio documentado. Jornada: **PENDENTE**.
- **`Assessoria`** — cogitada no backlog V2.6 como agência que representaria influenciadoras;
  nenhuma jornada, tela ou regra de recebimento de pagamento foi documentada. Jornada:
  **PENDENTE**.
