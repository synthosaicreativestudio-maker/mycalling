import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isJson = searchParams.get('format') === 'json';
  try {
    const token = searchParams.get('token');

    console.log('[auth] Callback received request for token:', token ? '***' : null, { isJson });

    if (!token) {
      console.warn('[auth] Callback missing token');
      if (isJson) {
        return NextResponse.json({ error: 'missing_token' }, { status: 400 });
      }
      return NextResponse.redirect(new URL('/auth?error=missing_token', request.url));
    }

    const session = await prisma.session.findUnique({
      where: { token }
    });

    if (!session || session.expiresAt < new Date()) {
      console.warn('[auth] Callback session not found or expired:', { exists: !!session });
      if (isJson) {
        return NextResponse.json({ error: 'expired_session' }, { status: 400 });
      }
      return NextResponse.redirect(new URL('/auth?error=expired_session', request.url));
    }

    // Проверяем статус коуч-сессии пользователя
    let redirectPath = '/coach'; // По умолчанию — на коуч-сессию
    const coachSession = await prisma.coachSession.findUnique({
      where: { userId: session.userId }
    });
    if (coachSession && coachSession.status === 'COMPLETED') {
      redirectPath = '/assessment'; // Если сессия завершена — на диагностику
      
      const diagnosticResult = await prisma.diagnosticResult.findFirst({
        where: { userId: session.userId }
      });
      if (diagnosticResult) {
        redirectPath = '/report'; // Если и тесты завершены — в личный кабинет
      }
    }

    console.log('[auth] Callback redirection target:', { userId: session.userId, redirectPath });

    const response = isJson
      ? NextResponse.json({ success: true, redirectPath })
      : NextResponse.redirect(new URL(redirectPath, request.url));
    
    // Устанавливаем куки сессии Better Auth для обоих протоколов (http и https)
    // для гарантированной работы за прокси-серверами продакшна
    const isHttps = request.url.startsWith('https:');
    
    console.log('[auth] Callback setting both HTTP and HTTPS session cookies for max compatibility');

    const cookieOptions = {
      value: token,
      httpOnly: true,
      sameSite: 'lax' as const,
      path: '/',
      expires: session.expiresAt
    };

    // 1. Стандартная кука (используется на localhost)
    response.cookies.set({
      name: 'better-auth.session_token',
      secure: false,
      ...cookieOptions
    });

    // 2. Защищенная кука (используется на продакшне https)
    response.cookies.set({
      name: '__secure-better-auth.session_token',
      secure: true,
      ...cookieOptions
    });

    return response;
  } catch (error) {
    console.error('Error in telegram callback:', error);
    if (isJson) {
      return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    }
    return NextResponse.redirect(new URL('/auth?error=internal_error', request.url));
  }
}
