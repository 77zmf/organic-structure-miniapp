import { beforeAll, describe, expect, test, vi } from 'vitest';
import type { DisplayMode } from '../src/moleculeModels';

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

let app: AppExports;

beforeAll(async () => {
  const root = {
    innerHTML: '',
    querySelectorAll: () => [],
    querySelector: () => null
  };
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

  app = (await import('../src/app')) as AppExports;
});

describe('app molecule viewer mounting specs', () => {
  test('uses the first model highlight only when functional-group highlight is enabled', () => {
    expect(app.getMoleculeViewerMountSpec('ethanol', 'space-fill', true)).toMatchObject({
      compoundId: 'ethanol',
      displayMode: 'space-fill',
      highlightId: 'alcohol'
    });

    expect(app.getMoleculeViewerMountSpec('ethanol', 'space-fill', false)).toMatchObject({
      compoundId: 'ethanol',
      displayMode: 'space-fill',
      highlightId: null
    });
  });

  test('keeps puzzle target viewer unavailable until the puzzle is unlocked', () => {
    expect(app.getPuzzleMoleculeViewerMountSpec(false, null, 'ball-stick', true)).toBeNull();
    expect(app.getPuzzleMoleculeViewerMountSpec(true, 'ethanol', 'ball-stick', true)).toMatchObject({
      compoundId: 'ethanol',
      displayMode: 'ball-stick',
      highlightId: 'alcohol'
    });
  });
});
