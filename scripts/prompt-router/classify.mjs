// Classification Engine — Prompt Intelligence Router (Fase 3, ver scripts/DODO.md).
//
// Responsabilidade única: receber o texto do prompt e devolver um contrato
// estruturado e versionado. Não conhece hooks, não conhece additionalContext,
// não realiza I/O — função pura, testável isoladamente.
//
// `context` é reservado para futuras fontes de classificação (estado da
// sessão, journals, git, ou até um hook `type: "prompt"` que substitua a
// heurística abaixo). A interface pública — `classify(promptText, context)` —
// não muda quando essas fontes forem adicionadas; apenas o corpo da função
// (ou uma implementação alternativa com a mesma assinatura) muda.

const CONTRACT_VERSION = '1.0.0';

const TASK_TYPE_PATTERNS = {
  debug: [/\bbugs?\b/i, /\berros?\b/i, /\bfalh(a|ou|ando)\b/i, /\bquebr(ou|ando)\b/i, /\bcorrigi?r\b/i, /n[aã]o funciona/i, /\bconserta/i],
  research: [/\bpesquisa/i, /\binvestigu?(e|ar)\b/i, /\bexplique\b/i, /\bo que voc[eê] acha\b/i, /\bcompar(e|ar)\b/i, /\bavali(e|ar)\b/i],
  feature: [/\bimplement(e|ar|ação)\b/i, /\bcri(e|ar)\b/i, /\badicion(e|ar)\b/i, /\bconstru(a|ir)\b/i, /\bnov[ao]\s+(tela|funcionalidade|endpoint|componente|fluxo)/i],
  docs: [/\bdocument(e|ar|ação)\b/i, /\breadme\b/i, /\bADR\b/, /\bregistr(e|ar)\b/i],
};

const HIGH_COMPLEXITY_PATTERNS = [
  /\barquitetura\b/i,
  /\bmigra[cç][aã]o\b/i,
  /\brefator(ar|ação)\b/i,
  /\bm[uú]ltiplas?\s+etapas\b/i,
  /\bv[aá]rias?\s+etapas\b/i,
  /\bfase\b/i,
];

const LOW_COMPLEXITY_PATTERNS = [
  /\bpequeno\b/i,
  /\bapenas\b/i,
  /\bs[oó]\s/i,
  /\btypo\b/i,
  /\brenom(e|ear)\b/i,
  /\bum ajuste\b/i,
  /\buma linha\b/i,
];

const MODEL_BY_COMPLEXITY = { LOW: 'haiku', MID: 'sonnet', HIGH: 'opus' };

const SHORT_PROMPT_THRESHOLD = 120;
const LONG_PROMPT_THRESHOLD = 600;

function matchAll(patterns, text) {
  const found = [];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) found.push(match[0]);
  }
  return found;
}

function classifyTaskType(text) {
  let best = { type: 'other', matches: [] };
  for (const [type, patterns] of Object.entries(TASK_TYPE_PATTERNS)) {
    const matches = matchAll(patterns, text);
    if (matches.length > best.matches.length) {
      best = { type, matches };
    }
  }
  return best;
}

function classifyComplexity(text, taskType) {
  const highMatches = matchAll(HIGH_COMPLEXITY_PATTERNS, text);
  if (highMatches.length > 0) {
    return { level: 'HIGH', matches: highMatches, reason: 'sinal explícito de alta complexidade' };
  }
  if (text.length > LONG_PROMPT_THRESHOLD) {
    return { level: 'HIGH', matches: [], reason: `prompt longo (>${LONG_PROMPT_THRESHOLD} caracteres)` };
  }

  const lowMatches = matchAll(LOW_COMPLEXITY_PATTERNS, text);
  if (lowMatches.length > 0) {
    return { level: 'LOW', matches: lowMatches, reason: 'sinal explícito de baixa complexidade' };
  }
  if (text.length < SHORT_PROMPT_THRESHOLD && taskType !== 'feature') {
    return { level: 'LOW', matches: [], reason: `prompt curto (<${SHORT_PROMPT_THRESHOLD} caracteres)` };
  }

  return { level: 'MID', matches: [], reason: 'nenhum sinal forte; classificação default' };
}

function emptyPromptResult() {
  return {
    version: CONTRACT_VERSION,
    complexity: 'MID',
    taskType: 'other',
    confidence: 0,
    reasoning: ['prompt vazio ou não textual; fallback neutro'],
    suggestedModel: 'sonnet',
    metadata: { source: 'heuristic-v1', promptLength: 0, matchedKeywords: [] },
  };
}

/**
 * @param {string} promptText
 * @param {object} [context] reservado para futuras fontes de sinal (não usado na V1)
 */
export function classify(promptText, context = {}) {
  void context;

  const text = typeof promptText === 'string' ? promptText.trim() : '';
  if (!text) return emptyPromptResult();

  const taskTypeResult = classifyTaskType(text);
  const complexityResult = classifyComplexity(text, taskTypeResult.type);

  const totalSignals = taskTypeResult.matches.length + complexityResult.matches.length;
  const confidence = totalSignals === 0 ? 0.3 : Math.min(0.5 + totalSignals * 0.15, 0.95);

  return {
    version: CONTRACT_VERSION,
    complexity: complexityResult.level,
    taskType: taskTypeResult.type,
    confidence,
    reasoning: [
      complexityResult.reason,
      taskTypeResult.matches.length > 0
        ? `tipo "${taskTypeResult.type}" via palavra-chave (${taskTypeResult.matches[0]})`
        : 'tipo "other" (nenhuma palavra-chave reconhecida)',
    ],
    suggestedModel: MODEL_BY_COMPLEXITY[complexityResult.level],
    metadata: {
      source: 'heuristic-v1',
      promptLength: text.length,
      matchedKeywords: [...taskTypeResult.matches, ...complexityResult.matches],
    },
  };
}
