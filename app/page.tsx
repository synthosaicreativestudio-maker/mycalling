import Link from 'next/link';
import { Brain, BriefcaseBusiness, Compass, HeartHandshake, Sparkles, Target } from 'lucide-react';

import { PrimaryButton } from './components/PrimaryButton';
import { assessmentBlocks, familyBenefits, nextSteps, processSteps, professions, trustPoints } from './data';

const icons = [Brain, Compass, Sparkles, HeartHandshake, Target];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-8 lg:px-10 lg:py-10">
      <section className="glass-panel relative overflow-hidden rounded-[36px] px-7 py-8 lg:px-10 lg:py-10">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.25em] text-accentSoft">
              <Sparkles className="h-4 w-4" />
              МоеПризвание
            </div>

            <div className="space-y-5">
              <h1 className="gradient-title text-4xl font-semibold leading-[1.02] sm:text-5xl lg:text-7xl">
                Понятная профориентация для семьи, а не скучный тест с абстрактным выводом.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted lg:text-xl">
                Подросток проходит современную диагностику, а семья получает объяснимый карьерный отчёт: сильные
                стороны, профессии, предметы, направления обучения и следующий шаг без хаоса и случайности.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <PrimaryButton href="/lead">Начать семейный сценарий</PrimaryButton>
              <Link
                href="/report"
                className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-text transition hover:scale-[1.02] hover:bg-white/10 active:scale-[0.99]"
              >
                Посмотреть пример отчёта
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard title="25–35 минут" text="Комфортная длина всей диагностики" />
              <MetricCard title="5 сигнальных слоёв" text="Не один тест, а более объёмный профиль" />
              <MetricCard title="Единый отчёт" text="Понятный и подростку, и родителю" />
            </div>
          </div>

          <div className="grid gap-4">
            <div className="glass-panel rounded-[28px] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-accentSoft">Что получает семья</p>
                  <h2 className="mt-2 text-2xl font-semibold">Не просто список профессий</h2>
                </div>
                <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-sm font-semibold text-emerald-200">
                  explainable
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {familyBenefits.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-[28px] p-5">
              <div className="flex items-center gap-3">
                <BriefcaseBusiness className="h-5 w-5 text-accentSoft" />
                <p className="font-semibold">Пример карьерного совпадения</p>
              </div>
              <div className="mt-5 space-y-4">
                {professions.slice(0, 2).map((profession) => (
                  <div key={profession.name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{profession.name}</p>
                      <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-sm font-semibold text-emerald-200">
                        {profession.score}% Match
                      </span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-white/10">
                      <div className="metric-bar h-2 rounded-full" style={{ width: `${profession.score}%` }} />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted">{profession.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="glass-panel rounded-[32px] p-6 lg:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-accentSoft">Как устроен путь</p>
              <h2 className="mt-2 text-3xl font-semibold">От первого контакта до следующего шага</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-4">
            {processSteps.map((step) => (
              <div key={step.title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-lg font-semibold">{step.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel rounded-[32px] p-6 lg:p-7">
          <p className="text-sm uppercase tracking-[0.2em] text-accentSoft">Почему этому можно доверять</p>
          <h2 className="mt-2 text-3xl font-semibold">Продукт говорит понятно и по делу</h2>
          <div className="mt-6 space-y-3">
            {trustPoints.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-muted">
                {item}
              </div>
            ))}
          </div>
        </section>
      </section>

      <section className="glass-panel rounded-[32px] p-6 lg:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-accentSoft">Архитектура диагностики</p>
            <h2 className="mt-2 text-3xl font-semibold">Пять блоков, которые собираются в единый профиль</h2>
          </div>
          <Link
            href="/assessment"
            className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-text transition hover:scale-[1.02] hover:bg-white/10 active:scale-[0.99]"
          >
            Перейти к диагностике
          </Link>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-5">
          {assessmentBlocks.map((block, index) => {
            const Icon = icons[index] ?? Sparkles;

            return (
              <div key={block.title} className="group rounded-[28px] border border-white/10 bg-white/5 p-5 transition duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.08]">
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-2xl border border-accent/20 bg-accent/10 p-3 text-accentSoft transition group-hover:scale-105 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs uppercase tracking-[0.2em] text-accentSoft">{block.weight}</span>
                </div>
                <h3 className="mt-5 text-xl font-semibold">{block.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{block.description}</p>
                <div className="mt-5 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted">
                  {block.duration}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="glass-panel rounded-[32px] p-6 lg:p-7">
          <p className="text-sm uppercase tracking-[0.2em] text-accentSoft">После результата</p>
          <h2 className="mt-2 text-3xl font-semibold">Сервис не бросает семью после отчёта</h2>
          <div className="mt-6 space-y-3">
            {nextSteps.map((step) => (
              <div key={step} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-muted">
                {step}
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel rounded-[32px] p-6 lg:p-7">
          <p className="text-sm uppercase tracking-[0.2em] text-accentSoft">Топ карьерных совпадений</p>
          <h2 className="mt-2 text-3xl font-semibold">Профессии, которые можно объяснить</h2>
          <div className="mt-6 space-y-4">
            {professions.slice(0, 4).map((profession) => (
              <div key={profession.name} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-lg font-semibold">{profession.name}</p>
                  <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-sm font-semibold text-emerald-200">
                    {profession.score}% Match
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">{profession.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {profession.subjects.map((subject) => (
                    <span key={subject} className="soft-chip rounded-full px-3 py-1 text-xs text-accentSoft">
                      {subject}
                    </span>
                  ))}
                  {profession.directions.map((direction) => (
                    <span key={direction} className="soft-chip rounded-full px-3 py-1 text-xs text-muted">
                      {direction}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function MetricCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
      <p className="text-lg font-semibold text-text">{title}</p>
      <p className="mt-1 text-sm leading-6 text-muted">{text}</p>
    </div>
  );
}
