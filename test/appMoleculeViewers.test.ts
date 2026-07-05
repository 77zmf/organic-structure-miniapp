import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { DisplayMode } from '../src/moleculeModels';

const moleculeViewerMock = vi.hoisted(() => ({
  createMoleculeViewer: vi.fn()
}));

vi.mock('../src/moleculeViewer', () => ({
  createMoleculeViewer: moleculeViewerMock.createMoleculeViewer
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

interface AppExports {
  getMoleculeViewerMountSpec(compoundId: string, displayMode: DisplayMode, highlightEnabled: boolean): unknown;
  getPuzzleMoleculeViewerMountSpec(
    unlocked: boolean,
    unlockedCompoundId: string | null,
    displayMode: DisplayMode,
    highlightEnabled: boolean
  ): unknown;
}

interface FakeRootOptions {
  hosts?: HTMLElement[];
  displayModeButtons?: HTMLButtonElement[];
}

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

describe('app molecule viewer mounting specs', () => {
  test('uses the primary compound functional group highlight only when highlight is enabled', async () => {
    const app = await importApp(createRoot());

    expect(app.getMoleculeViewerMountSpec('ethanol', 'space-fill', true)).toMatchObject({
      compoundId: 'ethanol',
      displayMode: 'space-fill',
      highlightId: 'alcohol'
    });
    expect(app.getMoleculeViewerMountSpec('phenol', 'space-fill', true)).toMatchObject({
      compoundId: 'phenol',
      displayMode: 'space-fill',
      highlightId: 'phenol'
    });
    expect(app.getMoleculeViewerMountSpec('phenol', 'space-fill', false)).toMatchObject({
      compoundId: 'phenol',
      displayMode: 'space-fill',
      highlightId: null
    });
  });

  test('keeps puzzle target viewer unavailable until the puzzle is unlocked', async () => {
    const app = await importApp(createRoot());

    expect(app.getPuzzleMoleculeViewerMountSpec(false, null, 'ball-stick', true)).toBeNull();
    expect(app.getPuzzleMoleculeViewerMountSpec(true, 'ethanol', 'ball-stick', true)).toMatchObject({
      compoundId: 'ethanol',
      displayMode: 'ball-stick',
      highlightId: 'alcohol'
    });
  });

  test('disposes mounted molecule viewers before remounting on rerender', async () => {
    const host = createViewerHost('ethanol');
    const displayModeButton = createDisplayModeButton('space-fill');
    const firstDispose = vi.fn();
    const secondDispose = vi.fn();

    moleculeViewerMock.createMoleculeViewer
      .mockReturnValueOnce({ dispose: firstDispose })
      .mockReturnValueOnce({ dispose: secondDispose });

    await importApp(
      createRoot({
        hosts: [host],
        displayModeButtons: [displayModeButton.button]
      })
    );

    expect(moleculeViewerMock.createMoleculeViewer).toHaveBeenCalledTimes(1);

    displayModeButton.click();

    expect(firstDispose).toHaveBeenCalledTimes(1);
    expect(moleculeViewerMock.createMoleculeViewer).toHaveBeenCalledTimes(2);
    expect(firstDispose.mock.invocationCallOrder[0]).toBeLessThan(
      moleculeViewerMock.createMoleculeViewer.mock.invocationCallOrder[1]
    );
  });

  test('renders a fallback message when WebGL viewer initialization fails', async () => {
    const host = createViewerHost('ethanol');
    moleculeViewerMock.createMoleculeViewer.mockImplementationOnce(() => {
      throw new Error('WebGL unavailable');
    });

    await expect(importApp(createRoot({ hosts: [host] }))).resolves.toBeDefined();

    expect(host.classList.add).toHaveBeenCalledWith('molecule-viewer-fallback');
    expect(host.innerHTML).toContain('3D 模型暂不可用');
  });
});

async function importApp(root: HTMLDivElement): Promise<AppExports> {
  vi.stubGlobal('document', {
    querySelector: (selector: string) => (selector === '#app' ? root : null)
  });
  vi.stubGlobal('window', {
    location: { hostname: '127.0.0.1' }
  });
  vi.stubGlobal('localStorage', {
    getItem: vi.fn(() => null),
    setItem: vi.fn()
  });

  return (await import('../src/app')) as AppExports;
}

function createRoot(options: FakeRootOptions = {}): HTMLDivElement {
  return {
    innerHTML: '',
    querySelector: vi.fn(() => null),
    querySelectorAll: vi.fn((selector: string) => {
      if (selector === '[data-molecule-viewer]') {
        return options.hosts ?? [];
      }
      if (selector === '[data-viewer-display-mode]') {
        return options.displayModeButtons ?? [];
      }
      return [];
    })
  } as unknown as HTMLDivElement;
}

function createViewerHost(compoundId: string): HTMLElement {
  return {
    dataset: { compoundId },
    innerHTML: '',
    classList: {
      add: vi.fn()
    }
  } as unknown as HTMLElement;
}

function createDisplayModeButton(displayMode: DisplayMode): {
  button: HTMLButtonElement;
  click: () => void;
} {
  let clickListener: (() => void) | null = null;
  const button = {
    dataset: { viewerDisplayMode: displayMode },
    addEventListener: vi.fn((eventName: string, listener: () => void) => {
      if (eventName === 'click') {
        clickListener = listener;
      }
    })
  } as unknown as HTMLButtonElement;

  return {
    button,
    click: () => clickListener?.()
  };
}
