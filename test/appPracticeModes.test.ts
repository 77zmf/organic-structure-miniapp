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
    vi.doMock('../src/curiosity', () => ({
      curiosityQuestions: []
    }));
    const nextQuestionButton = createActionButton('next-curiosity-question');
    const root = createRoot({ actionButtons: [nextQuestionButton.button] });

    await importApp(root);

    expect(root.innerHTML).not.toContain('今日追问');
    expect(() => nextQuestionButton.click()).not.toThrow();
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
