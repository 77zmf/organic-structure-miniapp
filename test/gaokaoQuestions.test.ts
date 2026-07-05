import { describe, expect, test } from 'vitest';
import { findPuzzleById } from '../src/chemistry';
import { gaokaoQuestions } from '../src/gaokaoQuestions';

describe('gaokao question bank', () => {
  test('contains a classroom-sized local question bank', () => {
    expect(gaokaoQuestions.length).toBeGreaterThanOrEqual(8);
    expect(gaokaoQuestions.length).toBeLessThanOrEqual(12);
  });

  test('every question maps to an existing formula puzzle', () => {
    for (const question of gaokaoQuestions) {
      expect(() => findPuzzleById(question.puzzleId)).not.toThrow();
      expect(question.formula).toBe(findPuzzleById(question.puzzleId).formula);
    }
  });

  test('covers common high-school inference categories', () => {
    const focusText = gaokaoQuestions.flatMap((question) => question.examFocus).join('、');

    expect(focusText).toContain('加成');
    expect(focusText).toContain('银镜');
    expect(focusText).toContain('羧酸');
    expect(focusText).toContain('酯');
    expect(focusText).toContain('苯环');
    expect(focusText).toContain('同分异构体');
  });
});
