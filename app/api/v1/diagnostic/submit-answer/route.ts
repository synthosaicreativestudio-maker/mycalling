import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import redisClient from '../../../../lib/redis';

export async function POST(request: Request) {
  try {
    const { session_id: sessionId, question_id: questionId, selected_value: rawValue, time_spent_ms: timeSpentMs } = await request.json();

    if (!sessionId || !questionId || rawValue === undefined || timeSpentMs === undefined) {
      return NextResponse.json({ error: 'Неполные данные' }, { status: 400 });
    }

    const value = parseInt(rawValue, 10);
    const timeSpent = parseInt(timeSpentMs, 10);

    // 1. Получаем сессию из кэша
    const sessionDataRaw = await redisClient.get(`session:${sessionId}`);
    if (!sessionDataRaw) {
      return NextResponse.json({ error: 'Сессия не найдена или истекла' }, { status: 404 });
    }

    const sessionData = JSON.parse(sessionDataRaw);

    // 2. Click-Speed Filter (Фрод-контроль по скорости)
    let isFraud = false;
    let isFastClick = false;
    let addedPoints = 0;

    if (timeSpent < 450) {
      isFraud = true;
      addedPoints = 2;
    } else if (timeSpent < 1000) {
      isFastClick = true;
      addedPoints = 1;
    }

    sessionData.fraudPoints = (sessionData.fraudPoints || 0) + addedPoints;

    // Если штрафных баллов больше 8 — блокируем сессию
    if (sessionData.fraudPoints > 8) {
      sessionData.fraudPoints = 0;
      await redisClient.set(`session:${sessionId}`, JSON.stringify(sessionData), 'EX', 7200);

      return NextResponse.json(
        {
          status: 'warning',
          error_code: 'FRAUD_SPEED_LIMIT',
          message: 'Too fast responses detected. Temporary lockdown applied.',
          lockdown_duration_seconds: 10,
        },
        { status: 422 }
      );
    }

    // 3. Записываем ответ в сессию в кэше
    if (!sessionData.answers) {
      sessionData.answers = {};
    }
    sessionData.answers[questionId] = value;
    sessionData.currentQuestionIndex = (sessionData.currentQuestionIndex || 0) + 1;

    // 4. Pattern Detection (Выявление монотонных паттернов по последним 10 ответам)
    const answersList = Object.values(sessionData.answers) as number[];
    if (answersList.length >= 10) {
      const last10 = answersList.slice(-10);
      const mean = last10.reduce((sum, val) => sum + val, 0) / 10;
      const variance = last10.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / 10;
      const stdDev = Math.sqrt(variance);

      if (stdDev < 0.35) {
        sessionData.patternDetected = true;
      }
    }

    await redisClient.set(`session:${sessionId}`, JSON.stringify(sessionData), 'EX', 7200);

    return NextResponse.json({
      status: 'success',
      data: {
        saved: true,
        next_question_available: true,
        fraud_warning: isFraud || isFastClick
      }
    });

  } catch (error: any) {
    console.error('Ошибка записи ответа:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
