import { describe, expect, test } from 'vitest';
import { resolveInitialProxyUrl } from '../src/proxyConfig';

describe('DeepSeek proxy URL resolution', () => {
  test('prefers a safe query parameter and trims it', () => {
    expect(
      resolveInitialProxyUrl({
        hostname: '77zmf.github.io',
        search: '?deepseekProxy=https%3A%2F%2Fchem-ai.example.com%2Fapi%2Fdeepseek',
        savedProxyUrl: null
      })
    ).toBe('https://chem-ai.example.com/api/deepseek');
  });

  test('uses build-time proxy URL on GitHub Pages when provided', () => {
    expect(
      resolveInitialProxyUrl({
        hostname: '77zmf.github.io',
        envProxyUrl: 'https://chem-ai.example.com/api/deepseek',
        savedProxyUrl: null
      })
    ).toBe('https://chem-ai.example.com/api/deepseek');
  });

  test('falls back to same-origin serverless API outside GitHub Pages and localhost', () => {
    expect(
      resolveInitialProxyUrl({
        hostname: 'organic-structure-miniapp.vercel.app',
        savedProxyUrl: null
      })
    ).toBe('/api/deepseek');
  });

  test('ignores unsafe proxy URL schemes', () => {
    expect(
      resolveInitialProxyUrl({
        hostname: '77zmf.github.io',
        search: '?deepseekProxy=javascript%3Aalert(1)',
        savedProxyUrl: 'data:text/plain,secret'
      })
    ).toBe('');
  });

  test('rejects protocol-relative proxy URLs', () => {
    expect(
      resolveInitialProxyUrl({
        hostname: '77zmf.github.io',
        search: '?proxy=%2F%2Fevil.example.com%2Fapi%2Fdeepseek',
        savedProxyUrl: null
      })
    ).toBe('');
  });
});
