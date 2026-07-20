// API Route — Server Side Only (НЕ ставить "use client" — это ломает серверные модули!)

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { z } from 'zod';
import prisma from '../../../../lib/prisma';
import { auth } from '../../../../lib/auth';
import { generateText, generateJson } from '../../../../lib/gemini';
import { modulesConfig } from '../../../../config/modules';
import {
  FALLBACK_REPLIES,
  isValidName,
  getSystemPrompt
} from '../../../../lib/coach/prompts';
import {
  sendTelegramNotification,
  sendTelegramReportToUser,
  sendMaxReportToUser,
  sendMaxIdSync
} from '../../../../lib/coach/notifications';
import { fallbackExtract } from '../../../../lib/coach/extraction';

// ============================
// ГЛАВНЫЙ ОБРАБОТЧИК ДИАЛОГА
// ============================

// Optimistic-locking запись CoachSession: защищает от гонки параллельных запросов
// (двойной клик, ретрай сети, две вкладки), которая раньше могла молча откатывать
// extractedData (в т.ч. прогресс Пирамиды Идентичности) к более старой версии.
async function saveCoachSession(
  id: string,
  expectedVersion: number,
  data: Record<string, any>
): Promise<number> {
  const result = await prisma.coachSession.updateMany({
    where: { id, version: expectedVersion },
    data: { ...data, version: { increment: 1 } }
  });

  if (result.count > 0) {
    return expectedVersion + 1;
  }

  // Конфликт версий: кто-то другой успел записать раньше. Перечитываем актуальную
  // версию и повторяем запись один раз поверх неё (наши данные важнее, т.к. это
  // самый свежий по времени обработки запрос), а не молча теряем текущий прогресс.
  const fresh = await prisma.coachSession.findUnique({ where: { id }, select: { version: true } });
  const freshVersion = fresh?.version ?? expectedVersion;
  await prisma.coachSession.updateMany({
    where: { id, version: freshVersion },
    data: { ...data, version: { increment: 1 } }
  });
  return freshVersion + 1;
}

const ChatRequestSchema = z.object({
  message: z.string().min(1, 'Сообщение пользователя не передано').max(10000, 'Слишком длинное сообщение'),
  sessionId: z.string().optional().nullable().transform(val => val ?? undefined),
  linkCode: z.string().optional().nullable().transform(val => val ?? undefined),
  sessionMode: z.enum(['EXPRESS', 'DEEP']).optional().nullable().transform(val => val ?? undefined),
  reset: z.boolean().optional(),
  fromLoginError: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    if (!modulesConfig.enableCoach) {
      return NextResponse.json({
        reply: "Нейрокоуч Роман временно ушел на перерыв для обновления алгоритмов. Вы можете пройти наши тесты в разделе Диагностики.",
        history: [],
        currentStep: 0
      });
    }

    const rawBody = await req.json().catch(() => ({}));
    const parseResult = ChatRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues[0]?.message || 'Некорректный формат данных запроса';
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { message, sessionId, fromLoginError, linkCode, sessionMode, reset } = parseResult.data;

    const getStrLen = (val: any): number => {
      return typeof val === 'string' ? val.trim().length : 0;
    };

    // 1. Поиск или создание сессии коуча
    let coachSession = null;
    let userId = null;

    // Сначала проверяем авторизованного пользователя через Better Auth
    const session = await auth.api.getSession({
      headers: await headers()
    });

    let authenticatedUserId = session?.user?.id || null;

    // Если куки сессии еще не применились (актуально для Vercel/HTTPS),
    // но передан linkCode, получаем userId авторизованного пользователя прямо из AuthLink
    if (!authenticatedUserId && linkCode) {
      const authLink = await prisma.authLink.findUnique({
        where: { code: linkCode }
      });
      if (authLink && authLink.status === 'COMPLETED' && authLink.userId) {
        authenticatedUserId = authLink.userId;
      }
    }

    if (authenticatedUserId) {
      const dbUser = await prisma.user.findUnique({
        where: { id: authenticatedUserId }
      });
      if (dbUser && dbUser.mergedInto) {
        console.log(`[coach/chat] Resolving chat session user ${authenticatedUserId} -> merged target ${dbUser.mergedInto}`);
        authenticatedUserId = dbUser.mergedInto;
      }
    }

    if (authenticatedUserId) {
      userId = authenticatedUserId;
      
      // Ищем текущую гостевую сессию, переданную с клиента
      let guestSession = null;
      if (sessionId) {
        guestSession = await prisma.coachSession.findUnique({
          where: { id: sessionId },
          include: { user: true }
        });
      }

      // Если гостевая сессия найдена и она принадлежит временному гостю,
      // перепривязываем ее к вошедшему пользователю (удаляя его старые сессии коуча)
      if (guestSession && guestSession.userId !== userId) {
        try {
          // Удаляем старые сессии коуча вошедшего пользователя, чтобы избежать дубликатов
          await prisma.coachSession.deleteMany({
            where: { userId }
          });
        } catch (e) {
          console.error('Failed to delete old coach session during merge:', e);
        }

        // Обновляем текущую сессию коуча, связывая ее с авторизованным пользователем
        coachSession = await prisma.coachSession.update({
          where: { id: sessionId },
          data: { userId: userId },
          include: { user: true }
        });

        // Переносим имя из гостевого профиля, если оно было введено
        if (guestSession.user.name && guestSession.user.name !== 'Гость') {
          await prisma.user.update({
            where: { id: userId },
            data: {
              name: guestSession.user.name,
              fullName: guestSession.user.fullName || guestSession.user.name
            }
          });
        }

        // Помечаем гостевого пользователя как объединенного (soft merge)
        try {
          await prisma.user.update({
            where: { id: guestSession.userId },
            data: { mergedInto: userId }
          });
        } catch (e) {
          console.error('Failed to update guest user status during merge:', e);
        }
      } else {
        // Если гостевая сессия не нуждается в слиянии, просто берем её (если она есть) или ищем по userId
        coachSession = guestSession || await prisma.coachSession.findUnique({
          where: { userId },
          include: { user: true }
        });
      }

      // ЕСЛИ ЗАПРОШЕН СБРОС (reset === true)
      if (reset && coachSession) {
        console.log(`[coach/chat] Resetting session ${coachSession.id} for user ${userId}`);
        const userPhone = coachSession.user.phone || null;
        const userName = coachSession.user.name && coachSession.user.name !== 'Гость' ? coachSession.user.name : null;
        
        coachSession = await prisma.coachSession.update({
          where: { id: coachSession.id },
          data: {
            transcript: { EXPRESS: [], DEEP: [] },
            extractedData: {
              currentStep: userName ? 2 : 1,
              maxStepReachedByMode: { EXPRESS: userName ? 2 : 1, DEEP: 0 },
              fullName: userName || 'Гость',
              phone: userPhone,
              age: null,
              grade: null,
              city: null,
              sessionMode: null,
              expressExtracted: {
                hobbies: "",
                schoolSubjects: "",
                dreams: "",
                idols: "",
                parents: "",
                fears: "",
                experience: "",
                workFormat: "",
                thinkingType: "",
                successMeasure: "",
                energySources: "",
                teamRole: "",
                autonomyStyle: "",
                values: "",
                decisionStyle: "",
                antiInterests: [],
                voluntaryHobbies: [],
                talentScores: {
                  creative: 0,
                  tech: 0,
                  analytical: 0,
                  social: 0,
                  organizational: 0,
                  startup: 0
                }
              },
              deepExtracted: {
                deepGoal: "",
                deepOutcome: "",
                deepEmotions: "",
                deepIdentity: "",
                deepBarriers: "",
                deepActions: "",
                deepFirstStep: ""
              },
              // Д-4: "адвокат дьявола" — сбрасываем guard использованных шагов
              _devilsAdvocateUsed: [],
              motivationTested: false,
              trueMotivation: ""
            },
            status: 'IN_PROGRESS',
            completedAt: null
          },
          include: { user: true }
        });
      }
    }

    // Если нет авторизованного пользователя (или не удалось объединить), ищем по sessionId
    if (!coachSession && sessionId) {
      coachSession = await prisma.coachSession.findUnique({
        where: { id: sessionId },
        include: { user: true }
      });
    }

    if (!coachSession) {
      const tempEmail = `guest_${Math.random().toString(36).substring(2, 11)}@moiprizvanie.ru`;
      const user = await prisma.user.create({
        data: {
          name: 'Гость',
          email: tempEmail,
          role: 'STUDENT'
        }
      });
      userId = user.id;

      coachSession = await prisma.coachSession.create({
        data: {
          userId: user.id,
          transcript: [],
          extractedData: { currentStep: 0, sessionMode: sessionMode || null },
          status: 'IN_PROGRESS'
        },
        include: { user: true }
      });
    } else {
      userId = coachSession.userId;
      // Если режим явно передан и еще не зафиксирован в сессии, обновляем его.
      // sessionMode — метка ПОСЛЕДНЕЙ активной сессии, а не разовый выбор навсегда:
      // пользователь может завершить EXPRESS и затем осознанно перейти в DEEP.
      const currentExtracted = (coachSession.extractedData as Record<string, any>) || {};
      if (sessionMode && currentExtracted.sessionMode !== sessionMode) {
        // Переход в DEEP после уже завершённой EXPRESS-сессии: архивируем момент
        // завершения EXPRESS и снимаем статус COMPLETED, иначе /api/auth/progress
        // продолжит считать коуч-сессию завершённой и будет уводить пользователя
        // с /coach раньше, чем он пройдёт глубокую часть.
        const switchingToDeepAfterExpress =
          sessionMode === 'DEEP' &&
          coachSession.status === 'COMPLETED' &&
          !currentExtracted.deepSessionCompletedAt;

        currentExtracted.sessionMode = sessionMode;
        const updatePayload: Record<string, any> = { extractedData: currentExtracted };
        if (switchingToDeepAfterExpress) {
          currentExtracted.expressCompletedAt = currentExtracted.expressCompletedAt || coachSession.completedAt;
          updatePayload.status = 'IN_PROGRESS';
          updatePayload.completedAt = null;
        }

        const newVersion = await saveCoachSession(coachSession.id, coachSession.version, updatePayload);
        coachSession = {
          ...coachSession,
          extractedData: currentExtracted,
          version: newVersion,
          status: switchingToDeepAfterExpress ? 'IN_PROGRESS' : coachSession.status,
          completedAt: switchingToDeepAfterExpress ? null : coachSession.completedAt
        };
      }
    }

    // Отслеживаем версию сессии локально — все дальнейшие записи идут через
    // saveCoachSession с optimistic locking, чтобы не терять прогресс на гонках.
    let sessionVersion = coachSession.version;

    let rawTranscript = coachSession.transcript;
    let expressTranscript: any[] = [];
    let deepTranscript: any[] = [];
    let transcript: any[] = [];

    if (Array.isArray(rawTranscript)) {
      expressTranscript = rawTranscript;
      deepTranscript = [];
    } else if (rawTranscript && typeof rawTranscript === 'object') {
      const obj = rawTranscript as Record<string, any>;
      expressTranscript = Array.isArray(obj.EXPRESS) ? obj.EXPRESS : [];
      deepTranscript = Array.isArray(obj.DEEP) ? obj.DEEP : [];
    }

    let rawExtractedData = (coachSession.extractedData as Record<string, any>) || {};
    let extractedData = { ...rawExtractedData };

    if (!extractedData.expressExtracted && !extractedData.deepExtracted) {
      const expressExtracted: Record<string, any> = {};
      const deepExtracted: Record<string, any> = {};
      
      const expressKeys = [
        'hobbies', 'schoolSubjects', 'dreams', 'idols', 'parents', 'fears',
        'experience', 'workFormat', 'thinkingType', 'successMeasure',
        'energySources', 'teamRole', 'autonomyStyle', 'values', 'decisionStyle'
      ];
      const deepKeys = [
        'deepGoal', 'deepOutcome', 'deepEmotions', 'deepIdentity', 'deepBarriers', 'deepActions', 'deepFirstStep'
      ];
      
      for (const k of expressKeys) {
        if (extractedData[k] !== undefined) expressExtracted[k] = extractedData[k];
      }
      for (const k of deepKeys) {
        if (extractedData[k] !== undefined) deepExtracted[k] = extractedData[k];
      }
      
      extractedData = {
        fullName: extractedData.fullName,
        phone: extractedData.phone,
        age: extractedData.age,
        grade: extractedData.grade,
        city: extractedData.city,
        sessionMode: extractedData.sessionMode || null,
        currentStep: extractedData.currentStep,
        lastStep: extractedData.lastStep,
        stepAttempts: extractedData.stepAttempts,
        preliminaryFeedback: extractedData.preliminaryFeedback,
        avatarUrl: extractedData.avatarUrl,
        
        expressStep: extractedData.sessionMode === 'DEEP' ? (extractedData.currentStep > 15 ? 15 : Math.max(2, extractedData.currentStep)) : extractedData.currentStep,
        expressStatus: (coachSession.status === 'COMPLETED' || (extractedData.sessionMode === 'DEEP' && extractedData.currentStep > 15)) ? 'COMPLETED' : 'IN_PROGRESS',
        expressExtracted,
        deepStep: extractedData.sessionMode === 'DEEP' ? extractedData.currentStep : 16,
        deepStatus: coachSession.status === 'COMPLETED' && extractedData.sessionMode === 'DEEP' ? 'COMPLETED' : 'IN_PROGRESS',
        deepExtracted
      };
    }

    const isDeepMode = extractedData.sessionMode === 'DEEP';
    transcript = isDeepMode ? deepTranscript : expressTranscript;

    // Вычисляем, какие блоки информации уже собраны
    let hasName = getStrLen(extractedData.fullName) > 1 && extractedData.fullName !== 'Гость';
    let hasPhone = !!coachSession.user.phone || !!extractedData.phone;
    let hasAge = !!extractedData.age;
    let hasGrade = !!extractedData.grade;
    let hasCity = getStrLen(extractedData.city) > 1;
    let hasPersonalInfo = hasName && hasAge && hasGrade && hasCity;
    
    // Вычисляем шаг до экстракции
    let currentStepBefore = 1;
    let nextStep = 1;

    const hasHobbies = getStrLen(extractedData.expressExtracted?.hobbies) > 6;
    const hasSchoolSubjects = getStrLen(extractedData.expressExtracted?.schoolSubjects) > 6;
    const hasDreams = getStrLen(extractedData.expressExtracted?.dreams) > 6;
    const hasIdols = getStrLen(extractedData.expressExtracted?.idols) > 6;
    const hasParents = getStrLen(extractedData.expressExtracted?.parents) > 6;
    const hasFears = getStrLen(extractedData.expressExtracted?.fears) > 6;
    const hasExperience = getStrLen(extractedData.expressExtracted?.experience) > 6;
    const hasWorkFormat = getStrLen(extractedData.expressExtracted?.workFormat) > 6;
    const hasThinkingType = getStrLen(extractedData.expressExtracted?.thinkingType) > 6;
    const hasSuccessMeasure = getStrLen(extractedData.expressExtracted?.successMeasure) > 6;
    const hasEnergySources = getStrLen(extractedData.expressExtracted?.energySources) > 6;
    const hasTeamRole = getStrLen(extractedData.expressExtracted?.teamRole) > 6;
    const hasAutonomyStyle = getStrLen(extractedData.expressExtracted?.autonomyStyle) > 6;
    const hasValues = getStrLen(extractedData.expressExtracted?.values) > 6;
    const hasDecisionStyle = getStrLen(extractedData.expressExtracted?.decisionStyle) > 6;

    let psychoBlocksCount = 0;
    if (hasHobbies) psychoBlocksCount++;
    if (hasSchoolSubjects) psychoBlocksCount++;
    if (hasDreams) psychoBlocksCount++;
    if (hasIdols) psychoBlocksCount++;
    if (hasParents) psychoBlocksCount++;
    if (hasFears) psychoBlocksCount++;
    if (hasExperience) psychoBlocksCount++;
    if (hasWorkFormat) psychoBlocksCount++;
    if (hasThinkingType) psychoBlocksCount++;
    if (hasSuccessMeasure) psychoBlocksCount++;
    if (hasEnergySources) psychoBlocksCount++;
    if (hasTeamRole) psychoBlocksCount++;
    if (hasAutonomyStyle) psychoBlocksCount++;
    if (hasValues) psychoBlocksCount++;
    if (hasDecisionStyle) psychoBlocksCount++;

    const allPsychologyCollected = hasPersonalInfo && (psychoBlocksCount >= 12);

    if (isDeepMode) {
      const hasDeepGoal = getStrLen(extractedData.deepExtracted?.deepGoal) > 1;
      const hasDeepOutcome = getStrLen(extractedData.deepExtracted?.deepOutcome) > 1;
      const hasDeepEmotions = getStrLen(extractedData.deepExtracted?.deepEmotions) > 1;
      const hasDeepIdentity = getStrLen(extractedData.deepExtracted?.deepIdentity) > 1;
      const hasDeepBarriers = getStrLen(extractedData.deepExtracted?.deepBarriers) > 1;
      const hasDeepActions = getStrLen(extractedData.deepExtracted?.deepActions) > 1;
      const hasDeepFirstStep = getStrLen(extractedData.deepExtracted?.deepFirstStep) > 1;

      if (!hasName) {
        currentStepBefore = 1;
        nextStep = 1;
      } else if (!hasPhone) {
        currentStepBefore = 2;
        nextStep = 2;
      } else if (!hasPersonalInfo) {
        currentStepBefore = 2;
        nextStep = 2;
      } else if (!allPsychologyCollected) {
        let psychoBlocksBefore = 0;
        if (hasHobbies) psychoBlocksBefore++;
        if (hasSchoolSubjects) psychoBlocksBefore++;
        if (hasDreams) psychoBlocksBefore++;
        if (hasIdols) psychoBlocksBefore++;
        if (hasParents) psychoBlocksBefore++;
        if (hasFears) psychoBlocksBefore++;
        if (hasExperience) psychoBlocksBefore++;
        if (hasWorkFormat) psychoBlocksBefore++;
        if (hasThinkingType) psychoBlocksBefore++;
        if (hasSuccessMeasure) psychoBlocksBefore++;
        if (hasEnergySources) psychoBlocksBefore++;
        if (hasTeamRole) psychoBlocksBefore++;
        if (hasAutonomyStyle) psychoBlocksBefore++;
        if (hasValues) psychoBlocksBefore++;
        if (hasDecisionStyle) psychoBlocksBefore++;

        if (psychoBlocksBefore < 13) {
          currentStepBefore = Math.min(15, 3 + psychoBlocksBefore);
        } else {
          currentStepBefore = 16;
        }
        
        nextStep = Math.min(15, 3 + psychoBlocksCount);
        if (psychoBlocksCount >= 12) {
          // Если собрано достаточно для финала экспресса, в глубоком переходим к Пирамиде (шаг 16)
          nextStep = 16;
        }
      } else if (!hasDeepGoal) {
        currentStepBefore = 16;
        nextStep = 16;
      } else if (!hasDeepOutcome) {
        currentStepBefore = 17;
        nextStep = 17;
      } else if (!hasDeepEmotions) {
        currentStepBefore = 18;
        nextStep = 18;
      } else if (!hasDeepIdentity) {
        currentStepBefore = 19;
        nextStep = 19;
      } else if (!hasDeepBarriers) {
        currentStepBefore = 20;
        nextStep = 20;
      } else if (!hasDeepActions) {
        currentStepBefore = 21;
        nextStep = 21;
      } else if (!hasDeepFirstStep) {
        currentStepBefore = 22;
        nextStep = 22;
      } else {
        currentStepBefore = 23;
        nextStep = 23;
      }
    } else {
      if (!hasName) {
        currentStepBefore = 1;
        nextStep = 1;
      } else if (!hasPhone) {
        currentStepBefore = 2;
        nextStep = 2;
      } else if (!hasPersonalInfo) {
        currentStepBefore = 2;
        nextStep = 2;
      } else {
        let psychoBlocksBefore = 0;
        if (hasHobbies) psychoBlocksBefore++;
        if (hasSchoolSubjects) psychoBlocksBefore++;
        if (hasDreams) psychoBlocksBefore++;
        if (hasIdols) psychoBlocksBefore++;
        if (hasParents) psychoBlocksBefore++;
        if (hasFears) psychoBlocksBefore++;
        if (hasExperience) psychoBlocksBefore++;
        if (hasWorkFormat) psychoBlocksBefore++;
        if (hasThinkingType) psychoBlocksBefore++;
        if (hasSuccessMeasure) psychoBlocksBefore++;
        if (hasEnergySources) psychoBlocksBefore++;
        if (hasTeamRole) psychoBlocksBefore++;
        if (hasAutonomyStyle) psychoBlocksBefore++;
        if (hasValues) psychoBlocksBefore++;
        if (hasDecisionStyle) psychoBlocksBefore++;
        
        if (psychoBlocksBefore < 13) {
          currentStepBefore = Math.min(15, 3 + psychoBlocksBefore);
        } else {
          currentStepBefore = 16;
        }
      }

      const isFinalStep = allPsychologyCollected;
      nextStep = !hasName ? 1 : (!hasPhone ? 2 : (!hasPersonalInfo ? 2 : (isFinalStep ? 16 : Math.min(15, 3 + psychoBlocksCount))));
    }

    // Защита от зависания шагов (когда ИИ-экстрактор не может надежно извлечь данные)
    let finalNextStep = nextStep;
    const isInitMessage = message === 'Начать сессию с коучем';

    if (!isInitMessage) {
      const lastStep = extractedData.lastStep || 0;
      let stepAttempts = extractedData.stepAttempts || 0;

      if (nextStep === lastStep) {
        stepAttempts++;
        if (nextStep >= 3 && nextStep <= 15) {
          if (stepAttempts >= 2) {
            const hasHobbies = getStrLen(extractedData.expressExtracted?.hobbies) > 6;
            const hasSchoolSubjects = getStrLen(extractedData.expressExtracted?.schoolSubjects) > 6;
            const hasDreams = getStrLen(extractedData.expressExtracted?.dreams) > 6;
            const hasIdols = getStrLen(extractedData.expressExtracted?.idols) > 6;
            const hasParents = getStrLen(extractedData.expressExtracted?.parents) > 6;
            const hasFears = getStrLen(extractedData.expressExtracted?.fears) > 6;
            const hasExperience = getStrLen(extractedData.expressExtracted?.experience) > 6;
            const hasWorkFormat = getStrLen(extractedData.expressExtracted?.workFormat) > 6;
            const hasThinkingType = getStrLen(extractedData.expressExtracted?.thinkingType) > 6;
            const hasSuccessMeasure = getStrLen(extractedData.expressExtracted?.successMeasure) > 6;
            const hasEnergySources = getStrLen(extractedData.expressExtracted?.energySources) > 6;
            const hasTeamRole = getStrLen(extractedData.expressExtracted?.teamRole) > 6;
            const hasAutonomyStyle = getStrLen(extractedData.expressExtracted?.autonomyStyle) > 6;
            const hasValues = getStrLen(extractedData.expressExtracted?.values) > 6;
            const hasDecisionStyle = getStrLen(extractedData.expressExtracted?.decisionStyle) > 6;

            const psychoFields = [
              { key: 'hobbies', has: hasHobbies },
              { key: 'schoolSubjects', has: hasSchoolSubjects },
              { key: 'dreams', has: hasDreams },
              { key: 'idols', has: hasIdols },
              { key: 'parents', has: hasParents },
              { key: 'fears', has: hasFears },
              { key: 'experience', has: hasExperience },
              { key: 'workFormat', has: hasWorkFormat },
              { key: 'thinkingType', has: hasThinkingType },
              { key: 'successMeasure', has: hasSuccessMeasure },
              { key: 'energySources', has: hasEnergySources },
              { key: 'teamRole', has: hasTeamRole },
              { key: 'autonomyStyle', has: hasAutonomyStyle },
              { key: 'values', has: hasValues },
              { key: 'decisionStyle', has: hasDecisionStyle }
            ];
            const firstEmpty = psychoFields.find(f => !f.has);
            if (firstEmpty) {
              if (!extractedData.expressExtracted) extractedData.expressExtracted = {};
              extractedData.expressExtracted[firstEmpty.key] = "Продолжено наставником";
              let psychoBlocksCount = 0;
              psychoFields.forEach(f => {
                if (f.key === firstEmpty.key || f.has) psychoBlocksCount++;
              });
              const isFinalStepUpdated = hasPersonalInfo && (psychoBlocksCount >= 12);
              finalNextStep = isFinalStepUpdated ? (isDeepMode ? 16 : 16) : Math.min(15, 3 + psychoBlocksCount);
            }
            stepAttempts = 0;
          }
        } else if (isDeepMode && nextStep >= 16 && nextStep <= 22) {
          if (stepAttempts >= 2) {
            const deepFields = [
              { key: 'deepGoal', step: 16, val: 'Сформулировано наставником' },
              { key: 'deepOutcome', step: 17, val: 'Образ результата принят' },
              { key: 'deepEmotions', step: 18, val: 'Вдохновение и радость' },
              { key: 'deepIdentity', step: 19, val: 'Человек, идущий к цели' },
              { key: 'deepBarriers', step: 20, val: 'Барьер осознан и принят' },
              { key: 'deepActions', step: 21, val: 'План действий составлен' },
              { key: 'deepFirstStep', step: 22, val: 'Первый шаг запланирован' }
            ];
            const currentField = deepFields.find(f => f.step === nextStep);
            if (currentField) {
              if (!extractedData.deepExtracted) extractedData.deepExtracted = {};
              extractedData.deepExtracted[currentField.key] = currentField.val;
              if (nextStep === 16) finalNextStep = 17;
              else if (nextStep === 17) finalNextStep = 18;
              else if (nextStep === 18) finalNextStep = 19;
              else if (nextStep === 19) finalNextStep = 20;
              else if (nextStep === 20) finalNextStep = 21;
              else if (nextStep === 21) finalNextStep = 22;
              else if (nextStep === 22) finalNextStep = 23;
            }
            stepAttempts = 0;
          }
        } else {
          stepAttempts = 0;
        }
      } else {
        stepAttempts = 0;
      }
      extractedData.lastStep = finalNextStep;
      extractedData.stepAttempts = stepAttempts;
    } else {
      extractedData.lastStep = nextStep;
      extractedData.stepAttempts = 0;
    }

    extractedData.currentStep = finalNextStep;

    if (isInitMessage && expressTranscript.length > 0) {
      // ПРОВЕРКА: Если канал связи только что подключили (hasPhone === true),
      // но в истории последнее сообщение — это предложение подключить канал (step === 2 и !hasPhone),
      // то мы автоматически добавляем в историю благодарность и первый вопрос (Возраст).
      const hasStep2Message = expressTranscript.some(m => m.role === 'assistant' && (m.content.includes('канал связи') || m.content.includes('Telegram или MAX ID')));
      const hasAgeMessage = expressTranscript.some(m => m.role === 'assistant' && (m.content.includes('сколько тебе лет') || m.content.includes('Сколько тебе лет')));

      if (hasPhone && hasStep2Message && !hasAgeMessage) {
        console.log('[coach/chat] Auto-transitioning to Age question after phone confirmation on init');
        
        const name = extractedData.fullName || 'друг';
        const transitionText = `Спасибо за выбор канала! 😉\n\n${name}, сколько тебе лет?`;
        const nextMsg = { role: 'assistant', content: transitionText, timestamp: new Date().toISOString() };
        
        expressTranscript.push(nextMsg);
        if (isDeepMode) {
          deepTranscript.push(nextMsg);
        }
        
        extractedData.currentStep = 2;
        extractedData.lastStep = 2;
        extractedData.stepAttempts = 0;
        
        sessionVersion = await saveCoachSession(coachSession.id, sessionVersion, {
          transcript: { EXPRESS: expressTranscript, DEEP: deepTranscript },
          extractedData: extractedData
        });

        transcript = isDeepMode ? deepTranscript : expressTranscript;
        finalNextStep = 2;
        nextStep = 2;
      }

      return NextResponse.json({
        history: isDeepMode ? deepTranscript : expressTranscript,
        sessionId: coachSession.id,
        userId: coachSession.userId,
        currentStep: nextStep,
        phoneConfirmed: hasPhone,
        sessionStatus: coachSession.status,
        extracted: extractedData
      });
    }

    // Если это самое первое сообщение — приветствуем и заключаем контракт (CLEAR / Внутренняя Игра)
    if (isInitMessage && expressTranscript.length === 0 && deepTranscript.length === 0) {
      let greeting = FALLBACK_REPLIES[0];
      if (fromLoginError) {
        greeting = 'Привет! Рад встрече. Меня зовут Роман, я твой коуч и наставник. Я вижу, ты хотел зайти в Личный кабинет, но для этого нужно сначала пройти нашу короткую сессию. Не переживай — это не скучный тест, а увлекательное исследование твоих талантов. Давай сначала познакомимся. Как мне к тебе обращаться? Напиши свое имя. 😊';
      } else if (isDeepMode && hasPersonalInfo && hasPhone) {
        greeting = 'Отличный выбор! Мы начинаем Глубокий самокоучинг по методологии «Что хочу → Действие». Наш путь состоит из 7 важных шагов: мы найдем твое истинное желание, оцифруем образ результата, подключим эмоции, поймём, каким героем этой истории ты становишься, честно назовём внутренние барьеры, составим план с KPI и зафиксируем первый шаг. \n\nДавай начнем: Что именно ты хочешь изменить, достичь или в чем реализоваться в плане будущей профессии?';
      }
      
      const newMsg = { role: 'assistant', content: greeting, timestamp: new Date().toISOString() };
      expressTranscript.push(newMsg);
      deepTranscript.push(newMsg);
      
      sessionVersion = await saveCoachSession(coachSession.id, sessionVersion, {
        transcript: { EXPRESS: expressTranscript, DEEP: deepTranscript },
        extractedData: { ...extractedData, currentStep: (isDeepMode && hasPersonalInfo && hasPhone) ? 16 : 0 },
        status: 'IN_PROGRESS'
      });

      return NextResponse.json({
        reply: greeting,
        sessionId: coachSession.id,
        userId: coachSession.userId,
        currentStep: (isDeepMode && hasPersonalInfo && hasPhone) ? 16 : 0,
        phoneConfirmed: hasPhone,
        sessionStatus: 'IN_PROGRESS',
        extracted: extractedData,
        history: isDeepMode ? deepTranscript : expressTranscript
      });
    }

    let userMsgContent = message;
    if (message === 'Телефон подтвержден через бот') {
      userMsgContent = 'Telegram-канал связи успешно подключен!';
    }

    // Добавляем сообщение пользователя в транскрипт
    if (!isInitMessage) {
      const isDuplicate = message === 'Телефон подтвержден через бот' && 
                          transcript.some(m => m.role === 'user' && m.content === 'Telegram-канал связи успешно подключен!');
      if (!isDuplicate) {
        const newUserMsg = { role: 'user', content: userMsgContent, timestamp: new Date().toISOString() };
        if (isDeepMode) {
          deepTranscript.push(newUserMsg);
          if (currentStepBefore <= 2) {
            expressTranscript.push(newUserMsg);
          }
        } else {
          expressTranscript.push(newUserMsg);
          if (currentStepBefore <= 2) {
            deepTranscript.push(newUserMsg);
          }
        }
      }
    }

    let parsedData: Record<string, any> = { shouldAdvanceStep: true };

    // ==========================================
    // ЭТАП ЭКСТРАКЦИИ
    // ==========================================
    const isPhoneConfirmedMsg = message === 'Телефон подтвержден через бот';

    if (!isInitMessage && isPhoneConfirmedMsg) {
      parsedData = { shouldAdvanceStep: true };
      const dbUser = await prisma.user.findUnique({ where: { id: coachSession.userId } });
      if (dbUser) {
        extractedData.fullName = dbUser.name;
        extractedData.phone = dbUser.phone;
      }
    } else if (!isInitMessage) {
      // Для работы fallbackExtract
      const prevHasName = getStrLen(extractedData.fullName) > 1 && extractedData.fullName !== 'Гость';
      const prevHasAge = !!extractedData.age;
      const prevHasGrade = !!extractedData.grade;
      const prevHasCity = getStrLen(extractedData.city) > 1;

      let properties: Record<string, any> = {
        shouldAdvanceStep: { type: "BOOLEAN" }
      };
      let fieldsToExtract = "shouldAdvanceStep(boolean)";

      if (currentStepBefore === 1) {
        properties.fullName = { type: "STRING" };
        fieldsToExtract += ", fullName";
      } else if (currentStepBefore === 2) {
        properties.fullName = { type: "STRING" };
        properties.age = { type: "INTEGER" };
        properties.grade = { type: "STRING" };
        properties.city = { type: "STRING" };
        fieldsToExtract += ", fullName, age, grade, city";
      } else if (currentStepBefore >= 3 && currentStepBefore <= 15) {
        properties.hobbies = { type: "STRING" };
        properties.schoolSubjects = { type: "STRING" };
        properties.dreams = { type: "STRING" };
        properties.idols = { type: "STRING" };
        properties.parents = { type: "STRING" };
        properties.fears = { type: "STRING" };
        properties.experience = { type: "STRING" };
        properties.workFormat = { type: "STRING" };
        properties.thinkingType = { type: "STRING" };
        properties.successMeasure = { type: "STRING" };
        properties.energySources = { type: "STRING" };
        properties.teamRole = { type: "STRING" };
        properties.autonomyStyle = { type: "STRING" };
        properties.values = { type: "STRING" };
        properties.decisionStyle = { type: "STRING" };
        
        properties.talentScores = {
          type: "OBJECT",
          properties: {
            creative: { type: "INTEGER", description: "Оценка склонности к творчеству от 0 до 100." },
            tech: { type: "INTEGER", description: "Оценка склонности к технологиям от 0 до 100." },
            analytical: { type: "INTEGER", description: "Оценка склонности к аналитике от 0 до 100." },
            social: { type: "INTEGER", description: "Оценка склонности к коммуникации от 0 до 100." },
            organizational: { type: "INTEGER", description: "Оценка склонности к организации от 0 до 100." },
            startup: { type: "INTEGER", description: "Оценка склонности к лидерству и продажам от 0 до 100." }
          }
        };

        // Шкалы Белбина для подростков (0-100)
        properties.belbinLeader = { type: "INTEGER", description: "Склонность к роли Лидера/Координатора в команде (0-100)." };
        properties.belbinDoer = { type: "INTEGER", description: "Склонность к роли Исполнителя/Рабочей пчелы (0-100)." };
        properties.belbinCreator = { type: "INTEGER", description: "Склонность к роли Генератора идей (0-100)." };
        properties.belbinPeacemaker = { type: "INTEGER", description: "Склонность к роли Миротворца/Сглаживателя углов (0-100)." };

        // Карьерная адаптивность Савикаса (0-100)
        properties.savickasConcern = { type: "INTEGER", description: "Забота о будущем и планирование карьеры (0-100)." };
        properties.savickasControl = { type: "INTEGER", description: "Контроль и ответственность за свой выбор (0-100)." };
        properties.savickasCuriosity = { type: "INTEGER", description: "Любознательность в поиске профессий (0-100)." };
        properties.savickasConfidence = { type: "INTEGER", description: "Уверенность в преодолении барьеров (0-100)." };

        // Статус идентичности по Марсии
        properties.marciaStatus = { type: "STRING", description: "Статус выбора: 'DIFFUSION' (нет целей), 'FORECLOSURE' (навязано родителями), 'MORATORIUM' (в поиске), 'ACHIEVEMENT' (осознанно)." };

        // Эмоциональный интеллект TEIQue (0-100)
        properties.teiqueSelfAwareness = { type: "INTEGER", description: "Эмоциональное самосознание (0-100)." };
        properties.teiqueSelfRegulation = { type: "INTEGER", description: "Саморегуляция эмоций (0-100)." };

        // Д-7: анти-интересы и добровольные хобби
        properties.antiInterests = {
          type: "ARRAY",
          items: { type: "STRING" },
          description: "Список вещей, которые подросток категорически НЕ любит. Если нет — пустой массив."
        };
        properties.voluntaryHobbies = {
          type: "ARRAY",
          items: { type: "STRING" },
          description: "Занятия, которыми занимается добровольно. Если нет — пустой массив."
        };

        // Д-4: результат техники "адвокат дьявола"
        properties.motivationTested = { type: "BOOLEAN", description: "true, только если коуч оспаривал шаблонный ответ." };
        properties.trueMotivation = { type: "STRING", description: "Новая аргументация подростка после оспаривания коуча." };

        fieldsToExtract += ", hobbies, schoolSubjects, dreams, idols, parents, fears, experience, workFormat, thinkingType, successMeasure, energySources, teamRole, autonomyStyle, values, decisionStyle, talentScores, belbinLeader, belbinDoer, belbinCreator, belbinPeacemaker, savickasConcern, savickasControl, savickasCuriosity, savickasConfidence, marciaStatus, teiqueSelfAwareness, teiqueSelfRegulation, antiInterests (array), voluntaryHobbies (array), motivationTested (boolean), trueMotivation (string)";

        properties.fullName = { type: "STRING" };
        properties.age = { type: "INTEGER" };
        properties.grade = { type: "STRING" };
        properties.city = { type: "STRING" };
        fieldsToExtract += ", fullName, age, grade, city";
      } else if (isDeepMode && currentStepBefore >= 16 && currentStepBefore <= 22) {
        if (currentStepBefore === 16) {
          properties.deepGoal = { type: "STRING" };
          properties.motivationTested = { type: "BOOLEAN", description: "true, только если коуч оспаривал шаблонный ответ про цель." };
          properties.trueMotivation = { type: "STRING", description: "Новая аргументация про цель." };
          fieldsToExtract += ", deepGoal, motivationTested (boolean), trueMotivation (string)";
        } else if (currentStepBefore === 17) {
          properties.deepOutcome = { type: "STRING" };
          fieldsToExtract += ", deepOutcome";
        } else if (currentStepBefore === 18) {
          properties.deepEmotions = { type: "STRING" };
          fieldsToExtract += ", deepEmotions";
        } else if (currentStepBefore === 19) {
          properties.deepIdentity = { type: "STRING" };
          fieldsToExtract += ", deepIdentity";
        } else if (currentStepBefore === 20) {
          properties.deepBarriers = { type: "STRING", description: "Внутреннее препятствие/ограничивающее убеждение подростка на пути к цели (WOOP Obstacle, «Внутренняя игра» Голви)." };
          fieldsToExtract += ", deepBarriers";
        } else if (currentStepBefore === 21) {
          properties.deepActions = { type: "STRING" };
          fieldsToExtract += ", deepActions";
        } else if (currentStepBefore === 22) {
          properties.deepFirstStep = { type: "STRING" };
          fieldsToExtract += ", deepFirstStep";
        }

        // Колесо талантов не должно «умирать» во второй половине сессии: глубокий
        // диалог (цель, идентичность, план) богат сигналами о склонностях, поэтому
        // продолжаем оценивать talentScores и в DEEP-фазе. Обновление идёт по тому
        // же ratchet-принципу (Math.max), что и в EXPRESS — колесо только растёт.
        properties.talentScores = {
          type: "OBJECT",
          properties: {
            creative: { type: "INTEGER", description: "Оценка склонности к творчеству от 0 до 100." },
            tech: { type: "INTEGER", description: "Оценка склонности к технологиям от 0 до 100." },
            analytical: { type: "INTEGER", description: "Оценка склонности к аналитике от 0 до 100." },
            social: { type: "INTEGER", description: "Оценка склонности к коммуникации от 0 до 100." },
            organizational: { type: "INTEGER", description: "Оценка склонности к организации от 0 до 100." },
            startup: { type: "INTEGER", description: "Оценка склонности к лидерству и продажам от 0 до 100." }
          }
        };
        fieldsToExtract += ", talentScores";
      }

      const contextMessages = transcript.slice(-9, -1);
      const dialogHistory = contextMessages.length > 0
        ? contextMessages.map(m => `${m.role === 'user' ? 'Пользователь' : 'Коуч Роман'}: ${m.content}`).join('\n')
        : '- Нет предыдущих сообщений.';

      const extractionPrompt = `Ты — анализатор текста. Проанализируй сообщение пользователя в контексте диалога профориентации. Извлеки данные в формате JSON (без markdown).
Предыдущий диалог (контекст):
${dialogHistory}

Последнее сообщение пользователя: "${message}"
Текущий шаг диалога: ${currentStepBefore} (где шаги 3-15 — сбор склонностей/интересов, а 16=Что хочу/Цель, 17=Результат/Образ, 18=Эмоции, 19=Идентичность, 20=Действия/Навыки/KPI, 21=Первый шаг).
Для shouldAdvanceStep: установи true, если пользователь дал осмысленный ответ по сути текущего шага. Если пользователь уклоняется от ответа или задает встречный вопрос, установи false.
Если в схеме присутствует поле talentScores (Экспресс-коучинг, первая фаза Глубокого 3..15, а также глубокие шаги 16..21), оцени склонности пользователя по 6 шкалам (0-100) по ВСЕМУ диалогу, включая рассказ о цели, идентичности и планах. Шкалы и что на них указывает:
- creative (Креатив & Искусство): дизайн, рисование, музыка, тексты, видео, фото, мода, творчество.
- tech (Технологии & Код): программирование, IT, разработка, «своя IT-компания», сайты, приложения, роботы, гейм-дев, инженерия, компьютеры.
- analytical (Наука & Аналитика): математика, физика, химия, биология, исследования, данные, логика, формулы, анализ.
- social (Коммуникация & Люди): общение, помощь людям, обучение/преподавание, продажи, психология, медицина, блогинг, работа с людьми.
- organizational (Организация & Системы): менеджмент, порядок, процессы, планирование, администрирование, операционное руководство.
- startup (Стартап & Лидерство): своя компания/бизнес, предпринимательство, стартап, лидерство, влияние, масштаб, «создавать новое», амбиции роста и признания.
ВАЖНО: если пользователь НАЗВАЛ конкретную сферу, профессию, увлечение или цель, относящуюся к шкале, — эта шкала ОБЯЗАНА быть > 0 (как правило 40-90), НЕЛЬЗЯ ставить 0. Пример: «хочу свою IT-компанию» → tech ≥ 50 И startup ≥ 50; «своё креативное агентство» → creative ≥ 50 И startup ≥ 40; «слава, деньги, влияние» → startup ≥ 40. Строго 0 — ТОЛЬКО когда по шкале в диалоге нет вообще никаких сигналов. Запрещено ставить 50/средние «по умолчанию» без сигнала.
Если в реплике коуча Романа была фраза, оспаривающая шаблонный/социально желаемый ответ подростка (техника "адвокат дьявола", например парадоксальный вопрос вроде "а если через 5 лет это сделают алгоритмы?") и подросток на неё ответил — заполни motivationTested: true и trueMotivation переформулированной личной аргументацией подростка. Если такого оспаривания не было — верни motivationTested: false и пустую строку в trueMotivation.
Извлекай: ${fieldsToExtract}`;

      const extractionSchema = {
        type: "OBJECT",
        properties,
        required: ["shouldAdvanceStep"]
      };

      try {
        parsedData = await generateJson('Ты — система анализа диалогов.', extractionPrompt, extractionSchema, 0.1);
      } catch (err) {
        console.warn('Extraction failed, using fallback:', err);
      }

      const fallbackData = fallbackExtract(message, currentStepBefore, prevHasName, prevHasAge, prevHasGrade, prevHasCity);
      parsedData = {
        ...fallbackData,
        ...parsedData
      };

      console.log('[auth] Extraction results:', { parsed: parsedData, fallback: fallbackData });

      const cleanMessage = message.trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?\s]/g, "");
      if (cleanMessage.length < 2) parsedData.shouldAdvanceStep = false;

      if (parsedData.fullName && isValidName(parsedData.fullName)) {
        extractedData.fullName = parsedData.fullName;
      } else if (parsedData.fullName && !isValidName(parsedData.fullName)) {
        // Стоп-слово вместо имени — не продвигаем шаг
        parsedData.shouldAdvanceStep = false;
      }
      if (parsedData.age) extractedData.age = parsedData.age;
      if (parsedData.grade) extractedData.grade = parsedData.grade;
      if (parsedData.city) extractedData.city = parsedData.city;
      
      if (!extractedData.expressExtracted) extractedData.expressExtracted = {};
      if (!extractedData.deepExtracted) extractedData.deepExtracted = {};
      
      const updateExpressField = (key: string, val: any) => {
        if (val) {
          extractedData.expressExtracted[key] = (extractedData.expressExtracted[key] ? extractedData.expressExtracted[key] + '; ' : '') + val;
        }
      };
      
      updateExpressField('hobbies', parsedData.hobbies);
      updateExpressField('schoolSubjects', parsedData.schoolSubjects);
      updateExpressField('dreams', parsedData.dreams);
      updateExpressField('idols', parsedData.idols);
      updateExpressField('parents', parsedData.parents);
      updateExpressField('fears', parsedData.fears);
      updateExpressField('experience', parsedData.experience);
      updateExpressField('workFormat', parsedData.workFormat);
      updateExpressField('thinkingType', parsedData.thinkingType);
      updateExpressField('successMeasure', parsedData.successMeasure);
      updateExpressField('energySources', parsedData.energySources);
      updateExpressField('teamRole', parsedData.teamRole);
      updateExpressField('autonomyStyle', parsedData.autonomyStyle);
      updateExpressField('values', parsedData.values);
      updateExpressField('decisionStyle', parsedData.decisionStyle);

      // Д-7: анти-интересы и добровольные хобби — накопительное объединение массивов без дублей
      const updateExpressArrayField = (key: string, val: any) => {
        if (Array.isArray(val) && val.length > 0) {
          const existing: string[] = Array.isArray(extractedData.expressExtracted[key]) ? extractedData.expressExtracted[key] : [];
          const incoming = val.map((v: any) => String(v).trim()).filter(Boolean);
          extractedData.expressExtracted[key] = Array.from(new Set([...existing, ...incoming]));
        }
      };
      updateExpressArrayField('antiInterests', parsedData.antiInterests);
      updateExpressArrayField('voluntaryHobbies', parsedData.voluntaryHobbies);

      // Д-4: "адвокат дьявола" — фиксируем результат оспаривания в extractedData
      if (parsedData.motivationTested === true) {
        extractedData.motivationTested = true;
      }
      if (parsedData.trueMotivation) {
        extractedData.trueMotivation = parsedData.trueMotivation;
      }

      if (parsedData.talentScores) {
        if (!extractedData.expressExtracted.talentScores) {
          extractedData.expressExtracted.talentScores = {
            creative: 0, tech: 0, analytical: 0, social: 0, organizational: 0, startup: 0
          };
        }
        const prevScores = extractedData.expressExtracted.talentScores;
        const newScores = parsedData.talentScores;
        const updateScore = (key: string) => {
          if (typeof newScores[key] === 'number') {
            prevScores[key] = Math.max(prevScores[key] || 0, newScores[key]);
          }
        };
        updateScore('creative');
        updateScore('tech');
        updateScore('analytical');
        updateScore('social');
        updateScore('organizational');
        updateScore('startup');
        extractedData.expressExtracted.talentScores = prevScores;
      }

      // Накопление новых подростковых шкал (накопительный принцип)
      const updateMaxField = (key: string, val: any) => {
        if (typeof val === 'number') {
          extractedData.expressExtracted[key] = Math.max(extractedData.expressExtracted[key] || 0, val);
        }
      };
      
      updateMaxField('belbinLeader', parsedData.belbinLeader);
      updateMaxField('belbinDoer', parsedData.belbinDoer);
      updateMaxField('belbinCreator', parsedData.belbinCreator);
      updateMaxField('belbinPeacemaker', parsedData.belbinPeacemaker);
      
      updateMaxField('savickasConcern', parsedData.savickasConcern);
      updateMaxField('savickasControl', parsedData.savickasControl);
      updateMaxField('savickasCuriosity', parsedData.savickasCuriosity);
      updateMaxField('savickasConfidence', parsedData.savickasConfidence);
      
      updateMaxField('teiqueSelfAwareness', parsedData.teiqueSelfAwareness);
      updateMaxField('teiqueSelfRegulation', parsedData.teiqueSelfRegulation);
      
      if (parsedData.marciaStatus) {
        extractedData.expressExtracted.marciaStatus = parsedData.marciaStatus;
      }
      
      // Глубокий коучинг
      if (parsedData.deepGoal) extractedData.deepExtracted.deepGoal = parsedData.deepGoal;
      if (parsedData.deepOutcome) extractedData.deepExtracted.deepOutcome = parsedData.deepOutcome;
      if (parsedData.deepEmotions) extractedData.deepExtracted.deepEmotions = parsedData.deepEmotions;
      if (parsedData.deepIdentity) extractedData.deepExtracted.deepIdentity = parsedData.deepIdentity;
      if (parsedData.deepBarriers) extractedData.deepExtracted.deepBarriers = parsedData.deepBarriers;
      if (parsedData.deepActions) extractedData.deepExtracted.deepActions = parsedData.deepActions;
      if (parsedData.deepFirstStep) extractedData.deepExtracted.deepFirstStep = parsedData.deepFirstStep;
    }

    hasPhone = hasPhone || !!parsedData.phone;
    
    // Проверяем заполненность отдельных полей личных данных в реальном времени
    hasName = getStrLen(extractedData.fullName) > 1 && extractedData.fullName !== 'Гость';
    hasAge = !!extractedData.age;
    hasGrade = !!extractedData.grade;
    hasCity = getStrLen(extractedData.city) > 1;
    
    // Личные данные считаются полностью собранными, если есть имя, возраст, класс и город
    hasPersonalInfo = hasName && hasAge && hasGrade && hasCity;
    const updatedDreams = getStrLen(extractedData.expressExtracted?.dreams) > 6;
    const updatedIdols = getStrLen(extractedData.expressExtracted?.idols) > 6;
    const updatedParents = getStrLen(extractedData.expressExtracted?.parents) > 6;
    const updatedHobbies = getStrLen(extractedData.expressExtracted?.hobbies) > 6;
    const updatedSchoolSubjects = getStrLen(extractedData.expressExtracted?.schoolSubjects) > 6;
    const updatedFears = getStrLen(extractedData.expressExtracted?.fears) > 6;
    const updatedExperience = getStrLen(extractedData.expressExtracted?.experience) > 6;
    const updatedWorkFormat = getStrLen(extractedData.expressExtracted?.workFormat) > 6;
    const updatedThinkingType = getStrLen(extractedData.expressExtracted?.thinkingType) > 6;
    const updatedSuccessMeasure = getStrLen(extractedData.expressExtracted?.successMeasure) > 6;
    const updatedEnergySources = getStrLen(extractedData.expressExtracted?.energySources) > 6;
    const updatedTeamRole = getStrLen(extractedData.expressExtracted?.teamRole) > 6;
    const updatedAutonomyStyle = getStrLen(extractedData.expressExtracted?.autonomyStyle) > 6;
    const updatedValues = getStrLen(extractedData.expressExtracted?.values) > 6;
    const updatedDecisionStyle = getStrLen(extractedData.expressExtracted?.decisionStyle) > 6;

    // Считаем заполненные психологические блоки
    let psychoBlocks = 0;
    if (updatedHobbies) psychoBlocks++;
    if (updatedSchoolSubjects) psychoBlocks++;
    if (updatedDreams) psychoBlocks++;
    if (updatedIdols) psychoBlocks++;
    if (updatedParents) psychoBlocks++;
    if (updatedFears) psychoBlocks++;
    if (updatedExperience) psychoBlocks++;
    if (updatedWorkFormat) psychoBlocks++;
    if (updatedThinkingType) psychoBlocks++;
    if (updatedSuccessMeasure) psychoBlocks++;
    if (updatedEnergySources) psychoBlocks++;
    if (updatedTeamRole) psychoBlocks++;
    if (updatedAutonomyStyle) psychoBlocks++;
    if (updatedValues) psychoBlocks++;
    if (updatedDecisionStyle) psychoBlocks++;

    // Расчет шага строго поэтапно
    let currentVirtualStep = 1;
    let isFinalStateNow = false;

    if (isDeepMode) {
      const hasDeepGoal = getStrLen(extractedData.deepExtracted?.deepGoal) > 1;
      const hasDeepOutcome = getStrLen(extractedData.deepExtracted?.deepOutcome) > 1;
      const hasDeepEmotions = getStrLen(extractedData.deepExtracted?.deepEmotions) > 1;
      const hasDeepIdentity = getStrLen(extractedData.deepExtracted?.deepIdentity) > 1;
      const hasDeepBarriers = getStrLen(extractedData.deepExtracted?.deepBarriers) > 1;
      const hasDeepActions = getStrLen(extractedData.deepExtracted?.deepActions) > 1;
      const hasDeepFirstStep = getStrLen(extractedData.deepExtracted?.deepFirstStep) > 1;

      if (!hasName) {
        currentVirtualStep = 1;
      } else if (!hasPhone) {
        currentVirtualStep = 2;
      } else if (!hasPersonalInfo) {
        currentVirtualStep = 2;
      } else if (psychoBlocks < 12) {
        // docs/27 Трек 1 (решение B): глубокая сессия сначала собирает
        // ЭКСПРЕСС-ПОРТРЕТ (хобби, предметы, мечты, страхи, опыт… — шаги 3-15),
        // и только потом переходит к Пирамиде. Раньше этого этапа здесь не было:
        // сразу после личных данных прыгали на цель (16), из-за чего «Карта
        // талантов» оставалась пустой (интересы никто не спрашивал).
        currentVirtualStep = Math.min(15, 3 + psychoBlocks);
      } else if (!hasDeepGoal) {
        // Шкала DEEP-шагов едина с фронтендом (STEP_NAMES/степпер пирамиды):
        // 16 = Запрос, 17 = Результат, 18 = Эмоции, 19 = Идентичность,
        // 20 = Барьеры, 21 = План, 22 = Микро-шаг, 23 = Финал.
        currentVirtualStep = 16;
      } else if (!hasDeepOutcome) {
        currentVirtualStep = 17;
      } else if (!hasDeepEmotions) {
        currentVirtualStep = 18;
      } else if (!hasDeepIdentity) {
        currentVirtualStep = 19;
      } else if (!hasDeepBarriers) {
        currentVirtualStep = 20;
      } else if (!hasDeepActions) {
        currentVirtualStep = 21;
      } else if (!hasDeepFirstStep) {
        currentVirtualStep = 22;
      } else {
        currentVirtualStep = 23;
      }
      isFinalStateNow = hasPersonalInfo && hasPhone && hasDeepGoal && hasDeepOutcome && hasDeepEmotions && hasDeepIdentity && hasDeepBarriers && hasDeepActions && hasDeepFirstStep;
    } else {
      if (!hasName) {
        currentVirtualStep = 1; // Шаг знакомства (Имя)
      } else if (!hasPhone) {
        currentVirtualStep = 2; // Шаг подключения Telegram
      } else if (!hasPersonalInfo) {
        currentVirtualStep = 2; // Шаг сбора возраста, класса, города
      } else {
        // Свободный диалог длится до Шага 15 (когда собрано 13 психологических полей)
        if (psychoBlocks < 13) {
          currentVirtualStep = Math.min(15, 3 + psychoBlocks);
        } else {
          currentVirtualStep = 16; // Шаг подведения итогов (Финал)
        }
      }

      isFinalStateNow = hasPersonalInfo && hasPhone && (psychoBlocks >= 12);
      if (isFinalStateNow) {
        currentVirtualStep = 16;
      }
    }

    // Ratchet: шаг никогда не откатывается назад. currentVirtualStep выше пересчитывается
    // с нуля из наличия полей в extractedData на каждый запрос — раньше это приводило
    // к дёрганью Пирамиды Идентичности между соседними уровнями (напр. 2↔3) при гонке
    // записи в БД. Персистентный максимум фиксирует реально достигнутый прогресс.
    // Ratchet ведётся ОТДЕЛЬНО по режиму (EXPRESS/DEEP): пользователь может завершить
    // EXPRESS (шаг 16) и затем начать DEEP с шага 10 — общий ratchet ошибочно зажал бы
    // DEEP-шаг на уровне EXPRESS-финала.
    const modeKey = isDeepMode ? 'DEEP' : 'EXPRESS';
    const stepsByMode = (extractedData.maxStepReachedByMode && typeof extractedData.maxStepReachedByMode === 'object')
      ? extractedData.maxStepReachedByMode
      : {};
    const maxStepReached = typeof stepsByMode[modeKey] === 'number' ? stepsByMode[modeKey] : 0;
    currentVirtualStep = Math.max(currentVirtualStep, maxStepReached);
    stepsByMode[modeKey] = currentVirtualStep;
    extractedData.maxStepReachedByMode = stepsByMode;
    extractedData.currentStep = currentVirtualStep;

    // Обновляем пользователя при нативной регистрации
    const userUpdateData: Record<string, any> = {};
    if (extractedData.fullName && extractedData.fullName !== coachSession.user.name) {
      userUpdateData.name = extractedData.fullName;
      userUpdateData.fullName = extractedData.fullName;
    }
    if (extractedData.phone && extractedData.phone !== coachSession.user.phone) {
      const existingUser = await prisma.user.findUnique({ where: { phone: extractedData.phone } });
      if (!existingUser) {
        userUpdateData.phone = extractedData.phone;
      }
    }
    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: coachSession.userId },
        data: userUpdateData
      });
    }

    const collectedFields = [];
    const missingFields = [];

    // Заполняем собранные поля
    if (hasPersonalInfo) {
      collectedFields.push(`- Личные данные: Имя — ${extractedData.fullName || ''}, возраст/класс — ${extractedData.age || ''}, город — ${extractedData.city || ''}`);
    }
    if (hasPhone) {
      collectedFields.push(`- Канал связи: Telegram/телефон подключен и подтвержден.`);
    }
    if (updatedHobbies) {
      collectedFields.push(`- Увлечения и хобби: ${extractedData.hobbies}`);
    }
    if (updatedSchoolSubjects) {
      collectedFields.push(`- Любимые/нелюбимые предметы в школе: ${extractedData.schoolSubjects}`);
    }
    if (updatedDreams) {
      collectedFields.push(`- Мечты и образ будущего: ${extractedData.dreams}`);
    }
    if (updatedIdols) {
      collectedFields.push(`- Вдохновители и авторитеты: ${extractedData.idols}`);
    }
    if (updatedParents) {
      collectedFields.push(`- Отношения с родителями и их поддержка: ${extractedData.parents}`);
    }
    if (updatedFears) {
      collectedFields.push(`- Страхи, барьеры и сомнения в выборе: ${extractedData.fears}`);
    }
    if (updatedExperience) {
      collectedFields.push(`- Практический опыт и пробы: ${extractedData.experience}`);
    }
    if (updatedWorkFormat) {
      collectedFields.push(`- Желаемый формат работы: ${extractedData.workFormat}`);
    }
    if (updatedThinkingType) {
      collectedFields.push(`- Тип мышления: ${extractedData.thinkingType}`);
    }
    if (updatedSuccessMeasure) {
      collectedFields.push(`- Мерило успеха: ${extractedData.successMeasure}`);
    }
    if (updatedEnergySources) {
      collectedFields.push(`- Источники энергии и утомляемость: ${extractedData.energySources}`);
    }
    if (updatedTeamRole) {
      collectedFields.push(`- Командная роль: ${extractedData.teamRole}`);
    }
    if (updatedAutonomyStyle) {
      collectedFields.push(`- Отношение к автономии/правилам: ${extractedData.autonomyStyle}`);
    }
    if (updatedValues) {
      collectedFields.push(`- Ценности в работе: ${extractedData.values}`);
    }
    if (updatedDecisionStyle) {
      collectedFields.push(`- Способ принятия решений: ${extractedData.decisionStyle}`);
    }

    // Заполняем недостающие поля СТРОГО на основе текущего шага
    if (currentVirtualStep === 1) {
      missingFields.push("- Имя собеседника. Спроси, как его зовут (как к нему обращаться). Сделай это вежливо и дружелюбно.");
    } else if (currentVirtualStep === 2 && !hasPhone) {
      missingFields.push("- Подключение канала связи (Telegram или MAX ID). Предложи подростку выбрать удобный канал связи ниже (подключить Telegram или указать свой MAX ID), чтобы результаты не потерялись, и мы могли продолжить.");
    } else if (currentVirtualStep === 2 && hasPhone) {
      if (!hasAge) {
        missingFields.push("- Возраст. Спроси: «сколько тебе лет?» (мягко и прямо).");
      } else if (!hasGrade) {
        missingFields.push("- Класс. Спроси, в каком классе он учится.");
      } else if (!hasCity) {
        missingFields.push("- Город. Спроси, из какого он города.");
      }
    } else {
      // Шаг сбора психологии
      if (!updatedHobbies) {
        missingFields.push("- Увлечения и хобби (Flow state): Чем подросток обожает заниматься в свободное время, от какого дела он кайфует и теряет счет времени.");
      }
      if (!updatedSchoolSubjects) {
        missingFields.push("- Школа и предметы: Какие предметы даются легко и вызывают хоть какой-то интерес, а какие вызывают скуку или трудности.");
      }
      if (!updatedDreams) {
        missingFields.push("- Мечты и образ будущего: Кем подросток хочет быть через 10 лет без ограничений (методика WOOP / Внутренняя Игра Голви для снятия страхов и раскрытия амбиций).");
      }
      if (!updatedIdols) {
        missingFields.push("- Кумиры: Люди, блогеры, ученые или персонажи фильмов, которые вдохновляют, и какие качества в них привлекают подростка больше всего (проективная методика Strengths-Based coaching).");
      }
      if (!updatedParents) {
        missingFields.push("- Отношения с родителями и их поддержка: Как зовут родителей, какие с ними отношения, кем они видят подростка в будущем и насколько сильно влияют на его выбор.");
      }
      if (!updatedFears) {
        missingFields.push("- Страхи и барьеры: Что больше всего пугает или вызывает стресс при мысли о будущем выборе (страх ошибиться, сложность экзаменов, неопределенность).");
      }
      if (!updatedExperience) {
        missingFields.push("- Практический опыт: Был ли уже какой-то опыт проектов, подработки, кружков? Что понравилось, а от чего тошнило?");
      }
      if (!updatedWorkFormat) {
        missingFields.push("- Желаемый формат работы и среда: Офис (работа в команде, движ), удаленка/фриланс (свобода, дом) или частые командировки/полевые условия.");
      }
      if (!updatedThinkingType) {
        missingFields.push("- Тип мышления и обработки данных: Логика и формулы (технарь), образы и творчество (дизайнер/креатор) или тексты и люди (гуманитарий).");
      }
      if (!updatedSuccessMeasure) {
        missingFields.push("- Мерило успеха и амбиции: Деньги и стабильность, слава и признание, создание продукта/изменение мира, либо баланс работы и жизни.");
      }
      if (!updatedEnergySources) {
        missingFields.push("- Источники энергии и утомляемость: От чего подросток заряжается энергией (спорт, тишина, общение) и что его моментально выматывает.");
      }
      if (!updatedTeamRole) {
        missingFields.push("- Командная роль: Кто он в группе (капитан/лидер, генератор идей, ответственный исполнитель или дипломат).");
      }
      if (!updatedAutonomyStyle) {
        missingFields.push("- Отношение к автономии: Нужна ли ему полная свобода принятия решений или комфортнее работать по понятным правилам и инструкциям.");
      }
      if (!updatedValues) {
        missingFields.push("- Ценности и мотивация: Что подросток ценит в будущей работе (свобода творчества, стабильность/деньги, лидерство, помощь другим).");
      }
      if (!updatedDecisionStyle) {
        missingFields.push("- Способ принятия решений: Доверяет ли подросток логике и анализу, либо интуиции и чувствам.");
      }
    }

    const isRefusalOrEmpty = !parsedData.shouldAdvanceStep;

    // ============================================================
    // ПЕРЕХВАТ: Если регистрация завершена, но sessionMode ещё не выбран,
    // НЕ генерируем AI-ответ — даём фронтенду показать окно выбора формата.
    // ============================================================
    if (!extractedData.sessionMode && hasPersonalInfo && hasPhone && currentVirtualStep > 2) {
      // Сохраняем текущее состояние в БД
      const finalDbTranscript = {
        EXPRESS: expressTranscript,
        DEEP: deepTranscript
      };
      sessionVersion = await saveCoachSession(coachSession.id, sessionVersion, {
        transcript: finalDbTranscript,
        extractedData,
        status: 'IN_PROGRESS'
      });

      return NextResponse.json({
        sessionId: coachSession.id,
        userId: coachSession.userId,
        currentStep: currentVirtualStep,
        phoneConfirmed: hasPhone,
        sessionStatus: 'IN_PROGRESS',
        extracted: extractedData,
        history: expressTranscript,
        awaitSessionModeSelection: true
      });
    }

    // Формируем системный промпт
    const systemPrompt = getSystemPrompt(
      currentVirtualStep,
      isDeepMode,
      extractedData,
      hasPhone,
      missingFields,
      collectedFields,
      allPsychologyCollected,
      isRefusalOrEmpty
    );

    let replyContent = '';
    
    // Использовать ли ИИ-генерацию на текущем шаге
    const useAI = (currentVirtualStep >= 2 && currentVirtualStep <= 22 && hasPhone) || (currentVirtualStep >= 3 && currentVirtualStep <= 22) || currentVirtualStep === 23 || currentVirtualStep === 16;

    if (!useAI) {
      if (currentVirtualStep === 0) {
        replyContent = FALLBACK_REPLIES[0];
      } else if (currentVirtualStep === 1) {
        replyContent = FALLBACK_REPLIES[1];
      } else if (currentVirtualStep === 2) {
        if (!hasPhone) {
          replyContent = FALLBACK_REPLIES[2];
        }
      }
    } else {
      try {
        replyContent = await generateText(systemPrompt, transcript, 0.7);
      } catch (err) {
        console.warn('AI chat generation failed, using fallback:', err);
        replyContent = FALLBACK_REPLIES[currentVirtualStep] || 'Давай продолжим наш диалог!';
      }
    }

    if (isPhoneConfirmedMsg) {
      replyContent = "Отлично! Telegram-канал связи успешно подключен. " + replyContent;
    }

    // Сохраняем предварительное резюме в БД на шаге 16 и генерируем аватар
    let completedAt = coachSession.completedAt;
    let status = coachSession.status;
    if (isFinalStateNow && status !== 'COMPLETED') {
      status = 'COMPLETED';
      completedAt = new Date();
      extractedData.preliminaryFeedback = replyContent;

      // Д-3(Блок 3): завершение глубокой сессии — собственный мини-отчёт с ownId,
      // который затем отдельным разделом попадает в финальный отчёт (см.
      // next-question/route.ts и app/report/page.tsx). Не смешиваем его с обычным
      // preliminaryFeedback, чтобы не терять структуру полей глубинного разбора.
      if (isDeepMode) {
        extractedData.deepSessionCompletedAt = new Date().toISOString();
        const deep = extractedData.deepExtracted || {};
        let deepSynthesis = replyContent;
        try {
          const deepSummarySystem = 'Ты — экспертный психолог-коуч. На основе глубинной коуч-сессии подростка по методологии «Хочу → Действие» напиши краткое профессиональное резюме (4-6 предложений) от третьего лица: синтезируй инсайт, не цитируй пользователя дословно, без markdown-разметки.';
          const deepSummaryUser = `Глубинная цель: ${deep.deepGoal || '—'}\nЖелаемый результат: ${deep.deepOutcome || '—'}\nЭмоциональный отклик: ${deep.deepEmotions || '—'}\nНовая идентичность: ${deep.deepIdentity || '—'}\nВнутренние барьеры: ${deep.deepBarriers || '—'}\nПлан действий: ${deep.deepActions || '—'}\nПервый микро-шаг: ${deep.deepFirstStep || '—'}`;
          deepSynthesis = await generateText(deepSummarySystem, [{ role: 'user', content: deepSummaryUser }], 0.6);
        } catch (e) {
          console.warn('Failed to generate deep session synthesis, using raw reply as fallback:', e);
        }
        extractedData.deepReportSummary = {
          id: `deep_${coachSession.id}_${Date.now()}`,
          completedAt: extractedData.deepSessionCompletedAt,
          goal: deep.deepGoal || '',
          outcome: deep.deepOutcome || '',
          emotions: deep.deepEmotions || '',
          identity: deep.deepIdentity || '',
          barriers: deep.deepBarriers || '',
          actions: deep.deepActions || '',
          firstStep: deep.deepFirstStep || '',
          synthesis: deepSynthesis
        };
      }

      // Внедряем автоопределение narrativeTheme на основе talentScores
      let narrativeTheme = 'CREATIVE';
      try {
        // Баг: talentScores лежит внутри expressExtracted, а не в корне extractedData —
        // раньше это условие всегда получало пустой объект и narrativeTheme был случайным.
        const scores = extractedData.expressExtracted?.talentScores || {};
        const maxScoreKey = Object.entries(scores).reduce(
          (max, [key, val]) => (Number(val) > max.val ? { key, val: Number(val) } : max),
          { key: 'creative', val: -1 }
        ).key;

        if (maxScoreKey === 'tech' || maxScoreKey === 'analytical') {
          narrativeTheme = 'SPACE';
        } else if (maxScoreKey === 'startup' || maxScoreKey === 'organizational') {
          narrativeTheme = 'BUSINESS';
        } else {
          narrativeTheme = 'CREATIVE';
        }
      } catch (err) {
        console.warn('Failed to calculate narrativeTheme, using fallback CREATIVE:', err);
      }
      extractedData.narrativeTheme = narrativeTheme;

      // Генерируем промпт для аватара на основе отчета
      try {
        const avatarPromptSystem = `Ты — эксперт по генерации промптов для ИИ-рисовалок (Stable Diffusion, Midjourney).
Проанализируй коучинговое резюме подростка и составь ОДИН короткий, сочный промпт на АНГЛИЙСКОМ языке (до 20 слов), который визуализирует его характер и таланты.
Подбирай художественный стиль изображения на основе психологического типа подростка:
- Если он романтик, мечтатель, гуманитарий, творческий — используй стиль: "dreamy watercolor, soft fantasy illustration, warm cinematic lighting, celestial magical art".
- Если он аналитик, логик, программист, технарь — используй стиль: "technical blueprint style, clean vector line art, minimal geometric schematics, glowing digital grid".
- Если он практик, лидер, активный организатор, бунтарь — используй стиль: "vibrant street art, bold graffiti, high-contrast energetic sketch, modern grunge illustration".
В ответе выведи только сам промпт, без кавычек, префиксов и лишнего текста.`;
        
        const aiPrompt = await generateText(avatarPromptSystem, [{ role: 'user', content: replyContent }], 0.8);
        if (aiPrompt) {
          const cleanPrompt = aiPrompt.replace(/["']/g, "").trim();
          extractedData.avatarUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=600&height=600&nologo=true&private=true`;
        }
      } catch (e) {
        console.warn('Failed to generate image avatar prompt, using fallback:', e);
        extractedData.avatarUrl = `https://image.pollinations.ai/prompt/cybernetic%20neon%20avatar%20of%20a%20young%20mind,%20digital%20art,%20futurism?width=600&height=600&nologo=true&private=true`;
      }
    }

    // Добавляем ответ коуча в транскрипт
    const coachMsg = { role: 'assistant', content: replyContent, timestamp: new Date().toISOString() };
    if (isDeepMode) {
      deepTranscript.push(coachMsg);
      if (currentVirtualStep <= 2) {
        expressTranscript.push(coachMsg);
      }
    } else {
      expressTranscript.push(coachMsg);
      if (currentVirtualStep <= 2) {
        deepTranscript.push(coachMsg);
      }
    }

    const finalDbTranscript = {
      EXPRESS: expressTranscript,
      DEEP: deepTranscript
    };

    // Сохраняем обновленную сессию в БД
    sessionVersion = await saveCoachSession(coachSession.id, sessionVersion, {
      transcript: finalDbTranscript,
      extractedData,
      status,
      completedAt
    });

    // Фоновая отправка уведомлений
    const dbUser = await prisma.user.findUnique({ where: { id: coachSession.userId } });
    if (dbUser && (parsedData.phone || isFinalStateNow)) {
      sendTelegramNotification(dbUser, extractedData).catch(err => console.error(err));
      sendMaxIdSync(dbUser, extractedData).catch(err => console.error(err));
    }
    if (dbUser && isFinalStateNow) {
      sendTelegramReportToUser(dbUser, extractedData).catch(err => console.error(err));
      sendMaxReportToUser(dbUser, extractedData).catch(err => console.error(err));
    }

    return NextResponse.json({
      reply: replyContent,
      sessionId: coachSession.id,
      currentStep: currentVirtualStep,
      phoneConfirmed: hasPhone,
      sessionStatus: status,
      extracted: extractedData,
      history: isDeepMode ? deepTranscript : expressTranscript
    });

  } catch (error: any) {
    console.error('Error in coach chat route:', error);
    return NextResponse.json({ error: error.message || 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
