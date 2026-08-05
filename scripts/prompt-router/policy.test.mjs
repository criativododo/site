import { test } from 'node:test';
import assert from 'node:assert/strict';
import { derivePolicy } from './policy.mjs';

function classification(overrides = {}) {
  return {
    version: '1.0.0',
    complexity: 'MID',
    taskType: 'other',
    confidence: 0.5,
    reasoning: [],
    suggestedModel: 'sonnet',
    metadata: { source: 'heuristic-v1', promptLength: 10, matchedKeywords: [] },
    ...overrides,
  };
}

test('additionalContext sempre traz complexidade, tipo e modelo', () => {
  const policy = derivePolicy(classification());
  assert.match(policy.additionalContext, /complexidade=MID/);
  assert.match(policy.additionalContext, /tipo=other/);
  assert.match(policy.additionalContext, /modelo=sonnet/);
});

test('taskType=debug sugere abordagem e ferramentas de depuração', () => {
  const policy = derivePolicy(classification({ taskType: 'debug' }));
  assert.equal(policy.suggestedApproach, 'diagnóstico de causa raiz antes de propor correção');
  assert.ok(policy.suggestedTools.includes('Grep/Read direcionado'));
});

test('taskType=research sugere WebSearch/WebFetch', () => {
  const policy = derivePolicy(classification({ taskType: 'research' }));
  assert.ok(policy.suggestedTools.includes('WebSearch/WebFetch'));
});

test('complexidade HIGH + research sugere subagente', () => {
  const policy = derivePolicy(classification({ complexity: 'HIGH', taskType: 'research' }));
  assert.equal(policy.suggestedSubagents.length, 1);
});

test('complexidade LOW nunca sugere subagente', () => {
  const policy = derivePolicy(classification({ complexity: 'LOW', taskType: 'feature' }));
  assert.equal(policy.suggestedSubagents.length, 0);
});

test('taskType=other não tem suggestedApproach nem ferramentas', () => {
  const policy = derivePolicy(classification({ taskType: 'other' }));
  assert.equal(policy.suggestedApproach, null);
  assert.equal(policy.suggestedTools.length, 0);
});

test('additionalContext é uma única linha curta (sem quebras de linha, <300 chars)', () => {
  const policy = derivePolicy(classification({ complexity: 'HIGH', taskType: 'research' }));
  assert.ok(!policy.additionalContext.includes('\n'));
  assert.ok(policy.additionalContext.length < 300, `tamanho: ${policy.additionalContext.length}`);
});

test('derivePolicy tolera classificação incompleta (fallback neutro, não lança erro)', () => {
  const policy = derivePolicy({});
  assert.match(policy.additionalContext, /complexidade=MID/);
  assert.match(policy.additionalContext, /modelo=sonnet/);
});

test('derivePolicy é pura: mesma entrada produz mesma saída', () => {
  const input = classification({ complexity: 'HIGH', taskType: 'feature' });
  const a = derivePolicy(input);
  const b = derivePolicy(input);
  assert.deepEqual(a, b);
});
