import { describe, expect, it } from 'vitest';
import { matchProfessions, topProfessions, topArchetypes } from './professionMatch';
import { professionsDb } from '../../data/professions_db';

// Профиль сильного «исследователя-систематизатора» (I/C высокие, добросовестность
// высокая, устойчивость высокая) — должен вытягивать наверх аналитические/IT-роли.
const analyticalRiasec = { R: 2, I: 5, A: 2, S: 1.5, E: 2, C: 4.5 };
const analyticalBigFive = { O: 4, C: 4.5, E: 2, A: 3, N: 1.5, honestyFlag: false };

// Профиль социального/творческого профиля.
const socialRiasec = { R: 1.5, I: 2, A: 4.5, S: 5, E: 3.5, C: 2 };
const socialBigFive = { O: 4.5, C: 3, E: 4.5, A: 4.5, N: 2 };

describe('matchProfessions', () => {
  it('ранжирует ВСЮ базу профессий, ничего не теряя', () => {
    const ranked = matchProfessions(analyticalRiasec, analyticalBigFive);
    expect(ranked).toHaveLength(professionsDb.length);
    // Каждое имя реально существует в базе (гарантия обогащения карточки).
    const dbNames = new Set(professionsDb.map((p) => p.name));
    ranked.forEach((m) => expect(dbNames.has(m.profession.name)).toBe(true));
  });

  it('сортирует по убыванию совпадения', () => {
    const ranked = matchProfessions(analyticalRiasec, analyticalBigFive);
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].matchScore).toBeGreaterThanOrEqual(ranked[i].matchScore);
    }
  });

  it('matchScore всегда в диапазоне 58–99', () => {
    matchProfessions(socialRiasec, socialBigFive).forEach((m) => {
      expect(m.matchScore).toBeGreaterThanOrEqual(58);
      expect(m.matchScore).toBeLessThanOrEqual(99);
    });
  });

  it('аналитический профиль выводит наверх Investigative/Conventional-профессии', () => {
    const top5 = matchProfessions(analyticalRiasec, analyticalBigFive).slice(0, 5);
    const anyAnalytical = top5.some((m) =>
      m.profession.riasec.includes('Investigative') || m.profession.riasec.includes('Conventional'),
    );
    expect(anyAnalytical).toBe(true);
  });

  it('социальный профиль выводит наверх Social/Artistic-профессии', () => {
    const top5 = matchProfessions(socialRiasec, socialBigFive).slice(0, 5);
    const anySocial = top5.some((m) =>
      m.profession.riasec.includes('Social') || m.profession.riasec.includes('Artistic'),
    );
    expect(anySocial).toBe(true);
  });

  it('детерминирован: одинаковый вход → одинаковый порядок', () => {
    const a = matchProfessions(analyticalRiasec, analyticalBigFive).map((m) => m.profession.name);
    const b = matchProfessions(analyticalRiasec, analyticalBigFive).map((m) => m.profession.name);
    expect(a).toEqual(b);
  });

  it('не падает на пустом/битом профиле', () => {
    expect(() => matchProfessions({}, {})).not.toThrow();
    expect(matchProfessions({}, {})).toHaveLength(professionsDb.length);
  });
});

describe('topProfessions', () => {
  it('возвращает ровно 20 по умолчанию', () => {
    expect(topProfessions(analyticalRiasec, analyticalBigFive)).toHaveLength(20);
  });

  it('уважает параметр n', () => {
    expect(topProfessions(analyticalRiasec, analyticalBigFive, 5)).toHaveLength(5);
  });

  it('сворачивает по архетипу: без повторяющихся archetype в выдаче', () => {
    const top = topProfessions(analyticalRiasec, analyticalBigFive, 20);
    const keys = top.map((m) => m.profession.archetype ?? `id:${m.profession.id}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('topArchetypes (подача архетипами, docs/22 §5)', () => {
  it('возвращает ровно n групп с уникальными архетипами', () => {
    const groups = topArchetypes(analyticalRiasec, analyticalBigFive, 20);
    expect(groups).toHaveLength(20);
    const keys = groups.map((g) => g.profession.archetype ?? `id:${g.profession.id}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('внутри группы лучшая специализация — представитель (variants не выше по score)', () => {
    topArchetypes(analyticalRiasec, analyticalBigFive, 20).forEach((g) => {
      g.variants.forEach((v) => expect(g.matchScore).toBeGreaterThanOrEqual(v.matchScore));
    });
  });

  it('покрывает всю базу: сумма представитель+веер = число профессий', () => {
    const groups = topArchetypes(analyticalRiasec, analyticalBigFive, professionsDb.length);
    const total = groups.reduce((s, g) => s + 1 + g.variants.length, 0);
    expect(total).toBe(professionsDb.length);
  });

  it('детерминирован', () => {
    const a = topArchetypes(socialRiasec, socialBigFive, 10).map((g) => g.profession.name);
    const b = topArchetypes(socialRiasec, socialBigFive, 10).map((g) => g.profession.name);
    expect(a).toEqual(b);
  });
});
