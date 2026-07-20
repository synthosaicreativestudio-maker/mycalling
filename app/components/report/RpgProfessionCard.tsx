import React from 'react';
import { Compass } from 'lucide-react';
import { professionsDb } from '../../data/professions_db';

interface RpgProfessionCardProps {
  name: string;
  score: number;
  why: string;
  /** «Веер» родственных специализаций того же архетипа (docs/22 §5). */
  variants?: string[];
}

// Раньше "RPG-статы" считались наивным сопоставлением ключевых слов в НАЗВАНИИ
// профессии — например, любая профессия с "менеджер" в названии получала
// одинаковые статы независимо от реального RIASEC-профиля. Теперь берём
// фактический riasec-код профессии из базы (professions_db.ts) и переводим
// его в три понятные шкалы. Если профессия не найдена в базе (рассинхрон
// имён) — честно не рисуем статы, а не подставляем выдуманные числа.
const codeWeight = (riasec: string[], code: string): number => {
  const idx = riasec.indexOf(code);
  if (idx === -1) return 20;
  return [95, 65, 40][idx] ?? 30;
};

function getRiasecStats(name: string): { analytic: number; creative: number; practical: number } | null {
  const profession = professionsDb.find(p => p.name === name);
  if (!profession) return null;
  const riasec = profession.riasec;
  return {
    analytic: Math.round((codeWeight(riasec, 'Investigative') + codeWeight(riasec, 'Conventional')) / 2),
    creative: codeWeight(riasec, 'Artistic'),
    practical: Math.round((codeWeight(riasec, 'Realistic') + codeWeight(riasec, 'Enterprising')) / 2)
  };
}

export default function RpgProfessionCard({ name, score, why, variants }: RpgProfessionCardProps) {
  const stats = getRiasecStats(name);
  const fan = (variants ?? []).filter((v) => v && v !== name);

  return (
    <div className="relative group overflow-hidden rounded-[24px] border border-white/5 bg-[#080C14]/40 p-5 space-y-4 hover:border-[#3B82F6]/30 hover:bg-[#3B82F6]/5 hover:shadow-[0_8px_30px_rgba(59,130,246,0.03)] transition-all duration-300 text-left">
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#3B82F6]/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none" />
      
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[var(--accent-brown)] group-hover:scale-105 group-hover:bg-[var(--accent-brown)] group-hover:text-white transition duration-300 shadow-inner">
          <Compass className="h-5.5 w-5.5" />
        </div>

        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-extrabold text-white text-xs md:text-sm truncate leading-snug font-sans group-hover:text-[var(--accent-brown)] transition">
              {name}
            </h3>
            <span className="shrink-0 text-[9px] font-black px-2 py-0.5 bg-[#3B82F6]/10 text-[var(--accent-brown)] border border-[#3B82F6]/20 rounded-full font-sans tracking-wide">
              {score}%
            </span>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] leading-relaxed line-clamp-3">
            {why}
          </p>
        </div>
      </div>

      {stats && (
        <div className="border-t border-white/5 pt-3.5 space-y-2">
          <span className="text-[8px] uppercase tracking-widest font-extrabold text-[var(--text-muted)] block mb-1 font-sans">Профиль по RIASEC</span>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[9px] font-bold text-white/70">
              <span>Аналитический склад</span>
              <span>{stats.analytic}/100</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${stats.analytic}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[9px] font-bold text-white/70">
              <span>Креативный потенциал</span>
              <span>{stats.creative}/100</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-pink-500 rounded-full transition-all duration-1000" style={{ width: `${stats.creative}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[9px] font-bold text-white/70">
              <span>Практические навыки</span>
              <span>{stats.practical}/100</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: `${stats.practical}%` }} />
            </div>
          </div>
        </div>
      )}

      {fan.length > 0 && (
        <div className="border-t border-white/5 pt-3">
          <span className="text-[8px] uppercase tracking-widest font-extrabold text-[var(--text-muted)] block mb-1.5 font-sans">
            Близкие специализации
          </span>
          <div className="flex flex-wrap gap-1.5">
            {fan.map((v, i) => (
              <span
                key={i}
                className="text-[9px] font-semibold text-[var(--text-muted)] bg-white/5 border border-white/5 rounded-full px-2 py-0.5"
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
