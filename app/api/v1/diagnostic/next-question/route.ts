import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '../../../../lib/prisma';
import redisClient from '../../../../lib/redis';
import { diagnosticQuestions } from '../../../../data/questions';
import { env } from '../../../../lib/env';
import { generateJson } from '../../../../lib/gemini';
import { scorers, type ScoreResult } from '../../../../lib/diagnostic/scoring';
import { viaStrengthByCode, viaVirtueNames } from '../../../../data/viaStrengths';
import { computeConsistency } from '../../../../lib/profile/consistency';
import { topProfessions, type ProfessionMatch } from '../../../../lib/profile/professionMatch';
import { deriveArchetype } from '../../../../lib/profile/archetype';
import { deriveSkillFormula } from '../../../../lib/profile/skillFormula';
import { buildSummaryProfile } from '../../../../lib/profile/layers';
import { pvqValueByCode } from '../../../../data/pvqValues';
import { skillByCode } from '../../../../data/skills';

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

      const getArrayField = (key: string): string[] => {
        const val = coachExtracted.expressExtracted && typeof coachExtracted.expressExtracted === 'object'
          ? (coachExtracted.expressExtracted as Record<string, any>)[key]
          : undefined;
        return Array.isArray(val) ? val.filter((v) => typeof v === 'string') : [];
      };

      const getNumberField = (key: string): number | undefined => {
        let val: any = undefined;
        if (coachExtracted.expressExtracted && typeof coachExtracted.expressExtracted === 'object') {
          val = (coachExtracted.expressExtracted as Record<string, any>)[key];
        }
        if (val === undefined) {
          val = coachExtracted[key];
        }
        return typeof val === 'number' ? val : undefined;
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

      const riasecScoresRaw = results.RIASEC.scores as Record<string, number | string>;
      const hollandCode = riasecScoresRaw.hollandCode as string;
      const finalRiasec: Record<string, number> = Object.fromEntries(
        Object.entries(riasecScoresRaw).filter(([k]) => k !== 'hollandCode')
      ) as Record<string, number>;
      const finalBigFive = results.BFI.scores as Record<string, number | boolean>;

      // §11.6: детерминированный топ-20 профессий из базы (ранжируется ВСЯ база
      // 119 профессий по RIASEC + Big Five). Названия всегда из базы, поэтому
      // карточка в отчёте (RpgProfessionCard) гарантированно обогащается
      // RIASEC-статами. why персонализируется моделью для верхних кандидатов
      // (см. buildReportProfessions), для остальных берётся текст из базы.
      const rankedProfessions: ProfessionMatch[] = topProfessions(finalRiasec, finalBigFive, 20);
      // Топ-8 названий передаём модели как кандидатов для персонального why.
      const professionCandidatesForLlm = rankedProfessions
        .slice(0, 8)
        .map((m) => `- ${m.profession.name}: ${m.profession.summary}`)
        .join('\n');
      // Собирает финальный массив из 20 профессий: имя+score детерминированные,
      // why — от модели, если она написала про это же название (дословно),
      // иначе готовый текст из базы.
      const buildReportProfessions = (llmProfessions: unknown): { name: string; score: number; why: string }[] => {
        const llmList = Array.isArray(llmProfessions) ? llmProfessions : [];
        return rankedProfessions.map(({ profession, matchScore }) => {
          const match = llmList.find(
            (p: any) => p && typeof p.name === 'string' && p.name.trim() === profession.name,
          ) as { why?: unknown } | undefined;
          const llmWhy = match && typeof match.why === 'string' ? match.why.trim() : '';
          return {
            name: profession.name,
            score: matchScore,
            why: llmWhy.length > 10 ? llmWhy : profession.why,
          };
        });
      };
      const icarScores = results.ICAR.scores as { raw: number; bySubscale: Record<string, number>; band: string };
      const correctIcarAnswers = icarScores.raw;
      const procrastinationScore = (results.PROCRASTINATION.scores as { score: number }).score;
      const pvqScores = results.PVQ.scores as { raw: Record<string, number>; centered: Record<string, number>; topValues: string[] };
      const topPvqNames = pvqScores.topValues.map((code) => pvqValueByCode[code]?.nameRu || code);
      const viaScores = results.VIA.scores as Record<string, number> & { signatureStrengths: string[] };
      // "Внутренний компас" (Grit/Mindset/TEIQue) и "Карта ресурсов" (контекст) —
      // короткие валидные шкалы вместо оценки этих же конструктов ИИ-коучем "на
      // глазок" по диалогу. Опциональны: если подросток их не проходил, поля
      // просто останутся undefined (не блокирует остальной отчёт).
      const growthScores = (results.GROWTH?.scores ?? {}) as Record<string, number>;
      const contextScores = (results.CONTEXT?.scores ?? {}) as Record<string, number>;

      const signatureStrengths = viaScores.signatureStrengths.map((code) => {
        const strength = viaStrengthByCode[code];
        return strength ? { code, nameRu: strength.nameRu, virtue: viaVirtueNames[strength.virtue] } : { code, nameRu: code, virtue: '' };
      });

      // Топ-3 ценности PVQ с их сырыми баллами (1-5) — для бейджа в шапке отчета
      // и для горизонтальных баров ValueBars на странице отчета.
      const topPvqValueScores = pvqScores.topValues.map((code) => ({
        nameRu: pvqValueByCode[code]?.nameRu || code,
        score: pvqScores.raw[code] ?? 0
      }));

      // Глубинная сессия коучинга (см. app/api/v1/coach/chat/route.ts): уже
      // синтезированный ИИ-текст (не дословная цитата пользователя), сохранённый
      // в CoachSession.extractedData.deepReportSummary при завершении DEEP-сессии.
      const deepReportSummary = coachExtracted.deepReportSummary && typeof coachExtracted.deepReportSummary === 'object'
        ? (coachExtracted.deepReportSummary as {
            id: string; completedAt: string; goal: string; outcome: string; emotions: string;
            identity: string; actions: string; firstStep: string; synthesis: string;
          })
        : null;
      const deepSessionForReport = deepReportSummary && deepReportSummary.synthesis
        ? {
            synthesis: deepReportSummary.synthesis,
            goal: deepReportSummary.goal || '',
            identity: deepReportSummary.identity || '',
            firstStep: deepReportSummary.firstStep || ''
          }
        : null;

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

      const consistency = computeConsistency({
        riasec: finalRiasec,
        bigFive: finalBigFive,
        procrastination: procrastinationScore,
        via: viaScores,
        topPvqValues: topPvqNames,
        coachData
      });

      // Триангуляция «тест vs коуч» для отчёта (док §4, «Индекс согласованности»).
      // Отдаём не только вопрос-наблюдение (probe), но и явный контраст фактов
      // testFact/coachFact, чтобы отчёт показал «что сошлось / что расходится»
      // конкретно, а не абстрактно. Переопределяется детерминированно в обоих
      // путях генерации (AI и fallback) — не полагаемся на дословное копирование LLM.
      const innerConflictsForReport = consistency.contradictions.map((c) => ({
        title: 'Тест vs Разговор — точка роста',
        testFact: c.testFact,
        coachFact: c.coachFact,
        text: c.probe
      }));

      const skillFormula = deriveSkillFormula({
        riasec: finalRiasec,
        bigFive: finalBigFive,
        icar: icarScores,
        via: viaScores
      });

      // Ведущий архетип — детерминированно из VIA + PVQ (см. app/lib/profile/archetype.ts),
      // а не «на глазок» LLM. Закрывает претензию методического аудита о низкой
      // валидности самописного определения архетипа.
      const archetype = deriveArchetype(
        viaScores as Record<string, number>,
        pvqScores.centered
      );
      const skillFormulaSkills = skillFormula.top3.map((code) => ({
        code,
        nameRu: skillByCode[code]?.nameRu || code,
        evidence: skillFormula.evidence[code] || ''
      }));
      const skillFormulaApplications = Array.from(
        new Set(skillFormula.top3.flatMap((code) => skillByCode[code]?.applications || []))
      ).slice(0, 8);

      const summaryProfile = buildSummaryProfile({
        interests: {
          riasec: finalRiasec,
          hollandCode,
          antiInterests: getArrayField('antiInterests'),
          hobbies: getArrayField('voluntaryHobbies'),
          cabinVisualArt: getNumberField('cabinVisualArt'),
          cabinPerformingArt: getNumberField('cabinPerformingArt'),
          subjectSTEM: getNumberField('subjectSTEM'),
          subjectHumanities: getNumberField('subjectHumanities'),
          subjectBioChem: getNumberField('subjectBioChem'),
          digitalInterests: getArrayField('digitalInterests'),
        },
        personality: {
          bigFive: finalBigFive,
          locusOfControl: typeof finalBigFive.LOC === 'number' ? finalBigFive.LOC : undefined,
          ambiguityTolerance: typeof finalBigFive.AMB === 'number' ? finalBigFive.AMB : undefined,
          honestyFlag: typeof finalBigFive.honestyFlag === 'boolean' ? finalBigFive.honestyFlag : undefined,
          // Приоритет — валидная короткая шкала теста ("Внутренний компас"), а не
          // догадка коуча по диалогу; getNumberField остаётся фолбэком для сессий,
          // пройденных до появления этого теста.
          teiqueSelfAwareness: growthScores.TEIQUE_SA ?? getNumberField('teiqueSelfAwareness'),
          teiqueSelfRegulation: growthScores.TEIQUE_SR ?? getNumberField('teiqueSelfRegulation'),
          teiqueSocialSkills: getNumberField('teiqueSocialSkills'),
          teiqueMotivation: getNumberField('teiqueMotivation'),
          grit: growthScores.GRIT ?? getNumberField('grit'),
          proactivity: getNumberField('proactivity'),
          selfControl: getNumberField('selfControl'),
          stressEvaluation: getNumberField('stressEvaluation'),
          emotionalReactivity: getNumberField('emotionalReactivity'),
          mindsetGrowth: growthScores.MINDSET ?? getNumberField('mindsetGrowth'),
          mindsetOptimism: getNumberField('mindsetOptimism'),
          locusControlInternal: getNumberField('locusControlInternal'),
        },
        strengths: {
          via: viaScores,
          signatureStrengths: viaScores.signatureStrengths,
          // Агрегаты по добродетелям считаются самим VIA-скорером (среднее по входящим
          // в добродетель силам) — раньше здесь читалось поле из данных коуча, которое
          // никогда не заполнялось, и агрегаты всегда были undefined.
          viaWisdom: (viaScores as Record<string, number>).virtue_wisdom,
          viaCourage: (viaScores as Record<string, number>).virtue_courage,
          viaHumanity: (viaScores as Record<string, number>).virtue_humanity,
          viaJustice: (viaScores as Record<string, number>).virtue_justice,
          viaTemperance: (viaScores as Record<string, number>).virtue_temperance,
          viaTranscendence: (viaScores as Record<string, number>).virtue_transcendence,
        },
        cognitive: {
          icar: icarScores,
          execInhibition: getNumberField('execInhibition'),
          execFlexibility: getNumberField('execFlexibility'),
          learnDeep: getNumberField('learnDeep'),
          learnSurface: getNumberField('learnSurface'),
          selfEfficacyAcademic: getNumberField('selfEfficacyAcademic'),
          metacogPlanning: getNumberField('metacogPlanning'),
          metacogMonitoring: getNumberField('metacogMonitoring'),
          curiosityEpistemic: getNumberField('curiosityEpistemic'),
          cogAiLiteracy: getNumberField('cogAiLiteracy'),
        },
        motivation: {
          coachValues: coachData.values !== 'Не указано' ? coachData.values : undefined,
          dreams: coachData.dreams !== 'Не указано' ? coachData.dreams : undefined,
          pvq: pvqScores.raw,
          topValues: topPvqNames.length > 0 ? topPvqNames : (coachData.values !== 'Не указано' ? [coachData.values] : []),
        },
        social: {
          belbinLeader: getNumberField('belbinLeader'),
          belbinDoer: getNumberField('belbinDoer'),
          belbinCreator: getNumberField('belbinCreator'),
          belbinPeacemaker: getNumberField('belbinPeacemaker'),
          assertiveness: getNumberField('assertiveness'),
          empatheticListening: getNumberField('empatheticListening'),
          feedbackSkill: getNumberField('feedbackSkill'),
          conflictResolution: getNumberField('conflictResolution'),
          peerFriendships: getNumberField('peerFriendships'),
          groupBelonging: getNumberField('groupBelonging'),
          bullyingResistance: getNumberField('bullyingResistance'),
          peerDependence: getNumberField('peerDependence'),
          parentalInfluence: getNumberField('parentalInfluence'),
          mentorInfluence: getNumberField('mentorInfluence'),
          socialCapital: getNumberField('socialCapital'),
        },
        behavior: {
          procrastination: procrastinationScore,
          deepActions: coachData.deepActions || undefined,
          deepFirstStep: coachData.deepFirstStep || undefined,
          savickasConcern: getNumberField('savickasConcern'),
          savickasControl: getNumberField('savickasControl'),
          savickasCuriosity: getNumberField('savickasCuriosity'),
          savickasConfidence: getNumberField('savickasConfidence'),
          perfectionismBarrier: getNumberField('perfectionismBarrier'),
          fearOfFailure: getNumberField('fearOfFailure'),
          decisionRational: getNumberField('decisionRational'),
          decisionIntuitive: getNumberField('decisionIntuitive'),
          decisionDependent: getNumberField('decisionDependent'),
          decisionImpulsive: getNumberField('decisionImpulsive'),
          resilienceFailure: getNumberField('resilienceFailure'),
          learningFromMistakes: getNumberField('learningFromMistakes'),
          timeManagement: getNumberField('timeManagement'),
          routineDiscipline: getNumberField('routineDiscipline'),
          balanceWorkRest: getNumberField('balanceWorkRest'),
          digitalHygiene: getNumberField('digitalHygiene'),
          contentCreationStyle: getNumberField('contentCreationStyle'),
          cyberSocialization: getNumberField('cyberSocialization'),
          aiCollaboration: getNumberField('aiCollaboration'),
        },
        context: {
          age: scoreContext.age,
          grade: getField('grade') || undefined,
          city: getField('city') || undefined,
          idols: coachData.idols !== 'Не указано' ? coachData.idols : undefined,
          barriers: coachData.barriers !== 'Не указано' ? coachData.barriers : undefined,
          // Приоритет — короткий самоотчёт теста ("Карта ресурсов"); getNumberField
          // остаётся фолбэком для сессий, пройденных до появления этого теста.
          familyPressure: contextScores.familyPressure ?? getNumberField('familyPressure'),
          familyFinance: contextScores.familyFinance ?? getNumberField('familyFinance'),
          mobility: contextScores.mobility ?? getNumberField('mobility'),
          health: contextScores.health ?? getNumberField('health'),
          grades: getNumberField('grades'),
          limitingBeliefs: getNumberField('limitingBeliefs'),
          educationEnvAvail: contextScores.educationEnvAvail ?? getNumberField('educationEnvAvail'),
          careerReadiness: contextScores.careerReadiness ?? getNumberField('careerReadiness'),
          digitalDivide: contextScores.digitalDivide ?? getNumberField('digitalDivide'),
        },
        consistency,
      });
      // Данные, не входящие в 7-слойную схему аудита, но нужные последующим шагам (отчёту).
      const summaryExtras = { coachData, skillFormula };

      // Безопасный upsert цифрового профиля
      await prisma.digitalProfile.upsert({
        where: { userId },
        create: {
          userId,
          summary: { ...summaryProfile, ...summaryExtras } as any
        },
        update: {
          summary: { ...summaryProfile, ...summaryExtras } as any
        }
      });

      // docs/20 (4a): поля, которые уже собираются коучем и лежат в
      // digitalProfile.summary, но раньше НЕ долетали до отчёта. Прокидываем
      // детерминированно (как innerCompass/resourceMap), рисуем условно — только
      // непустые значения (данные бывают частичными).
      const methodologyProfile = {
        // Роль в команде по Белбину (0-100, оценка коуча).
        belbin: {
          leader: getNumberField('belbinLeader'),
          doer: getNumberField('belbinDoer'),
          creator: getNumberField('belbinCreator'),
          peacemaker: getNumberField('belbinPeacemaker'),
        },
        // Карьерная адаптивность по Савикасу (0-100).
        savickas: {
          concern: getNumberField('savickasConcern'),
          control: getNumberField('savickasControl'),
          curiosity: getNumberField('savickasCuriosity'),
          confidence: getNumberField('savickasConfidence'),
        },
        antiInterests: getArrayField('antiInterests'),
        hobbies: getArrayField('voluntaryHobbies'),
        // Прокрастинация по Лэй (4-20), уже посчитана скорером.
        procrastination: procrastinationScore,
      };

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
      const deepSessionPrompt = deepSessionForReport
        ? `Готовый синтез глубинной коуч-сессии (уже написан от третьего лица, НЕ цитата пользователя, использовать как есть в разделе "deepSession.synthesis"): "${deepSessionForReport.synthesis}". Опорная цель: ${deepSessionForReport.goal || '—'}. Идентичность: ${deepSessionForReport.identity || '—'}. Первый шаг: ${deepSessionForReport.firstStep || '—'}.`
        : 'Глубинная сессия не проводилась или не завершена — раздел "deepSession" должен быть null.';

      const systemPrompt = `Вы — ведущий мировой эксперт в профориентации подростков и возрастной психологии.
Ваша задача — проанализировать результаты диагностики (RIASEC, Big Five, логический тест, прокрастинация) и качественные данные от коуча, чтобы составить подробный, вдохновляющий отчет.

Данные для анализа:
- Профиль интересов (RIASEC): ${JSON.stringify(finalRiasec)}
- Код Холланда (3 буквы ведущих типов интересов): ${hollandCode}
- Профиль личности (Big Five): ${JSON.stringify(finalBigFive)}
- Логика (ICAR): уровень готовности к задачам такого типа относительно возраста — «${icarScores.band}» (verbal: ${icarScores.bySubscale.verbal ?? 0}/3, numeric: ${icarScores.bySubscale.numeric ?? 0}/3, spatial: ${icarScores.bySubscale.spatial ?? 0}/3)
- Прокрастинация (Лэй): ${procrastinationScore} баллов (шкала 4-20)
- Сильные стороны характера (VIA Youth, топ-5 сигнатурных сил): ${signatureStrengths.map((s) => `${s.nameRu} (${s.virtue})`).join(', ')}
- Качественные данные коуча: ${coachDataPrompt}
- Индекс согласованности данных тестов и коуч-сессии: ${consistency.index}/100 (${consistency.level}). ${consistency.contradictions.length > 0 ? `Обнаруженные противоречия: ${consistency.contradictions.map((c) => `«${c.testFact}» vs «${c.coachFact}»`).join('; ')}.` : 'Противоречий не обнаружено.'}
- Формула успеха (3 переносимые компетенции, выведенные детерминированно из профиля): ${skillFormulaSkills.map((s) => s.nameRu).join(' + ')}
- Ведущие ценности по тесту PVQ Шварца (топ-3): ${topPvqNames.join(', ')}
- Ведущий архетип (вычислен детерминированно из VIA + PVQ, НЕ придумывай свой): ${archetype ? `${archetype.nameRu} — суперсила: ${archetype.superpower}` : 'не определён'}
- Глубинная сессия: ${deepSessionPrompt}
- Кандидаты профессий (уже детерминированно отобраны по профилю ученика из базы — используй ТОЛЬКО эти названия, ДОСЛОВНО, ничего не выдумывай):
${professionCandidatesForLlm}

Правила формирования отчета:
1. Сопоставьте ведущие интересы RIASEC с профессиональными рекомендациями.
2. Проанализируйте Big Five черты.
3. Опишите сильные стороны и зоны развития с учетом прокрастинации (если балл прокрастинации выше 12, дайте совет, как с этим справляться) и логических задач. КРИТИЧЕСКИ ВАЖНО: НИКОГДА не давайте абсолютных оценок интеллекта или чисел вида "X из Y правильных" — только уровень готовности относительно возраста ("developing"/"solid"/"strong" переводите как "в процессе развития"/"уверенный уровень"/"сильная сторона").
4. Раздел "strengths" (сильные стороны) стройте В ПЕРВУЮ ОЧЕРЕДЬ на основе топ-5 сигнатурных сил VIA Youth, а не на общих домыслах — раскройте, как каждая сила проявляется в учебе и жизни подростка.
5. Раздел коуч-сессии ("coachSection"): КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО дословно цитировать пользователя, копировать его формулировки из чата или подписывать текст пометкой "Источник: диалог с нейрокоучем" — это не транскрипт. Вместо этого напишите синтезированный профессиональный инсайт от третьего лица в стиле executive summary психологической диагностики (уровень 16Personalities/CliftonStrengths): конкретно, без повторов, опираясь на данные коуч-диалога и цифровой профиль, но никогда не пересказывая ответы пользователя буквально. При анализе ценностей опирайтесь в первую очередь на топ-3 ценности по тесту PVQ Шварца (см. данные выше), а качественные слова коуча используйте как дополнение, а не замену.
6. Раздел "professions": для КАЖДОГО кандидата из списка выше (используй название ДОСЛОВНО, не переименовывай и не добавляй своих) напиши персональное поле 'why' — 1-2 предложения о том, как в этой профессии сходятся интересы (RIASEC), характер (Big Five) и формула успеха именно этого подростка. Не выдумывай профессии вне списка кандидатов.
7. Раздел "innerConflicts": если индекс согласованности ниже "high" (см. данные выше), заполните его 1-3 пунктами — по каждому обнаруженному противоречию сформулируйте тёплый, любопытный (не осуждающий) вопрос-наблюдение в стиле "Тест показал X, но ты говорил Y — как это уживается в тебе?", используя фактические данные из списка противоречий выше. Если индекс "high" и противоречий нет — верните пустой массив.
8. Раздел "professions": вместо привязки только к должностям, объясняйте в 'why' связь профессии с формулой успеха (3 компетенции выше), когда это уместно — подчеркните, что эти компетенции переносятся между профессиями, если технологии изменят конкретные роли.
9. КРИТИЧЕСКИ ВАЖНО: Нигде в текстах отчета НЕ должно встречаться аббревиатура 'ИИ' или словосочетание 'искусственный интеллект'. Заменяйте их на 'алгоритмы', 'автоматизация', 'цифровые системы'.
10. Раздел "deepSession": если выше указан готовый синтез глубинной коуч-сессии — заполните "deepSession" объектом с полями synthesis (используйте готовый текст синтеза как есть или лёгкую стилистическую правку без искажения смысла, НЕ добавляя цитаты пользователя), goal, identity, firstStep (возьмите как есть из данных выше). Если глубинная сессия не проводилась — верните "deepSession": null.

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
  "riasecSummary": "Краткое описание ведущих типов интересов, упомяните код Холланда «${hollandCode}» как \"твой код призвания\".",
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
  ],
  "consistencyLevel": "${consistency.level}",
  "innerConflicts": [
    {
      "title": "Короткий заголовок противоречия",
      "text": "Тёплый вопрос-наблюдение по формату из правила 7"
    }
  ],
  "deepSession": ${deepSessionForReport ? '{ "synthesis": "...", "goal": "...", "identity": "...", "firstStep": "..." }' : 'null'}
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
          },
          consistencyLevel: { type: "STRING" },
          innerConflicts: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                title: { type: "STRING" },
                text: { type: "STRING" }
              },
              required: ["title", "text"]
            }
          },
          deepSession: {
            type: "OBJECT",
            nullable: true,
            properties: {
              synthesis: { type: "STRING" },
              goal: { type: "STRING" },
              identity: { type: "STRING" },
              firstStep: { type: "STRING" }
            }
          }
        },
        required: [
          "studentName", "heroSummary", "personalityTraits", "riasecSummary",
          "strengths", "signatureStrengths", "growthAreas", "coachSection", "professions",
          "consistencyLevel", "innerConflicts"
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
        htmlReportContent = JSON.stringify({
          ...resultJson,
          riasecScores: finalRiasec,
          hollandCode,
          successFormula: { skills: skillFormulaSkills, applications: skillFormulaApplications },
          topValues: topPvqNames,
          topValueScores: topPvqValueScores,
          icarSubscales: icarScores.bySubscale,
          // §11.6: раздел профессий детерминирован (топ-20 из базы), а не свободная
          // генерация модели — имена всегда совпадают с базой, why персонализирован
          // моделью там, где она написала про это же название, иначе текст из базы.
          professions: buildReportProfessions((resultJson as any)?.professions),
          // Переопределяем детерминированно: не полагаемся на то, что модель дословно
          // скопирует уже готовый синтез без искажений/добавления цитат.
          deepSession: deepSessionForReport,
          innerConflicts: innerConflictsForReport,
          archetype: archetype ? { nameRu: archetype.nameRu, superpower: archetype.superpower, evidence: archetype.evidence } : null,
          // P0.2 (аудит характеристик): раньше digitalProfile.summary считался и
          // сохранялся в БД, но никогда не долетал до отчёта. Прокидываем сюда
          // заполненность профиля по слоям и новые валидные шкалы (Grit/Mindset/
          // TEIQue-SF, контекст), которых нет больше нигде в отчёте.
          profileCoverage: summaryProfile.coverage,
          innerCompass: {
            grit: growthScores.GRIT,
            mindsetGrowth: growthScores.MINDSET,
            teiqueSelfAwareness: growthScores.TEIQUE_SA,
            teiqueSelfRegulation: growthScores.TEIQUE_SR,
          },
          resourceMap: contextScores,
          methodologyProfile,
          isFallback: false
        });
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
          // §11.6: даже в фолбэке (сбой генерации) профессии детерминированы —
          // топ-20 из базы по реальному профилю, а не два захардкоженных примера.
          professions: buildReportProfessions(null),
          consistencyLevel: consistency.level,
          innerConflicts: innerConflictsForReport,
          archetype: archetype ? { nameRu: archetype.nameRu, superpower: archetype.superpower, evidence: archetype.evidence } : null,
          // Простой структурный passthrough без дополнительного вызова ИИ — синтез уже
          // готов из deepReportSummary (см. app/api/v1/coach/chat/route.ts).
          deepSession: deepSessionForReport,
          isFallback: true
        };
        htmlReportContent = JSON.stringify({
          ...fallbackReport,
          riasecScores: finalRiasec,
          hollandCode,
          successFormula: { skills: skillFormulaSkills, applications: skillFormulaApplications },
          topValues: topPvqNames,
          topValueScores: topPvqValueScores,
          icarSubscales: icarScores.bySubscale,
          profileCoverage: summaryProfile.coverage,
          innerCompass: {
            grit: growthScores.GRIT,
            mindsetGrowth: growthScores.MINDSET,
            teiqueSelfAwareness: growthScores.TEIQUE_SA,
            teiqueSelfRegulation: growthScores.TEIQUE_SR,
          },
          resourceMap: contextScores,
          methodologyProfile,
        });
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
