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
  | 'ketone'
  | 'haloalkane'
  | 'ether'
  | 'amine'
  | 'amide'
  | 'carboxylate';

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

export interface PuzzleEvidenceCard {
  title: string;
  detail: string;
  inference: string;
}

export interface FormulaPuzzle {
  id: string;
  formula: string;
  targetCompoundId: string;
  openingHint: string;
  possibleStructures: string[];
  difficulty?: '基础' | '进阶' | '高考';
  evidenceCards?: PuzzleEvidenceCard[];
  examFocus?: string[];
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

interface FormulaCounts {
  carbon: number;
  hydrogen: number;
  nitrogen: number;
  monovalentAdjustment: number;
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
    id: 'propan-1-ol',
    name: '1-丙醇',
    formula: 'C3H8O',
    aliases: ['1-丙醇', '正丙醇', 'propan-1-ol', '1-propanol', 'ch3ch2ch2oh'],
    structureFormula: 'CH3CH2CH2OH',
    functionalGroups: ['alcohol'],
    level: 'advanced',
    summary: '含有醇羟基，可与钠反应放出氢气；可由相对分子质量 60、红外 O-H/C-O 以及氢谱四组峰推断。'
  },
  {
    id: 'butan-2-ol',
    name: '2-丁醇',
    formula: 'C4H10O',
    aliases: ['2-丁醇', '仲丁醇', 'butan-2-ol', '2-butanol', 'ch3chohch2ch3'],
    structureFormula: 'CH3CHOHCH2CH3',
    functionalGroups: ['alcohol'],
    level: 'advanced',
    summary: 'C4H10O 的醇类同分异构体；红外宽峰指向 O-H，氢谱五组峰且面积比为 1∶1∶2∶3∶3。'
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
  },
  {
    id: '2-methylbutane',
    name: '2-甲基丁烷',
    formula: 'C5H12',
    aliases: ['2-甲基丁烷', '异戊烷', '2-methylbutane', 'isopentane', 'ch3ch(ch3)ch2ch3'],
    structureFormula: 'CH3CH(CH3)CH2CH3',
    functionalGroups: ['alkane'],
    level: 'basic',
    summary: '支链烷烃，属于饱和烃，高中常见条件下主要体现取代反应而不是加成反应。'
  },
  {
    id: '4-methyl-2-pentene',
    name: '4-甲基-2-戊烯',
    formula: 'C6H12',
    aliases: ['4-甲基-2-戊烯', '4-methyl-2-pentene', 'ch3ch=chch(ch3)ch3'],
    structureFormula: 'CH3CH=CHCH(CH3)CH3',
    functionalGroups: ['alkene'],
    level: 'intermediate',
    summary: '含有碳碳双键，可发生加成反应，并能使酸性高锰酸钾溶液褪色。'
  },
  {
    id: '2-butyne',
    name: '2-丁炔',
    formula: 'C4H6',
    aliases: ['2-丁炔', '2-butyne', 'but-2-yne', 'ch3c≡cch3'],
    structureFormula: 'CH3C≡CCH3',
    functionalGroups: ['alkyne'],
    level: 'intermediate',
    summary: '含有碳碳三键，可发生加成反应，也可被强氧化剂氧化。'
  },
  {
    id: 'toluene',
    name: '甲苯',
    formula: 'C7H8',
    aliases: ['甲苯', 'toluene', 'c6h5ch3'],
    structureFormula: 'C6H5CH3',
    functionalGroups: ['arene'],
    level: 'intermediate',
    summary: '苯环连有甲基，侧链可被酸性高锰酸钾氧化为苯甲酸。'
  },
  {
    id: 'naphthalene',
    name: '萘',
    formula: 'C10H8',
    aliases: ['萘', 'naphthalene', 'c10h8'],
    structureFormula: 'C10H8',
    functionalGroups: ['arene'],
    level: 'advanced',
    summary: '稠环芳香烃，含两个稠合苯环，体现芳香烃的稳定性和取代反应特征。'
  },
  {
    id: 'iodomethane',
    name: '碘甲烷',
    formula: 'CH3I',
    aliases: ['碘甲烷', 'iodomethane', 'methyl iodide', 'ch3i'],
    structureFormula: 'CH3I',
    functionalGroups: ['haloalkane'],
    level: 'intermediate',
    summary: '卤代烃，碳卤键可在碱性水溶液中发生水解生成醇。'
  },
  {
    id: 'bromoethane',
    name: '溴乙烷',
    formula: 'C2H5Br',
    aliases: ['溴乙烷', 'bromoethane', 'ethyl bromide', 'ch3ch2br'],
    structureFormula: 'CH3CH2Br',
    functionalGroups: ['haloalkane'],
    level: 'intermediate',
    summary: '卤代烃，可在 NaOH 水溶液中发生水解生成乙醇。'
  },
  {
    id: 'glycerol',
    name: '丙三醇',
    formula: 'C3H8O3',
    aliases: ['丙三醇', '甘油', 'glycerol', 'propane-1,2,3-triol', 'hoch2chohch2oh'],
    structureFormula: 'HOCH2CHOHCH2OH',
    functionalGroups: ['alcohol'],
    level: 'intermediate',
    summary: '多元醇，含三个醇羟基，可与钠反应放出氢气。'
  },
  {
    id: 'diethyl-ether',
    name: '乙醚',
    formula: 'C4H10O',
    aliases: ['乙醚', 'diethyl ether', 'ethoxyethane', 'ch3ch2och2ch3'],
    structureFormula: 'CH3CH2OCH2CH3',
    functionalGroups: ['ether'],
    level: 'intermediate',
    summary: '含醚键，不含 O-H 键，通常不能与金属钠放出氢气。'
  },
  {
    id: 'anisole',
    name: '苯甲醚',
    formula: 'C7H8O',
    aliases: ['苯甲醚', '茴香醚', 'anisole', 'methoxybenzene', 'c6h5och3'],
    structureFormula: 'C6H5OCH3',
    functionalGroups: ['arene', 'ether'],
    level: 'advanced',
    summary: '芳香醚，含苯环和醚键；与苯甲醇、苯酚可构成 C7H8O 的官能团异构辨析。'
  },
  {
    id: 'naphthol',
    name: '萘酚',
    formula: 'C10H8O',
    aliases: ['萘酚', 'naphthol', 'c10h7oh'],
    structureFormula: 'C10H7OH',
    functionalGroups: ['phenol', 'arene'],
    level: 'advanced',
    summary: '稠环芳香酚，具有酚羟基性质，可与三氯化铁显色，也可发生芳环取代。'
  },
  {
    id: 'cyclohexanone',
    name: '环己酮',
    formula: 'C6H10O',
    aliases: ['环己酮', 'cyclohexanone', 'c6h10o'],
    structureFormula: 'C6H10O',
    functionalGroups: ['ketone'],
    level: 'advanced',
    summary: '环状酮，含酮羰基，通常不能发生银镜反应。'
  },
  {
    id: 'oxalic-acid',
    name: '乙二酸',
    formula: 'C2H2O4',
    aliases: ['乙二酸', '草酸', 'oxalic acid', 'hooccooh'],
    structureFormula: 'HOOCCOOH',
    functionalGroups: ['carboxylic-acid'],
    level: 'intermediate',
    summary: '二元羧酸，具有羧酸酸性，可与碳酸氢钠反应放出二氧化碳。'
  },
  {
    id: 'tristearin',
    name: '硬脂酸甘油酯',
    formula: 'C57H110O6',
    aliases: ['硬脂酸甘油酯', '三硬脂酸甘油酯', 'tristearin', 'glyceryl tristearate'],
    structureFormula: 'C3H5(OOC(CH2)16CH3)3',
    functionalGroups: ['ester'],
    level: 'advanced',
    summary: '油脂类三酯，含多个酯基，可在碱性条件下水解。'
  },
  {
    id: 'aniline',
    name: '苯胺',
    formula: 'C6H7N',
    aliases: ['苯胺', 'aniline', 'c6h5nh2'],
    structureFormula: 'C6H5NH2',
    functionalGroups: ['arene', 'amine'],
    level: 'advanced',
    summary: '芳香胺，氨基连在苯环上，使苯环更易发生取代反应。'
  },
  {
    id: 'ethane-1-2-diamine',
    name: '1,2-乙二胺',
    formula: 'C2H8N2',
    aliases: ['1,2-乙二胺', '乙二胺', 'ethane-1,2-diamine', 'ethylenediamine', 'h2nch2ch2nh2'],
    structureFormula: 'H2NCH2CH2NH2',
    functionalGroups: ['amine'],
    level: 'advanced',
    summary: '二元胺，含两个氨基，可用于认识胺类官能团。'
  },
  {
    id: 'acetamide',
    name: '乙酰胺',
    formula: 'C2H5NO',
    aliases: ['乙酰胺', 'acetamide', 'ch3conh2'],
    structureFormula: 'CH3CONH2',
    functionalGroups: ['amide'],
    level: 'advanced',
    summary: '含酰胺基，可在较强酸性或碱性、加热条件下水解。'
  },
  {
    id: 'urea',
    name: '碳酰胺',
    formula: 'CH4N2O',
    aliases: ['碳酰胺', '尿素', 'urea', 'h2nconh2'],
    structureFormula: 'H2NCONH2',
    functionalGroups: ['amide'],
    level: 'intermediate',
    summary: '含酰胺结构，是高中教材常见含氮有机物示例。'
  },
  {
    id: 'benzoic-acid',
    name: '苯甲酸',
    formula: 'C7H6O2',
    aliases: ['苯甲酸', 'benzoic acid', 'c6h5cooh'],
    structureFormula: 'C6H5COOH',
    functionalGroups: ['arene', 'carboxylic-acid'],
    level: 'advanced',
    summary: '芳香羧酸，可由甲苯侧链氧化得到，也可与醇发生酯化。'
  },
  {
    id: 'benzyl-chloride',
    name: '苄氯',
    formula: 'C7H7Cl',
    aliases: ['苄氯', '氯化苄', 'benzyl chloride', 'c6h5ch2cl'],
    structureFormula: 'C6H5CH2Cl',
    functionalGroups: ['arene', 'haloalkane'],
    level: 'advanced',
    summary: '苄位卤代烃，可由甲苯在光照下侧链氯代得到，并可水解为苯甲醇。'
  },
  {
    id: 'benzyl-alcohol',
    name: '苯甲醇',
    formula: 'C7H8O',
    aliases: ['苯甲醇', 'benzyl alcohol', 'c6h5ch2oh'],
    structureFormula: 'C6H5CH2OH',
    functionalGroups: ['arene', 'alcohol'],
    level: 'advanced',
    summary: '芳香醇，可由苄氯水解得到，也可与苯甲酸发生酯化生成苯甲酸苄酯。'
  },
  {
    id: 'benzaldehyde',
    name: '苯甲醛',
    formula: 'C7H6O',
    aliases: ['苯甲醛', 'benzaldehyde', 'c6h5cho'],
    structureFormula: 'C6H5CHO',
    functionalGroups: ['arene', 'aldehyde'],
    level: 'advanced',
    summary: '芳香醛，含醛基，可被氧化为苯甲酸，也可被还原为苯甲醇。'
  },
  {
    id: 'benzyl-benzoate',
    name: '苯甲酸苄酯',
    formula: 'C14H12O2',
    aliases: ['苯甲酸苄酯', 'benzyl benzoate', 'c6h5cooch2c6h5'],
    structureFormula: 'C6H5COOCH2C6H5',
    functionalGroups: ['arene', 'ester'],
    level: 'advanced',
    summary: '芳香酯，可由苯甲酸和苯甲醇在浓硫酸、加热条件下酯化得到。'
  },
  {
    id: 'sodium-3-hydroxy-3-phenylpropanoate',
    name: '3-羟基-3-苯基丙酸钠',
    formula: 'C9H9NaO3',
    aliases: ['3-羟基-3-苯基丙酸钠', 'β-羟基-β-苯基丙酸钠', 'sodium 3-hydroxy-3-phenylpropanoate'],
    structureFormula: 'HOCH(C6H5)CH2COONa',
    functionalGroups: ['arene', 'alcohol', 'carboxylate'],
    level: 'advanced',
    summary: '含苯环、醇羟基和羧酸盐结构，可作为综合题中官能团识别与盐类结构分析素材。'
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
    possibleStructures: ['乙醇', '二甲醚'],
    difficulty: '进阶',
    evidenceCards: [
      {
        title: '不饱和度',
        detail: 'C2H6O 的不饱和度为 0。',
        inference: '不含环、碳碳双键或羰基，优先在醇和醚之间筛选。'
      },
      {
        title: '官能团检验',
        detail: '若能与金属钠反应放出 H2，则含有 O-H 键。',
        inference: '这可以把醇类同分异构体与醚类区分开。'
      }
    ],
    examFocus: ['不饱和度初筛', '醇醚官能团异构', '金属钠检验羟基']
  },
  {
    id: 'puzzle-propan-1-ol',
    formula: 'C3H8O',
    targetCompoundId: 'propan-1-ol',
    openingHint: '这类题常给相对分子质量、红外键型和氢谱面积比，需要先定类别再定碳骨架。',
    possibleStructures: ['1-丙醇', '2-丙醇', '甲乙醚'],
    difficulty: '高考',
    evidenceCards: [
      {
        title: '质谱信息',
        detail: '相对分子质量为 60。',
        inference: '结合只含 C、H、O 时，可锁定 C3H8O。'
      },
      {
        title: '红外光谱',
        detail: '有 C-H、O-H、C-O 键的振动吸收。',
        inference: '含醇羟基，可排除醚类。'
      },
      {
        title: '核磁共振氢谱',
        detail: '有四组信号，峰面积比为 2∶1∶2∶3。',
        inference: '四种氢环境和面积比共同指向端位醇骨架。'
      }
    ],
    examFocus: ['相对分子质量确定分子式', '红外排除官能团类型异构', '氢谱峰组数与面积比定结构']
  },
  {
    id: 'puzzle-butan-2-ol',
    formula: 'C4H10O',
    targetCompoundId: 'butan-2-ol',
    openingHint: '教材微项目给出 C4H10O 多种同分异构体，需要结合红外和氢谱排除醚类与其他醇。',
    possibleStructures: ['1-丁醇', '2-丁醇', '2-甲基-1-丙醇', '2-甲基-2-丙醇', '甲氧基丙烷', '乙氧基乙烷'],
    difficulty: '高考',
    evidenceCards: [
      {
        title: '不饱和度',
        detail: 'C4H10O 的不饱和度为 0。',
        inference: '没有环、C=C、C=O 等不饱和结构，重点比较醇和醚。'
      },
      {
        title: '红外光谱',
        detail: '3363 cm^-1 处有强而宽的吸收峰。',
        inference: '含 O-H，优先判断为醇而不是醚。'
      },
      {
        title: '核磁共振氢谱',
        detail: '有五组信号，峰面积比为 1∶1∶2∶3∶3。',
        inference: '氢环境数和比例排除高度对称结构，指向仲醇骨架。'
      }
    ],
    examFocus: ['同分异构体筛选', '红外识别官能团', '核磁氢谱峰组数与面积比']
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
    id: 'puzzle-benzene',
    formula: 'C6H6',
    targetCompoundId: 'benzene',
    openingHint: '可先问它是否能使溴的四氯化碳溶液或酸性高锰酸钾褪色。',
    possibleStructures: ['苯']
  },
  {
    id: 'puzzle-formaldehyde',
    formula: 'CH2O',
    targetCompoundId: 'formaldehyde',
    openingHint: '可先判断是否含醛基，银镜反应很关键。',
    possibleStructures: ['甲醛']
  },
  {
    id: 'puzzle-acetone',
    formula: 'C3H6O',
    targetCompoundId: 'acetone',
    openingHint: '同为含羰基有机物，可用银镜反应区分醛和酮。',
    possibleStructures: ['丙酮', '丙醛', '丙烯醇'],
    difficulty: '高考',
    evidenceCards: [
      {
        title: '不饱和度',
        detail: 'C3H6O 的不饱和度为 1。',
        inference: '可能含 C=O、C=C 或环，需要用官能团性质继续筛选。'
      },
      {
        title: '官能团检验',
        detail: '不能发生银镜反应，但红外可见 C=O 吸收。',
        inference: '支持酮羰基而不是醛基。'
      }
    ],
    examFocus: ['酮羰基', '醛酮鉴别', '银镜反应排除']
  },
  {
    id: 'puzzle-benzyl-alcohol',
    formula: 'C7H8O',
    targetCompoundId: 'benzyl-alcohol',
    openingHint: '同分异构体可能是苯甲醇、苯酚或苯甲醚，可先问是否显酚羟基性质。',
    possibleStructures: ['苯甲醇', '苯酚', '苯甲醚'],
    difficulty: '高考',
    evidenceCards: [
      {
        title: '同分异构体筛选',
        detail: 'C7H8O 可对应芳香醇、酚或芳香醚。',
        inference: '需要用 FeCl3 显色、金属钠反应和氧化信息区分类别。'
      },
      {
        title: '官能团检验',
        detail: '不与 FeCl3 显紫色，但可与金属钠反应放出 H2。',
        inference: '支持醇羟基而不是酚羟基或醚键。'
      },
      {
        title: '转化关系',
        detail: '可由苄氯水解得到，也可被氧化为苯甲酸。',
        inference: '说明羟基位于苄位碳上。'
      }
    ],
    examFocus: ['C7H8O 同分异构体', '苯甲醇', '苯酚与芳香醚鉴别']
  },
  {
    id: 'puzzle-benzyl-benzoate',
    formula: 'C14H12O2',
    targetCompoundId: 'benzyl-benzoate',
    openingHint: '可从甲苯侧链氧化、苄氯水解和羧酸酯化三步合成路线反推结构。',
    possibleStructures: ['苯甲酸苄酯'],
    difficulty: '高考',
    evidenceCards: [
      {
        title: '路线拆解',
        detail: '甲苯经酸性 KMnO4 可生成苯甲酸，经 Cl2/hv 后水解可生成苯甲醇。',
        inference: '同一原料可分别提供羧基端和苄醇端。'
      },
      {
        title: '官能团组合',
        detail: '苯甲酸与苯甲醇在浓硫酸、加热条件下发生酯化。',
        inference: '目标物含芳香酯基，结构可写为 C6H5COOCH2C6H5。'
      }
    ],
    examFocus: ['甲苯侧链氧化', '苄氯水解', '苯甲酸苄酯']
  }
];

export function calculateUnsaturationIndex(formula: string): number {
  const counts = parseFormulaCounts(formula);
  return counts.carbon + 1 + counts.nitrogen / 2 - (counts.hydrogen + counts.monovalentAdjustment) / 2;
}

function parseFormulaCounts(formula: string): FormulaCounts {
  const counts: FormulaCounts = { carbon: 0, hydrogen: 0, nitrogen: 0, monovalentAdjustment: 0 };
  const tokens = formula.match(/[A-Z][a-z]?\d*/g) ?? [];

  for (const token of tokens) {
    const match = token.match(/^([A-Z][a-z]?)(\d*)$/);
    if (!match) continue;
    const element = match[1];
    const count = match[2] ? Number(match[2]) : 1;

    if (element === 'C') counts.carbon += count;
    if (element === 'H') counts.hydrogen += count;
    if (element === 'N') counts.nitrogen += count;
    if (element === 'F' || element === 'Cl' || element === 'Br' || element === 'I' || element === 'Na') {
      counts.monovalentAdjustment += count;
    }
  }

  return counts;
}

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
  'propan-1-ol': {
    sodium: positive('置换反应', '含有醇羟基，O-H 键可与钠反应。', '产生无色气体 H2。'),
    'acidic-kmno4': positive('氧化反应', '伯醇可被强氧化剂氧化。', '酸性高锰酸钾紫色逐渐褪去。')
  },
  'butan-2-ol': {
    sodium: positive('置换反应', '含有醇羟基，O-H 键可与钠反应。', '产生无色气体 H2。'),
    'acidic-kmno4': positive('氧化反应', '仲醇可被强氧化剂氧化。', '酸性高锰酸钾紫色逐渐褪去。')
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
  matches?: (first: Compound, second: Compound) => boolean;
  result: PairReactionResult;
}> = [
  {
    a: 'carboxylic-acid',
    b: 'alcohol',
    matches: (first, second) => matchesCompoundPair(first, second, 'benzoic-acid', 'benzyl-alcohol'),
    result: {
      reacts: true,
      type: '酯化反应',
      reason: '苯甲酸的羧基与苯甲醇的醇羟基在浓硫酸、加热条件下脱水成酯。',
      evidence: '生成芳香酯。',
      product: '苯甲酸苄酯'
    }
  },
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
    matches: (first, second) => matchesCompoundPair(first, second, 'formaldehyde', 'phenol'),
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

  const specificReaction = reagentReactionTable[compound.id]?.[reagentId];
  if (specificReaction) {
    return specificReaction;
  }

  const functionalGroupReaction = getFunctionalGroupReagentReaction(compound, reagentId);
  if (functionalGroupReaction) {
    return functionalGroupReaction;
  }

  return negative(
    '不反应',
    `${compound.name}在高中常见条件下没有能与该试剂发生典型反应的官能团。`,
    '通常无明显现象。'
  );
}

export function getOrganicPairReaction(firstId: string, secondId: string): PairReactionResult {
  const first = findCompoundById(firstId);
  const second = findCompoundById(secondId);

  for (const rule of pairReactionRules) {
    const forward = first.functionalGroups.includes(rule.a) && second.functionalGroups.includes(rule.b);
    const reverse = first.functionalGroups.includes(rule.b) && second.functionalGroups.includes(rule.a);
    if ((forward || reverse) && (!rule.matches || rule.matches(first, second))) {
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

  const evidenceReply = answerPuzzleEvidenceQuestion(puzzle, normalized, compound);
  if (evidenceReply) {
    return evidenceReply;
  }

  const reagentId = matchReagent(normalized);
  if (reagentId) {
    const reagent = findReagentById(reagentId);
    const reaction = getReagentReaction(compound, reagentId);
    const answer = reaction.reacts
      ? `能。${reaction.reason}${reaction.evidence ? ` 现象：${reaction.evidence}` : ''}`
      : `不能。${reaction.reason}`;

    return {
      answer: hideTargetFromAnswer(answer, compound),
      hintLevel: reaction.reacts ? 'strong' : 'medium',
      matchedTopic: reagent.name
    };
  }

  const otherCompound = hasOrganicPairIntent(normalized) ? matchOtherCompound(normalized, compound) : null;
  if (otherCompound) {
    const reaction = getOrganicPairReaction(compound.id, otherCompound.id);
    const answer = reaction.reacts
      ? `能。可与${otherCompound.name}发生${reaction.type}。${reaction.reason}${reaction.product ? ` 主要产物：${reaction.product}。` : ''}`
      : `不能。${reaction.reason}`;

    return {
      answer: hideTargetFromAnswer(answer, compound, [otherCompound]),
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
    answer: fallbackQuestionGuide(puzzle),
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

function getFunctionalGroupReagentReaction(compound: Compound, reagentId: string): ReactionResult | null {
  if (compound.id === 'toluene' && reagentId === 'acidic-kmno4') {
    return positive('氧化反应', '甲苯的苄位甲基可被酸性高锰酸钾氧化为羧基。', '紫色褪去，生成苯甲酸。');
  }

  if (compound.id === 'aniline' && reagentId === 'bromine-water') {
    return positive('取代反应', '氨基使苯环邻对位活化，能与溴水发生取代。', '溴水褪色并生成白色沉淀。');
  }

  if (compound.functionalGroups.includes('alkene')) {
    if (reagentId === 'bromine-ccl4') {
      return positive('加成反应', '含有碳碳双键，π 键易断裂并与 Br2 加成。', '溴的红棕色褪去。');
    }
    if (reagentId === 'bromine-water') {
      return positive('加成反应', '含有碳碳双键，可与溴发生加成。', '溴水褪色。');
    }
    if (reagentId === 'acidic-kmno4') {
      return positive('氧化反应', '含有碳碳双键，可被酸性高锰酸钾氧化。', '紫色褪去。');
    }
  }

  if (compound.functionalGroups.includes('alkyne')) {
    if (reagentId === 'bromine-ccl4' || reagentId === 'bromine-water') {
      return positive('加成反应', '含有碳碳三键，可连续发生加成反应。', '溴的颜色褪去。');
    }
    if (reagentId === 'acidic-kmno4') {
      return positive('氧化反应', '碳碳三键可被酸性高锰酸钾氧化。', '紫色褪去。');
    }
  }

  if (compound.functionalGroups.includes('phenol')) {
    if (reagentId === 'sodium') {
      return positive('置换反应', '含有酚羟基，能与钠反应。', '产生 H2。');
    }
    if (reagentId === 'sodium-hydroxide') {
      return positive('酸碱反应', '酚羟基具有弱酸性，可与 NaOH 生成酚盐。', '形成可溶性盐。');
    }
    if (reagentId === 'bromine-water') {
      return positive('取代反应', '酚羟基使芳环邻对位活化。', '溴水褪色并可能生成浅色沉淀。');
    }
    if (reagentId === 'ferric-chloride') {
      return positive('显色反应', '酚羟基可与 Fe3+ 形成显色络合物。', '溶液显紫色或发生特征显色。');
    }
  }

  if (compound.functionalGroups.includes('aldehyde')) {
    if (reagentId === 'tollens') {
      return positive('氧化反应', '含有醛基，能被银氨溶液氧化。', '试管内壁出现银镜。');
    }
    if (reagentId === 'acidic-kmno4') {
      return positive('氧化反应', '醛基还原性较强，容易被氧化为羧酸。', '紫色褪去。');
    }
  }

  if (compound.functionalGroups.includes('carboxylic-acid')) {
    if (reagentId === 'sodium') {
      return positive('置换反应', '含有羧基，酸性氢可与钠反应。', '产生 H2。');
    }
    if (reagentId === 'sodium-bicarbonate') {
      return positive('酸碱反应', '含有羧基，酸性强于碳酸。', '产生 CO2 气泡。');
    }
    if (reagentId === 'sodium-hydroxide') {
      return positive('中和反应', '羧酸具有酸性，可与 NaOH 中和。', '生成羧酸盐和水。');
    }
  }

  if (compound.functionalGroups.includes('alcohol')) {
    if (reagentId === 'sodium') {
      return positive('置换反应', '含有醇羟基，O-H 键可与钠反应。', '产生无色气体 H2。');
    }
    if (reagentId === 'acidic-kmno4') {
      return positive('氧化反应', '醇羟基连接的碳上有氢时，可被强氧化剂氧化。', '酸性高锰酸钾紫色逐渐褪去。');
    }
  }

  if (compound.functionalGroups.includes('ester') && reagentId === 'sodium-hydroxide') {
    return positive('水解反应', '含有酯基，在碱性条件下可水解。', '生成相应羧酸盐和醇。');
  }

  if (compound.functionalGroups.includes('haloalkane') && reagentId === 'sodium-hydroxide') {
    return positive('水解反应', '卤代烃中的碳卤键可在 NaOH 水溶液中断裂。', '生成相应醇和卤化钠。');
  }

  if (compound.functionalGroups.includes('amide') && reagentId === 'sodium-hydroxide') {
    return positive('水解反应', '酰胺基可在强碱并加热条件下水解。', '生成羧酸盐和含氮产物。');
  }

  return null;
}

function answerPuzzleEvidenceQuestion(
  puzzle: FormulaPuzzle,
  normalizedQuestion: string,
  compound: Compound
): AgentReply | null {
  const cards = puzzle.evidenceCards ?? [];
  const matchedCards = cards.filter((card) => evidenceCardMatchesQuestion(card, normalizedQuestion));

  if (matchedCards.length > 0) {
    const answer = matchedCards
      .map((card) => `${card.title}：${card.detail}${card.inference}`)
      .join(' ');

    return {
      answer: hideTargetFromAnswer(answer, compound),
      hintLevel: 'medium',
      matchedTopic: matchedCards.map((card) => card.title).join('、')
    };
  }

  if (puzzle.examFocus?.length && (normalizedQuestion.includes('高考') || normalizedQuestion.includes('考点') || normalizedQuestion.includes('拆题'))) {
    return {
      answer: `这题的高考拆题点是：${puzzle.examFocus.join('、')}。建议按“不饱和度或分子式 -> 官能团证据 -> 氢谱峰组数和面积比 -> 同分异构体排除”的顺序追问。`,
      hintLevel: 'light',
      matchedTopic: '高考考点'
    };
  }

  return null;
}

function evidenceCardMatchesQuestion(card: PuzzleEvidenceCard, normalizedQuestion: string): boolean {
  const haystack = normalize(`${card.title}${card.detail}${card.inference}`);
  const topicKeywords: string[][] = [
    ['红外', 'ir', '吸收峰', 'cm^-1'],
    ['核磁', 'nmr', '氢谱', '峰面积', '几组峰'],
    ['质谱', '相对分子质量', 'mr', '分子离子峰'],
    ['不饱和', '不饱和度'],
    ['官能团', '检验']
  ];

  return topicKeywords.some((keywords) => {
    const questionMentionsTopic = keywords.some((keyword) => normalizedQuestion.includes(normalize(keyword)));
    const cardMentionsTopic = keywords.some((keyword) => haystack.includes(normalize(keyword)));
    return questionMentionsTopic && cardMentionsTopic;
  });
}

function fallbackQuestionGuide(puzzle: FormulaPuzzle): string {
  if (puzzle.evidenceCards?.length) {
    return `这个问题可以转化成结构测定线索。已知分子式是 ${puzzle.formula}，建议优先问：不饱和度是多少、红外光谱有什么线索、核磁共振氢谱有几组峰、是否与典型试剂反应。`;
  }

  return `这个问题可以转化成实验验证。已知分子式是 ${puzzle.formula}，建议优先问：是否与溴的四氯化碳溶液反应、是否发生银镜反应、是否与碳酸氢钠放出 CO2。`;
}

function matchesCompoundPair(first: Compound, second: Compound, firstId: string, secondId: string): boolean {
  return (
    (first.id === firstId && second.id === secondId) ||
    (first.id === secondId && second.id === firstId)
  );
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

function hasOrganicPairIntent(normalized: string): boolean {
  return (
    normalized.includes('反应') ||
    normalized.includes('酯化') ||
    normalized.includes('缩聚') ||
    normalized.includes('加成') ||
    normalized.includes('取代') ||
    normalized.includes('水解') ||
    normalized.includes('能和') ||
    normalized.includes('能与') ||
    normalized.includes('可和') ||
    normalized.includes('可与') ||
    normalized.includes('可以和') ||
    normalized.includes('可以与')
  );
}

function matchOtherCompound(normalized: string, hiddenCompound: Compound): Compound | null {
  const matches: Array<{ compound: Compound; aliasLength: number }> = [];

  for (const compound of compounds) {
    if (compound.id === hiddenCompound.id) continue;

    for (const alias of compound.aliases) {
      const normalizedAlias = normalize(alias);
      if (isCompoundPartnerAliasMatch(normalized, normalizedAlias)) {
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

function isCompoundPartnerAliasMatch(normalized: string, normalizedAlias: string): boolean {
  const partnerLinks = ['加入', '以及', '可以与', '可以和', '能与', '能和', '可与', '可和', '同', '跟', '与', '和', '加'];
  const nonPartnerSuffixes = ['环', '基', '的'];
  let index = normalized.indexOf(normalizedAlias);

  while (index !== -1) {
    const before = normalized.slice(0, index);
    const after = normalized.slice(index + normalizedAlias.length);
    const hasPartnerLink = partnerLinks.some((link) => before.endsWith(link));
    const hasNonPartnerSuffix = nonPartnerSuffixes.some((suffix) => after.startsWith(suffix));

    if (hasPartnerLink && !hasNonPartnerSuffix) return true;
    index = normalized.indexOf(normalizedAlias, index + normalizedAlias.length);
  }

  return false;
}

function hideTargetFromAnswer(answer: string, compound: Compound, visibleCompounds: Compound[] = []): string {
  const forbiddenTerms = uniqueTerms([compound.name, compound.structureFormula, ...compound.aliases])
    .filter((term) => normalize(term) !== normalize(compound.formula))
    .sort((a, b) => b.length - a.length);
  const protectedRanges = visibleCompounds.flatMap((visibleCompound) =>
    uniqueTerms([visibleCompound.name, visibleCompound.structureFormula, ...visibleCompound.aliases])
      .flatMap((term) => findTermRanges(answer, term))
  );
  const replacements: Array<{ start: number; end: number }> = [];

  for (const term of forbiddenTerms) {
    for (const range of findTermRanges(answer, term)) {
      if (rangesContainAny(range, protectedRanges) || rangesOverlapAny(range, replacements)) continue;
      replacements.push(range);
    }
  }

  return replacements
    .sort((a, b) => b.start - a.start)
    .reduce((safeAnswer, range) => `${safeAnswer.slice(0, range.start)}它${safeAnswer.slice(range.end)}`, answer);
}

function uniqueTerms(terms: string[]): string[] {
  return Array.from(
    new Set(
      terms
        .map((term) => term.trim())
        .filter((term) => term.length > 1 || /[\u3400-\u9fff]/.test(term))
    )
  );
}

function findTermRanges(text: string, term: string): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = [];
  const lowerText = text.toLowerCase();
  const lowerTerm = term.toLowerCase();
  let index = lowerText.indexOf(lowerTerm);

  while (index !== -1) {
    ranges.push({ start: index, end: index + term.length });
    index = lowerText.indexOf(lowerTerm, index + term.length);
  }

  return ranges;
}

function rangesOverlapAny(
  range: { start: number; end: number },
  ranges: Array<{ start: number; end: number }>
): boolean {
  return ranges.some((item) => range.start < item.end && item.start < range.end);
}

function rangesContainAny(
  range: { start: number; end: number },
  ranges: Array<{ start: number; end: number }>
): boolean {
  return ranges.some((item) => item.start <= range.start && range.end <= item.end);
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
