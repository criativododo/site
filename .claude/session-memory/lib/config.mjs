import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { isAbsolute, resolve } from 'node:path';
import { readJson, fail } from './core.mjs';

/**
 * Resolve o repositório canônico de memória sem depender de process.cwd(): caminho
 * absoluto é usado como está; caminho relativo (env var ou config.json) é resolvido
 * contra $HOME, não contra o diretório de invocação — mesmo resultado a partir do
 * checkout principal, de qualquer worktree, ou de qualquer cwd arbitrário.
 */
export function resolveMemoryPath(memoryDirectory) {
  const envValue = process.env.CRIATIVODODO_MEMORY_DIR;
  const value = envValue && envValue.trim() ? envValue.trim() : memoryDirectory;
  if (!value) fail('Configuração de memória incompleta: memoryDirectory ausente.');
  return isAbsolute(value) ? value : resolve(homedir(), value.replace(/^\.\.\//, ''));
}

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
    memoryPath: resolveMemoryPath(config.memoryDirectory),
    runtimePath: resolve(root, '.claude/session-memory/runtime'),
  };
}
