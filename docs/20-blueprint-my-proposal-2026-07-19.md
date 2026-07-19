# МоёПризвание — Архитектурный blueprint (контрпредложение) — 19.07.2026

Контекст: в противовес `modular_architecture_blueprint.md` (VN v3.0→v4.0,
сгенерирован другим агентом вне репозитория, см. разбор проблем в чате той же
сессии). Оригинал живёт в рабочей области другого агента и может измениться —
неизменная копия заморожена в `docs/archive/modular_architecture_blueprint-VN-v4.0-2026-07-19.md`.
Этот документ — не альтернативная фантазия, а прямое продолжение работы,
сделанной сегодня (`981c16c`, `51b45c1`, `e9a0abe`) и таблицы покрытия
`docs/19-characteristics-coverage-2026-07-19.md`.

## 0. Принципы (не нарушаем ни при каких обстоятельствах)

1. **Валидность инструмента важнее визуального эффекта.** Психометрическая
   шкала (Likert 1-5) не превращается в сюжетную развилку A/Б/В — меняет
   свойства измерения, а не просто вид.
2. **Единый источник данных.** Никаких новых параллельных таблиц профиля,
   пока не наведён порядок в существующих двух (`CoachSession.extractedData`,
   `DigitalProfile.summary`) — сегодня мы уже чинили путаницу между ними.
3. **Объём — под внимание подростка, не под список "хотелок".** Каждое новое
   поле добавляется только если: (а) есть короткий валидный инструмент, (б)
   оно не дублирует уже собранное, (в) итоговое время сессии не растёт
   бесконтрольно.
4. **Этическая граница коуч/психолог.** Всё, что похоже на клиническую
   оценку (буллинг, зависимость от других, "тень" личности) — не
   автоматизируется без участия психолога-методолога, вообще.
5. **Обратимость.** Каждая фаза — отдельный PR, отдельный git push,
   проверяемый на реальных данных, прежде чем начинается следующая.

---

## 1. Что оставляем от VN-blueprint (только это, ничего больше)

| Идея | Как делаем вместо Canvas/RPG/Shadow |
|---|---|
| Атмосфера и персонаж-гид | Расширяем уже существующий `app/data/narrative.ts` — портрет Романа/Астры (2-3 эмоции, статичные webp/png, без спрайт-анимации), фон под тему главы через CSS-переменные (уже есть `[data-theme]` механизм) |
| Гибкий порядок модулей | Простая сетка карточек в `/assessment` (расширение уже существующего `CabinetProgress`-паттерна) — после Коуч Express открываются 2-3 карточки на выбор, без Canvas и "тумана войны" |
| Микро-инсайт после главы | Уже есть `outro` в `narrative.ts` — усиливаем небольшой модалкой/анимацией, не отдельным компонентом |

Всё остальное из VN-blueprint (Cyberpunk/Anime/Minimal скины, Canvas-карта,
Святилище Архетипов, 150 характеристик) — отклонено, обоснование в чате.

---

## 2. Архитектура данных — без новых таблиц

Текущее состояние (после сегодняшних правок):

```
CoachSession.extractedData   — качественные поля коуча (тексты + часть чисел)
DiagnosticResult             — сырые баллы по каждому testCode (RIASEC, BFI, ICAR, VIA, PVQ, GROWTH, CONTEXT)
DigitalProfile.summary       — агрегированный 8-слойный профиль (layers.ts), строится из двух источников выше
Report.htmlContent           — то, что видит пользователь в /report
```

**Решение:** не добавлять `ModuleProgress`, `ArchetypeSession`,
`Recommendations` как отдельные таблицы. Вместо этого:

- Прогресс по модулям тестов уже трекается через `DiagnosticResult` (есть
  запись — модуль пройден) — не нужна отдельная таблица статусов.
- "Рекомендации" (профессии, план 90 дней) — это уже часть
  `Report.htmlContent` (`professions`, `successFormula`). Если понадобится
  отдельный раздел ЛК — это **отдельный компонент чтения того же JSON**, не
  отдельная таблица БД.
- Если в будущем понадобится granular module-level прогресс (для гибкого
  хаба из §1) — это одно поле `Json?` в существующей модели пользователя
  (`user.moduleProgress`), не новая таблица с полным жизненным циклом.

---

## 3. Судьба каждого непокрытого поля (~50 полей из `layers.ts`)

Для каждого поля со статусом `TODO: нет источника` — конкретное решение.
Четыре категории: **DERIVE** (вывести из уже собранного текста, без новых
вопросов), **ADD** (короткое расширение уже существующего теста GROWTH),
**DROP** (убрать из схемы — дублирует другое поле или не даёт практической
пользы для MVP), **NO-AUTO** (не автоматизировать никогда без психолога).

### Интересы

| Поле | Решение | Как |
|---|---|---|
| cabinVisualArt, cabinPerformingArt | DROP | RIASEC (Artistic) + текстовые hobbies уже дают эту гранулярность для MVP |
| subjectSTEM, subjectHumanities, subjectBioChem | DERIVE | Классифицировать уже собранный текст `schoolSubjects` (коуч) через дешёвый LLM-вызов при построении отчёта — не новый вопрос |
| digitalInterests | DERIVE | То же самое — классификация текста `hobbies`/`interests`, не новый вопрос |

### Личность

| Поле | Решение | Как |
|---|---|---|
| teiqueSocialSkills, mindsetOptimism | ADD | +2 пункта каждый в уже существующий тест GROWTH (сейчас 12 пунктов → станет 16) |
| proactivity, selfControl | DROP | Дублируют Savickas Control/Confidence (коуч) и TEIQue self-regulation (тест) |
| stressEvaluation, emotionalReactivity | DROP | Сам методологический аудит прямо предупреждает: нейротизм/стресс у подростков завышен гормонально, нельзя использовать как ограничивающий фактор — не собираем то, чем рискованно пользоваться |
| locusControlInternal | DROP (housekeeping) | Буквальный дубль `locusOfControl` — убрать поле из схемы |

### Когнитивный профиль

**Решение изменено 19.07.2026.** BRIEF-2/MSLQ — лицензированные клинические
инструменты, копировать их пункты нельзя. Но тем же путём, каким сделан тест
GROWTH (Grit-S/Mindset/TEIQue — не копии, а свои пункты "по духу"
конструкта), делаем и здесь: собственные короткие пункты, без претензии на
клиническую валидность инструмента, с честной пометкой в `docs/19`
("собственная короткая шкала, не адаптация лицензированного теста").

| Поле | Решение | Как |
|---|---|---|
| execInhibition, execFlexibility, learnDeep, learnSurface, selfEfficacyAcademic, metacogPlanning, metacogMonitoring, curiosityEpistemic | **ADD** | Новый тест `COGNITIVE_STYLE` («Стиль мышления»), 14 собственных пунктов (2 на конструкт), см. §8 Фаза 4b |
| cogAiLiteracy | DROP | Низкий приоритет для профориентации 13-17 лет, не блокирует ядро продукта |

### Социальное взаимодействие

| Поле | Решение | Как |
|---|---|---|
| assertiveness, empatheticListening, feedbackSkill, conflictResolution | DERIVE | Классификация уже собранных текстов коуча (`teamRole`, `communicationStyle` если появится) — не новые числовые вопросы |
| peerFriendships, groupBelonging, mentorInfluence, socialCapital | DROP | Низкая практическая польза для отчёта о профориентации; часть — "взрослые" конструкты, которые исходный аудит прямо просил убрать |
| bullyingResistance, peerDependence | **NO-AUTO** | Чувствительные социально-клинические темы — не оценивать эвристикой ИИ никогда. Если продукту это нужно — отдельный модуль с участием психолога-методолога, не автоматический скоринг |
| parentalInfluence | DROP (дубль) | Уже покрыто `familyPressure` (тест CONTEXT) + текстовым `parents` (коуч) |

### Поведенческие паттерны

| Поле | Решение | Как |
|---|---|---|
| perfectionismBarrier, fearOfFailure | ADD | +3-4 пункта в GROWTH, аккуратная формулировка (не "у тебя перфекционизм", а поведенческие индикаторы) |
| resilienceFailure, learningFromMistakes | ADD | Объединить в 1 мини-шкалу (по духу CD-RISC, 2-3 пункта) в GROWTH |
| decisionRational, decisionIntuitive, decisionDependent, decisionImpulsive | DERIVE | Уже есть текстовый `decisionStyle` от коуча — классифицировать его, не спрашивать заново числом |
| timeManagement, routineDiscipline | DROP | Дублируют уже собранный `procrastination` (тест, шкала Лэя) |
| balanceWorkRest | DROP | Низкая практическая ценность для MVP-отчёта |
| digitalHygiene, contentCreationStyle, cyberSocialization, aiCollaboration | DROP | Кластер "цифровое поведение" — из тех "взрослых"/тангенциальных конструктов, которые исходный методологический аудит прямо рекомендовал убрать из MVP |

### Контекст

| Поле | Решение | Как |
|---|---|---|
| grades (объективная успеваемость) | DROP | Самоотчёт об успеваемости не объективен по определению; если понадобится — интеграция со школьным API/дневником, не опрос |
| limitingBeliefs | DROP (дубль) | Уже покрыто текстовым `barriers`/fears от коуча |

### Итог по разделу 3

- **DERIVE (6 полей)** — бесплатно с точки зрения UX (0 новых вопросов),
  требует 1 небольшой LLM-классификатор в момент построения отчёта.
- **ADD (≈18 полей)** — расширение теста GROWTH на 7-9 пунктов **плюс**
  новый тест COGNITIVE_STYLE (14 пунктов, 8 конструктов) — оба на
  собственных пунктах "по духу" конструкта, не копиях лицензированных
  инструментов.
- **DROP (≈25 полей)** — сознательно убираем из активной разработки;
  схема остаётся с комментариями `// TODO`, но не в фокусе.
- **NO-AUTO (2 поля)** — принципиальный отказ от автоматизации.
- ~~Отложено на "Фазу 2 после MVP" (9 полей, когнитивный кластер)~~ — снято
  19.07.2026: делаем собственными пунктами вместо лицензированного
  инструмента, см. когнитивный профиль выше и §8 Фаза 4b.

Результат: из ~50 непокрытых полей реальная новая работа — это **DERIVE +
ADD, суммарно ≈24 поля**: 6 DERIVE без новых вопросов, 9 ADD в GROWTH,
9 ADD (8 конструктов, 14 пунктов) в новом тесте COGNITIVE_STYLE. Прирост
времени сессии — один новый короткий тест (~3-4 мин) плюс 7-9 пунктов в уже
существующем.

---

## 4. UX-слой (лёгкая версия "новеллы")

### 4.1 Расширение `narrative.ts`
Добавить к каждой главе (`RIASEC`, `BFI`, `GROWTH`, `CONTEXT` и т.д.):
```ts
interface NarrativeChapter {
  // ...существующие поля
  guideCharacter: 'roman' | 'astra';       // кто ведёт главу
  guideEmoji: string;                       // уже есть как emoji, оставляем
  backgroundTheme: 'warm' | 'cool' | 'neutral'; // CSS-переменная фона главы
}
```
Никакого спрайт-движка — статичный портрет + CSS-фон, переключается по
`data-theme`/`data-chapter` атрибуту, как уже работает переключение
светлая/тёмная тема.

### 4.2 Гибкий хаб вместо жёсткой последовательности
`/assessment` уже показывает главы по порядку `ASSESSMENT_CHAPTER_ORDER`.
Меняем на: после `RIASEC`+`BFI` (обязательный "фундамент") — сетка карточек
оставшихся глав, пользователь кликает в любом порядке. Технически —
несколько строк логики в `assessment/page.tsx`, не новая карта/движок.

### 4.3 Психометрическая неприкосновенность
Каждый вопрос теста визуально живёт внутри карточки главы (фон, эмодзи,
цвет), но **текст вопроса и варианты ответа остаются как в
`questions.ts` — без переформулировки в "реплику героя"**. Это единственный
способ реально выполнить то, что VN-blueprint только продекларировал.

---

## 5. Фазы внедрения (реалистичные, с git push после каждой)

| Фаза | Содержание | Оценка |
|---|---|---|
| 1 | `narrative.ts`: добавить guideCharacter/backgroundTheme, статичные портреты Романа/Астры (2 позы), CSS-темизация карточек глав | 0.5-1 день |
| 2 | Гибкий хаб `/assessment` (сетка карточек вместо жёсткой последовательности после фундамента) | 0.5 дня |
| 3 | DERIVE-классификатор: 1 LLM-вызов на этапе построения отчёта, извлекающий subjectSTEM/Humanities/BioChem, digitalInterests, assertiveness/empatheticListening/feedbackSkill/conflictResolution, decisionRational/Intuitive/Dependent/Impulsive из уже собранных текстов | 1 день |
| 4 | Расширение теста GROWTH: +7-9 пунктов (teiqueSocialSkills, mindsetOptimism, perfectionismBarrier, fearOfFailure, resilience/learningFromMistakes) | 0.5 дня + обновление scoring.ts/тестов |
| 4b | Новый тест COGNITIVE_STYLE («Стиль мышления»): 14 собственных пунктов, 8 конструктов (execInhibition/Flexibility, learnDeep/Surface, selfEfficacyAcademic, metacogPlanning/Monitoring, curiosityEpistemic) | 0.5-1 день (вопросы + scoring.ts + narrative-глава) |
| 5 | Housekeeping: удалить дублирующие поля (locusControlInternal, proactivity, selfControl, timeManagement, routineDiscipline, digitalHygiene и т.д.) из `layers.ts`, обновить `docs/19` | 0.5 дня |
| 6 | Отдельно, не раньше — консультация с психологом-методологом по bullyingResistance/peerDependence (см. §7 вопрос 2); школьная интеграция для объективных `grades` | не оценено — зависит от внешних ресурсов |

Итого фазы 1-5+4b: **~4-4.5 дня работы**, без новых таблиц БД, без нового
движка, без риска для валидности тестов. Против ~недель/месяцев по
VN-blueprint при более высоком риске.

---

## 6. Метрики успеха (чего не было в VN-blueprint)

Каждую фазу проверяем не по факту "фича сделана", а по:
- % завершения сессии (сейчас vs после) — не должен падать
- Средняя длина ответа коуча на новых DERIVE-полях (нет ли деградации из-за LLM-классификации задним числом)
- Coverage % по слоям (`docs/19`, уже выводится в `/report`) — должен расти
- Ручная проверка 5-10 живых сессий после каждой фазы на живом проде

---

## 7. Открытые вопросы к владельцу продукта

1. ~~Фаза 6 (когнитивный кластер)~~ — решено 19.07.2026: делаем собственными пунктами (Фаза 4b), не лицензируем.
2. bullyingResistance/peerDependence — вообще нужны продукту, или можно окончательно убрать из схемы (а не просто "TODO")?
3. Гибкий хаб (§4.2) — подтверждаешь порядок "фундамент (RIASEC+BFI) обязателен, остальное — свободный выбор", или другая логика?

---

## 8. Техническая спецификация внедрения (по каждой фазе — конкретно)

Ниже — не абстрактный план, а то, что реально пишется в код: файлы, промпты,
тексты вопросов, сигнатуры. Каждая фаза независима и коммитится отдельно.

### Фаза 1 — портрет-гид + тема главы (`narrative.ts`)

**Файл:** `app/data/narrative.ts`

```ts
export interface NarrativeChapter {
  chapterTitle: string;
  chapterNumber: number;
  emoji: string;
  intro: string;
  outro: string;
  // НОВОЕ:
  guideCharacter: 'roman' | 'astra';
  backgroundTheme: 'warm' | 'cool' | 'neutral';
}
```

Персонаж выбирается по смыслу главы (уже частично заложено в текущих
интро/аутро — Роман ведёт эмпатийные темы, Астра — аналитические):
`RIASEC/VIA/PROCRASTINATION/CONTEXT → roman`, `BFI/PVQ/GROWTH → astra`
(либо оставить всё на Романе для консистентности голоса — решить перед
внедрением).

**Ассеты:** 2 портрета на персонажа (нейтральный + вдохновлённый), формат
webp, статика в `public/assets/guides/roman-neutral.webp`,
`roman-inspired.webp`, `astra-neutral.webp`, `astra-inspired.webp`. Без
анимации спрайта — просто `next/image` с fade-переходом между позами
(меняется на "вдохновлённый" при `outro`).

**CSS:** `backgroundTheme` мапится на уже существующие CSS-переменные темы
(`globals.css`) через `data-chapter-theme` атрибут на контейнере
`/assessment` — паттерн идентичен уже работающему `data-theme` (light/dark).
Никакого нового движка стилей.

**Файл для правки:** `app/assessment/page.tsx` — рендер `<Image>` гида в
шапке блока вопроса + `data-chapter-theme={narrative.backgroundTheme}` на
обёртке.

### Фаза 2 — гибкий хаб

**Файл:** `app/assessment/page.tsx` (или новый компонент
`app/components/assessment/ModuleGrid.tsx`, если логика разрастётся)

Правило: `RIASEC` и `BFI` — фиксированный фундамент (идут первыми, без
выбора). После них — сетка карточек оставшихся глав
(`ICAR/VIA/PROCRASTINATION/PVQ/GROWTH/CONTEXT`), пользователь кликает в
любом порядке; API `next-question` уже работает по накопительному принципу
(добираем недостающие ответы) — переупорядочивание не требует изменений
бэкенда, только фронтенд определяет, какой `testCode` показать следующим.

```ts
const FOUNDATION_ORDER: NarrativeTestCode[] = ['RIASEC', 'BFI'];
const FREE_CHOICE_CHAPTERS: NarrativeTestCode[] = ['ICAR', 'VIA', 'PROCRASTINATION', 'PVQ', 'GROWTH', 'CONTEXT'];
// После завершения FOUNDATION_ORDER — рендерим сетку карточек FREE_CHOICE_CHAPTERS
// с статусами (не начато / в процессе / готово), клик выбирает следующий testCode.
```

### Фаза 3 — DERIVE-классификатор

**Новый файл:** `app/lib/profile/deriveFromText.ts`

Одна функция, один вызов `generateJson` на этапе построения отчёта (внутри
`next-question/route.ts`, рядом с местом, где уже строится `summaryProfile`
— после сбора `coachData`, до `buildSummaryProfile`).

```ts
export async function deriveTextualFields(coachData: {
  schoolSubjects?: string;
  hobbies?: string;
  teamRole?: string;
  decisionStyle?: string;
}): Promise<{
  subjectSTEM?: number; subjectHumanities?: number; subjectBioChem?: number;
  digitalInterests?: string[];
  assertiveness?: number; empatheticListening?: number;
  feedbackSkill?: number; conflictResolution?: number;
  decisionRational?: number; decisionIntuitive?: number;
  decisionDependent?: number; decisionImpulsive?: number;
}> {
  // generateJson с system prompt:
  // "Ты — классификатор текста для профориентационного профиля подростка.
  //  По присланным текстовым ответам оцени релевантные шкалы 0-100 —
  //  ТОЛЬКО если в тексте есть прямое основание, иначе верни null для поля.
  //  Никогда не додумывай то, чего нет в тексте."
  // Схема — все поля optional number/array, required: [] (пустой список,
  // чтобы модель не была вынуждена придумывать значения).
}
```

**Важно (защита валидности):** это не замена психометрического теста, а
низкодостоверный сигнал ("может быть, если явно упомянуто") — в
`docs/19` и в UI такие поля стоит помечать иначе, чем тестовые баллы
(например, приглушённым цветом / пометкой "по словам в диалоге", а не как
равноценный тестовый результат). Добавить в `ValueBars` опциональный
проп `confidence: 'test' | 'inferred'` для визуального разделения.

### Фаза 4 — расширение теста GROWTH

**Файл:** `app/data/questions.ts` — добавить 9 вопросов с `testCode: 'GROWTH'`:

```ts
// teiqueSocialSkills (+2)
{ id: 'teique-ss-1', testCode: 'GROWTH', scale: 'TEIQUE_SS', reverseScored: false,
  text: 'Мне обычно легко понять, что чувствует другой человек, даже если он молчит об этом.' },
{ id: 'teique-ss-2', testCode: 'GROWTH', scale: 'TEIQUE_SS', reverseScored: true,
  text: 'Мне сложно понять, когда я задел чувства другого человека.' },

// mindsetOptimism (+2)
{ id: 'optimism-1', testCode: 'GROWTH', scale: 'OPTIMISM', reverseScored: false,
  text: 'Даже после неудачи я обычно верю, что в следующий раз получится лучше.' },
{ id: 'optimism-2', testCode: 'GROWTH', scale: 'OPTIMISM', reverseScored: true,
  text: 'Если что-то пошло не так один раз, я жду, что и дальше будет не так.' },

// perfectionismBarrier + fearOfFailure (+3)
{ id: 'perfectionism-1', testCode: 'GROWTH', scale: 'PERFECTIONISM', reverseScored: false,
  text: 'Я часто не берусь показывать результат, пока не уверен(а), что он идеален.' },
{ id: 'fearfail-1', testCode: 'GROWTH', scale: 'FEAR_FAILURE', reverseScored: false,
  text: 'Мысль о том, что я могу публично ошибиться, иногда останавливает меня от попытки.' },
{ id: 'fearfail-2', testCode: 'GROWTH', scale: 'FEAR_FAILURE', reverseScored: true,
  text: 'Я спокойно пробую новое, даже если есть риск не справиться с первого раза.' },

// resilience/learningFromMistakes объединённые (+2)
{ id: 'resilience-1', testCode: 'GROWTH', scale: 'RESILIENCE', reverseScored: false,
  text: 'После серьёзной неудачи мне обычно удаётся довольно быстро прийти в себя и продолжить.' },
{ id: 'resilience-2', testCode: 'GROWTH', scale: 'RESILIENCE', reverseScored: false,
  text: 'Я стараюсь разобраться, что пошло не так, а не просто расстраиваться из-за ошибки.' },
```

**Файл:** `app/lib/diagnostic/scoring.ts` — `growthScorer` уже устроен
generic-циклом по `scales`, достаточно добавить новые ключи в список:
```ts
const scales = ['GRIT', 'MINDSET', 'TEIQUE_SA', 'TEIQUE_SR',
  'TEIQUE_SS', 'OPTIMISM', 'PERFECTIONISM', 'FEAR_FAILURE', 'RESILIENCE'];
```
— и добавить юнит-тест по аналогии с существующим (`scoring.test.ts`).

**Файл:** `app/lib/profile/layers.ts` — снять пометку `TODO` с
`teiqueSocialSkills`, `mindsetOptimism`, `perfectionismBarrier`,
`fearOfFailure`, `resilienceFailure`, `learningFromMistakes`, указать
источник `тест GROWTH`.

**Файл:** `app/report/page.tsx` — расширить `INNER_COMPASS_LABELS` и
`report.innerCompass` (route.ts) новыми 5 полями.

### Фаза 4b — новый тест COGNITIVE_STYLE («Стиль мышления»)

**Важно:** это НЕ адаптация BRIEF-2/MSLQ (лицензированные клинические
инструменты, их пункты копировать нельзя) — это собственные короткие пункты
"по духу" каждого конструкта, тем же методом, каким уже написан GROWTH.
Честно документируется в `docs/19` как "собственная короткая шкала", не как
"адаптация валидированного инструмента".

**Файл:** `app/data/questions.ts` — `testCode: 'COGNITIVE_STYLE'`, 14 пунктов:

```ts
// execInhibition — тормозной контроль
{ id: 'exec-inh-1', testCode: 'COGNITIVE_STYLE', scale: 'EXEC_INHIBITION', reverseScored: false,
  text: 'Когда я работаю над задачей, мне обычно удаётся не отвлекаться на посторонние мысли или уведомления.' },
{ id: 'exec-inh-2', testCode: 'COGNITIVE_STYLE', scale: 'EXEC_INHIBITION', reverseScored: true,
  text: 'Мне трудно удержаться и не начать делать что-то другое, даже если я знаю, что должен(на) закончить текущее дело.' },

// execFlexibility — когнитивная гибкость
{ id: 'exec-flex-1', testCode: 'COGNITIVE_STYLE', scale: 'EXEC_FLEXIBILITY', reverseScored: false,
  text: 'Если план не сработал, я легко перестраиваюсь и пробую другой подход.' },
{ id: 'exec-flex-2', testCode: 'COGNITIVE_STYLE', scale: 'EXEC_FLEXIBILITY', reverseScored: true,
  text: 'Мне сложно переключиться на новый способ решения, если я уже привык(ла) к старому.' },

// learnDeep — глубокое обучение
{ id: 'learn-deep-1', testCode: 'COGNITIVE_STYLE', scale: 'LEARN_DEEP', reverseScored: false,
  text: 'Когда я изучаю что-то новое, мне важно понять, почему это работает, а не просто запомнить факт.' },

// learnSurface — поверхностное обучение (отдельный, не обратный к learnDeep, конструкт)
{ id: 'learn-surface-1', testCode: 'COGNITIVE_STYLE', scale: 'LEARN_SURFACE', reverseScored: false,
  text: 'Перед контрольной я чаще просто заучиваю материал, чем разбираюсь в сути.' },

// selfEfficacyAcademic — академическая самоэффективность
{ id: 'self-eff-1', testCode: 'COGNITIVE_STYLE', scale: 'SELF_EFFICACY', reverseScored: false,
  text: 'Я уверен(а), что могу разобраться в сложной теме по учёбе, если потрачу на это достаточно времени.' },
{ id: 'self-eff-2', testCode: 'COGNITIVE_STYLE', scale: 'SELF_EFFICACY', reverseScored: true,
  text: 'Даже если я стараюсь, мне часто кажется, что сложные учебные темы мне не по силам.' },

// metacogPlanning — метакогнитивное планирование
{ id: 'metacog-plan-1', testCode: 'COGNITIVE_STYLE', scale: 'METACOG_PLANNING', reverseScored: false,
  text: 'Перед тем как начать большое задание, я обычно продумываю план: с чего начну и в каком порядке буду делать.' },
{ id: 'metacog-plan-2', testCode: 'COGNITIVE_STYLE', scale: 'METACOG_PLANNING', reverseScored: true,
  text: 'Я чаще берусь за дело сразу, без предварительного плана, а потом разбираюсь по ходу.' },

// metacogMonitoring — метакогнитивный мониторинг
{ id: 'metacog-mon-1', testCode: 'COGNITIVE_STYLE', scale: 'METACOG_MONITORING', reverseScored: false,
  text: 'В процессе работы я периодически проверяю себя: то ли я делаю и туда ли двигаюсь.' },
{ id: 'metacog-mon-2', testCode: 'COGNITIVE_STYLE', scale: 'METACOG_MONITORING', reverseScored: true,
  text: 'Обычно я узнаю, что что-то делал(а) неправильно, только когда уже слишком поздно это исправить.' },

// curiosityEpistemic — эпистемическая любознательность
{ id: 'curiosity-ep-1', testCode: 'COGNITIVE_STYLE', scale: 'CURIOSITY_EPISTEMIC', reverseScored: false,
  text: 'Мне нравится докапываться до сути незнакомых тем просто потому, что интересно, а не потому что надо для оценки.' },
{ id: 'curiosity-ep-2', testCode: 'COGNITIVE_STYLE', scale: 'CURIOSITY_EPISTEMIC', reverseScored: true,
  text: 'Если тема не входит в программу или не нужна для оценки, мне неинтересно в ней разбираться.' },
```

**Файл:** `app/lib/diagnostic/scoring.ts` — новый скорер `cognitiveStyleScorer`,
идентичный по структуре `growthScorer` (generic-цикл по списку `scales`),
регистрация в `scorers.COGNITIVE_STYLE`. Юнит-тест по аналогии с
`growthScorer`/`contextScorer` в `scoring.test.ts`.

**Файл:** `app/lib/profile/layers.ts` — снять `TODO` с `execInhibition`,
`execFlexibility`, `learnDeep`, `learnSurface`, `selfEfficacyAcademic`,
`metacogPlanning`, `metacogMonitoring`, `curiosityEpistemic`, источник —
`тест COGNITIVE_STYLE (собственная шкала)`.

**Файл:** `app/data/narrative.ts` — новая глава (например, «Стиль мышления»,
эмодзи 🧩), добавить в `ASSESSMENT_CHAPTER_ORDER`; `app/components/report/CabinetProgress.tsx` — добавить `COGNITIVE_STYLE` в `EXISTING_TEST_CODES`.

**Файл:** `app/report/page.tsx` — новый блок `ValueBars` (по аналогии с
«Внутренним компасом»), явная подпись «Собственная короткая шкала, не
клинический тест» под заголовком блока — сохраняем ту же честность подачи,
что и с архетипом (§10 в `docs/21`).

### Фаза 5 — housekeeping (удаление дублей)

**Файл:** `app/lib/profile/layers.ts` — удалить как поля схемы (не просто
TODO-комментарий, а физическое удаление `z.number().optional()` строки):
`locusControlInternal`, `proactivity`, `selfControl`, `stressEvaluation`,
`emotionalReactivity`, `timeManagement`, `routineDiscipline`,
`digitalHygiene`, `contentCreationStyle`, `cyberSocialization`,
`aiCollaboration`, `parentalInfluence`, `limitingBeliefs`,
`peerFriendships`, `groupBelonging`, `mentorInfluence`, `socialCapital`,
`cabinVisualArt`, `cabinPerformingArt`, `bullyingResistance`,
`peerDependence` (после явного да от владельца, см. открытый вопрос №2),
`cogAiLiteracy`, `balanceWorkRest`, `grades`.

**Проверка перед удалением:** `grep -rn "<имяПоля>" app/` — убедиться, что
поле нигде не читается (кроме своего же определения в схеме), чтобы не
сломать типы в другом месте.

**Обновить:** `docs/19-characteristics-coverage-2026-07-19.md` — убрать
строки удалённых полей из таблиц "Не собирается вообще", отметить решение.

### Порядок выполнения и зависимости

```
Фаза 1 (гид/тема) ─┐
Фаза 2 (хаб)       ├─ независимы, можно параллельно/в любом порядке
Фаза 5 (housekeeping)┘

Фаза 4 (GROWTH+9) ── затем обязательно обновить report/page.tsx (тот же PR)

Фаза 3 (DERIVE) ── самая рискованная (новый LLM-вызов на каждый отчёт,
                    доп. задержка генерации) — делать последней, с
                    измерением latency отчёта до/после
```

### Чек-лист перед каждым PR (как и весь сегодняшний день)

`npx tsc --noEmit` → `npx vitest run` → `npm run build` → ручная проверка
живого прохождения на localhost → git commit → **явное подтверждение
владельца перед push**, если PR меняет то, что видят живые пользователи
(вопросы, тексты, порядок экранов) — как с сегодняшними GROWTH/CONTEXT.
