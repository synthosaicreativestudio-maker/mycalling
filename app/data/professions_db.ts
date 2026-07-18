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
}

export const industries = [
  'IT и разработка ПО',
  'Аналитика данных и ИИ',
  'Робототехника и хардвер',
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
  'Туризм и премиальное гостеприимство'
];

export const professionsDb: Profession[] = [
  // 1. IT и разработка ПО
  {
    id: 'backend-developer',
    name: 'Backend-разработчик',
    industry: 'IT и разработка ПО',
    riasec: ['Conventional', 'Realistic', 'Investigative'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
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
    riasec: ['Artistic', 'Realistic', 'Conventional'],
    gardner: ['Spatial-Visual', 'Logical-Mathematical'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high' } },
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
    riasec: ['Investigative', 'Conventional', 'Realistic'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
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
    riasec: ['Conventional', 'Realistic', 'Investigative'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high' } },
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
    riasec: ['Realistic', 'Conventional', 'Investigative'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Stability: 'high', Conscientiousness: 'high' } },
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
    riasec: ['Artistic', 'Conventional', 'Realistic'],
    gardner: ['Logical-Mathematical', 'Spatial-Visual'],
    bigFive: { traits: { Conscientiousness: 'high' } },
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
    riasec: ['Investigative', 'Conventional', 'Realistic'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high', Stability: 'high' } },
    subjects: ['Математика', 'Информатика', 'Русский язык'],
    summary: 'Анализирует огромные массивы данных, находит закономерности и строит прогнозные модели ИИ.',
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
    riasec: ['Artistic', 'Investigative', 'Conventional'],
    gardner: ['Linguistic', 'Logical-Mathematical'],
    bigFive: { traits: { Openness: 'high' } },
    subjects: ['Русский язык', 'Информатика', 'Обществознание'],
    summary: 'Разрабатывает текстовые запросы для больших языковых моделей с целью получения точных ответов.',
    why: 'Требует лингвистической изобретательности (Artistic/Linguistic) наряду с логическим тестированием результатов работы ИИ (Investigative/Conventional).',
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
    riasec: ['Investigative', 'Conventional', 'Enterprising'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high' } },
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
    riasec: ['Investigative', 'Realistic', 'Conventional'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high', Stability: 'high' } },
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
    riasec: ['Conventional', 'Realistic', 'Investigative'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high' } },
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
    riasec: ['Conventional', 'Investigative', 'Enterprising'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high' } },
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
    riasec: ['Realistic', 'Investigative', 'Conventional'],
    gardner: ['Logical-Mathematical', 'Spatial-Visual'],
    bigFive: { traits: { Conscientiousness: 'high', Openness: 'high' } },
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
    riasec: ['Realistic', 'Investigative', 'Conventional'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high' } },
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
    riasec: ['Realistic', 'Conventional'],
    gardner: ['Spatial-Visual', 'Bodily-Kinesthetic'],
    bigFive: { traits: { Stability: 'high' } },
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
    riasec: ['Realistic', 'Investigative', 'Conventional'],
    gardner: ['Logical-Mathematical', 'Spatial-Visual'],
    bigFive: { traits: { Conscientiousness: 'high' } },
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
    riasec: ['Realistic', 'Conventional', 'Artistic'],
    gardner: ['Spatial-Visual'],
    bigFive: { traits: { Conscientiousness: 'high' } },
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
    riasec: ['Realistic', 'Investigative', 'Conventional'],
    gardner: ['Spatial-Visual', 'Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high' } },
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
    riasec: ['Realistic', 'Investigative', 'Conventional'],
    gardner: ['Logical-Mathematical', 'Spatial-Visual'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
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
    riasec: ['Realistic', 'Investigative', 'Conventional'],
    gardner: ['Logical-Mathematical', 'Spatial-Visual'],
    bigFive: { traits: { Conscientiousness: 'high' } },
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
    riasec: ['Artistic', 'Realistic', 'Investigative'],
    gardner: ['Spatial-Visual', 'Logical-Mathematical'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high' } },
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
    riasec: ['Artistic', 'Realistic', 'Investigative'],
    gardner: ['Spatial-Visual'],
    bigFive: { traits: { Openness: 'high' } },
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
    riasec: ['Realistic', 'Investigative', 'Conventional'],
    gardner: ['Logical-Mathematical', 'Naturalist'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high' } },
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
    riasec: ['Investigative', 'Realistic', 'Social'],
    gardner: ['Naturalist', 'Spatial-Visual'],
    bigFive: { traits: { Openness: 'high', Agreeableness: 'high' } },
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
    riasec: ['Realistic', 'Investigative', 'Conventional'],
    gardner: ['Naturalist', 'Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high' } },
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
    riasec: ['Conventional', 'Enterprising', 'Investigative'],
    gardner: ['Logical-Mathematical', 'Naturalist'],
    bigFive: { traits: { Conscientiousness: 'high' } },
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
    riasec: ['Conventional', 'Realistic', 'Investigative'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high' } },
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
    riasec: ['Investigative', 'Realistic', 'Conventional'],
    gardner: ['Logical-Mathematical', 'Naturalist'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
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
    riasec: ['Investigative', 'Conventional', 'Realistic'],
    gardner: ['Logical-Mathematical', 'Naturalist'],
    bigFive: { traits: { Conscientiousness: 'high' } },
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
    riasec: ['Investigative', 'Realistic', 'Conventional'],
    gardner: ['Naturalist', 'Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high' } },
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
    riasec: ['Investigative', 'Realistic', 'Conventional'],
    gardner: ['Naturalist', 'Logical-Mathematical'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high' } },
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
    riasec: ['Investigative', 'Artistic', 'Social'],
    gardner: ['Naturalist', 'Intrapersonal'],
    bigFive: { traits: { Openness: 'high', Stability: 'high' } },
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
    riasec: ['Social', 'Investigative', 'Artistic'],
    gardner: ['Interpersonal', 'Linguistic'],
    bigFive: { traits: { Agreeableness: 'high', Extraversion: 'high' } },
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
    riasec: ['Realistic', 'Social', 'Investigative'],
    gardner: ['Bodily-Kinesthetic', 'Spatial-Visual'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
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
    riasec: ['Investigative', 'Social', 'Artistic'],
    gardner: ['Interpersonal', 'Naturalist'],
    bigFive: { traits: { Agreeableness: 'high', Openness: 'high' } },
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
    riasec: ['Realistic', 'Investigative', 'Social'],
    gardner: ['Spatial-Visual', 'Bodily-Kinesthetic'],
    bigFive: { traits: { Conscientiousness: 'high' } },
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
    riasec: ['Social', 'Investigative', 'Realistic'],
    gardner: ['Interpersonal'],
    bigFive: { traits: { Agreeableness: 'high', Stability: 'high' } },
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
    riasec: ['Investigative', 'Realistic', 'Conventional'],
    gardner: ['Spatial-Visual', 'Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high' } },
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
    riasec: ['Enterprising', 'Artistic', 'Social'],
    gardner: ['Interpersonal', 'Linguistic'],
    bigFive: { traits: { Openness: 'high', Extraversion: 'high' } },
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
    riasec: ['Enterprising', 'Social', 'Artistic'],
    gardner: ['Interpersonal', 'Linguistic'],
    bigFive: { traits: { Extraversion: 'high', Agreeableness: 'high' } },
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
    riasec: ['Artistic', 'Enterprising', 'Social'],
    gardner: ['Linguistic', 'Interpersonal'],
    bigFive: { traits: { Openness: 'high', Extraversion: 'high' } },
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
    riasec: ['Conventional', 'Enterprising', 'Investigative'],
    gardner: ['Logical-Mathematical', 'Interpersonal'],
    bigFive: { traits: { Conscientiousness: 'high' } },
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
    riasec: ['Enterprising', 'Artistic', 'Social'],
    gardner: ['Interpersonal', 'Linguistic'],
    bigFive: { traits: { Openness: 'high', Extraversion: 'high', Conscientiousness: 'high' } },
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
    riasec: ['Enterprising', 'Social', 'Artistic'],
    gardner: ['Interpersonal'],
    bigFive: { traits: { Extraversion: 'high', Agreeableness: 'high' } },
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
    riasec: ['Enterprising', 'Artistic', 'Social'],
    gardner: ['Interpersonal', 'Intrapersonal'],
    bigFive: { traits: { Openness: 'high', Extraversion: 'high', Stability: 'high' } },
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
    riasec: ['Enterprising', 'Investigative', 'Conventional'],
    gardner: ['Interpersonal', 'Logical-Mathematical'],
    bigFive: { traits: { Extraversion: 'high', Conscientiousness: 'high', Stability: 'high' } },
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
    riasec: ['Enterprising', 'Conventional', 'Social'],
    gardner: ['Interpersonal'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high', Agreeableness: 'high' } },
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
    riasec: ['Social', 'Conventional', 'Enterprising'],
    gardner: ['Interpersonal'],
    bigFive: { traits: { Agreeableness: 'high', Extraversion: 'high' } },
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
    riasec: ['Enterprising', 'Social', 'Conventional'],
    gardner: ['Interpersonal', 'Intrapersonal'],
    bigFive: { traits: { Stability: 'high', Extraversion: 'high' } },
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
    riasec: ['Enterprising', 'Investigative', 'Conventional'],
    gardner: ['Logical-Mathematical', 'Interpersonal'],
    bigFive: { traits: { Extraversion: 'high', Conscientiousness: 'high' } },
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
    riasec: ['Conventional', 'Investigative', 'Enterprising'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high' } },
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
    riasec: ['Enterprising', 'Investigative', 'Conventional'],
    gardner: ['Logical-Mathematical', 'Intrapersonal'],
    bigFive: { traits: { Stability: 'high', Openness: 'high' } },
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
    riasec: ['Investigative', 'Realistic', 'Conventional'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
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
    riasec: ['Conventional', 'Investigative', 'Enterprising'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
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
    riasec: ['Social', 'Conventional', 'Enterprising'],
    gardner: ['Interpersonal', 'Logical-Mathematical'],
    bigFive: { traits: { Agreeableness: 'high', Conscientiousness: 'high' } },
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
    riasec: ['Artistic', 'Investigative', 'Conventional'],
    gardner: ['Spatial-Visual', 'Interpersonal'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high' } },
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
    riasec: ['Artistic', 'Realistic', 'Investigative'],
    gardner: ['Spatial-Visual'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high' } },
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
    riasec: ['Artistic', 'Investigative', 'Enterprising'],
    gardner: ['Spatial-Visual', 'Logical-Mathematical', 'Linguistic'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high' } },
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
    riasec: ['Artistic', 'Enterprising', 'Social'],
    gardner: ['Spatial-Visual'],
    bigFive: { traits: { Openness: 'high' } },
    subjects: ['Литература', 'Обществознание', 'Русский язык'],
    summary: 'Разрабатывает логотипы, фирменные стили компаний, афиши и полиграфию.',
    why: 'Эстетическое самовыражение (Artistic) нацелено на решение коммерческих задач брендинга заказчика (Enterprising) с учетом визуального комфорта людей (Social).',
    skills: {
      hard: ['Adobe Photoshop/Illustrator/InDesign', 'Типографика и шрифты', 'Подготовка к печати (Prepress)', 'Колористика'],
      soft: ['Визуальная эмпатия', 'Креативность', 'Переговоры с клиентами']
    },
    demand: 'high',
    skillFormula: ['Типографика', 'Айдентика бренда', 'Композиция'],
    transferableTo: ['UX/UI-дизайнер', 'Иллюстратор', 'Бренд-менеджер']
  },
  {
    id: 'vr-designer',
    name: 'Архитектор виртуальных миров (VR/AR)',
    industry: 'Дизайн и креативные индустрии',
    riasec: ['Artistic', 'Investigative', 'Realistic'],
    gardner: ['Spatial-Visual', 'Logical-Mathematical'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high' } },
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
    riasec: ['Artistic', 'Enterprising'],
    gardner: ['Spatial-Visual'],
    bigFive: { traits: { Openness: 'high' } },
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
    riasec: ['Artistic', 'Social', 'Enterprising'],
    gardner: ['Linguistic'],
    bigFive: { traits: { Openness: 'high', Agreeableness: 'high' } },
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
    riasec: ['Social', 'Artistic', 'Enterprising'],
    gardner: ['Interpersonal', 'Linguistic'],
    bigFive: { traits: { Extraversion: 'high', Agreeableness: 'high' } },
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
    riasec: ['Artistic', 'Investigative', 'Enterprising'],
    gardner: ['Linguistic', 'Spatial-Visual'],
    bigFive: { traits: { Openness: 'high' } },
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
    riasec: ['Artistic', 'Realistic', 'Investigative'],
    gardner: ['Spatial-Visual', 'Musical'],
    bigFive: { traits: { Conscientiousness: 'high' } },
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
    riasec: ['Investigative', 'Artistic', 'Social'],
    gardner: ['Linguistic', 'Logical-Mathematical'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high' } },
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
    riasec: ['Social', 'Investigative', 'Artistic'],
    gardner: ['Interpersonal', 'Linguistic'],
    bigFive: { traits: { Agreeableness: 'high', Conscientiousness: 'high' } },
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
    riasec: ['Social', 'Investigative', 'Artistic'],
    gardner: ['Interpersonal', 'Intrapersonal'],
    bigFive: { traits: { Agreeableness: 'high', Extraversion: 'high' } },
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
    riasec: ['Social', 'Investigative', 'Realistic', 'Conventional'],
    gardner: ['Interpersonal', 'Logical-Mathematical'],
    bigFive: { traits: { Agreeableness: 'high', Conscientiousness: 'high' } },
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
    riasec: ['Social', 'Artistic', 'Enterprising'],
    gardner: ['Interpersonal', 'Spatial-Visual'],
    bigFive: { traits: { Extraversion: 'high', Agreeableness: 'high' } },
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
    riasec: ['Social', 'Enterprising', 'Conventional'],
    gardner: ['Interpersonal', 'Linguistic'],
    bigFive: { traits: { Extraversion: 'high', Agreeableness: 'high' } },
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
    riasec: ['Social', 'Investigative', 'Artistic'],
    gardner: ['Interpersonal', 'Intrapersonal'],
    bigFive: { traits: { Agreeableness: 'high', Stability: 'high' } },
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
    riasec: ['Social', 'Artistic', 'Enterprising'],
    gardner: ['Interpersonal', 'Intrapersonal'],
    bigFive: { traits: { Extraversion: 'high', Stability: 'high' } },
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
    riasec: ['Realistic', 'Social', 'Investigative'],
    gardner: ['Bodily-Kinesthetic', 'Interpersonal'],
    bigFive: { traits: { Agreeableness: 'high', Conscientiousness: 'high' } },
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
    riasec: ['Artistic', 'Social'],
    gardner: ['Spatial-Visual', 'Interpersonal'],
    bigFive: { traits: { Openness: 'high', Agreeableness: 'high' } },
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
    riasec: ['Social', 'Enterprising', 'Conventional'],
    gardner: ['Interpersonal', 'Intrapersonal'],
    bigFive: { traits: { Agreeableness: 'high', Conscientiousness: 'high' } },
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
    riasec: ['Enterprising', 'Investigative', 'Conventional'],
    gardner: ['Linguistic', 'Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
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
    riasec: ['Conventional', 'Enterprising', 'Investigative'],
    gardner: ['Logical-Mathematical', 'Linguistic'],
    bigFive: { traits: { Conscientiousness: 'high' } },
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
    riasec: ['Enterprising', 'Investigative', 'Social'],
    gardner: ['Linguistic', 'Interpersonal'],
    bigFive: { traits: { Extraversion: 'high', Stability: 'high', Conscientiousness: 'high' } },
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
    riasec: ['Conventional', 'Investigative', 'Enterprising'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high' } },
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
    riasec: ['Social', 'Enterprising', 'Conventional'],
    gardner: ['Interpersonal', 'Linguistic'],
    bigFive: { traits: { Agreeableness: 'high', Stability: 'high', Extraversion: 'high' } },
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
    riasec: ['Investigative', 'Realistic', 'Conventional'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
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
    riasec: ['Investigative', 'Realistic', 'Conventional'],
    gardner: ['Logical-Mathematical', 'Spatial-Visual'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high' } },
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
    riasec: ['Investigative', 'Realistic', 'Conventional'],
    gardner: ['Logical-Mathematical', 'Naturalist'],
    bigFive: { traits: { Conscientiousness: 'high' } },
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
    riasec: ['Investigative', 'Realistic', 'Conventional'],
    gardner: ['Logical-Mathematical', 'Naturalist'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
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
    riasec: ['Investigative', 'Artistic', 'Social'],
    gardner: ['Logical-Mathematical', 'Linguistic'],
    bigFive: { traits: { Openness: 'high', Conscientiousness: 'high' } },
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
    riasec: ['Realistic', 'Investigative', 'Conventional'],
    gardner: ['Naturalist', 'Spatial-Visual'],
    bigFive: { traits: { Conscientiousness: 'high', Openness: 'high' } },
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
    riasec: ['Realistic', 'Investigative', 'Conventional'],
    gardner: ['Naturalist', 'Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high' } },
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
    riasec: ['Investigative', 'Realistic', 'Conventional'],
    gardner: ['Naturalist', 'Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high' } },
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
    riasec: ['Realistic', 'Conventional', 'Investigative'],
    gardner: ['Spatial-Visual', 'Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
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
    riasec: ['Conventional', 'Investigative', 'Enterprising'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
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
    riasec: ['Realistic', 'Investigative', 'Conventional'],
    gardner: ['Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high', Stability: 'high' } },
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
    riasec: ['Conventional', 'Realistic', 'Investigative'],
    gardner: ['Spatial-Visual', 'Logical-Mathematical'],
    bigFive: { traits: { Conscientiousness: 'high' } },
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
    riasec: ['Social', 'Enterprising', 'Investigative'],
    gardner: ['Interpersonal', 'Logical-Mathematical'],
    bigFive: { traits: { Extraversion: 'high', Stability: 'high' } },
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
    riasec: ['Investigative', 'Social', 'Artistic'],
    gardner: ['Naturalist', 'Interpersonal'],
    bigFive: { traits: { Agreeableness: 'high', Conscientiousness: 'high' } },
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
    riasec: ['Social', 'Realistic', 'Enterprising'],
    gardner: ['Bodily-Kinesthetic', 'Interpersonal'],
    bigFive: { traits: { Extraversion: 'high', Agreeableness: 'high' } },
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
    riasec: ['Enterprising', 'Social', 'Artistic'],
    gardner: ['Interpersonal'],
    bigFive: { traits: { Extraversion: 'high', Conscientiousness: 'high' } },
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
    riasec: ['Social', 'Artistic', 'Investigative'],
    gardner: ['Naturalist', 'Interpersonal'],
    bigFive: { traits: { Openness: 'high', Agreeableness: 'high' } },
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
    riasec: ['Enterprising', 'Social', 'Conventional'],
    gardner: ['Interpersonal'],
    bigFive: { traits: { Extraversion: 'high', Agreeableness: 'high', Conscientiousness: 'high' } },
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
    riasec: ['Enterprising', 'Conventional', 'Social'],
    gardner: ['Interpersonal'],
    bigFive: { traits: { Conscientiousness: 'high', Extraversion: 'high' } },
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
  }
];
