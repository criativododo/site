import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tempDirectory, git, initGitRepository, writeGlobalGitConfig } from './helpers.mjs';
import { addSessionWorktree, listSessionWorktrees, git as realGit } from '../lib/git.mjs';
import { publishSessionWorktree } from '../lib/publish.mjs';

const repositoryRoot = process.cwd();
const cli = join(repositoryRoot, '.claude/session-memory/bin/session-memory.mjs');

function runCli(app, args, environment) {
  return execFileSync(process.execPath, [cli, ...args], { cwd: app, env: environment, encoding: 'utf8' });
}

function setupFixture(fixture) {
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
  return { app, remote, hub: join(fixture, 'memory'), environment };
}

function details(overrides) {
  return {
    phase: 'Fase de teste', sprint: 'S1', status: 'Parcial', context: 'Teste.',
    workPerformed: [], decisions: [], adrsAffected: [], problems: [], blockers: [],
    nextTask: 'tarefa', observations: [], confidence: { level: 'Alta', reason: 'teste' },
    ...overrides,
  };
}

function inicio(app, environment, sessionIdValue, objective) {
  return JSON.parse(runCli(app, ['inicio', '--session', sessionIdValue, '--objective', objective], environment));
}

function finish(app, environment, sessionIdValue, detailsObj) {
  const detailsPath = join(app, `.claude/session-memory/runtime/${sessionIdValue}.details.json`);
  writeFileSync(detailsPath, JSON.stringify(detailsObj));
  return JSON.parse(runCli(app, ['finish', '--session', sessionIdValue, '--details-file', `.claude/session-memory/runtime/${sessionIdValue}.details.json`], environment));
}

function publish(app, environment, sessionIdValue) {
  return JSON.parse(runCli(app, ['publish', '--session', sessionIdValue, '--message', `docs(memory): sessão ${sessionIdValue}`], environment));
}

function worktreePathFor(app, sessionIdValue) {
  return join(app, '.claude/session-memory/runtime/memory-worktrees', sessionIdValue);
}

// 1. Duas sessões concorrentes ------------------------------------------------------------

test('Fase 3 — duas sessões concorrentes: worktrees isolados, nenhuma publicação se sobrescreve', () => {
  const fixture = tempDirectory();
  try {
    const { app, environment, hub } = setupFixture(fixture);

    const a = inicio(app, environment, 'sessao-a', 'Trabalho da sessão A');
    const b = inicio(app, environment, 'sessao-b', 'Trabalho da sessão B');

    const worktreeA = worktreePathFor(app, 'sessao-a');
    const worktreeB = worktreePathFor(app, 'sessao-b');
    assert.equal(existsSync(worktreeA), true);
    assert.equal(existsSync(worktreeB), true);
    assert.notEqual(worktreeA, worktreeB);

    // registradas como worktrees distintos do mesmo hub (comparação por sufixo: o git
    // costuma reportar o caminho resolvido por realpath, que pode diferir em prefixo de
    // symlinks do diretório temporário do SO — ex.: /tmp -> /private/tmp no macOS)
    const registered = listSessionWorktrees(hub).map((entry) => entry.path);
    assert.ok(registered.some((p) => p.endsWith('/memory-worktrees/sessao-a')));
    assert.ok(registered.some((p) => p.endsWith('/memory-worktrees/sessao-b')));

    const finishedA = finish(app, environment, 'sessao-a', details({ nextTask: 'próxima A' }));
    const finishedB = finish(app, environment, 'sessao-b', details({ nextTask: 'próxima B' }));

    // isolamento de conteúdo: o journal de A nunca aparece dentro do worktree de B, e vice-versa
    const journalsInA = readdirSync(join(worktreeA, 'journals'), { recursive: true }).filter((f) => f.endsWith('.md'));
    const journalsInB = readdirSync(join(worktreeB, 'journals'), { recursive: true }).filter((f) => f.endsWith('.md'));
    assert.ok(journalsInA.some((f) => f.includes('sessaoa')));
    assert.ok(!journalsInA.some((f) => f.includes('sessaob')));
    assert.ok(journalsInB.some((f) => f.includes('sessaob')));
    assert.ok(!journalsInB.some((f) => f.includes('sessaoa')));

    const publishedA = publish(app, environment, 'sessao-a');
    const publishedB = publish(app, environment, 'sessao-b');
    assert.equal(publishedA.published, true);
    assert.equal(publishedB.published, true);

    // ambos os worktrees removidos após publicação bem-sucedida
    assert.equal(existsSync(worktreeA), false);
    assert.equal(existsSync(worktreeB), false);

    // nenhuma das duas publicações apagou a outra: os dois journals sobrevivem no remoto
    const clonePath = join(fixture, 'verify-clone');
    git(fixture, ['clone', '-q', '--branch', 'main', join(fixture, 'memory-remote.git'), clonePath]);
    const files = readdirSync(join(clonePath, 'journals'), { recursive: true }).filter((f) => f.endsWith('.md'));
    assert.ok(files.some((f) => f.includes('sessaoa')));
    assert.ok(files.some((f) => f.includes('sessaob')));
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

// 2. Três sessões concorrentes -------------------------------------------------------------

test('Fase 3 — três sessões concorrentes intercaladas: todos os journals sobrevivem, nenhuma interferência', () => {
  const fixture = tempDirectory();
  try {
    const { app, environment } = setupFixture(fixture);
    const ids = ['sessao-x', 'sessao-y', 'sessao-z'];

    // início intercalado (X, Y, Z) — todas com worktree próprio antes de qualquer finish
    for (const id of ids) inicio(app, environment, id, `Trabalho da ${id}`);
    for (const id of ids) assert.equal(existsSync(worktreePathFor(app, id)), true);

    // finish intercalado em ordem diferente da criação (Z, X, Y)
    finish(app, environment, 'sessao-z', details({ nextTask: 'próxima Z' }));
    finish(app, environment, 'sessao-x', details({ nextTask: 'próxima X' }));
    finish(app, environment, 'sessao-y', details({ nextTask: 'próxima Y' }));

    // publish intercalado em outra ordem ainda (Y, Z, X) — cada publish precisa
    // absorver o que as anteriores já publicaram, sem se sobrescrever
    const publishedY = publish(app, environment, 'sessao-y');
    const publishedZ = publish(app, environment, 'sessao-z');
    const publishedX = publish(app, environment, 'sessao-x');
    assert.equal(publishedY.published, true);
    assert.equal(publishedZ.published, true);
    assert.equal(publishedX.published, true);

    for (const id of ids) assert.equal(existsSync(worktreePathFor(app, id)), false);

    const status = JSON.parse(runCli(app, ['status'], environment));
    // a última publicada por ordem de endedAt determina o estado — mas as três precisam
    // estar presentes no índice, não só a última
    const journal = JSON.parse(runCli(app, ['journal'], environment));
    const objectives = journal.map((entry) => entry.objective);
    assert.ok(objectives.includes('Trabalho da sessao-x'));
    assert.ok(objectives.includes('Trabalho da sessao-y'));
    assert.ok(objectives.includes('Trabalho da sessao-z'));
    assert.equal(journal.length, 3);
    assert.ok(status.phase); // regenerado com sucesso, sem lançar erro
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

// 3. Conflito de push + retry bem-sucedido --------------------------------------------------

test('Fase 3 — conflito de push: retry tenta de novo e publica com sucesso na segunda tentativa', () => {
  const fixture = tempDirectory();
  try {
    const remote = join(fixture, 'memory-remote.git');
    git(fixture, ['init', '--bare', 'memory-remote.git']);
    const seed = join(fixture, 'seed');
    initGitRepository(seed);
    writeFileSync(join(seed, 'README.md'), '# memória\n');
    git(seed, ['add', '-A']);
    git(seed, ['commit', '-q', '-m', 'inicial']);
    git(seed, ['remote', 'add', 'origin', remote]);
    git(seed, ['push', '-q', '-u', 'origin', 'HEAD:main']);

    const worktree = join(fixture, 'worktree-teste');
    git(seed, ['worktree', 'add', '--detach', worktree, 'origin/main']);

    let pushCalls = 0;
    let rejectFirstAttempts = 1; // simula rejeição real (não-fast-forward) na 1ª tentativa
    const gitFn = (args, cwd, options) => {
      if (args[0] === 'push' && pushCalls < rejectFirstAttempts) {
        pushCalls += 1;
        return { ok: false, status: 1, stdout: '', stderr: 'rejeitado (simulado, non-fast-forward)' };
      }
      if (args[0] === 'push') pushCalls += 1;
      return realGit(args, cwd, options);
    };

    const result = publishSessionWorktree({
      worktree,
      message: 'docs(memory): teste de retry',
      maxAttempts: 5,
      // como na implementação real (commandPublish): reescreve o conteúdo da sessão a
      // cada tentativa, já que `reset --hard origin/main` desfaz qualquer commit local
      // de uma tentativa anterior que não chegou a ser publicada.
      prepareCommit: (wt) => writeFileSync(join(wt, 'journal-teste.md'), 'conteúdo da sessão de teste\n'),
      gitFn,
    });

    assert.equal(result.published, true);
    assert.equal(pushCalls, 2, 'esperado: primeira tentativa de push falha (simulada), segunda tem sucesso');
    assert.equal(result.attempts, 2);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

test('Fase 3 — retry esgota tentativas e falha alto sem nunca tentar force-push', () => {
  const fixture = tempDirectory();
  try {
    const remote = join(fixture, 'memory-remote.git');
    git(fixture, ['init', '--bare', 'memory-remote.git']);
    const seed = join(fixture, 'seed');
    initGitRepository(seed);
    writeFileSync(join(seed, 'README.md'), '# memória\n');
    git(seed, ['add', '-A']);
    git(seed, ['commit', '-q', '-m', 'inicial']);
    git(seed, ['remote', 'add', 'origin', remote]);
    git(seed, ['push', '-q', '-u', 'origin', 'HEAD:main']);

    const worktree = join(fixture, 'worktree-teste');
    git(seed, ['worktree', 'add', '--detach', worktree, 'origin/main']);

    const gitFn = (args, cwd, options) => {
      if (args[0] === 'push') return { ok: false, status: 1, stdout: '', stderr: 'sempre rejeitado' };
      return realGit(args, cwd, options);
    };
    const prepareCommit = (wt) => writeFileSync(join(wt, 'journal-teste.md'), 'conteúdo\n');

    assert.throws(() => publishSessionWorktree({
      worktree, message: 'teste', maxAttempts: 3, prepareCommit, gitFn,
    }), /falhou após 3 tentativas/);

    // nenhum comando de force-push foi tentado em nenhum momento
    const pushArgsUsed = [];
    const spy = (args, cwd, options) => {
      if (args[0] === 'push') pushArgsUsed.push(args.join(' '));
      if (args[0] === 'push') return { ok: false, status: 1, stdout: '', stderr: 'rejeitado' };
      return realGit(args, cwd, options);
    };
    try {
      publishSessionWorktree({ worktree, message: 'teste', maxAttempts: 2, prepareCommit, gitFn: spy });
    } catch { /* esperado */ }
    assert.ok(pushArgsUsed.every((call) => !call.includes('--force') && !call.includes('-f')));
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

// 4. Limpeza de worktree órfão --------------------------------------------------------------

test('Fase 3 — limpeza de worktree órfão: worktree registrado sem sessão correspondente é removido no próximo /inicio', () => {
  const fixture = tempDirectory();
  try {
    const { app, environment, hub } = setupFixture(fixture);

    // bootstrap da memória (cria o hub e o primeiro commit)
    inicio(app, environment, 'sessao-bootstrap', 'Bootstrap');
    finish(app, environment, 'sessao-bootstrap', details());
    publish(app, environment, 'sessao-bootstrap');

    // simula uma sessão que travou entre criar o worktree e salvar o estado de runtime:
    // cria o worktree diretamente via git, sem nenhum <id>.json correspondente
    const orphanId = 'sessao-orfa';
    const orphanPath = worktreePathFor(app, orphanId);
    git(hub, ['fetch', '--prune']);
    addSessionWorktree(hub, orphanPath, 'origin/main');
    assert.equal(existsSync(orphanPath), true);
    assert.ok(listSessionWorktrees(hub).some((entry) => entry.path.endsWith(`/memory-worktrees/${orphanId}`)));
    assert.equal(existsSync(join(app, `.claude/session-memory/runtime/${orphanId}.json`)), false);

    // próxima sessão real dispara a limpeza automática antes de criar seu próprio worktree
    inicio(app, environment, 'sessao-nova', 'Sessão nova depois do órfão');

    assert.equal(existsSync(orphanPath), false, 'worktree órfão deveria ter sido removido');
    assert.ok(!listSessionWorktrees(hub).some((entry) => entry.path.endsWith(`/memory-worktrees/${orphanId}`)));
    assert.equal(existsSync(worktreePathFor(app, 'sessao-nova')), true);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

// 5. Interrupção de sessão -------------------------------------------------------------------

test('Fase 3 — interrupção de sessão: sessão nunca finalizada não bloqueia nem é destruída por sessões novas', () => {
  const fixture = tempDirectory();
  try {
    const { app, environment } = setupFixture(fixture);

    const interrupted = inicio(app, environment, 'sessao-interrompida', 'Sessão que trava antes do /fim');
    const worktreeInterrupted = worktreePathFor(app, 'sessao-interrompida');
    assert.equal(existsSync(worktreeInterrupted), true);
    writeFileSync(join(worktreeInterrupted, 'marca-de-trabalho-em-andamento.txt'), 'prova de que este worktree é único\n');

    // uma segunda sessão inicia normalmente — não pode ser bloqueada pela primeira, nem
    // pode tocar no worktree dela
    const other = inicio(app, environment, 'sessao-nova-2', 'Sessão nova enquanto a outra está travada');
    assert.equal(other.session.id, 'sessao-nova-2');
    const worktreeOther = worktreePathFor(app, 'sessao-nova-2');
    assert.equal(existsSync(worktreeOther), true);
    assert.notEqual(worktreeOther, worktreeInterrupted);

    // o worktree e a marca de trabalho da sessão interrompida continuam intactos —
    // a regra de limpeza nunca remove uma sessão com <id>.json sem publishedAt
    assert.equal(existsSync(worktreeInterrupted), true);
    assert.equal(existsSync(join(worktreeInterrupted, 'marca-de-trabalho-em-andamento.txt')), true);
    assert.equal(existsSync(join(app, '.claude/session-memory/runtime/sessao-interrompida.json')), true);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

// 6. Nenhuma sessão interfere na outra (critério 4) -------------------------------------------

test('Fase 3 — nenhuma sessão consegue interferir em outra: escritas concorrentes permanecem isoladas até a publicação', () => {
  const fixture = tempDirectory();
  try {
    const { app, environment } = setupFixture(fixture);

    inicio(app, environment, 'sessao-p', 'Sessão P');
    inicio(app, environment, 'sessao-q', 'Sessão Q');
    const worktreeP = worktreePathFor(app, 'sessao-p');
    const worktreeQ = worktreePathFor(app, 'sessao-q');

    // escreve arquivos-marca diretamente nos dois worktrees, simulando trabalho concorrente
    writeFileSync(join(worktreeP, 'marca-p.txt'), 'P\n');
    writeFileSync(join(worktreeQ, 'marca-q.txt'), 'Q\n');

    // nenhum dos dois vê o arquivo do outro
    assert.equal(existsSync(join(worktreeP, 'marca-q.txt')), false);
    assert.equal(existsSync(join(worktreeQ, 'marca-p.txt')), false);

    finish(app, environment, 'sessao-p', details({ nextTask: 'tarefa P' }));
    finish(app, environment, 'sessao-q', details({ nextTask: 'tarefa Q' }));

    // finish não vaza entre worktrees: os journals continuam isolados até a publicação
    assert.equal(existsSync(join(worktreeP, 'marca-q.txt')), false);
    assert.equal(existsSync(join(worktreeQ, 'marca-p.txt')), false);

    const publishedP = publish(app, environment, 'sessao-p');
    assert.equal(publishedP.published, true);
    const publishedQ = publish(app, environment, 'sessao-q');
    assert.equal(publishedQ.published, true);

    const journal = JSON.parse(runCli(app, ['journal'], environment));
    assert.equal(journal.length, 2);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});
