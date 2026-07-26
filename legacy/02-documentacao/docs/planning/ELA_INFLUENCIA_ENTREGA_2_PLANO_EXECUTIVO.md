# ELÃ | influência — ENTREGA 2: PLANO EXECUTIVO POR FASES

Data: 2026-07-21
Deriva da Entrega 1 (`ELA_INFLUENCIA_ENTREGA_1_ANALISE_ESTRATEGICA.md`).
Sem datas neste documento: fases e portões. O calendário entra na Entrega 3.

## Estrutura geral

Seis fases, A a F. Cada fase termina num portão: critérios objetivos que autorizam a próxima. Duas trilhas correm em paralelo às fases técnicas:

- **Trilha Negócio/Legal** (decisões de tenancy, preço, CNPJ, marca, LGPD): começa na Fase B e precisa estar concluída antes do portão E.
- **Trilha Produtização** (identidade, UX, textos, e-mails): começa na Fase C e se intensifica na D.

Mapa de versões proposto (substitui a escada 0.1→0.9 por versões amarradas a portões):

| Versão | Significado | Portão |
|---|---|---|
| 0.1 | Go Live interno | saída da Fase A |
| 0.2 | Primeiro ciclo mensal completo no sistema | saída da Fase B |
| 0.3 | Influenciadoras usando o portal de verdade | saída da Fase C |
| 0.5 | Produto com identidade e onboarding | saída da Fase D |
| 0.7 | Piloto externo rodando | dentro da Fase E |
| 0.9 | Release candidate comercial (freeze) | saída da Fase E |
| 1.0 | Lançamento 15/01/2027 | Fase F |

---

# FASE A — GO LIVE INTERNO

**Objetivo:** a operação da Jescri roda no `tear-v2-app` em produção, com dados reais, e a planilha deixa de ser fonte de verdade.

**Por que existe:** todo o resto do plano depende de uso real. Sem Go Live interno não há evidência, só desenvolvimento.

**O que acontece:**
- Fechar os NO-GO do release readiness: variáveis de produção, SMTP real, credenciais Google Drive, deploy Locaweb conforme `ARQUITETURA_PRODUCAO.md`.
- Corrigir os dois P1 do QA (link de material no fallback; sidebar mentirosa: remover itens "Em construção" do menu).
- Construir e executar a migração de dados da planilha V1 para o Postgres (parceiras, condições comerciais, histórico mínimo necessário para operar; decidir o que NÃO migra).
- Congelamento formal do legado GAS: `src/` vira somente leitura, deployment GAS não recebe mais versão.
- Backup agendado + um teste de restore bem-sucedido.
- Smoke test do ciclo em produção com dados reais.

**O que NÃO deve acontecer:** feature nova; refinamento visual; qualquer correção no OAuth do portal GAS; migração de histórico completo se atrasar o portão (histórico pode entrar depois, dado que a planilha permanece como arquivo morto consultável).

**Critérios de conclusão (portão A → B):**
1. Sistema no ar no domínio definitivo, HTTPS, e-mail transacional entregando em caixa real.
2. Dados reais migrados e conferidos por amostragem contra a planilha.
3. Um mês de referência aberto em produção pelo sistema.
4. Restore de backup testado uma vez com sucesso.
5. Legado congelado por escrito (nota no TASK_ROUTER).

**Riscos:** limites da hospedagem compartilhada só aparecem no deploy real (cron, workers de fila, memória); escopo do backup Locaweb "a confirmar"; migração revelar dados sujos na planilha (provável; reservar tempo de limpeza).

**Dependências externas:** acesso Locaweb, DNS do domínio, conta Google (service account do Drive), provedor SMTP dentro da restrição de custo zero.

**Por área:** Código: migrador de dados, P1s. UX: nenhum. Design: nenhum. Infra: quase tudo. Negócio: nenhum. Documentação: runbook de deploy/restore (curto). Testes: smoke em produção. Usuários reais: só você.

---

# FASE B — OPERAÇÃO REAL INTERNA

**Objetivo:** dois ciclos mensais completos operados dentro do sistema, sem recurso à planilha, com as correções que o uso revelar.

**Por que existe:** é aqui que se descobre a diferença entre "funciona no QA" e "funciona na vida". Correção guiada por uso, exatamente como você definiu.

**O que acontece:**
- Você opera o ciclo inteiro no sistema: cadastro, aprovação, campanha, participação, briefing, material, aprovação de conteúdo, pagamento.
- Registro disciplinado de fricções (uma lista única, sem virar backlog inflado).
- Correções priorizadas por dor real; MUSTs do backlog V2.6 só entram se o uso confirmar que são MUST.
- Instrumentação mínima de uso (eventos básicos: login, entrega enviada, pagamento confirmado) para a Fase C ter régua.
- **Trilha Negócio começa:** ADR de tenancy (decisão); hipótese de preço; consulta ao contador (MEI/ME, nota de SaaS); verificação INPI.

**O que NÃO deve acontecer:** abrir o portal para influenciadoras antes de você confiar no sistema; retrabalho visual; multi-tenant implementado (só decidido).

**Critérios de conclusão (portão B → C):**
1. Dois ciclos mensais fechados no sistema, zero operações feitas na planilha.
2. Lista de fricções triada: corrigido, aceito ou adiado (nada "em aberto").
3. ADR de tenancy aprovado.
4. Hipótese de preço escrita (uma página).

**Riscos:** tentação de paralelizar produto e operação da agência sem folga; fricções demais virarem reescrita (proibido: evolução incremental); ciclo mensal é lento por natureza, dois ciclos custam dois meses de calendário, não há como comprimir.

**Por área:** Código: correções de uso. UX: ajustes de fluxo apontados pela operação. Design: nenhum. Infra: monitoramento básico (uptime, Pulse). Negócio: tenancy, preço, fiscal, INPI. Documentação: nenhuma nova. Testes: regressão das correções. Usuários reais: você e equipe interna, se existir (lacuna 2 da Entrega 1).

---

# FASE C — VALIDAÇÃO COM INFLUENCIADORAS

**Objetivo:** o squad real da Jescri usa o portal para o ciclo inteiro; adoção medida, não suposta.

**Por que existe:** influenciadora é metade do produto. Se ela não usar, o SaaS não tem proposta de valor para nenhum cliente externo.

**O que acontece:**
- Onboarding em ondas: 3 a 5 influenciadoras primeiro, depois o squad todo.
- Convite, primeiro login, envio de material, consulta de pagamento: tudo pelo portal.
- Régua de adoção definida antes (ex.: % de entregas do mês que entraram pelo portal versus WhatsApp; % de influs que completaram o primeiro acesso sem ajuda).
- Correções de UX do portal guiadas pelo que travar as influs de verdade.
- Fluxo de consentimento LGPD ativo no cadastro/primeiro acesso.
- **Trilha Produtização começa:** textos, mensagens de erro, empty states e e-mails do portal (a influenciadora vê o produto antes de qualquer cliente externo ver).

**O que NÃO deve acontecer:** abandonar o WhatsApp de uma vez (transição, não ruptura); prometer funcionalidade nova para influenciadora; abrir para marca externa.

**Critérios de conclusão (portão C → D):**
1. Um ciclo mensal em que a maioria das entregas do squad entrou pelo portal (a meta numérica exata você define antes de abrir a fase; sugestão: 70%).
2. Primeiro acesso sem suporte manual funciona (convite → login → ação) para influenciadora nova.
3. Consentimento LGPD registrado para todas as usuárias ativas.
4. Nenhum incidente de dados (vazamento entre contas, material trocado).

**Riscos:** adoção baixa (o maior risco de produto do plano inteiro; se ocorrer, parar e simplificar, não adicionar); custo de suporte via WhatsApp sobre você durante a transição; sazonalidade do squad (campanhas variam mês a mês).

**Por área:** Código: correções portal. UX: crítico, régua "mais fácil que WhatsApp". Design: primeiros acertos visuais do portal. Infra: nada novo. Negócio: LGPD operacional. Documentação: FAQ de uma página para influs. Testes: fluxo de convite/onboarding. Usuários reais: squad Jescri.

---

# FASE D — PRODUTIZAÇÃO

**Objetivo:** transformar o sistema validado em produto apresentável: identidade ELÃ | influência, onboarding, documentação de usuário, consistência.

**Por que existe:** percepção de qualidade é requisito de venda. Vem depois da validação porque polir tela que ainda muda é desperdício.

**O que acontece:**
- Identidade visual aplicada (design system Elã) no admin e no portal.
- Layout dos e-mails transacionais.
- Onboarding de novo tenant desenhado (mesmo que operado manualmente no piloto).
- Empty states, mensagens de erro, microcopy revisados de ponta a ponta.
- Permissões revisadas para o cenário multi-marca conforme o ADR de tenancy (implementação mínima que o piloto exige).
- Documentação de usuário essencial: FAQ, guia rápido do operador, guia da influenciadora, changelog iniciado.
- Termos de uso e política de privacidade publicados (revisão jurídica: decidir se contrata; lacuna de orçamento).

**O que NÃO deve acontecer:** redesign de fluxo que já validou bem; central de ajuda completa; acessibilidade além do básico; feature nova de módulo.

**Critérios de conclusão (portão D → E):**
1. Uma pessoa que nunca viu o sistema completa os fluxos principais sem ajuda (teste com 1 ou 2 pessoas reais serve).
2. Identidade aplicada nas superfícies que o piloto verá; e-mails com layout.
3. Termos e política publicados.
4. Isolamento multi-marca implementado no grau mínimo do ADR, com teste automatizado de isolamento entre marcas.

**Riscos:** perfeccionismo visual consumindo o calendário (timebox); tenancy mínima esconder complexidade (por isso o ADR foi decidido na B e só implementado aqui); LGPD sem revisão jurídica profissional é risco residual documentado.

**Por área:** Código: tenancy mínima, e-mails. UX: onboarding, microcopy. Design: pesado (identidade). Infra: nada novo. Negócio: termos, política, precificação afinada. Documentação: guias de usuário. Testes: isolamento entre marcas (crítico). Usuários reais: teste de usabilidade informal.

---

# FASE E — PILOTO EXTERNO + FUNDAÇÃO COMERCIAL

**Objetivo:** uma empresa externa completa um ciclo mensal no produto, em modo concierge, idealmente pagando valor simbólico. Saída da fase = 0.9 (freeze).

**Por que existe:** é a única fase que produz a evidência que o 1.0 precisa. Tudo antes dela é preparação; tudo depois é empacotamento.

**O que acontece:**
- Seleção e fechamento do piloto (marca ou agência próxima; critérios: operação de influência ativa, disposição para feedback, sem conflito direto com Jescri).
- Contrato de piloto simples (escopo, prazo, dados, preço simbólico).
- **Infra sai do custo zero:** com dado de terceiro no banco, ativar o upgrade definido na Entrega 3 (isolamento, backup externo ao provedor, monitoramento). Este é o gatilho combinado.
- Onboarding do tenant piloto (concierge: você configura junto).
- Um ciclo mensal completo do piloto no produto.
- Coleta estruturada de feedback + métricas de uso do tenant.
- Ao final: freeze de escopo do 1.0 (0.9). Só correção entra depois do freeze.

**O que NÃO deve acontecer:** vender licenças em volume; construir feature sob demanda do piloto sem passar pelo filtro de simplicidade (piloto informa, não manda); dezembro carregado de trabalho estrutural.

**Critérios de conclusão (portão E → F):**
1. Piloto fechou um ciclo mensal sem intervenção sua no banco de dados.
2. Feedback documentado e triado.
3. Incidentes do piloto resolvidos ou aceitos com registro.
4. Freeze declarado: escopo do 1.0 fechado por escrito.
5. Backup externo e monitoramento ativos na infra paga.

**Riscos:** não encontrar piloto (mitigação: começar a busca na Fase C, usando sua rede; lacuna 5 da Entrega 1); piloto desistir no meio (contrato simples com expectativas claras reduz); dezembro comprimir tudo (por isso o ciclo do piloto deve ser novembro, ver Entrega 3); confiança sobre isolamento de dados (resposta escrita pronta desde a D).

**Por área:** Código: só o que o piloto quebrar. UX: fricções do piloto. Design: nada novo. Infra: upgrade pago, backup externo. Negócio: contrato, preço testado, pitch. Documentação: onboarding de tenant. Testes: carga leve (não é gargalo nessa escala). Usuários reais: o tenant piloto e suas influenciadoras.

---

# FASE F — LANÇAMENTO 1.0

**Objetivo:** 15/01/2027: produto lançado comercialmente, com material de venda baseado em evidência do piloto.

**Por que existe:** o nascimento oficial é um evento de negócio, não de engenharia. A engenharia já provou o que tinha que provar na E.

**O que acontece:**
- Correções do freeze (só correções).
- Landing page, apresentação institucional, vídeo demonstrativo curto (telas reais).
- Política comercial publicada: preço, o que inclui, canal de suporte, SLA honesto de fundador solo.
- Changelog público, roadmap público curto.
- Checklist final de segurança e restore.
- Anúncio (canais próprios do Estúdio Elã primeiro).

**O que NÃO deve acontecer:** feature de última hora; promessa de roadmap que contradiz a filosofia de simplicidade; meta de vendas agressiva no dia 1 (maturidade comercial, como você definiu, não volume).

**Critérios de conclusão:** 1.0 publicado em 15/01/2027; material comercial no ar; pipeline mínimo de interessados iniciado (mesmo que pequeno).

**Riscos:** dezembro/festas reduzirem sua capacidade (mitigado se 0.9 sai em novembro); ansiedade de lançamento inflar escopo (o freeze protege).

**Por área:** Código: correções. UX: nada novo. Design: material de marketing. Infra: verificação final. Negócio: política comercial, precificação final. Documentação: changelog, roadmap público. Testes: regressão final. Usuários reais: primeiros leads.

---

# GARGALOS ANTECIPADOS (transversais)

1. **Capacidade de uma pessoa.** O gargalo mestre. Mitigação: uma frente por vez, portões que impedem paralelismo, dezembro leve, escopo cortado na dúvida.
2. **Ciclo mensal como unidade de validação.** Cada validação custa um mês de calendário. É o que torna janeiro apertado e proíbe fases fora de ordem.
3. **Adoção pelas influenciadoras.** Risco de produto número 1 (Fase C). Se falhar, o pitch comercial inteiro muda.
4. **Infra compartilhada de custo zero.** Serve até a E. Gatilho de upgrade definido e não negociável: dado de terceiro no banco.
5. **Tenancy.** Decisão na B, implementação mínima na D, prova na E. Errar a ordem disso custa reescrita.
6. **LGPD e PII sensível** (medidas corporais, PIX, endereço). Consentimento na C, termos na D, resposta de isolamento na E.
7. **E-mail transacional.** Sem ele nada existe (convites). Resolver na A; deliverability testada com caixa real.
8. **Migração de dados.** Subestimada com frequência; dados de planilha são sujos. Reservar limpeza na A.
9. **Excesso de documentação.** Já há 5 planos sobrepostos. O Plano Mestre substitui; superados vão para archive. Documentar menos, decidir mais.
10. **Suporte.** Nasce na C (influs) e cresce na E (tenant). Reservar espaço fixo de agenda a partir da C.
11. **Fiscal/societário.** Resolver na trilha Negócio (B) para não travar a cobrança do piloto na E.
12. **Dezembro.** Pico da Jescri + festas. Tratado como meio ciclo de capacidade no calendário da Entrega 3.

# ONDE DISCORDO DA SUA ORDEM ORIGINAL

- Seu fluxo original (MVP → Go Live → uso interno → validação → 0.x → 1.0) não continha o piloto externo. Sem a Fase E, o 1.0 de janeiro seria o primeiro contato do produto com uma empresa externa, ou seja, a validação comercial aconteceria depois do lançamento. Inverti: piloto antes, lançamento como consequência.
- Identidade visual e layout de e-mails estavam listados por você como pendência pré-Go Live. Movi para a D: Go Live interno não precisa de beleza, precisa de dados reais. Polir antes de validar é a única forma garantida de polir duas vezes.
- A escada fixa 0.1→0.9 virou mapa de versões por portão. Número de versão passa a comunicar estado de maturidade, não passagem de tempo.
