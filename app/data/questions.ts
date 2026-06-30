export const scaleOptions: [string, string, string, string, string] = [
  'Точно нет',
  'Скорее нет',
  'Нейтрально',
  'Скорее да',
  'Точно да'
];

export interface DiagnosticQuestion {
  id: string;
  testCode: 'RIASEC' | 'BFI' | 'ICAR' | 'PROCRASTINATION';
  text: string;
  scale: string;
  reverseScored: boolean;
  options: string[];
  visualAssetUrl: string;
}

export const diagnosticQuestions: DiagnosticQuestion[] = [
  // ─── 1. Интересы (RIASEC) ───
  {
    id: 'riasec-r1',
    testCode: 'RIASEC',
    text: 'Мне нравится работать с техникой, собирать механизмы или ремонтировать приборы своими руками.',
    scale: 'R',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/realistic.webp'
  },
  {
    id: 'riasec-r2',
    testCode: 'RIASEC',
    text: 'Я предпочитаю практическую работу, где виден осязаемый физический результат деятельности.',
    scale: 'R',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/realistic.webp'
  },
  {
    id: 'riasec-i1',
    testCode: 'RIASEC',
    text: 'Мне интересно проводить исследования, анализировать сложные данные и докапываться до сути явлений.',
    scale: 'I',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/investigative.webp'
  },
  {
    id: 'riasec-i2',
    testCode: 'RIASEC',
    text: 'Я люблю решать сложные логические или математические задачи, программировать или строить модели.',
    scale: 'I',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/investigative.webp'
  },
  {
    id: 'riasec-a1',
    testCode: 'RIASEC',
    text: 'Мне важно выражать себя через искусство, дизайн, литературу, музыку или актерское мастерство.',
    scale: 'A',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/artistic.webp'
  },
  {
    id: 'riasec-a2',
    testCode: 'RIASEC',
    text: 'Я чувствую себя некомфортно, когда меня заставляют работать по жестким шаблонам и инструкциям.',
    scale: 'A',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/artistic.webp'
  },
  {
    id: 'riasec-s1',
    testCode: 'RIASEC',
    text: 'Мне приносит радость обучать других людей, объяснять сложные темы или помогать в трудной ситуации.',
    scale: 'S',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/social.webp'
  },
  {
    id: 'riasec-s2',
    testCode: 'RIASEC',
    text: 'Я предпочитаю коллективные проекты и командную работу, а не индивидуальные задания.',
    scale: 'S',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/social.webp'
  },
  {
    id: 'riasec-e1',
    testCode: 'RIASEC',
    text: 'Мне нравится брать на себя лидерство, организовывать мероприятия, вести переговоры или убеждать людей.',
    scale: 'E',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/enterprising.webp'
  },
  {
    id: 'riasec-e2',
    testCode: 'RIASEC',
    text: 'Меня привлекает идея создать собственный проект, стартап или бизнес и принимать ключевые решения.',
    scale: 'E',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/enterprising.webp'
  },
  {
    id: 'riasec-c1',
    testCode: 'RIASEC',
    text: 'Мне нравится работать со структурированной информацией, вести учет, файлы или систематизировать таблицы.',
    scale: 'C',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/conventional.webp'
  },
  {
    id: 'riasec-c2',
    testCode: 'RIASEC',
    text: 'Я ценю предсказуемость, порядок и четкие инструкции при выполнении учебных или рабочих задач.',
    scale: 'C',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/conventional.webp'
  },

  // ─── 2. Личность (Big Five / OCEAN) ───
  {
    id: 'bfi-o1',
    testCode: 'BFI',
    text: 'Я обладаю живым воображением, люблю изучать новые абстрактные идеи и пробовать нестандартные вещи.',
    scale: 'O',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/openness.webp'
  },
  {
    id: 'bfi-o2',
    testCode: 'BFI',
    text: 'Я часто интересуюсь искусством, дизайном, культурой и ценю эстетическую сторону жизни.',
    scale: 'O',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/openness.webp'
  },
  {
    id: 'bfi-c1',
    testCode: 'BFI',
    text: 'Я ответственно подхожу к учебе, стараюсь планировать дела заранее и доводить начатое до конца.',
    scale: 'C_bigfive',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/conscientiousness.webp'
  },
  {
    id: 'bfi-c2',
    testCode: 'BFI',
    text: 'Иногда мне бывает трудно поддерживать порядок в вещах, и я склонен действовать спонтанно.',
    scale: 'C_bigfive',
    reverseScored: true,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/conscientiousness.webp'
  },
  {
    id: 'bfi-e1',
    testCode: 'BFI',
    text: 'Я общительный, активный человек, легко завожу новые знакомства и люблю быть в центре внимания.',
    scale: 'E_bigfive',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/extraversion.webp'
  },
  {
    id: 'bfi-e2',
    testCode: 'BFI',
    text: 'Я предпочитаю проводить свободное время в тишине наедине с собой, а не на шумных мероприятиях.',
    scale: 'E_bigfive',
    reverseScored: true,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/extraversion.webp'
  },
  {
    id: 'bfi-a1',
    testCode: 'BFI',
    text: 'Мне важно, чтобы в отношениях с людьми не было конфликтов, я легко иду на компромисс и доверяю другим.',
    scale: 'A_bigfive',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/agreeableness.webp'
  },
  {
    id: 'bfi-a2',
    testCode: 'BFI',
    text: 'Я всегда готов сопереживать и помогать людям, даже если это требует моего личного времени.',
    scale: 'A_bigfive',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/agreeableness.webp'
  },
  {
    id: 'bfi-n1',
    testCode: 'BFI',
    text: 'Я часто беспокоюсь по пустякам, сильно переживаю из-за критики или плохих оценок.',
    scale: 'N',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/stability.webp'
  },
  {
    id: 'bfi-n2',
    testCode: 'BFI',
    text: 'В стрессовых ситуациях я сохраняю спокойствие и быстро нахожу выход из затруднительных положений.',
    scale: 'N',
    reverseScored: true,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/stability.webp'
  },

  // ─── 3. Когнитивный тест (ICAR) ───
  {
    id: 'icar-1',
    testCode: 'ICAR',
    text: 'Продолжите логический числовой ряд: 2, 4, 8, 16, 32, ... какой номер будет следующим?',
    scale: 'LOGIC',
    reverseScored: false,
    options: ['40', '48', '60', '64', '128'],
    visualAssetUrl: '/assets/webp/cognitive.webp'
  },
  {
    id: 'icar-2',
    testCode: 'ICAR',
    text: 'Какая буква должна быть следующей в ряду: А, В, Д, Ё, ... ? (Используется русский алфавит с шагом через одну букву)',
    scale: 'LOGIC',
    reverseScored: false,
    options: ['Ж', 'З', 'И', 'К', 'Л'],
    visualAssetUrl: '/assets/webp/cognitive.webp'
  },
  {
    id: 'icar-3',
    testCode: 'ICAR',
    text: 'Все металлы проводят электрический ток. Медь проводит электрический ток. Какой вывод верен?',
    scale: 'LOGIC',
    reverseScored: false,
    options: [
      'Медь — это обязательно металл',
      'Медь может быть металлом, а может и нет',
      'Электрический ток состоит из меди',
      'Металлы сделаны из меди',
      'Нет верного вывода'
    ],
    visualAssetUrl: '/assets/webp/cognitive.webp'
  },

  // ─── 4. Поведение (Прокрастинация Лэя) ───
  {
    id: 'lay-1',
    testCode: 'PROCRASTINATION',
    text: 'Я часто откладываю начало подготовки к сложным задачам (экзамены, проекты) на самый последний момент.',
    scale: 'PROCRASTINATION',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/procrastination.webp'
  },
  {
    id: 'lay-2',
    testCode: 'PROCRASTINATION',
    text: 'Я стараюсь выполнять все учебные или личные задания сразу, как только их получаю, чтобы не копить долги.',
    scale: 'PROCRASTINATION',
    reverseScored: true,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/procrastination.webp'
  },
  {
    id: 'lay-3',
    testCode: 'PROCRASTINATION',
    text: 'Если задача кажется мне скучной, я легко отвлекаюсь на мессенджеры, видео или игры.',
    scale: 'PROCRASTINATION',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/procrastination.webp'
  },
  {
    id: 'lay-4',
    testCode: 'PROCRASTINATION',
    text: 'Я почти никогда не опаздываю с выполнением обещаний или сдачей домашних работ.',
    scale: 'PROCRASTINATION',
    reverseScored: true,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/procrastination.webp'
  }
];
