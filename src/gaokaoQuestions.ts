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
    id: 'gk-alkene-oxidation',
    puzzleId: 'puzzle-ethene',
    title: '烯烃加成与氧化辨析',
    formula: 'C2H4',
    examFocus: ['烯烃', '加成反应', '酸性高锰酸钾氧化'],
    task: '用溴的四氯化碳溶液和酸性高锰酸钾溶液的现象辨析烯烃的加成与氧化性质。',
    publicClues: ['只含 C、H 两种元素', '能被酸性高锰酸钾溶液氧化']
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
    publicClues: ['相对分子质量为 60', '红外显示 O-H 和 C-O', '氢谱有四组信号，峰面积比为 2∶1∶2∶3']
  },
  {
    id: 'gk-ir-nmr-butanol',
    puzzleId: 'puzzle-butan-2-ol',
    title: 'C4H10O 的高考式结构推断',
    formula: 'C4H10O',
    examFocus: ['同分异构体', '红外识别官能团', '核磁氢谱面积比'],
    task: '在多个醇和醚的候选结构中，根据实验性质锁定结构。',
    publicClues: ['不饱和度为 0', '红外有宽强 O-H 吸收', '氢谱有五组信号']
  },
  {
    id: 'gk-formaldehyde-reduction',
    puzzleId: 'puzzle-formaldehyde',
    title: '甲醛的还原性与银镜反应',
    formula: 'CH2O',
    examFocus: ['甲醛', '银镜反应', '醛基氧化'],
    task: '根据分子式和弱氧化剂实验现象，判断是否存在醛基并说明氧化产物方向。',
    publicClues: ['只含一个碳原子', '不饱和度为 1', '可与银氨溶液反应']
  },
  {
    id: 'gk-formaldehyde-polycondensation',
    puzzleId: 'puzzle-formaldehyde',
    title: '甲醛参与缩聚反应判断',
    formula: 'CH2O',
    examFocus: ['甲醛', '缩聚反应', '酚醛树脂'],
    task: '结合甲醛与苯酚的反应特点，判断其在有机合成题中的连接作用。',
    publicClues: ['含醛基', '可作为缩聚反应中的小分子连接单元']
  },
  {
    id: 'gk-ketone-carbonyl',
    puzzleId: 'puzzle-acetone',
    title: '酮羰基与醛基的实验鉴别',
    formula: 'C3H6O',
    examFocus: ['酮羰基', '醛酮鉴别', '银镜反应排除'],
    task: '同为含羰基分子，结合银镜反应和红外信息判断该物质是否为酮。',
    publicClues: ['不饱和度为 1', '红外可见 C=O 吸收', '银氨溶液中无银镜现象']
  },
  {
    id: 'gk-acid-esterification',
    puzzleId: 'puzzle-acetic-acid',
    title: '羧酸的酯化反应条件',
    formula: 'C2H4O2',
    examFocus: ['羧酸', '酯化反应', '可逆反应'],
    task: '判断该物质能否与乙醇在浓硫酸加热条件下生成酯，并说明官能团依据。',
    publicClues: ['含两个氧原子', '能与碳酸氢钠放出 CO2', '可与醇发生酯化']
  },
  {
    id: 'gk-phenol-acidity',
    puzzleId: 'puzzle-phenol',
    title: '酚羟基酸性与取代综合',
    formula: 'C6H6O',
    examFocus: ['酚羟基', '酸性比较', '溴水取代'],
    task: '比较酚羟基与醇羟基的性质差异，并用氢氧化钠和溴水实验验证。',
    publicClues: ['可与 NaOH 反应', '遇 FeCl3 显色', '可使溴水褪色并生成沉淀']
  },
  {
    id: 'gk-benzene-substitution',
    puzzleId: 'puzzle-benzene',
    title: '苯环取代与加成辨析',
    formula: 'C6H6',
    examFocus: ['苯环', '取代反应', '加成反应辨析'],
    task: '解释苯不直接使溴的四氯化碳溶液褪色，但在催化剂条件下可发生取代反应。',
    publicClues: ['不饱和度为 4', '常温下不表现普通烯烃加成性质', '可发生苯环取代']
  },
  {
    id: 'gk-aromatic-c7h8o-isomers',
    puzzleId: 'puzzle-benzyl-alcohol',
    title: 'C7H8O 芳香含氧物的同分异构筛选',
    formula: 'C7H8O',
    examFocus: ['C7H8O 同分异构体', '苯甲醇', '苯酚与芳香醚鉴别'],
    task: '结合 FeCl3 显色、金属钠反应和氧化信息，在苯甲醇、苯酚、苯甲醚之间筛选结构。',
    publicClues: ['含苯环', '不与 FeCl3 显紫色', '可与金属钠放出 H2']
  },
  {
    id: 'gk-toluene-benzyl-benzoate-route',
    puzzleId: 'puzzle-benzyl-benzoate',
    title: '甲苯制备苯甲酸苄酯的路线判断',
    formula: 'C14H12O2',
    examFocus: ['甲苯侧链氧化', '苄氯水解', '苯甲酸苄酯'],
    task: '从甲苯出发，比较侧链氧化、光照氯代、水解和酯化的先后关系，判断目标酯结构。',
    publicClues: ['KMnO4/H+ 可把甲基氧化为羧基', 'Cl2/hv 可发生侧链氯代', '苯甲酸与苯甲醇可酯化']
  },
  {
    id: 'gk-benzyl-chloride-hydrolysis',
    puzzleId: 'puzzle-benzyl-alcohol',
    title: '苄氯水解与苄醇生成',
    formula: 'C7H8O',
    examFocus: ['苄氯水解', '卤代烃水解', '苄位转化'],
    task: '判断苄氯在 NaOH 水溶液中转化为苯甲醇的官能团变化，并说明为何是取代水解。',
    publicClues: ['苄位含 C-Cl 键', 'NaOH/H2O 条件', '产物能与金属钠反应']
  }
];
