import { describe, it, expect } from 'vitest';
import { detectTalentSignals } from './talentSignals';

describe('detectTalentSignals — страховка Колеса талантов (docs/27 Трек 4)', () => {
  it('«хочу свою IT-компанию» → tech И startup', () => {
    const s = detectTalentSignals('хочу свою IT-компанию');
    expect(s).toContain('tech');
    expect(s).toContain('startup');
  });

  it('«люблю программировать и делать сайты» → tech', () => {
    expect(detectTalentSignals('люблю программировать и делать сайты')).toContain('tech');
  });

  it('«биология и химия, ставлю эксперименты» → science', () => {
    expect(detectTalentSignals('биология и химия, ставлю эксперименты')).toContain('science');
  });

  it('«нравится дизайн и рисование» → creative', () => {
    expect(detectTalentSignals('нравится дизайн и рисование')).toContain('creative');
  });

  it('«слава, деньги, влияние» → startup', () => {
    expect(detectTalentSignals('слава, деньги, влияние')).toContain('startup');
  });

  it('«помогать людям, стать врачом» → social', () => {
    const s = detectTalentSignals('помогать людям, стать врачом');
    expect(s).toContain('social');
  });

  it('нейтральная реплика без сигналов → пусто', () => {
    expect(detectTalentSignals('не знаю, наверное')).toEqual([]);
  });

  it('регистронезависимость', () => {
    expect(detectTalentSignals('ПРОГРАММИРОВАНИЕ')).toContain('tech');
  });
});
