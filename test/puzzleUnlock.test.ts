import { describe, expect, test } from 'vitest';
import { createPuzzleUnlockState, updatePuzzleUnlockWithGuess } from '../src/puzzleUnlock';

describe('puzzle unlock state', () => {
  test('does not unlock the target model before a correct guess', () => {
    const state = createPuzzleUnlockState('puzzle-ethanol');

    expect(state.unlocked).toBe(false);
    expect(state.unlockedCompoundId).toBeNull();
  });

  test('unlocks target model after correct guess', () => {
    const state = updatePuzzleUnlockWithGuess(createPuzzleUnlockState('puzzle-ethanol'), '乙醇');

    expect(state.unlocked).toBe(true);
    expect(state.unlockedCompoundId).toBe('ethanol');
  });

  test('keeps target locked after wrong guess', () => {
    const state = updatePuzzleUnlockWithGuess(createPuzzleUnlockState('puzzle-ethanol'), '二甲醚');

    expect(state.unlocked).toBe(false);
    expect(state.unlockedCompoundId).toBeNull();
  });

  test('locks target again after a wrong guess from an unlocked state', () => {
    const unlockedState = updatePuzzleUnlockWithGuess(createPuzzleUnlockState('puzzle-ethanol'), '乙醇');
    const state = updatePuzzleUnlockWithGuess(unlockedState, '二甲醚');

    expect(state.unlocked).toBe(false);
    expect(state.unlockedCompoundId).toBeNull();
  });
});
