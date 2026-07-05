import type { FunctionalGroup } from './chemistry';

export type ElementSymbol = 'C' | 'H' | 'O';
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
  O: { label: '氧', color: '#e03131', radius: 0.3, spaceFillRadius: 0.66 }
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
  }
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
