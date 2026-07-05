import { describe, expect, test } from 'vitest';
import {
  buildDeepSeekMessages,
  extractDeepSeekAnswer,
  validateDeepSeekProxyRequest
} from '../shared/deepseekProxy';

describe('deepseek proxy request validation', () => {
  test('accepts a valid puzzle question', () => {
    const result = validateDeepSeekProxyRequest({
      puzzleId: 'puzzle-ethanol',
      question: '能否与金属钠反应？',
      history: [{ role: 'agent', text: '已给出分子式。' }]
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.question).toBe('能否与金属钠反应？');
      expect(result.value.history).toHaveLength(1);
    }
  });

  test('rejects overly long questions', () => {
    const result = validateDeepSeekProxyRequest({
      puzzleId: 'puzzle-ethanol',
      question: '能'.repeat(501)
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
      expect(result.message).toContain('500');
    }
  });
});

describe('deepseek prompt construction', () => {
  test('builds constrained messages without exposing the API key', () => {
    const messages = buildDeepSeekMessages({
      puzzleId: 'puzzle-ethanol',
      question: '能否与金属钠反应？',
      history: []
    });

    expect(messages[0].role).toBe('system');
    expect(messages[0].content).toContain('不要直接公布目标物名称');
    expect(messages[0].content).toContain('乙醇');
    expect(JSON.stringify(messages)).not.toContain('sk-');
  });
});

describe('deepseek response parsing', () => {
  test('extracts assistant content from OpenAI-compatible response', () => {
    const answer = extractDeepSeekAnswer({
      choices: [{ message: { content: '能。含有羟基，可与钠反应放出 H2。' } }]
    });

    expect(answer).toBe('能。含有羟基，可与钠反应放出 H2。');
  });
});
