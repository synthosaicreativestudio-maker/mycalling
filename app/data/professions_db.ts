import { professionExtras } from './professionExtras';

export interface Profession {
  id: string;
  name: string;
  industry: string;
  riasec: ('Realistic' | 'Investigative' | 'Artistic' | 'Social' | 'Enterprising' | 'Conventional')[];
  gardner: ('Linguistic' | 'Logical-Mathematical' | 'Spatial-Visual' | 'Bodily-Kinesthetic' | 'Musical' | 'Interpersonal' | 'Intrapersonal' | 'Naturalist')[];
  bigFive: {
    traits: {
      Openness?: 'high' | 'low' | 'any';
      Conscientiousness?: 'high' | 'low' | 'any';
      Extraversion?: 'high' | 'low' | 'any';
      Agreeableness?: 'high' | 'low' | 'any';
      Stability?: 'high' | 'low' | 'any';
    };
  };
  subjects: string[];
  summary: string;
  why: string;
  skills: {
    hard: string[];
    soft: string[];
  };
  demand: 'high' | 'medium' | 'low';
  skillFormula: string[];
  transferableTo: string[];
  /**
   * Слой баланса каталога (docs/22, правило 70/20/10):
   * everyday — бытовая/массовая, future — трендовая, dream — мечта/экзотика.
   * Опционально на время миграции; у новых записей (генератор) — обязательно.
   */
  tier?: 'everyday' | 'future' | 'dream';
  /**
   * Ключ группировки в «архетип» для roll-up в отчёте (docs/22, слой 2).
   * Напр. IT-юрист / корпоративный юрист / нотариус → archetype: 'lawyer'.
   * Если не задан — профессия сама себе архетип (роль в отчёте не сворачивается).
   */
  archetype?: string;
  /**
   * Оси многомерного матчинга (docs/23, «паспорт профессии»). Симметричны
   * слоям профиля ученика — по ним считается совпадение сверх RIASEC.
   * Опциональны на время миграции; у новых записей (генератор/импорт) — обязательны.
   */
  /** Уровень требуемых способностей ↔ ICAR-band ученика (developing/solid/strong). */
  cognitiveDemand?: 'low' | 'medium' | 'high';
  /** Ценности (коды PVQ Шварца), которые профессия закрывает. */
  values?: string[];
  /** Сильные стороны характера (коды VIA), которые профессия задействует. */
  viaFit?: string[];
  /**
   * Поля каталога профессий (docs/26, Этап 8) + удивительный факт (Трек B).
   * Опциональны; наполняются курировано батчами. Текст fact — по правилу
   * why/summary: без «ИИ»/«искусственный интеллект».
   */
  /** Короткий удивительный/цепляющий факт о профессии (для карточки-аккордеона). */
  fact?: string;
  /** Ориентировочная вилка дохода в РФ, текстом (напр. «60–150 тыс ₽/мес»). */
  salary?: string;
  /** Путь в профессию: что сдавать / куда поступать (кратко). */
  educationPath?: string;
  /** Перспективы/тренд востребованности, короткой строкой. */
  outlook?: string;
}

export const industries = [
  'IT и разработка ПО',
  'Аналитика данных и ИИ',
  'Оркестрация ИИ и Агенты',
  'Робототехника и хардвер',
  'Космические технологии и коммерция',
  'Инженерия и промышленность',
  'Энергетика и эко-технологии',
  'Биотехнологии и биоинженерия',
  'Медицина и здравоохранение',
  'Маркетинг, PR и бренд-менеджмент',
  'Управление и бизнес-консалтинг',
  'Финансовые технологии и инвестиции',
  'Дизайн и креативные индустрии',
  'Медиа, блогинг и контент-производство',
  'Образование и EdTech',
  'Психология и ментальное здоровье',
  'Юриспруденция, право и безопасность',
  'Фундаментальная наука и исследования',
  'Агротехнологии и сити-фермерство',
  'Транспорт, логистика и беспилотные системы',
  'Спорт, фитнес и велнес',
  'Туризм и премиальное гостеприимство',
  'Сфера услуг, красота и гостеприимство',
  'Торговля и продажи',
  'Строительство и ремонт',
  'Госслужба, безопасность и оборона'
];

export const professionsDb: Profession[] = [
  // 1. IT и разработка ПО
  {
    id: 'backend-developer',
    name: 'Backend-разработчик',
    industry: 'IT и разработка ПО',
    tier: 'everyday',
    archetype: 'software-developer',
    riasec: ['Conventional', 'Realistic', 'Investigative'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Математика', 'Информатика', 'Русский язык'],
    summary: 'Создает серверную логику веб-сервисов, баз данных и программных интерфейсов.',
    why: 'В этой роли требуются точность, аккуратность и любовь к алгоритмам (Conventional/Investigative), а также координация серверного кода с базами данных.',
    skills: {
      hard: ['Node.js/Go/Python', 'SQL/PostgreSQL', 'REST/GraphQL API', 'Docker'],
      soft: ['Аналитическое мышление', 'Терпение', 'Командная работа']
    },
    demand: 'high',
    skillFormula: ['Алгоритмы', 'Логика', 'Системное мышление'],
    transferableTo: ['Инженер данных', 'Специалист по кибербезопасности', 'Системный администратор', 'Архитектор ПО']
  },
  {
    id: 'frontend-developer',
    name: 'Frontend-разработчик',
    industry: 'IT и разработка ПО',
    tier: 'everyday',
    archetype: 'software-developer',
    riasec: ['Artistic', 'Realistic', 'Conventional'],
    gardner: ['Spatial-Visual', 'Logical-Mathematical'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'creativity', 'appreciation_of_beauty'],
    subjects: ['Математика', 'Информатика', 'Русский язык'],
    summary: 'Разрабатывает визуальную и интерактивную часть веб-приложений для пользователей.',
    why: 'Сочетает визуально-пространственное и эстетическое видение (Artistic/Spatial-Visual) с алгоритмической точностью сборки кода (Conventional/Realistic).',
    skills: {
      hard: ['React/Next.js', 'HTML5/CSS3/JS', 'TypeScript', 'TailwindCSS'],
      soft: ['Внимание к деталям', 'Эмпатия к пользователю', 'Креативность']
    },
    demand: 'high',
    skillFormula: ['Визуализация', 'Юзабилити', 'Алгоритмы'],
    transferableTo: ['UX/UI-дизайнер', 'Мобильный разработчик', 'Продуктовый аналитик']
  },
  {
    id: 'blockchain-engineer',
    name: 'Блокчейн-инженер',
    industry: 'IT и разработка ПО',
    tier: 'future',
    archetype: 'blockchain-engineer',
    riasec: ['Investigative', 'Conventional', 'Realistic'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Математика', 'Информатика', 'Русский язык'],
    summary: 'Проектирует децентрализованные сети, криптографические протоколы и архитектуру смарт-контрактов.',
    why: 'Требует логического мышления и анализа данных (Investigative) для проектирования защищенных систем без посредников.',
    skills: {
      hard: ['Solidity/Rust', 'Криптография', 'Ethereum/Hyperledger', 'Web3.js'],
      soft: ['Критическое мышление', 'Стрессоустойчивость', 'Проектирование систем']
    },
    demand: 'high',
    skillFormula: ['Криптография', 'Децентрализация', 'Безопасность'],
    transferableTo: ['Разработчик смарт-контрактов', 'Специалист по кибербезопасности', 'Архитектор ПО']
  },
  {
    id: 'qa-engineer',
    name: 'QA-инженер (Тестировщик)',
    industry: 'IT и разработка ПО',
    tier: 'everyday',
    archetype: 'qa-engineer',
    riasec: ['Conventional', 'Realistic', 'Investigative'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Математика', 'Информатика', 'Русский язык'],
    summary: 'Тестирует программное обеспечение, находит ошибки в коде и следит за качеством финального продукта.',
    why: 'Требует скрупулезного выполнения сценариев и жесткого контроля правил (Conventional) для выявления сбоев.',
    skills: {
      hard: ['Selenium/Playwright', 'Автоматизация тестирования', 'Postman/API', 'Баг-трекинг'],
      soft: ['Внимательность', 'Коммуникабельность', 'Методичность']
    },
    demand: 'high',
    skillFormula: ['Методичность', 'Поиск аномалий', 'Логика'],
    transferableTo: ['Backend-разработчик', 'Бизнес-аналитик', 'Специалист технической поддержки']
  },
  {
    id: 'devops-engineer',
    name: 'DevOps-инженер',
    industry: 'IT и разработка ПО',
    tier: 'everyday',
    archetype: 'devops-engineer',
    riasec: ['Realistic', 'Conventional', 'Investigative'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Stability: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Математика', 'Информатика', 'Русский язык'],
    summary: 'Автоматизирует развертывание приложений, управляет облачной инфраструктурой и серверами.',
    why: 'Связывает практическую инфраструктуру (Realistic) с автоматизированным развертыванием кода по стандартам (Conventional).',
    skills: {
      hard: ['Kubernetes/Docker', 'CI/CD (GitLab/GitHub Actions)', 'Linux/Bash', 'AWS/Cloud'],
      soft: ['Спокойствие при инцидентах', 'Системное видение', 'Быстрое решение проблем']
    },
    demand: 'high',
    skillFormula: ['Автоматизация', 'Инфраструктура', 'Устойчивость'],
    transferableTo: ['Системный администратор', 'Облачный архитектор', 'Специалист по кибербезопасности']
  },
  {
    id: 'mobile-developer',
    name: 'Мобильный разработчик',
    industry: 'IT и разработка ПО',
    tier: 'everyday',
    archetype: 'software-developer',
    riasec: ['Artistic', 'Conventional', 'Realistic'],
    gardner: ['Logical-Mathematical', 'Spatial-Visual'],
    bigFive: { traits: { Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'creativity', 'appreciation_of_beauty'],
    subjects: ['Математика', 'Информатика', 'Русский язык'],
    summary: 'Создает приложения для смартфонов и планшетов на iOS и Android.',
    why: 'Ориентирован на мобильное юзабилити и анимации (Artistic), жесткие гайдлайны магазинов приложений (Conventional) и оптимизацию производительности мобильных процессоров (Realistic).',
    skills: {
      hard: ['Swift/Kotlin', 'React Native/Flutter', 'iOS/Android SDK', 'Mobile UI'],
      soft: ['Эмпатия к мобильным юзерам', 'Адаптивность', 'Внимание к деталям']
    },
    demand: 'high',
    skillFormula: ['Мобильность', 'Оптимизация интерфейсов', 'Алгоритмы'],
    transferableTo: ['Frontend-разработчик', 'UX-дизайнер', 'Продукт-менеджер']
  },

  // 2. Аналитика данных и ИИ
  {
    id: 'data-scientist',
    name: 'Специалист по Data Science',
    industry: 'Аналитика данных и ИИ',
    tier: 'future',
    archetype: 'data-scientist',
    riasec: ['Investigative', 'Conventional', 'Realistic'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Математика', 'Информатика', 'Русский язык'],
    summary: 'Анализирует огромные массивы данных, находит закономерности и строит прогнозные модели алгоритмы.',
    why: 'Глубокая исследовательская работа с алгоритмами (Investigative) сочетается с упорядочением структурированной информации (Conventional).',
    skills: {
      hard: ['Python/R', 'Pandas/NumPy', 'Статистический анализ', 'SQL'],
      soft: ['Любознательность', 'Презентация данных', 'Системность']
    },
    demand: 'high',
    skillFormula: ['Статистика', 'Поиск паттернов', 'Аналитика'],
    transferableTo: ['Инженер машинного обучения', 'Аналитик данных', 'Бизнес-аналитик']
  },
  {
    id: 'prompt-engineer',
    name: 'Промпт-инженер (ИИ-инструктор)',
    industry: 'Аналитика данных и ИИ',
    tier: 'future',
    archetype: 'prompt-engineer',
    riasec: ['Artistic', 'Investigative', 'Conventional'],
    gardner: ['Linguistic', 'Logical-Mathematical'],
    bigFive: { traits: { Openness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'creativity', 'appreciation_of_beauty'],
    subjects: ['Русский язык', 'Информатика', 'Обществознание'],
    summary: 'Разрабатывает текстовые запросы для больших языковых моделей с целью получения точных ответов.',
    why: 'Требует лингвистической изобретательности (Artistic/Linguistic) наряду с логическим тестированием результатов работы алгоритмы (Investigative/Conventional).',
    skills: {
      hard: ['Промпт-инжиниринг', 'Основы NLP', 'Python (базовый)', 'Работа с LLM API'],
      soft: ['Вербальный интеллект', 'Гибкость мышления', 'Экспериментаторство']
    },
    demand: 'medium',
    skillFormula: ['Лингвистика', 'Логика запросов', 'Креативность'],
    transferableTo: ['Контент-стратег', 'Копирайтер', 'Технический писатель', 'Аналитик данных']
  },
  {
    id: 'data-analyst',
    name: 'Аналитик данных',
    industry: 'Аналитика данных и ИИ',
    tier: 'future',
    archetype: 'data-analyst',
    riasec: ['Investigative', 'Conventional', 'Enterprising'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'power', 'stimulation'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'leadership', 'zest'],
    subjects: ['Математика', 'Информатика', 'Русский язык'],
    summary: 'Собирает, очищает и интерпретирует данные для принятия решений в бизнесе.',
    why: 'Помогает переводить гипотезы в цифры (Investigative), структурировать отчетность (Conventional) и обосновывать коммерческую выгоду (Enterprising).',
    skills: {
      hard: ['Excel/Google Sheets', 'SQL', 'Tableau/Power BI', 'Базовый Python'],
      soft: ['Презентационные навыки', 'Скрупулезность', 'Бизнес-мышление']
    },
    demand: 'high',
    skillFormula: ['Визуализация данных', 'Сравнение гипотез', 'Точность'],
    transferableTo: ['Бизнес-аналитик', 'Веб-аналитик', 'Продуктовый аналитик']
  },
  {
    id: 'machine-learning-engineer',
    name: 'Инженер машинного обучения (ML)',
    industry: 'Аналитика данных и ИИ',
    tier: 'future',
    archetype: 'data-scientist',
    riasec: ['Investigative', 'Realistic', 'Conventional'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Математика', 'Информатика', 'Русский язык'],
    summary: 'Разрабатывает алгоритмы машинного обучения и развертывает ML-модели в программных средах.',
    why: 'Сочетание исследовательской деятельности по оптимизации нейросетей (Investigative) с их непосредственной программной реализацией (Realistic).',
    skills: {
      hard: ['PyTorch/TensorFlow', 'Python/C++', 'MLOps', 'Алгоритмы оптимизации'],
      soft: ['Абстрактное мышление', 'Настойчивость', 'Решение сложных задач']
    },
    demand: 'high',
    skillFormula: ['Нейросети', 'Математика', 'Архитектура алгоритмов'],
    transferableTo: ['Специалист по Data Science', 'Backend-разработчик', 'Инженер данных']
  },
  {
    id: 'data-engineer',
    name: 'Инженер данных',
    industry: 'Аналитика данных и ИИ',
    tier: 'future',
    archetype: 'data-engineer',
    riasec: ['Conventional', 'Realistic', 'Investigative'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Математика', 'Информатика', 'Русский язык'],
    summary: 'Строит архитектуру хранения данных, создает ETL-процессы и подготавливает инфраструктуру.',
    why: 'Ориентирован на создание стабильных хранилищ, очистку информации по правилам (Conventional) и проектирование нагруженных конвейеров данных (Realistic).',
    skills: {
      hard: ['Hadoop/Spark', 'Airflow/ETL', 'SQL/NoSQL', 'Scala/Python'],
      soft: ['Внимательность к структуре', 'Ответственность', 'Организованность']
    },
    demand: 'high',
    skillFormula: ['Инфраструктура данных', 'ETL-процессы', 'Масштабируемость'],
    transferableTo: ['Backend-разработчик', 'Специалист по Data Science', 'Администратор баз данных']
  },
  {
    id: 'web-analyst',
    name: 'Веб-аналитик',
    industry: 'Аналитика данных и ИИ',
    tier: 'future',
    archetype: 'data-analyst',
    riasec: ['Conventional', 'Investigative', 'Enterprising'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'power', 'stimulation'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'leadership', 'zest'],
    subjects: ['Математика', 'Информатика', 'Обществознание'],
    summary: 'Анализирует поведение пользователей на сайтах и в приложениях для роста конверсии.',
    why: 'Связывает разметку пользовательских событий по стандартам (Conventional) с поиском причин падения трафика (Investigative) и целями бизнеса (Enterprising).',
    skills: {
      hard: ['Google Analytics/Yandex Metrika', 'GTM (Google Tag Manager)', 'A/B-тестирование', 'SQL'],
      soft: ['Клиентоориентированность', 'Критичность мышления', 'Презентация выводов']
    },
    demand: 'high',
    skillFormula: ['Пользовательский путь', 'Конверсия', 'Метрики'],
    transferableTo: ['Аналитик данных', 'UX-исследователь', 'Маркетолог-аналитик']
  },

  // 3. Робототехника и хардвер
  {
    id: 'robotics-engineer',
    name: 'Инженер-робототехник',
    industry: 'Робототехника и хардвер',
    tier: 'future',
    archetype: 'robotics-engineer',
    riasec: ['Realistic', 'Investigative', 'Conventional'],
    gardner: ['Logical-Mathematical', 'Spatial-Visual'],
    bigFive: { traits: { Conscientiousness: 'high', Openness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Математика', 'Физика', 'Информатика'],
    summary: 'Проектирует механическую структуру, электронику и программное обеспечение роботов.',
    why: 'Практическое конструирование физических устройств (Realistic) совмещается с расчетом кинематики систем (Investigative) и программированием контроллеров (Conventional).',
    skills: {
      hard: ['ROS (Robot Operating System)', 'C++/Python', 'Схемотехника', 'CAD-проектирование'],
      soft: ['Изобретательность', 'Системное мышление', 'Упорство']
    },
    demand: 'high',
    skillFormula: ['Кинематика', 'Программирование микроконтроллеров', 'Конструирование'],
    transferableTo: ['Инженер-конструктор', 'Специалист по интернету вещей', 'Инженер умного производства']
  },
  {
    id: 'iot-specialist',
    name: 'Специалист по интернету вещей (IoT)',
    industry: 'Робототехника и хардвер',
    tier: 'future',
    archetype: 'iot-specialist',
    riasec: ['Realistic', 'Investigative', 'Conventional'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Математика', 'Информатика', 'Физика'],
    summary: 'Объединяет приборы в единую сеть, настраивает датчики и автоматизирует их сбор данных.',
    why: 'Связывает реальные датчики (Realistic) с программными протоколами обмена информацией (Conventional) и анализом телеметрии (Investigative).',
    skills: {
      hard: ['MQTT/CoAP протоколы', 'C/Python', 'Arduino/Raspberry Pi', 'Сенсоры и датчики'],
      soft: ['Внимание к деталям', 'Системное видение', 'Адаптивность']
    },
    demand: 'high',
    skillFormula: ['Телеметрия', 'Сети связи', 'Сенсорика'],
    transferableTo: ['Инженер-робототехник', 'Системный администратор', 'Backend-разработчик']
  },
  {
    id: 'drone-operator',
    name: 'Оператор БПЛА',
    industry: 'Робототехника и хардвер',
    tier: 'future',
    archetype: 'drone-operator',
    riasec: ['Realistic', 'Conventional'],
    gardner: ['Spatial-Visual', 'Bodily-Kinesthetic'],
    bigFive: { traits: { Stability: 'high' } },
    cognitiveDemand: 'low',
    values: ['security', 'conformity'],
    viaFit: ['prudence', 'perseverance', 'honesty', 'self_regulation'],
    subjects: ['Физика', 'Информатика', 'Русский язык'],
    summary: 'Управляет беспилотниками, планирует полетные миссии и собирает видеоданные.',
    why: 'Требует высокой координации движений и пространственной ориентации (Realistic) наряду с четким соблюдением инструкций полета (Conventional).',
    skills: {
      hard: ['Пилотирование БПЛА', 'Настройка полетных контроллеров', 'Аэрофотосъемка', 'Базовый ремонт электроники'],
      soft: ['Концентрация внимания', 'Стрессоустойчивость', 'Быстрая реакция']
    },
    demand: 'high',
    skillFormula: ['Пилотирование', 'Навигация', 'Техническое обслуживание'],
    transferableTo: ['Специалист по геодезии', 'Инженер-робототехник (тестировщик)', 'Видеограф']
  },
  {
    id: 'electronics-engineer',
    name: 'Инженер-схемотехник',
    industry: 'Робототехника и хардвер',
    tier: 'future',
    archetype: 'electronics-engineer',
    riasec: ['Realistic', 'Investigative', 'Conventional'],
    gardner: ['Logical-Mathematical', 'Spatial-Visual'],
    bigFive: { traits: { Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Математика', 'Физика', 'Русский язык'],
    summary: 'Проектирует печатные платы, подбирает электронные компоненты и тестирует прототипы.',
    why: 'Ориентирован на ручную сборку и пайку (Realistic), расчет электрических цепей (Investigative) и подготовку чертежей по ГОСТам (Conventional).',
    skills: {
      hard: ['Altium Designer/EasyEDA', 'Проектирование печатных плат', 'Осциллограф и мультиметр', 'Пайка'],
      soft: ['Терпение', 'Аккуратность', 'Аналитический склад ума']
    },
    demand: 'high',
    skillFormula: ['Микросхемы', 'Электротехника', 'Проектирование плат'],
    transferableTo: ['Инженер-робототехник', 'Специалист по встраиваемым системам', 'Инженер по качеству']
  },
  {
    id: '3d-printing-engineer',
    name: 'Специалист по 3D-печати',
    industry: 'Робототехника и хардвер',
    tier: 'future',
    archetype: '3d-printing-engineer',
    riasec: ['Realistic', 'Conventional', 'Artistic'],
    gardner: ['Spatial-Visual'],
    bigFive: { traits: { Conscientiousness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['security', 'conformity', 'self_direction', 'stimulation'],
    viaFit: ['creativity', 'appreciation_of_beauty', 'perspective', 'prudence', 'perseverance'],
    subjects: ['Математика', 'Физика', 'Информатика'],
    summary: 'Подготавливает 3D-модели к печати, настраивает принтеры и обрабатывает готовые детали.',
    why: 'Практическое обслуживание 3D-принтеров (Realistic) требует знания параметров слайсинга и материалов (Conventional) и понимания 3D-эстетики модели (Artistic).',
    skills: {
      hard: ['Слайсеры (Cura/PrusaSlicer)', 'Настройка 3D-принтеров', 'Материаловедение (пластики/металлы)', 'CAD-моделирование'],
      soft: ['Внимательность к нюансам', 'Решение технических проблем', 'Креативность']
    },
    demand: 'medium',
    skillFormula: ['Слайсинг', 'Прототипирование', 'Материаловедение'],
    transferableTo: ['CAD-проектировщик', 'Макетчик', 'Инженер-технолог']
  },

  // 4. Инженерия и промышленность
  {
    id: 'structural-engineer',
    name: 'Инженер-строитель (Конструктор)',
    industry: 'Инженерия и промышленность',
    tier: 'everyday',
    archetype: 'structural-engineer',
    riasec: ['Realistic', 'Investigative', 'Conventional'],
    gardner: ['Spatial-Visual', 'Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Математика', 'Физика', 'Русский язык'],
    summary: 'Рассчитывает прочность несущих конструкций зданий, проектирует каркасы сооружений.',
    why: 'Практическое проектирование реальных объектов (Realistic) на основе математических расчетов нагрузок (Investigative) по ГОСТам и правилам безопасности (Conventional).',
    skills: {
      hard: ['AutoCAD/Revit', 'Расчет нагрузок (Лира-САПР/SCAD)', 'Сопромат', 'СниПы и ГОСТы'],
      soft: ['Ответственность', 'Пространственное мышление', 'Скрупулезность']
    },
    demand: 'high',
    skillFormula: ['Сопромат', 'Проектирование каркасов', 'Нормативная база'],
    transferableTo: ['Архитектор', 'Инженер по технадзору', 'Специалист по BIM-моделированию']
  },
  {
    id: 'aerospace-engineer',
    name: 'Аэрокосмический инженер',
    industry: 'Инженерия и промышленность',
    tier: 'future',
    archetype: 'aerospace-engineer',
    riasec: ['Realistic', 'Investigative', 'Conventional'],
    gardner: ['Logical-Mathematical', 'Spatial-Visual'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Математика', 'Физика', 'Русский язык'],
    summary: 'Проектирует космические аппараты, спутники, ракеты-носители и авиационную технику.',
    why: 'Конструирование физических летательных аппаратов (Realistic) требует сложнейших аэродинамических расчетов (Investigative) и соблюдения стандартов надежности (Conventional).',
    skills: {
      hard: ['Аэродинамика', 'CAD/CAM системы', 'Расчет прочности конструкций', 'Программирование систем управления'],
      soft: ['Системность мышления', 'Стрессоустойчивость', 'Внимание к микродеталям']
    },
    demand: 'high',
    skillFormula: ['Аэродинамика', 'Космические аппараты', 'Надежность'],
    transferableTo: ['Инженер-конструктор автопрома', 'Ученый-физик', 'Аналитик сложных систем']
  },
  {
    id: 'automotive-engineer',
    name: 'Автомобильный инженер (Беспилотники)',
    industry: 'Инженерия и промышленность',
    tier: 'everyday',
    archetype: 'automotive-engineer',
    riasec: ['Realistic', 'Investigative', 'Conventional'],
    gardner: ['Logical-Mathematical', 'Spatial-Visual'],
    bigFive: { traits: { Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Математика', 'Физика', 'Русский язык'],
    summary: 'Проектирует узлы автомобилей, интегрирует сенсоры беспилотного вождения.',
    why: 'Физическое строение автомобиля (Realistic) сочетается с цифровым наполнением и алгоритмами автопилота (Investigative/Conventional).',
    skills: {
      hard: ['CAD-системы (Catia/NX)', 'Тестирование систем ADAS', 'Интеграция сенсоров (LiDAR/Радары)', 'Динамика автомобиля'],
      soft: ['Командная координация', 'Ориентация на безопасность', 'Инициативность']
    },
    demand: 'high',
    skillFormula: ['Автопилоты', 'Конструирование узлов', 'Интеграция систем'],
    transferableTo: ['Инженер-робототехник', 'Промышленный дизайнер', 'Инженер по надежности']
  },
  {
    id: 'smart-city-architect',
    name: 'Проектировщик умных городов',
    industry: 'Инженерия и промышленность',
    tier: 'everyday',
    archetype: 'smart-city-architect',
    riasec: ['Artistic', 'Realistic', 'Investigative'],
    gardner: ['Spatial-Visual', 'Logical-Mathematical'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'stimulation'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'creativity', 'appreciation_of_beauty'],
    subjects: ['Математика', 'Обществознание', 'Русский язык'],
    summary: 'Проектирует городскую инфраструктуру с внедрением автоматизированных сетей транспорта и связи.',
    why: 'Творческое проектирование среды обитания (Artistic) накладывается на практические строительные ограничения (Realistic) и анализ больших данных (Investigative).',
    skills: {
      hard: ['ГИС-технологии', 'Урбанистика', 'Экологическое проектирование', 'BIM-моделирование'],
      soft: ['Визионерство', 'Междисциплинарность', 'Коммуникация с властями']
    },
    demand: 'high',
    skillFormula: ['Урбанистика', 'Инфраструктура IoT', 'Пространственный дизайн'],
    transferableTo: ['Урбанист-планировщик', 'Архитектор', 'Эколог-урбанист']
  },
  {
    id: 'industrial-designer',
    name: 'Промышленный дизайнер',
    industry: 'Инженерия и промышленность',
    tier: 'everyday',
    archetype: 'industrial-designer',
    riasec: ['Artistic', 'Realistic', 'Investigative'],
    gardner: ['Spatial-Visual'],
    bigFive: { traits: { Openness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'stimulation'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'creativity', 'appreciation_of_beauty'],
    subjects: ['Математика', 'Литература', 'Русский язык'],
    summary: 'Создает эстетичный и функциональный внешний вид бытовых приборов, гаджетов и транспорта.',
    why: 'Художественное творчество (Artistic) сжато строгими инженерными рамками производства (Realistic) и изучением эргономики (Investigative).',
    skills: {
      hard: ['3D-моделирование (Rhinoceros/Alias)', 'Рендеринг (Keyshot)', 'Эргономика и дизайн-прототипирование', 'Эскизирование'],
      soft: ['Креативное мышление', 'Эмпатия к потребителю', 'Пространственное воображение']
    },
    demand: 'medium',
    skillFormula: ['Эргономика', 'Эстетика продукта', 'Конструирование'],
    transferableTo: ['UX/UI-дизайнер', '3D-моделлер', 'Архитектор малых форм']
  },

  // 5. Энергетика и эко-технологии
  {
    id: 'renewable-energy-engineer',
    name: 'Инженер возобновляемой энергетики',
    industry: 'Энергетика и эко-технологии',
    tier: 'everyday',
    archetype: 'renewable-energy-engineer',
    riasec: ['Realistic', 'Investigative', 'Conventional'],
    gardner: ['Logical-Mathematical', 'Naturalist'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Математика', 'Физика', 'География'],
    summary: 'Проектирует и обслуживает солнечные, ветровые и альтернативные электростанции.',
    why: 'Связывает установку физических генерирующих мощностей (Realistic) с расчетом климатической инсоляции (Investigative) и контролем энергопотерь (Conventional).',
    skills: {
      hard: ['Проектирование СЭС/ВЭС', 'Расчет энергобаланса', 'Электротехника', 'Оценка ветрового потенциала'],
      soft: ['Экологическое сознание', 'Умение работать руками', 'Находчивость']
    },
    demand: 'high',
    skillFormula: ['Альтернативная энергетика', 'Электросети', 'Климатология'],
    transferableTo: ['Инженер-электрик', 'Эколог-урбанист', 'Менеджер энергоэффективности']
  },
  {
    id: 'urban-ecologist',
    name: 'Эколог-урбанист',
    industry: 'Энергетика и эко-технологии',
    tier: 'everyday',
    archetype: 'urban-ecologist',
    riasec: ['Investigative', 'Realistic', 'Social'],
    gardner: ['Naturalist', 'Spatial-Visual'],
    bigFive: { traits: { Openness: 'high', Agreeableness: 'high' } },
    cognitiveDemand: 'high',
    values: ['benevolence', 'universalism', 'self_direction', 'achievement'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'kindness', 'social_intelligence'],
    subjects: ['Биология', 'География', 'Русский язык'],
    summary: 'Занимается внедрением зеленых насаждений, мониторингом воздуха и очисткой экосистем городов.',
    why: 'Научный анализ биосферных параметров города (Investigative) сочетается с прикладными ландшафтными работами (Realistic) и общественным просвещением (Social).',
    skills: {
      hard: ['Экологический мониторинг', 'Анализ биоценозов', 'ГИС-картографирование', 'Озеленение кровель'],
      soft: ['Любовь к природе', 'Эмпатия', 'Публичные выступления']
    },
    demand: 'high',
    skillFormula: ['Городская экология', 'Мониторинг загрязнений', 'Ландшафтный дизайн'],
    transferableTo: ['Эколог-консультант', 'Проектировщик умных городов', 'Агроном']
  },
  {
    id: 'waste-recycling-technologist',
    name: 'Технолог рециклинга',
    industry: 'Энергетика и эко-технологии',
    tier: 'everyday',
    archetype: 'waste-recycling-technologist',
    riasec: ['Realistic', 'Investigative', 'Conventional'],
    gardner: ['Naturalist', 'Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Химия', 'Биология', 'Математика'],
    summary: 'Разрабатывает технологии переработки пластика, металлов и опасных бытовых отходов.',
    why: 'Практическая сортировка и переработка (Realistic) опирается на химический анализ токсичности материалов (Investigative) и строго регламентированную утилизацию (Conventional).',
    skills: {
      hard: ['Химическая переработка пластиков', 'Управление сортировочными линиями', 'Аналитическая химия', 'Стандарты эко-безопасности'],
      soft: ['Дисциплина', 'Методичность', 'Ориентация на результат']
    },
    demand: 'high',
    skillFormula: ['Утилизация отходов', 'Химия полимеров', 'Стандартизация'],
    transferableTo: ['Химик-технолог', 'Инженер по охране труда', 'Эколог-аудитор']
  },
  {
    id: 'carbon-footprint-auditor',
    name: 'Аудитор углеродного следа',
    industry: 'Энергетика и эко-технологии',
    tier: 'everyday',
    archetype: 'carbon-footprint-auditor',
    riasec: ['Conventional', 'Enterprising', 'Investigative'],
    gardner: ['Logical-Mathematical', 'Naturalist'],
    bigFive: { traits: { Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'power', 'stimulation'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'leadership', 'zest'],
    subjects: ['Математика', 'География', 'Обществознание'],
    summary: 'Рассчитывает объем выбросов парниковых газов предприятий и разрабатывает стратегии снижения экологических штрафов.',
    why: 'Анализ выбросов по жестким формулам углеродного учета (Conventional) помогает бизнесу оптимизировать налоги и повысить инвестиционную привлекательность (Enterprising).',
    skills: {
      hard: ['Расчет выбросов CO2 (GHG Protocol)', 'ESG-отчетность', 'Экологический комплаенс', 'Excel-моделирование'],
      soft: ['Коммуникация с топ-менеджментом', 'Аналитическая точность', 'Организованность']
    },
    demand: 'medium',
    skillFormula: ['ESG-аудит', 'Расчет выбросов', 'Комплаенс'],
    transferableTo: ['Финансовый аудитор', 'Эколог-консультант', 'Менеджер по управлению рисками']
  },
  {
    id: 'energy-efficiency-consultant',
    name: 'Консультант по энергоэффективности',
    industry: 'Энергетика и эко-технологии',
    tier: 'everyday',
    archetype: 'energy-efficiency-consultant',
    riasec: ['Conventional', 'Realistic', 'Investigative'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Математика', 'Физика', 'Русский язык'],
    summary: 'Проводит обследование зданий, выявляет потери тепла и электричества и оптимизирует затраты.',
    why: 'Скрупулезные замеры энергопотерь (Conventional) с помощью оборудования (Realistic) завершаются аналитическими рекомендациями клиенту (Investigative).',
    skills: {
      hard: ['Тепловизионное обследование', 'Энергоаудит', 'Проектирование теплоизоляции', 'Составление энергопаспортов'],
      soft: ['Консультирование клиентов', 'Внимательность к мелочам', 'Дисциплина']
    },
    demand: 'medium',
    skillFormula: ['Тепловизионный анализ', 'Энергосбережение', 'Инженерные сети'],
    transferableTo: ['Инженер отопления и вентиляции', 'Инженер-электрик', 'Строительный инспектор']
  },

  // 6. Биотехнологии и биоинженерия
  {
    id: 'bioinformatician',
    name: 'Биоинформатик',
    industry: 'Биотехнологии и биоинженерия',
    tier: 'future',
    archetype: 'bioinformatician',
    riasec: ['Investigative', 'Realistic', 'Conventional'],
    gardner: ['Logical-Mathematical', 'Naturalist'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Математика', 'Биология', 'Информатика'],
    summary: 'Обрабатывает геномные последовательности и биологические данные с помощью алгоритмов.',
    why: 'Абстрактные биологические гипотезы (Investigative) программируются на Python/R (Realistic) и организуются в структуры геномных баз данных (Conventional).',
    skills: {
      hard: ['Python/R (био-библиотеки)', 'Анализ секвенирования ДНК (NGS)', 'SQL/Базы геномов', 'Сравнительная геномика'],
      soft: ['Высокая концентрация', 'Системное мышление', 'Методичность']
    },
    demand: 'high',
    skillFormula: ['Геномика', 'Анализ больших био-данных', 'Алгоритмы программирования'],
    transferableTo: ['Специалист по Data Science', 'Генетический консультант', 'Нейробиолог']
  },
  {
    id: 'biopharmacologist',
    name: 'Биофармаколог (Разработчик лекарств)',
    industry: 'Биотехнологии и биоинженерия',
    tier: 'future',
    archetype: 'biopharmacologist',
    riasec: ['Investigative', 'Conventional', 'Realistic'],
    gardner: ['Logical-Mathematical', 'Naturalist'],
    bigFive: { traits: { Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Химия', 'Биология', 'Математика'],
    summary: 'Разрабатывает новые биопрепараты, вакцины и адресные молекулы доставки лекарств.',
    why: 'Научный поиск терапевтических мишеней (Investigative) подчинен строжайшим лабораторным регламентам и фазам клинических испытаний (Conventional).',
    skills: {
      hard: ['Органическая химия', 'Молекулярное моделирование', 'Клеточные культуры', 'Методология клинических испытаний'],
      soft: ['Терпение (долгий цикл R&D)', 'Честность', 'Научная скрупулезность']
    },
    demand: 'high',
    skillFormula: ['Молекулярный синтез', 'Клинические протоколы', 'Биохимия'],
    transferableTo: ['Химик-аналитик', 'Специалист по сертификации лекарств', 'Синтетический биолог']
  },
  {
    id: 'agricultural-geneticist',
    name: 'Агроном-генетик',
    industry: 'Биотехнологии и биоинженерия',
    tier: 'future',
    archetype: 'agricultural-geneticist',
    riasec: ['Investigative', 'Realistic', 'Conventional'],
    gardner: ['Naturalist', 'Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Биология', 'Химия', 'Русский язык'],
    summary: 'Выводит устойчивые к засухам и болезням сорта культур методами генного редактирования.',
    why: 'Лабораторные исследования генома растений (Investigative) тестируются на реальных посевных полях в условиях открытого грунта (Realistic).',
    skills: {
      hard: ['Редактирование CRISPR/Cas9', 'Генетика растений', 'Физиология растений', 'Селекция культур'],
      soft: ['Наблюдательность', 'Уважение к живой природе', 'Дисциплина']
    },
    demand: 'high',
    skillFormula: ['Генное редактирование', 'Ботаника', 'Полевые пробы'],
    transferableTo: ['Сити-фермер', 'Биолог-исследователь', 'Эколог-почвовед']
  },
  {
    id: 'synthetic-biologist',
    name: 'Синтетический биолог',
    industry: 'Биотехнологии и биоинженерия',
    tier: 'future',
    archetype: 'synthetic-biologist',
    riasec: ['Investigative', 'Realistic', 'Conventional'],
    gardner: ['Naturalist', 'Logical-Mathematical'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Биология', 'Химия', 'Математика'],
    summary: 'Создает искусственные живые системы и микроорганизмы с заданными функциями.',
    why: 'Конструирование новых форм жизни на стыке инженерии и биологии (Investigative/Realistic) с соблюдением протоколов био-безопасности (Conventional).',
    skills: {
      hard: ['Сборка ДНК (Golden Gate/Gibson)', 'Биодизайн метаболических путей', 'Микробиология', 'Работа в чистых боксах'],
      soft: ['Творческое воображение', 'Оценка био-рисков', 'Системное мышление']
    },
    demand: 'high',
    skillFormula: ['Биоинженерия', 'Микробиология', 'Конструирование ДНК'],
    transferableTo: ['Биофармаколог', 'Биоинформатик', 'Эколог-микробиолог']
  },
  {
    id: 'longevity-specialist',
    name: 'Специалист по долголетию (Биохакер)',
    industry: 'Биотехнологии и биоинженерия',
    tier: 'future',
    archetype: 'longevity-specialist',
    riasec: ['Investigative', 'Artistic', 'Social'],
    gardner: ['Naturalist', 'Intrapersonal'],
    bigFive: { traits: { Openness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['benevolence', 'universalism', 'self_direction', 'achievement'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'kindness', 'social_intelligence'],
    subjects: ['Биология', 'Химия', 'Русский язык'],
    summary: 'Разрабатывает индивидуальные превентивные программы замедления старения на основе генома и биомаркеров.',
    why: 'Анализ научных трендов старения (Investigative) упаковывается в креативные персонализированные треки здоровья (Artistic) и направлен на помощь человеку (Social).',
    skills: {
      hard: ['Интерпретация биомаркеров', 'Геронтология', 'Диетотерапия и нутригенетика', 'Анализ качества сна'],
      soft: ['Эмпатия', 'Навыки мотивации людей', 'Критическое отношение к бадам']
    },
    demand: 'medium',
    skillFormula: ['Геронтология', 'Анализ крови и генов', 'Превентивная терапия'],
    transferableTo: ['Спортивный нутрициолог', 'Генетический консультант', 'ЗОЖ-коуч']
  },

  // 7. Медицина и здравоохранение
  {
    id: 'online-therapist',
    name: 'Онлайн-терапевт (Теледоктор)',
    industry: 'Медицина и здравоохранение',
    tier: 'everyday',
    archetype: 'psychotherapist',
    riasec: ['Social', 'Investigative', 'Artistic'],
    gardner: ['Interpersonal', 'Linguistic'],
    bigFive: { traits: { Agreeableness: 'high', Extraversion: 'high' } },
    cognitiveDemand: 'high',
    values: ['benevolence', 'universalism', 'self_direction', 'achievement'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'kindness', 'social_intelligence'],
    subjects: ['Биология', 'Химия', 'Русский язык'],
    summary: 'Дистанционно консультирует пациентов по результатам анализов и ведет медицинский мониторинг.',
    why: 'Высокая социальная направленность и эмпатия (Social) сочетается с необходимостью точной диагностики жалоб (Investigative) и адаптации речи под пациента (Artistic).',
    skills: {
      hard: ['Дистанционная диагностика', 'Работа в МИС (информ. системах)', 'Интерпретация лабораторных тестов', 'Фармакотерапия'],
      soft: ['Активное слушание', 'Эмпатия', 'Письменная грамотность']
    },
    demand: 'high',
    skillFormula: ['Телемедицина', 'Сбор анамнеза', 'Пациентоориентированность'],
    transferableTo: ['Семейный психотерапевт', 'Генетический консультант', 'Координатор медицинских программ']
  },
  {
    id: 'surgeon',
    name: 'Хирург',
    industry: 'Медицина и здравоохранение',
    tier: 'everyday',
    archetype: 'surgeon',
    riasec: ['Realistic', 'Social', 'Investigative'],
    gardner: ['Bodily-Kinesthetic', 'Spatial-Visual'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['benevolence', 'universalism', 'self_direction', 'achievement'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'kindness', 'social_intelligence'],
    subjects: ['Биология', 'Химия', 'Русский язык'],
    summary: 'Выполняет сложные оперативные вмешательства на органах и тканях пациента.',
    why: 'Сложнейшие мануальные манипуляции руками (Realistic) нацелены на спасение жизни человека (Social) при мгновенном анализе критических изменений (Investigative).',
    skills: {
      hard: ['Оперативная хирургия', 'Асептика и антисептика', 'Анатомия человека', 'Работа с операционным оборудованием'],
      soft: ['Хладнокровие в кризисе', 'Выносливость', 'Точность движений']
    },
    demand: 'high',
    skillFormula: ['Оперативная техника', 'Анатомия', 'Кризисное принятие решений'],
    transferableTo: ['Реабилитолог', 'Врач скорой помощи', 'Травматолог']
  },
  {
    id: 'genetic-counselor',
    name: 'Генетический консультант',
    industry: 'Медицина и здравоохранение',
    tier: 'everyday',
    archetype: 'genetic-counselor',
    riasec: ['Investigative', 'Social', 'Artistic'],
    gardner: ['Interpersonal', 'Naturalist'],
    bigFive: { traits: { Agreeableness: 'high', Openness: 'high' } },
    cognitiveDemand: 'high',
    values: ['benevolence', 'universalism', 'self_direction', 'achievement'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'kindness', 'social_intelligence'],
    subjects: ['Биология', 'Химия', 'Обществознание'],
    summary: 'Определяет риски передачи наследственных заболеваний будущим детям и помогает расшифровать тесты ДНК.',
    why: 'Связывает научный анализ мутаций в генах (Investigative) со сложным психологическим консультированием семейных пар (Social).',
    skills: {
      hard: ['Медицинская генетика', 'Построение родословных древ', 'Биоэтика', 'Расшифровка ДНК-чипов'],
      soft: ['Тактичность', 'Подача плохих новостей', 'Эмпатия']
    },
    demand: 'medium',
    skillFormula: ['Генетический скрининг', 'Психологическое сопровождение', 'Биоэтика'],
    transferableTo: ['Биоинформатик', 'Семейный психотерапевт', 'Специалист по ЭКО']
  },
  {
    id: 'cyber-prosthetist',
    name: 'Разработчик киберпротезов',
    industry: 'Медицина и здравоохранение',
    tier: 'everyday',
    archetype: 'cyber-prosthetist',
    riasec: ['Realistic', 'Investigative', 'Social'],
    gardner: ['Spatial-Visual', 'Bodily-Kinesthetic'],
    bigFive: { traits: { Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['benevolence', 'universalism', 'self_direction', 'achievement'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'kindness', 'social_intelligence'],
    subjects: ['Математика', 'Физика', 'Биология'],
    summary: 'Создает индивидуальные бионические протезы рук и ног, считывающие нервные импульсы.',
    why: 'Конструирование сложных робототехнических конечностей (Realistic) по физиологическим меркам пациента (Investigative) возвращает людям мобильность (Social).',
    skills: {
      hard: ['Биомеханика', 'Интеграция мио-датчиков', 'CAD/CAM-моделирование гильз', '3D-печать протезов'],
      soft: ['Эмпатия к инвалидам', 'Терпеливость при примерках', 'Инженерная смекалка']
    },
    demand: 'high',
    skillFormula: ['Бионика', 'Считывание нервных импульсов', 'Протезирование'],
    transferableTo: ['Инженер-робототехник', 'Реабилитолог', 'Инженер по медтехнике']
  },
  {
    id: 'pediatrician',
    name: 'Педиатр',
    industry: 'Медицина и здравоохранение',
    tier: 'everyday',
    archetype: 'pediatrician',
    riasec: ['Social', 'Investigative', 'Realistic'],
    gardner: ['Interpersonal'],
    bigFive: { traits: { Agreeableness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['benevolence', 'universalism', 'self_direction', 'achievement'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'kindness', 'social_intelligence'],
    subjects: ['Биология', 'Химия', 'Русский язык'],
    summary: 'Занимается профилактикой, диагностикой и лечением детских болезней.',
    why: 'Глубокий социальный контакт с детьми и родителями (Social) требует детективного поиска причин невнятных жалоб малыша (Investigative).',
    skills: {
      hard: ['Детские патологии', 'Фармакотерапия раннего возраста', 'Оценка физического развития', 'Вакцинопрофилактика'],
      soft: ['Умение расположить ребенка', 'Стрессоустойчивость', 'Мягкий голос']
    },
    demand: 'high',
    skillFormula: ['Педиатрия', 'Общение с детьми', 'Иммунопрофилактика'],
    transferableTo: ['Детский психолог', 'Терапевт онлайн', 'Врач-неонатолог']
  },
  {
    id: 'neuro-radiologist',
    name: 'Neuro-рентгенолог',
    industry: 'Медицина и здравоохранение',
    tier: 'everyday',
    archetype: 'neuro-radiologist',
    riasec: ['Investigative', 'Realistic', 'Conventional'],
    gardner: ['Spatial-Visual', 'Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Биология', 'Химия', 'Математика'],
    summary: 'Анализирует МРТ и КТ снимки головного и спинного мозга для обнаружения инсультов, опухолей и травм.',
    why: 'Поиск мельчайших затемнений на визуальных срезах (Investigative) требует работы на дорогостоящем томографе (Realistic) и заполнения протоколов по форме (Conventional).',
    skills: {
      hard: ['Интерпретация МРТ/КТ/ПЭТ', 'Анатомия нервной системы', 'Работа в DICOM-просмотрщиках', 'Радиационная безопасность'],
      soft: ['Концентрация внимания', 'Высокая ответственность', 'Аналитичность']
    },
    demand: 'high',
    skillFormula: ['МРТ-диагностика', 'Визуальная детекция', 'Точность протоколов'],
    transferableTo: ['Врач-невролог', 'Специалист по компьютерному зрению (разметка медицинских данных)', 'Онколог']
  },

  // 8. Маркетинг, PR и бренд-менеджмент
  {
    id: 'digital-marketer',
    name: 'Digital-маркетолог',
    industry: 'Маркетинг, PR и бренд-менеджмент',
    tier: 'everyday',
    archetype: 'digital-marketer',
    riasec: ['Enterprising', 'Artistic', 'Social'],
    gardner: ['Interpersonal', 'Linguistic'],
    bigFive: { traits: { Openness: 'high', Extraversion: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'universalism', 'power', 'achievement'],
    viaFit: ['kindness', 'social_intelligence', 'teamwork', 'creativity', 'appreciation_of_beauty'],
    subjects: ['Обществознание', 'Иностранный язык', 'Информатика'],
    summary: 'Привлекает клиентов в Интернете через контекстную рекламу, спецпроекты и SEO.',
    why: 'Запуск рекламных кампаний для роста продаж компании (Enterprising) требует генерации цепляющих креативов (Artistic) и понимания болей аудитории (Social).',
    skills: {
      hard: ['Контекстная и таргетированная реклама', 'Яндекс.Директ', 'SEO-оптимизация', 'Юнит-экономика'],
      soft: ['Коммуникация', 'Гибкость мышления', 'Ориентация на цифры']
    },
    demand: 'high',
    skillFormula: ['Лидогенерация', 'Рекламный креатив', 'Анализ трафика'],
    transferableTo: ['SMM-стратег', 'Продукт-менеджер', 'Таргетолог']
  },
  {
    id: 'pr-manager',
    name: 'PR-менеджер',
    industry: 'Маркетинг, PR и бренд-менеджмент',
    tier: 'everyday',
    archetype: 'pr-manager',
    riasec: ['Enterprising', 'Social', 'Artistic'],
    gardner: ['Interpersonal', 'Linguistic'],
    bigFive: { traits: { Extraversion: 'high', Agreeableness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'universalism', 'power', 'achievement'],
    viaFit: ['kindness', 'social_intelligence', 'teamwork', 'creativity', 'appreciation_of_beauty'],
    subjects: ['Обществознание', 'История', 'Русский язык'],
    summary: 'Формирует положительный имидж компании в СМИ, организует интервью и публикации.',
    why: 'Продвижение репутации бренда на рынке (Enterprising) происходит через выстраивание теплых отношений с журналистами (Social) и написание ярких пресс-релизов (Artistic).',
    skills: {
      hard: ['Написание пресс-релизов', 'База контактов СМИ', 'Антикризисный PR', 'Event-менеджмент'],
      soft: ['Харизма', 'Быстрое реагирование в кризисе', 'Умение убеждать']
    },
    demand: 'medium',
    skillFormula: ['Связи со СМИ', 'Управление репутацией', 'Написание текстов'],
    transferableTo: ['Бренд-менеджер', 'Копирайтер', 'Пресс-секретарь']
  },
  {
    id: 'smm-strategist',
    name: 'SMM-стратег',
    industry: 'Маркетинг, PR и бренд-менеджмент',
    tier: 'everyday',
    archetype: 'digital-marketer',
    riasec: ['Artistic', 'Enterprising', 'Social'],
    gardner: ['Linguistic', 'Interpersonal'],
    bigFive: { traits: { Openness: 'high', Extraversion: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'universalism', 'power', 'achievement'],
    viaFit: ['kindness', 'social_intelligence', 'teamwork', 'creativity', 'appreciation_of_beauty'],
    subjects: ['Обществознание', 'Литература', 'Русский язык'],
    summary: 'Разрабатывает стратегию ведения соцсетей (Telegram, VK, YouTube) для привлечения и удержания подписчиков.',
    why: 'Постоянное создание визуального и текстового контента (Artistic) служит целям роста подписной базы и вовлеченности (Enterprising/Social).',
    skills: {
      hard: ['Создание контент-планов', 'Копирайтинг для соцсетей', 'Аналитика Telegram/VK', 'Видеосъемка Reels/Shorts'],
      soft: ['Юмор и насмотренность', 'Быстрая адаптация к трендам', 'Общительность']
    },
    demand: 'high',
    skillFormula: ['Социальные сети', 'Вирусный контент', 'Тренды'],
    transferableTo: ['Копирайтер', 'PR-менеджер', 'Digital-маркетолог']
  },
  {
    id: 'target-marketer',
    name: 'Таргетолог / Трафик-менеджер',
    industry: 'Маркетинг, PR и бренд-менеджмент',
    tier: 'everyday',
    archetype: 'digital-marketer',
    riasec: ['Conventional', 'Enterprising', 'Investigative'],
    gardner: ['Logical-Mathematical', 'Interpersonal'],
    bigFive: { traits: { Conscientiousness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['self_direction', 'achievement', 'power', 'stimulation'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'leadership', 'zest'],
    subjects: ['Математика', 'Обществознание', 'Информатика'],
    summary: 'Настраивает показ рекламы в социальных сетях строго на целевую аудиторию.',
    why: 'Точный выбор параметров таргетинга в кабинетах по правилам (Conventional) решает коммерческие задачи окупаемости трафика (Enterprising).',
    skills: {
      hard: ['Кабинеты VK Реклама/Telegram Ads', 'Парсинг аудиторий (TargetHunter)', 'Настройка пикселей конверсий', 'Анализ UTM-меток'],
      soft: ['Аналитический склад', 'Терпение при тестах гипотез', 'Внимательность']
    },
    demand: 'high',
    skillFormula: ['Таргетированная реклама', 'Парсинг аудиторий', 'Юнит-анализ'],
    transferableTo: ['Digital-маркетолог', 'Веб-аналитик', 'Контент-менеджер']
  },
  {
    id: 'brand-manager',
    name: 'Бренд-менеджер',
    industry: 'Маркетинг, PR и бренд-менеджмент',
    tier: 'everyday',
    archetype: 'brand-manager',
    riasec: ['Enterprising', 'Artistic', 'Social'],
    gardner: ['Interpersonal', 'Linguistic'],
    bigFive: { traits: { Openness: 'high', Extraversion: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'universalism', 'power', 'achievement'],
    viaFit: ['kindness', 'social_intelligence', 'teamwork', 'creativity', 'appreciation_of_beauty'],
    subjects: ['Обществознание', 'Иностранный язык', 'Русский язык'],
    summary: 'Отвечает за позиционирование, упаковку и прибыльность конкретного товарного бренда.',
    why: 'Целиком руководит коммерческим успехом продукта (Enterprising) через эстетику его упаковки (Artistic) и исследование ценностей потребителей (Social).',
    skills: {
      hard: ['Маркетинговые исследования', 'Ценообразование и P&L', 'Управление запуском продуктов (NPD)', 'Разработка брендбука'],
      soft: ['Лидерские качества', 'Масштабность мышления', 'Презентация']
    },
    demand: 'high',
    skillFormula: ['Позиционирование бренда', 'Упаковка продукта', 'Исследование рынка'],
    transferableTo: ['PR-менеджер', 'Product Manager', 'Digital-маркетолог']
  },
  {
    id: 'influencer-marketing-manager',
    name: 'Influencer-менеджер',
    industry: 'Маркетинг, PR и бренд-менеджмент',
    tier: 'everyday',
    archetype: 'influencer-marketing-manager',
    riasec: ['Enterprising', 'Social', 'Artistic'],
    gardner: ['Interpersonal'],
    bigFive: { traits: { Extraversion: 'high', Agreeableness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'universalism', 'power', 'achievement'],
    viaFit: ['kindness', 'social_intelligence', 'teamwork', 'creativity', 'appreciation_of_beauty'],
    subjects: ['Обществознание', 'Русский язык', 'Иностранный язык'],
    summary: 'Договаривается об интеграциях и рекламе с блогерами, инфлюенсерами и лидерами мнений.',
    why: 'Организует рекламные интеграции для роста продаж (Enterprising) через сложные дружеские коммуникации со специфическими блогерами (Social/Artistic).',
    skills: {
      hard: ['Закупка рекламы у блогеров', 'Контроль ТЗ рекламы', 'Оценка блогерской накрутки', 'Составление договоров'],
      soft: ['Навыки переговоров', 'Обаяние', 'Стрессоустойчивость']
    },
    demand: 'high',
    skillFormula: ['Блогерские интеграции', 'Переговоры', 'Контроль ТЗ'],
    transferableTo: ['PR-менеджер', 'SMM-стратег', 'Event-менеджер']
  },

  // 9. Управление и бизнес-консалтинг
  {
    id: 'entrepreneur',
    name: 'Предприниматель (Стартапер)',
    industry: 'Управление и бизнес-консалтинг',
    tier: 'everyday',
    archetype: 'entrepreneur',
    riasec: ['Enterprising', 'Artistic', 'Social'],
    gardner: ['Interpersonal', 'Intrapersonal'],
    bigFive: { traits: { Openness: 'high', Extraversion: 'high', Stability: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'universalism', 'power', 'achievement'],
    viaFit: ['kindness', 'social_intelligence', 'teamwork', 'creativity', 'appreciation_of_beauty'],
    subjects: ['Обществознание', 'Математика', 'Русский язык'],
    summary: 'Создает собственный бизнес, нанимает команду, находит инвесторов и берет на себя риски.',
    why: 'Абсолютно доминирующий лидерский импульс (Enterprising) по созданию новых нестандартных продуктов (Artistic) для решения насущных человеческих болей (Social).',
    skills: {
      hard: ['Бизнес-моделирование', 'Привлечение инвестиций', 'Юнит-экономика', 'Управление продажами'],
      soft: ['Толерантность к риску', 'Харизма', 'Стратегическое мышление']
    },
    demand: 'high',
    skillFormula: ['Управление рисками', 'Масштабирование', 'Лидерство'],
    transferableTo: ['Product Manager', 'Бизнес-консультант', 'Инвестор']
  },
  {
    id: 'product-manager',
    name: 'Product-менеджер',
    industry: 'Управление и бизнес-консалтинг',
    tier: 'everyday',
    archetype: 'product-manager',
    riasec: ['Enterprising', 'Investigative', 'Conventional'],
    gardner: ['Interpersonal', 'Logical-Mathematical'],
    bigFive: { traits: { Extraversion: 'high', Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'medium',
    values: ['self_direction', 'achievement', 'power', 'stimulation'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'leadership', 'zest'],
    subjects: ['Математика', 'Обществознание', 'Информатика'],
    summary: 'Отвечает за успех цифрового продукта: определяет его фичи, координирует разработку.',
    why: 'Ведет продукт к росту выручки (Enterprising) на основе CustDev-интервью и анализа продуктовых метрик (Investigative) с приоритизацией бэклога задач (Conventional).',
    skills: {
      hard: ['CustDev (интервью с юзерами)', 'A/B-тестирование', 'Написание ТЗ для ИТ', 'Формирование бэклога (Jira)'],
      soft: ['Лидерство без полномочий', 'Эмпатия к клиенту', 'Умение говорить "нет"']
    },
    demand: 'high',
    skillFormula: ['CustDev', 'Продуктовые метрики', 'Приоритизация'],
    transferableTo: ['Project Manager', 'Предприниматель', 'Бизнес-аналитик']
  },
  {
    id: 'project-manager',
    name: 'Project-менеджер',
    industry: 'Управление и бизнес-консалтинг',
    tier: 'everyday',
    archetype: 'project-manager',
    riasec: ['Enterprising', 'Conventional', 'Social'],
    gardner: ['Interpersonal'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high', Agreeableness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'universalism', 'power', 'achievement'],
    viaFit: ['kindness', 'social_intelligence', 'teamwork', 'leadership', 'zest'],
    subjects: ['Обществознание', 'Математика', 'Русский язык'],
    summary: 'Обеспечивает сдачу проекта в срок, в рамках бюджета и с заданным качеством.',
    why: 'Достижение целей проекта (Enterprising) через строгое ведение графиков Ганта и бюджетов (Conventional) с разрешением внутренних конфликтов исполнителей (Social).',
    skills: {
      hard: ['Методологии Agile/Scrum/Waterfall', 'Управление рисками проекта', 'Планирование бюджетов', 'Работа в MS Project/Asana'],
      soft: ['Организованность', 'Переговоры', 'Контроль дедлайнов']
    },
    demand: 'high',
    skillFormula: ['Scrum-координация', 'Тайм-менеджмент', 'Управление бюджетом'],
    transferableTo: ['Product Manager', 'HR-директор', 'Менеджер по операциям']
  },
  {
    id: 'hr-business-partner',
    name: 'HR-бизнес-партнер',
    industry: 'Управление и бизнес-консалтинг',
    tier: 'everyday',
    archetype: 'hr-business-partner',
    riasec: ['Social', 'Conventional', 'Enterprising'],
    gardner: ['Interpersonal'],
    bigFive: { traits: { Agreeableness: 'high', Extraversion: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'universalism', 'power', 'achievement'],
    viaFit: ['kindness', 'social_intelligence', 'teamwork', 'leadership', 'zest'],
    subjects: ['Обществознание', 'Русский язык', 'Биология'],
    summary: 'Интегрирует HR-процессы (найм, мотивация, обучение) в стратегию бизнес-подразделений.',
    why: 'Помогает топ-менеджерам формировать эффективные команды (Social) с соблюдением трудового права и бюджетов (Conventional) для роста бизнеса (Enterprising).',
    skills: {
      hard: ['Оценка персонала (360/KPI)', 'Трудовое законодательство РФ', 'Управление конфликтами', 'Разработка систем мотивации'],
      soft: ['Дипломатия', 'Эмпатия', 'Стратегическое видение']
    },
    demand: 'high',
    skillFormula: ['Управление персоналом', 'Оценка кадров', 'Медиация'],
    transferableTo: ['Project Manager', 'Карьерный консультант', 'Специалист по внутренним коммуникациям']
  },
  {
    id: 'change-manager',
    name: 'Менеджер по управлению изменениями',
    industry: 'Управление и бизнес-консалтинг',
    tier: 'everyday',
    archetype: 'change-manager',
    riasec: ['Enterprising', 'Social', 'Conventional'],
    gardner: ['Interpersonal', 'Intrapersonal'],
    bigFive: { traits: { Stability: 'high', Extraversion: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'universalism', 'power', 'achievement'],
    viaFit: ['kindness', 'social_intelligence', 'teamwork', 'leadership', 'zest'],
    subjects: ['Обществознание', 'Иностранный язык', 'Русский язык'],
    summary: 'Помогает сотрудникам компаний безболезненно переходить на новое ПО или организационную структуру.',
    why: 'Лидирует реформы в бизнесе (Enterprising), снижая психологическое сопротивление работников через эмпатичное обучение (Social) и планирование шагов адаптации (Conventional).',
    skills: {
      hard: ['Методология ADKAR', 'Анализ стейкхолдеров', 'Построение планов обучения', 'Внутренний PR реформ'],
      soft: ['Стрессоустойчивость', 'Эмпатия', 'Фасилитация встреч']
    },
    demand: 'medium',
    skillFormula: ['Преодоление сопротивления', 'Фасилитация', 'Проектирование обучения'],
    transferableTo: ['HR-бизнес-партнер', 'Бизнес-консультант', 'Project Manager']
  },
  {
    id: 'management-consultant',
    name: 'Бизнес-консультант',
    industry: 'Управление и бизнес-консалтинг',
    tier: 'everyday',
    archetype: 'management-consultant',
    riasec: ['Enterprising', 'Investigative', 'Conventional'],
    gardner: ['Logical-Mathematical', 'Interpersonal'],
    bigFive: { traits: { Extraversion: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['self_direction', 'achievement', 'power', 'stimulation'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'leadership', 'zest'],
    subjects: ['Математика', 'Иностранный язык', 'Обществознание'],
    summary: 'Проводит аудит компаний, находит слабые места и дает рекомендации по росту эффективности.',
    why: 'Помогает собственникам масштабировать прибыль (Enterprising) на основе глубокого исследования финансовых моделей и бизнес-процессов (Investigative/Conventional).',
    skills: {
      hard: ['Финансовое моделирование', 'Анализ рынка (TAM/SAM)', 'Подготовка презентаций для инвесторов', 'Реинжиниринг процессов'],
      soft: ['Структурная речь', 'Аналитическое мышление', 'Презентационные навыки']
    },
    demand: 'high',
    skillFormula: ['Бизнес-аудит', 'Оптимизация процессов', 'Анализ рынков'],
    transferableTo: ['Финансовый директор', 'Product Manager', 'Стратег']
  },

  // 10. Финансовые технологии и инвестиции
  {
    id: 'financial-analyst',
    name: 'Финансовый аналитик',
    industry: 'Финансовые технологии и инвестиции',
    tier: 'everyday',
    archetype: 'financial-analyst',
    riasec: ['Conventional', 'Investigative', 'Enterprising'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'power', 'stimulation'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'leadership', 'zest'],
    subjects: ['Математика', 'Обществознание', 'Русский язык'],
    summary: 'Оценивает финансовое состояние компаний, строит прогнозы денежных потоков.',
    why: 'Скрупулезный разбор бухгалтерской отчетности и бюджетов (Conventional) служит целям поиска выгодных акций для инвестиций (Investigative/Enterprising).',
    skills: {
      hard: ['Финансовый учет (РСБУ/МСФО)', 'Excel (ВПР/Сводные таблицы)', 'Оценка стоимости компаний (DCF)', 'Макроэкономический анализ'],
      soft: ['Внимательность к деталям', 'Усидчивость', 'Синтез информации']
    },
    demand: 'high',
    skillFormula: ['Финансовый учет', 'Прогнозирование денежных потоков', 'Оценка рисков'],
    transferableTo: ['Риск-менеджер', 'Бизнес-аналитик', 'Инвестиционный банкир']
  },
  {
    id: 'crypto-trader',
    name: 'Криптотрейдер / Портфельный менеджер',
    industry: 'Финансовые технологии и инвестиции',
    tier: 'dream',
    archetype: 'crypto-trader',
    riasec: ['Enterprising', 'Investigative', 'Conventional'],
    gardner: ['Logical-Mathematical', 'Intrapersonal'],
    bigFive: { traits: { Stability: 'high', Openness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'power', 'stimulation'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'leadership', 'zest'],
    subjects: ['Математика', 'Информатика', 'Русский язык'],
    summary: 'Занимается спекулятивной торговлей криптовалютами и управляет цифровыми активами.',
    why: 'Стремление заработать на высокой волатильности крипторынка (Enterprising) требует постоянного технического анализа графиков (Investigative/Conventional).',
    skills: {
      hard: ['Технический анализ графиков', 'Управление рисками (Stop Loss)', 'Торговля деривативами', 'Понимание DeFi-протоколов'],
      soft: ['Железная дисциплина', 'Эмоциональный самоконтроль', 'Быстрое принятие решений']
    },
    demand: 'medium',
    skillFormula: ['Технический анализ', 'DeFi-финансы', 'Самоконтроль'],
    transferableTo: ['Финансовый аналитик', 'Риск-менеджер', 'Трейдер фондового рынка']
  },
  {
    id: 'fintech-developer',
    name: 'Разработчик финтех-продуктов',
    industry: 'Финансовые технологии и инвестиции',
    tier: 'future',
    archetype: 'fintech-developer',
    riasec: ['Investigative', 'Realistic', 'Conventional'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'power', 'stimulation'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Математика', 'Информатика', 'Русский язык'],
    summary: 'Создает программный код банковских приложений, платежных шлюзов.',
    why: 'Программирует высоконагруженные транзакционные системы (Realistic) со сверхжестким соблюдением стандартов банковской безопасности (Conventional).',
    skills: {
      hard: ['Java/Go', 'Проектирование баз данных', 'PCI DSS стандарты', 'Микросервисная архитектура'],
      soft: ['Ответственность за критические ошибки', 'Внимательность', 'Аналитичность']
    },
    demand: 'high',
    skillFormula: ['Банковские транзакции', 'Безопасность транзакций', 'Алгоритмы'],
    transferableTo: ['Backend-разработчик', 'Blockchain-инженер', 'Специалист по кибербезопасности']
  },
  {
    id: 'risk-manager',
    name: 'Риск-менеджер',
    industry: 'Финансовые технологии и инвестиции',
    tier: 'everyday',
    archetype: 'risk-manager',
    riasec: ['Conventional', 'Investigative', 'Enterprising'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'power', 'stimulation'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'leadership', 'zest'],
    subjects: ['Математика', 'Информатика', 'Русский язык'],
    summary: 'Оценивает кредитные, рыночные и операционные риски для предотвращения банкротства банка.',
    why: 'Контролирует соблюдение нормативов достаточности капитала (Conventional) на основе математического стресс-тестирования моделей рисков (Investigative).',
    skills: {
      hard: ['Стресс-тестирование (VaR)', 'Математическая статистика', 'Базельские соглашения', 'Python/SQL'],
      soft: ['Принципиальность', 'Педантичность', 'Устойчивость к давлению']
    },
    demand: 'high',
    skillFormula: ['Стресс-тестирование рисков', 'Математическое моделирование', 'Педантичность'],
    transferableTo: ['Финансовый аналитик', 'Аудитор', 'Compliance-офицер']
  },
  {
    id: 'wealth-advisor',
    name: 'Финансовый советник',
    industry: 'Финансовые технологии и инвестиции',
    tier: 'everyday',
    archetype: 'wealth-advisor',
    riasec: ['Social', 'Conventional', 'Enterprising'],
    gardner: ['Interpersonal', 'Logical-Mathematical'],
    bigFive: { traits: { Agreeableness: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['benevolence', 'universalism', 'self_direction', 'achievement'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'kindness', 'social_intelligence'],
    subjects: ['Обществознание', 'Математика', 'Русский язык'],
    summary: 'Помогает частным клиентам составлять личные инвестиционные портфели.',
    why: 'Сочетает заботу о благосостоянии семьи клиента (Social) со строгим подбором надежных инструментов по лимитам риска (Conventional/Enterprising).',
    skills: {
      hard: ['Конструирование инвест-портфелей', 'Налогообложение физлиц', 'Анализ ПИФов/Акций/Облигаций', 'Продажи финансовых услуг'],
      soft: ['Эмпатия', 'Конфиденциальность', 'Навык простых объяснений сложных вещей']
    },
    demand: 'medium',
    skillFormula: ['Семейные инвестиции', 'Личное финансовое планирование', 'Эмпатия к клиенту'],
    transferableTo: ['Финансовый аналитик', 'Страховой брокер', 'Карьерный консультант']
  },

  // 11. Дизайн и креативные индустрии
  {
    id: 'ux-ui-designer',
    name: 'UX/UI-дизайнер',
    industry: 'Дизайн и креативные индустрии',
    tier: 'everyday',
    archetype: 'ux-ui-designer',
    riasec: ['Artistic', 'Investigative', 'Conventional'],
    gardner: ['Spatial-Visual', 'Interpersonal'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'creativity', 'appreciation_of_beauty'],
    subjects: ['Математика', 'Информатика', 'Русский язык'],
    summary: 'Проектирует удобные и красивые интерфейсы сайтов и мобильных приложений.',
    why: 'Креативное оформление экранов (Artistic) опирается на исследование поведения пользователей (Investigative) и создание строгой UI-системы компонентов (Conventional).',
    skills: {
      hard: ['Figma/Auto-layout', 'Проектирование пользовательских сценариев (CJM)', 'Прототипирование', 'Гайдлайны iOS/Android'],
      soft: ['Эмпатия к пользователю', 'Конструктивный прием критики', 'Системное видение']
    },
    demand: 'high',
    skillFormula: ['Эргономика экранов', 'Интерфейсы Figma', 'Тестирование юзабилити'],
    transferableTo: ['Frontend-разработчик', 'Продуктовый исследователь', 'Графический дизайнер']
  },
  {
    id: '3d-modeller',
    name: '3D-моделлер (Художник окружения)',
    industry: 'Дизайн и креативные индустрии',
    tier: 'everyday',
    archetype: '3d-modeller',
    riasec: ['Artistic', 'Realistic', 'Investigative'],
    gardner: ['Spatial-Visual'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'stimulation'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'creativity', 'appreciation_of_beauty'],
    subjects: ['Литература', 'Информатика', 'Русский язык'],
    summary: 'Создает трехмерные модели персонажей, окружения и текстуры для видеоигр и кино.',
    why: 'Художественное творчество и создание форм (Artistic) реализуется через технические инструменты скульптинга (Realistic) и знание анатомии (Investigative).',
    skills: {
      hard: ['Blender/Maya/ZBrush', 'Substance Painter (текстурирование)', 'Оптимизация сетки (Ретопология)', 'Рендеринг'],
      soft: ['Усидчивость', 'Пространственное воображение', 'Внимательность']
    },
    demand: 'high',
    skillFormula: ['3D-скульптинг', 'Ретопология сеток', 'Пространственная геометрия'],
    transferableTo: ['Геймдизайнер', 'Архитектор виртуальных миров', 'Промышленный дизайнер']
  },
  {
    id: 'game-designer',
    name: 'Геймдизайнер',
    industry: 'Дизайн и креативные индустрии',
    tier: 'everyday',
    archetype: 'game-designer',
    riasec: ['Artistic', 'Investigative', 'Enterprising'],
    gardner: ['Spatial-Visual', 'Logical-Mathematical', 'Linguistic'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'power', 'stimulation'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'creativity', 'appreciation_of_beauty'],
    subjects: ['Информатика', 'Литература', 'Русский язык'],
    summary: 'Придумывает правила игры, балансирует экономику, координирует команду.',
    why: 'Творческое создание игровых миров (Artistic) требует математических расчетов баланса (Investigative) для вовлечения игроков и коммерческого успеха (Enterprising).',
    skills: {
      hard: ['Написание дизайн-документов', 'Математический баланс игр', 'Прототипирование в Unity/Unreal Engine', 'Игровая аналитика'],
      soft: ['Широкий игровой кругозор', 'Командное лидерство', 'Эмпатия к игрокам']
    },
    demand: 'high',
    skillFormula: ['Игровая механика', 'Математический баланс', 'Игровая психология'],
    transferableTo: ['Сценарист видеоигр', 'Product Manager', 'Методолог онлайн-обучения']
  },
  {
    id: 'graphic-designer',
    name: 'Графический дизайнер',
    industry: 'Дизайн и креативные индустрии',
    tier: 'everyday',
    archetype: 'graphic-designer',
    riasec: ['Artistic', 'Enterprising', 'Social'],
    gardner: ['Spatial-Visual'],
    bigFive: { traits: { Openness: 'high' } },
    cognitiveDemand: 'high',
    values: ['benevolence', 'universalism', 'self_direction', 'achievement'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'kindness', 'social_intelligence'],
    subjects: ['Литература', 'Обществознание', 'Русский язык'],
    summary: 'Разрабатывает логотипы, фирменные стили компаний, афиши и полиграфию. Рутинную часть работы всё активнее берут на себя генеративные нейросети, поэтому центр профессии смещается к бренд-стратегии и арт-дирекшну.',
    why: 'Эстетическое самовыражение (Artistic) нацелено на решение коммерческих задач брендинга заказчика (Enterprising) с учетом визуального комфорта людей (Social). Устойчивая ниша — не «нарисовать макет» (это автоматизируется), а придумать визуальную систему бренда и управлять ею.',
    skills: {
      hard: ['Adobe Photoshop/Illustrator/InDesign', 'Типографика и шрифты', 'Генеративные алгоритмы-инструменты (Midjourney/Firefly)', 'Айдентика и дизайн-системы'],
      soft: ['Визуальная эмпатия', 'Креативность', 'Переговоры с клиентами']
    },
    demand: 'medium',
    skillFormula: ['Типографика', 'Айдентика бренда', 'Композиция'],
    transferableTo: ['UX/UI-дизайнер', 'Арт-директор', 'Бренд-менеджер', 'Иллюстратор']
  },
  {
    id: 'vr-designer',
    name: 'Архитектор виртуальных миров (VR/AR)',
    industry: 'Дизайн и креативные индустрии',
    tier: 'future',
    archetype: 'vr-designer',
    riasec: ['Artistic', 'Investigative', 'Realistic'],
    gardner: ['Spatial-Visual', 'Logical-Mathematical'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'stimulation'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'creativity', 'appreciation_of_beauty'],
    subjects: ['Информатика', 'Литература', 'Русский язык'],
    summary: 'Проектирует иммерсивные пространства и трехмерный пользовательский опыт.',
    why: 'Создание виртуальных миров без ограничений (Artistic) требует сложного пространственного программирования и моделирования (Investigative/Realistic).',
    skills: {
      hard: ['Разработка под Unity (VR/AR)', 'Проектирование 3D-интерфейсов (Spatial UI)', 'С++ в Unreal Engine', 'Оптимизация производительности VR'],
      soft: ['Визионерство', 'Системность мышления', 'Быстрое обучение новому']
    },
    demand: 'medium',
    skillFormula: ['Иммерсивный UX', 'Spatial UI (пространственный UI)', '3D-движки'],
    transferableTo: ['3D-моделлер', 'Геймдизайнер', 'Проектировщик умных городов']
  },
  {
    id: 'digital-fashion-designer',
    name: 'Цифровой модельер',
    industry: 'Дизайн и креативные индустрии',
    tier: 'everyday',
    archetype: 'digital-fashion-designer',
    riasec: ['Artistic', 'Enterprising'],
    gardner: ['Spatial-Visual'],
    bigFive: { traits: { Openness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'power', 'stimulation'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'creativity', 'appreciation_of_beauty'],
    subjects: ['Литература', 'Обществознание', 'Русский язык'],
    summary: 'Создает цифровую одежду для аватаров, виртуальных примерочных и цифровых показов.',
    why: 'Создает фантазийные наряды в 3D (Artistic) с прицелом на коммерциализацию и продвижение брендов одежды (Enterprising).',
    skills: {
      hard: ['CLO 3D/Marvelous Designer', 'Моделирование выкроек одежды', 'Текстурирование тканей', '3D-рендеринг одежды'],
      soft: ['Чувство стиля', 'Слежение за модой', 'Креативность']
    },
    demand: 'medium',
    skillFormula: ['Цифровой крой одежды', '3D-Marvelous Designer', 'Визуальный стиль'],
    transferableTo: ['Дизайнер одежды (физический)', '3D-моделлер', 'Графический дизайнер']
  },

  // 12. Медиа, блогинг и контент-производство
  {
    id: 'copywriter',
    name: 'Копирайтер',
    industry: 'Медиа, блогинг и контент-производство',
    tier: 'everyday',
    archetype: 'copywriter',
    riasec: ['Artistic', 'Social', 'Enterprising'],
    gardner: ['Linguistic'],
    bigFive: { traits: { Openness: 'high', Agreeableness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'universalism', 'power', 'achievement'],
    viaFit: ['kindness', 'social_intelligence', 'teamwork', 'creativity', 'appreciation_of_beauty'],
    subjects: ['Русский язык', 'Литература', 'Обществознание'],
    summary: 'Пишет продающие статьи, посты для соцсетей и тексты для сайтов.',
    why: 'Творческое владение словом (Artistic) направлено на понятное информирование людей (Social) и побуждение к покупке (Enterprising).',
    skills: {
      hard: ['Информационный стиль (Главред)', 'Написание SEO-текстов', 'Маркетинговый копирайтинг', 'Редактура'],
      soft: ['Грамотность', 'Эмпатия к читателю', 'Пунктуальность']
    },
    demand: 'high',
    skillFormula: ['Текстовые воронки', 'Инфостиль', 'Редактура'],
    transferableTo: ['SMM-стратег', 'PR-менеджер', 'Сценарист видеоигр']
  },
  {
    id: 'podcaster',
    name: 'Подкастер (Интервьюер)',
    industry: 'Медиа, блогинг и контент-производство',
    tier: 'everyday',
    archetype: 'podcaster',
    riasec: ['Social', 'Artistic', 'Enterprising'],
    gardner: ['Interpersonal', 'Linguistic'],
    bigFive: { traits: { Extraversion: 'high', Agreeableness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'universalism', 'power', 'achievement'],
    viaFit: ['kindness', 'social_intelligence', 'teamwork', 'creativity', 'appreciation_of_beauty'],
    subjects: ['Русский язык', 'Литература', 'История'],
    summary: 'Записывает подкасты, берет интервью и развивает свой медийный проект.',
    why: 'Выстраивание глубокого диалога с гостем (Social) требует творческого конструирования драматургии беседы (Artistic) и монетизации шоу (Enterprising).',
    skills: {
      hard: ['Техника речи и риторика', 'Сценарная драматургия', 'Настройка аудиозаписи (микрофоны)', 'Монтаж аудио'],
      soft: ['Эмпатия', 'Обаяние', 'Умение разговорить человека']
    },
    demand: 'medium',
    skillFormula: ['Искусство интервью', 'Риторика', 'Драматургия беседы'],
    transferableTo: ['PR-менеджер', 'Научный журналист', 'Коуч']
  },
  {
    id: 'narrative-designer',
    name: 'Сценарист игр (Нарративный дизайнер)',
    industry: 'Медиа, блогинг и контент-производство',
    tier: 'everyday',
    archetype: 'narrative-designer',
    riasec: ['Artistic', 'Investigative', 'Enterprising'],
    gardner: ['Linguistic', 'Spatial-Visual'],
    bigFive: { traits: { Openness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['self_direction', 'achievement', 'power', 'stimulation'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'creativity', 'appreciation_of_beauty'],
    subjects: ['Литература', 'Русский язык', 'Обществознание'],
    summary: 'Пишет сюжет видеоигр, диалоги персонажей и интегрирует историю в геймплей.',
    why: 'Литературное творчество (Artistic) сочетается с необходимостью системно встраивать квесты в логику игровых механик (Investigative).',
    skills: {
      hard: ['Написание интерактивных сценариев', 'Создание лора и персонажей', 'Работа в Twine/Articy:Draft', 'Игровая режиссура'],
      soft: ['Богатая фантазия', 'Аналитичность мышления', 'Командное взаимодействие']
    },
    demand: 'high',
    skillFormula: ['Интерактивный сценарий', 'Лор и персонажи', 'Диалоги'],
    transferableTo: ['Геймдизайнер', 'Копирайтер', 'Сценарист кино']
  },
  {
    id: 'video-editor',
    name: 'Видеомонтажер',
    industry: 'Медиа, блогинг и контент-производство',
    tier: 'everyday',
    archetype: 'video-editor',
    riasec: ['Artistic', 'Realistic', 'Investigative'],
    gardner: ['Spatial-Visual', 'Musical'],
    bigFive: { traits: { Conscientiousness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['self_direction', 'achievement', 'stimulation'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'creativity', 'appreciation_of_beauty'],
    subjects: ['Литература', 'Информатика', 'Русский язык'],
    summary: 'Собирает видеоролики, фильмы или рекламу из отснятых кадров, накладывает музыку и эффекты.',
    why: 'Творческое создание динамики кадра и настроения видео (Artistic) происходит через кропотливую техническую работу в монтажном ПО (Realistic).',
    skills: {
      hard: ['Adobe Premiere/DaVinci Resolve', 'Цветокоррекция видео', 'Монтаж по фазе и звуку', 'Кейинг и базовый VFX'],
      soft: ['Усидчивость', 'Чувство ритма', 'Внимание к микрокадрам']
    },
    demand: 'high',
    skillFormula: ['Монтаж видео Adobe/DaVinci', 'Цветокоррекция', 'Ритмика склеек'],
    transferableTo: ['3D-моделлер', 'Видеооператор', 'Motion-дизайнер']
  },
  {
    id: 'science-journalist',
    name: 'Научный журналист',
    industry: 'Медиа, блогинг и контент-производство',
    tier: 'everyday',
    archetype: 'science-journalist',
    riasec: ['Investigative', 'Artistic', 'Social'],
    gardner: ['Linguistic', 'Logical-Mathematical'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'universalism', 'self_direction', 'achievement'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'kindness', 'social_intelligence'],
    subjects: ['Русский язык', 'Литература', 'Физика'],
    summary: 'Переводит сложные научные статьи на понятный язык в формате блогов или колонок.',
    why: 'Разбор сложных научных публикаций (Investigative) трансформируется в захватывающие научно-популярные статьи (Artistic) для просвещения людей (Social).',
    skills: {
      hard: ['Популяризация науки', 'Анализ зарубежных научных журналов', 'Фактчекинг', 'Написание лонгридов'],
      soft: ['Критическое мышление', 'Грамотность', 'Любознательность']
    },
    demand: 'medium',
    skillFormula: ['Популяризация науки', 'Фактчекинг', 'Лонгриды'],
    transferableTo: ['Копирайтер', 'Подкастер', 'Тьютор']
  },

  // 13. Образование и EdTech
  {
    id: 'edtech-methodologist',
    name: 'Методолог онлайн-обучения',
    industry: 'Образование и EdTech',
    tier: 'everyday',
    archetype: 'edtech-methodologist',
    riasec: ['Social', 'Investigative', 'Artistic'],
    gardner: ['Interpersonal', 'Linguistic'],
    bigFive: { traits: { Agreeableness: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'universalism', 'self_direction', 'achievement'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'kindness', 'social_intelligence'],
    subjects: ['Обществознание', 'Русский язык', 'Биология'],
    summary: 'Проектирует структуру онлайн-курсов, домашних заданий и следит за доходимостью учеников.',
    why: 'Помогает студентам эффективно усваивать знания (Social) на основе педагогического проектирования уроков (Investigative) с элементами интерактива (Artistic).',
    skills: {
      hard: ['Педагогический дизайн (ADDIE/Instructional Design)', 'Разработка образовательных треков', 'Метрики обучения (COR/NPS)', 'Разработка лонгридов'],
      soft: ['Эмпатия к учащимся', 'Системное мышление', 'Методичность']
    },
    demand: 'high',
    skillFormula: ['Педдизайн ADDIE', 'Доходимость обучения COR', 'Образовательные треки'],
    transferableTo: ['Тьютор', 'HR-специалист (обучение персонала)', 'Геймдизайнер']
  },
  {
    id: 'career-guidance-tutor',
    name: 'Тьютор / Профориентолог',
    industry: 'Образование и EdTech',
    tier: 'everyday',
    archetype: 'career-counselor',
    riasec: ['Social', 'Investigative', 'Artistic'],
    gardner: ['Interpersonal', 'Intrapersonal'],
    bigFive: { traits: { Agreeableness: 'high', Extraversion: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'universalism', 'self_direction', 'achievement'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'kindness', 'social_intelligence'],
    subjects: ['Обществознание', 'Русский язык', 'Биология'],
    summary: 'Помогает подросткам осознать свои сильные стороны и составить план выбора профессии.',
    why: 'Направляет и поддерживает подростка в сложный момент самоопределения (Social) на основе глубокого анализа его личности (Investigative).',
    skills: {
      hard: ['Профориентационные методики', 'Карьерное консультирование', 'Инструменты рефлексии', 'Анализ вузов и ЕГЭ'],
      soft: ['Эмпатия', 'Безоценочное принятие', 'Умение задавать сильные вопросы']
    },
    demand: 'high',
    skillFormula: ['Профориентационная диагностика', 'Построение траекторий развития', 'Безоценочная поддержка'],
    transferableTo: ['Семейный психотерапеат', 'Методолог онлайн-обучения', 'Карьерный консультант']
  },
  {
    id: 'programming-teacher',
    name: 'Преподаватель программирования',
    industry: 'Образование и EdTech',
    tier: 'everyday',
    archetype: 'programming-teacher',
    riasec: ['Social', 'Investigative', 'Realistic'],
    gardner: ['Interpersonal', 'Logical-Mathematical'],
    bigFive: { traits: { Agreeableness: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'universalism', 'self_direction', 'achievement'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'kindness', 'social_intelligence'],
    subjects: ['Математика', 'Информатика', 'Русский язык'],
    summary: 'Обучает школьников или взрослых написанию кода, алгоритмам и командной разработке.',
    why: 'Понятно объясняет абстрактный синтаксис языков программирования (Social/Investigative) через выполнение практических ИТ-проектов (Realistic).',
    skills: {
      hard: ['Python/Scratch/JavaScript', 'Методика преподавания ИТ', 'Алгоритмы', 'Проведение вебинаров'],
      soft: ['Ангельское терпение', 'Любовь к ученикам', 'Навыки объяснения "на пальцах"']
    },
    demand: 'high',
    skillFormula: ['Обучение программированию', 'Алгоритмика', 'Педагогика ИТ'],
    transferableTo: ['Frontend-разработчик', 'Методолог онлайн-обучения', 'Тьютор']
  },
  {
    id: 'game-pedagogue',
    name: 'Игропедагог (Игропрактик)',
    industry: 'Образование и EdTech',
    tier: 'everyday',
    archetype: 'game-pedagogue',
    riasec: ['Social', 'Artistic', 'Enterprising'],
    gardner: ['Interpersonal', 'Spatial-Visual'],
    bigFive: { traits: { Extraversion: 'high', Agreeableness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'universalism', 'power', 'achievement'],
    viaFit: ['kindness', 'social_intelligence', 'teamwork', 'creativity', 'appreciation_of_beauty'],
    subjects: ['Обществознание', 'Литература', 'Русский язык'],
    summary: 'Проводит обучение школьников сложным предметам через настольные или деловые игры.',
    why: 'Обучает детей в учебном процессе (Social) через творческое создание игровых механик уроков (Artistic) и управление групповой динамикой (Enterprising).',
    skills: {
      hard: ['Разработка учебных настольных/ролевых игр', 'Игрофикация образования', 'Модерация групповых процессов', 'Возрастная психология'],
      soft: ['Высокая энергетика', 'Актерское мастерство', 'Эмпатия']
    },
    demand: 'medium',
    skillFormula: ['Игропрактика', 'Игрофикация', 'Групповая модерация'],
    transferableTo: ['Геймдизайнер', 'Методолог онлайн-обучения', 'Тьютор']
  },
  {
    id: 'online-lecturer',
    name: 'Онлайн-учитель / Лектор',
    industry: 'Образование и EdTech',
    tier: 'everyday',
    archetype: 'online-lecturer',
    riasec: ['Social', 'Enterprising', 'Conventional'],
    gardner: ['Interpersonal', 'Linguistic'],
    bigFive: { traits: { Extraversion: 'high', Agreeableness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'universalism', 'power', 'achievement'],
    viaFit: ['kindness', 'social_intelligence', 'teamwork', 'leadership', 'zest'],
    subjects: ['Обществознание', 'Русский язык', 'Иностранный язык'],
    summary: 'Проводит вебинары и лекции для широкой аудитории учеников на онлайн-платформах.',
    why: 'Передает знания аудитории (Social), удерживая внимание перед камерой (Enterprising) и следуя структуре лекции (Conventional).',
    skills: {
      hard: ['Работа на камеру', 'Вебинарные платформы', 'Подготовка презентаций', 'Риторика'],
      soft: ['Харизма', 'Энергичность', 'Стрессоустойчивость']
    },
    demand: 'high',
    skillFormula: ['Вебинары', 'Риторика', 'Работа на камеру'],
    transferableTo: ['Тьютор', 'PR-менеджер', 'Подкастер']
  },

  // 14. Психология и ментальное здоровье
  {
    id: 'family-therapist',
    name: 'Семейный психотерапевт',
    industry: 'Психология и ментальное здоровье',
    tier: 'everyday',
    archetype: 'psychotherapist',
    riasec: ['Social', 'Investigative', 'Artistic'],
    gardner: ['Interpersonal', 'Intrapersonal'],
    bigFive: { traits: { Agreeableness: 'high', Stability: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'universalism', 'self_direction', 'achievement'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'kindness', 'social_intelligence'],
    subjects: ['Биология', 'Обществознание', 'Русский язык'],
    summary: 'Помогает семейным парам и родителям с детьми разрешать психологические конфликты.',
    why: 'Помогает людям выстраивать гармоничные отношения (Social) на основе выявления причин семейных обид и кризисов (Investigative).',
    skills: {
      hard: ['Системная семейная психотерапия', 'Кризисная интервенция', 'Клиническая психология', 'Консультирование родителей'],
      soft: ['Нейтральность', 'Сверх-эмпатия', 'Эмоциональная устойчивость']
    },
    demand: 'high',
    skillFormula: ['Семейная психотерапия', 'Разрешение конфликтов', 'Клинический анализ'],
    transferableTo: ['Тьютор', 'Коуч', 'HR-специалист (медиатор)']
  },
  {
    id: 'executive-coach',
    name: 'Коуч по личной эффективности',
    industry: 'Психология и ментальное здоровье',
    tier: 'everyday',
    archetype: 'executive-coach',
    riasec: ['Social', 'Artistic', 'Enterprising'],
    gardner: ['Interpersonal', 'Intrapersonal'],
    bigFive: { traits: { Extraversion: 'high', Stability: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'universalism', 'power', 'achievement'],
    viaFit: ['kindness', 'social_intelligence', 'teamwork', 'creativity', 'appreciation_of_beauty'],
    subjects: ['Обществознание', 'Биология', 'Русский язык'],
    summary: 'Помогает предпринимателям находить баланс жизни и бизнеса, достигать карьерных целей.',
    why: 'Поддерживает клиента (Social) в формулировании его целей и ценностей (Artistic) для совершения прорывных действий в бизнесе (Enterprising).',
    skills: {
      hard: ['Коучинговые вопросы (ICF)', 'Управление личной эффективностью', 'Проектирование баланса сфер жизни', 'Карьерное планирование'],
      soft: ['Безусловная вера в потенциал', 'Умение держать паузу', 'Конфиденциальность']
    },
    demand: 'medium',
    skillFormula: ['Коучинг ICF', 'Целеполагание', 'Развитие осознанности'],
    transferableTo: ['Карьерный консультант', 'HR-бизнес-партнер', 'Тьютор']
  },
  {
    id: 'rehabilitation-specialist',
    name: 'Кинезиотерапевт (Реабилитолог)',
    industry: 'Психология и ментальное здоровье',
    tier: 'everyday',
    archetype: 'rehabilitation-specialist',
    riasec: ['Realistic', 'Social', 'Investigative'],
    gardner: ['Bodily-Kinesthetic', 'Interpersonal'],
    bigFive: { traits: { Agreeableness: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'universalism', 'self_direction', 'achievement'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'kindness', 'social_intelligence'],
    subjects: ['Биология', 'Физика', 'Русский язык'],
    summary: 'Помогает пациентам восстанавливать двигательные функции тела после травм или операций.',
    why: 'Проводит физическую работу с телом больного (Realistic) с целью вернуть его к полноценной жизни в социуме (Social).',
    skills: {
      hard: ['Лечебная физкультура (ЛФК)', 'Кинезиотейпирование', 'Анатомия и физиология движений', 'Работа на тренажерах реабилитации'],
      soft: ['Терпение и упорство', 'Эмпатия к боли', 'Физическая выносливость']
    },
    demand: 'high',
    skillFormula: ['Кинезиотерапия', 'Реабилитационный массаж', 'Анатомия двигательной системы'],
    transferableTo: ['Хирург', 'Персональный фитнес-коуч', 'Детский ортопед']
  },
  {
    id: 'art-therapist',
    name: 'Арт-терапевт',
    industry: 'Психология и ментальное здоровье',
    tier: 'everyday',
    archetype: 'art-therapist',
    riasec: ['Artistic', 'Social'],
    gardner: ['Spatial-Visual', 'Interpersonal'],
    bigFive: { traits: { Openness: 'high', Agreeableness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'universalism', 'self_direction', 'stimulation'],
    viaFit: ['kindness', 'social_intelligence', 'teamwork', 'creativity', 'appreciation_of_beauty'],
    subjects: ['Литература', 'Биология', 'Русский язык'],
    summary: 'Помогает клиентам прорабатывать психологические проблемы через рисование, лепку, музыку.',
    why: 'Использует творчество как лечебный инструмент выражения бессознательного (Artistic) для психологической помощи людям (Social).',
    skills: {
      hard: ['Арт-терапевтические методики', 'Изотерапия и сказкотерапия', 'Интерпретация проективных рисунков', 'Психокоррекция'],
      soft: ['Креативность', 'Безоценочность', 'Мягкое ведение клиента']
    },
    demand: 'medium',
    skillFormula: ['Изотерапия', 'Проективный анализ рисунков', 'Снятие тревоги'],
    transferableTo: ['Семейный психотерапевт', 'Графический дизайнер', 'Игропедагог']
  },
  {
    id: 'career-consultant',
    name: 'Карьерный консультант',
    industry: 'Психология и ментальное здоровье',
    tier: 'everyday',
    archetype: 'career-counselor',
    riasec: ['Social', 'Enterprising', 'Conventional'],
    gardner: ['Interpersonal', 'Intrapersonal'],
    bigFive: { traits: { Agreeableness: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'universalism', 'power', 'achievement'],
    viaFit: ['kindness', 'social_intelligence', 'teamwork', 'leadership', 'zest'],
    subjects: ['Обществознание', 'Русский язык', 'Иностранный язык'],
    summary: 'Помогает составить резюме, подготовиться к собеседованию и составить план смены работы.',
    why: 'Помогает соискателю найти подходящую вакансию (Social) с учетом его зарплатных целей (Enterprising) и правил оформления резюме (Conventional).',
    skills: {
      hard: ['Аудит и составление резюме', 'Подготовка к собеседованию (Mock-интервью)', 'Анализ рынка труда (HeadHunter)', 'Карьерное планирование'],
      soft: ['Структурированность', 'Убедительность', 'Эмпатия']
    },
    demand: 'high',
    skillFormula: ['Аудит резюме HH', 'Mock-интервью', 'Карьерный трек'],
    transferableTo: ['HR-бизнес-партнер', 'Тьютор', 'Коуч']
  },

  // 15. Юриспруденция, право и безопасность
  {
    id: 'it-lawyer',
    name: 'Юрист в сфере IT и интеллектуальной собственности',
    industry: 'Юриспруденция, право и безопасность',
    tier: 'everyday',
    archetype: 'it-lawyer',
    riasec: ['Enterprising', 'Investigative', 'Conventional'],
    gardner: ['Linguistic', 'Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'power', 'stimulation'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'leadership', 'zest'],
    subjects: ['Обществознание', 'История', 'Русский язык'],
    summary: 'Защищает интеллектуальные права на программы, товарные знаки, составляет лицензионные соглашения.',
    why: 'Представляет интересы ИТ-компаний в судах (Enterprising), глубоко анализируя юридические детали и договоры (Investigative/Conventional).',
    skills: {
      hard: ['Авторское право и лицензии', 'Составление NDA/EULA', 'Товарные знаки и патенты', 'Представительство в судах'],
      soft: ['Юридическая логика', 'Внимание к формулировкам договоров', 'Навыки дебатов']
    },
    demand: 'high',
    skillFormula: ['Интеллектуальная собственность', 'NDA/EULA лицензии', 'Юридический анализ'],
    transferableTo: ['Compliance-офицер', 'DPO', 'Международный адвокат']
  },
  {
    id: 'data-protection-officer',
    name: 'Специалист по защите персональных данных (DPO)',
    industry: 'Юриспруденция, право и безопасность',
    tier: 'everyday',
    archetype: 'data-protection-officer',
    riasec: ['Conventional', 'Enterprising', 'Investigative'],
    gardner: ['Logical-Mathematical', 'Linguistic'],
    bigFive: { traits: { Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'power', 'stimulation'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'leadership', 'zest'],
    subjects: ['Обществознание', 'Информатика', 'Русский язык'],
    summary: 'Следит за тем, чтобы сбор и хранение данных пользователей соответствовали законам.',
    why: 'Жесткий контроль соблюдения законов о приватности данных (Conventional) предотвращает штрафы и спасает репутацию бизнеса (Enterprising).',
    skills: {
      hard: ['Закон ФЗ-152 / GDPR', 'Аудит баз данных', 'Составление политик конфиденциальности', 'Взаимодействие с Роскомнадзором'],
      soft: ['Педантичность', 'Принципиальность', 'Системное видение']
    },
    demand: 'high',
    skillFormula: ['Конфиденциальность GDPR/ФЗ-152', 'Аудит баз данных', 'Правовой комплаенс'],
    transferableTo: ['IT-юрист', 'Инженер информационной безопасности', 'Compliance-офицер']
  },
  {
    id: 'international-advocate',
    name: 'Международный адвокат',
    industry: 'Юриспруденция, право и безопасность',
    tier: 'everyday',
    archetype: 'international-advocate',
    riasec: ['Enterprising', 'Investigative', 'Social'],
    gardner: ['Linguistic', 'Interpersonal'],
    bigFive: { traits: { Extraversion: 'high', Stability: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['benevolence', 'universalism', 'self_direction', 'achievement'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'kindness', 'social_intelligence'],
    subjects: ['Обществознание', 'История', 'Иностранный язык'],
    summary: 'Защищает права граждан и компаний в международных судах и арбитражах.',
    why: 'Ведет судебные процессы и переговоры (Enterprising) с глубоким изучением норм права разных государств (Investigative/Social).',
    skills: {
      hard: ['Международное право', 'Юридический английский (TOLES)', 'Арбитражное судопроизводство', 'Составление исков'],
      soft: ['Харизма', 'Безупречная память', 'Дипломатичность']
    },
    demand: 'medium',
    skillFormula: ['Международное право', 'Юридические споры', 'Юридический английский'],
    transferableTo: ['IT-юрист', 'Медиатор', 'Дипломат']
  },
  {
    id: 'compliance-officer',
    name: 'Комплаенс-офицер',
    industry: 'Юриспруденция, право и безопасность',
    tier: 'everyday',
    archetype: 'compliance-officer',
    riasec: ['Conventional', 'Investigative', 'Enterprising'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'power', 'stimulation'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'leadership', 'zest'],
    subjects: ['Обществознание', 'История', 'Иностранный язык'],
    summary: 'Проверяет внутренние регламенты компании на соответствие законам о борьбе с коррупцией.',
    why: 'Внутренний надзиратель за соблюдением внешних законов (Conventional) для предотвращения юридических и финансовых рисков компании (Enterprising).',
    skills: {
      hard: ['Антикоррупционный комплаенс (FCPA/UKBA)', 'Внутренние расследования инцидентов', 'Антимонопольное право', 'Анализ рисков'],
      soft: ['Принципиальность', 'Педантичность', 'Спокойствие под давлением']
    },
    demand: 'high',
    skillFormula: ['Противодействие коррупции', 'Внутренний аудит', 'Законодательные риски'],
    transferableTo: ['DPO', 'IT-юрист', 'Риск-менеджер']
  },
  {
    id: 'mediator',
    name: 'Медиатор',
    industry: 'Юриспруденция, право и безопасность',
    tier: 'everyday',
    archetype: 'mediator',
    riasec: ['Social', 'Enterprising', 'Conventional'],
    gardner: ['Interpersonal', 'Linguistic'],
    bigFive: { traits: { Agreeableness: 'high', Stability: 'high', Extraversion: 'high' } },
    cognitiveDemand: 'high',
    values: ['benevolence', 'universalism', 'self_direction', 'achievement'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'kindness', 'social_intelligence'],
    subjects: ['Обществознание', 'Русский язык', 'Биология'],
    summary: 'Независимый посредник, помогающий сторонам конфликта договориться без суда.',
    why: 'Помогает людям услышать друг друга и найти компромисс (Social) с заключением законного мирового соглашения (Conventional).',
    skills: {
      hard: ['Техники медиации и переговоров', 'Основы гражданского права', 'Конфликтология', 'Составление мировых соглашений'],
      soft: ['Беспристрастность', 'Олимпийское спокойствие', 'Умение слушать обе стороны']
    },
    demand: 'medium',
    skillFormula: ['Переговоры при спорах', 'Конфликтология', 'Мировые соглашения'],
    transferableTo: ['Семейный психотерапевт', 'HR-бизнес-партнер', 'Международный адвокат']
  },

  // 16. Фундаментальная наука и исследования
  {
    id: 'nuclear-physicist',
    name: 'Физик-ядерщик',
    industry: 'Фундаментальная наука и исследования',
    tier: 'dream',
    archetype: 'nuclear-physicist',
    riasec: ['Investigative', 'Realistic', 'Conventional'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Математика', 'Физика', 'Русский язык'],
    summary: 'Исследует структуру атомного ядра, разрабатывает ядерные реакторы нового типа.',
    why: 'Абстрактный теоретический поиск формул (Investigative) подтверждается экспериментами на сложных физических установках (Realistic/Conventional).',
    skills: {
      hard: ['Квантовая механика', 'Математическое моделирование физических процессов', 'Программирование C++/Python', 'Анализ данных детекторов'],
      soft: ['Научная честность', 'Усидчивость', 'Осторожность и ответственность']
    },
    demand: 'medium',
    skillFormula: ['Квантовая физика', 'Ядерные реакторы', 'Математический анализ'],
    transferableTo: ['Астрофизик', 'Data Scientist', 'Инженер по радиационной безопасности']
  },
  {
    id: 'astrophysicist',
    name: 'Астрофизик',
    industry: 'Фундаментальная наука и исследования',
    tier: 'dream',
    archetype: 'astrophysicist',
    riasec: ['Investigative', 'Realistic', 'Conventional'],
    gardner: ['Logical-Mathematical', 'Spatial-Visual'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Математика', 'Физика', 'Русский язык'],
    summary: 'Изучает физику звезд, черных дыр, галактик и космологию.',
    why: 'Научный анализ тайн Вселенной (Investigative) происходит через обработку цифровых спектров телескопов (Conventional) и 3D-моделирование (Spatial-Visual).',
    skills: {
      hard: ['Астрофизическое моделирование', 'Анализ спектральных данных', 'Python (библиотеки Astropy)', 'Космология'],
      soft: ['Масштабное воображение', 'Научная настойчивость', 'Аналитичность']
    },
    demand: 'low',
    skillFormula: ['Космология', 'Обработка спектров', 'Моделирование галактик'],
    transferableTo: ['Физик-ядерщик', 'Data Scientist', 'Специалист по геоинформационным системам (ГИС)']
  },
  {
    id: 'synthetic-materials-chemist',
    name: 'Химик-синтетик / Материаловед',
    industry: 'Фундаментальная наука и исследования',
    tier: 'dream',
    archetype: 'synthetic-materials-chemist',
    riasec: ['Investigative', 'Realistic', 'Conventional'],
    gardner: ['Logical-Mathematical', 'Naturalist'],
    bigFive: { traits: { Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Химия', 'Физика', 'Математика'],
    summary: 'Синтезирует новые химические вещества, полимеры и материалы.',
    why: 'Научные гипотезы о химической решетке (Investigative) реализуются в практических химических синтезах в лаборатории (Realistic) по регламентам (Conventional).',
    skills: {
      hard: ['Органический/неорганический синтез', 'Спектроскопия (ЯМР/ИК)', 'Материаловедение', 'Хроматография'],
      soft: ['Аккуратность с химреактивами', 'Терпение при долгих реакциях', 'Внимательность']
    },
    demand: 'high',
    skillFormula: ['Химический синтез', 'Спектроскопия ЯМР', 'Материаловедение'],
    transferableTo: ['Биофармаколог', 'Технолог рециклинга', 'Инженер-технолог на производстве']
  },
  {
    id: 'neurobiologist',
    name: 'Нейробиолог',
    industry: 'Фундаментальная наука и исследования',
    tier: 'dream',
    archetype: 'neurobiologist',
    riasec: ['Investigative', 'Realistic', 'Conventional'],
    gardner: ['Logical-Mathematical', 'Naturalist'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Биология', 'Химия', 'Математика'],
    summary: 'Исследует механизмы памяти, эмоций и сна в головном мозге.',
    why: 'Научное изучение устройства мозга (Investigative) требует тончайших препарирований тканей или снятия электроэнцефалограмм (Realistic).',
    skills: {
      hard: ['Электрофизиология (ЭЭГ)', 'Микроскопия срезов мозга', 'Нейрофармакология', 'Python для анализа нейросетей'],
      soft: ['Научная любознательность', 'Хладнокровие', 'Методичность']
    },
    demand: 'high',
    skillFormula: ['Нейробиология', 'ЭЭГ-анализ', 'Микроскопия мозга'],
    transferableTo: ['Биоинформатик', 'Нейрорентгенолог', 'Психотерапевт']
  },
  {
    id: 'sociologist',
    name: 'Социолог / Исследователь общественного мнения',
    industry: 'Фундаментальная наука и исследования',
    tier: 'dream',
    archetype: 'sociologist',
    riasec: ['Investigative', 'Artistic', 'Social'],
    gardner: ['Logical-Mathematical', 'Linguistic'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['benevolence', 'universalism', 'self_direction', 'achievement'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'kindness', 'social_intelligence'],
    subjects: ['Обществознание', 'Математика', 'Русский язык'],
    summary: 'Исследует социальные тренды, проводит опросы населения, анализирует динамику электората.',
    why: 'Научный анализ статистических опросов (Investigative) оформляется в наглядные отчеты (Artistic) и исследует социальную жизнь людей (Social).',
    skills: {
      hard: ['Проведение соцопросов', 'Статистический пакет SPSS/R', 'Качественные методы (фокус-группы)', 'Анализ выборок'],
      soft: ['Объективность', 'Навыки письменных отчетов', 'Коммуникабельность']
    },
    demand: 'medium',
    skillFormula: ['Соцопросы', 'Статистика SPSS/R', 'Качественный анализ'],
    transferableTo: ['UX-исследователь', 'Digital-маркетолог', 'Бизнес-аналитик']
  },

  // 17. Агротехнологии и сити-фермерство
  {
    id: 'city-farmer',
    name: 'Сити-фермер',
    industry: 'Агротехнологии и сити-фермерство',
    tier: 'everyday',
    archetype: 'city-farmer',
    riasec: ['Realistic', 'Investigative', 'Conventional'],
    gardner: ['Naturalist', 'Spatial-Visual'],
    bigFive: { traits: { Conscientiousness: 'high', Openness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Биология', 'География', 'Математика'],
    summary: 'Выращивает зелень и овощи на автоматизированных вертикальных фермах в городах.',
    why: 'Ручной уход за растениями на стеллажах (Realistic) требует контроля уровня питательных растворов и света (Conventional) и оптимизации урожайности (Investigative).',
    skills: {
      hard: ['Гидропоника и аэропоника', 'Настройка фито-света', 'Контроль pH и EC растворов', 'Проектирование стеллажей'],
      soft: ['Трудолюбие', 'Любовь к растениям', 'Изобретательность']
    },
    demand: 'high',
    skillFormula: ['Гидропоника', 'Фито-свет', 'Агрохимия растворов'],
    transferableTo: ['Агроном-генетик', 'Специалист по умному фермерству', 'Эколог-урбанист']
  },
  {
    id: 'smart-agriculture-engineer',
    name: 'Специалист по умному фермерству (IoT в АПК)',
    industry: 'Агротехнологии и сити-фермерство',
    tier: 'everyday',
    archetype: 'smart-agriculture-engineer',
    riasec: ['Realistic', 'Investigative', 'Conventional'],
    gardner: ['Naturalist', 'Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Биология', 'Информатика', 'Русский язык'],
    summary: 'Внедряет датчики влажности, автополив и дроны-сканеры на полях.',
    why: 'Интеграция сенсоров и датчиков на трактора и поля (Realistic) автоматизирует полив и сбор урожая по алгоритмам (Conventional).',
    skills: {
      hard: ['Настройка датчиков влажности/NPK', 'Полетные карты для агродронов', 'Программирование контроллеров полива', 'Агроаналитика'],
      soft: ['Системность', 'Решение технических задач в поле', 'Дисциплина']
    },
    demand: 'high',
    skillFormula: ['Агродроны', 'Сенсоры влажности', 'Полив по расписанию'],
    transferableTo: ['Специалист по интернету вещей (IoT)', 'Сити-фермер', 'Агроном']
  },
  {
    id: 'plant-meat-technologist',
    name: 'Технолог растительного мяса и белков',
    industry: 'Агротехнологии и сити-фермерство',
    tier: 'everyday',
    archetype: 'plant-meat-technologist',
    riasec: ['Investigative', 'Realistic', 'Conventional'],
    gardner: ['Naturalist', 'Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Биология', 'Химия', 'Русский язык'],
    summary: 'Разрабатывает рецептуры и технологии производства мяса и молока из растительных белков.',
    why: 'Научный поиск формулы текстуры растительного белка (Investigative) реализуется на пищевом технологическом оборудовании (Realistic) с соблюдением ГОСТов (Conventional).',
    skills: {
      hard: ['Экструзия белков', 'Химия пищевых добавок', 'Санитарный контроль (HACCP)', 'Органолептический анализ'],
      soft: ['Внимательность к запахам/вкусу', 'Гигиеничность', 'Скрупулезность']
    },
    demand: 'medium',
    skillFormula: ['Экструзия белков', 'Пищевые ГОСТы HACCP', 'Органолептика'],
    transferableTo: ['Биофармаколог', 'Технолог кондитерского производства', 'Химик-аналитик']
  },

  // 18. Транспорт, логистика и беспилотные системы
  {
    id: 'uav-fleet-operator',
    name: 'Оператор флота беспилотных аппаратов',
    industry: 'Транспорт, логистика и беспилотные системы',
    tier: 'future',
    archetype: 'uav-fleet-operator',
    riasec: ['Realistic', 'Conventional', 'Investigative'],
    gardner: ['Spatial-Visual', 'Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'low',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Математика', 'Информатика', 'Физика'],
    summary: 'Управляет диспетчерским пультом десятков беспилотных доставщиков или роботов-курьеров.',
    why: 'Контролирует движение беспилотников по картам (Realistic) в соответствии с расписанием и ПДД (Conventional) при анализе заторов (Investigative).',
    skills: {
      hard: ['Диспетчерское ПО беспилотников', 'Картография и GPS/Глонасс', 'Анализ логов телеметрии', 'Протоколы экстренного перехвата'],
      soft: ['Высокая стрессоустойчивость', 'Быстрое переключение внимания', 'Дисциплина']
    },
    demand: 'high',
    skillFormula: ['Диспетчеризация БПЛА', 'Навигация GPS', 'Экстренное реагирование'],
    transferableTo: ['Оператор БПЛА', 'Логист', 'Системный администратор']
  },
  {
    id: 'supply-chain-logistician',
    name: 'Логист по управлению цепочками поставок',
    industry: 'Транспорт, логистика и беспилотные системы',
    tier: 'future',
    archetype: 'supply-chain-logistician',
    riasec: ['Conventional', 'Investigative', 'Enterprising'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'medium',
    values: ['self_direction', 'achievement', 'power', 'stimulation'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'leadership', 'zest'],
    subjects: ['Математика', 'География', 'Обществознание'],
    summary: 'Планирует оптимальные маршруты перевозок, координирует склады и таможню.',
    why: 'Ведет строгий документооборот и учет накладных (Conventional), решая математические задачи оптимизации пути (Investigative) для экономии денег (Enterprising).',
    skills: {
      hard: ['Управление цепочками поставок (SCM)', 'Инкотермс 2020', 'Таможенное оформление', 'Работа в WMS/TMS-системах'],
      soft: ['Стрессоустойчивость', 'Телефонные переговоры', 'Оперативность']
    },
    demand: 'high',
    skillFormula: ['Цепочки поставок SCM', 'Инкотермс', 'Складской учет WMS'],
    transferableTo: ['Project Manager', 'Аналитик данных (в логистике)', 'Коммерческий директор']
  },
  {
    id: 'autonomous-vehicle-developer',
    name: 'Разработчик беспилотного транспорта',
    industry: 'Транспорт, логистика и беспилотные системы',
    tier: 'future',
    archetype: 'autonomous-vehicle-developer',
    riasec: ['Realistic', 'Investigative', 'Conventional'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Математика', 'Информатика', 'Физика'],
    summary: 'Программирует автопилот беспилотников, обучает нейросети распознавать объекты.',
    why: 'Связывает физический автомобиль (Realistic) с алгоритмами компьютерного зрения (Investigative) и правилами безопасности (Conventional).',
    skills: {
      hard: ['C++/Python', 'Компьютерное зрение (OpenCV)', 'Лидары и радары (ROS)', 'Алгоритмы локализации (SLAM)'],
      soft: ['Ответственность', 'Умение решать сложные задачи', 'Усидчивость']
    },
    demand: 'high',
    skillFormula: ['Компьютерное зрение SLAM', 'С++ для автопилотов', 'Нейросети распознавания'],
    transferableTo: ['ML-инженер', 'Инженер-робототехник', 'Backend-разработчик']
  },
  {
    id: 'autonomous-port-dispatcher',
    name: 'Диспетчер автономных портов/складов',
    industry: 'Транспорт, логистика и беспилотные системы',
    tier: 'future',
    archetype: 'autonomous-port-dispatcher',
    riasec: ['Conventional', 'Realistic', 'Investigative'],
    gardner: ['Spatial-Visual', 'Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Математика', 'Информатика', 'Русский язык'],
    summary: 'Координирует работу роботизированных кранов и беспилотных погрузчиков.',
    why: 'Ведет управление автоматизированными погрузками по жесткому регламенту (Conventional/Realistic) для недопущения простоев (Investigative).',
    skills: {
      hard: ['Управление портовыми TOS-системами', 'Диспетчеризация роботов-погрузчиков', 'Контроль пропускной способности', 'Анализ инцидентов'],
      soft: ['Концентрация', 'Педантичность', 'Спокойствие']
    },
    demand: 'high',
    skillFormula: ['Портовые TOS-системы', 'Координация погрузчиков', 'Ликвидация заторов'],
    transferableTo: ['Оператор флота БПЛА', 'Логист', 'Системный администратор']
  },

  // 19. Спорт, фитнес и велнес
  {
    id: 'esports-coach',
    name: 'Тренер по киберспорту',
    industry: 'Спорт, фитнес и велнес',
    tier: 'dream',
    archetype: 'esports-coach',
    riasec: ['Social', 'Enterprising', 'Investigative'],
    gardner: ['Interpersonal', 'Logical-Mathematical'],
    bigFive: { traits: { Extraversion: 'high', Stability: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'universalism', 'self_direction', 'achievement'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'kindness', 'social_intelligence'],
    subjects: ['Обществознание', 'Биология', 'Русский язык'],
    summary: 'Разбирает тактику игр, тренирует сыгранность игроков и настраивает их психологически.',
    why: 'Обучает и сплачивает команду игроков (Social) для победы в турнирах (Enterprising) через тактический разбор матчей соперников (Investigative).',
    skills: {
      hard: ['Аналитика киберспортивных матчей', 'Тактика командных игр (MOBA/FPS)', 'Спортивная психология', 'Физическая подготовка геймеров'],
      soft: ['Авторитет лидера', 'Разрешение конфликтов', 'Ораторское мастерство']
    },
    demand: 'medium',
    skillFormula: ['Тактика киберспорта', 'Командный дух', 'Спортивная психология'],
    transferableTo: ['Тьютор', 'Игропедагог', 'Project Manager']
  },
  {
    id: 'sports-nutritionist',
    name: 'Спортивный диетолог / Нутрициолог',
    industry: 'Спорт, фитнес и велнес',
    tier: 'everyday',
    archetype: 'sports-nutritionist',
    riasec: ['Investigative', 'Social', 'Artistic'],
    gardner: ['Naturalist', 'Interpersonal'],
    bigFive: { traits: { Agreeableness: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'universalism', 'self_direction', 'achievement'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'kindness', 'social_intelligence'],
    subjects: ['Биология', 'Химия', 'Русский язык'],
    summary: 'Рассчитывает рационы питания и БАДы для спортсменов под тренировочные циклы.',
    why: 'Научный расчет биохимического расхода энергии (Investigative) сочетается с чутким ведением и контролем срывов подопечного (Social).',
    skills: {
      hard: ['Спортивная диетология', 'Биохимия питания', 'Оценка состава тела (Биоимпеданс)', 'Расчет нутрицевтиков'],
      soft: ['Мотивация клиента', 'Эмпатия', 'Навыки объяснения']
    },
    demand: 'high',
    skillFormula: ['Расчет КБЖУ', 'Биохимия питания', 'Ведение рациона'],
    transferableTo: ['Специалист по долголетию', 'Персональный фитнес-коуч', 'Технолог растительного мяса']
  },
  {
    id: 'personal-fitness-coach',
    name: 'Персональный фитнес-коуч',
    industry: 'Спорт, фитнес и велнес',
    tier: 'everyday',
    archetype: 'personal-fitness-coach',
    riasec: ['Social', 'Realistic', 'Enterprising'],
    gardner: ['Bodily-Kinesthetic', 'Interpersonal'],
    bigFive: { traits: { Extraversion: 'high', Agreeableness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'universalism', 'power', 'achievement'],
    viaFit: ['kindness', 'social_intelligence', 'teamwork', 'leadership', 'zest'],
    subjects: ['Биология', 'Обществознание', 'Русский язык'],
    summary: 'Составляет программы тренировок, следит за техникой выполнения и мотивирует.',
    why: 'Показывает упражнения на снарядах и работает физически (Realistic) для персональной помощи человеку в улучшении здоровья (Social).',
    skills: {
      hard: ['Анатомия и биомеханика фитнеса', 'Техника силовых тренировок', 'Первая доврачебная помощь', 'Продажи фитнес-карт'],
      soft: ['Мощная энергетика', 'Эмпатия', 'Дисциплинированность']
    },
    demand: 'high',
    skillFormula: ['Биомеханика упражнений', 'Мотивация на спорт', 'Техника безопасности'],
    transferableTo: ['Реабилитолог', 'Спортивный диетолог', 'Менеджер фитнес-клуба']
  },
  {
    id: 'sports-event-manager',
    name: 'Менеджер спортивных событий',
    industry: 'Спорт, фитнес и велнес',
    tier: 'everyday',
    archetype: 'sports-event-manager',
    riasec: ['Enterprising', 'Social', 'Artistic'],
    gardner: ['Interpersonal'],
    bigFive: { traits: { Extraversion: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'universalism', 'power', 'achievement'],
    viaFit: ['kindness', 'social_intelligence', 'teamwork', 'creativity', 'appreciation_of_beauty'],
    subjects: ['Обществознание', 'Иностранный язык', 'Русский язык'],
    summary: 'Организует марафоны, турниры, подбирает спонсоров и координирует безопасность.',
    why: 'Управляет масштабным мероприятием (Enterprising) через координацию волонтеров и участников (Social).',
    skills: {
      hard: ['Спортивный маркетинг', 'Бюджетирование мероприятий', 'Работа со спонсорскими пакетами', 'Логистика площадок'],
      soft: ['Стрессоустойчивость', 'Организаторский талант', 'Переговоры']
    },
    demand: 'medium',
    skillFormula: ['Спортивный маркетинг', 'Координация волонтеров', 'Бюджетирование событий'],
    transferableTo: ['MICE-event-менеджер', 'PR-менеджер', 'Project Manager']
  },

  // 20. Туризм и премиальное гостеприимство
  {
    id: 'eco-tourism-developer',
    name: 'Разработчик эко-туристических маршрутов',
    industry: 'Туризм и премиальное гостеприимство',
    tier: 'everyday',
    archetype: 'eco-tourism-developer',
    riasec: ['Social', 'Artistic', 'Investigative'],
    gardner: ['Naturalist', 'Interpersonal'],
    bigFive: { traits: { Openness: 'high', Agreeableness: 'high' } },
    cognitiveDemand: 'high',
    values: ['benevolence', 'universalism', 'self_direction', 'achievement'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'kindness', 'social_intelligence'],
    subjects: ['География', 'Обществознание', 'Русский язык'],
    summary: 'Проектирует пешеходные тропы и глэмпинги с нулевым следом для природы.',
    why: 'Показывает туристам красоту природы без вреда для нее (Social/Artistic) на основе исследования местных эко-троп (Investigative).',
    skills: {
      hard: ['Ландшафтный дизайн эко-троп', 'Краеведение и география', 'Экологический аудит туризма', 'Оказание первой помощи в походах'],
      soft: ['Любовь к путешествиям', 'Забота об экологии', 'Коммуникабельность']
    },
    demand: 'high',
    skillFormula: ['Эко-тропы', 'Гео-навигация', 'Краеведение'],
    transferableTo: ['Эколог-урбанист', 'Управляющий глэмпингом', 'Экскурсовод']
  },
  {
    id: 'boutique-hotel-manager',
    name: 'Управляющий глэмпингом / бутик-отелем',
    industry: 'Туризм и премиальное гостеприимство',
    tier: 'everyday',
    archetype: 'boutique-hotel-manager',
    riasec: ['Enterprising', 'Social', 'Conventional'],
    gardner: ['Interpersonal'],
    bigFive: { traits: { Extraversion: 'high', Agreeableness: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['benevolence', 'universalism', 'self_direction', 'achievement'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'kindness', 'social_intelligence'],
    subjects: ['Обществознание', 'Иностранный язык', 'Русский язык'],
    summary: 'Руководит работой дизайнерских отелей на природе, координирует сервис.',
    why: 'Обеспечивает окупаемость отеля и привлекает гостей (Enterprising) через теплый сервис приема людей (Social) и строгий контроль клининга (Conventional).',
    skills: {
      hard: ['Отельные системы (PMS/Fidelio)', 'Управление отельным персоналом', 'Стандарты премиум-сервиса', 'Финансовый учет отеля'],
      soft: ['Гостеприимство', 'Элегантность манер', 'Быстрое решение жалоб']
    },
    demand: 'high',
    skillFormula: ['Отельный сервис PMS', 'Премиум-гостеприимство', 'Управление персоналом'],
    transferableTo: ['MICE-event-менеджер', 'HR-директор', 'Менеджер спортивных событий']
  },
  {
    id: 'mice-event-manager',
    name: 'Организатор делового туризма (MICE)',
    industry: 'Туризм и премиальное гостеприимство',
    tier: 'everyday',
    archetype: 'mice-event-manager',
    riasec: ['Enterprising', 'Conventional', 'Social'],
    gardner: ['Interpersonal'],
    bigFive: { traits: { Conscientiousness: 'high', Extraversion: 'high' } },
    cognitiveDemand: 'high',
    values: ['benevolence', 'universalism', 'self_direction', 'achievement'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'kindness', 'social_intelligence'],
    subjects: ['Обществознание', 'Иностранный язык', 'Русский язык'],
    summary: 'Организует зарубежные конференции и выставки для корпоративных заказчиков.',
    why: 'Ведет крупные корпоративные бюджеты и бронирования (Enterprising/Conventional) с координацией перелетов сотен спикеров и гостей (Social).',
    skills: {
      hard: ['B2B-продажи конференций', 'Бронирование чартеров и залов', 'Работа с визовыми центрами', 'Сценарные тайминги'],
      soft: ['Железная организованность', 'Дипломатия', 'Многозадачность']
    },
    demand: 'high',
    skillFormula: ['Деловые конференции MICE', 'Бронирование чартеров', 'Сценарный тайминг'],
    transferableTo: ['Boutique-hotel-manager', 'Sports-event-manager', 'Project Manager']
  },

  // Точечные дополнения в существующие отрасли
  {
    id: 'cloud-security-architect',
    name: 'Архитектор облачной безопасности',
    industry: 'IT и разработка ПО',
    tier: 'everyday',
    archetype: 'cybersecurity-specialist',
    riasec: ['Conventional', 'Realistic', 'Investigative'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Математика', 'Информатика', 'Русский язык'],
    summary: 'Проектирует защищенные облачные контуры и отражает кибератаки.',
    why: 'Контролирует соблюдение стандартов ИБ и настраивает сетевые фильтры (Conventional/Realistic) для отражения хакерских угроз.',
    skills: {
      hard: ['Безопасность AWS/Azure/Yandex Cloud', 'Пентестинг сетей', 'Шифрование SSL/TLS', 'Настройка WAF/SIEM'],
      soft: ['Абсолютная ответственность', 'Аналитический склад ума', 'Хладнокровие']
    },
    demand: 'high',
    skillFormula: ['Облачная безопасность', 'Шифрование данных', 'Отражение кибератак'],
    transferableTo: ['DevOps-инженер', 'Блокчейн-инженер', 'Системный администратор']
  },
  {
    id: 'cellular-agriculture-specialist',
    name: 'Специалист по клеточному сельскому хозяйству',
    industry: 'Биотехнологии и биоинженерия',
    tier: 'future',
    archetype: 'cellular-agriculture-specialist',
    riasec: ['Investigative', 'Realistic', 'Conventional'],
    gardner: ['Naturalist', 'Logical-Mathematical'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Биология', 'Химия', 'Математика'],
    summary: 'Выращивает искусственное мясо и молочные белки из клеток в биореакторах.',
    why: 'Проводит лабораторные исследования клеток (Investigative) для создания физических продуктов питания нового поколения (Realistic).',
    skills: {
      hard: ['Культивирование клеток in vitro', 'Работа с биореакторами', 'Анализ белков и липидов', 'Стандарты пищевой безопасности HACCP'],
      soft: ['Научный азарт', 'Педантичность', 'Экологическое сознание']
    },
    demand: 'high',
    skillFormula: ['Культивирование клеток', 'Работа с биореакторами', 'Пищевой синтез'],
    transferableTo: ['Биофармаколог', 'Пищевой технолог', 'Агрогенетик']
  },
  {
    id: 'sustainability-compliance-officer',
    name: 'Эко-аудитор (ESG)',
    industry: 'Энергетика и эко-технологии',
    tier: 'everyday',
    archetype: 'sustainability-compliance-officer',
    riasec: ['Conventional', 'Investigative', 'Social'],
    gardner: ['Naturalist', 'Linguistic'],
    bigFive: { traits: { Conscientiousness: 'high', Agreeableness: 'high' } },
    cognitiveDemand: 'high',
    values: ['benevolence', 'universalism', 'self_direction', 'achievement'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'kindness', 'social_intelligence'],
    subjects: ['Обществознание', 'Биология', 'Русский язык'],
    summary: 'Проверяет соответствие предприятий экологическим стандартам и нормам ESG.',
    why: 'Анализирует отчетность по выбросам и проверяет фильтры (Conventional) для снижения вреда окружающей среде (Social).',
    skills: {
      hard: ['Экологический аудит предприятий', 'ESG-стандарты отчетности', 'Законодательство РФ об охране природы', 'Расчет углеродного следа'],
      soft: ['Принципиальность', 'Педантичность', 'Дипломатия']
    },
    demand: 'high',
    skillFormula: ['Экологический аудит', 'Расчет выбросов ESG', 'Нормы природоохраны'],
    transferableTo: ['Углеродный аудитор', 'Эколог-урбанист', 'Комплаенс-офицер']
  },
  {
    id: 'neuromarketing-specialist',
    name: 'Нейромаркетолог',
    industry: 'Маркетинг, PR и бренд-менеджмент',
    tier: 'future',
    archetype: 'neuromarketing-specialist',
    riasec: ['Investigative', 'Enterprising', 'Artistic'],
    gardner: ['Interpersonal', 'Logical-Mathematical'],
    bigFive: { traits: { Openness: 'high', Agreeableness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['self_direction', 'achievement', 'power', 'stimulation'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'creativity', 'appreciation_of_beauty'],
    subjects: ['Обществознание', 'Биология', 'Русский язык'],
    summary: 'Исследует реакцию мозга и эмоции потребителей на рекламу с помощью нейро-интерфейсов.',
    why: 'Снимает показания ЭЭГ и айтрекеров (Investigative) для увеличения коммерческих продаж рекламы (Enterprising).',
    skills: {
      hard: ['Работа с ЭЭГ и полиграфами', 'Анализ движения глаз (Eye-tracking)', 'Психофизиология восприятия', 'Маркетинговые тесты'],
      soft: ['Глубокая эмпатия', 'Аналитический склад ума', 'Креативность']
    },
    demand: 'medium',
    skillFormula: ['Нейро-интерфейсы ЭЭГ', 'Маркетинговые тесты', 'Психофизиология эмоций'],
    transferableTo: ['Digital-маркетолог', 'Нейробиолог', 'UX-исследователь']
  },
  {
    id: 'tokenomics-advisor',
    name: 'Консультант по DeFi и токенизации',
    industry: 'Финансовые технологии и инвестиции',
    tier: 'future',
    archetype: 'tokenomics-advisor',
    riasec: ['Investigative', 'Enterprising', 'Conventional'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'power', 'stimulation'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'leadership', 'zest'],
    subjects: ['Математика', 'Информатика', 'Русский язык'],
    summary: 'Проектирует экономические модели токенов и децентрализованных финансовых систем.',
    why: 'Рассчитывает инфляционные модели эмиссии токенов (Investigative/Conventional) для коммерческого стартапа (Enterprising).',
    skills: {
      hard: ['Разработка моделей токеномики', 'Понимание смарт-контрактов', 'Теория игр и стимулов', 'Децентрализованные финансы (DeFi)'],
      soft: ['Абстрактное мышление', 'Стрессоустойчивость', 'Прогнозирование']
    },
    demand: 'high',
    skillFormula: ['Разработка токеномики', 'Децентрализованные финансы', 'Теория игр'],
    transferableTo: ['Криптотрейдер', 'Блокчейн-инженер', 'Финансовый аналитик']
  },

  // 21. Оркестрация ИИ и Агенты (AI Orchestration & Agentic Systems)
  {
    id: 'ai-agent-architect',
    name: 'Архитектор ИИ-агентов',
    industry: 'Оркестрация ИИ и Агенты',
    tier: 'future',
    archetype: 'ai-orchestration-engineer',
    riasec: ['Investigative', 'Conventional', 'Realistic'],
    gardner: ['Logical-Mathematical', 'Spatial-Visual'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Математика', 'Информатика', 'Русский язык'],
    summary: 'Проектирует автономные агентные системы на базе LLM для автоматизации бизнес-процессов.',
    why: 'Разрабатывает когнитивную архитектуру и планировщики действий алгоритмы (Investigative/Conventional) для решения практических задач (Realistic).',
    skills: {
      hard: ['Frameworks (LangChain/CrewAI/Autogen)', 'Программирование Python/Node.js', 'Векторные базы данных (Vector DB)', 'Prompt Engineering'],
      soft: ['Системное видение', 'Креативность', 'Упорство']
    },
    demand: 'high',
    skillFormula: ['Проектирование алгоритмы-агентов', 'LangChain и CrewAI', 'Векторный поиск'],
    transferableTo: ['ML-инженер', 'Backend-разработчик', 'Системный архитектор']
  },
  {
    id: 'ai-orchestration-engineer',
    name: 'Инженер по оркестрации ИИ',
    industry: 'Оркестрация ИИ и Агенты',
    tier: 'future',
    archetype: 'ai-orchestration-engineer',
    riasec: ['Conventional', 'Realistic', 'Investigative'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Математика', 'Информатика', 'Русский язык'],
    summary: 'Связывает десятки специализированных нейросетей и алгоритмы-агентов в единые бизнес-пайплайны.',
    why: 'Организует потоки вызовов API и баз данных (Conventional) для стабильного взаимодействия алгоритмы-систем (Realistic).',
    skills: {
      hard: ['Разработка API-интеграций', 'Облачные архитектуры (Microservices)', 'Python/Go', 'Мониторинг алгоритмы-пайплайнов'],
      soft: ['Методичность', 'Внимание к деталям', 'Стрессоустойчивость']
    },
    demand: 'high',
    skillFormula: ['Оркестрация API алгоритмы', 'Потоки вызовов нейросетей', 'Облачная микросервисность'],
    transferableTo: ['DevOps-инженер', 'Backend-разработчик', 'Инженер данных']
  },
  {
    id: 'ai-safety-auditor',
    name: 'Аудитор ИИ-систем на безопасность',
    industry: 'Оркестрация ИИ и Агенты',
    tier: 'future',
    archetype: 'ai-safety-auditor',
    riasec: ['Conventional', 'Investigative', 'Enterprising'],
    gardner: ['Logical-Mathematical', 'Linguistic'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'power', 'stimulation'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'leadership', 'zest'],
    subjects: ['Информатика', 'Обществознание', 'Русский язык'],
    summary: 'Проверяет нейросети на предмет галлюцинаций, дискриминации, уязвимостей (jailbreak) и утечек.',
    why: 'Тестирует ограничения моделей по стандартам безопасности (Conventional) для предотвращения репутационных рисков бизнеса (Enterprising).',
    skills: {
      hard: ['Тестирование алгоритмы-безопасности (Red Teaming)', 'Анализ предвзятости данных (Bias Detection)', 'GDPR/AI Act комплаенс', 'Jailbreak-атаки'],
      soft: ['Критическое мышление', 'Честность', 'Педантичность']
    },
    demand: 'high',
    skillFormula: ['алгоритмы Red Teaming', 'Комплаенс AI Act', 'Поиск галлюцинаций алгоритмы'],
    transferableTo: ['QA-инженер (тестировщик)', 'Compliance-офицер', 'IT-юрист']
  },
  {
    id: 'ai-empathy-trainer',
    name: 'Тренер ИИ по эмпатии',
    industry: 'Оркестрация ИИ и Агенты',
    tier: 'future',
    archetype: 'ai-empathy-trainer',
    riasec: ['Social', 'Artistic', 'Investigative'],
    gardner: ['Interpersonal', 'Linguistic'],
    bigFive: { traits: { Agreeableness: 'high', Extraversion: 'high' } },
    cognitiveDemand: 'high',
    values: ['benevolence', 'universalism', 'self_direction', 'achievement'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'kindness', 'social_intelligence'],
    subjects: ['Обществознание', 'Литература', 'Русский язык'],
    summary: 'Обучает разговорных алгоритмы-ассистентов проявлять эмпатию, оказывать психологическую поддержку и корректно общаться.',
    why: 'Разрабатывает этические гайдлайны и сценарии сочувствия (Social/Artistic) на основе лингвистического анализа диалогов (Investigative).',
    skills: {
      hard: ['Разметка диалоговых датасетов', 'Оценка тональности текста (Sentiment Analysis)', 'Психологический консалтинг алгоритмы', 'LLM RLHF'],
      soft: ['Высокая эмпатия', 'Филологический слух', 'Креативность']
    },
    demand: 'high',
    skillFormula: ['Обучение эмпатии алгоритмы', 'Психологический консалтинг', 'Разметка датасетов RLHF'],
    transferableTo: ['Промпт-инженер', 'Семейный психотерапевт', 'Копирайтер']
  },
  {
    id: 'cognitive-ui-developer',
    name: 'Разработчик когнитивных интерфейсов',
    industry: 'Оркестрация ИИ и Агенты',
    tier: 'future',
    archetype: 'cognitive-ui-developer',
    riasec: ['Artistic', 'Investigative', 'Realistic'],
    gardner: ['Spatial-Visual', 'Logical-Mathematical'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'stimulation'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'creativity', 'appreciation_of_beauty'],
    subjects: ['Информатика', 'Обществознание', 'Русский язык'],
    summary: 'Создает динамические интерфейсы, адаптирующиеся под психофизиологическое состояние и эмоции пользователя в реальном времени.',
    why: 'Проектирует UI с использованием биометрической обратной связи (Artistic/Realistic) для создания максимального комфорта (Social).',
    skills: {
      hard: ['Фронтенд-разработка (React/WebSockets)', 'Обработка биометрических сигналов', 'Интеграция алгоритмы-агентов в UI', 'UX-тестирование'],
      soft: ['Инновационное мышление', 'Эмпатия к пользователю', 'Внимание к деталям']
    },
    demand: 'high',
    skillFormula: ['Динамический адаптивный UI', 'Биометрическая обратная связь', 'Фронтенд React/WebSockets'],
    transferableTo: ['UX/UI-дизайнер', 'Frontend-разработчик', 'Мобильный разработчик']
  },

  // 22. Космические технологии и коммерция (SpaceTech & Space Commerce)
  {
    id: 'space-traffic-controller',
    name: 'Диспетчер космического трафика',
    industry: 'Космические технологии и коммерция',
    tier: 'dream',
    archetype: 'space-traffic-controller',
    riasec: ['Conventional', 'Realistic', 'Investigative'],
    gardner: ['Spatial-Visual', 'Logical-Mathematical'],
    bigFive: { traits: { Stability: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Математика', 'Физика', 'Русский язык'],
    summary: 'Координирует орбиты спутников, предотвращает столкновения и планирует безопасные коридоры запусков.',
    why: 'Рассчитывает траектории орбит на мониторах (Conventional) для управления движением реальных космических аппаратов (Realistic).',
    skills: {
      hard: ['Баллистика и механика полета', 'Диспетчерские радарные системы', 'Управление орбитальными маневрами', 'Анализ рисков столкновений'],
      soft: ['Железное хладнокровие', 'Высокая концентрация внимания', 'Ответственность']
    },
    demand: 'medium',
    skillFormula: ['Баллистические расчеты', 'Радарный мониторинг', 'Управление маневрами орбит'],
    transferableTo: ['Диспетчер портов', 'Аналитик космического мусора', 'Оператор БПЛА']
  },
  {
    id: 'space-architect',
    name: 'Орбитальный архитектор',
    industry: 'Космические технологии и коммерция',
    tier: 'dream',
    archetype: 'space-architect',
    riasec: ['Artistic', 'Realistic', 'Investigative'],
    gardner: ['Spatial-Visual', 'Logical-Mathematical'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'stimulation'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'creativity', 'appreciation_of_beauty'],
    subjects: ['Математика', 'Физика', 'Русский язык'],
    summary: 'Проектирует интерьеры космических станций, лунных баз и капсул с учетом невесомости и психологии космонавтов.',
    why: 'Разрабатывает художественные концепты модулей (Artistic) на основе жестких расчетов герметичности и жизнеобеспечения (Realistic).',
    skills: {
      hard: ['Проектирование систем жизнеобеспечения ECLSS', '3D CAD моделирование', 'Эргономика невесомости', 'Материаловедение космоса'],
      soft: ['Визионерство', 'Междисциплинарность', 'Пространственное воображение']
    },
    demand: 'medium',
    skillFormula: ['Системы жизнеобеспечения ECLSS', 'Космическая эргономика', '3D CAD моделирование модулей'],
    transferableTo: ['Архитектор', 'Промышленный дизайнер', 'Проектировщик умных городов']
  },
  {
    id: 'orbital-debris-specialist',
    name: 'Аналитик космического мусора',
    industry: 'Космические технологии и коммерция',
    tier: 'dream',
    archetype: 'orbital-debris-specialist',
    riasec: ['Investigative', 'Realistic', 'Conventional'],
    gardner: ['Logical-Mathematical', 'Naturalist'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Математика', 'Физика', 'Русский язык'],
    summary: 'Выявляет, классифицирует и прогнозирует траектории обломков космических аппаратов для обеспечения безопасности полетов.',
    why: 'Исследует орбитальные аномалии по базам данных (Investigative) для практической защиты действующих станций (Realistic).',
    skills: {
      hard: ['Спектральный анализ космических объектов', 'Астродинамика', 'Python/Matlab моделирование', 'Радарная томография'],
      soft: ['Концентрация внимания', 'Скрупулезность', 'Аналитичность']
    },
    demand: 'high',
    skillFormula: ['Моделирование траекторий мусора', 'Радарная томография обломков', 'Астродинамика орбит'],
    transferableTo: ['Диспетчер космического трафика', 'Астрофизик', 'Data Scientist']
  },
  {
    id: 'space-robotics-engineer',
    name: 'Инженер космической робототехники',
    industry: 'Космические технологии и коммерция',
    tier: 'dream',
    archetype: 'space-robotics-engineer',
    riasec: ['Realistic', 'Investigative', 'Conventional'],
    gardner: ['Logical-Mathematical', 'Spatial-Visual'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Математика', 'Физика', 'Информатика'],
    summary: 'Разрабатывает роботы-манипуляторы, луноходы и автономные буровые установки для работы в вакууме и на других планетах.',
    why: 'Конструирует физических роботов-манипуляторов (Realistic) с алгоритмическим программированием движения в вакууме (Investigative).',
    skills: {
      hard: ['Проектирование роботов для космоса', 'Программирование ROS/C++', 'Управление манипуляторами', 'Защита электроники от радиации'],
      soft: ['Изобретательность', 'Упорство', 'Системное мышление']
    },
    demand: 'high',
    skillFormula: ['Роботы для космического вакуума', 'Программирование манипуляторов', 'Радиационная защита плат'],
    transferableTo: ['Инженер-робототехник', 'Специалист по IoT', 'Аэрокосмический инженер']
  },
  {
    id: 'space-tourism-planner',
    name: 'Организатор космического туризма',
    industry: 'Космические технологии и коммерция',
    tier: 'dream',
    archetype: 'space-tourism-planner',
    riasec: ['Enterprising', 'Social', 'Conventional'],
    gardner: ['Interpersonal'],
    bigFive: { traits: { Extraversion: 'high', Agreeableness: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['benevolence', 'universalism', 'self_direction', 'achievement'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'kindness', 'social_intelligence'],
    subjects: ['Обществознание', 'Иностранный язык', 'Русский язык'],
    summary: 'Планирует частные полеты в космос, координирует предполетную подготовку и логистику туристов.',
    why: 'Заключает B2B контракты на запуски (Enterprising) с психологическим сопровождением и подготовкой туристов (Social).',
    skills: {
      hard: ['Медицинские критерии космического отбора', 'Организация предполетной подготовки', 'Космическое право и страхование', 'B2B-продажи'],
      soft: ['Дипломатия', 'Эмпатия', 'Железная собранность']
    },
    demand: 'medium',
    skillFormula: ['Космическое страхование и право', 'Предполетная подготовка туристов', 'B2B космические продажи'],
    transferableTo: ['Организатор делового туризма (MICE)', 'Управляющий глэмпингом / бутик-отелем', 'Project Manager']
  },

  // Добавлено по итогам исследования рынка 2026 (docs/industries_and_professions/07_market_trends_2026.md)
  {
    id: 'cybersecurity-specialist',
    name: 'Специалист по кибербезопасности',
    industry: 'IT и разработка ПО',
    tier: 'everyday',
    archetype: 'cybersecurity-specialist',
    riasec: ['Investigative', 'Conventional', 'Realistic'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'medium',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Математика', 'Информатика', 'Русский язык'],
    summary: 'Защищает системы и данные компаний от кибератак: ищет уязвимости, отражает вторжения и строит защищённую инфраструктуру.',
    why: 'Требует исследовательского азарта «думать как атакующий» (Investigative), методичности регламентов безопасности (Conventional) и хладнокровия при инцидентах.',
    skills: {
      hard: ['Пентест (Kali/Burp Suite)', 'SIEM-мониторинг', 'Сетевые протоколы и файрволы', 'Криптография'],
      soft: ['Критическое мышление', 'Хладнокровие при инцидентах', 'Этическая принципиальность']
    },
    demand: 'high',
    skillFormula: ['Анализ уязвимостей', 'Сетевые технологии', 'Реагирование на инциденты'],
    transferableTo: ['DevOps-инженер', 'Облачный архитектор безопасности', 'Аудитор алгоритмы-систем', 'Backend-разработчик']
  },
  {
    id: 'mlops-engineer',
    name: 'MLOps-инженер',
    industry: 'Аналитика данных и ИИ',
    tier: 'future',
    archetype: 'devops-engineer',
    riasec: ['Conventional', 'Realistic', 'Investigative'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Математика', 'Информатика', 'Русский язык'],
    summary: 'Отвечает за то, чтобы модели машинного обучения надёжно работали в реальных продуктах: развёртывание, мониторинг и обновление алгоритмы-систем.',
    why: 'Мост между исследованием и производством: нужна инженерная дисциплина конвейеров (Conventional/Realistic) и понимание, как устроены модели (Investigative).',
    skills: {
      hard: ['CI/CD для ML-моделей', 'Docker/Kubernetes', 'Python', 'Мониторинг дрейфа моделей'],
      soft: ['Системное мышление', 'Методичность', 'Спокойствие при сбоях']
    },
    demand: 'high',
    skillFormula: ['ML-конвейеры', 'Инфраструктура', 'Мониторинг систем'],
    transferableTo: ['DevOps-инженер', 'Инженер данных', 'Инженер по оркестрации ИИ', 'ML-инженер']
  },
  {
    id: 'industrial-robotics-technician',
    name: 'Техник по промышленной робототехнике и сварочным комплексам',
    industry: 'Инженерия и промышленность',
    tier: 'everyday',
    archetype: 'industrial-robotics-technician',
    riasec: ['Realistic', 'Conventional', 'Investigative'],
    gardner: ['Bodily-Kinesthetic', 'Spatial-Visual'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Математика', 'Физика', 'Информатика'],
    summary: 'Настраивает, программирует и обслуживает роботизированные производственные линии и сварочные комплексы на современных заводах.',
    why: 'Профессия «человек + робот»: любовь к технике и работе руками (Realistic) сочетается с программированием траекторий и точной наладкой (Conventional). Один из самых дефицитных и высокооплачиваемых профилей в промышленности РФ.',
    skills: {
      hard: ['Программирование промышленных роботов (KUKA/FANUC)', 'Технологии роботизированной сварки', 'ЧПУ и пневматика', 'Чтение технических чертежей'],
      soft: ['Точность движений', 'Ответственность за результат', 'Практическая смекалка']
    },
    demand: 'high',
    skillFormula: ['Наладка роботов', 'Технологии производства', 'Точность исполнения'],
    transferableTo: ['Инженер-робототехник', 'Оператор станков с ЧПУ', 'Инженер-технолог производства', 'Специалист по промышленному IoT']
  },
  {
    id: 'energy-storage-engineer',
    name: 'Инженер по накопителям энергии',
    industry: 'Энергетика и эко-технологии',
    tier: 'everyday',
    archetype: 'energy-storage-engineer',
    riasec: ['Realistic', 'Investigative', 'Conventional'],
    gardner: ['Logical-Mathematical', 'Naturalist'],
    bigFive: { traits: { Conscientiousness: 'high', Openness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'security', 'conformity'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence', 'perseverance'],
    subjects: ['Математика', 'Физика', 'Химия'],
    summary: 'Проектирует и обслуживает системы хранения энергии — от аккумуляторных парков для солнечных станций до водородных хранилищ.',
    why: 'Ключевое звено энергоперехода: без накопителей возобновляемая энергетика не работает ночью и в штиль. Сочетает физику и химию батарей (Investigative) с практикой монтажа и эксплуатации (Realistic).',
    skills: {
      hard: ['Литий-ионные и проточные аккумуляторы', 'Водородные системы хранения', 'Интеграция с электросетью (Grid)', 'Системы управления батареями (BMS)'],
      soft: ['Инженерная аккуратность', 'Экологическое мышление', 'Междисциплинарность']
    },
    demand: 'high',
    skillFormula: ['Электрохимия накопителей', 'Сетевая интеграция', 'Проектирование энергосистем'],
    transferableTo: ['Инженер возобновляемой энергетики', 'Инженер водородной энергетики', 'Электроинженер умных сетей', 'Инженер электротранспорта']
  },

  // ─── Костяк everyday (пересборка каталога, docs/22 §3, батч 1) ───
  {
    id: 'general-practitioner',
    name: 'Врач-терапевт',
    industry: 'Медицина и здравоохранение',
    tier: 'everyday',
    archetype: 'doctor',
    riasec: ['Social', 'Investigative', 'Conventional'],
    gardner: ['Interpersonal', 'Logical-Mathematical', 'Intrapersonal'],
    bigFive: { traits: { Conscientiousness: 'high', Agreeableness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['benevolence', 'security', 'achievement'],
    viaFit: ['kindness', 'judgment', 'perseverance', 'social_intelligence'],
    subjects: ['Биология', 'Химия', 'Русский язык'],
    skills: {
      hard: ['Диагностика заболеваний', 'Назначение лечения', 'Ведение медкарт', 'Неотложная помощь'],
      soft: ['Эмпатия и общение с пациентом', 'Внимательность', 'Стрессоустойчивость']
    },
    demand: 'high',
    skillFormula: ['Клиническое мышление', 'Забота о людях', 'Работа с большим объёмом данных'],
    transferableTo: ['Педиатр', 'Онлайн-терапевт (Теледоктор)', 'Медицинская сестра', 'Фармацевт (Провизор)'],
    summary: 'Первый врач, к которому обращается человек: ставит диагноз, лечит и направляет к узким специалистам.',
    why: 'Подходит тем, кто хочет помогать людям (Social), любит разбираться в причинах (Investigative) и готов к ответственности и постоянной учёбе.'
  },
  {
    id: 'nurse',
    name: 'Медицинская сестра',
    industry: 'Медицина и здравоохранение',
    tier: 'everyday',
    archetype: 'nurse',
    riasec: ['Social', 'Conventional', 'Realistic'],
    gardner: ['Interpersonal', 'Bodily-Kinesthetic', 'Intrapersonal'],
    bigFive: { traits: { Agreeableness: 'high', Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'security', 'conformity'],
    viaFit: ['kindness', 'teamwork', 'perseverance', 'self_regulation'],
    subjects: ['Биология', 'Химия', 'Обществознание'],
    skills: {
      hard: ['Выполнение процедур и инъекций', 'Уход за пациентами', 'Работа с медоборудованием', 'Ведение документации'],
      soft: ['Забота и терпение', 'Работа в команде', 'Собранность в стрессе']
    },
    demand: 'high',
    skillFormula: ['Забота о людях', 'Аккуратность в процедурах', 'Спокойствие под давлением'],
    transferableTo: ['Врач-терапевт', 'Кинезиотерапевт (Реабилитолог)', 'Фармацевт (Провизор)', 'Фельдшер'],
    summary: 'Помогает врачу и пациенту: выполняет процедуры, ухаживает за больными и следит за их состоянием.',
    why: 'Для тех, кто любит заботиться о людях (Social), внимателен к деталям и умеет сохранять спокойствие в трудных ситуациях.'
  },
  {
    id: 'pharmacist',
    name: 'Фармацевт (Провизор)',
    industry: 'Медицина и здравоохранение',
    tier: 'everyday',
    archetype: 'pharmacist',
    riasec: ['Conventional', 'Investigative', 'Social'],
    gardner: ['Logical-Mathematical', 'Interpersonal', 'Naturalist'],
    bigFive: { traits: { Conscientiousness: 'high', Agreeableness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['security', 'benevolence', 'achievement'],
    viaFit: ['judgment', 'prudence', 'kindness', 'love_of_learning'],
    subjects: ['Химия', 'Биология', 'Математика'],
    skills: {
      hard: ['Знание лекарственных препаратов', 'Отпуск и дозировки', 'Контроль совместимости', 'Учёт и хранение'],
      soft: ['Внимательность к деталям', 'Консультирование', 'Ответственность']
    },
    demand: 'high',
    skillFormula: ['Точность с веществами', 'Клиентская консультация', 'Ответственность за здоровье'],
    transferableTo: ['Врач-терапевт', 'Биофармаколог (Разработчик лекарств)', 'Химик-синтетик / Материаловед', 'Медицинский представитель'],
    summary: 'Разбирается в лекарствах: подбирает препараты, объясняет приём и следит за их безопасным хранением.',
    why: 'Подходит аккуратным и системным (Conventional), кому интересна химия и биология и кто хочет помогать людям без операционной.'
  },
  {
    id: 'dentist',
    name: 'Стоматолог',
    industry: 'Медицина и здравоохранение',
    tier: 'everyday',
    archetype: 'doctor',
    riasec: ['Realistic', 'Investigative', 'Social'],
    gardner: ['Bodily-Kinesthetic', 'Spatial-Visual', 'Interpersonal'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['achievement', 'benevolence', 'security'],
    viaFit: ['judgment', 'perseverance', 'kindness', 'self_regulation'],
    subjects: ['Биология', 'Химия', 'Физика'],
    skills: {
      hard: ['Диагностика полости рта', 'Лечение и пломбирование', 'Работа с бормашиной и инструментом', 'Протезирование'],
      soft: ['Тонкая моторика', 'Спокойствие пациента', 'Внимательность']
    },
    demand: 'high',
    skillFormula: ['Точная ручная работа', 'Клиническое мышление', 'Забота о пациенте'],
    transferableTo: ['Врач-терапевт', 'Челюстно-лицевой хирург', 'Ортодонт', 'Разработчик киберпротезов'],
    summary: 'Лечит зубы и дёсны: ставит диагноз, пломбирует, протезирует и следит за здоровьем полости рта.',
    why: 'Для тех, у кого точные руки (Realistic), кто внимателен к деталям и готов сочетать медицину с ручным мастерством.'
  },
  {
    id: 'veterinarian',
    name: 'Ветеринарный врач',
    industry: 'Медицина и здравоохранение',
    tier: 'everyday',
    archetype: 'veterinarian',
    riasec: ['Investigative', 'Social', 'Realistic'],
    gardner: ['Naturalist', 'Interpersonal', 'Bodily-Kinesthetic'],
    bigFive: { traits: { Agreeableness: 'high', Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['benevolence', 'universalism', 'achievement'],
    viaFit: ['kindness', 'love', 'judgment', 'perseverance'],
    subjects: ['Биология', 'Химия', 'Русский язык'],
    skills: {
      hard: ['Диагностика животных', 'Лечение и операции', 'Вакцинация', 'Работа с владельцами'],
      soft: ['Любовь к животным', 'Спокойствие', 'Наблюдательность']
    },
    demand: 'high',
    skillFormula: ['Забота о живом', 'Клиническое мышление', 'Ручная работа с пациентом'],
    transferableTo: ['Врач-терапевт', 'Агроном-генетик', 'Зоотехник', 'Биолог-исследователь'],
    summary: 'Лечит животных: ставит диагноз, оперирует, прививает и помогает хозяевам заботиться о питомцах.',
    why: 'Подходит тем, кто любит животных и природу (Naturalist), интересуется биологией и готов к ответственной медицинской работе.'
  },
  {
    id: 'school-teacher',
    name: 'Учитель-предметник',
    industry: 'Образование и EdTech',
    tier: 'everyday',
    archetype: 'teacher',
    riasec: ['Social', 'Artistic', 'Conventional'],
    gardner: ['Linguistic', 'Interpersonal', 'Intrapersonal'],
    bigFive: { traits: { Extraversion: 'high', Conscientiousness: 'high', Agreeableness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'universalism', 'tradition'],
    viaFit: ['love_of_learning', 'kindness', 'leadership', 'perspective'],
    subjects: ['Русский язык', 'Литература', 'Обществознание'],
    skills: {
      hard: ['Методика преподавания', 'Подготовка уроков', 'Оценивание знаний', 'Работа с классом'],
      soft: ['Умение объяснять', 'Терпение', 'Удержание внимания']
    },
    demand: 'high',
    skillFormula: ['Передача знаний', 'Работа с группой', 'Ясное объяснение'],
    transferableTo: ['Онлайн-учитель / Лектор', 'Тьютор / Профориентолог', 'Методолог онлайн-обучения', 'Игропедагог (Игропрактик)'],
    summary: 'Учит школьников своему предмету: ведёт уроки, объясняет материал и помогает детям расти.',
    why: 'Для тех, кто любит людей и общение (Social), умеет ясно объяснять и хочет влиять на будущее детей.'
  },
  {
    id: 'preschool-educator',
    name: 'Воспитатель детского сада',
    industry: 'Образование и EdTech',
    tier: 'everyday',
    archetype: 'teacher',
    riasec: ['Social', 'Artistic', 'Realistic'],
    gardner: ['Interpersonal', 'Bodily-Kinesthetic', 'Musical'],
    bigFive: { traits: { Agreeableness: 'high', Extraversion: 'high', Stability: 'high' } },
    cognitiveDemand: 'low',
    values: ['benevolence', 'security', 'tradition'],
    viaFit: ['kindness', 'love', 'humor', 'zest'],
    subjects: ['Русский язык', 'Биология', 'Музыка'],
    skills: {
      hard: ['Организация игр и занятий', 'Развивающие методики', 'Присмотр и безопасность', 'Работа с родителями'],
      soft: ['Доброта и терпение', 'Энергичность', 'Внимательность']
    },
    demand: 'high',
    skillFormula: ['Забота о детях', 'Организация группы', 'Творческая игра'],
    transferableTo: ['Учитель-предметник', 'Детский психолог', 'Игропедагог (Игропрактик)', 'Логопед'],
    summary: 'Заботится о малышах в детском саду: играет, обучает и помогает детям развиваться и дружить.',
    why: 'Подходит добрым и энергичным (Social), кто любит детей и умеет превращать день в игру и заботу.'
  },
  {
    id: 'accountant',
    name: 'Бухгалтер',
    industry: 'Финансовые технологии и инвестиции',
    tier: 'everyday',
    archetype: 'accountant',
    riasec: ['Conventional', 'Investigative', 'Enterprising'],
    gardner: ['Logical-Mathematical', 'Intrapersonal', 'Linguistic'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'medium',
    values: ['security', 'achievement', 'conformity'],
    viaFit: ['prudence', 'judgment', 'perseverance', 'honesty'],
    subjects: ['Математика', 'Обществознание', 'Информатика'],
    skills: {
      hard: ['Ведение учёта', 'Налоговая отчётность', 'Работа в 1С', 'Первичная документация'],
      soft: ['Внимательность к деталям', 'Аккуратность', 'Ответственность']
    },
    demand: 'high',
    skillFormula: ['Точность с цифрами', 'Системность', 'Работа с документами'],
    transferableTo: ['Финансовый аналитик', 'Аудитор', 'Налоговый консультант', 'Эко-аудитор (ESG)'],
    summary: 'Ведёт финансовый учёт компании: считает налоги, зарплаты и следит за порядком в документах.',
    why: 'Для аккуратных и системных (Conventional), кто дружит с цифрами и любит, когда всё сходится до копейки.'
  },
  {
    id: 'sales-manager',
    name: 'Менеджер по продажам',
    industry: 'Управление и бизнес-консалтинг',
    tier: 'everyday',
    archetype: 'sales-manager',
    riasec: ['Enterprising', 'Social', 'Conventional'],
    gardner: ['Interpersonal', 'Linguistic', 'Intrapersonal'],
    bigFive: { traits: { Extraversion: 'high', Agreeableness: 'high', Stability: 'high' } },
    cognitiveDemand: 'medium',
    values: ['achievement', 'power', 'stimulation'],
    viaFit: ['social_intelligence', 'zest', 'perseverance', 'hope'],
    subjects: ['Обществознание', 'Русский язык', 'Математика'],
    skills: {
      hard: ['Работа с клиентами и CRM', 'Ведение переговоров', 'Презентация продукта', 'Работа с возражениями'],
      soft: ['Общительность', 'Настойчивость', 'Стрессоустойчивость']
    },
    demand: 'high',
    skillFormula: ['Убеждение и переговоры', 'Работа с людьми', 'Ориентация на результат'],
    transferableTo: ['Бренд-менеджер', 'Предприниматель (Стартапер)', 'Account-менеджер', 'Риелтор'],
    summary: 'Продаёт товары и услуги: находит клиентов, ведёт переговоры и доводит сделку до результата.',
    why: 'Подходит общительным и целеустремлённым (Enterprising), кто не боится общения и любит добиваться результата.'
  },
  {
    id: 'agronomist',
    name: 'Агроном',
    industry: 'Агротехнологии и сити-фермерство',
    tier: 'everyday',
    archetype: 'agronomist',
    riasec: ['Investigative', 'Realistic', 'Conventional'],
    gardner: ['Naturalist', 'Logical-Mathematical', 'Bodily-Kinesthetic'],
    bigFive: { traits: { Conscientiousness: 'high', Openness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['universalism', 'security', 'achievement'],
    viaFit: ['curiosity', 'perseverance', 'judgment', 'love_of_learning'],
    subjects: ['Биология', 'Химия', 'География'],
    skills: {
      hard: ['Агротехника выращивания', 'Анализ почв', 'Защита растений', 'Планирование урожая'],
      soft: ['Наблюдательность', 'Практичность', 'Терпение']
    },
    demand: 'high',
    skillFormula: ['Работа с живой природой', 'Планирование сезона', 'Прикладная биология'],
    transferableTo: ['Специалист по умному фермерству (IoT в АПК)', 'Агроном-генетик', 'Сити-фермер', 'Эколог-урбанист'],
    summary: 'Выращивает урожай: подбирает культуры, следит за почвой и защищает растения, чтобы поле было плодородным.',
    why: 'Для тех, кто любит природу и практику (Realistic/Investigative), интересуется биологией и хочет кормить людей.'
  },
  {
    id: 'electrician',
    name: 'Электромонтёр (Электрик)',
    industry: 'Энергетика и эко-технологии',
    tier: 'everyday',
    archetype: 'electrician',
    riasec: ['Realistic', 'Conventional', 'Investigative'],
    gardner: ['Bodily-Kinesthetic', 'Logical-Mathematical', 'Spatial-Visual'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'medium',
    values: ['security', 'achievement', 'conformity'],
    viaFit: ['prudence', 'perseverance', 'judgment', 'teamwork'],
    subjects: ['Физика', 'Математика', 'Технология'],
    skills: {
      hard: ['Монтаж проводки', 'Чтение электросхем', 'Диагностика неисправностей', 'Техника безопасности'],
      soft: ['Аккуратность', 'Собранность', 'Ответственность']
    },
    demand: 'high',
    skillFormula: ['Работа руками по схеме', 'Точность и безопасность', 'Поиск неисправностей'],
    transferableTo: ['Инженер по накопителям энергии', 'Электроинженер умных сетей', 'Техник по промышленной робототехнике и сварочным комплексам', 'Монтажник слаботочных систем'],
    summary: 'Проводит и чинит электрику: монтирует проводку, находит поломки и следит за безопасностью сетей.',
    why: 'Подходит тем, кто любит работать руками по чёткой схеме (Realistic), внимателен и ценит безопасность.'
  },
  {
    id: 'auto-mechanic',
    name: 'Автомеханик (Автослесарь)',
    industry: 'Транспорт, логистика и беспилотные системы',
    tier: 'everyday',
    archetype: 'auto-mechanic',
    riasec: ['Realistic', 'Investigative', 'Conventional'],
    gardner: ['Bodily-Kinesthetic', 'Spatial-Visual', 'Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'medium',
    values: ['achievement', 'security', 'self_direction'],
    viaFit: ['perseverance', 'judgment', 'curiosity', 'prudence'],
    subjects: ['Физика', 'Технология', 'Математика'],
    skills: {
      hard: ['Диагностика автомобиля', 'Ремонт узлов и агрегатов', 'Работа с инструментом', 'Обслуживание ТО'],
      soft: ['Технический склад', 'Терпение', 'Внимательность']
    },
    demand: 'high',
    skillFormula: ['Ремонт по диагностике', 'Работа руками с техникой', 'Поиск причины поломки'],
    transferableTo: ['Автомобильный инженер (Беспилотники)', 'Техник по промышленной робототехнике и сварочным комплексам', 'Мастер по ремонту оборудования', 'Электромонтёр (Электрик)'],
    summary: 'Чинит автомобили: находит поломку, ремонтирует узлы и проводит техобслуживание, чтобы машина ехала.',
    why: 'Для тех, кто любит технику и работу руками (Realistic), кому интересно докопаться до причины поломки.'
  },
  {
    id: 'welder',
    name: 'Сварщик',
    industry: 'Инженерия и промышленность',
    tier: 'everyday',
    archetype: 'welder',
    riasec: ['Realistic', 'Conventional', 'Artistic'],
    gardner: ['Bodily-Kinesthetic', 'Spatial-Visual', 'Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'low',
    values: ['achievement', 'security', 'self_direction'],
    viaFit: ['perseverance', 'prudence', 'self_regulation', 'zest'],
    subjects: ['Физика', 'Технология', 'Химия'],
    skills: {
      hard: ['Сварка разными способами', 'Чтение чертежей', 'Подготовка металла', 'Контроль швов'],
      soft: ['Точность рук', 'Собранность', 'Соблюдение техники безопасности']
    },
    demand: 'high',
    skillFormula: ['Точная ручная работа', 'Работа по чертежу', 'Дисциплина безопасности'],
    transferableTo: ['Техник по промышленной робототехнике и сварочным комплексам', 'Слесарь-монтажник', 'Автомеханик (Автослесарь)', 'Мастер участка'],
    summary: 'Соединяет металл сваркой: читает чертёж, готовит детали и варит прочные швы для конструкций.',
    why: 'Подходит тем, у кого твёрдая рука и терпение (Realistic), кто любит видеть готовый результат своего труда.'
  },
  {
    id: 'in-house-lawyer',
    name: 'Юрисконсульт',
    industry: 'Юриспруденция, право и безопасность',
    tier: 'everyday',
    archetype: 'lawyer',
    riasec: ['Conventional', 'Enterprising', 'Investigative'],
    gardner: ['Linguistic', 'Logical-Mathematical', 'Interpersonal'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['security', 'achievement', 'conformity'],
    viaFit: ['judgment', 'honesty', 'prudence', 'perspective'],
    subjects: ['Обществознание', 'Русский язык', 'История'],
    skills: {
      hard: ['Работа с договорами', 'Знание законодательства', 'Правовая экспертиза', 'Сопровождение сделок'],
      soft: ['Аналитичность', 'Аккуратность формулировок', 'Ответственность']
    },
    demand: 'high',
    skillFormula: ['Работа с нормами и текстом', 'Защита интересов', 'Внимание к формулировкам'],
    transferableTo: ['Юрист в сфере IT и интеллектуальной собственности', 'Комплаенс-офицер', 'Международный адвокат', 'Специалист по защите персональных данных (DPO)'],
    summary: 'Юрист компании: составляет договоры, проверяет документы и защищает организацию от правовых рисков.',
    why: 'Для системных и внимательных к тексту (Conventional), кто любит порядок в правилах и умеет отстаивать позицию.'
  },

  // ─── Костяк everyday: услуги, красота, торговля, стройка, госслужба (батч 2) ───
  {
    id: 'chef-cook',
    name: 'Повар',
    industry: 'Сфера услуг, красота и гостеприимство',
    tier: 'everyday',
    archetype: 'cook',
    riasec: ['Realistic', 'Artistic', 'Enterprising'],
    gardner: ['Bodily-Kinesthetic', 'Spatial-Visual', 'Interpersonal'],
    bigFive: { traits: { Conscientiousness: 'high', Extraversion: 'high', Stability: 'high' } },
    cognitiveDemand: 'medium',
    values: ['achievement', 'hedonism', 'self_direction'],
    viaFit: ['creativity', 'zest', 'perseverance', 'teamwork'],
    subjects: ['Технология', 'Биология', 'Химия'],
    skills: {
      hard: ['Приготовление блюд', 'Работа с ножом и оборудованием', 'Составление меню', 'Санитарные нормы'],
      soft: ['Скорость и собранность', 'Командная работа', 'Чувство вкуса']
    },
    demand: 'high',
    skillFormula: ['Творчество в готовке', 'Работа руками в темпе', 'Стабильный результат'],
    transferableTo: ['Кондитер', 'Шеф-повар', 'Технолог общественного питания', 'Управляющий глэмпингом / бутик-отелем'],
    summary: 'Готовит блюда в кафе или ресторане: работает по рецептам, придумывает меню и держит темп на кухне.',
    why: 'Подходит тем, кто любит работать руками и творить (Realistic/Artistic), собран в темпе и получает радость, когда людям вкусно.'
  },
  {
    id: 'waiter',
    name: 'Официант',
    industry: 'Сфера услуг, красота и гостеприимство',
    tier: 'everyday',
    archetype: 'waiter',
    riasec: ['Social', 'Enterprising', 'Conventional'],
    gardner: ['Interpersonal', 'Bodily-Kinesthetic', 'Intrapersonal'],
    bigFive: { traits: { Extraversion: 'high', Agreeableness: 'high', Stability: 'high' } },
    cognitiveDemand: 'low',
    values: ['hedonism', 'achievement', 'benevolence'],
    viaFit: ['social_intelligence', 'zest', 'teamwork', 'humor'],
    subjects: ['Обществознание', 'Русский язык', 'Иностранный язык'],
    skills: {
      hard: ['Обслуживание гостей', 'Знание меню', 'Работа с заказами и кассой', 'Сервировка'],
      soft: ['Дружелюбие', 'Быстрая реакция', 'Стрессоустойчивость']
    },
    demand: 'high',
    skillFormula: ['Общение с гостями', 'Работа в темпе', 'Ориентация на сервис'],
    transferableTo: ['Бариста', 'Администратор (ресепшн)', 'Менеджер по продажам', 'Организатор делового туризма (MICE)'],
    summary: 'Обслуживает гостей в кафе и ресторане: принимает заказы, подаёт блюда и создаёт хорошее настроение.',
    why: 'Для общительных и приветливых (Social), кто любит движение, умеет держать улыбку и быстро реагировать.'
  },
  {
    id: 'barista',
    name: 'Бариста',
    industry: 'Сфера услуг, красота и гостеприимство',
    tier: 'everyday',
    archetype: 'barista',
    riasec: ['Realistic', 'Social', 'Artistic'],
    gardner: ['Bodily-Kinesthetic', 'Interpersonal', 'Spatial-Visual'],
    bigFive: { traits: { Extraversion: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'low',
    values: ['hedonism', 'achievement', 'benevolence'],
    viaFit: ['zest', 'social_intelligence', 'appreciation_of_beauty', 'teamwork'],
    subjects: ['Технология', 'Химия', 'Иностранный язык'],
    skills: {
      hard: ['Приготовление кофе', 'Работа с кофемашиной', 'Латте-арт', 'Обслуживание гостей'],
      soft: ['Приветливость', 'Аккуратность', 'Быстрая работа']
    },
    demand: 'medium',
    skillFormula: ['Ручное мастерство', 'Общение с гостями', 'Стабильное качество'],
    transferableTo: ['Официант', 'Кондитер', 'Администратор (ресепшн)', 'Повар'],
    summary: 'Готовит кофе и напитки: варит эспрессо, рисует латте-арт и общается с гостями кофейни.',
    why: 'Подходит тем, кто любит ручное дело и общение (Realistic/Social), ценит вкус и красоту в мелочах.'
  },
  {
    id: 'hairdresser',
    name: 'Парикмахер',
    industry: 'Сфера услуг, красота и гостеприимство',
    tier: 'everyday',
    archetype: 'beauty-specialist',
    riasec: ['Artistic', 'Realistic', 'Social'],
    gardner: ['Spatial-Visual', 'Bodily-Kinesthetic', 'Interpersonal'],
    bigFive: { traits: { Extraversion: 'high', Openness: 'high', Agreeableness: 'high' } },
    cognitiveDemand: 'low',
    values: ['self_direction', 'hedonism', 'achievement'],
    viaFit: ['creativity', 'appreciation_of_beauty', 'social_intelligence', 'zest'],
    subjects: ['Технология', 'Биология', 'Изобразительное искусство'],
    skills: {
      hard: ['Стрижки и укладки', 'Окрашивание', 'Работа с инструментом', 'Уход за волосами'],
      soft: ['Чувство стиля', 'Общение с клиентом', 'Аккуратность']
    },
    demand: 'high',
    skillFormula: ['Творчество с образом', 'Точная ручная работа', 'Работа с клиентом'],
    transferableTo: ['Косметолог-эстетист', 'Стилист-имиджмейкер', 'Гримёр', 'Мастер маникюра'],
    summary: 'Создаёт причёски: стрижёт, красит и укладывает волосы, помогая людям выглядеть красиво.',
    why: 'Для творческих и общительных (Artistic/Social), у кого точные руки и есть чувство красоты и стиля.'
  },
  {
    id: 'esthetician',
    name: 'Косметолог-эстетист',
    industry: 'Сфера услуг, красота и гостеприимство',
    tier: 'everyday',
    archetype: 'beauty-specialist',
    riasec: ['Social', 'Realistic', 'Investigative'],
    gardner: ['Interpersonal', 'Bodily-Kinesthetic', 'Naturalist'],
    bigFive: { traits: { Agreeableness: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'achievement', 'hedonism'],
    viaFit: ['kindness', 'appreciation_of_beauty', 'prudence', 'social_intelligence'],
    subjects: ['Биология', 'Химия', 'Технология'],
    skills: {
      hard: ['Уход за кожей', 'Косметические процедуры', 'Работа с аппаратами', 'Подбор средств'],
      soft: ['Тактичность', 'Аккуратность', 'Внимание к клиенту']
    },
    demand: 'high',
    skillFormula: ['Забота о внешности', 'Аккуратная процедура', 'Работа с клиентом'],
    transferableTo: ['Парикмахер', 'Мастер маникюра', 'Дерматолог', 'Спа-специалист'],
    summary: 'Заботится о коже клиентов: делает уходовые процедуры, подбирает средства и помогает выглядеть свежо.',
    why: 'Подходит внимательным к людям (Social), кто любит красоту и здоровье и аккуратен в ручной работе.'
  },
  {
    id: 'receptionist',
    name: 'Администратор (ресепшн)',
    industry: 'Сфера услуг, красота и гостеприимство',
    tier: 'everyday',
    archetype: 'receptionist',
    riasec: ['Conventional', 'Social', 'Enterprising'],
    gardner: ['Interpersonal', 'Linguistic', 'Intrapersonal'],
    bigFive: { traits: { Conscientiousness: 'high', Extraversion: 'high', Agreeableness: 'high' } },
    cognitiveDemand: 'low',
    values: ['security', 'benevolence', 'achievement'],
    viaFit: ['social_intelligence', 'teamwork', 'prudence', 'kindness'],
    subjects: ['Русский язык', 'Обществознание', 'Иностранный язык'],
    skills: {
      hard: ['Приём посетителей', 'Запись и расписание', 'Работа с телефоном и почтой', 'Ведение кассы'],
      soft: ['Приветливость', 'Организованность', 'Многозадачность']
    },
    demand: 'high',
    skillFormula: ['Организация потока людей', 'Общение и сервис', 'Порядок в делах'],
    transferableTo: ['Офис-менеджер', 'Официант', 'Менеджер по продажам', 'Управляющий глэмпингом / бутик-отелем'],
    summary: 'Встречает гостей и клиентов: записывает, отвечает на вопросы и держит порядок на ресепшене.',
    why: 'Для организованных и приветливых (Conventional/Social), кто любит порядок и умеет спокойно вести много дел сразу.'
  },
  {
    id: 'retail-consultant',
    name: 'Продавец-консультант',
    industry: 'Торговля и продажи',
    tier: 'everyday',
    archetype: 'retail-seller',
    riasec: ['Enterprising', 'Social', 'Conventional'],
    gardner: ['Interpersonal', 'Linguistic', 'Bodily-Kinesthetic'],
    bigFive: { traits: { Extraversion: 'high', Agreeableness: 'high' } },
    cognitiveDemand: 'low',
    values: ['achievement', 'benevolence', 'security'],
    viaFit: ['social_intelligence', 'zest', 'kindness', 'perseverance'],
    subjects: ['Обществознание', 'Русский язык', 'Математика'],
    skills: {
      hard: ['Консультирование по товару', 'Работа с кассой', 'Выкладка и учёт', 'Оформление продаж'],
      soft: ['Общительность', 'Доброжелательность', 'Терпение']
    },
    demand: 'high',
    skillFormula: ['Помощь с выбором', 'Общение с людьми', 'Работа на результат'],
    transferableTo: ['Менеджер по продажам', 'Кассир', 'Мерчендайзер', 'Администратор (ресепшн)'],
    summary: 'Помогает покупателям в магазине: советует товар, отвечает на вопросы и оформляет покупку.',
    why: 'Подходит общительным и доброжелательным (Enterprising/Social), кто любит помогать людям с выбором.'
  },
  {
    id: 'cashier',
    name: 'Кассир',
    industry: 'Торговля и продажи',
    tier: 'everyday',
    archetype: 'cashier',
    riasec: ['Conventional', 'Social', 'Realistic'],
    gardner: ['Logical-Mathematical', 'Interpersonal', 'Bodily-Kinesthetic'],
    bigFive: { traits: { Conscientiousness: 'high', Agreeableness: 'high' } },
    cognitiveDemand: 'low',
    values: ['security', 'conformity', 'benevolence'],
    viaFit: ['honesty', 'prudence', 'self_regulation', 'kindness'],
    subjects: ['Математика', 'Обществознание', 'Русский язык'],
    skills: {
      hard: ['Работа с кассой и терминалом', 'Расчёт с покупателями', 'Учёт денег', 'Оформление чеков'],
      soft: ['Внимательность', 'Честность', 'Приветливость']
    },
    demand: 'high',
    skillFormula: ['Точность с деньгами', 'Быстрая работа', 'Вежливый сервис'],
    transferableTo: ['Продавец-консультант', 'Бухгалтер', 'Администратор (ресепшн)', 'Операционист банка'],
    summary: 'Рассчитывает покупателей на кассе: пробивает товары, принимает оплату и ведёт учёт денег.',
    why: 'Для внимательных и честных (Conventional), кто аккуратен с деньгами и приветлив с людьми.'
  },
  {
    id: 'builder-mason',
    name: 'Строитель (Каменщик)',
    industry: 'Строительство и ремонт',
    tier: 'everyday',
    archetype: 'builder',
    riasec: ['Realistic', 'Conventional', 'Investigative'],
    gardner: ['Bodily-Kinesthetic', 'Spatial-Visual', 'Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'low',
    values: ['achievement', 'security', 'self_direction'],
    viaFit: ['perseverance', 'teamwork', 'zest', 'prudence'],
    subjects: ['Технология', 'Физика', 'Математика'],
    skills: {
      hard: ['Кладка и монтаж', 'Чтение чертежей', 'Работа с инструментом', 'Разметка'],
      soft: ['Выносливость', 'Работа в бригаде', 'Аккуратность']
    },
    demand: 'high',
    skillFormula: ['Строить руками по плану', 'Физический труд', 'Работа в команде'],
    transferableTo: ['Прораб (Мастер участка)', 'Маляр-штукатур', 'Плиточник', 'Инженер-строитель (Конструктор)'],
    summary: 'Возводит здания: кладёт стены, работает по чертежам и своими руками создаёт дома и объекты.',
    why: 'Подходит тем, кто любит физическую работу руками (Realistic), видит результат в готовой стройке и умеет работать в бригаде.'
  },
  {
    id: 'plasterer-painter',
    name: 'Маляр-штукатур',
    industry: 'Строительство и ремонт',
    tier: 'everyday',
    archetype: 'finisher',
    riasec: ['Realistic', 'Artistic', 'Conventional'],
    gardner: ['Bodily-Kinesthetic', 'Spatial-Visual', 'Naturalist'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'low',
    values: ['achievement', 'security', 'self_direction'],
    viaFit: ['perseverance', 'appreciation_of_beauty', 'prudence', 'self_regulation'],
    subjects: ['Технология', 'Физика', 'Изобразительное искусство'],
    skills: {
      hard: ['Штукатурка и шпаклёвка', 'Покраска поверхностей', 'Подготовка стен', 'Работа с материалами'],
      soft: ['Аккуратность', 'Терпение', 'Глазомер']
    },
    demand: 'high',
    skillFormula: ['Ровная ручная работа', 'Внимание к результату', 'Работа с материалом'],
    transferableTo: ['Строитель (Каменщик)', 'Плиточник', 'Дизайнер интерьера', 'Прораб (Мастер участка)'],
    summary: 'Отделывает помещения: штукатурит, шпаклюет и красит стены, делая ремонт ровным и красивым.',
    why: 'Для аккуратных и терпеливых (Realistic), у кого хороший глазомер и кто любит доводить поверхность до идеала.'
  },
  {
    id: 'plumber',
    name: 'Сантехник',
    industry: 'Строительство и ремонт',
    tier: 'everyday',
    archetype: 'plumber',
    riasec: ['Realistic', 'Investigative', 'Conventional'],
    gardner: ['Bodily-Kinesthetic', 'Spatial-Visual', 'Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'low',
    values: ['security', 'achievement', 'self_direction'],
    viaFit: ['judgment', 'perseverance', 'prudence', 'zest'],
    subjects: ['Физика', 'Технология', 'Математика'],
    skills: {
      hard: ['Монтаж труб и сантехники', 'Устранение протечек', 'Чтение схем', 'Работа с инструментом'],
      soft: ['Смекалка', 'Аккуратность', 'Ответственность']
    },
    demand: 'high',
    skillFormula: ['Ремонт по диагностике', 'Работа руками с системами', 'Поиск причины'],
    transferableTo: ['Электромонтёр (Электрик)', 'Строитель (Каменщик)', 'Мастер по ремонту оборудования', 'Инженер по отоплению и вентиляции'],
    summary: 'Монтирует и чинит водопровод и отопление: ставит трубы, устраняет протечки и налаживает сантехнику.',
    why: 'Подходит практичным и сообразительным (Realistic/Investigative), кто любит чинить и докапываться до причины поломки.'
  },
  {
    id: 'construction-foreman',
    name: 'Прораб (Мастер участка)',
    industry: 'Строительство и ремонт',
    tier: 'everyday',
    archetype: 'construction-foreman',
    riasec: ['Enterprising', 'Realistic', 'Conventional'],
    gardner: ['Logical-Mathematical', 'Interpersonal', 'Spatial-Visual'],
    bigFive: { traits: { Conscientiousness: 'high', Extraversion: 'high', Stability: 'high' } },
    cognitiveDemand: 'medium',
    values: ['achievement', 'power', 'security'],
    viaFit: ['leadership', 'judgment', 'perseverance', 'teamwork'],
    subjects: ['Математика', 'Физика', 'Технология'],
    skills: {
      hard: ['Организация работ на объекте', 'Чтение проектной документации', 'Контроль качества', 'Учёт материалов'],
      soft: ['Управление бригадой', 'Ответственность', 'Умение решать проблемы']
    },
    demand: 'high',
    skillFormula: ['Организация людей и работ', 'Контроль результата', 'Практическое планирование'],
    transferableTo: ['Инженер-строитель (Конструктор)', 'Строитель (Каменщик)', 'Менеджер по управлению изменениями', 'Проектировщик умных городов'],
    summary: 'Руководит стройкой на участке: организует бригады, следит за качеством и сроками работ.',
    why: 'Для организаторов с практической жилкой (Enterprising/Realistic), кто умеет вести людей и отвечать за результат.'
  },
  {
    id: 'building-architect',
    name: 'Архитектор (зданий)',
    industry: 'Строительство и ремонт',
    tier: 'everyday',
    archetype: 'architect',
    riasec: ['Artistic', 'Investigative', 'Realistic'],
    gardner: ['Spatial-Visual', 'Logical-Mathematical', 'Bodily-Kinesthetic'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'universalism'],
    viaFit: ['creativity', 'appreciation_of_beauty', 'judgment', 'perspective'],
    subjects: ['Математика', 'Физика', 'Изобразительное искусство'],
    skills: {
      hard: ['Проектирование зданий', 'Работа в CAD', 'Расчёт конструкций', 'Нормы и ГОСТы'],
      soft: ['Пространственное мышление', 'Чувство эстетики', 'Внимательность']
    },
    demand: 'medium',
    skillFormula: ['Проектное мышление', 'Красота и функция', 'Работа с расчётами'],
    transferableTo: ['Инженер-строитель (Конструктор)', 'Проектировщик умных городов', 'Дизайнер интерьера', 'Ландшафтный архитектор'],
    summary: 'Проектирует здания: рисует чертежи, рассчитывает конструкции и придумывает, как дом будет выглядеть и работать.',
    why: 'Подходит творческим и точным (Artistic/Investigative), кто мыслит пространством и любит соединять красоту с расчётом.'
  },
  {
    id: 'police-officer',
    name: 'Полицейский',
    industry: 'Госслужба, безопасность и оборона',
    tier: 'everyday',
    archetype: 'law-enforcement-officer',
    riasec: ['Realistic', 'Social', 'Conventional'],
    gardner: ['Bodily-Kinesthetic', 'Interpersonal', 'Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high', Extraversion: 'high' } },
    cognitiveDemand: 'medium',
    values: ['security', 'conformity', 'benevolence'],
    viaFit: ['bravery', 'fairness', 'self_regulation', 'perseverance'],
    subjects: ['Обществознание', 'Физическая культура', 'Право'],
    skills: {
      hard: ['Охрана порядка', 'Оформление протоколов', 'Знание законов', 'Физическая и тактическая подготовка'],
      soft: ['Решительность', 'Самообладание', 'Ответственность']
    },
    demand: 'high',
    skillFormula: ['Защита порядка', 'Действие под давлением', 'Работа по закону'],
    transferableTo: ['Пожарный-спасатель', 'Военнослужащий (офицер)', 'Специалист по кибербезопасности', 'Юрисконсульт'],
    summary: 'Охраняет порядок и безопасность людей: предотвращает и раскрывает нарушения, помогает попавшим в беду.',
    why: 'Для смелых и дисциплинированных (Realistic/Social), кто ценит справедливость и готов защищать других.'
  },
  {
    id: 'firefighter',
    name: 'Пожарный-спасатель',
    industry: 'Госслужба, безопасность и оборона',
    tier: 'everyday',
    archetype: 'rescue-worker',
    riasec: ['Realistic', 'Social', 'Investigative'],
    gardner: ['Bodily-Kinesthetic', 'Interpersonal', 'Spatial-Visual'],
    bigFive: { traits: { Stability: 'high', Conscientiousness: 'high', Extraversion: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'security', 'achievement'],
    viaFit: ['bravery', 'teamwork', 'zest', 'perseverance'],
    subjects: ['Физическая культура', 'Физика', 'ОБЖ'],
    skills: {
      hard: ['Тушение пожаров', 'Спасательные операции', 'Работа со снаряжением', 'Первая помощь'],
      soft: ['Смелость', 'Работа в команде', 'Хладнокровие']
    },
    demand: 'high',
    skillFormula: ['Спасение в критической ситуации', 'Физическая готовность', 'Командное действие'],
    transferableTo: ['Полицейский', 'Военнослужащий (офицер)', 'Кинезиотерапевт (Реабилитолог)', 'Инструктор по безопасности'],
    summary: 'Спасает людей и тушит пожары: выезжает на ЧП, работает со снаряжением и оказывает первую помощь.',
    why: 'Подходит смелым и физически крепким (Realistic/Social), кто хочет спасать людей и не теряется в опасности.'
  },
  {
    id: 'military-officer',
    name: 'Военнослужащий (офицер)',
    industry: 'Госслужба, безопасность и оборона',
    tier: 'dream',
    archetype: 'military-officer',
    riasec: ['Realistic', 'Enterprising', 'Conventional'],
    gardner: ['Bodily-Kinesthetic', 'Logical-Mathematical', 'Interpersonal'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high', Extraversion: 'high' } },
    cognitiveDemand: 'medium',
    values: ['security', 'power', 'tradition'],
    viaFit: ['bravery', 'leadership', 'perseverance', 'teamwork'],
    subjects: ['Физическая культура', 'История', 'ОБЖ'],
    skills: {
      hard: ['Тактическая подготовка', 'Командование подразделением', 'Работа с техникой и связью', 'Военная дисциплина'],
      soft: ['Лидерство', 'Дисциплина', 'Стрессоустойчивость']
    },
    demand: 'medium',
    skillFormula: ['Лидерство под давлением', 'Дисциплина и порядок', 'Командная работа'],
    transferableTo: ['Полицейский', 'Пожарный-спасатель', 'Специалист по кибербезопасности', 'Логист по управлению цепочками поставок'],
    summary: 'Служит в армии и командует подразделением: отвечает за подготовку, дисциплину и выполнение задач.',
    why: 'Для дисциплинированных лидеров (Realistic/Enterprising), кто готов служить, вести за собой и держаться в трудных условиях. Честно: путь требует присяги, длительной подготовки и связан с риском — план Б через смежные роли безопасности.'
  },

  // ─── Транспорт, творческие и офисные профессии (батч 3) ───
  {
    id: 'long-haul-driver',
    name: 'Водитель-дальнобойщик',
    industry: 'Транспорт, логистика и беспилотные системы',
    tier: 'everyday',
    archetype: 'professional-driver',
    riasec: ['Realistic', 'Conventional', 'Investigative'],
    gardner: ['Bodily-Kinesthetic', 'Spatial-Visual', 'Intrapersonal'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'low',
    values: ['self_direction', 'security', 'achievement'],
    viaFit: ['perseverance', 'prudence', 'self_regulation', 'bravery'],
    subjects: ['Технология', 'География', 'ОБЖ'],
    skills: {
      hard: ['Управление грузовым транспортом', 'Планирование маршрута', 'Базовый ремонт в дороге', 'Оформление документов груза'],
      soft: ['Выносливость', 'Самостоятельность', 'Внимательность']
    },
    demand: 'high',
    skillFormula: ['Управление техникой', 'Самостоятельность в пути', 'Ответственность за груз'],
    transferableTo: ['Водитель автобуса', 'Логист по управлению цепочками поставок', 'Автомеханик (Автослесарь)', 'Оператор флота беспилотных аппаратов'],
    summary: 'Перевозит грузы на дальние расстояния: водит фуру, отвечает за груз и планирует долгий маршрут.',
    why: 'Подходит самостоятельным и выносливым (Realistic), кто любит дорогу, технику и спокойно переносит долгие смены в одиночку.'
  },
  {
    id: 'train-operator',
    name: 'Машинист поезда',
    industry: 'Транспорт, логистика и беспилотные системы',
    tier: 'everyday',
    archetype: 'train-operator',
    riasec: ['Realistic', 'Conventional', 'Investigative'],
    gardner: ['Bodily-Kinesthetic', 'Logical-Mathematical', 'Intrapersonal'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'medium',
    values: ['security', 'conformity', 'achievement'],
    viaFit: ['self_regulation', 'prudence', 'perseverance', 'judgment'],
    subjects: ['Физика', 'Технология', 'Математика'],
    skills: {
      hard: ['Управление локомотивом', 'Знание сигналов и правил', 'Контроль состава', 'Действия при неисправностях'],
      soft: ['Концентрация', 'Дисциплина', 'Спокойствие']
    },
    demand: 'high',
    skillFormula: ['Точность и дисциплина', 'Управление сложной техникой', 'Спокойствие в ответственности'],
    transferableTo: ['Водитель-дальнобойщик', 'Диспетчер автономных портов/складов', 'Оператор флота беспилотных аппаратов', 'Техник по промышленной робототехнике и сварочным комплексам'],
    summary: 'Ведёт поезд по маршруту: управляет локомотивом, следит за сигналами и отвечает за безопасность состава.',
    why: 'Для собранных и дисциплинированных (Realistic/Conventional), кто держит концентрацию часами и ценит порядок и безопасность.'
  },
  {
    id: 'courier',
    name: 'Курьер',
    industry: 'Транспорт, логистика и беспилотные системы',
    tier: 'everyday',
    archetype: 'courier',
    riasec: ['Realistic', 'Enterprising', 'Conventional'],
    gardner: ['Bodily-Kinesthetic', 'Spatial-Visual', 'Interpersonal'],
    bigFive: { traits: { Conscientiousness: 'high', Extraversion: 'high' } },
    cognitiveDemand: 'low',
    values: ['self_direction', 'achievement', 'security'],
    viaFit: ['zest', 'perseverance', 'social_intelligence', 'self_regulation'],
    subjects: ['География', 'Физическая культура', 'Обществознание'],
    skills: {
      hard: ['Доставка заказов', 'Навигация по городу', 'Работа с приложением', 'Приём оплаты'],
      soft: ['Пунктуальность', 'Мобильность', 'Вежливость']
    },
    demand: 'high',
    skillFormula: ['Мобильность в городе', 'Пунктуальность', 'Клиентская вежливость'],
    transferableTo: ['Водитель-дальнобойщик', 'Логист по управлению цепочками поставок', 'Кладовщик', 'Продавец-консультант'],
    summary: 'Доставляет заказы клиентам: быстро находит адрес, привозит вовремя и вежливо передаёт покупку.',
    why: 'Подходит энергичным и самостоятельным (Realistic/Enterprising), кто любит движение и не сидит на месте.'
  },
  {
    id: 'warehouse-keeper',
    name: 'Кладовщик',
    industry: 'Транспорт, логистика и беспилотные системы',
    tier: 'everyday',
    archetype: 'warehouse-keeper',
    riasec: ['Conventional', 'Realistic', 'Investigative'],
    gardner: ['Logical-Mathematical', 'Bodily-Kinesthetic', 'Spatial-Visual'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'low',
    values: ['security', 'conformity', 'achievement'],
    viaFit: ['prudence', 'perseverance', 'honesty', 'teamwork'],
    subjects: ['Математика', 'Технология', 'Информатика'],
    skills: {
      hard: ['Приём и отгрузка товара', 'Учёт на складе', 'Работа со сканером и WMS', 'Инвентаризация'],
      soft: ['Аккуратность', 'Организованность', 'Ответственность']
    },
    demand: 'high',
    skillFormula: ['Порядок в запасах', 'Точный учёт', 'Физическая работа по системе'],
    transferableTo: ['Логист по управлению цепочками поставок', 'Диспетчер автономных портов/складов', 'Курьер', 'Мерчендайзер'],
    summary: 'Ведёт склад: принимает и выдаёт товар, считает остатки и держит запасы в порядке.',
    why: 'Для аккуратных и системных (Conventional/Realistic), кто любит порядок и точный учёт вещей.'
  },
  {
    id: 'photographer',
    name: 'Фотограф',
    industry: 'Дизайн и креативные индустрии',
    tier: 'everyday',
    archetype: 'photographer',
    riasec: ['Artistic', 'Realistic', 'Enterprising'],
    gardner: ['Spatial-Visual', 'Bodily-Kinesthetic', 'Interpersonal'],
    bigFive: { traits: { Openness: 'high', Extraversion: 'high' } },
    cognitiveDemand: 'medium',
    values: ['self_direction', 'achievement', 'hedonism'],
    viaFit: ['creativity', 'appreciation_of_beauty', 'social_intelligence', 'curiosity'],
    subjects: ['Изобразительное искусство', 'Информатика', 'Физика'],
    skills: {
      hard: ['Съёмка и композиция', 'Работа со светом', 'Обработка фото', 'Работа с камерой и оптикой'],
      soft: ['Художественный вкус', 'Общение с моделью', 'Внимательность к деталям']
    },
    demand: 'medium',
    skillFormula: ['Видеть кадр', 'Работа со светом и образом', 'Обработка изображения'],
    transferableTo: ['Видеомонтажер', 'Графический дизайнер', 'Оператор БПЛА', 'Контент-мейкер'],
    summary: 'Создаёт фотографии: выстраивает кадр, работает со светом и обрабатывает снимки для людей и брендов.',
    why: 'Подходит творческим и наблюдательным (Artistic), у кого есть вкус к красоте и кто умеет ловить момент.'
  },
  {
    id: 'actor',
    name: 'Актёр',
    industry: 'Дизайн и креативные индустрии',
    tier: 'dream',
    archetype: 'performer',
    riasec: ['Artistic', 'Enterprising', 'Social'],
    gardner: ['Bodily-Kinesthetic', 'Linguistic', 'Interpersonal'],
    bigFive: { traits: { Openness: 'high', Extraversion: 'high' } },
    cognitiveDemand: 'medium',
    values: ['self_direction', 'stimulation', 'achievement'],
    viaFit: ['creativity', 'zest', 'bravery', 'social_intelligence'],
    subjects: ['Литература', 'Музыка', 'Русский язык'],
    skills: {
      hard: ['Актёрское мастерство', 'Работа с текстом и ролью', 'Сценическая речь', 'Пластика'],
      soft: ['Эмоциональность', 'Смелость на сцене', 'Работа в ансамбле']
    },
    demand: 'low',
    skillFormula: ['Перевоплощение', 'Публичное выступление', 'Эмоциональная выразительность'],
    transferableTo: ['Ведущий мероприятий', 'Подкастер (Интервьюер)', 'Педагог по актёрскому мастерству', 'Сценарист игр (Нарративный дизайнер)'],
    summary: 'Играет роли в театре и кино: перевоплощается в персонажей и передаёт зрителю их чувства и историю.',
    why: 'Для ярких и смелых (Artistic/Enterprising), кто любит сцену и внимание. Честно: профессия конкурсная и нестабильная — важен план Б через речь, преподавание и ведение мероприятий.'
  },
  {
    id: 'musician',
    name: 'Музыкант',
    industry: 'Дизайн и креативные индустрии',
    tier: 'dream',
    archetype: 'musician',
    riasec: ['Artistic', 'Realistic', 'Enterprising'],
    gardner: ['Musical', 'Bodily-Kinesthetic', 'Intrapersonal'],
    bigFive: { traits: { Openness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['self_direction', 'stimulation', 'hedonism'],
    viaFit: ['creativity', 'appreciation_of_beauty', 'perseverance', 'zest'],
    subjects: ['Музыка', 'Литература', 'Физика'],
    skills: {
      hard: ['Игра на инструменте', 'Нотная грамота', 'Работа в студии', 'Аранжировка'],
      soft: ['Музыкальный слух', 'Дисциплина в репетициях', 'Артистизм']
    },
    demand: 'low',
    skillFormula: ['Музыкальное творчество', 'Долгая тренировка мастерства', 'Выступление на публике'],
    transferableTo: ['Педагог по музыке', 'Звукорежиссёр', 'Композитор для игр и медиа', 'Ведущий мероприятий'],
    summary: 'Исполняет и создаёт музыку: играет на инструменте, репетирует и выступает для слушателей.',
    why: 'Для творческих с музыкальным слухом (Artistic/Musical), кто готов много тренироваться. Честно: путь конкурсный — план Б через преподавание и работу со звуком.'
  },
  {
    id: 'office-manager',
    name: 'Секретарь / Офис-менеджер',
    industry: 'Управление и бизнес-консалтинг',
    tier: 'everyday',
    archetype: 'office-administrator',
    riasec: ['Conventional', 'Social', 'Enterprising'],
    gardner: ['Linguistic', 'Interpersonal', 'Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high', Extraversion: 'high', Agreeableness: 'high' } },
    cognitiveDemand: 'low',
    values: ['security', 'benevolence', 'achievement'],
    viaFit: ['prudence', 'teamwork', 'social_intelligence', 'perseverance'],
    subjects: ['Русский язык', 'Информатика', 'Обществознание'],
    skills: {
      hard: ['Ведение документооборота', 'Организация встреч и поездок', 'Работа с офисными программами', 'Деловая переписка'],
      soft: ['Организованность', 'Многозадачность', 'Коммуникабельность']
    },
    demand: 'high',
    skillFormula: ['Организация процессов', 'Порядок в делах', 'Деловое общение'],
    transferableTo: ['Администратор (ресепшн)', 'HR-рекрутер', 'Личный помощник руководителя', 'Project-менеджер'],
    summary: 'Держит офис в порядке: ведёт документы, организует встречи и помогает команде работать без сбоев.',
    why: 'Подходит организованным и общительным (Conventional/Social), кто любит порядок и умеет вести много дел одновременно.'
  },
  {
    id: 'recruiter',
    name: 'HR-рекрутер',
    industry: 'Управление и бизнес-консалтинг',
    tier: 'everyday',
    archetype: 'recruiter',
    riasec: ['Social', 'Enterprising', 'Conventional'],
    gardner: ['Interpersonal', 'Linguistic', 'Intrapersonal'],
    bigFive: { traits: { Extraversion: 'high', Agreeableness: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'achievement', 'security'],
    viaFit: ['social_intelligence', 'judgment', 'kindness', 'fairness'],
    subjects: ['Обществознание', 'Русский язык', 'Психология'],
    skills: {
      hard: ['Поиск и отбор кандидатов', 'Проведение интервью', 'Оценка компетенций', 'Работа с базами резюме'],
      soft: ['Понимание людей', 'Коммуникабельность', 'Организованность']
    },
    demand: 'high',
    skillFormula: ['Понимание людей', 'Оценка и подбор', 'Деловое общение'],
    transferableTo: ['HR-бизнес-партнер', 'Карьерный консультант', 'Менеджер по продажам', 'Тьютор / Профориентолог'],
    summary: 'Подбирает людей в команды: ищет кандидатов, проводит собеседования и помогает найти подходящую работу.',
    why: 'Для общительных и наблюдательных (Social/Enterprising), кто хорошо чувствует людей и любит соединять их с делом.'
  },
  {
    id: 'economist',
    name: 'Экономист',
    industry: 'Финансовые технологии и инвестиции',
    tier: 'everyday',
    archetype: 'economist',
    riasec: ['Investigative', 'Conventional', 'Enterprising'],
    gardner: ['Logical-Mathematical', 'Linguistic', 'Intrapersonal'],
    bigFive: { traits: { Conscientiousness: 'high', Openness: 'high' } },
    cognitiveDemand: 'high',
    values: ['achievement', 'security', 'self_direction'],
    viaFit: ['judgment', 'curiosity', 'prudence', 'perseverance'],
    subjects: ['Математика', 'Обществознание', 'Информатика'],
    skills: {
      hard: ['Экономический анализ', 'Планирование и бюджеты', 'Работа со статистикой', 'Финансовые расчёты'],
      soft: ['Аналитическое мышление', 'Внимательность', 'Системность']
    },
    demand: 'high',
    skillFormula: ['Анализ цифр и рынков', 'Планирование ресурсов', 'Системное мышление'],
    transferableTo: ['Финансовый аналитик', 'Бухгалтер', 'Бизнес-консультант', 'Аналитик данных'],
    summary: 'Анализирует деньги и ресурсы: считает бюджеты, изучает рынок и помогает принимать выгодные решения.',
    why: 'Подходит аналитичным и системным (Investigative/Conventional), кто дружит с цифрами и любит понимать, как устроена экономика.'
  },
  {
    id: 'insurance-agent',
    name: 'Страховой агент',
    industry: 'Финансовые технологии и инвестиции',
    tier: 'everyday',
    archetype: 'insurance-agent',
    riasec: ['Enterprising', 'Social', 'Conventional'],
    gardner: ['Interpersonal', 'Linguistic', 'Logical-Mathematical'],
    bigFive: { traits: { Extraversion: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['security', 'achievement', 'benevolence'],
    viaFit: ['social_intelligence', 'honesty', 'prudence', 'perseverance'],
    subjects: ['Обществознание', 'Математика', 'Русский язык'],
    skills: {
      hard: ['Подбор страховых продуктов', 'Оценка рисков клиента', 'Оформление полисов', 'Ведение клиентской базы'],
      soft: ['Убедительность', 'Внимательность', 'Ответственность']
    },
    demand: 'medium',
    skillFormula: ['Работа с клиентом', 'Оценка рисков', 'Убеждение и доверие'],
    transferableTo: ['Менеджер по продажам', 'Финансовый советник', 'Риск-менеджер', 'Банковский консультант'],
    summary: 'Помогает людям застраховать здоровье и имущество: подбирает полис, объясняет условия и оформляет договор.',
    why: 'Для общительных и ответственных (Enterprising/Social), кто умеет объяснять и заботится о защите людей от рисков.'
  },
  {
    id: 'massage-therapist',
    name: 'Массажист',
    industry: 'Медицина и здравоохранение',
    tier: 'everyday',
    archetype: 'massage-therapist',
    riasec: ['Realistic', 'Social', 'Investigative'],
    gardner: ['Bodily-Kinesthetic', 'Interpersonal', 'Naturalist'],
    bigFive: { traits: { Agreeableness: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'low',
    values: ['benevolence', 'security', 'hedonism'],
    viaFit: ['kindness', 'self_regulation', 'social_intelligence', 'perseverance'],
    subjects: ['Биология', 'Физическая культура', 'Химия'],
    skills: {
      hard: ['Техники массажа', 'Знание анатомии', 'Работа с мышцами и суставами', 'Оздоровительные процедуры'],
      soft: ['Чуткие руки', 'Забота о человеке', 'Выносливость']
    },
    demand: 'high',
    skillFormula: ['Работа руками с телом', 'Забота о здоровье', 'Знание анатомии'],
    transferableTo: ['Кинезиотерапевт (Реабилитолог)', 'Персональный фитнес-коуч', 'Косметолог-эстетист', 'Спортивный диетолог / Нутрициолог'],
    summary: 'Оздоравливает тело руками: делает массаж, снимает напряжение мышц и помогает восстановиться.',
    why: 'Подходит заботливым с хорошими руками (Realistic/Social), кому интересна анатомия и приятно помогать людям чувствовать себя лучше.'
  },
  {
    id: 'paramedic',
    name: 'Фельдшер',
    industry: 'Медицина и здравоохранение',
    tier: 'everyday',
    archetype: 'nurse',
    riasec: ['Social', 'Realistic', 'Investigative'],
    gardner: ['Interpersonal', 'Bodily-Kinesthetic', 'Logical-Mathematical'],
    bigFive: { traits: { Stability: 'high', Conscientiousness: 'high', Agreeableness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'security', 'achievement'],
    viaFit: ['bravery', 'kindness', 'judgment', 'self_regulation'],
    subjects: ['Биология', 'Химия', 'ОБЖ'],
    skills: {
      hard: ['Неотложная помощь', 'Первичная диагностика', 'Работа на скорой', 'Медицинские процедуры'],
      soft: ['Хладнокровие', 'Быстрое решение', 'Забота о пациенте']
    },
    demand: 'high',
    skillFormula: ['Помощь в критической ситуации', 'Клиническое решение', 'Спокойствие под давлением'],
    transferableTo: ['Медицинская сестра', 'Врач-терапевт', 'Пожарный-спасатель', 'Кинезиотерапевт (Реабилитолог)'],
    summary: 'Оказывает первую медицинскую помощь: работает на скорой, ставит первичный диагноз и спасает в неотложных случаях.',
    why: 'Для смелых и собранных (Social/Realistic), кто хочет помогать людям и не теряется, когда нужно действовать быстро.'
  },

  // ─── Расширение охвата: ремёсла, услуги, агро, образование, творчество (батч 4) ───
  {
    id: 'seamstress',
    name: 'Швея / Портной',
    industry: 'Сфера услуг, красота и гостеприимство',
    tier: 'everyday',
    archetype: 'seamstress',
    riasec: ['Realistic', 'Artistic', 'Conventional'],
    gardner: ['Bodily-Kinesthetic', 'Spatial-Visual', 'Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high', Openness: 'high' } },
    cognitiveDemand: 'low',
    values: ['achievement', 'self_direction', 'security'],
    viaFit: ['creativity', 'perseverance', 'appreciation_of_beauty', 'prudence'],
    subjects: ['Технология', 'Изобразительное искусство', 'Математика'],
    skills: {
      hard: ['Пошив и раскрой', 'Работа на швейной машине', 'Снятие мерок', 'Ремонт одежды'],
      soft: ['Аккуратность', 'Терпение', 'Чувство стиля']
    },
    demand: 'medium',
    skillFormula: ['Точная ручная работа', 'Работа с материалом', 'Внимание к деталям'],
    transferableTo: ['Цифровой модельер', 'Дизайнер одежды', 'Модельер-конструктор', 'Мастер по коже'],
    summary: 'Шьёт и подгоняет одежду: снимает мерки, кроит ткань и создаёт или ремонтирует вещи.',
    why: 'Подходит усидчивым с точными руками (Realistic/Artistic), кто любит создавать вещи и видеть готовый результат.'
  },
  {
    id: 'pastry-chef',
    name: 'Кондитер',
    industry: 'Сфера услуг, красота и гостеприимство',
    tier: 'everyday',
    archetype: 'cook',
    riasec: ['Realistic', 'Artistic', 'Conventional'],
    gardner: ['Bodily-Kinesthetic', 'Spatial-Visual', 'Naturalist'],
    bigFive: { traits: { Conscientiousness: 'high', Openness: 'high' } },
    cognitiveDemand: 'low',
    values: ['achievement', 'hedonism', 'self_direction'],
    viaFit: ['creativity', 'appreciation_of_beauty', 'perseverance', 'zest'],
    subjects: ['Технология', 'Химия', 'Изобразительное искусство'],
    skills: {
      hard: ['Приготовление десертов', 'Работа с тестом и кремом', 'Украшение изделий', 'Рецептура и дозировки'],
      soft: ['Аккуратность', 'Творческий вкус', 'Терпение']
    },
    demand: 'high',
    skillFormula: ['Творчество во вкусе и форме', 'Точность рецептуры', 'Ручное мастерство'],
    transferableTo: ['Повар', 'Шоколатье', 'Технолог пищевого производства', 'Бариста'],
    summary: 'Готовит десерты и выпечку: печёт торты и пирожные, украшает их и радует людей сладким.',
    why: 'Для творческих и аккуратных (Realistic/Artistic), кто любит точность в рецептах и красоту в мелочах.'
  },
  {
    id: 'florist',
    name: 'Флорист',
    industry: 'Сфера услуг, красота и гостеприимство',
    tier: 'everyday',
    archetype: 'florist',
    riasec: ['Artistic', 'Realistic', 'Social'],
    gardner: ['Spatial-Visual', 'Naturalist', 'Interpersonal'],
    bigFive: { traits: { Openness: 'high', Agreeableness: 'high' } },
    cognitiveDemand: 'low',
    values: ['self_direction', 'hedonism', 'benevolence'],
    viaFit: ['creativity', 'appreciation_of_beauty', 'kindness', 'zest'],
    subjects: ['Биология', 'Изобразительное искусство', 'Технология'],
    skills: {
      hard: ['Составление букетов', 'Уход за растениями', 'Флористический декор', 'Работа с клиентом'],
      soft: ['Художественный вкус', 'Аккуратность', 'Доброжелательность']
    },
    demand: 'medium',
    skillFormula: ['Красота из природного', 'Ручная композиция', 'Работа с людьми'],
    transferableTo: ['Ландшафтный дизайнер', 'Декоратор мероприятий', 'Садовод', 'Дизайнер интерьера'],
    summary: 'Создаёт букеты и композиции из цветов: подбирает растения, оформляет праздники и радует людей красотой.',
    why: 'Подходит творческим и внимательным к красоте (Artistic), кто любит растения и хочет дарить людям хорошее настроение.'
  },
  {
    id: 'cnc-operator',
    name: 'Оператор станков с ЧПУ',
    industry: 'Инженерия и промышленность',
    tier: 'everyday',
    archetype: 'machinist',
    riasec: ['Realistic', 'Conventional', 'Investigative'],
    gardner: ['Spatial-Visual', 'Logical-Mathematical', 'Bodily-Kinesthetic'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'medium',
    values: ['achievement', 'security', 'self_direction'],
    viaFit: ['prudence', 'judgment', 'perseverance', 'curiosity'],
    subjects: ['Математика', 'Физика', 'Информатика'],
    skills: {
      hard: ['Управление станком с ЧПУ', 'Чтение чертежей', 'Настройка программ обработки', 'Контроль размеров'],
      soft: ['Точность', 'Внимательность', 'Техническое мышление']
    },
    demand: 'high',
    skillFormula: ['Точная обработка по программе', 'Работа с числовым управлением', 'Контроль качества'],
    transferableTo: ['Техник по промышленной робототехнике и сварочным комплексам', 'Слесарь-ремонтник', 'Инженер-технолог', 'Специалист по 3D-печати'],
    summary: 'Управляет станками с числовым управлением: настраивает программу, следит за обработкой и точностью деталей.',
    why: 'Для точных и технических (Realistic/Conventional), кто дружит с математикой и любит работать со сложным оборудованием.'
  },
  {
    id: 'maintenance-fitter',
    name: 'Слесарь-ремонтник',
    industry: 'Инженерия и промышленность',
    tier: 'everyday',
    archetype: 'fitter',
    riasec: ['Realistic', 'Investigative', 'Conventional'],
    gardner: ['Bodily-Kinesthetic', 'Logical-Mathematical', 'Spatial-Visual'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'low',
    values: ['achievement', 'security', 'self_direction'],
    viaFit: ['judgment', 'perseverance', 'prudence', 'teamwork'],
    subjects: ['Физика', 'Технология', 'Математика'],
    skills: {
      hard: ['Ремонт оборудования', 'Диагностика неисправностей', 'Слесарные работы', 'Обслуживание механизмов'],
      soft: ['Смекалка', 'Ответственность', 'Выносливость']
    },
    demand: 'high',
    skillFormula: ['Ремонт по диагностике', 'Работа руками с механизмами', 'Поиск причины поломки'],
    transferableTo: ['Автомеханик (Автослесарь)', 'Оператор станков с ЧПУ', 'Сантехник', 'Мастер по ремонту оборудования'],
    summary: 'Чинит промышленное оборудование: находит поломки, ремонтирует механизмы и держит станки в рабочем состоянии.',
    why: 'Подходит практичным и сообразительным (Realistic/Investigative), кто любит чинить технику и докапываться до причины.'
  },
  {
    id: 'crane-operator',
    name: 'Крановщик (Машинист крана)',
    industry: 'Строительство и ремонт',
    tier: 'everyday',
    archetype: 'machine-operator',
    riasec: ['Realistic', 'Conventional', 'Investigative'],
    gardner: ['Spatial-Visual', 'Bodily-Kinesthetic', 'Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'low',
    values: ['security', 'achievement', 'conformity'],
    viaFit: ['prudence', 'self_regulation', 'judgment', 'perseverance'],
    subjects: ['Физика', 'Технология', 'ОБЖ'],
    skills: {
      hard: ['Управление краном', 'Расчёт нагрузок', 'Сигналы стропальщика', 'Техника безопасности'],
      soft: ['Концентрация', 'Точность', 'Хладнокровие']
    },
    demand: 'high',
    skillFormula: ['Точное управление техникой', 'Ответственность за безопасность', 'Пространственный расчёт'],
    transferableTo: ['Прораб (Мастер участка)', 'Строитель (Каменщик)', 'Оператор станков с ЧПУ', 'Машинист поезда'],
    summary: 'Управляет подъёмным краном на стройке: точно перемещает грузы и отвечает за безопасность на высоте.',
    why: 'Для собранных и точных (Realistic/Conventional), кто хорошо чувствует пространство и держит концентрацию.'
  },
  {
    id: 'tractor-operator',
    name: 'Тракторист-механизатор',
    industry: 'Агротехнологии и сити-фермерство',
    tier: 'everyday',
    archetype: 'machine-operator',
    riasec: ['Realistic', 'Conventional', 'Investigative'],
    gardner: ['Bodily-Kinesthetic', 'Naturalist', 'Spatial-Visual'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'low',
    values: ['security', 'achievement', 'self_direction'],
    viaFit: ['perseverance', 'prudence', 'self_regulation', 'zest'],
    subjects: ['Технология', 'Физика', 'Биология'],
    skills: {
      hard: ['Управление сельхозтехникой', 'Обработка полей', 'Обслуживание трактора', 'Полевые работы'],
      soft: ['Выносливость', 'Самостоятельность', 'Ответственность']
    },
    demand: 'high',
    skillFormula: ['Управление техникой', 'Работа с землёй', 'Самостоятельность в поле'],
    transferableTo: ['Агроном', 'Специалист по умному фермерству (IoT в АПК)', 'Автомеханик (Автослесарь)', 'Оператор станков с ЧПУ'],
    summary: 'Работает на сельхозтехнике: пашет, сеет и убирает урожай, обслуживает трактор и технику в поле.',
    why: 'Подходит практичным и самостоятельным (Realistic), кто любит технику, землю и работу на свежем воздухе.'
  },
  {
    id: 'zootechnician',
    name: 'Зоотехник',
    industry: 'Агротехнологии и сити-фермерство',
    tier: 'everyday',
    archetype: 'zootechnician',
    riasec: ['Investigative', 'Realistic', 'Social'],
    gardner: ['Naturalist', 'Logical-Mathematical', 'Interpersonal'],
    bigFive: { traits: { Conscientiousness: 'high', Agreeableness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['universalism', 'achievement', 'security'],
    viaFit: ['curiosity', 'kindness', 'judgment', 'perseverance'],
    subjects: ['Биология', 'Химия', 'Математика'],
    skills: {
      hard: ['Уход за животными на ферме', 'Кормление и разведение', 'Контроль здоровья стада', 'Ведение учёта'],
      soft: ['Наблюдательность', 'Забота о животных', 'Практичность']
    },
    demand: 'medium',
    skillFormula: ['Работа с живой природой', 'Практическая биология', 'Планирование хозяйства'],
    transferableTo: ['Ветеринарный врач', 'Агроном', 'Агроном-генетик', 'Специалист по умному фермерству (IoT в АПК)'],
    summary: 'Отвечает за животных на ферме: организует кормление, разведение и следит за здоровьем и продуктивностью стада.',
    why: 'Для тех, кто любит животных и природу (Naturalist/Investigative), интересуется биологией и хочет работать в сельском хозяйстве.'
  },
  {
    id: 'forester',
    name: 'Лесник (Инженер лесного хозяйства)',
    industry: 'Энергетика и эко-технологии',
    tier: 'everyday',
    archetype: 'forester',
    riasec: ['Realistic', 'Investigative', 'Conventional'],
    gardner: ['Naturalist', 'Bodily-Kinesthetic', 'Spatial-Visual'],
    bigFive: { traits: { Conscientiousness: 'high', Openness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['universalism', 'security', 'self_direction'],
    viaFit: ['love_of_learning', 'perseverance', 'prudence', 'appreciation_of_beauty'],
    subjects: ['Биология', 'География', 'Химия'],
    skills: {
      hard: ['Охрана и учёт леса', 'Посадка и уход за насаждениями', 'Профилактика пожаров', 'Работа с картами и GPS'],
      soft: ['Любовь к природе', 'Самостоятельность', 'Выносливость']
    },
    demand: 'medium',
    skillFormula: ['Забота о природе', 'Работа на местности', 'Практическая экология'],
    transferableTo: ['Эколог-урбанист', 'Агроном', 'Ландшафтный архитектор', 'Специалист по охране природы'],
    summary: 'Заботится о лесе: охраняет насаждения, сажает деревья, ведёт учёт и защищает лес от пожаров и вырубки.',
    why: 'Подходит тем, кто любит природу и простор (Realistic/Naturalist), готов работать на местности и беречь окружающий мир.'
  },
  {
    id: 'flight-attendant',
    name: 'Бортпроводник',
    industry: 'Туризм и премиальное гостеприимство',
    tier: 'everyday',
    archetype: 'flight-attendant',
    riasec: ['Social', 'Enterprising', 'Conventional'],
    gardner: ['Interpersonal', 'Bodily-Kinesthetic', 'Linguistic'],
    bigFive: { traits: { Extraversion: 'high', Agreeableness: 'high', Stability: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'security', 'stimulation'],
    viaFit: ['social_intelligence', 'kindness', 'bravery', 'self_regulation'],
    subjects: ['Иностранный язык', 'ОБЖ', 'Обществознание'],
    skills: {
      hard: ['Обслуживание пассажиров', 'Правила безопасности полёта', 'Первая помощь', 'Действия при ЧС'],
      soft: ['Приветливость', 'Самообладание', 'Работа в команде']
    },
    demand: 'medium',
    skillFormula: ['Сервис под давлением', 'Забота о людях', 'Действие в нештатной ситуации'],
    transferableTo: ['Администратор (ресепшн)', 'Организатор делового туризма (MICE)', 'Официант', 'Менеджер спортивных событий'],
    summary: 'Заботится о пассажирах в полёте: обслуживает, следит за безопасностью и помогает в нештатных ситуациях.',
    why: 'Для общительных и стрессоустойчивых (Social/Enterprising), кто любит путешествия и умеет держать улыбку в дороге.'
  },
  {
    id: 'tour-guide',
    name: 'Гид-экскурсовод',
    industry: 'Туризм и премиальное гостеприимство',
    tier: 'everyday',
    archetype: 'tour-guide',
    riasec: ['Social', 'Artistic', 'Enterprising'],
    gardner: ['Linguistic', 'Interpersonal', 'Spatial-Visual'],
    bigFive: { traits: { Extraversion: 'high', Openness: 'high', Agreeableness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['stimulation', 'benevolence', 'self_direction'],
    viaFit: ['social_intelligence', 'love_of_learning', 'humor', 'zest'],
    subjects: ['История', 'География', 'Иностранный язык'],
    skills: {
      hard: ['Проведение экскурсий', 'Знание истории и культуры', 'Организация маршрута', 'Работа с группой'],
      soft: ['Красноречие', 'Общительность', 'Эрудиция']
    },
    demand: 'medium',
    skillFormula: ['Увлекательный рассказ', 'Работа с группой', 'Широкий кругозор'],
    transferableTo: ['Разработчик эко-туристических маршрутов', 'Организатор делового туризма (MICE)', 'Онлайн-учитель / Лектор', 'Ведущий мероприятий'],
    summary: 'Водит экскурсии: интересно рассказывает об истории и культуре и помогает туристам открыть новое место.',
    why: 'Подходит общительным эрудитам (Social/Artistic), кто любит рассказывать, путешествовать и делиться знаниями.'
  },
  {
    id: 'speech-therapist',
    name: 'Логопед',
    industry: 'Психология и ментальное здоровье',
    tier: 'everyday',
    archetype: 'speech-therapist',
    riasec: ['Social', 'Investigative', 'Artistic'],
    gardner: ['Linguistic', 'Interpersonal', 'Intrapersonal'],
    bigFive: { traits: { Agreeableness: 'high', Conscientiousness: 'high', Extraversion: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'achievement', 'universalism'],
    viaFit: ['kindness', 'perseverance', 'love_of_learning', 'social_intelligence'],
    subjects: ['Биология', 'Русский язык', 'Психология'],
    skills: {
      hard: ['Коррекция речи', 'Диагностика нарушений', 'Развивающие упражнения', 'Работа с детьми и родителями'],
      soft: ['Терпение', 'Доброжелательность', 'Наблюдательность']
    },
    demand: 'high',
    skillFormula: ['Забота и коррекция', 'Терпеливая работа с людьми', 'Внимание к деталям речи'],
    transferableTo: ['Дефектолог', 'Детский психолог', 'Воспитатель детского сада', 'Учитель-предметник'],
    summary: 'Помогает людям правильно говорить: исправляет нарушения речи у детей и взрослых через специальные упражнения.',
    why: 'Для заботливых и терпеливых (Social/Investigative), кому интересен язык и приятно видеть прогресс своих подопечных.'
  },
  {
    id: 'writer',
    name: 'Писатель / Литературный редактор',
    industry: 'Медиа, блогинг и контент-производство',
    tier: 'dream',
    archetype: 'writer',
    riasec: ['Artistic', 'Investigative', 'Social'],
    gardner: ['Linguistic', 'Intrapersonal', 'Interpersonal'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'universalism', 'achievement'],
    viaFit: ['creativity', 'love_of_learning', 'perspective', 'appreciation_of_beauty'],
    subjects: ['Литература', 'Русский язык', 'История'],
    skills: {
      hard: ['Художественное письмо', 'Работа с сюжетом и стилем', 'Редактирование текста', 'Исследование темы'],
      soft: ['Воображение', 'Самодисциплина', 'Чувство языка']
    },
    demand: 'low',
    skillFormula: ['Владение словом', 'Создание историй', 'Самостоятельная работа'],
    transferableTo: ['Копирайтер', 'Сценарист игр (Нарративный дизайнер)', 'Научный журналист', 'Литературный редактор'],
    summary: 'Создаёт тексты и книги: придумывает истории, работает над стилем и доносит идеи через слово.',
    why: 'Для творческих и вдумчивых (Artistic/Investigative), кто любит слово. Честно: путь автора нестабилен — план Б через копирайтинг, редактуру и сценарии.'
  },
  {
    id: 'interior-designer',
    name: 'Дизайнер интерьера',
    industry: 'Дизайн и креативные индустрии',
    tier: 'everyday',
    archetype: 'designer',
    riasec: ['Artistic', 'Enterprising', 'Realistic'],
    gardner: ['Spatial-Visual', 'Interpersonal', 'Logical-Mathematical'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['self_direction', 'achievement', 'hedonism'],
    viaFit: ['creativity', 'appreciation_of_beauty', 'judgment', 'social_intelligence'],
    subjects: ['Изобразительное искусство', 'Математика', 'Технология'],
    skills: {
      hard: ['Проектирование пространств', 'Работа в 3D-программах', 'Подбор материалов и мебели', 'Планировка и эргономика'],
      soft: ['Художественный вкус', 'Общение с клиентом', 'Внимательность']
    },
    demand: 'medium',
    skillFormula: ['Красота и функция пространства', 'Проектное мышление', 'Работа с клиентом'],
    transferableTo: ['Архитектор (зданий)', 'Графический дизайнер', 'Ландшафтный архитектор', 'Промышленный дизайнер'],
    summary: 'Оформляет помещения: планирует пространство, подбирает мебель и материалы, делая интерьер удобным и красивым.',
    why: 'Подходит творческим и практичным (Artistic/Enterprising), у кого чувство стиля и кто умеет думать о пространстве.'
  },

  // ─── Расширение охвата: медицина, наука, право, финансы, транспорт, ремёсла (батч 5) ───
  {
    id: 'psychiatrist',
    name: 'Психиатр',
    industry: 'Медицина и здравоохранение',
    tier: 'everyday',
    archetype: 'doctor',
    riasec: ['Investigative', 'Social', 'Artistic'],
    gardner: ['Interpersonal', 'Logical-Mathematical', 'Intrapersonal'],
    bigFive: { traits: { Conscientiousness: 'high', Agreeableness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['benevolence', 'universalism', 'achievement'],
    viaFit: ['judgment', 'kindness', 'perspective', 'social_intelligence'],
    subjects: ['Биология', 'Химия', 'Обществознание'],
    skills: {
      hard: ['Диагностика психических расстройств', 'Назначение терапии', 'Клиническая беседа', 'Ведение пациентов'],
      soft: ['Эмпатия', 'Наблюдательность', 'Устойчивость к стрессу']
    },
    demand: 'high',
    skillFormula: ['Понимание психики', 'Клиническое мышление', 'Забота о человеке'],
    transferableTo: ['Врач-терапевт', 'Семейный психотерапевт', 'Нейробиолог', 'Кинезиотерапевт (Реабилитолог)'],
    summary: 'Врач по психическому здоровью: диагностирует и лечит расстройства, помогает людям в тяжёлых душевных состояниях.',
    why: 'Для вдумчивых и чутких (Investigative/Social), кто хочет глубоко понимать человека и помогать в самом сложном.'
  },
  {
    id: 'ophthalmologist',
    name: 'Офтальмолог (Окулист)',
    industry: 'Медицина и здравоохранение',
    tier: 'everyday',
    archetype: 'doctor',
    riasec: ['Investigative', 'Realistic', 'Social'],
    gardner: ['Logical-Mathematical', 'Spatial-Visual', 'Bodily-Kinesthetic'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['benevolence', 'achievement', 'security'],
    viaFit: ['judgment', 'prudence', 'kindness', 'perseverance'],
    subjects: ['Биология', 'Физика', 'Химия'],
    skills: {
      hard: ['Диагностика зрения', 'Микрохирургия глаза', 'Работа с оптикой и приборами', 'Подбор коррекции'],
      soft: ['Точность', 'Внимательность', 'Спокойствие пациента']
    },
    demand: 'high',
    skillFormula: ['Точная диагностика', 'Тонкая ручная работа', 'Забота о пациенте'],
    transferableTo: ['Хирург', 'Врач-терапевт', 'Разработчик киберпротезов', 'Оптометрист'],
    summary: 'Лечит глаза и зрение: диагностирует болезни, проводит операции и подбирает очки и линзы.',
    why: 'Подходит точным и внимательным (Investigative/Realistic), кому интересна оптика и приятна тонкая медицинская работа.'
  },
  {
    id: 'translator',
    name: 'Переводчик',
    industry: 'Медиа, блогинг и контент-производство',
    tier: 'everyday',
    archetype: 'translator',
    riasec: ['Artistic', 'Investigative', 'Social'],
    gardner: ['Linguistic', 'Interpersonal', 'Intrapersonal'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'universalism', 'achievement'],
    viaFit: ['love_of_learning', 'judgment', 'perspective', 'curiosity'],
    subjects: ['Иностранный язык', 'Русский язык', 'Литература'],
    skills: {
      hard: ['Устный и письменный перевод', 'Владение языками', 'Работа с терминологией', 'Локализация текста'],
      soft: ['Чувство языка', 'Внимательность', 'Кругозор']
    },
    demand: 'medium',
    skillFormula: ['Владение языками', 'Точная передача смысла', 'Работа с текстом'],
    transferableTo: ['Гид-экскурсовод', 'Копирайтер', 'Онлайн-учитель / Лектор', 'Литературный редактор'],
    summary: 'Переводит речь и тексты с одного языка на другой: помогает людям и компаниям понимать друг друга.',
    why: 'Для тех, кто любит языки и слово (Artistic/Investigative), внимателен к деталям и открыт другим культурам.'
  },
  {
    id: 'geologist',
    name: 'Геолог',
    industry: 'Фундаментальная наука и исследования',
    tier: 'everyday',
    archetype: 'geologist',
    riasec: ['Investigative', 'Realistic', 'Conventional'],
    gardner: ['Naturalist', 'Spatial-Visual', 'Logical-Mathematical'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['self_direction', 'achievement', 'universalism'],
    viaFit: ['curiosity', 'love_of_learning', 'perseverance', 'bravery'],
    subjects: ['География', 'Химия', 'Физика'],
    skills: {
      hard: ['Изучение горных пород', 'Полевые экспедиции', 'Анализ образцов', 'Работа с картами и данными'],
      soft: ['Наблюдательность', 'Выносливость', 'Аналитичность']
    },
    demand: 'medium',
    skillFormula: ['Исследование природы', 'Полевая и лабораторная работа', 'Анализ данных'],
    transferableTo: ['Инженер по добыче', 'Эколог-урбанист', 'Гидролог', 'Химик-синтетик / Материаловед'],
    summary: 'Изучает недра Земли: ищет полезные ископаемые, исследует горные породы в экспедициях и лаборатории.',
    why: 'Для любознательных и выносливых (Investigative/Realistic), кто любит природу, путешествия и разгадывать загадки Земли.'
  },
  {
    id: 'meteorologist',
    name: 'Метеоролог',
    industry: 'Фундаментальная наука и исследования',
    tier: 'everyday',
    archetype: 'scientist',
    riasec: ['Investigative', 'Conventional', 'Realistic'],
    gardner: ['Logical-Mathematical', 'Naturalist', 'Spatial-Visual'],
    bigFive: { traits: { Conscientiousness: 'high', Openness: 'high' } },
    cognitiveDemand: 'high',
    values: ['universalism', 'achievement', 'security'],
    viaFit: ['curiosity', 'judgment', 'love_of_learning', 'prudence'],
    subjects: ['География', 'Физика', 'Математика'],
    skills: {
      hard: ['Анализ погодных данных', 'Работа с моделями прогноза', 'Наблюдения и приборы', 'Обработка статистики'],
      soft: ['Аналитичность', 'Внимательность', 'Системность']
    },
    demand: 'medium',
    skillFormula: ['Анализ данных о природе', 'Прогнозирование', 'Работа с моделями'],
    transferableTo: ['Аналитик данных', 'Эколог-урбанист', 'Аудитор углеродного следа', 'Геолог'],
    summary: 'Изучает и предсказывает погоду: анализирует данные наблюдений и строит прогнозы для людей и хозяйства.',
    why: 'Подходит аналитичным и любознательным (Investigative), кому интересны природа, физика атмосферы и работа с данными.'
  },
  {
    id: 'historian',
    name: 'Историк',
    industry: 'Фундаментальная наука и исследования',
    tier: 'dream',
    archetype: 'historian',
    riasec: ['Investigative', 'Artistic', 'Social'],
    gardner: ['Linguistic', 'Intrapersonal', 'Interpersonal'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['universalism', 'self_direction', 'tradition'],
    viaFit: ['love_of_learning', 'curiosity', 'perspective', 'judgment'],
    subjects: ['История', 'Обществознание', 'Литература'],
    skills: {
      hard: ['Работа с источниками', 'Исторический анализ', 'Научное письмо', 'Архивные исследования'],
      soft: ['Критическое мышление', 'Усидчивость', 'Эрудиция']
    },
    demand: 'low',
    skillFormula: ['Работа с источниками', 'Критический анализ', 'Понимание общества во времени'],
    transferableTo: ['Научный журналист', 'Гид-экскурсовод', 'Учитель-предметник', 'Архивист'],
    summary: 'Изучает прошлое: работает с документами и источниками, чтобы понять, как и почему жили люди раньше.',
    why: 'Для вдумчивых и начитанных (Investigative/Artistic), кто любит докапываться до истины. Честно: академический путь узкий — план Б через преподавание, музеи, медиа.'
  },
  {
    id: 'criminal-investigator',
    name: 'Следователь',
    industry: 'Юриспруденция, право и безопасность',
    tier: 'everyday',
    archetype: 'law-enforcement-officer',
    riasec: ['Investigative', 'Enterprising', 'Conventional'],
    gardner: ['Logical-Mathematical', 'Interpersonal', 'Linguistic'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['security', 'achievement', 'universalism'],
    viaFit: ['judgment', 'perseverance', 'fairness', 'bravery'],
    subjects: ['Обществознание', 'Право', 'Русский язык'],
    skills: {
      hard: ['Расследование дел', 'Сбор и анализ улик', 'Допрос и протоколы', 'Знание УПК'],
      soft: ['Логика', 'Настойчивость', 'Психологическая устойчивость']
    },
    demand: 'medium',
    skillFormula: ['Раскрытие через анализ', 'Работа по закону', 'Понимание людей'],
    transferableTo: ['Полицейский', 'Юрисконсульт', 'Специалист по кибербезопасности', 'Аналитик по расследованиям'],
    summary: 'Расследует преступления: собирает улики, восстанавливает картину произошедшего и доводит дело до суда.',
    why: 'Для логичных и упорных (Investigative/Enterprising), кто любит распутывать сложное и ценит справедливость.'
  },
  {
    id: 'social-worker',
    name: 'Социальный работник',
    industry: 'Психология и ментальное здоровье',
    tier: 'everyday',
    archetype: 'social-worker',
    riasec: ['Social', 'Conventional', 'Enterprising'],
    gardner: ['Interpersonal', 'Intrapersonal', 'Linguistic'],
    bigFive: { traits: { Agreeableness: 'high', Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'universalism', 'security'],
    viaFit: ['kindness', 'fairness', 'perseverance', 'hope'],
    subjects: ['Обществознание', 'Психология', 'Русский язык'],
    skills: {
      hard: ['Помощь нуждающимся', 'Работа с документами и льготами', 'Патронаж семей', 'Координация служб'],
      soft: ['Эмпатия', 'Организованность', 'Терпение']
    },
    demand: 'high',
    skillFormula: ['Забота о людях', 'Организация помощи', 'Работа с людьми в трудной ситуации'],
    transferableTo: ['Карьерный консультант', 'HR-рекрутер', 'Семейный психотерапевт', 'Воспитатель детского сада'],
    summary: 'Помогает людям в трудной жизненной ситуации: пожилым, семьям, детям — оформляет помощь и поддерживает.',
    why: 'Для добрых и организованных (Social), кто хочет реально помогать людям и не боится их проблем.'
  },
  {
    id: 'bank-clerk',
    name: 'Банковский специалист (Операционист)',
    industry: 'Финансовые технологии и инвестиции',
    tier: 'everyday',
    archetype: 'bank-clerk',
    riasec: ['Conventional', 'Social', 'Enterprising'],
    gardner: ['Logical-Mathematical', 'Interpersonal', 'Intrapersonal'],
    bigFive: { traits: { Conscientiousness: 'high', Agreeableness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['security', 'achievement', 'benevolence'],
    viaFit: ['prudence', 'honesty', 'social_intelligence', 'self_regulation'],
    subjects: ['Математика', 'Обществознание', 'Информатика'],
    skills: {
      hard: ['Банковские операции', 'Оформление вкладов и кредитов', 'Работа с клиентами', 'Финансовая грамотность'],
      soft: ['Внимательность', 'Клиентоориентированность', 'Аккуратность']
    },
    demand: 'high',
    skillFormula: ['Точность с финансами', 'Работа с клиентом', 'Знание продуктов'],
    transferableTo: ['Финансовый советник', 'Страховой агент', 'Бухгалтер', 'Кредитный аналитик'],
    summary: 'Обслуживает клиентов банка: оформляет вклады, кредиты и переводы, консультирует по продуктам.',
    why: 'Подходит аккуратным и общительным (Conventional/Social), кто дружит с цифрами и умеет работать с людьми.'
  },
  {
    id: 'tax-consultant',
    name: 'Налоговый консультант',
    industry: 'Финансовые технологии и инвестиции',
    tier: 'everyday',
    archetype: 'accountant',
    riasec: ['Conventional', 'Investigative', 'Enterprising'],
    gardner: ['Logical-Mathematical', 'Linguistic', 'Intrapersonal'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['achievement', 'security', 'conformity'],
    viaFit: ['judgment', 'prudence', 'honesty', 'perseverance'],
    subjects: ['Математика', 'Обществознание', 'Право'],
    skills: {
      hard: ['Налоговое планирование', 'Знание налогового кодекса', 'Оптимизация и отчётность', 'Консультирование бизнеса'],
      soft: ['Аналитичность', 'Внимательность', 'Ответственность']
    },
    demand: 'high',
    skillFormula: ['Работа с нормами и цифрами', 'Финансовая экспертиза', 'Консультирование'],
    transferableTo: ['Бухгалтер', 'Финансовый аналитик', 'Аудитор', 'Юрисконсульт'],
    summary: 'Помогает людям и компаниям с налогами: планирует, считает и следит, чтобы всё было по закону и выгодно.',
    why: 'Для системных и внимательных (Conventional/Investigative), кто дружит и с цифрами, и с законами.'
  },
  {
    id: 'airline-pilot',
    name: 'Пилот гражданской авиации',
    industry: 'Транспорт, логистика и беспилотные системы',
    tier: 'dream',
    archetype: 'pilot',
    riasec: ['Realistic', 'Investigative', 'Enterprising'],
    gardner: ['Bodily-Kinesthetic', 'Spatial-Visual', 'Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['achievement', 'security', 'stimulation'],
    viaFit: ['bravery', 'self_regulation', 'judgment', 'prudence'],
    subjects: ['Физика', 'Математика', 'Иностранный язык'],
    skills: {
      hard: ['Управление воздушным судном', 'Навигация и приборы', 'Действия при нештатных ситуациях', 'Авиационные правила'],
      soft: ['Хладнокровие', 'Концентрация', 'Ответственность']
    },
    demand: 'medium',
    skillFormula: ['Управление сложной техникой', 'Решение под давлением', 'Дисциплина и точность'],
    transferableTo: ['Оператор флота беспилотных аппаратов', 'Диспетчер космического трафика', 'Инструктор по пилотированию', 'Автомобильный инженер (Беспилотники)'],
    summary: 'Управляет самолётом: поднимает воздушное судно, ведёт его по маршруту и отвечает за безопасность пассажиров.',
    why: 'Для собранных и смелых (Realistic/Investigative), кто мечтает о небе. Честно: путь долгий, конкурсный и дорогой — план Б через смежные роли управления техникой.'
  },
  {
    id: 'carpenter',
    name: 'Столяр (Плотник)',
    industry: 'Строительство и ремонт',
    tier: 'everyday',
    archetype: 'carpenter',
    riasec: ['Realistic', 'Artistic', 'Conventional'],
    gardner: ['Bodily-Kinesthetic', 'Spatial-Visual', 'Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high', Openness: 'high' } },
    cognitiveDemand: 'low',
    values: ['achievement', 'self_direction', 'security'],
    viaFit: ['creativity', 'perseverance', 'appreciation_of_beauty', 'prudence'],
    subjects: ['Технология', 'Математика', 'Изобразительное искусство'],
    skills: {
      hard: ['Обработка дерева', 'Изготовление мебели и конструкций', 'Чтение чертежей', 'Работа с инструментом'],
      soft: ['Точность рук', 'Терпение', 'Глазомер']
    },
    demand: 'medium',
    skillFormula: ['Создавать вещи из дерева', 'Точная ручная работа', 'Работа по чертежу'],
    transferableTo: ['Строитель (Каменщик)', 'Мебельный дизайнер', 'Реставратор', 'Маляр-штукатур'],
    summary: 'Работает с деревом: изготавливает мебель, лестницы и конструкции, соединяя мастерство и точность.',
    why: 'Подходит усидчивым с точными руками (Realistic/Artistic), кто любит дерево и радуется вещам, сделанным своими руками.'
  },
  {
    id: 'sound-engineer',
    name: 'Звукорежиссёр',
    industry: 'Медиа, блогинг и контент-производство',
    tier: 'everyday',
    archetype: 'sound-engineer',
    riasec: ['Artistic', 'Realistic', 'Investigative'],
    gardner: ['Musical', 'Logical-Mathematical', 'Bodily-Kinesthetic'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['self_direction', 'achievement', 'hedonism'],
    viaFit: ['creativity', 'appreciation_of_beauty', 'perseverance', 'curiosity'],
    subjects: ['Музыка', 'Физика', 'Информатика'],
    skills: {
      hard: ['Запись и сведение звука', 'Работа со звуковыми программами', 'Настройка аппаратуры', 'Обработка аудио'],
      soft: ['Музыкальный слух', 'Внимательность', 'Аккуратность']
    },
    demand: 'medium',
    skillFormula: ['Работа со звуком', 'Технико-творческий баланс', 'Внимание к деталям'],
    transferableTo: ['Видеомонтажер', 'Подкастер (Интервьюер)', 'Композитор для игр и медиа', 'Музыкант'],
    summary: 'Отвечает за звук: записывает, чистит и сводит аудио для музыки, кино, подкастов и мероприятий.',
    why: 'Для творческих с хорошим слухом (Artistic/Realistic), кому интересна и техника, и музыка одновременно.'
  },
  {
    id: 'jeweler',
    name: 'Ювелир',
    industry: 'Сфера услуг, красота и гостеприимство',
    tier: 'everyday',
    archetype: 'jeweler',
    riasec: ['Realistic', 'Artistic', 'Investigative'],
    gardner: ['Bodily-Kinesthetic', 'Spatial-Visual', 'Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high', Openness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['achievement', 'self_direction', 'hedonism'],
    viaFit: ['creativity', 'appreciation_of_beauty', 'perseverance', 'prudence'],
    subjects: ['Технология', 'Химия', 'Изобразительное искусство'],
    skills: {
      hard: ['Изготовление украшений', 'Работа с металлом и камнями', 'Пайка и огранка', 'Ремонт изделий'],
      soft: ['Тонкая моторика', 'Художественный вкус', 'Усидчивость']
    },
    demand: 'medium',
    skillFormula: ['Тончайшая ручная работа', 'Творчество в материале', 'Точность и терпение'],
    transferableTo: ['Швея / Портной', 'Цифровой модельер', 'Реставратор', 'Промышленный дизайнер'],
    summary: 'Создаёт украшения: работает с драгоценными металлами и камнями, паяет, гравирует и ремонтирует изделия.',
    why: 'Подходит усидчивым с ювелирной точностью рук (Realistic/Artistic), кто любит красоту и кропотливую работу.'
  },
  {
    id: 'private-tutor',
    name: 'Репетитор',
    industry: 'Образование и EdTech',
    tier: 'everyday',
    archetype: 'teacher',
    riasec: ['Social', 'Investigative', 'Artistic'],
    gardner: ['Linguistic', 'Interpersonal', 'Logical-Mathematical'],
    bigFive: { traits: { Extraversion: 'high', Conscientiousness: 'high', Agreeableness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'achievement', 'self_direction'],
    viaFit: ['love_of_learning', 'kindness', 'perseverance', 'social_intelligence'],
    subjects: ['Математика', 'Русский язык', 'Иностранный язык'],
    skills: {
      hard: ['Индивидуальное обучение', 'Подготовка к экзаменам', 'Объяснение сложных тем', 'Подбор программы'],
      soft: ['Терпение', 'Умение объяснять', 'Мотивация ученика']
    },
    demand: 'high',
    skillFormula: ['Индивидуальная передача знаний', 'Ясное объяснение', 'Работа один на один'],
    transferableTo: ['Учитель-предметник', 'Онлайн-учитель / Лектор', 'Тьютор / Профориентолог', 'Методолог онлайн-обучения'],
    summary: 'Занимается с учениками индивидуально: объясняет сложное простыми словами и готовит к экзаменам.',
    why: 'Для терпеливых и знающих (Social/Investigative), кто умеет объяснять и радуется успехам своих учеников.'
  },
  {
    id: 'support-specialist',
    name: 'Специалист поддержки (контакт-центр)',
    industry: 'Сфера услуг, красота и гостеприимство',
    tier: 'everyday',
    archetype: 'customer-support',
    riasec: ['Social', 'Conventional', 'Enterprising'],
    gardner: ['Interpersonal', 'Linguistic'],
    bigFive: { traits: { Agreeableness: 'high', Stability: 'high' } },
    cognitiveDemand: 'medium',
    values: ['benevolence', 'security', 'conformity'],
    viaFit: ['kindness', 'social_intelligence', 'self_regulation', 'perseverance'],
    subjects: ['Русский язык', 'Обществознание', 'Информатика'],
    skills: {
      hard: ['Работа с обращениями', 'Работа в CRM', 'Решение проблем клиента', 'Ведение диалога'],
      soft: ['Терпение', 'Эмпатия', 'Стрессоустойчивость']
    },
    demand: 'high',
    skillFormula: ['Помощь клиенту решить проблему', 'Спокойствие в сложном разговоре', 'Быстрый понятный ответ'],
    transferableTo: ['Менеджер по продажам', 'Аккаунт-менеджер', 'HR-специалист', 'Аналитик клиентского опыта'],
    summary: 'Помогает клиентам решать вопросы по телефону и в чате: спокойно, понятно и по существу.',
    why: 'Для терпеливых и доброжелательных (Social/Conventional) — хороший первый шаг в карьере, где важна забота о людях.'
  },
  {
    id: 'system-administrator',
    name: 'Системный администратор',
    industry: 'IT и разработка ПО',
    tier: 'everyday',
    archetype: 'system-administrator',
    riasec: ['Realistic', 'Conventional', 'Investigative'],
    gardner: ['Logical-Mathematical', 'Spatial-Visual'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['security', 'self_direction', 'achievement'],
    viaFit: ['prudence', 'judgment', 'perseverance', 'curiosity'],
    subjects: ['Информатика', 'Математика', 'Физика'],
    skills: {
      hard: ['Настройка серверов и сетей', 'Администрирование ОС', 'Резервное копирование', 'Диагностика сбоев'],
      soft: ['Ответственность', 'Внимательность', 'Хладнокровие']
    },
    demand: 'high',
    skillFormula: ['Чтобы вся техника работала без сбоев', 'Быстрое решение технических проблем', 'Надёжность инфраструктуры'],
    transferableTo: ['DevOps-инженер', 'Специалист по кибербезопасности', 'Инженер по сетям', 'Специалист по IoT'],
    summary: 'Следит, чтобы компьютеры, серверы и сети компании работали стабильно и без сбоев.',
    why: 'Для практичных и надёжных (Realistic/Conventional), кому нравится, когда всё настроено и работает как часы.'
  },
  {
    id: 'business-analyst',
    name: 'Бизнес-аналитик',
    industry: 'Управление и бизнес-консалтинг',
    tier: 'everyday',
    archetype: 'business-analyst',
    riasec: ['Investigative', 'Conventional', 'Enterprising'],
    gardner: ['Logical-Mathematical', 'Linguistic'],
    bigFive: { traits: { Conscientiousness: 'high', Openness: 'high' } },
    cognitiveDemand: 'high',
    values: ['achievement', 'self_direction', 'security'],
    viaFit: ['judgment', 'curiosity', 'perspective', 'prudence'],
    subjects: ['Математика', 'Обществознание', 'Информатика'],
    skills: {
      hard: ['Сбор требований', 'Описание процессов', 'Анализ данных', 'Постановка задач разработке'],
      soft: ['Системное мышление', 'Коммуникация', 'Внимательность']
    },
    demand: 'high',
    skillFormula: ['Перевод желаний бизнеса в понятные задачи', 'Наведение порядка в процессах', 'Мост между людьми и системами'],
    transferableTo: ['Системный аналитик', 'Product-менеджер', 'Project-менеджер', 'Аналитик данных'],
    summary: 'Разбирается, что нужно бизнесу, и превращает это в чёткие требования для команды разработки.',
    why: 'Для вдумчивых и системных (Investigative/Conventional), кто любит наводить порядок и соединять людей с решениями.'
  },
  {
    id: 'real-estate-agent',
    name: 'Риелтор',
    industry: 'Торговля и продажи',
    tier: 'everyday',
    archetype: 'real-estate-agent',
    riasec: ['Enterprising', 'Social', 'Conventional'],
    gardner: ['Interpersonal', 'Spatial-Visual'],
    bigFive: { traits: { Extraversion: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['achievement', 'self_direction', 'security'],
    viaFit: ['social_intelligence', 'zest', 'honesty', 'perseverance'],
    subjects: ['Обществознание', 'Право', 'Математика'],
    skills: {
      hard: ['Подбор объектов', 'Оформление сделок', 'Оценка недвижимости', 'Переговоры'],
      soft: ['Коммуникабельность', 'Настойчивость', 'Честность']
    },
    demand: 'high',
    skillFormula: ['Подбор жилья под запрос', 'Сопровождение сделки', 'Понимание рынка недвижимости'],
    transferableTo: ['Менеджер по продажам', 'Оценщик недвижимости', 'Предприниматель', 'Ипотечный брокер'],
    summary: 'Помогает людям купить, продать или снять жильё: подбирает варианты и ведёт сделку до подписания.',
    why: 'Для активных и самостоятельных (Enterprising/Social), кто любит работу с людьми и гибкий график без потолка дохода.'
  },
  {
    id: 'procurement-specialist',
    name: 'Специалист по закупкам',
    industry: 'Торговля и продажи',
    tier: 'everyday',
    archetype: 'procurement-specialist',
    riasec: ['Conventional', 'Enterprising', 'Investigative'],
    gardner: ['Logical-Mathematical', 'Interpersonal'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['security', 'achievement', 'conformity'],
    viaFit: ['prudence', 'judgment', 'fairness', 'perseverance'],
    subjects: ['Математика', 'Обществознание', 'Русский язык'],
    skills: {
      hard: ['Тендеры и торги', 'Анализ поставщиков', 'Ведение договоров', 'Управление затратами'],
      soft: ['Внимательность', 'Переговоры', 'Аналитика']
    },
    demand: 'high',
    skillFormula: ['Выбор лучшего поставщика по цене и качеству', 'Экономия бюджета компании', 'Контроль поставок'],
    transferableTo: ['Логист по управлению цепочками поставок', 'Финансовый аналитик', 'Бизнес-аналитик', 'Менеджер по продажам'],
    summary: 'Находит поставщиков и закупает всё нужное компании по лучшей цене и в срок.',
    why: 'Для внимательных и расчётливых (Conventional/Enterprising), кто любит находить выгодные условия и экономить бюджет.'
  },
  {
    id: 'retail-manager',
    name: 'Управляющий магазином',
    industry: 'Торговля и продажи',
    tier: 'everyday',
    archetype: 'retail-manager',
    riasec: ['Enterprising', 'Conventional', 'Social'],
    gardner: ['Interpersonal', 'Logical-Mathematical'],
    bigFive: { traits: { Extraversion: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['achievement', 'power', 'security'],
    viaFit: ['leadership', 'social_intelligence', 'perseverance', 'fairness'],
    subjects: ['Обществознание', 'Математика', 'Русский язык'],
    skills: {
      hard: ['Управление персоналом', 'Планирование выручки', 'Мерчандайзинг', 'Учёт товара'],
      soft: ['Лидерство', 'Организованность', 'Клиентский сервис']
    },
    demand: 'high',
    skillFormula: ['Организация работы магазина', 'Выполнение плана продаж', 'Управление командой смены'],
    transferableTo: ['Региональный управляющий', 'Менеджер по продажам', 'Предприниматель', 'Специалист по закупкам'],
    summary: 'Отвечает за работу магазина целиком: команда, выручка, товар и довольные покупатели.',
    why: 'Для организованных лидеров (Enterprising/Conventional), кому нравится вести команду и отвечать за живой результат.'
  },
  {
    id: 'nail-technician',
    name: 'Мастер маникюра / Бьюти-мастер',
    industry: 'Сфера услуг, красота и гостеприимство',
    tier: 'everyday',
    archetype: 'beauty-master',
    riasec: ['Artistic', 'Realistic', 'Social'],
    gardner: ['Bodily-Kinesthetic', 'Spatial-Visual'],
    bigFive: { traits: { Conscientiousness: 'high', Agreeableness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['achievement', 'hedonism', 'self_direction'],
    viaFit: ['creativity', 'appreciation_of_beauty', 'social_intelligence', 'perseverance'],
    subjects: ['Изобразительное искусство', 'Биология', 'Технология'],
    skills: {
      hard: ['Техники маникюра', 'Дизайн ногтей', 'Гигиена и стерилизация', 'Работа с клиентом'],
      soft: ['Аккуратность', 'Художественный вкус', 'Общительность']
    },
    demand: 'high',
    skillFormula: ['Красота через ручную работу', 'Внимание к деталям', 'Тёплый контакт с клиентом'],
    transferableTo: ['Косметолог-эстетист', 'Парикмахер', 'Визажист', 'Предприниматель бьюти-сферы'],
    summary: 'Создаёт ухоженные и красивые ногти, сочетая ручную технику и художественный дизайн.',
    why: 'Для аккуратных и творческих (Artistic/Realistic), кто любит работу руками, красоту и общение с людьми.'
  },
  {
    id: 'bartender',
    name: 'Бармен',
    industry: 'Сфера услуг, красота и гостеприимство',
    tier: 'everyday',
    archetype: 'bartender',
    riasec: ['Social', 'Realistic', 'Enterprising'],
    gardner: ['Bodily-Kinesthetic', 'Interpersonal'],
    bigFive: { traits: { Extraversion: 'high', Stability: 'high' } },
    cognitiveDemand: 'medium',
    values: ['hedonism', 'stimulation', 'achievement'],
    viaFit: ['social_intelligence', 'zest', 'humor', 'creativity'],
    subjects: ['Обществознание', 'Химия', 'Иностранный язык'],
    skills: {
      hard: ['Приготовление напитков', 'Знание рецептур', 'Работа за стойкой', 'Обслуживание гостей'],
      soft: ['Общительность', 'Скорость', 'Стрессоустойчивость']
    },
    demand: 'medium',
    skillFormula: ['Атмосфера и хорошее настроение гостей', 'Скорость и точность за стойкой', 'Живое общение'],
    transferableTo: ['Официант', 'Бариста', 'Управляющий баром', 'Ивент-менеджер'],
    summary: 'Готовит напитки и коктейли, держит атмосферу за барной стойкой и общается с гостями.',
    why: 'Для энергичных и общительных (Social/Realistic), кто любит движ, скорость и создавать настроение людям.'
  },
  {
    id: 'travel-agent',
    name: 'Турагент',
    industry: 'Туризм и премиальное гостеприимство',
    tier: 'everyday',
    archetype: 'travel-agent',
    riasec: ['Enterprising', 'Social', 'Conventional'],
    gardner: ['Interpersonal', 'Linguistic'],
    bigFive: { traits: { Extraversion: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'medium',
    values: ['achievement', 'benevolence', 'stimulation'],
    viaFit: ['social_intelligence', 'zest', 'prudence', 'curiosity'],
    subjects: ['География', 'Иностранный язык', 'Обществознание'],
    skills: {
      hard: ['Подбор туров', 'Бронирование', 'Знание направлений', 'Оформление документов'],
      soft: ['Коммуникабельность', 'Внимательность', 'Клиентский сервис']
    },
    demand: 'medium',
    skillFormula: ['Подбор идеального путешествия под клиента', 'Забота о деталях поездки', 'Продажа впечатлений'],
    transferableTo: ['Организатор делового туризма (MICE)', 'Менеджер по продажам', 'Гид-экскурсовод', 'Организатор эко-туризма'],
    summary: 'Подбирает и оформляет для людей путешествия под их бюджет и мечты, берёт на себя все детали.',
    why: 'Для общительных и внимательных (Enterprising/Social), кто любит путешествия и радость людей от поездок.'
  },
  {
    id: 'special-education-teacher',
    name: 'Дефектолог',
    industry: 'Образование и EdTech',
    tier: 'everyday',
    archetype: 'special-education-teacher',
    riasec: ['Social', 'Investigative', 'Artistic'],
    gardner: ['Interpersonal', 'Intrapersonal'],
    bigFive: { traits: { Agreeableness: 'high', Conscientiousness: 'high' } },
    cognitiveDemand: 'high',
    values: ['benevolence', 'universalism', 'achievement'],
    viaFit: ['kindness', 'love', 'perseverance', 'love_of_learning'],
    subjects: ['Биология', 'Обществознание', 'Русский язык'],
    skills: {
      hard: ['Коррекционные методики', 'Основы психологии развития', 'Индивидуальные программы', 'Диагностика особенностей'],
      soft: ['Терпение', 'Эмпатия', 'Наблюдательность']
    },
    demand: 'high',
    skillFormula: ['Помощь особым детям учиться и развиваться', 'Индивидуальный подход к каждому', 'Вера в каждого ребёнка'],
    transferableTo: ['Логопед', 'Детский психолог', 'Учитель начальных классов', 'Арт-терапевт'],
    summary: 'Помогает детям с особенностями развития учиться и развиваться по индивидуальным программам.',
    why: 'Для терпеливых и чутких (Social/Investigative), кто хочет помогать тем, кому нужна особая поддержка.'
  },
  {
    id: 'professional-driver',
    name: 'Водитель (пассажирские перевозки)',
    industry: 'Транспорт, логистика и беспилотные системы',
    tier: 'everyday',
    archetype: 'professional-driver',
    riasec: ['Realistic', 'Conventional', 'Social'],
    gardner: ['Bodily-Kinesthetic', 'Spatial-Visual'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'medium',
    values: ['security', 'achievement', 'self_direction'],
    viaFit: ['prudence', 'self_regulation', 'perseverance', 'kindness'],
    subjects: ['ОБЖ', 'Физика', 'География'],
    skills: {
      hard: ['Управление транспортом', 'Знание ПДД', 'Обслуживание автомобиля', 'Планирование маршрута'],
      soft: ['Внимательность', 'Ответственность', 'Выдержка']
    },
    demand: 'high',
    skillFormula: ['Безопасно довезти людей из точки в точку', 'Спокойствие за рулём', 'Ответственность за пассажиров'],
    transferableTo: ['Водитель-дальнобойщик', 'Логист', 'Диспетчер', 'Инструктор по вождению'],
    summary: 'Безопасно перевозит пассажиров на такси, автобусе или трансфере, отвечая за них в дороге.',
    why: 'Для собранных и самостоятельных (Realistic/Conventional), кто любит дорогу и чувствует ответственность за людей.'
  },
  {
    id: 'customs-officer',
    name: 'Таможенный инспектор',
    industry: 'Госслужба, безопасность и оборона',
    tier: 'everyday',
    archetype: 'customs-officer',
    riasec: ['Conventional', 'Realistic', 'Enterprising'],
    gardner: ['Logical-Mathematical', 'Interpersonal'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
    cognitiveDemand: 'high',
    values: ['security', 'conformity', 'achievement'],
    viaFit: ['judgment', 'honesty', 'prudence', 'fairness'],
    subjects: ['Право', 'Обществознание', 'Иностранный язык'],
    skills: {
      hard: ['Таможенное оформление', 'Контроль грузов', 'Проверка документов', 'Валютное регулирование'],
      soft: ['Внимательность', 'Принципиальность', 'Стрессоустойчивость']
    },
    demand: 'medium',
    skillFormula: ['Контроль перемещения товаров через границу', 'Проверка по закону', 'Выявление нарушений'],
    transferableTo: ['Логист по управлению цепочками поставок', 'Специалист по закупкам', 'Юрисконсульт', 'Комплаенс-офицер'],
    summary: 'Контролирует товары и грузы на границе, оформляет документы и выявляет нарушения.',
    why: 'Для внимательных и принципиальных (Conventional/Realistic), кто ценит порядок, закон и работу с деталями.'
  },
  {
    id: 'land-surveyor',
    name: 'Геодезист',
    industry: 'Строительство и ремонт',
    tier: 'everyday',
    archetype: 'land-surveyor',
    riasec: ['Realistic', 'Investigative', 'Conventional'],
    gardner: ['Spatial-Visual', 'Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high', Openness: 'high' } },
    cognitiveDemand: 'high',
    values: ['achievement', 'security', 'self_direction'],
    viaFit: ['judgment', 'prudence', 'perseverance', 'curiosity'],
    subjects: ['Математика', 'География', 'Физика'],
    skills: {
      hard: ['Геодезические измерения', 'Работа с приборами', 'Составление планов', 'Топографическая съёмка'],
      soft: ['Точность', 'Внимательность', 'Полевая выносливость']
    },
    demand: 'medium',
    skillFormula: ['Точные измерения местности', 'Основа для стройки и карт', 'Работа в поле и с приборами'],
    transferableTo: ['Инженер-строитель (Конструктор)', 'Проектировщик умных городов', 'Эколог-урбанист', 'Специалист по 3D-печати'],
    summary: 'Измеряет и размечает местность для строительства и карт с помощью точных приборов.',
    why: 'Для точных и любящих природу (Realistic/Investigative), кому нравится работа в поле и с координатами.'
  }
];

// docs/26 Этап 8 + Трек B: обогащаем паспорта полями каталога. Курируемые
// fact/salary — из professionExtras (батчами). outlook/educationPath — выводим
// программно из уже собранных полей, чтобы у ВСЕХ профессий сразу была польза;
// курируемый override из extras имеет приоритет.
function deriveOutlook(p: Profession): string {
  if (p.tier === 'future') return 'Растущее направление — спрос на специалистов увеличивается.';
  if (p.tier === 'dream') return 'Высокая конкуренция, но и высокий потолок для лучших.';
  if (p.demand === 'high') return 'Высокий и стабильный спрос на рынке труда.';
  if (p.demand === 'low') return 'Нишевый спрос — многое решают специализация и репутация.';
  return 'Устойчивый спрос на рынке труда.';
}

function deriveEducationPath(p: Profession): string {
  const subj = p.subjects.slice(0, 3).join(', ');
  return `Сдавать: ${subj}. Путь: колледж или профильный ВУЗ по направлению «${p.industry}».`;
}

for (const p of professionsDb) {
  const extra = professionExtras[p.id];
  if (extra) {
    if (extra.fact && !p.fact) p.fact = extra.fact;
    if (extra.salary && !p.salary) p.salary = extra.salary;
    if (extra.educationPath && !p.educationPath) p.educationPath = extra.educationPath;
    if (extra.outlook && !p.outlook) p.outlook = extra.outlook;
  }
  if (!p.outlook) p.outlook = deriveOutlook(p);
  if (!p.educationPath) p.educationPath = deriveEducationPath(p);
}
