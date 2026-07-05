import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../src/moleculeViewer', () => ({
  createMoleculeViewer: vi.fn(() => ({ dispose: vi.fn() }))
}));

vi.mock('lucide', () => ({
  Beaker: {},
  Brain: {},
  CheckCircle2: {},
  FlaskConical: {},
  GitBranch: {},
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
  test('renders high-school formula subscripts and textbook clue cards in puzzle mode', async () => {
    const puzzleTab = createModeButton('puzzle');
    const root = createRoot({ modeButtons: [puzzleTab.button] });

    await importApp(root);
    puzzleTab.click();

    expect(root.innerHTML).toContain('C<sub>4</sub>H<sub>10</sub>O');
    expect(root.innerHTML).toContain('C<sub>4</sub>H<sub>10</sub>O 的不饱和度为 0');
    expect(root.innerHTML).toContain('教材谱图线索');
    expect(root.innerHTML).toContain('高考拆题点');
    expect(root.innerHTML).toContain('核磁共振氢谱');
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
}

function createRoot(options: FakeRootOptions = {}): HTMLDivElement {
  return {
    innerHTML: '',
    querySelectorAll: vi.fn((selector: string) => {
      if (selector === '[data-mode]') {
        return options.modeButtons ?? [];
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
