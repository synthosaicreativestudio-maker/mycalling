import type { DiagnosticQuestion } from '../../data/questions';

export type Reliability = 'high' | 'medium' | 'low';

/**
 * Максимальное среднее расхождение между прямыми и обратными пунктами ОДНОЙ шкалы.
 * Берём максимум, а не средний по всем шкалам сразу — иначе противоречие в одной
 * черте маскируется согласованными ответами по остальным (см. тест bfiScorer).
 */
export function computeMaxReverseDeviation(
  answers: Record<string, number>,
  questions: DiagnosticQuestion[]
): number {
  const byScale = new Map<string, DiagnosticQuestion[]>();
  questions.forEach((q) => {
    const group = byScale.get(q.scale) ?? [];
    group.push(q);
    byScale.set(q.scale, group);
  });

  let maxAvgDeviation = 0;
  byScale.forEach((group) => {
    const direct = group.filter((q) => !q.reverseScored);
    const reverse = group.filter((q) => q.reverseScored);
    let sum = 0;
    let count = 0;
    direct.forEach((d) => {
      const dVal = answers[d.id];
      if (dVal === undefined) return;
      reverse.forEach((r) => {
        const rVal = answers[r.id];
        if (rVal === undefined) return;
        sum += Math.abs(dVal - (6 - rVal));
        count += 1;
      });
    });
    if (count > 0) {
      const avg = sum / count;
      if (avg > maxAvgDeviation) maxAvgDeviation = avg;
    }
  });
  return maxAvgDeviation;
}

/**
 * Единая оценка достоверности прохождения likert-блока: «плоский» паттерн ответов,
 * противоречия в обратных парах одной шкалы и доля пропусков понижают reliability.
 * Тесты с объективно верным ответом (ICAR) считают reliability отдельно (см. icarScorer).
 */
export function computeReliability(
  answers: Record<string, number>,
  questions: DiagnosticQuestion[]
): Reliability {
  if (questions.length === 0) return 'medium';

  const values = questions
    .map((q) => answers[q.id])
    .filter((v): v is number => v !== undefined);

  const missingRatio = 1 - values.length / questions.length;
  let downgrades = 0;

  if (values.length > 0) {
    const counts: Record<number, number> = {};
    values.forEach((v) => {
      counts[v] = (counts[v] || 0) + 1;
    });
    const maxCount = Math.max(...Object.values(counts));
    if (maxCount / values.length >= 0.9) downgrades += 2;
  }

  if (computeMaxReverseDeviation(answers, questions) > 2.5) downgrades += 1;
  if (missingRatio > 0.2) downgrades += 1;

  if (downgrades >= 2) return 'low';
  if (downgrades === 1) return 'medium';
  return 'high';
}
