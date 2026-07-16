import React from 'react';

interface RadarChartProps {
  scores?: Record<string, number>;
}

export default function RadarChart({ scores }: RadarChartProps) {
  const axes = [
    { key: 'R', label: 'Практический (R)' },
    { key: 'I', label: 'Аналитический (I)' },
    { key: 'A', label: 'Творческий (A)' },
    { key: 'S', label: 'Социальный (S)' },
    { key: 'E', label: 'Лидерский (E)' },
    { key: 'C', label: 'Системный (C)' }
  ];

  const cx = 140;
  const cy = 140;
  const r = 85;

  const getCoordinates = (i: number, val: number) => {
    const angle = i * (2 * Math.PI / 6) - Math.PI / 2;
    const factor = val / 100;
    const x = cx + r * factor * Math.cos(angle);
    const y = cy + r * factor * Math.sin(angle);
    return { x, y };
  };

  const normalizedScores: Record<string, number> = {};
  axes.forEach(ax => {
    let raw = scores?.[ax.key] || scores?.[ax.key.toLowerCase()] || 50;
    if (raw <= 5) {
      normalizedScores[ax.key] = Math.round((raw / 5) * 100);
    } else {
      normalizedScores[ax.key] = raw;
    }
  });

  const points = axes.map((ax, i) => {
    const { x, y } = getCoordinates(i, normalizedScores[ax.key]);
    return `${x},${y}`;
  }).join(' ');

  const gridLevels = [20, 40, 60, 80, 100];

  return (
    <div className="glass-card rounded-[28px] p-6 flex flex-col items-center justify-center relative overflow-hidden">
      <h3 className="text-xs uppercase tracking-wider font-extrabold text-[#3B82F6] theme-accent-text mb-4 font-sans text-center">
        Свечение способностей (RIASEC)
      </h3>
      <div className="relative w-[280px] h-[280px] flex items-center justify-center">
        <svg viewBox="0 0 280 280" className="w-full h-full overflow-visible">
          {gridLevels.map((lvl) => {
            const gridPoints = axes.map((_, i) => {
              const { x, y } = getCoordinates(i, lvl);
              return `${x},${y}`;
            }).join(' ');
            return (
              <polygon
                key={lvl}
                points={gridPoints}
                fill="none"
                stroke="var(--border-subtle)"
                strokeWidth="1"
                className="opacity-40 theme-radar-grid"
              />
            );
          })}

          {axes.map((ax, i) => {
            const outer = getCoordinates(i, 100);
            return (
              <line
                key={ax.key}
                x1={cx}
                y1={cy}
                x2={outer.x}
                y2={outer.y}
                stroke="var(--border-subtle)"
                strokeWidth="1"
                className="opacity-50 theme-radar-grid"
              />
            );
          })}

          {axes.map((ax, i) => {
            const labelPos = getCoordinates(i, 118);
            return (
              <text
                key={ax.key}
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[10px] font-sans font-extrabold theme-radar-label select-none transition-colors duration-300"
              >
                {ax.label}
              </text>
            );
          })}

          <polygon
            points={points}
            fill="var(--accent-glow)"
            stroke="var(--accent-brown)"
            strokeWidth="2.5"
            className="theme-radar-polygon transition-all duration-500"
          />

          {axes.map((ax, i) => {
            const pt = getCoordinates(i, normalizedScores[ax.key]);
            return (
              <circle
                key={ax.key}
                cx={pt.x}
                cy={pt.y}
                r="4"
                fill="var(--accent-brown)"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                className="theme-radar-dot transition-all duration-500"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
