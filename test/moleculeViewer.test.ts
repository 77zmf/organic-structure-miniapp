import { describe, expect, test } from 'vitest';
import { getMoleculeModel } from '../src/moleculeModels';
import { calculateModelBounds, getBondCylinderCount, getRendererParameters } from '../src/moleculeViewer';

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

  test('preserves the WebGL drawing buffer for screenshot-based verification', () => {
    expect(getRendererParameters({ backgroundColor: '#f7f8fb' })).toMatchObject({
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true
    });
    expect(getRendererParameters({ backgroundColor: null })).toMatchObject({
      alpha: true,
      preserveDrawingBuffer: true
    });
  });
});
