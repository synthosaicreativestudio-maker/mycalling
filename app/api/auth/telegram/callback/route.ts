import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    console.log('[auth] Callback received request for token:', token ? '***' : null);

    if (!token) {
      console.warn('[auth] Callback missing token');
      return NextResponse.redirect(new URL('/auth?error=missing_token', request.url));
    }

    const session = await prisma.session.findUnique({
      where: { token }
    });

    if (!session || session.expiresAt < new Date()) {
      console.warn('[auth] Callback session not found or expired:', { exists: !!session });
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

    const response = NextResponse.redirect(new URL(redirectPath, request.url));
    
    // Устанавливаем куку сессии Better Auth
    const isHttps = request.url.startsWith('https:');
    const cookieName = isHttps ? '__secure-better-auth.session_token' : 'better-auth.session_token';

    console.log('[auth] Callback setting cookie:', { name: cookieName, expiresAt: session.expiresAt });

    response.cookies.set({
      name: cookieName,
      value: token,
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      expires: session.expiresAt
    });

    return response;
  } catch (error) {
    console.error('Error in telegram callback:', error);
    return NextResponse.redirect(new URL('/auth?error=internal_error', request.url));
  }
}
