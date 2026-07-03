'use client';

import dynamic from 'next/dynamic';
import { designConfig } from '@/app/config/design';

// Загружаем трехмерную сцену частиц асинхронно с отключенным SSR
const ParticleScene = dynamic(
  () => import('./canvas/ParticleScene').then((mod) => mod.ParticleScene),
  {
    ssr: false,
    loading: () => null, // во время загрузки ничего не показываем (остается статичный космический градиент)
  }
);

export function ParticleBackground() {
  if (!designConfig.enableParticles) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden h-full w-full">
      <ParticleScene />
    </div>
  );
}
