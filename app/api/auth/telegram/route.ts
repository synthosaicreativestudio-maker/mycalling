import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '../../../lib/prisma';
import { auth } from '../../../lib/auth';
import { appendSessionCookies } from '../../../lib/auth/session-cookies';

// Токен бота берётся ТОЛЬКО из окружения. Захардкоженный fallback-токен,
// который здесь был раньше, попал в git-историю и должен считаться
// скомпрометированным — его нужно отозвать через BotFather.
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

function verifyTelegramAuth(data: any): boolean {
  const secretKey = crypto.createHash('sha256').update(BOT_TOKEN).digest();
  
  const dataCheckString = Object.keys(data)
    .filter((key) => key !== 'hash')
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join('\n');

  const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  return hmac === data.hash;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const data = Object.fromEntries(searchParams.entries());

  if (!data.hash) {
    return NextResponse.json({ error: 'Missing hash' }, { status: 400 });
  }

  const isValid = verifyTelegramAuth(data);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
  }

  // Аутентификация успешна
  // 1. Ищем или создаем пользователя
  const telegramId = data.id;
  
  try {
    let account = await prisma.account.findFirst({
      where: { providerId: 'telegram', accountId: telegramId }
    });

    if (!account) {
      // Регистрация через кнопку входа запрещена. Система перенаправляет на прохождение коуч-сессии.
      return NextResponse.redirect(new URL('/coach?error=register_first', request.url));
    }

    let userId = account.userId;

    // Для Better Auth нужно создать токен сессии
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Сессия на 7 дней

    await prisma.session.create({
      data: {
        token: sessionToken,
        userId: userId as string,
        expiresAt: expiresAt,
        ipAddress: request.headers.get('x-forwarded-for') || null,
        userAgent: request.headers.get('user-agent') || null,
      }
    });

    const response = NextResponse.redirect(new URL('/assessment', request.url));

    // Ставим обе куки Better Auth с подписанным токеном. Раньше здесь
    // ставилась одна кука с неверным регистром имени (__secure- вместо
    // __Secure-) и неподписанным токеном — Better Auth такую сессию не видел.
    const betterAuthSecret = process.env.BETTER_AUTH_SECRET;
    if (!betterAuthSecret) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }
    await appendSessionCookies(response, sessionToken, betterAuthSecret, expiresAt);

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
