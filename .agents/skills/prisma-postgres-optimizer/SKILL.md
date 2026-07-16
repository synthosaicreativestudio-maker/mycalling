---
name: prisma-postgres-optimizer
description: "Оптимизация работы с Prisma ORM, транзакциями, JSONB-полями в Postgres и обход PgBouncer."
version: "1.0.0"
---

# Prisma & Postgres Optimizer — Оптимизация работы с базой данных

Этот навык содержит правила и лучшие практики для построения надежных и быстрых запросов к базе данных PostgreSQL через Prisma ORM, исключая утечки ресурсов, взаимные блокировки (deadlocks) и проблемы производительности.

## 1. Предотвращение N+1 запросов

Проблема N+1 возникает, когда код запрашивает список записей, а затем в цикле делает по одному запросу для связанных сущностей каждой записи.

- **Решение:** Всегда используйте явный `include` или `select` для загрузки связанных данных в один SQL-запрос (Eager Loading).
  ```typescript
  // ПЛОХО: Загрузка без связей, с последующими запросами
  const sessions = await prisma.coachSession.findMany();
  
  // ХОРОШО: Загрузка связанных данных за один раз
  const sessions = await prisma.coachSession.findMany({
    include: {
      user: true,
      diagnosticAnswers: true,
    }
  });
  ```

## 2. Безопасная работа с JSONB-полями

Prisma представляет поля типа `Json` в виде обобщенных объектов. Чтение свойств таких объектов без проверок типов часто приводит к сбоям приложения.

- **Правило:** Никогда не вызывайте строковые методы (например, `.trim()`, `.toLowerCase()`) или глубокие свойства объекта без предварительного приведения типов или проверки на существование.
  ```typescript
  // ПЛОХО (может упасть, если extractedData - null или не объект)
  const name = session.extractedData.name.trim();
  
  // ХОРОШО
  const extracted = session.extractedData as Record<string, any> | null;
  const name = extracted && typeof extracted.name === 'string' 
    ? extracted.name.trim() 
    : '';
  ```

## 3. Обход PgBouncer пулера Supabase (порт 6543)

При работе в serverless-среде пул PgBouncer на порту `6543` может зависать или возвращать ошибки блокировки транзакций (например, при подготовке запросов `Prepared Statements`).

- **Правило:** При возникновении регулярных сбоев подключения перенаправляйте трафик напрямую на PostgreSQL (порт `5432`). В коде инициализации `PrismaClient` заменяйте порт `:6543/` на `:5432/` и отрезайте флаг `?pgbouncer=true`.

## 4. Транзакции и атомарность

Для выполнения нескольких связанных записей (например, слияние гостевой сессии с профилем пользователя) всегда используйте транзакции Prisma.

- **Правило:** Оборачивайте операции в `prisma.$transaction([])`, чтобы в случае сбоя одной записи откатились все остальные, предотвращая появление "битых" (orphaned) данных в базе.
  ```typescript
  await prisma.$transaction([
    prisma.diagnosticAnswers.updateMany({ ... }),
    prisma.coachSession.update({ ... }),
    prisma.guestUser.delete({ ... }),
  ]);
  ```
