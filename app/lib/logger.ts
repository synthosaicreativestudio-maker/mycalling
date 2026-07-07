import pino from 'pino';

// В dev-режиме используем обычный console, чтобы избежать крашей worker-потоков Next.js/Pino
const isProd = process.env.NODE_ENV === 'production';

const logger = isProd
  ? pino({ level: process.env.LOG_LEVEL || 'info' })
  : {
      info: (...args: any[]) => console.log('[INFO]', ...args),
      error: (...args: any[]) => console.error('[ERROR]', ...args),
      warn: (...args: any[]) => console.warn('[WARN]', ...args),
      debug: (...args: any[]) => console.debug('[DEBUG]', ...args),
    };

export default logger;
