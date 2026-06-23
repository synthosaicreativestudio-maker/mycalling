'use client';

import { useEffect, useState } from 'react';

export function SpaceBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="fixed inset-0 -z-50 bg-[#020205]" />;
  }

  // Создаем параметры для 15 изящных линий
  const linesCount = 16;
  const lines = Array.from({ length: linesCount }, (_, i) => {
    // Рассчитываем уникальные сдвиги для каждой линии, чтобы они создавали плотную, но воздушную ленту
    const offset = i * 14;
    const delay = -(i * 0.85); // Сдвиг по времени для эффекта волны
    const duration = 12 + (i % 4) * 3.5; // Разная скорость для эффекта «живого» переплетения
    const opacity = 0.08 + (1 - Math.abs(i - linesCount / 2) / (linesCount / 2)) * 0.45; // Максимальная яркость в центре ленты
    const strokeWidth = 0.8 + (1 - Math.abs(i - linesCount / 2) / (linesCount / 2)) * 1.4; // Тонкие края, более выраженный центр

    // Вспомогательные переменные для анимации Безье
    const yStart = 680 + offset * 0.5;
    const cp1_x = 420 + i * 8;
    const cp1_y1 = 810 + offset * 0.8;
    const cp1_y2 = 770 + offset * 0.7;
    const cp1_y3 = 850 + offset * 0.9;

    const cp2_x = 980 - i * 6;
    const cp2_y1 = 760 - offset * 0.3;
    const cp2_y2 = 800 - offset * 0.2;
    const cp2_y3 = 720 - offset * 0.4;

    const yEnd = 240 + offset * 0.2;

    return {
      id: i,
      delay: `${delay}s`,
      duration: `${duration}s`,
      opacity,
      strokeWidth,
      path1: `M 0,${yStart} C ${cp1_x},${cp1_y1} ${cp2_x},${cp2_y1} 1440,${yEnd}`,
      path2: `M 0,${yStart + 20} C ${cp1_x + 30},${cp1_y2} ${cp2_x - 30},${cp2_y2} 1440,${yEnd - 15}`,
      path3: `M 0,${yStart - 20} C ${cp1_x - 30},${cp1_y3} ${cp2_x + 30},${cp2_y3} 1440,${yEnd + 15}`,
    };
  });

  return (
    <div className="fixed inset-0 -z-50 h-full w-full overflow-hidden bg-[#020205] print:hidden">
      {/* 1. Глубокий базовый слой с радиальными туманностями в цветовой схеме референса */}
      {/* Мягкое фиолетовое свечение в левом верхнем углу */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(76,29,149,0.15)_0%,transparent_60%)] blur-[40px] pointer-events-none" />
      
      {/* Интенсивное сине-фиолетовое неоновое свечение в правой нижней части (как на картинке) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(59,48,255,0.22)_0%,rgba(109,40,217,0.08)_40%,transparent_75%)] blur-[60px] pointer-events-none" />
      
      {/* Дополнительное яркое синее ядро свечения снизу справа */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_80%,rgba(99,102,241,0.15)_0%,transparent_45%)] blur-[30px] pointer-events-none" />

      {/* 2. SVG слой с анимированными неоновыми нитями */}
      <svg
        className="absolute inset-0 h-full w-full opacity-90"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 900"
      >
        <defs>
          {/* Градиент для нитей: переход от фиолетового к яркому неоновому синему и бело-голубому в точке фокуса */}
          <linearGradient id="neonLineGrad" x1="0%" y1="90%" x2="100%" y2="10%">
            <stop offset="0%" stopColor="#25164f" stopOpacity="0.1" />
            <stop offset="25%" stopColor="#5b21b6" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#4f46e5" stopOpacity="0.85" />
            <stop offset="78%" stopColor="#818cf8" stopOpacity="1" /> {/* Пик свечения в правой нижней трети */}
            <stop offset="90%" stopColor="#6366f1" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#312e81" stopOpacity="0.1" />
          </linearGradient>

          {/* Фильтр мягкого неонового размытия (Glow) */}
          <filter id="neonBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="7" result="glow1" />
            <feGaussianBlur stdDeviation="3" result="glow2" />
            <feMerge>
              <feMergeNode in="glow1" />
              <feMergeNode in="glow2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Экстремальный фильтр свечения для подложки */}
          <filter id="coreGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="24" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Слой 2.1: Широкая неоновая подложка для эффекта объемного излучения (имитация яркого блика на референсе) */}
        <path
          d="M -50,750 C 420,830 960,780 1490,240"
          stroke="#4f46e5"
          strokeWidth="38"
          fill="none"
          opacity="0.18"
          filter="url(#coreGlow)"
        >
          <animate
            attributeName="d"
            values="
              M -50,750 C 420,830 960,780 1490,240;
              M -50,770 C 450,800 930,810 1490,225;
              M -50,730 C 390,860 990,750 1490,255;
              M -50,750 C 420,830 960,780 1490,240
            "
            dur="18s"
            repeatCount="indefinite"
          />
        </path>

        <path
          d="M -50,740 C 450,810 930,790 1490,250"
          stroke="#818cf8"
          strokeWidth="14"
          fill="none"
          opacity="0.22"
          filter="url(#neonBlur)"
        >
          <animate
            attributeName="d"
            values="
              M -50,740 C 450,810 930,790 1490,250;
              M -50,720 C 420,840 960,760 1490,265;
              M -50,760 C 480,780 900,820 1490,235;
              M -50,740 C 450,810 930,790 1490,250
            "
            dur="14s"
            repeatCount="indefinite"
          />
        </path>

        {/* Слой 2.2: Тонкие, высокотехнологичные переплетающиеся нити (Lines) */}
        <g filter="url(#neonBlur)">
          {lines.map((line) => (
            <path
              key={line.id}
              d={line.path1}
              fill="none"
              stroke="url(#neonLineGrad)"
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
          ))}
        </g>
      </svg>
    </div>
  );
}
