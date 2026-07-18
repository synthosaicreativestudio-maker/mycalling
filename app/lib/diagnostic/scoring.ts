import type { DiagnosticQuestion } from '../../data/questions';
import { computeMaxReverseDeviation, computeReliability, type Reliability } from './reliability';
import { icarBand } from './icarNorms';
import { viaStrengths } from '../../data/viaStrengths';
import { pvqValues } from '../../data/pvqValues';

export interface ScoreContext {
  age?: number;
}

export interface ScoreResult {
  scores: Record<string, unknown>;
  reliability: Reliability;
}

export interface TestScorer {
  testCode: string;
  score(
    answers: Record<string, number>,
    questions: DiagnosticQuestion[],
    context?: ScoreContext
  ): ScoreResult;
}

function average(sum: number, count: number, fallback = 3): number {
  return count ? parseFloat((sum / count).toFixed(2)) : fallback;
}

function questionsFor(testCode: string, questions: DiagnosticQuestion[]): DiagnosticQuestion[] {
  return questions.filter((q) => q.testCode === testCode);
}

/** RIASEC: средний балл 1-5 по каждой из шести шкал R/I/A/S/E/C. */
export const riasecScorer: TestScorer = {
  testCode: 'RIASEC',
  score(answers, questions) {
    const qs = questionsFor('RIASEC', questions);
    const sums: Record<string, number> = {};
    const counts: Record<string, number> = {};
    qs.forEach((q) => {
      const value = answers[q.id];
      if (value === undefined) return;
      sums[q.scale] = (sums[q.scale] ?? 0) + value;
      counts[q.scale] = (counts[q.scale] ?? 0) + 1;
    });
    const scales = ['R', 'I', 'A', 'S', 'E', 'C'];
    const scores = Object.fromEntries(
      scales.map((key) => [key, average(sums[key] ?? 0, counts[key] ?? 0)])
    );
    return { scores, reliability: computeReliability(answers, qs) };
  },
};

/**
 * Big Five: канонические ключи O/C/E/A/N (в данных встречаются исторические алиасы
 * шкал C_bigfive/E_bigfive/A_bigfive — сводим их к канону, чтобы отчёт не дублировал черты).
 */
const BFI_CANONICAL: Record<string, string> = {
  O: 'O',
  C_bigfive: 'C',
  E_bigfive: 'E',
  A_bigfive: 'A',
  N: 'N',
  LOC: 'LOC',
  AMB: 'AMB',
};

export const bfiScorer: TestScorer = {
  testCode: 'BFI',
  score(answers, questions) {
    const qs = questionsFor('BFI', questions);
    const sums: Record<string, number> = {};
    const counts: Record<string, number> = {};

    qs.forEach((q) => {
      const value = answers[q.id];
      if (value === undefined) return;
      const canonicalKey = BFI_CANONICAL[q.scale] ?? q.scale;
      const finalVal = q.reverseScored ? 6 - value : value;
      sums[canonicalKey] = (sums[canonicalKey] ?? 0) + finalVal;
      counts[canonicalKey] = (counts[canonicalKey] ?? 0) + 1;
    });

    const canonicalKeys = ['O', 'C', 'E', 'A', 'N'];
    const scores: Record<string, unknown> = Object.fromEntries(
      canonicalKeys.map((key) => [key, average(sums[key] ?? 0, counts[key] ?? 0)])
    );
    if (counts.LOC) scores.LOC = average(sums.LOC ?? 0, counts.LOC ?? 0);
    if (counts.AMB) scores.AMB = average(sums.AMB ?? 0, counts.AMB ?? 0);

    const honestyFlag = computeMaxReverseDeviation(answers, qs) > 2.5;
    scores.honestyFlag = honestyFlag;

    let reliability = computeReliability(answers, qs);
    if (honestyFlag && reliability === 'high') reliability = 'medium';

    return { scores, reliability };
  },
};

/** ICAR: три субшкалы (verbal/numeric/spatial), суммарный балл интерпретируется по возрастной норме. */
export const icarScorer: TestScorer = {
  testCode: 'ICAR',
  score(answers, questions, context) {
    const qs = questionsFor('ICAR', questions);
    const bySubscale: Record<string, number> = { verbal: 0, numeric: 0, spatial: 0 };
    let raw = 0;
    let answeredCount = 0;
    let totalElapsedMs = 0;
    let elapsedCount = 0;

    qs.forEach((q) => {
      const value = answers[q.id];
      if (value === undefined) return;
      answeredCount += 1;
      if (q.correctValue !== undefined && value === q.correctValue) {
        raw += 1;
        bySubscale[q.scale] = (bySubscale[q.scale] ?? 0) + 1;
      }
    });

    const band = icarBand(raw, context?.age);
    const missingRatio = qs.length ? 1 - answeredCount / qs.length : 0;
    const tooFast = elapsedCount > 0 && totalElapsedMs / elapsedCount < 3000;

    let reliability: Reliability = 'high';
    if (missingRatio > 0.2 || tooFast) reliability = 'medium';
    if (missingRatio > 0.5) reliability = 'low';

    return {
      scores: { raw, bySubscale, band },
      reliability,
    };
  },
};

/** Прокрастинация (шкала Лэя): суммарный балл, обратные пункты пересчитываются. */
export const procrastinationScorer: TestScorer = {
  testCode: 'PROCRASTINATION',
  score(answers, questions) {
    const qs = questionsFor('PROCRASTINATION', questions);
    let score = 0;
    qs.forEach((q) => {
      const value = answers[q.id];
      if (value === undefined) return;
      score += q.reverseScored ? 6 - value : value;
    });
    return { scores: { score }, reliability: computeReliability(answers, qs) };
  },
};

/**
 * VIA Youth Survey: средний балл 1-5 по каждой из 24 сильных сторон характера,
 * плюс топ-5 сигнатурных сил (при равенстве баллов — по порядку добродетелей в viaStrengths).
 */
export const viaScorer: TestScorer = {
  testCode: 'VIA',
  score(answers, questions) {
    const qs = questionsFor('VIA', questions);
    const scores: Record<string, number> = {};
    qs.forEach((q) => {
      const value = answers[q.id];
      if (value === undefined) return;
      scores[q.scale] = value;
    });

    const signatureStrengths = viaStrengths
      .map((s) => s.code)
      .filter((code) => scores[code] !== undefined)
      .sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0))
      .slice(0, 5);

    return {
      scores: { ...scores, signatureStrengths },
      reliability: computeReliability(answers, qs),
    };
  },
};

/**
 * PVQ Шварца: сырой балл 1-5 по каждой из 10 ценностей плюс центрированный
 * балл (ипсатизация — стандарт для PVQ, убирает индивидуальный сдвиг шкалы
 * "все важно"/"всё неважно") и топ-3 ценности по центрированному баллу.
 */
export const pvqScorer: TestScorer = {
  testCode: 'PVQ',
  score(answers, questions) {
    const qs = questionsFor('PVQ', questions);
    const raw: Record<string, number> = {};
    qs.forEach((q) => {
      const value = answers[q.id];
      if (value === undefined) return;
      raw[q.scale] = value;
    });

    const rawValues = Object.values(raw);
    const mean = rawValues.length ? rawValues.reduce((s, v) => s + v, 0) / rawValues.length : 0;
    const centered: Record<string, number> = {};
    Object.entries(raw).forEach(([code, v]) => {
      centered[code] = parseFloat((v - mean).toFixed(2));
    });

    const topValues = pvqValues
      .map((v) => v.code)
      .filter((code) => centered[code] !== undefined)
      .sort((a, b) => (centered[b] ?? 0) - (centered[a] ?? 0))
      .slice(0, 3);

    return {
      scores: { raw, centered, topValues },
      reliability: computeReliability(answers, qs),
    };
  },
};

export const scorers: Record<string, TestScorer> = {
  RIASEC: riasecScorer,
  BFI: bfiScorer,
  ICAR: icarScorer,
  PROCRASTINATION: procrastinationScorer,
  VIA: viaScorer,
  PVQ: pvqScorer,
};

export function registerScorer(scorer: TestScorer): void {
  scorers[scorer.testCode] = scorer;
}
