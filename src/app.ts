import {
  Beaker,
  Brain,
  Calculator,
  CheckCircle2,
  FlaskConical,
  GitBranch,
  Map as MapIcon,
  RefreshCw,
  Send,
  Shuffle,
  Sparkles,
  XCircle,
  createIcons
} from 'lucide';
import './styles.css';
import {
  type Compound,
  type FormulaPuzzle,
  type FunctionalGroup,
  type AgentReply,
  answerFormulaPuzzle,
  askAgent,
  calculateUnsaturationIndex,
  compounds,
  findCompoundById,
  findPuzzleById,
  findReagentById,
  formulaPuzzles,
  getOrganicPairReaction,
  getReagentReaction,
  reagents
} from './chemistry';
import { formatChemicalFormula, formatChemistryText } from './formatChemistry';
import { gaokaoQuestions, type GaokaoQuestion } from './gaokaoQuestions';
import { getMoleculeModel, type DisplayMode, type MoleculeModel } from './moleculeModels';
import { createMoleculeViewer, type MoleculeViewer } from './moleculeViewer';
import { createRandomPairQuestion, selectPairCompound, type PairSide } from './pairPractice';
import { createPuzzleUnlockState, updatePuzzleUnlockWithGuess } from './puzzleUnlock';
import { resolveInitialProxyUrl } from './proxyConfig';
import { sanitizeAgentAnswer } from '../shared/deepseekProxy';
import {
  advanceChallenge,
  createChallengeSession,
  evaluateChallengeAnswer,
  getCurrentChallengeQuestion,
  selectSelfTestCompound,
  type ChallengeSession,
  type ReagentPracticeMode
} from './reagentPractice';
import {
  curiosityQuestions,
  getExpectedPhenomena,
  getPairRoleForCompound,
  getUnsaturationPredictionFeedback,
  methodNodeDetails,
  pairRoleLabel,
  pairRoleOptions,
  phenomenonOptions,
  type PairRoleId,
  type PhenomenonId,
  type UnsaturationPredictionId,
  unsaturationPredictionOptions,
  createEvidenceNoteFromAgentReply,
  type EvidenceNote
} from './curiosity';

type Mode = 'method' | 'unsaturation' | 'reagent' | 'pair' | 'puzzle';
type YesNo = 'yes' | 'no' | null;
type PairRoleSide = 'left' | 'right';

interface ChatMessage {
  role: 'student' | 'agent';
  text: string;
}

interface AgentAnswerResult {
  answer: string;
  evidenceNote?: EvidenceNote;
  proxyStatus?: string;
}

interface PairRolePredictions {
  left: PairRoleId | null;
  right: PairRoleId | null;
}

interface AppState {
  mode: Mode;
  reagentPracticeMode: ReagentPracticeMode;
  reagentChallengeSession: ChallengeSession;
  reagentCompoundId: string;
  reagentId: string;
  reagentAnswer: YesNo;
  reagentFeedback: string;
  phenomenonPrediction: PhenomenonId | null;
  pairFirstId: string;
  pairSecondId: string;
  pairAnswer: YesNo;
  pairTypeGuess: string;
  pairFeedback: string;
  pairRolePredictions: PairRolePredictions;
  puzzleId: string;
  selectedGaokaoQuestionId: string;
  evidenceNotes: EvidenceNote[];
  puzzleUnlocked: boolean;
  puzzleUnlockedCompoundId: string | null;
  unsaturationFormula: string;
  unsaturationPredictions: UnsaturationPredictionId[];
  viewerDisplayMode: DisplayMode;
  highlightFunctionalGroup: boolean;
  proxyUrl: string;
  chatInput: string;
  chatMessages: ChatMessage[];
  structureGuess: string;
  puzzleFeedback: string;
  proxyStatus: string;
  chatPending: boolean;
  proxyCheckPending: boolean;
  curiosityQuestionIndex: number;
  selectedMethodNodeId: string;
}

const appRoot = getAppRoot();
let chatRequestId = 0;
const mountedMoleculeViewers: MoleculeViewer[] = [];
const defaultGaokaoQuestion = getDefaultGaokaoQuestion();
const initialPuzzleUnlock = createPuzzleUnlockState(defaultGaokaoQuestion.puzzleId);
const challengeCompoundIds = compounds.map((compound) => compound.id);
const challengeReagentIds = reagents.map((reagent) => reagent.id);
const pairCompoundIds = compounds.map((compound) => compound.id);
const unsaturationFormulaOptions = uniqueStrings([
  ...formulaPuzzles.map((puzzle) => puzzle.formula),
  ...compounds.map((compound) => compound.formula)
]);

const state: AppState = {
  mode: 'reagent',
  reagentPracticeMode: 'self-test',
  reagentChallengeSession: createReagentChallengeSession(),
  reagentCompoundId: 'ethene',
  reagentId: 'bromine-ccl4',
  reagentAnswer: null,
  reagentFeedback: '',
  phenomenonPrediction: null,
  pairFirstId: 'ethanol',
  pairSecondId: 'acetic-acid',
  pairAnswer: null,
  pairTypeGuess: '',
  pairFeedback: '',
  pairRolePredictions: { left: null, right: null },
  puzzleId: initialPuzzleUnlock.puzzleId,
  selectedGaokaoQuestionId: defaultGaokaoQuestion.id,
  evidenceNotes: [],
  puzzleUnlocked: initialPuzzleUnlock.unlocked,
  puzzleUnlockedCompoundId: initialPuzzleUnlock.unlockedCompoundId,
  unsaturationFormula: 'C6H6',
  unsaturationPredictions: ['benzene-ring'],
  viewerDisplayMode: 'ball-stick',
  highlightFunctionalGroup: true,
  proxyUrl: getInitialProxyUrl(),
  chatInput: '',
  chatMessages: [],
  structureGuess: '',
  puzzleFeedback: '',
  proxyStatus: '',
  chatPending: false,
  proxyCheckPending: false,
  curiosityQuestionIndex: 0,
  selectedMethodNodeId: 'unsaturation'
};

render();

function getAppRoot(): HTMLDivElement {
  const root = document.querySelector<HTMLDivElement>('#app');
  if (!root) {
    throw new Error('Missing #app container');
  }
  return root;
}

function render(): void {
  disposeMountedMoleculeViewers();

  appRoot.innerHTML = `
    <main class="app-shell">
      <header class="topbar">
        <div>
          <p class="eyebrow">高中化学 · 有机物结构测定</p>
          <h1>官能团推理练习台</h1>
        </div>
        <a class="github-link" href="https://github.com/77zmf/organic-structure-miniapp" target="_blank" rel="noreferrer">
          <i data-lucide="git-branch" aria-hidden="true"></i>
          GitHub
        </a>
      </header>

      <nav class="mode-tabs" aria-label="学习模式">
        ${modeButton('method', '方法', '结构测定路径', 'map')}
        ${modeButton('unsaturation', '不饱和', '公式计算', 'calculator')}
        ${modeButton('reagent', '基础', '试剂反应', 'beaker')}
        ${modeButton('pair', '进阶', '有机物间反应', 'flask-conical')}
        ${modeButton('puzzle', '高阶', '分子式推理', 'brain')}
      </nav>

      ${renderCuriosityBar()}

      ${state.mode === 'method' || state.mode === 'unsaturation' ? '' : renderViewerControls()}

      ${state.mode === 'method' ? renderMethodMode() : ''}
      ${state.mode === 'unsaturation' ? renderUnsaturationMode() : ''}
      ${state.mode === 'reagent' ? renderReagentMode() : ''}
      ${state.mode === 'pair' ? renderPairMode() : ''}
      ${state.mode === 'puzzle' ? renderPuzzleMode() : ''}
    </main>
  `;

  bindEvents();
  createIcons({
    icons: {
      Beaker,
      Brain,
      Calculator,
      CheckCircle2,
      FlaskConical,
      GitBranch,
      Map: MapIcon,
      RefreshCw,
      Send,
      Shuffle,
      Sparkles,
      XCircle
    }
  });
  mountMoleculeViewers();
}

function modeButton(mode: Mode, label: string, detail: string, icon: string): string {
  const isActive = state.mode === mode;
  const active = isActive ? 'active' : '';
  return `
    <button class="mode-tab ${active}" data-mode="${mode}" type="button" aria-pressed="${isActive}">
      <i data-lucide="${icon}" aria-hidden="true"></i>
      <span>${label}</span>
      <small>${detail}</small>
    </button>
  `;
}

function renderCuriosityBar(): string {
  if (curiosityQuestions.length === 0) {
    return '';
  }

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

function renderViewerControls(): string {
  return `
    <section class="viewer-controls" aria-label="三维模型显示设置">
      <div class="viewer-control-group">
        <span class="viewer-control-label">3D 显示</span>
        <div class="segmented-control" role="group" aria-label="模型显示方式">
          ${viewerModeButton('ball-stick', '球棍')}
          ${viewerModeButton('space-fill', '空间填充')}
        </div>
      </div>
      <button class="toggle-button ${state.highlightFunctionalGroup ? 'active' : ''}" data-toggle-highlight="functional-group" type="button" aria-pressed="${state.highlightFunctionalGroup}">
        官能团高亮
      </button>
    </section>
  `;
}

function viewerModeButton(displayMode: DisplayMode, label: string): string {
  const active = state.viewerDisplayMode === displayMode;
  return `
    <button class="segment-button ${active ? 'active' : ''}" data-viewer-display-mode="${displayMode}" type="button" aria-pressed="${active}">
      ${label}
    </button>
  `;
}

function renderMethodMode(): string {
  return `
    <section class="workspace method-layout" aria-label="方法指引">
      <section class="method-panel">
        <div class="method-hero">
          <p class="section-kicker">方法指引</p>
          <h2>破案路线图</h2>
        </div>

        <div class="guide-grid">
          <article class="guide-card">
            <h3>测定有机化合物结构流程</h3>
            <div class="flow-board structure-flow" aria-label="测定有机化合物结构流程示意">
              <div class="flow-node main-node">有机化合物</div>
              <div class="flow-lane three-lane">
                <div>
                  <span class="flow-tag">定性定量分析</span>
                  <div class="flow-arrow">↓</div>
                  ${renderMethodNode('composition', '元素组成')}
                </div>
                <div>
                  <span class="flow-tag">相对分子质量测定</span>
                  <div class="flow-arrow">↓</div>
                  ${renderMethodNode('mass', '相对分子质量')}
                </div>
                <div>
                  <span class="flow-tag">化学分析或仪器分析</span>
                  <div class="flow-arrow">↓</div>
                  <div class="flow-node">官能团及碳骨架状况</div>
                </div>
              </div>
              <div class="flow-merge">
                <div>
                  <div class="flow-arrow">↓</div>
                  <div class="flow-node">分子式</div>
                </div>
                <div>
                  <div class="flow-arrow">↓</div>
                  <div class="flow-node">分子结构</div>
                </div>
              </div>
            </div>
          </article>

          <article class="guide-card">
            <h3>确定有机化合物结构式流程</h3>
            <div class="flow-board formula-flow" aria-label="确定有机化合物结构式流程示意">
              <div class="flow-node main-node">有机化合物分子式</div>
              <div class="flow-lane two-lane">
                <div>
                  ${renderMethodNode('unsaturation', '计算不饱和度')}
                  <div class="flow-arrow">↓</div>
                  <div class="flow-node">推测化学键类型</div>
                </div>
                <div>
                  <span class="flow-tag">化学性质实验或仪器分析图谱</span>
                  <div class="flow-arrow">↓</div>
                  ${renderMethodNode('functional-group', '判断官能团种类及官能团所处位置')}
                </div>
              </div>
              <div class="flow-arrow">↓</div>
              ${renderMethodNode('structure', '确定有机化合物结构式', 'final-node')}
            </div>
          </article>
        </div>
        ${renderMethodDetailPanel()}
      </section>
    </section>
  `;
}

function renderMethodNode(id: string, label: string, className = ''): string {
  const active = state.selectedMethodNodeId === id;
  return `
    <button class="flow-node ${className} ${active ? 'active' : ''}" data-method-node="${id}" type="button" aria-pressed="${active}">
      ${escapeHtml(label)}
    </button>
  `;
}

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

function renderUnsaturationMode(): string {
  const formula = state.unsaturationFormula;
  const index = calculateUnsaturationIndex(formula);
  const formattedFormula = formatChemicalFormula(formula);
  const relatedCompounds = compounds.filter((compound) => compound.formula === formula);

  return `
    <section class="workspace unsaturation-layout" aria-label="不饱和度计算">
      <section class="unsaturation-panel">
        <div class="panel-title-row">
          <div>
            <p class="section-kicker">不饱和度</p>
            <h2>不饱和度计算</h2>
          </div>
          <label class="select-control compact-select">
            <span>选择分子式</span>
            <select data-input="unsaturation-formula" aria-label="选择分子式">
              ${unsaturationFormulaOptions
                .map(
                  (item) => `
                    <option value="${escapeHtml(item)}" ${item === formula ? 'selected' : ''}>
                      ${item}
                    </option>
                  `
                )
                .join('')}
            </select>
          </label>
        </div>

        ${renderUnsaturationPredictions(index)}

        <div class="unsaturation-result">
          <span class="chem-formula">${formattedFormula}</span>
          <strong>不饱和度为 ${formatIndex(index)}</strong>
          <p>${unsaturationInterpretation(index)}</p>
        </div>

        <div class="unsaturation-grid">
          <article>
            <h3>高中常用公式</h3>
            <p>对只含 C、H、O 的有机物：Ω = C + 1 - H / 2；卤素按氢处理，氮原子按 +N / 2 修正。</p>
          </article>
          <article>
            <h3>结构贡献</h3>
            <p>C=C、C=O 或一个环贡献 1；C≡C 贡献 2；苯环整体贡献 4。</p>
          </article>
          <article>
            <h3>推理边界</h3>
            <p>不饱和度只能缩小范围，不能单独确定官能团，需要再结合溴水、高锰酸钾、银镜、钠等实验性质。</p>
          </article>
        </div>

        ${
          relatedCompounds.length
            ? `
              <section class="related-formula-list" aria-label="同分子式示例">
                <h3>题库中的同分子式示例</h3>
                <div>
                  ${relatedCompounds
                    .map(
                      (compound) => `
                        <span>${compound.name} · <span class="chem-formula">${formatChemicalFormula(compound.structureFormula)}</span></span>
                      `
                    )
                    .join('')}
                </div>
              </section>
            `
            : ''
        }
      </section>
    </section>
  `;
}

function renderUnsaturationPredictions(index: number): string {
  const feedback = getUnsaturationPredictionFeedback(
    state.unsaturationFormula,
    index,
    state.unsaturationPredictions
  );

  return `
    <section class="prediction-panel" aria-label="先猜结构可能性">
      <div class="prediction-title-row">
        <p class="section-kicker">先猜结构可能性</p>
        <h3>先猜结构可能性</h3>
      </div>
      <div class="prediction-grid">
        ${unsaturationPredictionOptions
          .map((option) => {
            const selected = state.unsaturationPredictions.includes(option.id);
            return `
              <button class="choice-chip${selected ? ' selected' : ''}" data-unsaturation-prediction="${option.id}" type="button" aria-pressed="${selected}">
                <span>${escapeHtml(option.label)}</span>
                <small>${escapeHtml(option.detail)}</small>
              </button>
            `;
          })
          .join('')}
      </div>
      <p class="prediction-feedback">${formatChemistryText(feedback)}</p>
    </section>
  `;
}

interface MoleculeViewerMountSpec {
  compoundId: string;
  displayMode: DisplayMode;
  highlightId: FunctionalGroup | null;
}

export function getMoleculeViewerMountSpec(
  compoundId: string,
  displayMode: DisplayMode,
  highlightEnabled: boolean
): MoleculeViewerMountSpec {
  const model = getMoleculeModel(compoundId);
  return {
    compoundId: model.compoundId,
    displayMode,
    highlightId: highlightEnabled ? getPrimaryHighlightId(model) : null
  };
}

function getPrimaryHighlightId(model: MoleculeModel): FunctionalGroup | null {
  const compound = findCompoundById(model.compoundId);
  for (const group of compound.functionalGroups) {
    const highlight = model.highlights.find((item) => item.id === group);
    if (highlight) {
      return highlight.id;
    }
  }
  return model.highlights[0]?.id ?? null;
}

export function getPuzzleMoleculeViewerMountSpec(
  unlocked: boolean,
  unlockedCompoundId: string | null,
  displayMode: DisplayMode,
  highlightEnabled: boolean
): MoleculeViewerMountSpec | null {
  if (!unlocked || !unlockedCompoundId) {
    return null;
  }
  return getMoleculeViewerMountSpec(unlockedCompoundId, displayMode, highlightEnabled);
}

function mountMoleculeViewers(): void {
  appRoot.querySelectorAll<HTMLElement>('[data-molecule-viewer]').forEach((container) => {
    const compoundId = container.dataset.compoundId;
    if (!compoundId) {
      return;
    }

    try {
      const spec = getMoleculeViewerMountSpec(compoundId, state.viewerDisplayMode, state.highlightFunctionalGroup);
      const viewer = createMoleculeViewer(container, getMoleculeModel(spec.compoundId), {
        displayMode: spec.displayMode,
        highlightId: spec.highlightId
      });
      mountedMoleculeViewers.push(viewer);
    } catch {
      renderMoleculeViewerFallback(container);
    }
  });
}

function disposeMountedMoleculeViewers(): void {
  while (mountedMoleculeViewers.length > 0) {
    mountedMoleculeViewers.pop()?.dispose();
  }
}

function renderMoleculeViewerFallback(container: HTMLElement): void {
  container.classList.add('molecule-viewer-fallback');
  container.innerHTML = `
    <div class="viewer-fallback-content">
      <strong>3D 模型暂不可用</strong>
      <span>当前设备未能初始化 WebGL，可继续完成反应判断与推理。</span>
    </div>
  `;
}

function renderReagentMode(): string {
  const compound = findCompoundById(state.reagentCompoundId);
  const reagent = findReagentById(state.reagentId);
  const isChallenge = state.reagentPracticeMode === 'challenge';
  const challengeComplete = isChallenge && state.reagentChallengeSession.completed;
  const challengePassed = isChallenge && state.reagentChallengeSession.canAdvance;

  return `
    <section class="workspace two-column" aria-label="基础试剂反应判断">
      ${renderReagentCompoundPanel(compound)}
      <section class="task-panel">
        <div class="panel-title-row">
          <div>
            <p class="section-kicker">基础判断</p>
            <h2>${isChallenge ? challengeTitle() : `${compound.name} 与试剂`}</h2>
          </div>
          <button class="icon-text-button" data-action="${isChallenge ? 'restart-reagent-challenge' : 'new-reagent'}" type="button">
            <i data-lucide="shuffle" aria-hidden="true"></i>
            ${isChallenge ? '重开挑战' : '随机一题'}
          </button>
        </div>

        ${renderReagentPracticeSwitch()}
        ${isChallenge ? renderChallengeStatus() : ''}

        ${
          challengeComplete
            ? renderChallengeComplete()
            : `
              <div class="selector-grid">
                ${reagents
                  .map(
                    (item) => `
                      <button class="choice-chip ${item.id === state.reagentId ? 'selected' : ''}" data-reagent="${item.id}" type="button" aria-pressed="${item.id === state.reagentId}" ${isChallenge ? 'disabled' : ''}>
                        <span>${item.name}</span>
                        <small>${item.prompt}</small>
                      </button>
                    `
                  )
                  .join('')}
              </div>

              ${renderPhenomenonPredictionPanel(challengePassed)}

              <div class="answer-row" aria-label="反应判断">
                <button class="judge-button ${state.reagentAnswer === 'yes' ? 'selected yes' : ''}" data-answer="yes" type="button" aria-pressed="${state.reagentAnswer === 'yes'}" ${challengePassed ? 'disabled' : ''}>
                  会反应
                </button>
                <button class="judge-button ${state.reagentAnswer === 'no' ? 'selected no' : ''}" data-answer="no" type="button" aria-pressed="${state.reagentAnswer === 'no'}" ${challengePassed ? 'disabled' : ''}>
                  不反应
                </button>
              </div>

              <button class="primary-action" data-action="submit-reagent" type="button" ${challengePassed ? 'disabled' : ''}>
                <i data-lucide="check-circle-2" aria-hidden="true"></i>
                提交判断：${reagent.name}
              </button>
            `
        }

        ${feedbackBlock(state.reagentFeedback)}
        ${renderChallengeAdvanceAction()}
      </section>
    </section>
  `;
}

function renderPhenomenonPredictionPanel(disabled: boolean): string {
  return `
    <section class="prediction-panel" aria-label="先预测实验现象">
      <div class="prediction-title-row">
        <p class="section-kicker">实验现象</p>
        <h3>先预测现象</h3>
      </div>
      <div class="prediction-grid">
        ${phenomenonOptions
          .map((option) => {
            const selected = state.phenomenonPrediction === option.id;
            const className = selected ? 'choice-chip selected' : 'choice-chip';
            return `
              <button class="${className}" data-phenomenon="${option.id}" type="button" aria-pressed="${selected}" ${disabled ? 'disabled' : ''}>
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

function renderPairMode(): string {
  const first = findCompoundById(state.pairFirstId);
  const second = findCompoundById(state.pairSecondId);

  return `
    <section class="workspace two-column pair-layout" aria-label="进阶有机物间反应判断">
      <section class="compound-pair">
        ${renderSelectablePairCompound(first, 'first', '选择左侧分子')}
        <div class="reaction-mark">+</div>
        ${renderSelectablePairCompound(second, 'second', '选择右侧分子')}
      </section>

      <section class="task-panel">
        <div class="panel-title-row">
          <div>
            <p class="section-kicker">进阶判断</p>
            <h2>${first.name} 与 ${second.name}</h2>
          </div>
          <button class="icon-text-button" data-action="new-pair" type="button">
            <i data-lucide="refresh-cw" aria-hidden="true"></i>
            随机一组
          </button>
        </div>

        ${renderPairRolePredictionPanel()}

        <div class="answer-row" aria-label="有机物间反应判断">
          <button class="judge-button ${state.pairAnswer === 'yes' ? 'selected yes' : ''}" data-pair-answer="yes" type="button" aria-pressed="${state.pairAnswer === 'yes'}">
            能反应
          </button>
          <button class="judge-button ${state.pairAnswer === 'no' ? 'selected no' : ''}" data-pair-answer="no" type="button" aria-pressed="${state.pairAnswer === 'no'}">
            不反应
          </button>
        </div>

        <label class="input-label" for="pair-type">反应类型</label>
        <input id="pair-type" class="text-input" value="${escapeHtml(state.pairTypeGuess)}" data-input="pair-type" placeholder="例如：酯化反应" />

        <button class="primary-action" data-action="submit-pair" type="button">
          <i data-lucide="check-circle-2" aria-hidden="true"></i>
          提交进阶判断
        </button>

        ${feedbackBlock(state.pairFeedback)}
      </section>
    </section>
  `;
}

function renderPairRolePredictionPanel(): string {
  return `
    <section class="prediction-panel" aria-label="先判断反应角色">
      <div class="prediction-title-row">
        <p class="section-kicker">反应角色</p>
        <h3>先判断反应角色</h3>
      </div>
      <div class="pair-role-grid">
        ${renderPairRoleGroup('left', '左侧分子')}
        ${renderPairRoleGroup('right', '右侧分子')}
      </div>
    </section>
  `;
}

function renderPairRoleGroup(side: PairRoleSide, label: string): string {
  return `
    <div class="pair-role-group">
      <span class="pair-role-group-label">${label}</span>
      <div class="prediction-grid">
        ${pairRoleOptions
          .map((option) => {
            const selected = state.pairRolePredictions[side] === option.id;
            const className = selected ? 'choice-chip selected' : 'choice-chip';
            return `
              <button class="${className}" data-pair-role="${side}:${option.id}" type="button" aria-pressed="${selected}">
                <span>${escapeHtml(option.label)}</span>
                <small>${escapeHtml(option.detail)}</small>
              </button>
            `;
          })
          .join('')}
      </div>
    </div>
  `;
}

function renderPuzzleMode(): string {
  const puzzle = findPuzzleById(state.puzzleId);
  const gaokaoQuestion = getSelectedGaokaoQuestion();
  const formattedFormula = formatChemicalFormula(puzzle.formula);

  return `
    <section class="workspace puzzle-layout" aria-label="高阶分子式结构推理">
      <section class="formula-panel">
        <div class="panel-title-row">
          <div>
            <p class="section-kicker">高阶推理</p>
            <h2>分子式 <span class="chem-formula">${formattedFormula}</span></h2>
          </div>
          <button class="icon-text-button" data-action="new-puzzle" type="button">
            <i data-lucide="sparkles" aria-hidden="true"></i>
            新题
          </button>
        </div>
        ${renderGaokaoQuestionPanel(gaokaoQuestion)}
        <div class="formula-display chem-formula">${formattedFormula}</div>
        <div class="puzzle-public-grid">
          ${renderPuzzleVisualization(puzzle)}
          ${renderEvidenceBoard()}
        </div>
        <div class="answer-strip">
          <label class="input-label" for="structure-guess">结构猜测</label>
          <div class="inline-form">
            <input id="structure-guess" class="text-input" value="${escapeHtml(state.structureGuess)}" data-input="structure-guess" placeholder="输入名称或结构简式" />
            <button class="primary-action compact" data-action="submit-guess" type="button">提交</button>
          </div>
        </div>
        ${feedbackBlock(state.puzzleFeedback)}
      </section>

      <section class="chat-panel">
        <div class="panel-title-row">
          <div>
            <p class="section-kicker">AI 推理助手</p>
            <h2>实验性质问答</h2>
          </div>
          <button class="icon-text-button" data-action="check-proxy" type="button" ${state.proxyCheckPending ? 'disabled' : ''}>
            ${state.proxyCheckPending ? '检测中' : '测试连接'}
          </button>
        </div>
        <div class="proxy-config-row">
          <label class="input-label" for="proxy-url">DeepSeek 代理 URL</label>
          <input id="proxy-url" class="text-input" value="${escapeHtml(state.proxyUrl)}" data-input="proxy-url" placeholder="例如：https://your-app.vercel.app/api/deepseek；留空则使用规则助手" />
        </div>
        <p class="proxy-status">${proxyStatusText()}</p>
        <div class="chat-log" aria-live="polite">
          ${state.chatMessages
            .map(
              (message) => `
                <div class="chat-message ${message.role}">
                  <span>${message.role === 'agent' ? 'AI' : '我'}</span>
                  <p>${formatChemistryText(message.text)}</p>
                </div>
              `
            )
            .join('')}
        </div>
        <div class="chat-input-row">
          <input class="text-input" value="${escapeHtml(state.chatInput)}" data-input="chat" placeholder="输入一个实验性质问题" ${state.chatPending ? 'disabled' : ''} />
          <button class="send-button" data-action="send-chat" type="button" aria-label="发送问题" ${state.chatPending ? 'disabled' : ''}>
            <i data-lucide="send" aria-hidden="true"></i>
          </button>
        </div>
      </section>
    </section>
  `;
}

function renderGaokaoQuestionPanel(question: GaokaoQuestion): string {
  return `
    <section class="gaokao-panel" aria-label="高考题库">
      <div class="panel-title-row">
        <div>
          <p class="section-kicker">高考题库</p>
          <h3>${escapeHtml(question.title)}</h3>
        </div>
        <button class="icon-text-button" data-action="random-gaokao-question" type="button">
          <i data-lucide="shuffle" aria-hidden="true"></i>
          随机题
        </button>
      </div>
      <label class="select-control compact-select">
        <span>选择高考题</span>
        <select data-input="gaokao-question" aria-label="选择高考题">
          ${gaokaoQuestions
            .map(
              (item) => `
                <option value="${escapeHtml(item.id)}"${item.id === question.id ? ' selected' : ''}>
                  ${escapeHtml(item.title)}
                </option>
              `
            )
            .join('')}
        </select>
      </label>
      <dl class="gaokao-facts">
        <div><dt>分子式</dt><dd class="chem-formula">${formatChemicalFormula(question.formula)}</dd></div>
        <div><dt>考查重点</dt><dd>${question.examFocus.map((item) => escapeHtml(item)).join('、')}</dd></div>
        <div><dt>任务</dt><dd>${formatChemistryText(question.task)}</dd></div>
        <div><dt>公开线索</dt><dd>${question.publicClues.map((item) => formatChemistryText(item)).join('；')}</dd></div>
      </dl>
    </section>
  `;
}

function quickQuestion(text: string): string {
  const safeText = escapeHtml(text);
  return `<button class="quick-question" data-question="${safeText}" type="button" ${state.chatPending ? 'disabled' : ''}>${formatChemistryText(text)}</button>`;
}

function renderQuickQuestions(puzzle: FormulaPuzzle): string {
  const evidenceQuestions = puzzle.evidenceCards?.length
    ? [
        '不饱和度是多少？',
        '红外光谱有什么线索？',
        '核磁共振氢谱有几组峰？',
        '这题的高考考点是什么？'
      ]
    : [];
  const hasMassEvidence = puzzle.evidenceCards?.some((card) => /质谱|相对分子质量/.test(card.title + card.detail));
  const questions = [
    ...evidenceQuestions,
    ...(hasMassEvidence ? ['质谱或相对分子质量说明什么？'] : []),
    '能否与溴的四氯化碳溶液反应？',
    '能否与金属钠反应？',
    '能否发生银镜反应？',
    '能否与碳酸氢钠反应放出 CO2？',
    '能否与三氯化铁显紫色？'
  ];

  return `
    <div class="quick-questions">
      ${questions.map((question) => quickQuestion(question)).join('')}
    </div>
  `;
}

function renderPuzzleEvidence(puzzle: FormulaPuzzle): string {
  const evidenceCards = puzzle.evidenceCards ?? [];
  const examFocus = puzzle.examFocus ?? [];

  if (evidenceCards.length === 0 && examFocus.length === 0) {
    return '';
  }

  return `
    <section class="puzzle-evidence" aria-label="教材与高考推理线索">
      ${
        evidenceCards.length
          ? `
            <div class="puzzle-evidence-block">
              <h3>教材谱图线索</h3>
              <div class="evidence-card-grid">
                ${evidenceCards
                  .map(
                    (card) => `
                      <article class="evidence-card">
                        <strong>${escapeHtml(card.title)}</strong>
                        <p>${formatChemistryText(card.detail)}</p>
                        <small>${formatChemistryText(card.inference)}</small>
                      </article>
                    `
                  )
                  .join('')}
              </div>
            </div>
          `
          : ''
      }
      ${
        examFocus.length
          ? `
            <div class="puzzle-evidence-block">
              <h3>高考拆题点</h3>
              <div class="exam-focus-list">
                ${examFocus.map((item) => `<span>${escapeHtml(item)}</span>`).join('')}
              </div>
            </div>
          `
          : ''
      }
    </section>
  `;
}

function renderReagentCompoundPanel(compound: Compound): string {
  return `
    <section class="compound-panel">
      <div class="compound-heading-row">
        <div>
          <p class="section-kicker">当前有机物</p>
          <h2>${compound.name}</h2>
        </div>
        ${
          state.reagentPracticeMode === 'self-test'
            ? `
              <label class="select-control">
                <span>选择有机物</span>
                <select data-input="self-test-compound" aria-label="选择有机物">
                  ${compounds
                    .map(
                      (item) => `
                        <option value="${item.id}" ${item.id === compound.id ? 'selected' : ''}>
                          ${item.name}
                        </option>
                      `
                    )
                    .join('')}
                </select>
              </label>
            `
            : ''
        }
      </div>
      ${renderMoleculeViewerHost(compound.id, `${compound.name}三维结构`)}
      <dl class="compound-facts">
        <div><dt>分子式</dt><dd class="chem-formula">${formatChemicalFormula(compound.formula)}</dd></div>
        <div><dt>结构简式</dt><dd class="chem-formula">${formatChemicalFormula(compound.structureFormula)}</dd></div>
        <div><dt>官能团</dt><dd>${functionalGroupLabels(compound).join('、')}</dd></div>
      </dl>
      <p class="compound-summary">${formatChemistryText(compound.summary)}</p>
    </section>
  `;
}

function renderReagentPracticeSwitch(): string {
  return `
    <div class="practice-switch" role="group" aria-label="基础练习方式">
      ${reagentPracticeModeButton('self-test', '自测模式', '手动选择分子')}
      ${reagentPracticeModeButton('challenge', '挑战闯关', '随机题库推进')}
    </div>
  `;
}

function reagentPracticeModeButton(mode: ReagentPracticeMode, title: string, description: string): string {
  const active = state.reagentPracticeMode === mode;
  return `
    <button class="practice-mode-button ${active ? 'active' : ''}" data-reagent-practice-mode="${mode}" type="button" aria-pressed="${active}">
      <span>${title}</span>
      <small>${description}</small>
    </button>
  `;
}

function challengeTitle(): string {
  if (state.reagentChallengeSession.completed) {
    return '挑战完成';
  }
  return `第 ${state.reagentChallengeSession.currentIndex + 1} 关 · ${findCompoundById(state.reagentCompoundId).name} 与试剂`;
}

function renderChallengeStatus(): string {
  const session = state.reagentChallengeSession;
  const total = session.questions.length;
  const level = session.completed ? total : session.currentIndex + 1;
  const progress = total === 0 ? 0 : Math.round((session.score / total) * 100);

  return `
    <section class="challenge-status" aria-label="挑战闯关进度">
      <div>
        <span>关卡</span>
        <strong>${level}/${total}</strong>
      </div>
      <div>
        <span>得分</span>
        <strong>${session.score}</strong>
      </div>
      <div class="challenge-progress" aria-hidden="true">
        <span style="width: ${progress}%"></span>
      </div>
    </section>
  `;
}

function renderChallengeComplete(): string {
  const session = state.reagentChallengeSession;
  return `
    <section class="challenge-complete">
      <strong>本轮挑战完成</strong>
      <p>你已通过 ${session.score}/${session.questions.length} 关。可以重开一轮随机题库继续练习。</p>
      <button class="primary-action compact" data-action="restart-reagent-challenge" type="button">再来一轮</button>
    </section>
  `;
}

function renderChallengeAdvanceAction(): string {
  if (state.reagentPracticeMode !== 'challenge' || !state.reagentChallengeSession.canAdvance) {
    return '';
  }

  const isFinalLevel = state.reagentChallengeSession.currentIndex >= state.reagentChallengeSession.questions.length - 1;
  return `
    <button class="primary-action challenge-next-action" data-action="advance-reagent-challenge" type="button">
      ${isFinalLevel ? '完成挑战' : '进入下一关'}
    </button>
  `;
}

function renderCompactCompound(compound: Compound): string {
  return `
    <article class="compound-mini">
      <div>
        <p class="chem-formula">${formatChemicalFormula(compound.formula)}</p>
        <h3>${compound.name}</h3>
      </div>
      ${renderMoleculeViewerHost(compound.id, `${compound.name}三维结构`, 'compact')}
      <span class="chem-formula">${formatChemicalFormula(compound.structureFormula)}</span>
    </article>
  `;
}

function renderSelectablePairCompound(compound: Compound, side: PairSide, label: string): string {
  const otherId = side === 'first' ? state.pairSecondId : state.pairFirstId;
  return `
    <article class="compound-mini selectable-compound-mini">
      <label class="select-control pair-select-control">
        <span>${label}</span>
        <select data-input="${side === 'first' ? 'pair-first-compound' : 'pair-second-compound'}" aria-label="${label}">
          ${compounds
            .map(
              (item) => `
                <option value="${item.id}" ${item.id === compound.id ? 'selected' : ''} ${item.id === otherId ? 'disabled' : ''}>
                  ${item.name}
                </option>
              `
            )
            .join('')}
        </select>
      </label>
      <div>
        <p class="chem-formula">${formatChemicalFormula(compound.formula)}</p>
        <h3>${compound.name}</h3>
      </div>
      ${renderMoleculeViewerHost(compound.id, `${compound.name}三维结构`, 'compact')}
      <span class="chem-formula">${formatChemicalFormula(compound.structureFormula)}</span>
    </article>
  `;
}

function renderPuzzleVisualization(puzzle: FormulaPuzzle): string {
  const spec = getPuzzleMoleculeViewerMountSpec(
    state.puzzleUnlocked,
    state.puzzleUnlockedCompoundId,
    state.viewerDisplayMode,
    state.highlightFunctionalGroup
  );

  if (!spec) {
    return `
      <section class="locked-visualization" aria-label="分子式推理锁定面板">
        <span>3D 模型</span>
        <strong class="chem-formula">${formatChemicalFormula(puzzle.formula)}</strong>
        <p>答对后揭晓三维结构</p>
      </section>
    `;
  }

  const compound = findCompoundById(spec.compoundId);
  return `
    <section class="puzzle-target-panel">
      <div class="puzzle-target-title">
        <span>已解锁</span>
        <strong>${compound.name}</strong>
      </div>
      ${renderMoleculeViewerHost(compound.id, `${compound.name}三维结构`, 'puzzle-target')}
    </section>
  `;
}

function renderEvidenceBoard(): string {
  const columns: Array<{ kind: EvidenceNote['kind']; title: string }> = [
    { kind: 'verified', title: '已验证性质' },
    { kind: 'excluded', title: '排除方向' },
    { kind: 'guess', title: '当前猜想' }
  ];

  return `
    <section class="evidence-board" aria-label="证据板">
      <div class="evidence-board-title">
        <p class="section-kicker">证据板</p>
        <h3>证据板</h3>
      </div>
      <div class="evidence-column-grid">
        ${columns
          .map((column) => {
            const notes = state.evidenceNotes.filter((note) => note.kind === column.kind);
            return `
              <article class="evidence-column">
                <h4>${column.title}</h4>
                ${
                  notes.length
                    ? `<ul>${notes.map((note) => `<li>${formatChemistryText(note.text)}</li>`).join('')}</ul>`
                    : '<p>等待学生提问或提交猜想。</p>'
                }
              </article>
            `;
          })
          .join('')}
      </div>
    </section>
  `;
}

function renderMoleculeViewerHost(compoundId: string, label: string, variant = ''): string {
  return `
    <div class="molecule-viewer ${variant}" data-molecule-viewer data-compound-id="${escapeHtml(compoundId)}" role="img" aria-label="${escapeHtml(label)}"></div>
  `;
}

function functionalGroupLabels(compound: Compound): string[] {
  const labels: Record<FunctionalGroup, string> = {
    alkane: '饱和烃',
    alkene: '碳碳双键',
    alkyne: '碳碳三键',
    alcohol: '醇羟基',
    aldehyde: '醛基',
    'carboxylic-acid': '羧基',
    ester: '酯基',
    phenol: '酚羟基',
    arene: '苯环',
    ketone: '酮羰基'
  };

  return compound.functionalGroups.map((group) => labels[group]);
}

function feedbackBlock(message: string): string {
  if (!message) return '';
  const good = message.startsWith('正确') || message.startsWith('判断正确');
  return `
    <div class="feedback ${good ? 'good' : 'review'}">
      <i data-lucide="${good ? 'check-circle-2' : 'x-circle'}" aria-hidden="true"></i>
      <p>${formatChemistryText(message)}</p>
    </div>
  `;
}

function bindEvents(): void {
  appRoot.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      state.mode = button.dataset.mode as Mode;
      render();
    });
  });

  appRoot.querySelectorAll<HTMLButtonElement>('[data-viewer-display-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      state.viewerDisplayMode = button.dataset.viewerDisplayMode as DisplayMode;
      render();
    });
  });

  appRoot.querySelectorAll<HTMLButtonElement>('[data-toggle-highlight]').forEach((button) => {
    button.addEventListener('click', () => {
      state.highlightFunctionalGroup = !state.highlightFunctionalGroup;
      render();
    });
  });

  appRoot.querySelectorAll<HTMLButtonElement>('[data-reagent-practice-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      setReagentPracticeMode(button.dataset.reagentPracticeMode as ReagentPracticeMode);
    });
  });

  appRoot.querySelectorAll<HTMLButtonElement>('[data-method-node]').forEach((button) => {
    button.addEventListener('click', () => {
      const nextMethodNodeId = button.dataset.methodNode;
      if (!isMethodNodeId(nextMethodNodeId)) {
        return;
      }

      state.selectedMethodNodeId = nextMethodNodeId;
      render();
    });
  });

  appRoot.querySelectorAll<HTMLButtonElement>('[data-unsaturation-prediction]').forEach((button) => {
    button.addEventListener('click', () => {
      const prediction = button.dataset.unsaturationPrediction;
      if (!isUnsaturationPredictionId(prediction)) {
        return;
      }

      toggleUnsaturationPrediction(prediction);
    });
  });

  appRoot.querySelectorAll<HTMLButtonElement>('[data-phenomenon]').forEach((button) => {
    button.addEventListener('click', () => {
      const phenomenon = button.dataset.phenomenon;
      if (!isPhenomenonId(phenomenon)) {
        return;
      }

      state.phenomenonPrediction = phenomenon;
      state.reagentFeedback = '';
      render();
    });
  });

  appRoot.querySelectorAll<HTMLButtonElement>('[data-pair-role]').forEach((button) => {
    button.addEventListener('click', () => {
      const parsed = parsePairRoleValue(button.dataset.pairRole);
      if (!parsed) {
        return;
      }

      state.pairRolePredictions[parsed.side] = parsed.role;
      state.pairFeedback = '';
      render();
    });
  });

  appRoot.querySelectorAll<HTMLButtonElement>('[data-reagent]').forEach((button) => {
    button.addEventListener('click', () => {
      if (state.reagentPracticeMode === 'challenge') {
        return;
      }
      const nextReagentId = button.dataset.reagent;
      if (!isReagentId(nextReagentId)) {
        return;
      }
      if (nextReagentId !== state.reagentId) {
        state.phenomenonPrediction = null;
      }
      state.reagentId = nextReagentId;
      state.reagentFeedback = '';
      render();
    });
  });

  appRoot.querySelectorAll<HTMLButtonElement>('[data-answer]').forEach((button) => {
    button.addEventListener('click', () => {
      state.reagentAnswer = button.dataset.answer as YesNo;
      state.reagentFeedback = '';
      render();
    });
  });

  appRoot.querySelectorAll<HTMLButtonElement>('[data-pair-answer]').forEach((button) => {
    button.addEventListener('click', () => {
      state.pairAnswer = button.dataset.pairAnswer as YesNo;
      state.pairFeedback = '';
      render();
    });
  });

  appRoot.querySelectorAll<HTMLInputElement>('[data-input]').forEach((input) => {
    input.addEventListener('input', () => {
      const kind = input.dataset.input;
      if (kind === 'self-test-compound') {
        const next = selectSelfTestCompound(
          {
            compoundId: state.reagentCompoundId,
            reagentId: state.reagentId,
            answer: state.reagentAnswer,
            feedback: state.reagentFeedback
          },
          input.value
        );
        state.reagentCompoundId = next.compoundId;
        state.reagentId = next.reagentId;
        state.reagentAnswer = next.answer;
        state.reagentFeedback = next.feedback;
        state.phenomenonPrediction = null;
        render();
        return;
      }
      if (kind === 'pair-first-compound' || kind === 'pair-second-compound') {
        selectPair(sideFromPairInput(kind), input.value);
        return;
      }
      if (kind === 'unsaturation-formula') {
        state.unsaturationFormula = input.value;
        state.unsaturationPredictions = [];
        render();
        return;
      }
      if (kind === 'gaokao-question') {
        setGaokaoQuestion(input.value);
        return;
      }
      if (kind === 'pair-type') state.pairTypeGuess = input.value;
      if (kind === 'chat') state.chatInput = input.value;
      if (kind === 'structure-guess') state.structureGuess = input.value;
      if (kind === 'proxy-url') {
        state.proxyUrl = input.value.trim();
        localStorage.setItem('deepseekProxyUrl', state.proxyUrl);
      }
    });

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && input.dataset.input === 'chat') {
        sendChat();
      }
      if (event.key === 'Enter' && input.dataset.input === 'structure-guess') {
        submitGuess();
      }
    });
  });

  appRoot.querySelectorAll<HTMLButtonElement>('[data-question]').forEach((button) => {
    button.addEventListener('click', () => {
      state.chatInput = button.dataset.question ?? '';
      sendChat();
    });
  });

  appRoot.querySelectorAll<HTMLButtonElement>('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      if (action === 'new-reagent') newReagentChallenge();
      if (action === 'restart-reagent-challenge') restartReagentChallenge();
      if (action === 'advance-reagent-challenge') advanceReagentChallenge();
      if (action === 'submit-reagent') submitReagentAnswer();
      if (action === 'new-pair') newPairChallenge();
      if (action === 'submit-pair') submitPairAnswer();
      if (action === 'new-puzzle') newPuzzleChallenge();
      if (action === 'random-gaokao-question') randomGaokaoQuestion();
      if (action === 'send-chat') sendChat();
      if (action === 'submit-guess') submitGuess();
      if (action === 'check-proxy') checkProxyStatus();
      if (action === 'next-curiosity-question') nextCuriosityQuestion();
    });
  });
}

function nextCuriosityQuestion(): void {
  if (curiosityQuestions.length === 0) {
    return;
  }

  state.curiosityQuestionIndex = (state.curiosityQuestionIndex + 1) % curiosityQuestions.length;
  render();
}

function isMethodNodeId(value: string | undefined): value is string {
  return value !== undefined && methodNodeDetails.some((node) => node.id === value);
}

function isUnsaturationPredictionId(value: string | undefined): value is UnsaturationPredictionId {
  return value !== undefined && unsaturationPredictionOptions.some((option) => option.id === value);
}

function isPhenomenonId(value: string | undefined): value is PhenomenonId {
  return value !== undefined && phenomenonOptions.some((option) => option.id === value);
}

function isPairRoleId(value: string | undefined): value is PairRoleId {
  return value !== undefined && pairRoleOptions.some((option) => option.id === value);
}

function parsePairRoleValue(value: string | undefined): { side: PairRoleSide; role: PairRoleId } | null {
  const parts = value?.split(':') ?? [];
  if (parts.length !== 2) {
    return null;
  }

  const [side, role] = parts;
  if ((side !== 'left' && side !== 'right') || !isPairRoleId(role)) {
    return null;
  }

  return { side, role };
}

function isReagentId(value: string | undefined): value is string {
  return value !== undefined && reagents.some((reagent) => reagent.id === value);
}

function toggleUnsaturationPrediction(prediction: UnsaturationPredictionId): void {
  if (prediction === 'none') {
    state.unsaturationPredictions = state.unsaturationPredictions.includes('none') ? [] : ['none'];
    render();
    return;
  }

  const structuralPredictions = state.unsaturationPredictions.filter((item) => item !== 'none');
  if (state.unsaturationPredictions.includes(prediction)) {
    state.unsaturationPredictions = structuralPredictions.filter((item) => item !== prediction);
  } else {
    state.unsaturationPredictions = [...structuralPredictions, prediction];
  }
  render();
}

function setReagentPracticeMode(mode: ReagentPracticeMode): void {
  state.reagentPracticeMode = mode;
  state.reagentAnswer = null;
  state.reagentFeedback = '';
  state.phenomenonPrediction = null;

  if (mode === 'challenge') {
    if (state.reagentChallengeSession.completed) {
      state.reagentChallengeSession = createReagentChallengeSession();
    }
    applyCurrentChallengeQuestion();
  }

  render();
}

function createReagentChallengeSession(): ChallengeSession {
  return createChallengeSession(challengeCompoundIds, challengeReagentIds, { size: 6 });
}

function restartReagentChallenge(): void {
  state.reagentPracticeMode = 'challenge';
  state.reagentChallengeSession = createReagentChallengeSession();
  state.reagentFeedback = '';
  state.phenomenonPrediction = null;
  applyCurrentChallengeQuestion();
  render();
}

function advanceReagentChallenge(): void {
  state.reagentChallengeSession = advanceChallenge(state.reagentChallengeSession);

  if (state.reagentChallengeSession.completed) {
    state.reagentAnswer = null;
    state.phenomenonPrediction = null;
    state.reagentFeedback = `挑战完成：本轮共 ${state.reagentChallengeSession.questions.length} 关，答对 ${state.reagentChallengeSession.score} 关。`;
    render();
    return;
  }

  state.reagentFeedback = '';
  state.phenomenonPrediction = null;
  applyCurrentChallengeQuestion();
  render();
}

function applyCurrentChallengeQuestion(): void {
  const question = getCurrentChallengeQuestion(state.reagentChallengeSession);
  if (!question) {
    return;
  }

  state.reagentCompoundId = question.compoundId;
  state.reagentId = question.reagentId;
  state.reagentAnswer = null;
  state.phenomenonPrediction = null;
}

function newReagentChallenge(): void {
  state.reagentPracticeMode = 'self-test';
  state.reagentCompoundId = pick(compounds.filter((compound) => compound.level !== 'advanced')).id;
  state.reagentId = pick(reagents).id;
  state.reagentAnswer = null;
  state.reagentFeedback = '';
  state.phenomenonPrediction = null;
  render();
}

function submitReagentAnswer(): void {
  if (!state.reagentAnswer) {
    state.reagentFeedback = '先选择“会反应”或“不反应”。';
    render();
    return;
  }

  const reaction = getReagentReaction(state.reagentCompoundId, state.reagentId);
  const expected = reaction.reacts ? 'yes' : 'no';
  const isCorrect = state.reagentAnswer === expected;
  const phenomenonFeedback = getPhenomenonPredictionFeedback(reaction);

  if (state.reagentPracticeMode === 'challenge') {
    const evaluated = evaluateChallengeAnswer(state.reagentChallengeSession, isCorrect);
    state.reagentChallengeSession = evaluated.session;
    const levelSuffix = isCorrect
      ? state.reagentChallengeSession.currentIndex >= state.reagentChallengeSession.questions.length - 1
        ? '本关通过，点击“完成挑战”查看结果。'
        : '本关通过，点击“进入下一关”。'
      : '本关还不能通过，请复盘后重新选择。';
    state.reagentFeedback = `${isCorrect ? '正确' : '需要复盘'}：${reaction.reacts ? '会反应' : '不反应'}。${reaction.reason} ${phenomenonFeedback} 现象：${reaction.evidence}${reaction.equation ? ` 方程式：${reaction.equation}` : ''} ${levelSuffix}`;
    render();
    return;
  }

  state.reagentFeedback = `${isCorrect ? '正确' : '需要复盘'}：${reaction.reacts ? '会反应' : '不反应'}。${reaction.reason} ${phenomenonFeedback} 现象：${reaction.evidence}${reaction.equation ? ` 方程式：${reaction.equation}` : ''}`;
  render();
}

function getPhenomenonPredictionFeedback(reaction: ReturnType<typeof getReagentReaction>): string {
  const expectedPhenomena = getExpectedPhenomena(reaction);
  const expectedLabels = expectedPhenomena.map(phenomenonLabel);

  if (state.phenomenonPrediction && expectedPhenomena.includes(state.phenomenonPrediction)) {
    const selectedLabel = phenomenonLabel(state.phenomenonPrediction);
    const otherLabels = expectedLabels.filter((label) => label !== selectedLabel);
    return otherLabels.length > 0
      ? `现象预测正确：${selectedLabel}；也要留意${formatPhenomenonLabels(otherLabels)}。`
      : `现象预测正确：${selectedLabel}。`;
  }

  if (!state.phenomenonPrediction) {
    return `现象需要复盘：应观察到${formatPhenomenonLabels(expectedLabels)}。`;
  }

  return `现象需要复盘：你选${phenomenonLabel(state.phenomenonPrediction)}，应观察到${formatPhenomenonLabels(expectedLabels)}。`;
}

function phenomenonLabel(phenomenon: PhenomenonId): string {
  return phenomenonOptions.find((option) => option.id === phenomenon)?.label ?? '无明显现象';
}

function formatPhenomenonLabels(labels: string[]): string {
  return labels.join('、');
}

function newPairChallenge(): void {
  const question = createRandomPairQuestion(pairCompoundIds);
  state.pairFirstId = question.firstId;
  state.pairSecondId = question.secondId;
  state.pairAnswer = null;
  state.pairTypeGuess = '';
  state.pairFeedback = '';
  resetPairRolePredictions();
  render();
}

function selectPair(side: PairSide, compoundId: string): void {
  const next = selectPairCompound(
    {
      firstId: state.pairFirstId,
      secondId: state.pairSecondId,
      answer: state.pairAnswer,
      typeGuess: state.pairTypeGuess,
      feedback: state.pairFeedback
    },
    side,
    compoundId,
    pairCompoundIds
  );

  state.pairFirstId = next.firstId;
  state.pairSecondId = next.secondId;
  state.pairAnswer = next.answer;
  state.pairTypeGuess = next.typeGuess;
  state.pairFeedback = next.feedback;
  resetPairRolePredictions();
  render();
}

function sideFromPairInput(kind: string): PairSide {
  return kind === 'pair-first-compound' ? 'first' : 'second';
}

function submitPairAnswer(): void {
  if (!state.pairAnswer) {
    state.pairFeedback = '先选择“能反应”或“不反应”。';
    render();
    return;
  }

  const reaction = getOrganicPairReaction(state.pairFirstId, state.pairSecondId);
  const expected = reaction.reacts ? 'yes' : 'no';
  const isCorrect = state.pairAnswer === expected;
  const typeMatched = !reaction.reacts || normalizeLoose(state.pairTypeGuess).includes(normalizeLoose(reaction.type));
  const roleFeedback = getPairRolePredictionFeedback();
  const resultWord = isCorrect && typeMatched ? '正确' : '需要复盘';

  state.pairFeedback = `${resultWord}：${reaction.reacts ? `能反应，类型是${reaction.type}` : '通常不反应'}。${roleFeedback} ${reaction.reason}${reaction.product ? ` 主要产物：${reaction.product}。` : ''}`;
  render();
}

function resetPairRolePredictions(): void {
  state.pairRolePredictions = { left: null, right: null };
}

function getPairRolePredictionFeedback(): string {
  const expectedLeft = getPairRoleForCompound(findCompoundById(state.pairFirstId));
  const expectedRight = getPairRoleForCompound(findCompoundById(state.pairSecondId));
  const selectedLeft = state.pairRolePredictions.left;
  const selectedRight = state.pairRolePredictions.right;

  if (selectedLeft === expectedLeft && selectedRight === expectedRight) {
    return `角色判断正确：左侧${pairRoleLabel(expectedLeft)}，右侧${pairRoleLabel(expectedRight)}。`;
  }

  return `角色需要复盘：左侧更像${pairRoleLabel(expectedLeft)}，右侧更像${pairRoleLabel(expectedRight)}。`;
}

function getDefaultGaokaoQuestion(): GaokaoQuestion {
  const question = gaokaoQuestions.find((item) => item.id === 'gk-ir-nmr-butanol') ?? gaokaoQuestions[0];
  if (!question) {
    throw new Error('Gaokao question bank is empty');
  }
  return question;
}

function getSelectedGaokaoQuestion(): GaokaoQuestion {
  return gaokaoQuestions.find((question) => question.id === state.selectedGaokaoQuestionId) ?? getDefaultGaokaoQuestion();
}

function findGaokaoQuestionById(questionId: string): GaokaoQuestion | null {
  return gaokaoQuestions.find((question) => question.id === questionId) ?? null;
}

function findGaokaoQuestionForPuzzle(puzzleId: string): GaokaoQuestion | null {
  return gaokaoQuestions.find((question) => question.puzzleId === puzzleId) ?? null;
}

function newPuzzleChallenge(): void {
  randomGaokaoQuestion();
}

function setGaokaoQuestion(questionId: string): void {
  const question = findGaokaoQuestionById(questionId);
  if (!question) {
    return;
  }

  setPuzzle(findPuzzleById(question.puzzleId), question.id);
  render();
}

function randomGaokaoQuestion(): void {
  const candidates = gaokaoQuestions.filter((question) => question.id !== state.selectedGaokaoQuestionId);
  const question = pick(candidates.length > 0 ? candidates : gaokaoQuestions);
  setGaokaoQuestion(question.id);
}

function setPuzzle(puzzle: FormulaPuzzle, selectedGaokaoQuestionId?: string): void {
  const unlockState = createPuzzleUnlockState(puzzle.id);
  const matchingQuestion = selectedGaokaoQuestionId
    ? findGaokaoQuestionById(selectedGaokaoQuestionId)
    : findGaokaoQuestionForPuzzle(puzzle.id);
  chatRequestId += 1;
  state.puzzleId = unlockState.puzzleId;
  state.selectedGaokaoQuestionId = matchingQuestion?.id ?? state.selectedGaokaoQuestionId;
  state.puzzleUnlocked = unlockState.unlocked;
  state.puzzleUnlockedCompoundId = unlockState.unlockedCompoundId;
  state.evidenceNotes = [];
  state.chatInput = '';
  state.structureGuess = '';
  state.puzzleFeedback = '';
  state.proxyStatus = '';
  state.chatPending = false;
  state.proxyCheckPending = false;
  state.chatMessages = [];
}

async function sendChat(): Promise<void> {
  if (state.chatPending) return;

  const text = state.chatInput.trim();
  if (!text) return;

  const requestId = ++chatRequestId;
  const puzzleId = state.puzzleId;
  const proxyUrl = state.proxyUrl;
  const history = state.chatMessages.slice(-8);
  state.chatMessages = [
    ...state.chatMessages,
    { role: 'student', text }
  ];
  state.chatInput = '';
  state.proxyStatus = proxyUrl ? 'DeepSeek 请求中...' : '';
  state.chatPending = true;
  render();

  const answerResult = await getAgentAnswer(puzzleId, proxyUrl, text, history);
  if (requestId !== chatRequestId || puzzleId !== state.puzzleId) {
    return;
  }

  state.chatPending = false;
  if (answerResult.proxyStatus !== undefined) {
    state.proxyStatus = answerResult.proxyStatus;
  }
  state.chatMessages = [...state.chatMessages, { role: 'agent', text: answerResult.answer }];
  if (answerResult.evidenceNote) {
    appendEvidenceNote(answerResult.evidenceNote);
  }
  render();
}

function appendEvidenceNote(note: EvidenceNote): void {
  const key = evidenceNoteKey(note);
  if (state.evidenceNotes.some((existingNote) => evidenceNoteKey(existingNote) === key)) {
    return;
  }

  state.evidenceNotes = [...state.evidenceNotes, note];
}

function evidenceNoteKey(note: EvidenceNote): string {
  return `${note.kind}:${normalizeLoose(note.text)}`;
}

function submitGuess(): void {
  const guess = state.structureGuess.trim();
  if (!guess) {
    state.puzzleFeedback = '先输入一个结构名称或结构简式。';
    render();
    return;
  }

  const result = answerFormulaPuzzle(state.puzzleId, guess);
  const unlockState = updatePuzzleUnlockWithGuess(
    {
      puzzleId: state.puzzleId,
      unlocked: state.puzzleUnlocked,
      unlockedCompoundId: state.puzzleUnlockedCompoundId
    },
    guess
  );
  state.puzzleFeedback = result.message;
  state.puzzleUnlocked = unlockState.unlocked;
  state.puzzleUnlockedCompoundId = unlockState.unlockedCompoundId;
  if (!result.correct) {
    appendEvidenceNote({ kind: 'guess', text: `已尝试：${guess}` });
  }
  render();
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function uniqueStrings(items: string[]): string[] {
  return Array.from(new Set(items));
}

function formatIndex(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function unsaturationInterpretation(index: number): string {
  if (index <= 0) {
    return '通常对应饱和开链结构，可优先比较醇、醚、烷烃等官能团或类别异构。';
  }
  if (index === 1) {
    return '可能含一个双键、一个羰基或一个环，需要结合实验性质区分。';
  }
  if (index === 2) {
    return '可能含一个三键、两个双键、两个环，或双键与环的组合。';
  }
  if (index >= 4) {
    return '可能包含苯环，也可能是多个双键或环的组合，需继续用化学性质或谱图证据确认。';
  }
  return '说明分子内存在多个不饱和单元，下一步应判断是双键、羰基、环还是组合结构。';
}

function normalizeLoose(value: string): string {
  return value.toLowerCase().replace(/[，,。.、\s]/g, '');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getInitialProxyUrl(): string {
  return resolveInitialProxyUrl({
    hostname: window.location.hostname,
    search: window.location.search,
    savedProxyUrl: localStorage.getItem('deepseekProxyUrl'),
    envProxyUrl: import.meta.env.VITE_DEEPSEEK_PROXY_URL
  });
}

function proxyStatusText(): string {
  const mode = state.proxyUrl ? 'DeepSeek 代理已填写；不可用时会自动回退到规则助手。' : '当前使用本地规则助手。部署 Vercel 代理后可填入 /api/deepseek 或完整代理 URL。';
  return state.proxyStatus ? `${mode} ${escapeHtml(state.proxyStatus)}` : mode;
}

async function checkProxyStatus(): Promise<void> {
  if (!state.proxyUrl) {
    state.proxyStatus = '当前没有代理 URL，会使用本地规则助手。';
    render();
    return;
  }

  state.proxyCheckPending = true;
  state.proxyStatus = '正在检测 DeepSeek 代理...';
  render();

  try {
    const response = await fetch(state.proxyUrl, { method: 'GET' });
    const data = (await response.json().catch(() => ({}))) as {
      configured?: boolean;
      model?: string;
      error?: string;
    };

    if (!response.ok) {
      throw new Error(data.error || `代理返回 ${response.status}`);
    }

    state.proxyStatus = data.configured
      ? `代理可用，模型：${data.model || 'DeepSeek'}。`
      : '代理服务在线，但还没有配置服务端 API Key。';
  } catch (error) {
    state.proxyStatus = `代理检测失败：${error instanceof Error ? error.message : '未知错误'}。`;
  } finally {
    state.proxyCheckPending = false;
    render();
  }
}

function createAgentAnswerResult(
  reply: AgentReply,
  options: { answer?: string; proxyStatus?: string } = {}
): AgentAnswerResult {
  return {
    answer: options.answer ?? reply.answer,
    evidenceNote: createEvidenceNoteFromAgentReply(reply),
    proxyStatus: options.proxyStatus ?? ''
  };
}

async function getAgentAnswer(
  puzzleId: string,
  proxyUrl: string,
  question: string,
  history: ChatMessage[]
): Promise<AgentAnswerResult> {
  if (!proxyUrl) {
    return createAgentAnswerResult(askAgent(puzzleId, question));
  }

  try {
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        puzzleId,
        question,
        history
      })
    });

    if (!response.ok) {
      const errorMessage = await readProxyError(response);
      throw new Error(errorMessage || `代理返回 ${response.status}`);
    }

    const data = (await response.json()) as { answer?: string; provider?: string };
    if (!data.answer) {
      throw new Error('代理没有返回 answer');
    }

    return createAgentAnswerResult(askAgent(puzzleId, question), {
      answer: sanitizeAgentAnswer(data.answer, findPuzzleById(puzzleId)),
      proxyStatus: data.provider === 'deepseek' ? 'DeepSeek 已回复。' : '已触发保护规则。'
    });
  } catch (error) {
    const fallback = askAgent(puzzleId, question);
    return createAgentAnswerResult(fallback, {
      proxyStatus: `代理不可用，已回退到规则助手：${error instanceof Error ? error.message : '未知错误'}`
    });
  }
}

async function readProxyError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string; status?: number };
    const statusText = data.status ? `DeepSeek 返回 ${data.status}` : `代理返回 ${response.status}`;
    return data.error ? `${statusText}：${data.error}` : statusText;
  } catch {
    return `代理返回 ${response.status}`;
  }
}
