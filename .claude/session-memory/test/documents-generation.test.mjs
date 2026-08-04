import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tempDirectory } from './helpers.mjs';
import {
  deriveState,
  listJournals,
  regenerateProjectDocs,
  renderIndexFromJournals,
  renderNextFromJournals,
  renderStatusFromJournals,
  withMarker,
} from '../lib/documents.mjs';

function fakeJournal(relativePath, meta) {
  return { filePath: relativePath, relativePath, content: '', meta };
}

function writeJournalFile(memoryPath, relativeName, meta) {
  const filePath = join(memoryPath, 'journals', relativeName);
  mkdirSync(join(filePath, '..'), { recursive: true });
  const content = [`# Journal — ${meta.objective}`, '', withMarker('', meta).trimEnd(), ''].join('\n');
  writeFileSync(filePath, content, 'utf8');
  return filePath;
}

// 1. Geração inicial ---------------------------------------------------------

test('Fase 2 — geração inicial: zero journals produz estado vazio determinístico', () => {
  const state = deriveState([]);
  assert.equal(state.phase, 'Nenhuma sessão registrada ainda.');
  assert.equal(state.sprint, 'Não formalizada');
  assert.equal(state.lastJournal, null);
  assert.equal(state.lastCommit, null);
  assert.equal(state.lastAdr, null);
  assert.deepEqual(state.blockers, []);
  assert.equal(state.summary, 'Nenhuma sessão registrada ainda.');

  const index = renderIndexFromJournals([]);
  assert.match(index, /Nenhum journal registrado/);
  const status = renderStatusFromJournals([]);
  assert.match(status, /Nenhuma sessão registrada ainda\./);
  const next = renderNextFromJournals([]);
  assert.match(next, /Nenhuma sessão registrada ainda\./);
});

// 2. Múltiplos journals -------------------------------------------------------

test('Fase 2 — múltiplos journals: estado deriva sempre do journal de endedAt mais recente', () => {
  const older = fakeJournal('journals/2026/07/a.md', {
    endedAt: '2026-07-01T10:00:00.000Z', phase: 'Fase A', sprint: 'S1',
    blockers: ['bloqueio antigo'], nextTask: 'tarefa antiga', source: { head: 'aaa1111' },
  });
  const newer = fakeJournal('journals/2026/08/b.md', {
    endedAt: '2026-08-01T10:00:00.000Z', phase: 'Fase B', sprint: 'S2',
    blockers: [], nextTask: 'tarefa nova', source: { head: 'bbb2222' },
  });
  const state = deriveState([older, newer]);
  assert.equal(state.phase, 'Fase B');
  assert.equal(state.sprint, 'S2');
  assert.equal(state.nextTask, 'tarefa nova');
  assert.deepEqual(state.blockers, []);
  assert.equal(state.lastJournal, 'journals/2026/08/b.md');
  assert.equal(state.lastCommit, 'bbb2222');

  // ordem de entrada não deve importar
  const stateReversed = deriveState([newer, older]);
  assert.deepEqual(state, stateReversed);
});

test('Fase 2 — carry-forward: lastAdr e summary usam o journal mais recente que os declara, não necessariamente o último', () => {
  const withAdr = fakeJournal('journals/2026/07/a.md', {
    endedAt: '2026-07-01T10:00:00.000Z', phase: 'Fase A', sprint: 'S1',
    adrsAffected: ['ADR-018 — Memória operacional'], summary: 'Resumo antigo.', source: { head: 'aaa1111' },
  });
  const withoutAdr = fakeJournal('journals/2026/08/b.md', {
    endedAt: '2026-08-01T10:00:00.000Z', phase: 'Fase B', sprint: 'S2',
    adrsAffected: [], summary: null, source: { head: 'bbb2222' },
  });
  const state = deriveState([withAdr, withoutAdr]);
  assert.equal(state.phase, 'Fase B');
  assert.equal(state.lastAdr, 'ADR-018');
  assert.equal(state.summary, 'Resumo antigo.');
});

// 3. Ordenação cronológica ----------------------------------------------------

test('Fase 2 — ordenação cronológica: índice sempre em ordem decrescente de endedAt, independente da ordem de entrada', () => {
  const a = fakeJournal('journals/2026/07/a.md', { endedAt: '2026-07-01T10:00:00.000Z', objective: 'A', phase: 'F', sprint: 'S', source: {} });
  const b = fakeJournal('journals/2026/08/b.md', { endedAt: '2026-08-01T10:00:00.000Z', objective: 'B', phase: 'F', sprint: 'S', source: {} });
  const c = fakeJournal('journals/2026/06/c.md', { endedAt: '2026-06-01T10:00:00.000Z', objective: 'C', phase: 'F', sprint: 'S', source: {} });

  const order1 = renderIndexFromJournals([a, b, c]);
  const order2 = renderIndexFromJournals([c, a, b]);
  const order3 = renderIndexFromJournals([b, c, a]);
  assert.equal(order1, order2);
  assert.equal(order2, order3);

  const indexB = order1.indexOf('[B]');
  const indexA = order1.indexOf('[A]');
  const indexC = order1.indexOf('[C]');
  assert.ok(indexB < indexA && indexA < indexC, 'esperado B (ago) antes de A (jul) antes de C (jun)');
});

// 4. Empate de timestamps ------------------------------------------------------

test('Fase 2 — empate de timestamps: desempate determinístico por relativePath, independente da ordem de entrada', () => {
  const tie1 = fakeJournal('journals/2026/08/2026-08-01_1000.md', { endedAt: '2026-08-01T13:00:00.000Z', objective: 'Primeiro', phase: 'F', sprint: 'S', source: {} });
  const tie2 = fakeJournal('journals/2026/08/2026-08-01_1000-02.md', { endedAt: '2026-08-01T13:00:00.000Z', objective: 'Segundo', phase: 'F', sprint: 'S', source: {} });

  const orderA = renderIndexFromJournals([tie1, tie2]);
  const orderB = renderIndexFromJournals([tie2, tie1]);
  assert.equal(orderA, orderB, 'mesmo endedAt: resultado não pode depender da ordem de entrada');
  // desempate por relativePath.localeCompare ascendente — não pela ordem de entrada
  const expectedFirst = tie1.relativePath.localeCompare(tie2.relativePath) <= 0 ? 'Primeiro' : 'Segundo';
  const expectedSecond = expectedFirst === 'Primeiro' ? 'Segundo' : 'Primeiro';
  assert.ok(
    orderA.indexOf(`[${expectedFirst}]`) < orderA.indexOf(`[${expectedSecond}]`),
    `desempate deve seguir localeCompare(relativePath) — esperado [${expectedFirst}] antes de [${expectedSecond}]`,
  );
});

// 5. Regeneração completa -------------------------------------------------------

test('Fase 2 — regeneração completa: cada chamada reescreve os três arquivos do zero, sem herdar conteúdo manual anterior', () => {
  const dir = tempDirectory();
  try {
    mkdirSync(join(dir, 'project'), { recursive: true });
    mkdirSync(join(dir, 'journals'), { recursive: true });
    writeFileSync(join(dir, 'project/PROJECT_STATUS.md'), 'LIXO MANUAL QUE NÃO DEVE SOBREVIVER À REGENERAÇÃO');
    writeFileSync(join(dir, 'journals/INDEX.md'), 'LIXO MANUAL NO ÍNDICE');
    writeJournalFile(dir, '2026/08/2026-08-01_1000.md', {
      endedAt: '2026-08-01T10:00:00.000Z', objective: 'Sessão real', phase: 'Fase Teste', sprint: 'S1',
      blockers: [], nextTask: 'Próxima tarefa real', source: { head: 'cafe123' },
    });
    regenerateProjectDocs(dir);
    const status = readFileSync(join(dir, 'project/PROJECT_STATUS.md'), 'utf8');
    const index = readFileSync(join(dir, 'journals/INDEX.md'), 'utf8');
    assert.equal(status.includes('LIXO MANUAL'), false);
    assert.equal(index.includes('LIXO MANUAL'), false);
    assert.match(status, /Fase Teste/);
    assert.match(index, /Sessão real/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// 6. Idempotência ---------------------------------------------------------------

test('Fase 2 — idempotência: regenerar duas vezes seguidas com os mesmos journals produz arquivos byte-idênticos', () => {
  const dir = tempDirectory();
  try {
    mkdirSync(join(dir, 'project'), { recursive: true });
    mkdirSync(join(dir, 'journals'), { recursive: true });
    writeJournalFile(dir, '2026/08/2026-08-01_1000.md', {
      endedAt: '2026-08-01T10:00:00.000Z', objective: 'Sessão A', phase: 'Fase X', sprint: 'S1',
      blockers: ['bloqueio'], nextTask: 'tarefa', adrsAffected: ['ADR-021 — teste'], summary: 'resumo', source: { head: 'aaaa111' },
    });
    writeJournalFile(dir, '2026/08/2026-08-02_1100.md', {
      endedAt: '2026-08-02T11:00:00.000Z', objective: 'Sessão B', phase: 'Fase Y', sprint: 'S2',
      blockers: [], nextTask: 'próxima', source: { head: 'bbbb222' },
    });

    regenerateProjectDocs(dir);
    const firstStatus = readFileSync(join(dir, 'project/PROJECT_STATUS.md'), 'utf8');
    const firstNext = readFileSync(join(dir, 'project/START_HERE_NEXT_SESSION.md'), 'utf8');
    const firstIndex = readFileSync(join(dir, 'journals/INDEX.md'), 'utf8');

    regenerateProjectDocs(dir);
    const secondStatus = readFileSync(join(dir, 'project/PROJECT_STATUS.md'), 'utf8');
    const secondNext = readFileSync(join(dir, 'project/START_HERE_NEXT_SESSION.md'), 'utf8');
    const secondIndex = readFileSync(join(dir, 'journals/INDEX.md'), 'utf8');

    assert.equal(firstStatus, secondStatus);
    assert.equal(firstNext, secondNext);
    assert.equal(firstIndex, secondIndex);

    // idempotência também via o mesmo array de journals lido de duas chamadas de listJournals
    const journalsA = listJournals(dir);
    const journalsB = listJournals(dir);
    assert.equal(renderStatusFromJournals(journalsA), renderStatusFromJournals(journalsB));
    assert.equal(renderIndexFromJournals(journalsA), renderIndexFromJournals(journalsB));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('Fase 2 — determinismo: dois conjuntos idênticos de journals (ordens de entrada diferentes) produzem arquivos exatamente iguais', () => {
  const j1 = fakeJournal('journals/2026/08/a.md', { endedAt: '2026-08-01T10:00:00.000Z', objective: 'A', phase: 'Fase 1', sprint: 'S1', blockers: ['x'], nextTask: 'y', source: { head: 'aaa' } });
  const j2 = fakeJournal('journals/2026/08/b.md', { endedAt: '2026-08-02T10:00:00.000Z', objective: 'B', phase: 'Fase 2', sprint: 'S2', blockers: [], nextTask: 'z', source: { head: 'bbb' } });
  const j3 = fakeJournal('journals/2026/08/c.md', { endedAt: '2026-08-03T10:00:00.000Z', objective: 'C', phase: 'Fase 3', sprint: 'S3', blockers: [], nextTask: 'w', source: { head: 'ccc' } });

  const permutations = [[j1, j2, j3], [j3, j2, j1], [j2, j1, j3], [j2, j3, j1]];
  const statusOutputs = permutations.map((set) => renderStatusFromJournals(set));
  const nextOutputs = permutations.map((set) => renderNextFromJournals(set));
  const indexOutputs = permutations.map((set) => renderIndexFromJournals(set));

  assert.equal(new Set(statusOutputs).size, 1);
  assert.equal(new Set(nextOutputs).size, 1);
  assert.equal(new Set(indexOutputs).size, 1);
});
