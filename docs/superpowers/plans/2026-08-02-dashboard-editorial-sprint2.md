# Dashboard editorial do Portal DODÔ (Sprint 2) — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reescrever `portal-frontend/src/pages/AdminDashboard.tsx` como página editorial de 3
blocos (precisa de atenção agora / o que vem a seguir / o que pode esperar), substituindo o
padrão de KPIs em grade, e adicionar a agregação de backend que o Bloco 2 precisa.

**Architecture:** Mudança aditiva em duas camadas independentes (sem workspace
compartilhado, ver CLAUDE.md): (1) `portal-backend` ganha uma função pura nova
(`calcularProximosPrazos`) e um campo novo em `IndicadoresAdministrativos`, sem entidade
nova nem mudança de schema; (2) `portal-frontend` reescreve a página consumindo o campo novo,
com CSS própria (sem shadcn/Tailwind — CSS + tokens, como o resto do Portal pós-Sprint 1).

**Tech Stack:** React 19 + Vite + TypeScript (frontend, CSS puro sobre
`portal-frontend/src/styles/tokens.css`); Node.js + TypeScript + Express (backend); Vitest
(testes de backend — frontend não tem test runner configurado, ver Task 4).

## Global Constraints

- Fonte soberana: `ART_DIRECTION_GUIDE.md` (raiz do repo) — qualquer dúvida de estilo, o
  guia decide.
- Spec aprovada: `docs/superpowers/specs/2026-08-02-dashboard-editorial-design.md` — este
  plano implementa exatamente essa spec, não a reabre.
- Sem shadcn/Tailwind/nova dependência de UI — `portal-frontend` segue CSS + tokens.
- Sem audit log persistente, sem seção "o que mudou recentemente" (fora de escopo,
  decisão de produto registrada na spec).
- Sem tocar em nenhuma outra página além de `AdminDashboard.tsx`.
- Vocabulário de domínio: Contrato Soberano (ADR-006) — nomes de campo/variável em
  português, seguindo o que já existe no módulo (`entrega`, `parceira`, `dataEntrega` etc.).
- Validar com `npm run build`/`npm run lint`/`npm run typecheck`/`npm run test` (o que
  existir em cada projeto) antes de cada commit — não pular.

---

## File Structure

- **Modify** `portal-backend/src/modules/dashboard/dashboard.types.ts` — novo tipo
  `ProximoPrazo`, novo campo `proximosPrazos` em `IndicadoresAdministrativos`.
- **Modify** `portal-backend/src/modules/dashboard/dashboard.service.ts` — nova função pura
  `calcularProximosPrazos`, `calcularIndicadores` passa a aceitar `blocosBriefing` e a
  incluir `proximosPrazos` no retorno, `obterIndicadoresAdministrativos` busca
  `briefingRepositorio.listarTodos()`.
- **Modify** `portal-backend/src/modules/dashboard/dashboard.service.test.ts` — atualiza a
  fixture `semDados`/teste "sem nenhum dado" para o campo novo, acrescenta
  `describe("calcularProximosPrazos")`.
- **Modify** `portal-frontend/src/lib/formatters.ts` — novo helper
  `formatarPrazoRelativo(diasRestantes)`.
- **Modify** `portal-frontend/src/index.css` — novo bloco de regras `.dashboard-*`
  (Bloco 1/2/3), sem alterar nem remover nenhuma classe existente (`.financeiro-kpi*` etc.
  continuam em uso por outras páginas).
- **Modify** `portal-frontend/src/pages/AdminDashboard.tsx` — reescrita completa do corpo da
  página.

---

### Task 1: Backend — `calcularProximosPrazos` (função pura, TDD)

**Files:**
- Modify: `portal-backend/src/modules/dashboard/dashboard.types.ts`
- Modify: `portal-backend/src/modules/dashboard/dashboard.service.ts`
- Test: `portal-backend/src/modules/dashboard/dashboard.service.test.ts`

**Interfaces:**
- Consumes: `Entrega` (`portal-backend/src/modules/conteudo/entrega.types.ts`: `id`,
  `parceiraId`, `formato: FormatoEntrega`, `estado: EstadoEntrega`, `dataEntrega: string`),
  `BlocoBriefing` (`portal-backend/src/modules/briefing/briefing.types.ts`: `parceiraId`,
  `formato`, `dataPostagem: string`), `Parceira` (`id`, `nome`).
- Produces: `ProximoPrazo` (novo tipo) e `calcularProximosPrazos(dados): ProximoPrazo[]`,
  usados pela Task 2.

- [ ] **Step 1: Adicionar o tipo `ProximoPrazo` a `dashboard.types.ts`**

Adicionar ao topo do arquivo `portal-backend/src/modules/dashboard/dashboard.types.ts`:

```ts
import type { FormatoEntrega } from "../conteudo/entrega.types.js";
```

E, no fim do arquivo:

```ts
/**
 * Item de "o que vem a seguir" (ART_DIRECTION_GUIDE.md, Dashboard Sprint 2): prazo futuro
 * de Entrega ou de postagem de Briefing, já resolvido para nome de Parceira e dias
 * restantes — o Portal não recalcula data, só formata o que o backend já decidiu.
 */
export interface ProximoPrazo {
  tipo: "entrega" | "postagem";
  parceiraNome: string;
  formato: FormatoEntrega;
  /** `AAAA-MM-DD` do prazo (dataEntrega da Entrega, ou dataPostagem do Bloco de Briefing). */
  data: string;
  /** Inteiro, pode ser 0 (vence hoje); nunca negativo (prazos vencidos não entram na lista). */
  diasRestantes: number;
}
```

E adicionar o campo ao final da interface `IndicadoresAdministrativos` no mesmo arquivo:

```ts
  moderacao: {
    contasPendentes: number;
  };
  /** "O que vem a seguir" (Sprint 2) — ordenado por proximidade, limitado a 5 itens. */
  proximosPrazos: ProximoPrazo[];
}
```

- [ ] **Step 2: Escrever os testes de `calcularProximosPrazos` (devem falhar — função ainda não existe)**

Adicionar ao topo de `portal-backend/src/modules/dashboard/dashboard.service.test.ts`, junto
aos outros imports:

```ts
import type { BlocoBriefing } from "../briefing/briefing.types.js";
import { calcularIndicadores, calcularProximosPrazos } from "./dashboard.service.js";
```

(substituindo a linha `import { calcularIndicadores } from "./dashboard.service.js";`
existente).

Adicionar, junto às outras funções-fábrica de fixture (`parceira`, `entrega`, `obrigacao`):

```ts
function blocoBriefing(overrides: Partial<BlocoBriefing> = {}): BlocoBriefing {
  return {
    id: "b1",
    parceiraId: "p1",
    mesReferencia: "2026-07",
    formato: "Carrossel",
    look: "Look 1",
    dataEntrega: "2026-07-05",
    dataPostagem: "2026-07-20",
    orientacao: "orientação de teste",
    dataAprovacaoInterna: "2026-07-18",
    dataCriacao: "2026-07-01T00:00:00.000Z",
    dataAtualizacao: "2026-07-01T00:00:00.000Z",
    ...overrides,
  };
}
```

Adicionar, no fim do arquivo (novo `describe`):

```ts
describe("calcularProximosPrazos", () => {
  const parceiras = [parceira({ id: "p1", nome: "Parceira Um" })];

  it("sem entregas nem blocos de briefing, retorna lista vazia", () => {
    expect(
      calcularProximosPrazos({ entregas: [], blocosBriefing: [], parceiras, hoje: "2026-07-15" }),
    ).toEqual([]);
  });

  it("inclui Entrega AGUARDANDO_MATERIAL com dataEntrega futura", () => {
    const resultado = calcularProximosPrazos({
      entregas: [entrega({ estado: "AGUARDANDO_MATERIAL", dataEntrega: "2026-07-17" })],
      blocosBriefing: [],
      parceiras,
      hoje: "2026-07-15",
    });
    expect(resultado).toEqual([
      { tipo: "entrega", parceiraNome: "Parceira Um", formato: "Reel", data: "2026-07-17", diasRestantes: 2 },
    ]);
  });

  it("não inclui Entrega já atrasada (já coberta pelo Bloco 1 de atenção agora)", () => {
    const resultado = calcularProximosPrazos({
      entregas: [entrega({ estado: "AGUARDANDO_MATERIAL", dataEntrega: "2026-07-10" })],
      blocosBriefing: [],
      parceiras,
      hoje: "2026-07-15",
    });
    expect(resultado).toEqual([]);
  });

  it("não inclui Entrega em outro estado (EM_REVISAO, APROVADO, PUBLICADO)", () => {
    const resultado = calcularProximosPrazos({
      entregas: [
        entrega({ id: "a", estado: "EM_REVISAO", dataEntrega: "2026-07-17" }),
        entrega({ id: "b", estado: "APROVADO", dataEntrega: "2026-07-18" }),
        entrega({ id: "c", estado: "PUBLICADO", dataEntrega: "2026-07-19" }),
      ],
      blocosBriefing: [],
      parceiras,
      hoje: "2026-07-15",
    });
    expect(resultado).toEqual([]);
  });

  it("inclui Bloco de Briefing com dataPostagem futura e exclui dataPostagem passada", () => {
    const resultado = calcularProximosPrazos({
      entregas: [],
      blocosBriefing: [
        blocoBriefing({ id: "futuro", dataPostagem: "2026-07-20" }),
        blocoBriefing({ id: "passado", dataPostagem: "2026-07-01" }),
      ],
      parceiras,
      hoje: "2026-07-15",
    });
    expect(resultado).toEqual([
      { tipo: "postagem", parceiraNome: "Parceira Um", formato: "Carrossel", data: "2026-07-20", diasRestantes: 5 },
    ]);
  });

  it("ordena Entregas e Blocos de Briefing juntos por proximidade de data", () => {
    const resultado = calcularProximosPrazos({
      entregas: [entrega({ id: "e1", estado: "AGUARDANDO_MATERIAL", dataEntrega: "2026-07-25" })],
      blocosBriefing: [blocoBriefing({ id: "b1", dataPostagem: "2026-07-16" })],
      parceiras,
      hoje: "2026-07-15",
    });
    expect(resultado.map((item) => item.data)).toEqual(["2026-07-16", "2026-07-25"]);
  });

  it("limita a 5 itens, mantendo os mais próximos", () => {
    const entregas = Array.from({ length: 7 }, (_, indice) =>
      entrega({
        id: `e${indice}`,
        estado: "AGUARDANDO_MATERIAL",
        dataEntrega: `2026-07-${String(16 + indice).padStart(2, "0")}`,
      }),
    );
    const resultado = calcularProximosPrazos({ entregas, blocosBriefing: [], parceiras, hoje: "2026-07-15" });
    expect(resultado).toHaveLength(5);
    expect(resultado[0].data).toBe("2026-07-16");
    expect(resultado[4].data).toBe("2026-07-20");
  });

  it("resolve diasRestantes = 0 para prazo hoje", () => {
    const resultado = calcularProximosPrazos({
      entregas: [entrega({ estado: "AGUARDANDO_MATERIAL", dataEntrega: "2026-07-15" })],
      blocosBriefing: [],
      parceiras,
      hoje: "2026-07-15",
    });
    expect(resultado[0].diasRestantes).toBe(0);
  });

  it("usa 'parceira' como nome de fallback quando parceiraId não é encontrado", () => {
    const resultado = calcularProximosPrazos({
      entregas: [entrega({ parceiraId: "inexistente", estado: "AGUARDANDO_MATERIAL", dataEntrega: "2026-07-17" })],
      blocosBriefing: [],
      parceiras,
      hoje: "2026-07-15",
    });
    expect(resultado[0].parceiraNome).toBe("parceira");
  });
});
```

- [ ] **Step 3: Rodar os testes e confirmar que falham (função não existe)**

Run: `npm --prefix portal-backend run test -- dashboard.service`
Expected: FAIL — `calcularProximosPrazos` não exportado / não definido.

- [ ] **Step 4: Implementar `calcularProximosPrazos` em `dashboard.service.ts`**

Adicionar aos imports do topo de `portal-backend/src/modules/dashboard/dashboard.service.ts`:

```ts
import type { BlocoBriefing } from "../briefing/briefing.types.js";
```

e trocar a linha de import de tipos do dashboard por:

```ts
import type { IndicadoresAdministrativos, ProximoPrazo } from "./dashboard.types.js";
```

Adicionar, logo abaixo de `calcularIndicadores` (antes de `obterIndicadoresAdministrativos`):

```ts
/**
 * Núcleo puro (testável sem repositório): "o que vem a seguir" — Entregas
 * AGUARDANDO_MATERIAL e postagens de Briefing ainda não vencidas, mais próximas primeiro.
 * Prazos já vencidos não entram aqui — já estão cobertos por `entregas.atrasadas` no Bloco
 * de atenção agora (ART_DIRECTION_GUIDE.md, Dashboard Sprint 2).
 */
export function calcularProximosPrazos(dados: {
  entregas: Entrega[];
  blocosBriefing: BlocoBriefing[];
  parceiras: Parceira[];
  hoje?: string;
  limite?: number;
}): ProximoPrazo[] {
  const hoje = dados.hoje ?? hojeISO();
  const limite = dados.limite ?? 5;
  const nomePorParceira = new Map(dados.parceiras.map((parceira) => [parceira.id, parceira.nome]));

  function diasRestantes(data: string): number {
    return Math.round((Date.parse(`${data}T00:00:00Z`) - Date.parse(`${hoje}T00:00:00Z`)) / 86_400_000);
  }

  const deEntregas: ProximoPrazo[] = dados.entregas
    .filter((entrega) => entrega.estado === "AGUARDANDO_MATERIAL" && entrega.dataEntrega >= hoje)
    .map((entrega) => ({
      tipo: "entrega" as const,
      parceiraNome: nomePorParceira.get(entrega.parceiraId) ?? "parceira",
      formato: entrega.formato,
      data: entrega.dataEntrega,
      diasRestantes: diasRestantes(entrega.dataEntrega),
    }));

  const deBriefings: ProximoPrazo[] = dados.blocosBriefing
    .filter((bloco) => bloco.dataPostagem >= hoje)
    .map((bloco) => ({
      tipo: "postagem" as const,
      parceiraNome: nomePorParceira.get(bloco.parceiraId) ?? "parceira",
      formato: bloco.formato,
      data: bloco.dataPostagem,
      diasRestantes: diasRestantes(bloco.dataPostagem),
    }));

  return [...deEntregas, ...deBriefings].sort((a, b) => a.data.localeCompare(b.data)).slice(0, limite);
}
```

- [ ] **Step 5: Rodar os testes e confirmar que passam**

Run: `npm --prefix portal-backend run test -- dashboard.service`
Expected: PASS em todos os testes de `calcularProximosPrazos` (os de `calcularIndicadores`
ainda vão falhar até a Task 2 — esperado neste ponto).

- [ ] **Step 6: Commit**

```bash
git add portal-backend/src/modules/dashboard/dashboard.types.ts portal-backend/src/modules/dashboard/dashboard.service.ts portal-backend/src/modules/dashboard/dashboard.service.test.ts
git commit -m "feat(portal-backend): calcularProximosPrazos (Dashboard Sprint 2, Bloco 2)"
```

---

### Task 2: Backend — ligar `proximosPrazos` a `calcularIndicadores`/`obterIndicadoresAdministrativos`

**Files:**
- Modify: `portal-backend/src/modules/dashboard/dashboard.service.ts`
- Test: `portal-backend/src/modules/dashboard/dashboard.service.test.ts`

**Interfaces:**
- Consumes: `calcularProximosPrazos` (Task 1), `briefingRepositorio.listarTodos(): Promise<BlocoBriefing[]>`
  (`portal-backend/src/modules/briefing/briefing.repository.ts`).
- Produces: `calcularIndicadores` agora aceita `blocosBriefing: BlocoBriefing[]` e retorna
  `proximosPrazos` preenchido; `obterIndicadoresAdministrativos()` inalterado na assinatura.

- [ ] **Step 1: Atualizar o teste "sem nenhum dado" para o campo novo (deve falhar primeiro)**

Em `portal-backend/src/modules/dashboard/dashboard.service.test.ts`, no objeto `semDados`,
adicionar a chave `blocosBriefing: [] as BlocoBriefing[]`:

```ts
const semDados = {
  parceiras: [] as Parceira[],
  entregas: [] as Entrega[],
  obrigacoes: [] as ObrigacaoFinanceira[],
  contasPendentes: [] as Identidade[],
  solicitacoesExclusao: [] as SolicitacaoExclusao[],
  blocosBriefing: [] as BlocoBriefing[],
};
```

E no teste `"sem nenhum dado, todos os indicadores são zero"`, acrescentar `proximosPrazos: []`
ao objeto esperado:

```ts
  it("sem nenhum dado, todos os indicadores são zero", () => {
    expect(calcularIndicadores(semDados)).toEqual({
      parceiras: { ativas: 0, inativas: 0, total: 0 },
      entregas: { aguardandoMaterial: 0, emRevisao: 0, atrasadas: 0 },
      financeiro: { pendentes: 0, valorPendente: 0 },
      lgpd: { solicitacoesExclusaoPendentes: 0 },
      moderacao: { contasPendentes: 0 },
      proximosPrazos: [],
    });
  });
```

- [ ] **Step 2: Rodar os testes e confirmar que o teste "sem nenhum dado" falha**

Run: `npm --prefix portal-backend run test -- dashboard.service`
Expected: FAIL nesse teste — `calcularIndicadores` ainda não aceita `blocosBriefing` nem
retorna `proximosPrazos` (erro de tipo ou `toEqual` sem a chave nova).

- [ ] **Step 3: Atualizar `calcularIndicadores` para aceitar `blocosBriefing` e retornar `proximosPrazos`**

Em `portal-backend/src/modules/dashboard/dashboard.service.ts`, alterar a assinatura de
`calcularIndicadores`:

```ts
export function calcularIndicadores(dados: {
  parceiras: Parceira[];
  entregas: Entrega[];
  obrigacoes: ObrigacaoFinanceira[];
  contasPendentes: Identidade[];
  solicitacoesExclusao: SolicitacaoExclusao[];
  blocosBriefing: BlocoBriefing[];
  hoje?: string;
}): IndicadoresAdministrativos {
```

E no `return`, acrescentar a última chave:

```ts
    moderacao: {
      contasPendentes: dados.contasPendentes.length,
    },
    proximosPrazos: calcularProximosPrazos({
      entregas: dados.entregas,
      blocosBriefing: dados.blocosBriefing,
      parceiras: dados.parceiras,
      hoje,
    }),
  };
}
```

- [ ] **Step 4: Rodar os testes e confirmar que passam**

Run: `npm --prefix portal-backend run test -- dashboard.service`
Expected: PASS — todos os testes de `dashboard.service.test.ts`.

- [ ] **Step 5: Ligar `briefingRepositorio` em `obterIndicadoresAdministrativos`**

Em `portal-backend/src/modules/dashboard/dashboard.service.ts`, adicionar o import:

```ts
import { briefingRepositorio } from "../briefing/briefing.repository.js";
```

E atualizar `obterIndicadoresAdministrativos`:

```ts
export async function obterIndicadoresAdministrativos(): Promise<IndicadoresAdministrativos> {
  const [parceiras, entregas, obrigacoes, contasPendentes, solicitacoesExclusao, blocosBriefing] = await Promise.all([
    parceiraRepositorio.listarTodas(),
    entregaRepositorio.listarTodas(),
    obrigacaoRepositorio.listarTodas(),
    listarContasPendentes(),
    listarSolicitacoesPendentes(),
    briefingRepositorio.listarTodos(),
  ]);

  return calcularIndicadores({ parceiras, entregas, obrigacoes, contasPendentes, solicitacoesExclusao, blocosBriefing });
}
```

- [ ] **Step 6: Rodar a suíte completa do backend e o typecheck**

Run: `npm --prefix portal-backend run test && npm --prefix portal-backend run typecheck && npm --prefix portal-backend run build`
Expected: todos os três comandos passam sem erro.

- [ ] **Step 7: Commit**

```bash
git add portal-backend/src/modules/dashboard/dashboard.service.ts portal-backend/src/modules/dashboard/dashboard.service.test.ts
git commit -m "feat(portal-backend): expõe proximosPrazos em GET /api/admin/dashboard"
```

---

### Task 3: Frontend — CSS do Dashboard editorial + helper de formatação

**Files:**
- Modify: `portal-frontend/src/index.css`
- Modify: `portal-frontend/src/lib/formatters.ts`

**Interfaces:**
- Produces: classes CSS `.dashboard-bloco`, `.dashboard-bloco.is-normalidade`,
  `.dashboard-acao-item` (+ `-label`, `-valor`, `-justificativa`, `.is-destaque`),
  `.dashboard-prazo-lista`, `.dashboard-prazo-item` (+ `-quando`), `.dashboard-normalidade`;
  e a função `formatarPrazoRelativo(diasRestantes: number): string` — usadas pela Task 4.

Sem passo de teste automatizado: `portal-frontend` não tem test runner configurado (nenhum
`"test"` em `package.json`, sem `vitest`/`@testing-library` instalado — confirmado por
inspeção, não presumido) e este plano não introduz um, por não ser necessário ao escopo desta
Sprint. A verificação deste Task é visual, feita junto da Task 4 (única com markup para
renderizar as classes).

- [ ] **Step 1: Adicionar `formatarPrazoRelativo` a `portal-frontend/src/lib/formatters.ts`**

Adicionar ao fim do arquivo:

```ts
/**
 * Bloco 2 do Dashboard editorial ("o que vem a seguir") — traduz a contagem de dias que o
 * backend já calculou (`ProximoPrazo.diasRestantes`) para a frase em português; o Portal não
 * recalcula a data, só formata.
 */
export function formatarPrazoRelativo(diasRestantes: number): string {
	if (diasRestantes <= 0) return "vence hoje";
	if (diasRestantes === 1) return "vence amanhã";
	return `vence em ${diasRestantes} dias`;
}
```

- [ ] **Step 2: Adicionar as regras CSS do Dashboard a `portal-frontend/src/index.css`**

Inserir logo após o bloco existente que termina em `.pendencias-group + .pendencias-group { margin-top: 32px; }`
(mesma seção de página/pendências, sem alterar nenhuma regra existente):

```css

/*
 * Dashboard editorial (Sprint 2, ART_DIRECTION_GUIDE.md): 3 blocos de peso decrescente.
 * Sem caixa/borda por item (§1 "sublinhar, não emoldurar") — ênfase é sublinhado no
 * hover/foco, nunca contorno. Sem grade simétrica (§2 anti-princípio).
 */
.dashboard-bloco.is-normalidade {
	margin-top: 56px;
}

.dashboard-acao-item {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	gap: 16px;
	padding: 10px 0;
	color: inherit;
	text-decoration: none;
}
.dashboard-acao-item-label {
	font-size: 15px;
}
.dashboard-acao-item:hover .dashboard-acao-item-label,
.dashboard-acao-item:focus-visible .dashboard-acao-item-label {
	text-decoration: underline;
	text-underline-offset: 4px;
}
.dashboard-acao-item-valor {
	font-family: var(--font-display);
	font-size: 22px;
	font-weight: 700;
	flex-shrink: 0;
}
.dashboard-acao-item.is-destaque .dashboard-acao-item-valor {
	color: var(--color-cherry);
}
.dashboard-acao-item-justificativa {
	display: block;
	margin-top: 2px;
	font-size: 13px;
	color: var(--color-grafite-70);
}

.dashboard-prazo-lista {
	display: flex;
	flex-direction: column;
	gap: 8px;
}
.dashboard-prazo-item {
	display: flex;
	justify-content: space-between;
	gap: 16px;
	font-size: 14px;
}
.dashboard-prazo-item-quando {
	flex-shrink: 0;
	color: var(--color-grafite-70);
	white-space: nowrap;
}
.dashboard-prazo-vazio {
	font-size: 14px;
	color: var(--color-grafite-70);
}

.dashboard-normalidade {
	max-width: 480px;
	margin-top: 8px;
	font-size: 15px;
	line-height: 1.7;
	color: var(--color-grafite-90);
}
```

- [ ] **Step 3: Confirmar que o build do frontend continua limpo (CSS ainda sem consumidor — só valida sintaxe)**

Run: `npm --prefix portal-frontend run build`
Expected: build passa sem erro (CSS solto, ainda não referenciado por nenhum componente).

- [ ] **Step 4: Commit**

```bash
git add portal-frontend/src/index.css portal-frontend/src/lib/formatters.ts
git commit -m "feat(portal-frontend): CSS e formatador do Dashboard editorial (Sprint 2)"
```

---

### Task 4: Frontend — reescrever `AdminDashboard.tsx`

**Files:**
- Modify: `portal-frontend/src/pages/AdminDashboard.tsx`

**Interfaces:**
- Consumes: `apiFetch`/`ApiError` (`../lib/api`), `formatadorMoeda`/`formatarPrazoRelativo`
  (`../lib/formatters`), `useSession` (`../lib/session`), `ProximoPrazo`/
  `IndicadoresAdministrativos` (declarados neste próprio arquivo, espelhando o contrato do
  backend — sem import cruzado entre `portal-frontend`/`portal-backend`, ver CLAUDE.md),
  classes CSS da Task 3.

- [ ] **Step 1: Substituir o conteúdo de `portal-frontend/src/pages/AdminDashboard.tsx`**

```tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError, apiFetch } from "../lib/api";
import { formatadorMoeda, formatarPrazoRelativo } from "../lib/formatters";
import { useSession } from "../lib/session";

interface ProximoPrazo {
	tipo: "entrega" | "postagem";
	parceiraNome: string;
	formato: string;
	data: string;
	diasRestantes: number;
}

interface IndicadoresAdministrativos {
	parceiras: { ativas: number; inativas: number; total: number };
	entregas: { aguardandoMaterial: number; emRevisao: number; atrasadas: number };
	financeiro: { pendentes: number; valorPendente: number };
	lgpd: { solicitacoesExclusaoPendentes: number };
	moderacao: { contasPendentes: number };
	proximosPrazos: ProximoPrazo[];
}

interface ItemAtencao {
	label: string;
	valor: number;
	href: string;
	destaque?: boolean;
	justificativa?: string;
}

function ItemDeAtencao({ item }: { item: ItemAtencao }) {
	return (
		<Link
			to={item.href}
			className={`dashboard-acao-item${item.destaque ? " is-destaque" : ""}`}
			aria-label={`${item.label}: ${item.valor}. ver lista.`}
		>
			<span className="dashboard-acao-item-label">
				{item.label}
				{item.justificativa && (
					<span className="dashboard-acao-item-justificativa">{item.justificativa}</span>
				)}
			</span>
			<span className="dashboard-acao-item-valor">{item.valor}</span>
		</Link>
	);
}

function fraseDeNormalidade(indicadores: IndicadoresAdministrativos): string {
	const entregasNoPrazo = indicadores.entregas.aguardandoMaterial - indicadores.entregas.atrasadas;
	const partes: string[] = [
		indicadores.parceiras.ativas === 1
			? "1 parceira segue ativa"
			: `${indicadores.parceiras.ativas} parceiras seguem ativas`,
	];

	if (entregasNoPrazo > 0) {
		partes.push(
			entregasNoPrazo === 1
				? "1 entrega aguarda material dentro do prazo"
				: `${entregasNoPrazo} entregas aguardam material dentro do prazo`,
		);
	}

	if (indicadores.financeiro.pendentes > 0) {
		partes.push(`${formatadorMoeda.format(indicadores.financeiro.valorPendente)} em pagamentos pendentes`);
	}

	return `o restante está dentro do esperado: ${partes.join("; ")}.`;
}

export function AdminDashboardPage() {
	const { sessao } = useSession();
	const [indicadores, setIndicadores] = useState<IndicadoresAdministrativos | null>(
		null,
	);
	const [erro, setErro] = useState<string | null>(null);
	const [carregando, setCarregando] = useState(true);

	useEffect(() => {
		let ativo = true;
		setCarregando(true);
		setErro(null);

		apiFetch<IndicadoresAdministrativos>("/api/admin/dashboard")
			.then((dados) => ativo && setIndicadores(dados))
			.catch((erroCapturado) => {
				if (!ativo) return;
				setErro(
					erroCapturado instanceof ApiError
						? erroCapturado.message
						: "não foi possível carregar o painel.",
				);
			})
			.finally(() => ativo && setCarregando(false));

		return () => {
			ativo = false;
		};
	}, []);

	if (sessao?.papelAtor !== "ADMINISTRADOR") {
		return (
			<section className="portal-page">
				<p className="portal-page-feedback">área restrita a administradores.</p>
			</section>
		);
	}

	const itensAtencao: ItemAtencao[] = indicadores
		? [
				indicadores.entregas.atrasadas > 0 && {
					label: "materiais atrasados",
					valor: indicadores.entregas.atrasadas,
					href: "/admin/entregas",
					destaque: true,
					justificativa: "já passaram da data prevista",
				},
				indicadores.entregas.emRevisao > 0 && {
					label: "aprovações aguardando",
					valor: indicadores.entregas.emRevisao,
					href: "/admin/entregas",
				},
				indicadores.moderacao.contasPendentes > 0 && {
					label: "cadastros para moderar",
					valor: indicadores.moderacao.contasPendentes,
					href: "/admin",
				},
				indicadores.lgpd.solicitacoesExclusaoPendentes > 0 && {
					label: "solicitações lgpd pendentes",
					valor: indicadores.lgpd.solicitacoesExclusaoPendentes,
					href: "/admin",
				},
			].filter((item): item is ItemAtencao => item !== false)
		: [];

	return (
		<section className="portal-page is-admin-wide">
			<p className="portal-eyebrow">administração</p>
			<h1 className="title-editorial portal-page-title">
				painel administrativo
			</h1>
			<p className="portal-page-intro">
				onde você precisa agir agora, num só lugar.
			</p>

			{carregando && <p className="portal-page-feedback">carregando...</p>}
			{!carregando && erro && (
				<p className="portal-page-feedback is-error">{erro}</p>
			)}

			{!carregando && !erro && indicadores && (
				<>
					<div className="dashboard-bloco is-atencao">
						<p className="pendencias-summary">
							{itensAtencao.length === 0
								? "nada pendente de ação agora"
								: `requer sua ação (${itensAtencao.length})`}
						</p>
						{itensAtencao.map((item) => (
							<ItemDeAtencao key={item.label} item={item} />
						))}
					</div>

					<div className="portal-section-divider dashboard-bloco">
						<p className="pendencias-summary is-quiet">próximos prazos</p>
						{indicadores.proximosPrazos.length === 0 ? (
							<p className="dashboard-prazo-vazio">nada previsto para os próximos dias.</p>
						) : (
							<ul className="dashboard-prazo-lista">
								{indicadores.proximosPrazos.map((prazo) => (
									<li
										key={`${prazo.tipo}-${prazo.parceiraNome}-${prazo.data}`}
										className="dashboard-prazo-item"
									>
										<span>
											{prazo.tipo === "entrega" ? "entrega" : "postagem"} de {prazo.parceiraNome}
										</span>
										<span className="dashboard-prazo-item-quando">
											{formatarPrazoRelativo(prazo.diasRestantes)}
										</span>
									</li>
								))}
							</ul>
						)}
					</div>

					<div className="dashboard-bloco is-normalidade">
						<p className="dashboard-normalidade">{fraseDeNormalidade(indicadores)}</p>
					</div>
				</>
			)}
		</section>
	);
}
```

- [ ] **Step 2: Rodar build e lint do frontend**

Run: `npm --prefix portal-frontend run build && npm --prefix portal-frontend run lint`
Expected: ambos passam sem erro novo (os 3 warnings pré-existentes de `session.tsx`/
`pageHeader.tsx` não são deste arquivo e não devem aumentar).

- [ ] **Step 3: Commit**

```bash
git add portal-frontend/src/pages/AdminDashboard.tsx
git commit -m "feat(portal-frontend): Dashboard editorial de 3 blocos (Sprint 2)"
```

---

### Task 5: Validação final, auditoria de conformidade e QA visual

**Files:** nenhum arquivo novo — só validação e, se a auditoria achar desvio, correções
pontuais nos arquivos já tocados nas Tasks 1–4.

- [ ] **Step 1: Rodar a suíte completa dos três projetos**

Run:
```bash
npm --prefix portal-backend run test
npm --prefix portal-backend run typecheck
npm --prefix portal-backend run build
npm --prefix portal-frontend run build
npm --prefix portal-frontend run lint
```
Expected: todos passam sem erro.

- [ ] **Step 2: QA visual no navegador**

Usar a skill `/run` deste projeto (ou, na ausência de uma skill dedicada, `npm --prefix
portal-backend run dev` + `npm --prefix portal-frontend run dev`) para abrir
`/admin/dashboard` autenticado como Administrador. Verificar nos 3 cenários de dados
possíveis (usar `db:seed` ou dados existentes; não é preciso criar cenário sintético novo
além do que o seed já cobrir):
- Bloco 1 com itens reais → linhas aparecem só para categorias com valor > 0, "materiais
  atrasados" em cherry com a justificativa visível, clique navega para `/admin/entregas`.
- Bloco 2 populado → prazos em ordem crescente de proximidade.
- Bloco 3 → frase de normalidade, sem números soltos nem lista.
- Estado de carregamento (recarregar a página) → "carregando..." antes do conteúdo.

- [ ] **Step 3: Auditoria de conformidade com `ART_DIRECTION_GUIDE.md` §6**

Percorrer a checklist do guia (§6) contra a tela renderizada e registrar o resultado (todas
devem estar alinhadas antes de seguir):
- [ ] Não parece dashboard genérico de SaaS.
- [ ] Conteúdo (frase de estado) vem antes de qualquer número.
- [ ] Cor (cherry) só em "materiais atrasados", sempre com frase ao lado.
- [ ] Nenhum elemento emoldurado por caixa — ênfase é sublinhado.
- [ ] Hierarquia por peso/posição, não por tamanho de fonte ou cor.
- [ ] Cada linha existe porque tem conteúdo real (itens com valor 0 não aparecem).
- [ ] Ordem dos blocos é fixa (atenção → a seguir → pode esperar) em toda visita.
- [ ] Título em minúsculas.
- [ ] Densidade elástica: Bloco 1 compacto-mas-generoso, Bloco 2 denso, Bloco 3 o mais
      espaçoso.
- [ ] A tela seria reconhecível como DODÔ sem o logotipo.

- [ ] **Step 4: Commit final (se a auditoria do Step 3 exigir ajuste) e abrir PR draft**

Se o Step 3 não exigir nenhuma correção, não há commit novo neste Step. Caso exija, commitar
a correção pontual normalmente antes de abrir o PR.

```bash
git push -u origin feat/portal-dashboard-sprint2
gh pr create --draft --title "feat(portal-frontend): Dashboard editorial (Sprint 2)" --body "$(cat <<'EOF'
## Contexto
Sprint 2 do redesign do Portal (ver docs/superpowers/specs/2026-08-02-dashboard-editorial-design.md).
Substitui o Dashboard de KPIs em grade por 3 blocos editoriais: precisa de atenção agora /
o que vem a seguir / o que pode esperar — sobre a fundação da Sprint 1 (Shell).

## PR #2 (feat/admin-dashboard-v2)
Superseded — construído antes do ART_DIRECTION_GUIDE.md e do Shell da Sprint 1. Auditoria
crítica na spec: navegação clicável e aria-label preservados; Card do shadcn e grade
simétrica descartados por contradizerem o guia vigente.

## Escopo
- portal-backend: novo campo `proximosPrazos` em GET /api/admin/dashboard (aditivo, sem
  mudança de schema/entidade).
- portal-frontend: AdminDashboard.tsx reescrito, CSS nova apenas para esta página.
- Fora de escopo (decisão registrada na spec): seção "o que mudou recentemente" — sem audit
  log persistente no backend para sustentá-la.

## Test plan
- [x] `npm --prefix portal-backend run test`
- [x] `npm --prefix portal-backend run typecheck && npm run build`
- [x] `npm --prefix portal-frontend run build && npm run lint`
- [x] QA visual manual (ver Task 5 do plano)
- [x] Auditoria de conformidade ART_DIRECTION_GUIDE.md §6

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Self-Review

**Cobertura da spec:** narrativa de 3 blocos (Task 4), única divisória (Task 4 markup — só
o `<div className="portal-section-divider">` entre Bloco 1 e 2), densidade decrescente
(CSS da Task 3), estados vazio/carregado por bloco (Task 4), Bloco 3 como confirmação e não
inventário (função `fraseDeNormalidade`, Task 4), evolução aditiva de backend só para Bloco 2
(Tasks 1–2), nada de "mudou recentemente"/shadcn/Tailwind (não aparecem em nenhuma task).

**Tipos:** `ProximoPrazo` definido igual nos dois lados (backend `dashboard.types.ts`,
frontend `AdminDashboard.tsx`) — sem import cruzado, por design do repositório.
`calcularIndicadores` (Task 2) e `calcularProximosPrazos` (Task 1) usam os mesmos nomes de
campo (`entregas`, `blocosBriefing`, `parceiras`, `hoje`) em toda parte.

**Sem placeholders:** todo Step tem código completo; nenhum "adicionar tratamento de erro"
genérico — o tratamento de erro já existente (`ApiError`/`erro`) é reaproveitado sem
modificação, por já cobrir o caso.
