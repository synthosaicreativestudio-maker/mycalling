export interface ProfessionMapping {
  primary: string[];
  secondary: string[];
  anti: string[];
}

export const characteristicsMapping: Record<string, ProfessionMapping> = {
  // IT и разработка ПО
  'Backend-разработчик': {
    primary: ['riasec_conventional', 'riasec_realistic', 'cog_math_logic', 'cog_algorithm'],
    secondary: ['bigfive_conscientiousness', 'via_judgment', 'cog_attention', 'beh_digital_literacy'],
    anti: ['riasec_artistic']
  },
  'Frontend-разработчик': {
    primary: ['riasec_artistic', 'riasec_conventional', 'cog_spatial', 'beh_digital_literacy'],
    secondary: ['bigfive_openness', 'via_creativity', 'cog_math_logic', 'beh_empathy'],
    anti: []
  },
  'Блокчейн-инженер': {
    primary: ['riasec_investigative', 'riasec_conventional', 'cog_math_logic', 'cog_system'],
    secondary: ['bigfive_conscientiousness', 'via_judgment', 'cog_algorithm', 'pers_tolerance'],
    anti: []
  },
  'QA-инженер (тестировщик)': {
    primary: ['riasec_conventional', 'riasec_realistic', 'cog_attention', 'cog_critical'],
    secondary: ['bigfive_conscientiousness', 'via_perseverance', 'cog_algorithm', 'beh_writing'],
    anti: ['pers_risk']
  },
  'DevOps-инженер': {
    primary: ['riasec_realistic', 'riasec_conventional', 'cog_system', 'beh_stress_resistance'],
    secondary: ['bigfive_stability', 'via_judgment', 'cog_attention', 'beh_digital_literacy'],
    anti: []
  },
  'Мобильный разработчик': {
    primary: ['riasec_artistic', 'riasec_conventional', 'cog_spatial', 'cog_algorithm'],
    secondary: ['bigfive_conscientiousness', 'via_love_of_learning', 'cog_math_logic', 'beh_adaptability'],
    anti: []
  },

  // Аналитика данных и ИИ
  'Специалист по Data Science': {
    primary: ['riasec_investigative', 'riasec_conventional', 'cog_math_logic', 'cog_system'],
    secondary: ['bigfive_openness', 'via_curiosity', 'cog_fluid', 'beh_digital_literacy'],
    anti: []
  },
  'Промпт-инженер': {
    primary: ['riasec_artistic', 'riasec_investigative', 'cog_verbal', 'cog_creative'],
    secondary: ['bigfive_openness', 'via_creativity', 'cog_languages', 'beh_writing'],
    anti: ['riasec_realistic']
  },
  'Аналитик данных': {
    primary: ['riasec_investigative', 'riasec_conventional', 'cog_math_logic', 'cog_attention'],
    secondary: ['bigfive_conscientiousness', 'via_judgment', 'cog_system', 'beh_financial_literacy'],
    anti: []
  },
  'ML-инженер': {
    primary: ['riasec_investigative', 'riasec_realistic', 'cog_math_logic', 'cog_algorithm'],
    secondary: ['bigfive_openness', 'via_curiosity', 'cog_system', 'beh_digital_literacy'],
    anti: []
  },
  'Инженер данных': {
    primary: ['riasec_conventional', 'riasec_realistic', 'cog_system', 'cog_attention'],
    secondary: ['bigfive_conscientiousness', 'via_perseverance', 'cog_math_logic', 'beh_digital_literacy'],
    anti: []
  },
  'Веб-аналитик': {
    primary: ['riasec_conventional', 'riasec_investigative', 'cog_math_logic', 'beh_digital_literacy'],
    secondary: ['bigfive_conscientiousness', 'via_judgment', 'cog_verbal', 'beh_empathy'],
    anti: []
  },

  // Робототехника и хардвер
  'Инженер-робототехник': {
    primary: ['riasec_realistic', 'riasec_investigative', 'cog_spatial', 'cog_system'],
    secondary: ['bigfive_openness', 'via_creativity', 'cog_math_logic', 'beh_digital_literacy'],
    anti: []
  },
  'Специалист по IoT': {
    primary: ['riasec_realistic', 'riasec_investigative', 'cog_system', 'beh_digital_literacy'],
    secondary: ['bigfive_conscientiousness', 'via_curiosity', 'cog_algorithm', 'beh_adaptability'],
    anti: []
  },
  'Специалист по БПЛА': {
    primary: ['riasec_realistic', 'riasec_conventional', 'cog_spatial', 'beh_stress_resistance'],
    secondary: ['bigfive_stability', 'via_prudence', 'cog_attention', 'beh_digital_literacy'],
    anti: []
  },
  'Схемотехник': {
    primary: ['riasec_realistic', 'riasec_conventional', 'cog_math_logic', 'cog_attention'],
    secondary: ['bigfive_conscientiousness', 'via_perseverance', 'cog_spatial', 'beh_discipline'],
    anti: []
  },
  'Специалист по 3D-печати': {
    primary: ['riasec_realistic', 'riasec_artistic', 'cog_spatial', 'beh_digital_literacy'],
    secondary: ['bigfive_openness', 'via_creativity', 'cog_math_logic', 'beh_time_management'],
    anti: []
  },

  // Инженерия и промышленность
  'Инженер-строитель': {
    primary: ['riasec_realistic', 'riasec_conventional', 'cog_spatial', 'via_perseverance'],
    secondary: ['bigfive_conscientiousness', 'via_prudence', 'cog_math_logic', 'beh_discipline'],
    anti: []
  },
  'Аэрокосмический инженер': {
    primary: ['riasec_realistic', 'riasec_investigative', 'cog_math_logic', 'cog_system'],
    secondary: ['bigfive_conscientiousness', 'via_judgment', 'cog_spatial', 'beh_stress_resistance'],
    anti: []
  },
  'Автомобильный инженер': {
    primary: ['riasec_realistic', 'riasec_investigative', 'cog_spatial', 'cog_system'],
    secondary: ['bigfive_conscientiousness', 'via_perseverance', 'cog_math_logic', 'beh_digital_literacy'],
    anti: []
  },
  'Проектировщик умных городов': {
    primary: ['riasec_artistic', 'riasec_realistic', 'cog_spatial', 'cog_system'],
    secondary: ['bigfive_openness', 'via_perspective', 'cog_critical', 'beh_public_speaking'],
    anti: []
  },
  'Промышленный дизайнер': {
    primary: ['riasec_artistic', 'riasec_realistic', 'cog_spatial', 'cog_creative'],
    secondary: ['bigfive_openness', 'via_creativity', 'cog_verbal', 'beh_empathy'],
    anti: []
  },

  // Энергетика и эко-технологии
  'Инженер возобновляемой энергетики': {
    primary: ['riasec_realistic', 'riasec_investigative', 'cog_system', 'mot_meaning'],
    secondary: ['bigfive_openness', 'via_curiosity', 'cog_math_logic', 'beh_adaptability'],
    anti: []
  },
  'Эколог-урбанист': {
    primary: ['riasec_investigative', 'riasec_realistic', 'cog_system', 'mot_help'],
    secondary: ['bigfive_openness', 'via_kindness', 'cog_spatial', 'beh_public_speaking'],
    anti: []
  },
  'Технолог рециклинга': {
    primary: ['riasec_realistic', 'riasec_conventional', 'cog_system', 'via_perseverance'],
    secondary: ['bigfive_conscientiousness', 'via_judgment', 'cog_math_logic', 'beh_discipline'],
    anti: []
  },
  'Углеродный аудитор': {
    primary: ['riasec_conventional', 'riasec_investigative', 'cog_math_logic', 'cog_attention'],
    secondary: ['bigfive_conscientiousness', 'via_judgment', 'cog_system', 'beh_financial_literacy'],
    anti: []
  },
  'Менеджер по энергоэффективности': {
    primary: ['riasec_enterprising', 'riasec_conventional', 'cog_system', 'beh_teamwork'],
    secondary: ['bigfive_conscientiousness', 'via_leadership', 'cog_math_logic', 'beh_writing'],
    anti: []
  },

  // Биотехнологии и биоинженерия
  'Биоинформатик': {
    primary: ['riasec_investigative', 'riasec_conventional', 'cog_math_logic', 'cog_system'],
    secondary: ['bigfive_conscientiousness', 'via_curiosity', 'cog_algorithm', 'beh_digital_literacy'],
    anti: []
  },
  'Биофармаколог': {
    primary: ['riasec_investigative', 'riasec_conventional', 'cog_math_logic', 'via_perseverance'],
    secondary: ['bigfive_conscientiousness', 'via_curiosity', 'cog_attention', 'beh_discipline'],
    anti: []
  },
  'Агрогенетик': {
    primary: ['riasec_investigative', 'riasec_realistic', 'cog_math_logic', 'cog_system'],
    secondary: ['bigfive_openness', 'via_curiosity', 'cog_attention', 'beh_digital_literacy'],
    anti: []
  },
  'Синтетический биолог': {
    primary: ['riasec_investigative', 'riasec_realistic', 'cog_system', 'via_creativity'],
    secondary: ['bigfive_openness', 'via_curiosity', 'cog_math_logic', 'beh_discipline'],
    anti: []
  },
  'Специалист по долголетию': {
    primary: ['riasec_investigative', 'riasec_social', 'cog_system', 'mot_help'],
    secondary: ['bigfive_openness', 'via_kindness', 'cog_verbal', 'beh_empathy'],
    anti: []
  },

  // Медицина и здравоохранение
  'Онлайн-терапевт': {
    primary: ['riasec_social', 'riasec_investigative', 'cog_verbal', 'beh_empathy'],
    secondary: ['bigfive_agreeableness', 'via_kindness', 'via_social_intelligence', 'beh_writing'],
    anti: []
  },
  'Хирург': {
    primary: ['riasec_realistic', 'riasec_social', 'cog_spatial', 'beh_stress_resistance'],
    secondary: ['bigfive_stability', 'via_bravery', 'via_self_regulation', 'beh_discipline'],
    anti: ['temp_excitability']
  },
  'Генетический консультант': {
    primary: ['riasec_investigative', 'riasec_social', 'cog_verbal', 'beh_empathy'],
    secondary: ['bigfive_agreeableness', 'via_kindness', 'via_social_intelligence', 'beh_public_speaking'],
    anti: []
  },
  'Разработчик киберпротезов': {
    primary: ['riasec_realistic', 'riasec_investigative', 'cog_spatial', 'beh_empathy'],
    secondary: ['bigfive_conscientiousness', 'via_kindness', 'cog_system', 'beh_digital_literacy'],
    anti: []
  },
  'Педиатр': {
    primary: ['riasec_social', 'riasec_investigative', 'cog_verbal', 'beh_empathy'],
    secondary: ['bigfive_agreeableness', 'via_kindness', 'via_social_intelligence', 'beh_public_speaking'],
    anti: []
  },
  'Нейрорентгенолог': {
    primary: ['riasec_investigative', 'riasec_conventional', 'cog_spatial', 'cog_attention'],
    secondary: ['bigfive_conscientiousness', 'via_judgment', 'cog_math_logic', 'beh_digital_literacy'],
    anti: []
  },

  // Маркетинг, PR и бренд-менеджмент
  'Digital-маркетолог': {
    primary: ['riasec_enterprising', 'riasec_artistic', 'cog_verbal', 'beh_digital_literacy'],
    secondary: ['bigfive_openness', 'via_creativity', 'cog_math_logic', 'beh_writing'],
    anti: []
  },
  'PR-менеджер': {
    primary: ['riasec_enterprising', 'riasec_social', 'cog_verbal', 'beh_public_speaking'],
    secondary: ['bigfive_extraversion', 'via_social_intelligence', 'via_zest', 'beh_self_presentation'],
    anti: ['riasec_realistic']
  },
  'SMM-стратег': {
    primary: ['riasec_artistic', 'riasec_enterprising', 'cog_verbal', 'beh_writing'],
    secondary: ['bigfive_openness', 'via_creativity', 'via_social_intelligence', 'beh_digital_literacy'],
    anti: []
  },
  'Таргетолог': {
    primary: ['riasec_conventional', 'riasec_investigative', 'cog_math_logic', 'beh_digital_literacy'],
    secondary: ['bigfive_conscientiousness', 'via_judgment', 'cog_attention', 'beh_financial_literacy'],
    anti: []
  },
  'Бренд-менеджер': {
    primary: ['riasec_enterprising', 'riasec_artistic', 'cog_verbal', 'beh_self_presentation'],
    secondary: ['bigfive_openness', 'via_leadership', 'via_creativity', 'beh_teamwork'],
    anti: []
  },
  'Инфлюенс-маркетолог': {
    primary: ['riasec_enterprising', 'riasec_social', 'cog_verbal', 'beh_self_presentation'],
    secondary: ['bigfive_extraversion', 'via_social_intelligence', 'via_zest', 'beh_public_speaking'],
    anti: []
  },

  // Управление и бизнес-консалтинг
  'Предприниматель': {
    primary: ['riasec_enterprising', 'riasec_artistic', 'pers_risk', 'beh_leadership'],
    secondary: ['bigfive_openness', 'via_leadership', 'via_bravery', 'beh_self_presentation'],
    anti: ['mot_security']
  },
  'Product-менеджер': {
    primary: ['riasec_enterprising', 'riasec_investigative', 'cog_system', 'beh_leadership'],
    secondary: ['bigfive_stability', 'via_leadership', 'via_judgment', 'beh_empathy'],
    anti: []
  },
  'Project-менеджер': {
    primary: ['riasec_enterprising', 'riasec_conventional', 'beh_time_management', 'beh_teamwork'],
    secondary: ['bigfive_conscientiousness', 'via_teamwork', 'via_prudence', 'beh_writing'],
    anti: []
  },
  'HR-директор': {
    primary: ['riasec_social', 'riasec_conventional', 'cog_verbal', 'beh_empathy'],
    secondary: ['bigfive_agreeableness', 'via_social_intelligence', 'via_leadership', 'beh_conflict'],
    anti: []
  },
  'Change-менеджер': {
    primary: ['riasec_enterprising', 'riasec_investigative', 'cog_system', 'beh_adaptability'],
    secondary: ['bigfive_openness', 'via_perspective', 'via_leadership', 'beh_public_speaking'],
    anti: []
  },
  'Бизнес-консультант': {
    primary: ['riasec_investigative', 'riasec_enterprising', 'cog_verbal', 'cog_system'],
    secondary: ['bigfive_conscientiousness', 'via_judgment', 'via_social_intelligence', 'beh_public_speaking'],
    anti: []
  },

  // Финансовые технологии и инвестиции
  'Финансовый аналитик': {
    primary: ['riasec_conventional', 'riasec_investigative', 'cog_math_logic', 'cog_attention'],
    secondary: ['bigfive_conscientiousness', 'via_judgment', 'cog_system', 'beh_financial_literacy'],
    anti: []
  },
  'Криптотрейдер': {
    primary: ['riasec_enterprising', 'riasec_investigative', 'pers_risk', 'beh_stress_resistance'],
    secondary: ['bigfive_stability', 'via_self_regulation', 'cog_math_logic', 'beh_financial_literacy'],
    anti: ['temp_excitability']
  },
  'Разработчик финтех-продуктов': {
    primary: ['riasec_investigative', 'riasec_realistic', 'cog_math_logic', 'cog_algorithm'],
    secondary: ['bigfive_conscientiousness', 'via_judgment', 'cog_system', 'beh_digital_literacy'],
    anti: []
  },
  'Риск-менеджер': {
    primary: ['riasec_conventional', 'riasec_investigative', 'cog_math_logic', 'via_prudence'],
    secondary: ['bigfive_conscientiousness', 'via_judgment', 'cog_system', 'beh_financial_literacy'],
    anti: ['pers_risk']
  },
  'Финансовый советник': {
    primary: ['riasec_social', 'riasec_conventional', 'cog_verbal', 'beh_financial_literacy'],
    secondary: ['bigfive_agreeableness', 'via_kindness', 'via_social_intelligence', 'beh_empathy'],
    anti: []
  },

  // Дизайн и креативные индустрии
  'UX/UI-дизайнер': {
    primary: ['riasec_artistic', 'riasec_investigative', 'cog_spatial', 'beh_empathy'],
    secondary: ['bigfive_openness', 'via_creativity', 'cog_system', 'beh_digital_literacy'],
    anti: []
  },
  '3D-моделлер': {
    primary: ['riasec_artistic', 'riasec_realistic', 'cog_spatial', 'via_perseverance'],
    secondary: ['bigfive_conscientiousness', 'via_creativity', 'via_appreciation', 'beh_time_management'],
    anti: []
  },
  'Геймдизайнер': {
    primary: ['riasec_artistic', 'riasec_investigative', 'cog_spatial', 'cog_creative'],
    secondary: ['bigfive_openness', 'via_creativity', 'via_perspective', 'beh_writing'],
    anti: []
  },
  'Графический дизайнер': {
    primary: ['riasec_artistic', 'riasec_conventional', 'cog_spatial', 'via_creativity'],
    secondary: ['bigfive_openness', 'via_appreciation', 'via_humor', 'beh_self_presentation'],
    anti: []
  },
  'VR-дизайнер': {
    primary: ['riasec_artistic', 'riasec_realistic', 'cog_spatial', 'cog_system'],
    secondary: ['bigfive_openness', 'via_creativity', 'cog_math_logic', 'beh_digital_literacy'],
    anti: []
  },
  'Цифровой модельер': {
    primary: ['riasec_artistic', 'riasec_conventional', 'cog_spatial', 'via_creativity'],
    secondary: ['bigfive_openness', 'via_appreciation', 'via_curiosity', 'beh_self_presentation'],
    anti: []
  },

  // Медиа, блогинг и контент-производство
  'Копирайтер': {
    primary: ['riasec_artistic', 'riasec_social', 'cog_verbal', 'beh_writing'],
    secondary: ['bigfive_openness', 'via_creativity', 'via_love_of_learning', 'beh_time_management'],
    anti: ['riasec_realistic']
  },
  'Подкастер': {
    primary: ['riasec_artistic', 'riasec_social', 'cog_verbal', 'beh_public_speaking'],
    secondary: ['bigfive_extraversion', 'via_social_intelligence', 'via_humor', 'beh_self_presentation'],
    anti: []
  },
  'Сценарист игр': {
    primary: ['riasec_artistic', 'riasec_investigative', 'cog_verbal', 'beh_writing'],
    secondary: ['bigfive_openness', 'via_creativity', 'via_curiosity', 'via_love_of_learning'],
    anti: []
  },
  'Видеомонтажер': {
    primary: ['riasec_artistic', 'riasec_realistic', 'cog_spatial', 'cog_attention'],
    secondary: ['bigfive_conscientiousness', 'via_perseverance', 'via_appreciation', 'beh_time_management'],
    anti: []
  },
  'Научный журналист': {
    primary: ['riasec_investigative', 'riasec_social', 'cog_verbal', 'via_curiosity'],
    secondary: ['bigfive_openness', 'via_judgment', 'via_love_of_learning', 'beh_writing'],
    anti: []
  },

  // Образование и EdTech
  'Методолог онлайн-обучения': {
    primary: ['riasec_social', 'riasec_investigative', 'cog_verbal', 'cog_system'],
    secondary: ['bigfive_conscientiousness', 'via_love_of_learning', 'via_social_intelligence', 'beh_writing'],
    anti: []
  },
  'Тьютор': {
    primary: ['riasec_social', 'riasec_investigative', 'cog_verbal', 'beh_empathy'],
    secondary: ['bigfive_agreeableness', 'via_kindness', 'via_social_intelligence', 'beh_public_speaking'],
    anti: []
  },
  'ИТ-преподаватель': {
    primary: ['riasec_social', 'riasec_realistic', 'cog_math_logic', 'beh_public_speaking'],
    secondary: ['bigfive_agreeableness', 'via_love_of_learning', 'via_social_intelligence', 'beh_digital_literacy'],
    anti: []
  },
  'Игропедагог': {
    primary: ['riasec_social', 'riasec_artistic', 'cog_verbal', 'via_humor'],
    secondary: ['bigfive_openness', 'via_creativity', 'via_kindness', 'beh_public_speaking'],
    anti: []
  },
  'Онлайн-лектор': {
    primary: ['riasec_social', 'riasec_artistic', 'cog_verbal', 'beh_public_speaking'],
    secondary: ['bigfive_extraversion', 'via_zest', 'via_social_intelligence', 'beh_self_presentation'],
    anti: []
  },

  // Психология и ментальное здоровье
  'Семейный терапевт': {
    primary: ['riasec_social', 'riasec_investigative', 'cog_verbal', 'beh_empathy'],
    secondary: ['bigfive_agreeableness', 'via_kindness', 'via_social_intelligence', 'beh_stress_resistance'],
    anti: []
  },
  'Коуч': {
    primary: ['riasec_social', 'riasec_artistic', 'cog_verbal', 'beh_empathy'],
    secondary: ['bigfive_agreeableness', 'via_kindness', 'via_social_intelligence', 'beh_public_speaking'],
    anti: []
  },
  'Реабилитолог': {
    primary: ['riasec_realistic', 'riasec_social', 'cog_spatial', 'beh_empathy'],
    secondary: ['bigfive_agreeableness', 'via_kindness', 'via_self_regulation', 'beh_discipline'],
    anti: []
  },
  'Арт-терапевт': {
    primary: ['riasec_social', 'riasec_artistic', 'cog_verbal', 'beh_empathy'],
    secondary: ['bigfive_agreeableness', 'via_creativity', 'via_appreciation', 'via_kindness'],
    anti: []
  },
  'Карьерный консультант': {
    primary: ['riasec_social', 'riasec_conventional', 'cog_verbal', 'beh_empathy'],
    secondary: ['bigfive_agreeableness', 'via_social_intelligence', 'via_judgment', 'beh_public_speaking'],
    anti: []
  },

  // Юриспруденция, право и безопасность
  'IT-юрист': {
    primary: ['riasec_enterprising', 'riasec_investigative', 'cog_verbal', 'cog_critical'],
    secondary: ['bigfive_conscientiousness', 'via_judgment', 'via_honesty', 'beh_writing'],
    anti: []
  },
  'DPO': {
    primary: ['riasec_conventional', 'riasec_enterprising', 'cog_math_logic', 'cog_critical'],
    secondary: ['bigfive_conscientiousness', 'via_prudence', 'via_honesty', 'beh_digital_literacy'],
    anti: []
  },
  'Международный адвокат': {
    primary: ['riasec_enterprising', 'riasec_investigative', 'cog_verbal', 'beh_public_speaking'],
    secondary: ['bigfive_extraversion', 'via_bravery', 'via_social_intelligence', 'beh_writing'],
    anti: []
  },
  'Комплаенс-офицер': {
    primary: ['riasec_conventional', 'riasec_investigative', 'cog_critical', 'via_prudence'],
    secondary: ['bigfive_conscientiousness', 'via_judgment', 'via_honesty', 'beh_writing'],
    anti: ['pers_risk']
  },
  'Медиатор': {
    primary: ['riasec_social', 'riasec_enterprising', 'cog_verbal', 'beh_conflict'],
    secondary: ['bigfive_agreeableness', 'via_social_intelligence', 'via_fairness', 'beh_empathy'],
    anti: []
  },

  // Фундаментальная наука и исследования
  'Физик-ядерщик': {
    primary: ['riasec_investigative', 'riasec_realistic', 'cog_math_logic', 'via_perseverance'],
    secondary: ['bigfive_conscientiousness', 'via_curiosity', 'via_prudence', 'cog_system'],
    anti: []
  },
  'Астрофизик': {
    primary: ['riasec_investigative', 'riasec_realistic', 'cog_math_logic', 'cog_spatial'],
    secondary: ['bigfive_openness', 'via_curiosity', 'via_perspective', 'cog_system'],
    anti: []
  },
  'Химик-синтетик': {
    primary: ['riasec_investigative', 'riasec_realistic', 'cog_math_logic', 'via_perseverance'],
    secondary: ['bigfive_conscientiousness', 'via_curiosity', 'via_prudence', 'cog_spatial'],
    anti: []
  },
  'Нейробиолог': {
    primary: ['riasec_investigative', 'riasec_realistic', 'cog_math_logic', 'cog_system'],
    secondary: ['bigfive_conscientiousness', 'via_curiosity', 'via_judgment', 'beh_digital_literacy'],
    anti: []
  },
  'Социолог': {
    primary: ['riasec_investigative', 'riasec_artistic', 'cog_verbal', 'via_curiosity'],
    secondary: ['bigfive_openness', 'via_judgment', 'cog_math_logic', 'beh_writing'],
    anti: []
  },

  // Агротехнологии и сити-фермерство
  'Сити-фермер': {
    primary: ['riasec_realistic', 'riasec_investigative', 'cog_spatial', 'beh_digital_literacy'],
    secondary: ['bigfive_openness', 'via_curiosity', 'via_perseverance', 'beh_time_management'],
    anti: []
  },
  'Агротехнолог': {
    primary: ['riasec_realistic', 'riasec_investigative', 'cog_system', 'via_perseverance'],
    secondary: ['bigfive_conscientiousness', 'via_curiosity', 'cog_math_logic', 'beh_digital_literacy'],
    anti: []
  },
  'Разработчик агро-датчиков IoT': {
    primary: ['riasec_realistic', 'riasec_investigative', 'cog_system', 'beh_digital_literacy'],
    secondary: ['bigfive_conscientiousness', 'via_curiosity', 'cog_math_logic', 'beh_adaptability'],
    anti: []
  },
  'Пищевой технолог (растительное мясо)': {
    primary: ['riasec_investigative', 'riasec_realistic', 'cog_math_logic', 'via_perseverance'],
    secondary: ['bigfive_openness', 'via_curiosity', 'via_prudence', 'beh_discipline'],
    anti: []
  },

  // Транспорт, логистика и беспилотные системы
  'Оператор БПЛА': {
    primary: ['riasec_realistic', 'riasec_conventional', 'cog_spatial', 'beh_stress_resistance'],
    secondary: ['bigfive_stability', 'via_prudence', 'via_self_regulation', 'beh_discipline'],
    anti: ['temp_excitability']
  },
  'Логист': {
    primary: ['riasec_conventional', 'riasec_enterprising', 'cog_system', 'beh_time_management'],
    secondary: ['bigfive_conscientiousness', 'via_teamwork', 'via_prudence', 'beh_writing'],
    anti: []
  },
  'Разработчик автопилотов': {
    primary: ['riasec_realistic', 'riasec_investigative', 'cog_math_logic', 'cog_system'],
    secondary: ['bigfive_conscientiousness', 'via_judgment', 'cog_algorithm', 'beh_digital_literacy'],
    anti: []
  },
  'Диспетчер портов': {
    primary: ['riasec_conventional', 'riasec_realistic', 'cog_attention', 'beh_stress_resistance'],
    secondary: ['bigfive_stability', 'via_prudence', 'via_self_regulation', 'beh_time_management'],
    anti: ['temp_excitability']
  },

  // Спорт, фитнес и велнес
  'Тренер киберспорта': {
    primary: ['riasec_social', 'riasec_enterprising', 'cog_math_logic', 'beh_teamwork'],
    secondary: ['bigfive_stability', 'via_leadership', 'via_social_intelligence', 'beh_conflict'],
    anti: []
  },
  'Нутрициолог': {
    primary: ['riasec_investigative', 'riasec_social', 'cog_verbal', 'beh_empathy'],
    secondary: ['bigfive_agreeableness', 'via_kindness', 'via_social_intelligence', 'beh_public_speaking'],
    anti: []
  },
  'Фитнес-коуч': {
    primary: ['riasec_realistic', 'riasec_social', 'cog_spatial', 'beh_self_presentation'],
    secondary: ['bigfive_extraversion', 'via_zest', 'via_social_intelligence', 'beh_public_speaking'],
    anti: []
  },
  'Спортивный event-менеджер': {
    primary: ['riasec_enterprising', 'riasec_social', 'beh_time_management', 'beh_teamwork'],
    secondary: ['bigfive_extraversion', 'via_zest', 'via_leadership', 'beh_self_presentation'],
    anti: ['mot_security']
  },

  // Туризм и премиальное гостеприимство
  'Глэмпинг-управляющий': {
    primary: ['riasec_enterprising', 'riasec_social', 'beh_time_management', 'beh_empathy'],
    secondary: ['bigfive_extraversion', 'via_kindness', 'via_social_intelligence', 'beh_conflict'],
    anti: []
  },
  'Эко-гид': {
    primary: ['riasec_social', 'riasec_realistic', 'cog_verbal', 'beh_public_speaking'],
    secondary: ['bigfive_agreeableness', 'via_zest', 'via_appreciation', 'beh_self_presentation'],
    anti: []
  },
  'MICE-организатор': {
    primary: ['riasec_enterprising', 'riasec_social', 'beh_time_management', 'beh_teamwork'],
    secondary: ['bigfive_extraversion', 'via_zest', 'via_leadership', 'beh_public_speaking'],
    anti: ['mot_security']
  }
};
