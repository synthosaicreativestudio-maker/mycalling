import Link from 'next/link';

import {
  directionRecommendations,
  growthAreas,
  nextSteps,
  professions,
  strengths,
  subjectRecommendations
} from '../data';

export default function ReportPage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10 lg:px-10">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.3em] text-accentSoft">Итоговый отчёт</p>
          <h1 className="mt-3 text-4xl font-semibold">Профиль способностей и карьерный матчинг</h1>
          <p className="mt-4 text-muted">
            Профиль показывает сильные стороны ученика, ведущий стиль деятельности и объяснимые карьерные совпадения.
            Это не финальный приговор, а основа для следующего осмысленного шага.
          </p>

          <div className="mt-8 grid gap-4">
            <ReportBlock
              title="Hero summary"
              items={[
                'Сильный аналитический профиль с высокой склонностью к работе со структурой и закономерностями.',
                'Уверенность результата: высокая, потому что сигналы из способностей, интересов и мотивации согласованы.'
              ]}
            />
            <ReportBlock title="Сильные стороны" items={strengths} />
            <ReportBlock title="Зоны роста" items={growthAreas} />
            <ReportBlock title="Рекомендуемые предметы" items={subjectRecommendations} />
            <ReportBlock title="Направления обучения" items={directionRecommendations} />
            <ReportBlock title="Следующие шаги" items={nextSteps} />
          </div>
        </section>

        <aside className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
          <div>
            <h2 className="text-2xl font-semibold">Рекомендованные профессии</h2>
            <div className="mt-5 space-y-3">
              {professions.map((profession) => (
                <div key={profession.name} className="rounded-2xl border border-white/10 bg-surface/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{profession.name}</p>
                    <p className="text-accentSoft">{profession.score}%</p>
                  </div>
                  <p className="mt-2 text-sm text-muted">{profession.summary}</p>
                  <p className="mt-3 text-sm text-muted">Предметы: {profession.subjects.join(' · ')}</p>
                  <p className="mt-1 text-sm text-muted">Направления: {profession.directions.join(' · ')}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-accent/30 bg-accent/10 p-4">
            <p className="font-semibold text-text">Parent summary</p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>• У ребёнка выражена склонность к аналитике и структурным задачам.</li>
              <li>• Лучше всего раскрывается там, где есть понятная логика, цель и измеримый результат.</li>
              <li>• Стоит мягко усиливать коммуникацию, проектность и уверенность в публичной подаче.</li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/lead"
              className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02]"
            >
              Записаться на разбор
            </Link>
            <Link
              href="/assessment"
              className="rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-text transition hover:bg-white/5"
            >
              Вернуться к диагностике
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}

function ReportBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface/70 p-4">
      <p className="font-medium">{title}</p>
      <ul className="mt-2 space-y-2 text-sm text-muted">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
