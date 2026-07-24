/**
 * Валидация обязательных переменных окружения.
 * Вызывается при первом импорте — если переменные отсутствуют, сервер не запустится.
 */

function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    if (
      process.env.npm_lifecycle_event === 'build' ||
      process.env.NEXT_PHASE === 'phase-production-build'
    ) {
      // Во время сборки на Vercel (без подключения к БД) пишем ворнинг, чтобы сборка не падала
      console.warn(`⚠️ Внимание: Отсутствует переменная окружения при сборке: ${key}`);
      return '';
    }
    // В рантайме всегда падаем
    throw new Error(`CRITICAL: Отсутствует переменная окружения: ${key}. Убедитесь, что добавили её в .env или в настройки сервера.`);
  }
  return value;
}

function getEnvOptional(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

export const env = {
  /** URL подключения к PostgreSQL через PgBouncer */
  DATABASE_URL: (() => {
    const url = getEnvOrThrow('DATABASE_URL');
    return url.replace(':6543/', ':5432/').replace('?pgbouncer=true', '').replace('&pgbouncer=true', '');
  })(),
  /** Прямой URL подключения к PostgreSQL (для миграций) */
  DIRECT_URL: getEnvOrThrow('DIRECT_URL'),
  /** API-ключ ProxyAPI для генерации отчётов (основной) */
  PROXYAPI_KEY: getEnvOrThrow('PROXYAPI_KEY'),
  /**
   * Все рабочие ключи ProxyAPI по порядку приоритета (основной + резервные).
   * INC-005 (19.07.2026): провайдер отдавал то 500 "container instances
   * exceeded", то 401 на один и тот же ключ — при таких плавающих сбоях
   * нужен реальный перебор нескольких ключей, а не один статичный fallback.
   */
  PROXYAPI_KEYS: [
    getEnvOrThrow('PROXYAPI_KEY'),
    getEnvOptional('PROXYAPI_KEY_FALLBACK'),
    getEnvOptional('PROXYAPI_KEY_FALLBACK2'),
  ].filter((key): key is string => !!key),
  /** URL ProxyAPI */
  PROXYAPI_URL: getEnvOptional('PROXYAPI_URL', 'https://api.proxyapi.ru/openai/v1/chat/completions'),
  /** URL Redis (опционально) */
  REDIS_URL: getEnvOptional('REDIS_URL'),
  /** Окружение (development / production) */
  NODE_ENV: getEnvOptional('NODE_ENV', 'development'),
  /**
   * Быстрая модель для МЕХАНИЧЕСКОЙ экстракции реплик коуча в JSON (шаги 3–15).
   * Пусто = использовать основную модель (без изменений). Задайте лёгкую модель
   * из вашего тарифа ProxyAPI (напр. gpt-5-mini), чтобы ускорить ответы коуча и
   * снизить сбои экстракции. На качество разбора почти не влияет.
   */
  EXTRACTION_MODEL: getEnvOptional('EXTRACTION_MODEL'),
  /** Т-Банк (Тинькофф) Интернет-эквайринг / Биллинг */
  TINKOFF_TERMINAL_KEY: getEnvOptional('TINKOFF_TERMINAL_KEY'),
  TINKOFF_SECRET_KEY: getEnvOptional('TINKOFF_SECRET_KEY'),
  /** Пароль терминала Т-Банка для подписи запросов (токен). Отдельный секрет,
   *  задаётся владельцем в окружении хостинга. Fallback на SECRET_KEY, если
   *  владелец сохранил пароль под этим именем. */
  TINKOFF_PASSWORD: getEnvOptional('TINKOFF_PASSWORD') || getEnvOptional('TINKOFF_SECRET_KEY'),
} as const;
