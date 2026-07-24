import { describe, it, expect } from 'vitest';
import { fallbackExtract } from './extraction';

describe('fallbackExtract — фолбэк шагов 3–15 (анти-задвоение, 51c9548)', () => {
  it('содержательный ответ на психо-шаге → _rawPsychologyFallback + shouldAdvanceStep', () => {
    const r = fallbackExtract('люблю программировать с помощью ии, делать чат-боты и арты', 3, true, true, true, true);
    expect(r._rawPsychologyFallback).toBeTruthy();
    expect(r.shouldAdvanceStep).toBe(true);
  });

  it('очень короткий ответ (<=10 симв.) НЕ ставит фолбэк', () => {
    const r = fallbackExtract('ок', 3, true, true, true, true);
    expect(r._rawPsychologyFallback).toBeUndefined();
  });

  it('фолбэк работает на всём диапазоне 3–15', () => {
    for (const step of [3, 8, 15]) {
      const r = fallbackExtract('развёрнутый осмысленный ответ про интересы', step, true, true, true, true);
      expect(r._rawPsychologyFallback).toBeTruthy();
    }
    // вне диапазона (16) — нет фолбэка психошагов
    const r16 = fallbackExtract('развёрнутый осмысленный ответ про интересы', 16, true, true, true, true);
    expect(r16._rawPsychologyFallback).toBeUndefined();
  });

  it('шаг 1: извлечение имени по-прежнему работает', () => {
    const r = fallbackExtract('Роман', 1, false, false, false, false);
    expect(r.fullName).toBe('Роман');
  });
});
