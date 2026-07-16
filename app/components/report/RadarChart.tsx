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
    <div className="flex flex-col items-center justify-center p-5 border border-white/5 bg-[#040506]/40 rounded-[24px]">
      <h3 className="text-xs uppercase tracking-wider font-extrabold text-[#3B82F6] mb-4 font-sans">Свечение способностей (RIASEC)</h3>
      <div className="relative w-[280px] h-[280px]">
        <svg viewBox="0 0 280 280" className="w-full h-full">
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
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="1"
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
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1"
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
                className="text-[9px] font-sans font-bold fill-[#7A8A9E]"
              >
                {ax.label}
              </text>
            );
          })}

          <polygon
            points={points}
            fill="rgba(59, 130, 246, 0.15)"
            stroke="#3B82F6"
            strokeWidth="2"
            className="drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]"
          />

          {axes.map((ax, i) => {
            const pt = getCoordinates(i, normalizedScores[ax.key]);
            return (
              <circle
                key={ax.key}
                cx={pt.x}
                cy={pt.y}
                r="3.5"
                className="fill-[#3B82F6] stroke-white stroke-1"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
