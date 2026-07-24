import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import redisClient from '../../../../lib/redis';

import { getPrincipalUserId } from '../../../../lib/authz/requireOwnedResource';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // A1 (OWASP A01:2025): владелец определяется ТОЛЬКО из серверной сессии.
    // Клиентский session_id больше не даёт доступа к чужим данным — все выборки
    // ниже ограничены userId вошедшего пользователя. Страница /report за логином
    // (middleware), поэтому анонимных вызовов здесь нет.
    const userId = await getPrincipalUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 });
    }

    // 1. Кэш отчёта — ключ привязан к владельцу, а не к произвольному session_id.
    const cachedReport = await redisClient.get(`report:${userId}`);
    if (cachedReport) {
      return NextResponse.json({
        status: 'success',
        data: JSON.parse(cachedReport)
      });
    }

    // 2. Итоговый отчёт из БД — строго по владельцу.
    const userReport = await prisma.report.findUnique({
      where: { userId }
    });

    if (userReport) {
      await redisClient.set(`report:${userId}`, userReport.htmlContent, 'EX', 86400);
      return NextResponse.json({
        status: 'success',
        data: JSON.parse(userReport.htmlContent)
      });
    }

    // 3. ПРОМЕЖУТОЧНЫЙ ОТЧЁТ: активная коуч-сессия владельца (строго по userId).
    const activeCoachSession = await prisma.coachSession.findUnique({
      where: { userId },
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
