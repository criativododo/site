import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { run, fail } from './core.mjs';

export function git(args, cwd, options) {
  return run('git', args, { cwd, ...options });
}

export function isGitRepository(directory) {
  const result = git(['rev-parse', '--is-inside-work-tree'], directory, { allowFailure: true });
  return result === 'true';
}

export function ensureGitRepository(directory, label) {
  if (!isGitRepository(directory)) fail(`${label} não é um repositório Git: ${directory}`);
}

function splitNull(value) {
  return value ? value.split('\0').filter(Boolean) : [];
}

function hashFile(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

export function isSensitivePath(filePath) {
  const name = filePath.toLowerCase();
  return /(^|\/)\.env(?:\.|$)/.test(name)
    || /client_secret|credential|refresh_token|secret|private[._-]?key|\.pem$|\.p12$/.test(name);
}

export function redactPath(filePath) {
  return isSensitivePath(filePath) ? '[arquivo sensível redigido]' : filePath;
}

export function sourceSnapshot(root) {
  ensureGitRepository(root, 'Repositório da aplicação');
  const tracked = splitNull(git(['ls-files', '-z'], root));
  const untracked = splitNull(git(['ls-files', '--others', '--exclude-standard', '-z'], root));
  const files = {};
  for (const filePath of new Set([...tracked, ...untracked])) {
    if (filePath.startsWith('.claude/session-memory/runtime/')) continue;
    const absolutePath = join(root, filePath);
    if (existsSync(absolutePath)) files[filePath] = hashFile(absolutePath);
  }
  const branchResult = git(['symbolic-ref', '--quiet', '--short', 'HEAD'], root, { allowFailure: true });
  return {
    head: git(['rev-parse', 'HEAD'], root),
    branch: typeof branchResult === 'string' ? branchResult : 'HEAD destacada',
    status: git(['status', '--porcelain=v1'], root),
    files,
  };
}

export function changedFilesSince(root, baseline) {
  const current = sourceSnapshot(root);
  const allPaths = new Set([...Object.keys(baseline.files), ...Object.keys(current.files)]);
  const created = [];
  const modified = [];
  const removed = [];
  for (const filePath of allPaths) {
    const before = baseline.files[filePath];
    const after = current.files[filePath];
    if (before === undefined && after !== undefined) created.push(redactPath(filePath));
    else if (before !== undefined && after === undefined) removed.push(redactPath(filePath));
    else if (before !== after) modified.push(redactPath(filePath));
  }
  const compare = (a, b) => a.localeCompare(b, 'pt-BR');
  return {
    current,
    created: created.sort(compare),
    modified: modified.sort(compare),
    removed: removed.sort(compare),
  };
}

export function commitsSince(root, baselineHead) {
  const output = git(['log', '--format=%H%x1f%h%x1f%ad%x1f%s', '--date=iso-strict', `${baselineHead}..HEAD`], root);
  if (!output) return [];
  return output.split('\n').filter(Boolean).map((line) => {
    const [hash, shortHash, date, subject] = line.split('\x1f');
    return { hash, shortHash, date, subject };
  });
}

export function workingTreeState(root) {
  const status = git(['status', '--porcelain=v1'], root);
  return status ? 'alterada' : 'limpa';
}

export function remoteState(root) {
  const upstream = git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], root, { allowFailure: true });
  if (typeof upstream !== 'string') return { upstream: null, ahead: 0, behind: 0 };
  const counts = git(['rev-list', '--left-right', '--count', `HEAD...${upstream}`], root, { allowFailure: true });
  if (typeof counts !== 'string') return { upstream, ahead: 0, behind: 0 };
  const [ahead, behind] = counts.split(/\s+/).map(Number);
  return { upstream, ahead, behind };
}

/**
 * Worktrees efêmeros por sessão (ADR-021, Fase 3): cada sessão opera em seu próprio
 * `git worktree`, isolado do repositório "hub" e de qualquer outra sessão — nenhum
 * processo compartilha um working tree mutável com outro.
 */
export function addSessionWorktree(hubPath, worktreePath, ref) {
  git(['worktree', 'add', '--detach', worktreePath, ref], hubPath);
}

export function removeSessionWorktree(hubPath, worktreePath) {
  const result = git(['worktree', 'remove', '--force', worktreePath], hubPath, { allowFailure: true });
  if (typeof result === 'string') return;
  // diretório já pode ter sido apagado manualmente; apenas limpa o registro administrativo.
  git(['worktree', 'prune'], hubPath, { allowFailure: true });
}

export function listSessionWorktrees(hubPath) {
  const output = git(['worktree', 'list', '--porcelain'], hubPath, { allowFailure: true });
  if (typeof output !== 'string' || !output) return [];
  const entries = [];
  let current = null;
  for (const line of output.split('\n')) {
    if (line.startsWith('worktree ')) {
      if (current) entries.push(current);
      current = { path: line.slice('worktree '.length) };
    } else if (current && line.startsWith('branch ')) {
      current.branch = line.slice('branch '.length);
    } else if (current && line === 'detached') {
      current.detached = true;
    }
  }
  if (current) entries.push(current);
  return entries;
}
