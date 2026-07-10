// API Route — Server Side Only (НЕ ставить "use client" — это ломает серверные модули!)

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '../../../../lib/prisma';
import { auth } from '../../../../lib/auth';
import { generateText, generateJson } from '../../../../lib/gemini';

const FALLBACK_REPLIES: Record<number, string> = {
  0: "Привет! Рад встрече. Меня зовут Роман, я твой коуч и наставник на платформе «МоёПризвание». Сегодня мы проведем увлекательное исследование твоих талантов, сильных сторон и интересов. Это не скучный экзамен, а дружеский диалог. Скажи, готов ли ты начать?",
  1: "Супер! Теперь давай познакомимся поближе. Напиши, пожалуйста, как тебя зовут, в каком классе ты учишься, сколько тебе лет и из какого ты города?",
  2: "Приятно познакомиться! А теперь выбери удобный канал связи ниже, чтобы результаты не потерялись, и мы сможем продолжить!",
  3: "Здорово, спасибо, что поделился! Давай начнем с мечты: если убрать вообще все ограничения, кем бы ты хотел быть через 10 лет?",
  4: "Интересно! А скажи, кто из известных людей, блогеров, ученых или персонажей фильмов тебя по-настоящему вдохновляет? Какие черты характера или дела в них тебе нравятся больше всего?",
  5: "Понял тебя. Давай подумаем о будущем: что для тебя ценнее всего в твоей работе? Например, создавать новое и творить, руководить и вести людей за собой, зарабатывать много денег или помогать другим?",
  6: "Ясно! А как ты обычно принимаешь важные решения: садишься и долго взвешиваешь факты и логику, или больше полагаешься на интуицию и внутренний голос?",
  7: "Слушай, я проанализировал наш диалог. Ты отлично раскрылся! Ты можешь скачать предварительный отчет в формате PDF прямо сейчас. Теперь давай закрепим результаты интерактивными тестами!"
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
    const hasDreams = !!extractedData.dreams && extractedData.dreams.trim().length > 6;
    const hasIdols = !!extractedData.idols && extractedData.idols.trim().length > 6;
    const hasValues = !!extractedData.values && extractedData.values.trim().length > 6;
    const hasDecisionStyle = !!extractedData.decisionStyle && extractedData.decisionStyle.trim().length > 6;

    // Считаем прогресс по содержательным блокам
    let blocksCompleted = 0;
    if (hasPersonalInfo) blocksCompleted++;
    if (hasPhone) blocksCompleted++;
    if (hasDreams) blocksCompleted++;
    if (hasIdols) blocksCompleted++;
    if (hasValues) blocksCompleted++;
    if (hasDecisionStyle) blocksCompleted++;

    // Вычисляем виртуальный шаг до экстракции
    let currentStepBefore = 1;
    if (!hasPersonalInfo) {
      currentStepBefore = 1;
    } else if (!hasPhone) {
      currentStepBefore = 2;
    } else {
      let psychoBlocksBefore = 0;
      if (hasDreams) psychoBlocksBefore++;
      if (hasIdols) psychoBlocksBefore++;
      if (hasValues) psychoBlocksBefore++;
      if (hasDecisionStyle) psychoBlocksBefore++;
      currentStepBefore = Math.min(5, 3 + psychoBlocksBefore);
    }

    // Все содержательные психологические блоки должны быть обязательно собраны
    const allPsychologyCollected = hasPersonalInfo && hasDreams && hasIdols && hasValues && hasDecisionStyle;
    
    // Сессия считается готовой к финалу, если собраны ключевые психологические параметры
    const isFinalStep = allPsychologyCollected;
    const nextStep = isFinalStep ? 6 : Math.min(5, blocksCompleted);
    extractedData.currentStep = nextStep;

    // Флаг того, что это первое инициализирующее сообщение
    const isInitMessage = message === 'Начать сессию с коучем';

    if (isInitMessage && transcript.length > 0) {
      return NextResponse.json({
        history: transcript,
        sessionId: coachSession.id,
        userId: coachSession.userId,
        currentStep: nextStep,
        phoneConfirmed: hasPhone,
        sessionStatus: coachSession.status,
        extracted: {}
      });
    }

    // Если это самое первое сообщение — приветствуем и заключаем контракт (CLEAR / Внутренняя Игра)
    if (isInitMessage && transcript.length === 0) {
      let greeting = FALLBACK_REPLIES[0];
      if (fromLoginError) {
        greeting = 'Привет! Рад встрече. Меня зовут Роман, я твой коуч и наставник. Я вижу, ты хотел зайти в Личный кабинет, но для этого нужно сначала пройти нашу короткую сессию. Не переживай — это не скучный тест, а увлекательное исследование твоих талантов. Готов начать?';
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
        extracted: {}
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

      if (currentStepBefore === 1) {
        properties.fullName = { type: "STRING" };
        properties.age = { type: "INTEGER" };
        properties.grade = { type: "STRING" };
        properties.city = { type: "STRING" };
        fieldsToExtract += ", fullName, age, grade, city";
      } else if (currentStepBefore === 3) {
        properties.dreams = { type: "STRING" };
        fieldsToExtract += ", dreams";
      } else if (currentStepBefore === 4) {
        properties.idols = { type: "STRING" };
        fieldsToExtract += ", idols";
      } else if (currentStepBefore === 5) {
        properties.values = { type: "STRING" };
        properties.decisionStyle = { type: "STRING" };
        fieldsToExtract += ", values, decisionStyle";
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
      if (parsedData.dreams) extractedData.dreams = (extractedData.dreams ? extractedData.dreams + '; ' : '') + parsedData.dreams;
      if (parsedData.idols) extractedData.idols = (extractedData.idols ? extractedData.idols + '; ' : '') + parsedData.idols;
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
    const updatedValues = !!extractedData.values && extractedData.values.trim().length > 6;
    const updatedDecisionStyle = !!extractedData.decisionStyle && extractedData.decisionStyle.trim().length > 6;

    // Считаем заполненные психологические блоки
    let psychoBlocks = 0;
    if (updatedDreams) psychoBlocks++;
    if (updatedIdols) psychoBlocks++;
    if (updatedValues) psychoBlocks++;
    if (updatedDecisionStyle) psychoBlocks++;

    // Расчет шага строго поэтапно
    let currentVirtualStep = 0;
    if (!updatedPersonalInfo) {
      currentVirtualStep = 1; // Шаг знакомства и личных данных
    } else if (!updatedPhone) {
      currentVirtualStep = 2; // Шаг выбора канала связи (Telegram / MAX ID)
    } else {
      // Шаги 3, 4, 5 в зависимости от заполненных психологических блоков
      currentVirtualStep = Math.min(5, 3 + psychoBlocks);
    }

    const isFinalStateNow = updatedPersonalInfo && updatedPhone && updatedDreams && updatedIdols && updatedValues && updatedDecisionStyle;
    if (isFinalStateNow && currentStepBefore === 5) {
      currentVirtualStep = 6; // Подведение итогов
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
    if (updatedDreams) {
      collectedFields.push(`- Мечты и образ будущего: ${extractedData.dreams}`);
    }
    if (updatedIdols) {
      collectedFields.push(`- Вдохновители и авторитеты: ${extractedData.idols}`);
    }
    if (updatedValues) {
      collectedFields.push(`- Ценности в работе: ${extractedData.values}`);
    }
    if (updatedDecisionStyle) {
      collectedFields.push(`- Способ принятия решений: ${extractedData.decisionStyle}`);
    }

    // Заполняем недостающие поля СТРОГО на основе текущего шага
    if (currentVirtualStep < 2) {
      missingFields.push("- Личные данные (Имя, возраст, город проживания). Спроси об этом мягко в рамках знакомства. Нам критически важно узнать это в самом начале.");
    } else if (currentVirtualStep === 2) {
      missingFields.push("- Подключение канала связи (Telegram или MAX ID). Предложи подростку выбрать удобный канал связи ниже (подключить Telegram или указать свой MAX ID), чтобы результаты не потерялись, и мы могли продолжить.");
    } else {
      // Шаг сбора психологии
      if (!updatedDreams) {
        missingFields.push("- Мечты и образ будущего: Кем подросток хочет быть через 10 лет без ограничений (методика WOOP / Внутренняя Игра Голви для снятия страхов и раскрытия амбиций).");
      }
      if (!updatedIdols) {
        missingFields.push("- Кумиры: Люди, блогеры, ученые или персонажи фильмов, которые вдохновляют, и какие качества в них привлекают подростка больше всего (проективная методика Strengths-Based coaching).");
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
2. Сделай акцент на его сильных сторонах, мечтах и ценностях, которые он упомянул (определи его архетип потенциала, например, Создатель, Исследователь, Лидер, Гуманист).
3. Объясни, что первичный профиль успешно сформирован, и предложи скачать отчет в формате PDF прямо в чате.
4. Пригласи подростка пройти короткие интерактивные тесты на платформе, чтобы дополнить картину его талантов.
НИКАКИХ новых вопросов в конце не задавай. Ты завершаешь сессию.`;
    } else if (currentVirtualStep === 1) {
      systemPrompt = `Ты — Роман, мудрый, поддерживающий коуч и наставник подростков на платформе «МоёПризвание».
Твоя цель на текущем этапе диалога — познакомимся с подростком и собрать его личные данные: имя, сколько лет/класс и город проживания.

Веди живой, дружеский, эмпатичный диалог:
1. Тепло реагируй на ответы подростка. Например, если он назвал свой город (например, Тюмень), искренне похвали его (например: «О, Тюмень — классный город, один из лучших в Сибири!» или «Круто, у вас там отличные набережная и термальные источники!»). Если он назвал свой класс (например, 8-й класс), подбодри его (например: «8-й класс — самое лучшее время, чтобы начать приглядываться к профессиям, и я тебе в этом помогу!»).
2. Спроси о недостающих данных, но делай это мягко и непринужденно в формате диалога на равных. Не устраивай допрос.
Недостающие данные:
${missingFields.join('\n')}

Уже известная информация о собеседнике:
${collectedFields.length > 0 ? collectedFields.join('\n') : '- Пока ничего не известно.'}

Критически важные правила общения:
- Задавай строго ОДИН простой вопрос за раз. Не перегружай подростка.
- Длина твоих реплик: до 3 предложений. Твоя речь должна быть живой, человечной, дружелюбной и понятной современному подростку.
- Категорически запрещено использовать слова «ИИ», «алгоритм», «бот», «робот». Ты — коуч Роман.`;
    } else {
      systemPrompt = `Ты — Роман, мудрый, поддерживающий коуч и наставник подростков на платформе «МоёПризвание».
Твоя цель — провести глубокую, качественную и профессиональную коуч-сессию с подростком, чтобы составить его первичный психологический и профориентационный портрет.

Ты опираешься на лучшие мировые методологии коучинга:
1. CLEAR (Хокинс):
   - Contract (Контракт): Создай безопасное, доверительное пространство на равных. Покажи, что здесь нет оценок или тестов на правильность.
   - Listen (Слушание): Демонстрируй глубокое эмпатичное слушание. В начале каждой реплики коротко, тепло отреагируй на то, что сказал подросток, покажи, что ты его услышал и понял.
   - Explore (Исследование): Раскрывай внутренний мир подростка через глубокие открытые вопросы.
2. Внутренняя Игра (Тимоти Голви):
   - Помоги подростку отключить внутреннего критика, страхи и сомнения. Убери барьеры вроде «у меня не получится» или «это нереально».
3. WOOP (Габриэль Эттинген):
   - Wish (Желание): Помоги сформулировать самую смелую профессиональную мечту.
   - Outcome (Результат): Узнай, как изменится его жизнь при ее достижении, что он будет чувствовать.
4. Strengths-Based Coaching (Коучинг сильных сторон):
   - Фокусируйся на сильных сторонах, уникальности и талантах подростка. Не пытайся «исправлять» слабости, ищи зоны максимального раскрытия потенциала.
   - Проективный метод: Спроси про людей, блогеров, персонажей книг или фильмов, которые его искренне вдохновляют, и какие именно их качества вызывают интерес. Это поможет вытащить его собственные скрытые ценности.

Уже известная информация о собеседнике:
${collectedFields.length > 0 ? collectedFields.join('\n') : '- Пока ничего не известно.'}

Что тебе ЕЩЕ нужно плавно и естественно узнать в ходе диалога (ВЫБЕРИ ОДНУ ТЕМУ из списка ниже и построй вокруг нее глубокий диалог. Не переходи к следующей теме, пока детально не раскроешь текущую):
${missingFields.join('\n')}

Критически важные правила общения:
- Задавай строго ОДИН вопрос за раз. Не перегружай подростка вопросами разной тематики.
- Не будь опросником! Вопросы должны естественно вытекать из контекста беседы.
- Если подросток дал короткий или поверхностный ответ, не бросай тему. Мягко уточни: «А почему именно это?», «Расскажи поподробнее, мне очень интересно!».
- Если подросток прислал точку, смайлик или уклонился от ответа (флаг: ${isRefusalOrEmpty}), мягко и с юмором обрати на это внимание (например: «Ой, вижу многоточие... 😊 Давай вернемся к нашему вопросу...») и попроси ответить по существу.
- Длина твоих реплик: до 3 предложений. Твоя речь должна быть живой, человечной, дружелюбной и понятной современному подростку.
- Категорически запрещено использовать слова «ИИ», «искусственный интеллект», «алгоритм», «бот», «робот». Ты — реальный человек, коуч Роман.`;
    }

    let replyContent = '';
    
    // Использовать ли ИИ-генерацию на текущем шаге
    const useAI = (currentVirtualStep === 1 && !isInitMessage) || currentVirtualStep >= 3;

    if (!useAI) {
      if (currentVirtualStep === 0) {
        replyContent = FALLBACK_REPLIES[0];
      } else if (currentVirtualStep === 1 && isInitMessage) {
        replyContent = FALLBACK_REPLIES[1];
      } else if (currentVirtualStep === 2) {
        replyContent = "Приятно познакомиться! А теперь выбери удобный канал связи ниже, чтобы результаты не потерялись, и мы сможем продолжить!";
        
        // Специальная заглушка на Шаге 2, если пользователь пишет обычный текст вместо клика по кнопкам или ввода MAX ID
        if (!isInitMessage && !updatedPhone) {
          replyContent = "Пожалуйста, выбери удобный канал связи ниже, чтобы результаты не потерялись! Как только подключишься, мы сразу продолжим. 😉";
        }
      }
    } else {
      try {
        replyContent = await generateText(systemPrompt, transcript, 0.7);
      } catch (err) {
        console.warn('AI chat generation failed, using fallback:', err);
        // Резервный пошаговый сбор личных данных или стандартные реплики
        if (currentVirtualStep === 1) {
          if (!hasName) {
            replyContent = "Супер! Давай сначала познакомимся. Как тебя зовут?";
          } else if (!hasAgeOrGrade) {
            const name = extractedData.fullName.split(' ')[0];
            replyContent = `Очень приятно, ${name}! А сколько тебе лет и в каком классе ты учишься?`;
          } else if (!hasCity) {
            replyContent = "Понял тебя. А из какого ты города?";
          } else {
            replyContent = FALLBACK_REPLIES[1];
          }
        } else {
          replyContent = FALLBACK_REPLIES[currentVirtualStep] || 'Давай продолжим наш диалог!';
        }
      }
    }

    if (isPhoneConfirmedMsg) {
      replyContent = "Отлично! Telegram-канал связи успешно подключен. " + replyContent;
    }

    // Сохраняем предварительное резюме в БД на шаге 6
    let completedAt = coachSession.completedAt;
    let status = coachSession.status;
    if (isFinalStateNow && status !== 'COMPLETED') {
      status = 'COMPLETED';
      completedAt = new Date();
      extractedData.preliminaryFeedback = replyContent;
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
      extracted: parsedData
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
