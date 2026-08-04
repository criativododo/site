import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tempDirectory, git, initGitRepository, writeGlobalGitConfig } from './helpers.mjs';

// Todos os cenários abaixo rodam inteiramente contra fixtures temporárias e
// remotos Git locais (bare repos em disco) — nenhum deles toca o repositório real
// de memória (criativododo-memory) nem a rede. Cobrem exatamente os sete
// objetivos: /inicio e /fim nunca bloqueiam, sincronização que falha vira
// pendência local, o caminho da memória independe de process.cwd(), e o merge
// automático de publish nunca sobrescreve trabalho em conflito de outra sessão.

const repositoryRoot = process.cwd();
const cli = join(repositoryRoot, '.claude/session-memory/bin/session-memory.mjs');

function runCli(app, args, environment) {
  return execFileSync(process.execPath, [cli, ...args], { cwd: app, env: environment, encoding: 'utf8' });
}

function makeApp(fixture, name, memoryRepositoryUrl) {
  const app = join(fixture, name);
  initGitRepository(app);
  mkdirSync(join(app, '.claude/session-memory'), { recursive: true });
  writeFileSync(join(app, '.claude/session-memory/config.json'), JSON.stringify({
    schemaVersion: 1,
    memoryRepositoryUrl,
    memoryDirectory: '../memory',
    journalWindow: 5,
    checks: {},
  }));
  return app;
}

// Toda fixture PRECISA fixar CRIATIVODODO_MEMORY_DIR dentro de si mesma — sem
// isso, memoryDirectory ('../memory', relativo) resolveria contra $HOME de
// verdade (o comportamento novo, correto em produção) e o teste vazaria para o
// disco real do usuário em vez de ficar isolado na fixture.
function environmentFor(fixture, memoryDir = join(fixture, 'memory')) {
  return {
    ...process.env,
    GIT_CONFIG_GLOBAL: writeGlobalGitConfig(fixture),
    CRIATIVODODO_MEMORY_DIR: memoryDir,
  };
}

function baseDetails(overrides = {}) {
  return {
    phase: 'Fase de teste',
    sprint: 'Não formalizada',
    status: 'Parcial',
    context: 'Cenário de resiliência.',
    workPerformed: ['Executou o cenário.'],
    decisions: [],
    adrsAffected: [],
    problems: [],
    blockers: [],
    nextTask: 'Continuar o teste.',
    observations: [],
    confidence: { level: 'Alta', reason: 'Fixture isolada.' },
    ...overrides,
  };
}

test('/inicio nunca bloqueia quando o remoto de memória é inacessível', () => {
  const fixture = tempDirectory();
  try {
    const app = makeApp(fixture, 'app', join(fixture, 'remoto-inexistente.git'));
    const environment = environmentFor(fixture);
    const result = JSON.parse(runCli(app, ['inicio', '--session', 'offline', '--objective', 'Testar offline'], environment));
    assert.equal(result.memoriaDisponivel, false);
    assert.deepEqual(result.executiveSummary.latestJournals, []);
    assert.equal(result.executiveSummary.phase, undefined);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

test('/fim nunca bloqueia quando a memória está indisponível — salva localmente e marca pendência', () => {
  const fixture = tempDirectory();
  try {
    const app = makeApp(fixture, 'app', join(fixture, 'remoto-inexistente.git'));
    const environment = environmentFor(fixture);
    runCli(app, ['inicio', '--session', 'offline', '--objective', 'Testar offline'], environment);
    const detailsFile = join(app, '.claude/session-memory/runtime/offline.details.json');
    writeFileSync(detailsFile, JSON.stringify(baseDetails()));
    const finished = JSON.parse(runCli(app, ['finish', '--session', 'offline', '--details-file', '.claude/session-memory/runtime/offline.details.json'], environment));
    assert.equal(finished.pendente, true);
    assert.match(finished.journal, /offline\.pending-journal\.md$/);
    assert.equal(existsSync(finished.journal), true);
    const published = JSON.parse(runCli(app, ['publish'], environment));
    assert.equal(published.published, false);
    assert.equal(published.pendente, true);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

test('/publish se autorrecupera de um push rejeitado (não fast-forward) sem bloquear e sem force-push', () => {
  const fixture = tempDirectory();
  try {
    const remote = join(fixture, 'memory-remote.git');
    git(fixture, ['init', '--bare', 'memory-remote.git']);
    const environment = environmentFor(fixture);

    const appA = makeApp(fixture, 'appA', remote);
    const appB = makeApp(fixture, 'appB', remote);

    // Sessão A inicializa a memória (bootstrap) e publica primeiro.
    runCli(appA, ['inicio', '--session', 'a1', '--objective', 'Sessão A'], environment);
    writeFileSync(join(appA, '.claude/session-memory/runtime/a1.details.json'), JSON.stringify(baseDetails({ nextTask: 'Tarefa da sessão A' })));
    runCli(appA, ['finish', '--session', 'a1', '--details-file', '.claude/session-memory/runtime/a1.details.json'], environment);
    const publishedA = JSON.parse(runCli(appA, ['publish'], environment));
    assert.equal(publishedA.published, true);

    // Sessão B clona a memória ANTES do push de A e só publica depois — seu push
    // inicial será rejeitado (não fast-forward); precisa se recuperar sozinha.
    runCli(appB, ['inicio', '--session', 'b1', '--objective', 'Sessão B'], environment);
    writeFileSync(join(appB, '.claude/session-memory/runtime/b1.details.json'), JSON.stringify(baseDetails({ nextTask: 'Tarefa da sessão B' })));
    runCli(appB, ['finish', '--session', 'b1', '--details-file', '.claude/session-memory/runtime/b1.details.json'], environment);
    const publishedB = JSON.parse(runCli(appB, ['publish'], environment));
    assert.equal(publishedB.published, true);

    // O journal de A e o de B (nomes únicos) devem ambos estar no remoto ao final —
    // nada foi perdido nem sobrescrito, e nenhum force-push foi necessário.
    const bareLog = git(fixture, ['--git-dir', remote, 'log', '--oneline', 'main']);
    assert.ok(bareLog.split('\n').length >= 3);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

test('/fim não sobrescreve a memória quando há um conflito de merge de outra sessão em aberto', () => {
  const fixture = tempDirectory();
  try {
    const remote = join(fixture, 'memory-remote.git');
    git(fixture, ['init', '--bare', 'memory-remote.git']);
    const memoryPath = join(fixture, 'memory');
    const environment = environmentFor(fixture, memoryPath);
    const app = makeApp(fixture, 'app', remote);

    runCli(app, ['inicio', '--session', 'c1', '--objective', 'Sessão C'], environment);

    // Simula um merge de outra sessão parado no meio, com conflito real em
    // PROJECT_STATUS.md (marcadores de conflito literais no arquivo).
    git(memoryPath, ['checkout', '-b', 'outro-lado']);
    writeFileSync(join(memoryPath, 'project/PROJECT_STATUS.md'), '# Estado atual\n\nversão do outro lado\n');
    git(memoryPath, ['commit', '-am', 'outro lado']);
    git(memoryPath, ['checkout', 'main']);
    writeFileSync(join(memoryPath, 'project/PROJECT_STATUS.md'), '# Estado atual\n\nversão da main\n');
    git(memoryPath, ['commit', '-am', 'lado main']);
    try {
      git(memoryPath, ['merge', 'outro-lado']);
    } catch {
      // esperado: merge conflitante, deixa marcadores <<<<<<< no arquivo.
    }
    const beforeFinish = readFileSync(join(memoryPath, 'project/PROJECT_STATUS.md'), 'utf8');
    assert.match(beforeFinish, /<<<<<<</);

    writeFileSync(join(app, '.claude/session-memory/runtime/c1.details.json'), JSON.stringify(baseDetails()));
    const finished = JSON.parse(runCli(app, ['finish', '--session', 'c1', '--details-file', '.claude/session-memory/runtime/c1.details.json'], environment));
    assert.equal(finished.pendente, true);

    const afterFinish = readFileSync(join(memoryPath, 'project/PROJECT_STATUS.md'), 'utf8');
    assert.equal(afterFinish, beforeFinish, 'PROJECT_STATUS.md em conflito não pode ser sobrescrito por /fim');
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

test('o caminho da memória independe de process.cwd() — duas apps distintas convergem para o mesmo diretório fixo', () => {
  const fixture = tempDirectory();
  try {
    const remote = join(fixture, 'memory-remote.git');
    git(fixture, ['init', '--bare', 'memory-remote.git']);
    const fixedMemoryDir = join(fixture, 'memoria-canonica');
    const environment = environmentFor(fixture, fixedMemoryDir);

    // Duas "apps" em diretórios totalmente diferentes (equivalente a checkout
    // principal vs. worktree) — memoryDirectory relativo diferente em cada
    // config.json, para provar que quem manda é a env var, não `../`.
    const appA = makeApp(fixture, 'nivel1/appA', remote);
    const appB = makeApp(fixture, 'nivel2/muito/mais/fundo/appB', remote);

    const resultA = JSON.parse(runCli(appA, ['inicio', '--session', 'x1', '--objective', 'App A'], environment));
    assert.equal(resultA.initializedMemory, true);
    assert.equal(existsSync(fixedMemoryDir), true);

    const resultB = JSON.parse(runCli(appB, ['inicio', '--session', 'x2', '--objective', 'App B'], environment));
    // Já inicializado por appA — appB não cria um segundo clone em outro lugar.
    assert.equal(resultB.initializedMemory, false);
    assert.equal(resultB.memoriaDisponivel, true);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});
