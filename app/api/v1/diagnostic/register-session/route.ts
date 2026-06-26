import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '../../../../lib/prisma';
import redisClient from '../../../../lib/redis';
import { checkRateLimit } from '../../../../lib/rate-limit';

export async function POST(request: Request) {
  try {
    // Rate limit: 5 запросов в минуту с одного IP
    const rlResponse = await checkRateLimit(request, 'register_session', 5, 60);
    if (rlResponse) return rlResponse;

    const { username, grade, is_deep } = await request.json();

    if (!username || typeof username !== 'string' || username.length < 2 || username.length > 50) {
      return NextResponse.json({ error: 'Имя должно содержать от 2 до 50 символов' }, { status: 400 });
    }

    const gradeNum = parseInt(grade, 10);
    if (isNaN(gradeNum) || gradeNum < 8 || gradeNum > 11) {
      return NextResponse.json({ error: 'Класс должен быть от 8 до 11' }, { status: 400 });
    }

    const isDeep = is_deep !== false; // Дефолт true

    // 1. Создаем или находим пользователя
    const user = await prisma.user.create({
      data: {
        username,
        grade: gradeNum,
      },
    });

    // 2. Создаем сессию диагностики. Начинаем с riasec
    const session = await prisma.diagnosticSession.create({
      data: {
        userId: user.userId,
        testId: 'riasec',
        status: 'in_progress',
      },
    });

    // 3. Кэшируем сессию в Redis (для быстрого доступа на 2 часа)
    const sessionData = {
      sessionId: session.sessionId,
      userId: user.userId,
      username,
      grade: gradeNum,
      testId: 'riasec',
      isDeep,
      fraudPoints: 0,
    };
    await redisClient.set(
      `session:${session.sessionId}`,
      JSON.stringify(sessionData),
      'EX',
      7200
    );

    // 4. Устанавливаем HttpOnly cookie для подтверждения владения сессией
    cookies().set('diagnostic_session_id', session.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7200, // 2 часа
    });

    return NextResponse.json({
      status: 'success',
      data: {
        session_id: session.sessionId,
        user_id: user.userId,
        test_type: 'riasec',
      },
    });
  } catch (error: any) {
    console.error('Ошибка регистрации сессии:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
