import Link from 'next/link';

import { assessmentBlocks } from '../data';

export default function AssessmentPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10 lg:px-10">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <p className="text-sm uppercase tracking-[0.3em] text-accentSoft">Диагностика</p>
        <h1 className="mt-3 text-4xl font-semibold">Диагностика, которая ощущается легче классического теста</h1>
        <p className="mt-4 max-w-3xl text-muted">
          Сценарий разбит на пять коротких сигнальных блоков. Пользователь видит прогресс, понимает цель каждого
          этапа и приходит к объяснимому результату, а не к абстрактной оценке.
        </p>

        <div className="mt-8 grid gap-4">
          {assessmentBlocks.map((block, index) => (
            <div key={block.title} className="rounded-2xl border border-white/10 bg-surface/70 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-medium">
                  {index + 1}. {block.title}
                </p>
                <div className="flex gap-2 text-xs text-accentSoft">
                  <span>{block.weight}</span>
                  <span>•</span>
                  <span>{block.duration}</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted">{block.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <MetricCard title="5 блоков" text="Способности, интересы, личность, поведение и мотивация." />
          <MetricCard title="25–35 минут" text="Рабочий коридор прохождения диагностики для MVP." />
          <MetricCard title="Понятный прогресс" text="Пользователь видит, что уже пройдено и зачем нужен каждый шаг." />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/report"
            className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02]"
          >
            Посмотреть пример отчёта
          </Link>
          <Link
            href="/lead"
            className="rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-text transition hover:bg-white/5"
          >
            Перейти к старту сценария
          </Link>
        </div>
      </div>
    </main>
  );
}

function MetricCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-lg font-semibold">{title}</p>
      <p className="mt-2 text-sm text-muted">{text}</p>
    </div>
  );
}
