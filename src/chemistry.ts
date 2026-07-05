export type FunctionalGroup =
  | 'alkane'
  | 'alkene'
  | 'alkyne'
  | 'alcohol'
  | 'aldehyde'
  | 'carboxylic-acid'
  | 'ester'
  | 'phenol'
  | 'arene'
  | 'ketone';

export interface Compound {
  id: string;
  name: string;
  formula: string;
  aliases: string[];
  structureFormula: string;
  functionalGroups: FunctionalGroup[];
  level: 'basic' | 'intermediate' | 'advanced';
  summary: string;
}

export interface Reagent {
  id: string;
  name: string;
  prompt: string;
}

export interface ReactionResult {
  reacts: boolean;
  type: string;
  reason: string;
  evidence: string;
  equation?: string;
}

export interface PairReactionResult extends ReactionResult {
  product?: string;
}

export interface FormulaPuzzle {
  id: string;
  formula: string;
  targetCompoundId: string;
  openingHint: string;
  possibleStructures: string[];
}

export interface AgentReply {
  answer: string;
  hintLevel: 'light' | 'medium' | 'strong' | 'guardrail';
  matchedTopic: string;
}

export interface GuessResult {
  correct: boolean;
  message: string;
  compound: Compound;
}

export const compounds: Compound[] = [
  {
    id: 'methane',
    name: '甲烷',
    formula: 'CH4',
    aliases: ['甲烷', 'methane', 'ch4'],
    structureFormula: 'CH4',
    functionalGroups: ['alkane'],
    level: 'basic',
    summary: '饱和烃，常见高中条件下性质较稳定，典型反应是光照条件下与氯气发生取代反应。'
  },
  {
    id: 'ethene',
    name: '乙烯',
    formula: 'C2H4',
    aliases: ['乙烯', 'ethene', 'ethylene', 'ch2=ch2'],
    structureFormula: 'CH2=CH2',
    functionalGroups: ['alkene'],
    level: 'basic',
    summary: '含有碳碳双键，容易发生加成反应，也能使酸性高锰酸钾褪色。'
  },
  {
    id: 'acetylene',
    name: '乙炔',
    formula: 'C2H2',
    aliases: ['乙炔', 'ethyne', 'acetylene', 'hc≡ch', 'hcch'],
    structureFormula: 'HC≡CH',
    functionalGroups: ['alkyne'],
    level: 'intermediate',
    summary: '含有碳碳三键，能发生加成反应。'
  },
  {
    id: 'ethanol',
    name: '乙醇',
    formula: 'C2H6O',
    aliases: ['乙醇', '酒精', 'ethanol', 'ch3ch2oh'],
    structureFormula: 'CH3CH2OH',
    functionalGroups: ['alcohol'],
    level: 'basic',
    summary: '含有羟基，能与钠反应放出氢气，也能与羧酸发生酯化。'
  },
  {
    id: 'acetaldehyde',
    name: '乙醛',
    formula: 'C2H4O',
    aliases: ['乙醛', 'acetaldehyde', 'ch3cho'],
    structureFormula: 'CH3CHO',
    functionalGroups: ['aldehyde'],
    level: 'intermediate',
    summary: '含有醛基，能发生银镜反应，能被弱氧化剂氧化。'
  },
  {
    id: 'acetic-acid',
    name: '乙酸',
    formula: 'C2H4O2',
    aliases: ['乙酸', '醋酸', 'acetic acid', 'ch3cooh'],
    structureFormula: 'CH3COOH',
    functionalGroups: ['carboxylic-acid'],
    level: 'basic',
    summary: '含有羧基，具有酸性，能与碳酸氢钠反应放出二氧化碳。'
  },
  {
    id: 'ethyl-acetate',
    name: '乙酸乙酯',
    formula: 'C4H8O2',
    aliases: ['乙酸乙酯', 'ethyl acetate', 'ch3cooch2ch3'],
    structureFormula: 'CH3COOCH2CH3',
    functionalGroups: ['ester'],
    level: 'intermediate',
    summary: '含有酯基，可在酸性或碱性条件下水解。'
  },
  {
    id: 'benzene',
    name: '苯',
    formula: 'C6H6',
    aliases: ['苯', 'benzene', 'c6h6'],
    structureFormula: 'C6H6',
    functionalGroups: ['arene'],
    level: 'intermediate',
    summary: '苯环较稳定，常见高中条件下不使溴的四氯化碳或酸性高锰酸钾褪色。'
  },
  {
    id: 'phenol',
    name: '苯酚',
    formula: 'C6H6O',
    aliases: ['苯酚', 'phenol', 'c6h5oh'],
    structureFormula: 'C6H5OH',
    functionalGroups: ['phenol', 'arene'],
    level: 'advanced',
    summary: '酚羟基使苯环活化，能与溴水反应，也能与三氯化铁显紫色。'
  },
  {
    id: 'formaldehyde',
    name: '甲醛',
    formula: 'CH2O',
    aliases: ['甲醛', 'formaldehyde', 'hcho'],
    structureFormula: 'HCHO',
    functionalGroups: ['aldehyde'],
    level: 'advanced',
    summary: '最简单的醛，能发生银镜反应，也可与苯酚缩聚。'
  },
  {
    id: 'acetone',
    name: '丙酮',
    formula: 'C3H6O',
    aliases: ['丙酮', 'acetone', 'ch3coch3'],
    structureFormula: 'CH3COCH3',
    functionalGroups: ['ketone'],
    level: 'advanced',
    summary: '含有羰基但不是醛基，通常不能发生银镜反应。'
  }
];

export const reagents: Reagent[] = [
  { id: 'bromine-ccl4', name: '溴的四氯化碳溶液', prompt: '是否褪色' },
  { id: 'bromine-water', name: '溴水', prompt: '是否褪色或生成沉淀' },
  { id: 'acidic-kmno4', name: '酸性高锰酸钾溶液', prompt: '是否褪色' },
  { id: 'sodium', name: '金属钠', prompt: '是否放出 H2' },
  { id: 'sodium-bicarbonate', name: '碳酸氢钠溶液', prompt: '是否放出 CO2' },
  { id: 'tollens', name: '银氨溶液', prompt: '是否发生银镜反应' },
  { id: 'ferric-chloride', name: '三氯化铁溶液', prompt: '是否显紫色' },
  { id: 'sodium-hydroxide', name: '氢氧化钠溶液', prompt: '是否发生酸碱或水解反应' }
];

export const formulaPuzzles: FormulaPuzzle[] = [
  {
    id: 'puzzle-ethene',
    formula: 'C2H4',
    targetCompoundId: 'ethene',
    openingHint: '不饱和度较高，可先问它是否能发生加成反应。',
    possibleStructures: ['乙烯']
  },
  {
    id: 'puzzle-ethanol',
    formula: 'C2H6O',
    targetCompoundId: 'ethanol',
    openingHint: '同分异构可能包括醇和醚，可先问它是否能与金属钠反应。',
    possibleStructures: ['乙醇', '二甲醚']
  },
  {
    id: 'puzzle-acetaldehyde',
    formula: 'C2H4O',
    targetCompoundId: 'acetaldehyde',
    openingHint: '可先判断是否含醛基，银镜反应很关键。',
    possibleStructures: ['乙醛']
  },
  {
    id: 'puzzle-acetic-acid',
    formula: 'C2H4O2',
    targetCompoundId: 'acetic-acid',
    openingHint: '可先问它是否有酸性，是否能与碳酸氢钠反应。',
    possibleStructures: ['乙酸', '甲酸甲酯']
  },
  {
    id: 'puzzle-phenol',
    formula: 'C6H6O',
    targetCompoundId: 'phenol',
    openingHint: '可先问三氯化铁显色或溴水反应。',
    possibleStructures: ['苯酚', '苯甲醇', '苯甲醚']
  },
  {
    id: 'puzzle-formaldehyde',
    formula: 'CH2O',
    targetCompoundId: 'formaldehyde',
    openingHint: '可先判断是否含醛基，银镜反应很关键。',
    possibleStructures: ['甲醛']
  }
];

const reagentReactionTable: Record<string, Record<string, ReactionResult>> = {
  ethene: {
    'bromine-ccl4': positive('加成反应', '含有碳碳双键，π 键易断裂并与 Br2 加成。', '溴的红棕色褪去。', 'CH2=CH2 + Br2 -> CH2BrCH2Br'),
    'bromine-water': positive('加成反应', '含有碳碳双键，可与溴发生加成。', '溴水褪色。'),
    'acidic-kmno4': positive('氧化反应', '含有碳碳双键，可被酸性高锰酸钾氧化。', '紫色褪去。')
  },
  acetylene: {
    'bromine-ccl4': positive('加成反应', '含有碳碳三键，可连续发生加成反应。', '溴的红棕色褪去。'),
    'acidic-kmno4': positive('氧化反应', '碳碳三键可被酸性高锰酸钾氧化。', '紫色褪去。')
  },
  ethanol: {
    sodium: positive('置换反应', '含有醇羟基，O-H 键可与钠反应。', '产生无色气体 H2。', '2CH3CH2OH + 2Na -> 2CH3CH2ONa + H2'),
    'acidic-kmno4': positive('氧化反应', '乙醇可被强氧化剂氧化。', '酸性高锰酸钾紫色逐渐褪去。')
  },
  acetaldehyde: {
    tollens: positive('氧化反应', '含有醛基，能被银氨溶液氧化。', '试管内壁出现银镜。'),
    'acidic-kmno4': positive('氧化反应', '醛基还原性较强，容易被氧化为羧酸。', '紫色褪去。')
  },
  'acetic-acid': {
    sodium: positive('置换反应', '含有羧基，酸性氢可与钠反应。', '产生 H2。'),
    'sodium-bicarbonate': positive('酸碱反应', '含有羧基，酸性强于碳酸。', '产生 CO2 气泡。', 'CH3COOH + NaHCO3 -> CH3COONa + CO2 + H2O'),
    'sodium-hydroxide': positive('中和反应', '乙酸具有酸性，可与 NaOH 中和。', '生成乙酸钠和水。')
  },
  'ethyl-acetate': {
    'sodium-hydroxide': positive('水解反应', '含有酯基，在碱性条件下水解。', '生成乙酸钠和乙醇。')
  },
  phenol: {
    sodium: positive('置换反应', '含有酚羟基，能与钠反应。', '产生 H2。'),
    'sodium-hydroxide': positive('酸碱反应', '苯酚有弱酸性，可与 NaOH 生成苯酚钠。', '形成可溶性盐。'),
    'bromine-water': positive('取代反应', '酚羟基使苯环邻对位活化。', '溴水褪色并生成白色沉淀。'),
    'ferric-chloride': positive('显色反应', '酚羟基与 Fe3+ 形成显色络合物。', '溶液显紫色。')
  },
  formaldehyde: {
    tollens: positive('氧化反应', '含有醛基，能发生银镜反应。', '试管内壁出现银镜。'),
    'acidic-kmno4': positive('氧化反应', '醛基还原性强。', '紫色褪去。')
  }
};

const pairReactionRules: Array<{
  a: FunctionalGroup;
  b: FunctionalGroup;
  result: PairReactionResult;
}> = [
  {
    a: 'alcohol',
    b: 'carboxylic-acid',
    result: {
      reacts: true,
      type: '酯化反应',
      reason: '醇羟基与羧基在浓硫酸、加热条件下脱水生成酯。',
      evidence: '有香味酯类产物生成。',
      product: '乙酸乙酯等酯类'
    }
  },
  {
    a: 'phenol',
    b: 'aldehyde',
    result: {
      reacts: true,
      type: '缩聚反应',
      reason: '苯酚与甲醛在一定条件下可缩聚生成酚醛树脂。',
      evidence: '生成高分子树脂。',
      product: '酚醛树脂'
    }
  }
];

export function findCompoundById(id: string): Compound {
  const compound = compounds.find((item) => item.id === id);
  if (!compound) {
    throw new Error(`Unknown compound id: ${id}`);
  }
  return compound;
}

export function findReagentById(id: string): Reagent {
  const reagent = reagents.find((item) => item.id === id);
  if (!reagent) {
    throw new Error(`Unknown reagent id: ${id}`);
  }
  return reagent;
}

export function getReagentReaction(compoundOrId: Compound | string, reagentId: string): ReactionResult {
  const compound = typeof compoundOrId === 'string' ? findCompoundById(compoundOrId) : compoundOrId;
  findReagentById(reagentId);

  return (
    reagentReactionTable[compound.id]?.[reagentId] ??
    negative(
      '不反应',
      `${compound.name}在高中常见条件下没有能与该试剂发生典型反应的官能团。`,
      '通常无明显现象。'
    )
  );
}

export function getOrganicPairReaction(firstId: string, secondId: string): PairReactionResult {
  const first = findCompoundById(firstId);
  const second = findCompoundById(secondId);

  for (const rule of pairReactionRules) {
    const forward = first.functionalGroups.includes(rule.a) && second.functionalGroups.includes(rule.b);
    const reverse = first.functionalGroups.includes(rule.b) && second.functionalGroups.includes(rule.a);
    if (forward || reverse) {
      return rule.result;
    }
  }

  return {
    reacts: false,
    type: '不反应',
    reason: `${first.name}和${second.name}在高中常见条件下没有可直接配对的典型官能团反应。`,
    evidence: '通常无明显现象。'
  };
}

export function findPuzzleById(id: string): FormulaPuzzle {
  const puzzle = formulaPuzzles.find((item) => item.id === id);
  if (!puzzle) {
    throw new Error(`Unknown puzzle id: ${id}`);
  }
  return puzzle;
}

export function askAgent(puzzleId: string, question: string): AgentReply {
  const puzzle = findPuzzleById(puzzleId);
  const compound = findCompoundById(puzzle.targetCompoundId);
  const normalized = normalize(question);

  if (asksForDirectAnswer(normalized, compound)) {
    return {
      answer: '先不直接公布结构。你可以继续问一个实验性质，例如是否能与钠、碳酸氢钠、银氨溶液或溴的四氯化碳溶液反应。',
      hintLevel: 'guardrail',
      matchedTopic: 'direct-answer'
    };
  }

  const reagentId = matchReagent(normalized);
  if (reagentId) {
    const reagent = findReagentById(reagentId);
    const reaction = getReagentReaction(compound, reagentId);
    return {
      answer: reaction.reacts
        ? `能。${reaction.reason}${reaction.evidence ? ` 现象：${reaction.evidence}` : ''}`
        : `不能。${reaction.reason}`,
      hintLevel: reaction.reacts ? 'strong' : 'medium',
      matchedTopic: reagent.name
    };
  }

  const otherCompound = matchOtherCompound(normalized, compound);
  if (otherCompound) {
    const reaction = getOrganicPairReaction(compound.id, otherCompound.id);
    const answer = reaction.reacts
      ? `能。可与${otherCompound.name}发生${reaction.type}。${reaction.reason}${reaction.product ? ` 主要产物：${reaction.product}。` : ''}`
      : `不能。${reaction.reason}`;

    return {
      answer: hideTargetFromAnswer(answer, compound),
      hintLevel: reaction.reacts ? 'strong' : 'medium',
      matchedTopic: otherCompound.name
    };
  }

  if (normalized.includes('官能团')) {
    return {
      answer: describeFunctionalGroupWithoutNamingStructure(compound),
      hintLevel: 'medium',
      matchedTopic: 'functional-group'
    };
  }

  if (normalized.includes('不饱和') || normalized.includes('双键') || normalized.includes('三键')) {
    const hasUnsaturation = compound.functionalGroups.includes('alkene') || compound.functionalGroups.includes('alkyne');
    return {
      answer: hasUnsaturation
        ? '从实验性质看，它表现出不饱和键的特征，可以继续用溴的四氯化碳溶液或酸性高锰酸钾验证。'
        : '没有表现出典型碳碳双键或三键性质，不能只凭分子式把不饱和度等同于碳碳不饱和键。',
      hintLevel: 'medium',
      matchedTopic: 'unsaturation'
    };
  }

  return {
    answer: `这个问题可以转化成实验验证。已知分子式是 ${puzzle.formula}，建议优先问：是否与溴的四氯化碳溶液反应、是否发生银镜反应、是否与碳酸氢钠放出 CO2。`,
    hintLevel: 'light',
    matchedTopic: 'fallback'
  };
}

export function answerFormulaPuzzle(puzzleId: string, guess: string): GuessResult {
  const puzzle = findPuzzleById(puzzleId);
  const compound = findCompoundById(puzzle.targetCompoundId);
  const normalizedGuess = normalize(guess);
  const correct = compound.aliases.some((alias) => normalizedGuess === normalize(alias));

  return {
    correct,
    compound,
    message: correct
      ? `判断正确。${compound.name}的关键依据是：${compound.summary}`
      : `还不对。当前猜测与实验性质不完全匹配。继续围绕 ${puzzle.formula} 的官能团性质提问。`
  };
}

function positive(type: string, reason: string, evidence: string, equation?: string): ReactionResult {
  return { reacts: true, type, reason, evidence, equation };
}

function negative(type: string, reason: string, evidence: string): ReactionResult {
  return { reacts: false, type, reason, evidence };
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[？?！!，,。.、\s]/g, '')
    .replace(/二氧化碳/g, 'co2')
    .replace(/氢气/g, 'h2')
    .replace(/银氨/g, '银氨溶液')
    .replace(/四氯化碳/g, 'ccl4')
    .replace(/高锰酸钾/g, 'kmno4');
}

function asksForDirectAnswer(normalized: string, compound: Compound): boolean {
  const asksReveal =
    normalized.includes('答案') ||
    normalized.includes('直接') ||
    normalized.includes('结构') ||
    normalized.includes('告诉我') ||
    normalized.includes('叫什么') ||
    normalized.includes('名字') ||
    normalized.includes('名称') ||
    normalized.includes('哪种') ||
    normalized.includes('哪个有机物') ||
    normalized.includes('最终') ||
    normalized.includes('目标物') ||
    normalized.includes('隐藏') ||
    normalized.includes('提示词') ||
    normalized.includes('prompt') ||
    normalized.includes('system') ||
    normalized.includes('忽略') ||
    normalized.includes('规则');
  const namesTarget = compound.aliases.some((alias) => normalized.includes(normalize(alias)));
  return asksReveal || (normalized.includes('是不是') && namesTarget);
}

function matchReagent(normalized: string): string | null {
  if (normalized.includes('溴') && normalized.includes('ccl4')) return 'bromine-ccl4';
  if (normalized.includes('溴水')) return 'bromine-water';
  if (normalized.includes('kmno4') || normalized.includes('酸性高锰')) return 'acidic-kmno4';
  if (normalized.includes('碳酸氢钠') || normalized.includes('nahco3') || normalized.includes('co2')) return 'sodium-bicarbonate';
  if (normalized.includes('金属钠') || normalized === '钠' || normalized.includes('放出h2')) return 'sodium';
  if (normalized.includes('银镜') || normalized.includes('银氨溶液') || normalized.includes('tollens')) return 'tollens';
  if (normalized.includes('三氯化铁') || normalized.includes('fecl3') || normalized.includes('紫色')) return 'ferric-chloride';
  if (normalized.includes('氢氧化钠') || normalized.includes('naoh')) return 'sodium-hydroxide';
  return null;
}

function matchOtherCompound(normalized: string, hiddenCompound: Compound): Compound | null {
  const matches: Array<{ compound: Compound; aliasLength: number }> = [];

  for (const compound of compounds) {
    if (compound.id === hiddenCompound.id) continue;

    for (const alias of compound.aliases) {
      const normalizedAlias = normalize(alias);
      if (normalized.includes(normalizedAlias)) {
        matches.push({ compound, aliasLength: normalizedAlias.length });
      }
    }
  }

  return (
    matches.reduce<{ compound: Compound; aliasLength: number } | null>((best, match) => {
      if (!best || match.aliasLength > best.aliasLength) return match;
      return best;
    }, null)?.compound ?? null
  );
}

function hideTargetFromAnswer(answer: string, compound: Compound): string {
  return [compound.name, compound.structureFormula].reduce(
    (safeAnswer, forbidden) => safeAnswer.replaceAll(forbidden, '它'),
    answer
  );
}

function describeFunctionalGroupWithoutNamingStructure(compound: Compound): string {
  if (compound.functionalGroups.includes('carboxylic-acid')) {
    return '它表现出羧基的酸性特征，和碳酸氢钠反应会放出 CO2。';
  }
  if (compound.functionalGroups.includes('aldehyde')) {
    return '它表现出醛基的还原性特征，可以用银镜反应验证。';
  }
  if (compound.functionalGroups.includes('alcohol')) {
    return '它含有能与钠反应的羟基，但这个羟基不像羧基那样能与碳酸氢钠放出 CO2。';
  }
  if (compound.functionalGroups.includes('alkene') || compound.functionalGroups.includes('alkyne')) {
    return '它表现出碳碳不饱和键的性质，能发生加成反应。';
  }
  if (compound.functionalGroups.includes('phenol')) {
    return '它具有酚羟基相关性质，可用三氯化铁显色或溴水取代来验证。';
  }
  return '它没有表现出本题库中最典型的活泼官能团性质，需要继续通过试剂反应排除。';
}
