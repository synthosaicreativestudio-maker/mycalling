import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности — МоёПризвание',
  description: 'Политика конфиденциальности сервиса МоёПризвание. Информация о сборе, хранении и обработке персональных данных.',
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 lg:py-32 relative z-10">
      <div className="glass-panel rounded-[32px] p-8 lg:p-12 space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-skyMuted">
            Юридическая информация
          </p>
          <h1 className="mt-3 text-3xl font-extrabold text-text lg:text-4xl">
            Политика конфиденциальности
          </h1>
          <p className="mt-2 text-sm text-muted">
            Последнее обновление: {new Date().toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-text">1. Общие положения</h2>
          <p className="text-sm leading-7 text-muted">
            Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей
            сервиса «МоёПризвание» (далее — Сервис). Используя Сервис, вы соглашаетесь с условиями данной Политики.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-text">2. Какие данные мы собираем</h2>
          <ul className="space-y-2 text-sm leading-7 text-muted list-disc pl-5">
            <li>Имя ученика — для персонализации отчёта</li>
            <li>Класс обучения — для адаптации диагностики</li>
            <li>Электронная почта или контакт родителя — для отправки результатов</li>
            <li>Ответы на вопросы диагностики — для построения профиля</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-text">3. Как мы используем данные</h2>
          <p className="text-sm leading-7 text-muted">
            Собранные данные используются исключительно для предоставления результатов диагностики и формирования
            персонального отчёта. Мы не передаём данные третьим лицам, не используем их в рекламных целях и не продаём.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-text">4. Хранение данных</h2>
          <p className="text-sm leading-7 text-muted">
            Данные хранятся в защищённой базе данных. Мы применяем стандартные меры безопасности для предотвращения
            несанкционированного доступа, изменения, раскрытия или уничтожения данных.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-text">5. Права пользователя</h2>
          <p className="text-sm leading-7 text-muted">
            Вы имеете право запросить доступ к своим данным, их исправление или удаление. Для этого свяжитесь с нами
            по адресу{' '}
            <a href="mailto:hello@synthosai.ru" className="text-skyMuted hover:text-text transition underline">
              hello@synthosai.ru
            </a>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-text">6. Файлы cookie</h2>
          <p className="text-sm leading-7 text-muted">
            Сервис может использовать файлы cookie и localStorage для сохранения прогресса диагностики и улучшения
            пользовательского опыта. Вы можете отключить cookie в настройках браузера.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-text">7. Контакты</h2>
          <p className="text-sm leading-7 text-muted">
            По вопросам, связанным с обработкой персональных данных, обращайтесь:
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
