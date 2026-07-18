'use client';

import type { ReactNode } from 'react';

export interface ValueBarItem {
  /** Отображаемое название (например, название ценности PVQ или субшкалы ICAR). */
  label: string;
  /** Абсолютное значение (например, 4.2 из 5, или 2 из 3). */
  value: number;
  /** Максимально возможное значение шкалы — используется для нормализации ширины бара. */
  max: number;
  /** Необязательная подпись значения (например, "4.2/5"); если не задана — вычисляется из value/max. */
  valueLabel?: string;
}

interface ValueBarsProps {
  title: string;
  subtitle?: string;
  items: ValueBarItem[];
  icon?: ReactNode;
}

/**
 * Компактный горизонтальный бар-чарт для отображения относительных величин
 * (топ-ценности PVQ Шварца, субшкалы логического теста ICAR и т.п.).
 * Переиспользуемый презентационный компонент — без запросов к API.
 */
export default function ValueBars({ title, subtitle, items, icon }: ValueBarsProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="glass-card rounded-[28px] p-8">
      <div className="flex items-center gap-3 mb-1">
        {icon}
        <h2 className="text-lg font-bold text-white">{title}</h2>
      </div>
      {subtitle && <p className="text-xs text-[#7A8A9E] mb-4">{subtitle}</p>}
      <div className={`space-y-4 ${subtitle ? '' : 'mt-4'}`}>
        {items.map((item, i) => {
          const percent = item.max > 0 ? Math.max(4, Math.min(100, Math.round((item.value / item.max) * 100))) : 0;
          const displayValue = item.valueLabel ?? `${item.value}/${item.max}`;
          return (
            <div key={`${item.label}-${i}`} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span>{item.label}</span>
                <span className="text-[#3B82F6] theme-accent-text">{displayValue}</span>
              </div>
              <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#3B82F6] rounded-full transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
