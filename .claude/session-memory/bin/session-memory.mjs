#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import { fail, parseArgs, print, readJson, requireArg, nowIso, dateParts, atomicWrite, SessionMemoryError } from '../lib/core.mjs';
import { loadConfig } from '../lib/config.mjs';
import { ensureGitRepository, isGitRepository, git, gitOk, sourceSnapshot, changedFilesSince, commitsSince, workingTreeState } from '../lib/git.mjs';
import { listJournals, nextJournalPath, updateIndex, validateMemory, withMarker, readMarker, journalSection } from '../lib/documents.mjs';
import { createInitialMemory } from '../lib/scaffold.mjs';

const root = process.cwd();
const [command, ...rest] = process.argv.slice(2);
const args = parseArgs(rest);

function configFor(args) {
  const config = loadConfig(root);
  if (args['memory-dir']) config.memoryPath = resolve(root, args['memory-dir']);
  return config;
}

function sessionId(args) {
  return args.session || process.env.CLAUDE_SESSION_ID || fail('Informe --session ou defina CLAUDE_SESSION_ID.');
}

function sessionPath(config, id) {
  return join(config.runtimePath, `${id}.json`);
}

function loadSession(config, id) {
  const state = readJson(sessionPath(config, id));
  if (!state) fail(`Sessão não encontrada: ${id}. Execute /inicio primeiro.`);
  return state;
}

function saveSession(config, state) {
  mkdirSync(config.runtimePath, { recursive: true });
  atomicWrite(sessionPath(config, state.id), `${JSON.stringify(state, null, 2)}\n`);
}

function memoryHasHistory(memoryPath) {
  const result = git(['rev-parse', '--verify', 'HEAD'], memoryPath, { allowFailure: true });
  return typeof result === 'string';
}

function commitAndPushBootstrap(config) {
  const memory = config.memoryPath;
  git(['add', '-A'], memory);
  git(['commit', '-m', 'docs(memory): initialize session memory'], memory);
  // Best-effort: se o push falhar (sem rede, remoto indisponível), o commit fica
  // local e é publicado numa tentativa futura — nunca bloqueia a sessão atual.
  git(['push', '-u', 'origin', 'HEAD'], memory, { allowFailure: true });
}

// available: false cobre qualquer motivo pelo qual a memória não pôde ser preparada
// (sem rede para clonar, diretório existente que não é um repositório Git etc.) —
// nunca lança erro; o chamador segue a sessão com contexto vazio.
function ensureMemoryRepository(config) {
  if (!existsSync(config.memoryPath)) {
    mkdirSync(resolve(config.memoryPath, '..'), { recursive: true });
    const clone = git(['clone', config.memoryRepositoryUrl, config.memoryPath], root, { allowFailure: true });
    if (!gitOk(clone)) return { initialized: false, available: false };
  }
  if (!isGitRepository(config.memoryPath)) return { initialized: false, available: false };
  if (!memoryHasHistory(config.memoryPath)) {
    createInitialMemory(config.memoryPath, sourceSnapshot(root));
    commitAndPushBootstrap(config);
    return { initialized: true, available: true };
  }
  const missingStatus = !existsSync(join(config.memoryPath, 'project/PROJECT_STATUS.md'));
  if (missingStatus) {
    createInitialMemory(config.memoryPath, sourceSnapshot(root));
    commitAndPushBootstrap(config);
    return { initialized: true, available: true };
  }
  return { initialized: false, available: true };
}

// Uma tentativa best-effort de atualizar a memória local com o remoto — nunca
// bloqueia e nunca lança erro. Alterações locais não commitadas (de uma sessão
// anterior que não conseguiu publicar) são preservadas: sem rede, sem remoto
// disponível, ou hub com alterações locais, a sessão simplesmente segue com o que
// já está em disco.
function refreshMemoryBestEffort(memoryPath) {
  const fetch = git(['fetch', '--prune'], memoryPath, { allowFailure: true });
  if (!gitOk(fetch)) return;
  git(['merge', '--ff-only', 'origin/main'], memoryPath, { allowFailure: true });
}

// Campo a campo, com fallback: memória ausente, ilegível ou com marcador inválido
// nunca impede a sessão de continuar — apenas resulta em contexto vazio para essa
// seção específica.
const PROJECT_STATE_FALLBACK = { status: {}, next: {}, roadmap: { phases: [] }, adr: {} };

function readProjectState(memoryPath) {
  const result = {};
  for (const [key, relativePath] of Object.entries({
    status: 'project/PROJECT_STATUS.md',
    next: 'project/START_HERE_NEXT_SESSION.md',
    roadmap: 'project/ROADMAP.md',
    adr: 'project/ADR_STATUS.md',
  })) {
    const filePath = join(memoryPath, relativePath);
    try {
      result[key] = readMarker(readFileSync(filePath, 'utf8'), relativePath);
    } catch {
      result[key] = PROJECT_STATE_FALLBACK[key];
    }
  }
  return result;
}

function renderStatus(status) {
  return withMarker(`# Estado atual\n\n- **Projeto:** ${status.project}\n- **Fase:** ${status.phase}\n- **Sprint:** ${status.sprint}\n- **Último journal:** ${status.lastJournal ?? 'Nenhum'}\n- **Último commit relevante:** ${status.lastCommit?.slice(0, 7) ?? 'Não informado'}\n- **Última ADR:** ${status.lastAdr ?? 'Não informada'}\n\n## Resumo\n\n${status.summary || 'Não informado.'}\n\n## Bloqueios\n\n${(status.blockers?.length ? status.blockers : ['Nenhum bloqueio informado.']).map((item) => `- ${item}`).join('\n')}\n\n## Próxima tarefa\n\n${status.nextTask || 'Não informada.'}\n`, status);
}

function renderNext(status) {
  return withMarker(`# Comece aqui\n\n1. Execute \`/inicio <objetivo>\` no repositório da aplicação.\n2. Leia o resumo executivo e valide os bloqueios.\n3. Ao encerrar, execute \`/fim\`.\n\n## Próxima tarefa\n\n${status.nextTask || 'Não informada.'}\n\n## Bloqueios\n\n${(status.blockers?.length ? status.blockers : ['Nenhum bloqueio informado.']).map((item) => `- ${item}`).join('\n')}\n`, status);
}

function renderAdrStatus(adr) {
  return withMarker(`# Estado das ADRs\n\n- **Última ADR:** ${adr.lastAdr ?? 'Não informada'}\n- **ADRs afetadas na última sessão:** ${(adr.affected?.length ? adr.affected : ['Nenhuma']).join(', ')}\n- **Atenção:** ${adr.attention || 'Nenhuma.'}\n\nEsta é uma lista de referências; ADRs completos continuam no repositório da aplicação.\n`, adr);
}

function listLines(values, empty = 'Nenhum.') {
  return values?.length ? values : [empty];
}

function makeJournal({ session, changes, commits, details, endedAt }) {
  const parts = dateParts(endedAt);
  const tests = session.checks?.length
    ? session.checks.map((item) => `${item.status === 'passed' ? 'Concluído' : item.status === 'not_configured' ? 'Parcial' : 'Bloqueado'} — \`${item.command}\` (${item.package}): ${item.evidence}`)
    : ['Não executado nesta sessão.'];
  const meta = {
    schemaVersion: 1,
    id: session.id,
    objective: session.objective,
    startedAt: session.startedAt,
    endedAt,
    localEndedAt: `${parts.localDate} ${parts.hhmm.slice(0, 2)}:${parts.hhmm.slice(2)} BRT`,
    durationMinutes: Math.max(1, Math.round((new Date(endedAt) - new Date(session.startedAt)) / 60000)),
    phase: details.phase,
    sprint: details.sprint,
    status: details.status || 'Parcial',
    confidence: details.confidence?.level || 'Não informada',
    source: {
      branch: changes.current.branch,
      baseline: session.baseline.head,
      head: changes.current.head,
      workingTree: workingTreeState(root),
      commits: commits.map((commit) => commit.hash),
    },
    tags: details.tags || [],
  };
  const commitLines = commits.length ? commits.map((commit) => `\`${commit.shortHash}\` — ${commit.subject}`) : ['Nenhum commit criado durante a sessão.'];
  const body = [
    `# Journal — ${session.objective}`,
    '',
    withMarker('', meta).trimEnd(),
    '',
    journalSection('Objetivo', session.objective),
    journalSection('Contexto', details.context || 'Não informado.'),
    journalSection('Trabalhos realizados', listLines(details.workPerformed, 'Não informado.')),
    journalSection('Arquivos alterados', listLines(changes.modified)),
    journalSection('Arquivos criados', listLines(changes.created)),
    journalSection('Arquivos removidos', listLines(changes.removed)),
    journalSection('Commits', commitLines),
    journalSection('Testes', tests),
    journalSection('Decisões', listLines(details.decisions, 'Nenhuma decisão nova registrada.')),
    journalSection('ADRs afetadas', listLines(details.adrsAffected, 'Nenhuma ADR afetada.')),
    journalSection('Problemas encontrados', listLines(details.problems, 'Nenhum problema informado.')),
    journalSection('Bloqueios', listLines(details.blockers, 'Nenhum bloqueio informado.')),
    journalSection('Próxima tarefa', details.nextTask || 'Não informada.'),
    journalSection('Observações', listLines(details.observations, 'Nenhuma observação adicional.')),
    journalSection('Confiança da IA', `${details.confidence?.level || 'Não informada'}${details.confidence?.reason ? ` — ${details.confidence.reason}` : ''}`),
  ];
  return { meta, content: body.join('\n') };
}

function commandInicio(args) {
  const config = configFor(args);
  const objective = requireArg(args, 'objective');
  const id = sessionId(args);
  ensureGitRepository(root, 'Repositório da aplicação');
  const previous = readJson(sessionPath(config, id));
  if (previous) fail(`Já existe baseline para a sessão ${id}. Execute /fim ou use outro ID.`);
  // Preparar/atualizar a memória é sempre best-effort a partir daqui: nenhuma etapa
  // abaixo pode impedir a sessão de começar. Sem rede, remoto indisponível ou
  // qualquer outra falha de sincronização, a sessão segue com o que já está em
  // disco (na pior hipótese, contexto vazio).
  let memoryInitialized = false;
  let memoryAvailable = true;
  try {
    const result = ensureMemoryRepository(config);
    memoryInitialized = result.initialized;
    memoryAvailable = result.available !== false;
    if (memoryAvailable) refreshMemoryBestEffort(config.memoryPath);
  } catch {
    memoryAvailable = false;
  }
  const session = { id, objective, startedAt: nowIso(), baseline: sourceSnapshot(root), checks: [] };
  saveSession(config, session);
  const state = readProjectState(config.memoryPath);
  const journals = listJournals(config.memoryPath).slice(0, config.journalWindow);
  print({
    initializedMemory: memoryInitialized,
    memoriaDisponivel: memoryAvailable,
    session: { id, objective },
    executiveSummary: {
      phase: state.status.phase,
      sprint: state.status.sprint,
      blockers: state.status.blockers,
      lastArchitecturalDecision: state.status.lastAdr,
      lastRelevantCommit: state.status.lastCommit,
      recommendedNextTask: state.status.nextTask,
      latestJournals: journals.map((journal) => ({ path: journal.relativePath, objective: journal.meta.objective, endedAt: journal.meta.endedAt })),
    },
  });
}

function commandStatus(args) {
  const config = configFor(args);
  ensureGitRepository(config.memoryPath, 'Repositório de memória');
  const state = readProjectState(config.memoryPath);
  const latest = listJournals(config.memoryPath)[0];
  print({
    project: state.status.project,
    sprint: state.status.sprint,
    phase: state.status.phase,
    latestJournal: latest?.relativePath ?? 'Nenhum',
    lastCommit: state.status.lastCommit,
    lastAdr: state.status.lastAdr,
    blockers: state.status.blockers,
    nextTask: state.status.nextTask,
  });
}

function commandJournal(args) {
  const config = configFor(args);
  const journals = listJournals(config.memoryPath).filter((journal) => {
    const haystack = `${journal.relativePath}\n${journal.content}`.toLocaleLowerCase('pt-BR');
    return (!args.date || journal.relativePath.includes(args.date))
      && (!args.sprint || journal.meta.sprint === args.sprint)
      && (!args.phase || journal.meta.phase === args.phase)
      && (!args.search || haystack.includes(String(args.search).toLocaleLowerCase('pt-BR')));
  });
  if (args.open) {
    const journal = journals.find((item) => item.relativePath === args.open || item.relativePath.endsWith(`/${args.open}`));
    if (!journal) fail(`Journal não encontrado: ${args.open}`);
    print(journal.content);
    return;
  }
  print(journals.map((journal) => ({ path: journal.relativePath, objective: journal.meta.objective, phase: journal.meta.phase, sprint: journal.meta.sprint, endedAt: journal.meta.endedAt })));
}

function commandRoadmap(args) {
  const config = configFor(args);
  const roadmap = readProjectState(config.memoryPath).roadmap;
  const completed = roadmap.phases.filter((phase) => phase.status === 'complete');
  const active = roadmap.phases.filter((phase) => phase.status === 'in_progress');
  print({
    completion: `${completed.length}/${roadmap.phases.length} (${Math.round((completed.length / roadmap.phases.length) * 100)}%)`,
    current: active,
    next: roadmap.phases.filter((phase) => phase.status === 'pending').slice(0, 3),
    phases: roadmap.phases,
  });
}

function commandCheck(args) {
  const config = configFor(args);
  const id = sessionId(args);
  const session = loadSession(config, id);
  const requested = args.scope ? String(args.scope).split(',') : Object.keys(config.checks);
  const results = [];
  for (const packageName of requested) {
    const commands = config.checks[packageName];
    if (!commands) {
      results.push({ package: packageName, command: '—', status: 'not_configured', evidence: 'Escopo não configurado.' });
      continue;
    }
    const packageManifest = readJson(join(root, packageName, 'package.json'), {});
    if (!packageManifest.scripts?.lint) {
      results.push({ package: packageName, command: 'npm run lint', status: 'not_configured', evidence: 'O package.json não define script de lint.' });
    }
    for (const command of commands) {
      const [binary, ...commandArgs] = command.split(' ');
      const response = spawnSync(binary, commandArgs, { cwd: join(root, packageName), encoding: 'utf8', shell: false });
      const output = `${response.stdout ?? ''}${response.stderr ?? ''}`.trim().replace(/\s+/g, ' ');
      results.push({
        package: packageName,
        command,
        status: response.status === 0 ? 'passed' : 'failed',
        evidence: output ? output.slice(-500) : response.status === 0 ? 'Concluído sem saída.' : `Código ${response.status ?? 'desconhecido'}.`,
      });
    }
  }
  session.checks = [...(session.checks ?? []), ...results];
  saveSession(config, session);
  print({ session: id, checks: results, note: 'Resultados registrados no rascunho da sessão e incluídos no journal do /fim.' });
  if (results.some((result) => result.status === 'failed')) process.exitCode = 1;
}

// Além de existir e ser um repositório Git, a memória só é segura para escrever
// (sobrescrever PROJECT_STATUS.md etc.) se não houver um merge/rebase de outra
// sessão parado no meio, com conflito não resolvido — sobrescrever esses arquivos
// nesse estado destruiria o trabalho de reconciliação em andamento de outra sessão.
function memoryWritable(memoryPath) {
  if (!existsSync(memoryPath) || !isGitRepository(memoryPath)) return false;
  const unmerged = git(['diff', '--name-only', '--diff-filter=U'], memoryPath, { allowFailure: true });
  return !(gitOk(unmerged) && unmerged);
}

function commandFinish(args) {
  const config = configFor(args);
  const id = sessionId(args);
  const session = loadSession(config, id);
  const detailsPath = requireArg(args, 'details-file');
  const details = readJson(resolve(root, detailsPath));
  for (const field of ['phase', 'sprint', 'nextTask']) if (!details[field]) fail(`Campo obrigatório ausente no details-file: ${field}`);
  const changes = changedFilesSince(root, session.baseline);
  const commits = commitsSince(root, session.baseline.head);
  const endedAt = nowIso();
  const journal = makeJournal({ session, changes, commits, details, endedAt });

  // Escrever o journal é sempre uma gravação local: nunca falha por causa externa
  // (rede, remoto, outra sessão). Se a memória nem sequer estiver disponível nesta
  // máquina, ou estiver com um conflito de merge de outra sessão em aberto, o
  // journal é salvo localmente e marcado pendente — nada é perdido/sobrescrito, e a
  // sessão termina normalmente de qualquer forma.
  const memoryAvailable = memoryWritable(config.memoryPath);
  let relativeJournal;
  let pending = false;

  if (memoryAvailable) {
    const journalPath = nextJournalPath(config.memoryPath, endedAt);
    writeFileSync(journalPath, journal.content, 'utf8');
    relativeJournal = relative(config.memoryPath, journalPath).split('\\').join('/');
    const state = readProjectState(config.memoryPath);
    const status = {
      ...state.status,
      updatedAt: endedAt,
      phase: details.phase,
      sprint: details.sprint,
      lastJournal: relativeJournal,
      lastCommit: changes.current.head,
      lastAdr: details.adrsAffected?.at(-1)?.match(/ADR-\d+/)?.[0] ?? state.status.lastAdr,
      blockers: details.blockers ?? [],
      nextTask: details.nextTask,
      summary: details.statusSummary || details.summary || state.status.summary,
    };
    atomicWrite(join(config.memoryPath, 'project/PROJECT_STATUS.md'), renderStatus(status));
    atomicWrite(join(config.memoryPath, 'project/START_HERE_NEXT_SESSION.md'), renderNext(status));
    if (details.adrsAffected?.length) {
      const adr = { ...state.adr, updatedAt: endedAt, lastAdr: status.lastAdr, affected: details.adrsAffected };
      atomicWrite(join(config.memoryPath, 'project/ADR_STATUS.md'), renderAdrStatus(adr));
    }
    updateIndex(config.memoryPath);
  } else {
    pending = true;
    const pendingPath = join(config.runtimePath, `${id}.pending-journal.md`);
    writeFileSync(pendingPath, journal.content, 'utf8');
    relativeJournal = pendingPath;
  }

  session.finishedAt = endedAt;
  session.journal = relativeJournal;
  session.journalPending = pending;
  saveSession(config, session);
  print({
    journal: relativeJournal,
    pendente: pending,
    changes: { modified: changes.modified, created: changes.created, removed: changes.removed },
    commits,
    next: pending
      ? 'Memória local indisponível nesta sessão; journal salvo em runtime/. Uma sessão futura com memória disponível reconcilia automaticamente.'
      : 'Execute publish para criar o commit e enviar a memória.',
  });
}

// Publicação é sempre best-effort: uma tentativa de push e, se rejeitado (o remoto
// avançou), uma única tentativa de reconciliação automática (pull --rebase, sem
// conflito de conteúdo porque os artefatos já são o último estado local). Falha em
// qualquer etapa nunca lança erro — devolve "pendente" e a próxima publicação
// (desta ou de qualquer outra sessão) tenta de novo. Nunca faz force-push.
function commandPublish(args) {
  const config = configFor(args);
  const memory = config.memoryPath;
  if (!memoryWritable(memory)) {
    print({ published: false, pendente: true, reason: 'Memória local indisponível ou com conflito de merge em aberto de outra sessão.' });
    return;
  }
  const dirty = git(['status', '--porcelain=v1'], memory, { allowFailure: true });
  if (gitOk(dirty) && dirty) {
    git(['add', '-A'], memory, { allowFailure: true });
    git(['commit', '-m', args.message || 'docs(memory): registra sessão'], memory, { allowFailure: true });
  }
  const ahead = git(['rev-list', '--count', '@{u}..HEAD'], memory, { allowFailure: true });
  if (gitOk(ahead) && ahead === '0') {
    print({ published: false, pendente: false, reason: 'Nenhuma alteração para publicar.' });
    return;
  }
  git(['fetch', '--prune'], memory, { allowFailure: true });
  let push = git(['push'], memory, { allowFailure: true });
  if (!gitOk(push)) {
    const rebase = git(['pull', '--rebase', 'origin', 'main'], memory, { allowFailure: true });
    if (gitOk(rebase)) {
      push = git(['push'], memory, { allowFailure: true });
    } else {
      git(['rebase', '--abort'], memory, { allowFailure: true });
    }
  }
  if (gitOk(push)) {
    print({ published: true, commit: git(['rev-parse', '--short', 'HEAD'], memory) });
  } else {
    print({ published: false, pendente: true, reason: 'Remoto indisponível ou conflito ao publicar; a próxima sessão tenta novamente.' });
  }
}

function commandRelease(args) {
  const config = configFor(args);
  const sprint = requireArg(args, 'sprint');
  const from = requireArg(args, 'from');
  ensureGitRepository(config.memoryPath, 'Repositório de memória');
  git(['rev-parse', '--verify', from], root);
  const commits = commitsSince(root, from);
  const state = readProjectState(config.memoryPath);
  const endedAt = nowIso();
  const parts = dateParts(endedAt);
  const releasePath = join(config.memoryPath, 'releases', parts.year, `SPRINT-${sprint}.md`);
  mkdirSync(join(config.memoryPath, 'releases', parts.year), { recursive: true });
  const metadata = { schemaVersion: 1, sprint, from, to: sourceSnapshot(root).head, generatedAt: endedAt };
  const commitList = commits.length ? commits.map((commit) => `- \`${commit.shortHash}\` — ${commit.subject}`).join('\n') : '- Nenhum commit no intervalo.';
  const knownBugs = state.status.blockers?.length ? state.status.blockers.map((item) => `- ${item}`).join('\n') : '- Nenhum bloqueio conhecido no estado atual.';
  const pending = state.status.nextTask ? `- ${state.status.nextTask}` : '- Não informada.';
  writeFileSync(releasePath, withMarker(`# Release — ${sprint}\n\n## Principais commits\n\n${commitList}\n\n## Funcionalidades concluídas\n\n${commitList}\n\n## Bugs conhecidos\n\n${knownBugs}\n\n## Pendências\n\n${pending}\n`, metadata), 'utf8');
  const indexPath = join(config.memoryPath, 'releases/INDEX.md');
  const current = existsSync(indexPath) ? readFileSync(indexPath, 'utf8') : '# Índice de releases\n\n';
  if (!current.includes(`SPRINT-${sprint}.md`)) writeFileSync(indexPath, `${current}- [${sprint}](${parts.year}/SPRINT-${sprint}.md)\n`, 'utf8');
  commandPublish({ message: `docs(memory): prepara release ${sprint}` });
}

function commandValidate(args) {
  const config = configFor(args);
  const result = validateMemory(config.memoryPath);
  print(result);
  if (!result.valid) process.exitCode = 1;
}

const handlers = {
  inicio: commandInicio,
  status: commandStatus,
  journal: commandJournal,
  roadmap: commandRoadmap,
  check: commandCheck,
  finish: commandFinish,
  publish: commandPublish,
  release: commandRelease,
  validate: commandValidate,
};

try {
  if (!command || command === 'help') {
    print('Uso: session-memory.mjs <inicio|status|journal|roadmap|check|finish|publish|release|validate>');
  } else if (!handlers[command]) {
    fail(`Comando desconhecido: ${command}`);
  } else {
    handlers[command](args);
  }
} catch (error) {
  if (error instanceof SessionMemoryError) {
    process.stderr.write(`ERRO: ${error.message}\n`);
    process.exitCode = 1;
  } else {
    throw error;
  }
}
