import {
  Beaker,
  Brain,
  CheckCircle2,
  FlaskConical,
  GitBranch,
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
  answerFormulaPuzzle,
  askAgent,
  compounds,
  findCompoundById,
  findPuzzleById,
  findReagentById,
  formulaPuzzles,
  getOrganicPairReaction,
  getReagentReaction,
  reagents
} from './chemistry';
import { getMoleculeModel, type DisplayMode, type MoleculeModel } from './moleculeModels';
import { createMoleculeViewer, type MoleculeViewer } from './moleculeViewer';
import { createPuzzleUnlockState, updatePuzzleUnlockWithGuess } from './puzzleUnlock';
import { resolveInitialProxyUrl } from './proxyConfig';

type Mode = 'reagent' | 'pair' | 'puzzle';
type YesNo = 'yes' | 'no' | null;

interface ChatMessage {
  role: 'student' | 'agent';
  text: string;
}

interface AppState {
  mode: Mode;
  reagentCompoundId: string;
  reagentId: string;
  reagentAnswer: YesNo;
  reagentFeedback: string;
  pairFirstId: string;
  pairSecondId: string;
  pairAnswer: YesNo;
  pairTypeGuess: string;
  pairFeedback: string;
  puzzleId: string;
  puzzleUnlocked: boolean;
  puzzleUnlockedCompoundId: string | null;
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
}

const appRoot = getAppRoot();
let chatRequestId = 0;
const mountedMoleculeViewers: MoleculeViewer[] = [];
const initialPuzzleUnlock = createPuzzleUnlockState('puzzle-ethanol');

const state: AppState = {
  mode: 'reagent',
  reagentCompoundId: 'ethene',
  reagentId: 'bromine-ccl4',
  reagentAnswer: null,
  reagentFeedback: '',
  pairFirstId: 'ethanol',
  pairSecondId: 'acetic-acid',
  pairAnswer: null,
  pairTypeGuess: '',
  pairFeedback: '',
  puzzleId: initialPuzzleUnlock.puzzleId,
  puzzleUnlocked: initialPuzzleUnlock.unlocked,
  puzzleUnlockedCompoundId: initialPuzzleUnlock.unlockedCompoundId,
  viewerDisplayMode: 'ball-stick',
  highlightFunctionalGroup: true,
  proxyUrl: getInitialProxyUrl(),
  chatInput: '',
  chatMessages: [
    {
      role: 'agent',
      text: '已给出分子式。你可以问一个实验性质，我只根据性质反馈，不直接公布结构。'
    }
  ],
  structureGuess: '',
  puzzleFeedback: '',
  proxyStatus: '',
  chatPending: false,
  proxyCheckPending: false
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
        ${modeButton('reagent', '基础', '试剂反应', 'beaker')}
        ${modeButton('pair', '进阶', '有机物间反应', 'flask-conical')}
        ${modeButton('puzzle', '高阶', '分子式推理', 'brain')}
      </nav>

      ${renderViewerControls()}

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
      CheckCircle2,
      FlaskConical,
      GitBranch,
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

  return `
    <section class="workspace two-column" aria-label="基础试剂反应判断">
      ${renderCompoundPanel(compound)}
      <section class="task-panel">
        <div class="panel-title-row">
          <div>
            <p class="section-kicker">基础判断</p>
            <h2>${compound.name} 与试剂</h2>
          </div>
          <button class="icon-text-button" data-action="new-reagent" type="button">
            <i data-lucide="shuffle" aria-hidden="true"></i>
            下一题
          </button>
        </div>

        <div class="selector-grid">
          ${reagents
            .map(
              (item) => `
                <button class="choice-chip ${item.id === state.reagentId ? 'selected' : ''}" data-reagent="${item.id}" type="button" aria-pressed="${item.id === state.reagentId}">
                  <span>${item.name}</span>
                  <small>${item.prompt}</small>
                </button>
              `
            )
            .join('')}
        </div>

        <div class="answer-row" aria-label="反应判断">
          <button class="judge-button ${state.reagentAnswer === 'yes' ? 'selected yes' : ''}" data-answer="yes" type="button" aria-pressed="${state.reagentAnswer === 'yes'}">
            会反应
          </button>
          <button class="judge-button ${state.reagentAnswer === 'no' ? 'selected no' : ''}" data-answer="no" type="button" aria-pressed="${state.reagentAnswer === 'no'}">
            不反应
          </button>
        </div>

        <button class="primary-action" data-action="submit-reagent" type="button">
          <i data-lucide="check-circle-2" aria-hidden="true"></i>
          提交判断：${reagent.name}
        </button>

        ${feedbackBlock(state.reagentFeedback)}
      </section>
    </section>
  `;
}

function renderPairMode(): string {
  const first = findCompoundById(state.pairFirstId);
  const second = findCompoundById(state.pairSecondId);

  return `
    <section class="workspace two-column pair-layout" aria-label="进阶有机物间反应判断">
      <section class="compound-pair">
        ${renderCompactCompound(first)}
        <div class="reaction-mark">+</div>
        ${renderCompactCompound(second)}
      </section>

      <section class="task-panel">
        <div class="panel-title-row">
          <div>
            <p class="section-kicker">进阶判断</p>
            <h2>${first.name} 与 ${second.name}</h2>
          </div>
          <button class="icon-text-button" data-action="new-pair" type="button">
            <i data-lucide="refresh-cw" aria-hidden="true"></i>
            换一组
          </button>
        </div>

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

function renderPuzzleMode(): string {
  const puzzle = findPuzzleById(state.puzzleId);

  return `
    <section class="workspace puzzle-layout" aria-label="高阶分子式结构推理">
      <section class="formula-panel">
        <div class="panel-title-row">
          <div>
            <p class="section-kicker">高阶推理</p>
            <h2>分子式 ${puzzle.formula}</h2>
          </div>
          <button class="icon-text-button" data-action="new-puzzle" type="button">
            <i data-lucide="sparkles" aria-hidden="true"></i>
            新题
          </button>
        </div>
        <div class="formula-display">${puzzle.formula}</div>
        ${renderPuzzleVisualization(puzzle)}
        <p class="hint-line">${puzzle.openingHint}</p>
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
        <div class="quick-questions">
          ${quickQuestion('能否与溴的四氯化碳溶液反应？')}
          ${quickQuestion('能否与金属钠反应？')}
          ${quickQuestion('能否发生银镜反应？')}
          ${quickQuestion('能否与碳酸氢钠反应放出 CO2？')}
          ${quickQuestion('能否与三氯化铁显紫色？')}
        </div>
        <div class="chat-log" aria-live="polite">
          ${state.chatMessages
            .map(
              (message) => `
                <div class="chat-message ${message.role}">
                  <span>${message.role === 'agent' ? 'AI' : '我'}</span>
                  <p>${escapeHtml(message.text)}</p>
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

function quickQuestion(text: string): string {
  return `<button class="quick-question" data-question="${escapeHtml(text)}" type="button" ${state.chatPending ? 'disabled' : ''}>${text}</button>`;
}

function renderCompoundPanel(compound: Compound): string {
  return `
    <section class="compound-panel">
      <p class="section-kicker">当前有机物</p>
      <h2>${compound.name}</h2>
      ${renderMoleculeViewerHost(compound.id, `${compound.name}三维结构`)}
      <dl class="compound-facts">
        <div><dt>分子式</dt><dd>${compound.formula}</dd></div>
        <div><dt>结构简式</dt><dd>${compound.structureFormula}</dd></div>
        <div><dt>官能团</dt><dd>${functionalGroupLabels(compound).join('、')}</dd></div>
      </dl>
      <p class="compound-summary">${compound.summary}</p>
    </section>
  `;
}

function renderCompactCompound(compound: Compound): string {
  return `
    <article class="compound-mini">
      <div>
        <p>${compound.formula}</p>
        <h3>${compound.name}</h3>
      </div>
      ${renderMoleculeViewerHost(compound.id, `${compound.name}三维结构`, 'compact')}
      <span>${compound.structureFormula}</span>
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
        <span>分子式</span>
        <strong>${puzzle.formula}</strong>
        <p>先根据实验性质推断结构；答对后显示三维模型。</p>
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
      <p>${message}</p>
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

  appRoot.querySelectorAll<HTMLButtonElement>('[data-reagent]').forEach((button) => {
    button.addEventListener('click', () => {
      state.reagentId = button.dataset.reagent ?? state.reagentId;
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
      if (action === 'submit-reagent') submitReagentAnswer();
      if (action === 'new-pair') newPairChallenge();
      if (action === 'submit-pair') submitPairAnswer();
      if (action === 'new-puzzle') newPuzzleChallenge();
      if (action === 'send-chat') sendChat();
      if (action === 'submit-guess') submitGuess();
      if (action === 'check-proxy') checkProxyStatus();
    });
  });
}

function newReagentChallenge(): void {
  state.reagentCompoundId = pick(compounds.filter((compound) => compound.level !== 'advanced')).id;
  state.reagentId = pick(reagents).id;
  state.reagentAnswer = null;
  state.reagentFeedback = '';
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
  state.reagentFeedback = `${isCorrect ? '正确' : '需要复盘'}：${reaction.reacts ? '会反应' : '不反应'}。${reaction.reason} 现象：${reaction.evidence}${reaction.equation ? ` 方程式：${reaction.equation}` : ''}`;
  render();
}

function newPairChallenge(): void {
  const first = pick(compounds.filter((compound) => compound.id !== 'ethyl-acetate'));
  const candidates = compounds.filter((compound) => compound.id !== first.id);
  const second = pick(candidates);
  state.pairFirstId = first.id;
  state.pairSecondId = second.id;
  state.pairAnswer = null;
  state.pairTypeGuess = '';
  state.pairFeedback = '';
  render();
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
  const resultWord = isCorrect && typeMatched ? '正确' : '需要复盘';

  state.pairFeedback = `${resultWord}：${reaction.reacts ? `能反应，类型是${reaction.type}` : '通常不反应'}。${reaction.reason}${reaction.product ? ` 主要产物：${reaction.product}。` : ''}`;
  render();
}

function newPuzzleChallenge(): void {
  const puzzle = pick(formulaPuzzles);
  setPuzzle(puzzle);
  render();
}

function setPuzzle(puzzle: FormulaPuzzle): void {
  const unlockState = createPuzzleUnlockState(puzzle.id);
  chatRequestId += 1;
  state.puzzleId = unlockState.puzzleId;
  state.puzzleUnlocked = unlockState.unlocked;
  state.puzzleUnlockedCompoundId = unlockState.unlockedCompoundId;
  state.chatInput = '';
  state.structureGuess = '';
  state.puzzleFeedback = '';
  state.proxyStatus = '';
  state.chatPending = false;
  state.proxyCheckPending = false;
  state.chatMessages = [
    {
      role: 'agent',
      text: `分子式为 ${puzzle.formula}。${puzzle.openingHint}`
    }
  ];
}

async function sendChat(): Promise<void> {
  if (state.chatPending) return;

  const text = state.chatInput.trim();
  if (!text) return;

  const requestId = ++chatRequestId;
  const puzzleId = state.puzzleId;
  const history = state.chatMessages.slice(-8);
  state.chatMessages = [
    ...state.chatMessages,
    { role: 'student', text }
  ];
  state.chatInput = '';
  state.proxyStatus = state.proxyUrl ? 'DeepSeek 请求中...' : '';
  state.chatPending = true;
  render();

  const answer = await getAgentAnswer(text, history);
  if (requestId !== chatRequestId || puzzleId !== state.puzzleId) {
    return;
  }

  state.chatPending = false;
  state.chatMessages = [...state.chatMessages, { role: 'agent', text: answer }];
  render();
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
  render();
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
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

async function getAgentAnswer(question: string, history: ChatMessage[]): Promise<string> {
  if (!state.proxyUrl) {
    state.proxyStatus = '';
    return askAgent(state.puzzleId, question).answer;
  }

  try {
    const response = await fetch(state.proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        puzzleId: state.puzzleId,
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

    state.proxyStatus = data.provider === 'deepseek' ? 'DeepSeek 已回复。' : '已触发保护规则。';
    return data.answer;
  } catch (error) {
    const fallback = askAgent(state.puzzleId, question).answer;
    state.proxyStatus = `代理不可用，已回退到规则助手：${error instanceof Error ? error.message : '未知错误'}`;
    return fallback;
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
