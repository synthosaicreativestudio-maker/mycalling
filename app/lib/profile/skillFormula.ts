import { skills } from '../../data/skills';

/**
 * Детерминированный расчёт "формулы успеха" — 3 переносимых компетенции,
 * выведенные из диагностического профиля (без обращения к ИИ). Это делает
 * формулу воспроизводимой: одинаковый вход всегда даёт одинаковый top3.
 *
 * Ожидаемая форма входных полей соответствует ключам, которые уже
 * возвращают скореры (`app/lib/diagnostic/scoring.ts`):
 *  - riasec: { R, I, A, S, E, C } — средний балл 1..5 по каждой шкале
 *  - bigFive: { O, C, E, A, N, ... } — средний балл 1..5 (N — нейротизм,
 *    т.е. чем выше N, тем НИЖЕ эмоциональная стабильность)
 *  - icar.bySubscale: { verbal, numeric, spatial } — число верных ответов
 *    (сырые счётчики, не нормированные к 1..5)
 *  - via: { <код силы>: 1..5, signatureStrengths?: string[] } — опционально
 */
export interface SkillFormulaResult {
  top3: string[];
  evidence: Record<string, string>;
}

export interface SkillFormulaProfile {
  riasec: Record<string, number>;
  bigFive: Record<string, number | boolean>;
  icar: { bySubscale: Record<string, number> };
  via?: Record<string, number> & { signatureStrengths?: string[] };
}

const NEUTRAL = 3; // нейтральное значение шкалы 1..5, если сигнал отсутствует
const VIA_NEUTRAL = 3;

/** Сырые счётчики ICAR.bySubscale обычно лежат в диапазоне 0..~8 верных ответов на субшкалу. */
const ICAR_SUBSCALE_ASSUMED_MAX = 8;

function riasecScore(profile: SkillFormulaProfile, key: string): number {
  const v = profile.riasec?.[key];
  return typeof v === 'number' && Number.isFinite(v) ? v : NEUTRAL;
}

/** BFI-балл 1..5; `invert: true` разворачивает шкалу (нужно для N → эмоциональная стабильность). */
function bigFiveScore(profile: SkillFormulaProfile, key: string, invert = false): number {
  const v = profile.bigFive?.[key];
  const num = typeof v === 'number' && Number.isFinite(v) ? v : NEUTRAL;
  return invert ? 6 - num : num;
}

/** Нормирует сырой счётчик ICAR-субшкалы к шкале 1..5, сопоставимой с RIASEC/BFI/VIA. */
function icarScore(profile: SkillFormulaProfile, key: string): number {
  const raw = profile.icar?.bySubscale?.[key];
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return NEUTRAL;
  const clamped = Math.max(0, Math.min(raw, ICAR_SUBSCALE_ASSUMED_MAX));
  return 1 + (clamped / ICAR_SUBSCALE_ASSUMED_MAX) * 4;
}

function viaScore(profile: SkillFormulaProfile, code: string): number {
  const v = profile.via?.[code];
  return typeof v === 'number' && Number.isFinite(v) ? v : VIA_NEUTRAL;
}

/**
 * Веса формул подобраны так, чтобы каждая компетенция опиралась минимум на
 * два независимых слоя профиля (интересы + способности/характер) — это
 * снижает риск, что один "выброс" в одной шкале определит весь результат.
 * Сумма весов в каждой формуле равна 1.
 */
const scoreFns: Record<string, (p: SkillFormulaProfile) => number> = {
  analytics: (p) => 0.4 * riasecScore(p, 'I') + 0.3 * icarScore(p, 'numeric') + 0.3 * icarScore(p, 'verbal'),
  empathy: (p) => 0.5 * bigFiveScore(p, 'A') + 0.25 * viaScore(p, 'kindness') + 0.25 * viaScore(p, 'social_intelligence'),
  creativity: (p) => 0.4 * riasecScore(p, 'A') + 0.3 * bigFiveScore(p, 'O') + 0.3 * viaScore(p, 'creativity'),
  leadership: (p) => 0.4 * riasecScore(p, 'E') + 0.3 * bigFiveScore(p, 'E') + 0.3 * viaScore(p, 'leadership'),
  'systems-thinking': (p) => 0.35 * riasecScore(p, 'I') + 0.25 * riasecScore(p, 'C') + 0.4 * icarScore(p, 'numeric'),
  communication: (p) => 0.4 * riasecScore(p, 'S') + 0.3 * bigFiveScore(p, 'E') + 0.3 * viaScore(p, 'social_intelligence'),
  resilience: (p) => 0.5 * bigFiveScore(p, 'N', true) + 0.25 * viaScore(p, 'perseverance') + 0.25 * viaScore(p, 'bravery'),
  teamwork: (p) => 0.4 * riasecScore(p, 'S') + 0.3 * bigFiveScore(p, 'A') + 0.3 * viaScore(p, 'teamwork'),
  precision: (p) => 0.4 * riasecScore(p, 'C') + 0.3 * bigFiveScore(p, 'C') + 0.3 * icarScore(p, 'numeric'),
  'spatial-reasoning': (p) => 0.6 * icarScore(p, 'spatial') + 0.4 * riasecScore(p, 'R'),
  persuasion: (p) => 0.5 * riasecScore(p, 'E') + 0.3 * viaScore(p, 'social_intelligence') + 0.2 * bigFiveScore(p, 'E'),
  discipline: (p) => 0.6 * bigFiveScore(p, 'C') + 0.4 * viaScore(p, 'self_regulation'),
  research: (p) => 0.45 * riasecScore(p, 'I') + 0.3 * icarScore(p, 'verbal') + 0.25 * viaScore(p, 'curiosity'),
  'handson-craft': (p) => 0.6 * riasecScore(p, 'R') + 0.4 * icarScore(p, 'spatial'),
  initiative: (p) => 0.5 * riasecScore(p, 'E') + 0.3 * viaScore(p, 'zest') + 0.2 * bigFiveScore(p, 'E'),
  'critical-thinking': (p) => 0.4 * icarScore(p, 'verbal') + 0.35 * icarScore(p, 'numeric') + 0.25 * viaScore(p, 'judgment'),
  adaptability: (p) => 0.4 * bigFiveScore(p, 'O') + 0.35 * bigFiveScore(p, 'N', true) + 0.25 * viaScore(p, 'hope'),
  'strategic-planning': (p) => 0.4 * riasecScore(p, 'C') + 0.3 * bigFiveScore(p, 'C') + 0.3 * viaScore(p, 'perspective'),
  'digital-literacy': (p) => 0.4 * riasecScore(p, 'C') + 0.3 * riasecScore(p, 'R') + 0.3 * icarScore(p, 'numeric'),
  mentoring: (p) => 0.4 * viaScore(p, 'social_intelligence') + 0.3 * riasecScore(p, 'S') + 0.3 * viaScore(p, 'perspective'),
};

/**
 * Готовые русскоязычные объяснения источника для каждой компетенции
 * (используются в отчёте: "Аналитика — по результатам логического блока и
 * исследовательского интереса"). Формулировки описывают ИЗМЕРЕНИЯ, а не
 * конкретные числа, поэтому остаются корректными для любого профиля.
 */
const evidenceTemplates: Record<string, string> = {
  analytics: 'по результатам логического блока (ICAR) и исследовательского интереса (RIASEC)',
  empathy: 'по доброжелательности характера (Big Five) и силам заботы о людях (VIA)',
  creativity: 'по артистическому интересу (RIASEC), открытости новому (Big Five) и творческой силе характера (VIA)',
  leadership: 'по предпринимательскому интересу (RIASEC), экстраверсии (Big Five) и лидерским качествам (VIA)',
  'systems-thinking': 'по исследовательскому и конвенциональному интересу (RIASEC) и логическому блоку (ICAR)',
  communication: 'по социальному интересу (RIASEC), экстраверсии (Big Five) и социальному интеллекту (VIA)',
  resilience: 'по эмоциональной устойчивости (Big Five) и настойчивости/смелости характера (VIA)',
  teamwork: 'по социальному интересу (RIASEC), доброжелательности (Big Five) и командной силе характера (VIA)',
  precision: 'по конвенциональному интересу (RIASEC), добросовестности (Big Five) и точности в логическом блоке (ICAR)',
  'spatial-reasoning': 'по пространственному блоку (ICAR) и практическому интересу (RIASEC)',
  persuasion: 'по предпринимательскому интересу (RIASEC), экстраверсии (Big Five) и социальному интеллекту (VIA)',
  discipline: 'по добросовестности (Big Five) и саморегуляции характера (VIA)',
  research: 'по исследовательскому интересу (RIASEC), вербальному блоку (ICAR) и любознательности (VIA)',
  'handson-craft': 'по практическому интересу (RIASEC) и пространственному блоку (ICAR)',
  initiative: 'по предпринимательскому интересу (RIASEC) и жизнелюбию характера (VIA)',
  'critical-thinking': 'по логическому блоку (ICAR) и критическому мышлению характера (VIA)',
  adaptability: 'по открытости новому и эмоциональной устойчивости (Big Five) и надежде характера (VIA)',
  'strategic-planning': 'по конвенциональному интересу (RIASEC), добросовестности (Big Five) и мудрости перспективы (VIA)',
  'digital-literacy': 'по конвенциональному и практическому интересу (RIASEC) и логическому блоку (ICAR)',
  mentoring: 'по социальному интеллекту и мудрости перспективы (VIA) и социальному интересу (RIASEC)',
};

/**
 * Вычисляет top-3 компетенции подростка и объяснение их источника.
 *
 * Пример:
 * ```ts
 * deriveSkillFormula({
 *   riasec: { R: 2, I: 4.5, A: 3, S: 2.5, E: 2, C: 3.5 },
 *   bigFive: { O: 4, C: 4, E: 3, A: 3, N: 2 },
 *   icar: { bySubscale: { verbal: 6, numeric: 7, spatial: 3 } },
 *   via: { curiosity: 4.5, judgment: 4, signatureStrengths: ['curiosity', 'judgment'] },
 * });
 * // => {
 * //   top3: ['analytics', 'critical-thinking', 'systems-thinking'],
 * //   evidence: {
 * //     analytics: 'Аналитика — по результатам логического блока (ICAR) и исследовательского интереса (RIASEC)',
 * //     'critical-thinking': 'Критическое мышление — по результатам логического блока (ICAR) и критического мышления характера (VIA)',
 * //     'systems-thinking': 'Системное мышление — по результатам исследовательского и конвенциального интереса (RIASEC) и логического блока (ICAR)',
 * //   },
 * // }
 * ```
 */
export function deriveSkillFormula(profile: SkillFormulaProfile): SkillFormulaResult {
  const scored = skills.map((skill, order) => ({
    code: skill.code,
    nameRu: skill.nameRu,
    order,
    score: (scoreFns[skill.code]?.(profile) ?? 0),
  }));

  // Стабильная сортировка по убыванию балла; при равенстве — исходный порядок
  // объявления в skills.ts (order) как детерминированный тай-брейк.
  scored.sort((a, b) => (b.score - a.score) || (a.order - b.order));

  const top3 = scored.slice(0, 3).map((s) => s.code);

  const evidence: Record<string, string> = {};
  top3.forEach((code) => {
    const skill = scored.find((s) => s.code === code)!;
    const template = evidenceTemplates[code] ?? 'по совокупности сигналов профиля';
    evidence[code] = `${skill.nameRu} — ${template}`;
  });

  return { top3, evidence };
}
