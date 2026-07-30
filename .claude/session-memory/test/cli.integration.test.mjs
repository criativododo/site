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
      memoryDirectory: '../memory',
      journalWindow: 5,
      checks: {},
    }));
    const environment = { ...process.env, GIT_CONFIG_GLOBAL: writeGlobalGitConfig(fixture) };
    const initial = JSON.parse(runCli(app, ['inicio', '--session', 'fixture', '--objective', 'Validar fluxo'], environment));
    assert.equal(initial.executiveSummary.phase, 'Fase 4 — Armazenamento + Workspace Provisioning');
    const detailsFile = join(app, '.claude/session-memory/runtime/fixture.details.json');
    writeFileSync(detailsFile, JSON.stringify({
      phase: 'Fase 4 — Armazenamento + Workspace Provisioning',
      sprint: 'Não formalizada',
      status: 'Parcial',
      context: 'Teste de integração.',
      workPerformed: ['Validou o fluxo.'],
      decisions: [],
      adrsAffected: [],
      problems: [],
      blockers: [],
      nextTask: 'Continuar o teste.',
      observations: [],
      confidence: { level: 'Alta', reason: 'Fixture Git local.' },
    }));
    const finished = JSON.parse(runCli(app, ['finish', '--session', 'fixture', '--details-file', '.claude/session-memory/runtime/fixture.details.json'], environment));
    assert.match(finished.journal, /^journals\/\d{4}\/\d{2}\/\d{4}-\d{2}-\d{2}_\d{4}\.md$/);
    const published = JSON.parse(runCli(app, ['publish'], environment));
    assert.equal(published.published, true);
    const validation = JSON.parse(runCli(app, ['validate'], environment));
    assert.equal(validation.valid, true, validation.errors?.join('\n'));
    assert.equal(existsSync(join(fixture, 'memory', finished.journal)), true);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});
