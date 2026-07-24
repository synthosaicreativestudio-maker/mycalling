'use client';

import { Compass as Target, Sparkles, Zap, Shield } from 'lucide-react';

export interface DeepSessionData {
  synthesis: string;
  goal: string;
  identity: string;
  barriers?: string;
  firstStep: string;
  // docs/31 Блок C1: нужны PyramidOfAlignment на /report (7 ярусов пирамиды),
  // но не используются самой DeepSessionCard.
  outcome?: string;
  emotions?: string;
  actions?: string;
}

interface DeepSessionCardProps {
  deepSession?: DeepSessionData | null;
}

/**
 * Раздел "Глубинная сессия" — рендерится только если пользователь прошёл
 * полную глубинную коуч-сессию (методология «Хочу → Действие», см.
 * app/api/v1/coach/chat/route.ts). Показывает уже синтезированный ИИ-инсайт
 * (не дословную цитату) плюс три опорных поля. Отдельный акцентный цвет
 * (песочно-коричневый бренд-акцент), чтобы визуально отличаться от обычного
 * блока нейрокоуча.
 */
export default function DeepSessionCard({ deepSession }: DeepSessionCardProps) {
  if (!deepSession || !deepSession.synthesis) return null;

  return (
    <div className="glass-card rounded-[28px] p-8 border border-[#C4A484]/30 theme-deep-session-card">
      <div className="flex items-center gap-3 mb-5">
        <Sparkles className="h-5 w-5 text-[#C4A484] theme-deep-session-icon" />
        <h2 className="text-lg font-bold text-white">Глубокая коуч сессия</h2>
      </div>

      <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6 theme-subcard-text">
        {deepSession.synthesis}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {deepSession.goal && (
          <div className="p-4 bg-[#C4A484]/5 border border-[#C4A484]/20 rounded-2xl theme-deep-session-sub">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Target className="h-3.5 w-3.5 text-[#C4A484] theme-deep-session-icon" />
              <h4 className="text-xs uppercase tracking-wider font-extrabold text-[#C4A484] theme-deep-session-title font-sans">Цель</h4>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed theme-subcard-text font-medium">{deepSession.goal}</p>
          </div>
        )}
        {deepSession.identity && (
          <div className="p-4 bg-[#C4A484]/5 border border-[#C4A484]/20 rounded-2xl theme-deep-session-sub">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#C4A484] theme-deep-session-icon" />
              <h4 className="text-xs uppercase tracking-wider font-extrabold text-[#C4A484] theme-deep-session-title font-sans">Идентичность</h4>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed theme-subcard-text font-bold italic">{deepSession.identity}</p>
          </div>
        )}
        {deepSession.barriers && (
          <div className="p-4 bg-[#C4A484]/5 border border-[#C4A484]/20 rounded-2xl theme-deep-session-sub">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Shield className="h-3.5 w-3.5 text-[#C4A484] theme-deep-session-icon" />
              <h4 className="text-xs uppercase tracking-wider font-extrabold text-[#C4A484] theme-deep-session-title font-sans">Барьеры</h4>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed theme-subcard-text font-medium">{deepSession.barriers}</p>
          </div>
        )}
        {deepSession.firstStep && (
          <div className="p-4 bg-[#C4A484]/5 border border-[#C4A484]/20 rounded-2xl theme-deep-session-sub">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Zap className="h-3.5 w-3.5 text-[#C4A484] theme-deep-session-icon" />
              <h4 className="text-xs uppercase tracking-wider font-extrabold text-[#C4A484] theme-deep-session-title font-sans">Первый шаг</h4>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed theme-subcard-text font-bold">{deepSession.firstStep}</p>
          </div>
        )}
      </div>
    </div>
  );
}
