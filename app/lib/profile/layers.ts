import { z } from 'zod';

/**
 * 7-слойная структура цифрового профиля подростка (120 характеристик)
 * Соответствует кластерам из методологического аудита.
 */

export const InterestsLayerSchema = z.object({
  riasec: z.record(z.string(), z.number()), // тест RIASEC
  hollandCode: z.string().optional(), // тест RIASEC
  antiInterests: z.array(z.string()).default([]), // коуч (Д-7)
  hobbies: z.array(z.string()).default([]), // коуч (Д-7, voluntaryHobbies)
  // Ниже — нет источника данных (ни коуч, ни тесты не задают этот вопрос).
  // Кандидаты на удаление или на будущий короткий тест: RIASEC уже покрывает
  // "артистический"/"предметные предпочтения" на уровне, достаточном для MVP.
  cabinVisualArt: z.number().optional(), // TODO: нет источника
  cabinPerformingArt: z.number().optional(), // TODO: нет источника
  subjectSTEM: z.number().optional(), // TODO: нет источника
  subjectHumanities: z.number().optional(), // TODO: нет источника
  subjectBioChem: z.number().optional(), // TODO: нет источника
  digitalInterests: z.array(z.string()).default([]), // TODO: нет источника
});

export const PersonalityLayerSchema = z.object({
  bigFive: z.record(z.string(), z.union([z.number(), z.boolean()])), // тест BFI
  locusOfControl: z.number().optional(), // тест BFI (LOC-пункты)
  ambiguityTolerance: z.number().optional(), // тест BFI (AMB-пункты)
  honestyFlag: z.boolean().optional(), // тест BFI (реверс-девиация)
  teiqueSelfAwareness: z.number().optional(), // тест GROWTH ("Внутренний компас")
  teiqueSelfRegulation: z.number().optional(), // тест GROWTH ("Внутренний компас")
  teiqueMotivation: z.number().optional(), // TODO: нет источника
  grit: z.number().optional(), // тест GROWTH ("Внутренний компас")
  mindsetGrowth: z.number().optional(), // тест GROWTH ("Внутренний компас")
  // Ниже — нет источника: TEIQue/Grit/Mindset выше уже покрывают ядро
  // эмоционального интеллекта и настойчивости; эти доп. поля дублируют их
  // детализацию без отдельного валидного инструмента — кандидаты на удаление.
  teiqueSocialSkills: z.number().optional(), // TODO: нет источника
  proactivity: z.number().optional(), // TODO: нет источника
  selfControl: z.number().optional(), // TODO: нет источника
  stressEvaluation: z.number().optional(), // TODO: нет источника
  emotionalReactivity: z.number().optional(), // TODO: нет источника
  mindsetOptimism: z.number().optional(), // TODO: нет источника
  locusControlInternal: z.number().optional(), // TODO: дублирует locusOfControl выше
});

export const StrengthsLayerSchema = z.object({
  via: z.record(z.string(), z.union([z.number(), z.array(z.string())])).optional(), // тест VIA (24 подшкалы)
  signatureStrengths: z.array(z.string()).default([]), // тест VIA
  // Агрегаты по 6 добродетелям — считаются VIA-скорером как среднее по силам,
  // входящим в добродетель (см. P0.1 fix, app/lib/diagnostic/scoring.ts).
  viaWisdom: z.number().optional(), // тест VIA (агрегат)
  viaCourage: z.number().optional(), // тест VIA (агрегат)
  viaHumanity: z.number().optional(), // тест VIA (агрегат)
  viaJustice: z.number().optional(), // тест VIA (агрегат)
  viaTemperance: z.number().optional(), // тест VIA (агрегат)
  viaTranscendence: z.number().optional(), // тест VIA (агрегат)
});

export const CognitiveLayerSchema = z.object({
  icar: z.object({
    raw: z.number(),
    bySubscale: z.record(z.string(), z.number()),
    band: z.string(),
  }), // тест ICAR
  // Ниже 8 конструктов (исполнительные функции, обучение, метакогниция,
  // самоэффективность, любознательность) теперь наполняются собственным тестом
  // COGNITIVE_STYLE («Стиль мышления», 14 пунктов) — см. docs/20 Фаза 4b,
  // app/data/questions.ts и cognitiveStyleScorer в scoring.ts. Средний балл 1-5.
  execInhibition: z.number().optional(), // источник: тест COGNITIVE_STYLE
  execFlexibility: z.number().optional(), // источник: тест COGNITIVE_STYLE
  learnDeep: z.number().optional(), // источник: тест COGNITIVE_STYLE
  learnSurface: z.number().optional(), // источник: тест COGNITIVE_STYLE
  selfEfficacyAcademic: z.number().optional(), // источник: тест COGNITIVE_STYLE
  metacogPlanning: z.number().optional(), // источник: тест COGNITIVE_STYLE
  metacogMonitoring: z.number().optional(), // источник: тест COGNITIVE_STYLE
  curiosityEpistemic: z.number().optional(), // источник: тест COGNITIVE_STYLE
  cogAiLiteracy: z.number().optional(), // TODO: нет источника, нужен отдельный тест
});

export const MotivationLayerSchema = z.object({
  coachValues: z.string().optional(), // коуч
  dreams: z.string().optional(), // коуч
  pvq: z.record(z.string(), z.number()).optional(), // тест PVQ
  topValues: z.array(z.string()).default([]), // тест PVQ
});

export const SocialLayerSchema = z.object({
  belbinLeader: z.number().optional(), // коуч
  belbinDoer: z.number().optional(), // коуч
  belbinCreator: z.number().optional(), // коуч
  belbinPeacemaker: z.number().optional(), // коуч
  // Ниже — нет источника. bullyingResistance/peerDependence — чувствительные
  // конструкты о буллинге/зависимости от сверстников: оценивать их эвристикой
  // ИИ-коуча по обрывку диалога методологически рискованно (ложный "диагноз").
  // Не добавлять без консультации с психологом-методологом. Остальные —
  // низкий приоритет, дублируют то, что уже видно из belbin-ролей и values.
  assertiveness: z.number().optional(), // TODO: нет источника
  empatheticListening: z.number().optional(), // TODO: нет источника
  feedbackSkill: z.number().optional(), // TODO: нет источника
  conflictResolution: z.number().optional(), // TODO: нет источника
  peerFriendships: z.number().optional(), // TODO: нет источника
  groupBelonging: z.number().optional(), // TODO: нет источника
  bullyingResistance: z.number().optional(), // TODO: чувствительная тема, нужен психолог-методолог
  peerDependence: z.number().optional(), // TODO: чувствительная тема, нужен психолог-методолог
  parentalInfluence: z.number().optional(), // TODO: нет источника (частично дублирует familyPressure)
  mentorInfluence: z.number().optional(), // TODO: нет источника
  socialCapital: z.number().optional(), // TODO: нет источника
});

export const BehaviorLayerSchema = z.object({
  procrastination: z.number(), // тест PROCRASTINATION (шкала Лэя)
  deepActions: z.string().optional(), // коуч (DEEP-сессия)
  deepFirstStep: z.string().optional(), // коуч (DEEP-сессия)
  savickasConcern: z.number().optional(), // коуч
  savickasControl: z.number().optional(), // коуч
  savickasCuriosity: z.number().optional(), // коуч
  savickasConfidence: z.number().optional(), // коуч
  // Ниже — нет источника. Каждое из этих полей — самостоятельный валидный
  // конструкт (перфекционизм, стиль принятия решений, резилентность), который
  // не стоит "досочинять" внутри уже длинной GROWTH-батареи — кандидаты на
  // будущие отдельные короткие тесты, не на удаление.
  perfectionismBarrier: z.number().optional(), // TODO: нет источника, нужен отдельный тест
  fearOfFailure: z.number().optional(), // TODO: нет источника, нужен отдельный тест
  decisionRational: z.number().optional(), // TODO: нет источника (частично — decisionStyle текстом от коуча)
  decisionIntuitive: z.number().optional(), // TODO: нет источника (частично — decisionStyle текстом от коуча)
  decisionDependent: z.number().optional(), // TODO: нет источника
  decisionImpulsive: z.number().optional(), // TODO: нет источника
  resilienceFailure: z.number().optional(), // TODO: нет источника, нужен отдельный тест
  learningFromMistakes: z.number().optional(), // TODO: нет источника
  timeManagement: z.number().optional(), // TODO: нет источника (частично пересекается с procrastination)
  routineDiscipline: z.number().optional(), // TODO: нет источника
  balanceWorkRest: z.number().optional(), // TODO: нет источника
  digitalHygiene: z.number().optional(), // TODO: нет источника
  contentCreationStyle: z.number().optional(), // TODO: нет источника
  cyberSocialization: z.number().optional(), // TODO: нет источника
  aiCollaboration: z.number().optional(), // TODO: нет источника
});

export const ContextLayerSchema = z.object({
  age: z.number().optional(), // коуч
  grade: z.string().optional(), // коуч
  city: z.string().optional(), // коуч
  idols: z.string().optional(), // коуч
  barriers: z.string().optional(), // коуч (fears)
  familyPressure: z.number().optional(), // тест CONTEXT ("Карта ресурсов")
  familyFinance: z.number().optional(), // тест CONTEXT ("Карта ресурсов")
  mobility: z.number().optional(), // тест CONTEXT ("Карта ресурсов")
  health: z.number().optional(), // тест CONTEXT ("Карта ресурсов")
  educationEnvAvail: z.number().optional(), // тест CONTEXT ("Карта ресурсов")
  careerReadiness: z.number().optional(), // тест CONTEXT ("Карта ресурсов")
  digitalDivide: z.number().optional(), // тест CONTEXT ("Карта ресурсов")
  // Ниже — нет источника.
  grades: z.number().optional(), // TODO: нет источника (объективная успеваемость — не самоотчёт)
  limitingBeliefs: z.number().optional(), // TODO: нет источника (частично пересекается с barriers/fears)
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
  social: z.number().min(0).max(1),
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
  social: SocialLayerSchema,
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
export type SocialLayer = z.infer<typeof SocialLayerSchema>;
export type BehaviorLayer = z.infer<typeof BehaviorLayerSchema>;
export type ContextLayer = z.infer<typeof ContextLayerSchema>;
export type ConsistencyLayer = z.infer<typeof ConsistencyLayerSchema>;
export type Coverage = z.infer<typeof CoverageSchema>;
export type SummaryProfile = z.infer<typeof SummaryProfileSchema>;

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

export function computeCoverage(profile: Omit<SummaryProfile, 'coverage'>): Coverage {
  const interests = layerCoverage([
    Object.keys(profile.interests.riasec).length > 0 ? 1 : undefined,
    profile.interests.hollandCode,
    profile.interests.antiInterests,
    profile.interests.hobbies,
    profile.interests.cabinVisualArt,
    profile.interests.cabinPerformingArt,
  ]);
  const personality = layerCoverage([
    Object.keys(profile.personality.bigFive).length > 0 ? 1 : undefined,
    profile.personality.locusOfControl,
    profile.personality.ambiguityTolerance,
    profile.personality.teiqueSelfAwareness,
    profile.personality.teiqueSelfRegulation,
    profile.personality.grit,
  ]);
  const strengths = layerCoverage([
    profile.strengths.via && Object.keys(profile.strengths.via).length > 0 ? 1 : undefined,
    profile.strengths.signatureStrengths,
    profile.strengths.viaWisdom,
  ]);
  const cognitive = layerCoverage([
    profile.cognitive.icar.bySubscale.verbal,
    profile.cognitive.icar.bySubscale.numeric,
    profile.cognitive.icar.bySubscale.spatial,
    profile.cognitive.execInhibition,
    profile.cognitive.execFlexibility,
  ]);
  const motivation = layerCoverage([
    profile.motivation.coachValues,
    profile.motivation.dreams,
    profile.motivation.pvq,
    profile.motivation.topValues,
  ]);
  const social = layerCoverage([
    profile.social.belbinLeader,
    profile.social.belbinDoer,
    profile.social.belbinCreator,
    profile.social.belbinPeacemaker,
    profile.social.assertiveness,
    profile.social.empatheticListening,
  ]);
  const behavior = layerCoverage([
    profile.behavior.procrastination,
    profile.behavior.deepActions,
    profile.behavior.deepFirstStep,
    profile.behavior.savickasConcern,
    profile.behavior.savickasControl,
    profile.behavior.savickasCuriosity,
    profile.behavior.savickasConfidence,
  ]);
  const context = layerCoverage([
    profile.context.age,
    profile.context.grade,
    profile.context.city,
    profile.context.idols,
    profile.context.barriers,
    profile.context.familyPressure,
    profile.context.familyFinance,
  ]);

  const layers = [interests, personality, strengths, cognitive, motivation, social, behavior, context];
  const overall = parseFloat((layers.reduce((sum, v) => sum + v, 0) / layers.length).toFixed(2));

  return { interests, personality, strengths, cognitive, motivation, social, behavior, context, overall };
}

export function buildSummaryProfile(input: Omit<SummaryProfile, 'coverage'>): SummaryProfile {
  return { ...input, coverage: computeCoverage(input) };
}
