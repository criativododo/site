# Arquitetura de Identidade V2 — Proposta (Multi-Provider: Google, Apple, Magic Link, Senha)

**Data:** 2026-08-03
**Autor:** Agente B (Arquiteto Principal de Identidade) — sessão "agente APPLE"
**Insumo:** `docs/_workspace/auditorias/AUDITORIA_AUTENTICACAO_2026-08-03.md`
**Natureza deste documento:** proposta de arquitetura para decisão do responsável do projeto. **Não é implementação, não é ADR aceita, não é migration.** Nenhum arquivo de código foi alterado. Cada decisão aqui é uma recomendação a ser confirmada ou rejeitada via ADR formal antes de qualquer código ser escrito.

---

## Premissa de partida

A arquitetura atual (auditada) funde em uma única entidade `Identidade`: quem a pessoa é, com qual provedor ela provou isso, e o que ela pode fazer no sistema. Essa fusão é o motivo estrutural pelo qual adicionar um segundo provedor hoje exigiria retrabalho — não porque o código esteja mal escrito, mas porque o modelo de dados não tem um lugar para "a mesma pessoa, duas credenciais diferentes" existir. Toda esta proposta deriva de resolver essa fusão.

## Etapa 1 — Identidade Conceitual

**Quem representa uma pessoa dentro do sistema?**

Proposta: três entidades, não quatro, não uma.

| Entidade | Responsabilidade | Por que existe |
|---|---|---|
| **User** | A pessoa, do ponto de vista da aplicação. Único, estável, nunca muda mesmo que a pessoa troque/adicione método de login. Carrega papel (`papelAtor`) e estado de conta (`estadoConta`). | É o alvo de toda autorização e de todo relacionamento de domínio (ex.: com `Parceira`). Sem ele, não há como dizer "este login com Apple é a mesma pessoa que este login com Google feito há 3 meses". |
| **Identity** | Uma credencial federada específica: um vínculo `(provider, subject)` — ou, para métodos não federados (senha, magic link), um vínculo `(provider, identificador_local)`. Pertence a exatamente um `User`. Um `User` pode ter N `Identity`. | É o que hoje está sobrecarregado em `Identidade` (auditoria, Seção 3). Isolar isso é o que permite Account Linking sem retrabalho. |
| **Session** | Um login ativo específico, em um dispositivo/navegador específico, com tempo de vida próprio e revogável independentemente das demais sessões do mesmo `User`. | Hoje é stateless e não revogável (auditoria, Seção 4/10.7) — control-plane de segurança que falta. |

**Rejeitado explicitamente:** uma quarta entidade `Account` distinta de `User`. Em arquiteturas B2B multi-tenant, `Account` normalmente representa a organização/tenant e `User` a pessoa dentro dela. Este sistema é single-tenant, sem ator "Marca" (ADR-008 já vigente) — introduzir `Account` aqui seria modelar uma dimensão (organização) que o próprio domínio já decidiu não ter. `User` sozinho já cumpre o papel de "conta" nesse contexto.

**Rejeitado explicitamente:** `Credential` como entidade separada de `Identity`. Para provedores federados (Google, Apple), a "credencial" e o "vínculo com o provedor" são a mesma coisa (o par `provider+subject` É a credencial). Separar os dois adicionaria uma tabela sem responsabilidade própria. Para senha, o segredo (hash) fica como um campo dentro da própria `Identity` do tipo `email_password` — não é grande o suficiente para justificar uma tabela à parte, e mantê-lo junto simplifica a garantia "uma linha de Identity = uma forma de provar quem você é".

## Etapa 2 — Domínio

```
Pessoa
  ↓
 User  ───────── papelAtor, estadoConta (autorização vive aqui)
  ↓ 1:N                    ↓ 1:1 (opcional, só para INFLUENCIADORA)
Identity[]                Parceira ──── Perfil, Cadastro, Condição Comercial
(Google / Apple /
 MagicLink / Senha)
```

Mudança em relação ao modelo atual: `parceiraId` sai da tabela de identidade/credencial e passa a viver em `User`. Hoje, `parceira_id` está em `identidades` (uma linha por provedor); se a pessoa tivesse duas identidades (Google + Apple), a vinculação com a Parceira teria que ser duplicada ou escolhida arbitrariamente em uma das duas linhas — sintoma direto de modelar no lugar errado. Movendo para `User`, a Parceira é vinculada à pessoa, não ao método de prova de identidade que ela usou naquele login.

**Vantagem:** cadastro, aprovação e todo o ciclo de vida de Parceira continuam existindo exatamente como hoje (nenhuma mudança de vocabulário de domínio, Contrato Soberano preservado) — a mudança é estritamente sob a camada de autenticação.
**Desvantagem:** exige uma migração de dados (mover `parceira_id` de `identidades` para a nova tabela `users`) — custo único, não recorrente.

**Alternativa considerada e descartada:** manter `parceiraId` em `Identity` e "escolher a identidade primária" como fonte de verdade. Descartada porque introduz um conceito novo ("identidade primária") só para compensar o modelo errado, em vez de corrigi-lo.

## Etapa 3 — Múltiplos Provedores

Um `User` pode ter simultaneamente: `Identity(provider='google', subject=...)`, `Identity(provider='apple', subject=...)`, `Identity(provider='magic_link', subject=email)`, `Identity(provider='email_password', subject=email, secretHash=...)`.

- **Account linking:** só acontece a partir de uma sessão já autenticada (ver Etapa 7 — nunca automático por coincidência de e-mail).
- **Unlink:** remove a linha de `Identity` correspondente. Regra: um `User` nunca pode ficar com zero `Identity` ativas (bloquear o unlink da última restante, ou exigir que outra seja criada antes).
- **Troca de provedor:** não é uma operação própria — é "vincular o novo, depois desvincular o antigo", usando as duas operações acima em sequência.
- **Primeiro login:** `(provider, subject)` não encontrado em nenhuma `Identity` existente **e** nenhuma sessão ativa no momento → cria `User` novo + `Identity` nova, no estado inicial já vigente hoje (`AGUARDANDO_CADASTRO`).
- **Login recorrente:** `(provider, subject)` encontrado → resolve o `User` dono dessa `Identity` diretamente. **Nenhuma lógica de e-mail é consultada neste caminho** — isso é o que torna o modelo seguro mesmo quando a Apple oculta o e-mail (Hide My Email), porque a busca nunca depende de e-mail para logins recorrentes.

## Etapa 4 — Modelagem (entidades, sem migrations)

- **`User`**
  Campos conceituais: id interno, `papelAtor`, `estadoConta`, `parceiraId?`, `nomeExibicao` (cache do nome mais recente fornecido por qualquer provedor, não fonte de verdade), `dataCriacao`, `ultimoAcesso`.
  Responsabilidade: identidade estável + autorização. Nunca referencia um provedor diretamente.

- **`Identity`**
  Campos conceituais: id interno, `userId` (FK), `provider` (`'google' | 'apple' | 'magic_link' | 'email_password'`, extensível), `subject` (identificador externo — para senha/magic-link, o próprio e-mail normalizado cumpre esse papel), `emailNoProvedor?`, `emailVerificadoNoProvedor?`, `secretHash?` (só para `email_password`), `criadoEm`, `ultimoUsoEm`.
  Constraint conceitual: único por `(provider, subject)`.
  Responsabilidade: uma forma específica de provar identidade. Nunca carrega papel/autorização.

- **`Session`**
  Campos conceituais: id opaco (token aleatório, não auto-descritivo), `userId` (FK), `criadaEm`, `ultimaAtividadeEm`, `expiraEm`, `expiraAbsolutoEm` (teto, ver Etapa 6), `revogadaEm?`, `rotuloDispositivo?` (User-Agent resumido), `ipCriacao`.
  Responsabilidade: um login ativo, revogável individualmente.

- **`Parceira`** — inalterada em responsabilidade; ganha vínculo a partir de `User.parceiraId` em vez de a partir de uma linha de identidade específica.

- **Nova, opcional: `IdentityLinkChallenge`** (só se Etapa 7 exigir confirmação explícita em algum fluxo futuro de UX — ex. "confirmar por e-mail antes de linkar"): id, `userId`, `provider` pretendido, `subject` pretendido, `expiraEm`, `confirmadoEm?`. Registrada aqui como possibilidade, não como decisão — depende de UX que ainda não foi desenhada.

## Etapa 5 — Fluxo Completo

```
Usuário
  ↓
Frontend (escolhe provedor: Google | Apple | Magic Link | Senha)
  ↓
IdentityProvider (implementação específica do provedor escolhido — Etapa 8)
  ↓  produz NormalizedClaims { subject, email?, emailVerified?, name? }
Backend — Serviço de Resolução de Identidade
  ↓  busca Identity por (provider, subject)
  ├─ encontrada  → User já existe → segue
  └─ não encontrada → sessão ativa no navegador?
        ├─ sim → vincula nova Identity ao User da sessão atual (account linking)
        └─ não → cria User novo + Identity nova (AGUARDANDO_CADASTRO)
  ↓
User (papelAtor, estadoConta resolvidos)
  ↓
Parceira (se INFLUENCIADORA e já cadastrada)
  ↓
Session (nova linha criada, token opaco emitido)
  ↓
Frontend autenticado (cookie contém apenas o token opaco da Session)
```

Diferença estrutural em relação ao fluxo atual: o backend nunca mais resolve "Google" diretamente — sempre passa pela interface `IdentityProvider` (Etapa 8) e pelo Serviço de Resolução de Identidade, que é o único lugar que entende `User`/`Identity`.

## Etapa 6 — Sessões (modelo proposto)

| Aspecto | Proposta |
|---|---|
| Cookie | Contém só um token opaco aleatório (não auto-descritivo), assinado, `httpOnly`, `sameSite=lax`, `secure` em produção — igual hoje nas flags, diferente no conteúdo. |
| Armazenamento | `Session` vira registro server-side (tabela ou cache com persistência — a decidir em ADR própria). Isso é a mudança central: hoje é 100% stateless; aqui passa a ter um ponto de verdade central. |
| Expiração | Mantém sliding window de 6h (RN-18 preservada) **mais** um teto absoluto (ex.: 30 dias) que força reautenticação mesmo com atividade contínua — hoje não existe teto, uma sessão nunca morre se o usuário estiver sempre ativo. |
| Renovação | Deslizante, como hoje, mas checando o teto absoluto antes de renovar. |
| Logout | Revoga a `Session` atual (`revogadaEm = now`) — passa a ter efeito imediato e verificável, diferente do cookie autocontido de hoje. |
| Revogação | Passa a ser possível: marcar `revogadaEm` em qualquer `Session`, de qualquer dispositivo, a qualquer momento (ex.: "sair de todos os dispositivos", resposta a suspeita de comprometimento). Hoje: impossível sem esperar a expiração natural. |
| Múltiplos dispositivos | Naturalmente suportado — cada login gera sua própria linha de `Session`; lista de sessões ativas por `User` passa a ser uma consulta trivial. Hoje: inexistente. |
| Remember me | Vira só um parâmetro de `expiraAbsolutoEm` maior no momento da criação da `Session` (ex.: 30 dias em vez de 6h de teto) — não exige mecanismo novo, só um valor de configuração por login. |

**Custo desta mudança:** cada requisição autenticada passa a exigir uma consulta (cache-friendly, TTL curto) em vez de zero I/O — trade-off deliberado: hoje o sistema tem zero custo de I/O por request mas também zero controle. Esta é a decisão de maior impacto de infraestrutura desta proposta e **deve ser confirmada explicitamente em ADR**, não assumida.

## Etapa 7 — Account Linking (detalhado)

Cenário: usuário entra primeiro com Google, depois entra com Apple.

**Regra central: a decisão de vincular nunca depende de comparação de e-mail. Depende exclusivamente de existir ou não uma sessão autenticada ativa no momento em que o segundo provedor completa o login.**

1. **Usuário loga com Apple estando com uma sessão Google já ativa** (ex.: foi em "Configurações → Adicionar método de login → Apple"): o backend sabe, pelo cookie de sessão atual, qual `User` está agindo. O resultado do login Apple (`subject` Apple) é gravado como nova `Identity` vinculada a esse `User`. **Isto é a única forma de vincular dois provedores a uma mesma pessoa.**

2. **Usuário loga com Apple sem sessão ativa** (ex.: trocou de navegador, ou nunca tinha vinculado antes): o backend busca `Identity(provider='apple', subject=X)`. Não encontra. Não existe sessão ativa para inferir a quem vincular. **Resultado: novo `User` é criado**, mesmo que o e-mail retornado pela Apple coincida com o e-mail de um `User` existente que só tem `Identity` Google. Isso é intencional — nunca vincular silenciosamente por e-mail.

3. **UX de reconciliação (opcional, fora do escopo técnico central, decisão de produto):** o backend *pode* detectar a coincidência de e-mail no cenário 2 e, em vez de silenciosamente criar um `User` duplicado, mostrar ao usuário: "Já existe uma conta com este e-mail — entre com Google e depois vincule Apple em Configurações." Isso é uma sugestão de UX, nunca uma vinculação automática. Ativar ou não essa sugestão fica registrado como ADR em aberto, não decidido aqui.

**Por que isso resolve o problema do Hide My Email da Apple:** como o caminho 2 (login recorrente) nunca consulta e-mail — só `(provider, subject)` — um e-mail de repasse privado (`xxxx@privaterelay.appleid.com`), que pode inclusive mudar entre sessões em alguns fluxos da Apple, nunca é usado como chave de correspondência. O `subject` da Apple (`sub` do ID Token) é estável mesmo quando o e-mail exibido não é.

## Etapa 8 — Provider Abstraction

Camada entre o backend e qualquer provedor específico. Contrato conceitual (sem código):

- **Identificação:** cada provedor tem um id estável (`"google"`, `"apple"`, `"magic_link"`, `"email_password"`).
- **Capacidades declaradas** (usadas pelo domínio para decidir comportamento sem `if (provider === "google")` espalhado): é federado via OIDC redirect? oculta e-mail por padrão? fornece nome só no primeiro login (comportamento conhecido da Apple)? suporta PKCE? é baseado em segredo local (senha) em vez de redirect?
- **Etapa de início:** produz o que o frontend precisa para iniciar o fluxo (URL de redirecionamento para OIDC, ou formulário para senha/magic-link) e qualquer estado efêmero necessário (equivalente ao handshake PKCE/state de hoje, mas genérico por provedor).
- **Etapa de conclusão:** recebe o retorno do provedor (callback OIDC, ou submissão de formulário) e devolve sempre a mesma forma de saída — **NormalizedClaims**: `subject`, `email?`, `emailVerified?`, `name?`. Esta é a fronteira de desacoplamento: nada além desta camada conhece o formato específico de claims de cada provedor (hoje, `ClaimsGoogle` vaza esse formato para dentro do serviço de domínio — Etapa 6 da auditoria, Seção 8).
- **Registro:** um registro central (mapa id→implementação) resolvido na inicialização da aplicação. Adicionar Apple = implementar um módulo que cumpre este contrato e registrá-lo — nenhuma mudança em `User`, `Identity`, `Session` ou no serviço de resolução de identidade.
- **Provedores não-federados** (senha, magic link) cumprem o mesmo contrato, mas colapsam "início" e "conclusão" em uma única submissão de formulário em vez de um redirect — a saída ainda é `NormalizedClaims`, só o transporte muda.

## Etapa 9 — ADRs Propostas (ordenadas por prioridade/dependência)

1. **ADR — Separação User × Identity × Session**
   *Objetivo:* substituir a entidade única `Identidade` pelo trio proposto na Etapa 1/4.
   *Motivação:* é a fundação de tudo o mais nesta proposta; sem ela, nenhuma outra ADR desta lista é implementável sem retrabalho.
   *Impacto:* schema completo do módulo de identidade; migração de dados de `identidades` existentes.
   *Riscos:* migração de dado em produção (mover `parceira_id` de linha de identidade para `User`); deve ser feita com plano de rollback.
   *Dependências:* nenhuma — é a ADR-fundação.

2. **ADR — Contrato de Provider Abstraction (`IdentityProvider`)**
   *Objetivo:* formalizar o contrato da Etapa 8.
   *Motivação:* sem essa interface, cada novo provedor volta a acoplar nomes/formatos específicos ao domínio, repetindo o problema atual do Google.
   *Impacto:* refatoração do fluxo Google existente para implementar o contrato (sem mudar comportamento observável).
   *Riscos:* baixo — é reorganização interna, não muda o fluxo do usuário.
   *Dependências:* ADR 1 (o contrato produz `NormalizedClaims`, que alimenta `Identity`, que só existe após ADR 1).

3. **ADR — Modelo de Sessões com Revogação**
   *Objetivo:* substituir cookie stateless por `Session` server-side revogável (Etapa 6).
   *Motivação:* resolve a lacuna de maior risco de segurança já identificada na auditoria (Seção 10.7/11) — hoje não há como revogar uma sessão comprometida.
   *Impacto:* `middleware/session.ts` inteiro; introduz dependência de armazenamento server-side (cache ou tabela — escolha de infraestrutura em aberto).
   *Riscos:* custo de I/O por requisição autenticada; requer decisão explícita sobre onde armazenar (Redis vs. tabela Postgres) antes de implementar.
   *Dependências:* ADR 1 (Session referencia `User`, não mais `Identidade`).

4. **ADR — Account Linking (regra de vinculação)**
   *Objetivo:* formalizar a regra da Etapa 7 (vinculação só a partir de sessão ativa, nunca por coincidência de e-mail).
   *Motivação:* é regra de negócio inédita — decisão explícita necessária antes de qualquer segundo provedor entrar em produção.
   *Impacto:* serviço de resolução de identidade; UX de "Configurações → métodos de login".
   *Riscos:* decisão de produto pendente sobre a UX de reconciliação por e-mail (item 3 da Etapa 7) — não é puramente técnica.
   *Dependências:* ADR 1, ADR 2.

5. **ADR — Contrato de Claims Normalizadas (`NormalizedClaims`)**
   *Objetivo:* definir o conjunto mínimo de claims que qualquer provedor deve fornecer, e como lidar com ausência (ex.: Apple só fornece nome no primeiro login — decidir se o backend deve capturá-lo e persistir nesse instante, já que não virá novamente).
   *Motivação:* auditoria (Seção 5/10.6) mostra que hoje o contrato é implicitamente moldado ao comportamento do Google.
   *Impacto:* `IdentityProvider` (Etapa 8) e o serviço de resolução de identidade.
   *Riscos:* perda permanente do nome do usuário Apple se a captura no primeiro login não for tratada corretamente.
   *Dependências:* ADR 2.

6. **ADR — Auditoria de Autenticação Persistente (conformidade ADR-010)**
   *Objetivo:* substituir o placeholder em memória por trilha persistente e imutável de eventos de login (sucesso/falha), por `User`/`Identity`/`Session`.
   *Motivação:* risco de maior severidade já confirmado na auditoria — não depende de multi-IDP, é dívida ativa hoje.
   *Impacto:* `middleware/auditoria.ts`, novo destino de armazenamento.
   *Riscos:* nenhum técnico relevante; risco é de compliance por não fazer.
   *Dependências:* nenhuma — pode ser implementada em paralelo, independente das demais.

7. **ADR — Modelo de Cookies e CSRF**
   *Objetivo:* decidir se o cookie de sessão (agora opaco, ADR 3) precisa de token CSRF dedicado nas rotas mutáveis, ou se `sameSite=lax` permanece suficiente.
   *Motivação:* lacuna confirmada na auditoria (Seção 7/10.5).
   *Impacto:* rotas mutáveis de `/auth` e `/api`.
   *Riscos:* baixo, implementação de custo pequeno.
   *Dependências:* ADR 3 (o formato do cookie muda antes desta decisão fazer sentido de forma definitiva).

8. **ADR — Ordem de Introdução de Provedores (Apple, Magic Link, Senha)**
   *Objetivo:* decidir a ordem de entrada de cada método (ver Etapa 10) e se Senha realmente deve ser reintroduzida (ADR-007 já a excluiu do MVP por decisão explícita — reabri-la aqui é regra de negócio inédita, não técnica).
   *Motivação:* impacto de produto e de superfície de risco (senha = maior superfície de ataque entre as quatro opções).
   *Impacto:* roadmap de entrega, não arquitetura em si.
   *Riscos:* decisão de produto pendente — não deve ser assumida por este documento.
   *Dependências:* ADR 1-5 (a arquitetura deve suportar todas antes de qualquer uma específica ser priorizada).

## Etapa 10 — Roadmap (sequência, não implementação)

- **Sprint 1 — Fundação de dados:** implementar ADR 1 (User/Identity/Session) via *strangler pattern* — nova modelagem convive com a atual, dados de `identidades` migrados para `User`+`Identity(provider='google')`, comportamento do usuário final inalterado (Google continua sendo o único provedor visível).
- **Sprint 2 — Abstração e sessão revogável:** implementar ADR 2 (contrato `IdentityProvider`, refatorando o fluxo Google existente para cumpri-lo) e ADR 3 (sessões revogáveis) — ainda sem segundo provedor visível ao usuário, mas a arquitetura já suporta.
- **Sprint 3 — Apple:** implementar Sign in with Apple como segunda implementação de `IdentityProvider`; implementar ADR 4 (Account Linking) e ADR 5 (claims normalizadas, com atenção ao nome só-no-primeiro-login da Apple); expor UX de "vincular/desvincular método de login".
- **Sprint 4 — Magic Link:** validar que um método não-federado cumpre o mesmo contrato sem alterar `User`/`Identity`/`Session`.
- **Sprint 5 — Senha (condicional a ADR 8):** só entra se o responsável do projeto decidir reabrir a exclusão de ADR-007 — maior superfície de risco da lista, deliberadamente por último.
- **Trilha paralela, sem dependência de sprint:** ADR 6 (auditoria persistente) e ADR 7 (CSRF) — dívida já existente hoje, pode ser resolvida a qualquer momento independente do avanço multi-IDP.

---

*Fim da proposta. Nenhum arquivo de código foi alterado, nenhuma migration foi gerada, nenhuma biblioteca foi recomendada sem justificativa correspondente na seção em que aparece. Toda decisão aqui é uma recomendação do arquiteto para confirmação do responsável do projeto via ADR formal — nenhuma delas está em vigor até essa confirmação.*
