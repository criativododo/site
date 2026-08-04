# REVISÃO EDITORIAL COMPLETA

Portal Criativo Dodô, plataforma Influencia.
Documento de referência oficial da linguagem do Portal.

> Este documento revisa a linguagem escrita. Não altera UX, layout, navegação, fluxo,
> arquitetura nem componentes. Serve de fonte única para outro agente aplicar as mudanças
> de texto, uma a uma, sem tocar em comportamento.

---

## 0. Como ler este documento

Cada texto revisado aparece em bloco com sete campos: tela, arquivo, componente, estado,
texto atual, novo texto e motivo. Textos idênticos que se repetem em vários arquivos
aparecem uma vez, com todas as ocorrências listadas.

Duas convenções antes de começar.

**Sem travessão e sem reticências em nenhum texto do Portal.** É regra da marca. Onde o
código usa travessão (o caractere longo), a sugestão troca por ponto, dois pontos, vírgula
ou parênteses. Onde usa reticências ("..." ou o caractere único), a sugestão remove.

**Duas vozes, uma marca.** O Portal tem dois públicos: a influenciadora (voz externa) e o
Dani operando o backoffice (voz operacional). As duas são minúsculas, sem travessão, sem
reticências. A externa é acolhedora e curta. A operacional é seca e precisa, feita para
decidir rápido. Os dois blocos deste documento respeitam essa divisão.

---

## 1. Mapa real das telas

O pedido cita oito telas: Login, Dashboard, Briefing, Envio, Aprovação, Publicação,
Reconhecimento, Perfil. O código conta uma história um pouco diferente, e registrar isso
faz parte da revisão (a regra é nunca inventar tela que não existe).

Telas reais que renderizam texto:

Voz externa (influenciadora):
- Login (`Login.tsx`), com Cadastro (`Cadastro.tsx`) e Convite (`Convite.tsx`, reusa Login)
- Suas entregas (`Pendencias.tsx`): é a Dashboard da influenciadora
- Financeiro e histórico (`Financeiro.tsx`): é o "Reconhecimento" da sua lista
- Perfil (`Perfil.tsx`)
- Privacidade (`Privacidade.tsx`), pública

Voz operacional (admin, o Dani):
- Painel administrativo (`AdminDashboard.tsx`)
- Parceiras (`AdminParceiras.tsx`)
- Entregas (`AdminEntregas.tsx`)
- Briefings (`AdminBriefings.tsx`)
- Obrigações (`AdminObrigacoes.tsx`)
- Colaboração mensal (`AdminColaboracoesMensais.tsx`)
- Moderação de cadastros (`Admin.tsx`)
- Hoje (`experimentos/Hoje.tsx`): tela-bandeira experimental

Onde estão Briefing, Envio, Aprovação e Publicação da sua lista: não são telas próprias.
São estados de uma Entrega dentro de "suas entregas" e ações do admin dentro de "entregas"
e "briefings". Briefing aparece como bloco dentro do card de cada entrega. Envio é o
formulário "enviar material". Aprovação e Publicação são botões do admin e rótulos de
estado. A revisão trata cada um no lugar onde de fato vive.

Camadas que também geram texto para o usuário, fáceis de esquecer:
- Mensagens de erro do backend (`portal-backend/src`), que sobem cruas para a tela
- Formatadores compartilhados (`lib/formatters.ts`): prazos, datas, moeda
- Estados de rota e sessão (`RotaProtegida.tsx`, `App.tsx`, `session.tsx`)

---

## 2. Revisão texto a texto: voz externa

### 2.1 Login

**Tela** Login · **Arquivo** `pages/Login.tsx` · **Componente** `LoginPage` (carregando) · **Estado** loading
Texto atual: `verificando seu acesso…`
Novo texto: `verificando seu acesso`
Motivo: remover reticências (regra da marca). A frase já se sustenta sozinha.

**Tela** Login · **Arquivo** `pages/Login.tsx` · **Componente** `LoginPage` (entrada) · **Estado** visível
Texto atual: `acesso ao portal` / `bem-vinda de volta.` / `entre com a conta google cadastrada para acompanhar conteúdos, pagamentos e seu perfil.`
Novo texto: manter. Ajuste único: `entre com a conta Google cadastrada para acompanhar conteúdos, pagamentos e seu perfil.`
Motivo: abertura direta e acolhedora, no tom certo. "Google" é nome próprio, entra com maiúscula (o texto já capitaliza no botão "Continuar com o Google", então padroniza).

**Tela** Login · **Arquivo** `pages/Login.tsx` · **Componente** botão Apple · **Estado** condicional
Texto atual: `em breve.`
Novo texto: `em breve`
Motivo: microcopy de uma linha não pede ponto final. Consistência com o resto dos avisos curtos.

**Tela** Login · **Arquivo** `pages/Login.tsx` · **Componente** rodapé · **Estado** visível
Texto atual: `precisa de ajuda? fale com a equipe criativo dodô.`
Novo texto: manter.
Motivo: pergunta genuína dirigida a quem lê, seguida de caminho. Correto.

**Tela** Login · **Arquivo** `pages/Login.tsx` · **Componente** rodapé link · **Estado** visível
Texto atual: `política de privacidade (lgpd)`
Novo texto: manter.
Motivo: claro e padronizado. Vira padrão do Portal (ver glossário).

**Tela** Login · **Arquivo** `pages/Login.tsx` · **Componente** `LoginPage` (PENDING) · **Estado** aguardando aprovação
Texto atual: `cadastro recebido` / `seu acesso está em análise.` / `assim que a equipe aprovar seu cadastro, você poderá entrar por aqui com a mesma conta google.`
Novo texto: manter, com `conta Google`.
Motivo: estado sensível bem resolvido. Diz o que aconteceu, o que vem depois e o que fazer. Só a capitalização de Google.

**Tela** Login · **Arquivo** `pages/Login.tsx` · **Componente** `LoginPage` (INACTIVE/REJECTED) · **Estado** bloqueado
Texto atual: `acesso indisponível` / `não foi possível liberar seu acesso.` / `fale com a equipe criativo dodô para confirmar os dados do seu cadastro.`
Novo texto: manter.
Motivo: recusa sem culpar quem lê, com caminho de saída. É o modelo de mensagem sensível da casa.

**Tela** Login · **Arquivo** `pages/Login.tsx` · **Componente** botão retry · **Estado** visível
Texto atual: `sair e tentar novamente`
Novo texto: manter.
Motivo: ação clara, verbo na frente.

### 2.2 Cadastro

**Tela** Cadastro · **Arquivo** `pages/Cadastro.tsx` · **Componente** cabeçalho · **Estado** visível
Texto atual: `quase lá` / `complete seu cadastro.` / `esses dados são usados para identificação, pagamentos e comunicação sobre suas entregas.`
Novo texto: manter.
Motivo: "quase lá" dá ritmo e reduz o peso do formulário. A descrição explica o porquê dos dados, que é o que acalma numa tela de CNPJ e PIX.

**Tela** Cadastro · **Arquivo** `pages/Cadastro.tsx` · **Componente** labels · **Estado** visível
Texto atual: `nome completo` / `chave / nome artístico` / `cnpj` / `pix` / `cep` / `número` / `complemento`
Novo texto: manter, exceto placeholder abaixo.
Motivo: labels enxutos e minúsculos, coerentes.

**Tela** Cadastro · **Arquivo** `pages/Cadastro.tsx` · **Componente** input chave · **Estado** placeholder
Texto atual: `como você quer ser identificada`
Novo texto: manter.
Motivo: placeholder que orienta sem repetir o label. Bom padrão.

**Tela** Cadastro · **Arquivo** `pages/Cadastro.tsx` · **Componente** botão submit · **Estado** ocioso / enviando
Texto atual: `enviar cadastro` / `enviando...`
Novo texto: `enviar cadastro` / `enviando`
Motivo: remover reticências do estado de progresso. Regra global (ver seção 5).

**Tela** Cadastro · **Arquivo** `pages/Cadastro.tsx` · **Componente** erro genérico · **Estado** erro
Texto atual: `não foi possível enviar o cadastro.`
Novo texto: manter.
Motivo: padrão de erro da casa ("não foi possível + ação"). Correto.

### 2.3 Suas entregas (Dashboard da influenciadora)

**Tela** Suas entregas · **Arquivo** `pages/Pendencias.tsx` · **Componente** `PendenciasPage` (cabeçalho) · **Estado** visível
Texto atual: `conteúdo mensal` / `suas entregas` / `acompanhe o que precisa acontecer em {mês}.` (fallback: `acompanhe seus conteúdos, prazos e materiais do mês.`)
Novo texto: manter.
Motivo: título curto e possessivo ("suas entregas") coloca a pessoa no centro. Intro orienta a ação do mês.

**Tela** Suas entregas · **Arquivo** `pages/Pendencias.tsx` · **Componente** rótulos de estado (`LABEL_ESTADO`) · **Estado** todos
Texto atual: `aguardando material` / `em revisão` / `aprovado` / `publicado`
Novo texto: manter.
Motivo: estados legíveis, sem jargão. Alinhados ao glossário (Entrega tem 4 estados). Reaproveitar exatamente esses rótulos em toda tela que mostrar estado de entrega.

**Tela** Suas entregas · **Arquivo** `pages/Pendencias.tsx` · **Componente** `textoPrazo` · **Estado** atrasada / a enviar / demais
Texto atual: `atrasada desde {data}` / `enviar até {data}` / `prazo {data}`
Novo texto: manter.
Motivo: prazo dito do jeito que a pessoa pensa. "enviar até" é ação, "atrasada desde" é honesto sem alarme.

**Tela** Suas entregas · **Arquivo** `pages/Pendencias.tsx` · **Componente** `acaoDisponivel` / botão · **Estado** aguardando material
Texto atual: `enviar material`
Novo texto: manter.
Motivo: rótulo de ação consistente com o formulário de envio.

**Tela** Suas entregas · **Arquivo** `pages/Pendencias.tsx` · **Componente** `EnviarMaterial` (sessão expirada) · **Estado** erro 401
Texto atual: `sua sessão expirou. faça login novamente para continuar o envio.` / botão `entrar novamente`
Novo texto: manter.
Motivo: explica o que houve e o próximo passo, sem termo técnico. Modelo para todo 401 visível.

**Tela** Suas entregas · **Arquivo** `pages/Pendencias.tsx` · **Componente** `EnviarMaterial` (sucesso) · **Estado** sucesso
Texto atual: `✓ material enviado com sucesso.`
Novo texto: `material enviado`
Motivo: confirmação curta é mais forte. "com sucesso" é redundante quando o ícone e a mudança de estado já confirmam. Menos é mais aqui.

**Tela** Suas entregas · **Arquivo** `pages/Pendencias.tsx` · **Componente** `EnviarMaterial` (controles) · **Estado** ocioso / enviando / erro
Texto atual: `enviando...` / `tentar novamente` / `enviar material`
Novo texto: `enviando` / `tentar novamente` / `enviar material`
Motivo: remover reticências do progresso.

**Tela** Suas entregas · **Arquivo** `pages/Pendencias.tsx` · **Componente** upload arquivo · **Estado** selecionado / enviando
Texto atual: `arquivo selecionado: {nome} ({tamanho})` / `enviando {nome}…`
Novo texto: `arquivo selecionado: {nome} ({tamanho})` / `enviando {nome}`
Motivo: remover reticências. O restante está correto.

**Tela** Suas entregas · **Arquivo** `pages/Pendencias.tsx` · **Componente** `EnviarMaterial` (erro) · **Estado** erro de rede
Texto atual: `não foi possível enviar o material. verifique sua conexão e tente novamente.`
Novo texto: manter.
Motivo: erro com causa provável e ação. Bom modelo de erro recuperável.

**Tela** Suas entregas · **Arquivo** `pages/Pendencias.tsx` · **Componente** `BriefingDoItem` · **Estado** loading / erro / vazio
Texto atual: `carregando briefing...` / `não foi possível carregar o briefing.` / `briefing ainda não publicado para esta entrega.`
Novo texto: `carregando briefing` / `não foi possível carregar o briefing.` / `briefing ainda não publicado para esta entrega.`
Motivo: remover reticências do loading. O vazio ("ainda não publicado") está no tom certo: informa sem cobrar.

**Tela** Suas entregas · **Arquivo** `pages/Pendencias.tsx` · **Componente** `BriefingDoItem` (labels) · **Estado** visível
Texto atual: `look` / `data de entrega` / `data de postagem` / `orientação`
Novo texto: manter.
Motivo: vocabulário do briefing alinhado ao glossário. Consistente com a tela de admin de briefings.

**Tela** Suas entregas · **Arquivo** `pages/Pendencias.tsx` · **Componente** listas · **Estado** loading / erro / vazio
Texto atual: `carregando suas entregas...` / `não foi possível carregar as pendências.` / `não há entregas pendentes em {mês}.`
Novo texto: `carregando suas entregas` / `não foi possível carregar suas entregas.` / `não há entregas pendentes em {mês}.`
Motivo: remover reticências. Trocar "pendências" por "suas entregas" no erro: a tela se chama "suas entregas", a palavra "pendências" (nome interno da rota) nunca deve vazar para a pessoa.

**Tela** Suas entregas · **Arquivo** `pages/Pendencias.tsx` · **Componente** resumos de grupo · **Estado** visível
Texto atual: `{n} entrega para você agora` / `{n} entregas para você agora` / `nada pendente da sua parte agora.` / `1 entrega com a equipe` / `{n} entregas com a equipe`
Novo texto: manter.
Motivo: separa o que depende da pessoa do que está com a equipe. "nada pendente da sua parte agora" é um ótimo estado de alívio. Frase candidata a padrão.

### 2.4 Financeiro e histórico (Reconhecimento)

**Tela** Financeiro · **Arquivo** `pages/Financeiro.tsx` · **Componente** `FinanceiroPage` (cabeçalho) · **Estado** visível
Texto atual: `pagamentos` / `financeiro e histórico` / `acompanhe o previsto, o já pago e o histórico por competência.`
Novo texto: `pagamentos` / `financeiro e histórico` / `acompanhe o previsto, o já pago e o histórico por período.`
Motivo: título correto. Na intro, trocar "competência" por "período": a influenciadora vê o seletor rotulado "período" (não "competência"), então a intro deve falar a mesma palavra que o controle logo abaixo. "competência" fica na voz operacional.

**Tela** Financeiro · **Arquivo** `pages/Financeiro.tsx` · **Componente** KPIs · **Estado** visível
Texto atual: `a receber` / `já pago` / `previsto no período`
Novo texto: manter.
Motivo: três rótulos que dizem exatamente o número que carregam. Hierarquia clara (a receber em destaque).

**Tela** Financeiro · **Arquivo** `pages/Financeiro.tsx` · **Componente** loading / erros · **Estado** loading / erro
Texto atual: `carregando este período...` / `carregando períodos...` / `carregando histórico...` / `não foi possível carregar o financeiro do período.` / `não foi possível carregar o histórico do período.` / `não foi possível carregar os períodos.`
Novo texto: remover as reticências dos três "carregando". Manter os três erros.
Motivo: regra de reticências. Erros seguem o padrão da casa.

**Tela** Financeiro · **Arquivo** `pages/Financeiro.tsx` · **Componente** histórico · **Estado** vazio / seções
Texto atual: `histórico do período` / `sem histórico neste período.` / `conteúdos entregues` / `pagamentos`
Novo texto: manter.
Motivo: seções nomeadas com clareza. Vazio honesto e curto.

**Tela** Financeiro · **Arquivo** `pages/Financeiro.tsx` · **Componente** rótulos de estado · **Estado** visível
Texto atual: entrega: `aguardando material` / `em revisão` / `aprovado` / `publicado`; obrigação: `em aberto` / `aprovado` / `pago`
Novo texto: manter.
Motivo: reaproveita os mesmos rótulos de estado. Para a influenciadora, "obrigação" nunca aparece como palavra, só o estado ("pago", "em aberto"), o que está certo.

**Tela** Financeiro · **Arquivo** `pages/Financeiro.tsx` · **Componente** `FinanceiroPage` (vazio) · **Estado** sem períodos
Texto atual: `nenhum período com atividade ainda.`
Novo texto: manter.
Motivo: vazio com "ainda", que sinaliza que vai encher. Tom certo.

### 2.5 Perfil

**Tela** Perfil · **Arquivo** `pages/Perfil.tsx` · **Componente** `PerfilPage` (cabeçalho) · **Estado** visível
Texto atual: `sua conta` / `perfil` / `seus dados de contato e pagamento.`
Novo texto: manter.
Motivo: enxuto e possessivo. Correto.

**Tela** Perfil · **Arquivo** `pages/Perfil.tsx` · **Componente** loading / erros · **Estado** loading / erro
Texto atual: `carregando perfil...` / `não foi possível carregar o perfil.` / `não foi possível salvar.`
Novo texto: `carregando perfil` / manter os dois erros.
Motivo: reticências. "não foi possível salvar." aparece em vários lugares e vira padrão.

**Tela** Perfil · **Arquivo** `pages/Perfil.tsx` · **Componente** `EditarEndereco` (aviso CEP) · **Estado** aviso
Texto atual: `cep não encontrado — número e complemento foram salvos mesmo assim.`
Novo texto: `cep não encontrado. número e complemento foram salvos mesmo assim.`
Motivo: remover travessão. Ponto separa as duas ideias sem perder o alívio ("salvos mesmo assim").

**Tela** Perfil · **Arquivo** `pages/Perfil.tsx` · **Componente** `EditarEndereco` (validação) · **Estado** erro de campo
Texto atual: `cep incompleto — precisa de 8 dígitos.`
Novo texto: `cep incompleto: precisa de 8 dígitos.`
Motivo: remover travessão. Dois pontos liga a causa à correção.

**Tela** Perfil · **Arquivo** `pages/Perfil.tsx` · **Componente** `linhasDeEndereco` · **Estado** exibição de endereço
Texto atual: junção com ` – ` entre rua/número e complemento (ex.: `rua x, 12 – ap 3`)
Novo texto: junção com `, ` (ex.: `rua x, 12, ap 3`)
Motivo: o separador atual é travessão curto. Trocar por vírgula mantém a leitura de endereço e cumpre a regra.

**Tela** Perfil · **Arquivo** `pages/Perfil.tsx` · **Componente** input CEP · **Estado** placeholder
Texto atual: `00000-000`
Novo texto: manter.
Motivo: placeholder de máscara, orienta o formato. Correto.

**Tela** Perfil · **Arquivo** `pages/Perfil.tsx` · **Componente** botões · **Estado** salvando / ocioso
Texto atual: `salvando...` / `salvar` / `salvar endereço` / `cancelar` / `editar` / `adicionar endereço →`
Novo texto: `salvando` / manter os demais.
Motivo: reticências. A seta em "adicionar endereço →" é decoração de direção, não travessão, pode ficar.

**Tela** Perfil · **Arquivo** `pages/Perfil.tsx` · **Componente** `MeusDadosLgpd` · **Estado** visível
Texto atual: `seus dados (lgpd)` / `baixar meus dados` / `solicitar exclusão de conta`
Novo texto: manter.
Motivo: direito da pessoa dito em verbo simples. Sem juridiquês na superfície.

**Tela** Perfil · **Arquivo** `pages/Perfil.tsx` · **Componente** `MeusDadosLgpd` (avisos) · **Estado** sucesso / erro
Texto atual: `pedido de exclusão registrado. a equipe avaliará e retornará sobre a decisão.` / `não foi possível exportar.` / `não foi possível registrar o pedido.`
Novo texto: manter.
Motivo: confirma o registro e diz o que acontece depois. Erros no padrão da casa.

### 2.6 Privacidade

**Tela** Privacidade · **Arquivo** `pages/Privacidade.tsx` · **Componente** `PrivacidadePage` · **Estado** visível
Texto atual: `privacidade` / `política de privacidade e lgpd` / quatro parágrafos de prosa + `voltar para o login`
Novo texto: manter, com ajuste de `conta google` para `conta Google` nos dois pontos onde aparece.
Motivo: prosa clara, minúscula, sem juridiquês pesado. Só "Google" pede maiúscula por ser nome próprio.

### 2.7 Estados de rota e sessão (voz externa)

**Tela** todas · **Arquivo** `components/RotaProtegida.tsx` · **Componente** loading · **Estado** verificando sessão
Texto atual: sem texto, só a marca `Ô` animada
Novo texto: manter.
Motivo: carregamento de marca, não precisa de palavra. Coerente com a identidade.

---

## 3. Revisão texto a texto: voz operacional (admin)

Regra desta seção: quem lê é o Dani operando. Precisão e velocidade valem mais que
acolhimento. Ainda assim, sem travessão, sem reticências, tudo minúsculo. Onde um termo
técnico do banco vazou sem necessidade, a sugestão oferece uma versão mais legível e marca
como opcional (o custo de reescrever é baixo, mas não é bug).

### 3.1 Painel administrativo

**Tela** Painel · **Arquivo** `pages/AdminDashboard.tsx` · **Componente** cabeçalho · **Estado** visível
Texto atual: `administração` / `painel administrativo` / `onde você precisa agir agora, num só lugar.`
Novo texto: manter.
Motivo: define a função da tela em uma linha. Bom.

**Tela** Painel · **Arquivo** `pages/AdminDashboard.tsx` · **Componente** bloco atenção · **Estado** visível / vazio
Texto atual: `nada pendente de ação agora` / `requer sua ação ({n})` / rótulos: `materiais atrasados` (`já passaram da data prevista`), `aprovações aguardando`, `cadastros para moderar`, `solicitações lgpd pendentes`
Novo texto: manter.
Motivo: cada item diz o que é e por que importa. "já passaram da data prevista" como justificativa é exatamente o nível certo de contexto.

**Tela** Painel · **Arquivo** `pages/AdminDashboard.tsx` · **Componente** próximos prazos · **Estado** vazio / lista
Texto atual: `próximos prazos` / `nada previsto para os próximos dias.` / `entrega de {parceira}` / `postagem de {parceira}`
Novo texto: manter.
Motivo: leitura imediata. Sem ruído.

**Tela** Painel · **Arquivo** `pages/AdminDashboard.tsx` · **Componente** `fraseDeNormalidade` · **Estado** rodapé de calma
Texto atual: `nada em andamento ainda.` / `o restante está dentro do esperado: {...}.` / `1 parceira segue ativa` / `{n} entregas aguardam material dentro do prazo` / `{valor} em pagamentos pendentes`
Novo texto: manter.
Motivo: fecha o painel com o que está sob controle, não só com o que falta. Decisão editorial madura, "cheiro de revista" no melhor sentido. Preservar.

**Tela** Painel · **Arquivo** `pages/AdminDashboard.tsx` · **Componente** loading / erro / bloqueio · **Estado** loading / erro / não-admin
Texto atual: `carregando...` / `não foi possível carregar o painel.` / `área restrita a administradores.`
Novo texto: `carregando` / manter os dois.
Motivo: reticências. "área restrita a administradores." é padrão global (ver 3.8).

### 3.2 Parceiras

**Tela** Parceiras · **Arquivo** `pages/AdminParceiras.tsx` · **Componente** cabeçalho · **Estado** visível
Texto atual: `administração` / `parceiras` / `busque, avalie a situação e aja sobre qualquer parceira em poucos cliques.`
Novo texto: manter.
Motivo: usa "parceira", termo soberano. Intro operacional e direta.

**Tela** Parceiras · **Arquivo** `pages/AdminParceiras.tsx` · **Componente** formulário · **Estado** labels
Texto atual: `chave` / `nome` / `e-mail` / `cnpj` / `pix` / `valor mensal (r$)` / `reels contratados` / `carrosséis contratados` / `stories contratados` / `prazo de uso de imagem (dias)`
Novo texto: manter.
Motivo: labels do contrato comercial, precisos. "reels/carrosséis/stories contratados" é claro para quem lança.

**Tela** Parceiras · **Arquivo** `pages/AdminParceiras.tsx` · **Componente** validação · **Estado** erro de campo
Texto atual: `chave, nome e e-mail são obrigatórios.`
Novo texto: manter.
Motivo: diz exatamente quais campos. Padrão de validação da casa (lista os campos, sem rodeio).

**Tela** Parceiras · **Arquivo** `pages/AdminParceiras.tsx` · **Componente** toolbar · **Estado** visível
Texto atual: `buscar` + placeholder `nome, chave, e-mail ou cnpj` / `status` (`todas`/`ativas`/`inativas`) / `ordenar por` (`nome`/`cadastro mais recente`/`status`) / `+ nova parceira` / `fechar`
Novo texto: manter.
Motivo: filtros e ações claros. Placeholder lista os campos buscáveis, ótimo.

**Tela** Parceiras · **Arquivo** `pages/AdminParceiras.tsx` · **Componente** linha / detalhes · **Estado** visível
Texto atual: `ativa` / `inativa` / `editar` / `fechar edição` / `desativar` / `ativar` / `cnpj` / `pix` / `entregáveis contratados` / `{n} reel · {n} carrossel · {n} stories` / `prazo de uso de imagem` / `{n} dias` / `{valor}/mês`
Novo texto: manter, com uma observação sobre o placeholder de vazio abaixo.
Motivo: separador `·` é o padrão visual da casa para itens na mesma linha, manter.

**Tela** Parceiras · **Arquivo** `pages/AdminParceiras.tsx` · **Componente** valor vazio (cnpj/pix) · **Estado** dado ausente
Texto atual: `—` (travessão como marcador de vazio)
Novo texto: `não informado`
Motivo: o travessão é proibido, e além disso "não informado" é mais claro que um traço solto. Vale para todo lugar que usa `—` como placeholder de campo vazio.

**Tela** Parceiras · **Arquivo** `pages/AdminParceiras.tsx` · **Componente** resumo / vazios / paginação · **Estado** visível
Texto atual: `{n} parceiras · {n} ativas · {n} inativas` / `nenhuma parceira cadastrada ainda.` / `nenhuma parceira encontrada para esse filtro.` / `carregando parceiras...` / `não foi possível carregar as parceiras.` / `anterior` / `página {x} de {y}` / `próxima`
Novo texto: `carregando parceiras` (sem reticências); demais mantidos.
Motivo: dois vazios distintos (base vazia vs filtro sem resultado) é boa prática. Só a reticência do loading sai.

### 3.3 Entregas

**Tela** Entregas · **Arquivo** `pages/AdminEntregas.tsx` · **Componente** cabeçalho · **Estado** visível
Texto atual: `administração` / `entregas` / `crie entregas para alimentar o portal das parceiras e acompanhe o estado de cada uma.`
Novo texto: manter.
Motivo: descreve a função. Correto.

**Tela** Entregas · **Arquivo** `pages/AdminEntregas.tsx` · **Componente** formulário · **Estado** labels / placeholders
Texto atual: `parceira` / `competência (aaaa-mm)` placeholder `2026-07` / `formato` / `data de entrega`
Novo texto: manter.
Motivo: "competência (aaaa-mm)" com placeholder de exemplo é o jeito honesto de pedir o formato. Aqui "competência" é correto: é voz operacional.

**Tela** Entregas · **Arquivo** `pages/AdminEntregas.tsx` · **Componente** formulário (sem parceira) · **Estado** bloqueado
Texto atual: `nenhuma parceira ativa cadastrada — ative uma parceira antes de criar entregas.`
Novo texto: `nenhuma parceira ativa cadastrada. ative uma parceira antes de criar entregas.`
Motivo: remover travessão. Ponto separa o diagnóstico da instrução.

**Tela** Entregas · **Arquivo** `pages/AdminEntregas.tsx` · **Componente** validação · **Estado** erro
Texto atual: `parceira, competência e data de entrega são obrigatórias.`
Novo texto: manter.
Motivo: padrão de validação (lista os campos).

**Tela** Entregas · **Arquivo** `pages/AdminEntregas.tsx` · **Componente** linha · **Estado** visível
Texto atual: `{formato} · competência {mês}` / `material enviado` / `sem material ainda` / `aprovar` / `publicar`
Novo texto: manter.
Motivo: estado de material claro. Ações (aprovar/publicar) são os verbos do fluxo, alinhados ao glossário.

**Tela** Entregas · **Arquivo** `pages/AdminEntregas.tsx` · **Componente** toolbar / vazios / erros · **Estado** vários
Texto atual: `buscar por parceira` placeholder `nome da parceira` / `estado` (`todos` + rótulos) / `+ nova entrega` / `{n} entregas` / `nenhuma entrega criada ainda.` / `nenhuma entrega encontrada para esse filtro.` / `carregando entregas...` / `não foi possível carregar as entregas.` / `parceira desconhecida`
Novo texto: `carregando entregas` (sem reticências); demais mantidos.
Motivo: reticência sai. "parceira desconhecida" é fallback de dado faltante, aceitável na voz operacional.

**Tela** Entregas · **Arquivo** `pages/AdminEntregas.tsx` · **Componente** erros de ação · **Estado** erro
Texto atual: `não foi possível aprovar a Entrega.` / `não foi possível publicar a Entrega.` / `não foi possível criar a entrega.`
Novo texto: `não foi possível aprovar a entrega.` / `não foi possível publicar a entrega.` / `não foi possível criar a entrega.`
Motivo: "Entrega" com maiúscula é o nome do agregado no código, não deve aparecer capitalizado na tela. Minúsculo na superfície, sempre.

### 3.4 Briefings

**Tela** Briefings · **Arquivo** `pages/AdminBriefings.tsx` · **Componente** cabeçalho · **Estado** visível
Texto atual: `administração` / `briefings` / `crie o briefing de cada entrega para que a parceira saiba o que produzir, e mantenha o conteúdo atualizado.`
Novo texto: manter.
Motivo: explica o porquê do briefing (para a parceira saber o que produzir). Bom.

**Tela** Briefings · **Arquivo** `pages/AdminBriefings.tsx` · **Componente** campos de conteúdo · **Estado** labels
Texto atual: `look` / `data de entrega do material` / `data de postagem` / `orientação criativa`
Novo texto: manter.
Motivo: mesmos termos que a influenciadora vê no briefing dela. Consistência entre as duas pontas.

**Tela** Briefings · **Arquivo** `pages/AdminBriefings.tsx` · **Componente** validações · **Estado** erro
Texto atual: `entrega, look, datas e orientação são obrigatórios.` / `look, datas e orientação são obrigatórios.`
Novo texto: manter.
Motivo: padrão de validação.

**Tela** Briefings · **Arquivo** `pages/AdminBriefings.tsx` · **Componente** formulário novo (sem entrega) · **Estado** bloqueado
Texto atual: `todas as entregas já têm briefing — crie uma nova entrega antes de criar outro briefing.`
Novo texto: `todas as entregas já têm briefing. crie uma nova entrega antes de criar outro briefing.`
Motivo: remover travessão.

**Tela** Briefings · **Arquivo** `pages/AdminBriefings.tsx` · **Componente** linha (status) · **Estado** sem vínculo
Texto atual: `sem entrega vinculada`
Novo texto: manter.
Motivo: descreve o estado com precisão operacional.

**Tela** Briefings · **Arquivo** `pages/AdminBriefings.tsx` · **Componente** linha (meta) · **Estado** visível
Texto atual: `{formato} · competência {mês} · {look}` / `aprovação {data}`
Novo texto: manter.
Motivo: separador padrão. "aprovação {data}" é a data de aprovação interna calculada, correta aqui.

**Tela** Briefings · **Arquivo** `pages/AdminBriefings.tsx` · **Componente** botão remover (tooltip) · **Estado** bloqueado
Texto atual: `a entrega vinculada já saiu de 'aguardando material' — remover perderia o rastro do que a orientou.`
Novo texto: `a entrega vinculada já saiu de "aguardando material", e remover perderia o rastro do que a orientou.`
Motivo: remover travessão (vírgula + "e" liga causa e consequência). Trocar aspas simples por aspas duplas, padrão de citação de rótulo.

**Tela** Briefings · **Arquivo** `pages/AdminBriefings.tsx` · **Componente** ações / vazios / erros · **Estado** vários
Texto atual: `editar` / `fechar edição` / `remover` / `removendo...` / `+ novo briefing` / `fechar` / `buscar por parceira ou look` placeholder `nome da parceira ou look` / `{n} briefings` / `nenhum briefing criado ainda.` / `nenhum briefing encontrado para essa busca.` / `carregando briefings...` / `não foi possível carregar os briefings.` / `não foi possível criar o briefing.` / `não foi possível remover o briefing.` / `não foi possível salvar.` / `parceira desconhecida`
Novo texto: `removendo` e `carregando briefings` sem reticências; demais mantidos.
Motivo: reticências saem, resto no padrão.

### 3.5 Obrigações

**Tela** Obrigações · **Arquivo** `pages/AdminObrigacoes.tsx` · **Componente** cabeçalho · **Estado** visível
Texto atual: `administração` / `obrigações` / `lance, acompanhe e libere as obrigações financeiras de cada parceira por competência.`
Novo texto: manter.
Motivo: "obrigações" é o termo do glossário para o admin. A influenciadora nunca vê essa palavra (ela vê "pagamentos"). Divisão correta.

**Tela** Obrigações · **Arquivo** `pages/AdminObrigacoes.tsx` · **Componente** formulário · **Estado** labels
Texto atual: `tipo` (`mensal`/`avulso`) / `parceira` / `competência (aaaa-mm)` placeholder `2026-07` / `valor (r$)`
Novo texto: manter.
Motivo: precisos. Voz operacional.

**Tela** Obrigações · **Arquivo** `pages/AdminObrigacoes.tsx` · **Componente** validações · **Estado** erro
Texto atual: `parceira, competência e valor (maior que zero) são obrigatórios.` / `valor deve ser maior que zero.`
Novo texto: manter.
Motivo: validação clara com a condição embutida.

**Tela** Obrigações · **Arquivo** `pages/AdminObrigacoes.tsx` · **Componente** formulário (sem parceira) · **Estado** bloqueado
Texto atual: `nenhuma parceira ativa cadastrada — ative uma parceira antes de lançar obrigação mensal.` / `nenhuma parceira cadastrada ainda.`
Novo texto: `nenhuma parceira ativa cadastrada. ative uma parceira antes de lançar obrigação mensal.` / manter o segundo.
Motivo: remover travessão.

**Tela** Obrigações · **Arquivo** `pages/AdminObrigacoes.tsx` · **Componente** linha (elegibilidade) · **Estado** visível
Texto atual: `{n} entrega(s) vinculada(s)` / `elegível para liberação` / `não elegível para liberação`
Novo texto (opcional): `pronta para liberar` / `ainda não pode liberar`
Motivo: "elegível para liberação" é linguagem de sistema. Como é voz operacional (o Dani), não é bug, mas a versão sugerida decide mais rápido. Marcar como melhoria opcional, aplicar só se quiser aproximar do "cheiro de revista".

**Tela** Obrigações · **Arquivo** `pages/AdminObrigacoes.tsx` · **Componente** linha (bloqueio liberação, tooltip) · **Estado** bloqueado
Texto atual: `há entregas da competência ainda não aprovadas/publicadas.`
Novo texto: `há entregas da competência ainda não aprovadas ou publicadas.`
Motivo: trocar a barra por "ou". A barra lida rápido mas soa a formulário. "ou" é mais humano e igualmente preciso.

**Tela** Obrigações · **Arquivo** `pages/AdminObrigacoes.tsx` · **Componente** ações · **Estado** por estado
Texto atual: `editar` / `fechar edição` / `liberar` / `remover` / `marcar como pago` / `pago em {data}`
Novo texto: manter.
Motivo: verbos do fluxo financeiro alinhados ao glossário (em aberto, aprovado/liberado, pago).

**Tela** Obrigações · **Arquivo** `pages/AdminObrigacoes.tsx` · **Componente** detalhes expandidos · **Estado** visível / vazio
Texto atual: `entregas da competência ({n})` / `nenhuma entrega nesta competência.` / `{formato} — {estado} — entrega {data}`
Novo texto: `entregas da competência ({n})` / `nenhuma entrega nesta competência.` / `{formato} · {estado} · entrega {data}`
Motivo: a linha de detalhe usa travessão como separador. Trocar pelo `·`, que já é o separador padrão de itens em linha no resto do Portal. Resolve a regra e ganha consistência.

**Tela** Obrigações · **Arquivo** `pages/AdminObrigacoes.tsx` · **Componente** toolbar / resumo / vazios / erros · **Estado** vários
Texto atual: `buscar por parceira` / `estado` / `+ nova obrigação` / `{n} obrigações` / `nenhuma obrigação lançada ainda.` / `nenhuma obrigação encontrada para esse filtro.` / `carregando obrigações...` / erros `não foi possível carregar as obrigações.` / `não foi possível lançar a obrigação.` / `não foi possível liberar a obrigação.` / `não foi possível marcar como pago.` / `não foi possível remover a obrigação.` / `não foi possível salvar.`
Novo texto: `carregando obrigações` sem reticências; demais mantidos.
Motivo: padrão consistente. Só a reticência sai.

### 3.6 Colaboração mensal

**Tela** Colaboração mensal · **Arquivo** `pages/AdminColaboracoesMensais.tsx` · **Componente** cabeçalho · **Estado** visível
Texto atual: `administração` / `colaboração mensal` / `compile manualmente uma competência para as parceiras ativas e consulte o histórico de competências já compiladas.`
Novo texto: manter.
Motivo: "colaboração mensal" é o termo soberano (substitui "ciclo mensal", banido). Correto e importante manter.

**Tela** Colaboração mensal · **Arquivo** `pages/AdminColaboracoesMensais.tsx` · **Componente** formulário · **Estado** label / botão / validação
Texto atual: `competência para compilar (aaaa-mm)` placeholder `2026-08` / `compilar competência` / `compilando...` / `competência é obrigatória.`
Novo texto: `compilando` sem reticências; demais mantidos.
Motivo: "compilar" é ação de sistema, mas é o verbo real da operação (ADR-016) e o Dani sabe o que faz. Manter. Só a reticência sai.

**Tela** Colaboração mensal · **Arquivo** `pages/AdminColaboracoesMensais.tsx` · **Componente** resumo pós-compilação · **Estado** sucesso
Texto atual: `competência {mês}: {n} colaborações criadas · {n} já existente(s) · vínculos: {n} entregas, {n} briefings, {n} obrigações.`
Novo texto: manter.
Motivo: relatório operacional denso, mas é exatamente o que o Dani precisa conferir após compilar. Números com endereço. Preservar.

**Tela** Colaboração mensal · **Arquivo** `pages/AdminColaboracoesMensais.tsx` · **Componente** linha · **Estado** visível
Texto atual: `compilada` (status) / `competência {mês}` / `compilada em {data} por {autor}` / `{n} registros vinculados` / detalhes `valor mensal (snapshot)` / `entregáveis contratados (snapshot)`
Novo texto (opcional): trocar `(snapshot)` por `(congelado na compilação)`.
Motivo: "snapshot" é termo técnico do glossário (Snapshot Comercial). Como é voz operacional, aceitável, mas "congelado na compilação" diz a mesma coisa em português e explica por que aquele valor não muda. Melhoria opcional.

**Tela** Colaboração mensal · **Arquivo** `pages/AdminColaboracoesMensais.tsx` · **Componente** histórico / vazios / erros · **Estado** vários
Texto atual: `histórico de competências por parceira` / `parceira` (com `— inativa`) / `nenhuma parceira cadastrada ainda — cadastre uma parceira antes de compilar uma competência.` / `nenhuma colaboração mensal compilada para esta parceira ainda.` / `carregando parceiras...` / `carregando histórico da parceira...` / erros de carga
Novo texto: no seletor de parceira, trocar o sufixo ` — inativa` por ` (inativa)`. Na tela vazia, `nenhuma parceira cadastrada ainda. cadastre uma parceira antes de compilar uma competência.` Remover reticências dos dois "carregando".
Motivo: dois travessões a eliminar (o sufixo do option e o da frase vazia) e as reticências de loading.

### 3.7 Moderação de cadastros

**Tela** Moderação · **Arquivo** `pages/Admin.tsx` · **Componente** cabeçalho · **Estado** visível
Texto atual: `administração` / `moderação de cadastros` / `aprove ou rejeite contas novas e pedidos de exclusão.`
Novo texto: manter.
Motivo: função da tela em uma linha.

**Tela** Moderação · **Arquivo** `pages/Admin.tsx` · **Componente** `GerarConvite` · **Estado** visível
Texto atual: `links de convite pré-aprovado` / `quem se cadastra por um destes links entra direto, sem passar pela fila de aprovação abaixo.` / `gerar novo link` / `gerando...` / `já utilizado` / `ainda não utilizado` / `copiar` / `copiado!`
Novo texto: `gerando` sem reticências; `copiado` sem exclamação; demais mantidos.
Motivo: a explicação do convite é clara. Reticência sai. A exclamação de "copiado!" contraria a regra da casa (sem exclamação salvo exceção rara). "copiado" basta.

**Tela** Moderação · **Arquivo** `pages/Admin.tsx` · **Componente** `FilaDeExclusao` · **Estado** visível / vazio / erros
Texto atual: `solicitações de exclusão de conta (lgpd)` / `nenhuma solicitação de exclusão pendente.` / `pedido em {data}` / `aprovar` / `negar` / `carregando...` / `não foi possível carregar as solicitações de exclusão.` / `não foi possível registrar a decisão sobre a exclusão.`
Novo texto: `carregando` sem reticências; demais mantidos.
Motivo: padrão consistente.

**Tela** Moderação · **Arquivo** `pages/Admin.tsx` · **Componente** `FilaDeExclusao` (prompt jurídico) · **Estado** decisão
Texto atual (via `window.prompt`): `fundamento jurídico da aprovação (ex.: sem obrigação legal de retenção):` / `fundamento jurídico da negativa (ex.: obrigação fiscal de retenção por 5 anos):`
Novo texto: o texto está claro. Registro de lacuna: ele vive dentro de um `window.prompt` nativo do navegador, que quebra a superfície editorial (fonte do sistema, sem a voz da marca). Recomendação: mover para um campo próprio na tela. Isto é mudança de UI, fora do escopo desta revisão, fica registrado como gap.

**Tela** Moderação · **Arquivo** `pages/Admin.tsx` · **Componente** fila de cadastros · **Estado** vazio / ações / erros
Texto atual: `nenhum cadastro aguardando aprovação.` / `aprovar` / `rejeitar` / `carregando...` / `não foi possível carregar os cadastros pendentes.` / `não foi possível registrar a decisão sobre o cadastro.` / `não foi possível gerar o convite.`
Novo texto: `carregando` sem reticências; demais mantidos.
Motivo: consistente.

### 3.8 Bloqueio de acesso (repetido em 6 telas admin)

**Tela** todas as admin · **Arquivos** `Admin.tsx`, `AdminDashboard.tsx`, `AdminParceiras.tsx`, `AdminEntregas.tsx`, `AdminBriefings.tsx`, `AdminObrigacoes.tsx`, `AdminColaboracoesMensais.tsx`, `experimentos/Hoje.tsx` · **Componente** guarda de papel · **Estado** não-admin
Texto atual: `área restrita a administradores.`
Novo texto: manter, em todas as ocorrências.
Motivo: mensagem única, repetida igual em 8 lugares. É um padrão bom. Registrar como padrão oficial para não divergir no futuro (nunca "acesso negado", nunca "você não tem permissão").

### 3.9 Hoje (experimento)

**Tela** Hoje · **Arquivo** `pages/experimentos/Hoje.tsx` · **Componente** nav / abertura / capítulo · **Estado** visível
Texto atual: `criativo dodô` / `painel completo` / `próximos prazos` / manchete e eyebrow gerados / `ver e decidir` / `ver tudo` / vazio `nada previsto para os próximos dias.`
Novo texto: manter.
Motivo: é a tela com o "cheiro de revista" mais forte do Portal. Eyebrow, manchete, capítulo, ação. Serve de referência de tom para o resto. Preservar como está.

**Tela** Hoje · **Arquivo** `pages/experimentos/Hoje.tsx` · **Componente** placeholder de imagem · **Estado** dev
Texto atual: `material real da entrega — placeholder até existir endpoint de exposição do arquivo enviado (ver relatório, lacuna declarada).`
Novo texto: remover da superfície antes de qualquer publicação.
Motivo: é nota de desenvolvimento com travessão, não texto de produto. Não pode aparecer para usuário. Enquanto existir, ao menos trocar o travessão por dois pontos, mas o certo é não exibir legenda de placeholder.

**Tela** Hoje · **Arquivo** `pages/experimentos/Hoje.tsx` · **Componente** `fraseDoRestante` · **Estado** resumo
Texto atual: `nada mais pedindo atenção agora.` / `e também: {itens}.` / `{n} entrega(s) em revisão` / `{n} material(is) atrasado(s)` / `{n} pagamento(s) pendente(s)` / `{n} cadastro(s) para moderar`
Novo texto: manter.
Motivo: some com precisão o que sobrou. Bom.

**Tela** Hoje · **Arquivo** `pages/experimentos/Hoje.tsx` · **Componente** loading / erro · **Estado** loading / erro
Texto atual: `carregando...` / `não foi possível carregar.`
Novo texto: `carregando` sem reticências; manter o erro.
Motivo: reticências.

### 3.10 Formatadores compartilhados

**Tela** todas · **Arquivo** `lib/formatters.ts` · **Componente** `formatarPrazoRelativo` · **Estado** prazo
Texto atual: `vence hoje` / `vence amanhã` / `vence em {n} dias`
Novo texto: manter.
Motivo: prazo dito como a pessoa pensa. Reaproveitado por Painel e Hoje. Consistente.

**Tela** Hoje · **Arquivo** `pages/experimentos/artefatoPrincipal.ts` · **Componente** manchete/eyebrow · **Estado** gerado
Texto atual: `a entrega de {parceira} é a próxima no prazo.` / `a postagem de {parceira} é a próxima no prazo.` / eyebrow `entrega` / `postagem`
Novo texto: manter.
Motivo: manchete editorial que não fabrica urgência. Exatamente o tom da marca.

---

## 4. Revisão texto a texto: mensagens de erro do backend

Estas mensagens sobem cruas para a tela (o front exibe `erro.message` no lugar do texto
genérico). Hoje elas quebram a voz do Portal: vêm em registro formal, com inicial
maiúscula, ponto final e vocabulário técnico. Ao lado da interface toda minúscula e
acolhedora, destoam na hora. É o maior problema de consistência do produto.

Princípio da reescrita: minúsculo, sem travessão, sem termo de protocolo (OIDC, handshake,
claims) na cara do usuário. Abaixo, arquivo, texto atual e sugestão.

`middleware/requireAuth.ts`
- `Sessão ausente ou expirada.` → `sua sessão expirou. faça login novamente.`
- `Conta não está ativa.` → `esta conta ainda não está ativa.`
- `Operação restrita a Administradores.` → `área restrita a administradores.` (alinha com o padrão da 3.8)

`middleware/isolamento.ts`
- `Parâmetro não permitido: o identificador da Parceira é sempre resolvido pela sessão.` → mensagem interna de proteção, o usuário nunca deveria vê-la. Se puder aparecer, encurtar para `não foi possível concluir a operação.` e registrar o detalhe técnico só no log.

`app.ts`
- `Rota não encontrada.` → `página não encontrada.`

`modules/identidade/auth.routes.ts`
- `Handshake OIDC inválido.` → `não foi possível concluir o login. tente novamente.`
- `Token do Google não trouxe claims obrigatórias.` → `não foi possível concluir o login com o Google. tente novamente.`
- `Não foi possível concluir o login com o Google.` → `não foi possível concluir o login com o Google.` (só minusculizar)
- `Parâmetros obrigatórios: email, nome, papelAtor, estadoConta.` → mensagem de API interna, não deveria chegar ao usuário final; manter técnica no log, genérica na tela (`não foi possível concluir o cadastro.`)
- `Conta não encontrada.` → `conta não encontrada.`
- `Cadastro já foi enviado para esta conta.` → `este cadastro já foi enviado.`

`modules/identidade/admin.routes.ts`
- `Conta não encontrada.` → `conta não encontrada.`
- `Conta não está com status Pendente.` → `esta conta não está mais aguardando aprovação.`

`modules/conteudo/conteudo.routes.ts`
- `Entrega não encontrada.` → `entrega não encontrada.`
- `Esta Entrega não está aguardando material.` → `esta entrega não está mais aguardando material.`
- `Tipo de arquivo não suportado — envie imagem ou vídeo.` → `tipo de arquivo não suportado. envie uma imagem ou um vídeo.` (remove travessão)
- `Arquivo excede o tamanho máximo permitido (20MB).` → `arquivo grande demais. o limite é 20 MB.`

`modules/financeiro/*.ts`
- `Período inexistente para esta Parceira.` → `não há dados para este período.`
- `Campos obrigatórios: parceiraId, mesReferencia, valor, tipo.` → API interna; genérica na tela: `não foi possível lançar a obrigação.`
- `Campo obrigatório: valor.` → `informe o valor.`
- `tipo deve ser '...'` → API interna, genérica na tela.

`modules/colaboracao-mensal/admin.routes.ts`
- `mesReferencia deve estar no formato AAAA-MM.` → `a competência deve estar no formato aaaa-mm.`
- `Parâmetro obrigatório: parceiraId.` → API interna, genérica na tela.
- `Colaboração Mensal não encontrada.` → `colaboração mensal não encontrada.`

`modules/parceira/parceira.routes.ts`
- `Parceira não encontrada.` → `parceira não encontrada.`
- `status deve ser '...'` → API interna, genérica na tela.

`modules/perfil/perfil.routes.ts`
- `Perfil não encontrado.` → `perfil não encontrado.`

`modules/lgpd/lgpd.routes.ts`
- `Campos obrigatórios: aprovada (boolean), fundamentoJuridico, responsavelAnalise.` → API interna, genérica na tela.
- `Solicitação não encontrada.` → `solicitação não encontrada.`
- `Solicitação já foi decidida.` → `esta solicitação já foi decidida.`

Nota de escopo: distinguir dois tipos de mensagem. Erro de validação de API (lista de
campos JSON) nasce para o desenvolvedor, não para o usuário, e o certo é não vazar para a
tela (mostrar uma genérica e logar o detalhe). Erro de negócio ("conta não encontrada",
"arquivo grande demais") é para o usuário e deve falar a voz da casa. A tabela acima marca
os dois casos.

---

## 5. Auditoria editorial

### Telas com a linguagem mais consistente

Suas entregas (`Pendencias.tsx`), Painel administrativo (`AdminDashboard.tsx`) e Hoje
(`experimentos/Hoje.tsx`) são as mais coerentes. Falam com a pessoa, separam o que depende
dela do que não depende, e fecham com o que está sob controle em vez de só cobrar. É a voz
da marca funcionando. O Painel e o Hoje mostram que a voz operacional também pode ter
ritmo, não precisa virar formulário.

### Telas que destoam

Nenhuma tela do front destoa por si. O que destoa é a camada de erro do backend, que
atravessa todas. No momento em que algo dá errado, o Portal troca de voz: sai da minúscula
acolhedora e entra no registro formal com termo de protocolo. O usuário sente a costura.
Corrigir a seção 4 resolve o maior salto de tom do produto.

Em segundo lugar, as telas de CRUD administrativo (Obrigações, Colaboração mensal) têm os
resíduos mais técnicos ("elegível para liberação", "snapshot", "registros vinculados").
Não são erro, porque quem lê é o Dani, mas são onde o "cheiro de software" ainda aparece.

### Textos que envelheceram

O nome interno "pendências" vaza para a pessoa no erro de carga de "suas entregas". A tela
já foi rebatizada para "suas entregas", o texto de erro ficou para trás. É o único ponto
onde a nomenclatura de rota escapou para a superfície.

### Textos que parecem técnicos

`Handshake OIDC inválido.`, `Token do Google não trouxe claims obrigatórias.`,
`mesReferencia deve estar no formato AAAA-MM.`, `elegível para liberação`, `(snapshot)`.
Os três primeiros são backend e devem ser reescritos. Os dois últimos são admin, opcionais.

### Textos que parecem burocráticos

O `window.prompt` de fundamento jurídico da exclusão LGPD é o trecho mais burocrático da
experiência, e ainda por cima num prompt nativo do navegador, sem a voz da marca. Funciona,
mas é o ponto que mais parece cartório dentro do Portal.

### Textos que parecem frios

As mensagens de erro do backend, pelo registro formal e o ponto final categórico. Uma vez
minusculizadas e reescritas com causa e caminho, esfriam menos.

### Palavras em excesso (e por que estão certas)

"não foi possível" abre quase todo erro. Poderia soar repetitivo, mas é proposital: é o
padrão de erro da casa e a repetição cria previsibilidade. Manter. "competência" aparece
muito: correta na voz operacional, mas não deve invadir a voz externa (ver o ajuste na
intro do Financeiro). "carregando" e "salvando" aparecem em todo lugar: certo, só sem as
reticências.

### Palavras que devem desaparecer

O travessão, em todos os contextos (separador de lista, junção de endereço, marcador de
campo vazio, ligação de frase). As reticências, em todos os estados de progresso. A
capitalização de agregados do código na tela ("Entrega", "Parceira", "Colaboração Mensal"
com maiúscula no meio da frase). O nome de rota "pendências" na voz externa. A barra "/"
como conjunção ("aprovadas/publicadas"). A exclamação ("copiado!").

### Metáforas a preservar

O Portal quase não usa metáfora, e isso é uma qualidade. As poucas escolhas de imagem que
funcionam são estruturais, não decorativas: "o que precisa acontecer" (entrega como algo
que acontece, não que se produz), "com a equipe" versus "para você agora" (o trabalho como
algo que troca de mãos). Preservar. São imagens com endereço.

### Metáforas a abandonar

Não há metáfora forçada a cortar. O risco futuro é inventar imagem para "aquecer" a voz
operacional. Não fazer. A precisão já é o calor certo ali.

### Frases que podem virar padrão do Portal

- `nada pendente da sua parte agora.` (estado de alívio, voz externa)
- `o restante está dentro do esperado: {resumo}.` (fechamento de calma, voz operacional)
- `não foi possível {ação}.` (todo erro de negócio)
- `nenhum(a) {coisa} {cadastrada/criada/lançada} ainda.` (vazio de base)
- `nenhum(a) {coisa} encontrada para esse filtro.` (vazio de filtro)
- `área restrita a administradores.` (bloqueio de papel)
- `vence hoje` / `vence amanhã` / `vence em {n} dias` (prazo relativo)

### Telas com "cheiro de software"

Obrigações e Colaboração mensal, pelos resíduos técnicos já citados. É onde a origem CRUD
ainda aparece. Nada grave, tudo endereçável com os ajustes opcionais da seção 3.

### Telas com "cheiro de revista"

Hoje, na frente, com folga. Depois o Painel administrativo (o rodapé de normalidade) e
Suas entregas (a separação "para você agora" versus "com a equipe"). São a régua do resto.

---

## 6. Glossário oficial

Terminologia da superfície, derivada do `PORTAL_GLOSSARIO.md` e do Contrato Soberano, com
a divisão entre as duas vozes. Formato: conceito, usar, nunca usar.

**A colaboração do mês**
Usar: colaboração mensal (voz operacional).
Nunca usar: ciclo, ciclo mensal, campanha, plano de colaboração.
Nota: termo soberano (ADR-002). "ciclo mensal" é banido no domínio.

**A pessoa que produz**
Usar: parceira (voz operacional); você / sua (voz externa, falando com ela).
Nunca usar: influenciadora (na superfície), usuária, creator, criadora.
Nota: "influenciadora" é papel de acesso no código, não palavra de tela.

**A unidade de conteúdo**
Usar: entrega (as duas vozes).
Nunca usar: ativação, job, material (como sinônimo da entrega), post (como sinônimo).
Nota: "Entrega" com maiúscula é nome de agregado no código, na tela é minúsculo.

**O arquivo que ela envia**
Usar: material (o arquivo em si: "enviar material", "material enviado").
Nunca usar: mídia, asset, upload (como substantivo de tela).
Nota: material é o arquivo, entrega é a unidade. Não confundir os dois.

**O que orienta a produção**
Usar: briefing (as duas vozes); look, data de entrega, data de postagem, orientação.
Nunca usar: brief, pauta, roteiro (para este conceito).

**O dinheiro, para a influenciadora**
Usar: pagamentos, financeiro, a receber, já pago, previsto (voz externa).
Nunca usar: obrigação, obrigação financeira (com ela nunca).

**O dinheiro, para o admin**
Usar: obrigação, obrigação financeira, lançar, liberar, marcar como pago (voz operacional).
Nunca usar: fatura, cobrança, boleto.
Nota: mesmo dinheiro, duas palavras conforme a voz. "obrigação" some para a influenciadora.

**O eixo de tempo**
Usar: período (voz externa); competência (voz operacional).
Nunca usar: mesReferencia, mês de referência (na tela), ciclo.
Nota: a influenciadora vê "período", o admin vê "competência". Não misturar na mesma voz.

**O envio físico do produto**
Usar: envio (quando existir na tela).
Nunca usar: fluxo logístico, envio logístico (banidos no domínio), frete (como o conceito).

**O estado da entrega**
Usar: aguardando material, em revisão, aprovado, publicado.
Nunca usar: pendente, em análise, ok, finalizado, concluído (para estes estados).
Nota: quatro rótulos fixos, iguais em toda tela que mostrar estado de entrega.

**O estado do pagamento**
Usar: em aberto, aprovado, pago (admin); a receber, já pago (influenciadora).
Nunca usar: pendente de pagamento, quitado, liquidado.

**O congelamento comercial**
Usar: congelado na compilação (voz operacional).
Nunca usar: snapshot (preferir a versão em português), foto, print.

**O bloqueio de acesso**
Usar: área restrita a administradores.
Nunca usar: acesso negado, você não tem permissão, sem autorização, 403.

**A conta e o login**
Usar: conta Google, entrar, sair, sua sessão expirou.
Nunca usar: logar, deslogar, autenticação, OIDC, token, handshake, sign in.
Nota: "Google" é o único nome próprio que leva maiúscula na superfície.

**A marca**
Usar: criativo dodô (minúsculo em corpo de texto), Criativo Dodô (em alt de logo e título formal).
Nunca usar: dodo (sem acento), Estúdio Elã, TEAR (nomes legados).

---

## 7. Guia de microcopy

Guia para qualquer tela futura. Se uma tela nova seguir isto, ela nasce na voz do Portal.

### Voz da marca

O Portal fala baixo e certo. Diz o que aconteceu, o que vem depois e o que fazer. Não
enfeita, não alarma, não pede desculpa à toa. Quando tudo está bem, fala do que está sob
controle, não só do que falta.

### Personalidade

Alguém que domina a operação e respeita o tempo de quem lê. Do lado da influenciadora, é
uma parceira que organiza sem cobrar. Do lado do admin, é um painel que decide rápido e não
esconde número.

### Tom

Duas temperaturas, uma marca. Voz externa: acolhedora, possessiva ("suas entregas", "seus
dados"), nunca infantil. Voz operacional: seca, precisa, feita para agir. As duas em
minúsculo, sem travessão, sem reticências, sem exclamação.

### Ritmo

Frase curta como padrão. Uma frase mais longa quando precisa explicar o porquê. Linha
isolada quando algo precisa de peso ("nada pendente da sua parte agora."). Nunca três
frases de igual tamanho em sequência.

### Estrutura das frases

Verbo na frente na ação ("enviar material", "baixar meus dados"). Diagnóstico antes da
instrução no erro ("cep incompleto: precisa de 8 dígitos."). Nada de voz passiva quando a
ativa cabe.

### Estrutura dos títulos

Uma a três palavras, minúsculo, substantivo possessivo quando fala com a pessoa ("suas
entregas", "perfil", "financeiro e histórico"). Sem verbo no título, o verbo vai no botão.

### Estrutura dos subtítulos (eyebrow e intro)

Eyebrow: uma etiqueta curta acima do título ("conteúdo mensal", "administração",
"pagamentos"). Intro: uma linha que diz o que a pessoa faz nesta tela, começando por verbo
(acompanhe, busque, crie).

### Estrutura dos CTAs

Verbo mais objeto, curto, minúsculo. "enviar cadastro", "enviar material", "gerar novo
link", "compilar competência". Nada de "clique aqui", "confirmar", "ok" sozinho.

### Estrutura das mensagens de erro

`não foi possível {ação}.` para erro de sistema. Para erro que a pessoa corrige, diagnóstico
mais caminho: `{o que houve}: {o que fazer}.` ou `{o que houve}. {o que fazer}.`. Nunca
culpar quem lê, nunca termo de protocolo, nunca travessão.

### Estrutura das mensagens de sucesso

Curtíssima, sem "com sucesso". "material enviado", "salvo", "copiado". O ícone e a mudança
de tela já confirmam, a palavra só sela.

### Estrutura das mensagens de espera

Gerúndio da ação, sem reticências: "carregando", "salvando", "enviando", "compilando". Se
puder nomear o objeto, melhor: "carregando suas entregas".

### Estrutura das mensagens sensíveis (bloqueio, recusa, análise)

Nomear o estado sem drama ("acesso indisponível", "seu acesso está em análise"), explicar
em uma linha e sempre dar um caminho ("fale com a equipe criativo dodô", "sair e tentar
novamente"). O modelo já existe nas telas de Login PENDING e INACTIVE.

### Estrutura das notificações e avisos

Uma linha, o fato mais o que acontece a seguir. "pedido de exclusão registrado. a equipe
avaliará e retornará sobre a decisão."

### Estrutura dos estados vazios

Dizer que está vazio e, quando fizer sentido, sinalizar que vai encher com "ainda". Separar
base vazia ("nenhuma parceira cadastrada ainda.") de filtro sem resultado ("nenhuma
parceira encontrada para esse filtro."). Do lado da pessoa, o vazio pode ser alívio ("nada
pendente da sua parte agora.").

### Estrutura das confirmações

Botão diz a ação real ("aprovar", "negar", "desativar", "remover"), não "sim/não". Quando a
ação é destrutiva ou irreversível, o contexto explica a consequência antes (como o tooltip
de remover briefing).

### Estrutura dos placeholders

Orientar o formato ou dar exemplo, sem repetir o label. "como você quer ser identificada",
"nome, chave, e-mail ou cnpj", "2026-07", "00000-000". Nunca repetir o nome do campo.

### Estrutura dos tooltips

Só quando uma ação está bloqueada ou não é óbvia. Explicar por que, em uma frase, sem
travessão. "há entregas da competência ainda não aprovadas ou publicadas."

### Regras que valem para toda tela nova

Minúsculo por padrão, maiúscula só em nome próprio (Google) e no alt do logo. Sem
travessão, sem reticências, sem exclamação, sem barra como conjunção. Separador de itens em
linha é o `·`. Campo vazio é "não informado", nunca um traço. Nome de agregado do código
nunca aparece capitalizado na tela. Nome de rota nunca vira palavra de usuário.

---

## 8. Resumo de aplicação para o próximo agente

Ordem sugerida para quem for aplicar, do maior impacto ao menor.

1. Backend: minusculizar e reescrever as mensagens de erro de negócio (seção 4). Maior
   salto de tom do produto.
2. Global: remover reticências de todos os estados de progresso (carregando, salvando,
   enviando, gerando, compilando, removendo). Lista completa nas seções 2 e 3.
3. Global: remover travessão em todos os contextos (separadores, junção de endereço,
   marcador de vazio, ligação de frase, sufixo de option). Trocar por `·`, vírgula, dois
   pontos, ponto, parênteses ou "não informado", conforme cada caso registrado.
4. Superfície: minusculizar agregados do código que aparecem na tela ("Entrega",
   "Colaboração Mensal").
5. Voz externa: trocar "pendências" por "suas entregas" no erro de carga, e "competência"
   por "período" na intro do Financeiro.
6. Pontuais: "copiado!" para "copiado"; barra "/" para "ou".
7. Opcionais (voz operacional, só se quiser aproximar do cheiro de revista): "elegível para
   liberação", "(snapshot)".
8. Gaps que exigem UI, fora do escopo de texto: `window.prompt` da LGPD e a legenda de
   placeholder no experimento Hoje.

Nenhum item acima altera comportamento, layout ou fluxo. Tudo é texto.
