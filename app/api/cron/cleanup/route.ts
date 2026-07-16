import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const isVercelCron = req.headers.get('x-vercel-cron') === '1';
    const cronSecret = process.env.CRON_SECRET;

    // Верификация авторизации cron-вызова
    if (!isVercelCron && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    // 1. Очистка устаревших сессий авторизации
    const deletedSessions = await prisma.session.deleteMany({
      where: {
        expiresAt: { lt: now },
      },
    });

    // 2. Очистка неактивных кодов привязки AuthLink
    const deletedAuthLinks = await prisma.authLink.deleteMany({
      where: {
        expiresAt: { lt: now },
        status: 'PENDING',
      },
    });

    // 3. Очистка одноразовых exchange-токенов
    const deletedExchangeTokens = await prisma.authExchangeToken.deleteMany({
      where: {
        expiresAt: { lt: now },
      },
    });

    console.log(`[cron/cleanup] Cleaned up ${deletedSessions.count} expired sessions, ${deletedAuthLinks.count} pending links, ${deletedExchangeTokens.count} tokens.`);

    return NextResponse.json({
      success: true,
      cleaned: {
        sessions: deletedSessions.count,
        authLinks: deletedAuthLinks.count,
        exchangeTokens: deletedExchangeTokens.count,
      },
    });
  } catch (err: any) {
    console.error('[cron/cleanup] Error running cleanup job:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
