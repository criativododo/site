import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tempDirectory, git, initGitRepository, writeGlobalGitConfig } from './helpers.mjs';

const repositoryRoot = process.cwd();
const cli = join(repositoryRoot, '.claude/session-memory/bin/session-memory.mjs');
const runCli = (app, args, environment, input) => execFileSync(process.execPath, [cli, ...args], { cwd: app, env: environment, input, encoding: 'utf8' });

function setupFixture(fixture) {
  const app = join(fixture, 'app'); const remote = join(fixture, 'memory-remote.git');
  initGitRepository(app); git(fixture, ['init', '--bare', 'memory-remote.git']); mkdirSync(join(app, '.claude/session-memory'), { recursive: true });
  writeFileSync(join(app, '.claude/session-memory/config.json'), JSON.stringify({ schemaVersion: 1, memoryRepositoryUrl: remote, memoryDirectory: 'memory', journalWindow: 5, checks: {} }));
  return { app, remote, memory: join(fixture, 'memory'), environment: { ...process.env, GIT_CONFIG_GLOBAL: writeGlobalGitConfig(fixture), CRIATIVODODO_MEMORY_DIR: join(fixture, 'memory') } };
}

function detailsJson() {
  return JSON.stringify({ objective: 'Validar fluxo V2', phase: 'Fase 4 — Armazenamento + Workspace Provisioning', sprint: 'Não formalizada', status: 'Parcial', context: 'Teste de integração.', workPerformed: ['Validou o fluxo V2.'], decisions: [], adrsAffected: ['ADR-017 — OAuth dedicado do Google Drive'], problems: [], blockers: ['Bloqueio de teste.'], nextTask: 'Continuar o teste.', statusSummary: 'Resumo de teste da integração.', observations: [], confidence: { level: 'Alta', reason: 'Fixture Git local.' } });
}

test('V2-001/V2-003 — /inicio não requer objetivo e /fim executa journal, commit, push e limpeza em uma transação', () => {
  const fixture = tempDirectory();
  try {
    const { app, memory, environment } = setupFixture(fixture);
    const initial = JSON.parse(runCli(app, ['inicio'], environment));
    assert.equal(initial.executiveSummary.phase, 'Nenhuma sessão registrada ainda.');
    assert.equal('session' in initial, false, 'V2 não expõe Session ID artificial');
    const completed = JSON.parse(runCli(app, ['fim', '--details-stdin'], environment, detailsJson()));
    assert.equal(completed.published, true); assert.match(completed.journal, /^journals\/\d{4}\/\d{2}\/\d{4}-\d{2}-\d{2}_\d{4}--\w+\.md$/);
    assert.equal(existsSync(join(app, '.claude/session-memory/runtime')), false, 'V2 não cria runtime persistente');
    assert.equal(existsSync(join(app, '.claude/session-memory/fim-details.json')), false, '/fim não deixa detalhes temporários no checkout');
    const validation = JSON.parse(runCli(app, ['validate'], environment)); assert.equal(validation.valid, true, validation.errors?.join('\n'));
    assert.equal(existsSync(join(memory, completed.journal)), true);
    const status = JSON.parse(runCli(app, ['status'], environment)); assert.equal(status.phase, 'Fase 4 — Armazenamento + Workspace Provisioning'); assert.equal(status.nextTask, 'Continuar o teste.');
  } finally { rmSync(fixture, { recursive: true, force: true }); }
});

test('V2-006 — arquivos runtime V1 são ignorados e não controlam a recuperação', () => {
  const fixture = tempDirectory();
  try {
    const { app, environment } = setupFixture(fixture);
    mkdirSync(join(app, '.claude/session-memory/runtime'), { recursive: true });
    writeFileSync(join(app, '.claude/session-memory/runtime/legacy.json'), '{"id":"legacy","objective":"não usar"}');
    const initial = JSON.parse(runCli(app, ['inicio'], environment));
    assert.equal(initial.executiveSummary.phase, 'Nenhuma sessão registrada ainda.');
    assert.equal(existsSync(join(app, '.claude/session-memory/runtime/legacy.json')), true, 'compatibilidade: legado não é destruído');
  } finally { rmSync(fixture, { recursive: true, force: true }); }
});

test('checkout principal e git worktree resolvem para o mesmo repositório de memória, sem CRIATIVODODO_MEMORY_DIR explícito', () => {
  const fixture = tempDirectory();
  try {
    const mainCheckout = join(fixture, 'checkout-principal', 'app'); const worktreeApp = join(fixture, 'algum-outro-caminho', 'worktrees', 'sessao-y', 'app'); const fakeHome = join(fixture, 'fake-home'); const remote = join(fixture, 'memory-remote.git');
    mkdirSync(fakeHome, { recursive: true }); initGitRepository(mainCheckout); initGitRepository(worktreeApp); git(fixture, ['init', '--bare', 'memory-remote.git']);
    const config = JSON.stringify({ schemaVersion: 1, memoryRepositoryUrl: remote, memoryDirectory: 'criativododo-memory-teste', journalWindow: 5, checks: {} });
    for (const app of [mainCheckout, worktreeApp]) { mkdirSync(join(app, '.claude/session-memory'), { recursive: true }); writeFileSync(join(app, '.claude/session-memory/config.json'), config); }
    const environment = { ...process.env, GIT_CONFIG_GLOBAL: writeGlobalGitConfig(fixture), HOME: fakeHome }; delete environment.CRIATIVODODO_MEMORY_DIR;
    const fromMain = JSON.parse(runCli(mainCheckout, ['inicio'], environment)); const expectedMemoryPath = join(fakeHome, 'criativododo-memory-teste'); assert.equal(fromMain.initializedMemory, true); assert.equal(existsSync(join(expectedMemoryPath, '.git')), true);
    const fromWorktree = JSON.parse(runCli(worktreeApp, ['inicio'], environment)); assert.equal(fromWorktree.initializedMemory, false); assert.equal(fromWorktree.executiveSummary.phase, fromMain.executiveSummary.phase);
  } finally { rmSync(fixture, { recursive: true, force: true }); }
});
