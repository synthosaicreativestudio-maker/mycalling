import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Автоматический аудит доступности (WCAG 2.1/2.2 A+AA) по axe-core.
// Проверяем публичные страницы, доступные без сессии.
// Ошибки уровня critical/serious фейлят тест; minor/moderate печатаются в лог.

const PAGES = ['/', '/auth'];

for (const path of PAGES) {
  test(`axe a11y: ${path}`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

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
