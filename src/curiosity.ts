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

  const expectedPredictions = getLikelyUnsaturationPredictions(index, formula);
  const hasAlignedPrediction = predictions.some((prediction) => expectedPredictions.includes(prediction));

  if (!hasAlignedPrediction) {
    return `不饱和度为 ${Math.max(index, 0)}，你的预测需要复盘；公式能提示可能方向，但不能只凭公式定结构，仍需实验验证。`;
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

function getLikelyUnsaturationPredictions(index: number, formula: string): UnsaturationPredictionId[] {
  const oxygenCount = countElement(formula, 'O');
  const maybeCarbonyl: UnsaturationPredictionId[] = oxygenCount > 0 ? ['carbonyl'] : [];

  if (index <= 0) return ['none'];
  if (index === 1) return ['carbon-double-bond', 'ring', ...maybeCarbonyl];
  if (index === 2) return ['carbon-triple-bond', 'carbon-double-bond', 'ring', ...maybeCarbonyl];
  if (index >= 4) return ['benzene-ring', 'carbon-triple-bond', 'carbon-double-bond', 'ring', ...maybeCarbonyl];
  return ['carbon-triple-bond', 'carbon-double-bond', 'ring', ...maybeCarbonyl];
}

function countElement(formula: string, element: string): number {
  const tokens = formula.match(/[A-Z][a-z]?\d*/g) ?? [];
  let count = 0;

  for (const token of tokens) {
    const match = token.match(/^([A-Z][a-z]?)(\d*)$/);
    if (match?.[1] === element) {
      count += match[2] ? Number(match[2]) : 1;
    }
  }

  return count;
}

export function getExpectedPhenomena(reaction: ReactionResult): PhenomenonId[] {
  if (!reaction.reacts) return ['none'];
  const phenomena: PhenomenonId[] = [];

  if (/银镜/.test(reaction.evidence)) phenomena.push('silver-mirror');
  if (/CO2|H2|气体/.test(reaction.evidence)) phenomena.push('gas');
  if (/沉淀/.test(reaction.evidence)) phenomena.push('precipitate');
  if (/褪色|褪去/.test(reaction.evidence)) phenomena.push('decolorize');
  if (/显紫|紫色(?!.*褪去)/.test(reaction.evidence)) phenomena.push('purple');

  return phenomena.length > 0 ? phenomena : ['none'];
}

export function getExpectedPhenomenon(reaction: ReactionResult): PhenomenonId {
  return getExpectedPhenomena(reaction)[0];
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
  const labels: Record<FunctionalGroup, string> = {
    alkane: '烷烃',
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
  const priority: FunctionalGroup[] = [
    'carboxylic-acid',
    'phenol',
    'aldehyde',
    'alcohol',
    'ester',
    'ketone',
    'alkene',
    'alkyne',
    'arene',
    'alkane'
  ];
  const group = priority.find((item) => groups.includes(item));
  if (group) return labels[group];
  return '没有明显配对角色';
}

export function createEvidenceNoteFromAgentReply(reply: AgentReply): EvidenceNote {
  let kind: EvidenceNote['kind'] = 'verified';
  if (reply.answer.startsWith('不能')) {
    kind = 'excluded';
  } else if (reply.hintLevel === 'guardrail' || reply.hintLevel === 'light' || reply.matchedTopic === 'fallback') {
    kind = 'guess';
  }

  return {
    kind,
    text: `${reply.matchedTopic}：${reply.answer}`
  };
}
