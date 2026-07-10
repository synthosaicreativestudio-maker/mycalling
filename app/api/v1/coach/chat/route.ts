// API Route — Server Side Only (НЕ ставить "use client" — это ломает серверные модули!)

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '../../../../lib/prisma';
import { auth } from '../../../../lib/auth';
import { generateText, generateJson } from '../../../../lib/gemini';

const FALLBACK_REPLIES: Record<number, string> = {
  0: "Привет! Рад встрече. Меня зовут Роман, я твой коуч и наставник на платформе «МоёПризвание». Сегодня мы проведем увлекательное исследование твоих талантов, сильных сторон и интересов. Это не скучный экзамен, а дружеский диалог. Чтобы я смог составить максимально точный профиль, отвечай, пожалуйста, подробно и честно. Готов начать?",
  1: "Отлично! Давай сначала подключим удобный канал связи ниже (Telegram или MAX ID), чтобы результаты не потерялись, и мы могли продолжить в любой момент! 😉",
  2: "Супер! Теперь давай познакомимся поближе. Помни про подробные ответы — пиши развернуто. Напиши, пожалуйста, как тебя зовут, в каком классе ты учишься, сколько тебе лет и из какого ты города?",
  3: "Расскажи, чем ты любишь заниматься в свободное время? Какое у тебя хобби, или от какого дела ты по-настоящему кайфуешь и теряешь счет времени?",
  4: "Здорово! А давай заглянем в школу: какие предметы тебе даются легче всего и вызывают хоть какой-то интерес, а от каких хочется выть?",
  5: "Давай теперь помечтаем: если убрать вообще все ограничения, кем бы ты хотел быть через 10 лет?",
  6: "Интересно! А скажи, кто из известных людей, блогеров, ученых или персонажей фильмов тебя по-настоящему вдохновляет? Какие черты характера или дела в них тебе нравятся больше всего?",
  7: "Понял тебя. Давай поговорим о твоих родителях: как их зовут, какие у вас отношения? Кем они видят тебя в будущем и советуют ли тебе какие-то конкретные профессии?",
  8: "Спасибо за искренность. А что тебя больше всего пугает или напрягает, когда ты думаешь о будущем выборе профессии? Страх ошибиться, сложность экзаменов или что-то другое?",
  9: "Интересно. А пробовал ли ты уже делать что-то практическое? Например, делать проекты, подрабатывать, вести свой блог, программировать или создавать что-то руками? Что понравилось, а что нет?",
  10: "Понял тебя. А как тебе удобнее работать в будущем: сидеть дома на удаленке в тишине, ходить в современный офис и быть в центре движухи, или постоянно путешествовать и быть в разъездах?",
  11: "Интересно! А если посмотреть на твое мышление: тебе легче и интереснее работать с цифрами, кодом и формулами, создавать рисунки и визуальные образы, или общаться с людьми и писать тексты?",
  12: "Ясно! А что для тебя будет главным показателем успеха в карьере: зарабатывать очень много денег, получить мировую славу и признание, создать продукт, который изменит жизни миллионов, или иметь баланс работы и личной жизни?",
  13: "Слушай, а откуда ты берешь энергию, когда устаешь? Что тебя наполняет силами — спорт, прогулки в одиночестве, игры, общение с близкими? И что, наоборот, сильнее всего утомляет?",
  14: "Очень отзывается. А какую роль в компании друзей или в школьном проекте ты обычно выбираешь? Ты лидер, который всех организует; креатор, который придумывает идеи; или ответственный исполнитель, который делает основную работу руками?",
  15: "Понял. А насколько тебе важна свобода действий? Тебе нравится самому решать, как и что делать, или комфортнее работать по понятным правилам, инструкциям и под руководством опытного наставника?",
  16: "Слушай, я проанализировал наш диалог. Ты отлично раскрылся! Ты можешь скачать свой предварительный отчет в формате PDF прямо сейчас. Теперь давай закрепим результаты интерактивными тестами!"
};

// ============================
// ФУНКЦИИ ОТПРАВКИ УВЕДОМЛЕНИЙ
// ============================

/** Отправить карточку лида администратору в Telegram */
async function sendTelegramNotification(user: any, data: any) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) { console.warn('TELEGRAM_BOT_TOKEN not set, skipping admin notification'); return; }
  const chatId = process.env.TELEGRAM_CHAT_ID || '148281488';
  const tgApiBase = (process.env.TELEGRAM_API_BASE_URL || 'https://api.telegram.org').replace(/\/$/, '');
  
  const text = `🔔 *Регистрация лида (Нейрокоуч):*
👤 *Имя:* ${user.name || 'Не указано'}
📱 *Телефон:* ${user.phone || 'Не указано'}
🏫 *Роль:* ${user.role || 'STUDENT'}
🎯 *Виртуальный шаг:* ${data.currentStep || 0}
 
✨ *Ответы:*
💭 *Мечты:* ${data.dreams || 'Не указано'}
🌟 *Кумиры:* ${data.idols || 'Не указано'}
💎 *Ценности:* ${data.values || 'Не указано'}
🚧 *Барьеры:* ${data.barriers || 'Не указано'}
📝 *Резюме коуча:* ${data.preliminaryFeedback || 'Еще не сформировано'}`;

  try {
    await fetch(`${tgApiBase}/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      })
    });
  } catch (err) {
    console.error('Telegram admin notification error:', err);
  }
}

/** Отправить резюме пользователю лично в Telegram-бот */
async function sendTelegramReportToUser(user: any, data: any) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken || !user.telegramId) return;
  const tgApiBase = (process.env.TELEGRAM_API_BASE_URL || 'https://api.telegram.org').replace(/\/$/, '');

  const feedback = data.preliminaryFeedback || 'Резюме ещё не сформировано';
  const text = `📋 *Предварительное резюме от наставника Романа*\n\n${feedback}\n\n🎯 Теперь вы можете пройти интерактивные тесты для точной диагностики на сайте:\nhttps://synthosai.ru/assessment`;

  try {
    await fetch(`${tgApiBase}/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: user.telegramId,
        text: text,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🧪 Перейти к диагностике', url: 'https://synthosai.ru/assessment' }]
          ]
        }
      })
    });
    console.log(`Telegram report sent to user ${user.telegramId}`);
  } catch (err) {
    console.error('Telegram user report error:', err);
  }
}

/** Отправить резюме пользователю лично в бот МАКС */
async function sendMaxReportToUser(user: any, data: any) {
  const botToken = process.env.MAXID_BOT_TOKEN;
  if (!botToken || !user.maxUserId) return;

  const feedback = data.preliminaryFeedback || 'Резюме ещё не сформировано';
  const text = `📋 Предварительное резюме от наставника Романа\n\n${feedback}\n\n🎯 Теперь вы можете пройти интерактивные тесты для точной диагностики на сайте: https://synthosai.ru/assessment`;

  try {
    await fetch(`https://platform-api2.max.ru/messages?user_id=${user.maxUserId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': botToken
      },
      body: JSON.stringify({
        text: text,
        format: 'html',
        attachments: [
          {
            type: 'inline_keyboard',
            payload: {
              buttons: [
                [{ type: 'link', text: '🧪 Перейти к диагностике', url: 'https://synthosai.ru/assessment' }]
              ]
            }
          }
        ]
      })
    });
    console.log(`MAX report sent to user ${user.maxUserId}`);
  } catch (err) {
    console.error('MAX user report error:', err);
  }
}

/** Синхронизировать профиль пользователя с MAX ID CRM */
async function sendMaxIdSync(user: any, data: any) {
  const maxToken = process.env.MAXID_API_TOKEN;
  if (!maxToken) { console.warn('MAXID_API_TOKEN not set, skipping CRM sync'); return; }
  
  try {
    const res = await fetch('https://api.maxid.ru/v1/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${maxToken}`
      },
      body: JSON.stringify({
        externalId: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        source: 'NeuroCoach Web',
        meta: {
          dreams: data.dreams,
          idols: data.idols,
          values: data.values,
          barriers: data.barriers,
          preliminaryFeedback: data.preliminaryFeedback
        }
      })
    });
    console.log(`MAX ID CRM sync status: ${res.status}`);
  } catch (err) {
    console.error('MAX ID CRM sync error:', err);
  }
}

// ============================
// ГЛАВНЫЙ ОБРАБОТЧИК ДИАЛОГА
// ============================

export async function POST(req: Request) {
  try {
    const { message, sessionId, fromLoginError, linkCode } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Сообщение пользователя не передано' }, { status: 400 });
    }

    // 1. Поиск или создание сессии коуча
    let coachSession = null;
    let userId = null;

    // Сначала проверяем авторизованного пользователя через Better Auth
    const session = await auth.api.getSession({
      headers: await headers()
    });

    let authenticatedUserId = session?.user?.id || null;

    // Если куки сессии еще не применились (актуально для Vercel/HTTPS),
    // но передан linkCode, получаем userId авторизованного пользователя прямо из AuthLink
    if (!authenticatedUserId && linkCode) {
      const authLink = await prisma.authLink.findUnique({
        where: { code: linkCode }
      });
      if (authLink && authLink.status === 'COMPLETED' && authLink.userId) {
        authenticatedUserId = authLink.userId;
      }
    }

    if (authenticatedUserId) {
      userId = authenticatedUserId;
      
      // Ищем текущую гостевую сессию, переданную с клиента
      let guestSession = null;
      if (sessionId) {
        guestSession = await prisma.coachSession.findUnique({
          where: { id: sessionId },
          include: { user: true }
        });
      }

      // Если гостевая сессия найдена и она принадлежит временному гостю,
      // перепривязываем ее к вошедшему пользователю (удаляя его старые сессии коуча)
      if (guestSession && guestSession.userId !== userId) {
        try {
          // Удаляем старые сессии коуча вошедшего пользователя, чтобы избежать дубликатов
          await prisma.coachSession.deleteMany({
            where: { userId }
          });
        } catch (e) {
          console.error('Failed to delete old coach session during merge:', e);
        }

        // Обновляем текущую сессию коуча, связывая ее с авторизованным пользователем
        coachSession = await prisma.coachSession.update({
          where: { id: sessionId },
          data: { userId: userId },
          include: { user: true }
        });

        // Переносим имя из гостевого профиля, если оно было введено
        if (guestSession.user.name && guestSession.user.name !== 'Гость') {
          await prisma.user.update({
            where: { id: userId },
            data: {
              name: guestSession.user.name,
              fullName: guestSession.user.fullName || guestSession.user.name
            }
          });
        }

        // Удаляем временного гостя из БД
        try {
          await prisma.user.delete({
            where: { id: guestSession.userId }
          });
        } catch (e) {
          console.error('Failed to clean up guest user during merge:', e);
        }
      } else {
        // Если гостевая сессия не нуждается в слиянии, просто берем сессию вошедшего пользователя
        coachSession = await prisma.coachSession.findUnique({
          where: { userId },
          include: { user: true }
        });
      }
    }

    // Если нет авторизованного пользователя (или не удалось объединить), ищем по sessionId
    if (!coachSession && sessionId) {
      coachSession = await prisma.coachSession.findUnique({
        where: { id: sessionId },
        include: { user: true }
      });
    }

    if (!coachSession) {
      const tempEmail = `guest_${Math.random().toString(36).substring(2, 11)}@moiprizvanie.ru`;
      const user = await prisma.user.create({
        data: {
          name: 'Гость',
          email: tempEmail,
          role: 'STUDENT'
        }
      });
      userId = user.id;

      coachSession = await prisma.coachSession.create({
        data: {
          userId: user.id,
          transcript: [],
          extractedData: { currentStep: 0 },
          status: 'IN_PROGRESS'
        },
        include: { user: true }
      });
    } else {
      userId = coachSession.userId;
    }

    let transcript = coachSession.transcript as any[] || [];
    let extractedData = (coachSession.extractedData as Record<string, any>) || {};

    // Вычисляем, какие блоки информации уже собраны
    const hasPhone = !!coachSession.user.phone || !!extractedData.phone;
    const hasPersonalInfo = !!extractedData.fullName && (!!extractedData.age || !!extractedData.grade) && !!extractedData.city;
    const hasHobbies = !!extractedData.hobbies && extractedData.hobbies.trim().length > 6;
    const hasSchoolSubjects = !!extractedData.schoolSubjects && extractedData.schoolSubjects.trim().length > 6;
    const hasDreams = !!extractedData.dreams && extractedData.dreams.trim().length > 6;
    const hasIdols = !!extractedData.idols && extractedData.idols.trim().length > 6;
    const hasParents = !!extractedData.parents && extractedData.parents.trim().length > 6;
    const hasFears = !!extractedData.fears && extractedData.fears.trim().length > 6;
    const hasExperience = !!extractedData.experience && extractedData.experience.trim().length > 6;
    const hasWorkFormat = !!extractedData.workFormat && extractedData.workFormat.trim().length > 6;
    const hasThinkingType = !!extractedData.thinkingType && extractedData.thinkingType.trim().length > 6;
    const hasSuccessMeasure = !!extractedData.successMeasure && extractedData.successMeasure.trim().length > 6;
    const hasEnergySources = !!extractedData.energySources && extractedData.energySources.trim().length > 6;
    const hasTeamRole = !!extractedData.teamRole && extractedData.teamRole.trim().length > 6;
    const hasAutonomyStyle = !!extractedData.autonomyStyle && extractedData.autonomyStyle.trim().length > 6;
    const hasValues = !!extractedData.values && extractedData.values.trim().length > 6;
    const hasDecisionStyle = !!extractedData.decisionStyle && extractedData.decisionStyle.trim().length > 6;

    // Считаем прогресс по содержательным блокам
    let blocksCompleted = 0;
    if (hasPersonalInfo) blocksCompleted++;
    if (hasPhone) blocksCompleted++;
    if (hasHobbies) blocksCompleted++;
    if (hasSchoolSubjects) blocksCompleted++;
    if (hasDreams) blocksCompleted++;
    if (hasIdols) blocksCompleted++;
    if (hasParents) blocksCompleted++;
    if (hasFears) blocksCompleted++;
    if (hasExperience) blocksCompleted++;
    if (hasWorkFormat) blocksCompleted++;
    if (hasThinkingType) blocksCompleted++;
    if (hasSuccessMeasure) blocksCompleted++;
    if (hasEnergySources) blocksCompleted++;
    if (hasTeamRole) blocksCompleted++;
    if (hasAutonomyStyle) blocksCompleted++;
    if (hasValues) blocksCompleted++;
    if (hasDecisionStyle) blocksCompleted++;

    // Вычисляем виртуальный шаг до экстракции
    let currentStepBefore = 1;
    if (!hasPhone) {
      currentStepBefore = 1; // Подключение Telegram
    } else if (!hasPersonalInfo) {
      currentStepBefore = 2; // Сбор личных данных
    } else {
      let psychoBlocksBefore = 0;
      if (hasHobbies) psychoBlocksBefore++;
      if (hasSchoolSubjects) psychoBlocksBefore++;
      if (hasDreams) psychoBlocksBefore++;
      if (hasIdols) psychoBlocksBefore++;
      if (hasParents) psychoBlocksBefore++;
      if (hasFears) psychoBlocksBefore++;
      if (hasExperience) psychoBlocksBefore++;
      if (hasWorkFormat) psychoBlocksBefore++;
      if (hasThinkingType) psychoBlocksBefore++;
      if (hasSuccessMeasure) psychoBlocksBefore++;
      if (hasEnergySources) psychoBlocksBefore++;
      if (hasTeamRole) psychoBlocksBefore++;
      if (hasAutonomyStyle) psychoBlocksBefore++;
      if (hasValues) psychoBlocksBefore++;
      if (hasDecisionStyle) psychoBlocksBefore++;
      
      // Свободный диалог длится до Шага 15 (когда собрано 13 психологических полей)
      if (psychoBlocksBefore < 13) {
        currentStepBefore = Math.min(15, 3 + psychoBlocksBefore);
      } else {
        currentStepBefore = 16; // Шаг подведения итогов (Финал)
      }
    }

    // Все содержательные психологические блоки должны быть собраны (или хотя бы 12 из 15 для стабильности)
    let psychoBlocksCount = 0;
    if (hasHobbies) psychoBlocksCount++;
    if (hasSchoolSubjects) psychoBlocksCount++;
    if (hasDreams) psychoBlocksCount++;
    if (hasIdols) psychoBlocksCount++;
    if (hasParents) psychoBlocksCount++;
    if (hasFears) psychoBlocksCount++;
    if (hasExperience) psychoBlocksCount++;
    if (hasWorkFormat) psychoBlocksCount++;
    if (hasThinkingType) psychoBlocksCount++;
    if (hasSuccessMeasure) psychoBlocksCount++;
    if (hasEnergySources) psychoBlocksCount++;
    if (hasTeamRole) psychoBlocksCount++;
    if (hasAutonomyStyle) psychoBlocksCount++;
    if (hasValues) psychoBlocksCount++;
    if (hasDecisionStyle) psychoBlocksCount++;

    const allPsychologyCollected = hasPersonalInfo && (psychoBlocksCount >= 12);
    
    // Сессия считается готовой к финалу, если собран необходимый объем данных
    const isFinalStep = allPsychologyCollected;
    const nextStep = !hasPhone ? 1 : (!hasPersonalInfo ? 2 : (isFinalStep ? 16 : Math.min(15, 3 + psychoBlocksCount)));

    // Защита от зависания шагов (когда ИИ-экстрактор не может надежно извлечь данные)
    let finalNextStep = nextStep;
    const isInitMessage = message === 'Начать сессию с коучем';

    if (!isInitMessage) {
      const lastStep = extractedData.lastStep || 0;
      let stepAttempts = extractedData.stepAttempts || 0;

      if (nextStep === lastStep && nextStep >= 3 && nextStep <= 15) {
        stepAttempts++;
        if (stepAttempts >= 2) {
          const psychoFields = [
            { key: 'hobbies', has: hasHobbies },
            { key: 'schoolSubjects', has: hasSchoolSubjects },
            { key: 'dreams', has: hasDreams },
            { key: 'idols', has: hasIdols },
            { key: 'parents', has: hasParents },
            { key: 'fears', has: hasFears },
            { key: 'experience', has: hasExperience },
            { key: 'workFormat', has: hasWorkFormat },
            { key: 'thinkingType', has: hasThinkingType },
            { key: 'successMeasure', has: hasSuccessMeasure },
            { key: 'energySources', has: hasEnergySources },
            { key: 'teamRole', has: hasTeamRole },
            { key: 'autonomyStyle', has: hasAutonomyStyle },
            { key: 'values', has: hasValues },
            { key: 'decisionStyle', has: hasDecisionStyle }
          ];
          const firstEmpty = psychoFields.find(f => !f.has);
          if (firstEmpty) {
            extractedData[firstEmpty.key] = "Продолжено наставником";
            psychoBlocksCount++;
            const isFinalStepUpdated = hasPersonalInfo && (psychoBlocksCount >= 12);
            finalNextStep = isFinalStepUpdated ? 16 : Math.min(15, 3 + psychoBlocksCount);
          }
          stepAttempts = 0;
        }
      } else {
        stepAttempts = 0;
      }
      extractedData.lastStep = finalNextStep;
      extractedData.stepAttempts = stepAttempts;
    } else {
      extractedData.lastStep = nextStep;
      extractedData.stepAttempts = 0;
    }

    extractedData.currentStep = finalNextStep;

    if (isInitMessage && transcript.length > 0) {
      return NextResponse.json({
        history: transcript,
        sessionId: coachSession.id,
        userId: coachSession.userId,
        currentStep: nextStep,
        phoneConfirmed: hasPhone,
        sessionStatus: coachSession.status,
        extracted: extractedData
      });
    }

    // Если это самое первое сообщение — приветствуем и заключаем контракт (CLEAR / Внутренняя Игра)
    if (isInitMessage && transcript.length === 0) {
      let greeting = FALLBACK_REPLIES[0];
      if (fromLoginError) {
        greeting = 'Привет! Рад встрече. Меня зовут Роман, я твой коуч и наставник. Я вижу, ты хотел зайти в Личный кабинет, но для этого нужно сначала пройти нашу короткую сессию. Не переживай — это не скучный тест, а увлекательное исследование твоих талантов. Отвечай максимально подробно, честно и развернуто — так я смогу точнее всего составить карту твоих талантов. Готов начать?';
      }
      transcript.push({ role: 'assistant', content: greeting, timestamp: new Date().toISOString() });
      
      await prisma.coachSession.update({
        where: { id: coachSession.id },
        data: { 
          transcript, 
          extractedData: { ...extractedData, currentStep: 0 },
          status: 'IN_PROGRESS'
        }
      });

      return NextResponse.json({
        reply: greeting,
        sessionId: coachSession.id,
        userId: coachSession.userId,
        currentStep: 0,
        phoneConfirmed: hasPhone,
        sessionStatus: 'IN_PROGRESS',
        extracted: extractedData
      });
    }

    let userMsgContent = message;
    if (message === 'Телефон подтвержден через бот') {
      userMsgContent = 'Telegram-канал связи успешно подключен!';
    }

    // Добавляем сообщение пользователя в транскрипт
    if (!isInitMessage) {
      const isDuplicate = message === 'Телефон подтвержден через бот' && 
                          transcript.some(m => m.role === 'user' && m.content === 'Telegram-канал связи успешно подключен!');
      if (!isDuplicate) {
        transcript.push({ role: 'user', content: userMsgContent, timestamp: new Date().toISOString() });
      }
    }

    let parsedData: Record<string, any> = { shouldAdvanceStep: true };

    // ==========================================
    // ЭТАП ЭКСТРАКЦИИ
    // ==========================================
    const isPhoneConfirmedMsg = message === 'Телефон подтвержден через бот';

    if (!isInitMessage && isPhoneConfirmedMsg) {
      parsedData = { shouldAdvanceStep: true };
      const dbUser = await prisma.user.findUnique({ where: { id: coachSession.userId } });
      if (dbUser) {
        extractedData.fullName = dbUser.name;
        extractedData.phone = dbUser.phone;
      }
    } else if (!isInitMessage) {
      // Для работы fallbackExtract
      const prevHasName = !!extractedData.fullName && extractedData.fullName.trim().length > 1;
      const prevHasAgeOrGrade = !!extractedData.age || !!extractedData.grade;
      const prevHasCity = !!extractedData.city && extractedData.city.trim().length > 1;

      let properties: Record<string, any> = {
        shouldAdvanceStep: { type: "BOOLEAN" }
      };
      let fieldsToExtract = "shouldAdvanceStep(boolean)";

      if (currentStepBefore === 2) {
        properties.fullName = { type: "STRING" };
        properties.age = { type: "INTEGER" };
        properties.grade = { type: "STRING" };
        properties.city = { type: "STRING" };
        fieldsToExtract += ", fullName, age, grade, city";
      } else if (currentStepBefore >= 3 && currentStepBefore <= 15) {
        properties.hobbies = { type: "STRING" };
        properties.schoolSubjects = { type: "STRING" };
        properties.dreams = { type: "STRING" };
        properties.idols = { type: "STRING" };
        properties.parents = { type: "STRING" };
        properties.fears = { type: "STRING" };
        properties.experience = { type: "STRING" };
        properties.workFormat = { type: "STRING" };
        properties.thinkingType = { type: "STRING" };
        properties.successMeasure = { type: "STRING" };
        properties.energySources = { type: "STRING" };
        properties.teamRole = { type: "STRING" };
        properties.autonomyStyle = { type: "STRING" };
        properties.values = { type: "STRING" };
        properties.decisionStyle = { type: "STRING" };
        fieldsToExtract += ", hobbies, schoolSubjects, dreams, idols, parents, fears, experience, workFormat, thinkingType, successMeasure, energySources, teamRole, autonomyStyle, values, decisionStyle";
        
        // Дополнительно позволяем обновлять личные данные
        properties.fullName = { type: "STRING" };
        properties.age = { type: "INTEGER" };
        properties.grade = { type: "STRING" };
        properties.city = { type: "STRING" };
        fieldsToExtract += ", fullName, age, grade, city";
      }

      const extractionPrompt = `Ты — анализатор текста. Проанализируй сообщение пользователя в контексте диалога профориентации. Извлеки данные в формате JSON (без markdown).
Последнее сообщение пользователя: "${message}"
Извлекай: ${fieldsToExtract}`;

      const extractionSchema = {
        type: "OBJECT",
        properties,
        required: ["shouldAdvanceStep"]
      };

      try {
        parsedData = await generateJson('Ты — система анализа диалогов.', extractionPrompt, extractionSchema, 0.1);
      } catch (err) {
        console.warn('Extraction failed, using fallback:', err);
      }

      const fallbackData = fallbackExtract(message, currentStepBefore, prevHasName, prevHasAgeOrGrade, prevHasCity);
      parsedData = {
        ...fallbackData,
        ...parsedData
      };

      console.log('[auth] Extraction results:', { parsed: parsedData, fallback: fallbackData });

      const cleanMessage = message.trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?\s]/g, "");
      if (cleanMessage.length < 2) parsedData.shouldAdvanceStep = false;

      if (parsedData.fullName) extractedData.fullName = parsedData.fullName;
      if (parsedData.age) extractedData.age = parsedData.age;
      if (parsedData.grade) extractedData.grade = parsedData.grade;
      if (parsedData.city) extractedData.city = parsedData.city;
      if (parsedData.hobbies) extractedData.hobbies = (extractedData.hobbies ? extractedData.hobbies + '; ' : '') + parsedData.hobbies;
      if (parsedData.schoolSubjects) extractedData.schoolSubjects = (extractedData.schoolSubjects ? extractedData.schoolSubjects + '; ' : '') + parsedData.schoolSubjects;
      if (parsedData.dreams) extractedData.dreams = (extractedData.dreams ? extractedData.dreams + '; ' : '') + parsedData.dreams;
      if (parsedData.idols) extractedData.idols = (extractedData.idols ? extractedData.idols + '; ' : '') + parsedData.idols;
      if (parsedData.parents) extractedData.parents = (extractedData.parents ? extractedData.parents + '; ' : '') + parsedData.parents;
      if (parsedData.fears) extractedData.fears = (extractedData.fears ? extractedData.fears + '; ' : '') + parsedData.fears;
      if (parsedData.experience) extractedData.experience = (extractedData.experience ? extractedData.experience + '; ' : '') + parsedData.experience;
      if (parsedData.workFormat) extractedData.workFormat = (extractedData.workFormat ? extractedData.workFormat + '; ' : '') + parsedData.workFormat;
      if (parsedData.thinkingType) extractedData.thinkingType = (extractedData.thinkingType ? extractedData.thinkingType + '; ' : '') + parsedData.thinkingType;
      if (parsedData.successMeasure) extractedData.successMeasure = (extractedData.successMeasure ? extractedData.successMeasure + '; ' : '') + parsedData.successMeasure;
      if (parsedData.energySources) extractedData.energySources = (extractedData.energySources ? extractedData.energySources + '; ' : '') + parsedData.energySources;
      if (parsedData.teamRole) extractedData.teamRole = (extractedData.teamRole ? extractedData.teamRole + '; ' : '') + parsedData.teamRole;
      if (parsedData.autonomyStyle) extractedData.autonomyStyle = (extractedData.autonomyStyle ? extractedData.autonomyStyle + '; ' : '') + parsedData.autonomyStyle;
      if (parsedData.values) extractedData.values = (extractedData.values ? extractedData.values + '; ' : '') + parsedData.values;
      if (parsedData.decisionStyle) extractedData.decisionStyle = (extractedData.decisionStyle ? extractedData.decisionStyle + '; ' : '') + parsedData.decisionStyle;
    }

    const updatedPhone = hasPhone || !!parsedData.phone;
    
    // Проверяем заполненность отдельных полей личных данных
    const hasName = !!extractedData.fullName && extractedData.fullName.trim().length > 1;
    const hasAgeOrGrade = !!extractedData.age || !!extractedData.grade;
    const hasCity = !!extractedData.city && extractedData.city.trim().length > 1;
    
    // Личные данные считаются полностью собранными, если есть имя, возраст/класс и город
    const updatedPersonalInfo = hasName && hasAgeOrGrade && hasCity;
    const updatedDreams = !!extractedData.dreams && extractedData.dreams.trim().length > 6;
    const updatedIdols = !!extractedData.idols && extractedData.idols.trim().length > 6;
    const updatedParents = !!extractedData.parents && extractedData.parents.trim().length > 6;
    const updatedHobbies = !!extractedData.hobbies && extractedData.hobbies.trim().length > 6;
    const updatedSchoolSubjects = !!extractedData.schoolSubjects && extractedData.schoolSubjects.trim().length > 6;
    const updatedFears = !!extractedData.fears && extractedData.fears.trim().length > 6;
    const updatedExperience = !!extractedData.experience && extractedData.experience.trim().length > 6;
    const updatedWorkFormat = !!extractedData.workFormat && extractedData.workFormat.trim().length > 6;
    const updatedThinkingType = !!extractedData.thinkingType && extractedData.thinkingType.trim().length > 6;
    const updatedSuccessMeasure = !!extractedData.successMeasure && extractedData.successMeasure.trim().length > 6;
    const updatedEnergySources = !!extractedData.energySources && extractedData.energySources.trim().length > 6;
    const updatedTeamRole = !!extractedData.teamRole && extractedData.teamRole.trim().length > 6;
    const updatedAutonomyStyle = !!extractedData.autonomyStyle && extractedData.autonomyStyle.trim().length > 6;
    const updatedValues = !!extractedData.values && extractedData.values.trim().length > 6;
    const updatedDecisionStyle = !!extractedData.decisionStyle && extractedData.decisionStyle.trim().length > 6;

    // Считаем заполненные психологические блоки
    let psychoBlocks = 0;
    if (updatedHobbies) psychoBlocks++;
    if (updatedSchoolSubjects) psychoBlocks++;
    if (updatedDreams) psychoBlocks++;
    if (updatedIdols) psychoBlocks++;
    if (updatedParents) psychoBlocks++;
    if (updatedFears) psychoBlocks++;
    if (updatedExperience) psychoBlocks++;
    if (updatedWorkFormat) psychoBlocks++;
    if (updatedThinkingType) psychoBlocks++;
    if (updatedSuccessMeasure) psychoBlocks++;
    if (updatedEnergySources) psychoBlocks++;
    if (updatedTeamRole) psychoBlocks++;
    if (updatedAutonomyStyle) psychoBlocks++;
    if (updatedValues) psychoBlocks++;
    if (updatedDecisionStyle) psychoBlocks++;

    // Расчет шага строго поэтапно
    let currentVirtualStep = 1;
    if (!updatedPhone) {
      currentVirtualStep = 1; // Шаг подключения Telegram
    } else if (!updatedPersonalInfo) {
      currentVirtualStep = 2; // Шаг знакомства и личных данных
    } else {
      // Свободный диалог длится до Шага 15 (когда собрано 13 психологических полей)
      if (psychoBlocks < 13) {
        currentVirtualStep = Math.min(15, 3 + psychoBlocks);
      } else {
        currentVirtualStep = 16; // Шаг подведения итогов (Финал)
      }
    }

    const isFinalStateNow = updatedPersonalInfo && updatedPhone && (psychoBlocks >= 12);
    if (isFinalStateNow) {
      currentVirtualStep = 16;
    }

    extractedData.currentStep = currentVirtualStep;

    // Обновляем пользователя при нативной регистрации
    const userUpdateData: Record<string, any> = {};
    if (extractedData.fullName && extractedData.fullName !== coachSession.user.name) {
      userUpdateData.name = extractedData.fullName;
      userUpdateData.fullName = extractedData.fullName;
    }
    if (extractedData.phone && extractedData.phone !== coachSession.user.phone) {
      const existingUser = await prisma.user.findUnique({ where: { phone: extractedData.phone } });
      if (!existingUser) {
        userUpdateData.phone = extractedData.phone;
      }
    }
    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: coachSession.userId },
        data: userUpdateData
      });
    }

    const collectedFields = [];
    const missingFields = [];

    // Заполняем собранные поля
    if (updatedPersonalInfo) {
      collectedFields.push(`- Личные данные: Имя — ${extractedData.fullName || ''}, возраст/класс — ${extractedData.age || ''}, город — ${extractedData.city || ''}`);
    }
    if (updatedPhone) {
      collectedFields.push(`- Канал связи: Telegram/телефон подключен и подтвержден.`);
    }
    if (updatedHobbies) {
      collectedFields.push(`- Увлечения и хобби: ${extractedData.hobbies}`);
    }
    if (updatedSchoolSubjects) {
      collectedFields.push(`- Любимые/нелюбимые предметы в школе: ${extractedData.schoolSubjects}`);
    }
    if (updatedDreams) {
      collectedFields.push(`- Мечты и образ будущего: ${extractedData.dreams}`);
    }
    if (updatedIdols) {
      collectedFields.push(`- Вдохновители и авторитеты: ${extractedData.idols}`);
    }
    if (updatedParents) {
      collectedFields.push(`- Отношения с родителями и их поддержка: ${extractedData.parents}`);
    }
    if (updatedFears) {
      collectedFields.push(`- Страхи, барьеры и сомнения в выборе: ${extractedData.fears}`);
    }
    if (updatedExperience) {
      collectedFields.push(`- Практический опыт и пробы: ${extractedData.experience}`);
    }
    if (updatedWorkFormat) {
      collectedFields.push(`- Желаемый формат работы: ${extractedData.workFormat}`);
    }
    if (updatedThinkingType) {
      collectedFields.push(`- Тип мышления: ${extractedData.thinkingType}`);
    }
    if (updatedSuccessMeasure) {
      collectedFields.push(`- Мерило успеха: ${extractedData.successMeasure}`);
    }
    if (updatedEnergySources) {
      collectedFields.push(`- Источники энергии и утомляемость: ${extractedData.energySources}`);
    }
    if (updatedTeamRole) {
      collectedFields.push(`- Командная роль: ${extractedData.teamRole}`);
    }
    if (updatedAutonomyStyle) {
      collectedFields.push(`- Отношение к автономии/правилам: ${extractedData.autonomyStyle}`);
    }
    if (updatedValues) {
      collectedFields.push(`- Ценности в работе: ${extractedData.values}`);
    }
    if (updatedDecisionStyle) {
      collectedFields.push(`- Способ принятия решений: ${extractedData.decisionStyle}`);
    }

    // Заполняем недостающие поля СТРОГО на основе текущего шага
    if (currentVirtualStep === 1) {
      missingFields.push("- Подключение канала связи (Telegram или MAX ID). Предложи подростку выбрать удобный канал связи ниже (подключить Telegram или указать свой MAX ID), чтобы результаты не потерялись, и мы могли продолжить.");
    } else if (currentVirtualStep === 2) {
      missingFields.push("- Личные данные (Имя, возраст, город проживания). Спроси об этом мягко в рамках знакомства. Нам критически важно узнать это в самом начале.");
    } else {
      // Шаг сбора психологии
      if (!updatedHobbies) {
        missingFields.push("- Увлечения и хобби (Flow state): Чем подросток обожает заниматься в свободное время, от какого дела он кайфует и теряет счет времени.");
      }
      if (!updatedSchoolSubjects) {
        missingFields.push("- Школа и предметы: Какие предметы даются легко и вызывают хоть какой-то интерес, а какие вызывают скуку или трудности.");
      }
      if (!updatedDreams) {
        missingFields.push("- Мечты и образ будущего: Кем подросток хочет быть через 10 лет без ограничений (методика WOOP / Внутренняя Игра Голви для снятия страхов и раскрытия амбиций).");
      }
      if (!updatedIdols) {
        missingFields.push("- Кумиры: Люди, блогеры, ученые или персонажи фильмов, которые вдохновляют, и какие качества в них привлекают подростка больше всего (проективная методика Strengths-Based coaching).");
      }
      if (!updatedParents) {
        missingFields.push("- Отношения с родителями и их поддержка: Как зовут родителей, какие с ними отношения, кем они видят подростка в будущем и насколько сильно влияют на его выбор.");
      }
      if (!updatedFears) {
        missingFields.push("- Страхи и барьеры: Что больше всего пугает или вызывает стресс при мысли о будущем выборе (страх ошибиться, сложность экзаменов, неопределенность).");
      }
      if (!updatedExperience) {
        missingFields.push("- Практический опыт: Был ли уже какой-то опыт проектов, подработки, кружков? Что понравилось, а от чего тошнило?");
      }
      if (!updatedWorkFormat) {
        missingFields.push("- Желаемый формат работы и среда: Офис (работа в команде, движ), удаленка/фриланс (свобода, дом) или частые командировки/полевые условия.");
      }
      if (!updatedThinkingType) {
        missingFields.push("- Тип мышления и обработки данных: Логика и формулы (технарь), образы и творчество (дизайнер/креатор) или тексты и люди (гуманитарий).");
      }
      if (!updatedSuccessMeasure) {
        missingFields.push("- Мерило успеха и амбиции: Деньги и стабильность, слава и признание, создание продукта/изменение мира, либо баланс работы и жизни.");
      }
      if (!updatedEnergySources) {
        missingFields.push("- Источники энергии и утомляемость: От чего подросток заряжается энергией (спорт, тишина, общение) и что его моментально выматывает.");
      }
      if (!updatedTeamRole) {
        missingFields.push("- Командная роль: Кто он в группе (капитан/лидер, генератор идей, ответственный исполнитель или дипломат).");
      }
      if (!updatedAutonomyStyle) {
        missingFields.push("- Отношение к автономии: Нужна ли ему полная свобода принятия решений или комфортнее работать по понятным правилам и инструкциям.");
      }
      if (!updatedValues) {
        missingFields.push("- Ценности и мотивация: Что подросток ценит в будущей работе (свобода творчества, стабильность/деньги, лидерство, помощь другим).");
      }
      if (!updatedDecisionStyle) {
        missingFields.push("- Способ принятия решений: Доверяет ли подросток логике и анализу, либо интуиции и чувствам.");
      }
    }

    const isRefusalOrEmpty = !parsedData.shouldAdvanceStep;

    let systemPrompt = "";
    if (isFinalStateNow) {
      systemPrompt = `Ты — Роман, поддерживающий, мудрый коуч и наставник профориентационной платформы «МоёПризвание».
Все необходимые качественные данные о подростке успешно собраны.

Твоя единственная задача на этом финальном шаге:
1. Выдать глубокое, вдохновляющее и невероятно эмпатичное резюме диалога (4-5 предложений), начав его со слов: «Слушай, я проанализировал наш диалог...» или похожей личной фразы.
2. Сделай акцент на его сильных сторонах, мечтах и ценностях, которые он упомянул.
3. На основе его ответов (особенно про суперсилу, кумиров и отношение к трудностям) определи его ведущий архетип по Юнгу (Пирсон-Марр): например, Творец (желание создавать новое), Искатель (стремление к свободе и открытиям), Мудрец (поиск истины и логика), Герой (преодоление преград), Правитель (контроль и лидерство), Заботливый/Опекун (помощь другим) или Шут (юмор и игра). Назови этот архетип и коротко объясни подростку, в чем его суперсила.
4. Объясни, что первичный профиль успешно сформирован, и предложи скачать отчет в формате PDF прямо в чате.
5. Пригласи подростка пройти короткие интерактивные тесты на платформе, чтобы дополнить картину его талантов.
НИКАКИХ новых вопросов в конце не задавай. Ты завершаешь сессию.`;
    } else if (currentVirtualStep === 2) {
      systemPrompt = `Ты — Роман, мудрый, поддерживающий коуч и наставник подростков на платформе «МоёПризвание».
Твоя цель на текущем этапе диалога — познакомимся с подростком и собрать его личные данные: имя, сколько лет/класс и город проживания.

Веди живой, спокойный, эмпатичный диалог на равных:
1. Естественно и без лишних эмоций реагируй на ответы подростка. Если он назвал свой город, просто прими это к сведению или спокойно отметь какой-то факт без визгов вроде «О, классный город!». Если он назвал свой класс, поддержи его зрело, без наигранного воодушевления.
2. Спроси о недостающих данных, но делай это мягко и непринужденно. Ты можешь использовать как открытые, так и закрытые или уточняющие вопросы (например, спросить конкретно: "Ты учишься в 8 классе, верно?" или "А из какого ты города?"), чтобы подростку было комфортно отвечать.
Недостающие данные:
${missingFields.join('\n')}

Уже известная информация о собеседнике:
${collectedFields.length > 0 ? collectedFields.join('\n') : '- Пока ничего не известно.'}

Критически важные правила общения:
- Каждое твое сообщение ОБЯЗАТЕЛЬНО должно заканчиваться конкретным, простым, вовлекающим открытым вопросом или понятным призывом к действию (подталкиванием вперед), чтобы собеседнику было абсолютно ясно, о чем писать дальше. Не оставляй диалог зависшим.
- Задавай строго ОДИН простой вопрос за раз. Не перегружай подростка.
- Категорически запрещено использовать фальшивые междометия («О!», «Ого!», «Ооо», «Ага», «Ух ты!») и шаблонные наигранные восторги («Очень отзывается», «Круто!», «Супер!», «Интересный выбор»). Говори просто, спокойно, естественно, как нормальный взрослый друг. Не сюсюкайся и не пытайся искусственно «косить под тинейджера».
- Длина твоих реплик: до 3 предложений. Твоя речь должна быть живой, человечной, дружелюбной и понятной современному подростку.
- Категорически запрещено использовать слова «ИИ», «алгоритм», «бот», «робот». Ты — коуч Роман.`;
    } else {
      systemPrompt = `Ты — Роман, мудрый, поддерживающий коуч и наставник подростков на платформе «МоёПризвание».
Твоя цель — провести глубокую, качественную и профессиональную коуч-сессию с подростком, чтобы составить его первичный психологический и профориентационный портрет.

Ты опираешься на лучшие мировые методологии коучинга:
1. CLEAR (Хокинс):
   - Contract (Контракт): Создай безопасное, доверительное пространство на равных. Покажи, что здесь нет оценок или тестов на правильность.
   - Listen (Слушание): Демонстрируй глубокое эмпатичное слушание. В начале каждой реплики коротко, тепло отреагируй на то, что сказал подросток, покажи, что ты его услышал и понял.
   - Explore (Исследование): Раскрывай внутренний мир подростка, гибко чередуя открытые, закрытые, альтернативные и уточняющие вопросы. Выбирай тип вопроса в зависимости от контекста, чтобы беседа шла естественно и не превращалась в однотипное интервью.
2. Внутренняя Игра (Тимоти Голви):
   - Помоги подростку отключить внутреннего критика, страхи и сомнения. Убери барьеры вроде «у меня не получится» или «это нереально».
3. WOOP (Габриэль Эттинген):
   - Wish (Желание): Помоги сформулировать самую смелую профессиональную мечту.
   - Outcome (Результат): Узнай, как изменится его жизнь при ее достижении, что он будет чувствовать.
4. Strengths-Based Coaching (Коучинг сильных сторон) и архетипы Юнга:
   - Фокусируйся на сильных сторонах, уникальности и талантах подростка.
   - Спроси про суперсилу, которая меняет мир (чтобы выявить стремление Творца, Мага или Искателя).
   - Спроси про реакцию на сложности/неудачи (чтобы выявить архетип Героя, Опекуна или Бунтаря).
   - Спроси про кумиров и вдохновителей.

Уже известная информация о собеседнике:
${collectedFields.length > 0 ? collectedFields.join('\n') : '- Пока ничего не известно.'}

Что тебе ЕЩЕ нужно плавно и естественно узнать в ходе диалога (ВЫБЕРИ ОДНУ ТЕМУ из списка ниже и построй вокруг нее глубокий диалог. Не переходи к следующей теме, пока детально не раскроешь текущую):
${missingFields.join('\n')}

Критически важные правила общения:
- Каждое твое сообщение ОБЯЗАТЕЛЬНО должно заканчиваться конкретным, простым, вовлекающим открытым вопросом или понятным призывом к действию (подталкиванием вперед), чтобы собеседнику было абсолютно ясно, о чем писать дальше. Не оставляй диалог зависшим.
- Если ты перечисляешь профессии, варианты или списки, ВСЕГДА переноси каждый пункт на НОВУЮ СТРОКУ, пиши их отдельными абзацами. Оформляй названия ключевых профессий в обратные кавычки (например, \`Генетик\`), чтобы клиентский интерфейс мог выделить их в красивые визуальные карточки.
- Задавай строго ОДИН вопрос за раз. Не перегружай подростка вопросами разной тематики.
- Не будь опросником! Вопросы должны естественно вытекать из контекста беседы.
- Категорически запрещено использовать фальшивые междометия («О!», «Ого!», «Ооо», «Ага», «Ух ты!») и шаблонные наигранные восторги («Очень отзывается», «Круто!», «Супер!», «Интересный выбор», «Ясно!»). Отвечай спокойно, зрело, уважительно и по делу. Не сюсюкайся и не пытайся искусственно казаться сверстником.
- Если подросток дал короткий или поверхностный ответ, не бросай тему. Спокойно спроси: «Поделишься, почему именно так?» или «Расскажи об этом чуть подробнее, если не секрет. Мне важно понять картину целиком.».
- Если подросток прислал точку, смайлик или уклонился от ответа (флаг: ${isRefusalOrEmpty}), мягко верни его к теме (например: «Похоже, этот вопрос вызвал затруднения. Давай попробуем зайти с другой стороны...») и задай более простой вопрос по существу.
- Длина твоих реплик: до 3 предложений (без учета пунктов списков профессий). Твоя речь должна быть живой, человечной, дружелюбной и понятной современному подростку.
- Категорически запрещено использовать слова «ИИ», «искусственный интеллект», «алгоритм», «бот», «робот». Ты — реальный человек, коуч Роман.`;
    }

    let replyContent = '';
    
    // Использовать ли ИИ-генерацию на текущем шаге
    const useAI = (currentVirtualStep === 2 && !isInitMessage) || (currentVirtualStep >= 3 && currentVirtualStep <= 15) || currentVirtualStep === 16;

    if (!useAI) {
      if (currentVirtualStep === 0) {
        replyContent = FALLBACK_REPLIES[0];
      } else if (currentVirtualStep === 1) {
        replyContent = FALLBACK_REPLIES[1];
      }
    } else {
      try {
        replyContent = await generateText(systemPrompt, transcript, 0.7);
      } catch (err) {
        console.warn('AI chat generation failed, using fallback:', err);
        // Резервный пошаговый сбор личных данных или стандартные реплики
        if (currentVirtualStep === 2) {
          if (!hasPersonalInfo) {
            replyContent = "Супер! Давай сначала познакомимся. Как тебя зовут, в каком ты классе, сколько лет и из какого ты города?";
          } else {
            replyContent = FALLBACK_REPLIES[2];
          }
        } else {
          replyContent = FALLBACK_REPLIES[currentVirtualStep] || 'Давай продолжим наш диалог!';
        }
      }
    }

    if (isPhoneConfirmedMsg) {
      replyContent = "Отлично! Telegram-канал связи успешно подключен. " + replyContent;
    }

    // Сохраняем предварительное резюме в БД на шаге 16 и генерируем аватар
    let completedAt = coachSession.completedAt;
    let status = coachSession.status;
    if (isFinalStateNow && status !== 'COMPLETED') {
      status = 'COMPLETED';
      completedAt = new Date();
      extractedData.preliminaryFeedback = replyContent;

      // Генерируем промпт для аватара на основе отчета
      try {
        const avatarPromptSystem = `Ты — эксперт по генерации промптов для ИИ-рисовалок (Stable Diffusion, Midjourney).
Проанализируй коучинговое резюме подростка и составь ОДИН короткий, сочный промпт на АНГЛИЙСКОМ языке (до 20 слов), который визуализирует его характер и таланты.
Подбирай художественный стиль изображения на основе психологического типа подростка:
- Если он романтик, мечтатель, гуманитарий, творческий — используй стиль: "dreamy watercolor, soft fantasy illustration, warm cinematic lighting, celestial magical art".
- Если он аналитик, логик, программист, технарь — используй стиль: "technical blueprint style, clean vector line art, minimal geometric schematics, glowing digital grid".
- Если он практик, лидер, активный организатор, бунтарь — используй стиль: "vibrant street art, bold graffiti, high-contrast energetic sketch, modern grunge illustration".
В ответе выведи только сам промпт, без кавычек, префиксов и лишнего текста.`;
        
        const aiPrompt = await generateText(avatarPromptSystem, [{ role: 'user', content: replyContent }], 0.8);
        if (aiPrompt) {
          const cleanPrompt = aiPrompt.replace(/["']/g, "").trim();
          extractedData.avatarUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=600&height=600&nologo=true&private=true`;
        }
      } catch (e) {
        console.warn('Failed to generate image avatar prompt, using fallback:', e);
        extractedData.avatarUrl = `https://image.pollinations.ai/prompt/cybernetic%20neon%20avatar%20of%20a%20young%20mind,%20digital%20art,%20futurism?width=600&height=600&nologo=true&private=true`;
      }
    }

    // Добавляем ответ коуча в транскрипт
    transcript.push({ role: 'assistant', content: replyContent, timestamp: new Date().toISOString() });

    // Сохраняем обновленную сессию в БД
    await prisma.coachSession.update({
      where: { id: coachSession.id },
      data: {
        transcript,
        extractedData,
        status,
        completedAt
      }
    });

    // Фоновая отправка уведомлений
    const dbUser = await prisma.user.findUnique({ where: { id: coachSession.userId } });
    if (dbUser && (parsedData.phone || isFinalStateNow)) {
      sendTelegramNotification(dbUser, extractedData).catch(err => console.error(err));
      sendMaxIdSync(dbUser, extractedData).catch(err => console.error(err));
    }
    if (dbUser && isFinalStateNow) {
      sendTelegramReportToUser(dbUser, extractedData).catch(err => console.error(err));
      sendMaxReportToUser(dbUser, extractedData).catch(err => console.error(err));
    }

    return NextResponse.json({
      reply: replyContent,
      sessionId: coachSession.id,
      currentStep: currentVirtualStep,
      phoneConfirmed: updatedPhone,
      sessionStatus: status,
      extracted: extractedData
    });

  } catch (error: any) {
    console.error('Error in coach chat route:', error);
    return NextResponse.json({ error: error.message || 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

/**
 * Резервная экстракция данных с помощью регулярных выражений при сбоях ИИ
 */
function fallbackExtract(
  message: string, 
  currentStep: number, 
  hasName: boolean, 
  hasAgeOrGrade: boolean, 
  hasCity: boolean
): Record<string, any> {
  const result: Record<string, any> = { shouldAdvanceStep: true };
  const cleanMsg = message.trim();
  
  if (currentStep === 1) {
    // 1. Извлечение имени
    if (!hasName) {
      const nameMatch = cleanMsg.match(/(?:меня зовут|я|зовут|это)\s+([А-ЯЁа-яёA-Za-z]+)/i);
      if (nameMatch && nameMatch[1]) {
        result.fullName = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1).toLowerCase();
      } else if (cleanMsg.length > 1 && cleanMsg.length < 20 && !/\d/.test(cleanMsg)) {
        const words = cleanMsg.split(/\s+/);
        if (words.length <= 2) {
          const firstWord = words[0].replace(/[^А-ЯЁа-яёA-Za-z]/g, "");
          if (firstWord.length > 1) {
            result.fullName = firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
          }
        }
      }
    }

    // 2. Извлечение возраста и класса
    if (hasName && !hasAgeOrGrade) {
      const ageMatch = cleanMsg.match(/(\d+)\s*(?:лет|года|год)/i) || cleanMsg.match(/(?:мне|я)\s+(\d+)/i) || cleanMsg.match(/\b(1[0-9])\b/);
      if (ageMatch) {
        result.age = parseInt(ageMatch[1]);
      }

      const gradeMatch = cleanMsg.match(/(\d+)\s*(?:класс|классе)/i) || cleanMsg.match(/\b([1-9]|1[0-1])\b/);
      if (gradeMatch) {
        result.grade = gradeMatch[1] + " класс";
      }
    }

    // 3. Извлечение города
    if (hasName && hasAgeOrGrade && !hasCity) {
      const cityMatch = cleanMsg.match(/(?:из|город|живу в)\s+([А-ЯЁа-яёA-Za-z\-]+)/i);
      if (cityMatch && cityMatch[1]) {
        result.city = cityMatch[1].charAt(0).toUpperCase() + cityMatch[1].slice(1).toLowerCase();
      } else if (cleanMsg.length > 2 && cleanMsg.length < 25 && !/\d/.test(cleanMsg)) {
        const words = cleanMsg.split(/\s+/);
        if (words.length <= 2) {
          const lastWord = words[words.length - 1].replace(/[^А-ЯЁа-яёA-Za-z\-]/g, "");
          if (lastWord.length > 2) {
            result.city = lastWord.charAt(0).toUpperCase() + lastWord.slice(1).toLowerCase();
          }
        }
      }
    }
  }
  
  return result;
}
