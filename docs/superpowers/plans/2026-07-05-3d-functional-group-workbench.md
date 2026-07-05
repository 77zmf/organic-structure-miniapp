# 3D Functional Group Workbench Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add classroom-clickable 3D functional-group visualization and a polished lab-console UI while preserving the three learning dimensions.

**Architecture:** Keep deterministic chemistry rules in `src/chemistry.ts`, add molecule geometry in `src/moleculeModels.ts`, render Three.js models through `src/moleculeViewer.ts`, and let `src/app.ts` mount/destroy viewers as UI state changes. High-level formula reasoning must not reveal the target 3D model until the student answers correctly.

**Tech Stack:** Vite, TypeScript, Vitest, Three.js, OrbitControls, Playwright CLI for browser verification, GitHub Pages.

---

## File Structure

- Modify: `package.json`, `package-lock.json`
  - Add `three` dependency.
- Modify: `src/chemistry.ts`
  - Add methane / acetone missing rule coverage.
  - Extend local agent to answer hidden-compound + organic-compound reaction questions.
  - Keep direct-answer guardrails.
- Create: `src/moleculeModels.ts`
  - Define molecule model types, element style data, atom/bond validation, model lookup.
  - Store model data for every initial compound.
- Create: `src/moleculeViewer.ts`
  - Encapsulate Three.js scene, camera, lights, controls, molecule drawing, resize, reset, dispose.
- Modify: `src/app.ts`
  - Replace SVG-only molecule panels with 3D viewer mount containers.
  - Add display mode / highlight / high-level unlock state.
  - Preserve the existing three modes.
- Modify: `src/styles.css`
  - Apply lab-console UI, larger click targets, stable 3D panel dimensions, responsive layouts.
- Modify: `shared/deepseekProxy.ts`
  - Update DeepSeek system prompt for organic-pair questions while keeping sanitization.
- Create: `test/moleculeModels.test.ts`
  - Validate all model data and compound coverage.
- Modify: `test/chemistry.test.ts`
  - Add organic-pair agent questions and expanded high-school data coverage.
- Modify: `test/deepseekProxy.test.ts`
  - Add prompt coverage for organic-pair questions and no-answer-leak behavior.
- Create: `test/puzzleUnlock.test.ts` only if app state unlock logic is extracted from `app.ts`.
  - Prefer extraction if browser-only testing becomes too coarse.

---

### Task 1: Add Three.js Dependency

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Install dependency**

Run:

```bash
npm install three
```

Expected:

- `package.json` contains `"three"`.
- `package-lock.json` updates.

- [ ] **Step 2: Verify TypeScript can resolve Three.js**

Run:

```bash
npm run build
```

Expected:

- Build passes.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add three dependency"
```

---

### Task 2: Create Molecule Model Data With Failing Tests

**Files:**
- Create: `test/moleculeModels.test.ts`
- Create: `src/moleculeModels.ts`
- Modify: `src/chemistry.ts`

- [ ] **Step 1: Write failing model coverage tests**

Create `test/moleculeModels.test.ts`:

```ts
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

  test('all model atom elements have visual styles', () => {
    const elements = new Set(Object.values(moleculeModels).flatMap((model) => model.atoms.map((atom) => atom.element)));

    for (const element of elements) {
      expect(elementStyles[element]).toBeDefined();
    }
  });
});
```

- [ ] **Step 2: Run test to verify RED**

Run:

```bash
npm test -- --run test/moleculeModels.test.ts
```

Expected:

- FAIL because `src/moleculeModels.ts` does not exist.

- [ ] **Step 3: Add methane to chemistry data before model coverage**

Modify `src/chemistry.ts`:

- Add `'alkane'` to `FunctionalGroup`.
- Add methane compound:

```ts
{
  id: 'methane',
  name: '甲烷',
  formula: 'CH4',
  aliases: ['甲烷', 'methane', 'ch4'],
  structureFormula: 'CH4',
  functionalGroups: ['alkane'],
  level: 'basic',
  summary: '饱和烃，常见高中条件下性质较稳定，典型反应是光照条件下与氯气发生取代反应。'
}
```

- Add reagent rule for methane only when the app later includes chlorine/light. Do not add a random reagent rule for unsupported current reagents.
- Update `functionalGroupLabels()` to map `alkane` to `饱和烃`.

- [ ] **Step 4: Implement `src/moleculeModels.ts`**

Create `src/moleculeModels.ts` with these exported types and helpers:

```ts
export type ElementSymbol = 'C' | 'H' | 'O';
export type DisplayMode = 'ball-stick' | 'space-fill';

export interface MoleculeAtom {
  element: ElementSymbol;
  position: [number, number, number];
  label?: string;
}

export interface MoleculeBond {
  from: number;
  to: number;
  order?: 1 | 2 | 3;
}

export interface FunctionalGroupHighlight {
  id: string;
  label: string;
  atomIndexes: number[];
  bondIndexes: number[];
}

export interface MoleculeModel {
  compoundId: string;
  atoms: MoleculeAtom[];
  bonds: MoleculeBond[];
  highlights: FunctionalGroupHighlight[];
  scale?: number;
}

export const elementStyles: Record<ElementSymbol, { color: string; radius: number; label: string }> = {
  C: { color: '#d6dde4', radius: 0.28, label: 'C' },
  H: { color: '#f8f7ef', radius: 0.18, label: 'H' },
  O: { color: '#e34b4b', radius: 0.3, label: 'O' }
};

export const moleculeModels: Record<string, MoleculeModel> = {
  methane: {
    compoundId: 'methane',
    scale: 1.05,
    atoms: [
      { element: 'C', position: [0, 0, 0] },
      { element: 'H', position: [0.82, 0.82, 0.82] },
      { element: 'H', position: [-0.82, -0.82, 0.82] },
      { element: 'H', position: [-0.82, 0.82, -0.82] },
      { element: 'H', position: [0.82, -0.82, -0.82] }
    ],
    bonds: [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 0, to: 3 },
      { from: 0, to: 4 }
    ],
    highlights: [{ id: 'alkane', label: '饱和 C-H 键', atomIndexes: [0, 1, 2, 3, 4], bondIndexes: [0, 1, 2, 3] }]
  },
  ethene: {
    compoundId: 'ethene',
    atoms: [
      { element: 'C', position: [-0.55, 0, 0] },
      { element: 'C', position: [0.55, 0, 0] },
      { element: 'H', position: [-1.05, 0.82, 0] },
      { element: 'H', position: [-1.05, -0.82, 0] },
      { element: 'H', position: [1.05, 0.82, 0] },
      { element: 'H', position: [1.05, -0.82, 0] }
    ],
    bonds: [
      { from: 0, to: 1, order: 2 },
      { from: 0, to: 2 },
      { from: 0, to: 3 },
      { from: 1, to: 4 },
      { from: 1, to: 5 }
    ],
    highlights: [{ id: 'alkene', label: '碳碳双键', atomIndexes: [0, 1], bondIndexes: [0] }]
  },
  acetylene: {
    compoundId: 'acetylene',
    atoms: [
      { element: 'C', position: [-0.55, 0, 0] },
      { element: 'C', position: [0.55, 0, 0] },
      { element: 'H', position: [-1.35, 0, 0] },
      { element: 'H', position: [1.35, 0, 0] }
    ],
    bonds: [
      { from: 0, to: 1, order: 3 },
      { from: 0, to: 2 },
      { from: 1, to: 3 }
    ],
    highlights: [{ id: 'alkyne', label: '碳碳三键', atomIndexes: [0, 1], bondIndexes: [0] }]
  },
  ethanol: chainModel('ethanol', ['C', 'C', 'O'], 'alcohol', '醇羟基'),
  acetaldehyde: chainModel('acetaldehyde', ['C', 'C', 'O'], 'aldehyde', '醛基', [{ from: 1, to: 2, order: 2 }]),
  'acetic-acid': chainModel('acetic-acid', ['C', 'C', 'O', 'O'], 'carboxylic-acid', '羧基', [
    { from: 1, to: 2, order: 2 },
    { from: 1, to: 3 }
  ]),
  'ethyl-acetate': chainModel('ethyl-acetate', ['C', 'C', 'O', 'O', 'C', 'C'], 'ester', '酯基', [
    { from: 1, to: 2, order: 2 },
    { from: 1, to: 3 },
    { from: 3, to: 4 },
    { from: 4, to: 5 }
  ]),
  benzene: ringModel('benzene', false),
  phenol: ringModel('phenol', true),
  formaldehyde: chainModel('formaldehyde', ['C', 'O'], 'aldehyde', '醛基', [{ from: 0, to: 1, order: 2 }]),
  acetone: chainModel('acetone', ['C', 'C', 'O', 'C'], 'ketone', '酮羰基', [
    { from: 0, to: 1 },
    { from: 1, to: 2, order: 2 },
    { from: 1, to: 3 }
  ])
};

export function getMoleculeModel(compoundId: string): MoleculeModel {
  const model = moleculeModels[compoundId];
  if (!model) {
    throw new Error(`Missing molecule model for compound: ${compoundId}`);
  }
  return model;
}

export function validateMoleculeModel(model: MoleculeModel): string[] {
  const errors: string[] = [];
  model.bonds.forEach((bond, index) => {
    if (!model.atoms[bond.from]) errors.push(`${model.compoundId}: bond ${index} has invalid from atom`);
    if (!model.atoms[bond.to]) errors.push(`${model.compoundId}: bond ${index} has invalid to atom`);
  });
  model.highlights.forEach((highlight) => {
    highlight.atomIndexes.forEach((atomIndex) => {
      if (!model.atoms[atomIndex]) errors.push(`${model.compoundId}: highlight ${highlight.id} has invalid atom ${atomIndex}`);
    });
    highlight.bondIndexes.forEach((bondIndex) => {
      if (!model.bonds[bondIndex]) errors.push(`${model.compoundId}: highlight ${highlight.id} has invalid bond ${bondIndex}`);
    });
  });
  return errors;
}
```

Then add local helper functions in the same file. The helper output must match the explicit schema above:

```ts
function chainModel(
  compoundId: string,
  backbone: ElementSymbol[],
  groupId: string,
  groupLabel: string,
  explicitBonds: MoleculeBond[] = []
): MoleculeModel {
  const atoms: MoleculeAtom[] = backbone.map((element, index) => ({
    element,
    position: [(index - (backbone.length - 1) / 2) * 0.8, index % 2 === 0 ? 0.12 : -0.12, 0]
  }));
  const bonds: MoleculeBond[] =
    explicitBonds.length > 0
      ? explicitBonds
      : backbone.slice(1).map((_, index) => ({ from: index, to: index + 1 }));

  return {
    compoundId,
    atoms,
    bonds,
    highlights: [
      {
        id: groupId,
        label: groupLabel,
        atomIndexes: Array.from(new Set(bonds.flatMap((bond) => [bond.from, bond.to]))),
        bondIndexes: bonds.map((_, index) => index)
      }
    ]
  };
}

function ringModel(compoundId: string, withPhenol: boolean): MoleculeModel {
  const atoms: MoleculeAtom[] = [];
  const bonds: MoleculeBond[] = [];
  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI * 2 * i) / 6;
    atoms.push({ element: 'C', position: [Math.cos(angle), Math.sin(angle), 0] });
    bonds.push({ from: i, to: (i + 1) % 6, order: i % 2 === 0 ? 2 : 1 });
  }
  if (withPhenol) {
    atoms.push({ element: 'O', position: [1.72, 0, 0] });
    atoms.push({ element: 'H', position: [2.28, 0, 0] });
    bonds.push({ from: 0, to: 6 });
    bonds.push({ from: 6, to: 7 });
  }
  return {
    compoundId,
    atoms,
    bonds,
    highlights: [
      { id: 'arene', label: '苯环', atomIndexes: [0, 1, 2, 3, 4, 5], bondIndexes: [0, 1, 2, 3, 4, 5] },
      ...(withPhenol ? [{ id: 'phenol', label: '酚羟基', atomIndexes: [0, 6, 7], bondIndexes: [6, 7] }] : [])
    ]
  };
}
```

- [ ] **Step 5: Run model tests to verify GREEN**

Run:

```bash
npm test -- --run test/moleculeModels.test.ts
```

Expected:

- PASS.

- [ ] **Step 6: Run existing tests**

Run:

```bash
npm test -- --run
```

Expected:

- PASS.

- [ ] **Step 7: Commit**

```bash
git add src/chemistry.ts src/moleculeModels.ts test/moleculeModels.test.ts
git commit -m "feat: add molecule model data"
```

---

### Task 3: Extend Chemistry Agent for Organic-Pair Questions

**Files:**
- Modify: `test/chemistry.test.ts`
- Modify: `src/chemistry.ts`
- Modify: `test/deepseekProxy.test.ts`
- Modify: `shared/deepseekProxy.ts`

- [ ] **Step 1: Write failing local-agent tests**

Append to `describe('formula puzzle agent', ...)` in `test/chemistry.test.ts`:

```ts
test('agent answers whether hidden ethanol can react with acetic acid without revealing target name', () => {
  const reply = askAgent('puzzle-ethanol', '它能和乙酸发生反应吗？');

  expect(reply.answer).toContain('能');
  expect(reply.answer).toContain('酯化反应');
  expect(reply.answer).not.toContain('乙醇');
  expect(reply.hintLevel).toBe('strong');
});

test('agent answers negative organic-pair questions without revealing target name', () => {
  const reply = askAgent('puzzle-ethanol', '它能和苯在高中常见条件下反应吗？');

  expect(reply.answer).toContain('不能');
  expect(reply.answer).not.toContain('乙醇');
  expect(reply.hintLevel).toBe('medium');
});
```

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
npm test -- --run test/chemistry.test.ts
```

Expected:

- FAIL because `askAgent()` currently falls back instead of matching organic-compound names.

- [ ] **Step 3: Implement organic-compound matching**

In `src/chemistry.ts`, add this helper near `matchReagent()`:

```ts
function matchOtherCompound(normalized: string, hiddenCompound: Compound): Compound | null {
  return (
    compounds.find((compound) => {
      if (compound.id === hiddenCompound.id) return false;
      return compound.aliases.some((alias) => normalized.includes(normalize(alias)));
    }) ?? null
  );
}
```

In `askAgent()`, after reagent handling and before `官能团` handling, add:

```ts
const otherCompound = matchOtherCompound(normalized, compound);
if (otherCompound) {
  const reaction = getOrganicPairReaction(compound.id, otherCompound.id);
  return {
    answer: reaction.reacts
      ? `能。可与${otherCompound.name}发生${reaction.type}。${reaction.reason}${reaction.product ? ` 主要产物：${reaction.product}。` : ''}`
      : `不能。${reaction.reason}`,
    hintLevel: reaction.reacts ? 'strong' : 'medium',
    matchedTopic: otherCompound.name
  };
}
```

Keep the answer free of `compound.name` and `compound.structureFormula`.

- [ ] **Step 4: Run local-agent tests to verify GREEN**

Run:

```bash
npm test -- --run test/chemistry.test.ts
```

Expected:

- PASS.

- [ ] **Step 5: Write failing DeepSeek prompt test**

Append to `describe('deepseek prompt construction', ...)` in `test/deepseekProxy.test.ts`:

```ts
test('allows organic-pair property questions without allowing answer reveal', () => {
  const messages = buildDeepSeekMessages({
    puzzleId: 'puzzle-ethanol',
    question: '它能和乙酸发生反应吗？',
    history: []
  });
  const system = messages[0].content;

  expect(system).toContain('另一个高中常见有机物');
  expect(system).toContain('不要直接公布目标物名称');
});
```

- [ ] **Step 6: Run DeepSeek tests to verify RED**

Run:

```bash
npm test -- --run test/deepseekProxy.test.ts
```

Expected:

- FAIL because the system prompt does not mention organic-pair questions.

- [ ] **Step 7: Update DeepSeek system prompt**

In `shared/deepseekProxy.ts`, add this sentence to `buildDeepSeekMessages()` system content:

```ts
'学生可以问隐藏目标物能否与某试剂反应，也可以问它能否与另一个高中常见有机物反应；只回答性质、条件、现象和反应类型，不要说出隐藏目标物名称或结构。',
```

- [ ] **Step 8: Run tests**

Run:

```bash
npm test -- --run
```

Expected:

- PASS.

- [ ] **Step 9: Commit**

```bash
git add src/chemistry.ts shared/deepseekProxy.ts test/chemistry.test.ts test/deepseekProxy.test.ts
git commit -m "feat: support organic pair reasoning questions"
```

---

### Task 4: Add Three.js Molecule Viewer Module

**Files:**
- Create: `src/moleculeViewer.ts`
- Create: `test/moleculeViewer.test.ts`

- [ ] **Step 1: Write failing pure-helper tests**

Create `test/moleculeViewer.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
npm test -- --run test/moleculeViewer.test.ts
```

Expected:

- FAIL because `src/moleculeViewer.ts` does not exist.

- [ ] **Step 3: Implement `src/moleculeViewer.ts`**

Create the module with:

```ts
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  type DisplayMode,
  type MoleculeBond,
  type MoleculeModel,
  elementStyles
} from './moleculeModels';

export interface MoleculeViewer {
  setModel(model: MoleculeModel): void;
  setHighlight(highlightId: string | null): void;
  setDisplayMode(mode: DisplayMode): void;
  resetView(): void;
  dispose(): void;
}

export interface MoleculeViewerOptions {
  displayMode?: DisplayMode;
  highlightId?: string | null;
}

export function calculateModelBounds(model: MoleculeModel): { center: [number, number, number]; radius: number } {
  const xs = model.atoms.map((atom) => atom.position[0]);
  const ys = model.atoms.map((atom) => atom.position[1]);
  const zs = model.atoms.map((atom) => atom.position[2]);
  const center: [number, number, number] = [
    (Math.min(...xs) + Math.max(...xs)) / 2,
    (Math.min(...ys) + Math.max(...ys)) / 2,
    (Math.min(...zs) + Math.max(...zs)) / 2
  ];
  const radius = Math.max(
    ...model.atoms.map((atom) => {
      const dx = atom.position[0] - center[0];
      const dy = atom.position[1] - center[1];
      const dz = atom.position[2] - center[2];
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }),
    1
  );
  return { center, radius };
}

export function getBondCylinderCount(bond: MoleculeBond): number {
  return bond.order ?? 1;
}

export function createMoleculeViewer(
  container: HTMLElement,
  initialModel: MoleculeModel,
  options: MoleculeViewerOptions = {}
): MoleculeViewer {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.replaceChildren(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;

  const moleculeGroup = new THREE.Group();
  scene.add(moleculeGroup);
  scene.add(new THREE.AmbientLight(0xffffff, 1.5));
  const keyLight = new THREE.DirectionalLight(0xffffff, 2);
  keyLight.position.set(3, 4, 5);
  scene.add(keyLight);

  let model = initialModel;
  let displayMode = options.displayMode ?? 'ball-stick';
  let highlightId = options.highlightId ?? null;
  let animationFrame = 0;
  const resizeObserver = new ResizeObserver(resize);

  function resize(): void {
    const rect = container.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function drawModel(): void {
    moleculeGroup.clear();
    const highlighted = model.highlights.find((item) => item.id === highlightId);
    model.bonds.forEach((bond, index) => {
      addBond(model, bond, highlighted?.bondIndexes.includes(index) ?? false);
    });
    model.atoms.forEach((atom, index) => {
      const style = elementStyles[atom.element];
      const radius = displayMode === 'space-fill' ? style.radius * 1.85 : style.radius;
      const material = new THREE.MeshStandardMaterial({
        color: highlighted?.atomIndexes.includes(index) ? 0xf2b84b : style.color,
        roughness: 0.35,
        metalness: 0.05
      });
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 20), material);
      sphere.position.set(...atom.position);
      moleculeGroup.add(sphere);
    });
    resetView();
  }

  function addBond(currentModel: MoleculeModel, bond: MoleculeBond, highlighted: boolean): void {
    const from = new THREE.Vector3(...currentModel.atoms[bond.from].position);
    const to = new THREE.Vector3(...currentModel.atoms[bond.to].position);
    const direction = new THREE.Vector3().subVectors(to, from);
    const midpoint = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
    const cylinderCount = getBondCylinderCount(bond);
    const perpendicular = new THREE.Vector3(direction.y || 0.1, -direction.x || 0.1, 0).normalize();
    for (let i = 0; i < cylinderCount; i += 1) {
      const offset = (i - (cylinderCount - 1) / 2) * 0.1;
      const geometry = new THREE.CylinderGeometry(0.055, 0.055, direction.length(), 16);
      const material = new THREE.MeshStandardMaterial({ color: highlighted ? 0xf2b84b : 0xaab5bd });
      const cylinder = new THREE.Mesh(geometry, material);
      cylinder.position.copy(midpoint).addScaledVector(perpendicular, offset);
      cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
      moleculeGroup.add(cylinder);
    }
  }

  function renderLoop(): void {
    controls.update();
    renderer.render(scene, camera);
    animationFrame = window.requestAnimationFrame(renderLoop);
  }

  resizeObserver.observe(container);
  resize();
  drawModel();
  renderLoop();

  return {
    setModel(nextModel) {
      model = nextModel;
      drawModel();
    },
    setHighlight(nextHighlightId) {
      highlightId = nextHighlightId;
      drawModel();
    },
    setDisplayMode(nextDisplayMode) {
      displayMode = nextDisplayMode;
      drawModel();
    },
    resetView,
    dispose() {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      container.replaceChildren();
    }
  };

  function resetView(): void {
    const bounds = calculateModelBounds(model);
    camera.position.set(bounds.center[0], bounds.center[1], bounds.center[2] + bounds.radius * 4.2);
    controls.target.set(...bounds.center);
    controls.update();
  }
}
```

- [ ] **Step 4: Run viewer tests to verify GREEN**

Run:

```bash
npm test -- --run test/moleculeViewer.test.ts
```

Expected:

- PASS.

- [ ] **Step 5: Run full test/build**

Run:

```bash
npm test -- --run && npm run build
```

Expected:

- PASS.

- [ ] **Step 6: Commit**

```bash
git add src/moleculeViewer.ts test/moleculeViewer.test.ts
git commit -m "feat: add three molecule viewer"
```

---

### Task 5: Add Puzzle Unlock State Tests

**Files:**
- Create: `test/puzzleUnlock.test.ts`
- Create: `src/puzzleUnlock.ts`
- Modify: `src/app.ts`

- [ ] **Step 1: Write failing unlock-state tests**

Create `test/puzzleUnlock.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import { createPuzzleUnlockState, updatePuzzleUnlockWithGuess } from '../src/puzzleUnlock';

describe('puzzle unlock state', () => {
  test('does not unlock the target model before a correct guess', () => {
    const state = createPuzzleUnlockState('puzzle-ethanol');

    expect(state.unlocked).toBe(false);
    expect(state.unlockedCompoundId).toBeNull();
  });

  test('unlocks target model after correct guess', () => {
    const state = updatePuzzleUnlockWithGuess(createPuzzleUnlockState('puzzle-ethanol'), '乙醇');

    expect(state.unlocked).toBe(true);
    expect(state.unlockedCompoundId).toBe('ethanol');
  });

  test('keeps target locked after wrong guess', () => {
    const state = updatePuzzleUnlockWithGuess(createPuzzleUnlockState('puzzle-ethanol'), '二甲醚');

    expect(state.unlocked).toBe(false);
    expect(state.unlockedCompoundId).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
npm test -- --run test/puzzleUnlock.test.ts
```

Expected:

- FAIL because `src/puzzleUnlock.ts` does not exist.

- [ ] **Step 3: Implement `src/puzzleUnlock.ts`**

```ts
import { answerFormulaPuzzle, findPuzzleById } from './chemistry';

export interface PuzzleUnlockState {
  puzzleId: string;
  unlocked: boolean;
  unlockedCompoundId: string | null;
}

export function createPuzzleUnlockState(puzzleId: string): PuzzleUnlockState {
  findPuzzleById(puzzleId);
  return { puzzleId, unlocked: false, unlockedCompoundId: null };
}

export function updatePuzzleUnlockWithGuess(state: PuzzleUnlockState, guess: string): PuzzleUnlockState {
  const result = answerFormulaPuzzle(state.puzzleId, guess);
  if (!result.correct) {
    return { ...state, unlocked: false, unlockedCompoundId: null };
  }
  return { ...state, unlocked: true, unlockedCompoundId: result.compound.id };
}
```

- [ ] **Step 4: Run unlock tests to verify GREEN**

Run:

```bash
npm test -- --run test/puzzleUnlock.test.ts
```

Expected:

- PASS.

- [ ] **Step 5: Integrate unlock state into `src/app.ts`**

Add to `AppState`:

```ts
puzzleUnlocked: boolean;
puzzleUnlockedCompoundId: string | null;
viewerDisplayMode: DisplayMode;
highlightFunctionalGroup: boolean;
```

Initialize:

```ts
puzzleUnlocked: false,
puzzleUnlockedCompoundId: null,
viewerDisplayMode: 'ball-stick',
highlightFunctionalGroup: true
```

In `setPuzzle()` reset:

```ts
state.puzzleUnlocked = false;
state.puzzleUnlockedCompoundId = null;
```

In `submitGuess()` after `answerFormulaPuzzle()`:

```ts
if (result.correct) {
  state.puzzleUnlocked = true;
  state.puzzleUnlockedCompoundId = result.compound.id;
}
```

- [ ] **Step 6: Run tests**

Run:

```bash
npm test -- --run
```

Expected:

- PASS.

- [ ] **Step 7: Commit**

```bash
git add src/puzzleUnlock.ts src/app.ts test/puzzleUnlock.test.ts
git commit -m "feat: gate puzzle molecule unlock"
```

---

### Task 6: Mount 3D Viewers in the App

**Files:**
- Modify: `src/app.ts`
- Modify: `src/styles.css`

- [ ] **Step 1: Add viewer lifecycle state**

In `src/app.ts`, import:

```ts
import { type DisplayMode, getMoleculeModel } from './moleculeModels';
import { type MoleculeViewer, createMoleculeViewer } from './moleculeViewer';
```

Add module-level viewer state:

```ts
const viewers = new Map<string, MoleculeViewer>();
```

Add helpers:

```ts
function clearViewers(): void {
  for (const viewer of viewers.values()) {
    viewer.dispose();
  }
  viewers.clear();
}

function mountViewer(containerId: string, compoundId: string, highlightId: string | null = null): void {
  const container = document.querySelector<HTMLElement>(`[data-viewer-id="${containerId}"]`);
  if (!container) return;
  const model = getMoleculeModel(compoundId);
  const viewer = createMoleculeViewer(container, model, {
    displayMode: state.viewerDisplayMode,
    highlightId
  });
  viewers.set(containerId, viewer);
}

function mountVisibleViewers(): void {
  clearViewers();
  if (state.mode === 'reagent') {
    mountViewer('reagent-primary', state.reagentCompoundId, state.highlightFunctionalGroup ? findCompoundById(state.reagentCompoundId).functionalGroups[0] : null);
  }
  if (state.mode === 'pair') {
    mountViewer('pair-first', state.pairFirstId, state.highlightFunctionalGroup ? findCompoundById(state.pairFirstId).functionalGroups[0] : null);
    mountViewer('pair-second', state.pairSecondId, state.highlightFunctionalGroup ? findCompoundById(state.pairSecondId).functionalGroups[0] : null);
  }
  if (state.mode === 'puzzle' && state.puzzleUnlockedCompoundId) {
    mountViewer('puzzle-unlocked', state.puzzleUnlockedCompoundId, state.highlightFunctionalGroup ? findCompoundById(state.puzzleUnlockedCompoundId).functionalGroups[0] : null);
  }
}
```

Call `mountVisibleViewers()` at the end of `render()` after `createIcons()`.

- [ ] **Step 2: Replace SVG molecule areas with viewer containers**

Change `renderCompoundPanel()` to render:

```ts
${viewerPanel('reagent-primary', compound, '当前 3D 模型')}
```

Change `renderCompactCompound()` to accept a viewer id:

```ts
function renderCompactCompound(compound: Compound, viewerId: string): string
```

and render:

```ts
${viewerPanel(viewerId, compound, '3D 模型')}
```

Use it in pair mode:

```ts
${renderCompactCompound(first, 'pair-first')}
${renderCompactCompound(second, 'pair-second')}
```

Add:

```ts
function viewerPanel(viewerId: string, compound: Compound, label: string): string {
  return `
    <div class="viewer-shell">
      <div class="viewer-toolbar">
        <span>${label}</span>
        <button class="viewer-tool" data-action="toggle-display-mode" type="button">
          ${state.viewerDisplayMode === 'ball-stick' ? '空间填充' : '球棍模型'}
        </button>
      </div>
      <div class="molecule-viewer" data-viewer-id="${viewerId}" aria-label="${compound.name} 3D 模型"></div>
    </div>
  `;
}
```

Keep `moleculeSketch()` temporarily only as a fallback if WebGL fails. Remove it after browser verification if not needed.

- [ ] **Step 3: Add high-level unlocked model area**

In `renderPuzzleMode()`, after feedback:

```ts
${state.puzzleUnlocked && state.puzzleUnlockedCompoundId
  ? `<div class="unlocked-model">${viewerPanel('puzzle-unlocked', findCompoundById(state.puzzleUnlockedCompoundId), '已解锁 3D 复盘')}</div>`
  : '<div class="locked-model">答对结构后解锁 3D 复盘模型。</div>'}
```

- [ ] **Step 4: Wire display mode toggle**

In `bindEvents()` action handler:

```ts
if (action === 'toggle-display-mode') {
  state.viewerDisplayMode = state.viewerDisplayMode === 'ball-stick' ? 'space-fill' : 'ball-stick';
  render();
}
```

- [ ] **Step 5: Add lab-console CSS**

In `src/styles.css`, add:

```css
.viewer-shell {
  display: grid;
  gap: 10px;
  margin: 14px 0;
}

.viewer-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: var(--muted);
  font-size: 13px;
  font-weight: 800;
}

.viewer-tool {
  min-height: 34px;
  border: 1px solid rgba(19, 123, 114, 0.36);
  border-radius: 8px;
  padding: 0 10px;
  background: #eaf6f3;
  color: var(--teal-dark);
  font-weight: 800;
}

.molecule-viewer {
  position: relative;
  width: 100%;
  min-height: 260px;
  overflow: hidden;
  border: 1px solid #29463f;
  border-radius: 8px;
  background:
    radial-gradient(circle at 28% 20%, rgba(198, 134, 31, 0.18), transparent 25%),
    linear-gradient(135deg, #14211d, #1d342e);
}

.molecule-viewer canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.compound-mini .molecule-viewer {
  min-height: 240px;
}

.locked-model {
  display: grid;
  place-items: center;
  min-height: 150px;
  margin-top: 16px;
  border: 1px dashed var(--line);
  border-radius: 8px;
  color: var(--muted);
  background: #fbfcfa;
  font-weight: 800;
}
```

- [ ] **Step 6: Run tests/build**

Run:

```bash
npm test -- --run && npm run build
```

Expected:

- PASS.

- [ ] **Step 7: Commit**

```bash
git add src/app.ts src/styles.css
git commit -m "feat: mount 3d molecule viewers"
```

---

### Task 7: Polish Lab-Console UI Across All Modes

**Files:**
- Modify: `src/styles.css`
- Modify: `src/app.ts`

- [ ] **Step 1: Increase click target stability**

Adjust existing CSS:

```css
.mode-tab,
.choice-chip,
.judge-button,
.primary-action,
.icon-text-button,
.quick-question {
  transition:
    border-color 0.16s ease,
    background 0.16s ease,
    transform 0.16s ease;
}

.mode-tab:hover,
.choice-chip:hover,
.judge-button:hover,
.primary-action:hover,
.icon-text-button:hover,
.quick-question:hover {
  transform: translateY(-1px);
}

.judge-button,
.primary-action {
  min-height: 52px;
}

.quick-question {
  min-height: 38px;
}
```

- [ ] **Step 2: Make mode layouts denser and scan-friendly**

Set the main panel grid:

```css
.two-column {
  grid-template-columns: minmax(360px, 0.95fr) minmax(380px, 1.05fr);
}

.puzzle-layout {
  grid-template-columns: minmax(360px, 0.9fr) minmax(420px, 1.1fr);
}
```

- [ ] **Step 3: Keep mobile text and controls non-overlapping**

Update mobile CSS:

```css
@media (max-width: 860px) {
  .compound-panel,
  .task-panel,
  .formula-panel,
  .chat-panel {
    padding: 14px;
  }

  .molecule-viewer {
    min-height: 220px;
  }
}

@media (max-width: 520px) {
  .viewer-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .viewer-tool {
    width: 100%;
  }
}
```

- [ ] **Step 4: Run build**

Run:

```bash
npm run build
```

Expected:

- PASS.

- [ ] **Step 5: Commit**

```bash
git add src/styles.css src/app.ts
git commit -m "style: polish lab console interface"
```

---

### Task 8: Browser Verification With Canvas Pixel Checks

**Files:**
- No production code unless failures are found.

- [ ] **Step 1: Start production preview**

Run:

```bash
npm run preview -- --host 127.0.0.1 --port 4173
```

Expected:

- Preview server prints `http://127.0.0.1:4173/`.

- [ ] **Step 2: Open browser and verify desktop flows**

Run:

```bash
$HOME/.codex/skills/playwright/scripts/playwright_cli.sh open 'http://127.0.0.1:4173/?verify=3d'
```

Then run:

```bash
$HOME/.codex/skills/playwright/scripts/playwright_cli.sh run-code "async (page) => {
  await page.setViewportSize({ width: 1280, height: 820 });
  await page.waitForSelector('[data-viewer-id=\"reagent-primary\"] canvas');
  const pixelCount = await page.locator('[data-viewer-id=\"reagent-primary\"] canvas').evaluate((canvas) => {
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return -1;
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;
    const pixels = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    let nonZero = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i] || pixels[i + 1] || pixels[i + 2] || pixels[i + 3]) nonZero += 1;
    }
    return nonZero;
  });
  if (pixelCount <= 0) throw new Error('reagent 3D canvas is blank');
  await page.getByRole('button', { name: '进阶 有机物间反应' }).click();
  await page.waitForSelector('[data-viewer-id=\"pair-first\"] canvas');
  await page.waitForSelector('[data-viewer-id=\"pair-second\"] canvas');
  await page.getByRole('button', { name: '高阶 分子式推理' }).click();
  if (await page.locator('[data-viewer-id=\"puzzle-unlocked\"] canvas').count()) throw new Error('puzzle model leaked before correct guess');
  return 'desktop 3D checks passed';
}"
```

Expected:

- Command returns `desktop 3D checks passed`.

- [ ] **Step 3: Verify high-level unlock**

Run:

```bash
$HOME/.codex/skills/playwright/scripts/playwright_cli.sh run-code "async (page) => {
  await page.getByPlaceholder('输入名称或结构简式').fill('乙醇');
  await page.getByRole('button', { name: '提交' }).click();
  await page.waitForSelector('[data-viewer-id=\"puzzle-unlocked\"] canvas');
  return 'puzzle unlock check passed';
}"
```

Expected:

- Command returns `puzzle unlock check passed`.

- [ ] **Step 4: Verify mobile layout**

Run:

```bash
$HOME/.codex/skills/playwright/scripts/playwright_cli.sh run-code "async (page) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4173/?verify=mobile-3d');
  await page.waitForSelector('[data-viewer-id=\"reagent-primary\"] canvas');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  if (overflow) throw new Error('mobile page has horizontal overflow');
  return 'mobile layout check passed';
}"
```

Expected:

- Command returns `mobile layout check passed`.

- [ ] **Step 5: Check console**

Run:

```bash
$HOME/.codex/skills/playwright/scripts/playwright_cli.sh console error
```

Expected:

- `Total messages: 0 (Errors: 0, Warnings: 0)`.

- [ ] **Step 6: Fix any failures and commit**

If browser checks expose layout or WebGL issues, fix the narrowest code path and commit:

```bash
git add src/app.ts src/styles.css src/moleculeViewer.ts
git commit -m "fix: stabilize 3d browser rendering"
```

---

### Task 9: Final Verification, Security Scan, and Push

**Files:**
- No production code unless verification fails.

- [ ] **Step 1: Full verification**

Run:

```bash
npm test -- --run && npm run build && npm audit --audit-level=moderate
```

Expected:

- All tests pass.
- Build passes.
- Audit reports 0 vulnerabilities at moderate or higher.

- [ ] **Step 2: Sensitive-key scan**

Run:

```bash
rg -n "sk-[A-Za-z0-9]{10,}|DEEPSEEK_API_KEY\\s*=|Authorization: Bearer sk-[A-Za-z0-9]" -S . -g '!node_modules' -g '!dist' -g '!.playwright-cli' -g '!.superpowers' || true
```

Expected:

- No real API key appears.
- Test-only fake values like `unit-test-key` are acceptable.

- [ ] **Step 3: Commit any remaining verification-only docs**

Run:

```bash
git status --short
```

Expected:

- Clean worktree. If not clean, inspect and commit only intentional files.

- [ ] **Step 4: Push**

Run:

```bash
git push origin main
```

Expected:

- Push succeeds.

- [ ] **Step 5: Watch GitHub Pages workflow**

Run:

```bash
gh run list --repo 77zmf/organic-structure-miniapp --limit 5
gh run watch <latest-run-id> --repo 77zmf/organic-structure-miniapp --exit-status
```

Expected:

- Latest Pages workflow completes successfully.

- [ ] **Step 6: Verify live site**

Run:

```bash
$HOME/.codex/skills/playwright/scripts/playwright_cli.sh open 'https://77zmf.github.io/organic-structure-miniapp/?verify=live-3d'
```

Then repeat the desktop high-level leak check:

```bash
$HOME/.codex/skills/playwright/scripts/playwright_cli.sh run-code "async (page) => {
  await page.getByRole('button', { name: '高阶 分子式推理' }).click();
  if (await page.locator('[data-viewer-id=\"puzzle-unlocked\"] canvas').count()) throw new Error('live puzzle model leaked before correct guess');
  await page.getByPlaceholder('输入一个实验性质问题').fill('这个物质叫什么名字？');
  await page.getByRole('button', { name: '发送问题' }).click();
  await page.waitForFunction(() => document.body.innerText.includes('先不直接公布'));
  return 'live guardrail and 3D leak check passed';
}"
```

Expected:

- Command returns `live guardrail and 3D leak check passed`.

---

## Coverage Checklist

- Three dimensions preserved: Tasks 3, 5, 6, 8.
- 3D functional-group visualization: Tasks 1, 2, 4, 6, 8.
- Lab-console visual polish: Task 7.
- High-school data boundary: Tasks 2 and 3.
- High-level no-leak rule: Tasks 3, 5, 8, 9.
- DeepSeek proxy compatibility: Task 3.
- Browser-level canvas verification: Task 8 and Task 9.
