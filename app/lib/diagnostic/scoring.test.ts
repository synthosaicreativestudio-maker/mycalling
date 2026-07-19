import { describe, expect, it } from 'vitest';
import { diagnosticQuestions } from '../../data/questions';
import { bfiScorer, cognitiveStyleScorer, contextScorer, growthScorer, icarScorer, procrastinationScorer, pvqScorer, riasecScorer, viaScorer } from './scoring';
import { viaStrengths } from '../../data/viaStrengths';
import { pvqValues } from '../../data/pvqValues';

describe('riasecScorer', () => {
  it('computes per-scale averages and a tie-broken Holland code from varied answers', () => {
    const answers: Record<string, number> = {
      'riasec-r1': 5, 'riasec-r2': 4, 'riasec-r3': 5, 'riasec-r4': 4,
      'riasec-i1': 3, 'riasec-i2': 3, 'riasec-i3': 3, 'riasec-i4': 3,
      'riasec-a1': 2, 'riasec-a2': 2, 'riasec-a3': 2, 'riasec-a4': 2,
      'riasec-s1': 4, 'riasec-s2': 5, 'riasec-s3': 4, 'riasec-s4': 5,
      'riasec-e1': 1, 'riasec-e2': 2, 'riasec-e3': 1, 'riasec-e4': 2,
      'riasec-c1': 3, 'riasec-c2': 4, 'riasec-c3': 3, 'riasec-c4': 4,
    };
    const result = riasecScorer.score(answers, diagnosticQuestions);
    expect(result.scores).toEqual({ R: 4.5, I: 3, A: 2, S: 4.5, E: 1.5, C: 3.5, hollandCode: 'RSC' });
    expect(result.reliability).toBe('high');
  });

  it('flags flat-pattern answers as low reliability', () => {
    const answers: Record<string, number> = {};
    ['r1', 'r2', 'r3', 'r4', 'i1', 'i2', 'i3', 'i4', 'a1', 'a2', 'a3', 'a4', 's1', 's2', 's3', 's4', 'e1', 'e2', 'e3', 'e4', 'c1', 'c2', 'c3', 'c4']
      .forEach((suffix) => { answers[`riasec-${suffix}`] = 3; });
    const result = riasecScorer.score(answers, diagnosticQuestions);
    expect(result.reliability).toBe('low');
  });
});

describe('bfiScorer', () => {
  it('maps historical scale aliases (C_bigfive/E_bigfive/A_bigfive) to canonical O/C/E/A/N keys, plus LOC/AMB', () => {
    const answers: Record<string, number> = {
      'bfi-o1': 4, 'bfi-o2': 5, 'bfi-o3': 4, 'bfi-o4': 2, // reverse -> 4
      'bfi-c1': 4, 'bfi-c2': 2, 'bfi-c3': 4, 'bfi-c4': 2, // reverse -> 4, 4
      'bfi-e1': 5, 'bfi-e2': 1, 'bfi-e3': 5, 'bfi-e4': 1, // reverse -> 5, 5
      'bfi-a1': 3, 'bfi-a2': 4, 'bfi-a3': 3, 'bfi-a4': 4, // a3 reverse -> 3
      'bfi-n1': 2, 'bfi-n2': 4, 'bfi-n3': 2, 'bfi-n4': 4, // reverse -> 2, 2
      'bfi-loc1': 4, 'bfi-loc2': 2, 'bfi-loc3': 4, 'bfi-loc4': 2, // reverse -> 4, 4
      'bfi-amb1': 4, 'bfi-amb2': 2, 'bfi-amb3': 4, // reverse -> 4
    };
    const result = bfiScorer.score(answers, diagnosticQuestions);
    expect(result.scores.O).toBe(4.25);
    expect(result.scores.C).toBe(4);
    expect(result.scores.E).toBe(5);
    expect(result.scores.A).toBe(3.5);
    expect(result.scores.N).toBe(2);
    expect(result.scores.LOC).toBe(4);
    expect(result.scores.AMB).toBe(4);
    expect(result.scores.honestyFlag).toBe(false);
    expect(result.reliability).toBe('high');
    // Legacy bogus keys (bug in the pre-refactor route) must not resurface.
    expect(result.scores).not.toHaveProperty('C_bigfive');
  });

  it('flags honesty when reverse-pair answers contradict each other on a single scale', () => {
    const answers: Record<string, number> = {
      'bfi-o1': 3, 'bfi-o2': 3, 'bfi-o3': 3, 'bfi-o4': 3,
      'bfi-c1': 5, 'bfi-c2': 5, 'bfi-c3': 5, 'bfi-c4': 5, // direct 5 vs reverse-adjusted (6-5)=1 -> deviation 4
      'bfi-e1': 3, 'bfi-e2': 3, 'bfi-e3': 3, 'bfi-e4': 3,
      'bfi-a1': 3, 'bfi-a2': 3, 'bfi-a3': 3, 'bfi-a4': 3,
      'bfi-n1': 3, 'bfi-n2': 3, 'bfi-n3': 3, 'bfi-n4': 3,
      'bfi-loc1': 3, 'bfi-loc2': 3, 'bfi-loc3': 3, 'bfi-loc4': 3,
      'bfi-amb1': 3, 'bfi-amb2': 3, 'bfi-amb3': 3,
    };
    const result = bfiScorer.score(answers, diagnosticQuestions);
    expect(result.scores.honestyFlag).toBe(true);
    expect(result.reliability).toBe('medium');
  });
});

describe('icarScorer', () => {
  it('computes raw score, subscale breakdown and age-relative band', () => {
    const answers: Record<string, number> = {
      'icar-1': 4, // correct, numeric
      'icar-2': 2, // correct, verbal
      'icar-3': 1, // wrong
      'icar-4': 2, // correct, verbal
      'icar-5': 4, // correct, numeric
      'icar-6': 1, // wrong
      'icar-7': 3, // correct, spatial
      'icar-8': 2, // wrong
      'icar-9': 1, // correct, spatial
    };
    const result = icarScorer.score(answers, diagnosticQuestions);
    expect(result.scores).toEqual({
      raw: 6,
      bySubscale: { verbal: 2, numeric: 2, spatial: 2 },
      band: 'solid',
    });
    expect(result.reliability).toBe('high');
  });

  it('interprets the same raw score differently across age groups', () => {
    const answers: Record<string, number> = {
      'icar-1': 4, 'icar-2': 2, 'icar-3': 2, 'icar-4': 2, 'icar-5': 4, 'icar-6': 2,
    };
    const youngResult = icarScorer.score(answers, diagnosticQuestions, { age: 11 });
    const olderResult = icarScorer.score(answers, diagnosticQuestions, { age: 17 });
    expect(youngResult.scores.raw).toBe(6);
    expect(youngResult.scores.band).toBe('strong'); // 6 >= high(6) for 10-12
    expect(olderResult.scores.band).toBe('solid'); // 6 >= mid(6) but < high(8) for 16-17
  });
});

describe('procrastinationScorer', () => {
  it('sums direct and reverse-adjusted items', () => {
    const answers: Record<string, number> = {
      'lay-1': 4, 'lay-2': 2, 'lay-3': 5, 'lay-4': 1,
    };
    const result = procrastinationScorer.score(answers, diagnosticQuestions);
    expect(result.scores).toEqual({ score: 18 });
    expect(result.reliability).toBe('high');
  });
});

describe('cognitiveStyleScorer', () => {
  it('усредняет по конструктам и учитывает реверс тормозного контроля', () => {
    const answers: Record<string, number> = {
      'cogstyle-inh-1': 4, 'cogstyle-inh-2': 2, // reverse: 6-2=4 → avg (4+4)/2 = 4
      'cogstyle-flex-1': 5, 'cogstyle-flex-2': 3, // avg 4
      'cogstyle-deep-1': 5, 'cogstyle-deep-2': 5, // avg 5
      'cogstyle-surface-1': 2, // 2
      'cogstyle-selfeff-1': 4, 'cogstyle-selfeff-2': 4, // avg 4
      'cogstyle-plan-1': 3, 'cogstyle-plan-2': 5, // avg 4
      'cogstyle-mon-1': 5, 'cogstyle-mon-2': 5, // avg 5
      'cogstyle-cur-1': 5, // 5
    };
    const result = cognitiveStyleScorer.score(answers, diagnosticQuestions);
    const s = result.scores as Record<string, number>;
    expect(s.execInhibition).toBe(4);
    expect(s.execFlexibility).toBe(4);
    expect(s.learnDeep).toBe(5);
    expect(s.learnSurface).toBe(2);
    expect(s.selfEfficacyAcademic).toBe(4);
    expect(s.metacogPlanning).toBe(4);
    expect(s.metacogMonitoring).toBe(5);
    expect(s.curiosityEpistemic).toBe(5);
  });

  it('без ответов даёт нейтральный fallback 3 по всем 8 конструктам (не падает)', () => {
    const result = cognitiveStyleScorer.score({}, diagnosticQuestions);
    const s = result.scores as Record<string, number>;
    expect(s.execInhibition).toBe(3);
    expect(Object.keys(s)).toHaveLength(8);
  });
});

describe('viaScorer', () => {
  it('scores all 24 strengths and picks the top-5 signature strengths', () => {
    const answers: Record<string, number> = {};
    viaStrengths.forEach((s, i) => {
      // Give 'creativity' (index 0) the top score, then descending, so the
      // expected top-5 is deterministic and matches viaStrengths declaration order on ties.
      answers[`via-${s.code}`] = Math.max(1, 5 - Math.floor(i / 6));
    });
    const result = viaScorer.score(answers, diagnosticQuestions);
    const scores = result.scores as Record<string, number> & { signatureStrengths: string[] };
    expect(scores.creativity).toBe(5);
    expect(scores.signatureStrengths).toHaveLength(5);
    // Top-5 should all be the highest-scoring (first 6 declared) strengths.
    const topDeclaredCodes = viaStrengths.slice(0, 6).map((s) => s.code);
    scores.signatureStrengths.forEach((code) => {
      expect(topDeclaredCodes).toContain(code);
    });
    expect(result.reliability).toBe('high');
  });

  it('flags flat-pattern answers (all neutral) as low reliability', () => {
    const answers: Record<string, number> = {};
    viaStrengths.forEach((s) => {
      answers[`via-${s.code}`] = 3;
    });
    const result = viaScorer.score(answers, diagnosticQuestions);
    expect(result.reliability).toBe('low');
  });

  it('averages each virtue from its member strengths (P0.1 fix: was always undefined before)', () => {
    const answers: Record<string, number> = {};
    viaStrengths.forEach((s) => {
      // wisdom strengths get 5, everything else gets 1 — virtue_wisdom should isolate that.
      answers[`via-${s.code}`] = s.virtue === 'wisdom' ? 5 : 1;
    });
    const result = viaScorer.score(answers, diagnosticQuestions);
    const scores = result.scores as Record<string, number>;
    expect(scores.virtue_wisdom).toBe(5);
    expect(scores.virtue_courage).toBe(1);
    expect(scores.virtue_transcendence).toBe(1);
  });
});

describe('growthScorer ("Внутренний компас": Grit/Mindset/TEIQue-SF)', () => {
  it('averages each subscale and reverse-scores flagged items', () => {
    const answers: Record<string, number> = {
      'grit-1': 5, 'grit-2': 1, 'grit-3': 5, 'grit-4': 1, // reverse items -> 5,5
      'mindset-1': 4, 'mindset-2': 2, 'mindset-3': 4, 'mindset-4': 2, // reverse -> 4,4
      'teique-sa-1': 3, 'teique-sa-2': 3, // reverse -> 3
      'teique-sr-1': 5, 'teique-sr-2': 1, // reverse -> 5
    };
    const result = growthScorer.score(answers, diagnosticQuestions);
    expect(result.scores).toEqual({ GRIT: 5, MINDSET: 4, TEIQUE_SA: 3, TEIQUE_SR: 5 });
  });
});

describe('contextScorer ("Карта ресурсов")', () => {
  it('applies reverse-scoring per field and passes through raw fields untouched', () => {
    const answers: Record<string, number> = {
      'ctx-family-pressure': 5, // reverse -> 1 (low pressure is the healthy direction)
      'ctx-family-finance': 4,
      'ctx-mobility': 3,
      'ctx-health': 1, // reverse -> 5
      'ctx-edu-env': 2,
      'ctx-career-readiness': 5,
      'ctx-digital-divide': 5, // reverse -> 1
    };
    const result = contextScorer.score(answers, diagnosticQuestions);
    expect(result.scores).toEqual({
      familyPressure: 1,
      familyFinance: 4,
      mobility: 3,
      health: 5,
      educationEnvAvail: 2,
      careerReadiness: 5,
      digitalDivide: 1,
    });
  });
});

describe('pvqScorer', () => {
  it('centers scores (ipsatization) and picks top-3 values with deterministic tie-break', () => {
    const answers: Record<string, number> = {
      'pvq-self_direction': 5,
      'pvq-stimulation': 2,
      'pvq-hedonism': 2,
      'pvq-achievement': 5,
      'pvq-power': 2,
      'pvq-security': 2,
      'pvq-conformity': 2,
      'pvq-tradition': 1,
      'pvq-benevolence': 2,
      'pvq-universalism': 2,
    };
    const result = pvqScorer.score(answers, diagnosticQuestions);
    const scores = result.scores as { raw: Record<string, number>; centered: Record<string, number>; topValues: string[] };
    expect(scores.raw.self_direction).toBe(5);
    expect(scores.centered.self_direction).toBe(2.5);
    expect(scores.centered.tradition).toBe(-1.5);
    expect(scores.topValues).toEqual(['self_direction', 'achievement', 'stimulation']);
  });

  it('covers all 10 declared values', () => {
    const answers: Record<string, number> = {};
    pvqValues.forEach((v) => { answers[`pvq-${v.code}`] = 3; });
    const result = pvqScorer.score(answers, diagnosticQuestions);
    const scores = result.scores as { raw: Record<string, number> };
    expect(Object.keys(scores.raw)).toHaveLength(10);
  });
});
