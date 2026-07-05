import { describe, expect, test } from 'vitest';
import {
  answerFormulaPuzzle,
  askAgent,
  calculateUnsaturationIndex,
  findCompoundById,
  findPuzzleById,
  getOrganicPairReaction,
  getReagentReaction
} from '../src/chemistry';

describe('unsaturation index calculation', () => {
  test.each([
    ['C6H6', 4],
    ['C4H10O', 0],
    ['C2H4', 1],
    ['C2H2', 2],
    ['CH3Cl', 0],
    ['C9H9NaO3', 5]
  ])('calculates textbook unsaturation index for %s', (formula, expected) => {
    expect(calculateUnsaturationIndex(formula)).toBe(expected);
  });
});

describe('reagent reaction rules', () => {
  test('ethene decolorizes bromine in carbon tetrachloride by addition', () => {
    const ethene = findCompoundById('ethene');
    const reaction = getReagentReaction(ethene, 'bromine-ccl4');

    expect(reaction.reacts).toBe(true);
    expect(reaction.type).toBe('加成反应');
    expect(reaction.reason).toContain('碳碳双键');
  });

  test('ethanol reacts with sodium but does not decolorize bromine in carbon tetrachloride', () => {
    const ethanol = findCompoundById('ethanol');

    expect(getReagentReaction(ethanol, 'sodium').reacts).toBe(true);
    expect(getReagentReaction(ethanol, 'bromine-ccl4').reacts).toBe(false);
  });

  test('acetic acid releases carbon dioxide with sodium bicarbonate', () => {
    const aceticAcid = findCompoundById('acetic-acid');
    const reaction = getReagentReaction(aceticAcid, 'sodium-bicarbonate');

    expect(reaction.reacts).toBe(true);
    expect(reaction.evidence).toContain('CO2');
  });
});

describe('organic pair reactions', () => {
  test('ethanol and acetic acid can esterify', () => {
    const reaction = getOrganicPairReaction('ethanol', 'acetic-acid');

    expect(reaction.reacts).toBe(true);
    expect(reaction.type).toBe('酯化反应');
    expect(reaction.product).toContain('乙酸乙酯');
  });

  test('benzene and ethanol do not react under normal high-school conditions', () => {
    const reaction = getOrganicPairReaction('benzene', 'ethanol');

    expect(reaction.reacts).toBe(false);
    expect(reaction.reason).toContain('高中常见条件');
  });
});

describe('formula puzzle agent', () => {
  test('textbook-derived advanced puzzles include spectral evidence and gaokao focus', () => {
    const butan2ol = findPuzzleById('puzzle-butan-2-ol');
    const propan1ol = findPuzzleById('puzzle-propan-1-ol');

    expect(butan2ol.difficulty).toBe('高考');
    expect(butan2ol.evidenceCards?.some((card) => card.title.includes('红外'))).toBe(true);
    expect(butan2ol.evidenceCards?.some((card) => card.title.includes('核磁'))).toBe(true);
    expect(butan2ol.examFocus?.join('、')).toContain('同分异构体');
    expect(propan1ol.evidenceCards?.some((card) => card.title.includes('质谱'))).toBe(true);
    expect(propan1ol.examFocus?.join('、')).toContain('氢谱');
  });

  test('agent answers reagent questions from the hidden compound properties', () => {
    const reply = askAgent('puzzle-acetic-acid', '它能和碳酸氢钠反应吗？');

    expect(reply.answer).toContain('能');
    expect(reply.answer).toContain('羧基');
    expect(reply.hintLevel).toBe('strong');
  });

  test('agent answers textbook NMR evidence without revealing the advanced target', () => {
    const compound = findCompoundById('butan-2-ol');
    const reply = askAgent('puzzle-butan-2-ol', '核磁共振氢谱有什么线索？');

    expect(reply.answer).toContain('五组');
    expect(reply.answer).toContain('1∶1∶2∶3∶3');
    expect(reply.answer).not.toContain(compound.name);
    expect(reply.answer).not.toContain(compound.structureFormula);
    expect(reply.matchedTopic).toContain('核磁');
  });

  test('agent answers textbook IR evidence for alcohol isomer screening', () => {
    const compound = findCompoundById('propan-1-ol');
    const reply = askAgent('puzzle-propan-1-ol', '红外光谱说明什么？');

    expect(reply.answer).toContain('O-H');
    expect(reply.answer).toContain('C-O');
    expect(reply.answer).toContain('排除醚类');
    expect(reply.answer).not.toContain(compound.name);
    expect(reply.matchedTopic).toContain('红外');
  });

  test.each([
    ['puzzle-acetic-acid', 'acetic-acid', '它能和氢氧化钠反应吗？'],
    ['puzzle-phenol', 'phenol', '它能和氢氧化钠反应吗？'],
    ['puzzle-ethanol', 'ethanol', '它能被酸性高锰酸钾氧化吗？'],
    ['puzzle-benzene', 'benzene', '它能和溴的四氯化碳溶液反应吗？']
  ])('agent redacts hidden target from reagent answers for %s', (puzzleId, compoundId, question) => {
    const compound = findCompoundById(compoundId);
    const reply = askAgent(puzzleId, question);

    expect(reply.matchedTopic).not.toBe('fallback');
    for (const term of [compound.name, compound.structureFormula, ...compound.aliases]) {
      if (term.toLowerCase() === compound.formula.toLowerCase()) continue;
      expect(reply.answer.toLowerCase()).not.toContain(term.toLowerCase());
    }
  });

  test('agent refuses to reveal the structure directly', () => {
    const reply = askAgent('puzzle-ethanol', '答案是不是乙醇？直接告诉我结构');

    expect(reply.answer).toContain('先不直接公布');
    expect(reply.hintLevel).toBe('guardrail');
  });

  test('agent refuses indirect requests for the hidden compound name', () => {
    const reply = askAgent('puzzle-ethanol', '这个物质叫什么名字？');

    expect(reply.answer).toContain('先不直接公布');
    expect(reply.hintLevel).toBe('guardrail');
  });

  test('agent answers whether hidden ethanol can react with acetic acid without revealing target name', () => {
    const reply = askAgent('puzzle-ethanol', '它能和乙酸发生反应吗？');

    expect(reply.answer).toContain('能');
    expect(reply.answer).toContain('酯化反应');
    expect(reply.answer).not.toContain('乙醇');
    expect(reply.hintLevel).toBe('strong');
  });

  test('agent answers negative organic-pair questions without revealing target name', () => {
    const reply = askAgent('puzzle-ethanol', '它能和苯在高中常见条件下反应吗？');

    expect(reply.answer).toContain('不能');
    expect(reply.answer).not.toContain('乙醇');
    expect(reply.hintLevel).toBe('medium');
  });

  test('agent prefers phenol over benzene when organic-pair aliases overlap', () => {
    const reply = askAgent('puzzle-formaldehyde', '它能和苯酚发生反应吗？');

    expect(reply.answer).toContain('能');
    expect(reply.answer).toContain('缩聚反应');
    expect(reply.answer).not.toContain('甲醛');
    expect(reply.answer).not.toContain('HCHO');
    expect(reply.matchedTopic).toBe('苯酚');
    expect(reply.hintLevel).toBe('strong');
  });

  test('agent does not apply formaldehyde phenol condensation to acetaldehyde', () => {
    const reply = askAgent('puzzle-acetaldehyde', '它能和苯酚发生反应吗？');

    expect(reply.answer).toContain('不能');
    expect(reply.answer).not.toContain('酚醛树脂');
    expect(reply.answer).not.toContain('缩聚反应');
    expect(reply.answer).not.toContain('乙醛');
    expect(reply.matchedTopic).toBe('苯酚');
    expect(reply.hintLevel).toBe('medium');
  });

  test('agent prefers ethyl acetate over acetic acid when organic-pair aliases overlap', () => {
    const reply = askAgent('puzzle-ethanol', '它能和乙酸乙酯发生反应吗？');

    expect(reply.answer).toContain('不能');
    expect(reply.answer).toContain('没有可直接配对');
    expect(reply.answer).not.toContain('酯化反应');
    expect(reply.answer).not.toContain('乙醇');
    expect(reply.matchedTopic).toBe('乙酸乙酯');
  });

  test('agent does not treat benzene ring questions as organic-pair reactions', () => {
    const reply = askAgent('puzzle-phenol', '它含有苯环吗？');

    expect(reply.answer).not.toContain('可直接配对');
    expect(reply.matchedTopic).toBe('fallback');
  });

  test('agent does not treat benzene ring substitution questions as benzene-pair reactions', () => {
    const reply = askAgent('puzzle-phenol', '它的苯环能发生取代反应吗？');

    expect(reply.answer).not.toContain('可直接配对');
    expect(reply.matchedTopic).not.toBe('苯');
  });

  test('agent does not treat reactive benzene ring mentions as benzene-pair reactions', () => {
    const reply = askAgent('puzzle-phenol', '它含有苯环会反应吗？');

    expect(reply.answer).not.toContain('可直接配对');
    expect(reply.matchedTopic).not.toBe('苯');
  });

  test('agent does not treat formula comparison mentions as organic-pair reactions', () => {
    const reply = askAgent('puzzle-phenol', '它的分子式和苯一样吗？');

    expect(reply.answer).not.toContain('可直接配对');
    expect(reply.matchedTopic).toBe('fallback');
  });

  test('agent redacts hidden benzene without corrupting visible phenol', () => {
    const reply = askAgent('puzzle-benzene', '它能和苯酚发生反应吗？');

    expect(reply.answer).toContain('不能');
    expect(reply.answer).toContain('苯酚');
    expect(reply.answer).toContain('它和苯酚');
    expect(reply.answer).not.toContain('它酚');
    expect(reply.matchedTopic).toBe('苯酚');
  });

  test('agent redacts hidden phenol when visible benzene alias overlaps', () => {
    const reply = askAgent('puzzle-phenol', '它能和苯发生反应吗？');

    expect(reply.answer).toContain('不能');
    expect(reply.answer).toContain('它和苯');
    expect(reply.answer).not.toContain('苯酚');
    expect(reply.matchedTopic).toBe('苯');
  });

  test('structure guesses accept Chinese names and aliases', () => {
    expect(answerFormulaPuzzle('puzzle-ethanol', '乙醇').correct).toBe(true);
    expect(answerFormulaPuzzle('puzzle-ethanol', '二甲醚').correct).toBe(false);
  });
});
