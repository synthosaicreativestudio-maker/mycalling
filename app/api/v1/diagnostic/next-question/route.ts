import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '../../../../lib/prisma';
import redisClient from '../../../../lib/redis';
import { diagnosticQuestions } from '../../../../data/questions';
import { env } from '../../../../lib/env';
import { generateJson } from '../../../../lib/gemini';
import { scorers, type ScoreResult } from '../../../../lib/diagnostic/scoring';
import { viaStrengthByCode, viaVirtueNames } from '../../../../data/viaStrengths';

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
      const userId = sessionData.userId;

      // Загружаем качественные данные коуча (нужны до скоринга — возраст используется нормами ICAR)
      const coachSession = await prisma.coachSession.findUnique({
        where: { userId }
      });
      const coachExtracted = coachSession ? (coachSession.extractedData as Record<string, any>) : {};

      // Сборка цифрового профиля из обеих сессий (Express и Deep) для дополнения отчета друг другом
      const getField = (key: string): string => {
        if (coachExtracted.expressExtracted && typeof coachExtracted.expressExtracted === 'object') {
          if ((coachExtracted.expressExtracted as Record<string, any>)[key] !== undefined) {
            return (coachExtracted.expressExtracted as Record<string, any>)[key] || '';
          }
        }
        if (coachExtracted.deepExtracted && typeof coachExtracted.deepExtracted === 'object') {
          if ((coachExtracted.deepExtracted as Record<string, any>)[key] !== undefined) {
            return (coachExtracted.deepExtracted as Record<string, any>)[key] || '';
          }
        }
        return coachExtracted[key] || '';
      };

      const coachData = {
        dreams: getField('dreams') || 'Не указано',
        idols: getField('idols') || 'Не указано',
        values: getField('values') || 'Не указано',
        barriers: getField('fears') || getField('barriers') || 'Не указано',

        deepGoal: getField('deepGoal') || '',
        deepOutcome: getField('deepOutcome') || '',
        deepEmotions: getField('deepEmotions') || '',
        deepIdentity: getField('deepIdentity') || '',
        deepActions: getField('deepActions') || '',
        deepFirstStep: getField('deepFirstStep') || ''
      };

      const ageField = getField('age');
      const age = ageField ? parseInt(ageField, 10) : undefined;
      const scoreContext = { age: Number.isFinite(age) ? age : undefined };

      // 2. Рассчитываем результаты (СКОРИНГ) через единый реестр скореров
      const results: Record<string, ScoreResult> = {};
      Object.values(scorers).forEach((scorer) => {
        results[scorer.testCode] = scorer.score(answers, diagnosticQuestions, scoreContext);
      });

      const finalRiasec = results.RIASEC.scores as Record<string, number>;
      const finalBigFive = results.BFI.scores as Record<string, number | boolean>;
      const icarScores = results.ICAR.scores as { raw: number; bySubscale: Record<string, number>; band: string };
      const correctIcarAnswers = icarScores.raw;
      const procrastinationScore = (results.PROCRASTINATION.scores as { score: number }).score;
      const viaScores = results.VIA.scores as Record<string, number> & { signatureStrengths: string[] };
      const signatureStrengths = viaScores.signatureStrengths.map((code) => {
        const strength = viaStrengthByCode[code];
        return strength ? { code, nameRu: strength.nameRu, virtue: viaVirtueNames[strength.virtue] } : { code, nameRu: code, virtue: '' };
      });

      // Сначала очищаем старые результаты диагностик для этого пользователя
      try {
        await prisma.diagnosticResult.deleteMany({
          where: { userId }
        });
      } catch (delErr) {
        console.error('Ошибка очистки старых результатов тестов:', delErr);
      }

      await prisma.diagnosticResult.createMany({
        data: Object.entries(results).map(([testCode, result]) => ({
          userId,
          testCode,
          rawResponses: answers,
          scores: result.scores as any,
          reliability: result.reliability
        }))
      });

      const summaryProfile = {
        riasec: finalRiasec,
        bigFive: finalBigFive,
        icar: icarScores,
        via: viaScores,
        procrastination: procrastinationScore,
        coachData
      };

      // Безопасный upsert цифрового профиля
      await prisma.digitalProfile.upsert({
        where: { userId },
        create: {
          userId,
          summary: summaryProfile as any
        },
        update: {
          summary: summaryProfile as any
        }
      });

      // 3. Генерация ИИ-отчета через ProxyAPI
      const apiKey = env.PROXYAPI_KEY;
      const apiUrl = env.PROXYAPI_URL;

      let coachDataPrompt = '';
      if (coachData.dreams !== 'Не указано' || coachData.idols !== 'Не указано') {
        coachDataPrompt += `Экспресс-коучинг: Мечты - ${coachData.dreams}, Кумиры - ${coachData.idols}, Ценности - ${coachData.values}, – Барьеры/Страхи: ${coachData.barriers}. `;
      }
      if (coachData.deepGoal) {
        coachDataPrompt += `Глубокий коучинг: Цель - ${coachData.deepGoal}, Ожидаемый результат - ${coachData.deepOutcome}, Эмоции - ${coachData.deepEmotions}, Идентичность - ${coachData.deepIdentity}, Шаги - ${coachData.deepActions}, Первый двухминутный шаг - ${coachData.deepFirstStep}.`;
      }
      if (!coachDataPrompt) {
        coachDataPrompt = 'Данные коучинга не предоставлены.';
      }

      const systemPrompt = `Вы — ведущий мировой эксперт в профориентации подростков и возрастной психологии.
Ваша задача — проанализировать результаты диагностики (RIASEC, Big Five, логический тест, прокрастинация) и качественные данные от коуча, чтобы составить подробный, вдохновляющий отчет.

Данные для анализа:
- Профиль интересов (RIASEC): ${JSON.stringify(finalRiasec)}
- Профиль личности (Big Five): ${JSON.stringify(finalBigFive)}
- Логика (ICAR): уровень готовности к задачам такого типа относительно возраста — «${icarScores.band}» (verbal: ${icarScores.bySubscale.verbal ?? 0}/3, numeric: ${icarScores.bySubscale.numeric ?? 0}/3, spatial: ${icarScores.bySubscale.spatial ?? 0}/3)
- Прокрастинация (Лэй): ${procrastinationScore} баллов (шкала 4-20)
- Сильные стороны характера (VIA Youth, топ-5 сигнатурных сил): ${signatureStrengths.map((s) => `${s.nameRu} (${s.virtue})`).join(', ')}
- Качественные данные коуча: ${coachDataPrompt}

Правила формирования отчета:
1. Сопоставьте ведущие интересы RIASEC с профессиональными рекомендациями.
2. Проанализируйте Big Five черты.
3. Опишите сильные стороны и зоны развития с учетом прокрастинации (если балл прокрастинации выше 12, дайте совет, как с этим справляться) и логических задач. КРИТИЧЕСКИ ВАЖНО: НИКОГДА не давайте абсолютных оценок интеллекта или чисел вида "X из Y правильных" — только уровень готовности относительно возраста ("developing"/"solid"/"strong" переводите как "в процессе развития"/"уверенный уровень"/"сильная сторона").
4. Раздел "strengths" (сильные стороны) стройте В ПЕРВУЮ ОЧЕРЕДЬ на основе топ-5 сигнатурных сил VIA Youth, а не на общих домыслах — раскройте, как каждая сила проявляется в учебе и жизни подростка.
5. Раздел коуч-сессии: явно укажите качественный анализ полученных от коуча целей, образа будущего или ценностей с пометкой "Источник: диалог с нейрокоучем".
6. Предложите 3-5 конкретных профессий, объяснив причину выбора ('why').
7. КРИТИЧЕСКИ ВАЖНО: Нигде в текстах отчета НЕ должно встречаться аббревиатура 'ИИ' или словосочетание 'искусственный интеллект'. Заменяйте их на 'алгоритмы', 'автоматизация', 'цифровые системы'.

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
  "signatureStrengths": [
    {
      "code": "код силы, ровно как в списке выше",
      "nameRu": "Название на русском",
      "description": "Как эта сила проявляется у этого конкретного подростка (1-2 предложения)."
    }
  ],
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
          signatureStrengths: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                code: { type: "STRING" },
                nameRu: { type: "STRING" },
                description: { type: "STRING" }
              },
              required: ["code", "nameRu", "description"]
            }
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
          "strengths", "signatureStrengths", "growthAreas", "coachSection", "professions"
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
        htmlReportContent = JSON.stringify({ ...resultJson, riasecScores: finalRiasec, isFallback: false });
      } catch (err) {
        console.error('Gemini report generation failed in next-question, creating fallback report:', err);
        // Резервный отчет на основе реальных баллов, чтобы личный кабинет не оставался пустым
        const fallbackReport = {
          studentName: sessionData.username || 'Ученик',
          heroSummary: [
            'Успешно пройден экспресс-анализ интересов и психологических качеств.',
            'На основе ваших ответов сформирована интерактивная карта способностей.'
          ],
          personalityTraits: Object.entries(finalBigFive)
            .filter(([key]) => key !== 'honestyFlag' && key !== 'LOC' && key !== 'AMB')
            .map(([key, val]) => {
            const cleanKey = key.trim();
            const names: Record<string, string> = {
              O: 'Открытость новому',
              O_bigfive: 'Открытость новому',
              Openness: 'Открытость новому',
              C: 'Организованность и дисциплина',
              C_bigfive: 'Организованность и дисциплина',
              Conscientiousness: 'Организованность и дисциплина',
              E: 'Общительность и энергетика',
              E_bigfive: 'Общительность и энергетика',
              Extraversion: 'Общительность и энергетика',
              A: 'Эмпатия и отзывчивость',
              A_bigfive: 'Эмпатия и отзывчивость',
              Agreeableness: 'Эмпатия и отзывчивость',
              N: 'Эмоциональная устойчивость',
              N_bigfive: 'Эмоциональная устойчивость',
              Stability: 'Эмоциональная устойчивость'
            };
            const descriptions: Record<string, string> = {
              O: 'Высокая любознательность, готовность пробовать новые подходы и генерировать идеи.',
              O_bigfive: 'Высокая любознательность, готовность пробовать новые подходы и генерировать идеи.',
              Openness: 'Высокая любознательность, готовность пробовать новые подходы и генерировать идеи.',
              C: 'Умение организовать процесс, дисциплина и доведение дел до высокого результата.',
              C_bigfive: 'Умение организовать процесс, дисциплина и доведение дел до высокого результата.',
              Conscientiousness: 'Умение организовать процесс, дисциплина и доведение дел до высокого результата.',
              E: 'Высокий уровень общительности, комфорт в командной работе и публичных инициативах.',
              E_bigfive: 'Высокий уровень общительности, комфорт в командной работе и публичных инициативах.',
              Extraversion: 'Высокий уровень общительности, комфорт в командной работе и публичных инициативах.',
              A: 'Глубокий уровень эмпатии, способность слышать людей и гибко улаживать разногласия.',
              A_bigfive: 'Глубокий уровень эмпатии, способность слышать людей и гибко улаживать разногласия.',
              Agreeableness: 'Глубокий уровень эмпатии, способность слышать людей и гибко улаживать разногласия.',
              N: 'Спокойное и вдумчивое восприятие сложных ситуаций, адаптивность к нагрузкам.',
              N_bigfive: 'Спокойное и вдумчивое восприятие сложных ситуаций, адаптивность к нагрузкам.',
              Stability: 'Спокойное и вдумчивое восприятие сложных ситуаций, адаптивность к нагрузкам.'
            };
            return {
              name: names[cleanKey] || cleanKey,
              score: Math.round((Number(val) / 5) * 100),
              description: descriptions[cleanKey] || 'Выраженность личностной черты в учебе и общении.'
            };
          }),
          riasecSummary: `Ваши ключевые интересы определены по методике RIASEC. Наибольшую активность проявляют сферы: ${
            Object.entries(finalRiasec)
              .sort((a, b) => Number(b[1]) - Number(a[1]))
              .slice(0, 2)
              .map(([k]) => {
                const riasecRu: Record<string, string> = {
                  R: 'Реалистичный (практический)',
                  I: 'Исследовательский (аналитика)',
                  A: 'Артистичный (творчество)',
                  S: 'Социальный (помощь людям)',
                  E: 'Предпринимательский (лидерство)',
                  C: 'Конвенциональный (систематизация)'
                };
                return riasecRu[k] || k;
              })
              .join(' и ')
          }.`,
          strengths: [
            'Способность к гибкой адаптации в учебных задачах.',
            'Выявленный баланс между аналитическим и практическим подходами.'
          ],
          signatureStrengths: signatureStrengths.map((s) => {
            const strength = viaStrengthByCode[s.code];
            return {
              code: s.code,
              nameRu: s.nameRu,
              description: strength?.shortDescription || 'Одна из ключевых сильных сторон характера.'
            };
          }),
          growthAreas: [
            'Развитие навыков долгосрочного планирования.',
            'Повышение устойчивости при работе со сложными логическими задачами.'
          ],
          coachSection: {
            dreams: coachData.dreams !== 'Не указано' ? coachData.dreams : '',
            idols: coachData.idols !== 'Не указано' ? coachData.idols : '',
            values: coachData.values !== 'Не указано' ? coachData.values : '',
            deepGoal: coachData.deepGoal || '',
            deepOutcome: coachData.deepOutcome || '',
            deepEmotions: coachData.deepEmotions || '',
            deepIdentity: coachData.deepIdentity || '',
            deepActions: coachData.deepActions || '',
            deepFirstStep: coachData.deepFirstStep || ''
          },
          professions: [
            {
              name: 'Специалист по автоматизации процессов',
              score: 92,
              why: 'Хорошее сочетание аналитического мышления и склонности к упорядочиванию данных.'
            },
            {
              name: 'Консультант по цифровым решениям',
              score: 88,
              why: 'Подходит под выраженный социальный профиль и интерес к практическому применению технологий.'
            }
          ],
          isFallback: true
        };
        htmlReportContent = JSON.stringify({ ...fallbackReport, riasecScores: finalRiasec });
      }

      // Безопасный upsert отчета в БД
      await prisma.report.upsert({
        where: { userId },
        create: {
          userId,
          htmlContent: htmlReportContent
        },
        update: {
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
        narrative_theme: sessionData.narrativeTheme || 'CREATIVE',
        available_answers: availableAnswers
      }
    });

  } catch (error: any) {
    console.error('Ошибка в next-question route:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
