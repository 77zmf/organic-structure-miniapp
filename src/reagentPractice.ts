type YesNo = 'yes' | 'no' | null;

export type ReagentPracticeMode = 'self-test' | 'challenge';

export interface ReagentQuestion {
  compoundId: string;
  reagentId: string;
}

export interface SelfTestSelection {
  compoundId: string;
  reagentId: string;
  answer: YesNo;
  feedback: string;
}

export interface ChallengeSession {
  questions: ReagentQuestion[];
  currentIndex: number;
  score: number;
  canAdvance: boolean;
  completed: boolean;
}

export interface ChallengeOptions {
  size?: number;
  random?: () => number;
}

export interface ChallengeEvaluation {
  passed: boolean;
  session: ChallengeSession;
}

const DEFAULT_CHALLENGE_SIZE = 6;

export function selectSelfTestCompound(
  selection: SelfTestSelection,
  compoundId: string
): SelfTestSelection {
  return {
    ...selection,
    compoundId,
    answer: null,
    feedback: ''
  };
}

export function createChallengeSession(
  compoundIds: string[],
  reagentIds: string[],
  options: ChallengeOptions = {}
): ChallengeSession {
  const questions = shuffleQuestions(createQuestionPool(compoundIds, reagentIds), options.random ?? Math.random);
  const size = Math.max(1, Math.min(options.size ?? DEFAULT_CHALLENGE_SIZE, questions.length));

  return {
    questions: questions.slice(0, size),
    currentIndex: 0,
    score: 0,
    canAdvance: false,
    completed: questions.length === 0
  };
}

export function getCurrentChallengeQuestion(session: ChallengeSession): ReagentQuestion | null {
  if (session.completed) {
    return null;
  }
  return session.questions[session.currentIndex] ?? null;
}

export function evaluateChallengeAnswer(
  session: ChallengeSession,
  isCorrect: boolean
): ChallengeEvaluation {
  if (!isCorrect) {
    return {
      passed: false,
      session: {
        ...session,
        canAdvance: false
      }
    };
  }

  return {
    passed: true,
    session: {
      ...session,
      score: session.canAdvance ? session.score : session.score + 1,
      canAdvance: true
    }
  };
}

export function advanceChallenge(session: ChallengeSession): ChallengeSession {
  if (!session.canAdvance || session.completed) {
    return session;
  }

  const nextIndex = session.currentIndex + 1;
  if (nextIndex >= session.questions.length) {
    return {
      ...session,
      canAdvance: false,
      completed: true
    };
  }

  return {
    ...session,
    currentIndex: nextIndex,
    canAdvance: false
  };
}

function createQuestionPool(compoundIds: string[], reagentIds: string[]): ReagentQuestion[] {
  return compoundIds.flatMap((compoundId) => reagentIds.map((reagentId) => ({ compoundId, reagentId })));
}

function shuffleQuestions(questions: ReagentQuestion[], random: () => number): ReagentQuestion[] {
  const shuffled = [...questions];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}
