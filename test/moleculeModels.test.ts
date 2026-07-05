import { describe, expect, test } from 'vitest';
import { compounds, formulaPuzzles } from '../src/chemistry';
import {
  elementStyles,
  getMoleculeModel,
  moleculeModels,
  validateMoleculeModel
} from '../src/moleculeModels';

describe('molecule model data', () => {
  test('every compound used in visible practice modes has a 3D model', () => {
    for (const compound of compounds) {
      const model = getMoleculeModel(compound.id);
      expect(model.compoundId).toBe(compound.id);
      expect(model.atoms.length).toBeGreaterThan(0);
      expect(model.bonds.length).toBeGreaterThan(0);
    }
  });

  test('every formula puzzle target has a model available after unlock', () => {
    for (const puzzle of formulaPuzzles) {
      expect(getMoleculeModel(puzzle.targetCompoundId).compoundId).toBe(puzzle.targetCompoundId);
    }
  });

  test('all bonds and highlights reference valid atom indexes', () => {
    for (const model of Object.values(moleculeModels)) {
      expect(validateMoleculeModel(model)).toEqual([]);
    }
  });

  test('every compound functional group has an addressable highlight id', () => {
    for (const compound of compounds) {
      const model = getMoleculeModel(compound.id);
      const highlightIds = model.highlights.map((highlight) => highlight.id);

      for (const group of compound.functionalGroups) {
        expect(highlightIds).toContain(group);
      }
    }
  });

  test('all model atom elements have visual styles', () => {
    const elements = new Set(Object.values(moleculeModels).flatMap((model) => model.atoms.map((atom) => atom.element)));

    for (const element of elements) {
      expect(elementStyles[element]).toBeDefined();
    }
  });
});
