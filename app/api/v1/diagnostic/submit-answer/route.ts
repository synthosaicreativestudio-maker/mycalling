import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '../../../../lib/prisma';
import redisClient from '../../../../lib/redis';
import { checkRateLimit } from '../../../../lib/rate-limit';

export async function POST(request: Request) {
  try {
    // Rate limit: 60 запросов в минуту (чтобы не блочить нормальное прохождение)
    const rlResponse = await checkRateLimit(request, 'submit_answer', 60, 60);
    if (rlResponse) return rlResponse;

    const { session_id: sessionId, question_id: questionId, selected_value: rawValue, time_spent_ms: timeSpentMs } = await request.json();

    if (!sessionId || !questionId || rawValue === undefined || timeSpentMs === undefined) {
      return NextResponse.json({ error: 'Неполные данные' }, { status: 400 });
    }

    // Проверка владения сессией (Ownership check)
    const cookieSessionId = cookies().get('diagnostic_session_id')?.value;
    if (cookieSessionId !== sessionId) {
      return NextResponse.json({ error: 'Нет доступа к данной сессии' }, { status: 403 });
    }

    const value = parseInt(rawValue, 10);
    const timeSpent = parseInt(timeSpentMs, 10);

    if (isNaN(value) || value < 1 || value > 5) {
      return NextResponse.json({ error: 'Оценка должна быть от 1 до 5' }, { status: 400 });
    }

    // 1. Получаем сессию
    let sessionDataRaw = await redisClient.get(`session:${sessionId}`);
    let sessionData: any = null;

    if (sessionDataRaw) {
      sessionData = JSON.parse(sessionDataRaw);
    } else {
      const session = await prisma.diagnosticSession.findUnique({
        where: { sessionId },
      });
      if (!session) {
        return NextResponse.json({ error: 'Сессия не найдена' }, { status: 404 });
      }
      sessionData = {
        sessionId: session.sessionId,
        userId: session.userId,
        testId: session.testId,
        fraudPoints: 0,
      };
    }

    // 2. Click-Speed Filter (Борьба с фродом по скорости)
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

    // Накапливаем штрафные баллы в сессии
    sessionData.fraudPoints = (sessionData.fraudPoints || 0) + addedPoints;
    await redisClient.set(`session:${sessionId}`, JSON.stringify(sessionData), 'EX', 7200);

    // Если штрафных баллов больше 8 — блокируем сессию
    if (sessionData.fraudPoints > 8) {
      // Сбрасываем штрафные баллы в 0, чтобы после разблокировки пользователь мог продолжить
      sessionData.fraudPoints = 0;
      await redisClient.set(`session:${sessionId}`, JSON.stringify(sessionData), 'EX', 7200);

      // Возвращаем 422 по ТЗ
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

    // 3. Запись ответа в базу данных с защитой от дублирования
    try {
      await prisma.userDiagnosticAnswer.upsert({
        where: {
          sessionId_questionId: {
            sessionId,
            questionId,
          },
        },
        update: {
          rawAnswerValue: value,
          timeSpentMs: timeSpent,
          isFraud,
          isFastClick,
        },
        create: {
          sessionId,
          questionId,
          rawAnswerValue: value,
          timeSpentMs: timeSpent,
          isFraud,
          isFastClick,
        },
      });
    } catch (dbErr: any) {
      // UNIQUE constraint check
      console.warn('Дубликат ответа проигнорирован на уровне СУБД:', dbErr.message);
    }

    // 4. Pattern Detection (Выявление монотонных паттернов каждые 10 ответов)
    // Получаем общее число ответов в этой сессии
    const answers = await prisma.userDiagnosticAnswer.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { rawAnswerValue: true },
    });

    if (answers.length === 10) {
      // Считаем среднее значение последних 10 ответов
      const values = answers.map((a) => a.rawAnswerValue);
      const mean = values.reduce((sum, val) => sum + val, 0) / 10;
      
      // Считаем стандартное отклонение
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / 10;
      const stdDev = Math.sqrt(variance);

      if (stdDev < 0.35) {
        // Записываем маркер детекции фрода в Redis
        sessionData.patternDetected = true;
        await redisClient.set(`session:${sessionId}`, JSON.stringify(sessionData), 'EX', 7200);
        console.warn(`⚠️ Паттерн монотонного выбора обнаружен для сессии ${sessionId}. StdDev: ${stdDev}`);
      }
    }

    // Проверяем, остались ли еще неотвеченные вопросы
    const isDeep = sessionData.isDeep !== false;
    const limit = isDeep ? 84 : 30;
    const answeredCount = await prisma.userDiagnosticAnswer.count({
      where: { sessionId },
    });
    
    const nextQuestionAvailable = answeredCount < limit;

    return NextResponse.json({
      status: 'success',
      data: {
        saved: true,
        next_question_available: nextQuestionAvailable,
        fraud_warning: isFraud || isFastClick,
      },
    });
  } catch (error: any) {
    console.error('Ошибка записи ответа:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
