import { existsSync, readdirSync, readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { atomicWrite, dateParts, relativePosix, fail } from './core.mjs';

export const REQUIRED_JOURNAL_HEADINGS = [
  'Objetivo', 'Contexto', 'Trabalhos realizados', 'Arquivos alterados', 'Arquivos criados',
  'Arquivos removidos', 'Commits', 'Testes', 'Decisões', 'ADRs afetadas',
  'Problemas encontrados', 'Bloqueios', 'Próxima tarefa', 'Observações', 'Confiança da IA',
];

const MARKER_START = '<!-- session-memory';
const MARKER_END = '-->';

export function withMarker(value, data) {
  return `${MARKER_START}\n${JSON.stringify(data, null, 2)}\n${MARKER_END}\n\n${value}`;
}

export function readMarker(value, label = 'documento') {
  const start = value.indexOf(MARKER_START);
  const end = value.indexOf(MARKER_END, start);
  if (start === -1 || end === -1) fail(`Metadados session-memory ausentes em ${label}.`);
  const raw = value.slice(start + MARKER_START.length, end).trim();
  try {
    return JSON.parse(raw);
  } catch (error) {
    fail(`Metadados inválidos em ${label}: ${error.message}`);
  }
}

/**
 * Ordena journals por recência (endedAt decrescente) com desempate determinístico por
 * relativePath (ADR-021, Fase 2, critério 1/2): dois conjuntos idênticos de journals devem
 * sempre produzir a mesma ordem, mesmo quando dois journals têm o mesmo endedAt e mesmo que
 * a ordem de leitura do sistema de arquivos varie entre chamadas ou sistemas operacionais.
 */
export function sortJournalsByRecency(journals) {
  return [...journals].sort((a, b) =>
    String(b.meta.endedAt ?? '').localeCompare(String(a.meta.endedAt ?? ''))
    || a.relativePath.localeCompare(b.relativePath));
}

export function listJournals(memoryPath) {
  const journalsRoot = join(memoryPath, 'journals');
  if (!existsSync(journalsRoot)) return [];
  const found = [];
  function visit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const entryPath = join(directory, entry.name);
      if (entry.isDirectory()) visit(entryPath);
      else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'INDEX.md') found.push(entryPath);
    }
  }
  visit(journalsRoot);
  const journals = found.map((filePath) => {
    const content = readFileSync(filePath, 'utf8');
    return { filePath, relativePath: relativePosix(memoryPath, filePath), content, meta: readMarker(content, filePath) };
  });
  return sortJournalsByRecency(journals);
}

/**
 * Nome do journal inclui um nonce curto de publicação: cada
 * sessão trabalha em seu próprio worktree isolado, sem visibilidade sobre journals que
 * outras sessões concorrentes ainda não publicaram — um `existsSync` local não basta para
 * evitar colisão de nome entre duas sessões terminando no mesmo minuto. Incluir o session
 * nonce torna o nome único por construção, sem depender de detectar a colisão.
 */
function publicationSuffix(publicationNonce) {
  if (!publicationNonce) return '';
  const safe = String(publicationNonce).replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
  return safe ? `--${safe}` : '';
}

export function nextJournalPath(memoryPath, endedAt, publicationNonce) {
  const parts = dateParts(endedAt);
  const directory = join(memoryPath, 'journals', parts.year, parts.month);
  mkdirSync(directory, { recursive: true });
  const base = `${parts.localDate}_${parts.hhmm}${publicationSuffix(publicationNonce)}`;
  let attempt = 1;
  let candidate = join(directory, `${base}.md`);
  while (existsSync(candidate)) {
    attempt += 1;
    candidate = join(directory, `${base}-${String(attempt).padStart(2, '0')}.md`);
  }
  return candidate;
}

/** Nome do projeto: identidade fixa do repositório de memória, não varia por sessão. */
export const PROJECT_NAME = 'Portal DODÔ';

/**
 * Deriva o estado "atual" inteiramente a partir do conjunto de journals — função pura,
 * sem I/O (ADR-021, Fase 2, critério 3): nenhum campo aqui pode vir de um arquivo derivado
 * previamente escrito. Journals idênticos (em qualquer ordem de entrada) sempre produzem o
 * mesmo resultado.
 *
 * `blockers`/`nextTask`/`phase`/`sprint` vêm sempre do journal mais recente (cada `/fim`
 * declara o estado corrente por completo, nunca acumula). `lastAdr`/`summary` usam
 * "carry-forward": se o journal mais recente não menciona ADR ou não traz resumo, busca-se
 * o journal mais recente que traga, para não perder informação que uma sessão anterior já
 * havia declarado.
 */
export function deriveState(journals) {
  const sorted = sortJournalsByRecency(journals);
  const latest = sorted[0];
  const withAdr = sorted.find((journal) => journal.meta.adrsAffected?.length);
  const lastAdr = withAdr ? (withAdr.meta.adrsAffected.at(-1).match(/ADR-\d+/)?.[0] ?? null) : null;
  const withSummary = sorted.find((journal) => journal.meta.summary);
  return {
    schemaVersion: 1,
    project: PROJECT_NAME,
    updatedAt: latest?.meta.endedAt ?? null,
    phase: latest?.meta.phase ?? 'Nenhuma sessão registrada ainda.',
    sprint: latest?.meta.sprint ?? 'Não formalizada',
    lastJournal: latest?.relativePath ?? null,
    lastCommit: latest?.meta.source?.head ?? null,
    lastAdr,
    blockers: latest?.meta.blockers ?? [],
    nextTask: latest?.meta.nextTask ?? 'Nenhuma sessão registrada ainda — execute /inicio e /fim para começar.',
    summary: withSummary?.meta.summary ?? 'Nenhuma sessão registrada ainda.',
  };
}

export function renderIndexFromJournals(journals) {
  const sorted = sortJournalsByRecency(journals);
  const rows = sorted.map(({ relativePath, meta }) => {
    const commit = meta.source?.head?.slice(0, 7) ?? 'sem commit';
    return `| ${meta.localEndedAt ?? meta.endedAt ?? '—'} | [${meta.objective ?? 'Sem objetivo'}](${relativePath.replace(/^journals\//, '')}) | ${meta.phase ?? '—'} | ${meta.sprint ?? '—'} | ${commit} |`;
  });
  return [
    '# Índice de journals',
    '',
    '> Gerado pelo Session Memory. Não editar manualmente.',
    '',
    '| Encerramento | Objetivo | Fase | Sprint | Commit |',
    '| --- | --- | --- | --- | --- |',
    ...(rows.length ? rows : ['| — | Nenhum journal registrado | — | — | — |']),
    '',
  ].join('\n');
}

export function renderStatusFromJournals(journals) {
  const status = deriveState(journals);
  const blockersBlock = status.blockers.length ? status.blockers.map((item) => `- ${item}`).join('\n') : '- Nenhum bloqueio informado.';
  return withMarker(`# Estado atual\n\n- **Projeto:** ${status.project}\n- **Fase:** ${status.phase}\n- **Sprint:** ${status.sprint}\n- **Último journal:** ${status.lastJournal ?? 'Nenhum'}\n- **Último commit relevante:** ${status.lastCommit ? status.lastCommit.slice(0, 7) : 'Não informado'}\n- **Última ADR:** ${status.lastAdr ?? 'Não informada'}\n\n## Resumo\n\n${status.summary}\n\n## Bloqueios\n\n${blockersBlock}\n\n## Próxima tarefa\n\n${status.nextTask}\n`, status);
}

export function renderNextFromJournals(journals) {
  const status = deriveState(journals);
  const blockersBlock = status.blockers.length ? status.blockers.map((item) => `- ${item}`).join('\n') : '- Nenhum bloqueio informado.';
  return withMarker(`# Comece aqui\n\n1. Execute \`/inicio\` no repositório da aplicação.\n2. Leia o resumo executivo e valide os bloqueios.\n3. Ao encerrar, execute \`/fim\`.\n\n## Próxima tarefa\n\n${status.nextTask}\n\n## Bloqueios\n\n${blockersBlock}\n`, status);
}

/**
 * Único ponto de escrita dos três artefatos gerados (journals/INDEX.md,
 * project/PROJECT_STATUS.md, project/START_HERE_NEXT_SESSION.md). Sempre relê o conjunto
 * completo de journals do disco e regenera os três do zero — nunca faz patch incremental
 * sobre o conteúdo anterior, o que torna a regeneração idempotente por construção.
 */
export function regenerateProjectDocs(memoryPath) {
  const journals = listJournals(memoryPath);
  atomicWrite(join(memoryPath, 'journals/INDEX.md'), renderIndexFromJournals(journals));
  atomicWrite(join(memoryPath, 'project/PROJECT_STATUS.md'), renderStatusFromJournals(journals));
  atomicWrite(join(memoryPath, 'project/START_HERE_NEXT_SESSION.md'), renderNextFromJournals(journals));
  return deriveState(journals);
}

export function validateMemory(memoryPath) {
  const required = [
    'README.md', 'journals/INDEX.md', 'project/PROJECT_STATUS.md',
    'project/START_HERE_NEXT_SESSION.md', 'project/ROADMAP.md',
    'project/ADR_STATUS.md', 'project/ARCHITECTURE.md',
  ];
  const errors = [];
  for (const filePath of required) if (!existsSync(join(memoryPath, filePath))) errors.push(`Ausente: ${filePath}`);
  const journals = listJournals(memoryPath);
  for (const journal of journals) {
    for (const heading of REQUIRED_JOURNAL_HEADINGS) {
      if (!journal.content.includes(`## ${heading}`)) errors.push(`${journal.relativePath}: seção "${heading}" ausente`);
    }
  }
  if (existsSync(join(memoryPath, 'journals/INDEX.md'))) {
    const index = readFileSync(join(memoryPath, 'journals/INDEX.md'), 'utf8');
    for (const journal of journals) {
      const link = journal.relativePath.replace(/^journals\//, '');
      if (!index.includes(`](${link})`)) errors.push(`${journal.relativePath}: não indexado`);
    }
  }
  for (const stateFile of ['project/PROJECT_STATUS.md', 'project/START_HERE_NEXT_SESSION.md', 'project/ROADMAP.md', 'project/ADR_STATUS.md']) {
    if (existsSync(join(memoryPath, stateFile))) {
      try { readMarker(readFileSync(join(memoryPath, stateFile), 'utf8'), stateFile); } catch (error) { errors.push(error.message); }
    }
  }
  return { valid: errors.length === 0, errors, journals };
}

export function journalSection(title, lines) {
  const content = Array.isArray(lines) ? lines : [lines];
  const body = content.filter(Boolean).map((line) => line.startsWith('- ') ? line : `- ${line}`).join('\n') || '- Não informado.';
  return `## ${title}\n\n${body}\n`;
}
