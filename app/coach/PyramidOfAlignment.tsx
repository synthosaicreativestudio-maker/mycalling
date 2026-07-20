'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PyramidOfAlignmentProps {
  extractedData: Record<string, any>;
}

export default function PyramidOfAlignment({ extractedData }: PyramidOfAlignmentProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const t = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(t as any);
    
    const observer = new MutationObserver(() => {
      const updatedTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      setTheme(updatedTheme as any);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  // Безопасное извлечение глубоких данных
  const getField = (key: string): string => {
    if (!extractedData || typeof extractedData !== 'object') return '';
    const val = extractedData.deepExtracted?.[key] ?? extractedData[key] ?? '';
    return typeof val === 'string' ? val : String(val ?? '');
  };

  // Геометрия пирамиды считается из позиции яруса (0 = вершина, 6 = основание),
  // чтобы 7 ярусов (добавлен «Барьеры/убеждения», docs/27 Трек 2) ровно
  // помещались в тот же viewBox без ручного подбора координат.
  const BAND_H = 30;
  const GAP = 6;
  const APEX_Y = 42;
  const CX = 200;
  const SLOPE = 0.57; // полуширина на пиксель высоты (от вершины)
  const hw = (y: number) => Math.max(0, (y - APEX_Y) * SLOPE);
  const geom = (posFromApex: number) => {
    const yTop = APEX_Y + posFromApex * (BAND_H + GAP);
    const yBot = yTop + BAND_H;
    const hwTop = hw(yTop);
    const hwBot = hw(yBot);
    const points = hwTop < 1
      ? `${CX},${yTop} ${(CX + hwBot).toFixed(0)},${yBot} ${(CX - hwBot).toFixed(0)},${yBot}`
      : `${(CX - hwTop).toFixed(0)},${yTop} ${(CX + hwTop).toFixed(0)},${yTop} ${(CX + hwBot).toFixed(0)},${yBot} ${(CX - hwBot).toFixed(0)},${yBot}`;
    return { points, textPos: { x: CX, y: (yTop + yBot) / 2 } };
  };

  // Порядок снизу вверх: Запрос → … → Микрошаг (idx = семантический уровень,
  // 0 — основание, 6 — вершина). posFromApex = 6 - idx.
  const levelDefs = [
    { idx: 6, key: 'deepFirstStep', name: 'Микрошаг (Действие)', emoji: '⚡', description: 'Простое двухминутное действие для запуска цели', color: 'var(--riasec-startup)' },
    { idx: 5, key: 'deepActions', name: 'План & Навыки', emoji: '🚀', description: 'Ключевые действия и навыки на 90 дней', color: 'var(--riasec-organizational)' },
    { idx: 4, key: 'deepBarriers', name: 'Барьеры (Что мешает)', emoji: '🛡️', description: 'Внутренние препятствия и ограничивающие убеждения', color: 'var(--riasec-creative)' },
    { idx: 3, key: 'deepIdentity', name: 'Идентичность (Кто Я)', emoji: '👑', description: 'Манифест вашей новой роли и качеств', color: 'var(--riasec-analytical)' },
    { idx: 2, key: 'deepEmotions', name: 'Эмоции (Тело)', emoji: '🔥', description: 'Эмоциональный отклик и энергия', color: 'var(--riasec-social)' },
    { idx: 1, key: 'deepOutcome', name: 'Результат (Образ)', emoji: '🌟', description: 'Детальная визуализация успеха', color: 'var(--riasec-outcome)' },
    { idx: 0, key: 'deepGoal', name: 'Запрос (Хочу)', emoji: '🎯', description: 'Ваша главная цель самореализации', color: 'var(--riasec-goal)' },
  ];
  const levels = levelDefs.map((l) => {
    const g = geom(6 - l.idx);
    return { ...l, val: getField(l.key), glowColor: l.color, points: g.points, textPos: g.textPos };
  });

  const activeIndex = hoveredIdx !== null ? hoveredIdx : selectedIdx;
  const activeLevel = activeIndex !== null ? levels.find(l => l.idx === activeIndex) : null;

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full h-full space-y-6">
      <div className="text-center space-y-1">
        <h3 className="text-md font-bold font-sans text-white tracking-wide">Пирамида Идентичности</h3>
        <p className="text-xs text-[var(--text-muted)] font-medium">Ваш путь от «Хочу» к «Действию»</p>
      </div>

      <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
        <svg width="100%" height="100%" viewBox="0 0 400 350" className="overflow-visible select-none">
          <defs>
            {levels.map((lvl) => (
              <linearGradient id={`grad-pyr-${lvl.idx}`} key={lvl.idx} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={0.1} />
                <stop offset="100%" stopColor={lvl.color} stopOpacity={0.4} />
              </linearGradient>
            ))}
          </defs>

          {/* Фоновая разметка сетки */}
          <line x1="200" y1="24" x2="200" y2="300" stroke="var(--border-subtle)" strokeDasharray="3 3" />
          <line x1="40" y1="294" x2="360" y2="294" stroke="var(--border-subtle)" />

          {/* Отрисовка уровней пирамиды */}
          {levels.map((lvl) => {
            const hasData = lvl.val.trim().length > 0;
            const isHovered = hoveredIdx === lvl.idx;
            const isSelected = selectedIdx === lvl.idx;
            
            return (
              <g 
                key={lvl.idx}
                onMouseEnter={() => setHoveredIdx(lvl.idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => setSelectedIdx(lvl.idx === selectedIdx ? null : lvl.idx)}
                className="cursor-pointer"
              >
                {/* Подсветка при наведении */}
                <motion.polygon
                  points={lvl.points}
                  fill={hasData ? `url(#grad-pyr-${lvl.idx})` : 'var(--pyramid-idle-fill)'}
                  stroke={hasData ? lvl.color : 'var(--border-subtle)'}
                  strokeWidth={isHovered || isSelected ? 2.5 : 1.2}
                  style={{
                    filter: hasData ? `drop-shadow(0 0 ${isHovered || isSelected ? '12px' : '4px'} ${lvl.glowColor})` : 'none',
                  }}
                  animate={{
                    opacity: hasData ? 1.0 : 0.35,
                    scale: isHovered ? 1.02 : 1.0,
                  }}
                  transition={{ duration: 0.2 }}
                />

                {/* Эмодзи/Значок по центру уровня */}
                <text
                  x={lvl.textPos.x}
                  y={lvl.textPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={14}
                  className="pointer-events-none"
                  style={{ opacity: hasData ? 1.0 : 0.4 }}
                >
                  {lvl.emoji}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Информационная панель деталей уровня */}
      <div 
        className="w-full min-h-[110px] max-h-[180px] overflow-y-auto p-4 rounded-2xl bg-white/[0.02] border flex flex-col justify-center transition-all duration-300"
        style={{ borderColor: activeLevel ? `color-mix(in srgb, ${activeLevel.color} 20%, transparent)` : 'var(--border-subtle)' }}
      >
        <AnimatePresence mode="wait">
          {activeLevel ? (
            <motion.div
              key={activeLevel.idx}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="space-y-1.5"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold font-sans" style={{ color: activeLevel.color }}>
                <span>{activeLevel.emoji}</span>
                <span>{activeLevel.name}</span>
                {!activeLevel.val && (
                  <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-slate-400 font-normal">Ещё не пройдено</span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">{activeLevel.description}</p>
              {activeLevel.val && (
                <p className="text-xs text-white/95 font-sans font-medium bg-white/5 p-2 rounded-xl border border-white/5 mt-1 leading-relaxed whitespace-pre-wrap">
                  {activeLevel.val}
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-1 py-1"
            >
              <p className="text-xs text-slate-300 font-sans font-medium">💡 Наведите на уровень пирамиды</p>
              <p className="text-[10px] text-slate-500">чтобы увидеть детализацию ваших ответов коучу</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Список шагов (чек-лист) */}
      <div className="w-full space-y-2.5 max-h-[160px] overflow-y-auto pr-1 hidden md:block">
        {levels.slice().reverse().map((lvl) => {
          const hasData = lvl.val.trim().length > 0;
          return (
            <div 
              key={lvl.idx}
              onClick={() => setSelectedIdx(lvl.idx === selectedIdx ? null : lvl.idx)}
              className={`flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl border transition cursor-pointer ${
                selectedIdx === lvl.idx
                  ? 'bg-white/10 border-white/20'
                  : 'bg-white/[0.01] hover:bg-white/[0.03] border-white/5'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm shrink-0">{lvl.emoji}</span>
                <span className="text-white/90 font-medium font-sans truncate text-[11px]">{lvl.name}</span>
              </div>
              <span 
                className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 font-sans"
                style={{
                  backgroundColor: hasData ? `color-mix(in srgb, ${lvl.color} 12%, transparent)` : 'var(--pyramid-idle-fill)',
                  color: hasData ? lvl.color : 'var(--text-muted)'
                }}
              >
                {hasData ? 'Готово' : 'В процессе'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
