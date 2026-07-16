'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Cpu, Microscope, Users, ClipboardList, Rocket } from 'lucide-react';

interface WheelOfVocationProps {
  extractedData: Record<string, any>;
  standalone?: boolean;
}

export default function WheelOfVocation({ extractedData, standalone = false }: WheelOfVocationProps) {
  // Безопасное извлечение оценок талантов
  const getScore = (key: string): number => {
    if (!extractedData || typeof extractedData !== 'object') return 0;
    let scoresObj = extractedData.expressExtracted?.talentScores || extractedData.talentScores;
    if (scoresObj && typeof scoresObj === 'object') {
      const val = scoresObj[key];
      if (typeof val === 'number') return val;
    }
    return 0;
  };

  // Группируем по 6 сферам талантов (сбалансированная динамическая карта)
  const sectors = [
    {
      name: 'Креатив & Искусство',
      emoji: '🎨',
      icon: Palette,
      description: 'Творчество, дизайн, тексты',
      value: Math.max(0.15, getScore('creative') / 100), // Минимальный радиус 15% для красоты
      rawScore: getScore('creative'),
      color: 'var(--riasec-creative)',
      glowColor: 'var(--riasec-creative)',
    },
    {
      name: 'Технологии & Код',
      emoji: '💻',
      icon: Cpu,
      description: 'Программирование, инженерия',
      value: Math.max(0.15, getScore('tech') / 100),
      rawScore: getScore('tech'),
      color: 'var(--riasec-tech)',
      glowColor: 'var(--riasec-tech)',
    },
    {
      name: 'Наука & Аналитика',
      emoji: '🔬',
      icon: Microscope,
      description: 'Логика, формулы, исследования',
      value: Math.max(0.15, getScore('analytical') / 100),
      rawScore: getScore('analytical'),
      color: 'var(--riasec-analytical)',
      glowColor: 'var(--riasec-analytical)',
    },
    {
      name: 'Коммуникация & Люди',
      emoji: '🗣️',
      icon: Users,
      description: 'Общение, продажи, обучение',
      value: Math.max(0.15, getScore('social') / 100),
      rawScore: getScore('social'),
      color: 'var(--riasec-social)',
      glowColor: 'var(--riasec-social)',
    },
    {
      name: 'Организация & Системы',
      emoji: '📊',
      icon: ClipboardList,
      description: 'Менеджмент, процессы, порядок',
      value: Math.max(0.15, getScore('organizational') / 100),
      rawScore: getScore('organizational'),
      color: 'var(--riasec-organizational)',
      glowColor: 'var(--riasec-organizational)',
    },
    {
      name: 'Стартап & Лидерство',
      emoji: '🚀',
      icon: Rocket,
      description: 'Предпринимательство, проекты',
      value: Math.max(0.15, getScore('startup') / 100),
      rawScore: getScore('startup'),
      color: 'var(--riasec-startup)',
      glowColor: 'var(--riasec-startup)',
    },
  ];

  const totalScore = sectors.reduce((acc, s) => acc + s.rawScore, 0);
  const isEmpty = totalScore === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center p-8 glass-panel rounded-3xl w-full h-full min-h-[320px] text-center space-y-6 relative overflow-hidden border border-white/5 bg-[#080C14]/30 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C4A484]/5 rounded-full blur-[50px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#3B82F6]/5 rounded-full blur-[50px] pointer-events-none" />
        
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 shadow-inner mb-2 animate-pulse">
          <span className="text-3xl">🧭</span>
        </div>
        
        <div className="space-y-2 relative z-10 max-w-[280px]">
          <h3 className="text-md font-bold font-sans text-white tracking-wide">Карта Талантов</h3>
          <p className="text-xs text-[#7A8A9E] font-medium leading-relaxed">
            Наставник Роман собирает ваш профиль интересов. Ответьте на первые вопросы о себе в чате, чтобы запустить Карту Талантов!
          </p>
        </div>
      </div>
    );
  }

  const cx = 200;
  const cy = 200;
  const maxRadius = 135;
  const angleStep = 360 / sectors.length;

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const getSectorPath = (radius: number, startAngle: number, endAngle: number) => {
    if (radius === 0) return '';
    const start = polarToCartesian(cx, cy, radius, endAngle);
    const end = polarToCartesian(cx, cy, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return [
      'M', cx, cy,
      'L', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      'Z'
    ].join(' ');
  };

  if (standalone) {
    return (
      <div className="relative w-full h-full aspect-square flex items-center justify-center">
        <svg width="100%" height="100%" viewBox="0 0 400 400" className="overflow-visible">
          <defs>
            {sectors.map((sector, idx) => (
              <radialGradient id={`grad-${idx}`} key={idx} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={0.15} />
                <stop offset="70%" stopColor={sector.color} stopOpacity={0.6} />
                <stop offset="100%" stopColor={sector.color} stopOpacity={0.9} />
              </radialGradient>
            ))}
          </defs>

          {/* Тонкая сетка кругов для ориентира */}
          {[0.25, 0.5, 0.75, 1.0].map((scale, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={maxRadius * scale}
              fill="none"
              stroke="var(--border-subtle)"
              strokeWidth="1"
              strokeDasharray={scale === 1.0 ? 'none' : '4 4'}
              className="opacity-40"
            />
          ))}

          {/* Лучевые разделители секторов */}
          {sectors.map((_, idx) => {
            const angle = idx * angleStep;
            const target = polarToCartesian(cx, cy, maxRadius, angle);
            return (
              <line
                key={idx}
                x1={cx}
                y1={cy}
                x2={target.x}
                y2={target.y}
                stroke="var(--border-subtle)"
                strokeWidth="1.5"
                className="opacity-50"
              />
            );
          })}

          {/* Рисуем фоновые пустые сегменты колеса */}
          {sectors.map((sector, idx) => {
            const startAngle = idx * angleStep;
            const endAngle = startAngle + angleStep;
            const path = getSectorPath(maxRadius, startAngle, endAngle);

            return (
              <path
                key={`bg-${idx}`}
                d={path}
                fill="rgba(255, 255, 255, 0.01)"
                stroke="var(--border-subtle)"
                strokeWidth="1"
                className="transition duration-500 hover:fill-white/[0.02] cursor-pointer opacity-30"
              />
            );
          })}

          {/* Рисуем заполненные сегменты с анимацией */}
          {sectors.map((sector, idx) => {
            const startAngle = idx * angleStep;
            const endAngle = startAngle + angleStep;
            const currentRadius = maxRadius * sector.value;
            const path = getSectorPath(currentRadius, startAngle, endAngle);

            return (
              <g key={`filled-${idx}`}>
                <motion.path
                  initial={{ d: getSectorPath(0, startAngle, endAngle) }}
                  animate={{ d: path }}
                  transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                  fill={`url(#grad-${idx})`}
                  stroke={sector.rawScore > 0 ? sector.color : 'none'}
                  strokeWidth="1.5"
                  style={{
                    filter: sector.rawScore > 0 ? `drop-shadow(0 0 6px ${sector.glowColor})` : 'none',
                  }}
                  className="cursor-pointer"
                />
              </g>
            );
          })}

          {/* Внешние текстовые маркеры-иконки для секторов (standalone) */}
          {sectors.map((sector, idx) => {
            const angle = idx * angleStep + angleStep / 2;
            const labelPos = polarToCartesian(cx, cy, maxRadius + 38, angle);
            const isRightSide = labelPos.x > cx;
            const IconComponent = sector.icon;

            return (
              <g key={`label-${idx}`} className="select-none">
                <foreignObject
                  x={isRightSide ? labelPos.x : labelPos.x - 30}
                  y={labelPos.y - 15}
                  width="30"
                  height="30"
                >
                  <div 
                    className="flex items-center justify-center w-full h-full rounded-xl transition-all duration-300"
                    style={{
                      color: sector.rawScore > 0 ? sector.color : 'rgba(122, 138, 158, 0.4)',
                      filter: sector.rawScore > 0 ? `drop-shadow(0 0 6px ${sector.glowColor})` : 'none',
                    }}
                  >
                    <IconComponent className="h-6 w-6 stroke-[2.2]" />
                  </div>
                </foreignObject>

                <text
                  x={isRightSide ? labelPos.x + 36 : labelPos.x - 36}
                  y={labelPos.y - 6}
                  textAnchor={isRightSide ? 'start' : 'end'}
                  dominantBaseline="middle"
                  fontSize="13"
                  fontWeight="800"
                  className={`transition duration-500 font-sans tracking-wide ${
                    sector.rawScore > 0 ? 'theme-wheel-label-active' : 'theme-wheel-label-inactive'
                  }`}
                >
                  {sector.name}
                </text>

                <text
                  x={isRightSide ? labelPos.x + 36 : labelPos.x - 36}
                  y={labelPos.y + 10}
                  textAnchor={isRightSide ? 'start' : 'end'}
                  dominantBaseline="middle"
                  fill={sector.rawScore > 0 ? sector.color : undefined}
                  fontSize="12"
                  fontWeight="bold"
                  className={`transition duration-500 font-sans ${
                    sector.rawScore > 0 ? 'theme-wheel-value-active' : 'theme-wheel-value-inactive'
                  }`}
                >
                  {sector.rawScore}%
                </text>
              </g>
            );
          })}

          {/* Центральный декоративный элемент с иконкой */}
          <circle cx={cx} cy={cy} r="18" fill="var(--bg-deep)" stroke="var(--border-subtle)" strokeWidth="2" />
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="#3b82f6" fontSize="12" fontWeight="bold">
            🎯
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 glass-panel rounded-3xl w-full h-full space-y-6">
      <div className="text-center space-y-1">
        <h3 className="text-md font-bold font-sans text-white tracking-wide">Карта Талантов</h3>
        <p className="text-xs text-[#7A8A9E] font-medium">Живой профиль ваших интересов</p>
      </div>

      <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center">
        <svg width="100%" height="100%" viewBox="0 0 400 400" className="overflow-visible">
          <defs>
            {sectors.map((sector, idx) => (
              <radialGradient id={`grad-${idx}`} key={idx} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={0.15} />
                <stop offset="70%" stopColor={sector.color} stopOpacity={0.6} />
                <stop offset="100%" stopColor={sector.color} stopOpacity={0.9} />
              </radialGradient>
            ))}
          </defs>

          {/* Тонкая сетка кругов для ориентира */}
          {[0.25, 0.5, 0.75, 1.0].map((scale, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={maxRadius * scale}
              fill="none"
              stroke="var(--border-subtle)"
              strokeWidth="1"
              strokeDasharray={scale === 1.0 ? 'none' : '4 4'}
              className="opacity-40"
            />
          ))}

          {/* Лучевые разделители секторов */}
          {sectors.map((_, idx) => {
            const angle = idx * angleStep;
            const target = polarToCartesian(cx, cy, maxRadius, angle);
            return (
              <line
                key={idx}
                x1={cx}
                y1={cy}
                x2={target.x}
                y2={target.y}
                stroke="var(--border-subtle)"
                strokeWidth="1.5"
                className="opacity-50"
              />
            );
          })}

          {/* Рисуем фоновые пустые сегменты колеса */}
          {sectors.map((sector, idx) => {
            const startAngle = idx * angleStep;
            const endAngle = startAngle + angleStep;
            const path = getSectorPath(maxRadius, startAngle, endAngle);

            return (
              <path
                key={`bg-${idx}`}
                d={path}
                fill="rgba(255, 255, 255, 0.01)"
                stroke="var(--border-subtle)"
                strokeWidth="1"
                className="transition duration-500 hover:fill-white/[0.02] cursor-pointer opacity-30"
              />
            );
          })}

          {/* Рисуем заполненные сегменты с анимацией */}
          {sectors.map((sector, idx) => {
            const startAngle = idx * angleStep;
            const endAngle = startAngle + angleStep;
            const currentRadius = maxRadius * sector.value;
            const path = getSectorPath(currentRadius, startAngle, endAngle);

            return (
              <g key={`filled-${idx}`}>
                <motion.path
                  initial={{ d: getSectorPath(0, startAngle, endAngle) }}
                  animate={{ d: path }}
                  transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                  fill={`url(#grad-${idx})`}
                  stroke={sector.rawScore > 0 ? sector.color : 'none'}
                  strokeWidth="1.5"
                  style={{
                    filter: sector.rawScore > 0 ? `drop-shadow(0 0 6px ${sector.glowColor})` : 'none',
                  }}
                  className="cursor-pointer"
                />
              </g>
            );
          })}

          {/* Внешние текстовые маркеры-иконки для секторов */}
          {sectors.map((sector, idx) => {
            const angle = idx * angleStep + angleStep / 2;
            const iconPos = polarToCartesian(cx, cy, maxRadius + 24, angle);
            const valuePos = polarToCartesian(cx, cy, maxRadius + 44, angle);
            const IconComponent = sector.icon;

            return (
              <g key={`label-${idx}`} className="select-none">
                <foreignObject
                  x={iconPos.x - 14}
                  y={iconPos.y - 14}
                  width="28"
                  height="28"
                >
                  <div 
                    className="flex items-center justify-center w-full h-full rounded-lg transition-all duration-300"
                    style={{
                      color: sector.rawScore > 0 ? sector.color : 'rgba(122, 138, 158, 0.4)',
                      filter: sector.rawScore > 0 ? `drop-shadow(0 0 5px ${sector.glowColor})` : 'none',
                    }}
                  >
                    <IconComponent className="h-5 w-5 stroke-[2.5]" />
                  </div>
                </foreignObject>
                
                <text
                  x={valuePos.x}
                  y={valuePos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={sector.rawScore > 0 ? sector.color : undefined}
                  fontSize="11"
                  fontWeight="bold"
                  className={`transition duration-500 font-sans ${
                    sector.rawScore > 0 ? 'theme-wheel-value-active' : 'theme-wheel-value-inactive'
                  }`}
                  style={{
                    filter: sector.rawScore > 0 ? `drop-shadow(0 0 4px ${sector.glowColor})` : 'none',
                  }}
                >
                  {sector.rawScore}%
                </text>
              </g>
            );
          })}

          {/* Центральный декоративный элемент с иконкой */}
          <circle cx={cx} cy={cy} r="18" fill="var(--bg-deep)" stroke="var(--border-subtle)" strokeWidth="2" />
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="#3b82f6" fontSize="12" fontWeight="bold">
            🎯
          </text>
        </svg>
      </div>

      {/* Список сфер с прогрессом в два ряда/колонки */}
      <div className="w-full grid grid-cols-2 gap-x-4 gap-y-2.5 max-h-[220px] overflow-y-auto pr-1">
        {sectors.map((sector, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-white/5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: sector.color }} />
              <div className="flex flex-col min-w-0">
                <span className="text-white/90 font-medium tracking-wide font-sans truncate text-[10.5px] leading-tight">{sector.name}</span>
                <span className="text-[8px] text-[#7A8A9E] truncate leading-tight">{sector.description}</span>
              </div>
            </div>
            <span className="font-bold text-white/80 font-sans text-[10.5px] ml-1 shrink-0" style={{ color: sector.rawScore > 0 ? sector.color : '#4E6178' }}>
              {sector.rawScore}%
            </span>
          </div>
        ))}
      </div>
      <div className="text-[9px] text-[#7A8A9E]/60 italic font-sans text-center mt-1">
        * Оценки отражают выраженность склонностей на основе ваших ответов в чате.
      </div>
    </div>
  );
}
