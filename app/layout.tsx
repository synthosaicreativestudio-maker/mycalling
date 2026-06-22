import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SpaceBackground } from './components/SpaceBackground';

export const metadata: Metadata = {
  title: 'МоеПризвание',
  description: 'Диагностика способностей, карьерный отчет, профессии, предметы и направления обучения.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="relative min-h-screen bg-[#050816]">
        <SpaceBackground />
        
        {/* Шапка сайта с логотипом */}
        <header className="mx-auto max-w-7xl px-6 pt-6 lg:px-10 lg:pt-8 relative z-50">
          <div className="flex items-center justify-between py-3 rounded-2xl border border-white/10 bg-[#0b1125]/45 px-5 backdrop-blur-md">
            <Link href="/" className="flex items-center transition hover:opacity-90">
              <img
                src="/assets/logos/logo-with-text.svg"
                alt="МоеПризвание"
                className="h-10 md:h-12 w-auto object-contain"
              />
            </Link>
            
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm font-medium text-muted hover:text-text transition">
                Главная
              </Link>
              <Link href="/assessment" className="text-sm font-medium text-muted hover:text-text transition">
                Диагностика
              </Link>
              <Link href="/report" className="text-sm font-medium text-muted hover:text-text transition">
                Пример отчёта
              </Link>
            </nav>

            <Link
              href="/lead"
              className="rounded-full bg-accent px-5 py-2.5 text-xs font-semibold text-white shadow-glow transition hover:scale-[1.02] active:scale-[0.98]"
            >
              Начать тест
            </Link>
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}
