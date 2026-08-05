#!/usr/bin/env node
// Hook UserPromptSubmit — orquestrador do Prompt Intelligence Router
// (Fase 3 do scripts/DODO.md). Não contém regra de negócio: só lê o payload
// do stdin, chama o Classification Engine e o Policy Engine, devolve
// additionalContext e registra auditoria. Nunca bloqueia o prompt por falha
// própria — qualquer erro cai em silêncio e o hook sai 0 sem additionalContext,
// exatamente como o observer da Fase 1.
import { mkdirSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { classify } from '../prompt-router/classify.mjs';
import { derivePolicy } from '../prompt-router/policy.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const decisionLog = join(root, 'scripts/logs/dodo-decisions.log');

function logAudit(classification) {
  try {
    mkdirSync(join(root, 'scripts/logs'), { recursive: true });
    const line = `${new Date().toISOString()} prompt-router complexity=${classification.complexity} `
      + `taskType=${classification.taskType} confidence=${classification.confidence.toFixed(2)} `
      + `suggestedModel=${classification.suggestedModel} source=${classification.metadata.source}\n`;
    appendFileSync(decisionLog, line);
  } catch {
    // auditoria nunca pode falhar o hook.
  }
}

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', () => resolve(data));
  });
}

async function main() {
  let payload = {};
  try {
    const raw = await readStdin();
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    payload = {};
  }

  try {
    const classification = classify(payload.prompt_text ?? '');
    const policy = derivePolicy(classification);
    logAudit(classification);

    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
        additionalContext: policy.additionalContext,
      },
    }));
  } catch {
    // Falha de classificação/política nunca pode impedir o envio do prompt.
  }

  process.exit(0);
}

main();
