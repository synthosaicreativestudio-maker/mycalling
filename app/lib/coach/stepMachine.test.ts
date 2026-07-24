import { describe, it, expect } from 'vitest';
import { deriveStep, type DeepFlags } from './stepMachine';

const NO_DEEP: DeepFlags = {
  goal: false, outcome: false, emotions: false,
  identity: false, barriers: false, actions: false, firstStep: false,
};

describe('coach stepMachine — гейт канала + регрессия задвоения (баг 24.07)', () => {
  it('после имени, пока канал НЕ подключён — стоим на шаге 2 (подключение канала)', () => {
    const r = deriveStep({ isDeepMode: false, hasName: true, channelConnected: false, hasPersonalInfo: false, psychoBlocks: 0 });
    expect(r.step).toBe(2);
  });

  it('канал подключён, личные данные не собраны → всё ещё шаг 2 (возраст/класс/город)', () => {
    const r = deriveStep({ isDeepMode: false, hasName: true, channelConnected: true, hasPersonalInfo: false, psychoBlocks: 0, maxStepReached: 2 });
    expect(r.step).toBe(2);
  });

  it('КЛЮЧЕВОЕ: если признак «подключено» устойчив, после сбора личных данных уходим на 3, НЕ откатываясь на приглашение канала', () => {
    // Раньше channelConnected мигал в false → шаг 2 повторял приглашение подключить канал.
    // Теперь флаг durable: канал остаётся подключённым, поток идёт вперёд.
    const r = deriveStep({ isDeepMode: false, hasName: true, channelConnected: true, hasPersonalInfo: true, psychoBlocks: 0, maxStepReached: 2 });
    expect(r.step).toBe(3);
  });

  it('МОНОТОННОСТЬ: кандидат меньше достигнутого максимума — шаг не убывает', () => {
    const r = deriveStep({ isDeepMode: false, hasName: true, channelConnected: true, hasPersonalInfo: true, psychoBlocks: 0, maxStepReached: 5 });
    expect(r.step).toBe(5);
    expect(r.candidate).toBe(3);
  });

  it('без подключённого канала финал экспресса НЕ наступает (гейт обязателен)', () => {
    const r = deriveStep({ isDeepMode: false, hasName: true, channelConnected: false, hasPersonalInfo: true, psychoBlocks: 12, maxStepReached: 2 });
    expect(r.isFinal).toBe(false);
  });

  it('с подключённым каналом и 12+ блоками — финал экспресса (шаг 16)', () => {
    const r = deriveStep({ isDeepMode: false, hasName: true, channelConnected: true, hasPersonalInfo: true, psychoBlocks: 12, maxStepReached: 15 });
    expect(r.step).toBe(16);
    expect(r.isFinal).toBe(true);
  });
});

describe('coach stepMachine — EXPRESS поток', () => {
  it('нет имени → шаг 1', () => {
    expect(deriveStep({ isDeepMode: false, hasName: false, channelConnected: false, hasPersonalInfo: false, psychoBlocks: 0 }).step).toBe(1);
  });

  it('психоблоки растят шаг 3..15 линейно', () => {
    expect(deriveStep({ isDeepMode: false, hasName: true, channelConnected: true, hasPersonalInfo: true, psychoBlocks: 5 }).step).toBe(8);
    expect(deriveStep({ isDeepMode: false, hasName: true, channelConnected: true, hasPersonalInfo: true, psychoBlocks: 20 }).step).toBe(16);
  });

  it('isFinal только при 12+ блоках (и подключённом канале)', () => {
    expect(deriveStep({ isDeepMode: false, hasName: true, channelConnected: true, hasPersonalInfo: true, psychoBlocks: 11 }).isFinal).toBe(false);
    expect(deriveStep({ isDeepMode: false, hasName: true, channelConnected: true, hasPersonalInfo: true, psychoBlocks: 12 }).isFinal).toBe(true);
  });
});

describe('coach stepMachine — DEEP поток (Пирамида 16..23)', () => {
  const base = { isDeepMode: true, hasName: true, channelConnected: true, hasPersonalInfo: true, psychoBlocks: 12 };

  it('сначала экспресс-портрет, затем цель(16)', () => {
    expect(deriveStep({ ...base, deep: NO_DEEP }).step).toBe(16);
  });

  it('пирамида идёт по порядку до финала 23', () => {
    const full: DeepFlags = { goal: true, outcome: true, emotions: true, identity: true, barriers: true, actions: true, firstStep: true };
    const r = deriveStep({ ...base, deep: full });
    expect(r.step).toBe(23);
    expect(r.isFinal).toBe(true);
  });

  it('барьеры (20) идут после идентичности (19)', () => {
    const deep: DeepFlags = { goal: true, outcome: true, emotions: true, identity: true, barriers: false, actions: false, firstStep: false };
    expect(deriveStep({ ...base, deep }).step).toBe(20);
  });
});
