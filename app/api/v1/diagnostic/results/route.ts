import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import redisClient from '../../../../lib/redis';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Не указан session_id' }, { status: 400 });
    }

    // 1. Попытка загрузить кэшированный отчет из Redis
    const cachedReport = await redisClient.get(`report:${sessionId}`);
    if (cachedReport) {
      return NextResponse.json({
        status: 'success',
        data: JSON.parse(cachedReport)
      });
    }

    // 2. Если в Redis нет, возможно сессия была закрыта, но у нас есть User и Report в БД.
    // Мы можем найти Report по пользователю.
    // Чтобы связать sessionId и userId, мы можем проверить, не является ли sessionId
    // идентификатором сессии коуча в БД (так как мы могли использовать его в качестве основы).
    const coachSession = await prisma.coachSession.findUnique({
      where: { id: sessionId },
      include: { user: { include: { report: true } } }
    });

    if (coachSession && coachSession.user && coachSession.user.report) {
      const reportJson = JSON.parse(coachSession.user.report.htmlContent);
      
      // Записываем обратно в Redis для быстрого доступа
      await redisClient.set(`report:${sessionId}`, coachSession.user.report.htmlContent, 'EX', 86400);

      return NextResponse.json({
        status: 'success',
        data: reportJson
      });
    }

    // Попробуем поискать по сессиям better-auth (если sessionId совпадает с userId)
    const userReport = await prisma.report.findUnique({
      where: { userId: sessionId }
    });

    if (userReport) {
      const reportJson = JSON.parse(userReport.htmlContent);
      return NextResponse.json({
        status: 'success',
        data: reportJson
      });
    }

    return NextResponse.json({
      error: 'Отчет не найден или диагностика еще не завершена'
    }, { status: 404 });

  } catch (error: any) {
    console.error('Ошибка получения результатов:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
