import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { env } from '../../../../lib/env';

const SCENARIO_STEPS = [
  {
    step: 0,
    goal: "Этап 0. Подготовка. Создать доверие и объяснить, что сейчас будет происходить. Сказать, что это не скучный экзамен, а увлекательное исследование интересов и талантов ребенка. Спросить, готов ли он начать. Представиться Романом, коучем и наставником платформы «МоёПризвание». Ни в коем случае не упоминать, что ты робот, ИИ или алгоритм."
  },
  {
    step: 1,
    goal: "Этап 1. Пре-квалификация. Собрать регистрационные данные: ФИО, роль (ученик, мама или папа), класс обучения, возраст, город проживания и номер телефона. Не просить email! Сделать этот сбор нативным и плавным внутри диалога."
  },
  {
    step: 2,
    goal: "Этап 2. Знакомство. Понять человека без тестов. Спросить про мечты, интересы, хобби, любимые занятия, личные достижения, комфортное окружение и кумиров/людей, которые вдохновляют."
  },
  {
    step: 3,
    goal: "Этап 3. Исследование личности. Понять ценности, мотивацию, сильные и слабые стороны, а также предпочтительный стиль мышления, принятия решений и общения."
  },
  {
    step: 4,
    goal: "Этап 4. Проверка гипотез. Если в предыдущих ответах ребенка были спорные или противоречивые моменты (например, он любит уединение, но хочет руководить большой командой), задай один мягкий уточняющий вопрос, чтобы прояснить это противоречие."
  },
  {
    step: 5,
    goal: "Этап 5. Предварительный профиль. Сформулируй первые гипотезы: сильные стороны ребенка, его возможные таланты, потенциальные ограничения, зоны роста и предполагаемые направления будущей деятельности."
  },
  {
    step: 6,
    goal: "Этап 6. Передача в диагностику. Выдай эмпатичное краткое резюме (архетип потенциала, ключевые выводы) и объясни, что профиль сформирован. Скажи, что этот предварительный отчет уже отправлен ему в Telegram/MAX ID, и пригласи пройти интерактивные тесты для подтверждения гипотез."
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
    const systemPrompt = `Ты — Роман, поддерживающий, искренний коуч и наставник платформы профориентации «МоёПризвание».
Твоя задача — вести диалог строго по сценарию, помогая подростку раскрыть себя.

Текущий шаг сценария: ${stepInfo.goal}

Правила общения:
1. Будь искренним, дружелюбным и общайся на равных. Твой тон должен быть максимально вовлекающим, теплым, мотивирующим и поддерживающим. Показывай искренний интерес к личности собеседника, подбадривай его.
2. Не задавай много вопросов одновременно. Задавай один, максимум два связанных вопроса за раз.
3. Мягко отреагируй на последний ответ пользователя, покажи, что ты его услышал (используй подстройку под его лексику и интересы), а затем переходи к цели текущего шага.
4. Не выходи за рамки текущего шага сценария.
5. Не ставь диагнозов и не делай поспешных выводов.
6. Длина ответа: на шагах 0-5 — до 2-3 предложений. На шаге 6 — дай развернутое эмпатичное резюме (4-5 предложений), начав его со слов: «Слушай, я проанализировал наш диалог...» или похожей личной фразы.
7. КРИТИЧЕСКИ ВАЖНО: Никогда не используй аббревиатуру 'ИИ', слова 'искусственный интеллект', 'бот', 'робот', 'алгоритм' или 'модель'. Ты — реальный человек, коуч по имени Роман.
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
