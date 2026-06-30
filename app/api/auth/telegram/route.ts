import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '../../../lib/prisma';
import { auth } from '../../../lib/auth';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8701463375:AAEQxV563Y7P5Anfm0tK1o1CvjmeC2TnEyg';

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
    
    // Устанавливаем куки в формате Better Auth
    response.cookies.set({
      name: 'better-auth.session_token',
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
