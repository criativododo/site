# PRODUCT UX BLUEPRINT
## Portal Criativo DODÔ — Especificação Soberana de Produto e Experiência
**Versão 1.0 — documento oficial de produto — base única para implementação do frontend**

> Este documento não é técnico. Não define backend, banco, APIs ou arquitetura.
> Ele define **o que o produto é, o que cada tela significa, o que o usuário sente e quais estados existem**.
> Em caso de conflito entre este documento e qualquer especificação anterior (SPEC/ADR), **este documento prevalece para a camada de experiência**.

## NOTA DESTA REVISÃO

Esta passagem revisou o documento na íntegra em busca de fluxos ausentes, estados não considerados, telas faltantes, jornadas incompletas, inconsistências terminológicas, semiautomações mal especificadas e cobertura de acessibilidade e mobile-first — sem alterar nenhuma decisão de negócio já tomada nas versões anteriores.

O que mudou nesta revisão:
- Dois capítulos novos: **19. Acessibilidade** e **20. Mobile-first e comportamento por dispositivo**, antes ausentes ou tratados como observação isolada.
- Capítulos 19–21 da versão anterior renumerados para **21–23** (Lacunas, Perguntas, Roadmap).
- Novas entradas no inventário de telas (cap. 4), no capítulo de notificações (13.6) e nos capítulos de Lacunas e Perguntas, listadas como tal — não como requisito decidido.
- Nenhum item de `MELHORIAS_MANUS.md` foi incorporado a este documento. Onde uma lacuna encontrada aqui coincide com uma proposta daquele backlog, o texto abaixo faz referência cruzada explícita, mantendo o backlog como não aprovado (ver regra de governança no próprio `MELHORIAS_MANUS.md`).
- Em nenhum ponto desta revisão foi presumido requisito funcional onde a especificação era omissa: toda lacuna nova está registrada no capítulo 21, toda pergunta nova no capítulo 22.

---

## ÍNDICE

1. Visão do Produto
2. Jornada Completa da Influenciadora
3. Jornada Administrativa
4. Inventário Completo de Telas
5. Função Editorial de Cada Tela
6. Estados da Interface
7. Linha do Tempo Editorial
8. Briefing
9. Upload
10. Google Drive
11. Aprovação
12. WhatsApp — Semiautomações
13. Notificações
14. Financeiro
15. Entregas
16. Componentes Necessários
17. Iconografia
18. Microinterações
19. Acessibilidade
20. Mobile-first e Comportamento por Dispositivo
21. Lacunas Encontradas
22. Perguntas para Product Design
23. Roadmap (P0–P3)

---

# 1. VISÃO DO PRODUTO

## 1.1 Propósito

O Portal Criativo DODÔ é o **workspace soberano** da relação entre a agência (Estúdio Elã) e a influenciadora (parceira).
Ele existe para que **nada importante de uma campanha aconteça fora dele**.

Hoje, a colaboração vive espalhada: briefing no WhatsApp, material no Drive, feedback em áudio, pagamento em conversa, prazo na memória. O Portal recolhe tudo isso e devolve em forma de **narrativa organizada**: cada campanha tem começo, meio e fim, com registro, carimbo temporal e responsável.

## 1.2 O problema que resolve

| Problema real | Consequência hoje | Resposta do Portal |
| --- | --- | --- |
| Feedback fora do sistema | Nenhum rastro, retrabalho, ruído | Todo feedback nasce e vive dentro do Portal |
| "Meu material chegou?" | Ansiedade da criadora, suporte manual | Confirmação explícita de destino e pasta |
| Prazos invisíveis | Entregas em cima da hora | Prazo interno visível e antecipado |
| Não existe reprovar | Limbo em revisão | Estado de ajuste com motivo e reenvio |
| Pagamento opaco | Cobrança por mensagem | Extrato editorial com histórico completo |
| Cota mensal confusa | Sub-entrega involuntária | Contador de entregas restantes sempre visível |
| Rolagem manual do mês | Agência vira digitador | Mês nasce pronto; agência apenas edita |

## 1.3 Usuários

**Influenciadora (Parceira).** Não é uma usuária de sistema; é uma profissional criativa. Usa o Portal no celular, entre gravações, quase sempre com pressa. Precisa de três respostas em menos de cinco segundos: *o que preciso fazer agora*, *até quando*, *já está tudo certo com o que eu mandei*.

**Administrador / Operador (Agência).** Trabalha em desktop, em lote, com muitas parceiras ao mesmo tempo. Precisa de *o que está atrasado*, *o que exige minha decisão*, *o que posso pagar*. Cada clique a mais é custo operacional.

**Marca (Cliente).** Não possui acesso. Existe conceitualmente: suas exigências chegam traduzidas em briefing pela agência. **Nenhuma tela é construída para a marca nesta versão** — apenas a possibilidade futura de exportar uma visão de campanha.

## 1.4 Como agência e influenciadora interagem

```
AGÊNCIA                                  INFLUENCIADORA
   |                                            |
   |— cria a colaboração do mês —————————————→  |  (vê campanha aparecer)
   |— publica briefing ——————————————————————→  |  (lê, confirma leitura)
   |                                            |
   |  ←—————————————————— envia material —————— |
   |— revisa —————————————————————————————————  |
   |— aprova  |  pede ajuste ————————————————→  |  (corrige, reenvia)
   |— registra publicação ———————————————————→  |
   |— libera pagamento ——————————————————————→  |  (vê extrato + comprovante)
   |                                            |
   └——————————— encerra a competência ————————→ histórico
```

A relação é **assimétrica por design**: a agência é a única autoridade sobre estados; a influenciadora é a única autoridade sobre o material. Ninguém edita o lado do outro.

## 1.5 Filosofia

1. **Revista, não painel.** Hierarquia por peso editorial, não por grid simétrico de KPIs.
2. **A tela nasce da sua função, não do componente.** Antes de layout, define-se *o que aquela página é no fluxo da relação*.
3. **A moldura recua, o conteúdo lidera.** "Sublinhe, não emoldure": espaço em branco e tipografia antes de bordas e caixas.
4. **Nenhum estado implícito.** Se o sistema sabe algo, o usuário vê. Se não sabe, o sistema diz que não sabe.
5. **Editorial não é lento.** Beleza nunca pode esconder urgência. Pendência quente tem prioridade sobre estética.
6. **Tudo tem carimbo.** Quem, quando, o quê. Sempre.
7. **Nada se apaga.** Só se arquiva ou inativa. O histórico é o produto.
8. **Minúscula editorial** em rótulos de interface; capitulação apenas em nomes próprios e conteúdo autoral.
9. **O WhatsApp é braço do Portal, nunca o contrário.** Mensagem é gerada aqui e levada para lá.

---

# 2. JORNADA COMPLETA DA INFLUENCIADORA

## 2.1 Mapa macro

```
convite → primeiro acesso → definir senha → completar perfil
   → conta em análise → ativação
   → campanhas (colaboração do mês)
   → briefing (leitura + confirmação)
   → produção (prazo interno visível)
   → upload → destino confirmado
   → em revisão
        ├── aprovado → publicado
        └── ajuste solicitado → nova produção → novo envio
   → competência fechada → pagamento → comprovante
   → histórico → encerramento
```

## 2.2 Etapas detalhadas

### E1 — Convite
Recebe link por WhatsApp/e-mail, gerado pela agência.
Bifurcações: link válido · link expirado (pedir novo) · link já utilizado (leva ao login) · link inválido.
Tela de convite mostra: nome da agência, nome da parceira, o que vai acontecer nos próximos 3 passos.

### E2 — Primeiro acesso
Define senha, aceita termos e política de privacidade. Nunca escolhe status ou papel.
Bifurcações: senha fraca · termos não aceitos · sessão interrompida (retomar de onde parou).

### E3 — Completar perfil
Formulário editorial em blocos, com progresso: **identidade → contato → endereço → dados de pagamento (PIX) → redes**.
Regra de produto: o perfil **nunca dá erro de "perfil não encontrado"**. No primeiro acesso o perfil já existe, vazio, pronto para ser preenchido.
Bloqueios explicados: sem **endereço** e **PIX**, o contrato não pode ser gerado e o pagamento não pode ser liberado — e a tela diz isso com todas as letras, sem jargão.
Bifurcações: perfil parcial (salvar e continuar depois) · dado inválido · perfil completo.

### E4 — Conta em análise
Toda parceira nasce **inativa**. Entre completar perfil e ser ativada pela agência existe um estado real, com tela própria: "seu cadastro está com a agência". Nunca uma tela em branco, nunca um erro.
Bifurcações: ativada · pendência de documento · recusada (com motivo e canal de contato).

### E5 — Campanhas
Lista das colaborações mensais. Cada card mostra: mês de referência, marca, cota (reels / carrossel / stories), quanto já foi entregue, próxima data crítica.
Bifurcações: nenhuma campanha ainda · campanha do mês aberta · meses anteriores · campanha encerrada.

### E6 — Briefing
Leitura em formato de matéria: contexto, look, orientação, data de entrega, data de postagem, prazo interno.
Ao final: **"li e entendi"** (confirmação de leitura). O sistema registra primeira leitura e última leitura.
Bifurcações: briefing ainda não publicado · publicado e não lido · lido e não confirmado · confirmado · atualizado após confirmação (exige nova confirmação, com destaque do que mudou).

### E7 — Produção
Não é uma tela de trabalho; é uma tela de **acompanhamento do compromisso**: contagem regressiva até o prazo interno, cota restante, materiais já enviados.
Bifurcações: dentro do prazo · prazo interno hoje · prazo interno vencido · postagem em risco.

### E8 — Upload
Ver capítulo 9. Termina apenas com **confirmação de pasta de destino**.

### E9 — Revisão
Estado de espera com expectativa clara: quem está revisando e prazo estimado de retorno.
Bifurcações: aprovado · ajuste solicitado · reprovado definitivamente.

### E10 — Ajuste
Recebe comentário estruturado (o que ajustar, por quê, até quando). Reenvia. O material antigo não desaparece: vira versão anterior.

### E11 — Aprovação
Momento de celebração discreta. Mostra data, hora e quem aprovou.

### E12 — Publicação
A agência registra a publicação (data, hora, link do post quando houver). A influenciadora vê a confirmação e pode informar que já publicou.

### E13 — Pagamento
Extrato editorial da competência: valor, condição, data prevista, status, comprovante.
Bifurcações: bloqueado (há entrega pendente — o Portal diz *qual*) · liberado · aprovado · enviado · pago · divergência reportada.

### E14 — Histórico
Arquivo pessoal de tudo: campanhas, materiais, aprovações, pagamentos, com filtro por mês e marca.

### E15 — Fim da campanha
Fechamento editorial da competência: resumo do mês, entregas realizadas, valor pago, e a próxima competência já anunciada quando existir.

## 2.3 Bifurcações transversais
Sessão expirada · sem internet · upload interrompido · dispositivo trocado · dados de pagamento desatualizados · parceira inativada no meio da campanha (acesso somente leitura ao histórico).

---

# 3. JORNADA ADMINISTRATIVA

## 3.1 Mapa macro

```
cadastro da parceira → contrato/condição comercial → ativação
   → virada do mês (colaboração materializada automaticamente)
   → revisar e ajustar briefings → publicar briefings
   → acompanhar leitura e produção (mesa de decisão)
   → receber material → revisar
        ├── aprovar
        └── solicitar ajuste (com motivo obrigatório)
   → registrar publicação
   → conferir portão financeiro da competência
   → aprovar → enviar → pagar → anexar comprovante
   → encerrar competência → arquivo
```

## 3.2 Etapas detalhadas

**A1 — Cadastro da parceira.** Dados institucionais, condição comercial (quantidade de reels, carrossel, stories, valor). A condição comercial é o **contrato soberano**: tudo depois deriva dela. Duplicidade de CNPJ, e-mail ou handle é impedida com mensagem clara. Status inicial sempre **inativa**.

**A2 — Convite e ativação.** Gera convite, acompanha o estado do onboarding, ativa quando o perfil estiver apto (endereço + PIX presentes).

**A3 — Virada do mês.** A colaboração do mês nasce pronta a partir da condição comercial: briefings e entregas em rascunho, obrigação financeira em aberto. A agência **revisa e publica**, não digita. Existe tela de pré-visualização da virada, com possibilidade de excluir ou ajustar itens antes de confirmar.

**A4 — Briefing.** Preenche look, orientação, data de entrega e data de postagem. O **prazo interno** é calculado automaticamente (postagem − 7 dias; se cair em sexta, sábado ou domingo, antecipa para a quinta anterior) e aparece como informação editorial, não como campo técnico. Publica; a partir daí a leitura passa a ser rastreada. Alterar um briefing publicado exige **republicar**, e a parceira precisa confirmar de novo.

**A5 — Mesa de decisão (dashboard).** Três blocos narrativos:
- **atenção agora** — atrasos reais, materiais aguardando revisão, contas pendentes, solicitações de privacidade;
- **o que vem a seguir** — prazos internos dos próximos dias;
- **pode esperar** — operação normal, escrita em prosa curta, não em lista.
Ação sem sair do contexto: aprovar, pedir ajuste, abrir material, copiar mensagem — tudo em painel lateral ou modal, **sem navegação profunda**.

**A6 — Revisão.** Ver material, comparar com o briefing, decidir. Pedir ajuste exige motivo. Aprovar registra autor e horário.

**A7 — Publicação.** Registra que o conteúdo foi ao ar. Fecha o ciclo do material e o arquiva.

**A8 — Financeiro.** A competência só libera pagamento quando **todas** as entregas estiverem aprovadas ou publicadas. Quando bloqueada, o Portal mostra exatamente **quais entregas** faltam e permite agir a partir dali. Existe caminho de exceção documentado (liberação antecipada com justificativa registrada) — ver capítulo 21.

**A9 — Encerramento.** Fecha a competência, gera resumo, arquiva materiais, abre a próxima.

**A10 — Transversais.** Gestão de parceiras (ativar/inativar, nunca apagar), auditoria (registra o evento, nunca o valor sensível), solicitações de privacidade, exportações.

---

# 4. INVENTÁRIO COMPLETO DE TELAS

> Congeladas e já existentes: **login**, **dashboard**, **briefing** (mantidas como referência de linguagem).

## 4.1 Acesso e identidade (compartilhado)
1. login *(congelada)*
2. convite recebido
3. convite expirado / inválido
4. definir senha (primeiro acesso)
5. recuperar acesso — solicitar
6. recuperar acesso — verificar
7. recuperar acesso — nova senha
8. termos e privacidade
9. sessão expirada
10. logout / até logo

## 4.2 Onboarding da influenciadora
11. boas-vindas (o que vai acontecer)
12. completar perfil — identidade
13. completar perfil — contato
14. completar perfil — endereço
15. completar perfil — dados de pagamento (PIX)
16. completar perfil — redes sociais
17. perfil incompleto (retomar)
18. conta em análise
19. conta recusada / pendência
20. conta ativada (transição)

## 4.3 Área da influenciadora
21. dashboard da influenciadora *(congelada)*
22. campanhas — lista
23. campanha — visão do mês
24. briefing — leitura *(congelada)*
25. briefing — atualizado (o que mudou)
26. briefing — confirmação de leitura
27. produção / meus prazos
28. entrega — detalhe (timeline própria)
29. upload — seleção
30. upload — em andamento
31. upload — concluído (confirmação de pasta)
32. upload — falhou / retomar
33. material em revisão
34. material com ajuste solicitado
35. material reprovado
36. material aprovado
37. material publicado
38. versões do material (histórico de envios)
39. financeiro — extrato
40. financeiro — pagamento (detalhe + comprovante)
41. financeiro — pendência bloqueando pagamento
42. notificações
43. histórico geral
44. perfil — visualização
45. perfil — edição
46. segurança da conta (senha, sessões)
46a. meus dados — privacidade (solicitar exportação ou exclusão — LGPD) *(nova nesta revisão — ver cap. 21)*
46b. preferências de notificação (canal, categorias, silêncio) *(nova nesta revisão — ver cap. 13.6)*
47. ajuda / como funciona
48. campanha encerrada — resumo do mês

## 4.4 Área administrativa
49. dashboard editorial (mesa de decisão)
50. parceiras — lista
51. parceira — ficha
52. parceira — cadastro/edição
53. parceira — condição comercial
54. parceira — convite e ativação
55. colaborações mensais — lista
56. virada do mês — pré-visualização
57. virada do mês — confirmação
58. briefings — lista
59. briefing — editor
60. briefing — publicar / republicar
61. briefing — leitura e confirmação (quem leu, quando)
62. entregas — lista (por temperatura)
63. entrega — revisão (material + briefing lado a lado)
64. entrega — solicitar ajuste (motivo)
65. entrega — aprovar
66. entrega — registrar publicação
67. financeiro — competências
68. financeiro — obrigação (detalhe e histórico)
69. financeiro — pagamento em lote
70. financeiro — anexar comprovante
71. financeiro — bloqueio (o que falta)
72. mensagens prontas (WhatsApp)
73. notificações administrativas
74. auditoria / linha do tempo do sistema
75. solicitações de privacidade
76. arquivo / histórico da agência
77. configurações da agência
78. encerrar competência

## 4.5 Telas de sistema e exceção
79. carregando (esqueleto editorial)
80. vazio — sem campanhas
81. vazio — sem materiais
82. vazio — sem notificações
83. vazio — sem pagamentos
84. sem internet / modo offline
85. erro de upload
86. erro de conexão com o armazenamento
87. acesso negado (403)
88. não encontrado (404)
89. erro do sistema (500)
90. manutenção programada
91. conteúdo bloqueado (conta inativa)
92. ação irreversível — confirmação
93. sucesso — confirmação de ação
94. busca sem resultado

---

# 5. FUNÇÃO EDITORIAL DE CADA TELA

> Cada tela tem **uma** função. Se tiver duas, deve virar duas telas.

## 5.1 Acesso
| Tela | Função editorial |
| --- | --- |
| login | porta |
| convite | carta-convite |
| convite expirado | porta fechada com endereço |
| definir senha | chave |
| recuperar acesso | segunda chave |
| termos | contrato de leitura |
| sessão expirada | pausa, não punição |
| logout | despedida cordial |

## 5.2 Onboarding
| Tela | Função editorial |
| --- | --- |
| boas-vindas | apresentação |
| perfil — identidade | quem é você |
| perfil — contato | como te encontramos |
| perfil — endereço | onde você existe legalmente |
| perfil — PIX | como você recebe |
| perfil — redes | sua vitrine |
| perfil incompleto | marcador de página |
| conta em análise | sala de espera com hora marcada |
| conta ativada | abertura de cortina |

## 5.3 Influenciadora
| Tela | Função editorial |
| --- | --- |
| dashboard | mesa de trabalho |
| campanhas | sumário da revista |
| campanha do mês | capa da edição |
| briefing | narrativa |
| briefing atualizado | errata |
| confirmação de leitura | assinatura de recebimento |
| produção | agenda |
| entrega — detalhe | dossiê |
| upload — seleção | preparação da entrega |
| upload — em andamento | trânsito |
| upload — concluído | recibo |
| upload — falhou | tentativa interrompida |
| em revisão | sala de espera editorial |
| ajuste solicitado | carta do editor |
| reprovado | veredito |
| aprovado | selo |
| publicado | vitrine |
| versões | rascunhos guardados |
| financeiro | extrato |
| pagamento (detalhe) | comprovante |
| notificações | mural |
| histórico | arquivo pessoal |
| perfil | identidade |
| segurança | cofre |
| ajuda | manual da casa |
| campanha encerrada | epílogo |

## 5.4 Administração
| Tela | Função editorial |
| --- | --- |
| dashboard editorial | redação |
| parceiras | elenco |
| ficha da parceira | perfil biográfico |
| condição comercial | contrato soberano |
| colaborações mensais | pauta do mês |
| virada do mês | fechamento de edição |
| briefings | pautas |
| editor de briefing | escrivaninha |
| leitura do briefing | comprovante de leitura |
| entregas | bancada de revisão |
| revisão | mesa de edição |
| solicitar ajuste | carta ao autor |
| aprovar | carimbo |
| registrar publicação | ida às bancas |
| financeiro | tesouraria |
| bloqueio financeiro | portão |
| mensagens prontas | redação de recados |
| auditoria | livro de registro |
| privacidade | cartório |
| encerrar competência | fechamento |

## 5.5 Sistema
| Tela | Função editorial |
| --- | --- |
| carregando | preparação da página |
| vazio | página em branco com convite |
| offline | silêncio temporário |
| 403 | porta reservada |
| 404 | página inexistente |
| 500 | pane honesta |
| manutenção | aviso na porta |
| confirmação | pergunta séria |

---

# 6. ESTADOS DA INTERFACE

## 6.1 Estados universais (valem para toda tela)
`carregando` · `carregado` · `vazio` · `erro de carregamento` · `offline` · `sem permissão` · `sessão expirada` · `somente leitura` · `salvando` · `salvo` · `falha ao salvar` · `desatualizado (dados mudaram)`

**Regras:**
- Carregando usa **esqueleto editorial** (linhas de texto), nunca spinner de página inteira.
- Todo estado vazio tem: frase editorial + explicação do porquê + uma ação possível (ou a informação de que não há ação).
- Todo erro tem: o que aconteceu, o que o usuário pode fazer, e se algo foi perdido.

## 6.2 Estados por tela

**login** — inicial · validando · credencial inválida · conta inativa · conta bloqueada · muitas tentativas · sucesso.

**convite** — válido · expirado · já usado · inválido · revogado.

**completar perfil** — vazio · parcialmente preenchido · campo inválido · salvando · salvo parcialmente · completo · bloqueado por conta inativa.

**conta em análise** — aguardando análise · pendência solicitada · recusada · ativada.

**campanhas** — sem campanhas · primeira campanha · campanha aberta · campanha com pendência · campanha atrasada · campanha encerrada · meses anteriores.

**briefing** — não publicado (invisível à parceira) · publicado não lido · lido não confirmado · confirmado · atualizado após confirmação · republicado · arquivado.

**produção** — dentro do prazo · prazo interno em 3 dias · prazo interno amanhã · prazo interno hoje · prazo interno vencido · postagem em risco · concluída.

**upload** — ocioso · arquivo selecionado · arquivo inválido (tipo/tamanho) · enviando (% e velocidade) · pausado · retomando · falhou (rede) · falhou (armazenamento) · recebido pelo Portal · gravando no destino · **confirmado na pasta** · cancelado.

**material** — aguardando material · enviado · em revisão · ajuste solicitado · reenviado · aprovado · reprovado · publicado · arquivado.

**financeiro (parceira)** — sem lançamentos · bloqueado por entrega pendente · em aberto · aprovado · enviado · pago · comprovante disponível · divergência reportada.

**financeiro (agência)** — competência aberta · portão bloqueado · elegível · aprovado · enviado ao pagamento · pago · comprovante anexado · estornado/corrigido.

**notificações** — sem notificações · não lidas · todas lidas · agrupadas por categoria · urgência ativa.

**dashboard administrativo** — sem pendências (prosa de tranquilidade) · com pendências quentes · fila longa (mais de N itens) · erro parcial de carregamento (bloco degradado, resto funcional).

**entrega (revisão admin)** — aguardando material · pronta para revisão · em revisão por outro operador (bloqueio suave com aviso) · decidida.

**perfil** — completo · incompleto · com dado sensível oculto · em edição · alteração de PIX exigindo reconfirmação.

---

# 7. LINHA DO TEMPO EDITORIAL

A **timeline** é a espinha dorsal do produto. Existe em três escalas: **campanha**, **entrega** e **pagamento**. Mesmo motor, mesma linguagem, públicos diferentes.

## 7.1 Catálogo de eventos

| # | Evento | Ator | Visível para parceira | Visível para agência |
| --- | --- | --- | --- | --- |
| 1 | campanha criada | agência | sim (como "campanha aberta") | sim |
| 2 | condição comercial registrada | agência | resumo (cotas) | completo |
| 3 | briefing criado | agência | não | sim |
| 4 | briefing publicado | agência | sim | sim |
| 5 | briefing visualizado — primeira leitura | parceira | sim | sim |
| 6 | briefing visualizado — última leitura | parceira | sim | sim |
| 7 | leitura confirmada | parceira | sim | sim |
| 8 | briefing atualizado | agência | sim (com diferenças) | sim |
| 9 | briefing republicado | agência | sim | sim |
| 10 | prazo interno definido | sistema | sim | sim |
| 11 | lembrete de prazo enviado | sistema | sim | sim |
| 12 | upload iniciado | parceira | sim | sim |
| 13 | upload concluído (recebido) | parceira | sim | sim |
| 14 | material gravado na pasta definitiva | sistema | sim (com nome da pasta) | sim |
| 15 | material enviado para revisão | parceira | sim | sim |
| 16 | revisão iniciada | agência | sim ("em revisão por…") | sim |
| 17 | ajuste solicitado | agência | sim (com motivo) | sim |
| 18 | novo envio (versão n) | parceira | sim | sim |
| 19 | material aprovado | agência | sim | sim |
| 20 | material reprovado | agência | sim (com motivo) | sim |
| 21 | publicação registrada | agência | sim | sim |
| 22 | link da publicação adicionado | ambos | sim | sim |
| 23 | competência elegível ao pagamento | sistema | sim | sim |
| 24 | pagamento aprovado | agência | sim | sim |
| 25 | pagamento enviado | agência | sim | sim |
| 26 | pagamento realizado | agência | sim | sim |
| 27 | comprovante anexado | agência | sim | sim |
| 28 | divergência reportada | parceira | sim | sim |
| 29 | competência encerrada | agência | sim | sim |
| 30 | material arquivado | sistema | sim (histórico) | sim |
| 31 | conta ativada / inativada | agência | sim | sim |
| 32 | dado sensível alterado (evento, nunca o valor) | ambos | sim | sim |

## 7.2 Regras de apresentação
- Cada evento carrega **quem, quando (data e hora), o quê** e, quando aplicável, **por quê**.
- Eventos do sistema têm voz neutra; eventos humanos citam a pessoa.
- A timeline é **cronológica descendente** na visão de acompanhamento e **ascendente** na visão de arquivo/leitura de história.
- Eventos de mesma natureza em sequência (várias leituras) são **agrupados** com contador expansível.
- A parceira nunca vê eventos internos que não a envolvam (rascunhos, notas internas).

---

# 8. BRIEFING

## 8.1 Estados canônicos
`criado` → `publicado` → `visualizado (1ª leitura)` → `última leitura` → `confirmado` → `atualizado` → `republicado` → `arquivado`

## 8.2 Conteúdo editorial do briefing
Contexto da marca · objetivo do conteúdo · look · orientação criativa · referências · formato (reels/carrossel/stories) · o que não fazer · data de entrega · data de postagem · **prazo interno de aprovação** · responsável da agência.

## 8.3 Prazo interno
Regra de produto: **prazo interno = data de postagem − 7 dias**; se cair em sexta, sábado ou domingo, antecipa para a **quinta-feira anterior**.
Apresentação: nunca como campo de sistema. Aparece como frase editorial — *"para publicar no dia 22, seu material precisa estar aqui até quinta, dia 12."*

## 8.4 Como leitura e confirmação aparecem
**Para a parceira:** rodapé do briefing com a ação "li e entendi". Depois de confirmado, vira uma linha discreta: *"leitura confirmada em 3 de agosto, 21h14."*
**Para a agência:** na lista de briefings, cada item mostra um selo de leitura em três níveis — **não publicado**, **publicado sem leitura**, **lido**, **confirmado** — com data da primeira e da última leitura no detalhe.

## 8.5 Atualização de briefing publicado
1. A agência edita e escolhe **republicar**.
2. O sistema marca o briefing como `atualizado` e destaca **o que mudou** (campos alterados, valor anterior → novo).
3. A confirmação anterior é invalidada; a parceira precisa confirmar de novo.
4. Uma mensagem pronta de WhatsApp é sugerida imediatamente.
5. A timeline registra as duas versões.

---

# 9. UPLOAD

## 9.1 Princípio
> O upload **não termina quando o arquivo sai do celular**. Termina quando o Portal confirma que o arquivo está **na pasta definitiva**, com nome, data e responsável.

## 9.2 Fluxo

```
influenciadora seleciona
      ↓ validação local (tipo, tamanho, quantidade, cota)
enviando ao Portal  ——— pode pausar / retomar / cancelar
      ↓
recebido pelo Portal (arquivo íntegro)
      ↓
gravando no armazenamento definitivo
      ↓
pasta correta identificada
      ↓
CONFIRMAÇÃO: "está salvo em <pasta> · 3 ago, 21h14"
      ↓
registro no histórico + material entra em revisão
```

## 9.3 Estados e o que a interface diz
| Estado | O que a tela comunica |
| --- | --- |
| ocioso | o que enviar, quantos faltam da cota, até quando |
| arquivo inválido | qual regra falhou e como corrigir |
| acima da cota | quantos já foram enviados e o que fazer |
| enviando | progresso por arquivo, tempo estimado, "pode sair da tela? sim/não" |
| pausado | como retomar |
| falha de rede | tentativa automática + botão de retomar, sem perder progresso |
| recebido | "chegou ao Portal — estamos guardando" |
| gravando no destino | passo explícito, não escondido |
| confirmado | pasta, data, hora, responsável, acesso rápido ao arquivo |
| falha ao gravar | mensagem honesta: "chegou até nós, mas não conseguimos guardar. já sabemos disso." + reenvio |
| cancelado | nada foi guardado, dito com clareza |

## 9.4 Regras
- Upload múltiplo com estado **independente por arquivo**.
- Sair da tela não cancela o envio; existe indicador global persistente.
- Nunca declarar sucesso antes da confirmação de destino.
- Cada envio gera uma **versão**; nada é sobrescrito silenciosamente.

---

# 10. GOOGLE DRIVE (ARMAZENAMENTO)

## 10.1 Promessa ao usuário
**A influenciadora nunca deve ter dúvida se o material chegou.**

## 10.2 O que a interface sempre mostra após um envio
1. Confirmação explícita de armazenamento.
2. **Nome legível da pasta de destino** (ex.: `campanha agosto / reels / look 2`), não caminho técnico cru.
3. Data e hora da gravação.
4. Responsável (quem enviou / quem recebeu).
5. Acesso rápido: abrir arquivo, abrir pasta, copiar link.
6. Registro permanente no histórico do material e da campanha.

## 10.3 Estados de armazenamento
`aguardando gravação` · `gravado` · `pasta indisponível` · `sem permissão de acesso` · `arquivo movido` · `arquivo removido pela agência` · `armazenamento fora do ar`.

## 10.4 Regras de comunicação em falha
- Falha de permissão nunca aparece como código de erro. Aparece como: *"não conseguimos acessar essa pasta agora. seu arquivo está seguro conosco e a agência já foi avisada."*
- Se a pasta institucional esperada não estiver visível para o sistema, o material vai para um destino provisório **visível e nomeado**, jamais para um limbo silencioso.
- Toda movimentação de pasta feita pela agência gera evento na timeline.

---

# 11. APROVAÇÃO

## 11.1 Estados
`aguardando material` → `enviado` → `em revisão` → { `ajuste solicitado` | `reprovado` | `aprovado` } → `publicado` → `arquivado`
`ajuste solicitado` → `reenviado` → `em revisão` (ciclo, com contador de versões)

## 11.2 Diferença de produto entre ajuste e reprovação
- **ajuste solicitado**: o material serve, precisa de correção. Volta para a parceira com motivo, itens objetivos e novo prazo. O compromisso continua o mesmo.
- **reprovado**: o material não será usado. Exige motivo, e o sistema pergunta explicitamente se uma nova entrega será solicitada (gerando ou não novo ciclo).

## 11.3 Regras de feedback
- Motivo é **obrigatório** em ajuste e reprovação. Sem motivo, a ação não conclui.
- Feedback é estruturado: *o que ajustar* (lista) + *comentário livre* + *novo prazo*.
- Comentários vivem no Portal, ancorados ao material e à versão. Nada de feedback solto.
- A parceira pode responder ao comentário sem mudar o estado (conversa dentro do dossiê).
- Toda decisão registra **quem** e **quando**.
- Duas pessoas da agência não revisam o mesmo material ao mesmo tempo sem aviso (bloqueio suave: *"Ana abriu esta revisão há 2 minutos"*).

## 11.4 Publicação
Registrar publicação é um ato explícito da agência, com data, hora e link opcional. Só então o material é arquivado e conta para o portão financeiro.

---

# 12. WHATSAPP — SEMIAUTOMAÇÕES

## 12.1 Princípio
Sem bots. O Portal **escreve**, o humano **envia**. Toda mensagem é gerada com dados reais, exibida para revisão, copiável em um toque, com registro de que foi copiada/enviada.

## 12.2 Momentos que geram mensagem pronta
| Momento | Destinatário | Essência da mensagem |
| --- | --- | --- |
| convite criado | parceira | boas-vindas + link + o que fazer |
| conta ativada | parceira | acesso liberado |
| pendência no cadastro | parceira | o que falta |
| briefing publicado | parceira | briefing disponível + prazo interno |
| briefing republicado | parceira | mudou algo, precisa reler |
| briefing sem leitura há X dias | parceira | lembrete gentil |
| prazo interno em 3 dias | parceira | aviso antecipado |
| prazo interno amanhã | parceira | urgência |
| prazo interno vencido | parceira | cobrança cordial |
| material recebido | parceira | confirmação de recebimento |
| material em revisão | parceira | previsão de retorno |
| ajuste solicitado | parceira | o que ajustar + novo prazo |
| material aprovado | parceira | aprovação |
| publicação registrada | parceira | conteúdo no ar |
| competência elegível | interno | pode pagar |
| pagamento realizado | parceira | pago + comprovante |
| divergência reportada | interno | conferir |
| nova campanha disponível | parceira | nova colaboração aberta |
| competência encerrada | parceira | resumo do mês |

## 12.3 Regras
- Tom editorial DODÔ, primeira pessoa da agência, sem emoji excessivo, sem linguagem de robô.
- Variáveis sempre resolvidas (nunca `{nome}` cru na tela).
- Nunca incluir dado sensível (PIX, documento) no texto gerado.
- Botões: copiar texto · abrir WhatsApp · marcar como enviada.
- Histórico: *"mensagem de aprovação copiada por Ana em 3 ago, 21h20"*.

---

# 13. NOTIFICAÇÕES

## 13.1 Categorias
campanhas · briefings · uploads · revisões · aprovações · publicações · pagamentos · mensagens · urgências · novidades · histórico/sistema.

## 13.2 Níveis
| Nível | Comportamento |
| --- | --- |
| urgente | destaque no topo, cor de alerta, persiste até resolver |
| ação necessária | contador no ícone, entra em "atenção agora" |
| informativa | aparece no mural, some da contagem após lida |
| histórico | não notifica, apenas registra |

## 13.3 Para a influenciadora
Aparece como **mural**: agrupado por campanha, com uma linha de ação por item. Nunca sino cheio de ruído. Máximo de um item urgente visível ao mesmo tempo. Regra: *se a notificação não pede nada, ela não pode parecer que pede.*

## 13.4 Para a agência
Aparece como **feed da redação**, ligado à temperatura do dashboard: quente (revisar, atraso, conta pendente), morno (prazos próximos), frio (registro). Agrupamento por parceira e por competência. Ações inline.

## 13.5 Regras gerais
- Toda notificação tem origem rastreável na timeline.
- Marcar como lida nunca apaga o evento.
- Estado vazio: *"nada precisa da sua atenção agora."*

## 13.6 Preferências de notificação *(nova nesta revisão)*
A especificação original define categorias e níveis (13.1–13.2) mas não onde nem como o usuário controla o que recebe. Proposta de estrutura mínima, sujeita a validação de produto:
- Categorias **urgentes** (cap. 13.2) nunca são silenciáveis — são o motivo de existir do nível.
- Categorias **informativas** e de **histórico/sistema** podem ser desativadas por canal, individualmente, na tela "preferências de notificação" (tela 46b, cap. 4.3).
- Canal é uma escolha por categoria, não global: ex. "prazo interno" via WhatsApp + mural; "novidades da agência" só via mural.
- Não existe "silêncio total": pelo menos um canal permanece ativo para a categoria urgente, sempre.
- Cadência de lembretes automáticos (quantos, com que intervalo, antes de considerar escalonamento) não está definida nesta versão — ver cap. 22, Q relacionada.

---

# 14. FINANCEIRO

## 14.1 Princípio
Extrato editorial, não tabela bancária. O pagamento é **uma história com etapas**, não uma célula com status.

## 14.2 Ciclo de um pagamento
```
criado → elegível (portão liberado) → aprovado → enviado → pago → comprovante anexado → encerrado
                    ↑
            bloqueado (entrega pendente)
```

## 14.3 O que cada pagamento registra
valor · competência (mês) · condição comercial de origem · criado (quem/quando) · aprovado (quem/quando) · enviado (quem/quando) · pago (quem/quando) · método (PIX) · comprovante · observações · carimbo temporal de cada transição · divergências reportadas.

**Chave PIX nunca aparece por extenso**: exibição mascarada, com registro do *evento* de alteração, nunca do valor.

## 14.4 Apresentação
- **Parceira:** cada competência é um bloco narrativo — *"agosto · R$ X · pago em 5 de setembro, 14h02 · comprovante"* — com a timeline expandível abaixo. Sem grade densa.
- **Agência:** lista por competência com o portão em destaque. Quando bloqueado, mostra **quais entregas faltam**, com atalho de ação.

## 14.5 Portão de liberação
Regra: a competência só se torna elegível quando **todas** as entregas do período estiverem `aprovado` ou `publicado`.
Na interface, o bloqueio é **explicativo e acionável**, jamais um "não" seco: mostra o que falta, de quem depende e o caminho mais curto para resolver.

## 14.6 Divergência
A parceira pode **reportar divergência** em um pagamento (valor, data, comprovante). Isso abre um item na timeline e uma pendência para a agência — sem alterar o valor por conta própria.

---

# 15. ENTREGAS

Cada entrega é uma **unidade narrativa própria**, com dossiê e timeline independentes.

## 15.1 Timeline da entrega
```
briefing publicado
   ↓ leitura
   ↓ confirmação
   ↓ produção (prazo interno visível)
   ↓ upload
   ↓ gravação confirmada na pasta
   ↓ revisão
   ↓ [correção → novo envio] * n
   ↓ aprovação
   ↓ publicação
   ↓ contabilizada no pagamento
   ↓ arquivada
```

## 15.2 Dossiê da entrega
Cabeçalho (formato, look, campanha, mês) · estado atual em uma frase · próximo passo e de quem é a vez · prazos (entrega, interno, postagem) · material atual + versões anteriores · comentários · destino de armazenamento · timeline completa.

## 15.3 Regra de "de quem é a vez"
Toda entrega, em qualquer estado, exibe explicitamente **quem deve agir agora**: *sua vez* · *vez da agência* · *nada a fazer*. Esta é a informação mais importante da tela.

## 15.4 Cota
Toda tela de campanha mostra o saldo do contrato: *"reels 2 de 3 · carrossel 1 de 1 · stories 4 de 8"*, sempre visível durante produção e upload.

---

# 16. COMPONENTES NECESSÁRIOS

**Estrutura editorial:** cabeçalho de matéria · bloco narrativo · sumário de edição · separador editorial · citação/destaque · rodapé de contexto.

**Navegação:** navegação principal recolhível · trilha de contexto · alternador de competência (mês) · busca global · painel lateral de detalhe (sem trocar de página).

**Dados e estado:** selo de estado (status pill) · selo de temperatura (quente/morno/frio) · contador de cota · contagem regressiva de prazo · marcador de leitura · indicador "de quem é a vez" · carimbo (quem/quando).

**Tempo:** timeline vertical · linha de eventos agrupáveis · stepper de progresso da entrega · feed de atividades.

**Entrada:** dropzone · upload progressivo (por arquivo) · barra de progresso global persistente · formulário em blocos com salvamento parcial · campo mascarado para dado sensível · seletor de datas com prazo derivado.

**Decisão:** barra de ações de revisão (aprovar / ajustar / reprovar) · modal de motivo obrigatório · confirmação de ação irreversível · bloqueio suave de concorrência.

**Comunicação:** caixa de comentários ancorada à versão · gerador de mensagem pronta (com copiar/abrir/marcar) · mural de notificações · alerta editorial (urgente/atenção/informativo) · aviso de sistema (offline, manutenção).

**Financeiro:** bloco de extrato · card de competência · painel de portão bloqueado · visualizador de comprovante.

**Arquivo:** card de campanha · card de material com versões · galeria/visualizador de material · lista de histórico filtrável.

**Estados:** esqueleto editorial · estado vazio editorial · estado de erro · estado offline · estado somente leitura.

---

# 17. ICONOGRAFIA

## 17.1 Princípio
Ícone é **linguagem**, não enfeite. Regras:
1. Um significado por ícone; nunca reaproveitar símbolo para dois sentidos.
2. Ícone nunca é o único portador de significado — sempre acompanhado de palavra ou cor.
3. Traço único, mesma espessura, mesma gramática visual editorial.
4. Urgência é comunicada por **cor e tipografia**, não por ícone gritante.

## 17.2 Famílias
**Estado do material:** aguardando · enviado · em revisão · ajuste solicitado · aprovado · reprovado · publicado · arquivado.
**Tempo e urgência:** prazo · contagem regressiva · atrasado · agendado · encerrado.
**Ação:** enviar · reenviar · aprovar · pedir ajuste · publicar · comentar · copiar · abrir externo · anexar.
**Conteúdo:** reels · carrossel · stories · imagem · vídeo · documento · contrato.
**Fluxo:** briefing · leitura · confirmação · versão · timeline · histórico.
**Armazenamento:** pasta · arquivo salvo · falha de gravação · link do arquivo.
**Financeiro:** valor · pagamento aprovado · pago · comprovante · bloqueio · divergência.
**Comunicação:** mensagem pronta · notificação · alerta · urgência.
**Identidade e conta:** perfil · segurança · sessão · privacidade · agência · parceira.

## 17.3 Semântica de cor
| Sentido | Uso |
| --- | --- |
| atraso real / risco | cor de alerta da marca ("cherry"), uso escasso e exclusivo |
| ação necessária | ênfase tipográfica + cor de destaque |
| sucesso/aprovado | cor sóbria de confirmação, sem verde de sistema |
| neutro/histórico | tons de texto, sem cor |

Nunca usar cor sozinha para transmitir estado (acessibilidade).

---

# 18. MICROINTERAÇÕES

| Momento | Feedback | Intenção |
| --- | --- | --- |
| upload concluído e confirmado na pasta | selo que "assenta" com pequena elevação + linha de destino que se escreve | alívio: chegou |
| progresso de upload | barra contínua com número real, nunca falso | confiança |
| briefing marcado como lido | assinatura discreta aparecendo no rodapé | compromisso registrado |
| confirmação de leitura pela agência | selo de leitura preenchendo na lista | acompanhamento constante |
| aprovação de material | carimbo suave, com data escrita em seguida | celebração contida |
| ajuste solicitado | carta que se abre com o motivo em destaque | seriedade sem punição |
| pagamento confirmado | valor que se consolida + comprovante deslizando | segurança financeira |
| mensagem copiada | confirmação inline no próprio botão | fluidez operacional |
| item resolvido no dashboard admin | item sai do bloco "atenção agora" com transição curta | sensação de progresso |
| virada do mês concluída | sumário da nova edição aparecendo em cascata leve | ritual editorial |
| contagem regressiva mudando de faixa | mudança de peso tipográfico, não piscar | urgência elegante |
| salvamento parcial de perfil | "salvo" discreto ao lado do bloco | não perder trabalho |
| reconexão após offline | faixa que recolhe sozinha ao voltar | continuidade |

**Regras:** duração curta (150–300ms), sem bounce, sem confete; movimento sempre a serviço da compreensão; respeitar "reduzir movimento".

---

# 19. ACESSIBILIDADE

## 19.1 Princípio
O Portal é usado, em partes iguais, por uma criadora com pressa no celular e por uma operadora que revisa dezenas de materiais em sequência no desktop. Acessibilidade aqui não é conformidade formal isolada — é a mesma filosofia editorial ("nenhum estado implícito", "urgência sempre vence estética") aplicada a quem não enxerga bem, não ouve, não usa mouse, ou está sob luz solar direta gravando conteúdo na rua.

**Meta de referência:** WCAG 2.1 nível AA como piso qualitativo para todas as telas de produção (P0–P1). Nível de conformidade formal e processo de auditoria ficam como pergunta aberta — ver capítulo 22.

## 19.2 Cor e contraste
- Contraste mínimo 4.5:1 para texto de corpo e 3:1 para texto grande/ícone informativo, em qualquer combinação de tema.
- A cor de alerta da marca ("cherry", cap. 17.3) precisa de par verificado de contraste sobre os fundos editoriais reais do Portal, não apenas sobre branco — validar antes de virar padrão de uso escasso.
- **Nenhum estado é comunicado só por cor** (regra já registrada no cap. 17.3): todo selo de estado carrega texto ou ícone rotulado junto da cor.
- Modo escuro está fora de escopo nesta versão (cap. 22, Q24); ainda assim, o contraste deve ser validado no tema claro real do produto, não em mockup isolado.

## 19.3 Navegação por teclado (foco: área administrativa)
- Toda ação da barra de revisão (aprovar / ajustar / reprovar, cap. 16) é alcançável e executável só com teclado, com ordem de tabulação que segue a hierarquia editorial da tela, não a ordem do DOM.
- Painel lateral de detalhe (cap. 16, "sem trocar de página") precisa de gerenciamento de foco explícito: foco move para dentro do painel ao abrir, e retorna ao elemento que o abriu ao fechar — sem isso, quem navega por teclado se perde na mesa de decisão (tela 49).
- Modal de motivo obrigatório (ajuste/reprovação, cap. 11) prende o foco (focus trap) e é fechável por Esc, com confirmação se houver texto não salvo.
- Atalhos de teclado para ações de alta frequência do operador (aprovar, próximo item da fila) ficam como oportunidade P2 — não é requisito desta versão, apenas registrado como possibilidade.

## 19.4 Leitor de tela e conteúdo dinâmico
- Estados assíncronos que hoje são só visuais — progresso de upload (cap. 9.3), "salvando"/"salvo" (cap. 6.1), contagem regressiva mudando de faixa (cap. 18) — precisam de uma região `aria-live` educada (polite) para progresso e "assertive" apenas para falha, para não interromper leitura em andamento.
- Esqueleto editorial (loading, cap. 6.1) é anunciado como "carregando conteúdo", não lido como uma sequência de linhas vazias sem sentido.
- Selo "de quem é a vez" (cap. 15.3) — a informação mais importante da tela de entrega — precisa ter equivalente textual explícito lido antes do restante do dossiê, não apenas destaque visual.
- Toda imagem/vídeo enviado pela parceira ou pela agência (referência, material, comprovante) exige texto alternativo ou legenda mínima gerada pelo contexto (ex.: "material — reels, versão 2, enviado 3 ago"), nunca `alt` vazio em conteúdo que carrega decisão.

## 19.5 Formulários e erros
- Todo campo em formulário em blocos (perfil, cap. 8) associa rótulo, mensagem de erro e texto de ajuda ao input via atributos de acessibilidade — erro nunca aparece só como borda vermelha.
- Erro de validação é anunciado no momento em que ocorre (ao sair do campo ou ao tentar salvar), não apenas em texto silencioso acima do formulário.
- Campo mascarado para dado sensível (PIX, cap. 16) informa ao leitor de tela que o valor está mascarado e como revelar, quando revelar for permitido.

## 19.6 Alvos de toque e gestos (mobile)
- Alvo mínimo de toque 44×44px em qualquer ação da experiência da influenciadora — ela usa o Portal com uma mão, entre uma gravação e outra.
- Nenhuma ação crítica (confirmar envio, aprovar leitura de briefing) depende de gesto complexo (swipe, long-press) sem alternativa por toque simples.
- Dropzone de upload (cap. 16) tem alternativa explícita de seleção por toque/clique — nunca depende só de arrastar.

## 19.7 Movimento e sensibilidade
- Toda animação do capítulo 18 respeita `prefers-reduced-motion` do sistema operacional automaticamente.
- Além do respeito automático, fica registrada como lacuna (cap. 21) a ausência de um controle explícito dentro do Portal para quem quer reduzir movimento sem mexer no sistema operacional inteiro.

## 19.8 Idioma e leitura
- Conteúdo autoral (briefing, comentários) mantém o idioma original de quem escreveu; rótulos de interface são sempre em português editorial (cap. 1.5, minúscula editorial).
- Termos técnicos evitados na camada visível ao usuário (cap. 8.3 já dá o exemplo: prazo interno nunca aparece como "campo técnico") — esta prática se estende a toda mensagem de erro e todo texto de estado vazio.

---

# 20. MOBILE-FIRST E COMPORTAMENTO POR DISPOSITIVO

## 20.1 Princípio
A especificação já assume, sem declarar formalmente, que a influenciadora vive no celular (cap. 1.3: "usa o Portal no celular, entre gravações, quase sempre com pressa") e que a agência vive no desktop (cap. 1.3: "trabalha em desktop, em lote"). Este capítulo torna essa suposição explícita e detalha o que ela exige da experiência — sem propor telas novas, apenas comportamento.

## 20.2 Prioridade por papel
- **Influenciadora — mobile é a experiência primária**, não apenas responsiva. Toda tela do capítulo 5.3 é desenhada primeiro para a largura de um celular; a versão desktop é a adaptação, não o contrário.
- **Agência — desktop é a experiência primária** para revisão em lote e mesa de decisão (cap. 3.2, A5), mas precisa de leitura básica funcional em tablet/celular para aprovações urgentes fora do escritório (cenário real: operadora aprova um ajuste pelo celular à noite).
- Confirmar esta divisão como decisão de produto — hoje é suposição do documento, não resposta validada (ver cap. 22, Q23).

## 20.3 Zona de alcance e uso com uma mão
- Ações primárias da influenciadora (confirmar leitura, iniciar upload, "li e entendi") ficam na metade inferior da tela, alcançável pelo polegar em uso com uma mão — não no topo.
- Navegação principal recolhível (cap. 16) em mobile vira barra inferior ou menu de acesso rápido, nunca menu hambúrguer escondendo a ação mais frequente da sessão.

## 20.4 Upload a partir do celular
- Seleção de arquivo (tela 29) oferece captura direta pela câmera do aparelho como caminho principal, não só seleção de galeria — a maior parte do material é gravado na hora.
- Upload em andamento (tela 30) sobrevive a: app em segundo plano, tela bloqueada, troca de rede (Wi-Fi → dados móveis) e interrupção de chamada telefônica. O indicador persistente global (cap. 9.4) precisa continuar visível/retomável ao voltar ao app, não recomeçar do zero.
- Consumo de dados móveis é comunicado antes de um envio grande fora de Wi-Fi (ex.: aviso leve "isso vai usar ~180MB de dados móveis"), sem bloquear a ação — apenas informar. Ver cap. 21 (lacuna) e cap. 22 (pergunta) sobre limite de tamanho de arquivo, do qual isso depende.

## 20.5 Instalação, permissões e notificações
- O Portal como PWA instalável no celular da influenciadora é a forma natural de reduzir a distância até o WhatsApp (cap. 1.5, princípio 9) — instalação sugerida no momento certo (ex.: após o primeiro upload concluído com sucesso), nunca no primeiro acesso, quando a atenção já está disputada pelo cadastro.
- Pedido de permissão de notificação (necessário se o Portal adotar push — hoje fora do escopo aprovado, ver `MELHORIAS_MANUS.md` item 24, P1, não incorporado) segue a mesma regra: nunca no primeiro acesso, sempre no momento em que o valor da permissão é óbvio (ex.: logo após confirmar leitura de um briefing com prazo apertado).
- Login biométrico (Face ID / impressão digital) como atalho de sessão no celular fica registrado como oportunidade P2, não requisito — reduz fricção de reabrir o Portal "entre uma gravação e outra" sem enfraquecer a autenticação Google OIDC (ADR-007) que continua sendo a fonte de verdade da sessão.

## 20.6 Sessão e múltiplos dispositivos
- A influenciadora pode trocar de celular no meio de uma campanha (bifurcação já prevista, cap. 2.3: "dispositivo trocado"); a tela "segurança da conta" (tela 46) precisa mostrar sessões ativas por dispositivo, não apenas por token — hoje a tela existe no inventário, mas o conteúdo funcional dela não está detalhado em nenhum capítulo. Registrado como lacuna, cap. 21.
- Sessão aberta simultaneamente em celular e desktop (ex.: influenciadora confere financeiro no notebook e faz upload no celular) não é tratada em nenhum lugar da especificação — se é permitida, apenas coexiste; se não, precisa de aviso de conflito. Pergunta aberta, cap. 22.

## 20.7 Offline e rede instável
- Além do estado genérico "sem internet / modo offline" (tela 84), a influenciadora em campo (evento, viagem a trabalho) precisa que ações já iniciadas (upload, confirmação de leitura) fiquem em fila local e sincronizem sozinhas ao reconectar — a microinteração de "reconexão após offline" (cap. 18: "faixa que recolhe sozinha ao voltar") já assume esse comportamento na superfície, mas o mecanismo de fila não está descrito em nenhum capítulo funcional. Registrado como lacuna, cap. 21.

---

# 21. LACUNAS ENCONTRADAS

## 21.1 Vazios de decisão de produto
1. **Destino da reprovação** — reprovar volta a entrega para "aguardando material" ou cria estado próprio? *Proposta deste documento:* dois caminhos distintos (ajuste ≠ reprovação), com reprovação exigindo decisão explícita sobre nova solicitação.
2. **Exceção do portão financeiro** — pagar parcialmente ou antecipar quando falta uma entrega menor não está previsto. Hoje o bloqueio é binário e cria atrito com a criadora.
3. **Publicação** — quem registra: agência sempre, ou a parceira pode declarar? Falta definir a fonte de verdade.
4. **Prazo após ajuste** — o novo prazo é automático (recalculado) ou definido manualmente pela agência?
5. **Limite de ciclos de ajuste** — existe um número máximo de reenvios antes de escalar?

## 21.2 Estados ausentes hoje
- ajuste/reprovação (inexistente);
- publicado na interface (existe no domínio, não na tela);
- conta em análise (hoje vira erro ou tela vazia);
- perfil inexistente no primeiro acesso (hoje vira "não encontrado");
- confirmação de gravação na pasta;
- confirmação de leitura de briefing;
- versões do material;
- divergência de pagamento.

## 21.3 Regras conflitantes
- Prazo interno especificado, porém invisível e não calculado na experiência atual.
- Cota comercial contratada sem contador visível para a parceira.
- Feedback exigido "dentro do sistema" enquanto todo o fluxo real acontece fora.
- Linguagem editorial versus urgência operacional: hoje a estética pode esconder a pendência.
- Padrão de rótulos oscilando entre Title Case e minúscula editorial.
- **Vocabulário financeiro inconsistente (novo nesta revisão):** o mesmo trecho do ciclo de pagamento aparece com três nomes diferentes em três capítulos — cap. 2.2 (E13) usa `bloqueado → liberado → aprovado → enviado → pago`; cap. 6.2 usa `sem lançamentos → bloqueado por entrega pendente → em aberto → aprovado → enviado → pago`; cap. 14.2 usa `criado → elegível (portão liberado) → aprovado → enviado → pago → encerrado`. "Liberado", "em aberto" e "elegível" parecem descrever o mesmo estado (portão desbloqueado, ainda não aprovado), mas não está declarado se são sinônimos ou estados distintos. Nenhum vocabulário é adotado como canônico aqui — ver pergunta em cap. 22.

## 21.4 Riscos de experiência
- Excesso de estados expostos pode confundir a criadora: é preciso **uma frase de estado** por tela, com detalhe sob demanda.
- Pasta institucional invisível ao sistema pode gerar sensação de arquivo perdido — exige destino provisório nomeado.
- Feed de atividades muito verboso vira ruído — exige agrupamento.

## 21.5 Fluxos e telas ausentes (novo nesta revisão)
1. **"No-show" da influenciadora** — o estado `prazo interno vencido` (cap. 6.2) existe, mas não há fluxo para quando o prazo de postagem também vence sem qualquer material enviado (silêncio total, não apenas atraso). Hoje a experiência trata atraso-com-atividade e ausência-completa da mesma forma. Falta decidir se isso dispara um estado/tela própria e um escalonamento diferente do lembrete comum.
2. **Autoatendimento de privacidade (LGPD) pela influenciadora** — o capítulo 3.2 (A10) descreve a agência *recebendo e gerindo* solicitações de privacidade (tela 75), mas em nenhum lugar a influenciadora *inicia* um pedido de exportação ou exclusão dos próprios dados dentro do Portal. Adicionada como possível tela 46a (cap. 4.3) nesta revisão — natureza da tela (autosserviço completo vs. abertura de ticket para a agência) não está decidida.
3. **Preferências de notificação** — categorias e níveis existem (cap. 13.1–13.2), mas nenhuma tela permite à influenciadora escolher canal ou silenciar categorias não urgentes. Proposta mínima registrada em cap. 13.6 e tela 46b (cap. 4.3).
4. **Multi-dispositivo e sessão simultânea** — a tela "segurança da conta" (tela 46) está no inventário desde a versão anterior, mas nenhum capítulo descreve o que ela mostra ou faz. Detalhado como lacuna funcional em cap. 20.6.
5. **Fila de sincronização offline** — a microinteração "reconexão após offline" (cap. 18) pressupõe que ações iniciadas sem rede ficam guardadas e sincronizam sozinhas, mas nenhum capítulo funcional descreve esse mecanismo (cap. 20.7).
6. **Nota interna vs. comentário visível à parceira** — o princípio "a parceira nunca vê eventos internos que não a envolvam" (cap. 2.3, A10) pressupõe a existência de anotação interna da agência, mas nenhum componente do capítulo 16 distingue explicitamente "comentário visível à parceira" de "nota interna da agência" dentro do dossiê de entrega (cap. 15.2). Sem essa distinção modelada, o risco é a agência escrever uma nota interna no campo errado e ela vazar para a parceira.

## 21.6 Referências cruzadas com o backlog (`MELHORIAS_MANUS.md`)
As lacunas abaixo, encontradas nesta revisão, coincidem parcialmente com propostas já registradas naquele backlog estratégico. Nenhuma delas foi incorporada a este documento — permanecem como não aprovadas, listadas aqui apenas para evitar retrabalho de análise:
- Notificações push (21.5.3 acima) ↔ `MELHORIAS_MANUS.md`, item 24 (P1).
- Central de compliance/documentação legal, que naturalmente hospedaria o autoatendimento LGPD (21.5.2) ↔ `MELHORIAS_MANUS.md`, item 21 (P2).
- Gestão de permissões e papéis internos, relevante para quem pode ver/resolver a lacuna de "nota interna" (21.5.6) ↔ `MELHORIAS_MANUS.md`, item 7 (P1) e pergunta 7 do capítulo 22.

---

# 22. PERGUNTAS PARA PRODUCT DESIGN

**Fluxo e regras**
1. Reprovação e solicitação de ajuste são o mesmo ato ou dois atos distintos no produto final?
2. Após ajuste, o prazo é recalculado automaticamente ou definido pela agência?
3. Existe limite de versões antes de escalonamento?
4. Quem declara a publicação: agência, parceira ou ambos com confirmação?
5. O portão financeiro admite exceção justificada? Quem pode autorizar?
6. Pagamento é sempre por competência mensal ou pode ser por entrega?

**Escopo e papéis**
7. Existirá mais de um operador na agência com papéis diferentes (revisor × financeiro)?
8. A marca terá algum dia visão de leitura? Se sim, isso muda o vocabulário das telas.
9. Uma parceira pode ter mais de uma marca/contrato simultâneo? Como isso aparece nas campanhas?

**Conteúdo e comunicação**
10. Qual o tom exato das mensagens de cobrança de prazo (cordial × direto)?
11. Notificações por e-mail existem, ou o mural + WhatsApp bastam?
12. Quantos lembretes automáticos são aceitáveis antes de virar pressão?

**Onboarding e conta**
13. Quanto tempo dura o convite antes de expirar?
14. O que a parceira pode ver enquanto está "em análise"? Nada, ou campanhas em preview?
15. Inativação no meio da campanha: acesso somente leitura ou bloqueio total?

**Material e armazenamento**
16. Quais formatos e tamanhos máximos por tipo de conteúdo?
17. Versões antigas ficam acessíveis para a parceira ou apenas para a agência?
18. A parceira pode excluir um material enviado antes da revisão?
19. Como nomear as pastas de forma legível para a criadora?

**Financeiro**
20. O comprovante é visível integralmente para a parceira?
21. Divergência reportada bloqueia o encerramento da competência?

**Experiência**
22. O dashboard da influenciadora deve priorizar prazo ou pendência quando os dois competem?
23. Mobile é a experiência primária da criadora (assumido como sim neste documento) — confirmar. A agência precisa de leitura/aprovação funcional em celular/tablet, ou desktop é o único alvo suportado (cap. 20.2)?
24. Existe modo escuro no escopo? (Assumido: não nesta versão.)

**Acessibilidade, privacidade e dispositivos (novo nesta revisão)**
25. Qual vocabulário financeiro é canônico entre `liberado` (cap. 2.2), `em aberto` (cap. 6.2) e `elegível` (cap. 14.2) — são o mesmo estado com nomes divergentes ou estados distintos que a especificação ainda não separou (cap. 21.3)?
26. Existe cadência padrão de lembretes automáticos antes de um item ser considerado escalonado, e quem recebe o escalonamento — só a agência, ou também um "no-show" gera algo visível para a própria influenciadora (cap. 21.5.1)?
27. A solicitação de exportação/exclusão de dados (LGPD) pela influenciadora acontece dentro do Portal como autosserviço, ou continua sendo um processo manual mediado pela agência (cap. 21.5.2)?
28. Login simultâneo em mais de um dispositivo é permitido sem aviso, ou deve gerar notificação/confirmação de novo dispositivo (cap. 20.6)?
29. Existe meta formal de acessibilidade (ex.: WCAG 2.1 AA, cap. 19.1) com processo de auditoria antes do lançamento, ou a orientação deste documento permanece qualitativa e não verificada por ferramenta?
30. Tamanho máximo de arquivo de upload — necessário para decidir o aviso de consumo de dados móveis do cap. 20.4 e para o próprio formulário de erro "arquivo inválido" (cap. 9.3), hoje sem limite numérico definido em lugar nenhum do documento.

---

# 23. ROADMAP

## P0 — a relação precisa existir sem sair do Portal
*Sem isto, o Portal não substitui o WhatsApp e não cumpre a promessa.*

Login · convite · definir senha · boas-vindas · **completar perfil (identidade, contato, endereço, PIX)** · conta em análise · conta ativada · dashboard da influenciadora · campanhas · campanha do mês · briefing (leitura + confirmação) · entrega — dossiê · **upload (seleção, andamento, concluído com confirmação de pasta, falha)** · material em revisão · **ajuste solicitado** · reenvio · material aprovado · dashboard editorial (mesa de decisão) · entregas — lista e revisão · aprovar / solicitar ajuste com motivo · briefings — lista, editor, publicar · sessão expirada · vazios · 403/404/500 · offline.

**Por quê:** fecha o ciclo mínimo briefing → upload → revisão → decisão, elimina o limbo da revisão e a porta fechada do perfil. Cada item aqui remove uma conversa externa.

## P1 — confiança, tempo e dinheiro
Prazo interno visível e contagem regressiva · contador de cota · timeline da entrega completa · versões do material · registrar publicação · material publicado · financeiro (extrato da parceira, competências da agência, portão bloqueado explicativo, comprovante) · notificações (mural + feed) · mensagens prontas de WhatsApp · briefing atualizado/republicado com diferenças · leitura e confirmação na visão da agência.

**Por quê:** transforma o Portal de "lugar onde eu mando arquivo" em "lugar onde eu acompanho e recebo". É onde nasce a sensação de acompanhamento constante.

## P2 — escala da agência
Parceiras (lista, ficha, cadastro, condição comercial, convite/ativação) · colaborações mensais · **virada do mês (pré-visualização e confirmação)** · pagamento em lote · ações inline no dashboard (zero navegação) · histórico geral e arquivo da agência · busca global · encerrar competência com resumo.

**Por quê:** o gargalo deixa de ser a relação e passa a ser o volume. Aqui a agência para de digitar e volta a editar.

## P3 — refinamento e maturidade
Segurança da conta e sessões · auditoria/linha do tempo do sistema · solicitações de privacidade · **meus dados — privacidade/LGPD (tela 46a)** · **preferências de notificação (tela 46b)** · ajuda/como funciona · configurações da agência · divergência de pagamento · exportações e visão de campanha para marca · microinterações completas · manutenção programada · refinamento tipográfico e de iconografia.

**Por quê:** valor incremental sobre um produto já funcional; nada aqui bloqueia a operação diária.

## Acessibilidade e mobile-first não são um "P" — são transversais
Os capítulos 19 (Acessibilidade) e 20 (Mobile-first) não entram como item de uma fase porque não são funcionalidades: são qualidade mínima de toda tela construída em qualquer P. Uma tela de P0 sem estado de foco tratado ou sem alvo de toque adequado não está de fato pronta, mesmo que a funcionalidade esteja implementada — mesmo raciocínio já aplicado pelo item 1 do ANEXO a carregando/vazio/erro/offline.

---

## ANEXO — Princípios inegociáveis para quem implementar

1. Nenhuma tela pode existir sem seus estados de **carregando, vazio, erro e offline**.
2. Nenhum estado de sucesso pode ser exibido antes da confirmação real (especialmente upload).
3. Toda tela responde, em uma frase, **de quem é a vez**.
4. Todo evento tem quem, quando e o quê.
5. Nada se apaga; tudo se arquiva.
6. Dado sensível nunca é exibido por extenso nem registrado em histórico.
7. Rótulos em minúscula editorial; conteúdo autoral respeita o texto original.
8. Urgência sempre vence estética.
9. Ação importante nunca exige mais de dois passos a partir do dashboard.
10. Nada relevante da campanha acontece fora do Portal.

*Fim do documento.*
