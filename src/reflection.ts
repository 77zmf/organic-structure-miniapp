import type { EvidenceNote } from './curiosity';

export interface ReflectionSummary {
  focus: string;
  evidence: string;
  judgement: string;
  nextStep: string;
}

export interface ReflectionSummaryInput {
  formula: string;
  evidenceNotes: EvidenceNote[];
  structureGuess: string;
  studentQuestionCount: number;
}

export function createReflectionSummary(input: ReflectionSummaryInput): ReflectionSummary {
  const verified = notesByKind(input.evidenceNotes, 'verified');
  const excluded = notesByKind(input.evidenceNotes, 'excluded');
  const attemptedGuesses = notesByKind(input.evidenceNotes, 'guess');
  const structureGuess = input.structureGuess.trim();
  const evidenceParts = [
    verified ? `已验证：${verified}` : '',
    excluded ? `已排除：${excluded}` : ''
  ].filter(Boolean);

  return {
    focus: `本轮围绕 ${input.formula} 完成了 ${input.studentQuestionCount} 次性质追问。`,
    evidence: evidenceParts.length > 0 ? evidenceParts.join('；') : '尚未形成可验证证据，需要先设计一个鉴别实验。',
    judgement: structureGuess
      ? `当前判断为“${structureGuess}”，还需要用反证实验检验。`
      : attemptedGuesses
        ? `${attemptedGuesses}，目前还没有保留一个待验证的结构。`
        : '目前还没有提出结构猜想。',
    nextStep: nextReflectionStep(Boolean(verified || excluded), Boolean(structureGuess))
  };
}

function notesByKind(notes: EvidenceNote[], kind: EvidenceNote['kind']): string {
  return notes
    .filter((note) => note.kind === kind)
    .map((note) => note.text.trim())
    .filter(Boolean)
    .join('；');
}

function nextReflectionStep(hasEvidence: boolean, hasGuess: boolean): string {
  if (!hasEvidence) {
    return '下一步：提出一个能区分候选官能团的实验性质问题。';
  }
  if (!hasGuess) {
    return '下一步：依据现有证据提出结构猜想，再排查同分异构体。';
  }
  return '下一步：选择一个能证伪当前猜想的实验，检查官能团和碳骨架是否同时吻合。';
}
