-- ============================================================================
-- Включение Row Level Security (RLS) на всех таблицах с данными несовершеннолетних
-- Проект: МоёПризвание · docs/28 (баг №2), docs/29 (Блок 3), docs/25 (Трек E)
-- Дата: 2026-07-24
--
-- ЗАЧЕМ. Приложение ходит в БД ТОЛЬКО через Prisma (прямое подключение под ролью
-- postgres/владельцем, которая ОБХОДИТ RLS). Публичные ключи Supabase (anon /
-- authenticated, через PostgREST) сейчас могут читать эти таблицы напрямую — это
-- недопустимо для персональных данных детей. Включаем RLS БЕЗ политик: для anon/
-- authenticated доступ становится «запрещено по умолчанию», а Prisma (владелец)
-- продолжает работать без изменений.
--
-- БЕЗОПАСНОСТЬ ПРИМЕНЕНИЯ. НЕ используем FORCE ROW LEVEL SECURITY — иначе RLS
-- применился бы и к владельцу и сломал бы Prisma. Обычный ENABLE владельца не
-- задевает. Идемпотентно: повторный прогон безвреден.
--
-- КАК ПРИМЕНИТЬ (владелец):
--   Supabase → SQL Editor → вставить и Run. Затем СМОУК-ТЕСТ приложения
--   (регистрация/коуч/отчёт) — всё должно работать как раньше.
--
-- ПРОВЕРКА ЗАЩИТЫ: с anon-ключом `select * from public.users` через PostgREST
--   должен вернуть 0 строк / ошибку доступа.
--
-- ОТКАТ: docs/sql/disable_rls_rollback.sql
-- ============================================================================

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'users',
    'session',
    'account',
    'verification',
    'coach_sessions',
    'diagnostic_results',
    'digital_profiles',
    'reports',
    'auth_links',
    'auth_exchange_tokens'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
      RAISE NOTICE 'RLS enabled on public.%', t;
    ELSE
      RAISE NOTICE 'skip: table public.% not found', t;
    END IF;
  END LOOP;
END $$;

-- Контроль: показать статус RLS по таблицам
SELECT relname AS table_name, relrowsecurity AS rls_enabled
FROM pg_class
WHERE relnamespace = 'public'::regnamespace
  AND relname = ANY (ARRAY[
    'users','session','account','verification','coach_sessions',
    'diagnostic_results','digital_profiles','reports','auth_links','auth_exchange_tokens'
  ])
ORDER BY relname;
