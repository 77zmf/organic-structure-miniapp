import {
  buildDeepSeekMessages,
  directRevealGuardAnswer,
  extractDeepSeekAnswer,
  sanitizeAgentAnswer,
  shouldBlockDirectReveal,
  validateDeepSeekProxyRequest
} from '../shared/deepseekProxy';
import { findPuzzleById } from '../src/chemistry';

interface VercelRequest {
  method?: string;
  body: unknown;
  headers: Record<string, string | string[] | undefined>;
  socket: {
    remoteAddress?: string;
  };
}

interface VercelResponse {
  setHeader(name: string, value: string): void;
  status(code: number): VercelResponse;
  json(body: unknown): void;
  end(): void;
}

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';
const DEFAULT_MODEL = 'deepseek-v4-flash';
const MAX_QUESTION_LENGTH = 500;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({
      ok: true,
      provider: 'deepseek-proxy',
      configured: Boolean(process.env.DEEPSEEK_API_KEY),
      model: getModelName(),
      maxQuestionLength: MAX_QUESTION_LENGTH
    });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Only GET, POST, and OPTIONS are supported.' });
    return;
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'DeepSeek proxy is not configured.' });
    return;
  }

  const clientId = getClientId(req);
  if (!consumeRateLimit(clientId)) {
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
    return;
  }

  const validation = validateDeepSeekProxyRequest(req.body);
  if (!validation.ok) {
    res.status(validation.status).json({ error: validation.message });
    return;
  }

  const puzzle = findPuzzleById(validation.value.puzzleId);
  if (shouldBlockDirectReveal(validation.value.question, puzzle)) {
    res.status(200).json({
      provider: 'guardrail',
      answer: directRevealGuardAnswer()
    });
    return;
  }

  try {
    const upstream = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: getModelName(),
        messages: buildDeepSeekMessages(validation.value),
        thinking: { type: 'disabled' },
        temperature: 0.2,
        max_tokens: 220,
        stream: false
      })
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      res.status(502).json({
        error: 'DeepSeek upstream request failed.',
        status: upstream.status,
        detail: detail.slice(0, 300)
      });
      return;
    }

    const data = await upstream.json();
    res.status(200).json({
      provider: 'deepseek',
      answer: sanitizeAgentAnswer(extractDeepSeekAnswer(data), puzzle)
    });
  } catch (error) {
    res.status(502).json({
      error: error instanceof Error ? error.message : 'DeepSeek proxy failed.'
    });
  }
}

function getModelName(): string {
  return process.env.DEEPSEEK_MODEL || DEFAULT_MODEL;
}

function applyCors(req: VercelRequest, res: VercelResponse): void {
  const rawOrigin = req.headers.origin;
  const origin = Array.isArray(rawOrigin) ? rawOrigin[0] : rawOrigin;
  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'https://77zmf.github.io,http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function getClientId(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress ?? 'unknown';
}

function consumeRateLimit(clientId: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(clientId);

  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(clientId, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (bucket.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  bucket.count += 1;
  return true;
}
