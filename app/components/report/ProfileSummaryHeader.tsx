'use client';

import type { ReactNode } from 'react';
import { Compass, Award, Heart } from 'lucide-react';

interface ProfileSummaryHeaderProps {
  hollandCode?: string;
  topSignatureStrength?: { nameRu: string };
  topValue?: string;
}

/**
 * Компактная шапка-визитка профиля: 2-3 ключевых бейджа (код Холланда,
 * ведущая сила характера VIA, ведущая ценность PVQ), которые задают тон
 * отчету ещё до чтения полного текста — по аналогии с шапкой результатов
 * 16Personalities/CliftonStrengths.
 */
export default function ProfileSummaryHeader({ hollandCode, topSignatureStrength, topValue }: ProfileSummaryHeaderProps) {
  const badges: { icon: ReactNode; label: string; value: string }[] = [];

  if (hollandCode) {
    badges.push({ icon: <Compass className="h-4 w-4" />, label: 'Код призвания', value: hollandCode });
  }
  if (topSignatureStrength?.nameRu) {
    badges.push({ icon: <Award className="h-4 w-4" />, label: 'Ключевая сила', value: topSignatureStrength.nameRu });
  }
  if (topValue) {
    badges.push({ icon: <Heart className="h-4 w-4" />, label: 'Ведущая ценность', value: topValue });
  }

  if (badges.length === 0) return null;

  return (
    <div className="glass-card rounded-[28px] px-6 py-5 flex flex-wrap items-center gap-4">
      {badges.map((badge, i) => (
        <div
          key={i}
          className="inline-flex items-center gap-2.5 rounded-2xl border border-[#3B82F6]/20 bg-[#3B82F6]/5 px-4 py-2.5"
        >
          <span className="text-[var(--accent-brown)] theme-accent-text">{badge.icon}</span>
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)]">{badge.label}</span>
            <span className="text-sm font-bold text-white">{badge.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
