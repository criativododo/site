import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { atomicWrite, dateParts, relativePosix, resolveInside, fail } from './core.mjs';

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
  return found.map((filePath) => {
    const content = readFileSync(filePath, 'utf8');
    return { filePath, relativePath: relativePosix(memoryPath, filePath), content, meta: readMarker(content, filePath) };
  }).sort((a, b) => String(b.meta.endedAt ?? '').localeCompare(String(a.meta.endedAt ?? '')));
}

export function nextJournalPath(memoryPath, endedAt) {
  const parts = dateParts(endedAt);
  const directory = join(memoryPath, 'journals', parts.year, parts.month);
  mkdirSync(directory, { recursive: true });
  const base = `${parts.localDate}_${parts.hhmm}`;
  let attempt = 1;
  let candidate = join(directory, `${base}.md`);
  while (existsSync(candidate)) {
    attempt += 1;
    candidate = join(directory, `${base}-${String(attempt).padStart(2, '0')}.md`);
  }
  return candidate;
}

export function renderIndex(memoryPath) {
  const journals = listJournals(memoryPath);
  const rows = journals.map(({ relativePath, meta }) => {
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

export function updateIndex(memoryPath) {
  atomicWrite(join(memoryPath, 'journals/INDEX.md'), renderIndex(memoryPath));
}

export function requireMemoryFile(memoryPath, relativePath) {
  const filePath = resolveInside(memoryPath, relativePath);
  if (!existsSync(filePath)) fail(`Documento obrigatório ausente: ${relativePath}`);
  return filePath;
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
