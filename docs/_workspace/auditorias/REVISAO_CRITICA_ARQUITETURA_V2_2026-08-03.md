# Revisão Crítica — Arquitetura de Identidade V2

**Data:** 2026-08-03
**Papel:** Arquiteto Revisor (Design Review), independente do autor da proposta
**Insumo revisado:** `docs/_workspace/auditorias/ARQUITETURA_IDENTIDADE_V2_PROPOSTA_2026-08-03.md`
**Postura:** adversarial deliberada — o objetivo é encontrar falhas, não confirmar a proposta. Nenhum código alterado, nenhuma migração proposta, nenhuma implementação sugerida.

---

## 1. Modelo User × Identity × Session

**Veredito: MANTER, com uma lacuna real.**

O trio é o padrão de fato em identidade federada moderna (é assim que Ory Kratos, Auth0, Clerk e o próprio NextAuth modelam) e é estritamente superior a manter tudo em uma entidade só — nisso a proposta está certa e eu não encontrei uma alternativa genuinamente superior (um modelo "Identity-first", sem `User` separado, usando auto-referência entre identidades, existe em alguns sistemas legados, mas só reintroduz por outra via o mesmo problema que a separação resolve: onde fica a autorização quando há duas credenciais para a mesma pessoa).

**Lacuna real, não citada na proposta:** `Session` não carrega **nível de garantia da autenticação** (AAL — Authentication Assurance Level, NIST SP 800-63B) nem **qual método/Identity** originou aquela sessão especificamente (o equivalente aos claims `amr`/`acr` do OIDC). Isso importa porque, quando MFA/passkey/step-up existir (ver item 3), o sistema vai precisar responder "esta sessão foi estabelecida só com Google, ou também com um segundo fator?" para decidir se uma ação sensível (ex.: aprovar pagamento, mudar e-mail de recuperação) exige reautenticação. O modelo atual de `Session` não tem onde guardar essa informação — precisaria de um campo (`métodoOrigem`/`nivelGarantia`), hoje ausente.

**Trade-off que a proposta não declarou explicitamente:** todo `User` passa a exigir um JOIN a mais (`User → Identity`) até para o caso mais comum do sistema hoje (um único provedor, Google). Isso é aceitável, mas devia estar nomeado como custo, não silenciado.

## 2. Rejeição da entidade `Account`

**Veredito: MANTER — mas a justificativa dada era incompleta.**

A rejeição foi correta pela razão certa (sistema single-tenant, ADR-008, sem ator "Marca" no MVP) — mas ADR-008 diz **"fora do MVP"**, não "nunca". Se o ator Marca voltar no futuro (ex.: marcas gerenciando suas próprias campanhas com múltiplos usuários por marca), a pergunta correta não é "precisamos de `Account`" — é "precisamos de uma entidade de organização/tenant, e ela pertence à camada de **autorização/domínio** (um `User` pertence a uma `Marca` via tabela de associação), não à camada de **identidade**". A proposta já separa autenticação de domínio corretamente (Etapa 2) — só faltou dizer explicitamente que, se `Marca` voltar, ela entra como uma nova relação `User↔Organização`, e isso não reabre nem contradiz a rejeição de `Account` aqui. Registrar essa distinção evita que um arquiteto futuro, ao reintroduzir Marca, confunda "organização de negócio" com "conta de autenticação" e comece a inflar `Identity`/`Session` com campos de tenant — erro comum.

**Gap adicional não coberto em nenhuma versão do documento:** identidade de **máquina** (service accounts, chaves de API para integrações — ex. webhooks, automações tipo n8n mencionadas em outros commits do projeto). O modelo inteiro assume "pessoa humana logando via navegador". Se o Portal algum dia expuser uma API para integração de terceiros, vai precisar de um conceito de credencial não-humana — que não é `User` (não é pessoa) nem `Identity` no sentido federado. Isso não precisa ser resolvido agora, mas devia estar **declarado como fora de escopo**, não deixado como omissão silenciosa.

## 3. Rejeição da entidade `Credential`

**Veredito: AJUSTAR — esta é a crítica mais séria da revisão.**

A lógica original ("para provedor federado, a credencial É o par provider+subject, não precisa de tabela própria") está correta **só para Google/Apple/OIDC**. Ela quebra para os três casos que a própria proposta se comprometeu a suportar sem retrabalho:

- **Passkeys/WebAuthn:** cada dispositivo registrado (notebook, celular, chave de segurança) é uma credencial própria, com material bem específico — `credentialId`, chave pública, contador de assinatura (`signCount`, crítico para detectar clonagem de credencial), lista de transportes, `AAGUID`, flags de *backup eligibility/state*. O esquema de `Identity` proposto na Etapa 4 (`emailNoProvedor`, `emailVerificadoNoProvedor`, `secretHash`) **não tem onde colocar nada disso** — são campos moldados para "senha ou IdP federado", não para material criptográfico de autenticador. Multiplicar linhas de `Identity` com `provider='webauthn'` até funciona estruturalmente (o modelo já permite N linhas por provider), mas o **conjunto de colunas está errado** para o conteúdo real.
- **TOTP/MFA:** aqui o problema não é de schema, é conceitual. Você não "loga com TOTP" — você loga com uma identidade primária (senha, passkey) e **depois** apresenta TOTP para elevar a garantia daquele login. Modelar TOTP como mais uma linha de `Identity` confunde dois conceitos diferentes: "quem prova que você é você" (Identity) e "confirmação adicional de que é realmente você, agora" (fator secundário/elevação de sessão). Isso não é o mesmo tipo de coisa e não deveria viver na mesma tabela.

**Conclusão:** a rejeição de `Credential` não estava errada como decisão pontual sobre senha/OIDC — estava **incompleta como arquitetura de longo prazo**. Recomendo: (a) tornar `Identity` extensível (campo de metadado polimórfico em vez de colunas fixas, para acomodar material de WebAuthn), e (b) introduzir um conceito separado — algo como "Fator de Autenticação" — para MFA/TOTP, distinto de `Identity`, que existe para **elevar** uma `Session` já estabelecida, não para resolver "quem é o User". Sem isso, no dia em que passkeys ou MFA entrarem em pauta, o modelo proposto hoje será refeito — exatamente o retrabalho que essa arquitetura deveria evitar.

## 4. Account Linking — suficiência da regra

**Veredito: AJUSTAR.**

A regra ("vincular só a partir de sessão autenticada, nunca por e-mail") está correta como princípio de segurança e é o que resolve o problema do Hide My Email da Apple. Mas ela tem uma consequência não endereçada: **e se o usuário perder acesso à sua única `Identity`?**

Cenário concreto: uma Influenciadora só tem `Identity(google)`. A conta Google dela é comprometida, excluída, ou ela simplesmente perde acesso (esqueceu qual e-mail usou, conta corporativa desativada por ex-empregador, etc.). Pela regra proposta, vincular um segundo provedor **exige uma sessão já ativa** — e ela nunca mais vai conseguir estabelecer uma, porque a única forma de autenticar que ela tem é exatamente a que perdeu. **Ela fica permanentemente trancada fora, sem caminho de recuperação**, a menos que exista uma exceção operacional explícita (ex.: um Administrador pode, mediante verificação fora de banda, vincular manualmente uma nova `Identity` a um `User` existente sem exigir sessão do próprio usuário). A proposta não menciona esse caminho em nenhum lugar — é uma lacuna real, não uma nuance.

**Segunda lacuna, distinta:** a regra cobre "vincular uma identidade nova a um User existente", mas não cobre **"unificar dois `User` que já existem separadamente"** — cenário real se, antes desta arquitetura existir, a mesma pessoa já tiver acidentalmente duas contas (uma criada via Google, outra via Apple, sem saber que eram a mesma pessoa). Isso é um problema genuinamente mais difícil (o que acontece com duas `Parceira` diferentes, dois históricos de aprovação diferentes?) e não é responsabilidade só da camada de identidade — mas o documento atual não declara isso como fora de escopo, o que pode ser lido como "resolvido" quando não está.

## 5. Sessão Stateful — vale o trade-off?

**Veredito: AJUSTAR — a proposta pulou uma alternativa mais barata.**

Análise pedida:

- **Escalabilidade:** para a escala real deste produto (portal B2B de parceiras, não uma rede social), o custo de uma consulta extra por requisição autenticada é irrelevante na prática — a preocupação de escala citada na proposta original é mais teórica do que real para este caso.
- **Revogação:** aqui está o ponto genuíno. Mas "revogação" não é uma coisa só — existem dois níveis: (1) revogar **tudo** de um usuário de uma vez (ex.: senha trocada, suspeita de comprometimento) e (2) revogar **um dispositivo específico**, mantendo os demais. A proposta foi direto para uma tabela de sessão completa (nível 2, o mais caro), sem primeiro considerar o padrão mais barato e amplamente usado para o nível 1: um contador de versão (*security stamp*) no próprio `User`, incluído no cookie assinado, que é comparado a cada request — sem tabela nova, sem infraestrutura de cache adicional. Isso resolve "logout de todos os dispositivos" e "invalidar sessões após troca de credencial" com custo praticamente zero, mantendo o cookie majoritariamente stateless.
- **Custo:** sessão totalmente stateful (tabela + cache) é a opção mais cara das três (stateless puro / security stamp / stateful completo) e a proposta não justificou por que pular direto para ela em vez de começar pela intermediária.
- **Simplicidade:** o próprio texto original da proposta reconhece o custo ("cada requisição autenticada passa a exigir uma consulta") mas trata isso como detalhe de rodapé em vez de decisão central — deveria ser o contrário.
- **Segurança:** stateful completo é estritamente mais capaz (permite listar dispositivos, revogar um só) — mas essa capacidade só vale a pena construir **quando existir demanda de produto real** para "ver meus dispositivos conectados". Hoje, nada na especificação de produto deste Portal pede isso.

**Ajuste recomendado:** faseamento — implementar primeiro o *security stamp* (barato, resolve revogação em massa e troca de credencial) e só evoluir para tabela de sessão por dispositivo se/quando existir requisito de produto para listagem/revogação individual. Construir a versão cara primeiro, sem essa demanda confirmada, contraria o próprio princípio (do repositório) de não desenhar para requisito hipotético.

## 6. Provider Abstraction — suficiência

**Veredito: MANTER para Google/Apple/Microsoft/GitHub/Magic Link; AJUSTAR para Passkeys.**

A interface é deliberadamente agnóstica de **como** o provedor obtém as claims (redirect OIDC clássico, ou chamada REST adicional) e fixa só a **saída** (`NormalizedClaims`). Isso é o desenho certo e cobre bem os casos citados:

- **Microsoft:** OIDC padrão, encaixa sem ajuste.
- **GitHub:** não é OIDC completo (não emite ID Token por padrão; exige chamada a `/user` e `/user/emails`, e o e-mail pode vir nulo/privado mesmo com escopo concedido). A interface comporta isso porque não prescreve o transporte — mas a lista de "capacidades declaradas" da Etapa 8 não incluía explicitamente "e-mail pode ser nulo/não verificado por padrão", que é comportamento real e conhecido do GitHub. Ajuste pequeno: adicionar essa capacidade à lista, não à interface.
- **Passkeys/WebAuthn:** aqui a interface **não serve**, estruturalmente. WebAuthn não tem "claims" (nenhum e-mail, nome, nada — só a prova de posse de uma chave previamente registrada) e o registro de uma passkey normalmente acontece **com o usuário já autenticado** (ele registra um segundo fator/credencial para o `User` que já existe), não como "resolução de identidade a partir de um terceiro" como Google/Apple/GitHub fazem. Forçar WebAuthn pelo mesmo contrato (`NormalizedClaims` com email/name) exigiria inventar dados que não existem na cerimônia — sintoma de que passkey não é um "Identity Provider" no mesmo sentido dos demais; é mais parecido com o "Fator de Autenticação" apontado no item 3. Recomendo que a arquitetura preveja, desde já, que Passkeys não entrarão pelo mesmo contrato de `IdentityProvider` — precisarão de um contrato próprio (ceremony de registro/verificação, sem claims).

## 7. Compatibilidade com boas práticas OIDC

- **`sub` como identificador estável:** correto, usado como deveria.
- **Separação autenticação × autorização:** parcial. `User` ainda carrega `papelAtor`/`estadoConta` na mesma tabela que a identidade central — para o tamanho atual do domínio (2 papéis, 5 estados) isso é proporcional, não é um erro; uma tabela de RBAC separada hoje seria over-engineering sem necessidade demonstrada. **Manter como está agora, revisitar se o modelo de papéis crescer** (ex., permissões por Marca, se esse ator voltar).
- **Abstração do provedor:** coberta no item 6, com a ressalva de Passkeys.
- **Account linking:** coberto no item 4, com a lacuna de recuperação de conta.
- **Validação de claims:** a proposta delega validação de assinatura/issuer/audience à biblioteca (`openid-client`), o que é a prática correta (não reimplementar criptografia) — mas o documento **não torna isso um requisito explícito do contrato** `IdentityProvider`. Deveria: qualquer implementação de provedor baseada em OIDC/OAuth2 **deve** validar `iss`/`aud`/`exp` antes de devolver `NormalizedClaims`, como invariante do contrato, não como comportamento assumido de uma biblioteca específica — isso importa porque nem todo provedor futuro necessariamente usará `openid-client` (ex.: GitHub, que não é OIDC puro).
- **Gestão de sessão:** coberta no item 5.

## 8. Compatibilidade com Sign in with Apple

| Requisito | Status |
|---|---|
| Hide My Email | Coberto — linking nunca depende de e-mail. |
| Múltiplos provedores | Coberto — `Identity` é 1:N por `User`. |
| provider + subject | Coberto — é exatamente o modelo de `Identity`. |
| Vinculação de contas | Coberto, com a ressalva do item 4 (sem caminho de recuperação). |
| Adição de novos IdPs | Coberto, com a ressalva de Passkeys (item 6). |
| **Revogação** | **Incompleto.** A proposta só cobre revogação **iniciada pelo seu sistema** (usuário faz logout, admin revoga sessão). A Apple (e o Google, de forma similar) pode notificar o backend via webhook servidor-a-servidor quando o usuário revoga o consentimento do app pelo lado da Apple/Google (ex.: em "Configurações da conta Apple → Apps usando Sign in with Apple → Parar de usar"). A arquitetura proposta não tem nenhum ponto de entrada para receber e processar essa notificação — sem isso, uma `Identity`/`Session` pode continuar "válida" no seu sistema mesmo depois do usuário ter revogado do lado do provedor. Isso é exigido pela Apple para apps que usam Sign in with Apple e é uma lacuna real da Provider Abstraction (falta um "webhook de revogação de entrada" como capacidade opcional do contrato). |

## 9. Complexidade

- **Complexo demais, sem necessidade demonstrada:** sessão totalmente stateful desde o primeiro sprint (item 5) — deveria ser faseada.
- **Simples demais, risco real:** o esquema fixo de `Identity` (item 3) não acomoda material de WebAuthn nem MFA; a interface `IdentityProvider` (item 6) não acomoda Passkeys sem um contrato próprio.
- **O que remover:** `IdentityLinkChallenge`, citada na proposta original como "possibilidade, não decisão, depende de UX não desenhada" — concordo com a remoção do corpo principal da arquitetura. Mantê-la ali, mesmo como nota, cria a impressão de que já foi modelada; deveria existir só como observação lateral até haver UX real, não como entidade nomeada na Etapa 4.
- **O que falta, não citado na proposta original:** (a) nível de garantia de autenticação por sessão (item 1); (b) caminho de recuperação de conta quando a única Identity fica inacessível (item 4); (c) tratamento explícito para fusão de dois `User` pré-existentes (item 4); (d) webhook de revogação vindo do provedor (item 8); (e) declaração explícita de fora-de-escopo para identidade de máquina/API keys (item 2).

## 10. Veredito Final

# APROVAR COM AJUSTES

A separação `User × Identity × Session` é a decisão certa e não deve ser reaberta — é a fundação correta. Os ajustes abaixo são obrigatórios antes desta proposta virar ADR final, na ordem em que bloqueiam decisões subsequentes:

1. **Tornar `Identity` extensível** (metadado polimórfico em vez de colunas fixas do tipo `emailNoProvedor`/`secretHash`) para acomodar material de credencial de WebAuthn/Passkeys sem redesenho futuro.
2. **Introduzir um conceito distinto de "Fator de Autenticação"**, separado de `Identity`, para MFA/TOTP/step-up — não modelar como mais uma linha de `Identity`.
3. **Especificar contrato próprio para Passkeys/WebAuthn**, fora do contrato `IdentityProvider` de Google/Apple/Microsoft/GitHub — a cerimônia é estruturalmente diferente (sem claims, sem terceiro, geralmente pós-autenticação).
4. **Definir caminho de recuperação de conta** para quando a única `Identity` de um `User` se tornar inacessível (mínimo: fluxo assistido por Administrador, fora da regra "só vincula a partir de sessão ativa").
5. **Declarar explicitamente fora de escopo** a fusão de dois `User` pré-existentes duplicados — não deixar como omissão silenciosa.
6. **Faseamento da sessão:** implementar *security stamp* (revogação em massa, barata) antes de tabela de sessão por dispositivo; só construir a segunda se houver requisito de produto confirmado para listagem/revogação individual.
7. **Tornar obrigatória, no contrato do provedor**, a validação de `iss`/`aud`/`exp` como invariante — não assumida implicitamente de uma biblioteca específica.
8. **Adicionar ao contrato de Provider Abstraction** um ponto de entrada opcional para notificação de revogação vinda do provedor (webhook), necessário para conformidade real com Apple/Google a médio prazo.
9. **Remover `IdentityLinkChallenge`** do corpo da arquitetura definitiva — mantê-la só como nota de possibilidade futura, não como entidade modelada.

Nenhum destes ajustes invalida a estrutura central proposta; todos são refinamentos sobre uma base que, no essencial, está correta.
