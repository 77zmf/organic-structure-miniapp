import { describe, expect, test } from 'vitest';
import { createReflectionSummary } from '../src/reflection';

describe('reflection summary', () => {
  test('creates a next experiment when the student has not collected evidence', () => {
    const summary = createReflectionSummary({
      formula: 'C4H10O',
      evidenceNotes: [],
      structureGuess: '',
      studentQuestionCount: 0
    });

    expect(summary.focus).toContain('C4H10O');
    expect(summary.evidence).toContain('尚未形成可验证证据');
    expect(summary.judgement).toContain('还没有提出结构猜想');
    expect(summary.nextStep).toContain('区分候选官能团');
  });

  test('summarizes only student-visible evidence and the current guess', () => {
    const summary = createReflectionSummary({
      formula: 'C4H10O',
      evidenceNotes: [
        { kind: 'verified', text: '金属钠：能，放出氢气' },
        { kind: 'excluded', text: '银氨溶液：不能' },
        { kind: 'guess', text: '已尝试：乙醚' }
      ],
      structureGuess: '2-丁醇',
      studentQuestionCount: 2
    });

    expect(summary.focus).toContain('2 次性质追问');
    expect(summary.evidence).toContain('金属钠');
    expect(summary.evidence).toContain('银氨溶液');
    expect(summary.judgement).toContain('2-丁醇');
    expect(summary.nextStep).toContain('证伪当前猜想');
  });
});
