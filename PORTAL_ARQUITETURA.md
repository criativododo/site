# PORTAL_ARQUITETURA.md

> Arquitetura funcional proposta para o Portal do Criativo DODÔ. Este documento **não é uma
> decisão tomada** — é uma síntese do que já está documentado nas fontes do projeto,
> combinada com uma proposta de arquitetura para o que ainda não existe. Cada seção marca
> explicitamente **[DOCUMENTADO]** (existe em alguma fonte do projeto, mesmo que como código
> ausente/outro sistema) vs. **[PROPOSTA]** (sugestão minha, sem base documental, a validar
> com o responsável do projeto). Nada aqui deve ser tratado como decidido até revisão
> explícita — em especial a escolha de stack (§13.1 do `PORTAL_BRIEFING.md`) segue
> **pendente**.

---

## 0. Fonte de verdade visual — leia antes de tudo

**[DECISÃO REGISTRADA NESTA SESSÃO, 2026-07-26]** A **Landing Page implementada em `app/`**
é, hoje, a implementação oficial da identidade visual do Criativo DODÔ e deve servir como
principal referência para toda a evolução visual do Portal — linguagem visual, composição,
hierarquia, tipografia, paleta, espaçamentos, componentes, animações, responsividade e
aplicação de marca devem ser extraídos dela, até que um novo Design System oficial seja
produzido e aprovado.

O `design-system/index.html` e o `DESIGN.md` (produzidos em sessão anterior a partir do
código de `app/`) são **documentação auxiliar**, não a fonte principal, e podem ser refeitos
no futuro. **Em qualquer divergência entre o Design System HTML e a Landing Page real, a
Landing Page prevalece.** Isso substitui, para fins práticos deste repositório, o que
`knowledge/Arquitetura/ADR-019-design-system-dodo-como-ssot-visual.md` declara sobre um
"Manual de Design DODÔ" em `docs/design/manual/` — esse caminho e esses arquivos não existem
fisicamente aqui; a Landing em `app/` é a referência corrente.

**Implicação prática para quem implementar o frontend do Portal:** antes de estilizar
qualquer componente novo, ler o código-fonte de `app/src` (componentes, tokens de cor/tipo
implícitos no CSS/GSAP, breakpoints) — não o `design-system/index.html` isoladamente.

---

## 1. Responsabilidades do frontend

**[PROPOSTA]** — nenhuma fonte descreve um frontend de Portal ainda a construir; a proposta
deriva do padrão já usado na Landing (`app/`) e do que o Sistema B documentava para uma SPA.

- Renderizar as 4 telas do Portal (Login, Pendências/Conteúdo, Financeiro/Histórico,
  Perfil) como SPA, reaproveitando a stack já validada na Landing: **React 19 + Vite +
  TypeScript** (`app/package.json`), mantendo consistência de ferramental com o que já
  existe no repositório.
- Consumir uma API HTTP (JSON) do backend — nunca acessar planilha, banco de dados ou
  Google Drive diretamente.
- Manter o estado de sessão (token/cookie, conforme o mecanismo de auth escolhido — §13.1 do
  `PORTAL_BRIEFING.md`, pendente) e redirecionar para Login quando a sessão expirar
  (SPEC-025 RN-03/CB-02: sessão expira após 6h de inatividade).
- Validação de formulário client-side (ex.: CEP, e-mail) apenas como conveniência de UX —
  toda regra de negócio real (RN-01 a RN-32.02) deve ser validada no backend, nunca só no
  cliente.
- Aplicar a identidade visual de `app/` (ver §0) — cores, tipografia (Work Sans/Elms Sans,
  conforme `DESIGN.md`), motion e componentes já em produção na Landing.

## 2. Responsabilidades do backend

**[DOCUMENTADO, parcialmente]** — o Sistema B (Laravel, código ausente deste repo) e as
SPECs numeradas (Sistema A, Apps Script, código também ausente) descrevem responsabilidades
de backend para os mesmos módulos, com vocabulários e tecnologias diferentes. Nenhuma das
duas é executável hoje; ambas servem como referência de regras de negócio.

- Autenticar e autorizar (SPEC-025 para a sessão da Parceira; SPEC-035 para um modelo
  federado mais amplo, cobrindo também Administrador e, opcionalmente, Marca).
- Expor a API consumida pelo Portal: pendências/Entregas (SPEC-027), financeiro/histórico
  (SPEC-030), perfil (SPEC-032) — sempre filtrando por `parceiraId`/`INFLU_KEY` corrente,
  nunca confiando em filtro feito no cliente (SPEC-027 RN-01, SPEC-030 RN-05, SPEC-032
  RN-03: isolamento estrito de dados entre Parceiras).
- Orquestrar upload de material e delegação de estado da Entrega (SPEC-012, ver §5).
- Aplicar todas as regras de negócio de máquina de estado (Entrega, Envio, Pagamento) —
  nunca delegadas ao frontend.
- Nunca expor PII (`PIX`, `CNPJ`, `Endereco`, credenciais) em log (Contrato Soberano §5,
  repetido em toda SPEC do Portal como RNF).
- **[PROPOSTA]** Se a stack escolhida for a mesma do Sistema B (Laravel), reaproveitar o
  padrão de camadas já documentado: Controller → Service → Model/Repository, com FKs
  `restrictOnDelete()` e cancelamento sempre soft (nunca `destroy` físico) — convenção já
  registrada para o Sistema B.

## 3. Organização dos módulos

**[DOCUMENTADO, ver PORTAL_BRIEFING.md §5]** O Portal (M8) é composto por 4 sub-módulos
independentes entre si, todos dependentes de Acesso (SPEC-025) como pré-requisito comum, e
cada um consumindo dados de módulos administrativos já existentes na documentação:

```
                        ┌────────────────────────┐
                        │   Acesso (SPEC-025)     │  ← pré-requisito de todos os demais
                        │   autentica + sessão     │
                        └───────────┬─────────────┘
                                    │ contexto de sessão (parceiraId)
           ┌────────────────────────┼────────────────────────┐
           ▼                        ▼                        ▼
 ┌───────────────────┐   ┌────────────────────┐   ┌───────────────────┐
 │ Conteúdo           │   │ Financeiro/Hist.    │   │ Perfil             │
 │ (SPEC-027)         │   │ (SPEC-030)          │   │ (SPEC-032)         │
 │ lê/escreve sobre:  │   │ lê (somente leitura)│   │ lê/escreve sobre:  │
 │ Entrega (SPEC-012) │   │ sobre:              │   │ campos de perfil   │
 │ Briefing (SPEC-009)│   │ Pagamento (SPEC-020)│   │ do agregado        │
 │                    │   │ Entrega (SPEC-012)  │   │ Parceira (SPEC-002)│
 └───────────────────┘   └────────────────────┘   └───────────────────┘
```

Nenhum dos 3 sub-módulos (Conteúdo/Financeiro/Perfil) tem agregado de domínio próprio — são
"fachadas de leitura/escrita" (termo usado nas próprias SPECs) sobre os módulos
administrativos M2–M7, restritas ao escopo da Parceira autenticada. **Implicação de
arquitetura:** o Portal não deveria ter seu próprio schema de dados de negócio — deveria
consumir o mesmo schema que a área administrativa usa, só que com uma camada de autorização
que restringe cada consulta ao `parceiraId` da sessão corrente.

**[PROPOSTA]** Se o Portal for construído antes da área administrativa completa (ver Fases
em `PORTAL_BACKLOG.md`), essa dependência lógica implica que os modelos mínimos de Parceira/
Entrega/Briefing/Pagamento precisam existir (mesmo que como stub gerido só por seed/admin
simples) antes que o Portal tenha dado real para mostrar.

## 4. Fluxo de autenticação

**[DOCUMENTADO — três modelos incompatíveis, nenhum implementado neste repositório; decisão
de qual adotar é pendência §13.3 do `PORTAL_BRIEFING.md`]**

### 4.1 Modelo A — Cupom + senha derivada de CNPJ (PRD/V1, legado)
Cupom identifica a Parceira; senha = 5 primeiros dígitos do CNPJ. Documentado como "segredo
de baixa entropia por desenho atual" e recomendado para abandono (SPEC-025 §10, nota sobre
RN-16). Bloqueio de 5 tentativas → 15 min (RN-17); sessão de 6h deslizante (RN-18).

### 4.2 Modelo B — E-mail/senha via Laravel (Sistema B)
Autenticação local padrão do Laravel (`Auth::attempt`), sem bloqueio por tentativas
documentado. Código ausente deste repositório.

### 4.3 Modelo C — Federado, Google Identity/OIDC (SPEC-035, o mais detalhado
arquiteturalmente)

Fluxo completo documentado (SPEC-035 Cap. 5, 9, 10), pensado originalmente para Apps
Script/Sheets mas descrevendo uma lógica de aplicação reaproveitável em qualquer stack:

```
Frontend ──(handshake OIDC com Google)──▶ recebe ID Token assinado
   │
   ▼
Backend recebe token bruto (não valida ainda)
   │
   ▼
Adaptador valida criptograficamente: aud (client_id), iss (emissor), exp/iat
   │  falha → erro fail-closed (nunca identidade parcial/presumida)
   ▼
sub/email/name extraídos e validados
   │
   ▼
Backend busca sub em tabela de identidades
   ├─ inexistente → tenta vincular a Parceira pré-existente por e-mail
   │                (confirmação manual explícita da usuária, NUNCA associação
   │                automática silenciosa) → se não houver match, abre onboarding
   │                → conta nasce PENDING
   ├─ existente, não-ACTIVE → bloqueia com erro correspondente ao estado
   └─ existente e ACTIVE → resolve identificador de sessão (parceiraId) e emite
                           sessão (reaproveitando conceito de Sessão/TokenDeSessao
                           já desenhado para o Modelo A, se essa peça for construída)
```

**Estados de conta (SPEC-035 Cap. 7):** `PENDING → ACTIVE` (só por ação de Administrador,
nunca automática) `→ INACTIVE` (suspensão) `→` pode retornar a `ACTIVE`. `REJECTED` é
terminal para aquele cadastro. Regra de reconciliação importante: para Influenciadora, o
acesso operacional exige **tanto** `ESTADO_CONTA = ACTIVE` **quanto** `Parceira.status =
Ativa` — prevalece sempre a condição mais restritiva (SPEC-035 §8.1).

**Bootstrap do primeiro Administrador (RN-07):** como a ativação depende de um Administrador
já `ACTIVE`, o primeiro registro é provisionado manualmente, fora do fluxo padrão.

**[PROPOSTA]** Independentemente de qual dos 3 modelos for escolhido (decisão pendente), a
camada de autorização deve seguir o padrão RBAC+SBAC documentado em SPEC-035 Cap. 8: toda
verificação de acesso combina **papel** (Administrador/Influenciadora/Marca) **e** **estado
da conta**, aplicada na camada de controller antes de qualquer regra de negócio a jusante —
nunca deixada para o frontend decidir o que mostrar.

## 5. Upload de arquivos

**[DOCUMENTADO — desenho de fluxo, não de tecnologia]** SPEC-027 (§6.3, UC-027.03) define
que o Portal **delega** o upload à SPEC-012 (Entrega) — o sub-módulo de Conteúdo do Portal
não tem lógica própria de armazenamento, só recebe o arquivo da Parceira e repassa. Ao
concluir o upload, a Entrega correspondente transiciona de `AguardandoMaterial` para
`EmRevisao` (RN-02 de SPEC-027 = RN-03 de SPEC-012). Regras adicionais do Sistema B: upload
bloqueado se não houver briefing publicado para aquele tipo, ou se a cota contratada já foi
atingida; tipo de entregável é imutável após criado.

**[PROPOSTA]** Fluxo técnico sugerido, independente de stack:
1. Frontend envia o arquivo (multipart/form-data ou upload direto a um storage assinado).
2. Backend valida: sessão ativa, Entrega pertence à Parceira corrente (SPEC-027 INV-01),
   Entrega no estado `AguardandoMaterial`, cota/tipo compatível (regra do Sistema B).
3. Backend grava o arquivo no storage escolhido (ver §6) e só então transiciona o estado da
   Entrega para `EmRevisao` — a transição de estado nunca deve ocorrer antes da confirmação
   de gravação bem-sucedida, para não deixar a Entrega em `EmRevisao` sem material de fato
   salvo.
4. Erros de upload (PC-03 em SPEC-027) devem reverter a tentativa sem alterar o estado da
   Entrega.

## 6. Armazenamento

**[DOCUMENTADO, mas específico de outra stack]** `knowledge/Arquitetura/ADR-017-oauth-conta-
dedicada-google-drive.md` documenta o Google Drive via OAuth de conta dedicada para o
Sistema B (Laravel, nunca chegou a produção neste repositório): `refresh_token` obtido por
Authorization Code + redirect loopback local (não Service Account Key, bloqueada pela Org
Policy `iam.disableServiceAccountKeyCreation` do Google Cloud), escopo `drive` completo,
estrutura de pastas documentada em Shared Drive institucional com subpastas
Materiais/Backup/Temporarios/Contratos/Exportacoes. **Não vinculante para a stack atual** —
ver ressalva abaixo.

**[DOCUMENTADO — decisão vigente para esta stack]** Para o Portal Node.js/TypeScript deste
repositório, o OAuth do Drive está decidido e validado por `ADR-017` (série de governança,
`knowledge/ARCHITECTURAL_DECISIONS.md`) e `ADR-019` (mesma série): mesmo mecanismo de
`refresh_token`, porém escopo **`drive.file`**, não `drive` completo. `ADR-019` resolve
formalmente o conflito com o ADR legado acima — nenhum requisito documentado do Portal
depende de arquivo pré-existente fora do que o próprio app cria.

**[PROPOSTA]** Se a stack escolhida não depender de Google Drive, qualquer storage
compatível com upload de arquivo (S3-compatível, disco local com backup, ou o próprio Drive
reaproveitando o padrão de `ADR-017`) é tecnicamente equivalente, desde que preserve: (a)
isolamento — Parceira nunca acessa arquivo de outra Parceira por manipulação de URL; (b)
metadado de qual Entrega o arquivo pertence; (c) nenhuma credencial de armazenamento exposta
ao frontend (uploads sempre mediados pelo backend, ou por URL assinada de curta duração).

## 7. Modelo de permissões

**[DOCUMENTADO — SPEC-025 §13, SPEC-027 §13, SPEC-030 §13, SPEC-032 §13, SPEC-035 Cap. 8]**

| Operação | Parceira | Administrador | Marca (se implementado) |
|---|---|---|---|
| Autenticar no Portal | ✅ | ❌ | — |
| Ver/consultar bloqueios de acesso | ❌ | ✅ | — |
| Ver pendências próprias | ✅ | ✅ (todas) | ❌ |
| Enviar material | ✅ | ❌ | ❌ |
| Ver financeiro/histórico próprio | ✅ | ✅ (todas) | ❌ |
| Ver/editar próprio perfil (PIX/e-mail/endereço) | ✅ | ✅ (todas, via módulo de Gestão) | ❌ |
| Editar valor/vínculo/Condição Comercial | ❌ | ✅ | ❌ |
| Aprovar/rejeitar/ativar/inativar conta | ❌ | ✅ (exclusivo) | ❌ |
| Ver dados/campanhas/briefings da própria Marca | — | ✅ (global) | ✅ (só os seus) — não implementado |

**Regra estrutural (SPEC-035 §8.3):** a verificação de escopo relacional deve ser **mecânica
e obrigatória** em toda consulta/escrita — o parâmetro de filtragem (`parceiraId`/
`INFLU_KEY`) é injetado pela camada de controle a partir da sessão, nunca aceito como
parâmetro vindo do cliente. Isso é o que garante o isolamento estrito entre Parceiras
exigido por SPEC-027/030/032 (RN-01/RN-05/RN-03 respectivamente) e pela pendência de LGPD
(Q-09).

## 8. Estrutura das entidades

Ver `PORTAL_BRIEFING.md` §9 para o detalhamento completo dos dois vocabulários não
reconciliados (Contrato Soberano vs. Sistema B) e do vocabulário de Identidade (SPEC-035).

**[PROPOSTA]** Recomendação minha, não documentada em nenhuma fonte como decisão: adotar o
vocabulário do **Contrato Soberano** (`Parceira`, `Colaboração Mensal`, `Entrega`, `Envio`,
`Pagamento`) como linguagem ubíqua do novo código, por duas razões objetivas presentes nas
próprias fontes — (a) `CONTRATO_SOBERANO.md` se autodeclara fonte soberana e imutável de
negócio (§2: "em conflito entre documentação/implementação e a fonte oficial, prevalece a
fonte oficial"); (b) o vocabulário do Sistema B (`Campanha`/`ParticipacaoNaCampanha`) nunca
teve sua reconciliação com o Contrato Soberano concluída (o próprio `DOMAIN_MODEL.md` do
Sistema B termina admitindo isso em aberto). Esta é uma recomendação, não uma decisão — deve
ser validada explicitamente (pendência §13.2 do `PORTAL_BRIEFING.md`).

Entidades mínimas necessárias para o Portal funcionar (M8), na nomenclatura do Contrato
Soberano:
- `Parceira` (com VOs `PIX`, `CNPJ`, `Endereco`, `CondicaoComercial`)
- `ColaboracaoMensal` (chave `Parceira × MesReferencia`, com Snapshot Comercial congelado)
- `Briefing` (1:1 com ColaboracaoMensal)
- `Entrega` (N por ColaboracaoMensal, uma por unidade contratada de cada formato)
- `Pagamento`/`ObrigacaoFinanceira` (1:1 ou N por ColaboracaoMensal, conforme avulsos)
- `Usuario`/`Identidade` (se o modelo federado for adotado) — bounded context separado,
  ligado a `Parceira` só por `INFLU_KEY` (nunca duplicando atributos de negócio)

## 9. Comunicação entre camadas

**[DOCUMENTADO, específico da stack Apps Script — SPEC-035 Cap. 9]** O desenho arquitetural
mais detalhado disponível descreve uma cadeia estritamente unidirecional e síncrona:

```
Entrypoint → Controller → Service → Repository → ACL → Domain
```

- **Entrypoint** — único ponto autorizado a tocar infraestrutura física (no caso Apps
  Script: `SpreadsheetApp`/`Session`/`LockService`); extrai dados brutos da requisição.
- **Controller** — orquestra, captura payload, converte exceções em envelope de resposta
  padronizado (`{ success, data | error }`).
- **Service** — regras de fluxo, coordenação transacional, decide o caminho de negócio.
- **Repository** — métodos semânticos (`buscarPorSub()`, `salvar()`), sem conhecimento de
  formato físico.
- **ACL (Camada Anticorrupção)** — única ponte entre domínio e persistência física; resolve
  por nome de cabeçalho/coluna, nunca por índice — princípio herdado diretamente do
  `CONTRATO_SOBERANO.md` §3 ("nenhuma camada fora da ACL pode depender de nome físico de
  coluna").
- **Domain** — núcleo puro de regras de negócio e máquinas de estado, sem qualquer
  acoplamento a APIs externas, HTTP ou infraestrutura.

**[PROPOSTA]** Este mesmo princípio de camadas se traduz diretamente para uma stack
convencional (ex.: Laravel), preservando a disciplina de isolamento, ainda que os nomes de
camada mudem:

```
Rota/Middleware (equivalente a Entrypoint)
   → Controller (validação de request, tradução para/de HTTP)
      → Service (regra de negócio e orquestração — onde vivem as RN-XX)
         → Model/Repository (persistência — Eloquent, ou repositório explícito)
            → Domain (Value Objects: PIX, CNPJ, Endereco, CondicaoComercial —
              validação e invariantes isolados de framework)
```

O ponto que deve ser preservado, qualquer que seja a stack: **nenhuma regra de negócio (as
RN-XX de `PORTAL_BRIEFING.md` §7) deve viver no Controller ou no frontend** — sempre no
Service/Domain, para que a lógica sobreviva a uma eventual troca de camada de apresentação
ou de mecanismo de persistência (mesmo raciocínio do Contrato Soberano aplicado a uma stack
diferente).

---

## Nota final sobre reaproveitamento de código

Nenhum dos dois sistemas documentados (Sistema A/Apps Script, Sistema B/Laravel) tem código
presente neste repositório — não há nada para importar diretamente. O valor de todas as
fontes citadas acima está nas **regras de negócio e no desenho de fluxo**, não em artefatos
de código herdáveis. Qualquer semelhança de nomenclatura entre este documento e as SPECs
originais é intencional (rastreabilidade), não indicação de que o código exista.
