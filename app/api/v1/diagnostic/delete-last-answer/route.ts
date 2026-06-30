import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import redisClient from '../../../../lib/redis';
import { diagnosticQuestions } from '../../../../data/questions';

export async function POST(request: Request) {
  try {
    const { session_id: sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Не указан session_id' }, { status: 400 });
    }

    // Проверка владения сессией
    const cookieSessionId = cookies().get('diagnostic_session_id')?.value;
    if (cookieSessionId !== sessionId) {
      return NextResponse.json({ error: 'Нет доступа к данной сессии' }, { status: 403 });
    }

    let sessionDataRaw = await redisClient.get(`session:${sessionId}`);
    if (!sessionDataRaw) {
      return NextResponse.json({ error: 'Сессия не найдена или истекла' }, { status: 404 });
    }

    const sessionData = JSON.parse(sessionDataRaw);
    const currentIndex = typeof sessionData.currentQuestionIndex === 'number' ? sessionData.currentQuestionIndex : 0;

    if (currentIndex <= 0) {
      return NextResponse.json({
        status: 'success',
        deleted: false,
        message: 'История ответов пуста'
      });
    }

    const newIndex = currentIndex - 1;
    sessionData.currentQuestionIndex = newIndex;

    // Находим ID вопроса, который был отвечен последним
    const questionToDelete = diagnosticQuestions[newIndex];
    if (questionToDelete && sessionData.answers) {
      delete sessionData.answers[questionToDelete.id];
    }

    // Уменьшаем штрафные баллы в качестве компенсации
    sessionData.fraudPoints = Math.max(0, (sessionData.fraudPoints || 0) - 1);

    await redisClient.set(`session:${sessionId}`, JSON.stringify(sessionData), 'EX', 7200);

    return NextResponse.json({
      status: 'success',
      deleted: true,
      question_id: questionToDelete ? questionToDelete.id : null
    });

  } catch (error: any) {
    console.error('Ошибка удаления последнего ответа:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
