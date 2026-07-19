import { randomUUID } from 'crypto';
import { PrismaClient } from '@prisma/client';
import type { Browser, BrowserContext } from '@playwright/test';
import {
  SECURE_SESSION_COOKIE,
  FALLBACK_SESSION_COOKIE,
  signCookieValue,
} from '../../app/lib/auth/session-cookies';

// Отдельный PrismaClient, а не app/lib/prisma.ts — тот файл начинается с
// `import 'server-only'` и падает при импорте вне Next.js рантайма.
const prisma = new PrismaClient();

export interface AuthFixtureResult {
  context: BrowserContext;
  userId: string;
}

/**
 * Создаёт тестового User + Session в БД и открывает Playwright-контекст с
 * уже подписанными cookie сессии — та же схема подписи, что и в проде
 * (app/lib/auth/session-cookies.ts), без похода через реальный OAuth/бот.
 *
 * auth.ts захардкожен на `baseURL: "https://synthosai.ru"`, поэтому Better
 * Auth всегда ищет cookie с именем `__Secure-...` независимо от текущего
 * протокола — ставим оба варианта имени cookie, как это делает
 * appendSessionCookies в проде.
 */
export async function createAuthenticatedContext(
  browser: Browser,
  opts: { coachCompleted?: boolean } = {}
): Promise<AuthFixtureResult> {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error(
      'BETTER_AUTH_SECRET не задан — авторизованные a11y-тесты требуют реальный .env (см. tests/fixtures/auth-session.ts)'
    );
  }

  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const user = await prisma.user.create({
    data: {
      name: 'A11y Test User',
      fullName: 'Тест Тестов',
      email: `a11y-${suffix}@playwright.test`,
      grade: 9,
    },
  });

  if (opts.coachCompleted) {
    await prisma.coachSession.create({
      data: {
        userId: user.id,
        status: 'COMPLETED',
        transcript: [
          { role: 'assistant', content: 'Демо-диалог для a11y-теста.' },
          { role: 'user', content: 'Привет!' },
        ],
        extractedData: {
          fullName: 'Тест Тестов',
          age: 15,
          sessionMode: 'EXPRESS',
          currentStep: 16,
        },
        completedAt: new Date(),
      },
    });
  }

  const session = await prisma.session.create({
    data: {
      token: randomUUID(),
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  const signedToken = await signCookieValue(session.token, secret);
  const encodedValue = encodeURIComponent(signedToken);
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';
  const domain = new URL(baseURL).hostname;

  const context = await browser.newContext();
  await context.addCookies([
    {
      name: FALLBACK_SESSION_COOKIE,
      value: encodedValue,
      domain,
      path: '/',
      httpOnly: true,
      secure: false,
    },
    {
      // __Secure- префикс формально требует https, но Better Auth всегда
      // ищет именно это имя (baseURL захардкожен на https). CDP-инъекция
      // cookie в Chromium позволяет это выставить и на http://localhost.
      name: SECURE_SESSION_COOKIE,
      value: encodedValue,
      domain,
      path: '/',
      httpOnly: true,
      secure: true,
    },
  ]);

  return { context, userId: user.id };
}

export async function cleanupAuthUser(userId: string): Promise<void> {
  await prisma.coachSession.deleteMany({ where: { userId } }).catch(() => {});
  await prisma.session.deleteMany({ where: { userId } }).catch(() => {});
  await prisma.user.delete({ where: { id: userId } }).catch(() => {});
}

export async function disconnectAuthFixture(): Promise<void> {
  await prisma.$disconnect();
}
