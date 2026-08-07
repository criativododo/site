# Plano de Migração — Ponto Único de Tratamento de Erros HTTP (Frontend)

> Documento de planejamento, produzido na Sprint 3 de Observabilidade do Frontend. **Não
> implementado nesta sessão** — a sessão que o produziu teve escopo explicitamente restrito a
> corrigir bugs comprovados, sem alterar arquitetura (ver `docs/handoff/
> 2026-08-06_sprint3-observabilidade-frontend-bugs.md`). Este plano é a entrada para uma
> **sprint arquitetural própria, separada**, quando o usuário decidir priorizá-la.
>
> **Pré-requisito de governança (CLAUDE.md):** introduzir um diretório `hooks/` (que hoje não
> existe) é uma decisão de organização estrutural — abrir ADR antes de começar a implementação.

## 1. Arquitetura atual (por que migrar)

- `lib/api.ts` já centraliza a chamada HTTP crua (`apiFetch`) e a classe `ApiError`
  (`status` + `message`). Isso está bem — não precisa mudar.
- **Não existe classificação de erro** — `ApiError` só carrega `status`/`message`; erro de rede
  (o `fetch()` em si rejeitando, ex. `TypeError: Failed to fetch`) nunca vira `ApiError`,
  chega cru no `catch` de cada chamador.
- **19 arquivos de página** repetem manualmente o mesmo boilerplate (78 chamadas a `setErro`,
  a maioria resets `setErro(null)`; 28 blocos `try/catch`; 25 `.catch(erroCapturado => …)`):
  ```
  apiFetch(...)
    .then(dado => ativo && setDado(dado))
    .catch(erroCapturado => {
      if (!ativo) return;
      setErro(erroCapturado instanceof ApiError ? erroCapturado.message : "<fallback>");
    })
    .finally(() => ativo && setCarregando(false));
  ```
  ou a variante `async/await` com `try/catch/finally` equivalente.
- **Nenhum desses ~20 pontos loga o erro** — quando tratado (`setErro`), não sobra rastro de
  diagnóstico nenhum; só aparece no console quando o erro *escapa sem tratamento* (foi assim
  que a Sprint 3 encontrou os 2 bugs reais em `session.tsx`/`Admin.tsx` — via unhandled
  rejection, não via log intencional).
- **Classificação por status hoje é ad-hoc e inconsistente:** só 2 lugares checam `401`
  (`session.tsx`, `Pendencias.tsx`) e 3 checam `404` (`Perfil.tsx`, `FinanceiroInfluenciadora.tsx`,
  `HojeInfluenciadora.tsx`) — cada um com uma UX própria e **intencional**:
  - `Pendencias.tsx` → estado dedicado `"sessaoExpirada"` (tela própria).
  - `session.tsx` → `401` = "não logado", silencioso (correto, é o fluxo normal de boot).
  - `Perfil.tsx` → `404` = "perfil ainda não configurado", trata como formulário vazio editável
    (comentário no código explica: backend só cria o registro no primeiro `PATCH`).
  - `FinanceiroInfluenciadora.tsx`/`HojeInfluenciadora.tsx` → `404` = "sem histórico/briefing
    ainda", trata como estado vazio, não como erro.
  Essas divergências são **decisões de produto/UX legítimas**, não bugs — qualquer ponto único
  precisa preservá-las via um mecanismo de override, nunca colapsar tudo numa mensagem genérica.
- Não existe `hooks/` nem `services/` — páginas chamam `apiFetch` diretamente.

## 2. Arquitetura proposta

### 2.1. Classificação de erro (novo, arquivo pequeno e puro)

Um helper `classificarErro(erro: unknown): ClasseDeErro` em (sugestão) `lib/httpErro.ts`,
`ClasseDeErro = "rede" | "timeout" | "autenticacao" | "autorizacao" | "validacao" |
"servidor" | "inesperado"`, mapeando:
- `TypeError` de `fetch` (mensagem `"Failed to fetch"`/`"NetworkError"` ou `erro instanceof
  TypeError` sem `ApiError`) → `"rede"`.
- `AbortError`/`DOMException` de timeout (se/quando `apiFetch` ganhar timeout — hoje não tem,
  ver risco 5.4) → `"timeout"`.
- `ApiError` com `status === 401` → `"autenticacao"`.
- `ApiError` com `status === 403` → `"autorizacao"`.
- `ApiError` com `status` em `400..499` (exceto 401/403) → `"validacao"`.
- `ApiError` com `status >= 500` → `"servidor"`.
- Qualquer outra coisa → `"inesperado"`.

### 2.2. Hook único de chamada (novo, `hooks/useChamadaApi.ts` ou similar)

Encapsula exatamente o boilerplate hoje duplicado 19 vezes: `apiFetch` + flag `ativo` +
`carregando`/`erro`/`dado` + `finally` + log automático via `relatarErroFrontend` (Sprint 2,
`lib/errorReporting.ts` — **reaproveitar, não recriar**) com o `contexto` já preenchido pela
classificação. Assinatura pensada para não perder nenhum caso especial já mapeado na seção 1:

```ts
function useChamadaApi<T>(
  chamar: () => Promise<T>,
  deps: unknown[],
  opcoes?: {
    aoClassificar?: (classe: ClasseDeErro, erro: unknown) => "tratado" | "usar-padrao";
    mensagemPadrao?: string;
  },
): { dado: T | null; erro: string | null; carregando: boolean; recarregar: () => void }
```

O `aoClassificar` é o escape hatch: se o chamador retornar `"tratado"`, o hook não seta `erro`
nem loga de novo (o chamador já decidiu o que fazer — ex.: `Pendencias.tsx` retorna
`"tratado"` para `401` depois de setar seu próprio estado `"sessaoExpirada"`;
`Perfil.tsx`/`FinanceiroInfluenciadora.tsx`/`HojeInfluenciadora.tsx` fazem o mesmo para `404`).

**Sem esse escape hatch, a migração quebra 4 telas que hoje têm comportamento correto e
intencional.** Qualquer implementação que não preserve isso deve ser rejeitada em code review.

### 2.3. Log automático

O hook chama `relatarErroFrontend(`http-${classe}`, erro, { rota, mensagem })` internamente
sempre que `aoClassificar` não devolver `"tratado"` (ou não existir). Isso é o que fecha o gap
real descoberto nesta sprint: hoje, erro tratado (`setErro`) não deixa rastro nenhum.

## 3. Impacto — arquivos envolvidos

| Categoria | Arquivos | Contagem |
|---|---|---|
| Novo (classificação + hook) | `lib/httpErro.ts`, `hooks/useChamadaApi.ts` (+ testes) | 2 novos |
| Leitura simples, sem status especial | `AdminDashboard.tsx`, `AdminComunicacao.tsx`, `MarcaDashboard.tsx`, `AdminCampanha.tsx`, `experimentos/Hoje.tsx`, `Financeiro.tsx` | 6 |
| Mutação (botão dispara ação) | `AdminObrigacoes.tsx`, `AdminBriefings.tsx`, `AdminParceiras.tsx`, `AdminEntregas.tsx`, `Cadastro.tsx`, `AdminColaboracoesMensais.tsx`, `Admin.tsx` (3 componentes internos) | 7 |
| Status especial (precisa do escape hatch) | `Pendencias.tsx` (401→sessão expirada), `Perfil.tsx`, `FinanceiroInfluenciadora.tsx`, `HojeInfluenciadora.tsx` (404→vazio) | 4 |
| Já corrigido nesta sprint (fora da migração por ora) | `lib/session.tsx` | 1 (revisitar por último, opcional) |
| Não mapeado no escopo desta auditoria (telas de `experimentos/` restantes) | `PerfilInfluenciadora.tsx`, `CentralInfluenciadora.tsx`, `LogisticaEnvioDetalhe.tsx` | 3 |

**Total estimado: ~19 arquivos de página + 2 novos = 21 arquivos tocados** ao final da
migração completa. Isso é grande — daí a recomendação forte de ordem incremental (seção 4).

## 4. Ordem de migração recomendada (do menor para o maior risco)

1. **Construir o primitivo como adição pura** — `lib/httpErro.ts` + `hooks/useChamadaApi.ts`,
   com testes unitários isolados (mock de `apiFetch`). Zero pontos de chamada tocados, zero
   risco às telas existentes. Só depois disso existe algo para migrar.
2. **Piloto de 1 tela simples** — `Financeiro.tsx` (`ResumoDoPeriodo`): leitura única, sem
   status especial, já bem isolada. Valida a API do hook contra um consumidor real antes de
   replicar.
3. **Telas de leitura simples restantes** (5 telas da segunda linha da tabela) — mesma forma
   do piloto, risco moderado, podem ir em lote pequeno (2-3 por PR).
4. **Telas com mutação** (7 telas/componentes da terceira linha) — risco maior por efeito
   colateral real (pagamento, aprovação, geração de convite); migrar uma de cada vez, com
   validação manual dedicada por tela antes de seguir para a próxima.
5. **Telas com status especial** (4 telas da quarta linha) — maior cuidado: cada uma precisa
   do `aoClassificar` validado contra o caso específico antes de migrar. Fazer por último,
   quando o hook já estiver maduro pelos passos 2-4.
6. **`session.tsx`** — opcional, menor prioridade (não é um padrão repetido, já foi corrigido
   nesta sprint). Só revisitar se fizer sentido depois de tudo acima estar migrado.
7. **Retirar o boilerplate antigo** repositório afora, tela a tela, só depois de cada migração
   individual validada — nunca em lote único.

**Regra dura para a próxima sprint:** uma tela (ou lote pequeno de telas do mesmo tipo) por
sessão/PR, com validação própria antes de seguir. Não big-bang.

## 5. Riscos

1. **Mensagens de fallback são hoje deliberadamente diferentes por tela** (ex.:
   `"não foi possível carregar o financeiro do período."` vs. `"não foi possível carregar."`).
   O hook não pode ter uma mensagem padrão única fixa — precisa aceitar `mensagemPadrao` por
   chamada, ou a migração degrada qualidade de copy silenciosamente.
2. **O flag `ativo` (cleanup de efeito) precisa ser reproduzido exatamente** pelo hook — um bug
   aqui reintroduz `setState` em componente desmontado em 15+ telas de uma vez só (raio de
   impacto grande justamente por ser código compartilhado).
3. **Colapsar a divergência de `401`/`404`** (seção 2.2) é o risco mais concreto de regressão
   de UX real — qualquer PR de migração que remova o `aoClassificar` ou não seja testado contra
   os 4 casos especiais deve ser rejeitado.
4. **Zero testes hoje cobrem o caminho de erro dessas 19 telas.** A migração é uma oportunidade
   de testar o hook uma vez só (bom), mas confirmar que cada uma das 19 telas manteve o
   comportamento exato ainda exige validação manual (ou teste de interação) por tela — esforço
   não trivial, não deve ser subestimado no planejamento da próxima sprint.
5. **`apiFetch` não tem timeout hoje** — a classe `"timeout"` da classificação (seção 2.1) fica
   sem caso de uso real até isso existir. Ou se implementa timeout em `apiFetch` como parte
   dessa migração (expande escopo), ou a classe `"timeout"` fica reservada/sem uso por ora —
   decisão explícita a tomar no início da sprint arquitetural, não no meio.
6. **Introduzir `hooks/` é uma decisão estrutural** (CLAUDE.md exige ADR para isso) — abrir o
   ADR antes do primeiro commit da sprint, não depois.
7. **Risco de scope creep** — 21 arquivos é grande o bastante para a tentação de "já que estou
   mexendo, aproveito e ajusto X" tomar conta. A ordem incremental da seção 4 existe
   justamente para conter isso; vale repetir o alerta explicitamente no kickoff da sprint.

## 6. Não incluído neste plano (decisões em aberto para quem executar)

- Se `useChamadaApi` deve suportar mutação (POST/PATCH/DELETE) além de leitura, ou se mutação
  merece um hook irmão separado (`useMutacaoApi`) — os padrões de `salvar()`/`decidir()`/etc.
  têm forma um pouco diferente (disparo por clique, não por efeito) e podem não caber bem no
  mesmo hook de leitura sem forçar a API.
- Se a classificação (`classificarErro`) deve ser exposta como string livre no log (como hoje,
  `relatarErroFrontend` só recebe `contexto: string`) ou se vale a pena um campo estruturado
  separado — decisão de formato de log, não de arquitetura de código.
