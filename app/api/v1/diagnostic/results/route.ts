import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import redisClient from '../../../../lib/redis';

import { headers } from 'next/headers';
import { auth } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let sessionId = searchParams.get('session_id');

    // Проверяем сессию Better Auth
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const userId = session?.user?.id;

    // Если session_id не передан, но пользователь авторизован — используем его userId
    if (!sessionId && userId) {
      sessionId = userId;
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'Не указан session_id и пользователь не авторизован' }, { status: 400 });
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

    // 3. ПРОМЕЖУТОЧНЫЙ ОТЧЁТ (в процессе прохождения):
    // Если итоговый репорт еще не создан, но у пользователя есть активная сессия коучинга —
    // возвращаем промежуточные накопленные данные талантов и ответы коуча.
    const activeCoachSession = coachSession || await prisma.coachSession.findFirst({
      where: { OR: [{ id: sessionId }, { userId: sessionId }, { userId: userId || undefined }] },
      include: { user: true }
    });

    if (activeCoachSession) {
      const extracted = (activeCoachSession.extractedData as any) || {};
      const express = extracted.expressExtracted || {};
      const deep = extracted.deepExtracted || {};
      const talentScores = express.talentScores || {
        creative: 0,
        tech: 0,
        science: 0,
        data: 0,
        social: 0,
        organizational: 0,
        startup: 0
      };

      const studentName = activeCoachSession.user?.name && activeCoachSession.user.name !== 'Гость'
        ? activeCoachSession.user.name
        : (extracted.fullName || 'Ваш профиль');

      const intermediateData = {
        studentName,
        isIntermediate: true,
        heroSummary: [
          `Промежуточный аналитический профиль пользователя ${studentName}.`,
          'Профиль динамически формируется ИИ-коучем в режиме реального времени на основе ваших ответов.'
        ],
        riasecScores: {
          R: talentScores.tech || 0,
          I: talentScores.science || talentScores.data || 0,
          A: talentScores.creative || 0,
          S: talentScores.social || 0,
          E: talentScores.startup || 0,
          C: talentScores.organizational || 0
        },
        talentScores,
        hollandCode: 'LIVE',
        personalityTraits: [
          { name: 'Творчество и дизайн', score: talentScores.creative || 40, description: 'Склонность к созданию визуальных концептов и текстов.' },
          { name: 'Технологии и инженерия', score: talentScores.tech || 40, description: 'Склонность к коду, алгоритмам и техническим системам.' },
          { name: 'Коммуникация и люди', score: talentScores.social || 40, description: 'Способность находить общий язык, учить и помогать людям.' },
          { name: 'Предпринимательство', score: talentScores.startup || 40, description: 'Лидерские качества, стремление к масштабу и реализации идей.' }
        ],
        strengths: [
          express.hobbies ? `Увлечения: ${express.hobbies}` : 'Формирование первого слоя талантов...',
          express.dreams ? `Мечта: ${express.dreams}` : 'Исследование профессиональных амбиций...',
          express.values ? `Ценности: ${express.values}` : 'Анализ ключевых ориентиров...'
        ],
        growthAreas: [
          'Завершите все шаги коучинга и пройдите интерактивные тесты для глубокой разблокировки каталога профессий.'
        ],
        coachSection: {
          dreams: express.dreams || '',
          idols: express.idols || '',
          values: express.values || '',
          deepGoal: deep.deepGoal || '',
          deepOutcome: deep.deepOutcome || '',
          deepEmotions: deep.deepEmotions || '',
          deepIdentity: deep.deepIdentity || '',
          deepBarriers: deep.deepBarriers || '',
          deepActions: deep.deepActions || '',
          deepFirstStep: deep.deepFirstStep || ''
        },
        professions: []
      };

      return NextResponse.json({
        status: 'success',
        data: intermediateData
      });
    }

    return NextResponse.json({
      error: 'Отчет не найден или диагностика еще не начата'
    }, { status: 404 });

  } catch (error: any) {
    console.error('Ошибка получения результатов:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
