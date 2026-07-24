/**
 * B1b (docs/26 этап 8, Трек H): образовательный путь и перспективы профессии.
 *
 * salary и fact уже заполнены курировано (professionExtras.ts, 204/204).
 * educationPath и outlook в базе часто пусты — здесь выводим их из уже
 * известных полей (профильные предметы, спрос, tier, индустрия), чтобы карточка
 * давала пользователю понятный «куда поступать» и «перспективы» для КАЖДОЙ
 * профессии. Явно заданные поля всегда имеют приоритет над выводом. Формулировки
 * честно ориентировочные (не гарантия).
 */

export interface GuidanceInput {
  subjects?: string[];
  industry?: string;
  demand?: string; // 'high' | 'medium' | 'low' и т.п.
  tier?: 'everyday' | 'future' | 'dream';
  educationPath?: string;
  outlook?: string;
}

export function deriveEducationPath(p: GuidanceInput): string {
  if (p.educationPath && p.educationPath.trim()) return p.educationPath;
  const subjects = (p.subjects ?? []).filter(Boolean);
  const subjPart = subjects.length
    ? `Профильные предметы: ${subjects.join(', ')}.`
    : 'Уточни профильные предметы под конкретную специализацию.';
  const industryPart = p.industry
    ? ` Поступление в вуз или колледж (СПО) по направлению «${p.industry}».`
    : ' Возможны пути через вуз и через колледж (СПО).';
  return `${subjPart}${industryPart} Ориентировочно — сверься с требованиями конкретных программ.`;
}

export function deriveOutlook(p: GuidanceInput): string {
  if (p.outlook && p.outlook.trim()) return p.outlook;
  if (p.tier === 'future' || p.demand === 'high') {
    return 'Высокий и растущий спрос на рынке труда (ориентировочно).';
  }
  if (p.tier === 'dream') {
    return 'Конкурсное направление: спрос есть, но вход требует усилий и плана Б.';
  }
  if (p.demand === 'medium') {
    return 'Стабильный спрос; многое зависит от специализации и региона.';
  }
  return 'Востребованность зависит от региона и специализации (ориентировочно).';
}
