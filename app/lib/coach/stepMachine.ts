/**
 * Чистая (без побочных эффектов) машина состояний коуч-сессии.
 *
 * Здесь и только здесь вычисляется номер шага диалога. Правила-инварианты:
 *
 *  1. ШАГ НИКОГДА НЕ ОТКАТЫВАЕТСЯ НАЗАД. Итоговый шаг = max(кандидат, достигнутый максимум
 *     по режиму). Кандидат считается из наличия собранных полей; ratchet защищает от
 *     «дёрганья» при мигании флагов и гонках записи в БД.
 *
 *  2. ПОДКЛЮЧЕНИЕ КАНАЛА СВЯЗИ — ОБЯЗАТЕЛЬНЫЙ ШАГ (как и работало раньше): без него
 *     сессию продолжить нельзя. НО признак «канал подключён» (channelConnected) обязан
 *     быть УСТОЙЧИВЫМ/МОНОТОННЫМ. Раньше гейт держался на `hasPhone`, который у гостя
 *     мигал (то true, то false), из-за чего шаг 2 повторно показывал приглашение
 *     подключить канал → ЗАДВОЕНИЕ ВОПРОСОВ (баг 24.07). Теперь channelConnected один раз
 *     ставится в true и больше не сбрасывается (durable-флаг в route.ts), поэтому,
 *     пройдя подключение, пользователь к нему уже не возвращается.
 *
 *  Поток: Имя(1) → Подключение канала(2) → Возраст/Класс/Город(2) → психоблоки(3..15)
 *  → финал(16). В DEEP далее Пирамида 16..23.
 *
 *  Регрессионные кейсы зафиксированы в stepMachine.test.ts.
 */

export interface DeepFlags {
  goal: boolean;
  outcome: boolean;
  emotions: boolean;
  identity: boolean;
  barriers: boolean;
  actions: boolean;
  firstStep: boolean;
}

export interface StepInput {
  isDeepMode: boolean;
  hasName: boolean;
  /** Канал связи подключён. ДОЛЖЕН быть durable/монотонным (см. инвариант 2). */
  channelConnected: boolean;
  /** Имя + возраст + класс + город собраны. */
  hasPersonalInfo: boolean;
  /** Сколько из 15 психологических блоков заполнено. */
  psychoBlocks: number;
  /** Глубокие поля (только для DEEP). */
  deep?: DeepFlags;
  /** Достигнутый максимум шага по текущему режиму (ratchet-пол). */
  maxStepReached?: number;
}

export interface StepResult {
  /** Итоговый шаг после применения ratchet (не убывает). */
  step: number;
  /** Кандидат по наличию полей (до ratchet) — для отладки/тестов. */
  candidate: number;
  /** Сессия фактически завершена (по полноте данных, без учёта ratchet). */
  isFinal: boolean;
}

const EXPRESS_LAST_QUESTION_STEP = 15;
const EXPRESS_FINAL_STEP = 16;
const EXPRESS_FINAL_BLOCKS = 12;

/**
 * Кандидат шага EXPRESS: Имя(1) → Канал(2) → Личные данные(2) → Психоблоки(3..15) → Финал(16).
 */
function expressCandidate(
  hasName: boolean,
  channelConnected: boolean,
  hasPersonalInfo: boolean,
  psychoBlocks: number
): number {
  if (!hasName) return 1;
  if (!channelConnected) return 2; // обязательное подключение канала
  if (!hasPersonalInfo) return 2;  // возраст → класс → город
  if (psychoBlocks < 13) return Math.min(EXPRESS_LAST_QUESTION_STEP, 3 + psychoBlocks);
  return EXPRESS_FINAL_STEP;
}

/**
 * Кандидат шага DEEP: сначала экспресс-портрет (Имя→Канал→Личные→психоблоки), затем
 * Пирамида 16..23.
 */
function deepCandidate(
  hasName: boolean,
  channelConnected: boolean,
  hasPersonalInfo: boolean,
  psychoBlocks: number,
  deep: DeepFlags
): number {
  if (!hasName) return 1;
  if (!channelConnected) return 2;
  if (!hasPersonalInfo) return 2;
  if (psychoBlocks < EXPRESS_FINAL_BLOCKS) return Math.min(EXPRESS_LAST_QUESTION_STEP, 3 + psychoBlocks);
  if (!deep.goal) return 16;
  if (!deep.outcome) return 17;
  if (!deep.emotions) return 18;
  if (!deep.identity) return 19;
  if (!deep.barriers) return 20;
  if (!deep.actions) return 21;
  if (!deep.firstStep) return 22;
  return 23;
}

export function deriveStep(input: StepInput): StepResult {
  const { isDeepMode, hasName, channelConnected, hasPersonalInfo, psychoBlocks, maxStepReached = 0 } = input;

  let candidate: number;
  let isFinal: boolean;

  if (isDeepMode) {
    const deep: DeepFlags = input.deep ?? {
      goal: false, outcome: false, emotions: false,
      identity: false, barriers: false, actions: false, firstStep: false,
    };
    candidate = deepCandidate(hasName, channelConnected, hasPersonalInfo, psychoBlocks, deep);
    isFinal = channelConnected && hasPersonalInfo && deep.goal && deep.outcome && deep.emotions
      && deep.identity && deep.barriers && deep.actions && deep.firstStep;
  } else {
    candidate = expressCandidate(hasName, channelConnected, hasPersonalInfo, psychoBlocks);
    isFinal = channelConnected && hasPersonalInfo && psychoBlocks >= EXPRESS_FINAL_BLOCKS;
    // Порог финала (12 блоков) ниже верха лестницы (15). При достижении финала
    // кандидат сразу становится финальным шагом 16, иначе на 12 блоках застряли бы на 15.
    if (isFinal) candidate = EXPRESS_FINAL_STEP;
  }

  const step = Math.max(candidate, maxStepReached);
  return { step, candidate, isFinal };
}
