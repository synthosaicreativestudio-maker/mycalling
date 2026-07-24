import { describe, it, expect, vi, beforeEach } from 'vitest';

// A1 (OWASP A01:2025): инвариант владения. results-роут обязан отдавать ТОЛЬКО
// данные вошедшего пользователя, независимо от session_id из query.

const getPrincipalUserId = vi.fn();
const reportFindUnique = vi.fn();
const coachFindUnique = vi.fn();
const redisGet = vi.fn();
const redisSet = vi.fn();

vi.mock('../../../../lib/authz/requireOwnedResource', () => ({
  getPrincipalUserId: () => getPrincipalUserId(),
}));
vi.mock('../../../../lib/prisma', () => ({
  default: {
    report: { findUnique: (args: any) => reportFindUnique(args) },
    coachSession: { findUnique: (args: any) => coachFindUnique(args) },
  },
}));
vi.mock('../../../../lib/redis', () => ({
  default: {
    get: (k: string) => redisGet(k),
    set: (...a: any[]) => redisSet(...a),
  },
}));

import { GET } from './route';

function req(sessionId?: string) {
  const url = sessionId
    ? `http://localhost/api/v1/diagnostic/results?session_id=${sessionId}`
    : 'http://localhost/api/v1/diagnostic/results';
  return new Request(url);
}

describe('diagnostic/results — контроль доступа A1', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    redisGet.mockResolvedValue(null);
    redisSet.mockResolvedValue(undefined);
  });

  it('Алиса НЕ видит отчёт Боба, даже передав его session_id', async () => {
    getPrincipalUserId.mockResolvedValue('alice');
    // В БД есть отчёт Боба; выборка идёт по principal, поэтому для Алисы — null.
    reportFindUnique.mockImplementation(({ where }: any) =>
      where.userId === 'bob' ? { userId: 'bob', htmlContent: '{"secret":"bob"}' } : null,
    );
    coachFindUnique.mockResolvedValue(null);

    const res = await GET(req('bob'));
    const body = await res.json();

    // Выборка выполнена строго по владельцу (alice), не по session_id из query.
    expect(reportFindUnique).toHaveBeenCalledWith({ where: { userId: 'alice' } });
    expect(JSON.stringify(body)).not.toContain('bob');
    expect(res.status).toBe(404);
  });

  it('без сессии — 401, данные не читаются', async () => {
    getPrincipalUserId.mockResolvedValue(null);

    const res = await GET(req('bob'));

    expect(res.status).toBe(401);
    expect(reportFindUnique).not.toHaveBeenCalled();
    expect(redisGet).not.toHaveBeenCalled();
  });

  it('владелец получает свой отчёт (happy-path)', async () => {
    getPrincipalUserId.mockResolvedValue('alice');
    reportFindUnique.mockImplementation(({ where }: any) =>
      where.userId === 'alice' ? { userId: 'alice', htmlContent: '{"ok":"alice"}' } : null,
    );

    const res = await GET(req());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toEqual({ ok: 'alice' });
    // Кэш пишется под ключ владельца.
    expect(redisSet).toHaveBeenCalledWith('report:alice', '{"ok":"alice"}', 'EX', 86400);
  });

  it('кэш читается по ключу владельца, а не по session_id из query', async () => {
    getPrincipalUserId.mockResolvedValue('alice');
    redisGet.mockResolvedValue('{"cached":"alice"}');

    const res = await GET(req('bob'));
    const body = await res.json();

    expect(redisGet).toHaveBeenCalledWith('report:alice');
    expect(res.status).toBe(200);
    expect(body.data).toEqual({ cached: 'alice' });
  });
});
