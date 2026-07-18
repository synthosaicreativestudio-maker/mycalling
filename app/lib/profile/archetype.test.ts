import { describe, it, expect } from 'vitest';
import { deriveArchetype } from './archetype';

// VIA-коды по добродетелям (см. viaStrengths.ts): creativity/curiosity/judgment/love_of_learning
// = wisdom; bravery/perseverance/honesty/zest = courage; kindness/love/social_intelligence
// = humanity; teamwork/fairness/leadership = justice; forgiveness/humility/prudence/self_regulation
// = temperance; appreciation/gratitude/hope/humor/spirituality = transcendence.

describe('deriveArchetype', () => {
  it('возвращает Заботливого при доминировании человечности + благожелательности', () => {
    const via = { kindness: 5, love: 5, social_intelligence: 5, creativity: 1, bravery: 1, leadership: 1 };
    const pvq = { benevolence: 2, power: -1, achievement: -1, stimulation: -1 };
    const res = deriveArchetype(via, pvq);
    expect(res?.key).toBe('caregiver');
    expect(res?.nameRu).toBe('Заботливый');
  });

  it('возвращает Правителя при доминировании справедливости + власти', () => {
    const via = { leadership: 5, fairness: 5, teamwork: 4, kindness: 1, creativity: 1, humor: 1 };
    const pvq = { power: 2.5, achievement: 1.5, benevolence: -1, universalism: -1, hedonism: -1 };
    const res = deriveArchetype(via, pvq);
    expect(res?.key).toBe('ruler');
  });

  it('возвращает Творца при мудрости + самостоятельности/новизне', () => {
    const via = { creativity: 5, curiosity: 5, judgment: 4, leadership: 1, kindness: 1, bravery: 1 };
    const pvq = { self_direction: 2, stimulation: 1.5, power: -1, security: -1, conformity: -1 };
    const res = deriveArchetype(via, pvq);
    expect(res?.key).toBe('creator');
  });

  it('возвращает null при отсутствии VIA-данных', () => {
    expect(deriveArchetype({}, { power: 1 })).toBeNull();
  });

  it('score нормирован в диапазоне 0-100', () => {
    const via = { creativity: 5, curiosity: 4, leadership: 2 };
    const res = deriveArchetype(via, { self_direction: 1 });
    expect(res).not.toBeNull();
    expect(res!.score).toBeGreaterThanOrEqual(0);
    expect(res!.score).toBeLessThanOrEqual(100);
  });
});
