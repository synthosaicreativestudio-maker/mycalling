import Link from 'next/link';

export default function LeadPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-10 lg:px-10">
      <section className="w-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <p className="text-sm uppercase tracking-[0.3em] text-accentSoft">Старт сценария</p>
        <h1 className="mt-3 text-4xl font-semibold">Оставьте контакт и начните семейный сценарий</h1>
        <p className="mt-4 text-muted">
          На старте мы берём минимальный контекст: как зовут ученика, кто проходит сценарий и как вернуться к
          результату позже. Это соответствует MVP-потоку до основной диагностики.
        </p>

        <form className="mt-8 grid gap-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <input
              className="rounded-2xl border border-white/10 bg-surface/80 px-4 py-3 outline-none transition focus:border-accent"
              placeholder="Имя ученика"
            />
            <input
              className="rounded-2xl border border-white/10 bg-surface/80 px-4 py-3 outline-none transition focus:border-accent"
              placeholder="Класс: 9, 10 или 11"
            />
          </div>
          <input
            className="rounded-2xl border border-white/10 bg-surface/80 px-4 py-3 outline-none transition focus:border-accent"
            placeholder="Email или Telegram родителя"
          />
          <textarea
            className="min-h-32 rounded-2xl border border-white/10 bg-surface/80 px-4 py-3 outline-none transition focus:border-accent"
            placeholder="Какая задача сейчас важнее всего: выбрать профессию, предметы, направление обучения или понять сильные стороны?"
          />

          <div className="rounded-2xl border border-white/10 bg-surface/60 p-4 text-sm text-muted">
            После старта пользователь переходит в диагностику, а результат можно сохранить и вернуться к нему позже.
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/assessment"
              className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02]"
            >
              Перейти к диагностике
            </Link>
            <Link
              href="/report"
              className="rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-text transition hover:bg-white/5"
            >
              Посмотреть пример результата
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
