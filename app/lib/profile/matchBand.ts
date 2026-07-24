/**
 * B2 (docs/audit C-1): честная подача совпадения. Матчинг даёт ранговый fit,
 * растянутый в 58–99 (`professionMatch.ts`). Показывать это как «92%» —
 * псевдо-психометрика: подросток читает процент как измеренную вероятность
 * пригодности. Вместо числа показываем качественную полосу совпадения
 * («направление для исследования»), сохраняя порядок ранжирования.
 */
export type MatchBand = {
  label: string;
  /** Служебный ключ для стилей/аналитики. */
  key: 'strong' | 'good' | 'explore';
};

export function matchBand(score: number): MatchBand {
  if (score >= 85) return { key: 'strong', label: 'Сильное совпадение' };
  if (score >= 72) return { key: 'good', label: 'Хорошее совпадение' };
  return { key: 'explore', label: 'Стоит присмотреться' };
}
