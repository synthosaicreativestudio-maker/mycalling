// API Route — Server Side Only (НЕ ставить "use client" — это ломает серверные модули!)

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '../../../../lib/prisma';
import { auth } from '../../../../lib/auth';
import { generateText, generateJson } from '../../../../lib/gemini';

const FALLBACK_REPLIES: Record<number, string> = {
  0: "Привет! Рад встрече. Меня зовут Роман, я твой коуч и наставник на платформе «МоёПризвание». Сегодня мы провем увлекательное исследование твоих талантов, сильных сторон и интересов. Это не скучный экзамен, а дружеский диалог. Чтобы я смог составить максимально точный профиль, отвечай, пожалуйста, подробно и честно. Готов начать?",
  1: "Отлично! Давай сначала познакомимся. Как мне к тебе обращаться? Напиши свое имя. 😊",
  2: "Приятно познакомиться! Теперь давай подключим удобный канал связи ниже (Telegram или MAX ID), чтобы результаты не потерялись, и мы могли продолжить в любой момент! 😉",
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

function formatToTelegramHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.*?)\*/g, '<b>$1</b>');
}

function getSafeField(data: any, key: string): string {
  if (data && data.expressExtracted && typeof data.expressExtracted === 'object') {
    if (data.expressExtracted[key] !== undefined) {
      return data.expressExtracted[key] || '';
    }
  }
  if (data && data.deepExtracted && typeof data.deepExtracted === 'object') {
    if (data.deepExtracted[key] !== undefined) {
      return data.deepExtracted[key] || '';
    }
  }
  return (data && data[key]) || '';
}

/** Отправить карточку лида администратору в Telegram */
async function sendTelegramNotification(user: any, data: any) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) { console.warn('TELEGRAM_BOT_TOKEN not set, skipping admin notification'); return; }
  const chatId = process.env.TELEGRAM_CHAT_ID || '148281488';
  const tgApiBase = (process.env.TELEGRAM_API_BASE_URL || 'https://api.telegram.org').replace(/\/$/, '');
  
  const isDeep = data.sessionMode === 'DEEP';
  let rawText = '';
  
  if (isDeep) {
    rawText = `*Глубокий коучинг (Нейрокоуч):*
*Имя:* ${user.name || 'Не указано'}
*Телефон:* ${user.phone || 'Не указано'}
*Роль:* ${user.role || 'STUDENT'}
*Виртуальный шаг:* ${data.currentStep || 0}
 
*Результаты сессии:*
*🎯 Цель (Что хочу):* ${getSafeField(data, 'deepGoal') || 'Не указано'}
*🌟 Результат:* ${getSafeField(data, 'deepOutcome') || 'Не указано'}
*🔥 Эмоции:* ${getSafeField(data, 'deepEmotions') || 'Не указано'}
*👑 Идентичность:* ${getSafeField(data, 'deepIdentity') || 'Не указано'}
*🚀 План & KPI:* ${getSafeField(data, 'deepActions') || 'Не указано'}
*⚡ Первый шаг:* ${getSafeField(data, 'deepFirstStep') || 'Не указано'}
 
*Резюме коуча:* ${data.preliminaryFeedback || 'Еще не сформировано'}`;
  } else {
    rawText = `*Регистрация лида (Нейрокоуч):*
*Имя:* ${user.name || 'Не указано'}
*Телефон:* ${user.phone || 'Не указано'}
*Роль:* ${user.role || 'STUDENT'}
*Виртуальный шаг:* ${data.currentStep || 0}
 
*Ответы:*
*Мечты:* ${getSafeField(data, 'dreams') || 'Не указано'}
*Кумиры:* ${getSafeField(data, 'idols') || 'Не указано'}
*Ценности:* ${getSafeField(data, 'values') || 'Не указано'}
*Барьеры:* ${getSafeField(data, 'fears') || getSafeField(data, 'barriers') || 'Не указано'}
*Резюме коуча:* ${data.preliminaryFeedback || 'Еще не сформировано'}`;
  }

  const text = formatToTelegramHtml(rawText);

  try {
    await fetch(`${tgApiBase}/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
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

  const isDeep = data.sessionMode === 'DEEP';
  const feedback = data.preliminaryFeedback || 'Резюме ещё не сформировано';
  let rawText = '';
  
  if (isDeep) {
    rawText = `*Манифест целей от наставника Романа*\n\n` +
      `*🎯 Твоя цель:* ${getSafeField(data, 'deepGoal') || 'Не указано'}\n` +
      `*👑 Твоя идентичность:* ${getSafeField(data, 'deepIdentity') || 'Не указано'}\n` +
      `*⚡ Первый шаг:* ${getSafeField(data, 'deepFirstStep') || 'Не указано'}\n\n` +
      `*Анализ наставника:*\n${feedback}\n\n` +
      `Теперь ты можешь пройти интерактивные тесты для полной профориентации:\nhttps://synthosai.ru/assessment`;
  } else {
    rawText = `*Предварительное резюме от наставника Романа*\n\n${feedback}\n\nТеперь вы можете пройти интерактивные тесты для точной диагностики на сайте:\nhttps://synthosai.ru/assessment`;
  }
  
  const text = formatToTelegramHtml(rawText);

  try {
    await fetch(`${tgApiBase}/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: user.telegramId,
        text: text,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Перейти к диагностике', url: 'https://synthosai.ru/assessment' }]
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
  const text = `Предварительное резюме от наставника Романа\n\n${feedback}\n\nТеперь вы можете пройти интерактивные тесты для точной диагностики на сайте: https://synthosai.ru/assessment`;

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
                [{ type: 'link', text: 'Перейти к диагностике', url: 'https://synthosai.ru/assessment' }]
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
          dreams: getSafeField(data, 'dreams'),
          idols: getSafeField(data, 'idols'),
          values: getSafeField(data, 'values'),
          barriers: getSafeField(data, 'fears') || getSafeField(data, 'barriers'),
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
    const { message, sessionId, fromLoginError, linkCode, sessionMode } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Сообщение пользователя не передано' }, { status: 400 });
    }

    const getStrLen = (val: any): number => {
      return typeof val === 'string' ? val.trim().length : 0;
    };

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
      const dbUser = await prisma.user.findUnique({
        where: { id: authenticatedUserId }
      });
      if (dbUser && dbUser.mergedInto) {
        console.log(`[coach/chat] Resolving chat session user ${authenticatedUserId} -> merged target ${dbUser.mergedInto}`);
        authenticatedUserId = dbUser.mergedInto;
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

        // Помечаем гостевого пользователя как объединенного (soft merge)
        try {
          await prisma.user.update({
            where: { id: guestSession.userId },
            data: { mergedInto: userId }
          });
        } catch (e) {
          console.error('Failed to update guest user status during merge:', e);
        }
      } else {
        // Если гостевая сессия не нуждается в слиянии, просто берем её (если она есть) или ищем по userId
        coachSession = guestSession || await prisma.coachSession.findUnique({
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
          extractedData: { currentStep: 0, sessionMode: sessionMode || null },
          status: 'IN_PROGRESS'
        },
        include: { user: true }
      });
    } else {
      userId = coachSession.userId;
      // Если режим явно передан и еще не зафиксирован в сессии, обновляем его
      const currentExtracted = (coachSession.extractedData as Record<string, any>) || {};
      if (sessionMode && currentExtracted.sessionMode !== sessionMode) {
        currentExtracted.sessionMode = sessionMode;
        coachSession = await prisma.coachSession.update({
          where: { id: coachSession.id },
          data: { extractedData: currentExtracted },
          include: { user: true }
        });
      }
    }

    let rawTranscript = coachSession.transcript;
    let expressTranscript: any[] = [];
    let deepTranscript: any[] = [];
    let transcript: any[] = [];

    if (Array.isArray(rawTranscript)) {
      expressTranscript = rawTranscript;
      deepTranscript = [];
    } else if (rawTranscript && typeof rawTranscript === 'object') {
      const obj = rawTranscript as Record<string, any>;
      expressTranscript = Array.isArray(obj.EXPRESS) ? obj.EXPRESS : [];
      deepTranscript = Array.isArray(obj.DEEP) ? obj.DEEP : [];
    }

    let rawExtractedData = (coachSession.extractedData as Record<string, any>) || {};
    let extractedData = { ...rawExtractedData };

    if (!extractedData.expressExtracted && !extractedData.deepExtracted) {
      const expressExtracted: Record<string, any> = {};
      const deepExtracted: Record<string, any> = {};
      
      const expressKeys = [
        'hobbies', 'schoolSubjects', 'dreams', 'idols', 'parents', 'fears',
        'experience', 'workFormat', 'thinkingType', 'successMeasure',
        'energySources', 'teamRole', 'autonomyStyle', 'values', 'decisionStyle'
      ];
      const deepKeys = [
        'deepGoal', 'deepOutcome', 'deepEmotions', 'deepIdentity', 'deepActions', 'deepFirstStep'
      ];
      
      for (const k of expressKeys) {
        if (extractedData[k] !== undefined) expressExtracted[k] = extractedData[k];
      }
      for (const k of deepKeys) {
        if (extractedData[k] !== undefined) deepExtracted[k] = extractedData[k];
      }
      
      extractedData = {
        fullName: extractedData.fullName,
        phone: extractedData.phone,
        age: extractedData.age,
        grade: extractedData.grade,
        city: extractedData.city,
        sessionMode: extractedData.sessionMode || 'EXPRESS',
        currentStep: extractedData.currentStep,
        lastStep: extractedData.lastStep,
        stepAttempts: extractedData.stepAttempts,
        preliminaryFeedback: extractedData.preliminaryFeedback,
        avatarUrl: extractedData.avatarUrl,
        
        expressStep: extractedData.sessionMode === 'DEEP' ? 2 : extractedData.currentStep,
        expressStatus: coachSession.status === 'COMPLETED' && extractedData.sessionMode !== 'DEEP' ? 'COMPLETED' : 'IN_PROGRESS',
        expressExtracted,
        
        deepStep: extractedData.sessionMode === 'DEEP' ? extractedData.currentStep : 10,
        deepStatus: coachSession.status === 'COMPLETED' && extractedData.sessionMode === 'DEEP' ? 'COMPLETED' : 'IN_PROGRESS',
        deepExtracted
      };
    }

    const isDeepMode = extractedData.sessionMode === 'DEEP';
    transcript = isDeepMode ? deepTranscript : expressTranscript;

    // Вычисляем, какие блоки информации уже собраны
    const hasName = !!extractedData.fullName && extractedData.fullName !== 'Гость';
    const hasPhone = !!coachSession.user.phone || !!extractedData.phone;
    const hasAge = !!extractedData.age;
    const hasGrade = !!extractedData.grade;
    const hasCity = !!extractedData.city;
    const hasPersonalInfo = hasName && hasAge && hasGrade && hasCity;
    
    // Вычисляем шаг до экстракции
    let currentStepBefore = 1;
    let nextStep = 1;

    if (isDeepMode) {
      const hasDeepGoal = getStrLen(extractedData.deepExtracted?.deepGoal) > 1;
      const hasDeepOutcome = getStrLen(extractedData.deepExtracted?.deepOutcome) > 1;
      const hasDeepEmotions = getStrLen(extractedData.deepExtracted?.deepEmotions) > 1;
      const hasDeepIdentity = getStrLen(extractedData.deepExtracted?.deepIdentity) > 1;
      const hasDeepActions = getStrLen(extractedData.deepExtracted?.deepActions) > 1;
      const hasDeepFirstStep = getStrLen(extractedData.deepExtracted?.deepFirstStep) > 1;

      if (!hasName) {
        currentStepBefore = 1;
        nextStep = 1;
      } else if (!hasPhone) {
        currentStepBefore = 2;
        nextStep = 2;
      } else if (!hasPersonalInfo) {
        currentStepBefore = 2;
        nextStep = 2;
      } else if (!hasDeepGoal) {
        currentStepBefore = 10;
        nextStep = 10;
      } else if (!hasDeepOutcome) {
        currentStepBefore = 11;
        nextStep = 11;
      } else if (!hasDeepEmotions) {
        currentStepBefore = 12;
        nextStep = 12;
      } else if (!hasDeepIdentity) {
        currentStepBefore = 13;
        nextStep = 13;
      } else if (!hasDeepActions) {
        currentStepBefore = 14;
        nextStep = 14;
      } else if (!hasDeepFirstStep) {
        currentStepBefore = 15;
        nextStep = 15;
      } else {
        currentStepBefore = 16;
        nextStep = 16;
      }
    } else {
      const hasHobbies = getStrLen(extractedData.expressExtracted?.hobbies) > 6;
      const hasSchoolSubjects = getStrLen(extractedData.expressExtracted?.schoolSubjects) > 6;
      const hasDreams = getStrLen(extractedData.expressExtracted?.dreams) > 6;
      const hasIdols = getStrLen(extractedData.expressExtracted?.idols) > 6;
      const hasParents = getStrLen(extractedData.expressExtracted?.parents) > 6;
      const hasFears = getStrLen(extractedData.expressExtracted?.fears) > 6;
      const hasExperience = getStrLen(extractedData.expressExtracted?.experience) > 6;
      const hasWorkFormat = getStrLen(extractedData.expressExtracted?.workFormat) > 6;
      const hasThinkingType = getStrLen(extractedData.expressExtracted?.thinkingType) > 6;
      const hasSuccessMeasure = getStrLen(extractedData.expressExtracted?.successMeasure) > 6;
      const hasEnergySources = getStrLen(extractedData.expressExtracted?.energySources) > 6;
      const hasTeamRole = getStrLen(extractedData.expressExtracted?.teamRole) > 6;
      const hasAutonomyStyle = getStrLen(extractedData.expressExtracted?.autonomyStyle) > 6;
      const hasValues = getStrLen(extractedData.expressExtracted?.values) > 6;
      const hasDecisionStyle = getStrLen(extractedData.expressExtracted?.decisionStyle) > 6;

      if (!hasName) {
        currentStepBefore = 1;
        nextStep = 1;
      } else if (!hasPhone) {
        currentStepBefore = 2;
        nextStep = 2;
      } else if (!hasPersonalInfo) {
        currentStepBefore = 2;
        nextStep = 2;
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
        
        if (psychoBlocksBefore < 13) {
          currentStepBefore = Math.min(15, 3 + psychoBlocksBefore);
        } else {
          currentStepBefore = 16;
        }
      }

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
      const isFinalStep = allPsychologyCollected;
      nextStep = !hasName ? 1 : (!hasPhone ? 2 : (!hasPersonalInfo ? 2 : (isFinalStep ? 16 : Math.min(15, 3 + psychoBlocksCount))));
    }

    // Защита от зависания шагов (когда ИИ-экстрактор не может надежно извлечь данные)
    let finalNextStep = nextStep;
    const isInitMessage = message === 'Начать сессию с коучем';

    if (!isInitMessage) {
      const lastStep = extractedData.lastStep || 0;
      let stepAttempts = extractedData.stepAttempts || 0;

      if (nextStep === lastStep) {
        stepAttempts++;
        if (!isDeepMode && nextStep >= 3 && nextStep <= 15) {
          if (stepAttempts >= 2) {
            const hasHobbies = getStrLen(extractedData.expressExtracted?.hobbies) > 6;
            const hasSchoolSubjects = getStrLen(extractedData.expressExtracted?.schoolSubjects) > 6;
            const hasDreams = getStrLen(extractedData.expressExtracted?.dreams) > 6;
            const hasIdols = getStrLen(extractedData.expressExtracted?.idols) > 6;
            const hasParents = getStrLen(extractedData.expressExtracted?.parents) > 6;
            const hasFears = getStrLen(extractedData.expressExtracted?.fears) > 6;
            const hasExperience = getStrLen(extractedData.expressExtracted?.experience) > 6;
            const hasWorkFormat = getStrLen(extractedData.expressExtracted?.workFormat) > 6;
            const hasThinkingType = getStrLen(extractedData.expressExtracted?.thinkingType) > 6;
            const hasSuccessMeasure = getStrLen(extractedData.expressExtracted?.successMeasure) > 6;
            const hasEnergySources = getStrLen(extractedData.expressExtracted?.energySources) > 6;
            const hasTeamRole = getStrLen(extractedData.expressExtracted?.teamRole) > 6;
            const hasAutonomyStyle = getStrLen(extractedData.expressExtracted?.autonomyStyle) > 6;
            const hasValues = getStrLen(extractedData.expressExtracted?.values) > 6;
            const hasDecisionStyle = getStrLen(extractedData.expressExtracted?.decisionStyle) > 6;

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
              if (!extractedData.expressExtracted) extractedData.expressExtracted = {};
              extractedData.expressExtracted[firstEmpty.key] = "Продолжено наставником";
              let psychoBlocksCount = 0;
              psychoFields.forEach(f => {
                if (f.key === firstEmpty.key || f.has) psychoBlocksCount++;
              });
              const isFinalStepUpdated = hasPersonalInfo && (psychoBlocksCount >= 12);
              finalNextStep = isFinalStepUpdated ? 16 : Math.min(15, 3 + psychoBlocksCount);
            }
            stepAttempts = 0;
          }
        } else if (isDeepMode && nextStep >= 10 && nextStep <= 15) {
          if (stepAttempts >= 2) {
            const deepFields = [
              { key: 'deepGoal', step: 10, val: 'Сформулировано наставником' },
              { key: 'deepOutcome', step: 11, val: 'Образ результата принят' },
              { key: 'deepEmotions', step: 12, val: 'Вдохновение и радость' },
              { key: 'deepIdentity', step: 13, val: 'Человек, идущий к цели' },
              { key: 'deepActions', step: 14, val: 'План действий составлен' },
              { key: 'deepFirstStep', step: 15, val: 'Первый шаг запланирован' }
            ];
            const currentField = deepFields.find(f => f.step === nextStep);
            if (currentField) {
              if (!extractedData.deepExtracted) extractedData.deepExtracted = {};
              extractedData.deepExtracted[currentField.key] = currentField.val;
              if (nextStep === 10) finalNextStep = 11;
              else if (nextStep === 11) finalNextStep = 12;
              else if (nextStep === 12) finalNextStep = 13;
              else if (nextStep === 13) finalNextStep = 14;
              else if (nextStep === 14) finalNextStep = 15;
              else if (nextStep === 15) finalNextStep = 16;
            }
            stepAttempts = 0;
          }
        } else {
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
      // ПРОВЕРКА: Если канал связи только что подключили (hasPhone === true),
      // но в истории последнее сообщение — это предложение подключить канал (step === 2 и !hasPhone),
      // то мы автоматически добавляем в историю благодарность и первый вопрос (Возраст).
      const hasStep2Message = transcript.some(m => m.role === 'assistant' && (m.content.includes('канал связи') || m.content.includes('Telegram или MAX ID')));
      const hasAgeMessage = transcript.some(m => m.role === 'assistant' && (m.content.includes('сколько тебе лет') || m.content.includes('Сколько тебе лет')));

      if (hasPhone && hasStep2Message && !hasAgeMessage) {
        console.log('[coach/chat] Auto-transitioning to Age question after phone confirmation on init');
        
        const name = extractedData.fullName || 'друг';
        const transitionText = `Спасибо за выбор канала! 😉\n\n${name}, сколько тебе лет?`;
        const nextMsg = { role: 'assistant', content: transitionText, timestamp: new Date().toISOString() };
        
        expressTranscript.push(nextMsg);
        if (isDeepMode) {
          deepTranscript.push(nextMsg);
        }
        
        extractedData.currentStep = 2;
        extractedData.lastStep = 2;
        extractedData.stepAttempts = 0;
        
        await prisma.coachSession.update({
          where: { id: coachSession.id },
          data: {
            transcript: { EXPRESS: expressTranscript, DEEP: deepTranscript },
            extractedData: extractedData
          }
        });
        
        transcript = isDeepMode ? deepTranscript : expressTranscript;
        finalNextStep = 2;
        nextStep = 2;
      }

      return NextResponse.json({
        history: isDeepMode ? deepTranscript : expressTranscript,
        sessionId: coachSession.id,
        userId: coachSession.userId,
        currentStep: nextStep,
        phoneConfirmed: hasPhone,
        sessionStatus: coachSession.status,
        extracted: extractedData
      });
    }

    // Если это самое первое сообщение — приветствуем и заключаем контракт (CLEAR / Внутренняя Игра)
    if (isInitMessage && expressTranscript.length === 0 && deepTranscript.length === 0) {
      let greeting = FALLBACK_REPLIES[0];
      if (fromLoginError) {
        greeting = 'Привет! Рад встрече. Меня зовут Роман, я твой коуч и наставник. Я вижу, ты хотел зайти в Личный кабинет, но для этого нужно сначала пройти нашу короткую сессию. Не переживай — это не скучный тест, а увлекательное исследование твоих талантов. Отвечай максимально подробно, честно и развернуто — так я смогу точнее всего составить карту твоих талантов. Готов начать?';
      } else if (isDeepMode && hasPersonalInfo && hasPhone) {
        greeting = 'Отличный выбор! Мы начинаем Глубокий самокоучинг по методологии «Что хочу → Действие». Наш путь состоит из 6 важных шагов: мы найдем твое истинное желание, оцифруем образ результата, подключим эмоции, сформулируем твою идентичность («Кто я?»), составим план с KPI и зафиксируем первый шаг. \n\nДавай начнем: Что именно ты хочешь изменить, достичь или в чем реализоваться в плане будущей профессии?';
      }
      
      const newMsg = { role: 'assistant', content: greeting, timestamp: new Date().toISOString() };
      expressTranscript.push(newMsg);
      deepTranscript.push(newMsg);
      
      await prisma.coachSession.update({
        where: { id: coachSession.id },
        data: { 
          transcript: { EXPRESS: expressTranscript, DEEP: deepTranscript }, 
          extractedData: { ...extractedData, currentStep: (isDeepMode && hasPersonalInfo && hasPhone) ? 10 : 0 },
          status: 'IN_PROGRESS'
        }
      });

      return NextResponse.json({
        reply: greeting,
        sessionId: coachSession.id,
        userId: coachSession.userId,
        currentStep: (isDeepMode && hasPersonalInfo && hasPhone) ? 10 : 0,
        phoneConfirmed: hasPhone,
        sessionStatus: 'IN_PROGRESS',
        extracted: extractedData,
        history: isDeepMode ? deepTranscript : expressTranscript
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
        const newUserMsg = { role: 'user', content: userMsgContent, timestamp: new Date().toISOString() };
        if (isDeepMode) {
          deepTranscript.push(newUserMsg);
          if (currentStepBefore <= 2) {
            expressTranscript.push(newUserMsg);
          }
        } else {
          expressTranscript.push(newUserMsg);
          if (currentStepBefore <= 2) {
            deepTranscript.push(newUserMsg);
          }
        }
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
      const prevHasName = !!extractedData.fullName && extractedData.fullName.trim().length > 1 && extractedData.fullName !== 'Гость';
      const prevHasAgeOrGrade = !!extractedData.age || !!extractedData.grade;
      const prevHasCity = !!extractedData.city && extractedData.city.trim().length > 1;

      let properties: Record<string, any> = {
        shouldAdvanceStep: { type: "BOOLEAN" }
      };
      let fieldsToExtract = "shouldAdvanceStep(boolean)";

      if (currentStepBefore === 1) {
        properties.fullName = { type: "STRING" };
        fieldsToExtract += ", fullName";
      } else if (currentStepBefore === 2) {
        properties.fullName = { type: "STRING" };
        properties.age = { type: "INTEGER" };
        properties.grade = { type: "STRING" };
        properties.city = { type: "STRING" };
        fieldsToExtract += ", fullName, age, grade, city";
      } else if (!isDeepMode && currentStepBefore >= 3 && currentStepBefore <= 15) {
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
        
        properties.talentScores = {
          type: "OBJECT",
          properties: {
            creative: { type: "INTEGER", description: "Оценка склонности к творчеству (дизайн, тексты, искусство) от 0 до 100" },
            tech: { type: "INTEGER", description: "Оценка склонности к технологиям (код, роботы, инженерия) от 0 до 100" },
            analytical: { type: "INTEGER", description: "Оценка склонности к аналитике (логика, формулы, исследования) от 0 до 100" },
            social: { type: "INTEGER", description: "Оценка склонности к коммуникации (общение, обучение, продажи) от 0 до 100" },
            organizational: { type: "INTEGER", description: "Оценка склонности к организации (менеджмент, процессы, порядок) от 0 до 100" },
            startup: { type: "INTEGER", description: "Оценка склонности к лидерству (предпринимательство, проекты) от 0 до 100" }
          }
        };
        fieldsToExtract += ", hobbies, schoolSubjects, dreams, idols, parents, fears, experience, workFormat, thinkingType, successMeasure, energySources, teamRole, autonomyStyle, values, decisionStyle, talentScores (scores 0-100 reflecting the user's vocational areas)";
        
        properties.fullName = { type: "STRING" };
        properties.age = { type: "INTEGER" };
        properties.grade = { type: "STRING" };
        properties.city = { type: "STRING" };
        fieldsToExtract += ", fullName, age, grade, city";
      } else if (isDeepMode && currentStepBefore >= 10 && currentStepBefore <= 15) {
        if (currentStepBefore === 10) {
          properties.deepGoal = { type: "STRING" };
          fieldsToExtract += ", deepGoal";
        } else if (currentStepBefore === 11) {
          properties.deepOutcome = { type: "STRING" };
          fieldsToExtract += ", deepOutcome";
        } else if (currentStepBefore === 12) {
          properties.deepEmotions = { type: "STRING" };
          fieldsToExtract += ", deepEmotions";
        } else if (currentStepBefore === 13) {
          properties.deepIdentity = { type: "STRING" };
          fieldsToExtract += ", deepIdentity";
        } else if (currentStepBefore === 14) {
          properties.deepActions = { type: "STRING" };
          fieldsToExtract += ", deepActions";
        } else if (currentStepBefore === 15) {
          properties.deepFirstStep = { type: "STRING" };
          fieldsToExtract += ", deepFirstStep";
        }
      }

      const extractionPrompt = `Ты — анализатор текста. Проанализируй сообщение пользователя в контексте диалога профориентации. Извлеки данные в формате JSON (без markdown).
Последнее сообщение пользователя: "${message}"
Текущий шаг диалога: ${currentStepBefore} (где 10=Что хочу/Цель, 11=Результат/Образ, 12=Эмоции, 13=Идентичность, 14=Действия/Навыки/KPI, 15=Первый шаг).
Для shouldAdvanceStep: установи true, если пользователь дал осмысленный ответ по сути текущего шага. Если пользователь уклоняется от ответа или задает встречный вопрос, установи false.
Если анализируется Экспресс-коучинг (шаги 3..15), в поле talentScores оцени склонности пользователя по 6 шкалам (от 0 до 100) на основе всего диалога и его увлечений, хобби, школьных предметов, отношения к задачам и т.д.
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
      
      if (!extractedData.expressExtracted) extractedData.expressExtracted = {};
      if (!extractedData.deepExtracted) extractedData.deepExtracted = {};
      
      const updateExpressField = (key: string, val: any) => {
        if (val) {
          extractedData.expressExtracted[key] = (extractedData.expressExtracted[key] ? extractedData.expressExtracted[key] + '; ' : '') + val;
        }
      };
      
      updateExpressField('hobbies', parsedData.hobbies);
      updateExpressField('schoolSubjects', parsedData.schoolSubjects);
      updateExpressField('dreams', parsedData.dreams);
      updateExpressField('idols', parsedData.idols);
      updateExpressField('parents', parsedData.parents);
      updateExpressField('fears', parsedData.fears);
      updateExpressField('experience', parsedData.experience);
      updateExpressField('workFormat', parsedData.workFormat);
      updateExpressField('thinkingType', parsedData.thinkingType);
      updateExpressField('successMeasure', parsedData.successMeasure);
      updateExpressField('energySources', parsedData.energySources);
      updateExpressField('teamRole', parsedData.teamRole);
      updateExpressField('autonomyStyle', parsedData.autonomyStyle);
      updateExpressField('values', parsedData.values);
      updateExpressField('decisionStyle', parsedData.decisionStyle);
      
      if (parsedData.talentScores) {
        if (!extractedData.expressExtracted.talentScores) {
          extractedData.expressExtracted.talentScores = {
            creative: 0, tech: 0, analytical: 0, social: 0, organizational: 0, startup: 0
          };
        }
        const prevScores = extractedData.expressExtracted.talentScores;
        const newScores = parsedData.talentScores;
        const updateScore = (key: string) => {
          if (typeof newScores[key] === 'number') {
            prevScores[key] = Math.max(prevScores[key] || 0, newScores[key]);
          }
        };
        updateScore('creative');
        updateScore('tech');
        updateScore('analytical');
        updateScore('social');
        updateScore('organizational');
        updateScore('startup');
        extractedData.expressExtracted.talentScores = prevScores;
      }
      
      // Глубокий коучинг
      if (parsedData.deepGoal) extractedData.deepExtracted.deepGoal = parsedData.deepGoal;
      if (parsedData.deepOutcome) extractedData.deepExtracted.deepOutcome = parsedData.deepOutcome;
      if (parsedData.deepEmotions) extractedData.deepExtracted.deepEmotions = parsedData.deepEmotions;
      if (parsedData.deepIdentity) extractedData.deepExtracted.deepIdentity = parsedData.deepIdentity;
      if (parsedData.deepActions) extractedData.deepExtracted.deepActions = parsedData.deepActions;
      if (parsedData.deepFirstStep) extractedData.deepExtracted.deepFirstStep = parsedData.deepFirstStep;
    }

    const updatedPhone = hasPhone || !!parsedData.phone;
    
    // Проверяем заполненность отдельных полей личных данных
    const updatedName = !!extractedData.fullName && extractedData.fullName.trim().length > 1 && extractedData.fullName !== 'Гость';
    const updatedAge = !!extractedData.age;
    const updatedGrade = !!extractedData.grade;
    const updatedCity = !!extractedData.city && extractedData.city.trim().length > 1;
    
    // Личные данные считаются полностью собранными, если есть имя, возраст, класс и город
    const updatedPersonalInfo = updatedName && updatedAge && updatedGrade && updatedCity;
    const updatedDreams = getStrLen(extractedData.expressExtracted?.dreams) > 6;
    const updatedIdols = getStrLen(extractedData.expressExtracted?.idols) > 6;
    const updatedParents = getStrLen(extractedData.expressExtracted?.parents) > 6;
    const updatedHobbies = getStrLen(extractedData.expressExtracted?.hobbies) > 6;
    const updatedSchoolSubjects = getStrLen(extractedData.expressExtracted?.schoolSubjects) > 6;
    const updatedFears = getStrLen(extractedData.expressExtracted?.fears) > 6;
    const updatedExperience = getStrLen(extractedData.expressExtracted?.experience) > 6;
    const updatedWorkFormat = getStrLen(extractedData.expressExtracted?.workFormat) > 6;
    const updatedThinkingType = getStrLen(extractedData.expressExtracted?.thinkingType) > 6;
    const updatedSuccessMeasure = getStrLen(extractedData.expressExtracted?.successMeasure) > 6;
    const updatedEnergySources = getStrLen(extractedData.expressExtracted?.energySources) > 6;
    const updatedTeamRole = getStrLen(extractedData.expressExtracted?.teamRole) > 6;
    const updatedAutonomyStyle = getStrLen(extractedData.expressExtracted?.autonomyStyle) > 6;
    const updatedValues = getStrLen(extractedData.expressExtracted?.values) > 6;
    const updatedDecisionStyle = getStrLen(extractedData.expressExtracted?.decisionStyle) > 6;

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
    let isFinalStateNow = false;

    if (isDeepMode) {
      const hasDeepGoal = getStrLen(extractedData.deepExtracted?.deepGoal) > 1;
      const hasDeepOutcome = getStrLen(extractedData.deepExtracted?.deepOutcome) > 1;
      const hasDeepEmotions = getStrLen(extractedData.deepExtracted?.deepEmotions) > 1;
      const hasDeepIdentity = getStrLen(extractedData.deepExtracted?.deepIdentity) > 1;
      const hasDeepActions = getStrLen(extractedData.deepExtracted?.deepActions) > 1;
      const hasDeepFirstStep = getStrLen(extractedData.deepExtracted?.deepFirstStep) > 1;

      if (!updatedName) {
        currentVirtualStep = 1;
      } else if (!updatedPhone) {
        currentVirtualStep = 2;
      } else if (!updatedPersonalInfo) {
        currentVirtualStep = 2;
      } else if (!hasDeepGoal) {
        currentVirtualStep = 10;
      } else if (!hasDeepOutcome) {
        currentVirtualStep = 11;
      } else if (!hasDeepEmotions) {
        currentVirtualStep = 12;
      } else if (!hasDeepIdentity) {
        currentVirtualStep = 13;
      } else if (!hasDeepActions) {
        currentVirtualStep = 14;
      } else if (!hasDeepFirstStep) {
        currentVirtualStep = 15;
      } else {
        currentVirtualStep = 16;
      }
      isFinalStateNow = updatedPersonalInfo && updatedPhone && hasDeepGoal && hasDeepOutcome && hasDeepEmotions && hasDeepIdentity && hasDeepActions && hasDeepFirstStep;
    } else {
      if (!updatedName) {
        currentVirtualStep = 1; // Шаг знакомства (Имя)
      } else if (!updatedPhone) {
        currentVirtualStep = 2; // Шаг подключения Telegram
      } else if (!updatedPersonalInfo) {
        currentVirtualStep = 2; // Шаг сбора возраста, класса, города
      } else {
        // Свободный диалог длится до Шага 15 (когда собрано 13 психологических полей)
        if (psychoBlocks < 13) {
          currentVirtualStep = Math.min(15, 3 + psychoBlocks);
        } else {
          currentVirtualStep = 16; // Шаг подведения итогов (Финал)
        }
      }

      isFinalStateNow = updatedPersonalInfo && updatedPhone && (psychoBlocks >= 12);
      if (isFinalStateNow) {
        currentVirtualStep = 16;
      }
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
      missingFields.push("- Имя собеседника. Спроси, как его зовут (как к нему обращаться). Сделай это вежливо и дружелюбно.");
    } else if (currentVirtualStep === 2 && !hasPhone) {
      missingFields.push("- Подключение канала связи (Telegram или MAX ID). Предложи подростку выбрать удобный канал связи ниже (подключить Telegram или указать свой MAX ID), чтобы результаты не потерялись, и мы могли продолжить.");
    } else if (currentVirtualStep === 2 && hasPhone) {
      if (!hasAge) {
        missingFields.push("- Возраст. Спроси: «сколько тебе лет?» (мягко и прямо).");
      } else if (!hasGrade) {
        missingFields.push("- Класс. Спроси, в каком классе он учится.");
      } else if (!hasCity) {
        missingFields.push("- Город. Спроси, из какого он города.");
      }
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
      if (isDeepMode) {
        systemPrompt = `Ты — Роман, поддерживающий, мудрый коуч и наставник профориентационной платформы «МоёПризвание».
Все шаги глубокой коуч-сессии («Что хочу → Результат → Образ → Эмоции → Идентичность → Действие») успешно пройдены!

Твоя единственная задача на этом финальном шаге:
1. Выдать глубокое, вдохновляющее и теплое резюме проделанной работы (4-5 предложений), начав со слов: «Слушай, я проанализировал наш диалог...».
2. Сделать упор на его цель ("${extractedData.deepGoal || ''}"), образ результата ("${extractedData.deepOutcome || ''}"), его новую идентичность ("${extractedData.deepIdentity || ''}") и его первый двухминутный шаг ("${extractedData.deepFirstStep || ''}").
3. На основе его ответов определи его ведущий архетип по Юнгу (Пирсон-Марр): например, Творец (созидание), Искатель (свобода и открытия), Мудрец (поиск истины), Герой (преодоление преград), Правитель (лидерство) или Заботливый (помощь другим). Назови этот архетип и объясни подростку его суперсилу.
4. Объясни, что первичный профиль успешно сформирован, и предложи скачать отчет в формате PDF прямо в чате.
5. Пригласи пройти интерактивные тесты для закрепления картины талантов.
НИКАКИХ новых вопросов в конце не задавай. Ты завершаешь сессию.`;
      } else {
        systemPrompt = `Ты — Роман, поддерживающий, мудрый коуч и наставник профориентационной платформы «МоёПризвание».
Все необходимые качественные данные о подростке успешно собраны.

Твоя единственная задача на этом финальном шаге:
1. Выдать глубокое, вдохновляющее и невероятно эмпатичное резюме диалога (4-5 предложений), начав его со слов: «Слушай, я проанализировал наш диалог...» или похожей личной фразы.
2. Сделай акцент на его сильных сторонах, мечтах и ценностях, которые он упомянул.
3. На основе его ответов (особенно про суперсилу, кумиров и отношение к трудностям) определи его ведущий архетип по Юнгу (Пирсон-Марр): например, Творец (желание создавать новое), Искатель (стремление к свободе и открытиям), Мудрец (поиск истины и логика), Герой (преодоление преград), Правитель (контроль и лидерство), Заботливый/Опекун (помощь другим) или Шут (юмор и игра). Назови этот архетип и коротко объясни подростку, в чем его суперсила.
4. Объясни, что первичный профиль успешно сформирован, и предложи скачать отчет в формате PDF прямо в чате.
5. Пригласи подростка пройти короткие интерактивные тесты на платформе, чтобы дополнить картину его талантов.
НИКАКИХ новых вопросов в конце не задавай. Ты завершаешь сессию.`;
      }
    } else if (currentVirtualStep === 1) {
      systemPrompt = `Ты — Роман, мудрый, поддерживающий коуч и наставник подростков на платформе «МоёПризвание».
Твоя цель на текущем этапе диалога — узнать имя подростка (как к нему обращаться).

Веди живой, спокойный, эмпатичный диалог на равных:
1. Поздоровайся и мягко спроси, как зовут подростка.
2. Будь предельно лаконичен (1-2 предложения).

Критически важные правила общения:
- Задавай строго ОДИН простой вопрос за раз.
- Категорически запрещено использовать фальшивые междометия («О!», «Ого!», «Ооо», «Ага», «Ух ты!») и шаблонные наигранные восторги.
- Категорически запрещено использовать слова «ИИ», «алгоритм», «бот», «робот». Ты — коуч Роман.`;
    } else if (currentVirtualStep === 2) {
      systemPrompt = `Ты — Роман, мудрый, поддерживающий коуч и наставник подростков на платформе «МоёПризвание».
${!hasPhone ? 'Твоя цель на текущем этапе диалога — предложить подключить канал связи.' : 'Твоя цель на текущем этапе диалога — собрать по одному недостающие личные данные собеседника.'}

Веди живой, спокойный, эмпатичный диалог на равных:
1. Естественно и без лишних эмоций реагируй на ответы подростка.
2. Задай вопрос о недостающих данных, но только о первом по списку! Не спрашивай всё сразу. Нам нужно получить ответ именно на указанный ниже вопрос.
Недостающие данные:
${missingFields.join('\n')}

Уже известная информация о собеседнике:
- Имя: ${extractedData.fullName || 'Не указано'}
- Телефон/Telegram: ${hasPhone ? 'Подключен' : 'Не подключен'}
- Возраст: ${extractedData.age ? `${extractedData.age} лет` : 'Не указан'}
- Класс: ${extractedData.grade || 'Не указан'}
- Город: ${extractedData.city || 'Не указан'}

Критически важные правила общения:
- Каждое твое сообщение ОБЯЗАТЕЛЬНО должно заканчиваться конкретным, простым, вовлекающим открытым вопросом или понятным призывом к действию (подталкиванием вперед), чтобы собеседнику было абсолютно ясно, о чем писать дальше. Не оставляй диалог зависшим.
- Задавай строго ОДИН простой вопрос за раз. Не перегружай подростка.
- Категорически запрещено использовать фальшивые междометия («О!», «Ого!», «Ооо», «Ага», «Ух ты!») и шаблонные наигранные восторги. Говори просто, спокойно, естественно, как нормальный взрослый друг.
- Длина твоих реплик: до 3 предложений.
- Категорически запрещено использовать слова «ИИ», «алгоритм», «бот», «робот». Ты — коуч Роман.`;
    } else if (isDeepMode) {
      if (finalNextStep === 10) {
        systemPrompt = `Ты — Роман, мудрый, поддерживающий коуч и наставник подростков на платформе «МоёПризвание».
Мы находимся на Шаге 1 коуч-схемы: «Что я хочу? (Запрос/Цель)».
Твоя цель: помочь подростку сформулировать его истинное желание, цель или запрос в профориентации.

Инструкция:
1. Спроси подростка о его целях, мечтах или о том, в чем он хочет реализоваться.
2. Примени технику «5 почему» (задай вопрос «Почему ты этого хочешь?» или «Что самого ценного принесет тебе эта цель?», чтобы докопаться до глубинной мотивации).
3. Задавай строго один вопрос за раз, будь краток (до 3 предложений), пиши тепло, эмпатично, спокойно и естественно. Никаких восторженных восклицаний.`;
      } else if (finalNextStep === 11) {
        systemPrompt = `Ты — Роман, мудрый, поддерживающий коуч и наставник подростков на платформе «МоёПризвание».
Мы находимся на Шаге 2 коуч-схемы: «Какой наилучший результат? (Образ)».
Твоя цель: перевести абстрактное «хочу» в детальный образ наилучшего исхода.

Инструкция:
1. Предложи подростку сделать визуализацию «Идеальный день» или ответь на «Чудо-вопрос» (например: «Представь свой рабочий день через 2-3 года, когда цель достигнута. Что ты видишь вокруг? Кто рядом с тобой? С чего начинается твое утро?»).
2. Попроси описать 3-5 конкретных деталей этого образа.
3. Будь краток (до 3 предложений), пиши тепло и поддерживающе.`;
      } else if (finalNextStep === 12) {
        systemPrompt = `Ты — Роман, мудрый, поддерживающий коуч и наставник подростков на платформе «МоёПризвание».
Мы находимся на Шаге 3 коуч-схемы: «Какие эмоции? (Эмоциональный отклик)».
Твоя цель: соединить созданный образ результата с телесной эмоцией собеседника.

Инструкция:
1. Спроси: «Что ты чувствуешь в теле, когда представляешь этот идеальный результат? Какая это эмоция?».
2. Помоги ему назвать точную эмоцию по колесу Плутчика (вдохновение, азарт, гордость, радость, интерес).
3. Будь краток (до 3 предложений), пиши тепло и эмпатично.`;
      } else if (finalNextStep === 13) {
        systemPrompt = `Ты — Роман, мудрый, поддерживающий коуч и наставник подростков на платформе «МоёПризвание».
Мы находимся на Шаге 4 коуч-схемы: «Кто я? (Идентичность)».
Твоя цель: помочь подростку совершить сдвиг на уровень идентичности по Дилтсу.

Инструкция:
1. Помоги составить Манифест Идентичности. Спроси: «Кто тот человек, у которого этот результат — обычное дело? Заверши фразу: "Я — человек, который..."».
2. Подскажи ролевые модели, если подростку сложно определиться.
3. Будь краток (до 3 предложений).`;
      } else if (finalNextStep === 14) {
        systemPrompt = `Ты — Роман, мудрый, поддерживающий коуч и наставник подростков на платформе «МоёПризвание».
Мы находимся на Шаге 5 коуч-схемы: «Как достигну? (Действия, KPI, Навыки)».
Твоя цель: перевести идентичность в план действий на 90 дней.

Инструкция:
1. Помоги подростку декомпозировать цель: «Какие 3 ключевых действия тебе нужно регулярно совершать? Какие 2 навыка нужно прокачать? Как мы измерим прогресс (KPI)?».
2. Будь краток, структурируй беседу, задавай один вопрос за раз.`;
      } else if (finalNextStep === 15) {
        systemPrompt = `Ты — Роман, мудрый, поддерживающий коуч и наставник подростков на платформе «МоёПризвание».
Мы находимся на Шаге 6 коуч-схемы: «С чего начать? (Первый шаг)».
Твоя цель: зафиксировать первое микро-действие.

Инструкция:
1. Используй «Правило 2 минут»: предложи найти одно простое действие, которое можно сделать уже сегодня или завтра (например, сохранить ссылку, подписаться на профильный канал, изучить сайт вуза).
2. Спроси: «Готов сделать этот первый шаг прямо сейчас?».
3. Будь краток (до 3 предложений).`;
      }
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
    const useAI = (currentVirtualStep >= 3 && currentVirtualStep <= 15) || currentVirtualStep === 16;

    if (!useAI) {
      if (currentVirtualStep === 0) {
        replyContent = FALLBACK_REPLIES[0];
      } else if (currentVirtualStep === 1) {
        replyContent = FALLBACK_REPLIES[1];
      } else if (currentVirtualStep === 2) {
        if (!hasPhone) {
          replyContent = FALLBACK_REPLIES[2];
        } else {
          const name = extractedData.fullName || 'друг';
          if (!hasAge) {
            replyContent = `Спасибо за выбор канала! 😉 ${name}, сколько тебе лет?`;
          } else if (!hasGrade) {
            if (extractedData.age && extractedData.age > 18) {
              replyContent = "Ты уже закончил школу или учишься в вузе/работаешь? Расскажи подробнее.";
            } else {
              replyContent = "В каком классе ты учишься?";
            }
          } else if (!hasCity) {
            replyContent = "И из какого ты города?";
          } else {
            replyContent = "Отлично, все данные собраны! 😉";
          }
        }
      }
    } else {
      try {
        replyContent = await generateText(systemPrompt, transcript, 0.7);
      } catch (err) {
        console.warn('AI chat generation failed, using fallback:', err);
        replyContent = FALLBACK_REPLIES[currentVirtualStep] || 'Давай продолжим наш диалог!';
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
    const coachMsg = { role: 'assistant', content: replyContent, timestamp: new Date().toISOString() };
    if (isDeepMode) {
      deepTranscript.push(coachMsg);
      if (currentVirtualStep <= 2) {
        expressTranscript.push(coachMsg);
      }
    } else {
      expressTranscript.push(coachMsg);
      if (currentVirtualStep <= 2) {
        deepTranscript.push(coachMsg);
      }
    }

    const finalDbTranscript = {
      EXPRESS: expressTranscript,
      DEEP: deepTranscript
    };

    // Сохраняем обновленную сессию в БД
    await prisma.coachSession.update({
      where: { id: coachSession.id },
      data: {
        transcript: finalDbTranscript,
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
      extracted: extractedData,
      history: isDeepMode ? deepTranscript : expressTranscript
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
  } else if (currentStep === 2) {
    // 2. Извлечение возраста и класса
    if (!hasAgeOrGrade) {
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
    if (!hasCity) {
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
