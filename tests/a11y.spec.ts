import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createAuthenticatedContext, cleanupAuthUser, disconnectAuthFixture } from './fixtures/auth-session';

// Автоматический аудит доступности (WCAG 2.1/2.2 A+AA) по axe-core.
// Проверяем публичные страницы, доступные без сессии.
// Ошибки уровня critical/serious фейлят тест; minor/moderate печатаются в лог.

const PAGES = ['/', '/auth'];

function reportViolations(path: string, results: Awaited<ReturnType<AxeBuilder['analyze']>>) {
  const severe = results.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious'
  );
  const minor = results.violations.filter(
    (v) => v.impact !== 'critical' && v.impact !== 'serious'
  );

  for (const v of minor) {
    console.log(`[minor/${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} nodes)`);
  }
  for (const v of severe) {
    console.log(
      `[SEVERE/${v.impact}] ${v.id}: ${v.help}\n` +
        v.nodes
          .slice(0, 5)
          .map((n) => `  - ${n.html.slice(0, 140)}`)
          .join('\n')
    );
  }

  expect(severe, `Critical/serious a11y violations on ${path}`).toEqual([]);
}

for (const path of PAGES) {
  test(`axe a11y: ${path}`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' });
    // Даём доиграть framer-motion fade-in анимациям (до ~1s + stagger) —
    // иначе axe иногда ловит элемент в переходном opacity:0 состоянии и
    // репортит ложный color-contrast (не связано с реальной доступностью).
    await page.waitForTimeout(1500);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    reportViolations(path, results);
  });

  test(`no horizontal scroll at 320px: ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(path, { waitUntil: 'networkidle' });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow, `Horizontal overflow on ${path} at 320px: ${overflow}px`).toBeLessThanOrEqual(0);
  });
}

// Авторизованные страницы (docs/18 P3.5) — требуют реальную БД (DATABASE_URL/
// BETTER_AUTH_SECRET, те же переменные, что и `npm run start`). Каждый тест
// заводит свой User+Session и подчищает их за собой.
test.describe('axe a11y: authenticated pages', () => {
  test('/coach (fresh session, no coach data yet)', async ({ browser }) => {
    const { context, userId } = await createAuthenticatedContext(browser);
    try {
      const page = await context.newPage();
      await page.goto('/coach', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      reportViolations('/coach', results);
    } finally {
      await context.close();
      await cleanupAuthUser(userId);
    }
  });

  test('/assessment (coach completed, tests not started)', async ({ browser }) => {
    const { context, userId } = await createAuthenticatedContext(browser, { coachCompleted: true });
    try {
      const page = await context.newPage();
      await page.goto('/assessment', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      reportViolations('/assessment', results);
    } finally {
      await context.close();
      await cleanupAuthUser(userId);
    }
  });

  test('/report (demo state — coach/tests incomplete)', async ({ browser }) => {
    const { context, userId } = await createAuthenticatedContext(browser, { coachCompleted: true });
    try {
      const page = await context.newPage();
      await page.goto('/report', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      reportViolations('/report', results);
    } finally {
      await context.close();
      await cleanupAuthUser(userId);
    }
  });

  test.afterAll(async () => {
    await disconnectAuthFixture();
  });
});
