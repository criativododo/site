import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tempDirectory, initGitRepository, git } from './helpers.mjs';
import { changedFilesSince, sourceSnapshot } from '../lib/git.mjs';

test('detecta alterações desde um baseline mesmo com árvore inicialmente suja', () => {
  const directory = tempDirectory();
  try {
    initGitRepository(directory);
    writeFileSync(join(directory, 'preexistente.txt'), 'antes\n');
    const baseline = sourceSnapshot(directory);
    writeFileSync(join(directory, 'preexistente.txt'), 'depois\n');
    writeFileSync(join(directory, 'novo.txt'), 'novo\n');
    writeFileSync(join(directory, '.env'), 'TOKEN=segredo\n');
    writeFileSync(join(directory, 'README.md'), 'alterado\n');
    const changes = changedFilesSince(directory, baseline);
    assert.deepEqual(new Set(changes.modified), new Set(['README.md', 'preexistente.txt']));
    assert.deepEqual(changes.created, ['[arquivo sensível redigido]', 'novo.txt']);
    assert.deepEqual(changes.removed, []);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
