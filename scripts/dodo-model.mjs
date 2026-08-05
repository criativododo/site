#!/usr/bin/env node
// Lógica de decisão do scripts/dodo. Ver scripts/DODO.md.
//
// Só imprime em stdout o alias final do modelo ("haiku" | "sonnet" | "opus"),
// para que scripts/dodo capture exatamente esse valor. Todo diagnóstico vai
// para stderr. Qualquer falha em qualquer fonte é silenciosa e cai para a
// próxima prioridade — nunca impede o lançamento do Claude Code.

import { execFileSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2];
if (!root) {
  process.stderr.write('dodo: uso: dodo-model.mjs <root_dir>\n');
  process.stdout.write('sonnet\n');
  process.exit(0);
}

const memoryCli = join(root, '.claude/session-memory/bin/session-memory.mjs');
const TAG_PATTERN = /^proxima-sessao:(LOW|MID|HIGH)$/i;
const TIER_TO_MODEL = { LOW: 'haiku', MID: 'sonnet', HIGH: 'opus' };

function decide(reason, model) {
  process.stderr.write(`dodo: modelo "${model}" via ${reason}\n`);
  process.stdout.write(`${model}\n`);
  process.exit(0);
}

function runCli(args) {
  return execFileSync('node', [memoryCli, ...args], { cwd: root, encoding: 'utf8', timeout: 5000 });
}

function extractMarker(content) {
  const start = content.indexOf('<!-- session-memory');
  const end = content.indexOf('-->', start);
  if (start === -1 || end === -1) return null;
  return JSON.parse(content.slice(start + '<!-- session-memory'.length, end).trim());
}

/** Prioridade 1 — tag de complexidade gravada pelo /fim no journal mais recente. */
function fromLatestJournalTag() {
  if (!existsSync(memoryCli)) return null;
  const journals = JSON.parse(runCli(['journal']));
  const latest = Array.isArray(journals) ? journals[0] : null;
  if (!latest?.path) return null;
  const meta = extractMarker(runCli(['journal', '--open', latest.path]));
  const tag = (meta?.tags ?? []).find((value) => TAG_PATTERN.test(value));
  if (!tag) return null;
  const tier = tag.match(TAG_PATTERN)[1].toUpperCase();
  return TIER_TO_MODEL[tier];
}

/**
 * Prioridade 2 — saída estruturada de `scripts/saude --json`.
 * scripts/render/json.js ainda é um stub (0 bytes) nesta versão do repositório:
 * a fonte existe na arquitetura, mas não produz JSON ainda. O gate abaixo evita
 * rodar o relatório completo (caro) só para descobrir isso a cada execução;
 * quando o renderer for implementado, esta fonte passa a funcionar sem
 * nenhuma mudança neste arquivo.
 */
function fromSaudeJson() {
  const rendererPath = join(root, 'scripts/render/json.js');
  if (!existsSync(rendererPath) || statSync(rendererPath).size === 0) return null;
  const output = execFileSync(join(root, 'scripts/saude'), ['--json'], { cwd: root, encoding: 'utf8', timeout: 5000 });
  const report = JSON.parse(output);
  const tier = report?.recommendedComplexity;
  return tier && TIER_TO_MODEL[tier] ? TIER_TO_MODEL[tier] : null;
}

/**
 * Prioridade 3 — estado da sessão (`session-memory.mjs status`).
 * Sinal fraco por natureza: só empurra para "sonnet" quando há bloqueios
 * registrados (sessão de investigação/correção). Nunca resolve para "haiku"
 * ou "opus" sozinho — ausência de bloqueio não é evidência de tarefa simples.
 */
function fromSessionState() {
  if (!existsSync(memoryCli)) return null;
  const status = JSON.parse(runCli(['status']));
  return Array.isArray(status.blockers) && status.blockers.length > 0 ? 'sonnet' : null;
}

const sources = [
  ['tag de complexidade do último journal', fromLatestJournalTag],
  ['scripts/saude --json', fromSaudeJson],
  ['estado da sessão (bloqueios ativos)', fromSessionState],
];

for (const [reason, source] of sources) {
  try {
    const model = source();
    if (model) decide(reason, model);
  } catch (error) {
    process.stderr.write(`dodo: fonte "${reason}" falhou, seguindo para a próxima (${error.message})\n`);
  }
}

decide('fallback (nenhuma fonte determinou o modelo com segurança)', 'sonnet');
