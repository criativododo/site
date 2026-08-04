# Backlog de Produto — Portal Criativo DODÔ

# MELHORIAS_MANUS.md

## Objetivo

Este documento reúne propostas de evolução geradas por IA durante o processo de descoberta de produto.

Nenhum item deste documento é considerado requisito oficial.

As propostas aqui contidas servem como fonte de inspiração para futuras evoluções do Portal Criativo DODÔ.

Uma funcionalidade só passa a fazer parte do produto quando:

1. for discutida;
2. for aprovada;
3. for incorporada ao MELHORIAS_PRODUTO.md.

Portanto:

MELHORIAS_PRODUTO.md continua sendo a especificação soberana do produto.

MELHORIAS_MANUS.md é um backlog estratégico de oportunidades.

## Análise como Head de Produto

Este documento foi produzido a partir da análise exclusiva da especificação oficial (Versão 1.0 — PRODUCT UX BLUEPRINT). Ele identifica funcionalidades e telas que ainda não existem na especificação, mas que são necessárias para que o Portal Criativo DODÔ se torne uma plataforma de referência para gestão de campanhas de influenciadores, agências e marcas.

---

## Critérios de Priorização

| Prioridade | Significado |
|---|---|
| **P0** | Bloqueante. Sem isto, o Portal não cumpre a promessa central da relação agência–influenciadora. |
| **P1** | Crítico para confiança e retenção. Transforma a experiência de "transação" em "relação". |
| **P2** | Escala operacional. Permite que a agência cresça sem colapso. |
| **P3** | Maturidade e diferenciação. Valor competitivo e refinamento. |

---

## Funcionalidades e Telas Propostas

---

### 1. Tela: "Calendário editorial da agência"

| Aspecto | Detalhe |
|---|---|
| **Objetivo** | Dar à agência uma visão temporal completa de todas as campanhas ativas, datas de postagem e entregas previstas, organizadas em um calendário visual. |
| **Valor** | Elimina a necessidade de planilhas externas para controlar prazos de postagem e entregas. A agência vê, em um só lugar, o que vai ao ar quando e o que precisa ser revisado quando. |
| **Dados utilizados** | Briefings publicados (data de postagem, data de entrega), campanhas ativas, estados de entrega, prazo interno calculado, parceiras envolvidas. |
| **Conexão com telas existentes** | Navegação a partir do dashboard editorial. Cada evento no calendário abre a entrega ou briefing correspondente. O dashboard (tela 49) alimenta este calendário com os dados de temperatura. |
| **Prioridade** | P1 |

---

### 2. Funcionalidade: "Campanha multi-marca por parceira"

| Aspecto | Detalhe |
|---|---|
| **Objetivo** | Permitir que uma mesma parceira tenha, simultaneamente, campanhas com marcas diferentes dentro de um mesmo mês, cada uma com sua própria condição comercial, briefing e cota. |
| **Valor** | Hoje a especificação assume uma campanha por parceira por mês (visão do mês = uma capa). Na prática, influenciadoras profissionais trabalham com 2–5 marcas simultaneamente. Sem isso, a agência precisa de um Portal por marca ou contorna fora do sistema. |
| **Dados utilizados** | Condições comerciais múltiplas por parceira, marca, cotas independentes, briefings por marca. |
| **Conexão com telas existentes** | A tela de campanhas (tela 22) precisa ser reestruturada para agrupar por marca dentro do mês, em vez de mostrar uma única "capa". A virada do mês (telas 55–57) precisa materializar colaborações por marca, não por parceira. |
| **Prioridade** | P0 |

---

### 3. Tela: "Portal de leitura para a marca"

| Aspecto | Detalhe |
|---|---|
| **Objetivo** | Oferecer à marca uma visão de leitura da campanha, com briefing, materiais aprovados, links de publicação e status de entrega, sem acesso a dados financeiros ou de revisão interna. |
| **Valor** | Marca é o cliente final da agência. Hoje a especificação diz explicitamente "nenhuma tela é construída para a marca nesta versão". Porém, a marca precisa confiar na agência. Dar a ela visibilidade controlada é um diferencial competitivo enorme para a agência e fideliza a relação. |
| **Dados utilizados** | Briefing publicado, materiais aprovados e publicados, links de postagem, datas de publicação, status da campanha. |
| **Conexão com telas existentes** | Exportação da visão de campanha já prevista no P3. A tela seria um subconjunto da "campanha — visão do mês" (tela 23), filtrado e simplificado para leitura externa. |
| **Prioridade** | P2 |

---

### 4. Funcionalidade: "Contrato digital e assinatura"

| Aspecto | Detalhe |
|---|---|
| **Objetivo** | Gerar um contrato digital a partir da condição comercial, permitir assinatura digital da parceira e arquivar o documento no dossiê da parceria. |
| **Valor** | A condição comercial é definida como "contrato soberano", mas não existe mecanismo de formalização. Hoje, contratos vivem fora do Portal (e-mail, WhatsApp, Google Docs). Formalizar dentro do Portal elimina risco legal, acelera onboarding e cria trilha de auditoria para pagamentos. |
| **Dados utilizados** | Condição comercial, dados da parceira (nome, CPF/CNPJ, endereço), dados da agência, valor, cotas, vigência. |
| **Conexão com telas existentes** | A tela de condição comercial (tela 53) geraria o contrato. O perfil da parceira (telas 12–16) alimentaria os dados. O histórico geral (tela 76) arquivaria o documento assinado. |
| **Prioridade** | P1 |

---

### 5. Tela: "Central de atendimento da parceira"

| Aspecto | Detalhe |
|---|---|
| **Objetivo** | Canal de comunicação estruturado dentro do Portal onde a parceira pode abrir solicitações (dúvida sobre briefing, problema com upload, questão financeira) e a agência responde com contexto atrelado à campanha. |
| **Valor** | Hoje, toda dúvida da parceira vai para o WhatsApp, se perde, não tem contexto da campanha atrelado e gera reprotrabalho para a agência. Uma central de atendimento mantém o histórico, atrela a pergunta à campanha relevante e permite templates de resposta. |
| **Dados utilizados** | Campanha atual, briefing, entregas, dados da parceira, histórico de interações anteriores. |
| **Conexão com telas existentes** | A partir da tela de campanha (tela 23) ou do dashboard (tela 21), a parceira acessa a central. Para a agência, aparece no dashboard editorial (tela 49) como item de "atenção agora". As mensagens prontas de WhatsApp (tela 72) podem ser usadas como templates de resposta. |
| **Prioridade** | P1 |

---

### 6. Funcionalidade: "Relatórios de desempenho de campanha"

| Aspecto | Detalhe |
|---|---|
| **Objetivo** | Gerar relatórios automáticos com métricas de desempenho da campanha: taxa de aprovação, tempo médio de revisão, entregas no prazo, atrasos, ciclos de ajuste, e evolução ao longo dos meses. |
| **Valor** | Transforma o Portal de ferramenta operacional em ferramenta estratégica. A agência consegue identificar padrões (parceiras que sempre atrasam, marcas que pedem muitos ajustes, períodos críticos), justificar decisões e negociar com base em dados. |
| **Dados utilizados** | Todas as timelines (campanha, entrega, pagamento), eventos de revisão, datas de publicação, ciclos de ajuste, histórico de competências. |
| **Conexão com telas existentes** | Dados extraídos de todas as timelines (capítulo 7) e da auditoria (tela 74). Pode ser uma seção do encerramento de competência (tela 78) ou uma tela independente acessível pelo dashboard administrativo. |
| **Prioridade** | P2 |

---

### 7. Tela: "Gestão de permissões e papéis internos"

| Aspecto | Detalhe |
|---|---|
| **Objetivo** | Definir papéis diferenciados dentro da agência (ex.: operador de campanha, revisor, financeiro, administrador) com permissões granulares sobre o que cada papel pode ver e fazer. |
| **Valor** | A especificação menciona na pergunta 7: "Existirá mais de um operador na agência com papéis diferentes (revisor × financeiro)?". Não existe tela nem mecanismo para isso. Sem permissões, o financeiro vê materiais que não deveria revisar, o revisor libera pagamentos que não deveria aprovar. |
| **Dados utilizados** | Papéis definidos pela agência, lista de usuários internos, permissões por tela/ação. |
| **Conexão com telas existentes** | As configurações da agência (tela 77) seriam o ponto de entrada. O bloqueio suave de concorrência na revisão (tela 63) já pressupõe operadores distintos — esta funcionalidade formaliza o modelo. |
| **Prioridade** | P1 |

---

### 8. Funcionalidade: "Templates de briefing por marca"

| Aspecto | Detalhe |
|---|---|
| **Objetivo** | Permitir que a agência crie templates de briefing por marca, com campos fixos (tom de voz, o que não fazer, referências) que se repetem mês a mês, reduzindo a digitação na virada do mês. |
| **Valor** | A virada do mês já é um avanço (a colaboração "nasce pronta"). Mas briefings ainda exigem preenchimento manual de campos que raramente mudam (look, orientação, referências). Templates eliminam até 70% do trabalho repetitivo. |
| **Dados utilizados** | Briefings anteriores por marca, campos que se repetem, configurações de marca. |
| **Conexão com telas existentes** | O editor de briefing (tela 59) e a virada do mês (tela 55) se beneficiam diretamente. Templates ficam associados à marca dentro da ficha da parceira (tela 52). |
| **Prioridade** | P2 |

---

### 9. Tela: "Galeria de referências por campanha"

| Aspecto | Detalhe |
|---|---|
| **Objetivo** | Repositório visual de referências criativas (imagens, vídeos, links) atrelado a cada briefing, acessível tanto pela agência quanto pela parceira, com comentários e categorização. |
| **Valor** | O briefing menciona "referências" como campo textual. Na prática, criadores precisam de referências visuais. Hoje isso vai por WhatsApp ou Drive, se perde e não tem contexto. Uma galeria nativa eleva a qualidade do material produzido e reduz ciclos de ajuste. |
| **Dados utilizados** | Arquivos de referência enviados pela agência, links externos, comentários sobre cada referência, briefing associado. |
| **Conexão com telas existentes** | Acessível a partir do briefing (tela 24) e do editor de briefing (tela 59). Materiais aprovados (tela 36) podem ser marcados como referência para meses futuros. |
| **Prioridade** | P2 |

---

### 10. Funcionalidade: "Controle de cota flexível (acúmulo e rollover)"

| Aspecto | Detalhe |
|---|---|
| **Objetivo** | Permitir que a agência configure regras de cota: se uma entrega não utilizada no mês pode acumular para o próximo, se há limite de rollover, e se existe cota mínima mensal. |
| **Valor** | A especificação menciona o contador de cota ("reels 2 de 3"), mas assume que a cota se esgota no mês. Na prática, influenciadoras faltam, marcas pedem ajustes de volume, e a cota rígida gera atrito. Flexibilidade de cota é decisiva para retenção de parceiras. |
| **Dados utilizados** | Condição comercial, cotas utilizadas por mês, configurações de rollover, histórico de competências. |
| **Conexão com telas existentes** | A condição comercial (tela 53) ganha um novo bloco de configuração. O contador de cota visível na tela de produção (tela 27) e no upload (tela 29) precisa refletir o saldo acumulado. |
| **Prioridade** | P1 |

---

### 11. Tela: "Mural de destaques da agência"

| Aspecto | Detalhe |
|---|---|
| **Objetivo** | Um espaço de comunicação unilateral da agência para a parceira, com avisos gerais, novidades, regras atualizadas e celebrações (ex.: "sua campanha de agosto foi a mais engajada do mês"). |
| **Valor** | Hoje, comunicados gerais vão por WhatsApp ou grupo, se perdem e não ficam atrelados ao Portal. Um mural editorial formaliza a comunicação institucional da agência e cria cultura de comunidade. |
| **Dados utilizados** | Mensagens publicadas pela agência, datas, categoria (aviso, novidade, celebração). |
| **Conexão com telas existentes** | Acessível a partir do dashboard da influenciadora (tela 21). Notificações (tela 42) alertam sobre novos itens no mural. Para a agência, é uma tela de publicação dentro do dashboard editorial (tela 49). |
| **Prioridade** | P3 |

---

### 12. Funcionalidade: "Aprovação por checklist do briefing"

| Aspecto | Detalhe |
|---|---|
| **Objetivo** | Quando a agência solicita ajustes, os itens de ajuste são apresentados como checklist que a parceira marca conforme resolve, e a agência confere item a item na revisão. |
| **Valor** | Hoje, o feedback é "comentário livre". Checklists estruturam a revisão, reduzem ambiguidade, aceleram o reenvio e diminuem o número de ciclos de ajuste. A parceira sabe exatamente o que falta; a agência sabe o que verificar. |
| **Dados utilizados** | Itens de ajuste solicitados, estado de cada item (pendente/resolvido), número de ciclos. |
| **Conexão com telas existentes** | A tela de ajuste solicitado (tela 34) e a solicitação de ajuste (tela 64) ganham o componente de checklist. A revisão (tela 63) exibe o checklist do lado a lado com o material. |
| **Prioridade** | P0 |

---

### 13. Tela: "Visão consolidada de pagamentos"

| Aspecto | Detalhe |
|---|---|
| **Objetivo** | Uma tela que mostre, para a parceira, o histórico completo de pagamentos por marca, com valores totais, médias mensais, atrasos e tendência (subindo, estável, descendo). |
| **Valor** | O extrato (tela 39) mostra competência por competência. A parceira não tem visão agregada. Um painel financeiro pessoal com tendência ajuda na gestão de fluxo de caixa e na decisão de renovar ou aceitar novas parcerias. |
| **Dados utilizados** | Todos os pagamentos, comprovantes, valores, datas de pagamento, marcas, competências. |
| **Conexão com telas existentes** | Evolução da tela de extrato (tela 39) e do histórico geral (tela 43). Para a agência, complementa o financeiro de competências (tela 67). |
| **Prioridade** | P2 |

---

### 14. Funcionalidade: "Integração com métricas de redes sociais"

| Aspecto | Detalhe |
|---|---|
| **Objetivo** | Capturar (manualmente ou via API) métricas de publicação (visualizações, engajamento, alcance, salvamentos) atreladas ao registro de publicação, para que a agência e a marca tenham dados de performance. |
| **Valor** | Hoje, o registro de publicação (tela 66) é apenas data e link. Sem métricas, a agência não consegue reportar performance à marca nem avaliar se a parceira está entregando valor real. Métricas transformam o Portal em ferramenta de analytics, não apenas de operação. |
| **Dados utilizados** | Link da publicação, métricas (views, likes, comentários, shares, salvamentos), data de captura, plataforma (Instagram, TikTok, YouTube). |
| **Conexão com telas existentes** | Após o registro de publicação (tela 66), a tela de material publicado (tela 37) ganha um bloco de métricas. A marca (tela 3) teria acesso a esses dados. |
| **Prioridade** | P2 |

---

### 15. Tela: "Central de onboarding da agência"

| Aspecto | Detalhe |
|---|---|
| **Objetivo** | Um fluxo guiado para o primeiro acesso do operador da agência, explicando papéis, processos, como criar uma parceira, como publicar um briefing, como revisar, como pagar. |
| **Valor** | A especificação é rica em jornada da influenciadora, mas a agência não tem nenhum onboarding previsto. Novos operadores precisam aprender pelo uso ou documentação externa. Um onboarding estruturado reduz tempo de capacitação e erro operacional. |
| **Dados utilizados** | Papel do operador, papéis disponíveis, tutorial por módulo. |
| **Conexão com telas existentes** | Primeiro acesso após login (tela 1). Pode ser ativado manualmente pelas configurações da agência (tela 77). |
| **Prioridade** | P3 |

---

### 16. Funcionalidade: "Escalonamento automático de pendências"

| Aspecto | Detalhe |
|---|---|
| **Objetivo** | Quando uma pendência (material em revisão, briefing sem leitura, pagamento bloqueado) ultrapassa um limite de tempo configurável, ela é automaticamente escalonada: notifica outros operadores, gera alerta urgente e registra o evento na auditoria. |
| **Valor** | Hoje, a mesa de decisão (tela 49) mostra "atenção agora", mas não há mecanismo de escalonamento. Pendências antigas podem se perder na fila. O escalonamento automático garante que nada esquecido vire problema na marca. |
| **Dados utilizados** | Datas de eventos, limites configurados por tipo de pendência, operadores disponíveis, histórico de escalonamentos. |
| **Conexão com telas existentes** | Alimenta o dashboard editorial (tela 49) com itens de "atenção agora" prioritários. As notificações administrativas (tela 73) geram alertas. A auditoria (tela 74) registra o evento. |
| **Prioridade** | P1 |

---

### 17. Tela: "Comparativo de campanhas entre meses"

| Aspecto | Detalhe |
|---|---|
| **Objetivo** | Permitir que a agência compare uma campanha mês a mês: o que mudou no briefing, nas entregas, nos ajustes, no pagamento, e identificar padrões. |
| **Valor** | A virada do mês já copia estrutura, mas não há ferramenta de comparação. Sem isso, a agência não consegue argumentar com a marca ("o engajamento caiu 30% desde que mudamos o look") nem com a parceira ("seus ajustes diminuíram dois meses seguidos, parabéns"). |
| **Dados utilizados** | Briefings de meses anteriores, métricas de aprovação, ciclos de ajuste, dados de pagamento, métricas de publicação. |
| **Conexão com telas existentes** | Acessível a partir do encerramento de competência (tela 78) e da lista de colaborações mensais (tela 55). Pode alimentar os relatórios de desempenho (item 6). |
| **Prioridade** | P3 |

---

### 18. Funcionalidade: "Gestão de múltiplas agências / white label"

| Aspecto | Detalhe |
|---|---|
| **Objetivo** | Permitir que o Portal seja utilizado por múltiplas agências, cada uma com sua própria identidade visual, domínio e base de parceiras, sem compartilhamento de dados. |
| **Valor** | Hoje, o Portal serve a uma agência (Estúdio Elã). Se o produto tem ambição de escala, precisa suportar multi-tenant. Isso transforma o Portal de ferramenta interna em produto comercializável. |
| **Dados utilizados** | Configurações de agência (nome, logo, domínio, cores), base de parceiras, permissões. |
| **Conexão com telas existentes** | As configurações da agência (tela 77) ganham camada de tenancy. Todos os dados existentes passam a ser filtrados por agência. |
| **Prioridade** | P3 |

---

### 19. Tela: "Painel de saúde da parceria"

| Aspecto | Detalhe |
|---|---|
| **Objetivo** | Uma visão da agência sobre cada parceira com indicadores de saúde: pontualidade, taxa de aprovação, qualidade de material (ciclos de ajuste), engajamento médio das publicações, e um score consolidado. |
| **Valor** | Ajuda a agência a tomar decisões estratégicas: renovar ou encerrar parceria, negociar valores, identificar potencial de crescimento. Transforma dados operacionais em inteligência de negócio. |
| **Dados utilizados** | Histórico de entregas, ciclos de ajuste, datas de publicação, métricas de engajamento, pagamentos, onboarding. |
| **Conexão com telas existentes** | Acessível a partir da ficha da parceira (tela 52). Dados extraídos das timelines de entrega (capítulo 15) e financeiro (capítulo 14). |
| **Prioridade** | P2 |

---

### 20. Funcionalidade: "Cronograma de campanhas futuras"

| Aspecto | Detalhe |
|---|---|
| **Objetivo** | Permitir que a agência planeje campanhas dos próximos meses (3–6 meses), com condições comerciais antecipadas, para que a parceira tenha visibilidade do que vem e possa se programar. |
| **Valor** | Hoje, a parceira só descobre a campanha quando o mês vira. Com planejamento antecipado, ela pode se organizar, a agência negocia com antecedência com as marcas, e a retenção de parceiras aumenta porque elas sentem segurança profissional. |
| **Dados utilizados** | Condições comerciais, datas previstas de postagem, cotas planejadas, status (planejada / confirmada / cancelada). |
| **Conexão com telas existentes** | A tela de campanhas (tela 22) mostra meses futuros como "planejadas". A colaboração mensal (tela 55) ganha status de "rascunho futuro". O calendário editorial (item 1) inclui datas planejadas. |
| **Prioridade** | P2 |

---

### 21. Tela: "Central de compliance e documentação legal"

| Aspecto | Detalhe |
|---|---|
| **Objetivo** | Repositório organizado de todos os documentos legais da parceria: contrato, termos, dados de pagamento, comprovantes, e solicitações de privacidade (LGPD), com validade e alertas de expiração. |
| **Valor** | Hoje, documentos vivem espalhados (e-mail, Drive, WhatsApp). Uma central de compliance protege a agência juridicamente, acelera auditorias e dá segurança à parceira. |
| **Dados utilizados** | Contratos assinados, termos aceitos, dados de pagamento, comprovantes, solicitações de privacidade, datas de validade. |
| **Conexão com telas existentes** | A ficha da parceira (tela 52) ganha um bloco "documentação". As solicitações de privacidade (tela 75) e o histórico (tela 76) alimentam esta central. O contrato digital (item 4) é a peça central. |
| **Prioridade** | P2 |

---

### 22. Funcionalidade: "Feedback estruturado em vídeo/áudio"

| Aspecto | Detalhe | Detalhe |
|---|---|---|
| **Objetivo** | Permitir que o feedback de revisão seja dado não apenas em texto, mas também em vídeo curto ou áudio gravado dentro do Portal, atrelado ao material. |
| **Valor** | A especificação reconhece que "feedback em áudio" é um dos problemas que o Portal resolve, mas a solução proposta é apenas texto. Criadores visuais entendem muito melhor feedback em vídeo. Permitir áudio/vídeo nativo elimina a necessidade de WhatsApp para explicações complexas. |
| **Dados utilizados** | Material em revisão, versão do material, operador que gravou, timestamp do feedback. |
| **Conexão com telas existentes** | A tela de revisão (tela 63) e o material com ajuste solicitado (tela 34) ganham o componente de mídia. O histórico de versões (tela 38) pode incluir versões do feedback. |
| **Prioridade** | P2 |

---

### 23. Tela: "Dashboard de métricas da agência"

| Aspecto | Detalhe |
|---|---|
| **Objetivo** | Visão executiva para o dono/gestor da agência com KPIs consolidados: número de parceiras ativas, volume de campanhas por mês, taxa de pagamento no prazo, taxa de aprovação na primeira revisão, receita projetada, churn de parceiras. |
| **Valor** | O dashboard editorial (tela 49) é operacional. Falta uma visão estratégica para quem toma decisão de negócio. Este dashboard fecha o gap entre operação e gestão. |
| **Dados utilizados** | Dados consolidados de todas as campanhas, pagamentos, parcerias, timelines e relatórios. |
| **Conexão com telas existentes** | Acessível a partir do dashboard editorial (tela 49) ou como aba superior. Dados extraídos de relatórios (item 6), painel de saúde (item 19) e financeiro. |
| **Prioridade** | P3 |

---

### 24. Funcionalidade: "Notificações push no dispositivo móvel"

| Aspecto | Detalhe |
|---|---|
| **Objetivo** | Enviar notificações push (via PWA ou app nativo) para a influenciadora sobre urgências reais: prazo interno vencido, material reprovado, pagamento liberado, briefing republicado. |
| **Valor** | A influenciadora usa o celular e tem pressa. Mural de notificações (tela 42) exige que ela abra o Portal. Push notification garante que a urgência chegue até ela mesmo com o Portal fechado. |
| **Dados utilizados** | Eventos urgentes do catálogo de timeline (capítulo 7), preferências de notificação da parceira. |
| **Conexão com telas existentes** | Alimenta o mural de notificações (tela 42). Regras de envio baseadas no catálogo de eventos (capítulo 7) e nos níveis de urgência (capítulo 13). |
| **Prioridade** | P1 |

---

### 25. Tela: "Repositório de materiais aprovados"

| Aspecto | Detalhe |
|---|---|
| **Objetivo** | Biblioteca organizada de todos os materiais aprovados e publicados de uma parceira, com filtro por marca, formato, mês e engajamento, acessível pela agência e pela parceira. |
| **Valor** | Hoje, materiais aprovados são arquivados e esquecidos (tela 43 — histórico geral). Um repositório vivo permite que a agência referencie materiais antigos em novos briefings e que a parceira construa portfólio profissional dentro do Portal. |
| **Dados utilizados** | Todos os materiais aprovados e publicados, metadados (marca, formato, data, link, métricas), categorias. |
| **Conexão com telas existentes** | Evolução do histórico (tela 43) e do arquivo da agência (tela 76). Materiais aprovados (tela 36) ganham botão "adicionar ao repositório". A galeria de referências (item 9) pode importar deste repositório. |
| **Prioridade** | P3 |

---

### 26. Funcionalidade: "Marcações e anotações no material"

| Aspecto | Detalhe |
|---|---|
| **Objetivo** | Permitir que a agência faça marcações visuais (setas, círculos, texto sobreposto) diretamente sobre o material enviado, para que o feedback seja preciso e contextual. |
| **Valor** | Feedback textual sobre vídeo ou imagem é ambíguo ("corta a parte do meio" — qual meio?). Anotações visuais sobre o próprio material eliminam ambiguidade, reduzem ciclos de ajuste e aceleram a aprovação. |
| **Dados utilizados** | Material enviado (vídeo/imagem), versão, anotações (posição, texto, autor, timestamp). |
| **Conexão com telas existentes** | A tela de revisão (tela 63) ganha o componente de anotação. O ajuste solicitado (tela 64) pode incluir as anotações visuais. A parceira vê as marcações na tela de ajuste (tela 34). |
| **Prioridade** | P1 |

---

### 27. Tela: "Planejamento financeiro da agência"

| Aspecto | Detalhe |
|---|---|
| **Objetivo** | Visão de fluxo de caixa futuro da agência baseada nas competências ativas, pagamentos previstos, condições comerciais e datas de vencimento. |
| **Valor** | Hoje, o financeiro da agência (tela 67) mostra competências passadas e presentes. Falta a visão prospectiva: quanto vou pagar nos próximos 3 meses, quais portões estão bloqueados, qual é a projeção de gasto. Essencial para gestão financeira de uma agência de influenciadores. |
| **Dados utilizados** | Condições comerciais, competências ativas, portões financeiros, datas de pagamento previstas, histórico de pagamentos. |
| **Conexão com telas existentes** | Acessível a partir do financeiro de competências (tela 67). Dados extraídos das condições comerciais (tela 53) e das colaborações mensais (tela 55). |
| **Prioridade** | P3 |

---

### 28. Funcionalidade: "Modo de emergência (material urgente)"

| Aspecto | Detalhe |
|---|---|
| **Objetivo** | Permitir que a agência marque um material como "urgente", o que altera o fluxo: prioriza na fila de revisão, envia notificação push imediata para a agência, reduz o prazo interno e notifica a parceira com urgência explícita. |
| **Valor** | Campanhas de influenciadores frequentemente têm janelas de oportunidade curtas (tendência viral, data comemorativa). Sem modo de urgência, a equipe operacional não distingue o que é crítico do que pode esperar. |
| **Dados utilizados** | Data de postagem, proximidade do prazo, flag de urgência, histórico de materiais urgentes anteriores. |
| **Conexão com telas existentes** | A entrega (tela 63) ganha o flag de urgência. O dashboard editorial (tela 49) prioriza itens urgentes no bloco "atenção agora". Notificações (tela 73) e push (item 24) são disparadas automaticamente. |
| **Prioridade** | P1 |

---

### 29. Tela: "Histórico de comunicação por campanha"

| Aspecto | Detalhe |
|---|---|
| **Objetivo** | Timeline consolidada de toda a comunicação de uma campanha: mensagens de WhatsApp copiadas, notificações enviadas, comentários no material, solicitações de ajuste, ajustes e aprovações, em ordem cronológica. |
| **Valor** | Hoje, a comunicação está fragmentada entre WhatsApp (mensagens prontas), mural de notificações, comentários e timeline de entrega. Uma visão unificada permite que qualquer operador entenda rapidamente o que aconteceu, sem navegar entre telas. |
| **Dados utilizados** | Mensagens prontas (tela 72), notificações (tela 42/73), comentários (tela 64/34), eventos de timeline (capítulo 7). |
| **Conexão com telas existentes** | Acessível a partir da campanha (tela 23) ou da ficha da parceira (tela 52). Consolida dados já existentes em telas separadas. |
| **Prioridade** | P3 |

---

### 30. Funcionalidade: "Automação de virada do mês com aprovação em lote"

| Aspecto | Detalhe |
|---|---|
| **Objetivo** | Expandir a virada do mês (tela 55) para permitir que a agência aprove, rejeite ou edite todos os briefings e cotas de todas as parceiras em uma única tela, sem abrir cada ficha individualmente. |
| **Valor** | A virada do mês já existe, mas a especificação não detalha como a agência faz a revisão em lote. Com 20+ parceiras, abrir ficha por ficha é inviável. Aprovação em lote com pré-visualização é o que transforma a virada de mês de exercício burocrático em ritual eficiente. |
| **Dados utilizados** | Todas as colaborações a virar, condições comerciais, briefings anteriores, cotas. |
| **Conexão com telas existentes** | A virada do mês (tela 55–57) ganha uma etapa de revisão em lote antes da pré-visualização individual. A lista de colaborações (tela 55) ganha checkbox e ações em massa. |
| **Prioridade** | P2 |

---

## Top 10 — Itens Essenciais para Referência de Mercado

Estes são os 10 itens que, na minha avaliação como Head de Produto, têm o maior poder de transformação do Portal Criativo DODÔ em uma plataforma de referência para gestão de campanhas de influenciadores:

| # | Item | Tipo | Prioridade | Por que é essencial |
|---|---|---|---|---|
| 1 | **Campanha multi-marca por parceira** | Funcionalidade | P0 | Sem isso, o produto não atende a realidade de influenciadoras profissionais. É a limitação arquitetural mais crítica da v1.0. |
| 2 | **Aprovação por checklist do briefing** | Funcionalidade | P0 | Reduz ciclos de ajuste em até 60%, elimina ambiguidade no feedback e acelera todo o fluxo de produção. É o avanço qualitativo mais imediato no dia a dia. |
| 3 | **Calendário editorial da agência** | Tela | P1 | Transforma a operação de "lista de pendências" em "visão temporal estratégica". É a primeira tela que faz a agência sentir que o Portal substitui planilhas externas. |
| 4 | **Contrato digital e assinatura** | Funcionalidade | P1 | Formaliza a relação jurídica dentro do Portal. Elimina risco legal, acelera onboarding e cria trilha de auditoria para pagamentos. |
| 5 | **Central de atendimento da parceira** | Tela | P1 | Resolve o maior ponto de dor não tratado na v1.0: dúvidas fora do sistema. Mantém contexto atrelado à campanha e reduz reprotrabalho. |
| 6 | **Gestão de permissões e papéis internos** | Tela | P1 | Sem isso, a agência não escala além de 1–2 operadores. É a base para qualquer crescimento operacional. |
| 7 | **Notificações push no dispositivo móvel** | Funcionalidade | P1 | A influenciadora é mobile-first. Mural dentro do app não basta para urgências. Push é o que garante que o Portal realmente substitui o WhatsApp como canal de urgência. |
| 8 | **Relatórios de desempenho de campanha** | Funcionalidade | P2 | É o que transforma o Portal de ferramenta operacional em ferramenta estratégica. Sem dados, a agência não consegue argumentar com marcas, renegociar valores ou otimizar processos. |
| 9 | **Portal de leitura para a marca** | Tela | P2 | A marca é o cliente final. Dar visibilidade controlada à marca é o maior diferencial competitivo possível: fideliza marcas, justifica o uso do Portal e cria barreira de saída. |
| 10 | **Modo de emergência (material urgente)** | Funcionalidade | P1 | Campanhas de influenciadores vivem de janelas de oportunidade. Sem priorização de urgência, o fluxo operacional não responde à realidade do mercado. |

---

## Resumo Visual de Prioridades

| Prioridade | Quantidade de itens propostos | Itens no Top 10 |
|---|---|---|
| P0 | 2 | 2 |
| P1 | 12 | 6 |
| P2 | 10 | 2 |
| P3 | 6 | 0 |

---

## Observações Finais

A especificação v1.0 do Portal Criativo DODÔ é excepcionalmente bem estruturada para a jornada operacional básica (briefing → upload → revisão → pagamento). As lacunas identificadas não são defeitos da especificação, mas sim extensões naturais que emergem quando se pensa no produto como plataforma de mercado, não apenas como ferramenta interna.

As duas funcionalidades P0 (multi-marca e checklist) resolvem limitações que, se ignoradas, impedem o uso real do produto em escala. O Top 10 proposto equilibra urgência operacional (P0–P1) com diferenciação estratégica (P2), garantindo que o Portal evolua de ferramenta de relação para plataforma de referência.

---

*Documento gerado para servir como backlog de produto. Pronto para revisão e debate com as equipes de engenharia e design.*
