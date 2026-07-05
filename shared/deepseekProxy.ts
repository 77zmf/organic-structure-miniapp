import {
  compounds,
  type Compound,
  type FormulaPuzzle,
  findCompoundById,
  findPuzzleById
} from '../src/chemistry';

export type ChatRole = 'student' | 'agent';

export interface DeepSeekProxyPayload {
  puzzleId: string;
  question: string;
  history?: Array<{ role: ChatRole; text: string }>;
}

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export type ValidationResult =
  | { ok: true; value: DeepSeekProxyPayload }
  | { ok: false; status: number; message: string };

export interface DeepSeekChatResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
}

export function validateDeepSeekProxyRequest(input: unknown): ValidationResult {
  if (!input || typeof input !== 'object') {
    return { ok: false, status: 400, message: '请求体必须是 JSON 对象。' };
  }

  const record = input as Record<string, unknown>;
  const puzzleId = typeof record.puzzleId === 'string' ? record.puzzleId.trim() : '';
  const question = typeof record.question === 'string' ? record.question.trim() : '';

  if (!puzzleId) {
    return { ok: false, status: 400, message: '缺少 puzzleId。' };
  }

  try {
    findPuzzleById(puzzleId);
  } catch {
    return { ok: false, status: 400, message: '未知的题目 ID。' };
  }

  if (!question) {
    return { ok: false, status: 400, message: '问题不能为空。' };
  }

  if (question.length > 500) {
    return { ok: false, status: 400, message: '问题不能超过 500 个字符。' };
  }

  const history = Array.isArray(record.history)
    ? record.history
        .slice(-8)
        .map((item) => normalizeHistoryItem(item))
        .filter((item): item is { role: ChatRole; text: string } => Boolean(item))
    : [];

  return { ok: true, value: { puzzleId, question, history } };
}

export function buildDeepSeekMessages(payload: DeepSeekProxyPayload): DeepSeekMessage[] {
  const puzzle = findPuzzleById(payload.puzzleId);
  const compound = findCompoundById(puzzle.targetCompoundId);
  const history = payload.history ?? [];

  return [
    {
      role: 'system',
      content: [
        '你是高中化学“有机化合物结构测定”章节的推理型助教。',
        '任务是根据隐藏目标物的实验性质回答学生问题，帮助学生逐步推理。',
        '不要直接公布目标物名称、结构简式或最终答案；如果学生要求直接告诉答案，要拒绝并引导其继续问实验性质。',
        '学生可以问隐藏目标物能否与某试剂反应，也可以问它能否与另一个高中常见有机物反应；只回答性质、条件、现象和反应类型，不要说出隐藏目标物名称或结构。',
        '回答必须符合高中化学范围，语言简洁，优先说明“能/不能”、依据官能团、可观察现象。',
        '如果问题超出题目范围，只给出下一步可验证实验建议。',
        `隐藏目标物：${compound.name}；分子式：${compound.formula}；结构简式：${compound.structureFormula}；官能团：${compound.functionalGroups.join(', ')}；性质摘要：${compound.summary}`,
        `候选结构：${puzzle.possibleStructures.join('、')}`
      ].join('\n')
    },
    {
      role: 'user',
      content: `当前题目分子式：${puzzle.formula}\n初始提示：${puzzle.openingHint}`
    },
    ...history.map((message): DeepSeekMessage => ({
      role: message.role === 'agent' ? 'assistant' : 'user',
      content: message.text
    })),
    {
      role: 'user',
      content: payload.question
    }
  ];
}

export function extractDeepSeekAnswer(data: DeepSeekChatResponse): string {
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('DeepSeek response did not include assistant content.');
  }
  return content;
}

export function shouldBlockDirectReveal(question: string, puzzle: FormulaPuzzle): boolean {
  const normalized = normalizeQuestion(question);
  const target = findCompoundById(puzzle.targetCompoundId);
  const asksReveal =
    normalized.includes('答案') ||
    normalized.includes('直接') ||
    normalized.includes('结构') ||
    normalized.includes('告诉我') ||
    normalized.includes('叫什么') ||
    normalized.includes('名字') ||
    normalized.includes('名称') ||
    normalized.includes('哪种') ||
    normalized.includes('哪个有机物') ||
    normalized.includes('最终') ||
    normalized.includes('目标物') ||
    normalized.includes('隐藏') ||
    normalized.includes('提示词') ||
    normalized.includes('prompt') ||
    normalized.includes('system') ||
    normalized.includes('忽略') ||
    normalized.includes('规则');
  const namesTarget = target.aliases.some((alias) => normalized.includes(normalizeQuestion(alias)));

  return asksReveal || (normalized.includes('是不是') && namesTarget);
}

export function directRevealGuardAnswer(): string {
  return '先不直接公布结构。你可以继续问一个实验性质，例如是否能与钠、碳酸氢钠、银氨溶液或溴的四氯化碳溶液反应。';
}

export function sanitizeAgentAnswer(answer: string, puzzle: FormulaPuzzle): string {
  const target = findCompoundById(puzzle.targetCompoundId);
  const forbiddenTerms = redactionTermsFor(target)
    .filter((term) => normalizeQuestion(term) !== normalizeQuestion(target.formula))
    .sort((a, b) => b.length - a.length);
  const protectedRanges = compounds
    .filter((compound) => compound.id !== target.id)
    .flatMap((compound) => redactionTermsFor(compound).flatMap((term) => findTermRanges(answer, term)));
  const replacements: Array<{ start: number; end: number }> = [];

  for (const term of forbiddenTerms) {
    for (const range of findTermRanges(answer, term)) {
      if (rangesContainAny(range, protectedRanges) || rangesOverlapAny(range, replacements)) continue;
      replacements.push(range);
    }
  }

  if (replacements.length === 0) {
    return answer;
  }

  const sanitized = replacements
    .sort((a, b) => b.start - a.start)
    .reduce((safeAnswer, range) => `${safeAnswer.slice(0, range.start)}该隐藏目标${safeAnswer.slice(range.end)}`, answer);

  return `${sanitized}\n\n我不能直接公布结构。请继续通过实验性质完成判断。`;
}

function normalizeHistoryItem(input: unknown): { role: ChatRole; text: string } | null {
  if (!input || typeof input !== 'object') {
    return null;
  }

  const record = input as Record<string, unknown>;
  const role = record.role === 'student' || record.role === 'agent' ? record.role : null;
  const text = typeof record.text === 'string' ? record.text.trim().slice(0, 800) : '';

  if (!role || !text) {
    return null;
  }

  return { role, text };
}

function normalizeQuestion(value: string): string {
  return value.toLowerCase().replace(/[？?！!，,。.、\s]/g, '');
}

function redactionTermsFor(compound: Compound): string[] {
  return Array.from(
    new Set(
      [compound.name, compound.structureFormula, ...compound.aliases]
        .map((term) => term.trim())
        .filter((term) => term.length > 1 || /[\u3400-\u9fff]/.test(term))
    )
  );
}

function findTermRanges(text: string, term: string): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = [];
  const lowerText = text.toLowerCase();
  const lowerTerm = term.toLowerCase();
  let index = lowerText.indexOf(lowerTerm);

  while (index !== -1) {
    ranges.push({ start: index, end: index + term.length });
    index = lowerText.indexOf(lowerTerm, index + term.length);
  }

  return ranges;
}

function rangesOverlapAny(
  range: { start: number; end: number },
  ranges: Array<{ start: number; end: number }>
): boolean {
  return ranges.some((item) => range.start < item.end && item.start < range.end);
}

function rangesContainAny(
  range: { start: number; end: number },
  ranges: Array<{ start: number; end: number }>
): boolean {
  return ranges.some((item) => item.start <= range.start && range.end <= item.end);
}
