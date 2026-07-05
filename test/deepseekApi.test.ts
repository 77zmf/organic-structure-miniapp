import { afterEach, describe, expect, test, vi } from 'vitest';
import handler from '../api/deepseek';

interface MockResponse {
  headers: Record<string, string>;
  statusCode: number;
  body: unknown;
  ended: boolean;
  setHeader(name: string, value: string): void;
  status(code: number): MockResponse;
  json(body: unknown): void;
  end(): void;
}

describe('deepseek api handler', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.DEEPSEEK_API_KEY;
    delete process.env.DEEPSEEK_MODEL;
    delete process.env.ALLOWED_ORIGINS;
  });

  test('returns 503 when server-side API key is missing', async () => {
    const response = createResponse();

    await handler(createRequest({ question: '能否与金属钠反应？' }), response);

    expect(response.statusCode).toBe(503);
    expect(response.body).toEqual({ error: 'DeepSeek proxy is not configured.' });
  });

  test('reports proxy health without exposing the server-side key', async () => {
    process.env.DEEPSEEK_API_KEY = 'unit-test-key';
    process.env.DEEPSEEK_MODEL = 'deepseek-v4-pro';
    const response = createResponse();

    await handler(createRequest({ method: 'GET' }), response);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      ok: true,
      provider: 'deepseek-proxy',
      configured: true,
      model: 'deepseek-v4-pro',
      maxQuestionLength: 500
    });
    expect(JSON.stringify(response.body)).not.toContain('unit-test-key');
  });

  test('blocks direct answer requests before calling DeepSeek', async () => {
    process.env.DEEPSEEK_API_KEY = 'unit-test-key';
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const response = createResponse();

    await handler(createRequest({ question: '这个物质叫什么名字？' }), response);

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({ provider: 'guardrail' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('redacts leaked target terms from upstream DeepSeek replies', async () => {
    process.env.DEEPSEEK_API_KEY = 'unit-test-key';
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '它是乙醇，结构简式是 CH3CH2OH。' } }]
      })
    });
    vi.stubGlobal('fetch', fetchMock);
    const response = createResponse();

    await handler(createRequest({ question: '它能和金属钠反应吗？' }), response);

    expect(response.statusCode).toBe(200);
    expect(JSON.stringify(response.body)).not.toContain('乙醇');
    expect(JSON.stringify(response.body)).not.toContain('CH3CH2OH');
    expect(response.body).toMatchObject({ provider: 'deepseek' });

    const upstreamBody = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(upstreamBody).toMatchObject({
      model: 'deepseek-v4-flash',
      thinking: { type: 'disabled' },
      stream: false
    });
  });
});

function createRequest(options: { question?: string; method?: string } = {}) {
  const { method = 'POST', ...body } = options;
  return {
    method,
    body: {
      puzzleId: 'puzzle-ethanol',
      history: [],
      question: '能否与金属钠反应？',
      ...body
    },
    headers: {
      origin: 'https://77zmf.github.io',
      'x-forwarded-for': `192.0.2.${Math.floor(Math.random() * 200) + 1}`
    },
    socket: {}
  };
}

function createResponse(): MockResponse {
  return {
    headers: {},
    statusCode: 200,
    body: undefined,
    ended: false,
    setHeader(name: string, value: string) {
      this.headers[name] = value;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(body: unknown) {
      this.body = body;
    },
    end() {
      this.ended = true;
    }
  };
}
