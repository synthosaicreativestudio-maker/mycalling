# Recommendation Logic

## Подход v1
V1 использует rule-based scoring с explainable logic.

## Этапы расчета
1. Нормализовать ответы.
2. Посчитать competency scores.
3. Посчитать interest profile.
4. Посчитать personality and behavior modifiers.
5. Сформировать motivation modifiers.
6. Вычислить match score для профессий.
7. Сопоставить профессии с предметами и направлениями.

## Формула матчинга профессии
Career Match = base competency fit + interest fit + behavior fit + motivation fit + personality modifiers

## Правила вывода
- не показывать слишком много низкоуверенных профессий;
- объяснять не только результат, но и его основу;
- давать как минимум один практический следующий шаг.
