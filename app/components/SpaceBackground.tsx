'use client';

import { useEffect, useState } from 'react';

export function SpaceBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="fixed inset-0 -z-50 bg-[#fdfcfb]" />;
  }

  const linesCount = 6;
  const lines = Array.from({ length: linesCount }, (_, i) => {
    const offset = i * 24;
    const delay = -(i * 1.9);
    const duration = 18 + (i % 3) * 5;
    const opacity = 0.08 + (1 - Math.abs(i - linesCount / 2) / (linesCount / 2)) * 0.16;
    const strokeWidth = 0.9 + (1 - Math.abs(i - linesCount / 2) / (linesCount / 2)) * 0.8;

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
    <div className="fixed inset-0 -z-50 h-full w-full overflow-hidden bg-[#fdfcfb] print:hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-30"
        style={{ backgroundImage: 'url(/assets/backgrounds/light-bg2.webp)' }}
      />
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(255,255,255,0.7)_0%,transparent_60%)] blur-[40px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_72%,rgba(215,189,121,0.045)_0%,transparent_52%)] blur-[54px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_48%,rgba(233,185,189,0.04)_0%,transparent_44%)] blur-[46px] pointer-events-none" />

      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 900"
      >
        <defs>
          <linearGradient id="lightLineGrad" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#c2ab87" stopOpacity="0" />
            <stop offset="35%" stopColor="#ecdcc3" stopOpacity="0.32" />
            <stop offset="70%" stopColor="#8c6e4b" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#c2ab87" stopOpacity="0" />
          </linearGradient>

          <radialGradient id="windParticleGrad">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="38%" stopColor="#c2ab87" stopOpacity="0.72" />
            <stop offset="62%" stopColor="#ecdcc3" stopOpacity="0.24" />
            <stop offset="82%" stopColor="#8c6e4b" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#8c6e4b" stopOpacity="0" />
          </radialGradient>

          <filter id="windGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {lines.map((line) => (
          <g key={line.id}>
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

            <circle
              r={1.05 + (line.id % 3) * 0.22}
              fill="url(#windParticleGrad)"
              filter="url(#windGlow)"
              opacity={0.56}
            >
              <animateMotion
                dur={`${22 + (line.id % 4) * 5}s`}
                repeatCount="indefinite"
                begin={`${line.id * 2}s`}
              >
                <mpath href={`#${line.pathId}`} />
              </animateMotion>
            </circle>

            {line.id % 2 === 1 && (
              <circle
                r={0.92}
                fill="url(#windParticleGrad)"
                filter="url(#windGlow)"
                opacity={0.34}
              >
                <animateMotion
                  dur={`${26 + (line.id % 4) * 4}s`}
                  repeatCount="indefinite"
                  begin={`${line.id * 2 + 6}s`}
                >
                  <mpath href={`#${line.pathId}`} />
                </animateMotion>
              </circle>
            )}

            {line.id % 3 === 0 && (
              <circle
                r={0.86}
                fill="url(#windParticleGrad)"
                filter="url(#windGlow)"
                opacity={0.28}
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
