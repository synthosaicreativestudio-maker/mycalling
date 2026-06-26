/**
 * Валидация обязательных переменных окружения.
 * Вызывается при первом импорте — если переменные отсутствуют, сервер не запустится.
 */

function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    // В мягком режиме не крашим процесс, а только пишем ворнинг
    if (
      process.env.npm_lifecycle_event !== 'build' &&
      process.env.VERCEL !== '1' &&
      process.env.NEXT_PHASE !== 'phase-production-build'
    ) {
      console.warn(
        `⚠️ Внимание: Отсутствует переменная окружения: ${key}. ` +
        `Убедитесь, что добавили её в .env или в настройки Vercel.`
      );
    }
    return ''; // Возвращаем пустую строку вместо ошибки
  }
  return value;
}

function getEnvOptional(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

export const env = {
  /** URL подключения к PostgreSQL через PgBouncer */
  DATABASE_URL: getEnvOrThrow('DATABASE_URL'),
  /** Прямой URL подключения к PostgreSQL (для миграций) */
  DIRECT_URL: getEnvOrThrow('DIRECT_URL'),
  /** API-ключ ProxyAPI для генерации отчётов */
  PROXYAPI_KEY: getEnvOrThrow('PROXYAPI_KEY'),
  /** URL ProxyAPI */
  PROXYAPI_URL: getEnvOptional('PROXYAPI_URL', 'https://api.proxyapi.ru/openai/v1/chat/completions'),
  /** URL Redis (опционально) */
  REDIS_URL: getEnvOptional('REDIS_URL'),
  /** Окружение (development / production) */
  NODE_ENV: getEnvOptional('NODE_ENV', 'development'),
} as const;
