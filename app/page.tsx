import Link from 'next/link';

import { PrimaryButton } from './components/PrimaryButton';
import { assessmentBlocks, nextSteps, professions } from './data';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-10 lg:px-10">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-glow backdrop-blur">
        <div className="max-w-3xl space-y-6">
          <p className="text-sm uppercase tracking-[0.3em] text-accentSoft">МоеПризвание</p>
          <h1 className="text-4xl font-semibold leading-tight lg:text-6xl">
            Помогаем семье понять сильные стороны подростка и выбрать подходящие профессии без случайности.
          </h1>
          <p className="text-lg text-muted">
            Единый web-сценарий для ученика и родителя: короткий старт, понятная диагностика, объяснимый отчёт и
            следующий шаг развития.
          </p>
          <div className="flex flex-wrap gap-3">
            <PrimaryButton href="/lead">Начать семейный сценарий</PrimaryButton>
            <Link
              href="/assessment"
              className="rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-text transition hover:bg-white/5"
            >
              Посмотреть диагностику
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <InfoCard title="25–35 минут" text="Целевой коридор полной диагностики" />
            <InfoCard title="Единый отчёт" text="Для ученика и parent summary" />
            <InfoCard title="Объяснимый результат" text="Без black-box и магических выводов" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card title="Как устроена диагностика">
          <div className="grid gap-3">
            {assessmentBlocks.map((block) => (
              <div key={block.title} className="rounded-2xl border border-white/10 bg-surface/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-medium">{block.title}</p>
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
        </Card>

        <Card title="Что увидит семья после отчёта">
          <ul className="space-y-3 text-sm text-muted">
            <li>• сильные стороны и зоны роста простым языком</li>
            <li>• ведущие интересы, стиль деятельности и рабочую среду</li>
            <li>• топ профессий с match score и объяснением «почему подошло»</li>
            <li>• рекомендуемые предметы и направления обучения</li>
            <li>• следующий шаг на ближайший месяц и CTA на консультацию</li>
          </ul>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card title="Топ карьерных совпадений">
          <div className="space-y-3">
            {professions.map((profession) => (
              <div key={profession.name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium">{profession.name}</p>
                  <p className="text-accentSoft">{profession.score}%</p>
                </div>
                <p className="mt-2 text-sm text-muted">{profession.summary}</p>
                <p className="mt-3 text-sm text-muted">Предметы: {profession.subjects.join(' · ')}</p>
                <p className="mt-1 text-sm text-muted">Направления: {profession.directions.join(' · ')}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Следующий шаг после результата">
          <div className="space-y-4 text-sm text-muted">
            <p>
              После отчёта семья не остаётся с абстрактным выводом: сервис подсказывает, что изучать дальше,
              какие предметы усиливать и когда имеет смысл обсудить результат с экспертом.
            </p>
            <div className="rounded-2xl border border-accent/30 bg-accent/10 p-4 text-text">
              <p className="font-semibold">Следующие действия:</p>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                {nextSteps.map((step) => (
                  <li key={step}>• {step}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface/70 p-4">
      <p className="text-lg font-semibold text-text">{title}</p>
      <p className="mt-1 text-sm text-muted">{text}</p>
    </div>
  );
}
