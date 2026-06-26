import { NextResponse } from 'next/server';
import redisClient from './redis';

export async function checkRateLimit(
  req: Request,
  action: string,
  limit: number,
  windowSeconds: number
): Promise<NextResponse | null> {
  // Получаем IP адрес, учитывая возможный Nginx proxy
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  
  const key = `ratelimit:${action}:${ip}`;
  
  try {
    const current = await redisClient.incr(key);
    
    if (current === 1) {
      await redisClient.expire(key, windowSeconds);
    }
    
    if (current > limit) {
      console.warn(`[RATE LIMIT] IP ${ip} превысил лимит для действия ${action}`);
      return NextResponse.json(
        { error: 'Слишком много запросов. Пожалуйста, подождите.' },
        { status: 429, headers: { 'Retry-After': windowSeconds.toString() } }
      );
    }
    
    return null; // Проверка пройдена
  } catch (error) {
    console.error('Ошибка в checkRateLimit:', error);
    // В случае ошибки Redis лучше пропустить запрос, чем блокировать всех
    return null;
  }
}
