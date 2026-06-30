import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { env } from '../../../../lib/env';

const SCENARIO_STEPS = [
  {
    step: 0,
    goal: "Приветствие и знакомство. Установить теплый, поддерживающий контакт. Спросить имя собеседника и его роль (ученик или родитель). Представиться как нейрокоуч платформы «МоёПризвание»."
  },
  {
    step: 1,
    goal: "Сбор контактов. Мягко попросить email и номер телефона, объяснив, что это нужно для создания личного кабинета и отправки итогового отчета. Не давить, писать дружелюбно."
  },
  {
    step: 2,
    goal: "Жизненный контекст. Спросить про школу, класс, какие предметы нравятся, а какие вызывают скуку. Узнать про поддержку близких."
  },
  {
    step: 3,
    goal: "Мечты, цели и увлечения. Спросить, чем нравится заниматься в свободное время (хобби, проекты, игры). О какой работе или будущем мечтает."
  },
  {
    step: 4,
    goal: "Кумиры и ролевые модели. Выяснить, кто вдохновляет (блогеры, ученые, персонажи книг/фильмов/игр) и почему."
  },
  {
    step: 5,
    goal: "Ценности и ограничения. Выяснить, что важнее всего в будущей работе (деньги, свобода, творчество, помощь людям). Есть ли страхи или давление со стороны."
  },
  {
    step: 6,
    goal: "Завершение диалога. Подвести вдохновляющий итог, сказать, что профиль сформирован и теперь время пройти интерактивную диагностику (тесты)."
  }
];

export async function POST(req: Request) {
  try {
    const { message, sessionId } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Сообщение пользователя не передано' }, { status: 400 });
    }

    // 1. Поиск или создание сессии коуча
    let coachSession = null;
    let userId = null;

    if (sessionId) {
      coachSession = await prisma.coachSession.findUnique({
        where: { id: sessionId },
        include: { user: true }
      });
    }

    if (!coachSession) {
      // Создаем гостевого пользователя
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

    const transcript = coachSession.transcript as any[] || [];
    const extractedData = (coachSession.extractedData as Record<string, any>) || { currentStep: 0 };
    const currentStep = typeof extractedData.currentStep === 'number' ? extractedData.currentStep : 0;

    // Добавляем сообщение пользователя в транскрипт
    transcript.push({ role: 'user', content: message, timestamp: new Date().toISOString() });

    const stepInfo = SCENARIO_STEPS[currentStep] || SCENARIO_STEPS[SCENARIO_STEPS.length - 1];

    // Формируем системный промпт
    const systemPrompt = `Ты — поддерживающий и чуткий нейрокоуч платформы профориентации «МоёПризвание».
Твоя задача — вести диалог строго по сценарию, помогая подростку раскрыть себя.

Текущий шаг сценария: ${stepInfo.goal}

Правила общения:
1. Будь дружелюбным, общайся на равных, но уважительно. Твой тон должен быть мягким, эмпатичным и поддерживающим.
2. Не задавай много вопросов одновременно. Задавай один, максимум два связанных вопроса за раз.
3. Мягко отреагируй на последний ответ пользователя, покажи, что ты его услышал, а затем переходи к цели текущего шага.
4. Не выходи за рамки текущего шага сценария.
5. Не ставь диагнозов и не делай поспешных выводов.
6. Длина твоего ответа не должна превышать 2-3 предложения. Избегай длинных монологов.
7. КРИТИЧЕСКИ ВАЖНО: Никогда не используй аббревиатуру 'ИИ' или слова 'искусственный интеллект' в диалоге.
`;

    // 2. Вызов ProxyAPI (OpenAI-совместимый)
    const apiKey = env.PROXYAPI_KEY;
    const apiUrl = env.PROXYAPI_URL;

    // Формируем историю для модели
    const modelMessages = [
      { role: 'system', content: systemPrompt },
      ...transcript.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
    ];

    const aiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: modelMessages,
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('ProxyAPI Error:', errorText);
      throw new Error(`ProxyAPI returned status ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const replyContent = aiData.choices?.[0]?.message?.content || 'Извини, я отвлекся. Повтори, пожалуйста.';

    // Добавляем ответ коуча в транскрипт
    transcript.push({ role: 'assistant', content: replyContent, timestamp: new Date().toISOString() });

    // Сохраняем сессию
    await prisma.coachSession.update({
      where: { id: coachSession.id },
      data: { transcript }
    });

    return NextResponse.json({
      reply: replyContent,
      sessionId: coachSession.id,
      currentStep
    });

  } catch (error: any) {
    console.error('Error in coach chat route:', error);
    return NextResponse.json({ error: error.message || 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
