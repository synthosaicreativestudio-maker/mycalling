'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

// Ловит ошибки в самом корневом layout.tsx (в отличие от app/error.tsx,
// который ловит ошибки внутри дочерних сегментов) — обязателен для App
// Router. Заменяет собой html/body на время показа ошибки, поэтому не может
// переиспользовать обычную вёрстку сайта.
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ru">
      <body style={{ background: '#040506', color: '#E8ECF0', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', textAlign: 'center', padding: '24px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '12px' }}>Что-то пошло не так</h1>
        <p style={{ color: '#9AA5B1', marginBottom: '24px', maxWidth: '420px' }}>
          Произошла непредвиденная ошибка. Попробуйте перезагрузить страницу.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{ padding: '12px 24px', borderRadius: '12px', background: '#3B82F6', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 500 }}
        >
          Перезагрузить
        </button>
      </body>
    </html>
  );
}
