/**
 * 10 базовых ценностей Шварца (PVQ, короткая адаптация для подростков).
 * Единый источник русских названий — используется тестом, скорером и отчётом.
 */
export interface PvqValueDef {
  code: string;
  nameRu: string;
  /** Ключевые слова для грубого сопоставления с текстом коуч-сессии (см. consistency.ts). */
  keywords: string[];
}

export const pvqValues: PvqValueDef[] = [
  { code: 'self_direction', nameRu: 'Самостоятельность', keywords: ['свобод', 'сам решаю', 'независим', 'по своей воле'] },
  { code: 'stimulation', nameRu: 'Новизна и риск', keywords: ['риск', 'приключен', 'разнообраз', 'адреналин', 'экстрим'] },
  { code: 'hedonism', nameRu: 'Удовольствие', keywords: ['удовольств', 'радост', 'кайф', 'наслажд'] },
  { code: 'achievement', nameRu: 'Достижения', keywords: ['успех', 'достиж', 'результат', 'победа', 'лучш'] },
  { code: 'power', nameRu: 'Влияние', keywords: ['власт', 'влиян', 'управля', 'руковод'] },
  { code: 'security', nameRu: 'Безопасность и стабильность', keywords: ['стабильн', 'безопасн', 'надёжн', 'надежн', 'спокойств'] },
  { code: 'conformity', nameRu: 'Следование правилам', keywords: ['правил', 'дисциплин', 'порядок'] },
  { code: 'tradition', nameRu: 'Традиции', keywords: ['традиц', 'семейн', 'культур'] },
  { code: 'benevolence', nameRu: 'Забота о близких', keywords: ['забот', 'помога', 'близк', 'семь'] },
  { code: 'universalism', nameRu: 'Справедливость и забота о мире', keywords: ['справедлив', 'природ', 'экологи', 'общест'] },
];

export const pvqValueByCode: Record<string, PvqValueDef> = Object.fromEntries(
  pvqValues.map((v) => [v.code, v])
);
