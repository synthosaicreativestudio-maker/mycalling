// API Route — Server Side Only (НЕ ставить "use client" — это ломает серверные модули!)

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import prisma from '../../../../lib/prisma';
import { env } from '../../../../lib/env';
import { auth } from '../../../../lib/auth';

const SCENARIO_STEPS = [
  {
    step: 0,
    goal: "Этап 0. Подготовка. Создать доверие и объяснить, что сейчас будет происходить. Сказать, что это не скучный экзамен, а увлекательное исследование интересов и талантов ребенка. Спросить, готов ли он начать. Представиться Романом, коучем и наставником платформы «МоёПризвание». Ни в коем случае не упоминать, что ты робот, ИИ или алгоритм."
  },
  {
    step: 1,
    goal: "Этап 1. Имя и возраст. Спросить подростка, как его зовут (если имя еще не известно) и сколько ему лет. Начать мягкое знакомство."
  },
  {
    step: 2,
    goal: "Этап 2. Подключение канала связи. Предложить подростку подключить Telegram или MAX ID в качестве канала для сохранения результатов и отправки отчета. Если пользователь предпочитает продолжить прямо здесь, он может написать свой номер телефона."
  },
  {
    step: 3,
    goal: "Этап 3. Класс, город и интересы. Узнать, в каком городе живет подросток и в каком классе учится. Мягко спросить о его мечтах, любимых предметах или о том, чем ему нравится заниматься в свободное время."
  },
  {
    step: 4,
    goal: "Этап 4. Ценности и мотивация. Понять ценности, мотивацию, сильные стороны, ценные направления (творчество, руководство, зарплата, помощь людям) и дела, которые получаются легче всего."
  },
  {
    step: 5,
    goal: "Этап 5. Проверка гипотез. Задать один четкий вопрос о том, как ребенок принимает решения: долго взвешивает за и против по логике и фактам, или больше доверяет чувствам и интуиции."
  },
  {
    step: 6,
    goal: "Этап 6. Передача в диагностику. Выдай эмпатичное краткое резюме (архетип потенциала, ключевые выводы) и объяснить, что профиль сформирован. Предложить скачать предварительный отчет в формате PDF, сказать, что отчет также отправлен в Telegram/MAX ID, и пригласить пройти интерактивные тесты."
  }
];

const FALLBACK_REPLIES: Record<number, string> = {
  0: "Привет! Рад встрече. Меня зовут Роман, я твой коуч и наставник на платформе «МоёПризвание». Сегодня мы проведем увлекательное исследование твоих талантов, сильных сторон и интересов. Это не скучный экзамен, а дружеский диалог. Скажи, готов ли ты начать?",
  1: "Супер! Теперь давай познакомимся поближе. Расскажи, пожалуйста, как тебя зовут и сколько тебе лет?",
  2: "Приятно познакомиться! А давай выберем удобный способ связи, чтобы я мог присылать тебе итоговый отчет и рекомендации? Проще всего подключить Telegram или MAX ID (результаты сразу сохранятся). Либо просто напиши свой номер телефона прямо здесь, если хочешь продолжить без мессенджера.",
  3: "Очень приятно! А в каком городе ты живешь и в каком классе учишься? Расскажи также, какие предметы в школе тебе нравятся больше всего и чем любишь заниматься в свободное время?",
  4: "Интересно! А теперь давай заглянем чуть глубже. Что для тебя ценнее всего в будущей работе — например, свобода творчества, хорошая зарплата, возможность руководить или помогать людям? И как ты думаешь, какие дела получаются у тебя легче всего?",
  5: "Понял тебя. Ты упомянул очень важные вещи. Давай уточню один момент: когда перед тобой стоит сложный выбор, ты обычно долго взвешиваешь все за и против на основе логики и фактов, или больше доверяет внутреннему голосу и чувствам?",
  6: "Слушай, я проанализировал наш диалог. В тебе чувствуется сильный аналитический склад ума и стремление к автономии. Ты прирожденный Исследователь! Твои сильные стороны — логика и упорство. Ты можешь скачать предварительный отчет в формате PDF прямо сейчас. Теперь давай закрепим результаты интерактивными тестами!"
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
🎯 *Шаг сессии:* ${data.currentStep || 0} из 6

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

export async function POST(req: Request) {
  try {
    const { message, sessionId, fromLoginError } = await req.json();

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

    if (session && session.user) {
      userId = session.user.id;
      coachSession = await prisma.coachSession.findUnique({
        where: { userId },
        include: { user: true }
      });
    }

    // Если нет авторизованного пользователя, ищем по переданному sessionId
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
    let extractedData = (coachSession.extractedData as Record<string, any>) || { currentStep: 0 };
    let currentStep = typeof extractedData.currentStep === 'number' ? extractedData.currentStep : 0;

    // Если у пользователя уже привязан телефон (например, он зашел под существующей учетной записью)
    // и он находится на шаге 2 (подключение канала связи), то автоматически перескакиваем на шаг 3 (город и класс)
    if (coachSession.user.phone && currentStep === 2) {
      currentStep = 3;
      extractedData.currentStep = 3;
      await prisma.coachSession.update({
        where: { id: coachSession.id },
        data: { extractedData }
      });
    }

    // Флаг того, что это первое инициализирующее сообщение
    const isInitMessage = message === 'Начать сессию с коучем';

    if (isInitMessage && transcript.length > 0) {
      return NextResponse.json({
        history: transcript,
        sessionId: coachSession.id,
        userId: coachSession.userId,
        currentStep: currentStep,
        phoneConfirmed: !!coachSession.user.phone,
        sessionStatus: coachSession.status,
        extracted: {}
      });
    }

    // Если это первое сообщение — сразу возвращаем фиксированную фразу без обращения к ИИ
    if (isInitMessage && transcript.length === 0) {
      let greeting = FALLBACK_REPLIES[0];
      if (fromLoginError) {
        greeting = 'Привет! Рад встрече. Меня зовут Роман, я твой коуч и наставник. Я вижу, ты хотел зайти в Личный кабинет, но для этого нужно сначала пройти нашу короткую сессию. Не переживай — это не скучный тест, а увлекательное исследование твоих талантов. Готов начать?';
      }
      transcript.push({ role: 'assistant', content: greeting, timestamp: new Date().toISOString() });
      await prisma.coachSession.update({
        where: { id: coachSession.id },
        data: { transcript, extractedData }
      });
      return NextResponse.json({
        reply: greeting,
        sessionId: coachSession.id,
        userId: coachSession.userId,
        currentStep: 0,
        sessionStatus: coachSession.status,
        extracted: {}
      });
    }

    let userMsgContent = message;

    // Добавляем сообщение пользователя в транскрипт
    if (!isInitMessage) {
      transcript.push({ role: 'user', content: userMsgContent, timestamp: new Date().toISOString() });
    }

    let nextStep = currentStep;
    let parsedData: Record<string, any> = { shouldAdvanceStep: true };

    // ==========================================
    // ЭТАП ЭКСТРАКЦИИ (происходит на лету в одном запросе)
    // ==========================================
    const isPhoneConfirmedMsg = message === 'Телефон подтвержден через бот';

    if (!isInitMessage && currentStep < 6 && isPhoneConfirmedMsg) {
      parsedData = { shouldAdvanceStep: true };
      nextStep = 3; // Телефон подтверждён через бота — пропускаем шаг 2 (канал связи), идём на шаг 3
      extractedData.currentStep = nextStep;
      
      const dbUser = await prisma.user.findUnique({ where: { id: coachSession.userId } });
      if (dbUser) {
        extractedData.fullName = dbUser.name;
        extractedData.phone = dbUser.phone;
      }
    } else if (!isInitMessage && currentStep < 6) {
      const extractionPrompt = `Ты — анализатор текста. Проанализируй сообщение пользователя и текущий шаг сценария нейрокоуча.
Извлеки структурированные данные.

Текущий шаг сценария: ${currentStep}
Последнее сообщение пользователя: "${message}"

Инструкции по извлечению:
1. Если пользователь назвал имя/ФИО, извлеки в 'fullName'.
2. Если указал роль (ученик/мама/папа), извлеки в 'role'.
3. Если указал класс обучения, извлеки в 'grade' (число).
4. Если указал возраст, извлеки в 'age' (число).
5. Если указал город проживания, извлеки в 'city' (строка).
6. Если есть телефон, извлеки в 'phone'.
7. На шаге 2 извлеки: мечты в 'dreams', интересы в 'interests', достижения в 'achievements', кумиров в 'idols'.
8. На шаге 3 извлеки: ценности в 'values', мотивацию в 'motivation', сильные стороны в 'strengths', слабые стороны в 'weaknesses', стиль мышления в 'cognitiveStyle', стиль принятия решений в 'decisionStyle', стиль общения in 'communicationStyle'.
9. На шагах 4-5 извлеки: предварительные гипотезы в 'hypotheses'.
10. Оцени, ответил ли пользователь на вопрос коуча текущего шага. Если ответ содержательный, то 'shouldAdvanceStep' = true.

Ответь СТРОГО в формате JSON без markdown-разметки:
{
  "fullName": string | null,
  "role": "STUDENT" | "PARENT" | null,
  "grade": number | null,
  "age": number | null,
  "city": string | null,
  "phone": string | null,
  "dreams": string | null,
  "interests": string | null,
  "achievements": string | null,
  "idols": string | null,
  "values": string | null,
  "motivation": string | null,
  "strengths": string | null,
  "weaknesses": string | null,
  "cognitiveStyle": string | null,
  "decisionStyle": string | null,
  "communicationStyle": string | null,
  "hypotheses": string | null,
  "shouldAdvanceStep": boolean
}`;

      try {
        const aiResponse = await fetch(env.PROXYAPI_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.PROXYAPI_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: 'Ты возвращаешь только валидный JSON.' },
              { role: 'user', content: extractionPrompt }
            ],
            temperature: 0.1
          })
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          parsedData = JSON.parse(aiData.choices?.[0]?.message?.content || '{}');
        } else {
          throw new Error(`ProxyAPI returned status ${aiResponse.status}`);
        }
      } catch (err) {
        console.warn('ProxyAPI extraction failed in chat route, using fallback:', err);
        // Регулярные выражения для fallback
        if (currentStep === 1) {
          const phoneMatch = message.match(/(?:\+7|8)[\s-]?\(?\d{3}\)?[\s-]?\d{3}\s?[-]?\d{2}\s?[-]?\d{2}/);
          if (phoneMatch) parsedData.phone = phoneMatch[0];
          
          const words = message.split(/\s+/).filter((w: string) => w.length > 2);
          if (words.length > 0 && !message.includes('привет') && !message.includes('готов')) {
            parsedData.fullName = words.slice(0, 3).join(' ');
          }
        }
      }

      // Объединяем качественные данные
      if (parsedData.fullName) extractedData.fullName = parsedData.fullName;
      if (parsedData.role) extractedData.role = parsedData.role;
      if (parsedData.grade) extractedData.grade = parsedData.grade;
      if (parsedData.age) extractedData.age = parsedData.age;
      if (parsedData.city) extractedData.city = parsedData.city;
      if (parsedData.dreams) extractedData.dreams = (extractedData.dreams ? extractedData.dreams + '; ' : '') + parsedData.dreams;
      if (parsedData.interests) extractedData.interests = (extractedData.interests ? extractedData.interests + '; ' : '') + parsedData.interests;
      if (parsedData.achievements) extractedData.achievements = (extractedData.achievements ? extractedData.achievements + '; ' : '') + parsedData.achievements;
      if (parsedData.idols) extractedData.idols = (extractedData.idols ? extractedData.idols + '; ' : '') + parsedData.idols;
      if (parsedData.values) extractedData.values = (extractedData.values ? extractedData.values + '; ' : '') + parsedData.values;
      if (parsedData.motivation) extractedData.motivation = (extractedData.motivation ? extractedData.motivation + '; ' : '') + parsedData.motivation;
      if (parsedData.strengths) extractedData.strengths = (extractedData.strengths ? extractedData.strengths + '; ' : '') + parsedData.strengths;
      if (parsedData.weaknesses) extractedData.weaknesses = (extractedData.weaknesses ? extractedData.weaknesses + '; ' : '') + parsedData.weaknesses;
      if (parsedData.cognitiveStyle) extractedData.cognitiveStyle = (extractedData.cognitiveStyle ? extractedData.cognitiveStyle + '; ' : '') + parsedData.cognitiveStyle;
      if (parsedData.decisionStyle) extractedData.decisionStyle = (extractedData.decisionStyle ? extractedData.decisionStyle + '; ' : '') + parsedData.decisionStyle;
      if (parsedData.communicationStyle) extractedData.communicationStyle = (extractedData.communicationStyle ? extractedData.communicationStyle + '; ' : '') + parsedData.communicationStyle;
      if (parsedData.hypotheses) extractedData.hypotheses = (extractedData.hypotheses ? extractedData.hypotheses + '; ' : '') + parsedData.hypotheses;

      // Продвигаем шаг
      if (parsedData.shouldAdvanceStep && currentStep < 6) {
        nextStep = currentStep + 1;
        extractedData.currentStep = nextStep;
      }

      // Обновляем пользователя при нативной регистрации
      const userUpdateData: Record<string, any> = {};
      if (parsedData.fullName && parsedData.fullName !== coachSession.user.name) {
        userUpdateData.name = parsedData.fullName;
        userUpdateData.fullName = parsedData.fullName;
      }
      if (parsedData.role) {
        userUpdateData.role = parsedData.role;
      }
      if (parsedData.phone && parsedData.phone !== coachSession.user.phone) {
        const existingUser = await prisma.user.findUnique({ where: { phone: parsedData.phone } });
        if (!existingUser) {
          userUpdateData.phone = parsedData.phone;
        }
      }
      if (Object.keys(userUpdateData).length > 0) {
        await prisma.user.update({
          where: { id: coachSession.userId },
          data: userUpdateData
        });
      }
    }

    // ==========================================
    // ЭТАП ГЕНЕРАЦИИ ОТВЕТА КОУЧА РОМАНА
    // ==========================================
    const stepInfo = SCENARIO_STEPS[nextStep] || SCENARIO_STEPS[SCENARIO_STEPS.length - 1];

    const systemPrompt = `Ты — Роман, поддерживающий, искренний коуч и наставник платформы профориентации «МоёПризвание».
Твоя задача — вести диалог строго по сценарию, помогая подростку раскрыть себя.

Текущий шаг сценария: ${stepInfo.goal}

Правила общения:
1. Будь искренним, дружелюбным и общайся на равных. Твой тон должен быть максимально вовлекающим, теплым, мотивирующим и поддерживающим.
2. Не задавай много вопросов одновременно. Задавай ровно один глубокий или два тесно связанных вопроса за раз.
3. Мягко отреагируй на последний ответ пользователя, покажи, что ты его услышал, а затем переходи к цели текущего шага.
4. Не выходи за рамки текущего шага сценария.
5. Не ставь диагнозов и не делай поспешных выводов.
6. Длина ответа: на шагах 0-5 — до 2-3 предложений. На шаге 6 — дай развернутое эмпатичное резюме (4-5 предложений), начав его со слов: «Слушай, я проанализировал наш диалог...» или похожей личной фразы.
7. КРИТИЧЕСКИ ВАЖНО: Никогда не используй аббревиатуру 'ИИ', слова 'искусственный интеллект', 'робот', 'бот' или 'алгоритм'. Ты — реальный человек, коуч по имени Роман.
8. НИКОГДА не повторяй вопрос пользователя обратно ему. Если ответ недостаточно подробный — уточни одним конкретным наводящим вопросом, а не перефразируй то, что сказал пользователь.
9. Если пользователь ответил кратко или неопределённо, прими его ответ и мягко уточни. Если ответ содержательный, признай его и двигайся к цели шага.
`;

    const modelMessages = [
      { role: 'system', content: systemPrompt },
      ...transcript.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
    ];

    let replyContent = '';
    try {
      const aiResponse = await fetch(env.PROXYAPI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.PROXYAPI_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: modelMessages,
          temperature: 0.7,
          max_tokens: 300
        })
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        replyContent = aiData.choices?.[0]?.message?.content || '';
      } else {
        throw new Error(`ProxyAPI returned status ${aiResponse.status}`);
      }
    } catch (err) {
      console.warn('ProxyAPI chat generation failed, using fallback:', err);
      replyContent = FALLBACK_REPLIES[nextStep] || 'Давай продолжим наш диалог!';
    }

    // Сохраняем предварительное резюме в БД на шаге 6
    let completedAt = coachSession.completedAt;
    let status = coachSession.status;
    if (nextStep === 6 && status !== 'COMPLETED') {
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
    if (dbUser && (parsedData.phone || nextStep === 6)) {
      // Уведомление администратору
      sendTelegramNotification(dbUser, extractedData).catch(err => console.error(err));
      // Синхронизация в CRM
      sendMaxIdSync(dbUser, extractedData).catch(err => console.error(err));
    }
    // На шаге 6 — отправляем резюме пользователю лично в боты
    if (dbUser && nextStep === 6) {
      sendTelegramReportToUser(dbUser, extractedData).catch(err => console.error(err));
      sendMaxReportToUser(dbUser, extractedData).catch(err => console.error(err));
    }

    return NextResponse.json({
      reply: replyContent,
      sessionId: coachSession.id,
      currentStep: nextStep,
      sessionStatus: status,
      extracted: parsedData
    });

  } catch (error: any) {
    console.error('Error in coach chat route:', error);
    return NextResponse.json({ error: error.message || 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
