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

  test('all question ids are unique', () => {
    const ids = gaokaoQuestions.map((question) => question.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  test('every question has enough public classroom-facing data', () => {
    for (const question of gaokaoQuestions) {
      expect(question.title.trim()).not.toBe('');
      expect(question.task.trim()).not.toBe('');
      expect(question.examFocus.length).toBeGreaterThanOrEqual(2);
      expect(question.publicClues.length).toBeGreaterThanOrEqual(1);
      expect(question.examFocus.every((item) => item.trim().length > 0)).toBe(true);
      expect(question.publicClues.every((item) => item.trim().length > 0)).toBe(true);
    }
  });

  test('ethene-focused questions are not mislabeled as alkyne questions', () => {
    const etheneQuestions = gaokaoQuestions.filter((question) => question.puzzleId === 'puzzle-ethene');

    expect(etheneQuestions.map((question) => question.id).join('、')).not.toContain('alkyne');
    expect(
      etheneQuestions
        .flatMap((question) => [question.title, question.task, ...question.publicClues])
        .join('、')
    ).not.toContain('炔');
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
