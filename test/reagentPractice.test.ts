import { describe, expect, test } from 'vitest';
import {
  advanceChallenge,
  createChallengeSession,
  evaluateChallengeAnswer,
  getCurrentChallengeQuestion,
  selectSelfTestCompound
} from '../src/reagentPractice';

describe('reagent self-test practice', () => {
  test('selecting a molecule resets answer and feedback without changing the reagent', () => {
    const next = selectSelfTestCompound(
      {
        compoundId: 'ethanol',
        reagentId: 'sodium',
        answer: 'yes',
        feedback: '正确：会反应。'
      },
      'acetaldehyde'
    );

    expect(next).toEqual({
      compoundId: 'acetaldehyde',
      reagentId: 'sodium',
      answer: null,
      feedback: ''
    });
  });
});

describe('reagent challenge practice', () => {
  test('creates a bounded shuffled question deck from compounds and reagents', () => {
    const session = createChallengeSession(['ethene', 'ethanol'], ['bromine-ccl4', 'sodium'], {
      size: 3,
      random: () => 0
    });

    expect(session.questions).toHaveLength(3);
    expect(new Set(session.questions.map((question) => `${question.compoundId}:${question.reagentId}`)).size).toBe(3);
    expect(session.currentIndex).toBe(0);
    expect(session.score).toBe(0);
    expect(session.completed).toBe(false);
    expect(getCurrentChallengeQuestion(session)).toEqual(session.questions[0]);
  });

  test('requires a correct answer before advancing and completes after the final level', () => {
    const session = createChallengeSession(['ethene'], ['bromine-ccl4', 'sodium'], {
      size: 2,
      random: () => 0
    });

    const wrong = evaluateChallengeAnswer(session, false);
    expect(wrong.passed).toBe(false);
    expect(wrong.session.score).toBe(0);
    expect(wrong.session.canAdvance).toBe(false);
    expect(advanceChallenge(wrong.session).currentIndex).toBe(0);

    const firstPassed = evaluateChallengeAnswer(wrong.session, true);
    expect(firstPassed.passed).toBe(true);
    expect(firstPassed.session.score).toBe(1);
    expect(firstPassed.session.canAdvance).toBe(true);

    const secondLevel = advanceChallenge(firstPassed.session);
    expect(secondLevel.currentIndex).toBe(1);
    expect(secondLevel.canAdvance).toBe(false);
    expect(secondLevel.completed).toBe(false);

    const finalPassed = evaluateChallengeAnswer(secondLevel, true);
    const completed = advanceChallenge(finalPassed.session);
    expect(completed.score).toBe(2);
    expect(completed.completed).toBe(true);
    expect(getCurrentChallengeQuestion(completed)).toBeNull();
  });
});
