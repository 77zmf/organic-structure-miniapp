import { describe, expect, test } from 'vitest';
import { formatChemicalFormula, formatChemistryText } from '../src/formatChemistry';

describe('chemical formula formatting', () => {
  test('renders molecular formula digits as subscripts', () => {
    expect(formatChemicalFormula('C4H10O')).toBe('C<sub>4</sub>H<sub>10</sub>O');
    expect(formatChemicalFormula('C9H8O4')).toBe('C<sub>9</sub>H<sub>8</sub>O<sub>4</sub>');
  });

  test('renders condensed structural formula digits as subscripts', () => {
    expect(formatChemicalFormula('CH3CH2OH')).toBe('CH<sub>3</sub>CH<sub>2</sub>OH');
    expect(formatChemicalFormula('CH3CHOHCH2CH3')).toBe('CH<sub>3</sub>CHOHCH<sub>2</sub>CH<sub>3</sub>');
  });

  test('escapes formula text before inserting subscript markup', () => {
    expect(formatChemicalFormula('C2H4<script>')).toBe('C<sub>2</sub>H<sub>4</sub>&lt;script&gt;');
  });

  test('formats formulas inside chemistry prose without touching spectra numbers', () => {
    expect(formatChemistryText('C4H10O 的不饱和度为 0，3363 cm^-1 处有吸收峰。')).toBe(
      'C<sub>4</sub>H<sub>10</sub>O 的不饱和度为 0，3363 cm^-1 处有吸收峰。'
    );
    expect(formatChemistryText('放出 H2 或 CO2，但 O-H 和 C=O 不需要下标。')).toBe(
      '放出 H<sub>2</sub> 或 CO<sub>2</sub>，但 O-H 和 C=O 不需要下标。'
    );
  });
});
