# Diagnóstico — Bug de autenticação pós-aprovação (Sessão S2 | Trilha 1)

**Data:** 2026-08-05
**Sessão:** `3fa28529-8a5d-49ba-98af-e47d2166bb31` — Sessão S2, Trilha 1 do roadmap produzido em
`journals/2026-08-05_0015` (roadmap ainda não persistido em arquivo — ver nota final).
**Método:** reprodução controlada mecânica (supertest + PostgreSQL real de teste), instrumentação
temporária removida integralmente antes deste commit. Nenhuma correção foi aplicada — esta sessão
é exclusivamente de diagnóstico, conforme escopo aprovado.

---

## 1. Bug relatado

> Usuária aprovada continua sem acessar o Portal após um novo login.

Já confirmado antes desta sessão (auditoria `AUDITORIA_AUTENTICACAO_2026-08-03.md` e relatório
`criativododo-interno/DOC SPRINT #2/checar/📋 Relatório técnico`): OAuth, callback, cadastro,
aprovação, persistência em `estado_conta = ACTIVE`, criação de Parceira e Perfil — tudo correto.
`/auth/me` devolve só o que está no cookie de sessão; `requireAuth` só lê a sessão; não há
revalidação contra o banco durante a vida do cookie. Faltava confirmar mecanicamente se isso
*causa* o bug relatado, e o que exatamente acontece num "novo login".

## 2. Metodologia da reprodução

Sem credenciais reais do Google disponíveis neste ambiente, a troca de tokens OIDC
(`client.authorizationCodeGrant`) não pôde ser exercida literalmente. Isso não compromete a
conclusão: a `AUDITORIA_AUTENTICACAO_2026-08-03.md` já confirmou (Seção 5) que essa troca é
delegada inteiramente à biblioteca `openid-client`, e o `identidade.repository.ts` confirma que
não existe nenhuma camada de cache entre a resolução de identidade e o PostgreSQL (consulta SQL
direta em toda chamada). Ou seja, o único trecho não exercido é estruturalmente irrelevante para
este bug.

Foi adicionada instrumentação temporária (`console.log`) em `session.ts` (`iniciarSessao`,
`renovarSessao`, `lerSessao`), `requireAuth.ts` e `auth.routes.ts` (`/me`, `/google/callback`), e
uma rota diagnóstica temporária `GET /auth/_diag/segundo-login?sub=...` (montada só fora de
produção) que reexecuta **literalmente o mesmo código** que o `/google/callback` real roda depois
de validar os tokens — `resolverOuCriarIdentidade()` seguido de `iniciarSessao()` — sem o
round-trip HTTP ao Google. Toda essa instrumentação foi **removida por completo** antes deste
commit (`git diff` de `session.ts` confirmado vazio; `requireAuth.ts`/`auth.routes.ts` sem
resíduo).

Um teste de integração temporário (`supertest` contra o `app` Express real + banco
`portal_dodo_test` real, truncado a cada execução) reproduziu literalmente a sequência pedida:
login → cadastro → aprovação administrativa → (checagem sem logout) → logout completo → novo
login → checagem final.

## 3. Sequência cronológica e evidências coletadas

| Passo | Ação | Evidência coletada |
|---|---|---|
| 1 | Login Google (1ª vez) | `resolverOuCriarIdentidade` cria identidade `AGUARDANDO_CADASTRO`; `iniciarSessao` emite cookie A com `estadoConta=AGUARDANDO_CADASTRO` |
| 2 | `POST /auth/cadastro` | `requireAuth` lê cookie A (`AGUARDANDO_CADASTRO`); rota reemite cookie A' com `estadoConta=PENDING` |
| 3 | Aprovação administrativa (`aprovarConta`) | Banco: `estado_conta` `PENDING → ACTIVE`. Sessão do navegador **não é tocada** — nada no fluxo de aprovação invalida ou atualiza cookies existentes |
| 4 | `GET /auth/me` **sem logout**, com cookie A' | Resultado: `estadoConta=PENDING` — mesmo com o banco já em `ACTIVE`. `lerSessao` confirma que o valor veio decodificado do próprio cookie, nenhuma consulta ao banco ocorreu. `requireAuth` renovou a expiração do cookie (`renovarSessao`) mantendo o `PENDING` congelado por mais 6h |
| 5 | `POST /auth/logout` | Cookie limpo corretamente: `Set-Cookie: dodo_portal_sessao=; Expires=Thu, 01 Jan 1970...` |
| 6 | Novo login (reexecução fiel do callback pós-claims) | `resolverOuCriarIdentidade` lê o banco **de novo**, retorna `estadoConta=ACTIVE`; `iniciarSessao` emite cookie B já com `ACTIVE` |
| 7 | `GET /auth/me` com cookie B | Resultado: `estadoConta=ACTIVE` — correto |

Evidência bruta (stdout do teste, íntegra antes da remoção):

```
estadoConta no banco após aprovação: ACTIVE
estadoConta devolvido por /auth/me com a sessão ANTIGA (sem logout): PENDING
cookie emitido após logout: dodo_portal_sessao=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT
estadoConta devolvido por /auth/me com a sessão NOVA (após logout + novo login): ACTIVE
```

## 4. Respostas às perguntas do escopo

- **Um novo cookie foi emitido no segundo login?** Sim — sempre, todo login (real ou reexecutado)
  chama `iniciarSessao`, que sobrescreve o cookie anterior.
- **O callback foi executado novamente?** Estruturalmente, sim, sempre — `login()` no frontend
  (`portal-frontend/src/lib/session.tsx:86`) faz `window.location.href` para
  `/auth/google/login`, iniciando um novo Authorization Code Flow completo. Mesmo com SSO
  silencioso do Google (sem tela de consentimento), o navegador é redirecionado de volta para
  `/auth/google/callback` no nosso backend — não existe atalho client-side que pule esse
  round-trip quando o usuário aciona `login()` explicitamente.
- **O cookie antigo foi reutilizado / houve reaproveitamento de sessão?** Sim, mas só quando **não
  há logout**: enquanto o cookie antigo continuar válido (até 6h, renovado a cada requisição
  autenticada — inclusive `GET /auth/me`, chamado automaticamente pelo frontend a cada carregamento
  de página), ele nunca é substituído por iniciativa própria do sistema. Nada nele expira por causa
  da aprovação; só um logout explícito ou o fim do tempo de vida força a saída.
- **`/auth/me` respondeu dados antigos?** Sim, confirmado — `PENDING`, mesmo com o banco em
  `ACTIVE` (linha 4 da tabela acima).
- **Houve leitura do banco em algum momento?** Sim, mas só em dois pontos: na aprovação (grava) e
  em qualquer login genuinamente novo (lê, via `resolverOuCriarIdentidade`). Nunca durante o uso
  normal de uma sessão já emitida (`lerSessao`/`renovarSessao`/`requireAuth`/`/auth/me` operam 100%
  sobre o cookie).

## 5. Causa raiz — **Opção A: confirmada**

A sessão (`middleware/session.ts`) é um retrato **congelado no instante da emissão** do
`estadoConta` (e demais campos) da Identidade. A renovação deslizante (`renovarSessao`, acionada em
toda requisição autenticada por `requireAuth`) reemite o **mesmo payload**, só com nova expiração
— nunca relê o banco. Isso foi confirmado mecanicamente, não presumido: um cookie emitido em
`PENDING` continua devolvendo `PENDING` via `/auth/me` mesmo após o banco mudar para `ACTIVE`, e
essa mesma sessão nunca expira por si só enquanto o usuário seguir usando o Portal — porque a
própria checagem de "estou logada?" que o frontend dispara a cada carregamento de página
(`SessionProvider`, `carregarSessao()` → `GET /auth/me`) passa por `requireAuth`, que **renova e
perpetua** essa mesma sessão desatualizada.

**Hipótese testada e descartada como explicação isolada:** o mecanismo de resolução de identidade
e emissão de sessão **não está quebrado** — um login genuinamente novo (round-trip OIDC completo,
que sempre invoca `resolverOuCriarIdentidade` contra o estado atual do banco) resolve corretamente
e emite uma sessão `ACTIVE`, sem qualquer intervenção adicional. Isso também é coerente com o
achado já registrado no relatório técnico anterior ("logs históricos mostram que em determinado
momento o backend já resolveu corretamente uma conta como `estadoConta=ACTIVE`") — o mecanismo
funciona quando de fato executado do zero.

**A peça que fecha o quebra-cabeça — por que "um novo login" não resolve na prática:**
`portal-frontend/src/pages/Login.tsx` só mostra o botão "Continuar com o Google" (que dispara
`login()`, ou seja, o único caminho que força um round-trip OIDC novo) quando **não existe sessão
alguma** (`!sessao`, linha 57). Enquanto existir uma sessão válida — mesmo desatualizada, mesmo já
aprovada há muito tempo no banco — a tela mostra apenas "seu acesso está em análise" com um botão
secundário "sair e tentar novamente" (linhas 120-138), que decrementa para `logout()`. Ou seja:
**a usuária não consegue simplesmente "logar de novo"** enquanto tiver uma sessão antiga válida —
ela precisa primeiro reconhecer que precisa clicar em "sair e tentar novamente" (uma ação de
logout explícita, não intuitiva para quem já foi aprovada e espera acesso automático) para então
ver o botão de login de novo. Qualquer "novo login" que não passe por esse logout explícito (só
fechar/reabrir a aba, recarregar a página, tentar entrar de novo pela URL) reutiliza a sessão
antiga e nunca resolve.

## 6. Ponto residual (não bloqueante, registrado por rigor)

Não há trilha de auditoria de eventos de login em produção (lacuna já registrada em
`AUDITORIA_AUTENTICACAO_2026-08-03.md`, item 9), então não é possível, a partir deste ambiente,
confirmar com certeza absoluta se a usuária real do incidente relatado chegou a clicar em "sair e
tentar novamente" antes de reportar a falha, ou se apenas recarregou a página. Isso não muda a
causa raiz confirmada na Seção 5 — mecanicamente comprovada e suficiente para explicar o sintoma
relatado — mas é um dado que, se existisse, eliminaria essa única lacuna de certeza. Recomenda-se
considerar a implementação de auditoria de login (já pendente por ADR-010/LGPD) como parte do
mesmo esforço da Sessão S3.

## 7. Estratégia de correção recomendada (não implementada nesta sessão)

Para decisão do responsável antes da Sessão S3 — direções possíveis, sem escolher nenhuma aqui:

1. **Revalidação contra o banco** em pontos críticos (ex.: `requireContaAtiva`, ou o próprio
   `/auth/me`) em vez de confiar cegamente no cookie — maior custo por requisição, elimina o
   problema na raiz.
2. **TTL curto e não-deslizante para sessões em estado não-`ACTIVE`** (`AGUARDANDO_CADASTRO`,
   `PENDING`) — força expiração natural e novo login em minutos/poucas horas, sem exigir
   revalidação em toda requisição.
3. **UX**: expor um caminho claro de "verificar aprovação novamente" que force logout+login num
   único clique (em vez de dois passos), reduzindo a chance de a usuária ficar presa na tela
   `PENDING`.
4. **Notificação ativa**: ao aprovar, notificar a usuária (e-mail) explicitamente com instrução
   para sair e entrar novamente — mitigação operacional, não técnica.

## 8. Impacto avaliado

- **Risco da futura correção:** baixo a médio — a mudança é isolada a `middleware/session.ts`,
  `middleware/requireAuth.ts` e possivelmente `auth.routes.ts` (`/me`); não toca schema de
  identidade nem regras de negócio de aprovação.
- **Arquivos prováveis na Sessão S3:** `portal-backend/src/middleware/session.ts`,
  `portal-backend/src/middleware/requireAuth.ts`, `portal-backend/src/modules/identidade/auth.routes.ts`,
  respectivos `*.test.ts`; possivelmente `portal-frontend/src/pages/Login.tsx` e
  `portal-frontend/src/lib/session.tsx` se a opção 3 (UX) for aprovada.
- **Migration:** não é esperada — o problema é de sessão (stateless, sem tabela), não de schema.
- **Testes:** exigidos — `session.test.ts` e `requireAuth.test.ts` já existem e cobrem o mecanismo
  atual; qualquer correção precisa de novos casos cobrindo exatamente o cenário reproduzido aqui
  (sessão emitida antes da aprovação, banco muda, sessão antiga não deve mais conceder acesso
  desatualizado — e a correção deve ser validada com o mesmo tipo de reprodução usada nesta sessão).

## 9. Nota sobre o Plano Mestre (handoff)

O roadmap de 7 trilhas / 12 sessões (que enumera esta Sessão S2) foi produzido na sessão anterior
(`journals/2026-08-05_0015`) mas **apresentado apenas na conversa — nunca persistido em arquivo**.
O próprio journal dessa sessão registra a pendência: decidir entre persistir em
`criativododo-interno/PLANO_MESTRE_IMPLEMENTACAO_PORTAL_DODO.md` (fora do repositório git) ou como
novo documento versionado neste repositório. Por essa razão, esta sessão **não pôde** "atualizar o
Plano Mestre marcando a Sessão S2 como concluída" como pedido no objetivo — o documento não existe
em lugar nenhum ainda. Este diagnóstico fica registrado aqui e em memória de sessão; a
Sessão S3 só deve iniciar depois que o responsável decidir onde o roadmap será persistido (decisão
de organização documental, não uma decisão técnica que este agente deva tomar unilateralmente, sob
pena de criar uma nova fonte de verdade não autorizada).

---

## 10. Conclusão

**A: causa raiz confirmada.** Sessão stateless congelada no momento da emissão + renovação
deslizante que nunca revalida contra o banco + UI que só oferece um novo login OIDC quando não há
nenhuma sessão ativa. Nenhuma correção foi implementada nesta sessão. A Sessão S3 pode iniciar
assim que o responsável (a) decidir a estratégia de correção (Seção 7) e (b) decidir onde persistir
o Plano Mestre (Seção 9).
