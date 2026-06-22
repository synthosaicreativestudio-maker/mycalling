import './globals.css';
import type { Metadata } from 'next';
import { SpaceBackground } from './components/SpaceBackground';

export const metadata: Metadata = {
  title: 'МоеПризвание',
  description: 'Диагностика способностей, карьерный отчет, профессии, предметы и направления обучения.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="relative min-h-screen">
        <SpaceBackground />
        {children}
      </body>
    </html>
  );
}
