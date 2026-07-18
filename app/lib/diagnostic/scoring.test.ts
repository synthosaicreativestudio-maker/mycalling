import { describe, expect, it } from 'vitest';
import { diagnosticQuestions } from '../../data/questions';
import { bfiScorer, icarScorer, procrastinationScorer, riasecScorer, viaScorer } from './scoring';
import { viaStrengths } from '../../data/viaStrengths';

describe('riasecScorer', () => {
  it('computes per-scale averages from varied answers', () => {
    const answers: Record<string, number> = {
      'riasec-r1': 5, 'riasec-r2': 4,
      'riasec-i1': 3, 'riasec-i2': 3,
      'riasec-a1': 2, 'riasec-a2': 2,
      'riasec-s1': 4, 'riasec-s2': 5,
      'riasec-e1': 1, 'riasec-e2': 2,
      'riasec-c1': 3, 'riasec-c2': 4,
    };
    const result = riasecScorer.score(answers, diagnosticQuestions);
    expect(result.scores).toEqual({ R: 4.5, I: 3, A: 2, S: 4.5, E: 1.5, C: 3.5 });
    expect(result.reliability).toBe('high');
  });

  it('flags flat-pattern answers as low reliability', () => {
    const answers: Record<string, number> = {
      'riasec-r1': 3, 'riasec-r2': 3, 'riasec-i1': 3, 'riasec-i2': 3,
      'riasec-a1': 3, 'riasec-a2': 3, 'riasec-s1': 3, 'riasec-s2': 3,
      'riasec-e1': 3, 'riasec-e2': 3, 'riasec-c1': 3, 'riasec-c2': 3,
    };
    const result = riasecScorer.score(answers, diagnosticQuestions);
    expect(result.reliability).toBe('low');
  });
});

describe('bfiScorer', () => {
  it('maps historical scale aliases (C_bigfive/E_bigfive/A_bigfive) to canonical O/C/E/A/N keys', () => {
    const answers: Record<string, number> = {
      'bfi-o1': 4, 'bfi-o2': 5,
      'bfi-c1': 4, 'bfi-c2': 2, // reverse -> 4
      'bfi-e1': 5, 'bfi-e2': 1, // reverse -> 5
      'bfi-a1': 3, 'bfi-a2': 4,
      'bfi-n1': 2, 'bfi-n2': 4, // reverse -> 2
    };
    const result = bfiScorer.score(answers, diagnosticQuestions);
    expect(result.scores.O).toBe(4.5);
    expect(result.scores.C).toBe(4);
    expect(result.scores.E).toBe(5);
    expect(result.scores.A).toBe(3.5);
    expect(result.scores.N).toBe(2);
    expect(result.scores.honestyFlag).toBe(false);
    expect(result.reliability).toBe('high');
    // Legacy bogus keys (bug in the pre-refactor route) must not resurface.
    expect(result.scores).not.toHaveProperty('C_bigfive');
  });

  it('flags honesty when reverse-pair answers contradict each other', () => {
    const answers: Record<string, number> = {
      'bfi-o1': 3, 'bfi-o2': 3,
      'bfi-c1': 5, 'bfi-c2': 5, // direct 5 vs reverse-adjusted (6-5)=1 -> deviation 4
      'bfi-e1': 3, 'bfi-e2': 3,
      'bfi-a1': 3, 'bfi-a2': 3,
      'bfi-n1': 3, 'bfi-n2': 3,
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
});
