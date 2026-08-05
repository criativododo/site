// Policy Engine — Prompt Intelligence Router (Fase 3, ver scripts/DODO.md).
//
// Responsabilidade única: transformar o contrato do Classification Engine em
// uma política de execução (additionalContext + recomendações). Função pura:
// não lê prompt_text, não sabe como a classificação foi produzida, não
// realiza I/O. Só conhece o formato do contrato (version, complexity,
// taskType, confidence, reasoning, suggestedModel, metadata).

const READ_STRATEGY_BY_COMPLEXITY = {
  LOW: 'leitura direcionada (arquivo/trecho específico)',
  MID: 'leitura direcionada, ampliar só se necessário',
  HIGH: 'leitura ampla priorizada; considerar subagente de pesquisa',
};

const APPROACH_BY_TASK_TYPE = {
  debug: 'diagnóstico de causa raiz antes de propor correção',
  research: 'levantar fontes antes de responder; evitar responder de memória',
  feature: 'confirmar Produto/UX antes de codar',
  docs: 'checar fonte única de verdade antes de editar',
  other: null,
};

function suggestTools(taskType, complexity) {
  const tools = [];
  if (taskType === 'research') tools.push('WebSearch/WebFetch');
  if (taskType === 'debug') tools.push('Grep/Read direcionado');
  if (taskType === 'feature' && complexity !== 'LOW') tools.push('Explore (mapear código antes de editar)');
  return tools;
}

function suggestSubagents(complexity, taskType) {
  if (complexity === 'HIGH' && (taskType === 'research' || taskType === 'feature')) {
    return ['fork/agent para isolar investigação extensa'];
  }
  return [];
}

function buildAdditionalContext({ complexity, taskType, suggestedModel, suggestedApproach, suggestedReadStrategy, suggestedTools, suggestedSubagents }) {
  const parts = [`[prompt-router] complexidade=${complexity} tipo=${taskType} modelo=${suggestedModel}`];
  if (suggestedApproach) parts.push(`abordagem: ${suggestedApproach}`);
  if (suggestedReadStrategy) parts.push(`leitura: ${suggestedReadStrategy}`);
  if (suggestedTools.length > 0) parts.push(`ferramentas: ${suggestedTools.join(', ')}`);
  if (suggestedSubagents.length > 0) parts.push(`subagente: ${suggestedSubagents.join('; ')}`);
  return parts.join(' | ');
}

/**
 * @param {object} classification contrato produzido por classify()
 */
export function derivePolicy(classification) {
  const complexity = classification?.complexity ?? 'MID';
  const taskType = classification?.taskType ?? 'other';
  const suggestedModel = classification?.suggestedModel ?? 'sonnet';

  const suggestedApproach = APPROACH_BY_TASK_TYPE[taskType] ?? null;
  const suggestedReadStrategy = READ_STRATEGY_BY_COMPLEXITY[complexity] ?? null;
  const suggestedTools = suggestTools(taskType, complexity);
  const suggestedSubagents = suggestSubagents(complexity, taskType);

  return {
    additionalContext: buildAdditionalContext({
      complexity,
      taskType,
      suggestedModel,
      suggestedApproach,
      suggestedReadStrategy,
      suggestedTools,
      suggestedSubagents,
    }),
    suggestedApproach,
    suggestedTools,
    suggestedSubagents,
    suggestedReadStrategy,
  };
}
