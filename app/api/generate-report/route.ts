import { NextResponse } from 'next/server';
import { env } from '../../lib/env';
import { checkRateLimit } from '../../lib/rate-limit';
import { generateJson } from '../../lib/gemini';

export async function POST(request: Request) {
  try {
    // Rate limit: 3 запроса в минуту (внешний API)
    const rlResponse = await checkRateLimit(request, 'generate_report', 3, 60);
    if (rlResponse) return rlResponse;

    const { studentName, studentGrade, answers, isDeep } = await request.json();

    if (!studentName || !answers) {
      return NextResponse.json({ error: 'Неполные данные запроса' }, { status: 400 });
    }

    // 1. Рассчитываем сырые баллы по шкалам
    const riasecScores: Record<string, number> = {
      Realistic: 0,
      Investigative: 0,
      Artistic: 0,
      Social: 0,
      Enterprising: 0,
      Conventional: 0,
    };

    const bigFiveScores: Record<string, number> = {
      Openness: 0,
      Conscientiousness: 0,
      Extraversion: 0,
      Agreeableness: 0,
      Stability: 0,
    };

    const gardnerScores: Record<string, number> = {
      Linguistic: 0,
      'Logical-Mathematical': 0,
      'Spatial-Visual': 0,
      'Bodily-Kinesthetic': 0,
      Musical: 0,
      Interpersonal: 0,
      Intrapersonal: 0,
      Naturalist: 0,
    };

    // Счетчики вопросов для усреднения
    const riasecCounts: Record<string, number> = {
      Realistic: 0,
      Investigative: 0,
      Artistic: 0,
      Social: 0,
      Enterprising: 0,
      Conventional: 0,
    };

    const bigFiveCounts: Record<string, number> = {
      Openness: 0,
      Conscientiousness: 0,
      Extraversion: 0,
      Agreeableness: 0,
      Stability: 0,
    };

    // Проходимся по ответам и распределяем по шкалам
    Object.entries(answers).forEach(([questionId, value]) => {
      const score = Number(value); // Оценка от 1 до 5
      
      // Парсим тип шкалы по ID
      if (questionId.startsWith('exp-') || (questionId.startsWith('deep-') && Number(questionId.split('-')[1]) <= 12)) {
        // Вопросы RIASEC (exp-1..12 или deep-1..12)
        const riasecIndex = questionId.startsWith('exp-') 
          ? Number(questionId.split('-')[1]) 
          : Number(questionId.split('-')[1]);
        
        let trait = 'Conventional';
        if (riasecIndex === 1 || riasecIndex === 2) trait = 'Realistic';
        else if (riasecIndex === 3 || riasecIndex === 4) trait = 'Investigative';
        else if (riasecIndex === 5 || riasecIndex === 6) trait = 'Artistic';
        else if (riasecIndex === 7 || riasecIndex === 8) trait = 'Social';
        else if (riasecIndex === 9 || riasecIndex === 10) trait = 'Enterprising';
        
        riasecScores[trait] += score;
        riasecCounts[trait] += 1;
      } else if (questionId.startsWith('deep-')) {
        const index = Number(questionId.split('-')[1]);
        if (index >= 13 && index <= 22) {
          // Big Five
          let trait = 'Stability';
          if (index === 13 || index === 14) trait = 'Openness';
          else if (index === 15 || index === 16) trait = 'Conscientiousness';
          else if (index === 17 || index === 18) trait = 'Extraversion';
          else if (index === 19 || index === 20) trait = 'Agreeableness';

          bigFiveScores[trait] += score;
          bigFiveCounts[trait] += 1;
        } else if (index >= 23 && index <= 30) {
          // Gardner
          let trait = 'Naturalist';
          if (index === 23) trait = 'Linguistic';
          else if (index === 24) trait = 'Logical-Mathematical';
          else if (index === 25) trait = 'Spatial-Visual';
          else if (index === 26) trait = 'Bodily-Kinesthetic';
          else if (index === 27) trait = 'Musical';
          else if (index === 28) trait = 'Interpersonal';
          else if (index === 29) trait = 'Intrapersonal';

          gardnerScores[trait] = score; // 1 вопрос на тип
        }
      }
    });

    // Переводим баллы в проценты
    const finalRiasec = Object.fromEntries(
      Object.entries(riasecScores).map(([key, val]) => [
        key,
        riasecCounts[key] ? Math.round((val / (riasecCounts[key] * 5)) * 100) : 0,
      ])
    );

    const finalBigFive = Object.fromEntries(
      Object.entries(bigFiveScores).map(([key, val]) => [
        key,
        bigFiveCounts[key] ? Math.round((val / (bigFiveCounts[key] * 5)) * 100) : 0,
      ])
    );

    const finalGardner = Object.fromEntries(
      Object.entries(gardnerScores).map(([key, val]) => [
        key,
        Math.round((val / 5) * 100),
      ])
    );

    // 2. Отправляем запрос к языковой модели через ProxyAPI
    const apiKey = env.PROXYAPI_KEY;
    const apiUrl = env.PROXYAPI_URL;

    const systemPrompt = `Вы — ведущий мировой эксперт в профориентации подростков и возрастной психологии.
Ваша задача — проанализировать количественные результаты диагностики способностей, характера и интересов ученика и составить глубокий, вдохновляющий и научно обоснованный отчет.

Правила анализа:
1. RIASEC (Интересы): Сопоставьте ведущие типы (набравшие наибольший %) с профессиональными сферами.
2. Big Five (Характер): Опишите сильные поведенческие стороны ученика (организованность, работа в коллективе, стрессоустойчивость).
3. Интеллект по Гарднеру (для Глубокого теста): Свяжите доминирующие типы интеллекта с тем, КАК ученик решает проблемы.
4. Профессии: Предложите от 3 до 5 современных, востребованных профессий (например: UX/UI-дизайнер, инженер данных, специалист по автоматизации, аналитик данных), обязательно объяснив в поле 'why', почему эта роль идеально подходит подростку на стыке его Хочу (интересы), Могу (интеллект) и Как (характер).
5. Блок для родителей: Дайте практические рекомендации семье, как поддержать сильные стороны ребенка и снизить тревожность.
6. КРИТИЧЕСКИ ВАЖНО: Нигде в текстах отчета (включая обоснования 'why', названия профессий, направления и советы) НЕ должно встречаться аббревиатура 'ИИ' или словосочетание 'искусственный интеллект'. Заменяйте их на 'алгоритмы', 'автоматизация', 'цифровые системы', 'аналитические модели' или 'программные решения'.

Вы должны ответить СТРОГО в формате JSON. Не пишите никаких других текстов, кроме валидного JSON-объекта со следующей структурой:
{
  "studentName": "${studentName}",
  "heroSummary": ["Два емких, премиальных предложения с главным резюме потенциала ученика."],
  "personalityTraits": [
    {
      "name": "Название шкалы на русском (например: Открытость новому / Самоорганизация / Общительность / Эмпатия / Эмоциональная устойчивость)",
      "score": число_в_процентах,
      "description": "Краткое описание того, как это качество проявляется в работе и учебе."
    }
  ],
  "multipleIntelligences": [
    {
      "name": "Название типа интеллекта на русском (например: Логико-математический / Пространственно-визуальный / Лингвистический / Кинестетический / Музыкальный / Межличностный / Внутриличностный / Натуралистический)",
      "score": число_в_процентах,
      "description": "Как ученик использует этот канал восприятия для решения задач."
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
      "why": "Детальное объяснение, как в этой профессии сходятся его интересы по RIASEC, черты характера по Big Five и природный интеллект по Гарднеру.",
      "subjects": ["Предмет 1", "Предмет 2"],
      "directions": ["Сфера 1"]
    }
  ],
  "parentSummary": ["Совет для родителей №1", "Совет для родителей №2", "Совет для родителей №3"]
}`;

    const userPrompt = `Имя ученика: ${studentName}. Класс: ${studentGrade}.
Режим теста: ${isDeep ? 'Глубокий (Комплексный)' : 'Экспресс (Простой)'}.
Результаты подсчета шкал:
- Интересы (RIASEC): ${JSON.stringify(finalRiasec)}
- Характер (Big Five): ${JSON.stringify(isDeep ? finalBigFive : 'не оценивался')}
- Интеллект (Гарднер): ${JSON.stringify(isDeep ? finalGardner : 'не оценивался')}

Составь отчет по этим данным и верни строго JSON.`;

    const reportSchema = {
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
        multipleIntelligences: {
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
        strengths: {
          type: "ARRAY",
          items: { type: "STRING" }
        },
        growthAreas: {
          type: "ARRAY",
          items: { type: "STRING" }
        },
        subjects: {
          type: "ARRAY",
          items: { type: "STRING" }
        },
        directions: {
          type: "ARRAY",
          items: { type: "STRING" }
        },
        professions: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING" },
              score: { type: "INTEGER" },
              summary: { type: "STRING" },
              why: { type: "STRING" },
              subjects: {
                type: "ARRAY",
                items: { type: "STRING" }
              },
              directions: {
                type: "ARRAY",
                items: { type: "STRING" }
              }
            },
            required: ["name", "score", "summary", "why", "subjects", "directions"]
          }
        },
        parentSummary: {
          type: "ARRAY",
          items: { type: "STRING" }
        }
      },
      required: [
        "studentName", "heroSummary", "personalityTraits", "multipleIntelligences",
        "strengths", "growthAreas", "subjects", "directions", "professions", "parentSummary"
      ]
    };

    const resultJson = await generateJson(systemPrompt, userPrompt, reportSchema, 0.35);
    return NextResponse.json(resultJson);
  } catch (error: any) {
    console.error('Ошибка API-роута генерации отчета:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка генерации отчета', details: error.message },
      { status: 500 }
    );
  }
}
