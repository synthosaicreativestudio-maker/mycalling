import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { HeroOrb } from './components/HeroOrb';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-90px)] max-w-7xl flex-col justify-center px-6 py-10 lg:px-10 lg:py-16 relative overflow-hidden">
      {/* Фоновый интерактивный 3D-шар */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full lg:w-[55%] h-[600px] pointer-events-none z-0 opacity-90 select-none">
        <HeroOrb />
      </div>

      <div className="relative z-10 grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="max-w-3xl space-y-8 lg:space-y-10">
          {/* Бэдж бренда */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#7c8cff]/20 bg-[#7c8cff]/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-accentSoft font-syncopate shadow-[0_0_15px_rgba(124,140,255,0.08)]">
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-[#7c8cff]" />
            ИИ-Профориентация
          </div>

          {/* Заголовки */}
          <div className="space-y-6">
            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-7xl font-unbounded bg-gradient-to-r from-white via-[#eef2ff] to-[#7c8cff] bg-clip-text text-transparent">
              Определи свой путь с помощью ИИ
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted lg:text-xl font-inter">
              Пройди современную 3-факторную диагностику талантов, характера и интересов. Получи детальный ИИ-отчет с рекомендациями по профессиям, предметам и траектории развития.
            </p>
          </div>

          {/* Кнопки действий */}
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 rounded-2xl bg-accent px-8 py-4.5 text-base font-semibold text-white shadow-glow transition duration-300 hover:scale-[1.03] hover:shadow-[0_0_80px_rgba(124,140,255,0.3)] active:scale-[0.98]"
              style={{ height: '56px' }}
            >
              Запустить тест
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/report"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-8 py-4.5 text-base font-semibold text-text transition duration-300 hover:scale-[1.03] hover:bg-white/10 active:scale-[0.98]"
              style={{ height: '56px' }}
            >
              Посмотреть демо-отчёт
            </Link>
          </div>

          {/* Легкие метрики */}
          <div className="grid gap-4 pt-6 sm:grid-cols-3 border-t border-white/5 max-w-2xl">
            <MetricCard title="25 минут" text="Длина диагностики" />
            <MetricCard title="3-фактора" text="RIASEC + Big Five + Гарднер" />
            <MetricCard title="ИИ-Отчет" text="Понятный ребенку и родителям" />
          </div>
        </div>

        {/* Правая колонка grid для сохранения отступа под сферу на десктопах */}
        <div className="hidden lg:block h-[500px] pointer-events-none" />
      </div>
    </main>
  );
}

function MetricCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.03] bg-white/[0.02] p-4.5 backdrop-blur-sm transition duration-300 hover:border-white/10 hover:bg-white/[0.04]">
      <p className="text-lg font-bold text-text font-unbounded">{title}</p>
      <p className="mt-1 text-sm text-muted font-inter leading-relaxed">{text}</p>
    </div>
  );
}
