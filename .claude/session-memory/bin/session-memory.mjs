#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join, resolve, relative } from 'node:path';
import { fail, parseArgs, print, readJson, requireArg, nowIso, dateParts, atomicWrite, SessionMemoryError } from '../lib/core.mjs';
import { loadConfig } from '../lib/config.mjs';
import {
  ensureGitRepository, git, sourceSnapshot, changedFilesSince, commitsSince, remoteState, workingTreeState,
  addSessionWorktree, removeSessionWorktree, listSessionWorktrees,
} from '../lib/git.mjs';
import { listJournals, nextJournalPath, regenerateProjectDocs, validateMemory, withMarker, readMarker, journalSection } from '../lib/documents.mjs';
import { publishSessionWorktree } from '../lib/publish.mjs';
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

// --- Worktrees efêmeros por sessão (ADR-021, Fase 3) ------------------------------------
//
// O repositório em config.memoryPath ("hub") deixa de ser o lugar onde sessões trabalham.
// Ele serve só de base de objetos/refs: /inicio cria um `git worktree` privado por sessão,
// /fim escreve e publica só dentro desse worktree, e o worktree é removido depois da
// publicação. Nenhuma sessão volta a compartilhar um diretório Git mutável com outra —
// isso elimina estruturalmente a categoria de bug que motivou a ADR-021 inteira.

function worktreesRoot(config) {
  return join(config.runtimePath, 'memory-worktrees');
}

function sessionWorktreePath(config, id) {
  return join(worktreesRoot(config), id);
}

/**
 * Remove worktrees de sessão órfãos antes de criar um novo (chamado no início de
 * /inicio). Regra deliberadamente conservadora — nunca remove um worktree cuja sessão
 * ainda pode estar em andamento em outro processo:
 *
 * - worktree registrado sem `<id>.json` correspondente → a sessão travou entre criar o
 *   worktree e salvar o estado de runtime (interrupção de sessão); seguro remover.
 * - worktree registrado com `<id>.json` cujo `publishedAt` já está preenchido → a
 *   publicação teve sucesso mas a remoção do worktree não chegou a rodar (processo
 *   encerrado logo após o push); seguro remover.
 * - worktree registrado com `<id>.json` sem `publishedAt` → sessão possivelmente ainda
 *   ativa em outro processo; nunca removido automaticamente.
 */
function pruneOrphanSessionWorktrees(config) {
  const prefix = `${worktreesRoot(config)}/`;
  const entries = listSessionWorktrees(config.memoryPath).filter((entry) => entry.path.startsWith(prefix));
  for (const entry of entries) {
    const id = basename(entry.path);
    const state = readJson(sessionPath(config, id));
    if (!state || state.publishedAt) removeSessionWorktree(config.memoryPath, entry.path);
  }
}

function memoryHasHistory(memoryPath) {
  const result = git(['rev-parse', '--verify', 'HEAD'], memoryPath, { allowFailure: true });
  return typeof result === 'string';
}

function commitAndPushBootstrap(config) {
  const memory = config.memoryPath;
  git(['add', '-A'], memory);
  git(['commit', '-m', 'docs(memory): initialize session memory'], memory);
  const push = git(['push', '-u', 'origin', 'HEAD'], memory, { allowFailure: true });
  if (typeof push !== 'string') fail('Memória inicializada localmente, mas o push falhou. Corrija o remoto e execute `publish`.');
}

function ensureMemoryRepository(config) {
  if (!existsSync(config.memoryPath)) {
    mkdirSync(resolve(config.memoryPath, '..'), { recursive: true });
    git(['clone', config.memoryRepositoryUrl, config.memoryPath], root);
  }
  ensureGitRepository(config.memoryPath, 'Repositório de memória');
  // O hub nunca deve estar sujo fora do bootstrap — sessões trabalham exclusivamente em
  // seus próprios worktrees. Se isso disparar fora do bootstrap, é sinal de que algo
  // voltou a escrever direto no hub; falhar alto em vez de prosseguir silenciosamente.
  const status = git(['status', '--porcelain=v1'], config.memoryPath);
  if (status) fail('O repositório de memória (hub) possui alterações não commitadas fora do fluxo esperado. Investigue antes de continuar.');
  if (!memoryHasHistory(config.memoryPath)) {
    createInitialMemory(config.memoryPath, sourceSnapshot(root));
    commitAndPushBootstrap(config);
    return { initialized: true };
  }
  const missingStatus = !existsSync(join(config.memoryPath, 'project/PROJECT_STATUS.md'));
  if (missingStatus) {
    createInitialMemory(config.memoryPath, sourceSnapshot(root));
    commitAndPushBootstrap(config);
    return { initialized: true };
  }
  return { initialized: false };
}

/** Atualiza só os refs remotos do hub (`origin/*`) — nunca toca no working tree do hub. */
function fetchHub(config) {
  const fetch = git(['fetch', '--prune'], config.memoryPath, { allowFailure: true });
  if (typeof fetch !== 'string') fail('Não foi possível consultar o remoto da memória.');
}

/** Usado só pelos comandos de leitura (status/journal/roadmap/validate) que ainda leem
 * diretamente do hub — mantém o checkout do hub alinhado com origin/main, já que sessões
 * não fazem mais isso como efeito colateral de /inicio. Read-only em efeito: nada aqui é
 * publicado de volta. */
function refreshHubForReading(config) {
  fetchHub(config);
  git(['reset', '--hard', 'origin/main'], config.memoryPath, { allowFailure: true });
}

function readProjectState(memoryPath) {
  const result = {};
  for (const [key, relativePath] of Object.entries({
    status: 'project/PROJECT_STATUS.md',
    next: 'project/START_HERE_NEXT_SESSION.md',
    roadmap: 'project/ROADMAP.md',
    adr: 'project/ADR_STATUS.md',
  })) {
    const filePath = join(memoryPath, relativePath);
    result[key] = readMarker(readFileSync(filePath, 'utf8'), relativePath);
  }
  return result;
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
    blockers: details.blockers ?? [],
    nextTask: details.nextTask,
    adrsAffected: details.adrsAffected ?? [],
    summary: details.statusSummary || details.summary || null,
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
  const result = ensureMemoryRepository(config);
  fetchHub(config);
  pruneOrphanSessionWorktrees(config);
  const previous = readJson(sessionPath(config, id));
  if (previous) fail(`Já existe baseline para a sessão ${id}. Execute /fim ou use outro ID.`);
  const worktreePath = sessionWorktreePath(config, id);
  mkdirSync(worktreesRoot(config), { recursive: true });
  addSessionWorktree(config.memoryPath, worktreePath, 'origin/main');
  const session = { id, objective, startedAt: nowIso(), baseline: sourceSnapshot(root), checks: [], memoryWorktree: worktreePath };
  saveSession(config, session);
  const state = readProjectState(worktreePath);
  const validation = validateMemory(worktreePath);
  const journals = listJournals(worktreePath).slice(0, config.journalWindow);
  print({
    initializedMemory: result.initialized,
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
    consistency: validation.valid ? 'ok' : validation.errors,
  });
}

function commandStatus(args) {
  const config = configFor(args);
  ensureGitRepository(config.memoryPath, 'Repositório de memória');
  refreshHubForReading(config);
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
  ensureGitRepository(config.memoryPath, 'Repositório de memória');
  refreshHubForReading(config);
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
  ensureGitRepository(config.memoryPath, 'Repositório de memória');
  refreshHubForReading(config);
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

function commandFinish(args) {
  const config = configFor(args);
  const id = sessionId(args);
  const session = loadSession(config, id);
  if (!session.memoryWorktree) fail('Sessão sem worktree de memória associado. Execute /inicio novamente.');
  const detailsPath = requireArg(args, 'details-file');
  const details = readJson(resolve(root, detailsPath));
  for (const field of ['phase', 'sprint', 'nextTask']) if (!details[field]) fail(`Campo obrigatório ausente no details-file: ${field}`);
  ensureGitRepository(session.memoryWorktree, 'Worktree de memória da sessão');
  // Sem verificação de "memória suja": este worktree é exclusivo desta sessão, nenhum
  // outro processo pode tê-lo alterado entre /inicio e /fim.
  const changes = changedFilesSince(root, session.baseline);
  const commits = commitsSince(root, session.baseline.head);
  const endedAt = nowIso();
  const journal = makeJournal({ session, changes, commits, details, endedAt });
  const journalPath = nextJournalPath(session.memoryWorktree, endedAt, id);
  writeFileSync(journalPath, journal.content, 'utf8');
  const relativeJournal = relative(session.memoryWorktree, journalPath).split('\\').join('/');
  const derivedStatus = regenerateProjectDocs(session.memoryWorktree);
  if (details.adrsAffected?.length) {
    const previousAdr = readMarker(readFileSync(join(session.memoryWorktree, 'project/ADR_STATUS.md'), 'utf8'), 'project/ADR_STATUS.md');
    const adr = { ...previousAdr, updatedAt: endedAt, lastAdr: derivedStatus.lastAdr, affected: details.adrsAffected };
    atomicWrite(join(session.memoryWorktree, 'project/ADR_STATUS.md'), renderAdrStatus(adr));
  }
  const validation = validateMemory(session.memoryWorktree);
  if (!validation.valid) fail(`Journal gerado, mas a publicação foi bloqueada: ${validation.errors.join('; ')}`);
  session.finishedAt = endedAt;
  session.journal = relativeJournal;
  session.journalContent = journal.content;
  session.details = details;
  saveSession(config, session);
  print({ journal: relativeJournal, changes: { modified: changes.modified, created: changes.created, removed: changes.removed }, commits, next: 'Execute publish para criar o commit e enviar a memória.' });
}

function commandPublish(args) {
  const config = configFor(args);
  const id = sessionId(args);
  const session = loadSession(config, id);
  if (!session.memoryWorktree) fail('Sessão sem worktree de memória associado. Execute /inicio novamente.');
  if (!session.journal || !session.journalContent) fail('Nenhum journal pendente. Execute finish antes de publish.');
  ensureGitRepository(session.memoryWorktree, 'Worktree de memória da sessão');

  const worktree = session.memoryWorktree;
  const journalRelativePath = session.journal;
  const details = session.details || {};

  const result = publishSessionWorktree({
    worktree,
    message: args.message || 'docs(memory): registra sessão',
    prepareCommit: (wt) => {
      const journalPath = join(wt, journalRelativePath);
      mkdirSync(join(journalPath, '..'), { recursive: true });
      writeFileSync(journalPath, session.journalContent, 'utf8');
      const derivedStatus = regenerateProjectDocs(wt);
      if (details.adrsAffected?.length) {
        const previousAdr = readMarker(readFileSync(join(wt, 'project/ADR_STATUS.md'), 'utf8'), 'project/ADR_STATUS.md');
        const adr = { ...previousAdr, updatedAt: session.finishedAt, lastAdr: derivedStatus.lastAdr, affected: details.adrsAffected };
        atomicWrite(join(wt, 'project/ADR_STATUS.md'), renderAdrStatus(adr));
      }
      const validation = validateMemory(wt);
      if (!validation.valid) fail(`Publicação bloqueada: ${validation.errors.join('; ')}`);
    },
  });

  if (!result.published) {
    print(result);
    return;
  }

  session.publishedAt = nowIso();
  saveSession(config, session);
  removeSessionWorktree(config.memoryPath, worktree);
  print({ ...result, note: 'Worktree da sessão removido após publicação.' });
}

/** /release opera direto no hub (fora do escopo da Fase 3 — não é uma sessão comum). */
function publishHubDirect(config, message) {
  const memory = config.memoryPath;
  const validation = validateMemory(memory);
  if (!validation.valid) fail(`Publicação bloqueada: ${validation.errors.join('; ')}`);
  const changes = git(['status', '--porcelain=v1'], memory);
  if (!changes) return { published: false, reason: 'Nenhuma alteração para publicar.' };
  git(['fetch', '--prune'], memory);
  const state = remoteState(memory);
  if (state.behind > 0 || (state.ahead > 0 && state.behind > 0)) fail('Remoto avançou durante a operação. Nenhuma alteração foi sobrescrita; faça rebase/merge manualmente na memória.');
  git(['add', '-A'], memory);
  git(['commit', '-m', message], memory);
  git(['push'], memory);
  return { published: true, commit: git(['rev-parse', '--short', 'HEAD'], memory) };
}

function commandRelease(args) {
  const config = configFor(args);
  const sprint = requireArg(args, 'sprint');
  const from = requireArg(args, 'from');
  ensureGitRepository(config.memoryPath, 'Repositório de memória');
  refreshHubForReading(config);
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
  print(publishHubDirect(config, `docs(memory): prepara release ${sprint}`));
}

function commandValidate(args) {
  const config = configFor(args);
  ensureGitRepository(config.memoryPath, 'Repositório de memória');
  refreshHubForReading(config);
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
