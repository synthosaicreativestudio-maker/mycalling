import { describe, expect, it } from 'vitest';
import { computeConsistency, type ConsistencyProfile } from './consistency';

function baseProfile(overrides: Partial<ConsistencyProfile> = {}): ConsistencyProfile {
  return {
    riasec: { R: 3, I: 4.5, A: 3, S: 3, E: 2, C: 3 },
    bigFive: { O: 4, C: 4, E: 3, A: 3.5, N: 3 },
    procrastination: 10,
    via: { creativity: 5, curiosity: 4, signatureStrengths: ['creativity', 'curiosity', 'judgment', 'love_of_learning', 'perspective'] },
    coachData: {
      dreams: 'Хочу стать программистом и разрабатывать данные для науки',
      values: 'Свобода и профессионализм',
      deepIdentity: 'Я исследователь, который любит разбираться в сложных системах',
      deepActions: 'Буду учиться каждый день',
      deepFirstStep: '',
    },
    ...overrides,
  };
}

describe('computeConsistency', () => {
  it('returns high confidence and no contradictions when data agrees', () => {
    const result = computeConsistency(baseProfile());
    expect(result.contradictions).toHaveLength(0);
    expect(result.index).toBe(100);
    expect(result.level).toBe('high');
  });

  it('flags an introvert who claims to love teamwork', () => {
    const result = computeConsistency(
      baseProfile({
        bigFive: { O: 4, C: 4, E: 1.5, A: 3.5, N: 3 },
        coachData: {
          dreams: 'Хочу разрабатывать данные для науки',
          deepIdentity: 'Обожаю командную работу и общение с людьми',
        },
      })
    );
    const codes = result.contradictions.map((c) => c.code);
    expect(codes).toContain('extraversion-vs-teamwork');
    expect(result.index).toBeLessThan(100);
    expect(result.level).not.toBe('high');
  });

  it('applies only a mild penalty for procrastination vs a stated first step', () => {
    const result = computeConsistency(
      baseProfile({
        procrastination: 18,
        coachData: {
          dreams: 'Хочу разрабатывать данные для науки',
          deepFirstStep: 'Начну сегодня вечером с одного урока по алгоритмам',
        },
      })
    );
    const codes = result.contradictions.map((c) => c.code);
    expect(codes).toEqual(['procrastination-vs-first-step']);
    expect(result.index).toBe(85); // 100 - 1*15
    expect(result.level).toBe('high');
  });

  it('detects a mismatch between leading RIASEC code and the stated dream', () => {
    const result = computeConsistency(
      baseProfile({
        riasec: { R: 5, I: 2, A: 2, S: 2, E: 2, C: 2 }, // leading = R
        coachData: {
          dreams: 'Хочу стать художником и создавать музыку',
        },
      })
    );
    const codes = result.contradictions.map((c) => c.code);
    expect(codes).toContain('riasec-vs-dream');
  });

  it('flags a self-described leader whose VIA signature strengths lack leadership/teamwork', () => {
    const result = computeConsistency(
      baseProfile({
        via: { creativity: 5, signatureStrengths: ['creativity', 'curiosity', 'judgment', 'love_of_learning', 'perspective'] },
        coachData: {
          dreams: 'Хочу разрабатывать данные для науки',
          deepIdentity: 'Я лидер, который организует команду и ведёт её к результату',
        },
      })
    );
    const codes = result.contradictions.map((c) => c.code);
    expect(codes).toContain('via-vs-leader-identity');
  });
});
