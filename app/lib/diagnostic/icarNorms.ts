/**
 * Возрастные нормы ICAR (9 заданий: 3 verbal + 3 numeric + 3 spatial).
 * Первое приближение — экспертные пороги, не откалиброванные на выборке.
 * Перекалибровка: когда наберётся ≥200 прохождений на возрастную группу,
 * запустить `node scripts/icar-distribution.js` — он выгрузит распределение
 * баллов по группам и предложит новые пороги (low=p33, mid=p50, high=p90),
 * которые вручную переносятся сюда. До набора выборки пороги оставить как есть.
 */
export type IcarAgeGroup = '10-12' | '13-15' | '16-17';
export type IcarBand = 'developing' | 'solid' | 'strong';

export const icarNorms: Record<IcarAgeGroup, { low: number; mid: number; high: number }> = {
  '10-12': { low: 2, mid: 4, high: 6 },
  '13-15': { low: 3, mid: 5, high: 7 },
  '16-17': { low: 4, mid: 6, high: 8 },
};

export function icarAgeGroup(age?: number): IcarAgeGroup {
  if (age !== undefined) {
    if (age <= 12) return '10-12';
    if (age <= 15) return '13-15';
  }
  return '16-17';
}

/**
 * Балл интерпретируется относительно возрастной нормы, а не абсолютно —
 * это защищает подростка от заниженной студенческой нормы (см. методический аудит).
 */
export function icarBand(raw: number, age?: number): IcarBand {
  const group = icarAgeGroup(age);
  const norm = icarNorms[group];
  if (raw >= norm.high) return 'strong';
  if (raw >= norm.mid) return 'solid';
  return 'developing';
}
