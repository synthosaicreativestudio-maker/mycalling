import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { env } from '../../../../lib/env';

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

    // Промпт для извлечения структурированных данных
    const extractionPrompt = `Ты — анализатор текста. Проанализируй сообщение пользователя и текущий шаг сценария нейрокоуча.
Извлеки структурированные данные.

Текущий шаг сценария: ${currentStep}
Последнее сообщение пользователя: "${lastUserMessage}"

Инструкции по извлечению:
1. Если пользователь назвал свое имя, извлеки его в 'fullName'.
2. Если пользователь указал роль (ученик, школьник, подросток — STUDENT; мама, папа, родитель — PARENT), извлеки в 'role'.
3. Если есть email, извлеки в 'email'.
4. Если есть телефон, извлеки в 'phone'.
5. Если пользователь говорит о мечтах, увлечениях, кумирах, ценностях или трудностях, извлеки это в соответствующие поля.
6. Оцени, ответил ли пользователь на вопрос коуча текущего шага. Если ответ содержательный или пользователь явно попросил пропустить/не хочет отвечать, установи 'shouldAdvanceStep' в true. Если сообщение не относится к теме или слишком короткое/пустое (например, "привет"), установи 'shouldAdvanceStep' в false.

Ответь СТРОГО в формате JSON. Не пиши никаких преамбул или markdown.
Формат JSON:
{
  "fullName": string | null,
  "role": "STUDENT" | "PARENT" | null,
  "email": string | null,
  "phone": string | null,
  "dreams": string | null,
  "interests": string | null,
  "idols": string | null,
  "values": string | null,
  "barriers": string | null,
  "shouldAdvanceStep": boolean
}`;

    const apiKey = env.PROXYAPI_KEY;
    const apiUrl = env.PROXYAPI_URL;

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
    const parsed = JSON.parse(resultText);

    // Обновляем структурированные данные сессии
    const newExtractedData = { ...extractedData };

    // Объединяем качественные данные
    if (parsed.fullName) newExtractedData.fullName = parsed.fullName;
    if (parsed.role) newExtractedData.role = parsed.role;
    if (parsed.dreams) newExtractedData.dreams = (newExtractedData.dreams ? newExtractedData.dreams + '; ' : '') + parsed.dreams;
    if (parsed.interests) newExtractedData.interests = (newExtractedData.interests ? newExtractedData.interests + '; ' : '') + parsed.interests;
    if (parsed.idols) newExtractedData.idols = (newExtractedData.idols ? newExtractedData.idols + '; ' : '') + parsed.idols;
    if (parsed.values) newExtractedData.values = (newExtractedData.values ? newExtractedData.values + '; ' : '') + parsed.values;
    if (parsed.barriers) newExtractedData.barriers = (newExtractedData.barriers ? newExtractedData.barriers + '; ' : '') + parsed.barriers;

    // Продвигаем шаг сценария
    if (parsed.shouldAdvanceStep && currentStep < 6) {
      newExtractedData.currentStep = currentStep + 1;
    }

    // Если сессия перешла на шаг 6, завершаем ее
    let completedAt = coachSession.completedAt;
    let status = coachSession.status;
    if (newExtractedData.currentStep === 6 && status !== 'COMPLETED') {
      status = 'COMPLETED';
      completedAt = new Date();
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
    if (parsed.email && parsed.email !== coachSession.user.email) {
      // Проверяем уникальность email
      const existingUser = await prisma.user.findUnique({ where: { email: parsed.email } });
      if (!existingUser) {
        userUpdateData.email = parsed.email;
      }
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
