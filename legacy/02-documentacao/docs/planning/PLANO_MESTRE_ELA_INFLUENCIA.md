# PLANO MESTRE — ELÃ | influência

**Versão:** 1.0 do plano · 2026-07-21
**Ponto de chegada:** lançamento oficial do ELÃ | influência 1.0 em **15/01/2027**
**Documentos irmãos:** `ELA_INFLUENCIA_ENTREGA_1_ANALISE_ESTRATEGICA.md` (por quê) e `ELA_INFLUENCIA_ENTREGA_2_PLANO_EXECUTIVO.md` (fases e portões). Este documento é a camada operacional: calendário realista, subfases, entregas, critérios de aceite e auditoria crítica.

**Governança deste documento:**
- Substitui, como plano vigente, os anteriores `ROADMAP_MESTRE_TEAR_V2.md` e `TEAR_V2.5_PRODUCTIZACAO_ROADMAP.md` (removidos da árvore ativa). `PLANO_FINAL_CONGELAMENTO_OPERACIONAL.md` também removido — decisão extraída para `docs/adrs/ADR-018-congelamento-de-participacao-trava-simples.md`.
- Estado de execução do dia a dia continua no `TASK_ROUTER.md`. Este plano não vira lista de tarefas: vira bússola. Revisar ao cruzar cada portão, não semanalmente.

---

# 1. O PRODUTO EM 15/01/2027 (planejamento reverso: o destino)

No dia do lançamento, o ELÃ | influência é verdadeiro em cada uma destas frases:

**Evidência**
- A operação Jescri roda 100% dentro dele há pelo menos 4 ciclos mensais.
- As influenciadoras do squad usam o portal como canal principal de briefing, entrega e financeiro.
- Uma empresa externa completou um ciclo mensal inteiro no produto sem intervenção manual no banco.

**Produto**
- Identidade visual ELÃ | influência aplicada em admin, portal e e-mails.
- Onboarding funcional: convite → primeiro acesso → primeira ação, sem suporte manual.
- Textos, empty states e mensagens de erro revisados; nenhuma tela "Em construção".
- FAQ, guia do operador, guia da influenciadora e changelog públicos.

**Engenharia**
- Infra paga mínima ativa (a partir de novembro), backup externo ao provedor, restore testado mais de uma vez, monitoramento de uptime e Pulse.
- Suíte de testes verde incluindo teste de isolamento entre marcas.
- Escopo congelado desde o 0.9: nenhuma feature entrou em dezembro/janeiro.

**Negócio**
- Preço e modelo de licenciamento publicados.
- Termos de uso, política de privacidade e consentimento LGPD ativos.
- Resposta escrita sobre isolamento de dados entre marcas concorrentes.
- Situação fiscal resolvida para faturar (decisão CNPJ/regime tomada com contador).
- Landing page, apresentação e vídeo demonstrativo com telas e números reais.

**O que o 1.0 deliberadamente NÃO é:** multi-tenant self-service em escala, integração com terceiros, IA, app mobile, central de ajuda robusta, equipe de suporte. É um produto sólido, estreito e provado.

---

# 2. CALENDÁRIO MESTRE (de trás para frente)

A unidade de validação é o ciclo mensal da operação. De hoje até 15/01 existem 5 ciclos completos (ago, set, out, nov, dez). Dezembro vale meio ciclo de capacidade (pico Jescri + festas). O plano usa 4 ciclos e trata dezembro como buffer.

| Janela | Macrofase | Ciclo mensal | Versão no fim |
|---|---|---|---|
| 21/07 a ~10/08 | A · Go Live interno | preparação | 0.1 |
| ago | B · Operação real (ciclo 1) | agosto | 0.2 |
| set | B/C · Ciclo 2 + primeiras influs no portal | setembro | 0.3 (se adoção provada) |
| out | C/D · Squad completo + produtização + tenancy mínima + fechar piloto | outubro | 0.5 |
| nov | E · Ciclo do piloto externo + infra paga | novembro | 0.7 → 0.9 (freeze ~05/12) |
| dez | Buffer · correções + material comercial | dezembro (leve) | 0.9 estável |
| 01 a 15/01 | F · Empacotamento e lançamento | · | **1.0 em 15/01** |

**Portões de decisão (go/no-go):**
- **G1 (~31/08):** ciclo 1 fechou no sistema? planilha aposentada? → autoriza influs.
- **G2 (~30/09):** adoção das primeiras influs ≥ meta? → autoriza squad completo + produtização pesada.
- **G3 (~31/10):** piloto contratado + tenancy mínima testada? → autoriza ciclo externo.
- **G4 (~05/12):** piloto fechou ciclo? → freeze 0.9. Só correção depois disso.
- **G5 (05/01):** checklist final verde? → anúncio de 15/01 confirmado.

**Regra dos portões:** portão não cruzado desloca o plano inteiro, nunca comprime a fase seguinte. O que absorve atraso é, nesta ordem: escopo da produtização (D), profundidade do material de marketing (F), e por último a data. Ver plano B na auditoria (§9).

---

# 3. MACROFASE A — GO LIVE INTERNO (21/07 a ~10/08)

Objetivo, limites e portão: Entrega 2, Fase A. Subfases operacionais:

**A1 · Infraestrutura de produção** (antes de tudo; é o caminho crítico)
- Variáveis reais (`APP_URL`, `SANCTUM_STATEFUL_DOMAINS`, `FRONTEND_URL`, `SESSION_DOMAIN`).
- SMTP real dentro do custo zero e teste de entrega em caixa real (inbox, não spam). Lacuna: qual provedor os ativos atuais oferecem (Locaweb inclui e-mail; verificar limites de envio).
- Service account + credenciais do Google Drive; upload real testado.
- Deploy Locaweb conforme `ARQUITETURA_PRODUCAO.md`; cron e agendamentos verificados no ambiente real.
- Backup agendado + **um restore completo testado**.
- Aceite A1: sistema no domínio definitivo com HTTPS; e-mail chega; upload funciona; restore provado.

**A2 · Correções P1 do QA** (paralelo a A1)
- Link de material do fallback local corrigido.
- Sidebar: remover os 9 itens "Em construção" do menu; navegação reflete só o que existe.
- Aceite A2: QA de navegação sem beco falso.

**A3 · Migração de dados** (depois de A1; precisa do banco de produção)
- Definir corte: o que migra (parceiras ativas, condições comerciais vigentes) e o que fica na planilha como arquivo morto (histórico antigo).
- Script de importação com relatório de rejeições; limpeza dos dados sujos que aparecerem.
- Conferência por amostragem contra a planilha.
- Aceite A3: base real no Postgres, amostragem sem divergência, rejeições documentadas.

**A4 · Congelamento formal do legado** (paralelo, 1 hora de trabalho)
- Nota no `TASK_ROUTER.md`: `src/` GAS é somente referência; nenhuma versão nova; item "validar login OAuth /exec" encerrado sem execução.
- Aceite A4: registro escrito.

**Dependências:** A3 depende de A1. A2 e A4 paralelos. Nada aqui depende de UX/Design/Negócio.

---

# 4. MACROFASE B — OPERAÇÃO REAL INTERNA (agosto, ciclo 1; setembro, ciclo 2)

Objetivo e limites: Entrega 2, Fase B. Subfases:

**B1 · Ciclo de agosto inteiro no sistema**
- Abrir mês, briefing, materiais, aprovações, pagamentos: tudo dentro. Planilha proibida (se precisar dela, isso é um achado P0, não um atalho).
- Lista única de fricções, triada semanalmente: corrigir / aceitar / adiar.

**B2 · Instrumentação mínima de uso**
- Eventos básicos: login, entrega enviada, aprovação, pagamento confirmado. GA4 ou tabela própria simples: decidir pelo mais barato de manter (sugestão: tabela própria; GA4 no produto fica pós-1.0).
- Aceite: dá para responder "quantas entregas entraram pelo portal este mês?" com um número.

**B3 · Trilha Negócio (começa aqui, corre em paralelo até novembro)**
- ADR de tenancy: instância única com isolamento por marca (caminho natural do modelo atual: `marcas` + scoping + teste de isolamento) versus instância por cliente. Decidir em agosto; recomendação técnica: instância única com scoping por marca, porque o modelo de dados já aponta para isso e uma pessoa não opera N instâncias.
- Hipótese de preço em uma página (âncoras: valor/marca/mês + faixa por nº de influenciadoras ativas; números são decisão sua, ver lacunas §10).
- Contador: limite MEI, nota de SaaS, necessidade ou não de CNPJ separado do estúdio.
- INPI: busca de anterioridade da marca do produto.
- Aceite B3: quatro decisões registradas por escrito até o fim de setembro.

**Critérios do portão G1 (fim de agosto):** ciclo 1 fechado sem planilha; fricções triadas; ADR de tenancy decidido.

---

# 5. MACROFASE C — INFLUENCIADORAS NO PORTAL (setembro em ondas; outubro squad completo)

Objetivo e limites: Entrega 2, Fase C. Subfases:

**C1 · Onda 1 (setembro): 3 a 5 influenciadoras**
- Seleção: as de melhor relacionamento (tolerância a atrito) misturadas com 1 ou 2 menos engajadas (teste honesto).
- Convite → primeiro acesso → entrega pelo portal. Você acompanha cada primeiro acesso e anota onde travou.
- Consentimento LGPD no primeiro acesso.
- Meta definida ANTES de abrir (sugestão: 70% das entregas da onda pelo portal; o número final é seu).

**C2 · Correções de adoção (setembro/início de outubro)**
- Só fricção real trava influenciadora; régua: mais fácil que o WhatsApp.
- Comunicação: mensagens de transição pelo canal atual (skill mensagens-influ) anunciando o portal como caminho oficial.

**C3 · Onda 2 (outubro): squad completo**
- Todas as influs ativas do ciclo de outubro convidadas; WhatsApp vira exceção documentada, não canal paralelo permanente.

**Critérios do portão G2 (fim de setembro):** meta de adoção da onda 1 atingida; primeiro acesso sem suporte manual; zero incidente de dados. **Se G2 falhar:** parar, simplificar o portal, repetir onda 1 em outubro; produtização (D) encolhe; ver plano B.

---

# 6. MACROFASE D — PRODUTIZAÇÃO (outubro, com cauda em novembro)

Objetivo e limites: Entrega 2, Fase D. Timebox rígido: outubro. Subfases:

**D1 · Identidade e superfícies**
- Design system Elã aplicado: admin, portal, e-mails transacionais.
- Prioridade de aplicação: o que o piloto e as influs veem primeiro (login, dashboard, briefing, entrega, e-mails). O resto é cauda.

**D2 · Onboarding e microcopy**
- Fluxo convite → primeiro acesso → primeira ação redondo para os dois papéis.
- Empty states, mensagens de erro, textos revisados (tom Elã).

**D3 · Tenancy mínima (código)**
- Implementação do ADR de agosto no grau que o piloto exige: usuário ↔ marca, scoping de consultas, **teste automatizado de isolamento entre marcas** (este teste é inegociável; é a resposta técnica à pergunta de confiança do piloto).

**D4 · Documentação e legal**
- FAQ, guia do operador, guia da influenciadora, changelog iniciado.
- Termos de uso + política de privacidade publicados. Decisão sua: revisão jurídica contratada ou template assumido como risco documentado (lacuna §10).

**D5 · Fechamento do piloto (negócio, começa em setembro na verdade)**
- Lista de candidatas (sua rede), abordagem, proposta de piloto: 1 ciclo, concierge, preço simbólico, carta de intenção simples.
- Aceite D5: contrato de piloto assinado até 31/10.

**Critérios do portão G3 (fim de outubro):** teste de estranho (1 a 2 pessoas completam fluxos sem ajuda); identidade nas superfícies críticas; termos publicados; teste de isolamento verde; piloto assinado.

---

# 7. MACROFASE E — PILOTO EXTERNO (novembro) E FREEZE (início de dezembro)

Objetivo e limites: Entrega 2, Fase E. Subfases:

**E1 · Upgrade de infraestrutura (primeira semana de novembro)**
- Gatilho combinado: dado de terceiro entra no banco, custo zero expira.
- Mínimo: VPS pequeno ou upgrade de plano com backup externo ao provedor (dump diário para storage fora da Locaweb), monitoramento de uptime, restore testado de novo no ambiente novo. Orçamento: decisão sua (lacuna §10); a ordem de grandeza de mercado é dezenas de reais por mês, não centenas.
- Se a decisão for permanecer na Locaweb: backup externo e restore testado continuam obrigatórios; o que não pode é dado de cliente externo com backup "a confirmar".

**E2 · Onboarding concierge do tenant piloto**
- Você configura junto: marca, campanhas, influenciadoras do piloto, briefings.
- Tudo o que você precisar fazer "na mão" vira anotação de produto (é o backlog real do pós-1.0).

**E3 · Ciclo de novembro do piloto**
- Meta: fechar o ciclo sem você tocar no banco. Toques manuais são contados e classificados.
- Feedback estruturado no fim (entrevista curta + métricas de uso do tenant).

**E4 · Freeze 0.9 (até ~05/12)**
- Escopo do 1.0 fechado por escrito. Depois disso: só correção.

**Critérios do portão G4:** ciclo do piloto fechado; zero toques no banco (ou exceções aceitas por escrito); feedback triado; infra paga ativa; freeze declarado.

---

# 8. DEZEMBRO (buffer) E MACROFASE F — LANÇAMENTO (01 a 15/01)

**Dezembro, deliberadamente leve:**
- Correções do freeze. Operação Jescri de pico rodando no produto (que, aliás, é o melhor teste de stress que você tem).
- Material comercial produzido com calma: landing page, apresentação institucional, vídeo demonstrativo curto com telas reais e números do piloto.
- Política comercial escrita: preço, o que inclui, canal de suporte, SLA honesto de uma pessoa (ex.: resposta em 1 dia útil).
- Nada estrutural. Se sobrar energia, descanso também é item do plano: janeiro exige você inteiro.

**F · 01 a 15/01:**
- Checklist final: segurança (headers, rate limit, permissões), restore, uptime, revisão dos textos públicos.
- Changelog público e roadmap público curto (3 a 5 itens honestos).
- G5 em 05/01: go/no-go do anúncio.
- 15/01: publicação da landing, anúncio nos canais do Estúdio Elã, abertura de pipeline (lista de interessados, demo agendável).

---

# 9. AUDITORIA CRÍTICA DO PRÓPRIO PLANO

**O que está otimista demais**
- Go Live em ~3 semanas assume que a Locaweb não esconde surpresas (fila, cron, memória, limites de e-mail). Primeiro deploy real é o maior desconhecido do plano inteiro.
- Adoção das influs em uma onda de setembro. Comportamento de terceiros não obedece calendário; é o item com maior variância.
- Piloto assinado até 31/10 depende de você ter candidata na rede hoje. Se a resposta for "não sei", a busca começa em SETEMBRO, não em outubro.

**O que pode atrasar (e o que absorve)**
- Migração de dados sujos (absorve: corte de escopo do histórico migrado).
- Adoção baixa em G2 (absorve: produtização encolhe para o mínimo, repete-se a onda em outubro, piloto desliza para dezembro SOMENTE se o cliente piloto aceitar operar em dezembro; senão, plano B abaixo).
- Piloto não fechado (plano B).

**Plano B, dito com clareza:** se em G3 não houver piloto assinado, o 15/01 se mantém, mas o lançamento muda de natureza: 1.0 lançado com evidência Jescri + squad (caso de uso próprio documentado como estudo de caso) e o piloto vira meta de fevereiro, com o discurso comercial de "early access". É pior, é vendável, e é mil vezes melhor que empurrar a data em silêncio ou inflar o produto em dezembro.

**O que está faltando no seu pedido original (e este plano adiciona)**
- Piloto externo antes do 1.0.
- Gatilho objetivo para o fim do custo zero de infra.
- Teste de restore como critério recorrente.
- Decisão fiscal/societária antes de cobrar.
- Dezembro tratado como meio ciclo.

**Onde existe desperdício a evitar**
- Documentação interna: 5 planos sobrepostos hoje. Este substitui; os demais para archive. Nova regra: nenhum documento novo de planejamento até o 1.0; mudanças editam ESTE arquivo.
- Polimento visual antes de G2: proibido pelo próprio plano.
- Histórico completo migrado no Go Live: desnecessário; planilha morta serve de arquivo.

**Onde há risco de overengineering**
- Tenancy: implementar mais isolamento do que o piloto exige (a tentação de "já deixar multi-tenant de verdade"). O ADR limita; o teste de isolamento define o suficiente.
- Observabilidade: Pulse + uptime bastam. Nada de stack de monitoramento antes de existir cliente pagante.
- Instrumentação: tabela própria simples ganha de analytics parrudo.

**Onde você está tentando fazer mais do que precisa**
- "Acessibilidade, central de ajuda, treinamento, vídeo institucional" como pacote pré-1.0. Cortado para: básico de acessibilidade, FAQ de uma página, guias curtos, um vídeo de tela gravada. O resto é pós-1.0 puxado por demanda real.

**O que eu cortaria hoje**
- Qualquer trabalho restante no OAuth do portal GAS.
- Os 9 itens de menu vazios.
- GA4/E-goi/integrações no produto antes do 1.0.
- Papel Marca self-service antes de evidência do piloto.

**Sobre IA (justificativa técnica pedida)**
Mantida integralmente pós-1.0. Motivos: (1) IA introduz não-determinismo num produto cuja proposta atual é confiabilidade de ciclo operacional; o custo de QA de saídas probabilísticas não cabe no orçamento de uma pessoa em 2026; (2) os dados tocados são PII sensível, e enviar PII a APIs de terceiros antes da base LGPD estar madura agrava a Q-09 em vez de resolvê-la; (3) nenhuma dor validada por uso aponta hoje para IA como solução. Exceção que não fere a regra: IA fora do runtime do produto (você usando Claude para rascunhar changelog, FAQ, mensagens) já faz parte da sua operação e não entra no produto.

---

# 10. DECISÕES QUE SÓ VOCÊ PODE TOMAR (lacunas abertas, não inventadas)

| # | Decisão | Necessária até | Fase que trava |
|---|---|---|---|
| 1 | Modelo de licenciamento e faixa de preço | hipótese até fim de setembro | E (cobrar piloto) |
| 2 | Tenancy (recomendação: instância única, scoping por marca) | fim de agosto (ADR) | D3 |
| 3 | CNPJ/regime fiscal para faturar SaaS (com contador) | outubro | E |
| 4 | Registro de marca INPI (busca + pedido) | outubro | F |
| 5 | Candidata(s) a piloto externo | abordagem começa em agosto (há uma agência cogitada, 2026-07-21); proteção via registro de marca + registro de programa no INPI + NDA no contrato de piloto, não patente | E |
| 6 | Orçamento mensal de infra a partir de novembro | outubro | E1 |
| 7 | Meta numérica de adoção das influs (sugestão: 70%) | antes de C1 | G2 |
| 8 | Revisão jurídica de termos/privacidade: contratar ou assumir template | outubro | D4 |
| 9 | Quem é "a equipe" com acesso admin além de você | agosto | B |
| 10 | ~~Remover planos superados da árvore ativa~~ — concluído (2026-07-23) | — | higiene |

---

# 11. RESUMO EXECUTIVO DE UMA TELA

- Ago: Go Live interno + ciclo 1 no sistema. Planilha aposentada. Tenancy decidida.
- Set: ciclo 2 + primeiras influs no portal. Adoção medida. Preço hipotetizado. Busca de piloto.
- Out: squad completo + produtização (timebox) + tenancy mínima + piloto assinado.
- Nov: infra paga + ciclo do piloto concierge.
- Dez: freeze 0.9, correções, material comercial, mês leve.
- 15/01/2027: 1.0 lançado sobre evidência: 4+ ciclos internos, squad no portal, 1 ciclo externo concluído.

Regra de ouro do período: uma frente por vez, portão não cruzado desloca o plano, e na dúvida entre adicionar e simplificar, simplificar.
