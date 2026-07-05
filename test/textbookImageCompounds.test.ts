import { describe, expect, test } from 'vitest';
import { compounds, formulaPuzzles, getOrganicPairReaction, getReagentReaction } from '../src/chemistry';
import { elementStyles, getMoleculeModel, validateMoleculeModel, type ElementSymbol } from '../src/moleculeModels';
import { gaokaoQuestions } from '../src/gaokaoQuestions';

const textbookImageCompounds = [
  ['methane', '甲烷', 'CH4', ['alkane']],
  ['2-methylbutane', '2-甲基丁烷', 'C5H12', ['alkane']],
  ['ethene', '乙烯', 'C2H4', ['alkene']],
  ['4-methyl-2-pentene', '4-甲基-2-戊烯', 'C6H12', ['alkene']],
  ['acetylene', '乙炔', 'C2H2', ['alkyne']],
  ['2-butyne', '2-丁炔', 'C4H6', ['alkyne']],
  ['benzene', '苯', 'C6H6', ['arene']],
  ['toluene', '甲苯', 'C7H8', ['arene']],
  ['naphthalene', '萘', 'C10H8', ['arene']],
  ['iodomethane', '碘甲烷', 'CH3I', ['haloalkane']],
  ['bromoethane', '溴乙烷', 'C2H5Br', ['haloalkane']],
  ['ethanol', '乙醇', 'C2H6O', ['alcohol']],
  ['glycerol', '丙三醇', 'C3H8O3', ['alcohol']],
  ['diethyl-ether', '乙醚', 'C4H10O', ['ether']],
  ['anisole', '苯甲醚', 'C7H8O', ['arene', 'ether']],
  ['phenol', '苯酚', 'C6H6O', ['phenol', 'arene']],
  ['naphthol', '萘酚', 'C10H8O', ['phenol', 'arene']],
  ['formaldehyde', '甲醛', 'CH2O', ['aldehyde']],
  ['acetaldehyde', '乙醛', 'C2H4O', ['aldehyde']],
  ['acetone', '丙酮', 'C3H6O', ['ketone']],
  ['cyclohexanone', '环己酮', 'C6H10O', ['ketone']],
  ['acetic-acid', '乙酸', 'C2H4O2', ['carboxylic-acid']],
  ['oxalic-acid', '乙二酸', 'C2H2O4', ['carboxylic-acid']],
  ['ethyl-acetate', '乙酸乙酯', 'C4H8O2', ['ester']],
  ['tristearin', '硬脂酸甘油酯', 'C57H110O6', ['ester']],
  ['aniline', '苯胺', 'C6H7N', ['arene', 'amine']],
  ['ethane-1-2-diamine', '1,2-乙二胺', 'C2H8N2', ['amine']],
  ['acetamide', '乙酰胺', 'C2H5NO', ['amide']],
  ['urea', '碳酰胺', 'CH4N2O', ['amide']],
  ['benzoic-acid', '苯甲酸', 'C7H6O2', ['arene', 'carboxylic-acid']],
  ['benzyl-chloride', '苄氯', 'C7H7Cl', ['arene', 'haloalkane']],
  ['benzyl-alcohol', '苯甲醇', 'C7H8O', ['arene', 'alcohol']],
  ['benzaldehyde', '苯甲醛', 'C7H6O', ['arene', 'aldehyde']],
  ['benzyl-benzoate', '苯甲酸苄酯', 'C14H12O2', ['arene', 'ester']],
  ['sodium-3-hydroxy-3-phenylpropanoate', '3-羟基-3-苯基丙酸钠', 'C9H9NaO3', ['arene', 'alcohol', 'carboxylate']]
] as const;

describe('textbook image compound coverage', () => {
  test.each(textbookImageCompounds)('includes %s from the supplied textbook images', (id, name, formula, groups) => {
    const compound = compounds.find((item) => item.id === id);

    expect(compound).toBeDefined();
    expect(compound?.name).toBe(name);
    expect(compound?.formula).toBe(formula);
    expect(compound?.functionalGroups).toEqual(expect.arrayContaining([...groups]));
  });

  test('every textbook image compound has a valid 3D model', () => {
    for (const [id] of textbookImageCompounds) {
      const model = getMoleculeModel(id);

      expect(model.compoundId).toBe(id);
      expect(model.atoms.length).toBeGreaterThan(1);
      expect(model.bonds.length).toBeGreaterThan(0);
      expect(validateMoleculeModel(model)).toEqual([]);
    }
  });

  test('3D renderer can style textbook hetero atoms and halogens', () => {
    const textbookElements: ElementSymbol[] = ['N', 'Cl', 'Br', 'I', 'Na'];

    for (const element of textbookElements) {
      expect(elementStyles[element]).toBeDefined();
    }
  });
});

describe('textbook image chemistry rules', () => {
  test('new unsaturated compounds use the same reagent logic as textbook alkene and alkyne examples', () => {
    expect(getReagentReaction('4-methyl-2-pentene', 'bromine-ccl4').reacts).toBe(true);
    expect(getReagentReaction('2-butyne', 'acidic-kmno4').reacts).toBe(true);
  });

  test('textbook halogenated hydrocarbons and amides support hydrolysis judgments', () => {
    expect(getReagentReaction('bromoethane', 'sodium-hydroxide').type).toContain('水解');
    expect(getReagentReaction('acetamide', 'sodium-hydroxide').type).toContain('水解');
  });

  test('the benzyl benzoate route is represented as an esterification pair reaction', () => {
    const reaction = getOrganicPairReaction('benzoic-acid', 'benzyl-alcohol');

    expect(reaction.reacts).toBe(true);
    expect(reaction.product).toContain('苯甲酸苄酯');
  });
});

describe('textbook image gaokao route coverage', () => {
  test('adds high-level puzzles and gaokao prompts for the aromatic ester synthesis image', () => {
    expect(formulaPuzzles.some((puzzle) => puzzle.targetCompoundId === 'benzyl-benzoate')).toBe(true);
    expect(formulaPuzzles.some((puzzle) => puzzle.targetCompoundId === 'benzyl-alcohol')).toBe(true);

    const focusText = gaokaoQuestions.flatMap((question) => question.examFocus).join('、');

    expect(focusText).toContain('甲苯侧链氧化');
    expect(focusText).toContain('苄氯水解');
    expect(focusText).toContain('苯甲酸苄酯');
  });
});
