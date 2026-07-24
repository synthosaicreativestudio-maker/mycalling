import { describe, it, expect } from 'vitest';
import { signGuestCapability, verifyGuestCapability } from './guestCapability';

describe('guestCapability — доказательство владения гостевой сессией (A2)', () => {
  const sid = '11111111-1111-1111-1111-111111111111';
  const other = '22222222-2222-2222-2222-222222222222';

  it('подпись валидируется для своего sessionId', () => {
    const cap = signGuestCapability(sid);
    expect(verifyGuestCapability(cap, sid)).toBe(true);
  });

  it('капабилити от чужой сессии не подходит (нельзя присвоить чужой sessionId)', () => {
    const cap = signGuestCapability(other);
    expect(verifyGuestCapability(cap, sid)).toBe(false);
  });

  it('подделка подписи отклоняется', () => {
    expect(verifyGuestCapability(`${sid}.deadbeef`, sid)).toBe(false);
  });

  it('пустое/битое значение → false', () => {
    expect(verifyGuestCapability(undefined, sid)).toBe(false);
    expect(verifyGuestCapability('', sid)).toBe(false);
    expect(verifyGuestCapability('no-dot', sid)).toBe(false);
    expect(verifyGuestCapability(signGuestCapability(sid), '')).toBe(false);
  });
});
