import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isJson = searchParams.get('format') === 'json';
  try {
    const token = searchParams.get('token');
    const exchangeToken = searchParams.get('exchange_token');

    console.log('[auth] Callback received request:', { hasToken: !!token, hasExchangeToken: !!exchangeToken, isJson });

    let finalSessionToken = '';
    let finalExpiresAt: Date;
    let userId = '';

    if (exchangeToken) {
      // 1. Проверяем одноразовый токен обмена
      const tokenRecord = await prisma.authExchangeToken.findFirst({
        where: {
          token: exchangeToken,
          used: false,
          expiresAt: { gt: new Date() }
        }
      });

      if (!tokenRecord) {
        console.warn('[auth] Callback exchange token invalid, used or expired');
        if (isJson) {
          return NextResponse.json({ error: 'expired_session' }, { status: 400 });
        }
        return NextResponse.redirect(new URL('/auth?error=expired_session', request.url));
      }

      // Помечаем токен как использованный
      await prisma.authExchangeToken.update({
        where: { id: tokenRecord.id },
        data: { used: true }
      });

      // Генерируем реальную Better Auth сессию
      const sessionToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 дней

      const newSession = await prisma.session.create({
        data: {
          token: sessionToken,
          userId: tokenRecord.userId,
          expiresAt: expiresAt
        }
      });

      finalSessionToken = sessionToken;
      finalExpiresAt = expiresAt;
      userId = tokenRecord.userId;
    } else if (token) {
      // 2. Стандартный путь по токену сессии (для поллинга)
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

      finalSessionToken = token;
      finalExpiresAt = session.expiresAt;
      userId = session.userId;
    } else {
      console.warn('[auth] Callback missing both token and exchange_token');
      if (isJson) {
        return NextResponse.json({ error: 'missing_token' }, { status: 400 });
      }
      return NextResponse.redirect(new URL('/auth?error=missing_token', request.url));
    }

    // После авторизации всегда перенаправляем в личный кабинет (ЛК / report)
    const redirectPath = '/report';

    console.log('[auth] Callback redirection target:', { userId, redirectPath });

    let response: NextResponse;
    
    if (isJson) {
      response = NextResponse.json({ success: true, redirectPath });
    } else {
      // Чтобы избежать удаления кук в Next.js при HTTP-редиректе 307/302, 
      // отдаем HTML 200 OK с автоматическим JS-перенаправлением
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta http-equiv="refresh" content="0;url=${redirectPath}">
            <title>Авторизация...</title>
            <script>window.location.href = "${redirectPath}";</script>
          </head>
          <body style="background:#080C14;color:#fff;display:flex;align-items:center;justify-content:center;font-family:sans-serif;height:100vh;margin:0;">
            <div style="text-align:center;">
              <p style="font-size:16px;opacity:0.8;">Авторизация успешна. Перенаправление...</p>
            </div>
          </body>
        </html>
      `;
      response = new NextResponse(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }
    
    // Устанавливаем куки сессии Better Auth для обоих протоколов (http и https)
    // для гарантированной работы за прокси-серверами продакшна
    const isHttps = request.url.startsWith('https:');
    
    console.log('[auth] Callback setting both HTTP and HTTPS session cookies for max compatibility');

    const cookieOptions = {
      value: finalSessionToken,
      httpOnly: true,
      sameSite: 'lax' as const,
      path: '/',
      expires: finalExpiresAt
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
