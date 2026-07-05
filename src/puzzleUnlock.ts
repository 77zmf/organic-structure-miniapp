import { answerFormulaPuzzle, findPuzzleById } from './chemistry';

export interface PuzzleUnlockState {
  puzzleId: string;
  unlocked: boolean;
  unlockedCompoundId: string | null;
}

export function createPuzzleUnlockState(puzzleId: string): PuzzleUnlockState {
  findPuzzleById(puzzleId);
  return { puzzleId, unlocked: false, unlockedCompoundId: null };
}

export function updatePuzzleUnlockWithGuess(state: PuzzleUnlockState, guess: string): PuzzleUnlockState {
  const result = answerFormulaPuzzle(state.puzzleId, guess);
  if (!result.correct) {
    return { ...state, unlocked: false, unlockedCompoundId: null };
  }
  return { ...state, unlocked: true, unlockedCompoundId: result.compound.id };
}
