import { describe, expect, it } from 'vitest';
import { professionsDb } from './professions_db';
import { professionExtras } from './professionExtras';

describe('professionExtras (docs/26 Этап 8, docs/25 Трек B)', () => {
  const ids = new Set(professionsDb.map((p) => p.id));

  it('все ключи extras соответствуют реальным id профессий', () => {
    const unknown = Object.keys(professionExtras).filter((id) => !ids.has(id));
    expect(unknown).toEqual([]);
  });

  it('fact не нарушает правило текста (без «ИИ»/«искусственный интеллект»)', () => {
    // Блокируем аббревиатуру «ИИ» как отдельное слово и слово «искусственный»
    // (маркер фразы «искусственный интеллект»). «Интеллектуальная собственность»
    // и «нейросети» — легитимны и не флагаются.
    const standaloneAI = /(^|[^А-Яа-яЁё])ИИ([^А-Яа-яЁё]|$)/;
    for (const [id, extra] of Object.entries(professionExtras)) {
      const text = `${extra.fact ?? ''} ${extra.salary ?? ''}`;
      expect(standaloneAI.test(text), `${id}: содержит «ИИ»`).toBe(false);
      expect(/искусственн/i.test(text), `${id}: содержит «искусственный интеллект»`).toBe(false);
    }
  });

  it('fact непустой там, где указан', () => {
    for (const [id, extra] of Object.entries(professionExtras)) {
      if (extra.fact !== undefined) {
        expect(extra.fact.trim().length, `${id}: пустой fact`).toBeGreaterThan(0);
      }
    }
  });

  it('после слияния у КАЖДОЙ профессии есть outlook и educationPath (выведены)', () => {
    for (const p of professionsDb) {
      expect(p.outlook, `${p.id}: нет outlook`).toBeTruthy();
      expect(p.educationPath, `${p.id}: нет educationPath`).toBeTruthy();
    }
  });
});
