export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-24 z-10 relative bg-[#080C14]/90 backdrop-blur-md rounded-[32px] my-12 border border-[#3B82F6]/20 shadow-2xl">
      <h1 className="text-3xl font-extrabold text-white font-sans mb-8">Политика конфиденциальности и обработки персональных данных</h1>
      <div className="prose prose-invert text-[var(--text-muted)] max-w-none">
        <p>Мы серьезно относимся к защите данных пользователей, особенно несовершеннолетних.</p>
        <h2 className="text-white">1. Какие данные мы собираем</h2>
        <p>Имя, класс обучения и результаты интерактивных заданий.</p>
        <h2 className="text-white">2. Цель обработки</h2>
        <p>Формирование персонализированного отчета по профориентации.</p>
        <h2 className="text-white">3. Хранение и защита</h2>
        <p>Мы используем зашифрованные каналы передачи данных. Ваши данные не передаются сторонним рекламным сетям.</p>
      </div>
    </main>
  );
}
