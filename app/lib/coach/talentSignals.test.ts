import { describe, it, expect } from 'vitest';
import { detectTalentSignals, scoreTalentSignals, SIGNAL_FLOOR, SIGNAL_CAP } from './talentSignals';

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

describe('scoreTalentSignals — градуированные баллы (не «ровное» колесо)', () => {
  it('один сигнал → SIGNAL_FLOOR', () => {
    const s = scoreTalentSignals('биология');
    expect(s.science).toBe(SIGNAL_FLOOR);
  });

  it('насыщенный ответ по шкале → балл ВЫШЕ пола', () => {
    // много tech-сигналов: программ, it-, сайт, приложен
    const s = scoreTalentSignals('люблю программировать, делать сайты и приложения, увлекаюсь it-разработкой');
    expect(s.tech!).toBeGreaterThan(SIGNAL_FLOOR);
  });

  it('баллы разных шкал различаются при разной насыщенности', () => {
    // tech: программ, сайт (2+) ; creative: дизайн (1)
    const s = scoreTalentSignals('программирую и делаю сайты, иногда балуюсь дизайном');
    expect(s.tech!).toBeGreaterThan(s.creative!);
  });

  it('балл не превышает потолок', () => {
    const s = scoreTalentSignals('программирование код сайт приложение робот гейм инженер компьютер нейросеть айти it-компания');
    expect(s.tech!).toBeLessThanOrEqual(SIGNAL_CAP);
  });

  it('нет сигналов → пустой объект', () => {
    expect(scoreTalentSignals('не знаю')).toEqual({});
  });
});
