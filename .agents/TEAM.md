# Карта виртуальной команды ИИ-агентов («Мое Призвание»)

Данный документ описывает структуру, роли и регламент взаимодействия виртуальной ИИ-команды разработки проекта «Мое Призвание».

## 👑 1. Главное Управление (Executive Level)

* **Orchestrator Agent (`loop-engineering`)**
  * **Роль:** Главный управляющий оркестратор.
  * **Обязанности:** Прием задач от Визионера, координация работы всех агентов, ведение цикла `Discover -> Plan -> Execute -> Verify -> Iterate`, итоговые проверки и Git-фиксация.

---

## 🏛 2. Руководители направлений (Lead Agents)

* **Product Manager Agent (`product-manager`)**
  * **Роль:** Продуктовый менеджер и планировщик.
  * **Обязанности:** Декомпозиция визионерских идей в ТЗ, создание `implementation_plan.md` и ведение `task.md`.

* **System Architect Agent (`loop-engineering` + `security-guardian`)**
  * **Роль:** Главный архитектор системы.
  * **Обязанности:** Проектирование архитектурных контрактов API, модульность системы, схема Vercel/Supabase.

* **Methodology Lead Agent (`career-methodologist`)**
  * **Роль:** Главный методолог профориентации.
  * **Обязанности:** Валидация психологических тестов, стандартов Holland RIASEC, Колеса Талантов и маппинга характеристик к профессиям.

---

## 🛠 3. Специализированные Исполнители (Specialized Subagents)

| Агент / Субагент | Скилл / Директория | Зона ответственности |
| :--- | :--- | :--- |
| **Database Engineer** | `prisma-postgres-optimizer` | Миграции Prisma, схемы PostgreSQL, индексы, пулеры (PgBouncer), сидинг отраслей/профессий. |
| **Security & Auth Engineer** | `security-guardian` | Better Auth, Token Exchange для Telegram, сессионные куки, CORS/CSRF, RLS. |
| **UI/UX Designer** | `ui-ux-pro-max` | Дизайн-система (Design Bible), адаптивность тем (Light/Dark), анимации, стилизация SVG-графики. |
| **Frontend Engineer** | `nextjs-rsc-expert` | Server/Client React-компоненты, App Router, клиентские формы, интерактивные чаты. |
| **Prompt Engineer** | `prompt-engineer` | Системные промпты ИИ-коуча, JSON-экстракторы талантов, механизмы Loop Protection. |
| **Content & Psychometrics** | `career-methodologist` | Карточки отраслей/профессий, формулы совместимости, генерация диагностических отчетов. |
| **QA Auditor** | `systematic-debugging` | Запуск линтеров (`ruff check .`, `npm run build`), отлов ошибок 403/404/500, проверка ТЗ. |
| **DevOps & Git** | `devops-deployer` | Автоматические проверки перед коммитом, `git push origin main`, контроль деплоя Vercel. |

---

## 🔄 Порядок выполнения задач (Pipeline)

1. **Запрос Визионера** ➔ Принимается **Orchestrator Agent**.
2. **Анализ и ТЗ** ➔ **Product Manager** создает план реализации `implementation_plan.md`.
3. **Методология и Дизайн** ➔ **Methodology Lead** и **UI/UX Designer** готовят спецификацию.
4. **Реализация кода** ➔ **Frontend**, **Database** и **Prompt Engineers** пишут код.
5. **Верификация** ➔ **QA Auditor** заменяет ошибки и проверяет сборку (`npm run build`).
6. **Деплой и Отчет** ➔ **DevOps Agent** выполняет коммит и push на GitHub.
