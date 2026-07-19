export const scaleOptions: [string, string, string, string, string] = [
  'Точно нет',
  'Скорее нет',
  'Нейтрально',
  'Скорее да',
  'Точно да'
];

export interface DiagnosticQuestion {
  id: string;
  testCode: 'RIASEC' | 'BFI' | 'ICAR' | 'PROCRASTINATION' | 'VIA' | 'PVQ' | 'GROWTH' | 'CONTEXT';
  text: string;
  scale: string;
  reverseScored: boolean;
  options: string[];
  visualAssetUrl: string;
  /** Индекс (1-based) правильного варианта в options — только для тестов с объективно верным ответом (ICAR). */
  correctValue?: number;
  /** Сложность задания 1-3 — только для ICAR. */
  difficulty?: 1 | 2 | 3;
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
  {
    id: 'riasec-r3',
    testCode: 'RIASEC',
    text: 'Я бы с удовольствием чинил велосипед, собирал мебель или разбирался в работе бытовой техники.',
    scale: 'R',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/realistic.webp'
  },
  {
    id: 'riasec-r4',
    testCode: 'RIASEC',
    text: 'Мне интереснее работать руками на улице или в мастерской, чем сидеть за столом с бумагами.',
    scale: 'R',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/realistic.webp'
  },
  {
    id: 'riasec-i3',
    testCode: 'RIASEC',
    text: 'Мне нравится читать про научные открытия и разбираться, почему что-то работает именно так.',
    scale: 'I',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/investigative.webp'
  },
  {
    id: 'riasec-i4',
    testCode: 'RIASEC',
    text: 'Я люблю проводить эксперименты и проверять гипотезы, а не просто принимать готовые ответы.',
    scale: 'I',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/investigative.webp'
  },
  {
    id: 'riasec-a3',
    testCode: 'RIASEC',
    text: 'Мне нравится придумывать оригинальные идеи для дизайна, текста, видео или музыки.',
    scale: 'A',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/artistic.webp'
  },
  {
    id: 'riasec-a4',
    testCode: 'RIASEC',
    text: 'Я предпочитаю задачи, где можно проявить фантазию, а не действовать по готовому шаблону.',
    scale: 'A',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/artistic.webp'
  },
  {
    id: 'riasec-s3',
    testCode: 'RIASEC',
    text: 'Мне нравится выслушивать людей и помогать им разобраться в сложной личной ситуации.',
    scale: 'S',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/social.webp'
  },
  {
    id: 'riasec-s4',
    testCode: 'RIASEC',
    text: 'Я бы хотел заниматься чем-то, что напрямую помогает людям — обучением, заботой, консультированием.',
    scale: 'S',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/social.webp'
  },
  {
    id: 'riasec-e3',
    testCode: 'RIASEC',
    text: 'Мне нравится убеждать людей в своей точке зрения и вести переговоры, чтобы получить нужный результат.',
    scale: 'E',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/enterprising.webp'
  },
  {
    id: 'riasec-e4',
    testCode: 'RIASEC',
    text: 'Я легко беру на себя ответственность за проект и люблю видеть, как растут его результаты.',
    scale: 'E',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/enterprising.webp'
  },
  {
    id: 'riasec-c3',
    testCode: 'RIASEC',
    text: 'Мне комфортно работать с таблицами, базами данных или бухгалтерскими расчётами.',
    scale: 'C',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/conventional.webp'
  },
  {
    id: 'riasec-c4',
    testCode: 'RIASEC',
    text: 'Я стараюсь доводить любую задачу до полного порядка — проверять детали и не оставлять хвостов.',
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
  {
    id: 'bfi-o3',
    testCode: 'BFI',
    text: 'Мне нравится задавать вопросы «а что если» и представлять, как всё могло бы быть устроено иначе.',
    scale: 'O',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/openness.webp'
  },
  {
    id: 'bfi-o4',
    testCode: 'BFI',
    text: 'Я предпочитаю проверенные способы делать что-то, а не экспериментировать с новыми подходами.',
    scale: 'O',
    reverseScored: true,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/openness.webp'
  },
  {
    id: 'bfi-c3',
    testCode: 'BFI',
    text: 'Я довожу до конца даже скучные задачи, если понимаю, что они важны.',
    scale: 'C_bigfive',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/conscientiousness.webp'
  },
  {
    id: 'bfi-c4',
    testCode: 'BFI',
    text: 'Мне трудно заставить себя закончить дело, если оно перестало быть интересным.',
    scale: 'C_bigfive',
    reverseScored: true,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/conscientiousness.webp'
  },
  {
    id: 'bfi-e3',
    testCode: 'BFI',
    text: 'На вечеринке или в компании я обычно один из тех, кто начинает разговор первым.',
    scale: 'E_bigfive',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/extraversion.webp'
  },
  {
    id: 'bfi-e4',
    testCode: 'BFI',
    text: 'После активного общения с людьми мне нужно время побыть в одиночестве, чтобы восстановиться.',
    scale: 'E_bigfive',
    reverseScored: true,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/extraversion.webp'
  },
  {
    id: 'bfi-a3',
    testCode: 'BFI',
    text: 'Иногда я специально ставлю свои интересы выше интересов других, даже если это создаёт трение.',
    scale: 'A_bigfive',
    reverseScored: true,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/agreeableness.webp'
  },
  {
    id: 'bfi-a4',
    testCode: 'BFI',
    text: 'Я стараюсь понять точку зрения человека, даже если совсем с ней не согласен.',
    scale: 'A_bigfive',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/agreeableness.webp'
  },
  {
    id: 'bfi-n3',
    testCode: 'BFI',
    text: 'Меня легко вывести из равновесия неожиданными плохими новостями.',
    scale: 'N',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/stability.webp'
  },
  {
    id: 'bfi-n4',
    testCode: 'BFI',
    text: 'Даже после неприятного события я быстро прихожу в норму и продолжаю заниматься делами.',
    scale: 'N',
    reverseScored: true,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/stability.webp'
  },

  // ─── 2b. Локус контроля (LOC) и толерантность к неопределённости (AMB) ───
  {
    id: 'bfi-loc1',
    testCode: 'BFI',
    text: 'Мои успехи в учёбе зависят в первую очередь от того, сколько усилий я вкладываю.',
    scale: 'LOC',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/locus.webp'
  },
  {
    id: 'bfi-loc2',
    testCode: 'BFI',
    text: 'То, получится у меня что-то или нет, чаще всего зависит от везения или обстоятельств, а не от меня.',
    scale: 'LOC',
    reverseScored: true,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/locus.webp'
  },
  {
    id: 'bfi-loc3',
    testCode: 'BFI',
    text: 'Если я готовлюсь заранее, то могу повлиять на результат экзамена или соревнования.',
    scale: 'LOC',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/locus.webp'
  },
  {
    id: 'bfi-loc4',
    testCode: 'BFI',
    text: 'Что бы я ни делал, оценки и результаты часто зависят от учителя или обстоятельств, а не от меня.',
    scale: 'LOC',
    reverseScored: true,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/locus.webp'
  },
  {
    id: 'bfi-amb1',
    testCode: 'BFI',
    text: 'Мне комфортно браться за задачу, даже если не все правила и шаги заранее понятны.',
    scale: 'AMB',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/ambiguity.webp'
  },
  {
    id: 'bfi-amb2',
    testCode: 'BFI',
    text: 'Я чувствую сильный дискомфорт, когда не знаю точно, что от меня ожидают.',
    scale: 'AMB',
    reverseScored: true,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/ambiguity.webp'
  },
  {
    id: 'bfi-amb3',
    testCode: 'BFI',
    text: 'Задачи без единственного правильного ответа увлекают меня больше, чем пугают.',
    scale: 'AMB',
    reverseScored: false,
    options: scaleOptions,
    visualAssetUrl: '/assets/webp/ambiguity.webp'
  },

  // ─── 3. Когнитивный тест (ICAR): verbal / numeric / spatial ───
  {
    id: 'icar-1',
    testCode: 'ICAR',
    text: 'Продолжите логический числовой ряд: 2, 4, 8, 16, 32, ... какой номер будет следующим?',
    scale: 'numeric',
    reverseScored: false,
    options: ['40', '48', '60', '64', '128'],
    visualAssetUrl: '/assets/webp/cognitive.webp',
    correctValue: 4,
    difficulty: 1
  },
  {
    id: 'icar-2',
    testCode: 'ICAR',
    text: 'Какая буква должна быть следующей в ряду: А, В, Д, Ё, ... ? (Используется русский алфавит с шагом через одну букву)',
    scale: 'verbal',
    reverseScored: false,
    options: ['Ж', 'З', 'И', 'К', 'Л'],
    visualAssetUrl: '/assets/webp/cognitive.webp',
    correctValue: 2,
    difficulty: 2
  },
  {
    id: 'icar-3',
    testCode: 'ICAR',
    text: 'Все металлы проводят электрический ток. Медь проводит электрический ток. Какой вывод верен?',
    scale: 'verbal',
    reverseScored: false,
    options: [
      'Медь — это обязательно металл',
      'Медь может быть металлом, а может и нет',
      'Электрический ток состоит из меди',
      'Металлы сделаны из меди',
      'Нет верного вывода'
    ],
    visualAssetUrl: '/assets/webp/cognitive.webp',
    correctValue: 2,
    difficulty: 2
  },
  {
    id: 'icar-4',
    testCode: 'ICAR',
    text: 'Если позавчера было воскресенье, какой день недели будет завтра?',
    scale: 'verbal',
    reverseScored: false,
    options: ['Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
    visualAssetUrl: '/assets/webp/cognitive.webp',
    correctValue: 2,
    difficulty: 2
  },
  {
    id: 'icar-5',
    testCode: 'ICAR',
    text: 'Продолжите ряд чисел Фибоначчи: 1, 1, 2, 3, 5, 8, 13, ... какое число следующее?',
    scale: 'numeric',
    reverseScored: false,
    options: ['18', '19', '20', '21', '24'],
    visualAssetUrl: '/assets/webp/cognitive.webp',
    correctValue: 4,
    difficulty: 2
  },
  {
    id: 'icar-6',
    testCode: 'ICAR',
    text: 'В ряду чисел 3, 6, 11, 18, 27 разница между соседними числами каждый раз увеличивается на 2 (3, 5, 7, 9). Какое число идёт следующим?',
    scale: 'numeric',
    reverseScored: false,
    options: ['34', '36', '38', '40', '42'],
    visualAssetUrl: '/assets/webp/cognitive.webp',
    correctValue: 2,
    difficulty: 3
  },
  {
    id: 'icar-7',
    testCode: 'ICAR',
    text: 'В сетке 2×2 фигуры связаны одним правилом: сверху слева — маленький круг, сверху справа — большой круг, снизу слева — маленький квадрат. По аналогии (маленький → большой), какая фигура должна быть снизу справа?',
    scale: 'spatial',
    reverseScored: false,
    options: ['Маленький круг', 'Маленький квадрат', 'Большой квадрат', 'Большой треугольник', 'Большой круг'],
    visualAssetUrl: '/assets/webp/cognitive.webp',
    correctValue: 3,
    difficulty: 2
  },
  {
    id: 'icar-8',
    testCode: 'ICAR',
    text: 'Ряд фигур увеличивает число сторон на единицу каждый шаг: треугольник (3 стороны), квадрат (4), пятиугольник (5), шестиугольник (6), ... Сколько сторон будет у следующей фигуры в ряду?',
    scale: 'spatial',
    reverseScored: false,
    options: ['5', '6', '7', '8', '9'],
    visualAssetUrl: '/assets/webp/cognitive.webp',
    correctValue: 3,
    difficulty: 1
  },
  {
    id: 'icar-9',
    testCode: 'ICAR',
    text: 'В сетке 3×3 точка движется по кругу через четыре угла по часовой стрелке, пропуская центр: верхний-левый → верхний-правый → нижний-правый → нижний-левый → снова верхний-левый. Сейчас точка в верхнем-правом углу. В каком углу она окажется через 3 хода?',
    scale: 'spatial',
    reverseScored: false,
    options: ['Верхний-левый', 'Верхний-правый', 'Нижний-правый', 'Нижний-левый', 'В центре'],
    visualAssetUrl: '/assets/webp/cognitive.webp',
    correctValue: 1,
    difficulty: 3
  },

  // ─── 4. Сильные стороны характера (VIA Youth Survey, 24 силы / 6 добродетелей) ───
  {
    id: 'via-creativity', testCode: 'VIA', scale: 'creativity', reverseScored: false,
    text: 'Я часто придумываю новые способы сделать что-то — такие, до которых другие не додумались.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/via-wisdom.webp'
  },
  {
    id: 'via-curiosity', testCode: 'VIA', scale: 'curiosity', reverseScored: false,
    text: 'Мне интересно узнавать новое просто потому, что это увлекательно, а не потому что заставляют.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/via-wisdom.webp'
  },
  {
    id: 'via-judgment', testCode: 'VIA', scale: 'judgment', reverseScored: false,
    text: 'Прежде чем сделать вывод, я стараюсь посмотреть на ситуацию с разных сторон.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/via-wisdom.webp'
  },
  {
    id: 'via-love_of_learning', testCode: 'VIA', scale: 'love_of_learning', reverseScored: false,
    text: 'Мне нравится осваивать новый навык или тему просто ради самого процесса обучения.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/via-wisdom.webp'
  },
  {
    id: 'via-perspective', testCode: 'VIA', scale: 'perspective', reverseScored: false,
    text: 'Друзья часто приходят ко мне за советом, потому что я умею взглянуть на их ситуацию со стороны.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/via-wisdom.webp'
  },
  {
    id: 'via-bravery', testCode: 'VIA', scale: 'bravery', reverseScored: false,
    text: 'Я не отступаю, даже когда мне страшно или ситуация некомфортна.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/via-courage.webp'
  },
  {
    id: 'via-perseverance', testCode: 'VIA', scale: 'perseverance', reverseScored: false,
    text: 'Если я начал дело, я довожу его до конца, даже когда становится скучно или трудно.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/via-courage.webp'
  },
  {
    id: 'via-honesty', testCode: 'VIA', scale: 'honesty', reverseScored: false,
    text: 'Для меня важно говорить правду и вести себя в согласии с тем, во что я верю.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/via-courage.webp'
  },
  {
    id: 'via-zest', testCode: 'VIA', scale: 'zest', reverseScored: false,
    text: 'Я подхожу к жизни с энергией и энтузиазмом, редко отсиживаюсь в стороне.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/via-courage.webp'
  },
  {
    id: 'via-love', testCode: 'VIA', scale: 'love', reverseScored: false,
    text: 'Близкие отношения с людьми много значат для меня, я умею заботиться о других.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/via-humanity.webp'
  },
  {
    id: 'via-kindness', testCode: 'VIA', scale: 'kindness', reverseScored: false,
    text: 'Я часто делаю что-то хорошее для других, даже не ожидая ничего взамен.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/via-humanity.webp'
  },
  {
    id: 'via-social_intelligence', testCode: 'VIA', scale: 'social_intelligence', reverseScored: false,
    text: 'Я хорошо понимаю, что чувствуют и о чём думают другие люди, даже если они молчат об этом.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/via-humanity.webp'
  },
  {
    id: 'via-teamwork', testCode: 'VIA', scale: 'teamwork', reverseScored: false,
    text: 'Мне легко работать в команде на общий результат, даже если приходится уступать в мелочах.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/via-justice.webp'
  },
  {
    id: 'via-fairness', testCode: 'VIA', scale: 'fairness', reverseScored: false,
    text: 'Для меня важно относиться ко всем одинаково честно, даже к тем, кто мне не нравится.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/via-justice.webp'
  },
  {
    id: 'via-leadership', testCode: 'VIA', scale: 'leadership', reverseScored: false,
    text: 'Мне легко организовать группу людей и повести её к цели.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/via-justice.webp'
  },
  {
    id: 'via-forgiveness', testCode: 'VIA', scale: 'forgiveness', reverseScored: false,
    text: 'Я довольно легко прощаю тех, кто поступил со мной плохо, и не держу обиду долго.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/via-temperance.webp'
  },
  {
    id: 'via-humility', testCode: 'VIA', scale: 'humility', reverseScored: false,
    text: 'Я не люблю выставлять напоказ свои успехи и даю другим проявить себя.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/via-temperance.webp'
  },
  {
    id: 'via-prudence', testCode: 'VIA', scale: 'prudence', reverseScored: false,
    text: 'Я стараюсь тщательно обдумывать решения и не рисковать без необходимости.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/via-temperance.webp'
  },
  {
    id: 'via-self_regulation', testCode: 'VIA', scale: 'self_regulation', reverseScored: false,
    text: 'Я умею управлять своими эмоциями и поведением, даже когда злюсь или расстроен.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/via-temperance.webp'
  },
  {
    id: 'via-appreciation_of_beauty', testCode: 'VIA', scale: 'appreciation_of_beauty', reverseScored: false,
    text: 'Я замечаю и по-настоящему ценю красоту в природе, искусстве или мастерстве других людей.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/via-transcendence.webp'
  },
  {
    id: 'via-gratitude', testCode: 'VIA', scale: 'gratitude', reverseScored: false,
    text: 'Я часто замечаю хорошее, что происходит в моей жизни, и чувствую благодарность за это.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/via-transcendence.webp'
  },
  {
    id: 'via-hope', testCode: 'VIA', scale: 'hope', reverseScored: false,
    text: 'Я верю, что моё будущее будет хорошим, и готов работать ради этого.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/via-transcendence.webp'
  },
  {
    id: 'via-humor', testCode: 'VIA', scale: 'humor', reverseScored: false,
    text: 'Я люблю шутить и поднимать настроение другим людям.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/via-transcendence.webp'
  },
  {
    id: 'via-spirituality', testCode: 'VIA', scale: 'spirituality', reverseScored: false,
    text: 'Мне важно понимать, зачем я делаю то, что делаю — искать смысл в своих действиях.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/via-transcendence.webp'
  },

  // ─── 5. Ценности (PVQ Шварца, короткая версия — 10 базовых ценностей) ───
  {
    id: 'pvq-self_direction', testCode: 'PVQ', scale: 'self_direction', reverseScored: false,
    text: 'Мне важно самому решать, что делать, и пробовать новое по своей инициативе.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/pvq.webp'
  },
  {
    id: 'pvq-stimulation', testCode: 'PVQ', scale: 'stimulation', reverseScored: false,
    text: 'Мне нравятся риск и приключения, я люблю, когда в жизни много разнообразия.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/pvq.webp'
  },
  {
    id: 'pvq-hedonism', testCode: 'PVQ', scale: 'hedonism', reverseScored: false,
    text: 'Для меня важно получать удовольствие от жизни и радовать себя.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/pvq.webp'
  },
  {
    id: 'pvq-achievement', testCode: 'PVQ', scale: 'achievement', reverseScored: false,
    text: 'Для меня важно добиваться успеха и показывать, на что я способен.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/pvq.webp'
  },
  {
    id: 'pvq-power', testCode: 'PVQ', scale: 'power', reverseScored: false,
    text: 'Мне важно, чтобы у меня было влияние на других и вес в компании или команде.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/pvq.webp'
  },
  {
    id: 'pvq-security', testCode: 'PVQ', scale: 'security', reverseScored: false,
    text: 'Мне важно чувствовать себя в безопасности и жить стабильно, без резких потрясений.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/pvq.webp'
  },
  {
    id: 'pvq-conformity', testCode: 'PVQ', scale: 'conformity', reverseScored: false,
    text: 'Мне важно вести себя правильно и не создавать проблем окружающим.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/pvq.webp'
  },
  {
    id: 'pvq-tradition', testCode: 'PVQ', scale: 'tradition', reverseScored: false,
    text: 'Для меня важно уважать традиции и придерживаться того, что принято в моей семье и культуре.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/pvq.webp'
  },
  {
    id: 'pvq-benevolence', testCode: 'PVQ', scale: 'benevolence', reverseScored: false,
    text: 'Для меня важно заботиться о близких людях и быть им полезным.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/pvq.webp'
  },
  {
    id: 'pvq-universalism', testCode: 'PVQ', scale: 'universalism', reverseScored: false,
    text: 'Для меня важно, чтобы ко всем людям относились справедливо, и чтобы берегли природу.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/pvq.webp'
  },

  // ─── 6. Поведение (Прокрастинация Лэя) ───
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
  },

  // ─── 7. Внутренний компас (Grit / Mindset / Эмоциональный интеллект) ───
  // Короткие адаптированные шкалы вместо оценки "на глазок" ИИ-коучем по
  // конспекту диалога (методологический аудит проекта, БЛОК 3 п.5 —
  // самописные численные оценки от LLM имеют низкую валидность).
  {
    id: 'grit-1', testCode: 'GROWTH', scale: 'GRIT', reverseScored: false,
    text: 'Если я по-настоящему увлечён целью, трудности не заставляют меня бросить её надолго.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/growth.webp'
  },
  {
    id: 'grit-2', testCode: 'GROWTH', scale: 'GRIT', reverseScored: true,
    text: 'Я часто загораюсь новым увлечением, но быстро остываю и переключаюсь на другое.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/growth.webp'
  },
  {
    id: 'grit-3', testCode: 'GROWTH', scale: 'GRIT', reverseScored: false,
    text: 'Я довожу до конца важные для меня дела, даже если на это уходят месяцы.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/growth.webp'
  },
  {
    id: 'grit-4', testCode: 'GROWTH', scale: 'GRIT', reverseScored: true,
    text: 'Неудача в начале пути обычно заставляет меня отказаться от затеи.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/growth.webp'
  },
  {
    id: 'mindset-1', testCode: 'GROWTH', scale: 'MINDSET', reverseScored: false,
    text: 'Я верю, что способности и ум можно развить упорной практикой, а не только получить от природы.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/growth.webp'
  },
  {
    id: 'mindset-2', testCode: 'GROWTH', scale: 'MINDSET', reverseScored: true,
    text: 'Если что-то не получается сразу, я решаю, что это просто "не моё" от природы.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/growth.webp'
  },
  {
    id: 'mindset-3', testCode: 'GROWTH', scale: 'MINDSET', reverseScored: false,
    text: 'Ошибки — это нормальная часть обучения, а не доказательство того, что я недостаточно способный.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/growth.webp'
  },
  {
    id: 'mindset-4', testCode: 'GROWTH', scale: 'MINDSET', reverseScored: true,
    text: 'Умных людей сразу видно — им не нужно особо стараться, чтобы разобраться в новой теме.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/growth.webp'
  },
  {
    id: 'teique-sa-1', testCode: 'GROWTH', scale: 'TEIQUE_SA', reverseScored: false,
    text: 'Я обычно хорошо понимаю, какую именно эмоцию сейчас испытываю и почему.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/growth.webp'
  },
  {
    id: 'teique-sa-2', testCode: 'GROWTH', scale: 'TEIQUE_SA', reverseScored: true,
    text: 'Мне трудно объяснить словами, что я чувствую, даже когда эмоция сильная.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/growth.webp'
  },
  {
    id: 'teique-sr-1', testCode: 'GROWTH', scale: 'TEIQUE_SR', reverseScored: false,
    text: 'Когда я злюсь или расстроен, я обычно могу взять себя в руки без чужой помощи.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/growth.webp'
  },
  {
    id: 'teique-sr-2', testCode: 'GROWTH', scale: 'TEIQUE_SR', reverseScored: true,
    text: 'Сильные эмоции часто берут надо мной верх, и я потом жалею о сказанном или сделанном.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/growth.webp'
  },

  // ─── 8. Карта ресурсов (контекст и опоры) ───
  // Фактологические/контекстные поля из методологического аудита (БЛОК 1,
  // кластер "Контекст и Ограничения") — сознательно не спрашиваются коучем в
  // живом диалоге (неуместно для доверительной беседы), а собираются здесь как
  // короткий необязательный самоотчёт. Нейтральный ответ ("нейтрально") везде
  // безопасен и не искажает отчёт.
  {
    id: 'ctx-family-pressure', testCode: 'CONTEXT', scale: 'familyPressure', reverseScored: true,
    text: 'Родители довольно настойчиво продвигают мне конкретную профессию или вуз, которые выбрали не совсем я.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/context.webp'
  },
  {
    id: 'ctx-family-finance', testCode: 'CONTEXT', scale: 'familyFinance', reverseScored: false,
    text: 'Семья может поддержать почти любой мой выбор образования, невзирая на его стоимость или удалённость от дома.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/context.webp'
  },
  {
    id: 'ctx-mobility', testCode: 'CONTEXT', scale: 'mobility', reverseScored: false,
    text: 'Я готов(а) переехать в другой город или страну ради учёбы или работы мечты.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/context.webp'
  },
  {
    id: 'ctx-health', testCode: 'CONTEXT', scale: 'health', reverseScored: true,
    text: 'Есть особенности здоровья, которые стоит учитывать при выборе будущей профессии (нагрузка, режим, среда).',
    options: scaleOptions, visualAssetUrl: '/assets/webp/context.webp'
  },
  {
    id: 'ctx-edu-env', testCode: 'CONTEXT', scale: 'educationEnvAvail', reverseScored: false,
    text: 'В моём городе/районе есть кружки, секции или курсы по темам, которые мне реально интересны.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/context.webp'
  },
  {
    id: 'ctx-career-readiness', testCode: 'CONTEXT', scale: 'careerReadiness', reverseScored: false,
    text: 'Я готов(а) уже сейчас обсуждать конкретные варианты будущей профессии, а не просто "как-нибудь потом решу".',
    options: scaleOptions, visualAssetUrl: '/assets/webp/context.webp'
  },
  {
    id: 'ctx-digital-divide', testCode: 'CONTEXT', scale: 'digitalDivide', reverseScored: true,
    text: 'Мне не хватает доступа к компьютеру, интернету или нужным программам, чтобы учиться и пробовать новое.',
    options: scaleOptions, visualAssetUrl: '/assets/webp/context.webp'
  }
];
