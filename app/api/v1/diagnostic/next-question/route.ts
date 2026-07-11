import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '../../../../lib/prisma';
import redisClient from '../../../../lib/redis';
import { diagnosticQuestions } from '../../../../data/questions';
import { env } from '../../../../lib/env';
import { generateJson } from '../../../../lib/gemini';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Не указан session_id' }, { status: 400 });
    }

    // 1. Получаем сессию из кэша
    let sessionDataRaw = await redisClient.get(`session:${sessionId}`);
    let sessionData;

    if (!sessionDataRaw) {
      // Сессии нет в кэше. Пытаемся восстановить ее из базы данных.
      const userId = searchParams.get('user_id');
      let user = null;

      if (userId) {
        user = await prisma.user.findUnique({ where: { id: userId } });
      } else {
        user = await prisma.user.findFirst({
          where: {
            diagnosticAnswers: {
              path: ['sessionId'],
              equals: sessionId
            }
          }
        });
      }

      if (user && user.diagnosticAnswers) {
        const dbData = user.diagnosticAnswers as any;
        sessionData = {
          sessionId: dbData.sessionId || sessionId,
          userId: user.id,
          username: user.name,
          currentQuestionIndex: dbData.currentQuestionIndex || 0,
          answers: dbData.answers || {},
          startedAt: new Date().toISOString()
        };
        // Восстанавливаем в кэше
        await redisClient.set(`session:${sessionId}`, JSON.stringify(sessionData), 'EX', 7200);
      } else {
        return NextResponse.json({ error: 'Сессия не найдена или истекла' }, { status: 404 });
      }
    } else {
      sessionData = JSON.parse(sessionDataRaw);
    }

    const currentQuestionIndex = typeof sessionData.currentQuestionIndex === 'number' ? sessionData.currentQuestionIndex : 0;
    const answers = sessionData.answers || {};

    const totalQuestions = diagnosticQuestions.length;
    const progressPercent = Math.round((currentQuestionIndex / totalQuestions) * 100);

    // Если все вопросы отвечены
    if (currentQuestionIndex >= totalQuestions) {
      // 2. Рассчитываем результаты (СКОРИНГ)
      const riasecScores: Record<string, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
      const bigFiveScores: Record<string, number> = { O: 0, C: 0, E: 0, A: 0, N: 0 };
      let correctIcarAnswers = 0;
      let procrastinationScore = 0;

      const riasecCounts: Record<string, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
      const bigFiveCounts: Record<string, number> = { O: 0, C: 0, E: 0, A: 0, N: 0 };
      const procrastinationCounts = { count: 0 };

      diagnosticQuestions.forEach((q) => {
        const value = answers[q.id];
        if (value === undefined) return;

        if (q.testCode === 'RIASEC') {
          riasecScores[q.scale] += value;
          riasecCounts[q.scale] += 1;
        } else if (q.testCode === 'BFI') {
          const finalVal = q.reverseScored ? 6 - value : value;
          bigFiveScores[q.scale] += finalVal;
          bigFiveCounts[q.scale] += 1;
        } else if (q.testCode === 'ICAR') {
          // ICAR-1: 64 (index 3, value 4)
          // ICAR-2: З (index 1, value 2)
          // ICAR-3: Медь может быть металлом, а может и нет (index 1, value 2)
          let isCorrect = false;
          if (q.id === 'icar-1' && value === 4) isCorrect = true;
          if (q.id === 'icar-2' && value === 2) isCorrect = true;
          if (q.id === 'icar-3' && value === 2) isCorrect = true;
          if (isCorrect) correctIcarAnswers += 1;
        } else if (q.testCode === 'PROCRASTINATION') {
          const finalVal = q.reverseScored ? 6 - value : value;
          procrastinationScore += finalVal;
          procrastinationCounts.count += 1;
        }
      });

      // Переводим шкалы RIASEC и BFI в средний балл (1-5)
      const finalRiasec = Object.fromEntries(
        Object.entries(riasecScores).map(([key, val]) => [key, riasecCounts[key] ? parseFloat((val / riasecCounts[key]).toFixed(2)) : 3])
      );
      const finalBigFive = Object.fromEntries(
        Object.entries(bigFiveScores).map(([key, val]) => [key, bigFiveCounts[key] ? parseFloat((val / bigFiveCounts[key]).toFixed(2)) : 3])
      );

      // Сохраняем по одной записи DiagnosticResult для каждого теста в БД
      const userId = sessionData.userId;

      await prisma.diagnosticResult.createMany({
        data: [
          {
            userId,
            testCode: 'RIASEC',
            rawResponses: answers,
            scores: finalRiasec,
            reliability: 'high'
          },
          {
            userId,
            testCode: 'BFI',
            rawResponses: answers,
            scores: finalBigFive,
            reliability: 'high'
          },
          {
            userId,
            testCode: 'ICAR',
            rawResponses: answers,
            scores: { score: correctIcarAnswers },
            reliability: 'medium'
          },
          {
            userId,
            testCode: 'PROCRASTINATION',
            rawResponses: answers,
            scores: { score: procrastinationScore },
            reliability: 'high'
          }
        ]
      });

      // Загружаем качественные данные коуча
      const coachSession = await prisma.coachSession.findUnique({
        where: { userId }
      });
      const coachExtracted = coachSession ? (coachSession.extractedData as Record<string, any>) : {};
      const isDeepMode = coachExtracted.sessionMode === 'DEEP';

      // Сборка цифрового профиля
      const coachData = isDeepMode ? {
        sessionMode: 'DEEP',
        deepGoal: coachExtracted.deepGoal || 'Не указано',
        deepOutcome: coachExtracted.deepOutcome || 'Не указано',
        deepEmotions: coachExtracted.deepEmotions || 'Не указано',
        deepIdentity: coachExtracted.deepIdentity || 'Не указано',
        deepActions: coachExtracted.deepActions || 'Не указано',
        deepFirstStep: coachExtracted.deepFirstStep || 'Не указано'
      } : {
        sessionMode: 'EXPRESS',
        dreams: coachExtracted.dreams || 'Не указано',
        idols: coachExtracted.idols || 'Не указано',
        values: coachExtracted.values || 'Не указано',
        barriers: coachExtracted.barriers || 'Не указано'
      };

      const summaryProfile = {
        riasec: finalRiasec,
        bigFive: finalBigFive,
        icar: correctIcarAnswers,
        procrastination: procrastinationScore,
        coachData
      };

      await prisma.digitalProfile.create({
        data: {
          userId,
          summary: summaryProfile
        }
      });

      // 3. Генерация ИИ-отчета через ProxyAPI
      const apiKey = env.PROXYAPI_KEY;
      const apiUrl = env.PROXYAPI_URL;

      let coachDataPrompt = '';
      if (isDeepMode) {
        coachDataPrompt = `Глубокий коучинг: Цель - ${coachData.deepGoal}, Ожидаемый результат - ${coachData.deepOutcome}, Эмоции - ${coachData.deepEmotions}, Идентичность - ${coachData.deepIdentity}, Шаги - ${coachData.deepActions}, Первый двухминутный шаг - ${coachData.deepFirstStep}`;
      } else {
        coachDataPrompt = `Экспресс-коучинг: Мечты - ${coachData.dreams}, Кумиры - ${coachData.idols}, Ценности - ${coachData.values}, Барьеры - ${coachData.barriers}`;
      }

      const systemPrompt = `Вы — ведущий мировой эксперт в профориентации подростков и возрастной психологии.
Ваша задача — проанализировать результаты диагностики (RIASEC, Big Five, логический тест, прокрастинация) и качественные данные от коуча, чтобы составить подробный, вдохновляющий отчет.

Данные для анализа:
- Профиль интересов (RIASEC): ${JSON.stringify(finalRiasec)}
- Профиль личности (Big Five): ${JSON.stringify(finalBigFive)}
- Логика (ICAR): ${correctIcarAnswers} из 3 правильных ответов
- Прокрастинация (Лэй): ${procrastinationScore} баллов (шкала 4-20)
- Качественные данные коуча: ${coachDataPrompt}

Правила формирования отчета:
1. Сопоставьте ведущие интересы RIASEC с профессиональными рекомендациями.
2. Проанализируйте Big Five черты.
3. Опишите сильные стороны и зоны развития с учетом прокрастинации (если балл прокрастинации выше 12, дайте совет, как с этим справляться) и логических задач.
4. Раздел коуч-сессии: явно укажите качественный анализ полученных от коуча целей, образа будущего или ценностей с пометкой "Источник: диалог с нейрокоучем".
5. Предложите 3-5 конкретных профессий, объяснив причину выбора ('why').
6. КРИТИЧЕСКИ ВАЖНО: Нигде в текстах отчета НЕ должно встречаться аббревиатура 'ИИ' или словосочетание 'искусственный интеллект'. Заменяйте их на 'алгоритмы', 'автоматизация', 'цифровые системы'.

Ответьте СТРОГО в формате JSON.
Структура JSON:
{
  "studentName": "${sessionData.username}",
  "heroSummary": ["Одно-два вдохновляющих предложения."],
  "personalityTraits": [
    {
      "name": "Название шкалы Big Five",
      "score": 20-100 (переведите балл 1-5 в проценты),
      "description": "Как проявляется."
    }
  ],
  "riasecSummary": "Краткое описание ведущих типов интересов.",
  "strengths": ["Сильная сторона 1", "Сильная сторона 2"],
  "growthAreas": ["Зона развития 1", "Зона развития 2"],
  "coachSection": {
    "dreams": "Анализ мечт (для Экспресс, или пустая строка если DEEP)",
    "idols": "Анализ кумиров (для Экспресс, или пустая строка если DEEP)",
    "values": "Анализ ценностей (для Экспресс, или пустая строка если DEEP)",
    "deepGoal": "Цель (для Глубокого)",
    "deepOutcome": "Результат (для Глубокого)",
    "deepEmotions": "Эмоции (для Глубокого)",
    "deepIdentity": "Идентичность (для Глубокого)",
    "deepActions": "План действий (для Глубокого)",
    "deepFirstStep": "Первый шаг (для Глубокого)"
  },
  "professions": [
    {
      "name": "Название профессии",
      "score": 90,
      "why": "Почему подходит"
    }
  ]
}`;

      const nextQuestionReportSchema = {
        type: "OBJECT",
        properties: {
          studentName: { type: "STRING" },
          heroSummary: {
            type: "ARRAY",
            items: { type: "STRING" }
          },
          personalityTraits: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING" },
                score: { type: "INTEGER" },
                description: { type: "STRING" }
              },
              required: ["name", "score", "description"]
            }
          },
          riasecSummary: { type: "STRING" },
          strengths: {
            type: "ARRAY",
            items: { type: "STRING" }
          },
          growthAreas: {
            type: "ARRAY",
            items: { type: "STRING" }
          },
          coachSection: {
            type: "OBJECT",
            properties: {
              dreams: { type: "STRING" },
              idols: { type: "STRING" },
              values: { type: "STRING" },
              deepGoal: { type: "STRING" },
              deepOutcome: { type: "STRING" },
              deepEmotions: { type: "STRING" },
              deepIdentity: { type: "STRING" },
              deepActions: { type: "STRING" },
              deepFirstStep: { type: "STRING" }
            }
          },
          professions: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING" },
                score: { type: "INTEGER" },
                why: { type: "STRING" }
              },
              required: ["name", "score", "why"]
            }
          }
        },
        required: [
          "studentName", "heroSummary", "personalityTraits", "riasecSummary",
          "strengths", "growthAreas", "coachSection", "professions"
        ]
      };

      let htmlReportContent = '{}';
      try {
        const resultJson = await generateJson(
          systemPrompt,
          'Составь отчет по этим данным и верни строго JSON.',
          nextQuestionReportSchema,
          0.7
        );
        htmlReportContent = JSON.stringify(resultJson);
      } catch (err) {
        console.error('Gemini report generation failed in next-question, using empty JSON:', err);
      }

      // Сохраняем отчет в БД
      await prisma.report.create({
        data: {
          userId,
          htmlContent: htmlReportContent
        }
      });

      // Кэшируем отчет в Redis
      await redisClient.set(`report:${sessionId}`, htmlReportContent, 'EX', 86400);

      // Очищаем сессию из Redis и БД
      await redisClient.del(`session:${sessionId}`);
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { diagnosticAnswers: Prisma.DbNull }
        });
      } catch (cleanErr) {
        console.error('Ошибка очистки сессии в БД при завершении:', cleanErr);
      }

      return NextResponse.json({
        status: 'success',
        data: {
          session_id: sessionId,
          completed: true,
          progress_percent: 100
        }
      });
    }

    // Если прохождение продолжается, отдаем текущий вопрос
    const nextQuestion = diagnosticQuestions[currentQuestionIndex];
    
    // Подготовка вариантов ответов
    let availableAnswers = nextQuestion.options.map((opt, i) => ({
      label: opt,
      value: i + 1
    }));

    return NextResponse.json({
      status: 'success',
      data: {
        session_id: sessionId,
        question_id: nextQuestion.id,
        test_type: nextQuestion.testCode.toLowerCase(),
        progress_percent: progressPercent,
        question_text: nextQuestion.text,
        visual_asset_url: nextQuestion.visualAssetUrl,
        ui_layout_type: nextQuestion.testCode === 'ICAR' ? 'select' : 'likert',
        available_answers: availableAnswers
      }
    });

  } catch (error: any) {
    console.error('Ошибка в next-question route:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
