import { z } from 'zod';

/**
 * 7-слойная структура цифрового профиля (см. методический аудит, слои I-VII
 * из 100 характеристик). Заменяет плоский ad-hoc объект, который раньше
 * писался в `DigitalProfile.summary` — каждый слой соответствует одному из
 * семи разделов аудита, plus consistency (триангуляция) и coverage (метрика
 * заполненности). Все поля опциональны на чтении (`.passthrough()` не нужен,
 * так как `DigitalProfile.summary` — write-only из кода приложения; только
 * next-question/route.ts когда-либо пишет в него).
 */

export const InterestsLayerSchema = z.object({
  riasec: z.record(z.string(), z.number()),
  hollandCode: z.string().optional(),
  antiInterests: z.array(z.string()).default([]),
  hobbies: z.array(z.string()).default([]),
});

export const PersonalityLayerSchema = z.object({
  bigFive: z.record(z.string(), z.union([z.number(), z.boolean()])),
  locusOfControl: z.number().optional(),
  ambiguityTolerance: z.number().optional(),
  honestyFlag: z.boolean().optional(),
});

export const StrengthsLayerSchema = z.object({
  via: z.record(z.string(), z.union([z.number(), z.array(z.string())])).optional(),
  signatureStrengths: z.array(z.string()).default([]),
});

export const CognitiveLayerSchema = z.object({
  icar: z.object({
    raw: z.number(),
    bySubscale: z.record(z.string(), z.number()),
    band: z.string(),
  }),
});

export const MotivationLayerSchema = z.object({
  coachValues: z.string().optional(),
  dreams: z.string().optional(),
  pvq: z.record(z.string(), z.number()).optional(),
  topValues: z.array(z.string()).default([]),
});

export const BehaviorLayerSchema = z.object({
  procrastination: z.number(),
  deepActions: z.string().optional(),
  deepFirstStep: z.string().optional(),
});

export const ContextLayerSchema = z.object({
  age: z.number().optional(),
  grade: z.string().optional(),
  city: z.string().optional(),
  idols: z.string().optional(),
  barriers: z.string().optional(),
});

export const ConsistencyLayerSchema = z.object({
  index: z.number(),
  level: z.enum(['high', 'medium', 'low']),
  contradictions: z.array(
    z.object({
      code: z.string(),
      testFact: z.string(),
      coachFact: z.string(),
      probe: z.string(),
      weight: z.number(),
    })
  ),
});

export const CoverageSchema = z.object({
  interests: z.number().min(0).max(1),
  personality: z.number().min(0).max(1),
  strengths: z.number().min(0).max(1),
  cognitive: z.number().min(0).max(1),
  motivation: z.number().min(0).max(1),
  behavior: z.number().min(0).max(1),
  context: z.number().min(0).max(1),
  overall: z.number().min(0).max(1),
});

export const SummaryProfileSchema = z.object({
  interests: InterestsLayerSchema,
  personality: PersonalityLayerSchema,
  strengths: StrengthsLayerSchema,
  cognitive: CognitiveLayerSchema,
  motivation: MotivationLayerSchema,
  behavior: BehaviorLayerSchema,
  context: ContextLayerSchema,
  consistency: ConsistencyLayerSchema.optional(),
  coverage: CoverageSchema,
});

export type InterestsLayer = z.infer<typeof InterestsLayerSchema>;
export type PersonalityLayer = z.infer<typeof PersonalityLayerSchema>;
export type StrengthsLayer = z.infer<typeof StrengthsLayerSchema>;
export type CognitiveLayer = z.infer<typeof CognitiveLayerSchema>;
export type MotivationLayer = z.infer<typeof MotivationLayerSchema>;
export type BehaviorLayer = z.infer<typeof BehaviorLayerSchema>;
export type ContextLayer = z.infer<typeof ContextLayerSchema>;
export type ConsistencyLayer = z.infer<typeof ConsistencyLayerSchema>;
export type Coverage = z.infer<typeof CoverageSchema>;
export type SummaryProfile = z.infer<typeof SummaryProfileSchema>;

/** Непустая строка/массив/число (не NaN) — используется для доли заполненности слоя. */
function isFilled(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value === 'boolean') return true;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

function layerCoverage(fields: unknown[]): number {
  if (fields.length === 0) return 0;
  const filled = fields.filter(isFilled).length;
  return parseFloat((filled / fields.length).toFixed(2));
}

/**
 * Доля заполненных параметров по каждому слою — это НЕ доля из 100 характеристик
 * аудита (это отдельная, более детальная метрика для будущей версии), а грубая
 * оценка по ключевым MVP-полям каждого слоя, чтобы кабинет мог показать
 * "профиль собран на N%".
 */
export function computeCoverage(profile: Omit<SummaryProfile, 'coverage'>): Coverage {
  const interests = layerCoverage([
    Object.keys(profile.interests.riasec).length > 0 ? 1 : undefined,
    profile.interests.hollandCode,
    profile.interests.antiInterests,
    profile.interests.hobbies,
  ]);
  const personality = layerCoverage([
    Object.keys(profile.personality.bigFive).length > 0 ? 1 : undefined,
    profile.personality.locusOfControl,
    profile.personality.ambiguityTolerance,
  ]);
  const strengths = layerCoverage([
    profile.strengths.via && Object.keys(profile.strengths.via).length > 0 ? 1 : undefined,
    profile.strengths.signatureStrengths,
  ]);
  const cognitive = layerCoverage([
    profile.cognitive.icar.bySubscale.verbal,
    profile.cognitive.icar.bySubscale.numeric,
    profile.cognitive.icar.bySubscale.spatial,
  ]);
  const motivation = layerCoverage([
    profile.motivation.coachValues,
    profile.motivation.dreams,
    profile.motivation.pvq,
    profile.motivation.topValues,
  ]);
  const behavior = layerCoverage([
    profile.behavior.procrastination,
    profile.behavior.deepActions,
    profile.behavior.deepFirstStep,
  ]);
  const context = layerCoverage([
    profile.context.age,
    profile.context.grade,
    profile.context.city,
    profile.context.idols,
    profile.context.barriers,
  ]);

  const layers = [interests, personality, strengths, cognitive, motivation, behavior, context];
  const overall = parseFloat((layers.reduce((sum, v) => sum + v, 0) / layers.length).toFixed(2));

  return { interests, personality, strengths, cognitive, motivation, behavior, context, overall };
}

/** Собирает 7-слойный профиль (с coverage) из уже вычисленных данных next-question/route.ts. */
export function buildSummaryProfile(input: Omit<SummaryProfile, 'coverage'>): SummaryProfile {
  return { ...input, coverage: computeCoverage(input) };
}
