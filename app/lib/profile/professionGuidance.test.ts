import { describe, it, expect } from 'vitest';
import { deriveEducationPath, deriveOutlook } from './professionGuidance';
import { professionsDb } from '../../data/professions_db';

describe('professionGuidance — образование/перспективы для каждой профессии (B1b)', () => {
  it('явно заданные поля имеют приоритет', () => {
    expect(deriveEducationPath({ educationPath: 'МГУ, мехмат' })).toBe('МГУ, мехмат');
    expect(deriveOutlook({ outlook: 'Дефицит кадров' })).toBe('Дефицит кадров');
  });

  it('без явных полей — выводит осмысленный путь из предметов/индустрии', () => {
    const path = deriveEducationPath({ subjects: ['Математика', 'Информатика'], industry: 'IT и разработка ПО' });
    expect(path).toContain('Математика');
    expect(path).toContain('IT и разработка ПО');
  });

  it('outlook зависит от спроса/tier', () => {
    expect(deriveOutlook({ demand: 'high' })).toMatch(/спрос/i);
    expect(deriveOutlook({ tier: 'dream' })).toMatch(/конкурс/i);
  });

  it('ВСЕ 204 профессии получают непустые educationPath и outlook', () => {
    expect(professionsDb.length).toBeGreaterThanOrEqual(200);
    for (const p of professionsDb) {
      const path = deriveEducationPath(p as any);
      const out = deriveOutlook(p as any);
      expect(path.trim().length, `educationPath пуст у ${p.name}`).toBeGreaterThan(10);
      expect(out.trim().length, `outlook пуст у ${p.name}`).toBeGreaterThan(10);
    }
  });
});
