'use client';

import { useEffect, useState } from 'react';

export function SpaceBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="fixed inset-0 -z-50 bg-[#f5f7fa]" />;
  }

  // Создаем 8 изящных линий
  const linesCount = 8;
  const lines = Array.from({ length: linesCount }, (_, i) => {
    const offset = i * 20;
    const delay = -(i * 1.5);
    const duration = 15 + (i % 3) * 4;
    // Очень нежные полупрозрачные линии
    const opacity = 0.15 + (1 - Math.abs(i - linesCount / 2) / (linesCount / 2)) * 0.25;
    const strokeWidth = 1.0 + (1 - Math.abs(i - linesCount / 2) / (linesCount / 2)) * 1.5;

    // Вспомогательные переменные для анимации Безье
    const yStart = 500 + offset * 0.4;
    const cp1_x = 350 + i * 15;
    const cp1_y1 = 650 + offset * 0.6;
    const cp1_y2 = 600 + offset * 0.5;
    const cp1_y3 = 700 + offset * 0.7;

    const cp2_x = 1000 - i * 12;
    const cp2_y1 = 600 - offset * 0.2;
    const cp2_y2 = 630 - offset * 0.1;
    const cp2_y3 = 570 - offset * 0.3;

    const yEnd = 200 + offset * 0.15;

    return {
      id: i,
      delay: `${delay}s`,
      duration: `${duration}s`,
      opacity,
      strokeWidth,
      pathId: `bg-curve-${i}`,
      path1: `M -100,${yStart} C ${cp1_x},${cp1_y1} ${cp2_x},${cp2_y1} 1540,${yEnd}`,
      path2: `M -100,${yStart + 15} C ${cp1_x + 20},${cp1_y2} ${cp2_x - 20},${cp2_y2} 1540,${yEnd - 10}`,
      path3: `M -100,${yStart - 15} C ${cp1_x - 20},${cp1_y3} ${cp2_x + 20},${cp2_y3} 1540,${yEnd + 10}`,
    };
  });

  return (
    <div className="fixed inset-0 -z-50 h-full w-full overflow-hidden bg-[#f5f7fa] print:hidden">
      {/* 1. Картинка-подложка из референса */}
      <div 
        className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-85"
        style={{ backgroundImage: 'url(/assets/backgrounds/light-bg.png)' }}
      />
      
      {/* Мягкие дополнительные свечения */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(255,255,255,0.7)_0%,transparent_60%)] blur-[40px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(212,168,83,0.06)_0%,transparent_50%)] blur-[50px] pointer-events-none" />

      {/* 2. SVG слой с анимированными нитями и золотыми частицами */}
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 900"
      >
        <defs>
          {/* Градиент для нитей: нежно-голубые переходы */}
          <linearGradient id="lightLineGrad" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#93c5fd" stopOpacity="0" />
            <stop offset="30%" stopColor="#bfdbfe" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#60a5fa" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#93c5fd" stopOpacity="0" />
          </linearGradient>

          {/* Золотой радиальный градиент для светящихся частиц */}
          <radialGradient id="goldParticleGrad">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#d97706" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
          </radialGradient>

          {/* Мягкое свечение для частиц */}
          <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Слой нитей */}
        {lines.map((line) => (
          <g key={line.id}>
            {/* Сама линия */}
            <path
              id={line.pathId}
              d={line.path1}
              fill="none"
              stroke="url(#lightLineGrad)"
              strokeWidth={line.strokeWidth}
              opacity={line.opacity}
            >
              <animate
                attributeName="d"
                values={`${line.path1}; ${line.path2}; ${line.path3}; ${line.path1}`}
                dur={line.duration}
                begin={line.delay}
                repeatCount="indefinite"
              />
            </path>

            {/* Золотистая частица 1, движущаяся вдоль линии */}
            <circle
              r={3 + (line.id % 3)}
              fill="url(#goldParticleGrad)"
              filter="url(#goldGlow)"
              opacity={0.8}
            >
              <animateMotion
                dur={`${22 + (line.id % 4) * 5}s`}
                repeatCount="indefinite"
                begin={`${line.id * 2}s`}
              >
                <mpath href={`#${line.pathId}`} />
              </animateMotion>
            </circle>

            {/* Вторая золотистая частица со смещением по времени */}
            {line.id % 2 === 0 && (
              <circle
                r={2 + (line.id % 2)}
                fill="url(#goldParticleGrad)"
                filter="url(#goldGlow)"
                opacity={0.65}
              >
                <animateMotion
                  dur={`${18 + (line.id % 3) * 6}s`}
                  repeatCount="indefinite"
                  begin={`${line.id * 2 + 10}s`}
                >
                  <mpath href={`#${line.pathId}`} />
                </animateMotion>
              </circle>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
