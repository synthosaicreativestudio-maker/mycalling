export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-24 z-10 relative bg-[#080C14]/90 backdrop-blur-md rounded-[32px] my-12 border border-[var(--accent-wash-20)] shadow-2xl">
      <h1 className="text-3xl font-extrabold text-white font-sans mb-8">Пользовательское соглашение и Публичная оферта</h1>
      <div className="prose prose-invert text-[var(--text-muted)] max-w-none">
        <p>Настоящее пользовательское соглашение устанавливает правила использования сервиса «МоёПризвание».</p>
        <h2 className="text-white">1. Общие положения</h2>
        <p>Сервис предоставляет услуги профориентационного тестирования на основе ответов пользователя.</p>
        <h2 className="text-white">2. Согласие родителей</h2>
        <p>Используя сервис, вы подтверждаете, что являетесь законным представителем несовершеннолетнего (если пользователю менее 18 лет) или получили согласие от родителей.</p>
        <h2 className="text-white">3. Ограничение ответственности</h2>
        <p>Результаты носят рекомендательный характер и не являются прямым указанием к действию.</p>
      </div>
    </main>
  );
}
