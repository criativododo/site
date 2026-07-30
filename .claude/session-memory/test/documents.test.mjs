import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tempDirectory } from './helpers.mjs';
import { createInitialMemory } from '../lib/scaffold.mjs';
import { REQUIRED_JOURNAL_HEADINGS, updateIndex, validateMemory, withMarker } from '../lib/documents.mjs';

test('inicializa a estrutura canônica e indexa journals obrigatórios', () => {
  const directory = tempDirectory();
  try {
    createInitialMemory(directory, { head: '0123456789abcdef' });
    assert.equal(validateMemory(directory).valid, true);
    const journalDirectory = join(directory, 'journals/2026/07');
    mkdirSync(journalDirectory, { recursive: true });
    const content = [
      '# Journal — Fixture',
      '',
      withMarker('', { endedAt: '2026-07-30T12:00:00.000Z', objective: 'Fixture', phase: 'Fase 4', sprint: 'S1', source: { head: 'abcdef0' } }).trim(),
      '',
      ...REQUIRED_JOURNAL_HEADINGS.flatMap((heading) => [`## ${heading}`, '', '- Fixture', '']),
    ].join('\n');
    writeFileSync(join(journalDirectory, '2026-07-30_0900.md'), content);
    updateIndex(directory);
    const validation = validateMemory(directory);
    assert.equal(validation.valid, true, validation.errors.join('\n'));
    assert.equal(validation.journals.length, 1);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
