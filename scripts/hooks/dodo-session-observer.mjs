#!/usr/bin/env node
// Hook de observação pura (Fase 1 do scripts/DODO.md). Nunca decide, nunca
// bloqueia, nunca altera o modelo — apenas registra início/fim de sessão no
// mesmo log de auditoria do Router. Qualquer falha é silenciosa: um hook de
// observação nunca pode impedir a sessão de continuar.
import { mkdirSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const decisionLog = join(root, 'scripts/logs/dodo-decisions.log');

async function main() {
  let payload = {};
  try {
    const raw = await new Promise((resolve) => {
      let data = '';
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', (chunk) => { data += chunk; });
      process.stdin.on('end', () => resolve(data));
      process.stdin.on('error', () => resolve(data));
    });
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    payload = {};
  }

  const event = payload.hook_event_name || 'unknown_event';
  const sessionId = payload.session_id || 'unknown';
  const detail = event === 'SessionStart' ? (payload.source || '') : (payload.reason || '');

  try {
    mkdirSync(join(root, 'scripts/logs'), { recursive: true });
    const line = `${new Date().toISOString()} ${event.toLowerCase()} session_id=${sessionId} detail="${detail}"\n`;
    appendFileSync(decisionLog, line);
  } catch {
    // Observação nunca pode falhar a sessão.
  }

  process.exit(0);
}

main();
