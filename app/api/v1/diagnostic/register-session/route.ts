import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '../../../../lib/prisma';
import redisClient from '../../../../lib/redis';
import { auth } from '../../../../lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { coachSessionId } = body;

    let userId = null;
    let username = 'Гость';

    // 1. Попытка авторизации через Better Auth
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (session && session.user) {
      userId = session.user.id;
      username = session.user.name;
    } else if (coachSessionId) {
      // 2. Если не авторизован, но передан coachSessionId, берем пользователя из сессии коуча
      const coachSession = await prisma.coachSession.findUnique({
        where: { id: coachSessionId },
        include: { user: true }
      });
      if (coachSession) {
        userId = coachSession.userId;
        username = coachSession.user.name;
      }
    }

    if (!userId) {
      // Создаем гостевого пользователя, если нет сессии и коуча
      const tempEmail = `guest_${Math.random().toString(36).substring(2, 11)}@moiprizvanie.ru`;
      const user = await prisma.user.create({
        data: {
          name: 'Гость',
          email: tempEmail,
          role: 'STUDENT'
        }
      });
      userId = user.id;
    }

    // 3. Генерируем новый UUID для сессии диагностики
    const sessionId = crypto.randomUUID();

    // 4. Записываем состояние сессии в Redis кэш
    const sessionData = {
      sessionId,
      userId,
      username,
      currentQuestionIndex: 0,
      answers: {},
      startedAt: new Date().toISOString()
    };

    await redisClient.set(
      `session:${sessionId}`,
      JSON.stringify(sessionData),
      'EX',
      7200 // Храним в кэше 2 часа
    );

    // Дополнительно дублируем сессию в базу данных для устойчивости к перезапускам
    await prisma.user.update({
      where: { id: userId },
      data: {
        diagnosticAnswers: {
          sessionId,
          currentQuestionIndex: 0,
          answers: {}
        }
      }
    });

    const res = NextResponse.json({
      success: true,
      data: {
        session_id: sessionId,
        user_id: userId,
        username
      }
    });

    // Устанавливаем куку
    res.cookies.set({
      name: 'diagnostic_session_id',
      value: sessionId,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7200,
      path: '/'
    });

    return res;
  } catch (error: any) {
    console.error('Ошибка регистрации сессии диагностики:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
