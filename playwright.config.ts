import { defineConfig } from '@playwright/test';

// Node 20.6+ — грузим .env, если он есть (локальная разработка). В CI
// переменные приходят напрямую через secrets, файла .env там нет.
try {
  process.loadEnvFile('.env');
} catch {
  // .env отсутствует (CI) — переменные уже должны быть в process.env
}

// E2E/a11y-тесты (Playwright). Юнит-тесты живут в vitest (app/**/*.test.ts),
// поэтому Playwright смотрит только в tests/.
// Запуск: сначала `npm run build && npm run start` (порт 3000 по умолчанию),
// либо задать BASE_URL, затем `npx playwright test`.
export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
  },
  reporter: [['list']],
});
