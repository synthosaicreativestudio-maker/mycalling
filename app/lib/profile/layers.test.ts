import { describe, expect, it } from 'vitest';
import { buildSummaryProfile, computeCoverage, SummaryProfileSchema, type SummaryProfile } from './layers';

function fullProfile(): Omit<SummaryProfile, 'coverage'> {
  return {
    interests: {
      riasec: { R: 3, I: 4, A: 3, S: 3, E: 2, C: 3 },
      hollandCode: 'IAS',
      antiInterests: ['кровь и больницы'],
      hobbies: ['программирование'],
      cabinVisualArt: 4,
      cabinPerformingArt: 2,
      digitalInterests: [],
    },
    personality: {
      bigFive: { O: 4, C: 4, E: 3, A: 3.5, N: 2 },
      locusOfControl: 4,
      ambiguityTolerance: 3.5,
      honestyFlag: false,
      teiqueSelfAwareness: 4,
      teiqueSelfRegulation: 4,
      grit: 4.5,
    },
    strengths: {
      via: { creativity: 5, curiosity: 4 },
      signatureStrengths: ['creativity', 'curiosity', 'judgment', 'love_of_learning', 'perspective'],
      viaWisdom: 4.5,
    },
    cognitive: {
      icar: { raw: 6, bySubscale: { verbal: 2, numeric: 2, spatial: 2 }, band: 'solid' },
      execInhibition: 4,
      execFlexibility: 4,
    },
    motivation: {
      coachValues: 'Свобода и профессионализм',
      dreams: 'Хочу разрабатывать данные для науки',
      pvq: { self_direction: 4 },
      topValues: ['автономия'],
    },
    social: {
      belbinLeader: 4,
      belbinDoer: 3,
      belbinCreator: 5,
      belbinPeacemaker: 3,
      assertiveness: 4,
      empatheticListening: 4,
    },
    behavior: {
      procrastination: 10,
      deepActions: 'Буду учиться каждый день',
      deepFirstStep: 'Начну сегодня',
      savickasConcern: 4,
      savickasControl: 4,
      savickasCuriosity: 4,
      savickasConfidence: 4,
    },
    context: {
      age: 15,
      grade: '9 класс',
      city: 'Тюмень',
      idols: 'Илон Маск',
      barriers: 'Боюсь не поступить',
      familyPressure: 2,
      familyFinance: 4,
    },
  };
}

describe('computeCoverage', () => {
  it('returns 1.0 overall coverage for a fully-populated profile', () => {
    const coverage = computeCoverage(fullProfile());
    expect(coverage.overall).toBe(1);
    expect(coverage.interests).toBe(1);
    expect(coverage.cognitive).toBe(1);
    expect(coverage.social).toBe(1);
  });

  it('returns partial coverage when optional fields are missing', () => {
    const profile = fullProfile();
    profile.personality.locusOfControl = undefined;
    profile.personality.ambiguityTolerance = undefined;
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
