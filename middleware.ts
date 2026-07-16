import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Добавляем централизованные заголовки защиты от кликджекинга и XSS на уровне middleware
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Для защищенных страниц отчёта /report проверяем наличие хотя бы одного сессионного токена
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/report')) {
    const sessionToken =
      request.cookies.get('better-auth.session_token') ||
      request.cookies.get('__secure-better-auth.session_token');

    // Если токена совсем нет, редиректим на страницу входа с возвратом назад
    if (!sessionToken) {
      const loginUrl = new URL('/auth', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Применяем middleware к основным маршрутам, исключая статические файлы и шрифты
     */
    '/((?!_next/static|_next/image|favicon.ico|assets/).*)',
  ],
};
