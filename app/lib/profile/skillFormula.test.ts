import { describe, expect, it } from 'vitest';
import { deriveSkillFormula, SkillFormulaProfile } from './skillFormula';
import { skills } from '../../data/skills';

describe('deriveSkillFormula', () => {
  it('is deterministic: same input always yields the same top3 in the same order', () => {
    const profile: SkillFormulaProfile = {
      riasec: { R: 2, I: 4.5, A: 3, S: 2.5, E: 2, C: 3.5 },
      bigFive: { O: 4, C: 4, E: 3, A: 3, N: 2 },
      icar: { bySubscale: { verbal: 6, numeric: 7, spatial: 3 } },
      via: { curiosity: 4.5, judgment: 4, signatureStrengths: ['curiosity', 'judgment'] },
    };
    const a = deriveSkillFormula(profile);
    const b = deriveSkillFormula(profile);
    expect(a.top3).toEqual(b.top3);
    expect(a.top3).toHaveLength(3);
    // High RIASEC.I + ICAR verbal/numeric should surface analytics-flavored skills.
    expect(a.top3).toContain('analytics');
  });

  it('returns an evidence sentence for every skill in top3', () => {
    const result = deriveSkillFormula({
      riasec: { R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 },
      bigFive: { O: 3, C: 3, E: 3, A: 3, N: 3 },
      icar: { bySubscale: { verbal: 4, numeric: 4, spatial: 4 } },
    } as SkillFormulaProfile);
    result.top3.forEach((code) => {
      expect(result.evidence[code]).toBeTruthy();
      expect(typeof result.evidence[code]).toBe('string');
    });
  });

  it('breaks ties by declaration order in skills.ts for a perfectly flat profile', () => {
    const flat: SkillFormulaProfile = {
      riasec: { R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 },
      bigFive: { O: 3, C: 3, E: 3, A: 3, N: 3 },
      icar: { bySubscale: { verbal: 4, numeric: 4, spatial: 4 } },
    };
    const result = deriveSkillFormula(flat);
    const declaredOrder = skills.map((s) => s.code);
    const expectedTop3 = declaredOrder.slice(0, 3);
    expect(result.top3).toEqual(expectedTop3);
  });
});
