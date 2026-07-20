import { describe, expect, it } from 'vitest';
import { matchProfessions, topProfessions, topArchetypes, type MatchProfile } from './professionMatch';
import { professionsDb } from '../../data/professions_db';

// Профиль сильного «исследователя-систематизатора» (I/C высокие, добросовестность
// высокая, устойчивость высокая) — должен вытягивать наверх аналитические/IT-роли.
// docs/25 Трек A: профиль теперь многомерный — добавлены ценности (PVQ), сильные
// стороны (VIA) и когнитивный диапазон (ICAR).
const analyticalProfile: MatchProfile = {
  riasec: { R: 2, I: 5, A: 2, S: 1.5, E: 2, C: 4.5 },
  bigFive: { O: 4, C: 4.5, E: 2, A: 3, N: 1.5, honestyFlag: false },
  topValues: ['self_direction', 'achievement', 'security'],
  signatureStrengths: ['curiosity', 'judgment', 'love_of_learning'],
  icarBand: 'strong',
};

// Профиль социального/творческого профиля.
const socialProfile: MatchProfile = {
  riasec: { R: 1.5, I: 2, A: 4.5, S: 5, E: 3.5, C: 2 },
  bigFive: { O: 4.5, C: 3, E: 4.5, A: 4.5, N: 2 },
  topValues: ['benevolence', 'universalism', 'stimulation'],
  signatureStrengths: ['kindness', 'social_intelligence', 'creativity'],
  icarBand: 'solid',
};

// Экспресс-профиль: только интересы + личность (без PVQ/VIA/ICAR) — путь короткой
// сессии. Должен продолжать ранжировать за счёт ре-нормировки весов.
const expressProfile: MatchProfile = {
  riasec: analyticalProfile.riasec,
  bigFive: analyticalProfile.bigFive,
};

const emptyProfile: MatchProfile = { riasec: {}, bigFive: {} };

describe('matchProfessions', () => {
  it('ранжирует ВСЮ базу профессий, ничего не теряя', () => {
    const ranked = matchProfessions(analyticalProfile);
    expect(ranked).toHaveLength(professionsDb.length);
    // Каждое имя реально существует в базе (гарантия обогащения карточки).
    const dbNames = new Set(professionsDb.map((p) => p.name));
    ranked.forEach((m) => expect(dbNames.has(m.profession.name)).toBe(true));
  });

  it('сортирует по убыванию совпадения', () => {
    const ranked = matchProfessions(analyticalProfile);
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].matchScore).toBeGreaterThanOrEqual(ranked[i].matchScore);
    }
  });

  it('matchScore всегда в диапазоне 58–99', () => {
    matchProfessions(socialProfile).forEach((m) => {
      expect(m.matchScore).toBeGreaterThanOrEqual(58);
      expect(m.matchScore).toBeLessThanOrEqual(99);
    });
  });

  it('аналитический профиль выводит наверх Investigative/Conventional-профессии', () => {
    const top5 = matchProfessions(analyticalProfile).slice(0, 5);
    const anyAnalytical = top5.some((m) =>
      m.profession.riasec.includes('Investigative') || m.profession.riasec.includes('Conventional'),
    );
    expect(anyAnalytical).toBe(true);
  });

  it('социальный профиль выводит наверх Social/Artistic-профессии', () => {
    const top5 = matchProfessions(socialProfile).slice(0, 5);
    const anySocial = top5.some((m) =>
      m.profession.riasec.includes('Social') || m.profession.riasec.includes('Artistic'),
    );
    expect(anySocial).toBe(true);
  });

  it('детерминирован: одинаковый вход → одинаковый порядок', () => {
    const a = matchProfessions(analyticalProfile).map((m) => m.profession.name);
    const b = matchProfessions(analyticalProfile).map((m) => m.profession.name);
    expect(a).toEqual(b);
  });

  it('не падает на пустом/битом профиле и не теряет профессии', () => {
    expect(() => matchProfessions(emptyProfile)).not.toThrow();
    expect(matchProfessions(emptyProfile)).toHaveLength(professionsDb.length);
  });
});

describe('matchProfessions — многомерность и объяснимость (docs/25 Трек A)', () => {
  it('полный профиль даёт разбивку по ≥5 осям хотя бы у части профессий', () => {
    const ranked = matchProfessions(analyticalProfile);
    const maxAxes = Math.max(...ranked.map((m) => m.breakdown.length));
    expect(maxAxes).toBeGreaterThanOrEqual(5);
    // Веса активных осей ре-нормированы: сумма ≈ 1.
    const withAll = ranked.find((m) => m.breakdown.length >= 5)!;
    const sum = withAll.breakdown.reduce((s, a) => s + a.weight, 0);
    expect(sum).toBeGreaterThan(0.98);
    expect(sum).toBeLessThan(1.02);
  });

  it('экспресс-профиль (только RIASEC+BigFive) ранжирует, разбивка ≤2 осей', () => {
    const ranked = matchProfessions(expressProfile);
    expect(ranked).toHaveLength(professionsDb.length);
    ranked.forEach((m) => {
      m.breakdown.forEach((a) => expect(['interests', 'personality']).toContain(a.axis));
      expect(m.breakdown.length).toBeLessThanOrEqual(2);
    });
  });

  it('пустой профиль → нейтральные 58% и пустая разбивка', () => {
    const ranked = matchProfessions(emptyProfile);
    ranked.forEach((m) => {
      expect(m.breakdown).toHaveLength(0);
      expect(m.matchScore).toBe(Math.max(58, Math.min(99, Math.round(58 + 0.5 * 41))));
    });
  });

  it('ценности и сильные стороны влияют на порядок (не только RIASEC)', () => {
    // Тот же RIASEC/BigFive, но разные ценности/силы → порядок должен отличаться.
    const a = matchProfessions({ ...expressProfile, topValues: ['power', 'achievement'], signatureStrengths: ['leadership'] });
    const b = matchProfessions({ ...expressProfile, topValues: ['benevolence', 'universalism'], signatureStrengths: ['kindness'] });
    const aNames = a.slice(0, 10).map((m) => m.profession.name);
    const bNames = b.slice(0, 10).map((m) => m.profession.name);
    expect(aNames).not.toEqual(bNames);
  });

  it('когнитивный guard-rail: разрыв штрафует, но не обнуляет ось (score ≥ 50)', () => {
    // developing-ученик против профессий с high cognitiveDemand: когнитивная ось
    // не должна падать в 0 (мягкий пол 0.5 → score 50).
    const developing = matchProfessions({ riasec: {}, bigFive: {}, icarBand: 'developing' });
    let checkedHighDemand = false;
    developing.forEach((m) => {
      const cog = m.breakdown.find((a) => a.axis === 'cognitive');
      if (cog && m.profession.cognitiveDemand === 'high') {
        checkedHighDemand = true;
        expect(cog.score).toBeGreaterThanOrEqual(50);
      }
    });
    expect(checkedHighDemand).toBe(true);
  });
});

describe('topProfessions', () => {
  it('возвращает ровно 20 по умолчанию', () => {
    expect(topProfessions(analyticalProfile)).toHaveLength(20);
  });

  it('уважает параметр n', () => {
    expect(topProfessions(analyticalProfile, 5)).toHaveLength(5);
  });

  it('сворачивает по архетипу: без повторяющихся archetype в выдаче', () => {
    const top = topProfessions(analyticalProfile, 20);
    const keys = top.map((m) => m.profession.archetype ?? `id:${m.profession.id}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('topArchetypes (подача архетипами, docs/22 §5)', () => {
  it('возвращает ровно n групп с уникальными архетипами', () => {
    const groups = topArchetypes(analyticalProfile, 20);
    expect(groups).toHaveLength(20);
    const keys = groups.map((g) => g.profession.archetype ?? `id:${g.profession.id}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('внутри группы лучшая специализация — представитель (variants не выше по score)', () => {
    topArchetypes(analyticalProfile, 20).forEach((g) => {
      g.variants.forEach((v) => expect(g.matchScore).toBeGreaterThanOrEqual(v.matchScore));
    });
  });

  it('покрывает всю базу: сумма представитель+веер = число профессий', () => {
    const groups = topArchetypes(analyticalProfile, professionsDb.length);
    const total = groups.reduce((s, g) => s + 1 + g.variants.length, 0);
    expect(total).toBe(professionsDb.length);
  });

  it('детерминирован', () => {
    const a = topArchetypes(socialProfile, 10).map((g) => g.profession.name);
    const b = topArchetypes(socialProfile, 10).map((g) => g.profession.name);
    expect(a).toEqual(b);
  });
});
