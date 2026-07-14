import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Создаёт подписанное значение куки в формате better-call:
 *   `encodeURIComponent(${value}.${base64(HMAC-SHA256(value, secret))})`
 * 
 * Совместимо с better-call/dist/crypto.mjs — signCookieValue
 */
async function signCookieValue(value: string, secret: string): Promise<string> {
  const secretBuf = new TextEncoder().encode(secret);
  const key = await crypto.subtle.importKey(
    'raw',
    secretBuf,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(value)
  );
  // btoa(String.fromCharCode(...bytes)) — то же самое что в better-call
  const base64sig = btoa(String.fromCharCode(...new Uint8Array(signature)));
  const signed = `${value}.${base64sig}`;
  return signed;
}

/**
 * Формирует raw Set-Cookie строку, совместимую с better-call _serialize.
 * Значение уже должно быть готово к вставке (signed + NOT url-encoded дважды).
 */
function buildSetCookieHeader(
  name: string,
  signedValue: string,
  options: {
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: string;
    path?: string;
    expires?: Date;
  }
): string {
  // Значение уже подписано. Для совместимости с better-call НЕ кодируем повторно.
  // better-call уже делает encodeURIComponent внутри signCookieValue,
  // но мы воспроизводим тот же формат вручную.
  const encodedValue = encodeURIComponent(signedValue);
  let cookie = `${name}=${encodedValue}`;
  
  if (options.path) cookie += `; Path=${options.path}`;
  if (options.expires) cookie += `; Expires=${options.expires.toUTCString()}`;
  if (options.httpOnly) cookie += '; HttpOnly';
  if (options.secure) cookie += '; Secure';
  if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;
  
  return cookie;
}

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

      await prisma.authExchangeToken.update({
        where: { id: tokenRecord.id },
        data: { used: true }
      });

      const sessionToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await prisma.session.create({
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
      // 2. Стандартный путь по токену сессии
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

    // Проверяем прогресс пользователя для динамического редиректа
    const coachSession = await prisma.coachSession.findFirst({
      where: { userId }
    });
    const diagnosticResult = await prisma.diagnosticResult.findFirst({
      where: { userId }
    });

    let redirectPath = '/report';
    if (!coachSession || coachSession.status !== 'COMPLETED') {
      redirectPath = '/coach';
    } else if (!diagnosticResult) {
      redirectPath = '/assessment';
    }

    console.log('[auth] Callback redirection target:', { userId, redirectPath, coachCompleted: coachSession?.status === 'COMPLETED', testCompleted: !!diagnosticResult });

    // Получаем секрет Better Auth
    const betterAuthSecret = process.env.BETTER_AUTH_SECRET;
    if (!betterAuthSecret) {
      console.error('[auth] BETTER_AUTH_SECRET is not set!');
      return NextResponse.redirect(new URL('/auth?error=config_error', request.url));
    }

    // Подписываем токен по тому же алгоритму что better-call
    const signedToken = await signCookieValue(finalSessionToken, betterAuthSecret);
    
    console.log('[auth] Signed cookie created:', {
      tokenLength: finalSessionToken.length,
      signedLength: signedToken.length,
      signedPreview: signedToken.substring(0, 20) + '...',
      hasDot: signedToken.includes('.'),
    });

    let response: NextResponse;

    if (isJson) {
      response = NextResponse.json({ success: true, redirectPath });
    } else {
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

    // Better Auth при HTTPS baseURL ищет куку с именем __Secure-better-auth.session_token
    // (см. SECURE_COOKIE_PREFIX в better-auth/dist/cookies/cookie-utils.mjs)
    // __Secure- prefix требует флаг secure: true
    const cookieOptions = {
      httpOnly: true,
      sameSite: 'Lax',
      path: '/',
      expires: finalExpiresAt,
    };

    const secureCookie = buildSetCookieHeader(
      '__Secure-better-auth.session_token',
      signedToken,
      { ...cookieOptions, secure: true }
    );

    // Также ставим без __Secure- prefix на случай localhost/HTTP
    const fallbackCookie = buildSetCookieHeader(
      'better-auth.session_token',
      signedToken,
      { ...cookieOptions, secure: false }
    );

    response.headers.append('Set-Cookie', secureCookie);
    response.headers.append('Set-Cookie', fallbackCookie);

    console.log('[auth] Set-Cookie headers appended:', {
      secureCookieName: '__Secure-better-auth.session_token',
      fallbackCookieName: 'better-auth.session_token',
      signedTokenLength: signedToken.length,
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
