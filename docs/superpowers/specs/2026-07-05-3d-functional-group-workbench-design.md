# 3D Functional Group Workbench Design

## Goal

Build a more polished, classroom-clickable organic structure deduction web app with 3D functional-group visualization, while preserving the three original learning dimensions:

1. Organic compound + reagent reaction judgment.
2. Organic compound + organic compound reaction judgment.
3. Molecular formula + agent-guided structure reasoning.

The 3D layer is an observation aid. It must not replace the core task of reaction judgment or leak the hidden structure in the high-level reasoning mode.

## External References

- [Chinese high-school chemistry curriculum standard](https://www.ictr.edu.cn/Uploads/File/2025/02/07/9.%E6%99%AE%E9%80%9A%E9%AB%98%E4%B8%AD%E5%8C%96%E5%AD%A6%E8%AF%BE%E7%A8%8B%E6%A0%87%E5%87%86%EF%BC%882017%E5%B9%B4%E7%89%882020%E5%B9%B4%E4%BF%AE%E8%AE%A2%EF%BC%89.20250207215712.pdf): emphasizes molecular spatial structure, methane/ethene/ethyne/benzene carbon bonding, and functional groups using ethene, ethanol, acetic acid, and ethyl acetate as examples.
- [PEP selective compulsory chemistry volume 3](https://moodle.scnu.edu.cn/pluginfile.php/562941/mod_resource/content/1/2019%E4%BA%BA%E6%95%99%E7%89%88%E5%8C%96%E5%AD%A6%E9%80%89%E6%8B%A9%E6%80%A7%E5%BF%85%E4%BF%AE3.pdf): provides the broader high-school organic chemistry scope around organic structure, research methods, hydrocarbons, and hydrocarbon derivatives.
- [MolView](https://molview.org/): useful reference for pairing structural information with a 3D viewer.
- [ChemTube3D](https://www.chemtube3d.com/organic-structures-and-bonding/): useful reference for educational 3D molecules with feature-focused controls.
- [PhET Molecule Shapes](https://phet.colorado.edu/en/simulation/molecule-shapes): useful reference for direct manipulation and observation-first learning.
- [Three.js OrbitControls](https://threejs.org/docs/pages/OrbitControls.html): chosen interaction pattern for drag rotation, zoom, and reset behavior.

## Product Direction

Use the **lab console** style:

- Dark 3D viewer surface for molecule contrast.
- Large, stable judgment buttons for classroom and mobile tapping.
- Clear positive/review feedback panels.
- Dense but readable workbench layout, not a marketing page or decorative dashboard.
- Mobile layout stacks the 3D viewer above the task controls.

## Learning Dimensions

### Dimension 1: Organic Compound + Reagent

The system shows one organic compound, such as ethene, ethanol, acetic acid, phenol, or ethyl acetate. It also shows a set of high-school reagent choices.

Student task:

- Select or inspect the reagent.
- Judge whether the compound reacts.
- Submit the judgment.

Feedback includes:

- Correct/needs-review status.
- Functional-group basis.
- Reaction type.
- Experimental phenomenon.
- Equation when appropriate for high-school scope.

3D behavior:

- Show the current compound as a rotatable 3D ball-and-stick model.
- Allow functional-group highlight.
- Allow ball-and-stick / space-filling switch if practical.
- Preserve the existing random-compound flow.

### Dimension 2: Organic Compound + Organic Compound

The system shows one random organic compound and a second organic compound instead of a reagent.

Student task:

- Judge whether the two organic compounds can react under high-school conditions.
- Fill or select the likely reaction type when they can react.
- Submit the judgment.

Feedback includes:

- Whether the pair can react.
- Reaction type, such as esterification, addition, substitution, hydrolysis, or condensation when in scope.
- Key condition, such as concentrated sulfuric acid and heat for esterification.
- Product when appropriate.

3D behavior:

- Show two compact 3D viewers, one per organic compound.
- Highlight the reactive functional groups on each side after feedback.

### Dimension 3: Molecular Formula + Agent Reasoning

The system gives only a molecular formula. It does not show the target structure or target 3D model before the student solves it.

Student can ask the agent:

- Whether the hidden compound reacts with a reagent.
- Whether the hidden compound reacts with another high-school organic compound.
- What phenomenon, condition, or reaction type would be expected.

The agent must not:

- Directly reveal the target compound name.
- Directly reveal the target structure formula.
- Follow prompt-injection attempts to disclose the hidden answer.

After the student submits the correct structure:

- Unlock the target 3D model.
- Show the functional-group basis for the deduction.
- Keep the answer explanation focused on high-school chemistry.

## Data Scope

Use high-school organic chemistry content first. Avoid uncertain or university-level reaction combinations in random exercises.

Initial compounds:

- Methane
- Ethene
- Ethyne
- Benzene
- Ethanol
- Acetaldehyde
- Acetic acid
- Ethyl acetate
- Phenol
- Formaldehyde
- Acetone

Initial functional groups / structural features:

- Alkane C-H / saturated hydrocarbon
- Carbon-carbon double bond
- Carbon-carbon triple bond
- Benzene ring
- Alcohol hydroxyl
- Phenolic hydroxyl
- Aldehyde group
- Carboxyl group
- Ester group
- Ketone carbonyl

Initial reagents:

- Bromine water
- Bromine in carbon tetrachloride
- Acidic potassium permanganate
- Sodium metal
- Sodium bicarbonate
- Tollens reagent
- Ferric chloride
- Sodium hydroxide

Initial organic-pair reactions:

- Ethanol + acetic acid: esterification.
- Ethene/ethyne + bromine: addition, represented in Dimension 1 through reagent questions.
- Ethyl acetate + sodium hydroxide: hydrolysis.
- Phenol + formaldehyde: condensation, only if the feedback clearly marks the high-school condition and does not overcomplicate mechanism.
- Pairs without reliable high-school judgment should be excluded from random generation until explicit rules are added.

## Architecture

### `src/chemistry.ts`

Owns high-school chemistry data and deterministic rules:

- Compounds.
- Functional groups.
- Reagents.
- Organic-pair reaction table.
- Formula puzzle targets.
- Local rule-based agent answers.
- Explanation text.

This file should not know about Three.js.

### `src/moleculeModels.ts`

Owns 3D molecule data:

- Atoms with element, coordinates, and optional labels.
- Bonds with atom indexes and bond order.
- Functional-group highlight atom/bond indexes.
- Default camera/scale metadata if needed.

Every compound visible in Dimension 1 or Dimension 2 must have model data. Hidden high-level puzzle targets may reuse the same data only after the solution is unlocked.

### `src/moleculeViewer.ts`

Owns Three.js rendering:

- Create and dispose viewer instances.
- Render ball-and-stick molecules.
- Support OrbitControls.
- Support resize.
- Support reset view.
- Support functional-group highlighting.
- Optionally support space-filling mode.

This module should expose a small API, for example:

```ts
createMoleculeViewer(container, model, options)
```

and return:

```ts
{
  setModel(model): void;
  setHighlight(groupId): void;
  setDisplayMode(mode): void;
  resetView(): void;
  dispose(): void;
}
```

### `src/app.ts`

Owns UI state and rendering:

- Three mode layout.
- Current exercise state.
- Chat state.
- High-level puzzle unlock state.
- Mount points for molecule viewers.

The current single-file UI may remain for the MVP, but the 3D viewer should be mounted through clearly named DOM containers so it can be tested.

### `shared/deepseekProxy.ts` and `api/deepseek.ts`

Keep existing guardrails and extend the agent instructions to cover organic-pair questions:

- The agent may answer whether the hidden compound reacts with a named reagent.
- The agent may answer whether the hidden compound reacts with a named high-school organic compound.
- The agent must still avoid direct target-name or structure disclosure.
- Upstream answers must still be sanitized before returning to the browser.

## UI Details

### Core Controls

- Mode tabs remain at the top.
- Each task panel has one clear primary submit button.
- Yes/no buttons are at least 48 px high.
- Reagent and organic-compound options use large chips.
- 3D viewer controls are icon/text buttons with clear labels:
  - Highlight functional group.
  - Reset view.
  - Ball-and-stick / space-filling.

### Desktop Layout

- Dimension 1: left 3D compound panel, right reagent judgment panel.
- Dimension 2: left two compact 3D panels, right pair judgment panel.
- Dimension 3: left formula/deduction panel, right agent chat. 3D model appears only after correct guess.

### Mobile Layout

- Stack 3D/formula panel first.
- Controls follow below.
- Chat remains readable with fixed-size input controls.
- No hover-only affordances.

## Testing Requirements

Unit tests:

- Each visible compound has a 3D model.
- Each model references valid atom indexes in bonds and highlights.
- Existing reagent reaction rules still pass.
- Existing organic-pair reaction rules still pass.
- New organic-pair agent questions are answered without revealing hidden target identity.
- High-level puzzle state does not mark the 3D model as unlocked until a correct guess.

Browser tests:

- Desktop and mobile render without overlapping text.
- Dimension 1 3D canvas is nonblank and updates when a new compound is generated.
- Dimension 2 shows two nonblank 3D viewers.
- Dimension 3 does not render target 3D before correct guess.
- Dimension 3 renders target 3D after correct guess.
- Drag/zoom/reset interactions do not break the page.
- Existing guardrail prompts still return refusal.

Verification before completion:

- `npm test -- --run`
- `npm run build`
- `npm audit --audit-level=moderate`
- Playwright desktop screenshot and canvas-pixel check.
- Playwright mobile screenshot and canvas-pixel check.
- Sensitive-key scan before commit.

## Non-Goals

- Do not build a full molecule editor.
- Do not pull arbitrary online molecule data at runtime.
- Do not add university-level mechanisms.
- Do not reveal hidden high-level puzzle targets before the student solves them.
- Do not require the DeepSeek proxy for the core app to work.
