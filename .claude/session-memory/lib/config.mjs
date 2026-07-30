import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { readJson, fail } from './core.mjs';

export function loadConfig(root) {
  const configPath = resolve(root, '.claude/session-memory/config.json');
  const localPath = resolve(root, '.claude/session-memory/config.local.json');
  const config = { ...readJson(configPath), ...(existsSync(localPath) ? readJson(localPath) : {}) };
  if (config.schemaVersion !== 1) fail(`schemaVersion não suportado em ${configPath}.`);
  if (!config.memoryRepositoryUrl || !config.memoryDirectory) fail('Configuração de memória incompleta.');
  return {
    ...config,
    root,
    configPath,
    memoryPath: resolve(root, config.memoryDirectory),
    runtimePath: resolve(root, '.claude/session-memory/runtime'),
  };
}
