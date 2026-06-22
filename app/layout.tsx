import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'МоеПризвание',
  description: 'Диагностика способностей, карьерный отчет, профессии, предметы и направления обучения.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
