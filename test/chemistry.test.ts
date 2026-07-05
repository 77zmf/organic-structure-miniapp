import { describe, expect, test } from 'vitest';
import {
  answerFormulaPuzzle,
  askAgent,
  findCompoundById,
  getOrganicPairReaction,
  getReagentReaction
} from '../src/chemistry';

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
  test('agent answers reagent questions from the hidden compound properties', () => {
    const reply = askAgent('puzzle-acetic-acid', '它能和碳酸氢钠反应吗？');

    expect(reply.answer).toContain('能');
    expect(reply.answer).toContain('羧基');
    expect(reply.hintLevel).toBe('strong');
  });

  test('agent refuses to reveal the structure directly', () => {
    const reply = askAgent('puzzle-ethanol', '答案是不是乙醇？直接告诉我结构');

    expect(reply.answer).toContain('先不直接公布');
    expect(reply.hintLevel).toBe('guardrail');
  });

  test('structure guesses accept Chinese names and aliases', () => {
    expect(answerFormulaPuzzle('puzzle-ethanol', '乙醇').correct).toBe(true);
    expect(answerFormulaPuzzle('puzzle-ethanol', '二甲醚').correct).toBe(false);
  });
});
