import React, { useState } from 'react';
import { Compass, ChevronDown, Sparkles, Wallet, GraduationCap, TrendingUp } from 'lucide-react';
import { professionsDb } from '../../data/professions_db';

interface MatchAxisView {
  axis: string;
  label: string;
  score: number;
  weight: number;
}

interface RpgProfessionCardProps {
  name: string;
  score: number;
  why: string;
  /** «Веер» родственных специализаций того же архетипа (docs/22 §5). */
  variants?: string[];
  /** Разбивка совпадения по осям (docs/25 Трек A): «Интересы 92% · Ценности 80%». */
  breakdown?: MatchAxisView[];
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

function getRiasecStats(riasec: string[]): { analytic: number; creative: number; practical: number } {
  return {
    analytic: Math.round((codeWeight(riasec, 'Investigative') + codeWeight(riasec, 'Conventional')) / 2),
    creative: codeWeight(riasec, 'Artistic'),
    practical: Math.round((codeWeight(riasec, 'Realistic') + codeWeight(riasec, 'Enterprising')) / 2)
  };
}

const TIER_BADGE: Record<string, { icon: string; label: string }> = {
  everyday: { icon: '🟢', label: 'Прочный путь' },
  future: { icon: '🔵', label: 'Профессия будущего' },
  dream: { icon: '🟣', label: 'Смелая мечта' },
};

export default function RpgProfessionCard({ name, score, why, variants, breakdown }: RpgProfessionCardProps) {
  const [open, setOpen] = useState(false);
  const profession = professionsDb.find((p) => p.name === name);
  const stats = profession ? getRiasecStats(profession.riasec) : null;
  const fan = (variants ?? []).filter((v) => v && v !== name);
  const tier = profession?.tier ? TIER_BADGE[profession.tier] : null;

  return (
    <div className="relative group overflow-hidden rounded-[24px] border border-white/5 bg-[#080C14]/40 hover:border-[var(--accent-wash-30)] hover:bg-[var(--accent-wash-5)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.03)] transition-all duration-300 text-left">
      {/* Шапка-кнопка: клик раскрывает карточку (docs/25 Трек B). */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full text-left p-5 flex items-start gap-4 cursor-pointer"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-wash-10)] border border-[var(--accent-wash-20)] text-[var(--accent-brown)] group-hover:scale-105 transition duration-300 shadow-inner">
          <Compass className="h-5.5 w-5.5" />
        </div>

        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-extrabold text-white text-xs md:text-sm truncate leading-snug font-sans">
              {name}
            </h3>
            <span className="shrink-0 flex items-center gap-1.5">
              {tier && (
                <span className="text-[9px] text-[var(--text-muted)] font-semibold hidden md:inline">{tier.icon}</span>
              )}
              <span className="text-[9px] font-black px-2 py-0.5 bg-[var(--accent-wash-10)] text-[var(--accent-brown)] border border-[var(--accent-wash-20)] rounded-full font-sans tracking-wide">
                {score}%
              </span>
              <ChevronDown className={`h-4 w-4 text-[var(--text-muted)] transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
            </span>
          </div>
          {/* Тизер в свёрнутом виде — 1 строка, чтобы список не был портянкой. */}
          <p className={`text-[10px] text-[var(--text-muted)] leading-relaxed ${open ? 'line-clamp-none' : 'line-clamp-1'}`}>
            {profession?.summary || why}
          </p>
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 motion-safe:animate-[fadeIn_.3s_ease]">
          {/* Удивительный факт */}
          {profession?.fact && (
            <div className="rounded-2xl bg-[var(--accent-wash-5)] border border-[var(--accent-wash-10)] p-3.5">
              <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-extrabold text-[var(--accent-brown)] mb-1 font-sans">
                <Sparkles className="h-3 w-3" /> А ты знал?
              </span>
              <p className="text-[11px] text-white/80 leading-relaxed">{profession.fact}</p>
            </div>
          )}

          {/* Почему подходит + разбивка по осям (docs/25 Трек A) */}
          <div className="space-y-2">
            <span className="text-[8px] uppercase tracking-widest font-extrabold text-[var(--text-muted)] block font-sans">Почему тебе подходит</span>
            <p className="text-[11px] text-white/75 leading-relaxed">{why}</p>
            {breakdown && breakdown.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {breakdown.map((b) => (
                  <span key={b.axis} className="text-[9px] font-semibold text-[var(--text-muted)] bg-white/5 border border-white/5 rounded-full px-2 py-0.5">
                    {b.label} {b.score}%
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Зарплата / образование / перспективы (docs/26 Этап 8) */}
          {(profession?.salary || profession?.educationPath || profession?.outlook) && (
            <div className="grid grid-cols-1 gap-2">
              {profession?.salary && (
                <div className="flex items-start gap-2 text-[10px] text-white/70">
                  <Wallet className="h-3.5 w-3.5 shrink-0 text-[var(--accent-brown)] mt-0.5" />
                  <span><span className="text-[var(--text-muted)]">Доход (ориентировочно): </span>{profession.salary}</span>
                </div>
              )}
              {profession?.educationPath && (
                <div className="flex items-start gap-2 text-[10px] text-white/70">
                  <GraduationCap className="h-3.5 w-3.5 shrink-0 text-[var(--accent-brown)] mt-0.5" />
                  <span><span className="text-[var(--text-muted)]">Путь: </span>{profession.educationPath}</span>
                </div>
              )}
              {profession?.outlook && (
                <div className="flex items-start gap-2 text-[10px] text-white/70">
                  <TrendingUp className="h-3.5 w-3.5 shrink-0 text-[var(--accent-brown)] mt-0.5" />
                  <span><span className="text-[var(--text-muted)]">Перспективы: </span>{profession.outlook}</span>
                </div>
              )}
            </div>
          )}

          {stats && (
            <div className="border-t border-white/5 pt-3.5 space-y-2">
              <span className="text-[8px] uppercase tracking-widest font-extrabold text-[var(--text-muted)] block mb-1 font-sans">Профиль по RIASEC</span>
              {[
                { label: 'Аналитический склад', value: stats.analytic, color: 'bg-blue-500' },
                { label: 'Креативный потенциал', value: stats.creative, color: 'bg-pink-500' },
                { label: 'Практические навыки', value: stats.practical, color: 'bg-green-500' },
              ].map((row) => (
                <div className="space-y-1" key={row.label}>
                  <div className="flex items-center justify-between text-[9px] font-bold text-white/70">
                    <span>{row.label}</span>
                    <span>{row.value}/100</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${row.color} rounded-full transition-all duration-1000`} style={{ width: `${row.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Школьные предметы */}
          {profession?.subjects && profession.subjects.length > 0 && (
            <div className="border-t border-white/5 pt-3">
              <span className="text-[8px] uppercase tracking-widest font-extrabold text-[var(--text-muted)] block mb-1.5 font-sans">Школьные предметы</span>
              <div className="flex flex-wrap gap-1.5">
                {profession.subjects.map((s, i) => (
                  <span key={i} className="text-[9px] font-semibold text-[var(--text-muted)] bg-white/5 border border-white/5 rounded-full px-2 py-0.5">{s}</span>
                ))}
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
      )}
    </div>
  );
}
