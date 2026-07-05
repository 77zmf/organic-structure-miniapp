import type { FunctionalGroup } from './chemistry';

export type ElementSymbol = 'C' | 'H' | 'O' | 'N' | 'Cl' | 'Br' | 'I' | 'Na';
export type DisplayMode = 'ball-stick' | 'space-fill';

export interface MoleculeAtom {
  element: ElementSymbol;
  position: [number, number, number];
}

export interface MoleculeBond {
  from: number;
  to: number;
  order: 1 | 2 | 3;
}

export interface FunctionalGroupHighlight {
  id: FunctionalGroup;
  label: string;
  atomIndexes: number[];
  bondIndexes: number[];
  color: string;
}

export interface MoleculeModel {
  compoundId: string;
  defaultDisplayMode: DisplayMode;
  atoms: MoleculeAtom[];
  bonds: MoleculeBond[];
  highlights: FunctionalGroupHighlight[];
}

export const elementStyles: Record<
  ElementSymbol,
  {
    label: string;
    color: string;
    radius: number;
    spaceFillRadius: number;
  }
> = {
  C: { label: '碳', color: '#2f3542', radius: 0.34, spaceFillRadius: 0.76 },
  H: { label: '氢', color: '#f8f9fb', radius: 0.22, spaceFillRadius: 0.42 },
  O: { label: '氧', color: '#e03131', radius: 0.3, spaceFillRadius: 0.66 },
  N: { label: '氮', color: '#4263eb', radius: 0.32, spaceFillRadius: 0.7 },
  Cl: { label: '氯', color: '#37b24d', radius: 0.36, spaceFillRadius: 0.78 },
  Br: { label: '溴', color: '#a61e4d', radius: 0.39, spaceFillRadius: 0.84 },
  I: { label: '碘', color: '#5f3dc4', radius: 0.43, spaceFillRadius: 0.92 },
  Na: { label: '钠', color: '#f59f00', radius: 0.38, spaceFillRadius: 0.86 }
};

export const moleculeModels: Record<string, MoleculeModel> = {
  methane: {
    compoundId: 'methane',
    defaultDisplayMode: 'ball-stick',
    atoms: [
      { element: 'C', position: [0, 0, 0] },
      { element: 'H', position: [0.72, 0.72, 0.72] },
      { element: 'H', position: [-0.72, -0.72, 0.72] },
      { element: 'H', position: [-0.72, 0.72, -0.72] },
      { element: 'H', position: [0.72, -0.72, -0.72] }
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 0, to: 2, order: 1 },
      { from: 0, to: 3, order: 1 },
      { from: 0, to: 4, order: 1 }
    ],
    highlights: [
      {
        id: 'alkane',
        label: '饱和烃',
        atomIndexes: [0, 1, 2, 3, 4],
        bondIndexes: [0, 1, 2, 3],
        color: '#4dabf7'
      }
    ]
  },
  ethene: {
    compoundId: 'ethene',
    defaultDisplayMode: 'ball-stick',
    atoms: [
      { element: 'C', position: [-0.65, 0, 0] },
      { element: 'C', position: [0.65, 0, 0] },
      { element: 'H', position: [-1.22, 0.92, 0] },
      { element: 'H', position: [-1.22, -0.92, 0] },
      { element: 'H', position: [1.22, 0.92, 0] },
      { element: 'H', position: [1.22, -0.92, 0] }
    ],
    bonds: [
      { from: 0, to: 1, order: 2 },
      { from: 0, to: 2, order: 1 },
      { from: 0, to: 3, order: 1 },
      { from: 1, to: 4, order: 1 },
      { from: 1, to: 5, order: 1 }
    ],
    highlights: [
      {
        id: 'alkene',
        label: '碳碳双键',
        atomIndexes: [0, 1],
        bondIndexes: [0],
        color: '#228be6'
      }
    ]
  },
  acetylene: {
    compoundId: 'acetylene',
    defaultDisplayMode: 'ball-stick',
    atoms: [
      { element: 'C', position: [-0.62, 0, 0] },
      { element: 'C', position: [0.62, 0, 0] },
      { element: 'H', position: [-1.72, 0, 0] },
      { element: 'H', position: [1.72, 0, 0] }
    ],
    bonds: [
      { from: 0, to: 1, order: 3 },
      { from: 0, to: 2, order: 1 },
      { from: 1, to: 3, order: 1 }
    ],
    highlights: [
      {
        id: 'alkyne',
        label: '碳碳三键',
        atomIndexes: [0, 1],
        bondIndexes: [0],
        color: '#7048e8'
      }
    ]
  },
  ethanol: {
    compoundId: 'ethanol',
    defaultDisplayMode: 'ball-stick',
    atoms: [
      { element: 'C', position: [-0.78, 0, 0] },
      { element: 'C', position: [0.68, 0, 0] },
      { element: 'O', position: [1.76, 0.66, 0] },
      { element: 'H', position: [2.5, 0.22, 0] },
      { element: 'H', position: [-1.28, 0.95, 0] },
      { element: 'H', position: [-1.3, -0.48, 0.82] },
      { element: 'H', position: [-1.3, -0.48, -0.82] },
      { element: 'H', position: [0.74, -1.02, 0.74] },
      { element: 'H', position: [0.74, -1.02, -0.74] }
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 1, to: 2, order: 1 },
      { from: 2, to: 3, order: 1 },
      { from: 0, to: 4, order: 1 },
      { from: 0, to: 5, order: 1 },
      { from: 0, to: 6, order: 1 },
      { from: 1, to: 7, order: 1 },
      { from: 1, to: 8, order: 1 }
    ],
    highlights: [
      {
        id: 'alcohol',
        label: '醇羟基',
        atomIndexes: [2, 3],
        bondIndexes: [2],
        color: '#e8590c'
      }
    ]
  },
  'propan-1-ol': {
    compoundId: 'propan-1-ol',
    defaultDisplayMode: 'ball-stick',
    atoms: [
      { element: 'C', position: [-1.78, 0, 0] },
      { element: 'C', position: [-0.5, 0.12, 0] },
      { element: 'C', position: [0.82, 0, 0] },
      { element: 'O', position: [1.9, 0.66, 0] },
      { element: 'H', position: [2.62, 0.22, 0] },
      { element: 'H', position: [-2.28, 0.95, 0] },
      { element: 'H', position: [-2.34, -0.48, 0.82] },
      { element: 'H', position: [-2.34, -0.48, -0.82] },
      { element: 'H', position: [-0.5, 1.12, 0.74] },
      { element: 'H', position: [-0.48, -0.84, -0.72] },
      { element: 'H', position: [0.82, -1.0, 0.74] },
      { element: 'H', position: [0.82, -1.0, -0.74] }
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 1, to: 2, order: 1 },
      { from: 2, to: 3, order: 1 },
      { from: 3, to: 4, order: 1 },
      { from: 0, to: 5, order: 1 },
      { from: 0, to: 6, order: 1 },
      { from: 0, to: 7, order: 1 },
      { from: 1, to: 8, order: 1 },
      { from: 1, to: 9, order: 1 },
      { from: 2, to: 10, order: 1 },
      { from: 2, to: 11, order: 1 }
    ],
    highlights: [
      {
        id: 'alcohol',
        label: '醇羟基',
        atomIndexes: [3, 4],
        bondIndexes: [3],
        color: '#e8590c'
      }
    ]
  },
  'butan-2-ol': {
    compoundId: 'butan-2-ol',
    defaultDisplayMode: 'ball-stick',
    atoms: [
      { element: 'C', position: [-2.0, 0, 0] },
      { element: 'C', position: [-0.72, 0.05, 0] },
      { element: 'C', position: [0.58, -0.02, 0] },
      { element: 'C', position: [1.9, 0.04, 0] },
      { element: 'O', position: [-0.72, 1.15, 0] },
      { element: 'H', position: [-0.05, 1.72, 0] },
      { element: 'H', position: [-2.5, 0.95, 0] },
      { element: 'H', position: [-2.56, -0.48, 0.82] },
      { element: 'H', position: [-2.56, -0.48, -0.82] },
      { element: 'H', position: [-0.72, -0.82, -0.78] },
      { element: 'H', position: [0.58, -1.02, 0.74] },
      { element: 'H', position: [0.58, -1.02, -0.74] },
      { element: 'H', position: [2.4, 0.98, 0] },
      { element: 'H', position: [2.46, -0.48, 0.82] },
      { element: 'H', position: [2.46, -0.48, -0.82] }
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 1, to: 2, order: 1 },
      { from: 2, to: 3, order: 1 },
      { from: 1, to: 4, order: 1 },
      { from: 4, to: 5, order: 1 },
      { from: 0, to: 6, order: 1 },
      { from: 0, to: 7, order: 1 },
      { from: 0, to: 8, order: 1 },
      { from: 1, to: 9, order: 1 },
      { from: 2, to: 10, order: 1 },
      { from: 2, to: 11, order: 1 },
      { from: 3, to: 12, order: 1 },
      { from: 3, to: 13, order: 1 },
      { from: 3, to: 14, order: 1 }
    ],
    highlights: [
      {
        id: 'alcohol',
        label: '醇羟基',
        atomIndexes: [1, 4, 5],
        bondIndexes: [3, 4],
        color: '#e8590c'
      }
    ]
  },
  acetaldehyde: {
    compoundId: 'acetaldehyde',
    defaultDisplayMode: 'ball-stick',
    atoms: [
      { element: 'C', position: [-0.75, 0, 0] },
      { element: 'C', position: [0.72, 0, 0] },
      { element: 'O', position: [1.38, 0.98, 0] },
      { element: 'H', position: [1.28, -0.94, 0] },
      { element: 'H', position: [-1.25, 0.95, 0] },
      { element: 'H', position: [-1.28, -0.48, 0.82] },
      { element: 'H', position: [-1.28, -0.48, -0.82] }
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 1, to: 2, order: 2 },
      { from: 1, to: 3, order: 1 },
      { from: 0, to: 4, order: 1 },
      { from: 0, to: 5, order: 1 },
      { from: 0, to: 6, order: 1 }
    ],
    highlights: [
      {
        id: 'aldehyde',
        label: '醛基',
        atomIndexes: [1, 2, 3],
        bondIndexes: [1, 2],
        color: '#f08c00'
      }
    ]
  },
  'acetic-acid': {
    compoundId: 'acetic-acid',
    defaultDisplayMode: 'ball-stick',
    atoms: [
      { element: 'C', position: [-0.75, 0, 0] },
      { element: 'C', position: [0.72, 0, 0] },
      { element: 'O', position: [1.38, 0.98, 0] },
      { element: 'O', position: [1.32, -0.94, 0] },
      { element: 'H', position: [2.16, -0.78, 0] },
      { element: 'H', position: [-1.25, 0.95, 0] },
      { element: 'H', position: [-1.28, -0.48, 0.82] },
      { element: 'H', position: [-1.28, -0.48, -0.82] }
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 1, to: 2, order: 2 },
      { from: 1, to: 3, order: 1 },
      { from: 3, to: 4, order: 1 },
      { from: 0, to: 5, order: 1 },
      { from: 0, to: 6, order: 1 },
      { from: 0, to: 7, order: 1 }
    ],
    highlights: [
      {
        id: 'carboxylic-acid',
        label: '羧基',
        atomIndexes: [1, 2, 3, 4],
        bondIndexes: [1, 2, 3],
        color: '#d6336c'
      }
    ]
  },
  'ethyl-acetate': {
    compoundId: 'ethyl-acetate',
    defaultDisplayMode: 'ball-stick',
    atoms: [
      { element: 'C', position: [-2.0, 0, 0] },
      { element: 'C', position: [-0.72, 0, 0] },
      { element: 'O', position: [-0.08, 1.02, 0] },
      { element: 'O', position: [0.02, -0.92, 0] },
      { element: 'C', position: [1.32, -0.92, 0] },
      { element: 'C', position: [2.58, -0.92, 0] },
      { element: 'H', position: [-2.42, 0.96, 0] },
      { element: 'H', position: [-2.48, -0.48, 0.82] },
      { element: 'H', position: [-2.48, -0.48, -0.82] },
      { element: 'H', position: [1.32, -1.96, 0.72] },
      { element: 'H', position: [1.32, -1.96, -0.72] },
      { element: 'H', position: [3.06, 0.02, 0] },
      { element: 'H', position: [3.08, -1.42, 0.82] },
      { element: 'H', position: [3.08, -1.42, -0.82] }
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 1, to: 2, order: 2 },
      { from: 1, to: 3, order: 1 },
      { from: 3, to: 4, order: 1 },
      { from: 4, to: 5, order: 1 },
      { from: 0, to: 6, order: 1 },
      { from: 0, to: 7, order: 1 },
      { from: 0, to: 8, order: 1 },
      { from: 4, to: 9, order: 1 },
      { from: 4, to: 10, order: 1 },
      { from: 5, to: 11, order: 1 },
      { from: 5, to: 12, order: 1 },
      { from: 5, to: 13, order: 1 }
    ],
    highlights: [
      {
        id: 'ester',
        label: '酯基',
        atomIndexes: [1, 2, 3],
        bondIndexes: [1, 2],
        color: '#ae3ec9'
      }
    ]
  },
  benzene: {
    compoundId: 'benzene',
    defaultDisplayMode: 'ball-stick',
    atoms: [
      { element: 'C', position: [1.4, 0, 0] },
      { element: 'C', position: [0.7, 1.21, 0] },
      { element: 'C', position: [-0.7, 1.21, 0] },
      { element: 'C', position: [-1.4, 0, 0] },
      { element: 'C', position: [-0.7, -1.21, 0] },
      { element: 'C', position: [0.7, -1.21, 0] },
      { element: 'H', position: [2.42, 0, 0] },
      { element: 'H', position: [1.21, 2.1, 0] },
      { element: 'H', position: [-1.21, 2.1, 0] },
      { element: 'H', position: [-2.42, 0, 0] },
      { element: 'H', position: [-1.21, -2.1, 0] },
      { element: 'H', position: [1.21, -2.1, 0] }
    ],
    bonds: [
      { from: 0, to: 1, order: 2 },
      { from: 1, to: 2, order: 1 },
      { from: 2, to: 3, order: 2 },
      { from: 3, to: 4, order: 1 },
      { from: 4, to: 5, order: 2 },
      { from: 5, to: 0, order: 1 },
      { from: 0, to: 6, order: 1 },
      { from: 1, to: 7, order: 1 },
      { from: 2, to: 8, order: 1 },
      { from: 3, to: 9, order: 1 },
      { from: 4, to: 10, order: 1 },
      { from: 5, to: 11, order: 1 }
    ],
    highlights: [
      {
        id: 'arene',
        label: '苯环',
        atomIndexes: [0, 1, 2, 3, 4, 5],
        bondIndexes: [0, 1, 2, 3, 4, 5],
        color: '#fab005'
      }
    ]
  },
  phenol: {
    compoundId: 'phenol',
    defaultDisplayMode: 'ball-stick',
    atoms: [
      { element: 'C', position: [1.4, 0, 0] },
      { element: 'C', position: [0.7, 1.21, 0] },
      { element: 'C', position: [-0.7, 1.21, 0] },
      { element: 'C', position: [-1.4, 0, 0] },
      { element: 'C', position: [-0.7, -1.21, 0] },
      { element: 'C', position: [0.7, -1.21, 0] },
      { element: 'O', position: [2.38, 0, 0] },
      { element: 'H', position: [3.02, 0.52, 0] },
      { element: 'H', position: [1.21, 2.1, 0] },
      { element: 'H', position: [-1.21, 2.1, 0] },
      { element: 'H', position: [-2.42, 0, 0] },
      { element: 'H', position: [-1.21, -2.1, 0] },
      { element: 'H', position: [1.21, -2.1, 0] }
    ],
    bonds: [
      { from: 0, to: 1, order: 2 },
      { from: 1, to: 2, order: 1 },
      { from: 2, to: 3, order: 2 },
      { from: 3, to: 4, order: 1 },
      { from: 4, to: 5, order: 2 },
      { from: 5, to: 0, order: 1 },
      { from: 0, to: 6, order: 1 },
      { from: 6, to: 7, order: 1 },
      { from: 1, to: 8, order: 1 },
      { from: 2, to: 9, order: 1 },
      { from: 3, to: 10, order: 1 },
      { from: 4, to: 11, order: 1 },
      { from: 5, to: 12, order: 1 }
    ],
    highlights: [
      {
        id: 'arene',
        label: '苯环',
        atomIndexes: [0, 1, 2, 3, 4, 5],
        bondIndexes: [0, 1, 2, 3, 4, 5],
        color: '#fab005'
      },
      {
        id: 'phenol',
        label: '酚羟基',
        atomIndexes: [0, 6, 7],
        bondIndexes: [6, 7],
        color: '#e8590c'
      }
    ]
  },
  formaldehyde: {
    compoundId: 'formaldehyde',
    defaultDisplayMode: 'ball-stick',
    atoms: [
      { element: 'C', position: [0, 0, 0] },
      { element: 'O', position: [1.08, 0, 0] },
      { element: 'H', position: [-0.56, 0.9, 0] },
      { element: 'H', position: [-0.56, -0.9, 0] }
    ],
    bonds: [
      { from: 0, to: 1, order: 2 },
      { from: 0, to: 2, order: 1 },
      { from: 0, to: 3, order: 1 }
    ],
    highlights: [
      {
        id: 'aldehyde',
        label: '醛基',
        atomIndexes: [0, 1, 2],
        bondIndexes: [0, 1],
        color: '#f08c00'
      }
    ]
  },
  acetone: {
    compoundId: 'acetone',
    defaultDisplayMode: 'ball-stick',
    atoms: [
      { element: 'C', position: [-1.32, 0, 0] },
      { element: 'C', position: [0, 0, 0] },
      { element: 'C', position: [1.32, 0, 0] },
      { element: 'O', position: [0, 1.12, 0] },
      { element: 'H', position: [-1.78, 0.94, 0] },
      { element: 'H', position: [-1.86, -0.5, 0.82] },
      { element: 'H', position: [-1.86, -0.5, -0.82] },
      { element: 'H', position: [1.78, 0.94, 0] },
      { element: 'H', position: [1.86, -0.5, 0.82] },
      { element: 'H', position: [1.86, -0.5, -0.82] }
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 1, to: 2, order: 1 },
      { from: 1, to: 3, order: 2 },
      { from: 0, to: 4, order: 1 },
      { from: 0, to: 5, order: 1 },
      { from: 0, to: 6, order: 1 },
      { from: 2, to: 7, order: 1 },
      { from: 2, to: 8, order: 1 },
      { from: 2, to: 9, order: 1 }
    ],
    highlights: [
      {
        id: 'ketone',
        label: '酮羰基',
        atomIndexes: [0, 1, 2, 3],
        bondIndexes: [0, 1, 2],
        color: '#f08c00'
      }
    ]
  },
  '2-methylbutane': sketchModel(
    '2-methylbutane',
    [
      ['C', -1.9, 0, 0],
      ['C', -0.65, 0, 0],
      ['C', 0.65, 0, 0],
      ['C', 1.9, 0, 0],
      ['C', -0.65, 1.18, 0]
    ],
    [
      [0, 1, 1],
      [1, 2, 1],
      [2, 3, 1],
      [1, 4, 1]
    ],
    [fg('alkane', '饱和烃', [0, 1, 2, 3, 4], [0, 1, 2, 3], '#4dabf7')]
  ),
  '4-methyl-2-pentene': sketchModel(
    '4-methyl-2-pentene',
    [
      ['C', -2.4, 0, 0],
      ['C', -1.2, 0, 0],
      ['C', 0, 0, 0],
      ['C', 1.2, 0, 0],
      ['C', 2.4, 0, 0],
      ['C', 1.2, 1.18, 0]
    ],
    [
      [0, 1, 1],
      [1, 2, 2],
      [2, 3, 1],
      [3, 4, 1],
      [3, 5, 1]
    ],
    [fg('alkene', '碳碳双键', [1, 2], [1], '#228be6')]
  ),
  '2-butyne': sketchModel(
    '2-butyne',
    [
      ['C', -1.95, 0, 0],
      ['C', -0.65, 0, 0],
      ['C', 0.65, 0, 0],
      ['C', 1.95, 0, 0]
    ],
    [
      [0, 1, 1],
      [1, 2, 3],
      [2, 3, 1]
    ],
    [fg('alkyne', '碳碳三键', [1, 2], [1], '#7048e8')]
  ),
  toluene: substitutedBenzeneModel(
    'toluene',
    [
      ['C', 2.42, 0, 0],
      ['H', 3.02, 0.82, 0],
      ['H', 3.02, -0.41, 0.72],
      ['H', 3.02, -0.41, -0.72]
    ],
    [
      [0, 6, 1],
      [6, 7, 1],
      [6, 8, 1],
      [6, 9, 1]
    ],
    []
  ),
  naphthalene: naphthaleneModel('naphthalene', []),
  iodomethane: sketchModel(
    'iodomethane',
    [
      ['C', 0, 0, 0],
      ['I', 1.45, 0, 0],
      ['H', -0.72, 0.86, 0],
      ['H', -0.72, -0.43, 0.74],
      ['H', -0.72, -0.43, -0.74]
    ],
    [
      [0, 1, 1],
      [0, 2, 1],
      [0, 3, 1],
      [0, 4, 1]
    ],
    [fg('haloalkane', '碳卤键', [0, 1], [0], '#5f3dc4')]
  ),
  bromoethane: sketchModel(
    'bromoethane',
    [
      ['C', -0.75, 0, 0],
      ['C', 0.58, 0, 0],
      ['Br', 1.86, 0, 0],
      ['H', -1.28, 0.92, 0],
      ['H', -1.28, -0.46, 0.78],
      ['H', -1.28, -0.46, -0.78],
      ['H', 0.58, 0.98, 0.68],
      ['H', 0.58, -0.98, -0.68]
    ],
    [
      [0, 1, 1],
      [1, 2, 1],
      [0, 3, 1],
      [0, 4, 1],
      [0, 5, 1],
      [1, 6, 1],
      [1, 7, 1]
    ],
    [fg('haloalkane', '碳卤键', [1, 2], [1], '#a61e4d')]
  ),
  glycerol: sketchModel(
    'glycerol',
    [
      ['C', -1.3, 0, 0],
      ['C', 0, 0, 0],
      ['C', 1.3, 0, 0],
      ['O', -1.3, 1.05, 0],
      ['H', -1.9, 1.55, 0],
      ['O', 0, -1.05, 0],
      ['H', 0.62, -1.55, 0],
      ['O', 1.3, 1.05, 0],
      ['H', 1.9, 1.55, 0]
    ],
    [
      [0, 1, 1],
      [1, 2, 1],
      [0, 3, 1],
      [3, 4, 1],
      [1, 5, 1],
      [5, 6, 1],
      [2, 7, 1],
      [7, 8, 1]
    ],
    [fg('alcohol', '醇羟基', [0, 1, 2, 3, 4, 5, 6, 7, 8], [2, 3, 4, 5, 6, 7], '#e8590c')]
  ),
  'diethyl-ether': sketchModel(
    'diethyl-ether',
    [
      ['C', -2.4, 0, 0],
      ['C', -1.18, 0, 0],
      ['O', 0, 0, 0],
      ['C', 1.18, 0, 0],
      ['C', 2.4, 0, 0]
    ],
    [
      [0, 1, 1],
      [1, 2, 1],
      [2, 3, 1],
      [3, 4, 1]
    ],
    [fg('ether', '醚键', [1, 2, 3], [1, 2], '#12b886')]
  ),
  anisole: substitutedBenzeneModel(
    'anisole',
    [
      ['O', 2.38, 0, 0],
      ['C', 3.48, 0, 0],
      ['H', 4.02, 0.86, 0],
      ['H', 4.02, -0.43, 0.74],
      ['H', 4.02, -0.43, -0.74]
    ],
    [
      [0, 6, 1],
      [6, 7, 1],
      [7, 8, 1],
      [7, 9, 1],
      [7, 10, 1]
    ],
    [fg('ether', '醚键', [0, 6, 7], [6, 7], '#12b886')]
  ),
  naphthol: naphthaleneModel('naphthol', [
    fg('phenol', '酚羟基', [7, 10, 11], [11, 12], '#e8590c')
  ], [
    ['O', 3.05, 0, 0],
    ['H', 3.65, 0.52, 0]
  ], [
    [7, 10, 1],
    [10, 11, 1]
  ]),
  cyclohexanone: sketchModel(
    'cyclohexanone',
    [
      ['C', 1.3, 0, 0],
      ['C', 0.65, 1.12, 0],
      ['C', -0.65, 1.12, 0],
      ['C', -1.3, 0, 0],
      ['C', -0.65, -1.12, 0],
      ['C', 0.65, -1.12, 0],
      ['O', 2.45, 0, 0]
    ],
    [
      [0, 1, 1],
      [1, 2, 1],
      [2, 3, 1],
      [3, 4, 1],
      [4, 5, 1],
      [5, 0, 1],
      [0, 6, 2]
    ],
    [fg('ketone', '酮羰基', [0, 6], [6], '#f08c00')]
  ),
  'oxalic-acid': sketchModel(
    'oxalic-acid',
    [
      ['C', -0.65, 0, 0],
      ['C', 0.65, 0, 0],
      ['O', -1.24, 0.98, 0],
      ['O', -1.22, -0.92, 0],
      ['H', -1.96, -0.64, 0],
      ['O', 1.24, 0.98, 0],
      ['O', 1.22, -0.92, 0],
      ['H', 1.96, -0.64, 0]
    ],
    [
      [0, 1, 1],
      [0, 2, 2],
      [0, 3, 1],
      [3, 4, 1],
      [1, 5, 2],
      [1, 6, 1],
      [6, 7, 1]
    ],
    [fg('carboxylic-acid', '羧基', [0, 1, 2, 3, 4, 5, 6, 7], [1, 2, 3, 4, 5, 6], '#d6336c')]
  ),
  tristearin: sketchModel(
    'tristearin',
    [
      ['C', -0.8, 0.8, 0],
      ['C', -0.8, 0, 0],
      ['C', -0.8, -0.8, 0],
      ['O', 0.2, 0.8, 0],
      ['C', 1.15, 0.8, 0],
      ['O', 1.15, 1.75, 0],
      ['C', 2.3, 0.8, 0],
      ['O', 0.2, 0, 0],
      ['C', 1.15, 0, 0],
      ['O', 1.15, 0.95, 0.2],
      ['C', 2.3, 0, 0],
      ['O', 0.2, -0.8, 0],
      ['C', 1.15, -0.8, 0],
      ['O', 1.15, -1.75, 0],
      ['C', 2.3, -0.8, 0],
      ['C', 3.45, 0.8, 0],
      ['C', 4.6, 0.8, 0],
      ['C', 3.45, 0, 0],
      ['C', 4.6, 0, 0],
      ['C', 3.45, -0.8, 0],
      ['C', 4.6, -0.8, 0]
    ],
    [
      [0, 1, 1],
      [1, 2, 1],
      [0, 3, 1],
      [3, 4, 1],
      [4, 5, 2],
      [4, 6, 1],
      [1, 7, 1],
      [7, 8, 1],
      [8, 9, 2],
      [8, 10, 1],
      [2, 11, 1],
      [11, 12, 1],
      [12, 13, 2],
      [12, 14, 1],
      [6, 15, 1],
      [15, 16, 1],
      [10, 17, 1],
      [17, 18, 1],
      [14, 19, 1],
      [19, 20, 1]
    ],
    [fg('ester', '酯基', [3, 4, 5, 7, 8, 9, 11, 12, 13], [3, 4, 7, 8, 11, 12], '#ae3ec9')]
  ),
  aniline: substitutedBenzeneModel(
    'aniline',
    [
      ['N', 2.38, 0, 0],
      ['H', 2.98, 0.62, 0],
      ['H', 2.98, -0.62, 0]
    ],
    [
      [0, 6, 1],
      [6, 7, 1],
      [6, 8, 1]
    ],
    [fg('amine', '氨基', [0, 6, 7, 8], [6, 7, 8], '#4263eb')]
  ),
  'ethane-1-2-diamine': sketchModel(
    'ethane-1-2-diamine',
    [
      ['N', -1.8, 0, 0],
      ['C', -0.6, 0, 0],
      ['C', 0.6, 0, 0],
      ['N', 1.8, 0, 0],
      ['H', -2.28, 0.72, 0],
      ['H', -2.28, -0.72, 0],
      ['H', 2.28, 0.72, 0],
      ['H', 2.28, -0.72, 0]
    ],
    [
      [0, 1, 1],
      [1, 2, 1],
      [2, 3, 1],
      [0, 4, 1],
      [0, 5, 1],
      [3, 6, 1],
      [3, 7, 1]
    ],
    [fg('amine', '氨基', [0, 3, 4, 5, 6, 7], [0, 2, 3, 4, 5, 6], '#4263eb')]
  ),
  acetamide: sketchModel(
    'acetamide',
    [
      ['C', -1.1, 0, 0],
      ['C', 0.15, 0, 0],
      ['O', 0.78, 0.98, 0],
      ['N', 0.9, -0.9, 0],
      ['H', 1.52, -1.45, 0],
      ['H', 0.35, -1.48, 0]
    ],
    [
      [0, 1, 1],
      [1, 2, 2],
      [1, 3, 1],
      [3, 4, 1],
      [3, 5, 1]
    ],
    [fg('amide', '酰胺基', [1, 2, 3, 4, 5], [1, 2, 3, 4], '#15aabf')]
  ),
  urea: sketchModel(
    'urea',
    [
      ['C', 0, 0, 0],
      ['O', 0, 1.12, 0],
      ['N', -1.05, -0.72, 0],
      ['N', 1.05, -0.72, 0],
      ['H', -1.65, -1.22, 0],
      ['H', -1.05, -1.52, 0],
      ['H', 1.65, -1.22, 0],
      ['H', 1.05, -1.52, 0]
    ],
    [
      [0, 1, 2],
      [0, 2, 1],
      [0, 3, 1],
      [2, 4, 1],
      [2, 5, 1],
      [3, 6, 1],
      [3, 7, 1]
    ],
    [fg('amide', '酰胺基', [0, 1, 2, 3, 4, 5, 6, 7], [0, 1, 2, 3, 4, 5, 6], '#15aabf')]
  ),
  'benzoic-acid': substitutedBenzeneModel(
    'benzoic-acid',
    [
      ['C', 2.42, 0, 0],
      ['O', 3.02, 0.98, 0],
      ['O', 3.02, -0.9, 0],
      ['H', 3.76, -0.68, 0]
    ],
    [
      [0, 6, 1],
      [6, 7, 2],
      [6, 8, 1],
      [8, 9, 1]
    ],
    [fg('carboxylic-acid', '羧基', [6, 7, 8, 9], [7, 8, 9], '#d6336c')]
  ),
  'benzyl-chloride': substitutedBenzeneModel(
    'benzyl-chloride',
    [
      ['C', 2.42, 0, 0],
      ['Cl', 3.62, 0, 0]
    ],
    [
      [0, 6, 1],
      [6, 7, 1]
    ],
    [fg('haloalkane', '碳卤键', [6, 7], [7], '#37b24d')]
  ),
  'benzyl-alcohol': substitutedBenzeneModel(
    'benzyl-alcohol',
    [
      ['C', 2.42, 0, 0],
      ['O', 3.5, 0, 0],
      ['H', 4.08, 0.58, 0]
    ],
    [
      [0, 6, 1],
      [6, 7, 1],
      [7, 8, 1]
    ],
    [fg('alcohol', '醇羟基', [6, 7, 8], [7, 8], '#e8590c')]
  ),
  benzaldehyde: substitutedBenzeneModel(
    'benzaldehyde',
    [
      ['C', 2.42, 0, 0],
      ['O', 3.02, 0.98, 0],
      ['H', 3.05, -0.9, 0]
    ],
    [
      [0, 6, 1],
      [6, 7, 2],
      [6, 8, 1]
    ],
    [fg('aldehyde', '醛基', [6, 7, 8], [7, 8], '#f08c00')]
  ),
  'benzyl-benzoate': sketchModel(
    'benzyl-benzoate',
    [
      ['C', -3.1, 0, 0],
      ['C', -3.8, 1.12, 0],
      ['C', -5.1, 1.12, 0],
      ['C', -5.8, 0, 0],
      ['C', -5.1, -1.12, 0],
      ['C', -3.8, -1.12, 0],
      ['C', 3.1, 0, 0],
      ['C', 3.8, 1.12, 0],
      ['C', 5.1, 1.12, 0],
      ['C', 5.8, 0, 0],
      ['C', 5.1, -1.12, 0],
      ['C', 3.8, -1.12, 0],
      ['C', -1.8, 0, 0],
      ['O', -1.2, 0.98, 0],
      ['O', -1.1, -0.82, 0],
      ['C', 0.2, -0.82, 0],
      ['H', 0.2, -1.7, 0.64]
    ],
    [
      [0, 1, 2],
      [1, 2, 1],
      [2, 3, 2],
      [3, 4, 1],
      [4, 5, 2],
      [5, 0, 1],
      [6, 7, 2],
      [7, 8, 1],
      [8, 9, 2],
      [9, 10, 1],
      [10, 11, 2],
      [11, 6, 1],
      [0, 12, 1],
      [12, 13, 2],
      [12, 14, 1],
      [14, 15, 1],
      [15, 6, 1],
      [15, 16, 1]
    ],
    [
      fg('arene', '苯环', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], '#fab005'),
      fg('ester', '酯基', [12, 13, 14, 15], [13, 14, 15], '#ae3ec9')
    ]
  ),
  'sodium-3-hydroxy-3-phenylpropanoate': substitutedBenzeneModel(
    'sodium-3-hydroxy-3-phenylpropanoate',
    [
      ['C', 2.42, 0, 0],
      ['O', 2.42, 1.08, 0],
      ['H', 3.05, 1.55, 0],
      ['C', 3.55, -0.55, 0],
      ['C', 4.72, -0.55, 0],
      ['O', 5.35, 0.42, 0],
      ['O', 5.35, -1.42, 0],
      ['Na', 6.2, -1.42, 0]
    ],
    [
      [0, 6, 1],
      [6, 7, 1],
      [7, 8, 1],
      [6, 9, 1],
      [9, 10, 1],
      [10, 11, 2],
      [10, 12, 1],
      [12, 13, 1]
    ],
    [
      fg('alcohol', '醇羟基', [6, 7, 8], [7, 8], '#e8590c'),
      fg('carboxylate', '羧酸盐', [10, 11, 12, 13], [11, 12, 13], '#0ca678')
    ]
  )
};

export function getMoleculeModel(compoundId: string): MoleculeModel {
  const model = moleculeModels[compoundId];
  if (!model) {
    throw new Error(`Unknown molecule model: ${compoundId}`);
  }
  return model;
}

export function validateMoleculeModel(model: MoleculeModel): string[] {
  const errors: string[] = [];
  const atomCount = model.atoms.length;
  const bondCount = model.bonds.length;

  model.bonds.forEach((bond, index) => {
    if (!isValidIndex(bond.from, atomCount)) {
      errors.push(`Bond ${index} has invalid from atom index ${bond.from}.`);
    }
    if (!isValidIndex(bond.to, atomCount)) {
      errors.push(`Bond ${index} has invalid to atom index ${bond.to}.`);
    }
    if (bond.from === bond.to) {
      errors.push(`Bond ${index} connects atom ${bond.from} to itself.`);
    }
  });

  model.highlights.forEach((highlight, highlightIndex) => {
    highlight.atomIndexes.forEach((atomIndex) => {
      if (!isValidIndex(atomIndex, atomCount)) {
        errors.push(`Highlight ${highlightIndex} references invalid atom index ${atomIndex}.`);
      }
    });
    highlight.bondIndexes.forEach((bondIndex) => {
      if (!isValidIndex(bondIndex, bondCount)) {
        errors.push(`Highlight ${highlightIndex} references invalid bond index ${bondIndex}.`);
      }
    });
  });

  return errors;
}

function isValidIndex(index: number, length: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < length;
}

type AtomSpec = [ElementSymbol, number, number, number];
type BondSpec = [number, number, 1 | 2 | 3];

function sketchModel(
  compoundId: string,
  atoms: AtomSpec[],
  bonds: BondSpec[],
  highlights: FunctionalGroupHighlight[]
): MoleculeModel {
  return {
    compoundId,
    defaultDisplayMode: 'ball-stick',
    atoms: atoms.map(([element, x, y, z]) => ({ element, position: [x, y, z] })),
    bonds: bonds.map(([from, to, order]) => ({ from, to, order })),
    highlights
  };
}

function fg(
  id: FunctionalGroup,
  label: string,
  atomIndexes: number[],
  bondIndexes: number[],
  color: string
): FunctionalGroupHighlight {
  return { id, label, atomIndexes, bondIndexes, color };
}

function substitutedBenzeneModel(
  compoundId: string,
  substituentAtoms: AtomSpec[],
  substituentBonds: BondSpec[],
  extraHighlights: FunctionalGroupHighlight[]
): MoleculeModel {
  return sketchModel(
    compoundId,
    [
      ['C', 1.4, 0, 0],
      ['C', 0.7, 1.21, 0],
      ['C', -0.7, 1.21, 0],
      ['C', -1.4, 0, 0],
      ['C', -0.7, -1.21, 0],
      ['C', 0.7, -1.21, 0],
      ...substituentAtoms
    ],
    [
      [0, 1, 2],
      [1, 2, 1],
      [2, 3, 2],
      [3, 4, 1],
      [4, 5, 2],
      [5, 0, 1],
      ...substituentBonds
    ],
    [
      fg('arene', '苯环', [0, 1, 2, 3, 4, 5], [0, 1, 2, 3, 4, 5], '#fab005'),
      ...extraHighlights
    ]
  );
}

function naphthaleneModel(
  compoundId: string,
  extraHighlights: FunctionalGroupHighlight[],
  extraAtoms: AtomSpec[] = [],
  extraBonds: BondSpec[] = []
): MoleculeModel {
  return sketchModel(
    compoundId,
    [
      ['C', -2.1, 0, 0],
      ['C', -1.4, 1.18, 0],
      ['C', -0.1, 1.18, 0],
      ['C', 0.6, 0, 0],
      ['C', -0.1, -1.18, 0],
      ['C', -1.4, -1.18, 0],
      ['C', 1.9, 1.18, 0],
      ['C', 2.6, 0, 0],
      ['C', 1.9, -1.18, 0],
      ['C', 0.6, -1.18, 0],
      ...extraAtoms
    ],
    [
      [0, 1, 2],
      [1, 2, 1],
      [2, 3, 2],
      [3, 4, 1],
      [4, 5, 2],
      [5, 0, 1],
      [2, 6, 1],
      [6, 7, 2],
      [7, 8, 1],
      [8, 9, 2],
      [9, 3, 1],
      ...extraBonds
    ],
    [
      fg('arene', '稠合苯环', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], '#fab005'),
      ...extraHighlights
    ]
  );
}
