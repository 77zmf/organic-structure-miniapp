import { describe, expect, test } from 'vitest';
import { compounds, formulaPuzzles } from '../src/chemistry';
import {
  elementStyles,
  getMoleculeModel,
  moleculeModels,
  validateMoleculeModel
} from '../src/moleculeModels';
import type { MoleculeModel } from '../src/moleculeModels';

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

  test('every molecule model registry key matches its compound id', () => {
    for (const [compoundId, model] of Object.entries(moleculeModels)) {
      expect(model.compoundId).toBe(compoundId);
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

  test('methane alkane highlight includes every atom in the molecule', () => {
    const model = getMoleculeModel('methane');
    const highlight = model.highlights.find((item) => item.id === 'alkane');

    expect(highlight?.atomIndexes).toEqual([0, 1, 2, 3, 4]);
  });
});

describe('validateMoleculeModel', () => {
  test('catches invalid bond from indexes', () => {
    expect(validateMoleculeModel(modelWith({ bonds: [{ from: -1, to: 1, order: 1 }] }))).toContain(
      'Bond 0 has invalid from atom index -1.'
    );
  });

  test('catches invalid bond to indexes', () => {
    expect(validateMoleculeModel(modelWith({ bonds: [{ from: 0, to: 2, order: 1 }] }))).toContain(
      'Bond 0 has invalid to atom index 2.'
    );
  });

  test('catches self-bonds', () => {
    expect(validateMoleculeModel(modelWith({ bonds: [{ from: 0, to: 0, order: 1 }] }))).toContain(
      'Bond 0 connects atom 0 to itself.'
    );
  });

  test('catches invalid highlight atom indexes', () => {
    expect(
      validateMoleculeModel(
        modelWith({
          highlights: [
            {
              id: 'alkane',
              label: 'test',
              atomIndexes: [2],
              bondIndexes: [0],
              color: '#000000'
            }
          ]
        })
      )
    ).toContain('Highlight 0 references invalid atom index 2.');
  });

  test('catches invalid highlight bond indexes', () => {
    expect(
      validateMoleculeModel(
        modelWith({
          highlights: [
            {
              id: 'alkane',
              label: 'test',
              atomIndexes: [0],
              bondIndexes: [1],
              color: '#000000'
            }
          ]
        })
      )
    ).toContain('Highlight 0 references invalid bond index 1.');
  });
});

function modelWith(overrides: Partial<MoleculeModel>): MoleculeModel {
  return {
    compoundId: 'test-model',
    defaultDisplayMode: 'ball-stick',
    atoms: [
      { element: 'C', position: [0, 0, 0] },
      { element: 'H', position: [1, 0, 0] }
    ],
    bonds: [{ from: 0, to: 1, order: 1 }],
    highlights: [
      {
        id: 'alkane',
        label: 'test',
        atomIndexes: [0, 1],
        bondIndexes: [0],
        color: '#000000'
      }
    ],
    ...overrides
  };
}
