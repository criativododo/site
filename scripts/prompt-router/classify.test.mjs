import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classify } from './classify.mjs';

test('prompt vazio cai em fallback neutro MID/other/sonnet', () => {
  const result = classify('');
  assert.equal(result.complexity, 'MID');
  assert.equal(result.taskType, 'other');
  assert.equal(result.suggestedModel, 'sonnet');
  assert.equal(result.confidence, 0);
  assert.equal(result.version, '1.0.0');
});

test('prompt curto e simples classifica LOW/haiku', () => {
  const result = classify('Corrige esse typo aqui');
  assert.equal(result.complexity, 'LOW');
  assert.equal(result.suggestedModel, 'haiku');
});

test('prompt de correção de bug classifica taskType=debug', () => {
  const result = classify('Esse endpoint está com um bug, o erro acontece quando o usuário salva o formulário e precisa de correção detalhada olhando os logs');
  assert.equal(result.taskType, 'debug');
});

test('prompt de pesquisa/pergunta classifica taskType=research', () => {
  const result = classify('Pesquise e explique como funciona o cache do Next.js e compare com outras abordagens');
  assert.equal(result.taskType, 'research');
});

test('prompt de nova funcionalidade classifica taskType=feature', () => {
  const result = classify('Implemente uma nova tela de perfil da influenciadora seguindo o design system aprovado');
  assert.equal(result.taskType, 'feature');
});

test('prompt com sinal explícito de arquitetura classifica HIGH/opus', () => {
  const result = classify('Precisamos refatorar a arquitetura de autenticação em múltiplas etapas, envolve migração de dados e mudança de fluxo em várias fases');
  assert.equal(result.complexity, 'HIGH');
  assert.equal(result.suggestedModel, 'opus');
});

test('prompt longo sem palavra-chave de complexidade ainda classifica HIGH pelo tamanho', () => {
  const longText = 'preciso que você olhe com calma este trecho '.repeat(20);
  const result = classify(longText);
  assert.equal(result.complexity, 'HIGH');
});

test('contrato sempre inclui os 7 campos obrigatórios', () => {
  const result = classify('teste qualquer');
  for (const field of ['version', 'complexity', 'taskType', 'confidence', 'reasoning', 'suggestedModel', 'metadata']) {
    assert.ok(field in result, `campo ausente: ${field}`);
  }
  assert.equal(result.metadata.source, 'heuristic-v1');
});

test('classify é pura: mesma entrada produz mesma saída, sem efeitos colaterais', () => {
  const a = classify('Implemente uma nova funcionalidade de pagamento');
  const b = classify('Implemente uma nova funcionalidade de pagamento');
  assert.deepEqual(a, b);
});
