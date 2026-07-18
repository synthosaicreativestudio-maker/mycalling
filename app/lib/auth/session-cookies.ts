/**
 * Утилиты для ручной установки сессионных кук Better Auth.
 *
 * Better Auth хранит сессионный токен в куке в подписанном виде
 * `${token}.${base64(HMAC-SHA256(token, secret))}` (см. better-call
 * signCookieValue) и при HTTPS baseURL ищет куку с именем
 * `__Secure-better-auth.session_token` (регистр важен!), а при HTTP —
 * `better-auth.session_token`. Любой роут, который создаёт сессию вручную
 * (мимо better-auth handler), обязан ставить ОБЕ куки с подписанным токеном,
 * иначе Better Auth сессию не увидит.
 */

export const SECURE_SESSION_COOKIE = '__Secure-better-auth.session_token';
export const FALLBACK_SESSION_COOKIE = 'better-auth.session_token';

export async function signCookieValue(value: string, secret: string): Promise<string> {
  const secretBuf = new TextEncoder().encode(secret);
  const key = await crypto.subtle.importKey(
    'raw',
    secretBuf,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  const base64sig = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return `${value}.${base64sig}`;
}

export function buildSetCookieHeader(
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
  // Значение уже подписано; кодируем один раз, как это делает better-call.
  const encodedValue = encodeURIComponent(signedValue);
  let cookie = `${name}=${encodedValue}`;

  if (options.path) cookie += `; Path=${options.path}`;
  if (options.expires) cookie += `; Expires=${options.expires.toUTCString()}`;
  if (options.httpOnly) cookie += '; HttpOnly';
  if (options.secure) cookie += '; Secure';
  if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;

  return cookie;
}

/**
 * Добавляет к ответу обе сессионные куки Better Auth (secure + fallback)
 * с корректно подписанным токеном.
 */
export async function appendSessionCookies(
  response: Response,
  sessionToken: string,
  secret: string,
  expiresAt: Date
): Promise<void> {
  const signedToken = await signCookieValue(sessionToken, secret);
  const cookieOptions = {
    httpOnly: true,
    sameSite: 'Lax',
    path: '/',
    expires: expiresAt,
  };

  response.headers.append(
    'Set-Cookie',
    buildSetCookieHeader(SECURE_SESSION_COOKIE, signedToken, { ...cookieOptions, secure: true })
  );
  response.headers.append(
    'Set-Cookie',
    buildSetCookieHeader(FALLBACK_SESSION_COOKIE, signedToken, { ...cookieOptions, secure: false })
  );
}
