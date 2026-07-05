import { describe, expect, test } from 'vitest';
import {
  createRandomPairQuestion,
  selectPairCompound,
  type PairSelection
} from '../src/pairPractice';

const baseSelection: PairSelection = {
  firstId: 'ethanol',
  secondId: 'acetic-acid',
  answer: 'yes',
  typeGuess: '酯化反应',
  feedback: '正确：能反应。'
};

describe('organic pair teacher selection', () => {
  test('selecting either molecule resets previous student answer state', () => {
    const next = selectPairCompound(baseSelection, 'first', 'benzene', ['benzene', 'ethanol', 'acetic-acid']);

    expect(next).toEqual({
      firstId: 'benzene',
      secondId: 'acetic-acid',
      answer: null,
      typeGuess: '',
      feedback: ''
    });
  });

  test('keeps the two selected molecules different when a teacher selects the same molecule', () => {
    const next = selectPairCompound(baseSelection, 'second', 'ethanol', ['ethanol', 'benzene', 'acetic-acid']);

    expect(next.firstId).toBe('benzene');
    expect(next.secondId).toBe('ethanol');
    expect(next.answer).toBeNull();
  });
});

describe('organic pair random classroom prompt', () => {
  test('random question always contains two different molecules', () => {
    const question = createRandomPairQuestion(['ethanol', 'acetic-acid', 'benzene'], () => 0);

    expect(question.firstId).not.toBe(question.secondId);
    expect(['ethanol', 'acetic-acid', 'benzene']).toContain(question.firstId);
    expect(['ethanol', 'acetic-acid', 'benzene']).toContain(question.secondId);
  });
});
