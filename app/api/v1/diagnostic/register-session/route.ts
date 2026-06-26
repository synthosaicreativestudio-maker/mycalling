import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import prisma from '../../../../lib/prisma';
import redisClient from '../../../../lib/redis';
import { checkRateLimit } from '../../../../lib/rate-limit';
import { auth } from '../../../../lib/auth';

export async function POST(request: Request) {
  try {
    // Rate limit: 5 запросов в минуту с одного IP
    const rlResponse = await checkRateLimit(request, 'register_session', 5, 60);
    if (rlResponse) return rlResponse;

    // Авторизация пользователя через Better Auth
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 });
    }

    const { is_deep } = await request.json().catch(() => ({ is_deep: true }));
    const isDeep = is_deep !== false;

    // 2. Создаем сессию диагностики. Начинаем с riasec
    const diagnosticSession = await prisma.diagnosticSession.create({
      data: {
        userId: session.user.id,
        testId: 'riasec',
        status: 'in_progress',
      },
    });

    // 3. Кэшируем сессию в Redis (для быстрого доступа на 2 часа)
    const sessionData = {
      sessionId: diagnosticSession.sessionId,
      userId: session.user.id,
      username: session.user.name,
      grade: session.user.grade || 8, // Если нет класса, по умолчанию 8
      testId: 'riasec',
      isDeep,
      fraudPoints: 0,
    };
    
    await redisClient.set(
      `session:${diagnosticSession.sessionId}`,
      JSON.stringify(sessionData),
      'EX',
      7200
    );

    // 4. Устанавливаем HttpOnly cookie для подтверждения владения сессией диагностики
    const res = NextResponse.json({
      success: true,
      data: {
        session_id: diagnosticSession.sessionId,
        user_id: session.user.id,
        test_id: 'riasec',
      },
    });

    res.cookies.set({
      name: 'diagnostic_session_id',
      value: diagnosticSession.sessionId,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7200, // 2 часа
      path: '/',
    });

    return res;
  } catch (error: any) {
    console.error('Ошибка регистрации сессии:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
