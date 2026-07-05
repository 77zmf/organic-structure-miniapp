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
  proxyUrl: string;
  chatInput: string;
  chatMessages: ChatMessage[];
  structureGuess: string;
  puzzleFeedback: string;
  proxyStatus: string;
  chatPending: boolean;
}

const appRoot = getAppRoot();
let chatRequestId = 0;

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
  puzzleId: 'puzzle-ethanol',
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
  chatPending: false
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
}

function modeButton(mode: Mode, label: string, detail: string, icon: string): string {
  const active = state.mode === mode ? 'active' : '';
  return `
    <button class="mode-tab ${active}" data-mode="${mode}" type="button">
      <i data-lucide="${icon}" aria-hidden="true"></i>
      <span>${label}</span>
      <small>${detail}</small>
    </button>
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
                <button class="choice-chip ${item.id === state.reagentId ? 'selected' : ''}" data-reagent="${item.id}" type="button">
                  <span>${item.name}</span>
                  <small>${item.prompt}</small>
                </button>
              `
            )
            .join('')}
        </div>

        <div class="answer-row" aria-label="反应判断">
          <button class="judge-button ${state.reagentAnswer === 'yes' ? 'selected yes' : ''}" data-answer="yes" type="button">
            会反应
          </button>
          <button class="judge-button ${state.reagentAnswer === 'no' ? 'selected no' : ''}" data-answer="no" type="button">
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
          <button class="judge-button ${state.pairAnswer === 'yes' ? 'selected yes' : ''}" data-pair-answer="yes" type="button">
            能反应
          </button>
          <button class="judge-button ${state.pairAnswer === 'no' ? 'selected no' : ''}" data-pair-answer="no" type="button">
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
            <p class="section-kicker">AI 推理助手原型</p>
            <h2>实验性质问答</h2>
          </div>
        </div>
        <label class="input-label" for="proxy-url">DeepSeek 代理 URL</label>
        <input id="proxy-url" class="text-input" value="${escapeHtml(state.proxyUrl)}" data-input="proxy-url" placeholder="例如：https://your-app.vercel.app/api/deepseek；留空则使用规则助手" />
        <p class="proxy-status">${state.proxyUrl ? '已配置代理；请求失败会自动回退到规则助手。' : '当前使用本地规则助手。部署 Vercel 后可填入 /api/deepseek 或完整代理 URL。'}${state.proxyStatus ? ` ${escapeHtml(state.proxyStatus)}` : ''}</p>
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
      ${moleculeSketch(compound)}
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
      ${moleculeSketch(compound)}
      <span>${compound.structureFormula}</span>
    </article>
  `;
}

function moleculeSketch(compound: Compound): string {
  if (compound.functionalGroups.includes('arene')) {
    const hasPhenol = compound.functionalGroups.includes('phenol');
    return `
      <svg class="molecule-svg" viewBox="0 0 260 170" role="img" aria-label="${compound.name}结构示意">
        <polygon points="130,30 185,62 185,125 130,155 75,125 75,62" fill="none" stroke="currentColor" stroke-width="5" />
        <circle cx="130" cy="93" r="36" fill="none" stroke="currentColor" stroke-width="3" opacity="0.45" />
        ${hasPhenol ? '<line x1="185" y1="62" x2="225" y2="38" stroke="currentColor" stroke-width="5" /><text x="228" y="42">OH</text>' : ''}
        <text x="105" y="100">${hasPhenol ? 'C6H5' : 'C6H6'}</text>
      </svg>
    `;
  }

  if (compound.id === 'ethene') {
    return structureSvg('H2C', 'CH2', '=', compound.name);
  }
  if (compound.id === 'acetylene') {
    return structureSvg('HC', 'CH', '≡', compound.name);
  }
  if (compound.id === 'ethanol') {
    return chainSvg(['CH3', 'CH2', 'OH'], compound.name);
  }
  if (compound.id === 'acetic-acid') {
    return chainSvg(['CH3', 'COOH'], compound.name);
  }
  if (compound.id === 'acetaldehyde') {
    return chainSvg(['CH3', 'CHO'], compound.name);
  }
  if (compound.id === 'ethyl-acetate') {
    return chainSvg(['CH3', 'COO', 'CH2', 'CH3'], compound.name);
  }

  return `
    <svg class="molecule-svg" viewBox="0 0 260 170" role="img" aria-label="${compound.name}结构示意">
      <rect x="48" y="48" width="164" height="74" rx="8" fill="none" stroke="currentColor" stroke-width="4" />
      <text x="130" y="96" text-anchor="middle">${compound.structureFormula}</text>
    </svg>
  `;
}

function structureSvg(left: string, right: string, bond: string, label: string): string {
  const y = bond === '≡' ? 93 : 90;
  const lines =
    bond === '='
      ? '<line x1="105" y1="75" x2="155" y2="75" /><line x1="105" y1="105" x2="155" y2="105" />'
      : '<line x1="105" y1="70" x2="155" y2="70" /><line x1="105" y1="90" x2="155" y2="90" /><line x1="105" y1="110" x2="155" y2="110" />';

  return `
    <svg class="molecule-svg" viewBox="0 0 260 170" role="img" aria-label="${label}结构示意">
      <g stroke="currentColor" stroke-width="5" stroke-linecap="round">${lines}</g>
      <text x="70" y="${y}" text-anchor="middle">${left}</text>
      <text x="190" y="${y}" text-anchor="middle">${right}</text>
    </svg>
  `;
}

function chainSvg(parts: string[], label: string): string {
  const start = parts.length === 2 ? 82 : parts.length === 3 ? 58 : 34;
  const gap = parts.length === 4 ? 62 : 72;
  return `
    <svg class="molecule-svg" viewBox="0 0 260 170" role="img" aria-label="${label}结构示意">
      ${parts
        .map((part, index) => {
          const x = start + index * gap;
          const nextX = start + (index + 1) * gap;
          const line = index < parts.length - 1 ? `<line x1="${x + 22}" y1="86" x2="${nextX - 22}" y2="86" stroke="currentColor" stroke-width="4" />` : '';
          return `${line}<text x="${x}" y="93" text-anchor="middle">${part}</text>`;
        })
        .join('')}
    </svg>
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
  chatRequestId += 1;
  state.puzzleId = puzzle.id;
  state.chatInput = '';
  state.structureGuess = '';
  state.puzzleFeedback = '';
  state.proxyStatus = '';
  state.chatPending = false;
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
  state.puzzleFeedback = result.message;
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
  const saved = localStorage.getItem('deepseekProxyUrl');
  if (saved !== null) return saved;
  const hostname = window.location.hostname;
  if (hostname.endsWith('github.io') || hostname === 'localhost' || hostname === '127.0.0.1') {
    return '';
  }
  return '/api/deepseek';
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
      throw new Error(`代理返回 ${response.status}`);
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
