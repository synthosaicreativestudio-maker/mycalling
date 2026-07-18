/**
 * VIA Character Strengths (адаптация для подростков 10-17 лет) — 24 силы, 6 добродетелей.
 * Единый источник названий/описаний для отчёта, кабинета и промптов ИИ.
 */
export type ViaVirtue =
  | 'wisdom'
  | 'courage'
  | 'humanity'
  | 'justice'
  | 'temperance'
  | 'transcendence';

export interface ViaStrength {
  code: string;
  nameRu: string;
  virtue: ViaVirtue;
  shortDescription: string;
}

export const viaVirtueNames: Record<ViaVirtue, string> = {
  wisdom: 'Мудрость',
  courage: 'Мужество',
  humanity: 'Человечность',
  justice: 'Справедливость',
  temperance: 'Умеренность',
  transcendence: 'Трансцендентность',
};

export const viaStrengths: ViaStrength[] = [
  { code: 'creativity', nameRu: 'Креативность', virtue: 'wisdom', shortDescription: 'Находит новые, нестандартные способы делать привычные вещи.' },
  { code: 'curiosity', nameRu: 'Любознательность', virtue: 'wisdom', shortDescription: 'Проявляет живой интерес к новому опыту и знаниям.' },
  { code: 'judgment', nameRu: 'Критическое мышление', virtue: 'wisdom', shortDescription: 'Взвешивает разные точки зрения, прежде чем сделать вывод.' },
  { code: 'love_of_learning', nameRu: 'Любовь к обучению', virtue: 'wisdom', shortDescription: 'Осваивает новые навыки и темы ради самого процесса.' },
  { code: 'perspective', nameRu: 'Мудрость перспективы', virtue: 'wisdom', shortDescription: 'Умеет посмотреть на ситуацию со стороны и дать дельный совет.' },

  { code: 'bravery', nameRu: 'Смелость', virtue: 'courage', shortDescription: 'Не отступает перед трудностями, угрозой или дискомфортом.' },
  { code: 'perseverance', nameRu: 'Настойчивость', virtue: 'courage', shortDescription: 'Доводит начатое до конца, несмотря на препятствия.' },
  { code: 'honesty', nameRu: 'Честность', virtue: 'courage', shortDescription: 'Говорит правду и живёт в согласии со своими ценностями.' },
  { code: 'zest', nameRu: 'Жизнелюбие', virtue: 'courage', shortDescription: 'Подходит к жизни с энергией и энтузиазмом.' },

  { code: 'love', nameRu: 'Любовь', virtue: 'humanity', shortDescription: 'Ценит близкие отношения и умеет заботиться о других.' },
  { code: 'kindness', nameRu: 'Доброта', virtue: 'humanity', shortDescription: 'Делает добрые дела для других, не ожидая награды.' },
  { code: 'social_intelligence', nameRu: 'Социальный интеллект', virtue: 'humanity', shortDescription: 'Понимает мотивы и чувства других людей и себя.' },

  { code: 'teamwork', nameRu: 'Командная работа', virtue: 'justice', shortDescription: 'Работает как часть команды на общий результат.' },
  { code: 'fairness', nameRu: 'Справедливость', virtue: 'justice', shortDescription: 'Относится ко всем одинаково честно, без предвзятости.' },
  { code: 'leadership', nameRu: 'Лидерство', virtue: 'justice', shortDescription: 'Умеет организовать группу и вести её к цели.' },

  { code: 'forgiveness', nameRu: 'Прощение', virtue: 'temperance', shortDescription: 'Прощает тех, кто поступил плохо, и не держит обиду.' },
  { code: 'humility', nameRu: 'Скромность', virtue: 'temperance', shortDescription: 'Не выпячивает свои достижения, даёт другим проявиться.' },
  { code: 'prudence', nameRu: 'Благоразумие', virtue: 'temperance', shortDescription: 'Осторожен в выборе, не рискует без необходимости.' },
  { code: 'self_regulation', nameRu: 'Саморегуляция', virtue: 'temperance', shortDescription: 'Управляет своими чувствами и поведением.' },

  { code: 'appreciation_of_beauty', nameRu: 'Чувство прекрасного', virtue: 'transcendence', shortDescription: 'Замечает и ценит красоту и мастерство вокруг.' },
  { code: 'gratitude', nameRu: 'Благодарность', virtue: 'transcendence', shortDescription: 'Замечает и ценит хорошее, что происходит в жизни.' },
  { code: 'hope', nameRu: 'Надежда', virtue: 'transcendence', shortDescription: 'Ожидает лучшего будущего и работает на его достижение.' },
  { code: 'humor', nameRu: 'Юмор', virtue: 'transcendence', shortDescription: 'Любит смеяться, шутить, поднимает настроение другим.' },
  { code: 'spirituality', nameRu: 'Смыслоориентированность', virtue: 'transcendence', shortDescription: 'Ищет смысл и предназначение в своих действиях.' },
];

export const viaStrengthByCode: Record<string, ViaStrength> = Object.fromEntries(
  viaStrengths.map((s) => [s.code, s])
);
