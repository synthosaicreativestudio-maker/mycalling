export interface ProfessionMapping {
  primary: string[];
  secondary: string[];
  anti: string[];
}

export const characteristicsMapping: Record<string, ProfessionMapping> = {
  // IT и разработка ПО
  'Backend-разработчик': {
    primary: ['riasec_conventional', 'riasec_realistic', 'cog_math_logic', 'exec_inhibition'],
    secondary: ['bigfive_conscientiousness', 'tolerance_ambiguity', 'learn_deep', 'cog_ai_literacy'],
    anti: ['riasec_artistic']
  },
  'Frontend-разработчик': {
    primary: ['riasec_artistic', 'riasec_conventional', 'cog_spatial', 'cabin_visual_art'],
    secondary: ['bigfive_openness', 'cog_creative', 'cog_math_logic', 'empathetic_listening'],
    anti: []
  },
  'Блокчейн-инженер': {
    primary: ['riasec_investigative', 'riasec_conventional', 'cog_math_logic', 'cog_system'],
    secondary: ['bigfive_conscientiousness', 'tolerance_ambiguity', 'learn_deep', 'exec_flexibility'],
    anti: []
  },
  'QA-инженер (тестировщик)': {
    primary: ['riasec_conventional', 'riasec_realistic', 'exec_inhibition', 'cog_critical'],
    secondary: ['bigfive_conscientiousness', 'grit_perseverance', 'metacog_monitoring', 'feedback_skill'],
    anti: ['pers_risk']
  },
  'DevOps-инженер': {
    primary: ['riasec_realistic', 'riasec_conventional', 'cog_system', 'bigfive_stability'],
    secondary: ['exec_flexibility', 'belbin_doer', 'cog_ai_literacy', 'resilience_failure'],
    anti: []
  },
  'Мобильный разработчик': {
    primary: ['riasec_artistic', 'riasec_conventional', 'cog_spatial', 'exec_flexibility'],
    secondary: ['bigfive_conscientiousness', 'curiosity_epistemic', 'cog_math_logic', 'cyber_socialization'],
    anti: []
  },

  // Аналитика данных и ИИ
  'Специалист по Data Science': {
    primary: ['riasec_investigative', 'riasec_conventional', 'cog_math_logic', 'cog_system'],
    secondary: ['bigfive_openness', 'curiosity_epistemic', 'learn_deep', 'cog_ai_literacy'],
    anti: []
  },
  'Промпт-инженер': {
    primary: ['riasec_artistic', 'riasec_investigative', 'cog_verbal', 'cog_creative'],
    secondary: ['bigfive_openness', 'cog_ai_literacy', 'beh_ai_collaboration', 'content_creation_style'],
    anti: ['riasec_realistic']
  },
  'Аналитик данных': {
    primary: ['riasec_investigative', 'riasec_conventional', 'cog_math_logic', 'exec_inhibition'],
    secondary: ['bigfive_conscientiousness', 'metacog_planning', 'cog_system', 'value_intrinsic'],
    anti: []
  },
  'ML-инженер': {
    primary: ['riasec_investigative', 'riasec_realistic', 'cog_math_logic', 'cog_system'],
    secondary: ['bigfive_openness', 'curiosity_epistemic', 'learn_deep', 'cog_ai_literacy'],
    anti: []
  },
  'Инженер данных': {
    primary: ['riasec_conventional', 'riasec_realistic', 'cog_system', 'exec_inhibition'],
    secondary: ['bigfive_conscientiousness', 'grit_perseverance', 'cog_math_logic', 'cog_ai_literacy'],
    anti: []
  },
  'Веб-аналитик': {
    primary: ['riasec_conventional', 'riasec_investigative', 'cog_math_logic', 'cog_ai_literacy'],
    secondary: ['bigfive_conscientiousness', 'metacog_monitoring', 'cog_verbal', 'empathetic_listening'],
    anti: []
  },

  // Робототехника и хардвер
  'Инженер-робототехник': {
    primary: ['riasec_realistic', 'riasec_investigative', 'cog_spatial', 'cog_system'],
    secondary: ['bigfive_openness', 'curiosity_epistemic', 'cog_math_logic', 'belbin_creator'],
    anti: []
  },
  'Специалист по IoT': {
    primary: ['riasec_realistic', 'riasec_investigative', 'cog_system', 'cog_ai_literacy'],
    secondary: ['bigfive_conscientiousness', 'curiosity_epistemic', 'exec_flexibility', 'cyber_socialization'],
    anti: []
  },
  'Специалист по БПЛА': {
    primary: ['riasec_realistic', 'riasec_conventional', 'cog_spatial', 'bigfive_stability'],
    secondary: ['self_control', 'exec_inhibition', 'tolerance_ambiguity', 'resilience_failure'],
    anti: []
  },
  'Схемотехник': {
    primary: ['riasec_realistic', 'riasec_conventional', 'cog_math_logic', 'exec_inhibition'],
    secondary: ['bigfive_conscientiousness', 'grit_perseverance', 'cog_spatial', 'routine_discipline'],
    anti: []
  },
  'Специалист по 3D-печати': {
    primary: ['riasec_realistic', 'riasec_artistic', 'cog_spatial', 'cabin_visual_art'],
    secondary: ['bigfive_openness', 'cog_creative', 'cog_math_logic', 'beh_time_management'],
    anti: []
  },

  // Инженерия и промышленность
  'Инженер-строитель': {
    primary: ['riasec_realistic', 'riasec_conventional', 'cog_spatial', 'grit_perseverance'],
    secondary: ['bigfive_conscientiousness', 'self_control', 'cog_math_logic', 'routine_discipline'],
    anti: []
  },
  'Аэрокосмический инженер': {
    primary: ['riasec_realistic', 'riasec_investigative', 'cog_math_logic', 'cog_system'],
    secondary: ['bigfive_conscientiousness', 'via_curiosity_scientific', 'cog_spatial', 'bigfive_stability'],
    anti: []
  },
  'Автомобильный инженер': {
    primary: ['riasec_realistic', 'riasec_investigative', 'cog_spatial', 'cog_system'],
    secondary: ['bigfive_conscientiousness', 'grit_perseverance', 'cog_math_logic', 'digital_interests'],
    anti: []
  },
  'Проектировщик умных городов': {
    primary: ['riasec_artistic', 'riasec_realistic', 'cog_spatial', 'cog_system'],
    secondary: ['bigfive_openness', 'belbin_creator', 'cog_critical', 'beh_public_speaking'],
    anti: []
  },
  'Промышленный дизайнер': {
    primary: ['riasec_artistic', 'riasec_realistic', 'cog_spatial', 'cog_creative'],
    secondary: ['bigfive_openness', 'cabin_visual_art', 'cog_verbal', 'empathetic_listening'],
    anti: []
  },

  // Энергетика и эко-технологии
  'Инженер возобновляемой энергетики': {
    primary: ['riasec_realistic', 'riasec_investigative', 'cog_system', 'mot_climate_responsibility'],
    secondary: ['bigfive_openness', 'curiosity_epistemic', 'cog_math_logic', 'value_intrinsic'],
    anti: []
  },
  'Эколог-урбанист': {
    primary: ['riasec_investigative', 'riasec_realistic', 'cog_system', 'mot_climate_responsibility'],
    secondary: ['bigfive_openness', 'value_intrinsic', 'cog_spatial', 'beh_public_speaking'],
    anti: []
  },
  'Технолог рециклинга': {
    primary: ['riasec_realistic', 'riasec_conventional', 'cog_system', 'grit_perseverance'],
    secondary: ['bigfive_conscientiousness', 'self_control', 'cog_math_logic', 'routine_discipline'],
    anti: []
  },
  'Углеродный аудитор': {
    primary: ['riasec_conventional', 'riasec_investigative', 'cog_math_logic', 'exec_inhibition'],
    secondary: ['bigfive_conscientiousness', 'metacog_monitoring', 'cog_system', 'mot_climate_responsibility'],
    anti: []
  },
  'Менеджер по энергоэффективности': {
    primary: ['riasec_enterprising', 'riasec_conventional', 'cog_system', 'belbin_doer'],
    secondary: ['bigfive_conscientiousness', 'belbin_leader', 'cog_math_logic', 'feedback_skill'],
    anti: []
  },

  // Биотехнологии и биоинженерия
  'Биоинформатик': {
    primary: ['riasec_investigative', 'riasec_conventional', 'cog_math_logic', 'cog_system'],
    secondary: ['bigfive_conscientiousness', 'curiosity_epistemic', 'via_curiosity_scientific', 'cog_ai_literacy'],
    anti: []
  },
  'Биофармаколог': {
    primary: ['riasec_investigative', 'riasec_conventional', 'cog_math_logic', 'grit_perseverance'],
    secondary: ['bigfive_conscientiousness', 'curiosity_epistemic', 'via_curiosity_scientific', 'routine_discipline'],
    anti: []
  },
  'Агрогенетик': {
    primary: ['riasec_investigative', 'riasec_realistic', 'cog_math_logic', 'cog_system'],
    secondary: ['bigfive_openness', 'curiosity_epistemic', 'via_curiosity_scientific', 'cog_ai_literacy'],
    anti: []
  },
  'Синтетический биолог': {
    primary: ['riasec_investigative', 'riasec_realistic', 'cog_system', 'cog_creative'],
    secondary: ['bigfive_openness', 'via_curiosity_scientific', 'cog_math_logic', 'routine_discipline'],
    anti: []
  },
  'Специалист по долголетию': {
    primary: ['riasec_investigative', 'riasec_social', 'cog_system', 'empathetic_listening'],
    secondary: ['bigfive_openness', 'value_intrinsic', 'cog_verbal', 'teique_self_awareness'],
    anti: []
  },

  // Медицина и здравоохранение
  'Онлайн-терапевт': {
    primary: ['riasec_social', 'riasec_investigative', 'cog_verbal', 'empathetic_listening'],
    secondary: ['bigfive_agreeableness', 'teique_self_awareness', 'teique_social_skills', 'feedback_skill'],
    anti: []
  },
  'Хирург': {
    primary: ['riasec_realistic', 'riasec_social', 'cog_spatial', 'bigfive_stability'],
    secondary: ['self_control', 'exec_inhibition', 'grit_perseverance', 'routine_discipline'],
    anti: ['emotional_reactivity']
  },
  'Генетический консультант': {
    primary: ['riasec_investigative', 'riasec_social', 'cog_verbal', 'empathetic_listening'],
    secondary: ['bigfive_agreeableness', 'teique_social_skills', 'teique_self_awareness', 'beh_public_speaking'],
    anti: []
  },
  'Разработчик киберпротезов': {
    primary: ['riasec_realistic', 'riasec_investigative', 'cog_spatial', 'empathetic_listening'],
    secondary: ['bigfive_conscientiousness', 'value_intrinsic', 'cog_system', 'digital_interests'],
    anti: []
  },
  'Педиатр': {
    primary: ['riasec_social', 'riasec_investigative', 'cog_verbal', 'empathetic_listening'],
    secondary: ['bigfive_agreeableness', 'teique_social_skills', 'teique_self_awareness', 'beh_public_speaking'],
    anti: []
  },
  'Нейрорентгенолог': {
    primary: ['riasec_investigative', 'riasec_conventional', 'cog_spatial', 'exec_inhibition'],
    secondary: ['bigfive_conscientiousness', 'metacog_monitoring', 'cog_math_logic', 'cog_ai_literacy'],
    anti: []
  },

  // Маркетинг, PR и бренд-менеджмент
  'Digital-маркетолог': {
    primary: ['riasec_enterprising', 'riasec_artistic', 'cog_verbal', 'cog_ai_literacy'],
    secondary: ['bigfive_openness', 'cog_creative', 'cog_math_logic', 'content_creation_style'],
    anti: []
  },
  'PR-менеджер': {
    primary: ['riasec_enterprising', 'riasec_social', 'cog_verbal', 'beh_public_speaking'],
    secondary: ['bigfive_extraversion', 'teique_social_skills', 'cabin_performing_art', 'beh_self_presentation'],
    anti: ['riasec_realistic']
  },
  'SMM-стратег': {
    primary: ['riasec_artistic', 'riasec_enterprising', 'cog_verbal', 'content_creation_style'],
    secondary: ['bigfive_openness', 'cog_creative', 'teique_social_skills', 'cog_ai_literacy'],
    anti: []
  },
  'Таргетолог': {
    primary: ['riasec_conventional', 'riasec_investigative', 'cog_math_logic', 'cog_ai_literacy'],
    secondary: ['bigfive_conscientiousness', 'metacog_monitoring', 'exec_inhibition', 'value_extrinsic'],
    anti: []
  },
  'Бренд-менеджер': {
    primary: ['riasec_enterprising', 'riasec_artistic', 'cog_verbal', 'beh_self_presentation'],
    secondary: ['bigfive_openness', 'belbin_leader', 'cog_creative', 'belbin_peacemaker'],
    anti: []
  },
  'Инфлюенс-маркетолог': {
    primary: ['riasec_enterprising', 'riasec_social', 'cog_verbal', 'beh_self_presentation'],
    secondary: ['bigfive_extraversion', 'teique_social_skills', 'cabin_performing_art', 'beh_public_speaking'],
    anti: []
  },

  // Управление и бизнес-консалтинг
  'Предприниматель': {
    primary: ['riasec_enterprising', 'riasec_artistic', 'pers_risk', 'belbin_leader'],
    secondary: ['bigfive_openness', 'proactivity', 'value_intrinsic', 'beh_self_presentation'],
    anti: ['marcia_foreclosure']
  },
  'Product-менеджер': {
    primary: ['riasec_enterprising', 'riasec_investigative', 'cog_system', 'belbin_leader'],
    secondary: ['bigfive_stability', 'proactivity', 'metacog_planning', 'empathetic_listening'],
    anti: []
  },
  'Project-менеджер': {
    primary: ['riasec_enterprising', 'riasec_conventional', 'beh_time_management', 'belbin_doer'],
    secondary: ['bigfive_conscientiousness', 'belbin_peacemaker', 'self_control', 'feedback_skill'],
    anti: []
  },
  'HR-директор': {
    primary: ['riasec_social', 'riasec_conventional', 'cog_verbal', 'empathetic_listening'],
    secondary: ['bigfive_agreeableness', 'teique_social_skills', 'belbin_leader', 'conflict_resolution'],
    anti: []
  },
  'Change-менеджер': {
    primary: ['riasec_enterprising', 'riasec_investigative', 'cog_system', 'exec_flexibility'],
    secondary: ['bigfive_openness', 'belbin_leader', 'proactivity', 'beh_public_speaking'],
    anti: []
  },
  'Бизнес-консультант': {
    primary: ['riasec_investigative', 'riasec_enterprising', 'cog_verbal', 'cog_system'],
    secondary: ['bigfive_conscientiousness', 'metacog_planning', 'teique_social_skills', 'beh_public_speaking'],
    anti: []
  },

  // Финансовые технологии и инвестиции
  'Финансовый аналитик': {
    primary: ['riasec_conventional', 'riasec_investigative', 'cog_math_logic', 'exec_inhibition'],
    secondary: ['bigfive_conscientiousness', 'metacog_monitoring', 'cog_system', 'value_extrinsic'],
    anti: []
  },
  'Криптотрейдер': {
    primary: ['riasec_enterprising', 'riasec_investigative', 'pers_risk', 'bigfive_stability'],
    secondary: ['self_control', 'teique_self_regulation', 'cog_math_logic', 'value_extrinsic'],
    anti: ['emotional_reactivity']
  },
  'Разработчик финтех-продуктов': {
    primary: ['riasec_investigative', 'riasec_realistic', 'cog_math_logic', 'cog_system'],
    secondary: ['bigfive_conscientiousness', 'exec_inhibition', 'tolerance_ambiguity', 'cog_ai_literacy'],
    anti: []
  },
  'Риск-менеджер': {
    primary: ['riasec_conventional', 'riasec_investigative', 'cog_math_logic', 'self_control'],
    secondary: ['bigfive_conscientiousness', 'metacog_monitoring', 'cog_system', 'value_intrinsic'],
    anti: ['pers_risk']
  },
  'Финансовый советник': {
    primary: ['riasec_social', 'riasec_conventional', 'cog_verbal', 'empathetic_listening'],
    secondary: ['bigfive_agreeableness', 'teique_social_skills', 'teique_self_awareness', 'feedback_skill'],
    anti: []
  },

  // Дизайн и креативные индустрии
  'UX/UI-дизайнер': {
    primary: ['riasec_artistic', 'riasec_investigative', 'cog_spatial', 'empathetic_listening'],
    secondary: ['bigfive_openness', 'cog_creative', 'cog_system', 'cog_ai_literacy'],
    anti: []
  },
  '3D-моделлер': {
    primary: ['riasec_artistic', 'riasec_realistic', 'cog_spatial', 'cabin_visual_art'],
    secondary: ['bigfive_conscientiousness', 'cog_creative', 'grit_perseverance', 'beh_time_management'],
    anti: []
  },
  'Геймдизайнер': {
    primary: ['riasec_artistic', 'riasec_investigative', 'cog_spatial', 'cog_creative'],
    secondary: ['bigfive_openness', 'belbin_creator', 'digital_interests', 'content_creation_style'],
    anti: []
  },
  'Графический дизайнер': {
    primary: ['riasec_artistic', 'riasec_conventional', 'cog_spatial', 'cabin_visual_art'],
    secondary: ['bigfive_openness', 'cog_creative', 'tolerance_ambiguity', 'beh_self_presentation'],
    anti: []
  },
  'VR-дизайнер': {
    primary: ['riasec_artistic', 'riasec_realistic', 'cog_spatial', 'cog_system'],
    secondary: ['bigfive_openness', 'cog_creative', 'cog_math_logic', 'cog_ai_literacy'],
    anti: []
  },
  'Цифровой модельер': {
    primary: ['riasec_artistic', 'riasec_conventional', 'cog_spatial', 'cabin_visual_art'],
    secondary: ['bigfive_openness', 'cog_creative', 'curiosity_epistemic', 'beh_self_presentation'],
    anti: []
  },

  // Медиа, блогинг и контент-производство
  'Копирайтер': {
    primary: ['riasec_artistic', 'riasec_social', 'cog_verbal', 'content_creation_style'],
    secondary: ['bigfive_openness', 'cog_creative', 'learn_deep', 'beh_time_management'],
    anti: ['riasec_realistic']
  },
  'Подкастер': {
    primary: ['riasec_artistic', 'riasec_social', 'cog_verbal', 'beh_public_speaking'],
    secondary: ['bigfive_extraversion', 'teique_social_skills', 'cabin_performing_art', 'beh_self_presentation'],
    anti: []
  },
  'Сценарист игр': {
    primary: ['riasec_artistic', 'riasec_investigative', 'cog_verbal', 'content_creation_style'],
    secondary: ['bigfive_openness', 'cog_creative', 'curiosity_epistemic', 'learn_deep'],
    anti: []
  },
  'Видеомонтажер': {
    primary: ['riasec_artistic', 'riasec_realistic', 'cog_spatial', 'exec_inhibition'],
    secondary: ['bigfive_conscientiousness', 'grit_perseverance', 'cabin_visual_art', 'beh_time_management'],
    anti: []
  },
  'Научный журналист': {
    primary: ['riasec_investigative', 'riasec_social', 'cog_verbal', 'curiosity_epistemic'],
    secondary: ['bigfive_openness', 'cog_critical', 'learn_deep', 'content_creation_style'],
    anti: []
  },

  // Образование и EdTech
  'Методолог онлайн-обучения': {
    primary: ['riasec_social', 'riasec_investigative', 'cog_verbal', 'cog_system'],
    secondary: ['bigfive_conscientiousness', 'learn_deep', 'teique_social_skills', 'metacog_planning'],
    anti: []
  },
  'Тьютор': {
    primary: ['riasec_social', 'riasec_investigative', 'cog_verbal', 'empathetic_listening'],
    secondary: ['bigfive_agreeableness', 'teique_social_skills', 'teique_self_awareness', 'beh_public_speaking'],
    anti: []
  },
  'ИТ-преподаватель': {
    primary: ['riasec_social', 'riasec_realistic', 'cog_math_logic', 'beh_public_speaking'],
    secondary: ['bigfive_agreeableness', 'learn_deep', 'teique_social_skills', 'cog_ai_literacy'],
    anti: []
  },
  'Игропедагог': {
    primary: ['riasec_social', 'riasec_artistic', 'cog_verbal', 'teique_social_skills'],
    secondary: ['bigfive_openness', 'cog_creative', 'belbin_peacemaker', 'beh_public_speaking'],
    anti: []
  },
  'Онлайн-лектор': {
    primary: ['riasec_social', 'riasec_artistic', 'cog_verbal', 'beh_public_speaking'],
    secondary: ['bigfive_extraversion', 'teique_social_skills', 'cabin_performing_art', 'beh_self_presentation'],
    anti: []
  },

  // Психология и ментальное здоровье
  'Семейный терапевт': {
    primary: ['riasec_social', 'riasec_investigative', 'cog_verbal', 'empathetic_listening'],
    secondary: ['bigfive_agreeableness', 'teique_self_awareness', 'teique_social_skills', 'bigfive_stability'],
    anti: []
  },
  'Коуч': {
    primary: ['riasec_social', 'riasec_artistic', 'cog_verbal', 'empathetic_listening'],
    secondary: ['bigfive_agreeableness', 'teique_self_awareness', 'teique_social_skills', 'beh_public_speaking'],
    anti: []
  },
  'Реабилитолог': {
    primary: ['riasec_realistic', 'riasec_social', 'cog_spatial', 'empathetic_listening'],
    secondary: ['bigfive_agreeableness', 'self_control', 'teique_self_regulation', 'routine_discipline'],
    anti: []
  },
  'Арт-терапевт': {
    primary: ['riasec_social', 'riasec_artistic', 'cog_verbal', 'empathetic_listening'],
    secondary: ['bigfive_agreeableness', 'cog_creative', 'cabin_visual_art', 'teique_self_awareness'],
    anti: []
  },
  'Карьерный консультант': {
    primary: ['riasec_social', 'riasec_conventional', 'cog_verbal', 'empathetic_listening'],
    secondary: ['bigfive_agreeableness', 'teique_social_skills', 'cog_critical', 'beh_public_speaking'],
    anti: []
  },

  // Юриспруденция, право и безопасность
  'IT-юрист': {
    primary: ['riasec_enterprising', 'riasec_investigative', 'cog_verbal', 'cog_critical'],
    secondary: ['bigfive_conscientiousness', 'metacog_planning', 'via_justice_cluster', 'feedback_skill'],
    anti: []
  },
  'DPO': {
    primary: ['riasec_conventional', 'riasec_enterprising', 'cog_math_logic', 'cog_critical'],
    secondary: ['bigfive_conscientiousness', 'self_control', 'via_justice_cluster', 'cog_ai_literacy'],
    anti: []
  },
  'Международный адвокат': {
    primary: ['riasec_enterprising', 'riasec_investigative', 'cog_verbal', 'beh_public_speaking'],
    secondary: ['bigfive_extraversion', 'teique_social_skills', 'belbin_leader', 'feedback_skill'],
    anti: []
  },
  'Комплаенс-офицер': {
    primary: ['riasec_conventional', 'riasec_investigative', 'cog_critical', 'self_control'],
    secondary: ['bigfive_conscientiousness', 'metacog_monitoring', 'via_justice_cluster', 'feedback_skill'],
    anti: ['pers_risk']
  },
  'Медиатор': {
    primary: ['riasec_social', 'riasec_enterprising', 'cog_verbal', 'conflict_resolution'],
    secondary: ['bigfive_agreeableness', 'teique_social_skills', 'belbin_peacemaker', 'empathetic_listening'],
    anti: []
  },

  // Фундаментальная наука и исследования
  'Физик-ядерщик': {
    primary: ['riasec_investigative', 'riasec_realistic', 'cog_math_logic', 'grit_perseverance'],
    secondary: ['bigfive_conscientiousness', 'curiosity_epistemic', 'via_curiosity_scientific', 'cog_system'],
    anti: []
  },
  'Астрофизик': {
    primary: ['riasec_investigative', 'riasec_realistic', 'cog_math_logic', 'cog_spatial'],
    secondary: ['bigfive_openness', 'curiosity_epistemic', 'via_curiosity_scientific', 'cog_system'],
    anti: []
  },
  'Химик-синтетик': {
    primary: ['riasec_investigative', 'riasec_realistic', 'cog_math_logic', 'grit_perseverance'],
    secondary: ['bigfive_conscientiousness', 'curiosity_epistemic', 'via_curiosity_scientific', 'cog_spatial'],
    anti: []
  },
  'Нейробиолог': {
    primary: ['riasec_investigative', 'riasec_realistic', 'cog_math_logic', 'cog_system'],
    secondary: ['bigfive_conscientiousness', 'curiosity_epistemic', 'via_curiosity_scientific', 'cog_ai_literacy'],
    anti: []
  },
  'Социолог': {
    primary: ['riasec_investigative', 'riasec_artistic', 'cog_verbal', 'curiosity_epistemic'],
    secondary: ['bigfive_openness', 'cog_critical', 'learn_deep', 'feedback_skill'],
    anti: []
  },

  // Агротехнологии и сити-фермерство
  'Сити-фермер': {
    primary: ['riasec_realistic', 'riasec_investigative', 'cog_spatial', 'cog_ai_literacy'],
    secondary: ['bigfive_openness', 'curiosity_epistemic', 'grit_perseverance', 'beh_time_management'],
    anti: []
  },
  'Агротехнолог': {
    primary: ['riasec_realistic', 'riasec_investigative', 'cog_system', 'grit_perseverance'],
    secondary: ['bigfive_conscientiousness', 'curiosity_epistemic', 'cog_math_logic', 'cog_ai_literacy'],
    anti: []
  },
  'Разработчик агро-датчиков IoT': {
    primary: ['riasec_realistic', 'riasec_investigative', 'cog_system', 'cog_ai_literacy'],
    secondary: ['bigfive_conscientiousness', 'curiosity_epistemic', 'cog_math_logic', 'exec_flexibility'],
    anti: []
  },
  'Пищевой технолог (растительное мясо)': {
    primary: ['riasec_investigative', 'riasec_realistic', 'cog_math_logic', 'grit_perseverance'],
    secondary: ['bigfive_openness', 'curiosity_epistemic', 'self_control', 'routine_discipline'],
    anti: []
  },

  // Транспорт, логистика и беспилотные системы
  'Оператор БПЛА': {
    primary: ['riasec_realistic', 'riasec_conventional', 'cog_spatial', 'bigfive_stability'],
    secondary: ['self_control', 'exec_inhibition', 'teique_self_regulation', 'routine_discipline'],
    anti: ['emotional_reactivity']
  },
  'Логист': {
    primary: ['riasec_conventional', 'riasec_enterprising', 'cog_system', 'beh_time_management'],
    secondary: ['bigfive_conscientiousness', 'belbin_peacemaker', 'self_control', 'feedback_skill'],
    anti: []
  },
  'Разработчик автопилотов': {
    primary: ['riasec_realistic', 'riasec_investigative', 'cog_math_logic', 'cog_system'],
    secondary: ['bigfive_conscientiousness', 'cog_critical', 'exec_flexibility', 'cog_ai_literacy'],
    anti: []
  },
  'Диспетчер портов': {
    primary: ['riasec_conventional', 'riasec_realistic', 'exec_inhibition', 'bigfive_stability'],
    secondary: ['self_control', 'teique_self_regulation', 'beh_time_management', 'routine_discipline'],
    anti: ['emotional_reactivity']
  },

  // Спорт, фитнес и велнес
  'Тренер киберспорта': {
    primary: ['riasec_social', 'riasec_enterprising', 'cog_math_logic', 'belbin_peacemaker'],
    secondary: ['bigfive_stability', 'belbin_leader', 'teique_social_skills', 'conflict_resolution'],
    anti: []
  },
  'Нутрициолог': {
    primary: ['riasec_investigative', 'riasec_social', 'cog_verbal', 'empathetic_listening'],
    secondary: ['bigfive_agreeableness', 'teique_self_awareness', 'teique_social_skills', 'beh_public_speaking'],
    anti: []
  },
  'Фитнес-коуч': {
    primary: ['riasec_realistic', 'riasec_social', 'cog_spatial', 'beh_self_presentation'],
    secondary: ['bigfive_extraversion', 'teique_social_skills', 'teique_motivation', 'beh_public_speaking'],
    anti: []
  },
  'Спортивный event-менеджер': {
    primary: ['riasec_enterprising', 'riasec_social', 'beh_time_management', 'belbin_doer'],
    secondary: ['bigfive_extraversion', 'teique_social_skills', 'belbin_leader', 'beh_self_presentation'],
    anti: ['mot_security']
  },

  // Туризм и премиальное гостеприимство
  'Глэмпинг-управляющий': {
    primary: ['riasec_enterprising', 'riasec_social', 'beh_time_management', 'empathetic_listening'],
    secondary: ['bigfive_extraversion', 'teique_social_skills', 'belbin_peacemaker', 'conflict_resolution'],
    anti: []
  },
  'Эко-гид': {
    primary: ['riasec_social', 'riasec_realistic', 'cog_verbal', 'beh_public_speaking'],
    secondary: ['bigfive_agreeableness', 'teique_motivation', 'tolerance_ambiguity', 'beh_self_presentation'],
    anti: []
  },
  'MICE-организатор': {
    primary: ['riasec_enterprising', 'riasec_social', 'beh_time_management', 'belbin_doer'],
    secondary: ['bigfive_extraversion', 'teique_social_skills', 'belbin_leader', 'beh_public_speaking'],
    anti: ['mot_security']
  },

  // Точечные дополнения в существующие отрасли
  'Архитектор облачной безопасности': {
    primary: ['riasec_conventional', 'riasec_realistic', 'cog_math_logic', 'cog_ai_literacy'],
    secondary: ['bigfive_conscientiousness', 'exec_inhibition', 'exec_flexibility', 'beh_digital_literacy'],
    anti: []
  },
  'Специалист по клеточному сельскому хозяйству': {
    primary: ['riasec_investigative', 'riasec_realistic', 'cog_math_logic', 'via_curiosity_scientific'],
    secondary: ['bigfive_conscientiousness', 'curiosity_epistemic', 'exec_inhibition', 'mot_climate_responsibility'],
    anti: []
  },
  'Эко-аудитор (ESG)': {
    primary: ['riasec_conventional', 'riasec_investigative', 'cog_critical', 'mot_climate_responsibility'],
    secondary: ['bigfive_conscientiousness', 'metacog_monitoring', 'via_justice_cluster', 'feedback_skill'],
    anti: []
  },
  'Нейромаркетолог': {
    primary: ['riasec_investigative', 'riasec_enterprising', 'cog_verbal', 'empathetic_listening'],
    secondary: ['bigfive_openness', 'teique_social_skills', 'cog_math_logic', 'beh_self_presentation'],
    anti: []
  },
  'Консультант по DeFi и токенизации': {
    primary: ['riasec_investigative', 'riasec_enterprising', 'cog_math_logic', 'beh_financial_literacy'],
    secondary: ['bigfive_openness', 'metacog_planning', 'cog_system', 'beh_digital_literacy'],
    anti: []
  },

  // 21. Оркестрация ИИ и Агенты (AI Orchestration & Agentic Systems)
  'Архитектор ИИ-агентов': {
    primary: ['riasec_investigative', 'riasec_conventional', 'cog_ai_literacy', 'beh_ai_collaboration'],
    secondary: ['bigfive_openness', 'cog_creative', 'cog_system', 'mot_lifelong_learning'],
    anti: []
  },
  'Инженер по оркестрации ИИ': {
    primary: ['riasec_conventional', 'riasec_realistic', 'cog_system', 'beh_ai_collaboration'],
    secondary: ['bigfive_conscientiousness', 'exec_inhibition', 'cog_ai_literacy', 'beh_digital_literacy'],
    anti: []
  },
  'Аудитор ИИ-систем на безопасность': {
    primary: ['riasec_conventional', 'riasec_investigative', 'cog_critical', 'cog_ai_literacy'],
    secondary: ['bigfive_conscientiousness', 'via_justice_cluster', 'ctx_ai_dependency', 'feedback_skill'],
    anti: []
  },
  'Тренер ИИ по эмпатии': {
    primary: ['riasec_social', 'riasec_artistic', 'cog_verbal', 'empathetic_listening'],
    secondary: ['bigfive_agreeableness', 'teique_social_skills', 'cog_ai_literacy', 'feedback_skill'],
    anti: []
  },
  'Разработчик когнитивных интерфейсов': {
    primary: ['riasec_artistic', 'riasec_investigative', 'cog_spatial', 'cog_ai_literacy'],
    secondary: ['bigfive_openness', 'cog_creative', 'beh_ai_collaboration', 'empathetic_listening'],
    anti: []
  },

  // 22. Космические технологии и коммерция (SpaceTech & Space Commerce)
  'Диспетчер космического трафика': {
    primary: ['riasec_conventional', 'riasec_realistic', 'cog_spatial', 'bigfive_stability'],
    secondary: ['self_control', 'exec_inhibition', 'teique_self_regulation', 'routine_discipline'],
    anti: ['emotional_reactivity']
  },
  'Орбитальный архитектор': {
    primary: ['riasec_artistic', 'riasec_realistic', 'cog_spatial', 'via_curiosity_scientific'],
    secondary: ['bigfive_openness', 'cog_creative', 'tolerance_ambiguity', 'beh_writing'],
    anti: []
  },
  'Аналитик космического мусора': {
    primary: ['riasec_investigative', 'riasec_realistic', 'cog_math_logic', 'via_curiosity_scientific'],
    secondary: ['bigfive_conscientiousness', 'metacog_monitoring', 'cog_system', 'beh_digital_literacy'],
    anti: []
  },
  'Инженер космической робототехники': {
    primary: ['riasec_realistic', 'riasec_investigative', 'cog_spatial', 'via_curiosity_scientific'],
    secondary: ['bigfive_conscientiousness', 'self_control', 'cog_system', 'digital_interests'],
    anti: []
  },
  'Организатор космического туризма': {
    primary: ['riasec_enterprising', 'riasec_social', 'cog_verbal', 'beh_public_speaking'],
    secondary: ['bigfive_extraversion', 'teique_social_skills', 'teique_motivation', 'beh_self_presentation'],
    anti: ['mot_security']
  }
};
