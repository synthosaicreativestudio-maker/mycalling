import { describe, expect, it } from 'vitest';
import { buildSummaryProfile, computeCoverage, SummaryProfileSchema, type SummaryProfile } from './layers';

function fullProfile(): Omit<SummaryProfile, 'coverage'> {
  return {
    interests: {
      riasec: { R: 3, I: 4, A: 3, S: 3, E: 2, C: 3 },
      hollandCode: 'IAS',
      antiInterests: ['кровь и больницы'],
      hobbies: ['программирование'],
    },
    personality: {
      bigFive: { O: 4, C: 4, E: 3, A: 3.5, N: 2 },
      locusOfControl: 4,
      ambiguityTolerance: 3.5,
      honestyFlag: false,
    },
    strengths: {
      via: { creativity: 5, curiosity: 4 },
      signatureStrengths: ['creativity', 'curiosity', 'judgment', 'love_of_learning', 'perspective'],
    },
    cognitive: {
      icar: { raw: 6, bySubscale: { verbal: 2, numeric: 2, spatial: 2 }, band: 'solid' },
    },
    motivation: {
      coachValues: 'Свобода и профессионализм',
      dreams: 'Хочу разрабатывать данные для науки',
      pvq: { self_direction: 4 },
      topValues: ['автономия'],
    },
    behavior: {
      procrastination: 10,
      deepActions: 'Буду учиться каждый день',
      deepFirstStep: 'Начну сегодня',
    },
    context: {
      age: 15,
      grade: '9 класс',
      city: 'Тюмень',
      idols: 'Илон Маск',
      barriers: 'Боюсь не поступить',
    },
  };
}

describe('computeCoverage', () => {
  it('returns 1.0 overall coverage for a fully-populated profile', () => {
    const coverage = computeCoverage(fullProfile());
    expect(coverage.overall).toBe(1);
    expect(coverage.interests).toBe(1);
    expect(coverage.cognitive).toBe(1);
  });

  it('returns partial coverage when optional fields are missing', () => {
    const profile = fullProfile();
    profile.personality.locusOfControl = undefined as any;
    profile.personality.ambiguityTolerance = undefined as any;
    profile.motivation.pvq = undefined;
    const coverage = computeCoverage(profile);
    expect(coverage.personality).toBeLessThan(1);
    expect(coverage.overall).toBeLessThan(1);
    expect(coverage.overall).toBeGreaterThan(0);
  });

  it('returns 0 for a layer with no signal at all', () => {
    const profile = fullProfile();
    profile.strengths = { via: undefined, signatureStrengths: [] };
    const coverage = computeCoverage(profile);
    expect(coverage.strengths).toBe(0);
  });
});

describe('buildSummaryProfile', () => {
  it('validates against SummaryProfileSchema', () => {
    const profile = buildSummaryProfile(fullProfile());
    const parsed = SummaryProfileSchema.safeParse(profile);
    expect(parsed.success).toBe(true);
    expect(profile.coverage.overall).toBe(1);
  });
});
