# Покрытие характеристик из «характеристики для сбора.doc/.pages» — 19.07.2026

Сверка полного списка параметров (7 слоёв методологического аудита) с текущей
реализацией: где спрашивается, попадает ли в `DigitalProfile.summary`
(`app/lib/profile/layers.ts`) и показывается ли в `/report`.

Легенда источника: **коуч** — извлекается ИИ-коучем из диалога;
**тест: XXX** — короткая психометрическая шкала в `app/data/questions.ts`;
**нет** — поле есть в схеме, но никто его не заполняет.

После правок 19.07.2026 добавлены тесты `GROWTH` («Внутренний компас»: Grit-S,
Growth Mindset, TEIQue-SF) и `CONTEXT` («Карта ресурсов»), починены агрегаты
VIA (`viaWisdom`…`viaTranscendence`), и `DigitalProfile.summary` (coverage +
GROWTH/CONTEXT) выведен в `/report` через `ValueBars`.

> **По состоянию на:** 19.07.2026, после `docs/20-blueprint-my-proposal-2026-07-19.md`
> (архитектурный blueprint и решения ADD/DERIVE/DROP по всем оставшимся
> «TODO: нет источника» полям). Эта таблица фиксирует состояние ДО реализации
> Фазы 1-5+4b из `docs/20` — актуальные решения по каждому полю см. там; здесь
> добавлена только колонка «решение» ниже, чтобы не дублировать план.
>
> **Журнал правок:** 19.07.2026 — синхронизировано с решением по когнитивному
> кластеру (Фаза 4b, см. ниже), добавлена колонка «решение» для категории
> «собрано, но не отрисовано».

## I. Интересы и склонности

| Поле схемы | Источник | В отчёте |
|---|---|---|
| riasec (6 шкал) | тест: RIASEC | да (RIASEC Summary, код Холланда) |
| hollandCode | тест: RIASEC | да |
| antiInterests | коуч (Д-7) | нет (собрано, не отрисовано) |
| hobbies | коуч (voluntaryHobbies) | нет (собрано, не отрисовано) |
| cabinVisualArt / cabinPerformingArt | **нет** | — |
| subjectSTEM / subjectHumanities / subjectBioChem | **нет** | — |
| digitalInterests | **нет** | — |

## II. Личность и трейты

| Поле схемы | Источник | В отчёте |
|---|---|---|
| bigFive (O/C/E/A/N) | тест: BFI | да (personalityTraits) |
| locusOfControl, ambiguityTolerance | тест: BFI | нет (собрано, не отрисовано) |
| honestyFlag | тест: BFI | нет (используется для reliability, не отображается) |
| teiqueSelfAwareness / teiqueSelfRegulation | тест: GROWTH (новое) | да (Внутренний компас) |
| grit | тест: GROWTH (новое) | да (Внутренний компас) |
| mindsetGrowth | тест: GROWTH (новое) | да (Внутренний компас) |
| teiqueSocialSkills, teiqueMotivation, proactivity, selfControl, stressEvaluation, emotionalReactivity, mindsetOptimism, locusControlInternal | **нет** | — |

## III. Сильные стороны (VIA Youth, 24+6)

| Поле схемы | Источник | В отчёте |
|---|---|---|
| via (24 подшкалы) | тест: VIA | да (signatureStrengths) |
| signatureStrengths (топ-5) | тест: VIA | да |
| viaWisdom…viaTranscendence (6 добродетелей) | тест: VIA, агрегат (исправлено 19.07) | нет (посчитано, не отрисовано — низкий приоритет, дублирует signatureStrengths) |

## IV. Когнитивный профиль

| Поле схемы | Источник | В отчёте |
|---|---|---|
| icar (raw + 3 подшкалы + band) | тест: ICAR | да (ValueBars) |
| execInhibition, execFlexibility, learnDeep, learnSurface, selfEfficacyAcademic, metacogPlanning, metacogMonitoring, curiosityEpistemic | **решение изменено 19.07.2026**: не лицензированный BRIEF/MSLQ, а новый тест `COGNITIVE_STYLE` («Стиль мышления») — 14 собственных пунктов, 8 конструктов, см. Фазу 4b в `docs/20` | план (Фаза 4b) |
| cogAiLiteracy | DROP (`docs/20`) — низкий приоритет для профориентации 13-17 лет, не блокирует ядро продукта | — |

## V. Мотивация и ценности

| Поле схемы | Источник | В отчёте |
|---|---|---|
| coachValues, dreams | коуч | да (coachSection / heroSummary) |
| pvq (10 ценностей) | тест: PVQ | да (Ведущие ценности) |
| topValues | тест: PVQ | да |
| Ведущий архетип (Юнг/Пирсон-Марр) | детерминированно из VIA+PVQ (`archetype.ts`) | да |

## VI. Социальное взаимодействие

| Поле схемы | Источник | В отчёте |
|---|---|---|
| belbinLeader/Doer/Creator/Peacemaker | коуч | нет (собрано, не отрисовано) |
| assertiveness, empatheticListening, feedbackSkill, conflictResolution, peerFriendships, groupBelonging, parentalInfluence, mentorInfluence, socialCapital | **нет** | — |
| bullyingResistance, peerDependence | **нет** — чувствительные конструкты, требуют консультации психолога-методолога перед автоматизацией | — |

## VII. Поведенческие паттерны

| Поле схемы | Источник | В отчёте |
|---|---|---|
| procrastination | тест: PROCRASTINATION (Лэй) | нет (собрано, не отрисовано) |
| deepActions, deepFirstStep | коуч (DEEP) | да (Глубинная сессия) |
| savickasConcern/Control/Curiosity/Confidence | коуч | нет (собрано, не отрисовано) |
| perfectionismBarrier, fearOfFailure, decisionRational/Intuitive/Dependent/Impulsive, resilienceFailure, learningFromMistakes, timeManagement, routineDiscipline, balanceWorkRest, digitalHygiene, contentCreationStyle, cyberSocialization, aiCollaboration | **нет** | — |

## VIII. Контекст и ограничения

| Поле схемы | Источник | В отчёте |
|---|---|---|
| age, grade, city, idols, barriers | коуч | частично (idols/barriers в heroSummary/innerConflicts) |
| familyPressure, familyFinance, mobility, health, educationEnvAvail, careerReadiness, digitalDivide | тест: CONTEXT (новое) | да (Карта ресурсов) |
| grades (объективная успеваемость), limitingBeliefs | **нет** | — |

## Триангуляция и метаданные

| Поле | Источник | В отчёте |
|---|---|---|
| Индекс согласованности (consistency) | `computeConsistency()` из RIASEC/BFI/VIA/PVQ vs коуч | да (innerConflicts, consistencyLevel) |
| Coverage по слоям (0-1) | `computeCoverage()` | да (Карта заполненности профиля, новое 19.07) |

## Итог

- **Полностью реализовано и видно пользователю**: RIASEC, Big Five, ICAR, VIA
  (топ-5), PVQ, архетип, триангуляция, DEEP-сессия, Grit/Mindset/TEIQue
  (новое), Карта ресурсов (новое), заполненность профиля (новое).
- **Собрано, но не отрисовано** (решение по каждому полю — `docs/20`):

  | Поле | Решение |
  |---|---|
  | antiInterests, hobbies | DERIVE в отчёт (см. `docs/20`, без новых вопросов) |
  | belbin-роли (Leader/Doer/Creator/Peacemaker) | DERIVE в отчёт |
  | savickas-шкалы (Concern/Control/Curiosity/Confidence) | DERIVE в отчёт |
  | VIA-агрегаты по 6 добродетелям | сознательно не выводится — дублирует signatureStrengths, низкий приоритет |
  | procrastination score | DERIVE в отчёт |

- **Не собирается вообще (~24 поля идут в работу по `docs/20`, остальные — DROP/NO-AUTO)**:
  9 полей уходят в расширение теста GROWTH (ADD), 9 полей (8 конструктов) — в
  новый тест `COGNITIVE_STYLE` (Фаза 4b), 6 полей — DERIVE без новых вопросов.
  `cogAiLiteracy`, `balanceWorkRest`, `grades` — DROP (низкий приоритет).
  `bullyingResistance`, `peerDependence` — NO-AUTO, требуют участия
  психолога-методолога до автоматизации. Полный постатейный список решений —
  `docs/20-blueprint-my-proposal-2026-07-19.md` §1-2; список полей всё ещё без
  решения — в комментариях `app/lib/profile/layers.ts` (маркер
  `// TODO: нет источника`), но после `docs/20` таких почти не осталось.
