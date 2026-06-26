import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '../../../../lib/prisma';
import redisClient from '../../../../lib/redis';
import { checkRateLimit } from '../../../../lib/rate-limit';

export async function POST(request: Request) {
  try {
    const rlResponse = await checkRateLimit(request, 'delete_answer', 10, 60);
    if (rlResponse) return rlResponse;

    const { session_id: sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Не указан session_id' }, { status: 400 });
    }

    // Проверка владения сессией (Ownership check)
    const cookieSessionId = cookies().get('diagnostic_session_id')?.value;
    if (cookieSessionId !== sessionId) {
      return NextResponse.json({ error: 'Нет доступа к данной сессии' }, { status: 403 });
    }

    // Находим последний ответ по времени создания
    const lastAnswer = await prisma.userDiagnosticAnswer.findFirst({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
    });

    if (!lastAnswer) {
      return NextResponse.json({
        status: 'success',
        deleted: false,
        message: 'История ответов пуста',
      });
    }

    // Удаляем этот ответ
    await prisma.userDiagnosticAnswer.delete({
      where: {
        answerId: lastAnswer.answerId,
      },
    });

    // Также сбрасываем штрафные баллы в Redis, если они были начислены за этот ответ
    let sessionDataRaw = await redisClient.get(`session:${sessionId}`);
    if (sessionDataRaw) {
      const sessionData = JSON.parse(sessionDataRaw);
      // Немного снижаем штрафные баллы, чтобы откат назад компенсировал ошибочный клик
      sessionData.fraudPoints = Math.max(0, (sessionData.fraudPoints || 0) - 1);
      await redisClient.set(`session:${sessionId}`, JSON.stringify(sessionData), 'EX', 7200);
    }

    return NextResponse.json({
      status: 'success',
      deleted: true,
      question_id: lastAnswer.questionId,
    });
  } catch (error: any) {
    console.error('Ошибка удаления последнего ответа:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
