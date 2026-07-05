import { describe, expect, test } from 'vitest';
import { findCompoundById, getReagentReaction, type AgentReply } from '../src/chemistry';
import {
  createEvidenceNoteFromAgentReply,
  functionalGroupRoleLabel,
  getExpectedPhenomena,
  getExpectedPhenomenon,
  getPairRoleForCompound,
  getUnsaturationPredictionFeedback,
  methodNodeDetails
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

  test('keeps mixed reagent phenomena as multiple acceptable observations', () => {
    const phenolBromineWater = getReagentReaction('phenol', 'bromine-water');

    expect(getExpectedPhenomena(phenolBromineWater)).toEqual(['precipitate', 'decolorize']);
  });

  test('keeps unsaturation prediction feedback exploratory instead of absolute', () => {
    const feedback = getUnsaturationPredictionFeedback('C6H6', 4, ['benzene-ring']);

    expect(feedback).toContain('可能支持');
    expect(feedback).toContain('仍需实验验证');
  });

  test('keeps unsaturation calculation out of the method route data source', () => {
    expect(methodNodeDetails.map((node) => node.id)).not.toContain('unsaturation');
    expect(methodNodeDetails.map((node) => node.label)).not.toContain('计算不饱和度');
  });

  test('asks for review when unsaturation prediction conflicts with index', () => {
    const feedback = getUnsaturationPredictionFeedback('C6H6', 4, ['none']);

    expect(feedback).toContain('需要复盘');
    expect(feedback).toContain('不能只凭公式');
  });

  test('asks for review when saturated formula is predicted as unsaturated', () => {
    const feedback = getUnsaturationPredictionFeedback('C4H10O', 0, ['carbonyl']);

    expect(feedback).toContain('需要复盘');
  });

  test('asks for review when carbonyl is predicted without oxygen in formula', () => {
    const benzeneFeedback = getUnsaturationPredictionFeedback('C6H6', 4, ['carbonyl']);
    const etheneFeedback = getUnsaturationPredictionFeedback('C2H4', 1, ['carbonyl']);

    expect(benzeneFeedback).toContain('需要复盘');
    expect(etheneFeedback).toContain('需要复盘');
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

  test('classifies excluded and exploratory agent replies separately', () => {
    const excludedReply: AgentReply = {
      answer: '不能。高中常见条件下没有典型反应。',
      hintLevel: 'medium',
      matchedTopic: '溴的四氯化碳溶液'
    };
    const guardrailReply: AgentReply = {
      answer: '先不直接公布结构。你可以继续问一个实验性质。',
      hintLevel: 'guardrail',
      matchedTopic: 'direct-answer'
    };
    const fallbackReply: AgentReply = {
      answer: '这个问题可以转化成实验验证。',
      hintLevel: 'light',
      matchedTopic: 'fallback'
    };

    expect(createEvidenceNoteFromAgentReply(excludedReply).kind).toBe('excluded');
    expect(createEvidenceNoteFromAgentReply(guardrailReply).kind).toBe('guess');
    expect(createEvidenceNoteFromAgentReply(fallbackReply).kind).toBe('guess');
  });

  test('classifies light guidance replies as exploratory notes', () => {
    const examFocusReply: AgentReply = {
      answer: '这题的高考拆题点是：不饱和度或分子式、官能团证据。',
      hintLevel: 'light',
      matchedTopic: '高考考点'
    };

    expect(createEvidenceNoteFromAgentReply(examFocusReply).kind).toBe('guess');
  });

  test('labels every current functional group value', () => {
    expect(functionalGroupRoleLabel(['alkane'])).toBe('烷烃');
    expect(functionalGroupRoleLabel(['alkene'])).toBe('碳碳双键');
    expect(functionalGroupRoleLabel(['alkyne'])).toBe('碳碳三键');
    expect(functionalGroupRoleLabel(['alcohol'])).toBe('醇羟基');
    expect(functionalGroupRoleLabel(['aldehyde'])).toBe('醛基');
    expect(functionalGroupRoleLabel(['carboxylic-acid'])).toBe('羧基');
    expect(functionalGroupRoleLabel(['ester'])).toBe('酯基');
    expect(functionalGroupRoleLabel(['phenol'])).toBe('酚羟基');
    expect(functionalGroupRoleLabel(['arene'])).toBe('苯环');
    expect(functionalGroupRoleLabel(['ketone'])).toBe('酮羰基');
  });
});
