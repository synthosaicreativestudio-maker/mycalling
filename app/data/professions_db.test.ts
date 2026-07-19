import { describe, expect, it } from 'vitest';
import { professionsDb, industries, type Profession } from './professions_db';

/**
 * Валидатор каталога профессий (docs/22, фаза C): гарантирует, что каждая запись
 * структурно корректна и «качественно встраивается» в сервис. Кривая запись
 * (битый RIASEC, пустые предметы, несуществующая отрасль, дубль id) роняет билд
 * и не попадает в main. Это контракт модульного добавления профессий.
 */

const RIASEC_CODES = ['Realistic', 'Investigative', 'Artistic', 'Social', 'Enterprising', 'Conventional'];
const GARDNER_CODES = [
  'Linguistic', 'Logical-Mathematical', 'Spatial-Visual', 'Bodily-Kinesthetic',
  'Musical', 'Interpersonal', 'Intrapersonal', 'Naturalist',
];
const DEMAND_VALUES = ['high', 'medium', 'low'];
const BIGFIVE_VALUES = ['high', 'low', 'any'];

describe('каталог профессий: целостность', () => {
  it('непустой', () => {
    expect(professionsDb.length).toBeGreaterThan(0);
  });

  it('все id уникальны', () => {
    const ids = professionsDb.map((p) => p.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(dupes, `дублирующиеся id: ${[...new Set(dupes)].join(', ')}`).toEqual([]);
  });

  it('все name уникальны (RpgProfessionCard матчит по name)', () => {
    const names = professionsDb.map((p) => p.name);
    const dupes = names.filter((n, i) => names.indexOf(n) !== i);
    expect(dupes, `дублирующиеся name: ${[...new Set(dupes)].join(', ')}`).toEqual([]);
  });

  it('каждая отрасль из industries[] реально используется (нет мёртвых)', () => {
    const used = new Set(professionsDb.map((p) => p.industry));
    const unused = industries.filter((i) => !used.has(i));
    expect(unused, `отрасли в industries[] без единой профессии: ${unused.join(', ')}`).toEqual([]);
  });
});

describe('каталог профессий: валидность каждой записи', () => {
  professionsDb.forEach((p: Profession) => {
    describe(`${p.name} (${p.id})`, () => {
      it('id и name непустые', () => {
        expect(p.id.trim().length).toBeGreaterThan(0);
        expect(p.name.trim().length).toBeGreaterThan(0);
      });

      it('industry входит в задекларированный список industries[]', () => {
        expect(industries, `отрасль "${p.industry}" не задекларирована в industries[]`).toContain(p.industry);
      });

      it('riasec: 1-3 кода, все валидны, без дублей', () => {
        expect(p.riasec.length).toBeGreaterThanOrEqual(1);
        expect(p.riasec.length).toBeLessThanOrEqual(3);
        p.riasec.forEach((code) => expect(RIASEC_CODES, `неизвестный RIASEC-код "${code}"`).toContain(code));
        expect(new Set(p.riasec).size, 'дубли в riasec').toBe(p.riasec.length);
      });

      it('gardner: минимум 1 код, все валидны', () => {
        expect(p.gardner.length).toBeGreaterThanOrEqual(1);
        p.gardner.forEach((code) => expect(GARDNER_CODES, `неизвестный Gardner-код "${code}"`).toContain(code));
      });

      it('bigFive.traits: значения только high/low/any', () => {
        Object.values(p.bigFive.traits).forEach((v) => {
          if (v !== undefined) expect(BIGFIVE_VALUES).toContain(v);
        });
      });

      it('subjects непустые (это «дорога» — что учить сейчас)', () => {
        expect(p.subjects.length).toBeGreaterThanOrEqual(1);
        p.subjects.forEach((s) => expect(s.trim().length).toBeGreaterThan(0));
      });

      it('summary и why непустые', () => {
        expect(p.summary.trim().length).toBeGreaterThan(0);
        expect(p.why.trim().length).toBeGreaterThan(0);
      });

      it('demand: high/medium/low', () => {
        expect(DEMAND_VALUES).toContain(p.demand);
      });

      it('skills.hard и skills.soft — непустые массивы', () => {
        expect(p.skills.hard.length).toBeGreaterThanOrEqual(1);
        expect(p.skills.soft.length).toBeGreaterThanOrEqual(1);
      });
    });
  });
});
