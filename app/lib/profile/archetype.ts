import { viaStrengthByCode, ViaVirtue } from '../../data/viaStrengths';

/**
 * Детерминированный вывод ведущего архетипа (Пирсон-Марр, на базе Юнга) из уже
 * измеренных данных — VIA (24 силы → 6 добродетелей) и ценностей Шварца (PVQ).
 *
 * Раньше архетип определял LLM «на глазок» в финальном промпте коуча — методический
 * аудит (характеристики для сбора.doc, §3-4) назвал это самым слабым звеном из-за
 * низкой валидности. Здесь мы считаем его прозрачно и воспроизводимо: каждый архетип
 * — это взвешенная комбинация относительной выраженности добродетелей VIA и ценностей
 * PVQ. «Относительной» — т.к. архетип описывает ПРОФИЛЬ (что сильнее на фоне
 * остального у конкретного человека), а не абсолютный уровень.
 */

export type ArchetypeKey =
  | 'creator'
  | 'explorer'
  | 'sage'
  | 'hero'
  | 'ruler'
  | 'caregiver'
  | 'jester';

export interface ArchetypeResult {
  key: ArchetypeKey;
  nameRu: string;
  superpower: string;
  /** Из чего сложился вывод — для честной прозрачности в отчёте. */
  evidence: string[];
  /** Нормированный балл 0-100 ведущего архетипа относительно остальных. */
  score: number;
}

interface ArchetypeDef {
  nameRu: string;
  superpower: string;
  /** Веса по добродетелям VIA (0..1). */
  virtues: Partial<Record<ViaVirtue, number>>;
  /** Веса по кодам ценностей PVQ (0..1). */
  values: Partial<Record<string, number>>;
}

const ARCHETYPES: Record<ArchetypeKey, ArchetypeDef> = {
  creator: {
    nameRu: 'Творец',
    superpower: 'превращать идеи в новое — там, где другие видят пустоту, ты видишь замысел.',
    virtues: { wisdom: 1, transcendence: 0.3 },
    values: { self_direction: 1, stimulation: 0.6 },
  },
  explorer: {
    nameRu: 'Искатель',
    superpower: 'идти первым на неизведанное и находить свой путь, не боясь неопределённости.',
    virtues: { courage: 1, wisdom: 0.4 },
    values: { stimulation: 1, self_direction: 0.7 },
  },
  sage: {
    nameRu: 'Мудрец',
    superpower: 'докапываться до сути и объяснять сложное просто — знание как компас.',
    virtues: { wisdom: 1, temperance: 0.4 },
    values: { universalism: 0.8, self_direction: 0.4 },
  },
  hero: {
    nameRu: 'Герой',
    superpower: 'брать вызов и доводить до победы там, где хочется сдаться.',
    virtues: { courage: 1, justice: 0.3 },
    values: { achievement: 1, power: 0.4 },
  },
  ruler: {
    nameRu: 'Правитель',
    superpower: 'наводить порядок и вести людей — держать систему и ответственность на себе.',
    virtues: { justice: 1, temperance: 0.4 },
    values: { power: 1, achievement: 0.5, security: 0.4 },
  },
  caregiver: {
    nameRu: 'Заботливый',
    superpower: 'чувствовать людей и поддерживать — твоя сила в том, чтобы делать другим лучше.',
    virtues: { humanity: 1, justice: 0.3 },
    values: { benevolence: 1, universalism: 0.5 },
  },
  jester: {
    nameRu: 'Шут',
    superpower: 'заражать энергией и лёгкостью, находить радость и игру даже в рутине.',
    virtues: { transcendence: 1, humanity: 0.3 },
    values: { hedonism: 1, stimulation: 0.5 },
  },
};

const ALL_VIRTUES: ViaVirtue[] = [
  'wisdom', 'courage', 'humanity', 'justice', 'temperance', 'transcendence',
];

/** Приводит словарь к относительным весам 0-1 (min-max по имеющимся значениям). */
function normalize(scores: Record<string, number>): Record<string, number> {
  const values = Object.values(scores);
  if (values.length === 0) return {};
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(scores)) {
    out[k] = span === 0 ? 0.5 : (v - min) / span;
  }
  return out;
}

/**
 * @param viaScores  посильные баллы VIA (код силы → 1-5), как в scoring.ts
 * @param pvqCentered центрированные баллы PVQ (код ценности → число), как в scoring.ts
 */
export function deriveArchetype(
  viaScores: Record<string, number>,
  pvqCentered: Record<string, number>
): ArchetypeResult | null {
  // 1. VIA: агрегируем силы в добродетели (среднее по имеющимся силам добродетели).
  const virtueSums: Record<string, { sum: number; count: number }> = {};
  for (const [code, val] of Object.entries(viaScores)) {
    if (typeof val !== 'number') continue;
    const strength = viaStrengthByCode[code];
    if (!strength) continue;
    const v = strength.virtue;
    if (!virtueSums[v]) virtueSums[v] = { sum: 0, count: 0 };
    virtueSums[v].sum += val;
    virtueSums[v].count += 1;
  }
  const virtueAvg: Record<string, number> = {};
  for (const v of ALL_VIRTUES) {
    if (virtueSums[v] && virtueSums[v].count > 0) {
      virtueAvg[v] = virtueSums[v].sum / virtueSums[v].count;
    }
  }
  if (Object.keys(virtueAvg).length === 0) return null;

  const virtueNorm = normalize(virtueAvg);
  const valueNorm = normalize(pvqCentered);

  // 2. Балл каждого архетипа = взвешенная сумма относительных добродетелей и ценностей.
  const raw: Record<ArchetypeKey, number> = {} as Record<ArchetypeKey, number>;
  for (const key of Object.keys(ARCHETYPES) as ArchetypeKey[]) {
    const def = ARCHETYPES[key];
    let score = 0;
    let weight = 0;
    // Вес компонента ВСЕГДА идёт в знаменатель: если архетипу нужен сигнал,
    // которого в данных нет (напр. ценность universalism), он получает 0 по этому
    // компоненту, а не «прощение» через ре-нормировку. Иначе архетип, чьи немногие
    // измеренные компоненты случайно максимальны, побеждал бы по умолчанию.
    for (const [virtue, w] of Object.entries(def.virtues)) {
      score += (virtueNorm[virtue] ?? 0) * (w as number);
      weight += w as number;
    }
    for (const [value, w] of Object.entries(def.values)) {
      score += (valueNorm[value] ?? 0) * (w as number);
      weight += w as number;
    }
    raw[key] = weight > 0 ? score / weight : 0;
  }

  // 3. Ведущий архетип.
  const sorted = (Object.entries(raw) as [ArchetypeKey, number][]).sort((a, b) => b[1] - a[1]);
  const [topKey, topScore] = sorted[0];
  const def = ARCHETYPES[topKey];

  // 4. Доказательная база — топ-добродетель и топ-ценность, из которых он сложился.
  const topVirtue = (Object.entries(virtueNorm) as [string, number][]).sort((a, b) => b[1] - a[1])[0];
  const topValue = (Object.entries(valueNorm) as [string, number][]).sort((a, b) => b[1] - a[1])[0];
  const evidence: string[] = [];
  if (topVirtue) {
    const virtueRu: Record<string, string> = {
      wisdom: 'Мудрость', courage: 'Мужество', humanity: 'Человечность',
      justice: 'Справедливость', temperance: 'Умеренность', transcendence: 'Трансцендентность',
    };
    evidence.push(`Ведущая добродетель по VIA: ${virtueRu[topVirtue[0]] || topVirtue[0]}`);
  }
  if (topValue) evidence.push(`Ведущая ценность по PVQ: ${topValue[0]}`);

  return {
    key: topKey,
    nameRu: def.nameRu,
    superpower: def.superpower,
    evidence,
    score: Math.round(topScore * 100),
  };
}
