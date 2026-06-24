import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Пользовательское соглашение — МоёПризвание',
  description: 'Пользовательское соглашение сервиса МоёПризвание. Условия использования, права и обязанности сторон.',
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 lg:py-32 relative z-10">
      <div className="glass-panel rounded-[32px] p-8 lg:p-12 space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-skyMuted">
            Юридическая информация
          </p>
          <h1 className="mt-3 text-3xl font-extrabold text-text lg:text-4xl">
            Пользовательское соглашение
          </h1>
          <p className="mt-2 text-sm text-muted">
            Последнее обновление: {new Date().toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-text">1. Предмет соглашения</h2>
          <p className="text-sm leading-7 text-muted">
            Настоящее соглашение регулирует отношения между пользователем и сервисом «МоёПризвание» (далее — Сервис).
            Сервис предоставляет онлайн-диагностику талантов и профессиональных склонностей для школьников.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-text">2. Описание услуг</h2>
          <ul className="space-y-2 text-sm leading-7 text-muted list-disc pl-5">
            <li>Интерактивная диагностика на основе научных методик (RIASEC, Big Five, Гарднер)</li>
            <li>Формирование персонального отчёта с рекомендациями</li>
            <li>Подбор подходящих профессий и предметов для углублённого изучения</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-text">3. Ограничение ответственности</h2>
          <p className="text-sm leading-7 text-muted">
            Результаты диагностики носят рекомендательный характер и не являются профессиональной психологической
            консультацией. Сервис не гарантирует точность результатов и не несёт ответственности за решения, принятые
            на их основе.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-text">4. Права и обязанности</h2>
          <p className="text-sm leading-7 text-muted">
            Пользователь обязуется предоставлять достоверную информацию при прохождении диагностики. Сервис обязуется
            обеспечивать конфиденциальность данных в соответствии с{' '}
            <Link href="/privacy" className="text-skyMuted hover:text-text transition underline">
              Политикой конфиденциальности
            </Link>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-text">5. Интеллектуальная собственность</h2>
          <p className="text-sm leading-7 text-muted">
            Все материалы, методики и визуальные элементы Сервиса являются интеллектуальной собственностью
            и защищены законодательством об авторском праве. Копирование, распространение или модификация
            материалов без письменного разрешения запрещены.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-text">6. Изменение условий</h2>
          <p className="text-sm leading-7 text-muted">
            Сервис оставляет за собой право вносить изменения в настоящее Соглашение. Актуальная версия
            всегда доступна на данной странице. Продолжение использования Сервиса после внесения изменений
            означает согласие с обновлёнными условиями.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-text">7. Контакты</h2>
          <p className="text-sm leading-7 text-muted">
            По всем вопросам обращайтесь:
            <br />
            Email:{' '}
            <a href="mailto:hello@synthosai.ru" className="text-skyMuted hover:text-text transition underline">
              hello@synthosai.ru
            </a>
          </p>
        </section>

        <div className="pt-4 border-t border-sky/15">
          <Link href="/" className="text-sm text-skyMuted hover:text-text transition">
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    </main>
  );
}
