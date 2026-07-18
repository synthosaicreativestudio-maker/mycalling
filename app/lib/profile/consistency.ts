import { detectDreamRiasecCodes } from '../../data/dreamCategories';
import { pvqValues } from '../../data/pvqValues';

export interface Contradiction {
  code: string;
  testFact: string;
  coachFact: string;
  probe: string;
  weight: number;
}

export interface ConsistencyResult {
  index: number;
  level: 'high' | 'medium' | 'low';
  contradictions: Contradiction[];
}

export interface ConsistencyCoachData {
  dreams?: string;
  values?: string;
  deepIdentity?: string;
  deepActions?: string;
  deepFirstStep?: string;
}

export interface ConsistencyViaScores {
  [strengthCode: string]: number | string[] | undefined;
  signatureStrengths?: string[];
}

export interface ConsistencyProfile {
  riasec: Record<string, number>;
  bigFive: Record<string, number | boolean>;
  procrastination: number;
  via?: ConsistencyViaScores | undefined;
  /** Русские названия топ-3 ценностей PVQ Шварца (см. app/data/pvqValues.ts). */
  topPvqValues?: string[];
  coachData: ConsistencyCoachData;
}

const TEAM_WORDS = ['команд', 'общени', 'сцен', 'блогер', 'публичн', 'люди', 'коллектив', 'тусовк', 'выступлен'];
const SOLITUDE_WORDS = ['люблю один', 'наедине с собой', 'тишин', 'не люблю толп', 'интроверт'];
const DISCIPLINE_WORDS = ['дисциплин', 'режим', 'каждый день', 'по расписанию', 'систематич'];
const LEADER_WORDS = ['лидер', 'капитан', 'организатор', 'веду за собой', 'управля'];

function includesAny(text: string, words: string[]): boolean {
  const lower = text.toLowerCase();
  return words.some((w) => lower.includes(w));
}

function combinedCoachText(coachData: ConsistencyCoachData): string {
  return [coachData.dreams, coachData.values, coachData.deepIdentity, coachData.deepActions]
    .filter(Boolean)
    .join(' ');
}

/**
 * Индекс согласованности: сравнивает количественные данные тестов с качественными
 * данными коуч-сессии по пяти детерминированным правилам. Каждое найденное
 * противоречие снижает индекс и порождает готовый уточняющий вопрос для Романа.
 */
export function computeConsistency(profile: ConsistencyProfile): ConsistencyResult {
  const contradictions: Contradiction[] = [];
  const text = combinedCoachText(profile.coachData);

  const E = typeof profile.bigFive.E === 'number' ? profile.bigFive.E : undefined;
  const C = typeof profile.bigFive.C === 'number' ? profile.bigFive.C : undefined;

  // Правило 1: экстраверсия по тесту противоречит заявленному стилю общения.
  if (E !== undefined) {
    if (E < 2.5 && includesAny(text, TEAM_WORDS)) {
      contradictions.push({
        code: 'extraversion-vs-teamwork',
        testFact: `Экстраверсия по Big Five: ${E}/5 (низкая)`,
        coachFact: 'В разговоре упоминает командную работу/общение/публичность',
        probe: 'Тест показывает, что тебе комфортнее в тишине наедине с собой, но ты говорил, что любишь командную работу. Как эти две суперсилы уживаются в тебе?',
        weight: 2,
      });
    } else if (E > 3.5 && includesAny(text, SOLITUDE_WORDS)) {
      contradictions.push({
        code: 'extraversion-vs-solitude',
        testFact: `Экстраверсия по Big Five: ${E}/5 (высокая)`,
        coachFact: 'В разговоре говорит, что предпочитает тишину и уединение',
        probe: 'Тест показал высокую общительность, но ты говоришь, что любишь работать один. Расскажи, когда тебе нужно одно, а когда — другое?',
        weight: 2,
      });
    }
  }

  // Правило 2: добросовестность по тесту противоречит заявленной дисциплине.
  if (C !== undefined && C < 2.5 && includesAny(text, DISCIPLINE_WORDS)) {
    contradictions.push({
      code: 'conscientiousness-vs-discipline',
      testFact: `Добросовестность по Big Five: ${C}/5 (низкая)`,
      coachFact: 'В разговоре заявляет о железной дисциплине и режиме',
      probe: 'Ты говоришь о дисциплине и режиме, а тест показывает, что органайзинг пока не твоя сильная сторона. Что реально помогает тебе держать слово перед собой?',
      weight: 1,
    });
  }

  // Правило 3: высокая прокрастинация при заявленной готовности начать прямо сейчас.
  if (profile.procrastination > 14 && profile.coachData.deepFirstStep && profile.coachData.deepFirstStep.trim().length > 0) {
    contradictions.push({
      code: 'procrastination-vs-first-step',
      testFact: `Балл прокрастинации: ${profile.procrastination}/20 (высокий)`,
      coachFact: 'Назвал конкретный первый шаг, который готов сделать прямо сейчас',
      probe: 'Тест по прокрастинации показывает, что начинать бывает трудно, а ты уже назвал свой первый шаг. Что поможет тебе не отложить именно его?',
      weight: 1,
    });
  }

  // Правило 4: ведущий RIASEC-код не пересекается с ключевыми словами мечты.
  const leadingRiasec = Object.entries(profile.riasec).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (leadingRiasec && profile.coachData.dreams) {
    const dreamCodes = detectDreamRiasecCodes(profile.coachData.dreams);
    if (dreamCodes.length > 0 && !dreamCodes.includes(leadingRiasec)) {
      contradictions.push({
        code: 'riasec-vs-dream',
        testFact: `Ведущий тип интересов по тесту: ${leadingRiasec}`,
        coachFact: `Мечта/цель указывает на другую сферу: «${profile.coachData.dreams}»`,
        probe: 'Тест показал одни ведущие интересы, а твоя мечта тянет совсем в другую сторону. Что тебя туда притягивает?',
        weight: 1,
      });
    }
  }

  // Правило 5: сигнатурные силы VIA не включают лидерство/командность при заявленной лидерской идентичности.
  const identity = profile.coachData.deepIdentity ?? '';
  if (profile.via?.signatureStrengths && identity && includesAny(identity, LEADER_WORDS)) {
    const hasLeadershipStrength = profile.via.signatureStrengths.some((s) => s === 'leadership' || s === 'teamwork');
    if (!hasLeadershipStrength) {
      contradictions.push({
        code: 'via-vs-leader-identity',
        testFact: `Топ-5 сильных сторон по VIA не включает лидерство/командность: ${profile.via.signatureStrengths.join(', ')}`,
        coachFact: `Описывает себя через лидерскую роль: «${identity}»`,
        probe: 'Ты называешь себя лидером, но твои главные сильные стороны по тесту — другие. Через что ты на самом деле ведёшь за собой людей?',
        weight: 1,
      });
    }
  }

  // Правило 6: топ-3 ценности PVQ не находят отклика ни в одном ключевом слове из values коуча.
  if (profile.topPvqValues && profile.topPvqValues.length > 0 && profile.coachData.values && profile.coachData.values.trim().length > 3) {
    const valuesText = profile.coachData.values.toLowerCase();
    const topDefs = pvqValues.filter((v) => profile.topPvqValues!.includes(v.nameRu));
    const hasOverlap = topDefs.some((v) => v.keywords.some((kw) => valuesText.includes(kw)));
    if (topDefs.length > 0 && !hasOverlap) {
      contradictions.push({
        code: 'pvq-vs-stated-values',
        testFact: `Топ-3 ценности по PVQ: ${profile.topPvqValues.join(', ')}`,
        coachFact: `В разговоре о ценностях назвал другое: «${profile.coachData.values}»`,
        probe: 'Тест по ценностям показал одно, а когда мы говорили об этом напрямую, ты назвал другое. Какое из этих двух сейчас важнее для тебя?',
        weight: 1,
      });
    }
  }

  const index = Math.max(0, 100 - contradictions.reduce((sum, c) => sum + c.weight * 15, 0));
  const level: ConsistencyResult['level'] = index >= 75 ? 'high' : index >= 50 ? 'medium' : 'low';

  return { index, level, contradictions };
}
