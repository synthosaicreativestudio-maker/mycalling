/**
 * Справочник переносимых компетенций ("формула успеха").
 *
 * Идея: вместо конкретных профессий (которые быстро устаревают) отчёт называет
 * подростку 3 переносимые компетенции, собранные из профиля. `sources` — из
 * каких измерений профиля (диагностических блоков) эта компетенция выводится;
 * человекочитаемое описание используется в UI/промптах, а сам расчёт баллов
 * находится в `app/lib/profile/skillFormula.ts`.
 *
 * Порядок массива важен: `deriveSkillFormula` использует его как стабильный
 * тай-брейк при равенстве баллов (чем раньше компетенция объявлена — тем выше
 * приоритет при ничьей).
 */
export interface Skill {
  code: string;
  nameRu: string;
  /** Человекочитаемые источники сигнала (какие блоки/шкалы профиля питают эту компетенцию). */
  sources: string[];
  /** Сферы/профессии, где эта компетенция переносится (показываются в отчёте под формулой). */
  applications: string[];
}

export const skills: Skill[] = [
  { code: 'analytics', nameRu: 'Аналитика', sources: ['RIASEC.I (исследовательский интерес)', 'ICAR.numeric/verbal (логический блок)'], applications: ['Аналитика данных', 'Продуктовый менеджмент', 'Биоинформатика', 'Финансовое моделирование'] },
  { code: 'empathy', nameRu: 'Эмпатия', sources: ['BFI.A (доброжелательность)', 'VIA.kindness/social_intelligence'], applications: ['Психология', 'HR и подбор персонала', 'UX-исследования', 'Медицина', 'Социальная работа'] },
  { code: 'creativity', nameRu: 'Креативность', sources: ['RIASEC.A (артистический интерес)', 'BFI.O (открытость опыту)', 'VIA.creativity'], applications: ['Дизайн', 'Маркетинг и реклама', 'Разработка игр', 'Архитектура', 'Контент-продюсирование'] },
  { code: 'leadership', nameRu: 'Лидерство', sources: ['RIASEC.E (предпринимательский интерес)', 'BFI.E (экстраверсия)', 'VIA.leadership'], applications: ['Управление проектами', 'Предпринимательство', 'Продакт-менеджмент', 'Операционный менеджмент'] },
  { code: 'systems-thinking', nameRu: 'Системное мышление', sources: ['RIASEC.I/C', 'ICAR.numeric (логический блок)'], applications: ['Архитектура ПО', 'Инженерия', 'Бизнес-анализ', 'Логистика'] },
  { code: 'communication', nameRu: 'Коммуникация', sources: ['RIASEC.S (социальный интерес)', 'BFI.E (экстраверсия)', 'VIA.social_intelligence'], applications: ['Журналистика', 'PR и коммуникации', 'Продажи', 'Преподавание', 'Клиентский сервис'] },
  { code: 'resilience', nameRu: 'Стрессоустойчивость', sources: ['BFI.N (эмоциональная стабильность, обратная шкала)', 'VIA.perseverance/bravery'], applications: ['Экстренные службы', 'Медицина', 'Спорт высоких достижений', 'Антикризисное управление'] },
  { code: 'teamwork', nameRu: 'Командная работа', sources: ['RIASEC.S', 'BFI.A (доброжелательность)', 'VIA.teamwork'], applications: ['Разработка ПО', 'Производство', 'Event-менеджмент', 'Командный спорт'] },
  { code: 'precision', nameRu: 'Точность и внимание к деталям', sources: ['RIASEC.C (конвенциональный интерес)', 'BFI.C (добросовестность)', 'ICAR.numeric'], applications: ['Бухгалтерия', 'Контроль качества', 'Юриспруденция', 'Фармацевтика'] },
  { code: 'spatial-reasoning', nameRu: 'Пространственное мышление', sources: ['ICAR.spatial (пространственный блок)', 'RIASEC.R (реалистичный интерес)'], applications: ['Архитектура', 'Инженерия', '3D-моделирование', 'Хирургия'] },
  { code: 'persuasion', nameRu: 'Убеждение', sources: ['RIASEC.E', 'BFI.E (экстраверсия)', 'VIA.social_intelligence'], applications: ['Продажи', 'Маркетинг', 'Юриспруденция', 'Политика и GR'] },
  { code: 'discipline', nameRu: 'Дисциплина', sources: ['BFI.C (добросовестность)', 'VIA.self_regulation'], applications: ['Инженерия', 'Спорт', 'Военное дело', 'Проектное управление'] },
  { code: 'research', nameRu: 'Исследовательские навыки', sources: ['RIASEC.I', 'ICAR.verbal (логический блок)', 'VIA.curiosity'], applications: ['Наука', 'Аналитика рынка', 'Журналистские расследования', 'R&D'] },
  { code: 'handson-craft', nameRu: 'Практическое мастерство', sources: ['RIASEC.R (реалистичный интерес)', 'ICAR.spatial'], applications: ['Инженерия', 'Ремесленное производство', 'Медицинская техника', 'Строительство'] },
  { code: 'initiative', nameRu: 'Инициативность', sources: ['RIASEC.E', 'VIA.zest', 'BFI.E'], applications: ['Предпринимательство', 'Стартапы', 'Продуктовые команды'] },
  { code: 'critical-thinking', nameRu: 'Критическое мышление', sources: ['ICAR.verbal/numeric (логический блок)', 'VIA.judgment'], applications: ['Право', 'Наука', 'Журналистика', 'Стратегический консалтинг'] },
  { code: 'adaptability', nameRu: 'Адаптивность', sources: ['BFI.O (открытость опыту)', 'BFI.N (эмоциональная стабильность, обратная шкала)', 'VIA.hope'], applications: ['Стартапы', 'Кризис-менеджмент', 'Международные проекты'] },
  { code: 'strategic-planning', nameRu: 'Стратегическое планирование', sources: ['RIASEC.C', 'BFI.C (добросовестность)', 'VIA.perspective'], applications: ['Бизнес-стратегия', 'Управление проектами', 'Государственное управление'] },
  { code: 'digital-literacy', nameRu: 'Цифровая грамотность', sources: ['RIASEC.C/R', 'ICAR.numeric (логический блок)'], applications: ['IT и разработка', 'Цифровой маркетинг', 'Автоматизация процессов'] },
  { code: 'mentoring', nameRu: 'Наставничество', sources: ['VIA.social_intelligence/perspective', 'RIASEC.S'], applications: ['Преподавание', 'HR и развитие персонала', 'Коучинг', 'Тимлидство'] },
];

export const skillByCode: Record<string, Skill> = Object.fromEntries(
  skills.map((s) => [s.code, s])
);
