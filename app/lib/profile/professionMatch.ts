import { professionsDb, Profession } from '../../data/professions_db';

/**
 * Детерминированное ранжирование ВСЕХ профессий из базы (professions_db.ts) по
 * соответствию профилю подростка. Раньше раздел "профессии" в отчёте на 100%
 * генерировался ИИ свободным текстом — модель выдумывала названия, которые не
 * совпадали с базой, поэтому обогащение карточки (RIASEC-статы в
 * RpgProfessionCard) не срабатывало (см. docs/21 §11.6). Теперь названия
 * профессий всегда берутся из базы, а порядок — из честного матчинга по
 * RIASEC + Big Five, а не из фантазии модели.
 */

export interface ProfessionMatch {
  profession: Profession;
  /** Итоговый процент совпадения для отображения (58–99, монотонно по fit). */
  matchScore: number;
}

// RIASEC-скорер отдаёт короткие ключи R/I/A/S/E/C, а база — полные названия.
const RIASEC_LETTER_TO_FULL: Record<string, Profession['riasec'][number]> = {
  R: 'Realistic',
  I: 'Investigative',
  A: 'Artistic',
  S: 'Social',
  E: 'Enterprising',
  C: 'Conventional',
};

// Вес позиции RIASEC-кода в профиле профессии: первый (ведущий) код важнее
// вторичного и третичного. Тот же принцип, что в RpgProfessionCard.codeWeight.
const RIASEC_POSITION_WEIGHT = [1, 0.6, 0.35];

type BigFiveTrait = 'Openness' | 'Conscientiousness' | 'Extraversion' | 'Agreeableness' | 'Stability';

// Каноническая шкала Big Five (O/C/E/A/N, 0–5) для каждой черты из требований
// профессии. Stability (эмоциональная устойчивость) — инверсия невротизма N.
function studentTraitNorm(trait: BigFiveTrait, bigFive: Record<string, number | boolean>): number | null {
  const num = (key: string): number | null => {
    const v = bigFive[key];
    return typeof v === 'number' ? Math.max(0, Math.min(1, v / 5)) : null;
  };
  switch (trait) {
    case 'Openness':
      return num('O');
    case 'Conscientiousness':
      return num('C');
    case 'Extraversion':
      return num('E');
    case 'Agreeableness':
      return num('A');
    case 'Stability': {
      const n = num('N');
      return n === null ? null : 1 - n;
    }
    default:
      return null;
  }
}

function riasecFit(profession: Profession, riasec: Record<string, number>): number {
  // Нормируем баллы ученика (0–5) в 0–1 по полным названиям RIASEC.
  const studentByFull: Record<string, number> = {};
  for (const [letter, full] of Object.entries(RIASEC_LETTER_TO_FULL)) {
    const raw = riasec[letter];
    if (typeof raw === 'number') {
      studentByFull[full] = Math.max(0, Math.min(1, raw / 5));
    }
  }
  let weighted = 0;
  let weightSum = 0;
  profession.riasec.forEach((code, idx) => {
    const w = RIASEC_POSITION_WEIGHT[idx] ?? 0.2;
    weighted += w * (studentByFull[code] ?? 0);
    weightSum += w;
  });
  return weightSum > 0 ? weighted / weightSum : 0.5;
}

function bigFiveFit(profession: Profession, bigFive: Record<string, number | boolean>): number {
  const traits = profession.bigFive?.traits ?? {};
  const fits: number[] = [];
  (Object.entries(traits) as [BigFiveTrait, 'high' | 'low' | 'any' | undefined][]).forEach(([trait, expectation]) => {
    if (!expectation || expectation === 'any') return;
    const norm = studentTraitNorm(trait, bigFive);
    if (norm === null) return;
    fits.push(expectation === 'high' ? norm : 1 - norm);
  });
  // Нет ограничений или нет данных по чертам — нейтрально.
  return fits.length > 0 ? fits.reduce((s, f) => s + f, 0) / fits.length : 0.5;
}

const RIASEC_WEIGHT = 0.7;
const BIG_FIVE_WEIGHT = 0.3;

/**
 * Ранжирует ВСЕ профессии базы по соответствию профилю. Результат отсортирован
 * по убыванию совпадения (лучшие — первыми).
 */
export function matchProfessions(
  riasec: Record<string, number>,
  bigFive: Record<string, number | boolean>,
): ProfessionMatch[] {
  const scored = professionsDb.map((profession) => {
    const fit = RIASEC_WEIGHT * riasecFit(profession, riasec) + BIG_FIVE_WEIGHT * bigFiveFit(profession, bigFive);
    // Монотонное отображение fit(0–1) → 58–99%: сохраняет порядок, но не даёт
    // ведущей профессии выглядеть как «40%» в отчёте для подростка.
    const matchScore = Math.max(58, Math.min(99, Math.round(58 + fit * 41)));
    return { profession, matchScore, fit };
  });
  scored.sort((a, b) => b.fit - a.fit || a.profession.name.localeCompare(b.profession.name));
  return scored.map(({ profession, matchScore }) => ({ profession, matchScore }));
}

/** Топ-N максимально подходящих профессий (по умолчанию 20). */
export function topProfessions(
  riasec: Record<string, number>,
  bigFive: Record<string, number | boolean>,
  n = 20,
): ProfessionMatch[] {
  return matchProfessions(riasec, bigFive).slice(0, Math.max(0, n));
}
