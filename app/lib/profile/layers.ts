import { z } from 'zod';

/**
 * 7-слойная структура цифрового профиля подростка (120 характеристик)
 * Соответствует кластерам из методологического аудита.
 */

export const InterestsLayerSchema = z.object({
  riasec: z.record(z.string(), z.number()),
  hollandCode: z.string().optional(),
  antiInterests: z.array(z.string()).default([]),
  hobbies: z.array(z.string()).default([]),
  cabinVisualArt: z.number().optional(),
  cabinPerformingArt: z.number().optional(),
  subjectSTEM: z.number().optional(),
  subjectHumanities: z.number().optional(),
  subjectBioChem: z.number().optional(),
  digitalInterests: z.array(z.string()).default([]),
});

export const PersonalityLayerSchema = z.object({
  bigFive: z.record(z.string(), z.union([z.number(), z.boolean()])),
  locusOfControl: z.number().optional(),
  ambiguityTolerance: z.number().optional(),
  honestyFlag: z.boolean().optional(),
  teiqueSelfAwareness: z.number().optional(),
  teiqueSelfRegulation: z.number().optional(),
  teiqueSocialSkills: z.number().optional(),
  teiqueMotivation: z.number().optional(),
  grit: z.number().optional(),
  proactivity: z.number().optional(),
  selfControl: z.number().optional(),
  stressEvaluation: z.number().optional(),
  emotionalReactivity: z.number().optional(),
  mindsetGrowth: z.number().optional(),
  mindsetOptimism: z.number().optional(),
  locusControlInternal: z.number().optional(),
});

export const StrengthsLayerSchema = z.object({
  via: z.record(z.string(), z.union([z.number(), z.array(z.string())])).optional(),
  signatureStrengths: z.array(z.string()).default([]),
  viaWisdom: z.number().optional(),
  viaCourage: z.number().optional(),
  viaHumanity: z.number().optional(),
  viaJustice: z.number().optional(),
  viaTemperance: z.number().optional(),
});

export const CognitiveLayerSchema = z.object({
  icar: z.object({
    raw: z.number(),
    bySubscale: z.record(z.string(), z.number()),
    band: z.string(),
  }),
  execInhibition: z.number().optional(),
  execFlexibility: z.number().optional(),
  learnDeep: z.number().optional(),
  learnSurface: z.number().optional(),
  selfEfficacyAcademic: z.number().optional(),
  metacogPlanning: z.number().optional(),
  metacogMonitoring: z.number().optional(),
  curiosityEpistemic: z.number().optional(),
  cogAiLiteracy: z.number().optional(),
});

export const MotivationLayerSchema = z.object({
  coachValues: z.string().optional(),
  dreams: z.string().optional(),
  pvq: z.record(z.string(), z.number()).optional(),
  topValues: z.array(z.string()).default([]),
});

export const SocialLayerSchema = z.object({
  belbinLeader: z.number().optional(),
  belbinDoer: z.number().optional(),
  belbinCreator: z.number().optional(),
  belbinPeacemaker: z.number().optional(),
  assertiveness: z.number().optional(),
  empatheticListening: z.number().optional(),
  feedbackSkill: z.number().optional(),
  conflictResolution: z.number().optional(),
  peerFriendships: z.number().optional(),
  groupBelonging: z.number().optional(),
  bullyingResistance: z.number().optional(),
  peerDependence: z.number().optional(),
  parentalInfluence: z.number().optional(),
  mentorInfluence: z.number().optional(),
  socialCapital: z.number().optional(),
});

export const BehaviorLayerSchema = z.object({
  procrastination: z.number(),
  deepActions: z.string().optional(),
  deepFirstStep: z.string().optional(),
  savickasConcern: z.number().optional(),
  savickasControl: z.number().optional(),
  savickasCuriosity: z.number().optional(),
  savickasConfidence: z.number().optional(),
  perfectionismBarrier: z.number().optional(),
  fearOfFailure: z.number().optional(),
  decisionRational: z.number().optional(),
  decisionIntuitive: z.number().optional(),
  decisionDependent: z.number().optional(),
  decisionImpulsive: z.number().optional(),
  resilienceFailure: z.number().optional(),
  learningFromMistakes: z.number().optional(),
  timeManagement: z.number().optional(),
  routineDiscipline: z.number().optional(),
  balanceWorkRest: z.number().optional(),
  digitalHygiene: z.number().optional(),
  contentCreationStyle: z.number().optional(),
  cyberSocialization: z.number().optional(),
  aiCollaboration: z.number().optional(),
});

export const ContextLayerSchema = z.object({
  age: z.number().optional(),
  grade: z.string().optional(),
  city: z.string().optional(),
  idols: z.string().optional(),
  barriers: z.string().optional(),
  familyPressure: z.number().optional(),
  familyFinance: z.number().optional(),
  mobility: z.number().optional(),
  health: z.number().optional(),
  grades: z.number().optional(),
  limitingBeliefs: z.number().optional(),
  educationEnvAvail: z.number().optional(),
  careerReadiness: z.number().optional(),
  digitalDivide: z.number().optional(),
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
