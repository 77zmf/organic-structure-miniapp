# Curiosity Learning Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a curiosity-driven interaction layer across all five learning pages, including the advanced page's formula, Gaokao question bank, locked 3D reveal, and evidence board.

**Architecture:** Keep chemistry rules in `src/chemistry.ts`, put curiosity UI data and small mapping helpers in `src/curiosity.ts`, and put high-level Gaokao-style tasks in `src/gaokaoQuestions.ts`. `src/app.ts` remains the renderer and state owner, but it imports structured data instead of embedding all new option lists inline.

**Tech Stack:** Vite, TypeScript, Vitest, Three.js molecule viewer, lucide icons, static local data.

---

## File Structure

- Create: `src/curiosity.ts`
  - Owns curiosity question data, method route node details, unsaturation prediction options, reagent phenomenon options, pair role options, and helper functions that map chemistry results to classroom feedback.
- Create: `src/gaokaoQuestions.ts`
  - Owns the local advanced-mode Gaokao question bank and maps each question to an existing `FormulaPuzzle`.
- Modify: `src/app.ts`
  - Adds local state and renders curiosity bar, method node detail, unsaturation predictions, reagent phenomenon prediction, pair role selection, advanced Gaokao bank, locked 3D reveal, and evidence board.
- Modify: `src/styles.css`
  - Adds compact classroom UI styles for curiosity bar, prediction controls, role controls, Gaokao bank, and evidence board.
- Modify: `test/appPracticeModes.test.ts`
  - Adds page-level render tests for the new interactive sections.
- Create: `test/curiosity.test.ts`
  - Tests helper logic for unsaturation feedback, expected phenomenon, role mapping, and evidence note creation.
- Create: `test/gaokaoQuestions.test.ts`
  - Tests question bank coverage and puzzle references.

---

### Task 1: Curiosity Data and Helper Layer

**Files:**
- Create: `src/curiosity.ts`
- Test: `test/curiosity.test.ts`

- [ ] **Step 1: Write failing helper tests**

Add `test/curiosity.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import { findCompoundById, getReagentReaction, type AgentReply } from '../src/chemistry';
import {
  createEvidenceNoteFromAgentReply,
  getExpectedPhenomenon,
  getPairRoleForCompound,
  getUnsaturationPredictionFeedback
} from '../src/curiosity';

describe('curiosity helper feedback', () => {
  test('maps reagent reaction evidence to expected phenomenon', () => {
    const etheneReaction = getReagentReaction('ethene', 'bromine-ccl4');
    const aldehydeReaction = getReagentReaction('acetaldehyde', 'tollens');
    const benzeneReaction = getReagentReaction('benzene', 'bromine-ccl4');

    expect(getExpectedPhenomenon(etheneReaction)).toBe('decolorize');
    expect(getExpectedPhenomenon(aldehydeReaction)).toBe('silver-mirror');
    expect(getExpectedPhenomenon(benzeneReaction)).toBe('none');
  });

  test('keeps unsaturation prediction feedback exploratory instead of absolute', () => {
    const feedback = getUnsaturationPredictionFeedback('C6H6', 4, ['benzene-ring']);

    expect(feedback).toContain('可能支持');
    expect(feedback).toContain('仍需实验验证');
  });

  test('maps compound functional groups to classroom reaction roles', () => {
    expect(getPairRoleForCompound(findCompoundById('ethanol'))).toBe('hydroxyl');
    expect(getPairRoleForCompound(findCompoundById('acetic-acid'))).toBe('carboxyl');
    expect(getPairRoleForCompound(findCompoundById('benzene'))).toBe('benzene-ring');
  });

  test('creates evidence notes without leaking the hidden target', () => {
    const reply: AgentReply = {
      answer: '能。含有醛基，能发生银镜反应。',
      hintLevel: 'strong',
      matchedTopic: '银氨溶液'
    };

    expect(createEvidenceNoteFromAgentReply(reply)).toEqual({
      kind: 'verified',
      text: '银氨溶液：能。含有醛基，能发生银镜反应。'
    });
  });
});
```

- [ ] **Step 2: Run helper tests to verify red**

Run:

```bash
npm test -- --run test/curiosity.test.ts
```

Expected: FAIL with a module resolution error for `../src/curiosity`.

- [ ] **Step 3: Implement `src/curiosity.ts`**

Create `src/curiosity.ts`:

```ts
import type { AgentReply, Compound, FunctionalGroup, ReactionResult } from './chemistry';

export type UnsaturationPredictionId =
  | 'carbon-double-bond'
  | 'carbon-triple-bond'
  | 'benzene-ring'
  | 'carbonyl'
  | 'ring'
  | 'none';

export type PhenomenonId =
  | 'decolorize'
  | 'precipitate'
  | 'gas'
  | 'silver-mirror'
  | 'purple'
  | 'none';

export type PairRoleId =
  | 'hydroxyl'
  | 'carboxyl'
  | 'aldehyde'
  | 'phenol'
  | 'benzene-ring'
  | 'none';

export interface ChoiceOption<T extends string> {
  id: T;
  label: string;
  detail: string;
}

export interface MethodNodeDetail {
  id: string;
  label: string;
  tells: string;
  cannotTell: string;
  example: string;
}

export interface EvidenceNote {
  kind: 'verified' | 'excluded' | 'guess';
  text: string;
}

export const curiosityQuestions = [
  '为什么乙烯能使溴的四氯化碳溶液褪色，而苯通常不能？',
  '同样含氧，为什么有的物质能与钠反应，有的不能？',
  '只知道 C6H6，为什么还不能直接断定它一定是苯？',
  '一个不饱和度为 4 的分子，可能藏着什么结构？'
];

export const methodNodeDetails: MethodNodeDetail[] = [
  {
    id: 'composition',
    label: '元素组成',
    tells: '能告诉我们分子由哪些元素构成，是推导分子式的第一步。',
    cannotTell: '还不能确定碳骨架、官能团位置或具体结构。',
    example: '只知道含 C、H、O 时，还需要相对分子质量才能区分 C2H6O 与 C3H8O。'
  },
  {
    id: 'mass',
    label: '相对分子质量',
    tells: '能告诉我们分子式推导中的总质量约束。',
    cannotTell: '还不能区分同分异构体。',
    example: '相对分子质量为 60 且只含 C、H、O，可帮助锁定 C3H8O。'
  },
  {
    id: 'unsaturation',
    label: '计算不饱和度',
    tells: '能告诉我们分子中是否可能有环、双键、三键或苯环。',
    cannotTell: '还不能确定是哪一种官能团，也不能确定位置。',
    example: 'C6H6 的不饱和度为 4，可能提示苯环，但仍需实验验证。'
  },
  {
    id: 'functional-group',
    label: '判断官能团',
    tells: '能告诉我们分子表现出哪类典型化学性质。',
    cannotTell: '还不能单独决定完整碳骨架。',
    example: '银镜反应能支持醛基判断，但还需要结合分子式排除其他可能。'
  },
  {
    id: 'structure',
    label: '确定结构式',
    tells: '能把分子式、官能团和碳骨架证据合并成最终结构。',
    cannotTell: '如果证据不足，不能只凭猜测写最终答案。',
    example: 'C4H10O 需要结合红外和氢谱信息区分 1-丁醇、2-丁醇和醚。'
  }
];

export const unsaturationPredictionOptions: Array<ChoiceOption<UnsaturationPredictionId>> = [
  { id: 'carbon-double-bond', label: '碳碳双键', detail: '可能发生加成或氧化' },
  { id: 'carbon-triple-bond', label: '碳碳三键', detail: '不饱和度贡献 2' },
  { id: 'benzene-ring', label: '苯环', detail: '整体贡献 4' },
  { id: 'carbonyl', label: '羰基', detail: 'C=O 贡献 1' },
  { id: 'ring', label: '环状结构', detail: '一个环贡献 1' },
  { id: 'none', label: '都不明显', detail: '可能是饱和开链结构' }
];

export const phenomenonOptions: Array<ChoiceOption<PhenomenonId>> = [
  { id: 'decolorize', label: '褪色', detail: '常见于溴或高锰酸钾实验' },
  { id: 'precipitate', label: '生成沉淀', detail: '如苯酚与溴水' },
  { id: 'gas', label: '放出气体', detail: '如羧酸与碳酸氢钠' },
  { id: 'silver-mirror', label: '出现银镜', detail: '醛基检验' },
  { id: 'purple', label: '显紫色', detail: '酚羟基与 Fe3+' },
  { id: 'none', label: '无明显现象', detail: '没有典型反应' }
];

export const pairRoleOptions: Array<ChoiceOption<PairRoleId>> = [
  { id: 'hydroxyl', label: '提供羟基', detail: '醇类或酚类可能参与' },
  { id: 'carboxyl', label: '提供羧基', detail: '羧酸可酯化或酸碱反应' },
  { id: 'aldehyde', label: '提供醛基', detail: '可发生氧化或缩聚相关反应' },
  { id: 'phenol', label: '提供酚羟基', detail: '可显色、取代或缩聚' },
  { id: 'benzene-ring', label: '提供苯环', detail: '可参与取代或稳定性讨论' },
  { id: 'none', label: '没有明显配对角色', detail: '高中常见条件下不直接配对' }
];

export function getUnsaturationPredictionFeedback(
  formula: string,
  index: number,
  predictions: UnsaturationPredictionId[]
): string {
  if (predictions.length === 0) {
    return `先对 ${formula} 可能隐藏的结构做一个预测，再用不饱和度验证。`;
  }

  if (index <= 0) {
    return `不饱和度为 0，可能支持“都不明显”的预测；若选择了双键、三键、苯环或羰基，仍需实验验证并优先复盘。`;
  }

  if (index === 1) {
    return `不饱和度为 1，可能支持双键、羰基或环状结构，但公式不能单独确认具体官能团，仍需实验验证。`;
  }

  if (index === 2) {
    return `不饱和度为 2，可能支持三键或两个不饱和单元，仍需实验验证它是键、环还是组合。`;
  }

  return `不饱和度为 ${index}，可能支持苯环或多个不饱和单元的预测，但仍需实验验证，不能只凭公式定结构。`;
}

export function getExpectedPhenomenon(reaction: ReactionResult): PhenomenonId {
  if (!reaction.reacts) return 'none';
  if (/银镜/.test(reaction.evidence)) return 'silver-mirror';
  if (/CO2|H2|气体/.test(reaction.evidence)) return 'gas';
  if (/紫/.test(reaction.evidence)) return 'purple';
  if (/沉淀/.test(reaction.evidence)) return 'precipitate';
  if (/褪色/.test(reaction.evidence)) return 'decolorize';
  return 'none';
}

export function getPairRoleForCompound(compound: Compound): PairRoleId {
  if (compound.functionalGroups.includes('carboxylic-acid')) return 'carboxyl';
  if (compound.functionalGroups.includes('phenol')) return 'phenol';
  if (compound.functionalGroups.includes('aldehyde')) return 'aldehyde';
  if (compound.functionalGroups.includes('alcohol')) return 'hydroxyl';
  if (compound.functionalGroups.includes('arene')) return 'benzene-ring';
  return 'none';
}

export function pairRoleLabel(role: PairRoleId): string {
  return pairRoleOptions.find((option) => option.id === role)?.label ?? '没有明显配对角色';
}

export function functionalGroupRoleLabel(groups: FunctionalGroup[]): string {
  if (groups.includes('carboxylic-acid')) return '羧基';
  if (groups.includes('phenol')) return '酚羟基';
  if (groups.includes('aldehyde')) return '醛基';
  if (groups.includes('alcohol')) return '醇羟基';
  if (groups.includes('arene')) return '苯环';
  return '没有明显配对角色';
}

export function createEvidenceNoteFromAgentReply(reply: AgentReply): EvidenceNote {
  const kind: EvidenceNote['kind'] = reply.answer.startsWith('不能') ? 'excluded' : 'verified';
  return {
    kind,
    text: `${reply.matchedTopic}：${reply.answer}`
  };
}
```

- [ ] **Step 4: Run helper tests to verify green**

Run:

```bash
npm test -- --run test/curiosity.test.ts
```

Expected: PASS for all tests in `test/curiosity.test.ts`.

- [ ] **Step 5: Commit helper layer**

Run:

```bash
git add src/curiosity.ts test/curiosity.test.ts
git commit -m "feat: add curiosity helper layer"
```

---

### Task 2: Gaokao Question Bank Data

**Files:**
- Create: `src/gaokaoQuestions.ts`
- Test: `test/gaokaoQuestions.test.ts`

- [ ] **Step 1: Write failing question-bank tests**

Add `test/gaokaoQuestions.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import { findPuzzleById } from '../src/chemistry';
import { gaokaoQuestions } from '../src/gaokaoQuestions';

describe('gaokao question bank', () => {
  test('contains a classroom-sized local question bank', () => {
    expect(gaokaoQuestions.length).toBeGreaterThanOrEqual(8);
    expect(gaokaoQuestions.length).toBeLessThanOrEqual(12);
  });

  test('every question maps to an existing formula puzzle', () => {
    for (const question of gaokaoQuestions) {
      expect(() => findPuzzleById(question.puzzleId)).not.toThrow();
      expect(question.formula).toBe(findPuzzleById(question.puzzleId).formula);
    }
  });

  test('covers common high-school inference categories', () => {
    const focusText = gaokaoQuestions.flatMap((question) => question.examFocus).join('、');

    expect(focusText).toContain('加成');
    expect(focusText).toContain('银镜');
    expect(focusText).toContain('羧酸');
    expect(focusText).toContain('酯');
    expect(focusText).toContain('苯环');
    expect(focusText).toContain('同分异构体');
  });
});
```

- [ ] **Step 2: Run question-bank tests to verify red**

Run:

```bash
npm test -- --run test/gaokaoQuestions.test.ts
```

Expected: FAIL with a module resolution error for `../src/gaokaoQuestions`.

- [ ] **Step 3: Implement `src/gaokaoQuestions.ts`**

Create `src/gaokaoQuestions.ts`:

```ts
export interface GaokaoQuestion {
  id: string;
  puzzleId: string;
  title: string;
  formula: string;
  examFocus: string[];
  task: string;
  publicClues: string[];
}

export const gaokaoQuestions: GaokaoQuestion[] = [
  {
    id: 'gk-alkene-addition',
    puzzleId: 'puzzle-ethene',
    title: '不饱和烃的性质判断',
    formula: 'C2H4',
    examFocus: ['加成反应', '酸性高锰酸钾氧化', '官能团性质'],
    task: '根据分子式和实验性质判断可能结构，并说明能否使溴的四氯化碳溶液褪色。',
    publicClues: ['只含 C、H 两种元素', '不饱和度为 1']
  },
  {
    id: 'gk-alkyne-addition',
    puzzleId: 'puzzle-ethene',
    title: '不饱和度与加成反应对比',
    formula: 'C2H4',
    examFocus: ['加成反应', '不饱和度', '烯烃鉴别'],
    task: '先用不饱和度缩小范围，再追问实验性质验证是否含碳碳不饱和键。',
    publicClues: ['该题用于比较烯烃与其他不饱和结构的验证方式']
  },
  {
    id: 'gk-alcohol-ether',
    puzzleId: 'puzzle-ethanol',
    title: '醇醚官能团异构',
    formula: 'C2H6O',
    examFocus: ['醇醚异构', '金属钠', '官能团鉴别'],
    task: '判断该分子是否含 O-H 键，并区分醇和醚的可能性。',
    publicClues: ['不饱和度为 0', '同分异构体可能具有不同官能团']
  },
  {
    id: 'gk-aldehyde-silver',
    puzzleId: 'puzzle-acetaldehyde',
    title: '醛基的银镜反应',
    formula: 'C2H4O',
    examFocus: ['银镜反应', '醛基', '氧化反应'],
    task: '通过银氨溶液实验判断是否含醛基。',
    publicClues: ['含氧有机物', '可通过弱氧化剂检验']
  },
  {
    id: 'gk-carboxylic-acid',
    puzzleId: 'puzzle-acetic-acid',
    title: '羧酸酸性检验',
    formula: 'C2H4O2',
    examFocus: ['羧酸', '碳酸氢钠', '酸性比较'],
    task: '判断能否与碳酸氢钠溶液反应放出二氧化碳。',
    publicClues: ['含两个氧原子', '可能存在羧酸或酯类同分异构体']
  },
  {
    id: 'gk-ester-hydrolysis',
    puzzleId: 'puzzle-acetic-acid',
    title: '羧酸与酯的同分异构筛选',
    formula: 'C2H4O2',
    examFocus: ['酯', '水解反应', '同分异构体'],
    task: '比较羧酸和酯的性质差异，并用实验性质排除不符合的结构。',
    publicClues: ['同一分子式可能对应羧酸或酯']
  },
  {
    id: 'gk-phenol-tests',
    puzzleId: 'puzzle-phenol',
    title: '酚羟基与苯环活化',
    formula: 'C6H6O',
    examFocus: ['酚羟基', '三氯化铁显色', '溴水取代', '苯环'],
    task: '通过显色反应和溴水现象判断是否含酚羟基。',
    publicClues: ['含苯环可能性', '含氧官能团需要实验验证']
  },
  {
    id: 'gk-benzene-stability',
    puzzleId: 'puzzle-benzene',
    title: '苯环稳定性与不饱和度',
    formula: 'C6H6',
    examFocus: ['苯环', '不饱和度', '取代反应', '加成反应辨析'],
    task: '解释为什么分子不饱和度高，但通常不使溴的四氯化碳溶液褪色。',
    publicClues: ['不饱和度为 4', '性质不能简单等同于普通碳碳双键']
  },
  {
    id: 'gk-ir-nmr-propanol',
    puzzleId: 'puzzle-propan-1-ol',
    title: '红外与氢谱筛选醇类同分异构体',
    formula: 'C3H8O',
    examFocus: ['同分异构体', '红外光谱', '核磁共振氢谱', '醇醚鉴别'],
    task: '结合 O-H、C-O 吸收和氢谱峰组数判断结构。',
    publicClues: ['相对分子质量为 60', '红外显示 O-H 和 C-O']
  },
  {
    id: 'gk-ir-nmr-butanol',
    puzzleId: 'puzzle-butan-2-ol',
    title: 'C4H10O 的高考式结构推断',
    formula: 'C4H10O',
    examFocus: ['同分异构体', '红外识别官能团', '核磁氢谱面积比'],
    task: '在多个醇和醚的候选结构中，根据实验性质锁定结构。',
    publicClues: ['不饱和度为 0', '红外有宽强 O-H 吸收', '氢谱有五组信号']
  }
];
```

- [ ] **Step 4: Run question-bank tests to verify green**

Run:

```bash
npm test -- --run test/gaokaoQuestions.test.ts
```

Expected: PASS for all question-bank tests.

- [ ] **Step 5: Commit question bank**

Run:

```bash
git add src/gaokaoQuestions.ts test/gaokaoQuestions.test.ts
git commit -m "feat: add gaokao question bank"
```

---

### Task 3: Global Curiosity Bar

**Files:**
- Modify: `src/app.ts`
- Modify: `src/styles.css`
- Test: `test/appPracticeModes.test.ts`

- [ ] **Step 1: Add failing render test**

Append this test to `test/appPracticeModes.test.ts`:

```ts
describe('app curiosity bar', () => {
  test('renders a global curiosity question and cycle action', async () => {
    const root = createRoot();

    await importApp(root);

    expect(root.innerHTML).toContain('今日追问');
    expect(root.innerHTML).toContain('data-action="next-curiosity-question"');
  });
});
```

- [ ] **Step 2: Run app render test to verify red**

Run:

```bash
npm test -- --run test/appPracticeModes.test.ts
```

Expected: FAIL because `今日追问` is not rendered.

- [ ] **Step 3: Add state, import, render function, and action**

Modify `src/app.ts`:

```ts
import { curiosityQuestions } from './curiosity';
```

Add to `AppState`:

```ts
curiosityQuestionIndex: number;
```

Add to `state`:

```ts
curiosityQuestionIndex: 0,
```

Render after `</nav>`:

```ts
${renderCuriosityBar()}
```

Add:

```ts
function renderCuriosityBar(): string {
  const question = curiosityQuestions[state.curiosityQuestionIndex % curiosityQuestions.length];
  return `
    <section class="curiosity-bar" aria-label="今日追问">
      <div>
        <p class="section-kicker">今日追问</p>
        <strong>${escapeHtml(question)}</strong>
      </div>
      <button class="icon-text-button" data-action="next-curiosity-question" type="button">换一个</button>
    </section>
  `;
}
```

Add in action handler:

```ts
if (action === 'next-curiosity-question') nextCuriosityQuestion();
```

Add:

```ts
function nextCuriosityQuestion(): void {
  state.curiosityQuestionIndex = (state.curiosityQuestionIndex + 1) % curiosityQuestions.length;
  render();
}
```

- [ ] **Step 4: Add bar styles**

Append near the navigation styles in `src/styles.css`:

```css
.curiosity-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin: 0 0 18px;
  padding: 14px 16px;
  border: 1px solid rgba(49, 95, 156, 0.2);
  border-radius: 8px;
  background:
    linear-gradient(90deg, rgba(49, 95, 156, 0.1), transparent 9px),
    rgba(255, 255, 255, 0.82);
  box-shadow: var(--shadow-soft);
}

.curiosity-bar strong {
  display: block;
  line-height: 1.55;
}
```

Add inside `@media (max-width: 520px)`:

```css
.curiosity-bar {
  align-items: stretch;
  flex-direction: column;
}
```

- [ ] **Step 5: Run test to verify green**

Run:

```bash
npm test -- --run test/appPracticeModes.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit curiosity bar**

Run:

```bash
git add src/app.ts src/styles.css test/appPracticeModes.test.ts
git commit -m "feat: add curiosity question bar"
```

---

### Task 4: Method Page Clickable Route Nodes

**Files:**
- Modify: `src/app.ts`
- Modify: `src/styles.css`
- Test: `test/appPracticeModes.test.ts`

- [ ] **Step 1: Add failing method-node test**

Append this test to `test/appPracticeModes.test.ts`:

```ts
describe('app method route details', () => {
  test('renders clickable route nodes and method detail panel', async () => {
    const methodTab = createModeButton('method');
    const root = createRoot({ modeButtons: [methodTab.button] });

    await importApp(root);
    methodTab.click();

    expect(root.innerHTML).toContain('破案路线图');
    expect(root.innerHTML).toContain('data-method-node="unsaturation"');
    expect(root.innerHTML).toContain('能告诉我们');
    expect(root.innerHTML).toContain('还不能确定');
  });
});
```

- [ ] **Step 2: Run test to verify red**

Run:

```bash
npm test -- --run test/appPracticeModes.test.ts
```

Expected: FAIL because `破案路线图` and method-node buttons are not rendered.

- [ ] **Step 3: Add method state and import details**

Modify `src/app.ts`:

```ts
import { methodNodeDetails } from './curiosity';
```

Add to `AppState`:

```ts
selectedMethodNodeId: string;
```

Add to `state`:

```ts
selectedMethodNodeId: 'unsaturation',
```

- [ ] **Step 4: Update method renderer**

Inside `renderMethodMode`, change heading text to `破案路线图`, render each flow node with `data-method-node`, and add this detail panel after the guide grid:

```ts
${renderMethodDetailPanel()}
```

Add:

```ts
function renderMethodDetailPanel(): string {
  const detail = methodNodeDetails.find((node) => node.id === state.selectedMethodNodeId) ?? methodNodeDetails[0];
  return `
    <section class="method-detail-panel" aria-label="路线节点说明">
      <p class="section-kicker">${escapeHtml(detail.label)}</p>
      <dl>
        <div>
          <dt>能告诉我们</dt>
          <dd>${escapeHtml(detail.tells)}</dd>
        </div>
        <div>
          <dt>还不能确定</dt>
          <dd>${escapeHtml(detail.cannotTell)}</dd>
        </div>
        <div>
          <dt>课堂例子</dt>
          <dd>${escapeHtml(detail.example)}</dd>
        </div>
      </dl>
    </section>
  `;
}
```

For each clickable method node, use:

```ts
<button class="flow-node ${state.selectedMethodNodeId === 'unsaturation' ? 'active' : ''}" data-method-node="unsaturation" type="button" aria-pressed="${state.selectedMethodNodeId === 'unsaturation'}">计算不饱和度</button>
```

Add in `bindEvents()`:

```ts
appRoot.querySelectorAll<HTMLButtonElement>('[data-method-node]').forEach((button) => {
  button.addEventListener('click', () => {
    state.selectedMethodNodeId = button.dataset.methodNode ?? state.selectedMethodNodeId;
    render();
  });
});
```

- [ ] **Step 5: Add method detail styles**

Append to `src/styles.css`:

```css
.flow-node.active {
  border-color: var(--teal);
  background: var(--teal-soft);
  color: var(--teal-dark);
}

.method-detail-panel {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid rgba(19, 123, 114, 0.2);
  border-radius: 8px;
  background: #fff;
}

.method-detail-panel dl {
  display: grid;
  gap: 10px;
  margin: 0;
}

.method-detail-panel div {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 10px;
}

.method-detail-panel dt {
  color: var(--teal-dark);
  font-weight: 900;
}

.method-detail-panel dd {
  margin: 0;
  color: var(--muted);
  line-height: 1.65;
}
```

Add inside `@media (max-width: 520px)`:

```css
.method-detail-panel div {
  grid-template-columns: 1fr;
  gap: 4px;
}
```

- [ ] **Step 6: Run test to verify green**

Run:

```bash
npm test -- --run test/appPracticeModes.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit method route nodes**

Run:

```bash
git add src/app.ts src/styles.css test/appPracticeModes.test.ts
git commit -m "feat: make method route interactive"
```

---

### Task 5: Unsaturation Prediction Controls

**Files:**
- Modify: `src/app.ts`
- Modify: `src/styles.css`
- Test: `test/appPracticeModes.test.ts`

- [ ] **Step 1: Add failing unsaturation prediction test**

Append this test:

```ts
describe('app unsaturation predictions', () => {
  test('renders structure prediction options before unsaturation feedback', async () => {
    const unsaturationTab = createModeButton('unsaturation');
    const root = createRoot({ modeButtons: [unsaturationTab.button] });

    await importApp(root);
    unsaturationTab.click();

    expect(root.innerHTML).toContain('先猜结构可能性');
    expect(root.innerHTML).toContain('data-unsaturation-prediction="benzene-ring"');
    expect(root.innerHTML).toContain('仍需实验验证');
  });
});
```

- [ ] **Step 2: Run test to verify red**

Run:

```bash
npm test -- --run test/appPracticeModes.test.ts
```

Expected: FAIL because prediction controls are missing.

- [ ] **Step 3: Add state and renderer**

Modify `src/app.ts` imports:

```ts
import {
  getUnsaturationPredictionFeedback,
  unsaturationPredictionOptions,
  type UnsaturationPredictionId
} from './curiosity';
```

Add to `AppState`:

```ts
unsaturationPredictions: UnsaturationPredictionId[];
```

Add to `state`:

```ts
unsaturationPredictions: ['benzene-ring'],
```

Add in `renderUnsaturationMode()` before `.unsaturation-result`:

```ts
${renderUnsaturationPredictions(index)}
```

Add:

```ts
function renderUnsaturationPredictions(index: number): string {
  return `
    <section class="prediction-panel" aria-label="先猜结构可能性">
      <div>
        <p class="section-kicker">先猜结构可能性</p>
        <h3>这个分子可能藏了什么？</h3>
      </div>
      <div class="prediction-grid">
        ${unsaturationPredictionOptions
          .map((option) => {
            const active = state.unsaturationPredictions.includes(option.id);
            return `
              <button class="choice-chip ${active ? 'selected' : ''}" data-unsaturation-prediction="${option.id}" type="button" aria-pressed="${active}">
                <span>${option.label}</span>
                <small>${option.detail}</small>
              </button>
            `;
          })
          .join('')}
      </div>
      <p class="prediction-feedback">${getUnsaturationPredictionFeedback(
        state.unsaturationFormula,
        index,
        state.unsaturationPredictions
      )}</p>
    </section>
  `;
}
```

Add in `bindEvents()`:

```ts
appRoot.querySelectorAll<HTMLButtonElement>('[data-unsaturation-prediction]').forEach((button) => {
  button.addEventListener('click', () => {
    const id = button.dataset.unsaturationPrediction as UnsaturationPredictionId;
    state.unsaturationPredictions = state.unsaturationPredictions.includes(id)
      ? state.unsaturationPredictions.filter((item) => item !== id)
      : [...state.unsaturationPredictions, id];
    render();
  });
});
```

- [ ] **Step 4: Reset predictions when formula changes**

In the `unsaturation-formula` input branch, add:

```ts
state.unsaturationPredictions = [];
```

before `render();`.

- [ ] **Step 5: Add prediction styles**

Append:

```css
.prediction-panel {
  display: grid;
  gap: 12px;
  margin: 0 0 14px;
  padding: 14px;
  border: 1px solid rgba(49, 95, 156, 0.18);
  border-radius: 8px;
  background: #fff;
}

.prediction-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.prediction-feedback {
  margin: 0;
  color: var(--muted);
  line-height: 1.65;
}
```

Add in `@media (max-width: 860px)`:

```css
.prediction-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
```

Add in `@media (max-width: 520px)`:

```css
.prediction-grid {
  grid-template-columns: 1fr;
}
```

- [ ] **Step 6: Run tests to verify green**

Run:

```bash
npm test -- --run test/curiosity.test.ts test/appPracticeModes.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit unsaturation prediction**

Run:

```bash
git add src/app.ts src/styles.css test/appPracticeModes.test.ts
git commit -m "feat: add unsaturation predictions"
```

---

### Task 6: Reagent Phenomenon Prediction

**Files:**
- Modify: `src/app.ts`
- Modify: `src/styles.css`
- Test: `test/appPracticeModes.test.ts`

- [ ] **Step 1: Add failing reagent prediction test**

Append:

```ts
describe('app reagent phenomenon prediction', () => {
  test('renders phenomenon choices in reagent mode', async () => {
    const root = createRoot();

    await importApp(root);

    expect(root.innerHTML).toContain('先预测现象');
    expect(root.innerHTML).toContain('data-phenomenon="decolorize"');
    expect(root.innerHTML).toContain('无明显现象');
  });
});
```

- [ ] **Step 2: Run test to verify red**

Run:

```bash
npm test -- --run test/appPracticeModes.test.ts
```

Expected: FAIL because reagent phenomenon controls are missing.

- [ ] **Step 3: Add imports and state**

Modify `src/app.ts` import:

```ts
import { getExpectedPhenomenon, phenomenonOptions, type PhenomenonId } from './curiosity';
```

Add to `AppState`:

```ts
reagentPhenomenonGuess: PhenomenonId | null;
```

Add to `state`:

```ts
reagentPhenomenonGuess: null,
```

- [ ] **Step 4: Render phenomenon controls**

In `renderReagentMode()`, render before the yes/no answer row:

```ts
${renderPhenomenonPrediction()}
```

Add:

```ts
function renderPhenomenonPrediction(): string {
  return `
    <section class="prediction-panel" aria-label="先预测现象">
      <div>
        <p class="section-kicker">先预测现象</p>
        <h3>如果反应，可能看到什么？</h3>
      </div>
      <div class="prediction-grid">
        ${phenomenonOptions
          .map((option) => {
            const active = state.reagentPhenomenonGuess === option.id;
            return `
              <button class="choice-chip ${active ? 'selected' : ''}" data-phenomenon="${option.id}" type="button" aria-pressed="${active}">
                <span>${option.label}</span>
                <small>${option.detail}</small>
              </button>
            `;
          })
          .join('')}
      </div>
    </section>
  `;
}
```

Add in `bindEvents()`:

```ts
appRoot.querySelectorAll<HTMLButtonElement>('[data-phenomenon]').forEach((button) => {
  button.addEventListener('click', () => {
    state.reagentPhenomenonGuess = button.dataset.phenomenon as PhenomenonId;
    state.reagentFeedback = '';
    render();
  });
});
```

- [ ] **Step 5: Include phenomenon feedback in submit**

In `submitReagentAnswer()`, after `const reaction = ...`, add:

```ts
const expectedPhenomenon = getExpectedPhenomenon(reaction);
const phenomenonGuessText = state.reagentPhenomenonGuess
  ? ` 现象预测：${state.reagentPhenomenonGuess === expectedPhenomenon ? '预测吻合' : '预测需修正'}。`
  : ' 现象预测：本题还可以先猜实验现象再提交。';
```

Append `${phenomenonGuessText}` to both challenge and self-test `state.reagentFeedback` strings.

- [ ] **Step 6: Reset phenomenon on question changes**

Set `state.reagentPhenomenonGuess = null;` in:

- `setReagentPracticeMode`
- `restartReagentChallenge`
- `advanceReagentChallenge`
- `applyCurrentChallengeQuestion`
- `newReagentChallenge`
- self-test compound input branch
- reagent choice click branch

- [ ] **Step 7: Run tests**

Run:

```bash
npm test -- --run test/curiosity.test.ts test/appPracticeModes.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit reagent prediction**

Run:

```bash
git add src/app.ts src/styles.css test/appPracticeModes.test.ts
git commit -m "feat: add reagent phenomenon prediction"
```

---

### Task 7: Pair Reaction Roles

**Files:**
- Modify: `src/app.ts`
- Modify: `src/styles.css`
- Test: `test/appPracticeModes.test.ts`

- [ ] **Step 1: Add failing pair role test**

Append:

```ts
describe('app pair reaction roles', () => {
  test('renders role selectors for both pair molecules', async () => {
    const pairTab = createModeButton('pair');
    const root = createRoot({ modeButtons: [pairTab.button] });

    await importApp(root);
    pairTab.click();

    expect(root.innerHTML).toContain('反应角色');
    expect(root.innerHTML).toContain('data-input="pair-first-role"');
    expect(root.innerHTML).toContain('data-input="pair-second-role"');
    expect(root.innerHTML).toContain('提供羟基');
    expect(root.innerHTML).toContain('提供羧基');
  });
});
```

- [ ] **Step 2: Run test to verify red**

Run:

```bash
npm test -- --run test/appPracticeModes.test.ts
```

Expected: FAIL because role selectors are missing.

- [ ] **Step 3: Add imports and state**

Modify `src/app.ts` import:

```ts
import {
  getPairRoleForCompound,
  pairRoleLabel,
  pairRoleOptions,
  type PairRoleId
} from './curiosity';
```

Add to `AppState`:

```ts
pairFirstRoleGuess: PairRoleId;
pairSecondRoleGuess: PairRoleId;
```

Add to `state`:

```ts
pairFirstRoleGuess: 'none',
pairSecondRoleGuess: 'none',
```

- [ ] **Step 4: Render role selectors**

In `renderPairMode()` before `.answer-row`, add:

```ts
${renderPairRoleSelector(first, second)}
```

Add:

```ts
function renderPairRoleSelector(first: Compound, second: Compound): string {
  return `
    <section class="role-panel" aria-label="反应角色">
      <p class="section-kicker">反应角色</p>
      <div class="role-grid">
        ${renderRoleSelect('pair-first-role', '左侧分子', state.pairFirstRoleGuess, first.name)}
        ${renderRoleSelect('pair-second-role', '右侧分子', state.pairSecondRoleGuess, second.name)}
      </div>
    </section>
  `;
}

function renderRoleSelect(inputId: string, label: string, value: PairRoleId, compoundName: string): string {
  return `
    <label class="select-control">
      <span>${label} · ${escapeHtml(compoundName)}</span>
      <select data-input="${inputId}" aria-label="${label}反应角色">
        ${pairRoleOptions
          .map(
            (option) => `
              <option value="${option.id}" ${option.id === value ? 'selected' : ''}>
                ${option.label}
              </option>
            `
          )
          .join('')}
      </select>
    </label>
  `;
}
```

In `[data-input]` handler:

```ts
if (kind === 'pair-first-role') state.pairFirstRoleGuess = input.value as PairRoleId;
if (kind === 'pair-second-role') state.pairSecondRoleGuess = input.value as PairRoleId;
```

- [ ] **Step 5: Add role feedback**

In `submitPairAnswer()`, after `const reaction = ...`, add:

```ts
const firstRole = getPairRoleForCompound(findCompoundById(state.pairFirstId));
const secondRole = getPairRoleForCompound(findCompoundById(state.pairSecondId));
const roleFeedback = ` 角色判断：左侧应关注${pairRoleLabel(firstRole)}，右侧应关注${pairRoleLabel(secondRole)}。`;
```

Append `${roleFeedback}` to `state.pairFeedback`.

Reset roles to `'none'` in `newPairChallenge()` and `selectPair()`.

- [ ] **Step 6: Add styles**

Append:

```css
.role-panel {
  display: grid;
  gap: 12px;
  margin: 0 0 14px;
  padding: 14px;
  border: 1px solid rgba(19, 123, 114, 0.16);
  border-radius: 8px;
  background: #fff;
}

.role-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
```

Add in `@media (max-width: 520px)`:

```css
.role-grid {
  grid-template-columns: 1fr;
}
```

- [ ] **Step 7: Run tests**

Run:

```bash
npm test -- --run test/curiosity.test.ts test/appPracticeModes.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit pair roles**

Run:

```bash
git add src/app.ts src/styles.css test/appPracticeModes.test.ts
git commit -m "feat: add pair reaction roles"
```

---

### Task 8: Advanced Gaokao Bank, 3D Reveal, and Evidence Board

**Files:**
- Modify: `src/app.ts`
- Modify: `src/styles.css`
- Test: `test/appPracticeModes.test.ts`

- [ ] **Step 1: Add failing advanced render test**

Append:

```ts
describe('app advanced gaokao bank and evidence board', () => {
  test('renders formula, locked 3D model area, gaokao bank, and empty evidence board', async () => {
    const puzzleTab = createModeButton('puzzle');
    const root = createRoot({ modeButtons: [puzzleTab.button] });

    await importApp(root);
    puzzleTab.click();

    expect(root.innerHTML).toContain('高考题库');
    expect(root.innerHTML).toContain('3D 模型');
    expect(root.innerHTML).toContain('答对后揭晓三维结构');
    expect(root.innerHTML).toContain('证据板');
    expect(root.innerHTML).toContain('已验证性质');
    expect(root.innerHTML).toContain('当前猜想');
    expect(root.innerHTML).not.toContain('quick-question');
  });
});
```

- [ ] **Step 2: Run test to verify red**

Run:

```bash
npm test -- --run test/appPracticeModes.test.ts
```

Expected: FAIL because Gaokao bank and evidence board are missing.

- [ ] **Step 3: Add imports, types, and state**

Modify `src/app.ts`:

```ts
import { gaokaoQuestions } from './gaokaoQuestions';
import { createEvidenceNoteFromAgentReply, type EvidenceNote } from './curiosity';
```

Add to `AppState`:

```ts
selectedGaokaoQuestionId: string;
evidenceNotes: EvidenceNote[];
```

Add to `state`:

```ts
selectedGaokaoQuestionId: 'gk-ir-nmr-butanol',
evidenceNotes: [],
```

- [ ] **Step 4: Wire question selection to puzzle state**

Add:

```ts
function getSelectedGaokaoQuestion() {
  return gaokaoQuestions.find((question) => question.id === state.selectedGaokaoQuestionId) ?? gaokaoQuestions[0];
}

function setGaokaoQuestion(questionId: string): void {
  const question = gaokaoQuestions.find((item) => item.id === questionId) ?? gaokaoQuestions[0];
  state.selectedGaokaoQuestionId = question.id;
  setPuzzle(findPuzzleById(question.puzzleId));
  state.evidenceNotes = [];
  render();
}

function randomGaokaoQuestion(): void {
  const candidates = gaokaoQuestions.filter((question) => question.id !== state.selectedGaokaoQuestionId);
  setGaokaoQuestion(pick(candidates.length ? candidates : gaokaoQuestions).id);
}
```

Initialize `puzzleId` consistently by setting the initial question to match `puzzle-butan-2-ol`.

- [ ] **Step 5: Render Gaokao bank and task card**

In `renderPuzzleMode()`, add a title row area containing:

```ts
${renderGaokaoQuestionPanel()}
```

Add:

```ts
function renderGaokaoQuestionPanel(): string {
  const question = getSelectedGaokaoQuestion();
  return `
    <section class="gaokao-panel" aria-label="高考题库">
      <div class="panel-title-row">
        <div>
          <p class="section-kicker">高考题库</p>
          <h3>${escapeHtml(question.title)}</h3>
        </div>
        <button class="icon-text-button" data-action="random-gaokao-question" type="button">随机高考题</button>
      </div>
      <label class="select-control">
        <span>选择题目</span>
        <select data-input="gaokao-question" aria-label="选择高考题">
          ${gaokaoQuestions
            .map(
              (item) => `
                <option value="${item.id}" ${item.id === question.id ? 'selected' : ''}>
                  ${item.title}
                </option>
              `
            )
            .join('')}
        </select>
      </label>
      <dl class="gaokao-facts">
        <div><dt>分子式</dt><dd class="chem-formula">${formatChemicalFormula(question.formula)}</dd></div>
        <div><dt>考查点</dt><dd>${question.examFocus.map(escapeHtml).join('、')}</dd></div>
        <div><dt>任务要求</dt><dd>${escapeHtml(question.task)}</dd></div>
        <div><dt>公开条件</dt><dd>${question.publicClues.map(escapeHtml).join('；')}</dd></div>
      </dl>
    </section>
  `;
}
```

In input handler:

```ts
if (kind === 'gaokao-question') {
  setGaokaoQuestion(input.value);
  return;
}
```

In action handler:

```ts
if (action === 'random-gaokao-question') randomGaokaoQuestion();
```

- [ ] **Step 6: Update locked 3D wording**

Change `renderPuzzleVisualization()` locked panel to:

```ts
<section class="locked-visualization" aria-label="3D 模型锁定面板">
  <span>3D 模型</span>
  <strong class="chem-formula">${formatChemicalFormula(puzzle.formula)}</strong>
  <p>答对后揭晓三维结构</p>
</section>
```

This keeps a 3D model area visible without revealing the structure.

- [ ] **Step 7: Render evidence board**

Add this inside `renderPuzzleMode()` next to the formula/model area:

```ts
${renderEvidenceBoard()}
```

Add:

```ts
function renderEvidenceBoard(): string {
  return `
    <section class="evidence-board" aria-label="证据板">
      <p class="section-kicker">证据板</p>
      ${renderEvidenceColumn('已验证性质', 'verified')}
      ${renderEvidenceColumn('排除方向', 'excluded')}
      ${renderEvidenceColumn('当前猜想', 'guess')}
    </section>
  `;
}

function renderEvidenceColumn(title: string, kind: EvidenceNote['kind']): string {
  const notes = state.evidenceNotes.filter((note) => note.kind === kind);
  return `
    <div class="evidence-column">
      <h3>${title}</h3>
      ${
        notes.length
          ? `<ul>${notes.map((note) => `<li>${formatChemistryText(note.text)}</li>`).join('')}</ul>`
          : '<p>等待学生提问或提交猜想。</p>'
      }
    </div>
  `;
}
```

- [ ] **Step 8: Fill evidence board from AI and guesses**

In `getAgentAnswer`, keep returning answer string. In `sendChat()`, after receiving the answer, also create a rule-based note from `askAgent` before remote API fallback when possible:

```ts
const localReply = askAgent(state.puzzleId, text);
state.evidenceNotes = [...state.evidenceNotes, createEvidenceNoteFromAgentReply(localReply)];
```

When appending the final agent message, keep existing remote answer behavior. The evidence note may use the local rule assistant's matched topic so it stays structured.

In `submitGuess()`, for wrong guesses add:

```ts
if (!result.correct) {
  state.evidenceNotes = [...state.evidenceNotes, { kind: 'guess', text: `已尝试：${guess}` }];
}
```

When `setPuzzle()` runs, reset:

```ts
state.evidenceNotes = [];
```

- [ ] **Step 9: Add advanced styles**

Append:

```css
.gaokao-panel,
.evidence-board {
  display: grid;
  gap: 12px;
  padding: 14px;
  border: 1px solid rgba(19, 123, 114, 0.18);
  border-radius: 8px;
  background: #fff;
}

.gaokao-panel {
  margin-bottom: 14px;
}

.gaokao-facts {
  display: grid;
  gap: 8px;
  margin: 0;
}

.gaokao-facts div {
  display: grid;
  grid-template-columns: 84px 1fr;
  gap: 10px;
  padding: 9px 10px;
  border: 1px solid rgba(215, 222, 216, 0.74);
  border-radius: 8px;
  background: var(--surface-muted);
}

.gaokao-facts dt {
  color: var(--muted);
  font-weight: 800;
}

.gaokao-facts dd {
  margin: 0;
  line-height: 1.55;
}

.evidence-board {
  align-content: start;
}

.evidence-column {
  display: grid;
  gap: 8px;
  padding: 12px;
  border: 1px solid rgba(49, 95, 156, 0.14);
  border-radius: 8px;
  background: var(--surface-muted);
}

.evidence-column h3 {
  font-size: 15px;
  color: var(--teal-dark);
}

.evidence-column p,
.evidence-column li {
  margin: 0;
  color: var(--muted);
  line-height: 1.6;
}

.evidence-column ul {
  display: grid;
  gap: 6px;
  margin: 0;
  padding-left: 18px;
}
```

Add in `@media (max-width: 520px)`:

```css
.gaokao-facts div {
  grid-template-columns: 1fr;
  gap: 4px;
}
```

- [ ] **Step 10: Run tests**

Run:

```bash
npm test -- --run test/curiosity.test.ts test/gaokaoQuestions.test.ts test/appPracticeModes.test.ts
```

Expected: PASS.

- [ ] **Step 11: Commit advanced page**

Run:

```bash
git add src/app.ts src/styles.css test/appPracticeModes.test.ts
git commit -m "feat: add advanced gaokao evidence mode"
```

---

### Task 9: Full Verification, Browser Checks, and Deployment

**Files:**
- No source files unless verification exposes a defect.

- [ ] **Step 1: Run all automated tests**

Run:

```bash
npm test -- --run
```

Expected: all test files pass.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: TypeScript passes and Vite builds `dist`.

- [ ] **Step 3: Run secret scan**

Run:

```bash
rg -n --hidden --glob '!node_modules/**' --glob '!dist/**' --glob '!output/**' --glob '!.git/**' --glob '!.vercel/**' --glob '!.env*' '(^|[^A-Za-z0-9_])sk-[A-Za-z0-9_-]{20,}' . || true
```

Expected: no output.

- [ ] **Step 4: Browser check desktop**

Open the local app and verify:

- `今日追问` appears and `换一个` cycles text.
- Method page shows `破案路线图`; clicking route nodes changes detail content.
- Unsaturation page shows prediction options and feedback.
- Reagent page shows `先预测现象`.
- Pair page shows role selectors for both molecules.
- Advanced page shows `高考题库`, `3D 模型`, locked text `答对后揭晓三维结构`, and `证据板`.
- Advanced page starts without quick question buttons.
- Correct advanced guess unlocks a 3D model.

- [ ] **Step 5: Browser check mobile**

Set viewport to 390px width and verify:

- No horizontal overflow on method, unsaturation, reagent, pair, or advanced mode.
- Prediction grids stack cleanly.
- Evidence board remains readable.

- [ ] **Step 6: Commit any verification fixes**

If verification required source changes, run:

```bash
git add src test
git commit -m "fix: polish curiosity learning layer"
```

If no changes were required, skip this step.

- [ ] **Step 7: Push to GitHub**

Run:

```bash
git push origin main
```

Expected: `main -> main`.

- [ ] **Step 8: Watch GitHub Pages**

Run:

```bash
gh run list --repo 77zmf/organic-structure-miniapp --branch main --limit 1
RUN_ID=$(gh run list --repo 77zmf/organic-structure-miniapp --branch main --limit 1 --json databaseId --jq '.[0].databaseId')
gh run watch "$RUN_ID" --repo 77zmf/organic-structure-miniapp --exit-status
```

Expected: deploy workflow completes successfully.

- [ ] **Step 9: Deploy Vercel**

Run:

```bash
npx vercel build --prod --yes
npx vercel deploy --prebuilt --prod --yes
```

Expected: production deployment is `READY` and aliased to `https://organic-structure-miniapp.vercel.app`.

- [ ] **Step 10: Verify production bundles**

Run:

```bash
node - <<'NODE'
const urls = [
  'https://77zmf.github.io/organic-structure-miniapp/',
  'https://organic-structure-miniapp.vercel.app/'
];
for (const url of urls) {
  const html = await fetch(url, { cache: 'no-store' }).then((res) => res.text());
  const scriptMatch = html.match(/<script[^>]+src="([^"]+)"/);
  if (!scriptMatch) throw new Error(`Missing script for ${url}`);
  const scriptUrl = new URL(scriptMatch[1], url).href;
  const js = await fetch(scriptUrl, { cache: 'no-store' }).then((res) => res.text());
  const checks = ['今日追问', '先预测现象', '高考题库', '3D 模型', '证据板'];
  const missing = checks.filter((item) => !js.includes(item));
  console.log(JSON.stringify({ url, missing, ok: missing.length === 0 }, null, 2));
  if (missing.length) process.exitCode = 1;
}
NODE
```

Expected: both production URLs report `"ok": true`.

---

## Self-Review Notes

- Spec coverage: this plan covers global curiosity bar, method route map, unsaturation prediction, reagent phenomenon prediction, pair reaction roles, advanced Gaokao question bank, locked 3D reveal, evidence board, tests, browser checks, and deployment.
- Type consistency: state fields are named `curiosityQuestionIndex`, `selectedMethodNodeId`, `unsaturationPredictions`, `reagentPhenomenonGuess`, `pairFirstRoleGuess`, `pairSecondRoleGuess`, `selectedGaokaoQuestionId`, and `evidenceNotes`.
- Scope boundary: no accounts, rankings, backend database, or answer-revealing advanced hints are included.
