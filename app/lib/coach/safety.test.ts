import { describe, it, expect } from 'vitest';
import { detectDistress } from './safety';

describe('detectDistress — кризисный протокол A3', () => {
  it('ловит явные суицидальные сигналы', () => {
    for (const s of [
      'я больше не хочу жить',
      'иногда думаю покончить с собой',
      'хочу умереть, всем будет лучше без меня',
      'нет смысла жить',
    ]) {
      expect(detectDistress(s).isDistress, s).toBe(true);
    }
  });

  it('ловит самоповреждение и насилие', () => {
    expect(detectDistress('я режу себя когда плохо').isDistress).toBe(true);
    expect(detectDistress('меня бьют дома').isDistress).toBe(true);
    expect(detectDistress('меня бьют дома').category).toBe('violence');
  });

  it('НЕ срабатывает на нейтральные идиомы и обычные ответы', () => {
    for (const s of [
      'я убил на это весь день, но собрал робота',
      'умираю со скуки на уроках',
      'умер со смеху на перемене',
      'хочу стать врачом и помогать людям',
      'люблю программировать и рисовать',
      'ок',
    ]) {
      expect(detectDistress(s).isDistress, s).toBe(false);
    }
  });

  it('пустой/короткий текст → не distress', () => {
    expect(detectDistress('').isDistress).toBe(false);
    expect(detectDistress('да').isDistress).toBe(false);
  });
});
