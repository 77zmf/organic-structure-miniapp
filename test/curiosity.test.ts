import { describe, expect, test } from 'vitest';
import { findCompoundById, getReagentReaction, type AgentReply } from '../src/chemistry';
import {
  createEvidenceNoteFromAgentReply,
  getExpectedPhenomenon,
  getPairRoleForCompound,
  getUnsaturationPredictionFeedback
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

  test('keeps unsaturation prediction feedback exploratory instead of absolute', () => {
    const feedback = getUnsaturationPredictionFeedback('C6H6', 4, ['benzene-ring']);

    expect(feedback).toContain('可能支持');
    expect(feedback).toContain('仍需实验验证');
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
});
