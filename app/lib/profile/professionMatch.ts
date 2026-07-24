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
  /**
   * Разбивка совпадения по осям (docs/25, Трек A, «объяснимость»): по каким
   * характеристикам профессия подошла. Только активные оси (по которым есть
   * данные и у ученика, и у профессии). Для карточки в отчёте — «Интересы 92% ·
   * Ценности 80% · …».
   */
  breakdown: MatchAxis[];
}

export interface MatchAxis {
  /** Машинный ключ оси. */
  axis: 'interests' | 'personality' | 'values' | 'strengths' | 'cognitive' | 'subjects' | 'gardner';
  /** Человекочитаемая подпись для отчёта. */
  label: string;
  /** Балл по оси, 0–100. */
  score: number;
  /** Доля оси в итоговом совпадении после ре-нормировки (0–1). */
  weight: number;
}

/**
 * Профиль ученика для многомерного матчинга (docs/25, Трек A). Симметричен осям
 * паспорта профессии. Все поля, кроме riasec/bigFive, опциональны — если данных
 * нет (короткий экспресс-путь), ось просто исключается, а веса ре-нормируются по
 * оставшимся. Величины уже вычисляются в next-question/route.ts (finalRiasec,
 * finalBigFive, pvqScores.topValues, viaScores.signatureStrengths, icarScores.band).
 */
export interface MatchProfile {
  riasec: Record<string, number>;
  bigFive: Record<string, number | boolean>;
  /** Топ-ценности ученика, коды PVQ Шварца (см. pvqScores.topValues). */
  topValues?: string[];
  /** Сигнатурные силы характера ученика, коды VIA (см. viaScores.signatureStrengths). */
  signatureStrengths?: string[];
  /** Диапазон ICAR ученика: 'developing' | 'solid' | 'strong' (см. icarBand). */
  icarBand?: string;
  /**
   * Текстовые сигналы ученика (docs/31, Блок B) — сырой текст из коуч-сессии
   * (хобби, предметы, опыт), которого раньше НЕ было в матчинге вовсе: профессии
   * ранжировались только по числовым тестам, не по тому, что подросток реально
   * рассказал. Сверяется с `profession.subjects` по вхождению подстрок.
   */
  textSignals?: string;
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

// Каждый под-фит возвращает 0–1 при наличии данных ИЛИ null, если оси нет (у
// ученика нет замера ИЛИ у профессии не заполнено поле). null → ось исключается
// из взвешенной суммы, а веса ре-нормируются по оставшимся (graceful degradation).

function riasecFit(profession: Profession, riasec: Record<string, number>): number | null {
  // Нормируем баллы ученика (0–5) в 0–1 по полным названиям RIASEC.
  const studentByFull: Record<string, number> = {};
  for (const [letter, full] of Object.entries(RIASEC_LETTER_TO_FULL)) {
    const raw = riasec[letter];
    if (typeof raw === 'number') {
      studentByFull[full] = Math.max(0, Math.min(1, raw / 5));
    }
  }
  // Нет ни одного RIASEC-балла ученика — оси нет.
  if (Object.keys(studentByFull).length === 0) return null;
  let weighted = 0;
  let weightSum = 0;
  profession.riasec.forEach((code, idx) => {
    const w = RIASEC_POSITION_WEIGHT[idx] ?? 0.2;
    weighted += w * (studentByFull[code] ?? 0);
    weightSum += w;
  });
  return weightSum > 0 ? weighted / weightSum : null;
}

function bigFiveFit(profession: Profession, bigFive: Record<string, number | boolean>): number | null {
  const traits = profession.bigFive?.traits ?? {};
  const fits: number[] = [];
  (Object.entries(traits) as [BigFiveTrait, 'high' | 'low' | 'any' | undefined][]).forEach(([trait, expectation]) => {
    if (!expectation || expectation === 'any') return;
    const norm = studentTraitNorm(trait, bigFive);
    if (norm === null) return;
    fits.push(expectation === 'high' ? norm : 1 - norm);
  });
  // Нет сопоставимых черт (у профессии нет ограничений ИЛИ у ученича нет данных).
  return fits.length > 0 ? fits.reduce((s, f) => s + f, 0) / fits.length : null;
}

// Доля кодов профессии, попавших в набор ученика. Общий словарь кодов (PVQ/VIA)
// гарантирует сопоставимость. null — если у профессии не заполнено поле ИЛИ у
// ученика нет замера.
function overlapFit(professionCodes: string[] | undefined, studentCodes: string[] | undefined): number | null {
  if (!professionCodes || professionCodes.length === 0) return null;
  if (!studentCodes || studentCodes.length === 0) return null;
  const set = new Set(studentCodes);
  const hits = professionCodes.filter((c) => set.has(c)).length;
  return hits / professionCodes.length;
}

// Когнитивная нагрузка профессии ↔ ICAR-диапазон ученика. Мягкий guard-rail:
// если требования не выше возможностей — полное соответствие; если выше —
// штрафуем пропорционально разрыву, но НЕ обнуляем (пол 0.5), чтобы «не отрезать
// мечту» (docs/25, Трек A).
const ICAR_CAPACITY: Record<string, number> = { developing: 0, solid: 0.5, strong: 1 };
const DEMAND_LEVEL: Record<string, number> = { low: 0, medium: 0.5, high: 1 };

function cognitiveFit(profession: Profession, icarBand: string | undefined): number | null {
  const demand = profession.cognitiveDemand ? DEMAND_LEVEL[profession.cognitiveDemand] : undefined;
  const capacity = icarBand ? ICAR_CAPACITY[icarBand] : undefined;
  if (demand === undefined || capacity === undefined) return null;
  const gap = demand - capacity; // >0 → профессия требует больше, чем показал ученик
  if (gap <= 0) return 1;
  return Math.max(0.5, 1 - gap * 0.5); // gap 0.5 → 0.75; gap 1 → 0.5
}

// docs/31 Блок B2: интеллекты Гарднера напрямую не тестируются (нет отдельной
// батареи), поэтому выводятся из уже собранного RIASEC-профиля по устоявшейся в
// профориентации связке типов интересов с интеллектами (Holland↔Gardner). Не
// выдумка — стандартная эвристика, используется только когда точных данных нет.
const RIASEC_TO_GARDNER: Record<string, Profession['gardner']> = {
  Realistic: ['Bodily-Kinesthetic', 'Spatial-Visual'],
  Investigative: ['Logical-Mathematical', 'Naturalist'],
  Artistic: ['Musical', 'Spatial-Visual', 'Linguistic'],
  Social: ['Interpersonal', 'Linguistic'],
  Enterprising: ['Interpersonal', 'Intrapersonal'],
  Conventional: ['Logical-Mathematical', 'Intrapersonal'],
};

function deriveGardnerFromRiasec(riasec: Record<string, number>): string[] {
  const entries = Object.entries(RIASEC_LETTER_TO_FULL)
    .map(([letter, full]) => ({ full, score: riasec[letter] ?? 0 }))
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);
  const set = new Set<string>();
  entries.forEach((e) => (RIASEC_TO_GARDNER[e.full] || []).forEach((g) => set.add(g)));
  return Array.from(set);
}

function gardnerFit(profession: Profession, riasec: Record<string, number>): number | null {
  if (!profession.gardner || profession.gardner.length === 0) return null;
  const studentGardner = deriveGardnerFromRiasec(riasec);
  return overlapFit(profession.gardner, studentGardner);
}

// docs/31 Блок B1: верификация профессии по тому, что подросток РЕАЛЬНО написал
// коучу (хобби, предметы, опыт) — не только по числовым баллам тестов. Подстрочное
// сопоставление ключевых слов паспорта (`profession.subjects`) с сырым текстом
// ученика, регистронезависимо. Та же идея, что `talentSignals.ts` для коуча.
// Русские слова склоняются («математика» → «математику», «информатика» →
// «информатике») — точное совпадение подстрокой пропускает почти все реальные
// формы. Берём основу слова (первые ~80% символов, минимум 4) вместо точной
// формы — грубый, но рабочий стемминг без словаря.
function wordStem(word: string): string {
  const w = word.trim().toLowerCase();
  const len = Math.max(4, Math.floor(w.length * 0.8));
  return w.slice(0, Math.min(len, w.length));
}

function subjectsFit(profession: Profession, textSignals: string | undefined): number | null {
  if (!profession.subjects || profession.subjects.length === 0) return null;
  if (!textSignals || textSignals.trim().length === 0) return null;
  const lower = textSignals.toLowerCase();
  const hits = profession.subjects.filter((s) => lower.includes(wordStem(s))).length;
  return hits > 0 ? Math.min(1, hits / Math.min(3, profession.subjects.length)) : 0;
}

// Базовые веса осей (docs/25, Трек A). Активные оси ре-нормируются к сумме 1,
// поэтому отсутствие части осей (экспресс-путь) не ломает шкалу.
const AXIS_WEIGHTS = {
  interests: 0.30,
  personality: 0.15,
  values: 0.15,
  strengths: 0.15,
  cognitive: 0.10,
  // docs/31 Блок B3: две новые оси добирают вес до 1.00 (было 0.85) — прямая
  // верификация по тому, что подросток написал (subjects), и по интеллектам
  // Гарднера (более мягкая эвристика, поэтому вес ниже subjects).
  subjects: 0.10,
  gardner: 0.05,
} as const;

const AXIS_LABELS: Record<MatchAxis['axis'], string> = {
  interests: 'Интересы',
  personality: 'Личность',
  values: 'Ценности',
  strengths: 'Сильные стороны',
  cognitive: 'Мышление',
  subjects: 'Предметы и склонности',
  gardner: 'Тип интеллекта',
};

interface FitResult {
  fit: number;
  breakdown: MatchAxis[];
}

// Взвешенная сумma активных осей с ре-нормировкой. Если активных осей нет вовсе
// (пустой профиль) — нейтральные 0.5 без разбивки.
function computeFit(profession: Profession, profile: MatchProfile): FitResult {
  const raw: { axis: MatchAxis['axis']; value: number | null }[] = [
    { axis: 'interests', value: riasecFit(profession, profile.riasec) },
    { axis: 'personality', value: bigFiveFit(profession, profile.bigFive) },
    { axis: 'values', value: overlapFit(profession.values, profile.topValues) },
    { axis: 'strengths', value: overlapFit(profession.viaFit, profile.signatureStrengths) },
    { axis: 'cognitive', value: cognitiveFit(profession, profile.icarBand) },
    { axis: 'subjects', value: subjectsFit(profession, profile.textSignals) },
    { axis: 'gardner', value: gardnerFit(profession, profile.riasec) },
  ];
  const active = raw.filter((a): a is { axis: MatchAxis['axis']; value: number } => a.value !== null);
  const weightSum = active.reduce((s, a) => s + AXIS_WEIGHTS[a.axis], 0);
  if (weightSum === 0) return { fit: 0.5, breakdown: [] };
  let fit = 0;
  const breakdown: MatchAxis[] = active.map((a) => {
    const w = AXIS_WEIGHTS[a.axis] / weightSum;
    fit += w * a.value;
    return { axis: a.axis, label: AXIS_LABELS[a.axis], score: Math.round(a.value * 100), weight: parseFloat(w.toFixed(2)) };
  });
  return { fit, breakdown };
}

/**
 * Ранжирует ВСЕ профессии базы по многомерному соответствию профилю (docs/25,
 * Трек A): интересы (RIASEC), личность (Big Five), ценности (PVQ), сильные
 * стороны (VIA), когнитивная нагрузка (ICAR). Результат отсортирован по убыванию
 * совпадения (лучшие — первыми).
 */
export function matchProfessions(profile: MatchProfile): ProfessionMatch[] {
  const scored = professionsDb.map((profession) => {
    const { fit, breakdown } = computeFit(profession, profile);
    // Монотонное отображение fit(0–1) → 58–99%: сохраняет порядок, но не даёт
    // ведущей профессии выглядеть как «40%» в отчёте для подростка.
    const matchScore = Math.max(58, Math.min(99, Math.round(58 + fit * 41)));
    return { profession, matchScore, breakdown, fit };
  });
  scored.sort((a, b) => b.fit - a.fit || a.profession.name.localeCompare(b.profession.name));
  return scored.map(({ profession, matchScore, breakdown }) => ({ profession, matchScore, breakdown }));
}

/**
 * Топ-N максимально подходящих профессий (по умолчанию 20), СВЁРНУТЫХ по
 * архетипу (docs/22 §5, «подача архетипами»): если у одного архетипа совпало
 * несколько специализаций, в топ попадает только лучшая — чтобы список не
 * засорялся однотипными ролями (5 вариантов юриста → один «Юрист»). Профессии
 * без archetype группируются по собственному id, т.е. остаются как есть —
 * поведение обратно совместимо, пока поле не заполнено.
 */
export function topProfessions(
  profile: MatchProfile,
  n = 20,
): ProfessionMatch[] {
  const ranked = matchProfessions(profile);
  const seen = new Set<string>();
  const collapsed: ProfessionMatch[] = [];
  for (const match of ranked) {
    const key = match.profession.archetype || `id:${match.profession.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    collapsed.push(match);
    if (collapsed.length >= Math.max(0, n)) break;
  }
  return collapsed;
}

/**
 * То же ранжирование, но с «веером» специализаций внутри каждого архетипа:
 * лучшая специализация — `profession`, остальные совпавшие того же архетипа —
 * в `variants` (по убыванию совпадения). Для карточки архетипа в отчёте, где
 * под основной ролью показывается свёрнутый список родственных специализаций.
 */
export interface ArchetypeGroup extends ProfessionMatch {
  variants: ProfessionMatch[];
}

export function topArchetypes(
  profile: MatchProfile,
  n = 20,
): ArchetypeGroup[] {
  const ranked = matchProfessions(profile);
  const byKey = new Map<string, ArchetypeGroup>();
  const order: string[] = [];
  for (const match of ranked) {
    const key = match.profession.archetype || `id:${match.profession.id}`;
    const group = byKey.get(key);
    if (group) {
      group.variants.push(match);
    } else {
      byKey.set(key, { ...match, variants: [] });
      order.push(key);
    }
  }
  return order.slice(0, Math.max(0, n)).map((key) => byKey.get(key)!);
}
