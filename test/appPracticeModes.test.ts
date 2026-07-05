import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../src/moleculeViewer', () => ({
  createMoleculeViewer: vi.fn(() => ({ dispose: vi.fn() }))
}));

vi.mock('lucide', () => ({
  Beaker: {},
  Brain: {},
  Calculator: {},
  CheckCircle2: {},
  FlaskConical: {},
  GitBranch: {},
  Map: {},
  RefreshCw: {},
  Send: {},
  Shuffle: {},
  Sparkles: {},
  XCircle: {},
  createIcons: vi.fn()
}));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.doUnmock('../src/curiosity');
});

describe('app reagent practice modes', () => {
  test('renders self-test molecule picker and challenge entry in reagent mode', async () => {
    const root = createRoot();

    await importApp(root);

    expect(root.innerHTML).toContain('自测模式');
    expect(root.innerHTML).toContain('挑战闯关');
    expect(root.innerHTML).toContain('data-input="self-test-compound"');
    expect(root.innerHTML).toContain('选择有机物');
  });

  test('renders phenomenon prediction choices before reagent submission', async () => {
    const root = createRoot();

    await importApp(root);

    expect(root.innerHTML).toContain('先预测现象');
    expect(root.innerHTML).toContain('data-phenomenon="decolorize"');
    expect(root.innerHTML).toContain('无明显现象');
    expect(root.innerHTML.indexOf('先预测现象')).toBeLessThan(root.innerHTML.indexOf('data-action="submit-reagent"'));
    expect(root.innerHTML).not.toContain('现象预测正确');
    expect(root.innerHTML).not.toContain('现象需要复盘');
  });

  test('selects and resets reagent phenomenon predictions', async () => {
    const decolorizePrediction = createPhenomenonButton('decolorize');
    const sodiumReagent = createReagentButton('sodium');
    const compoundInput = createInput('self-test-compound', 'ethanol');
    const challengeMode = createReagentPracticeModeButton('challenge');
    const root = createRoot({
      phenomenonButtons: [decolorizePrediction.button],
      reagentButtons: [sodiumReagent.button],
      reagentPracticeModeButtons: [challengeMode.button],
      inputElements: [compoundInput.input]
    });

    await importApp(root);

    decolorizePrediction.click();

    expect(root.innerHTML).toContain(
      'class="choice-chip selected" data-phenomenon="decolorize" type="button" aria-pressed="true"'
    );

    sodiumReagent.click();

    expect(root.innerHTML).toContain(
      'class="choice-chip" data-phenomenon="decolorize" type="button" aria-pressed="false"'
    );

    decolorizePrediction.click();
    compoundInput.input.value = 'ethanol';
    compoundInput.inputEvent();

    expect(root.innerHTML).toContain(
      'class="choice-chip" data-phenomenon="decolorize" type="button" aria-pressed="false"'
    );

    decolorizePrediction.click();
    challengeMode.click();

    expect(root.innerHTML).toContain(
      'class="choice-chip" data-phenomenon="decolorize" type="button" aria-pressed="false"'
    );
  });

  test('compares phenomenon prediction after submitting reagent answer', async () => {
    const decolorizePrediction = createPhenomenonButton('decolorize');
    const yesAnswer = createAnswerButton('yes');
    const submitReagent = createActionButton('submit-reagent');
    const root = createRoot({
      phenomenonButtons: [decolorizePrediction.button],
      answerButtons: [yesAnswer.button],
      actionButtons: [submitReagent.button]
    });

    await importApp(root);

    decolorizePrediction.click();
    yesAnswer.click();

    expect(root.innerHTML).not.toContain('现象预测正确');

    submitReagent.click();

    expect(root.innerHTML).toContain('正确：会反应');
    expect(root.innerHTML).toContain('现象预测正确：褪色');
  });
});

describe('app pair classroom selection', () => {
  test('renders molecule pickers for both sides in pair mode', async () => {
    const pairTab = createModeButton('pair');
    const root = createRoot({ modeButtons: [pairTab.button] });

    await importApp(root);
    pairTab.click();

    expect(root.innerHTML).toContain('选择左侧分子');
    expect(root.innerHTML).toContain('选择右侧分子');
    expect(root.innerHTML).toContain('data-input="pair-first-compound"');
    expect(root.innerHTML).toContain('data-input="pair-second-compound"');
    expect(root.innerHTML).toContain('随机一组');
  });
});

describe('app chemistry notation and advanced puzzle clues', () => {
  test('renders high-school formula subscripts without inline hints in puzzle mode', async () => {
    const puzzleTab = createModeButton('puzzle');
    const root = createRoot({ modeButtons: [puzzleTab.button] });

    await importApp(root);
    puzzleTab.click();

    expect(root.innerHTML).toContain('C<sub>4</sub>H<sub>10</sub>O');
    expect(root.innerHTML).toContain('结构猜测');
    expect(root.innerHTML).not.toContain('教材微项目给出');
    expect(root.innerHTML).not.toContain('quick-question');
    expect(root.innerHTML).not.toContain('教材谱图线索');
    expect(root.innerHTML).not.toContain('已给出分子式');
  });
});

describe('app method and unsaturation pages', () => {
  test('renders a standalone unsaturation index page', async () => {
    const unsaturationTab = createModeButton('unsaturation');
    const root = createRoot({ modeButtons: [unsaturationTab.button] });

    await importApp(root);
    unsaturationTab.click();

    expect(root.innerHTML).toContain('不饱和度计算');
    expect(root.innerHTML).toContain('C<sub>6</sub>H<sub>6</sub>');
    expect(root.innerHTML).toContain('不饱和度为 4');
    expect(root.innerHTML).toContain('苯环');
  });

  test('renders unsaturation prediction controls before feedback', async () => {
    const unsaturationTab = createModeButton('unsaturation');
    const root = createRoot({ modeButtons: [unsaturationTab.button] });

    await importApp(root);
    unsaturationTab.click();

    expect(root.innerHTML).toContain('先猜结构可能性');
    expect(root.innerHTML).toContain('data-unsaturation-prediction="benzene-ring"');
    expect(root.innerHTML).toContain('仍需实验验证');
    expect(root.innerHTML.indexOf('先猜结构可能性')).toBeLessThan(root.innerHTML.indexOf('class="unsaturation-result"'));
  });

  test('toggles unsaturation prediction selection and feedback', async () => {
    const unsaturationTab = createModeButton('unsaturation');
    const benzenePrediction = createUnsaturationPredictionButton('benzene-ring');
    const root = createRoot({
      modeButtons: [unsaturationTab.button],
      unsaturationPredictionButtons: [benzenePrediction.button]
    });

    await importApp(root);
    unsaturationTab.click();

    expect(root.innerHTML).toContain(
      'class="choice-chip selected" data-unsaturation-prediction="benzene-ring" type="button" aria-pressed="true"'
    );

    benzenePrediction.click();

    expect(root.innerHTML).toContain(
      'class="choice-chip" data-unsaturation-prediction="benzene-ring" type="button" aria-pressed="false"'
    );
    expect(root.innerHTML).toContain('先对 C<sub>6</sub>H<sub>6</sub> 可能隐藏的结构做一个预测');
  });

  test('resets unsaturation predictions when the formula changes', async () => {
    const unsaturationTab = createModeButton('unsaturation');
    const formulaInput = createInput('unsaturation-formula', 'C2H4');
    const root = createRoot({
      modeButtons: [unsaturationTab.button],
      inputElements: [formulaInput.input]
    });

    await importApp(root);
    unsaturationTab.click();

    expect(root.innerHTML).toContain('仍需实验验证');

    formulaInput.input.value = 'C2H4';
    formulaInput.inputEvent();

    expect(root.innerHTML).toContain('先对 C<sub>2</sub>H<sub>4</sub> 可能隐藏的结构做一个预测');
    expect(root.innerHTML).toContain(
      'class="choice-chip" data-unsaturation-prediction="benzene-ring" type="button" aria-pressed="false"'
    );
  });

  test('selecting none clears structural unsaturation predictions', async () => {
    const unsaturationTab = createModeButton('unsaturation');
    const benzenePrediction = createUnsaturationPredictionButton('benzene-ring');
    const nonePrediction = createUnsaturationPredictionButton('none');
    const root = createRoot({
      modeButtons: [unsaturationTab.button],
      unsaturationPredictionButtons: [benzenePrediction.button, nonePrediction.button]
    });

    await importApp(root);
    unsaturationTab.click();

    nonePrediction.click();

    expect(root.innerHTML).toContain(
      'class="choice-chip" data-unsaturation-prediction="benzene-ring" type="button" aria-pressed="false"'
    );
    expect(root.innerHTML).toContain(
      'class="choice-chip selected" data-unsaturation-prediction="none" type="button" aria-pressed="true"'
    );
  });

  test('selecting a structural prediction clears none', async () => {
    const unsaturationTab = createModeButton('unsaturation');
    const nonePrediction = createUnsaturationPredictionButton('none');
    const carbonylPrediction = createUnsaturationPredictionButton('carbonyl');
    const root = createRoot({
      modeButtons: [unsaturationTab.button],
      unsaturationPredictionButtons: [nonePrediction.button, carbonylPrediction.button]
    });

    await importApp(root);
    unsaturationTab.click();

    nonePrediction.click();
    carbonylPrediction.click();

    expect(root.innerHTML).toContain(
      'class="choice-chip selected" data-unsaturation-prediction="carbonyl" type="button" aria-pressed="true"'
    );
    expect(root.innerHTML).toContain(
      'class="choice-chip" data-unsaturation-prediction="none" type="button" aria-pressed="false"'
    );
  });

  test('renders textbook method guide flows', async () => {
    const methodTab = createModeButton('method');
    const root = createRoot({ modeButtons: [methodTab.button] });

    await importApp(root);
    methodTab.click();

    expect(root.innerHTML).toContain('方法指引');
    expect(root.innerHTML).toContain('测定有机化合物结构流程');
    expect(root.innerHTML).toContain('元素组成');
    expect(root.innerHTML).toContain('相对分子质量');
    expect(root.innerHTML).toContain('官能团及碳骨架状况');
    expect(root.innerHTML).toContain('计算不饱和度');
    expect(root.innerHTML).toContain('确定有机化合物结构式');
  });
});

describe('app curiosity bar', () => {
  test('renders a global curiosity question and cycle action', async () => {
    const root = createRoot();

    await importApp(root);

    expect(root.innerHTML).toContain('今日追问');
    expect(root.innerHTML).toContain('data-action="next-curiosity-question"');
  });

  test('cycles to the next curiosity question when requested', async () => {
    const nextQuestionButton = createActionButton('next-curiosity-question');
    const root = createRoot({ actionButtons: [nextQuestionButton.button] });

    await importApp(root);

    expect(root.innerHTML).toContain('为什么乙烯能使溴的四氯化碳溶液褪色，而苯通常不能？');

    nextQuestionButton.click();

    expect(root.innerHTML).not.toContain('为什么乙烯能使溴的四氯化碳溶液褪色，而苯通常不能？');
    expect(root.innerHTML).toContain('同样含氧，为什么有的物质能与钠反应，有的不能？');
  });

  test('omits the curiosity bar when no questions are available', async () => {
    vi.doMock('../src/curiosity', async () => ({
      ...(await vi.importActual<typeof import('../src/curiosity')>('../src/curiosity')),
      curiosityQuestions: []
    }));
    const nextQuestionButton = createActionButton('next-curiosity-question');
    const root = createRoot({ actionButtons: [nextQuestionButton.button] });

    await importApp(root);

    expect(root.innerHTML).not.toContain('今日追问');
    expect(() => nextQuestionButton.click()).not.toThrow();
  });
});

describe('app method route details', () => {
  test('renders clickable route nodes and method detail panel', async () => {
    const methodTab = createModeButton('method');
    const root = createRoot({ modeButtons: [methodTab.button] });

    await importApp(root);
    methodTab.click();

    expect(root.innerHTML).toContain('破案路线图');
    expect(root.innerHTML).toContain('data-method-node="unsaturation"');
    expect(root.innerHTML).toContain('能告诉我们');
    expect(root.innerHTML).toContain('还不能确定');
  });

  test('updates the method detail panel when a valid route node is clicked', async () => {
    const methodTab = createModeButton('method');
    const structureNode = createMethodNodeButton('structure');
    const root = createRoot({
      modeButtons: [methodTab.button],
      methodNodeButtons: [structureNode.button]
    });

    await importApp(root);
    methodTab.click();

    expect(root.innerHTML).toContain('C6H6 的不饱和度为 4');

    structureNode.click();

    expect(root.innerHTML).toContain('确定结构式');
    expect(root.innerHTML).toContain('能把分子式、官能团和碳骨架证据合并成最终结构。');
    expect(root.innerHTML).not.toContain('C6H6 的不饱和度为 4');
  });

  test('ignores unknown method route node ids', async () => {
    const methodTab = createModeButton('method');
    const unknownNode = createMethodNodeButton('not-a-method-node');
    const root = createRoot({
      modeButtons: [methodTab.button],
      methodNodeButtons: [unknownNode.button]
    });

    await importApp(root);
    methodTab.click();

    expect(root.innerHTML).toContain('C6H6 的不饱和度为 4');

    unknownNode.click();

    expect(root.innerHTML).toContain('计算不饱和度');
    expect(root.innerHTML).toContain('C6H6 的不饱和度为 4');
  });
});

async function importApp(root: HTMLDivElement): Promise<void> {
  vi.stubGlobal('document', {
    querySelector: (selector: string) => (selector === '#app' ? root : null)
  });
  vi.stubGlobal('window', {
    location: { hostname: '127.0.0.1', search: '' }
  });
  vi.stubGlobal('localStorage', {
    getItem: vi.fn(() => null),
    setItem: vi.fn()
  });

  await import('../src/app');
}

interface FakeRootOptions {
  modeButtons?: HTMLButtonElement[];
  actionButtons?: HTMLButtonElement[];
  answerButtons?: HTMLButtonElement[];
  methodNodeButtons?: HTMLButtonElement[];
  phenomenonButtons?: HTMLButtonElement[];
  reagentButtons?: HTMLButtonElement[];
  reagentPracticeModeButtons?: HTMLButtonElement[];
  unsaturationPredictionButtons?: HTMLButtonElement[];
  inputElements?: HTMLInputElement[];
}

function createRoot(options: FakeRootOptions = {}): HTMLDivElement {
  return {
    innerHTML: '',
    querySelectorAll: vi.fn((selector: string) => {
      if (selector === '[data-mode]') {
        return options.modeButtons ?? [];
      }
      if (selector === '[data-action]') {
        return options.actionButtons ?? [];
      }
      if (selector === '[data-answer]') {
        return options.answerButtons ?? [];
      }
      if (selector === '[data-method-node]') {
        return options.methodNodeButtons ?? [];
      }
      if (selector === '[data-phenomenon]') {
        return options.phenomenonButtons ?? [];
      }
      if (selector === '[data-reagent]') {
        return options.reagentButtons ?? [];
      }
      if (selector === '[data-reagent-practice-mode]') {
        return options.reagentPracticeModeButtons ?? [];
      }
      if (selector === '[data-unsaturation-prediction]') {
        return options.unsaturationPredictionButtons ?? [];
      }
      if (selector === '[data-input]') {
        return options.inputElements ?? [];
      }
      return [];
    })
  } as unknown as HTMLDivElement;
}

function createModeButton(mode: string): {
  button: HTMLButtonElement;
  click: () => void;
} {
  let listener: (() => void) | null = null;
  return {
    button: {
      dataset: { mode },
      addEventListener: vi.fn((eventName: string, callback: () => void) => {
        if (eventName === 'click') listener = callback;
      })
    } as unknown as HTMLButtonElement,
    click: () => listener?.()
  };
}

function createActionButton(action: string): {
  button: HTMLButtonElement;
  click: () => void;
} {
  let listener: (() => void) | null = null;
  return {
    button: {
      dataset: { action },
      addEventListener: vi.fn((eventName: string, callback: () => void) => {
        if (eventName === 'click') listener = callback;
      })
    } as unknown as HTMLButtonElement,
    click: () => listener?.()
  };
}

function createAnswerButton(answer: string): {
  button: HTMLButtonElement;
  click: () => void;
} {
  let listener: (() => void) | null = null;
  return {
    button: {
      dataset: { answer },
      addEventListener: vi.fn((eventName: string, callback: () => void) => {
        if (eventName === 'click') listener = callback;
      })
    } as unknown as HTMLButtonElement,
    click: () => listener?.()
  };
}

function createMethodNodeButton(methodNode: string): {
  button: HTMLButtonElement;
  click: () => void;
} {
  let listener: (() => void) | null = null;
  return {
    button: {
      dataset: { methodNode },
      addEventListener: vi.fn((eventName: string, callback: () => void) => {
        if (eventName === 'click') listener = callback;
      })
    } as unknown as HTMLButtonElement,
    click: () => listener?.()
  };
}

function createPhenomenonButton(phenomenon: string): {
  button: HTMLButtonElement;
  click: () => void;
} {
  let listener: (() => void) | null = null;
  return {
    button: {
      dataset: { phenomenon },
      addEventListener: vi.fn((eventName: string, callback: () => void) => {
        if (eventName === 'click') listener = callback;
      })
    } as unknown as HTMLButtonElement,
    click: () => listener?.()
  };
}

function createReagentButton(reagent: string): {
  button: HTMLButtonElement;
  click: () => void;
} {
  let listener: (() => void) | null = null;
  return {
    button: {
      dataset: { reagent },
      addEventListener: vi.fn((eventName: string, callback: () => void) => {
        if (eventName === 'click') listener = callback;
      })
    } as unknown as HTMLButtonElement,
    click: () => listener?.()
  };
}

function createReagentPracticeModeButton(reagentPracticeMode: string): {
  button: HTMLButtonElement;
  click: () => void;
} {
  let listener: (() => void) | null = null;
  return {
    button: {
      dataset: { reagentPracticeMode },
      addEventListener: vi.fn((eventName: string, callback: () => void) => {
        if (eventName === 'click') listener = callback;
      })
    } as unknown as HTMLButtonElement,
    click: () => listener?.()
  };
}

function createUnsaturationPredictionButton(unsaturationPrediction: string): {
  button: HTMLButtonElement;
  click: () => void;
} {
  let listener: (() => void) | null = null;
  return {
    button: {
      dataset: { unsaturationPrediction },
      addEventListener: vi.fn((eventName: string, callback: () => void) => {
        if (eventName === 'click') listener = callback;
      })
    } as unknown as HTMLButtonElement,
    click: () => listener?.()
  };
}

function createInput(input: string, value: string): {
  input: HTMLInputElement;
  inputEvent: () => void;
} {
  let listener: (() => void) | null = null;
  return {
    input: {
      dataset: { input },
      value,
      addEventListener: vi.fn((eventName: string, callback: () => void) => {
        if (eventName === 'input') listener = callback;
      })
    } as unknown as HTMLInputElement,
    inputEvent: () => listener?.()
  };
}
