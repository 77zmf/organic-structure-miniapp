type YesNo = 'yes' | 'no' | null;

export interface PairSelection {
  firstId: string;
  secondId: string;
  answer: YesNo;
  typeGuess: string;
  feedback: string;
}

export interface PairQuestion {
  firstId: string;
  secondId: string;
}

export type PairSide = 'first' | 'second';

export function selectPairCompound(
  selection: PairSelection,
  side: PairSide,
  compoundId: string,
  compoundIds: string[]
): PairSelection {
  const next = {
    ...selection,
    [side === 'first' ? 'firstId' : 'secondId']: compoundId,
    answer: null,
    typeGuess: '',
    feedback: ''
  };

  if (next.firstId === next.secondId) {
    const replacement = compoundIds.find((id) => id !== compoundId) ?? compoundId;
    if (side === 'first') {
      next.secondId = replacement;
    } else {
      next.firstId = replacement;
    }
  }

  return next;
}

export function createRandomPairQuestion(
  compoundIds: string[],
  random: () => number = Math.random
): PairQuestion {
  if (compoundIds.length < 2) {
    throw new Error('At least two compounds are required to create a pair question.');
  }

  const firstIndex = Math.floor(random() * compoundIds.length);
  const firstId = compoundIds[firstIndex];
  const remaining = compoundIds.filter((id) => id !== firstId);
  const secondId = remaining[Math.floor(random() * remaining.length)];

  return { firstId, secondId };
}
