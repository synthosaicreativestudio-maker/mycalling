import { describe, it, expect } from 'vitest';
import { matchBand } from './matchBand';

describe('matchBand — честная качественная подача (B2)', () => {
  it('высокий скор → сильное совпадение', () => {
    expect(matchBand(99).key).toBe('strong');
    expect(matchBand(85).key).toBe('strong');
    expect(matchBand(92).label).toBe('Сильное совпадение');
  });

  it('средний скор → хорошее совпадение', () => {
    expect(matchBand(84).key).toBe('good');
    expect(matchBand(72).key).toBe('good');
  });

  it('нижний скор → стоит присмотреться', () => {
    expect(matchBand(71).key).toBe('explore');
    expect(matchBand(58).key).toBe('explore');
  });

  it('монотонность: полоса не «улучшается» при снижении скора', () => {
    const order = { strong: 3, good: 2, explore: 1 } as const;
    for (let s = 58; s < 99; s++) {
      expect(order[matchBand(s).key]).toBeLessThanOrEqual(order[matchBand(s + 1).key]);
    }
  });
});
