import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter, Syncopate, Unbounded } from 'next/font/google';
import { SpaceBackground } from './components/SpaceBackground';
import { IntroPreloader } from './components/IntroPreloader';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

const syncopate = Syncopate({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-syncopate',
  display: 'swap',
});

const unbounded = Unbounded({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-unbounded',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'МоеПризвание',
  description: 'Диагностика способностей, карьерный отчет, профессии, предметы и направления обучения.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${syncopate.variable} ${unbounded.variable}`}>
      <body className="relative min-h-screen bg-[#050816] text-[#eef2ff]">
        <IntroPreloader />
        <SpaceBackground />
        
        {/* Шапка сайта с логотипом */}
        <header className="mx-auto max-w-7xl px-6 pt-6 lg:px-10 lg:pt-8 relative z-50">
          <div className="flex items-center justify-between py-3.5 rounded-2xl border border-white/10 bg-[#0b1125]/45 px-6 backdrop-blur-md">
            <Link href="/" className="flex items-center transition hover:opacity-90">
              <img
                src="/assets/logos/logo-with-text.svg"
                alt="МоеПризвание"
                className="h-10 md:h-14 w-auto object-contain"
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

            <div className="flex items-center gap-4">
              <Link
                href="/auth"
                className="text-sm font-semibold text-muted hover:text-text transition"
              >
                Войти
              </Link>
              <Link
                href="/auth"
                className="rounded-full bg-accent px-5 py-2.5 text-xs font-semibold text-white shadow-glow transition hover:scale-[1.02] active:scale-[0.98]"
              >
                Начать тест
              </Link>
            </div>
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}
