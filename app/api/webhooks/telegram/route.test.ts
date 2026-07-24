import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// A4: Telegram webhook fail-closed. Проверка секрета — до любой обработки.
vi.mock('../../../lib/prisma', () => ({ default: {} }));
vi.mock('../../../config/modules', () => ({ modulesConfig: { enableTelegram: true } }));
vi.mock('../../../lib/auth/migrate-guest', () => ({ migrateGuestToUser: vi.fn() }));

import { POST } from './route';

const OLD = process.env.TELEGRAM_WEBHOOK_SECRET;

function post(headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/webhooks/telegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ update_id: 1 }),
  });
}

describe('telegram webhook — fail-closed (A4)', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => { process.env.TELEGRAM_WEBHOOK_SECRET = OLD; });

  it('без секрета в окружении → 503 (не обрабатывает)', async () => {
    delete process.env.TELEGRAM_WEBHOOK_SECRET;
    const res = await POST(post({ 'X-Telegram-Bot-Api-Secret-Token': 'whatever' }));
    expect(res.status).toBe(503);
  });

  it('неверный secret_token → 401', async () => {
    process.env.TELEGRAM_WEBHOOK_SECRET = 'right-secret';
    const res = await POST(post({ 'X-Telegram-Bot-Api-Secret-Token': 'wrong' }));
    expect(res.status).toBe(401);
  });

  it('отсутствие заголовка secret_token → 401', async () => {
    process.env.TELEGRAM_WEBHOOK_SECRET = 'right-secret';
    const res = await POST(post());
    expect(res.status).toBe(401);
  });
});
