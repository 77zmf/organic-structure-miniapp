// @ts-expect-error three is installed for runtime in this app, but its declarations are not present in this worktree.
import { AmbientLight, Box3, Color, CylinderGeometry, DirectionalLight, Group, Mesh, MeshStandardMaterial, PerspectiveCamera, Scene, SphereGeometry, Vector3, WebGLRenderer } from 'three';
// @ts-expect-error OrbitControls is available from three examples at runtime; local declarations are not installed.
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  elementStyles,
  type DisplayMode,
  type FunctionalGroupHighlight,
  type MoleculeBond,
  type MoleculeModel
} from './moleculeModels';

const DEFAULT_BACKGROUND_COLOR = '#f7f8fb';
const DEFAULT_BOND_COLOR = '#a8b0bd';
const HIGHLIGHT_EMISSIVE_INTENSITY = 0.2;
const BOND_RADIUS = 0.055;
const MULTI_BOND_SPACING = 0.13;
const MIN_CAMERA_RADIUS = 1;

type ColorRepresentation = string | number;

export interface MoleculeModelBounds {
  center: [number, number, number];
  radius: number;
  size: [number, number, number];
}

export interface MoleculeViewerOptions {
  displayMode?: DisplayMode;
  highlightId?: FunctionalGroupHighlight['id'] | null;
  backgroundColor?: ColorRepresentation | null;
  bondColor?: ColorRepresentation;
  maxPixelRatio?: number;
}

export interface MoleculeViewer {
  readonly container: HTMLElement;
  getModel(): MoleculeModel;
  getDisplayMode(): DisplayMode;
  getHighlightId(): FunctionalGroupHighlight['id'] | null;
  setModel(model: MoleculeModel, options?: Pick<MoleculeViewerOptions, 'displayMode' | 'highlightId'>): void;
  setDisplayMode(displayMode: DisplayMode): void;
  setHighlight(highlightId: FunctionalGroupHighlight['id'] | null): void;
  resetView(): void;
  resize(): void;
  render(): void;
  dispose(): void;
}

type BondCylinderCountInput = Pick<Partial<MoleculeBond>, 'order'> & {
  from?: number;
  to?: number;
};

interface HighlightSelection {
  atomIndexes: Set<number>;
  bondIndexes: Set<number>;
  color: string | null;
}

interface VectorLike {
  clone(): VectorLike;
  cross(reference: VectorLike): VectorLike;
  multiplyScalar(value: number): VectorLike;
  normalize(): VectorLike;
  dot(reference: VectorLike): number;
}

interface TraversableGroup {
  traverse(callback: (object: DisposableObject) => void): void;
  clear(): void;
}

interface DisposableObject {
  geometry?: {
    dispose(): void;
  };
  material?:
    | {
        dispose(): void;
      }
    | Array<{
        dispose(): void;
      }>;
}

export function calculateModelBounds(model: MoleculeModel): MoleculeModelBounds {
  if (model.atoms.length === 0) {
    return {
      center: [0, 0, 0],
      radius: MIN_CAMERA_RADIUS,
      size: [0, 0, 0]
    };
  }

  const box = new Box3();

  for (const atom of model.atoms) {
    const radius = elementStyles[atom.element].spaceFillRadius;
    const position = new Vector3(...atom.position);
    box.expandByPoint(position.clone().addScalar(radius));
    box.expandByPoint(position.clone().addScalar(-radius));
  }

  const center = new Vector3();
  const size = new Vector3();
  box.getCenter(center);
  box.getSize(size);

  let radius = 0;
  for (const atom of model.atoms) {
    const atomPosition = new Vector3(...atom.position);
    const atomRadius = elementStyles[atom.element].spaceFillRadius;
    radius = Math.max(radius, atomPosition.distanceTo(center) + atomRadius);
  }

  return {
    center: center.toArray(),
    radius: Math.max(radius, MIN_CAMERA_RADIUS),
    size: size.toArray()
  };
}

export function getBondCylinderCount(bond: BondCylinderCountInput): number {
  return bond.order ?? 1;
}

export function createMoleculeViewer(
  container: HTMLElement,
  initialModel: MoleculeModel,
  options: MoleculeViewerOptions = {}
): MoleculeViewer {
  let model = initialModel;
  let displayMode = options.displayMode ?? initialModel.defaultDisplayMode;
  let highlightId = options.highlightId ?? null;
  let moleculeGroup = new Group();
  let disposed = false;

  const renderer = new WebGLRenderer({ antialias: true, alpha: options.backgroundColor === null });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, options.maxPixelRatio ?? 2));

  const scene = new Scene();
  if (options.backgroundColor !== null) {
    scene.background = new Color(options.backgroundColor ?? DEFAULT_BACKGROUND_COLOR);
  }
  scene.add(new AmbientLight(0xffffff, 1.2));

  const keyLight = new DirectionalLight(0xffffff, 2.4);
  keyLight.position.set(3, 5, 4);
  scene.add(keyLight);

  const fillLight = new DirectionalLight(0xffffff, 0.8);
  fillLight.position.set(-4, -2, -3);
  scene.add(fillLight);

  scene.add(moleculeGroup);

  const initialSize = getContainerSize(container);
  const camera = new PerspectiveCamera(45, initialSize.width / initialSize.height, 0.01, 1000);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 0.8;
  controls.maxDistance = 60;

  container.replaceChildren(renderer.domElement);
  resize();
  renderMolecule();
  resetView();

  const resizeObserver =
    typeof window.ResizeObserver === 'function'
      ? new window.ResizeObserver(() => {
          resize();
        })
      : null;

  if (resizeObserver) {
    resizeObserver.observe(container);
  } else {
    window.addEventListener('resize', resize);
  }

  renderer.setAnimationLoop(() => {
    if (disposed) {
      return;
    }
    controls.update();
    renderer.render(scene, camera);
  });

  function getModel(): MoleculeModel {
    return model;
  }

  function getDisplayMode(): DisplayMode {
    return displayMode;
  }

  function getHighlightId(): FunctionalGroupHighlight['id'] | null {
    return highlightId;
  }

  function setModel(nextModel: MoleculeModel, nextOptions: Pick<MoleculeViewerOptions, 'displayMode' | 'highlightId'> = {}): void {
    model = nextModel;
    displayMode = nextOptions.displayMode ?? nextModel.defaultDisplayMode;
    highlightId = nextOptions.highlightId ?? null;
    renderMolecule();
    resetView();
  }

  function setDisplayMode(nextDisplayMode: DisplayMode): void {
    if (displayMode === nextDisplayMode) {
      return;
    }
    displayMode = nextDisplayMode;
    renderMolecule();
    render();
  }

  function setHighlight(nextHighlightId: FunctionalGroupHighlight['id'] | null): void {
    if (highlightId === nextHighlightId) {
      return;
    }
    highlightId = nextHighlightId;
    renderMolecule();
    render();
  }

  function resetView(): void {
    const bounds = calculateModelBounds(model);
    const center = new Vector3(...bounds.center);
    const radius = Math.max(bounds.radius, MIN_CAMERA_RADIUS);

    camera.near = Math.max(radius / 100, 0.01);
    camera.far = radius * 100;
    camera.position.set(center.x, center.y + radius * 0.35, center.z + radius * 3.2);
    camera.lookAt(center);
    camera.updateProjectionMatrix();

    controls.target.copy(center);
    controls.minDistance = radius * 0.8;
    controls.maxDistance = radius * 12;
    controls.update();
    render();
  }

  function resize(): void {
    const { width, height } = getContainerSize(container);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    render();
  }

  function render(): void {
    controls.update();
    renderer.render(scene, camera);
  }

  function dispose(): void {
    disposed = true;
    renderer.setAnimationLoop(null);
    resizeObserver?.disconnect();
    window.removeEventListener('resize', resize);
    controls.dispose();
    disposeObject3D(moleculeGroup);
    renderer.dispose();
    container.replaceChildren();
  }

  function renderMolecule(): void {
    disposeObject3D(moleculeGroup);
    scene.remove(moleculeGroup);
    moleculeGroup = new Group();
    scene.add(moleculeGroup);

    const highlight = getHighlightSelection(model, highlightId);

    if (displayMode === 'ball-stick') {
      model.bonds.forEach((bond, bondIndex) => {
        addBond(bond, bondIndex, highlight);
      });
    }

    model.atoms.forEach((atom, atomIndex) => {
      const style = elementStyles[atom.element];
      const isHighlighted = highlight.atomIndexes.has(atomIndex);
      const materialColor = isHighlighted && highlight.color ? highlight.color : style.color;
      const material = new MeshStandardMaterial({
        color: materialColor,
        emissive: isHighlighted && highlight.color ? new Color(highlight.color) : new Color(0x000000),
        emissiveIntensity: isHighlighted ? HIGHLIGHT_EMISSIVE_INTENSITY : 0,
        roughness: 0.48,
        metalness: 0.04
      });
      const radius = displayMode === 'space-fill' ? style.spaceFillRadius : style.radius;
      const geometry = new SphereGeometry(radius, 32, 24);
      const mesh = new Mesh(geometry, material);
      mesh.position.set(...atom.position);
      moleculeGroup.add(mesh);
    });
  }

  function addBond(bond: MoleculeBond, bondIndex: number, highlight: HighlightSelection): void {
    const startAtom = model.atoms[bond.from];
    const endAtom = model.atoms[bond.to];
    if (!startAtom || !endAtom) {
      return;
    }

    const start = new Vector3(...startAtom.position);
    const end = new Vector3(...endAtom.position);
    const direction = end.clone().sub(start);
    const length = direction.length();
    if (length === 0) {
      return;
    }

    const unitDirection = direction.clone().normalize();
    const offsetDirection = getOffsetDirection(unitDirection);
    const cylinderCount = getBondCylinderCount(bond);
    const offsets = getBondOffsets(cylinderCount);
    const isHighlighted = highlight.bondIndexes.has(bondIndex);
    const materialColor = isHighlighted && highlight.color ? highlight.color : options.bondColor ?? DEFAULT_BOND_COLOR;

    for (const offset of offsets) {
      const offsetVector = offsetDirection.clone().multiplyScalar(offset);
      const midpoint = start.clone().add(end).multiplyScalar(0.5).add(offsetVector);
      const geometry = new CylinderGeometry(BOND_RADIUS, BOND_RADIUS, length, 18);
      const material = new MeshStandardMaterial({
        color: materialColor,
        emissive: isHighlighted && highlight.color ? new Color(highlight.color) : new Color(0x000000),
        emissiveIntensity: isHighlighted ? HIGHLIGHT_EMISSIVE_INTENSITY : 0,
        roughness: 0.42,
        metalness: 0.02
      });
      const mesh = new Mesh(geometry, material);
      mesh.position.copy(midpoint);
      mesh.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), unitDirection);
      moleculeGroup.add(mesh);
    }
  }

  return {
    container,
    getModel,
    getDisplayMode,
    getHighlightId,
    setModel,
    setDisplayMode,
    setHighlight,
    resetView,
    resize,
    render,
    dispose
  };
}

function getContainerSize(container: HTMLElement): { width: number; height: number } {
  const bounds = container.getBoundingClientRect();
  return {
    width: Math.max(Math.round(bounds.width || container.clientWidth || 640), 1),
    height: Math.max(Math.round(bounds.height || container.clientHeight || 360), 1)
  };
}

function getHighlightSelection(
  model: MoleculeModel,
  highlightId: FunctionalGroupHighlight['id'] | null
): HighlightSelection {
  const highlight = highlightId ? model.highlights.find((item) => item.id === highlightId) : null;
  return {
    atomIndexes: new Set(highlight?.atomIndexes ?? []),
    bondIndexes: new Set(highlight?.bondIndexes ?? []),
    color: highlight?.color ?? null
  };
}

function getBondOffsets(cylinderCount: number): number[] {
  if (cylinderCount === 2) {
    return [-MULTI_BOND_SPACING / 2, MULTI_BOND_SPACING / 2];
  }
  if (cylinderCount === 3) {
    return [-MULTI_BOND_SPACING, 0, MULTI_BOND_SPACING];
  }
  return [0];
}

function getOffsetDirection(direction: VectorLike): VectorLike {
  const reference = Math.abs(direction.dot(new Vector3(0, 0, 1))) > 0.9 ? new Vector3(0, 1, 0) : new Vector3(0, 0, 1);
  return direction.clone().cross(reference).normalize();
}

function disposeObject3D(group: TraversableGroup): void {
  group.traverse((object) => {
    if (!object.geometry || !object.material) {
      return;
    }

    object.geometry.dispose();
    const material = object.material;
    if (Array.isArray(material)) {
      material.forEach((item) => {
        item.dispose();
      });
    } else {
      material.dispose();
    }
  });
  group.clear();
}
