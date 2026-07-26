# Roteiro de Homologação Manual — TEAR V2 (Laravel + React)

Documento de apoio operacional para um **humano** validar, clicando na
aplicação `tear-v2-app` (Laravel 13 + React, `tear-v2-app/backend` e
`tear-v2-app/frontend`), que cada fluxo de negócio funciona de ponta a
ponta. Não é teste automatizado, não substitui a suíte de testes do
backend/frontend nem o `docs/_workspace/DEPLOY_CHECKLIST.md` (pré-deploy).

**Este roteiro cobre exclusivamente o `tear-v2-app`.** O sistema legado em
Google Apps Script (Portal Ela, ainda em produção) tem roteiro próprio em
`docs/_workspace/ROTEIRO_HOMOLOGACAO.md` — são dois sistemas distintos,
não confundir nem misturar os passos.

**Base de construção:** leitura direta do código do `tear-v2-app`
(controllers, FormRequests, models, migrations, páginas React) nesta
sessão, cruzada com os achados já registrados em `docs/_workspace/
TASK_ROUTER.md` §37 (Homologação Funcional) e §38 (Auditoria de regras de
negócio). Não existe PRD/SPEC formal próprio do `tear-v2-app` ainda — o
comportamento esperado descrito aqui é o comportamento real observado no
código nesta data.

---

## 0. Antes de começar

- **Ambiente:** backend e frontend do `tear-v2-app` rodando e acessíveis
  (URL local ou de homologação).
- **Conta de Administrador** já existente (seed ou criada previamente),
  com e-mail/senha conhecidos.
- **Upload de arquivos** (Material e Comprovante de pagamento) depende de
  integração com Google Drive configurada no ambiente. Se não estiver
  configurada, o upload retorna erro "Envio de materiais está
  temporariamente indisponível." — **isso é limitação de ambiente, não
  bug**; confirme a configuração antes de reportar falha nesses passos.
- **E-mails** (convite de Parceira, recuperação de senha) — confirme onde
  o ambiente de teste captura e-mails enviados (SMTP real, log, ou
  ferramenta de captura tipo Mailtrap) antes de começar, para conseguir
  seguir os links de convite/redefinição de senha.
- **Duas sessões de navegador separadas** (uma para Administrador, outra
  para Influenciadora — ex. uma normal e uma anônima) evitam que o login
  de um papel derrube a sessão do outro durante o roteiro.
- Papel `GESTOR_MARCA` existe no sistema mas **não tem nenhuma tela ou
  permissão própria implementada — não homologável nesta versão**, não
  testar.

---

## 1. Fluxo de entrada — Cadastro público de candidata (sem login)

### F1. Cadastro público de Parceira
- **Pré-requisitos:** nenhum — tela pública, sem autenticação.
- **Passos:**
  1. Acessar a tela de cadastro público (`/cadastro`).
  2. Preencher: Nome, Email, Telefone (com DDD), Instagram, Chave PIX, UF,
     Cidade — todos obrigatórios. CNPJ é opcional, mas se preenchido
     precisa ser um CNPJ com dígito verificador válido (não aceita
     qualquer sequência de 14 números). CEP/Rua/Número/Complemento/Bairro
     são opcionais; preencher o CEP faz o endereço completar sozinho.
  3. Marcar o checkbox de consentimento LGPD (obrigatório).
  4. Clicar em **"enviar cadastro"**.
- **Resultado esperado:** tela de confirmação de cadastro enviado. A
  candidata nasce com status **Inativa**, aguardando aprovação.
- **Critério de aprovação:** ✅ aprovado se o cadastro é aceito com esses
  dados e a candidata aparece na lista de "novas inscrições" do
  Administrador (ver A2). ❌ reprovado se o cadastro for aceito com campo
  obrigatório vazio, ou se um CNPJ inválido passar sem erro.
- **Caso de borda esperado (não é bug):** tentar cadastrar um Nome já
  usado por outra Parceira retorna erro de duplicidade — nome é único no
  sistema.

---

## 2. Fluxos do Administrador

### A1. Login como Administrador
- **Pré-requisitos:** conta de Administrador já existente.
- **Passos:** acessar a tela de login, preencher "Email"/"Senha", clicar
  **"entrar"**.
- **Resultado esperado:** acesso ao painel administrativo.
- **Critério de aprovação:** ✅ credenciais corretas entram; ❌
  credenciais erradas mostram mensagem genérica "Email ou senha
  inválidos. Verifique e tente novamente." — **mensagem genérica é
  proposital** (não distingue e-mail inexistente de senha errada), não
  reportar como bug.

### A2. Analisar e aprovar cadastro de Parceira
- **Pré-requisitos:** existe uma Parceira com status **Inativa** (ex. a
  criada no passo F1).
- **Passos:**
  1. Abrir a lista de Parceiras, aba "novas inscrições".
  2. Abrir o cadastro da candidata.
  3. Clicar em **"aprovar"** (só aparece com status Inativa).
- **Resultado esperado:** status muda para **Ativa**; um usuário de
  acesso é criado e vinculado; um e-mail de convite (definir senha) é
  enviado para a candidata.
- **Critério de aprovação:** ✅ aprovado se status muda para Ativa, e o
  e-mail de convite chega (ou aparece na ferramenta de captura de
  e-mails) com link de definir senha funcional. ❌ reprovado se o status
  não mudar, se o e-mail não for enviado, ou se aprovar uma Parceira já
  Ativa não bloquear com uma mensagem clara (deve mostrar "Parceira já
  está ativa.").

### A3. Reprovar cadastro de Parceira
- **Pré-requisitos:** outra Parceira com status **Inativa** (usar uma
  segunda candidata de teste — não reaproveitar a aprovada em A2).
- **Passos:** abrir o cadastro, clicar **"reprovar"**, preencher "Motivo
  da reprovação" (opcional) e clicar **"confirmar reprovação"**.
- **Resultado esperado:** a Parceira **continua com status Inativa**
  (não existe um status "Reprovada" separado) — a tela passa a mostrar
  "Solicitação reprovada em [data]" com o motivo, se informado.
- **Critério de aprovação:** ✅ aprovado se a mensagem/estado reprovado
  aparece corretamente e reprovar de novo a mesma Parceira mostra
  "Parceira já foi reprovada." (não deixa reprovar duas vezes). ❌
  reprovado se a Parceira sumir da lista, mudar para um status errado,
  ou se reprovar duas vezes não for bloqueado.

### A4. Reenviar convite
- **Pré-requisitos:** Parceira com status **Ativa** (ex. a de A2) que
  ainda não definiu senha.
- **Passos:** no cadastro da Parceira, clicar **"reenviar convite"**.
- **Resultado esperado:** novo e-mail de convite enviado.
- **Critério de aprovação:** ✅ aprovado se o e-mail chega; clicar de
  novo muito rápido em sequência deve ser bloqueado por limite de
  frequência (throttle) — **isso é esperado**, não reportar como bug.

### A5. Editar cadastro administrativo de Parceira
- **Pré-requisitos:** Parceira existente (qualquer status).
- **Passos:** abrir a edição do cadastro, alterar campos administrativos
  exclusivos do Admin (Razão social, Canais de uso de imagem, Prazo de
  uso de imagem) e os campos gerais (endereço, contato), reconfirmar o
  checkbox de consentimento (obrigatório mesmo em edição), salvar.
- **Resultado esperado:** dados atualizados refletidos na tela.
- **Critério de aprovação:** ✅ aprovado se os novos valores persistem
  após recarregar a página. ❌ reprovado se algum campo salvo não
  persistir ou se salvar sem marcar o consentimento for aceito.

### A6. Consultar Histórico de Alterações da Parceira
- **Pré-requisitos:** ter executado A5 (ao menos uma edição registrada).
- **Passos:** na própria tela de detalhe da Parceira (não é o item de
  menu "Histórico", que está desabilitado), localizar a seção de
  histórico.
- **Resultado esperado:** lista de alterações (campo, autor, data,
  valor anterior → novo), mais recente primeiro.
- **Critério de aprovação:** ✅ aprovado se a edição de A5 aparece
  corretamente listada. **Limitação conhecida, não reportar como bug
  novo:** aprovação/reprovação de cadastro (A2/A3) **não aparecem**
  nesse histórico — só edições de dados cadastrais via A5 são
  registradas.

### A7. Cadastrar e editar Marca
- **Pré-requisitos:** nenhum.
- **Passos:** criar uma Marca nova preenchendo Nome (obrigatório,
  único), CNPJ, Nome/Email/Telefone do contato, salvar. Depois editar a
  mesma Marca e salvar de novo.
- **Resultado esperado:** Marca aparece na listagem e nos formulários de
  Campanha.
- **Critério de aprovação:** ✅ aprovado se criar/editar funcionam e o
  nome duplicado é rejeitado. **Limitação conhecida:** não existe campo
  de Status (Ativa/Inativa) na tela — não testar ativar/inativar Marca
  pela UI.

### A8. Criar Campanha
- **Pré-requisitos:** ao menos uma Marca cadastrada (A7).
- **Passos:** criar Campanha escolhendo a Marca, preenchendo Nome,
  Descrição, data de Início e Fim (Fim precisa ser ≥ Início), salvar.
- **Resultado esperado:** Campanha criada com status inicial (Planejada).
- **Critério de aprovação:** ✅ aprovado se a Campanha aparece na
  listagem com os dados corretos e a data Fim < Início é rejeitada.

### A9. Vincular Parceira à Campanha (criar Participação)
- **Pré-requisitos:** Campanha criada (A8) e Parceira com status **Ativa**
  (A2).
- **Passos:** dentro da Campanha, usar o formulário "vincular parceira":
  escolher a Parceira (só aparecem Ativas e ainda não vinculadas a essa
  campanha), preencher Valor contratado e quantidades (Reels/Carrossel/
  Stories), clicar **"vincular parceira"**.
- **Resultado esperado:** Participação criada com status **Ativa**,
  aparece na lista da Campanha.
- **Critério de aprovação:** ✅ aprovado se a Participação aparece
  corretamente e tentar vincular a mesma Parceira duas vezes na mesma
  Campanha é bloqueado.

### A10. Congelar e cancelar Participação
- **Pré-requisitos:** Participação ativa (A9).
- **Passos:** clicar **"congelar"** na Participação; confirmar que os
  campos comerciais (valor, quantidades) ficam travados para edição.
  Depois, numa segunda Participação de teste, clicar **"cancelar"**.
- **Resultado esperado:** congelar trava edição comercial; cancelar muda
  status para **Cancelada**.
- **Critério de aprovação:** ✅ aprovado se editar valor/quantidade de
  uma Participação congelada é bloqueado com mensagem clara, e
  congelar/cancelar duas vezes a mesma Participação é bloqueado. ⚠️
  **atenção ao testar:** cancelar uma Participação não bloqueia nem
  cancela Pagamento/Envio já existentes — é limitação conhecida, não
  reportar como bug novo, mas vale confirmar que não trava o sistema.

### A11. Criar e publicar Briefing
- **Pré-requisitos:** Participação ativa (A9).
- **Passos:** abrir "briefing" da Participação, escolher Tipo (**só
  Feed/Reels/Stories estão disponíveis na tela** — TikTok/UGC foram
  removidos de propósito, não testar), preencher Orientações, Prazo e
  Entregáveis esperados, publicar.
- **Resultado esperado:** briefing publicado; campo "Aprovação interna
  calculada" mostra a data (Prazo − 7 dias) automaticamente.
- **Critério de aprovação:** ✅ aprovado se o briefing publicado aparece
  corretamente para o Administrador e, depois, para a Influenciadora
  (ver I5).

### A12. Avaliar Material (aprovar/reprovar)
- **Pré-requisitos:** material enviado pela Influenciadora (I6) para a
  Participação com briefing publicado.
- **Passos:** abrir "materiais" da Participação, num item com status
  **Pendente**, clicar **"aprovar"** (ou **"reprovar"**, preenchendo
  motivo obrigatório).
- **Resultado esperado:** status muda para **Aprovado** ou **Reprovado**
  (final, sem reversão pela tela).
- **Critério de aprovação:** ✅ aprovado se a mudança de status reflete
  corretamente e avaliar o mesmo item duas vezes é bloqueado ("Material
  já foi avaliado.").

### A13. Criar Pagamento e testar o bloqueio de material não aprovado (P0-1)
- **Pré-requisitos:** Participação sem Pagamento ainda, com ao menos um
  Material **ainda não aprovado** (Pendente ou Reprovado).
- **Passos:**
  1. Criar o Pagamento preenchendo "Valor (R$)" — nasce como
     **Pendente**.
  2. **Teste negativo obrigatório:** tentar avançar para "aprovar" ou
     "marcar como pago" **enquanto existir material não aprovado**.
- **Resultado esperado:** o avanço é **bloqueado** com mensagem "Pagamento
  não pode avançar: há material da participação ainda não aprovado."
- **Critério de aprovação:** ✅ **aprovado somente se esse bloqueio
  ocorrer** — esta é a regra de negócio central do fluxo de Pagamento
  (impede liberar dinheiro sem entrega aprovada) e é o único item que já
  foi encontrado quebrado em auditoria anterior desta fase (corrigido).
  ❌ reprovado (bloqueador crítico) se o sistema permitir avançar para
  Aprovado ou Pago com material pendente/reprovado.

### A14. Avançar Pagamento até Pago (fluxo positivo)
- **Pré-requisitos:** todos os Materiais da Participação com status
  **Aprovado** (repetir A12 aprovando o material usado em A13).
- **Passos:** clicar **"aprovar"** (Pendente → Aprovado), depois
  **"marcar como pago"** (Aprovado → Pago).
- **Resultado esperado:** as duas transições completam sem erro.
- **Critério de aprovação:** ✅ aprovado se o status final é **Pago** e a
  sequência de status fica visível/consistente na tela.

### A15. Anexar comprovante de pagamento
- **Pré-requisitos:** Pagamento criado (qualquer status).
- **Passos:** clicar **"enviar comprovante"**, escolher um arquivo
  (pdf/jpg/jpeg/png/webp, até 10MB), enviar.
- **Resultado esperado:** comprovante anexado e visível; reenviar
  substitui o anterior ("substituir comprovante").
- **Critério de aprovação:** ✅ aprovado se o arquivo é aceito e
  fica disponível para download/visualização.

### A16. Criar e avançar Envio
- **Pré-requisitos:** Participação existente (não precisa de Material
  aprovado nem de Pagamento — isso é limitação conhecida, não bug).
- **Passos:** criar o Envio (Código de rastreio é opcional), depois
  avançar **"marcar como expedido"** e, em seguida, **"marcar como
  entregue"**.
- **Resultado esperado:** status percorre Pendente → Expedido →
  Entregue.
- **Critério de aprovação:** ✅ aprovado se as transições completam e o
  endereço de entrega exibido corresponde ao cadastro atual da Parceira.
  **Atenção:** se a Parceira alterar o próprio endereço depois do envio
  já Expedido, a tela passará a mostrar o endereço novo (não o usado na
  expedição) — comportamento de design conhecido, não reportar como bug.

### A17. Consultar visão agregada de Logística
- **Pré-requisitos:** ao menos um Envio criado (A16) numa Campanha e
  Participação **Ativas**.
- **Passos:** abrir a tela de Logística.
- **Resultado esperado:** lista as participações ativas de campanhas
  ativas com link direto para o envio.
- **Critério de aprovação:** ✅ aprovado para o caso padrão. **Não é bug
  conhecido, mas vale confirmar:** se a Campanha ou Participação do
  Envio mudar de status (encerrada/cancelada), a linha some dessa tela —
  para continuar acessando esse Envio, use o caminho alternativo pela
  tela de detalhe da Campanha (link "envio" sempre visível ali,
  independente de status).

### A18. Logout do Administrador
- **Passos:** clicar **"sair"**.
- **Resultado esperado:** volta para a tela de login; tentar acessar uma
  tela administrativa sem sessão redireciona para o login.
- **Critério de aprovação:** ✅ aprovado se não sobra nenhum acesso
  autenticado após o logout.

---

## 3. Fluxos da Influenciadora (Portal da Parceira)

### I1. Definir senha (primeiro acesso via convite)
- **Pré-requisitos:** convite enviado (A2 ou A4).
- **Passos:** abrir o link do e-mail de convite, preencher "Nova senha" e
  "Confirmar senha" (mínimo 8 caracteres), clicar **"definir senha"**.
- **Resultado esperado:** senha definida, redirecionamento para login.
- **Critério de aprovação:** ✅ aprovado se a nova senha funciona no
  login (I2) logo em seguida. Acessar a tela sem `token`/`email` na URL
  mostra "Link inválido" direto — comportamento esperado. Usar o mesmo
  link uma segunda vez deve falhar com mensagem genérica (token de uso
  único) — também esperado, não é bug.

### I2. Login como Influenciadora
- **Pré-requisitos:** senha já definida (I1).
- **Passos:** preencher "Email"/"Senha", clicar **"entrar"**.
- **Resultado esperado:** acesso ao Portal (dashboard próprio).
- **Critério de aprovação:** ✅ aprovado se o acesso é exclusivo aos
  próprios dados — confirmar que não é possível ver campanhas/dados de
  outra Parceira trocando IDs na URL manualmente.

### I3. Recuperação de senha
- **Pré-requisitos:** conta já existente.
- **Passos:** na tela de login, ir para "esqueci senha", informar o
  e-mail, clicar **"enviar link"**, seguir o link recebido, definir nova
  senha.
- **Resultado esperado:** sempre mostra "Se houver uma conta para
  {email}, enviamos um link…" **independente de o e-mail existir ou não**
  — proposital, não reportar como bug.
- **Critério de aprovação:** ✅ aprovado se, para um e-mail que existe de
  fato, o link chega e a troca de senha funciona.

### I4. Visualizar Dashboard
- **Pré-requisitos:** login feito (I2), ao menos uma Participação ativa
  (A9).
- **Passos:** observar a tela inicial do Portal.
- **Resultado esperado:** saudação, card "Próximos passos" (aparece se
  faltar CEP/Rua/Cidade/UF no cadastro), cards das participações ativas
  (campanha, marca, resumo de entregáveis, status de pagamento), card de
  status da conta.
- **Critério de aprovação:** ✅ aprovado se os dados exibidos batem com o
  que foi cadastrado pelo Administrador nos passos anteriores.

### I5. Ver Campanha e Briefing publicado
- **Pré-requisitos:** briefing publicado (A11).
- **Passos:** abrir a Campanha própria, depois a Participação, e
  verificar o conteúdo do briefing por tipo contratado.
- **Resultado esperado:** mostra Look/Orientações/Prazo; se o briefing
  ainda não foi publicado para aquele tipo, mostra "briefing ainda não
  publicado".
- **Critério de aprovação:** ✅ aprovado se o conteúdo publicado em A11
  aparece idêntico aqui.

### I6. Enviar Material
- **Pré-requisitos:** briefing publicado (A11); quantidade de material já
  enviado para esse tipo ainda não atingiu o total contratado.
- **Passos:** dentro da Participação, escolher o bloco do tipo
  contratado, enviar o arquivo (jpg/jpeg/png/webp/heic/mp4/mov/webm, até
  50MB).
- **Resultado esperado:** material enviado com status **Pendente**,
  disponível para avaliação do Administrador (A12).
- **Critério de aprovação:** ✅ aprovado se o upload funciona e, ao
  atingir a quantidade contratada, o botão de novo envio some/desabilita
  (sem opção de reenviar além do limite).

### I7. Consultar status de Pagamento
- **Pré-requisitos:** Pagamento criado pelo Administrador (A13/A14).
- **Passos:** abrir o bloco de Pagamento da Participação (somente
  leitura, sem ação disponível para a Influenciadora).
- **Resultado esperado:** status atual do pagamento visível e igual ao
  que o Administrador vê.
- **Critério de aprovação:** ✅ aprovado se o status exibido bate com o
  registrado por A13/A14 em tempo real (sem precisar de ação da
  Influenciadora).

### I8. Editar Perfil (dados pessoais)
- **Pré-requisitos:** login feito.
- **Passos:** ir em "Meu perfil", alterar Chave PIX/Telefone/Instagram/
  Endereço (CEP recompõe Rua/Bairro/Cidade/UF automaticamente), clicar
  **"salvar dados pessoais"**.
- **Resultado esperado:** dados atualizados persistem.
- **Critério de aprovação:** ✅ aprovado se os novos valores aparecem
  também na visão do Administrador (A5) depois de salvos. Campos
  administrativos (Razão social, Canais/Prazo de uso de imagem) **não
  devem** estar editáveis aqui — só pelo Admin.

### I9. Preencher/atualizar Medidas
- **Pré-requisitos:** login feito.
- **Passos:** dentro de "Meu perfil", preencher os 5 campos de medida
  (Sutiã tamanho/numeração/taça, Calcinha tamanho, Linha noite tamanho),
  clicar **"salvar medidas"**. Repetir a operação uma segunda vez com
  valores diferentes.
- **Resultado esperado:** ao recarregar a página depois da segunda
  gravação, os valores exibidos são os da **gravação mais recente**.
- **Critério de aprovação:** ✅ aprovado se o valor mais recente é sempre
  o exibido (cada gravação cria um novo registro internamente, mas isso
  é transparente para quem está testando pela tela).

### I10. Consultar Histórico de participações encerradas/canceladas
- **Pré-requisitos:** ao menos uma Participação com Campanha **Encerrada**
  ou **Cancelada**, ou Participação **Cancelada** (ex.: repetir A8-A9
  numa Campanha de teste e depois encerrá-la, ou reaproveitar a
  Participação cancelada em A10).
- **Passos:** no menu do Portal, abrir **"Histórico"**.
- **Resultado esperado:** lista de campanhas/participações que saíram do
  conjunto ativo (Campanha, Marca, Período, Status da campanha,
  Pagamento), cada linha com link **"ver"** que abre o detalhe completo
  da participação (mesmo destino de antes — nada muda ao clicar).
- **Critério de aprovação:** ✅ aprovado se a Participação/Campanha
  encerrada ou cancelada aparece aqui (ela não aparece mais nas telas de
  participações ativas do Portal) e o link "ver" continua mostrando
  briefing/material/pagamento normalmente. Se não houver nenhum registro
  ainda, a tela mostra "Nenhum histórico ainda.".

### I11. Logout da Influenciadora
- **Passos:** clicar **"sair"**.
- **Resultado esperado:** volta para o login do Portal; tentar acessar
  uma tela do Portal sem sessão redireciona para o login.
- **Critério de aprovação:** ✅ aprovado se não sobra nenhum acesso
  autenticado após o logout.

---

## 4. Limitações conhecidas (não reportar como bug novo)

Antes de reportar algo como bug, confirme se não é uma destas limitações
já registradas nesta fase (`TASK_ROUTER.md` §37/§38 e auditoria adversarial
desta sessão):

- Mensagens de erro genéricas em Login/Esqueci senha/Reset — proposital,
  evita indicar se um e-mail existe no sistema.
- Papel `GESTOR_MARCA` sem nenhuma tela/permissão própria implementada.
- Tipos de Briefing "TikTok" e "UGC" removidos da tela de propósito (só
  Feed/Reels/Stories funcionam).
- Marca sem campo de Status (Ativa/Inativa) na tela.
- Itens de menu do Admin marcados "(em breve)" (Colaborações, Briefings,
  Materiais, Aprovações, Pagamentos, Documentos, Histórico, Perfil) —
  Briefing/Materiais/Pagamento/Envio **são funcionais** via drill-down a
  partir de Campanhas; Histórico existe embutido na tela da Parceira
  (não no menu); "Documentos" e "Perfil" do Admin realmente não têm
  implementação.
- Histórico de Alterações não registra eventos de aprovação/reprovação
  de cadastro (A2/A3) — só edições de dados cadastrais (A5).
- Campanha e Participação aceitam mudança de status a qualquer momento,
  sem trava de ordem (ex.: cancelar uma Participação não bloqueia nem
  cancela Pagamento/Envio já existentes).
- Envio pode ser criado/avançado sem checar se o Material foi aprovado.
- Endereço exibido na tela de Envio é lido "ao vivo" do cadastro atual da
  Parceira, não o usado no momento da expedição.
- Upload de Material/Comprovante retorna erro de indisponibilidade se o
  Google Drive não estiver configurado no ambiente — checar configuração
  antes de reportar.
- Duplo clique muito rápido em botões de criação (Pagamento, Briefing,
  Envio, Participação, Cadastro) pode, em casos raros de corrida, gerar
  uma tela de erro genérica em vez de uma mensagem de negócio — já
  registrado como item de robustez, não bloqueia homologação.

---

## 5. Checklist única — Certificação do MVP de ponta a ponta

Execute nesta ordem, numa sessão só, para certificar que o TEAR V2
funciona de ponta a ponta. Cada item remete ao fluxo detalhado acima.

- [ ] **F1** — Candidata se cadastra publicamente
- [ ] **A2** — Admin aprova o cadastro (e-mail de convite chega)
- [ ] **A3** — Admin reprova um segundo cadastro de teste
- [ ] **A4** — Admin reenvia convite (throttle bloqueia reenvio imediato)
- [ ] **A5** — Admin edita cadastro administrativo da Parceira
- [ ] **A6** — Admin confere Histórico de Alterações (mostra a edição de A5)
- [ ] **A7** — Admin cadastra e edita uma Marca
- [ ] **A8** — Admin cria uma Campanha vinculada à Marca
- [ ] **A9** — Admin vincula a Parceira à Campanha (Participação)
- [ ] **A10** — Admin congela uma Participação e cancela outra de teste
- [ ] **A11** — Admin cria e publica o Briefing
- [ ] **I1** — Influenciadora define a senha pelo link de convite
- [ ] **I2** — Influenciadora faz login
- [ ] **I4** — Influenciadora confere o Dashboard
- [ ] **I5** — Influenciadora vê a Campanha e o Briefing publicado
- [ ] **I6** — Influenciadora envia o Material
- [ ] **A12** — Admin avalia o Material (reprova um, depois aprova o reenvio)
- [ ] **A13** — Admin tenta pagar SEM material aprovado → bloqueio confirmado (P0-1)
- [ ] **A14** — Admin avança o Pagamento até Pago (com material aprovado)
- [ ] **A15** — Admin anexa comprovante de pagamento
- [ ] **I7** — Influenciadora confere o status de pagamento atualizado
- [ ] **A16** — Admin cria o Envio e avança até Entregue
- [ ] **A17** — Admin confere a visão de Logística
- [ ] **I8** — Influenciadora edita o próprio perfil (CEP recompõe endereço)
- [ ] **I9** — Influenciadora preenche Medidas duas vezes (mais recente prevalece)
- [ ] **I10** — Influenciadora confere Histórico (campanha/participação encerrada aparece lá)
- [ ] **A18 / I11** — Logout de ambos os papéis; acesso sem sessão é bloqueado

**Critério de certificação do MVP:** todos os itens marcados ✅, com
especial atenção ao item **A13** (único bloqueador crítico já identificado
nesta fase de homologação) — se ele falhar, o MVP **não** pode ser
certificado até nova correção. Divergências em itens listados na seção 4
(Limitações conhecidas) não impedem a certificação.
