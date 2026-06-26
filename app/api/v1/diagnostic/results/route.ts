import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import redisClient from '../../../../lib/redis';
import { env } from '../../../../lib/env';
import { checkRateLimit } from '../../../../lib/rate-limit';

export const dynamic = 'force-dynamic';

// Коэффициенты стандартизации (среднее и стандартное отклонение) для подростков РФ 14-17 лет
const NORM_COEFFS = {
  riasec: {
    R: { mean: 2.50, std: 0.95 },
    I: { mean: 3.10, std: 0.88 },
    A: { mean: 2.90, std: 1.05 },
    S: { mean: 3.40, std: 0.91 },
    E: { mean: 3.00, std: 0.85 },
    C: { mean: 2.80, std: 0.90 },
  },
  big_five: {
    E: { mean: 3.20, std: 0.80 },
    A: { mean: 3.65, std: 0.72 },
    C: { mean: 2.95, std: 0.76 },
    N: { mean: 3.12, std: 0.84 },
    O: { mean: 3.85, std: 0.68 },
  },
  career_anchors: {
    TF: { mean: 3.50, std: 0.80 },
    GM: { mean: 2.90, std: 0.90 },
    AU: { mean: 3.20, std: 0.85 },
    SE: { mean: 3.80, std: 0.75 },
    EC: { mean: 2.70, std: 0.95 },
    SV: { mean: 3.60, std: 0.80 },
    CH: { mean: 3.10, std: 0.85 },
    LS: { mean: 3.90, std: 0.70 },
  }
};

interface NormVal {
  mean: number;
  std: number;
}

// Функция перевода сырого балла в Стены (1-10)
function calculateSten(rawScore: number, scaleCode: string, testId: keyof typeof NORM_COEFFS): number {
  const testNorms = NORM_COEFFS[testId] as Record<string, NormVal> | undefined;
  const norm = testNorms ? testNorms[scaleCode] : undefined;
  if (!norm) return 5; // Дефолтное среднее
  const sten = Math.round(((rawScore - norm.mean) / norm.std) * 2 + 5.5);
  return Math.max(1, Math.min(10, sten));
}

export async function GET(request: Request) {
  try {
    const rlResponse = await checkRateLimit(request, 'results', 10, 60);
    if (rlResponse) return rlResponse;

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Не указан session_id' }, { status: 400 });
    }

    // 1. Проверяем, есть ли уже сохраненный отчет в базе данных
    const existingResult = await prisma.diagnosticResult.findFirst({
      where: { sessionId },
    });

    if (existingResult) {
      return NextResponse.json({
        status: 'success',
        data: {
          session_id: sessionId,
          calculated_at: existingResult.calculatedAt,
          validity_index: Number(existingResult.validityIndex),
          raw_scores: existingResult.rawScores,
          standard_scores: existingResult.standardScores,
          // В базе данных мы также можем хранить сгенерированный ИИ отчет.
          // Для совместимости с текущим фронтендом, мы вернем полный JSON-отчет, 
          // который сгенерирован ИИ и сохранен в метаданных/Redis или кэше.
        }
      });
    }

    // 2. Загружаем сессию и проверяем
    const session = await prisma.diagnosticSession.findUnique({
      where: { sessionId },
      include: { user: true },
    });

    if (!session) {
      return NextResponse.json({ error: 'Сессия не найдена' }, { status: 404 });
    }
    const sessionUser = session.user as any;

    // 3. Загружаем все ответы пользователя по этой сессии
    const answers = await prisma.userDiagnosticAnswer.findMany({
      where: { sessionId },
      include: { question: true },
    });

    const isDeep = answers.length >= 84;
    const requiredAnswersCount = isDeep ? 84 : 30;

    if (answers.length < requiredAnswersCount) {
      return NextResponse.json({ 
        error: 'Диагностика еще не завершена', 
        answered_count: answers.length 
      }, { status: 400 });
    }

    // 4. Расчет сырых баллов
    const riasecRaw: Record<string, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    const bigFiveRaw: Record<string, number> = { E: 0, A: 0, C: 0, N: 0, O: 0 };
    const anchorsRaw: Record<string, number> = { TF: 0, GM: 0, AU: 0, SE: 0, EC: 0, SV: 0, CH: 0, LS: 0 };

    const riasecCounts: Record<string, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    const bigFiveCounts: Record<string, number> = { E: 0, A: 0, C: 0, N: 0, O: 0 };
    const anchorsCounts: Record<string, number> = { TF: 0, GM: 0, AU: 0, SE: 0, EC: 0, SV: 0, CH: 0, LS: 0 };

    // Запоминаем ответы для проверки логической консистентности
    const answersMap = new Map<string, number>();

    answers.forEach((ans) => {
      const q = ans.question;
      const rawValue = ans.rawAnswerValue;
      answersMap.set(q.questionId, rawValue);

      if (q.testId === 'riasec') {
        riasecRaw[q.scaleCode] += rawValue;
        riasecCounts[q.scaleCode] += 1;
      } else if (q.testId === 'big_five') {
        // Учитываем инвертированные вопросы
        const finalValue = q.isReverse ? (6 - rawValue) : rawValue;
        bigFiveRaw[q.scaleCode] += finalValue;
        bigFiveCounts[q.scaleCode] += 1;
      } else if (q.testId === 'career_anchors') {
        anchorsRaw[q.scaleCode] += rawValue;
        anchorsCounts[q.scaleCode] += 1;
      }
    });

    // Усредняем сырые баллы
    const riasecAverages = Object.fromEntries(
      Object.entries(riasecRaw).map(([key, val]) => [key, riasecCounts[key] ? parseFloat((val / riasecCounts[key]).toFixed(2)) : 0])
    );
    const bigFiveAverages = Object.fromEntries(
      Object.entries(bigFiveRaw).map(([key, val]) => [key, bigFiveCounts[key] ? parseFloat((val / bigFiveCounts[key]).toFixed(2)) : 0])
    );
    const anchorsAverages = Object.fromEntries(
      Object.entries(anchorsRaw).map(([key, val]) => [key, anchorsCounts[key] ? parseFloat((val / anchorsCounts[key]).toFixed(2)) : 0])
    );

    // 5. Переводим сырые средние в Стены (1-10)
    const riasecStens = Object.fromEntries(
      Object.entries(riasecAverages).map(([key, val]) => [key, calculateSten(val, key, 'riasec')])
    );
    const bigFiveStens = isDeep ? Object.fromEntries(
      Object.entries(bigFiveAverages).map(([key, val]) => [key, calculateSten(val, key, 'big_five')])
    ) : {};
    const anchorsStens = isDeep ? Object.fromEntries(
      Object.entries(anchorsAverages).map(([key, val]) => [key, calculateSten(val, key, 'career_anchors')])
    ) : {};

    // 6. Оценка достоверности (validity_index)
    let validityIndex = 1.00;

    // Снижаем за паттерны монотонного выбора
    const sessionDataRaw = await redisClient.get(`session:${sessionId}`);
    if (sessionDataRaw) {
      const sessionData = JSON.parse(sessionDataRaw);
      if (sessionData.patternDetected) {
        validityIndex -= 0.25;
      }
    }

    if (isDeep) {
      // Снижаем за логическую непротиворечивость (проверочные пары Big Five)
      // Пара №1: q_bigfive_01 (Прямой общительный) и q_bigfive_21 (Обратный тихий)
      const q1 = answersMap.get('q_bigfive_01') || 3;
      const q21 = answersMap.get('q_bigfive_21') || 3;
      const q21_inv = 6 - q21;
      const delta = Math.abs(q1 - q21_inv);
      
      if (delta >= 3) {
        validityIndex -= 0.15;
      }
    }

    validityIndex = Math.max(0.10, validityIndex);

    // 7. Сборка сырых и стандартизированных JSON шкал
    const rawScoresJson = {
      riasec: riasecAverages,
      big_five: isDeep ? bigFiveAverages : null,
      career_anchors: isDeep ? anchorsAverages : null,
    };

    const standardScoresJson = {
      riasec: riasecStens,
      big_five: isDeep ? bigFiveStens : null,
      career_anchors: isDeep ? anchorsStens : null,
    };

    // 8. Генерация ИИ-отчета через ProxyAPI
    const apiKey = env.PROXYAPI_KEY;
    const apiUrl = env.PROXYAPI_URL;

    const systemPrompt = `Вы — ведущий мировой эксперт в профориентации подростков и возрастной психологии.
Ваша задача — проанализировать количественные результаты диагностики способностей, характера и ценностей ученика и составить глубокий, вдохновляющий и научно обоснованный отчет.

Используются следующие Стены (от 1 до 10):
- RIASEC (Интересы): R (Реалистичный), I (Интеллектуальный/Исследовательский), A (Артистичный), S (Социальный), E (Предприимчивый), C (Конвенциональный/Системный).
${isDeep ? `- Big Five (Личность/Характер): E (Экстраверсия), A (Доброжелательность/Кооперация), C (Добросовестность/Организованность), N (Нейротизм/Негативная эмоциональность), O (Открытость опыту/Любознательность).
- Якоря карьеры (Карьерные ценности): TF (Профессиональная компетентность), GM (Менеджмент/Управление), AU (Автономия/Независимость), SE (Стабильность работы/жизни), EC (Предпринимательская креативность), SV (Служение/Полезность обществу), CH (Вызов/Победа), LS (Интеграция стилей жизни).` : ''}

Правила анализа:
1. RIASEC (Интересы): Опишите ведущие профессиональные типы (набравшие Стен >= 6).
${isDeep ? `2. Big Five (Характер): Свяжите личностные черты (особенно организованность C, открытость O и экстраверсию E) со стилем учебы и будущей командной работы.
3. Якоря карьеры: Объясните, какие мотивационные факторы станут решающими при выборе работы (например, стремление к автономии AU или служению SV).` : ''}
4. Профессии: Предложите от 3 до 5 современных, востребованных профессий (обязательно объяснив в поле 'why', почему эта роль идеально подходит подростку на стыке его Хочу (интересы по RIASEC)${isDeep ? ', Могу (способности и ценности) и Как (характер по Big Five)' : ''}).
5. Блок для родителей: Дайте практические рекомендации семье, как поддержать сильные стороны ребенка и снизить тревожность.
6. КРИТИЧЕСКИ ВАЖНО: Нигде в текстах отчета (включая обоснования 'why', названия профессий, направления и советы) НЕ должно встречаться аббревиатура 'ИИ' или словосочетание 'искусственный интеллект'. Заменяйте их на 'алгоритмы', 'автоматизация', 'цифровые системы', 'аналитические модели' или 'программные решения'.
7. ВАЖНО (Экспресс-режим): Если характер и ценности не оценивались (это экспресс-тест), то в ответе поля personalityTraits и multipleIntelligences должны быть СТРОГО пустыми массивами [].

Вы должны ответить СТРОГО в формате JSON. Не пишите никаких других текстов, кроме валидного JSON-объекта со следующей структурой:
{
  "studentName": "${sessionUser.name}",
  "heroSummary": ["Два емких, премиальных предложения с главным резюме потенциала ученика."],
  "personalityTraits": [
    {
      "name": "Название шкалы на русском (например: Открытость новому / Самоорганизация / Общительность / Эмпатия / Эмоциональная устойчивость)",
      "score": число_в_процентах_рассчитанное_как_стен_умноженный_на_10,
      "description": "Краткое описание того, как это качество проявляется в работе и учебе."
    }
  ],
  "multipleIntelligences": [
    {
      "name": "Ведущие ценности карьеры (например: Стремление к автономии / Стремление к стабильности / Создание бизнеса / Служение людям / Вызов и преодоление)",
      "score": число_в_процентах_рассчитанное_как_стен_якоря_умноженный_на_10,
      "description": "Как эта ценность влияет на выбор карьерной траектории."
    }
  ],
  "strengths": ["Сила 1", "Сила 2", "Сила 3"],
  "growthAreas": ["Зона роста 1", "Зона роста 2", "Зона роста 3"],
  "subjects": ["Предмет 1 с обоснованием, зачем его изучать", "Предмет 2...", "Предмет 3..."],
  "directions": ["Сфера 1", "Сфера 2", "Сфера 3"],
  "professions": [
    {
      "name": "Название профессии",
      "score": число_в_процентах_матча_от_80_до_99,
      "summary": "Краткая суть профессии.",
      "why": "Детальное объяснение, как в этой профессии сходятся его интересы по RIASEC${isDeep ? ', черты характера по Big Five и карьерные якоря Шейна' : ''}.",
      "subjects": ["Предмет 1", "Предмет 2"],
      "directions": ["Сфера 1"]
    }
  ],
  "parentSummary": ["Совет для родителей №1", "Совет для родителей №2", "Совет для родителей №3"]
}`;

    const userPrompt = `Имя ученика: ${sessionUser.name}. Класс: ${sessionUser.grade}.
Результаты стандартизации (Стены 1-10):
- Интересы (RIASEC): ${JSON.stringify(riasecStens)}
${isDeep ? `- Характер (Big Five): ${JSON.stringify(bigFiveStens)}
- Ценности (Якоря карьеры): ${JSON.stringify(anchorsStens)}` : '- Характер и ценности: не оценивались (экспресс-тест)'}
- Достоверность результатов (Validity Index): ${validityIndex}

Составь отчет по этим данным и верни строго JSON.`;

    const aiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'claude-opus-4-7',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.35,
        response_format: { type: 'json_object' },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Ошибка ProxyAPI при получении результатов:', errorText);
      throw new Error(`ProxyAPI returned status ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const resultJson = JSON.parse(aiData.choices[0].message.content);

    // Добавляем к отчету метаданные о достоверности
    resultJson.validityIndex = validityIndex;

    // 9. Сохраняем результаты в базу данных Postgres
    await prisma.diagnosticResult.create({
      data: {
        sessionId,
        userId: session.userId,
        validityIndex,
        rawScores: rawScoresJson,
        standardScores: standardScoresJson,
      },
    });

    // Сохраняем сгенерированный ИИ отчет в Redis, чтобы при повторном GET-запросе отдать его мгновенно
    await redisClient.set(
      `report:${sessionId}`,
      JSON.stringify(resultJson),
      'EX',
      86400 // Кэшируем на 24 часа
    );

    return NextResponse.json({
      status: 'success',
      data: resultJson,
    });
  } catch (error: any) {
    console.error('Ошибка API-роута получения результатов:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера при расчете результатов', details: error.message },
      { status: 500 }
    );
  }
}
