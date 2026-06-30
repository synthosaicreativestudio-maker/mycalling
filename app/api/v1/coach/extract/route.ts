import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { env } from '../../../../lib/env';

async function sendTelegramNotification(user: any, data: any) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || '8701463375:AAEQxV563Y7P5Anfm0tK1o1CvjmeC2TnEyg';
  const chatId = process.env.TELEGRAM_CHAT_ID || '148281488';
  
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
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      })
    });
  } catch (err) {
    console.error('Telegram notification error:', err);
  }
}

async function sendMaxIdSync(user: any, data: any) {
  const maxToken = process.env.MAXID_API_TOKEN || 'f9LHodD0cOI4k7V9yJ8Dt6RZr_Npx_O4odWmhZ6u_WhvysoYzESOZ3VlmBDBNCUVS2_Mu9cKiod6BYKcx-1L';
  
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
    console.log(`MAX ID sync status: ${res.status}`);
  } catch (err) {
    console.error('MAX ID sync error:', err);
  }
}

export async function POST(req: Request) {
  try {
    const { sessionId, lastUserMessage } = await req.json();

    if (!sessionId || !lastUserMessage) {
      return NextResponse.json({ error: 'Недостаточно данных для извлечения' }, { status: 400 });
    }

    const coachSession = await prisma.coachSession.findUnique({
      where: { id: sessionId },
      include: { user: true }
    });

    if (!coachSession) {
      return NextResponse.json({ error: 'Сессия не найдена' }, { status: 404 });
    }

    const extractedData = (coachSession.extractedData as Record<string, any>) || { currentStep: 0 };
    const currentStep = typeof extractedData.currentStep === 'number' ? extractedData.currentStep : 0;

    // Промпт для извлечения структурированных данных (без почты, с учетом новой методологии)
    const extractionPrompt = `Ты — анализатор текста. Проанализируй сообщение пользователя и текущий шаг сценария нейрокоуча.
Извлеки структурированные данные.

Текущий шаг сценария: ${currentStep}
Последнее сообщение пользователя: "${lastUserMessage}"

Инструкции по извлечению:
1. Если пользователь назвал свое имя/ФИО, извлеки в 'fullName'.
2. Если пользователь указал роль (ученик, школьник, подросток — STUDENT; мама, папа, родитель — PARENT), извлеки в 'role'.
3. Если указал класс обучения, извлеки в 'grade' (число).
4. Если указал возраст, извлеки в 'age' (число).
5. Если указал город проживания, извлеки в 'city' (строка).
6. Если есть телефон, извлеки в 'phone'.
7. На шаге 2 извлеки: мечты в 'dreams', интересы в 'interests', личные достижения в 'achievements', кумиров в 'idols'.
8. На шаге 3 извлеки: ценности в 'values', мотивацию в 'motivation', сильные стороны в 'strengths', слабые стороны в 'weaknesses', стиль мышления в 'cognitiveStyle', стиль принятия решений в 'decisionStyle', стиль общения в 'communicationStyle'.
9. На шагах 4-5 извлеки: предварительные гипотезы в 'hypotheses' (возможные таланты, ограничения, зоны развития, направления деятельности).
10. Оцени, ответил ли пользователь на вопрос коуча текущего шага. Если ответ содержательный или пользователь явно попросил пропустить/не хочет отвечать, установи 'shouldAdvanceStep' в true. Если сообщение не относится к теме или слишком короткое/пустое (например, "привет"), установи 'shouldAdvanceStep' в false.

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

    const apiKey = env.PROXYAPI_KEY;
    const apiUrl = env.PROXYAPI_URL;

    let parsed: Record<string, any> = { shouldAdvanceStep: true };
    try {
      const aiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
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

      if (!aiResponse.ok) {
        throw new Error(`ProxyAPI returned status ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      const resultText = aiData.choices?.[0]?.message?.content || '{}';
      parsed = JSON.parse(resultText);
    } catch (err) {
      console.warn('ProxyAPI extraction failed, using regex/fallback parser:', err);
      // Простейший регулярный парсер для телефонов и имен на Шаге 1
      if (currentStep === 1) {
        const phoneMatch = lastUserMessage.match(/(?:\+7|8)[\s-]?\(?\d{3}\)?[\s-]?\d{3}\s?[-]?\d{2}\s?[-]?\d{2}/);
        if (phoneMatch) parsed.phone = phoneMatch[0];
        
        // Попытка вычленить ФИО
        const words = lastUserMessage.split(/\s+/).filter((w: string) => w.length > 2);
        if (words.length > 0 && !lastUserMessage.includes('привет') && !lastUserMessage.includes('готов')) {
          parsed.fullName = words.slice(0, 3).join(' ');
        }
      }
    }

    // Обновляем структурированные данные сессии
    const newExtractedData = { ...extractedData };

    // Объединяем качественные данные
    if (parsed.fullName) newExtractedData.fullName = parsed.fullName;
    if (parsed.role) newExtractedData.role = parsed.role;
    if (parsed.grade) newExtractedData.grade = parsed.grade;
    if (parsed.age) newExtractedData.age = parsed.age;
    if (parsed.city) newExtractedData.city = parsed.city;
    if (parsed.dreams) newExtractedData.dreams = (newExtractedData.dreams ? newExtractedData.dreams + '; ' : '') + parsed.dreams;
    if (parsed.interests) newExtractedData.interests = (newExtractedData.interests ? newExtractedData.interests + '; ' : '') + parsed.interests;
    if (parsed.achievements) newExtractedData.achievements = (newExtractedData.achievements ? newExtractedData.achievements + '; ' : '') + parsed.achievements;
    if (parsed.idols) newExtractedData.idols = (newExtractedData.idols ? newExtractedData.idols + '; ' : '') + parsed.idols;
    if (parsed.values) newExtractedData.values = (newExtractedData.values ? newExtractedData.values + '; ' : '') + parsed.values;
    if (parsed.motivation) newExtractedData.motivation = (newExtractedData.motivation ? newExtractedData.motivation + '; ' : '') + parsed.motivation;
    if (parsed.strengths) newExtractedData.strengths = (newExtractedData.strengths ? newExtractedData.strengths + '; ' : '') + parsed.strengths;
    if (parsed.weaknesses) newExtractedData.weaknesses = (newExtractedData.weaknesses ? newExtractedData.weaknesses + '; ' : '') + parsed.weaknesses;
    if (parsed.cognitiveStyle) newExtractedData.cognitiveStyle = (newExtractedData.cognitiveStyle ? newExtractedData.cognitiveStyle + '; ' : '') + parsed.cognitiveStyle;
    if (parsed.decisionStyle) newExtractedData.decisionStyle = (newExtractedData.decisionStyle ? newExtractedData.decisionStyle + '; ' : '') + parsed.decisionStyle;
    if (parsed.communicationStyle) newExtractedData.communicationStyle = (newExtractedData.communicationStyle ? newExtractedData.communicationStyle + '; ' : '') + parsed.communicationStyle;
    if (parsed.hypotheses) newExtractedData.hypotheses = (newExtractedData.hypotheses ? newExtractedData.hypotheses + '; ' : '') + parsed.hypotheses;

    // Продвигаем шаг сценария
    if (parsed.shouldAdvanceStep && currentStep < 6) {
      newExtractedData.currentStep = currentStep + 1;
    }

    // Если сессия перешла на шаг 6, завершаем ее и извлекаем финальный отзыв коуча
    let completedAt = coachSession.completedAt;
    let status = coachSession.status;
    if (newExtractedData.currentStep === 6 && status !== 'COMPLETED') {
      status = 'COMPLETED';
      completedAt = new Date();

      // Достаем последнее сообщение коуча (которое является эмпатичным резюме) из актуального транскрипта
      const freshSession = await prisma.coachSession.findUnique({
        where: { id: sessionId }
      });
      const freshTranscript = freshSession?.transcript as any[] || [];
      const assistantMsgs = freshTranscript.filter(m => m.role === 'assistant');
      if (assistantMsgs.length > 0) {
        newExtractedData.preliminaryFeedback = assistantMsgs[assistantMsgs.length - 1].content;
      }
    }

    // Обновляем сессию коуча в БД
    await prisma.coachSession.update({
      where: { id: sessionId },
      data: {
        extractedData: newExtractedData,
        status,
        completedAt
      }
    });

    // Обновляем пользователя, если извлечены регистрационные данные
    const userUpdateData: Record<string, any> = {};
    if (parsed.fullName && parsed.fullName !== coachSession.user.name) {
      userUpdateData.name = parsed.fullName;
      userUpdateData.fullName = parsed.fullName;
    }
    if (parsed.role) {
      userUpdateData.role = parsed.role;
    }
    if (parsed.phone && parsed.phone !== coachSession.user.phone) {
      const existingUser = await prisma.user.findUnique({ where: { phone: parsed.phone } });
      if (!existingUser) {
        userUpdateData.phone = parsed.phone;
      }
    }

    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: coachSession.userId },
        data: userUpdateData
      });
    }

    // Фоновая отправка в Telegram и MAX ID (при получении телефона или на шаге 6)
    const dbUser = await prisma.user.findUnique({ where: { id: coachSession.userId } });
    if (dbUser && (parsed.phone || newExtractedData.currentStep === 6)) {
      sendTelegramNotification(dbUser, newExtractedData).catch(err => console.error(err));
      sendMaxIdSync(dbUser, newExtractedData).catch(err => console.error(err));
    }

    return NextResponse.json({
      success: true,
      currentStep: newExtractedData.currentStep,
      extracted: parsed
    });

  } catch (error: any) {
    console.error('Error in coach extraction:', error);
    return NextResponse.json({ error: error.message || 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
