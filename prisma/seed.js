const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding diagnostics data...');

  // 1. Очистка существующих данных
  await prisma.diagnosticQuestion.deleteMany({});
  await prisma.diagnosticTest.deleteMany({});

  // 2. Создание тестов
  const tests = [
    {
      testId: 'riasec',
      title: 'Профессиональные интересы (RIASEC)',
      totalQuestions: 30,
      description: 'Диагностика по модифицированной методике RIASEC (коды Холланда) для определения профессионального типа личности.',
    },
    {
      testId: 'big_five',
      title: 'Личностные черты (Big Five)',
      totalQuestions: 30,
      description: 'Анализ качеств личности по сокращенному подростковому опроснику BFI-2-S (Большая Пятерка).',
    },
    {
      testId: 'career_anchors',
      title: 'Карьерные ценности (Якоря карьеры)',
      totalQuestions: 24,
      description: 'Методика Э. Шейна для выявления ведущих ценностных ориентаций в профессиональной деятельности.',
    },
  ];

  for (const t of tests) {
    await prisma.diagnosticTest.create({ data: t });
  }

  // 3. Вопросы RIASEC (30 вопросов)
  const riasecQuestions = [
    // Realistic (R)
    { id: 'q_riasec_01', trait: 'R', text: 'Собирать и ремонтировать технические приборы, технику или мебель' },
    { id: 'q_riasec_02', trait: 'R', text: 'Работать с инструментами, станками или механизмами' },
    { id: 'q_riasec_03', trait: 'R', text: 'Выращивать растения, ухаживать за животными или работать на природе' },
    { id: 'q_riasec_04', trait: 'R', text: 'Заниматься конструированием деталей, черчением или 3D-печатью физических объектов' },
    { id: 'q_riasec_05', trait: 'R', text: 'Участвовать в спортивных тренировках или выполнять прикладную физическую работу' },
    // Investigative (I)
    { id: 'q_riasec_06', trait: 'I', text: 'Решать сложные математические задачи или логические ребусы' },
    { id: 'q_riasec_07', trait: 'I', text: 'Проводить научные опыты, изучать физические или химические явления' },
    { id: 'q_riasec_08', trait: 'I', text: 'Писать код для программ, заниматься веб-разработкой или анализом баз данных' },
    { id: 'q_riasec_09', trait: 'I', text: 'Изучать строение живых организмов, анатомию или читать научно-популярные статьи' },
    { id: 'q_riasec_10', trait: 'I', text: 'Проводить исследования, собирать факты и доказывать научные гипотезы' },
    // Artistic (A)
    { id: 'q_riasec_11', trait: 'A', text: 'Рисовать картины, создавать эскизы, иллюстрации или заниматься веб-дизайном' },
    { id: 'q_riasec_12', trait: 'A', text: 'Писать музыку, играть на музыкальных инструментах или монтировать аудио/видео' },
    { id: 'q_riasec_13', trait: 'A', text: 'Сочинять стихи, писать рассказы, сценарии или вести творческий блог' },
    { id: 'q_riasec_14', trait: 'A', text: 'Разрабатывать дизайн одежды, интерьера помещений или ландшафтный дизайн' },
    { id: 'q_riasec_15', trait: 'A', text: 'Участвовать в театральных постановках, актерских тренингах или выразительно выступать на сцене' },
    // Social (S)
    { id: 'q_riasec_16', trait: 'S', text: 'Объяснять учебный материал одноклассникам, помогать им разобраться в сложных темах' },
    { id: 'q_riasec_17', trait: 'S', text: 'Заниматься волонтерством, помогать пожилым людям или заботиться о детях' },
    { id: 'q_riasec_18', trait: 'S', text: 'Участвовать в благотворительных акциях, организовывать помощь нуждающимся' },
    { id: 'q_riasec_19', trait: 'S', text: 'Проводить беседы, выслушивать проблемы друзей и поддерживать их в трудной ситуации' },
    { id: 'q_riasec_20', trait: 'S', text: 'Работать в команде над совместными проектами, где важна взаимопомощь и общение' },
    // Enterprising (E)
    { id: 'q_riasec_21', trait: 'E', text: 'Презентовать свои проекты аудитории, выступать с докладами и убеждать людей' },
    { id: 'q_riasec_22', trait: 'E', text: 'Организовывать школьные праздники, квесты или координировать работу группы сверстников' },
    { id: 'q_riasec_23', trait: 'E', text: 'Придумывать идеи для бизнеса, стартапов и обсуждать способы их продвижения' },
    { id: 'q_riasec_24', trait: 'E', text: 'Вести переговоры, убеждать людей в своей правоте и отстаивать лидерскую позицию' },
    { id: 'q_riasec_25', trait: 'E', text: 'Брать на себя ответственность за управление командой и принятие важных решений' },
    // Conventional (C)
    { id: 'q_riasec_26', trait: 'C', text: 'Вести учет личных доходов и расходов, планировать бюджет на месяц вперед' },
    { id: 'q_riasec_27', trait: 'C', text: 'Составлять точное расписание дел на неделю, вести календари и списки задач' },
    { id: 'q_riasec_28', trait: 'C', text: 'Работать с базами данных, заполнять таблицы Excel и проверять документы на ошибки' },
    { id: 'q_riasec_29', trait: 'C', text: 'Следовать четким правилам, должностным инструкциям и стандартам работы' },
    { id: 'q_riasec_30', trait: 'C', text: 'Систематизировать информацию, наводить порядок в файлах на компьютере или в личных вещах' },
  ];

  for (const q of riasecQuestions) {
    const isConventional = q.trait === 'C';
    const isArtistic = q.trait === 'A';
    
    let prompt = '';
    if (isConventional) {
      prompt = 'A clean minimalist 2D flat vector illustration of a teenager organizing files in folder categories on a clean desk, brand colors indigo and emerald, isolated on a white background, no gradients, no shadows, masterfully designed, SVG style --no 3d, realistic, photorealism';
    } else if (isArtistic) {
      prompt = 'A clean minimalist 2D flat vector illustration of a teen writing music notes on a digital tablet with a stylus, brand colors indigo and emerald, isolated on a white background, no gradients, no shadows, no text, SVG style --no 3d, realistic, photorealism';
    } else {
      prompt = `A clean minimalist 2D flat vector illustration of a teenager doing activity representing ${q.trait} scale, brand colors indigo and emerald, isolated on a white background, no gradients, no shadows, SVG style --no 3d, realistic, photorealism`;
    }

    await prisma.diagnosticQuestion.create({
      data: {
        questionId: q.id,
        testId: 'riasec',
        questionText: q.text,
        scaleCode: q.trait,
        isReverse: false,
        visualAssetUrl: `/assets/webp/${q.id}.webp`,
        aiGenerationPrompt: prompt,
      }
    });
  }

  // 4. Вопросы Big Five (30 вопросов, BFI-2-S)
  const bigFiveQuestions = [
    // Extraversion (E)
    { id: 'q_bigfive_01', trait: 'E', text: 'Я чувствую себя общительным и открытым человеком', rev: false },
    { id: 'q_bigfive_06', trait: 'E', text: 'Мне нравится быть в центре внимания в больших компаниях', rev: false },
    { id: 'q_bigfive_11', trait: 'E', text: 'Я легко первым вступаю в разговор с незнакомыми людьми', rev: false },
    { id: 'q_bigfive_16', trait: 'E', text: 'Я предпочитаю проводить свободное время в одиночестве', rev: true },
    { id: 'q_bigfive_21', trait: 'E', text: 'Я тихий, избегающий лишнего общения человек', rev: true },
    { id: 'q_bigfive_26', trait: 'E', text: 'Мне бывает сложно активно выражать свое мнение в группе', rev: true },

    // Agreeableness (A)
    { id: 'q_bigfive_02', trait: 'A', text: 'Я искренне сочувствую людям и стараюсь поддержать их при неудаче', rev: false },
    { id: 'q_bigfive_07', trait: 'A', text: 'Я стараюсь доверять людям и верить в их добрые намерения', rev: false },
    { id: 'q_bigfive_12', trait: 'A', text: 'Я вежлив со всеми и редко вступаю в открытые конфликты', rev: false },
    { id: 'q_bigfive_17', trait: 'A', text: 'Я часто спорю с людьми ради победы в споре', rev: true },
    { id: 'q_bigfive_22', trait: 'A', text: 'Я могу быть резким в высказываниях, если кто-то не согласен со мной', rev: true },
    { id: 'q_bigfive_27', trait: 'A', text: 'Я считаю, что каждый должен в первую очередь заботиться о себе', rev: true },

    // Conscientiousness (C)
    { id: 'q_bigfive_03', trait: 'C', text: 'Я всегда планирую свои дела заранее и стараюсь придерживаться графика', rev: false },
    { id: 'q_bigfive_08', trait: 'C', text: 'Я содержу свои вещи и рабочее место в полном порядке', rev: false },
    { id: 'q_bigfive_13', trait: 'C', text: 'Я всегда довожу начатые дела до конца, даже если мне скучно', rev: false },
    { id: 'q_bigfive_18', trait: 'C', text: 'Я часто откладываю важные задачи на последний момент (прокрастинирую)', rev: true },
    { id: 'q_bigfive_23', trait: 'C', text: 'Мне трудно сосредоточиться на одной монотонной задаче долгое время', rev: true },
    { id: 'q_bigfive_28', trait: 'C', text: 'Я могу действовать спонтанно, не задумываясь о долгосрочных планах', rev: true },

    // Neuroticism (N)
    { id: 'q_bigfive_04', trait: 'N', text: 'Я часто беспокоюсь по пустякам и сильно тревожусь перед важными событиями', rev: false },
    { id: 'q_bigfive_09', trait: 'N', text: 'Мое настроение может резко меняться без видимых причин', rev: false },
    { id: 'q_bigfive_14', trait: 'N', text: 'Я остро переживаю критику в свой адрес и долго помню неудачи', rev: false },
    { id: 'q_bigfive_19', trait: 'N', text: 'Я остаюсь спокойным и собранным в стрессовых ситуациях', rev: true },
    { id: 'q_bigfive_24', trait: 'N', text: 'Я легко справляюсь с тревожными мыслями и быстро успокаиваюсь', rev: true },
    { id: 'q_bigfive_29', trait: 'N', text: 'Я уверен в себе и редко сомневаюсь в правильности своих решений', rev: true },

    // Openness (O)
    { id: 'q_bigfive_05', trait: 'O', text: 'Мне интересно пробовать новые хобби и изучать темы, о которых я раньше не слышал', rev: false },
    { id: 'q_bigfive_10', trait: 'O', text: 'Я обладаю богатым воображением и часто придумываю необычные идеи', rev: false },
    { id: 'q_bigfive_15', trait: 'O', text: 'Я ценю искусство, музыку и необычный дизайн', rev: false },
    { id: 'q_bigfive_20', trait: 'O', text: 'Я предпочитаю проверенные временем способы решения задач вместо экспериментов', rev: true },
    { id: 'q_bigfive_25', trait: 'O', text: 'Меня редко интересуют абстрактные философские вопросы или научные теории', rev: true },
    { id: 'q_bigfive_30', trait: 'O', text: 'Я чувствую себя некомфортно, если в моих планах слишком много неопределенности', rev: true },
  ];

  for (const q of bigFiveQuestions) {
    const prompt = `A clean minimalist 2D flat vector illustration of a teenager showing personality trait representing ${q.trait} ${q.rev ? 'reverse' : 'direct'} scale, brand colors indigo and emerald, isolated on a white background, no gradients, no shadows, SVG style --no 3d, realistic, photorealism`;
    await prisma.diagnosticQuestion.create({
      data: {
        questionId: q.id,
        testId: 'big_five',
        questionText: q.text,
        scaleCode: q.trait,
        isReverse: q.rev,
        visualAssetUrl: `/assets/webp/${q.id}.webp`,
        aiGenerationPrompt: prompt,
      }
    });
  }

  // 5. Вопросы Якорей карьеры (24 вопроса)
  const careerAnchorsQuestions = [
    // Профессиональная компетентность (ПК / TF - Technical/Functional)
    { id: 'q_anchors_01', trait: 'TF', text: 'Для меня важнее всего стать высококлассным специалистом в своем любимом деле' },
    { id: 'q_anchors_09', trait: 'TF', text: 'Я предпочту совершенствовать профессиональные навыки, а не расти вверх по карьерной лестнице в роли управленца' },
    { id: 'q_anchors_17', trait: 'TF', text: 'Я горжусь, когда ко мне обращаются как к эксперту в решении сложных профессиональных вопросов' },

    // Менеджмент / Управление (М / GM - General Managerial)
    { id: 'q_anchors_02', trait: 'GM', text: 'Я получаю удовольствие от возможности руководить работой группы людей и отвечать за общий результат' },
    { id: 'q_anchors_10', trait: 'GM', text: 'Мне нравится координировать действия разных специалистов и направлять их усилия' },
    { id: 'q_anchors_18', trait: 'GM', text: 'Я стремлюсь занять должность руководителя высокого уровня с большими полномочиями' },

    // Автономия / Независимость (АВ / AU - Autonomy)
    { id: 'q_anchors_03', trait: 'AU', text: 'Я хочу самостоятельно решать, когда, где и как мне выполнять свою работу' },
    { id: 'q_anchors_11', trait: 'AU', text: 'Я готов пожертвовать высокой зарплатой ради свободы и независимости от жестких корпоративных правил' },
    { id: 'q_anchors_19', trait: 'AU', text: 'Мне комфортнее работать на фрилансе или быть самозанятым, чем подчиняться руководству' },

    // Стабильность (СТ / SE - Security/Stability)
    { id: 'q_anchors_04', trait: 'SE', text: 'Для меня критически важно чувствовать стабильность и уверенность в завтрашнем дне' },
    { id: 'q_anchors_12', trait: 'SE', text: 'Я предпочитаю работу в крупной надежной компании, которая гарантирует мне долгосрочную занятость' },
    { id: 'q_anchors_20', trait: 'SE', text: 'Для меня важнее стабильный фиксированный доход, чем высокий, но не гарантированный процент с прибыли' },

    // Предпринимательство / Креативность (ПР / EC - Entrepreneurial Creativity)
    { id: 'q_anchors_05', trait: 'EC', text: 'Я мечтаю создать собственную компанию, запустить свой бизнес или новый продукт' },
    { id: 'q_anchors_13', trait: 'EC', text: 'Я готов рисковать своими ресурсами ради создания чего-то уникального и своего' },
    { id: 'q_anchors_21', trait: 'EC', text: 'Создание нового дела доставляет мне больше радости, чем управление уже существующим бизнесом' },

    // Служение / Полезность обществу (СЛ / SV - Service)
    { id: 'q_anchors_06', trait: 'SV', text: 'Для меня главное в будущей работе — приносить пользу обществу и помогать людям' },
    { id: 'q_anchors_14', trait: 'SV', text: 'Я хочу, чтобы результаты моей работы делали мир более справедливым, экологичным и безопасным' },
    { id: 'q_anchors_22', trait: 'SV', text: 'Я выберу профессию, помогающую людям, даже если она не приносит большого финансового успеха' },

    // Вызов (ВЗ / CH - Pure Challenge)
    { id: 'q_anchors_07', trait: 'CH', text: 'Мне нравится решать сложнейшие задачи и побеждать в условиях жесткой конкуренции' },
    { id: 'q_anchors_15', trait: 'CH', text: 'Я быстро теряю интерес к задачам, если в них нет вызова или преодоления трудностей' },
    { id: 'q_anchors_23', trait: 'CH', text: 'Для меня преодоление непреодолимых препятствий — лучший способ доказать свою ценность' },

    // Интеграция стилей жизни (ИЛ / LS - Lifestyle)
    { id: 'q_anchors_08', trait: 'LS', text: 'Я стремлюсь найти работу, которая позволит мне гармонично сочетать семью, хобби и карьеру' },
    { id: 'q_anchors_16', trait: 'LS', text: 'Для меня неприемлема работа, которая заставит меня жертвовать личной жизнью ради карьеры' },
    { id: 'q_anchors_24', trait: 'LS', text: 'Я ищу работу, график которой можно гибко подстроить под потребности моей семьи' },
  ];

  for (const q of careerAnchorsQuestions) {
    const prompt = `A clean minimalist 2D flat vector illustration of a teenager showcasing career value ${q.trait}, brand colors indigo and emerald, isolated on a white background, no gradients, no shadows, SVG style --no 3d, realistic, photorealism`;
    await prisma.diagnosticQuestion.create({
      data: {
        questionId: q.id,
        testId: 'career_anchors',
        questionText: q.text,
        scaleCode: q.trait,
        isReverse: false,
        visualAssetUrl: `/assets/webp/${q.id}.webp`,
        aiGenerationPrompt: prompt,
      }
    });
  }

  console.log('✅ Database seeded successfully! 3 tests, 84 questions created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
