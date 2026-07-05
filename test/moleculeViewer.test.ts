import { describe, expect, test } from 'vitest';
import { getMoleculeModel } from '../src/moleculeModels';
import { calculateModelBounds, getBondCylinderCount } from '../src/moleculeViewer';

describe('molecule viewer helpers', () => {
  test('calculates non-zero bounds for a molecule model', () => {
    const bounds = calculateModelBounds(getMoleculeModel('ethanol'));

    expect(bounds.radius).toBeGreaterThan(0);
    expect(bounds.center.length).toBe(3);
  });

  test('uses multiple cylinders for double and triple bonds', () => {
    expect(getBondCylinderCount({ from: 0, to: 1 })).toBe(1);
    expect(getBondCylinderCount({ from: 0, to: 1, order: 2 })).toBe(2);
    expect(getBondCylinderCount({ from: 0, to: 1, order: 3 })).toBe(3);
  });
});
