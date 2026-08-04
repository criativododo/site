import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tempDirectory, git, initGitRepository, writeGlobalGitConfig } from './helpers.mjs';

const repositoryRoot = process.cwd();
const cli = join(repositoryRoot, '.claude/session-memory/bin/session-memory.mjs');

function runCli(app, args, environment) {
  return execFileSync(process.execPath, [cli, ...args], { cwd: app, env: environment, encoding: 'utf8' });
}

test('inicia, gera journal, valida e publica em um remoto Git local', () => {
  const fixture = tempDirectory();
  try {
    const app = join(fixture, 'app');
    const remote = join(fixture, 'memory-remote.git');
    initGitRepository(app);
    git(fixture, ['init', '--bare', 'memory-remote.git']);
    mkdirSync(join(app, '.claude/session-memory'), { recursive: true });
    writeFileSync(join(app, '.claude/session-memory/config.json'), JSON.stringify({
      schemaVersion: 1,
      memoryRepositoryUrl: remote,
      memoryDirectory: 'memory',
      journalWindow: 5,
      checks: {},
    }));
    const environment = {
      ...process.env,
      GIT_CONFIG_GLOBAL: writeGlobalGitConfig(fixture),
      CRIATIVODODO_MEMORY_DIR: join(fixture, 'memory'),
    };
    const initial = JSON.parse(runCli(app, ['inicio', '--session', 'fixture', '--objective', 'Validar fluxo'], environment));
    // Bootstrap com zero journals: PROJECT_STATUS.md é gerado (ADR-021, Fase 2), não
    // mais escrito à mão — estado vazio determinístico, não um valor hardcoded.
    assert.equal(initial.executiveSummary.phase, 'Nenhuma sessão registrada ainda.');
    const detailsFile = join(app, '.claude/session-memory/runtime/fixture.details.json');
    writeFileSync(detailsFile, JSON.stringify({
      phase: 'Fase 4 — Armazenamento + Workspace Provisioning',
      sprint: 'Não formalizada',
      status: 'Parcial',
      context: 'Teste de integração.',
      workPerformed: ['Validou o fluxo.'],
      decisions: [],
      adrsAffected: ['ADR-017 — OAuth dedicado do Google Drive'],
      problems: [],
      blockers: ['Bloqueio de teste.'],
      nextTask: 'Continuar o teste.',
      statusSummary: 'Resumo de teste da integração.',
      observations: [],
      confidence: { level: 'Alta', reason: 'Fixture Git local.' },
    }));
    const finished = JSON.parse(runCli(app, ['finish', '--session', 'fixture', '--details-file', '.claude/session-memory/runtime/fixture.details.json'], environment));
    // Fase 3: nome do journal inclui um sufixo derivado do session id, garantindo
    // unicidade entre worktrees concorrentes sem depender de checagem local de existência.
    assert.match(finished.journal, /^journals\/\d{4}\/\d{2}\/\d{4}-\d{2}-\d{2}_\d{4}--\w+\.md$/);
    const published = JSON.parse(runCli(app, ['publish', '--session', 'fixture'], environment));
    assert.equal(published.published, true);
    // Fase 3: o worktree efêmero da sessão é removido depois da publicação bem-sucedida.
    assert.equal(existsSync(join(app, '.claude/session-memory/runtime/memory-worktrees/fixture')), false);
    const validation = JSON.parse(runCli(app, ['validate'], environment));
    assert.equal(validation.valid, true, validation.errors?.join('\n'));
    assert.equal(existsSync(join(fixture, 'memory', finished.journal)), true);
    // Depois de /fim, PROJECT_STATUS.md foi regenerado inteiramente a partir do journal
    // recém-criado (fonte única de verdade) — confirma o critério 3 da Fase 2.
    const afterFinish = JSON.parse(runCli(app, ['status'], environment));
    assert.equal(afterFinish.phase, 'Fase 4 — Armazenamento + Workspace Provisioning');
    assert.equal(afterFinish.nextTask, 'Continuar o teste.');
    assert.deepEqual(afterFinish.blockers, ['Bloqueio de teste.']);
    assert.equal(afterFinish.lastAdr, 'ADR-017');
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

test('checkout principal e git worktree resolvem para o mesmo repositório de memória, sem CRIATIVODODO_MEMORY_DIR explícito (ADR-021, Fase 1)', () => {
  const fixture = tempDirectory();
  try {
    const mainCheckout = join(fixture, 'checkout-principal', 'app');
    const worktreeApp = join(fixture, 'algum-outro-caminho', 'worktrees', 'sessao-y', 'app');
    const fakeHome = join(fixture, 'fake-home');
    const remote = join(fixture, 'memory-remote.git');
    mkdirSync(fakeHome, { recursive: true });
    initGitRepository(mainCheckout);
    initGitRepository(worktreeApp);
    git(fixture, ['init', '--bare', 'memory-remote.git']);
    const config = JSON.stringify({
      schemaVersion: 1,
      memoryRepositoryUrl: remote,
      memoryDirectory: 'criativododo-memory-teste',
      journalWindow: 5,
      checks: {},
    });
    for (const app of [mainCheckout, worktreeApp]) {
      mkdirSync(join(app, '.claude/session-memory'), { recursive: true });
      writeFileSync(join(app, '.claude/session-memory/config.json'), config);
    }
    const environment = {
      ...process.env,
      GIT_CONFIG_GLOBAL: writeGlobalGitConfig(fixture),
      HOME: fakeHome,
    };
    delete environment.CRIATIVODODO_MEMORY_DIR;

    const fromMain = JSON.parse(runCli(mainCheckout, ['inicio', '--session', 'sessao-principal', '--objective', 'Sessão a partir do checkout principal'], environment));
    assert.equal(fromMain.initializedMemory, true);
    const expectedMemoryPath = join(fakeHome, 'criativododo-memory-teste');
    assert.equal(existsSync(join(expectedMemoryPath, '.git')), true);
    assert.equal(existsSync(join(mainCheckout, '..', 'criativododo-memory-teste')), false);

    const fromWorktree = JSON.parse(runCli(worktreeApp, ['inicio', '--session', 'sessao-worktree', '--objective', 'Sessão a partir de um git worktree'], environment));
    assert.equal(fromWorktree.initializedMemory, false);
    assert.equal(existsSync(join(worktreeApp, '..', 'criativododo-memory-teste')), false);
    assert.equal(fromWorktree.executiveSummary.phase, fromMain.executiveSummary.phase);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});
