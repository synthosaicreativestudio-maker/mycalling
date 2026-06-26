import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '../../../../lib/prisma';
import redisClient from '../../../../lib/redis';
import { checkRateLimit } from '../../../../lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const rlResponse = await checkRateLimit(request, 'next_question', 60, 60);
    if (rlResponse) return rlResponse;

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Не указан session_id' }, { status: 400 });
    }

    // Проверка владения сессией (Ownership check)
    const cookieSessionId = cookies().get('diagnostic_session_id')?.value;
    if (cookieSessionId !== sessionId) {
      return NextResponse.json({ error: 'Нет доступа к данной сессии' }, { status: 403 });
    }

    // 1. Получаем сессию (из Redis или Postgres)
    let sessionDataRaw = await redisClient.get(`session:${sessionId}`);
    let sessionData: any = null;

    if (sessionDataRaw) {
      sessionData = JSON.parse(sessionDataRaw);
    } else {
      const session = await prisma.diagnosticSession.findUnique({
        where: { sessionId },
        include: { user: true },
      });

      if (!session) {
        return NextResponse.json({ error: 'Сессия не найдена' }, { status: 404 });
      }

      const user = session.user as any;
      sessionData = {
        sessionId: session.sessionId,
        userId: session.userId,
        username: user.name,
        grade: user.grade,
        testId: session.testId,
        fraudPoints: 0,
      };

      await redisClient.set(
        `session:${sessionId}`,
        JSON.stringify(sessionData),
        'EX',
        7200
      );
    }

    // 2. Получаем список всех отвеченных вопросов для этой сессии
    const answered = await prisma.userDiagnosticAnswer.findMany({
      where: { sessionId },
      select: { questionId: true },
    });
    const answeredIds = new Set(answered.map((a) => a.questionId));

    // 3. Получаем все вопросы из всех трех тестов
    // Порядок тестов: riasec (30) -> big_five (30) -> career_anchors (24)
    const allQuestions = await prisma.diagnosticQuestion.findMany({
      orderBy: [
        { testId: 'desc' }, // Сортируем так, чтобы порядок был: riasec, big_five, career_anchors
        { questionId: 'asc' },
      ],
    });

    // Нам нужен стабильный порядок. Напрямую отсортируем в JS, чтобы гарантировать: riasec -> big_five -> career_anchors
    const testOrder = { riasec: 1, big_five: 2, career_anchors: 3 };
    const sortedQuestions = allQuestions.sort((a, b) => {
      const orderA = testOrder[a.testId as keyof typeof testOrder] || 99;
      const orderB = testOrder[b.testId as keyof typeof testOrder] || 99;
      if (orderA !== orderB) return orderA - orderB;
      return a.questionId.localeCompare(b.questionId);
    });

    const isDeep = sessionData.isDeep !== false;
    const questionsToUse = isDeep
      ? sortedQuestions
      : sortedQuestions.filter((q) => q.testId === 'riasec');

    const totalQuestions = questionsToUse.length;
    const answeredCount = answeredIds.size;
    const progressPercent = parseFloat(((answeredCount / totalQuestions) * 100).toFixed(1));

    // Находим первый неотвеченный вопрос
    const nextQuestion = questionsToUse.find((q) => !answeredIds.has(q.questionId));

    if (!nextQuestion) {
      // Все вопросы отвечены!
      // Обновляем статус сессии на completed
      await prisma.diagnosticSession.update({
        where: { sessionId },
        data: { status: 'completed', testId: 'career_anchors' },
      });

      // Обновляем в Redis
      sessionData.status = 'completed';
      sessionData.testId = 'career_anchors';
      await redisClient.set(`session:${sessionId}`, JSON.stringify(sessionData), 'EX', 7200);

      return NextResponse.json({
        status: 'success',
        data: {
          session_id: sessionId,
          completed: true,
          progress_percent: 100.0,
        },
      });
    }

    // Если текущий тест в сессии не совпадает с тестом следующего вопроса, обновляем сессию
    if (sessionData.testId !== nextQuestion.testId) {
      await prisma.diagnosticSession.update({
        where: { sessionId },
        data: { testId: nextQuestion.testId },
      });
      sessionData.testId = nextQuestion.testId;
      await redisClient.set(`session:${sessionId}`, JSON.stringify(sessionData), 'EX', 7200);
    }

    // Задаем доступные варианты ответов по шкале Ликерта (5-балльной)
    let availableAnswers = [
      { label: 'Категорически не нравится', value: 1 },
      { label: 'Не нравится', value: 2 },
      { label: 'Нейтрально', value: 3 },
      { label: 'Нравится', value: 4 },
      { label: 'Очень нравится', value: 5 },
    ];

    if (nextQuestion.testId === 'big_five') {
      availableAnswers = [
        { label: 'Полностью не согласен', value: 1 },
        { label: 'Скорее не согласен', value: 2 },
        { label: 'Нейтрально', value: 3 },
        { label: 'Скорее согласен', value: 4 },
        { label: 'Полностью согласен', value: 5 },
      ];
    } else if (nextQuestion.testId === 'career_anchors') {
      availableAnswers = [
        { label: 'Полностью не согласен', value: 1 },
        { label: 'Не согласен', value: 2 },
        { label: 'Затрудняюсь ответить', value: 3 },
        { label: 'Согласен', value: 4 },
        { label: 'Полностью согласен', value: 5 },
      ];
    }

    return NextResponse.json({
      status: 'success',
      data: {
        session_id: sessionId,
        question_id: nextQuestion.questionId,
        test_type: nextQuestion.testId,
        progress_percent: progressPercent,
        question_text: nextQuestion.questionText,
        visual_asset_url: nextQuestion.visualAssetUrl,
        ui_layout_type: 'tinder_card',
        available_answers: availableAnswers,
      },
    });
  } catch (error: any) {
    console.error('Ошибка получения следующего вопроса:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
