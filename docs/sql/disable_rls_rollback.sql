-- ============================================================================
-- ОТКАТ: выключение Row Level Security (если после enable_rls.sql приложение
-- повело себя неожиданно). Возвращает состояние до миграции.
-- Проект: МоёПризвание · docs/29 (Блок 3)
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
      EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY;', t);
      RAISE NOTICE 'RLS disabled on public.%', t;
    END IF;
  END LOOP;
END $$;
