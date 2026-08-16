import { describe, expect, test } from 'vitest';
import { DEFAULT_DEEPSEEK_PROXY_URL, resolveInitialProxyUrl } from '../src/proxyConfig';

describe('DeepSeek proxy URL resolution', () => {
  test('prefers a safe query parameter and trims it', () => {
    expect(
      resolveInitialProxyUrl({
        hostname: '77zmf.github.io',
        search: '?deepseekProxy=https%3A%2F%2Fchem-ai.example.com%2Fapi%2Fdeepseek',
      })
    ).toBe('https://chem-ai.example.com/api/deepseek');
  });

  test('uses build-time proxy URL on GitHub Pages when provided', () => {
    expect(
      resolveInitialProxyUrl({
        hostname: '77zmf.github.io',
        envProxyUrl: 'https://chem-ai.example.com/api/deepseek'
      })
    ).toBe('https://chem-ai.example.com/api/deepseek');
  });

  test('falls back to same-origin serverless API outside GitHub Pages and localhost', () => {
    expect(
      resolveInitialProxyUrl({
        hostname: 'organic-structure-miniapp.vercel.app'
      })
    ).toBe('/api/deepseek');
  });

  test('automatically uses the verified managed proxy on GitHub Pages', () => {
    expect(resolveInitialProxyUrl({ hostname: '77zmf.github.io' })).toBe(DEFAULT_DEEPSEEK_PROXY_URL);
  });

  test('ignores an unsafe query override on GitHub Pages', () => {
    expect(
      resolveInitialProxyUrl({
        hostname: '77zmf.github.io',
        search: '?deepseekProxy=javascript%3Aalert(1)'
      })
    ).toBe(DEFAULT_DEEPSEEK_PROXY_URL);
  });

  test('rejects protocol-relative proxy URLs', () => {
    expect(
      resolveInitialProxyUrl({
        hostname: '77zmf.github.io',
        search: '?proxy=%2F%2Fevil.example.com%2Fapi%2Fdeepseek'
      })
    ).toBe(DEFAULT_DEEPSEEK_PROXY_URL);
  });

  test('uses the rule assistant on local development hosts', () => {
    expect(resolveInitialProxyUrl({ hostname: '127.0.0.1' })).toBe('');
  });
});
