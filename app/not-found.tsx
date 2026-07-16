import Link from 'next/link';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center px-6 text-center z-10 relative">
      <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 mb-8">
        <Compass className="h-12 w-12 text-[#3B82F6] animate-spin" style={{ animationDuration: '8s' }} />
      </div>
      
      <h1 className="font-serif text-4xl md:text-5xl text-white mb-4">
        Путь не найден
      </h1>
      
      <p className="max-w-md text-sm md:text-base text-gray-400 mb-10 leading-relaxed">
        Страница, которую вы ищете, затерялась в космическом пространстве или никогда не существовала. Давайте вернемся на правильный маршрут.
      </p>

      <Link
        href="/"
        className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white transition font-medium shadow-lg shadow-[#3B82F6]/20 border border-[#3B82F6]/30 hover:scale-[1.02] active:scale-[0.98]"
      >
        <Home className="h-4 w-4" />
        Вернуться на главную
      </Link>
    </div>
  );
}
