import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Одноразовая capability для доказательства владения гостевой коуч-сессией
 * (docs/audit A2). При создании гостевой сессии сервер ставит HttpOnly-куку
 * `guest_coach_cap` со значением `<sessionId>.<hmac>`. Слияние гостевой сессии с
 * вошедшим пользователем разрешается ТОЛЬКО если предъявленная кука валидна для
 * ровно этого sessionId — иначе чужой (угаданный/полученный) sessionId позволял
 * бы присвоить чужие данные (OWASP A01:2025).
 */
export const GUEST_COACH_CAP_COOKIE = 'guest_coach_cap';

function secret(): string {
  return process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET || 'dev-insecure-secret';
}

function hmac(sessionId: string): string {
  return createHmac('sha256', secret()).update(sessionId).digest('hex');
}

/** Значение куки для данной сессии: `<sessionId>.<hmac>`. */
export function signGuestCapability(sessionId: string): string {
  return `${sessionId}.${hmac(sessionId)}`;
}

/**
 * Проверяет, что значение куки доказывает владение именно этим sessionId.
 * Сравнение подписи — constant-time. Пустые/битые значения → false.
 */
export function verifyGuestCapability(cookieValue: string | undefined | null, sessionId: string): boolean {
  if (!cookieValue || !sessionId) return false;
  const dot = cookieValue.lastIndexOf('.');
  if (dot <= 0) return false;
  const sid = cookieValue.slice(0, dot);
  const sig = cookieValue.slice(dot + 1);
  if (sid !== sessionId) return false;
  const expected = hmac(sessionId);
  const a = Buffer.from(sig, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
