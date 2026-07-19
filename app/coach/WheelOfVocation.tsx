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

  // Минимальный видимый радиус только для РЕАЛЬНО оценённых секторов
  const sectorValue = (score: number) => (score > 0 ? Math.max(0.14, score / 100) : 0);

  // Группируем по 6 сферам талантов в медно-золотой эстетике (Warm Copper & Rose Gold)
  const sectors = [
    {
      id: 'creative',
      name: 'Креатив & Искусство',
      emoji: '🎨',
      icon: Palette,
      description: 'Творчество, дизайн, тексты',
      value: sectorValue(getScore('creative')),
      rawScore: getScore('creative'),
      color: '#E07A5F', // Rose Copper Gold
      glowColor: 'rgba(224, 122, 95, 0.5)',
      gradStops: ['#FFF2D7', '#E07A5F', '#9E4733'],
    },
    {
      id: 'tech',
      name: 'Технологии & Код',
      emoji: '💻',
      icon: Cpu,
      description: 'Программирование, инженерия',
      value: sectorValue(getScore('tech')),
      rawScore: getScore('tech'),
      color: '#4A90E2', // Platinum Sapphire Gold
      glowColor: 'rgba(74, 144, 226, 0.5)',
      gradStops: ['#EBF3FF', '#4A90E2', '#1C4A86'],
    },
    {
      id: 'analytical',
      name: 'Наука & Аналитика',
      emoji: '🔬',
      icon: Microscope,
      description: 'Логика, формулы, исследования',
      value: sectorValue(getScore('analytical')),
      rawScore: getScore('analytical'),
      color: '#9B5DE5', // Royal Amethyst Gold
      glowColor: 'rgba(155, 93, 229, 0.5)',
      gradStops: ['#F7EEFF', '#9B5DE5', '#5E2893'],
    },
    {
      id: 'social',
      name: 'Коммуникация & Люди',
      emoji: '🗣️',
      icon: Users,
      description: 'Общение, продажи, обучение',
      value: sectorValue(getScore('social')),
      rawScore: getScore('social'),
      color: '#E5BA73', // Honey Amber Gold
      glowColor: 'rgba(229, 186, 115, 0.5)',
      gradStops: ['#FFF8EB', '#E5BA73', '#A4742B'],
    },
    {
      id: 'organizational',
      name: 'Организация & Системы',
      emoji: '📊',
      icon: ClipboardList,
      description: 'Менеджмент, процессы, порядок',
      value: sectorValue(getScore('organizational')),
      rawScore: getScore('organizational'),
      color: '#2A9D8F', // Emerald Bronze
      glowColor: 'rgba(42, 157, 143, 0.5)',
      gradStops: ['#E6F8F6', '#2A9D8F', '#175951'],
    },
    {
      id: 'startup',
      name: 'Стартап & Лидерство',
      emoji: '🚀',
      icon: Rocket,
      description: 'Предпринимательство, проекты',
      value: sectorValue(getScore('startup')),
      rawScore: getScore('startup'),
      color: '#F4A261', // Fiery Warm Copper
      glowColor: 'rgba(244, 162, 97, 0.5)',
      gradStops: ['#FFF3EA', '#F4A261', '#B35315'],
    },
  ];

  const angleStep = 360 / sectors.length;

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const getSectorPath = (cx: number, cy: number, radius: number, startAngle: number, endAngle: number) => {
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

  // Режим Standalone (развернутое модальное окно с большими полями canvas)
  if (standalone) {
    const cx = 270;
    const cy = 270;
    const maxRadius = 195; // Увеличенное крупное колесо

    return (
      <div className="relative w-full h-full flex items-center justify-center p-2">
        <svg width="100%" height="100%" viewBox="0 0 540 540" className="overflow-visible max-w-[620px]">
          <defs>
            {/* Медно-золотые градиенты для каждого сектора */}
            {sectors.map((sector, idx) => (
              <radialGradient id={`grad-standalone-${idx}`} key={idx} cx="50%" cy="50%" r="50%" fx="35%" fy="35%">
                <stop offset="0%" stopColor={sector.gradStops[0]} stopOpacity={0.8} />
                <stop offset="65%" stopColor={sector.gradStops[1]} stopOpacity={0.85} />
                <stop offset="100%" stopColor={sector.gradStops[2]} stopOpacity={0.95} />
              </radialGradient>
            ))}

            {/* Металлический градиент рамки драгоценного медальона */}
            <linearGradient id="gold-border-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF2D7" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#8D5B4C" />
            </linearGradient>

            {/* Эффект свечения золота */}
            <filter id="gold-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Тонкие золотистые декоративные окружности сетки */}
          {[0.25, 0.5, 0.75, 1.0].map((scale, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={maxRadius * scale}
              fill="none"
              stroke="#D4AF37"
              strokeWidth="1"
              strokeDasharray={scale === 1.0 ? 'none' : '4 4'}
              className="opacity-25"
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
                stroke="#D4AF37"
                strokeWidth="1.2"
                className="opacity-30"
              />
            );
          })}

          {/* Фоновые пустые сегменты колеса */}
          {sectors.map((sector, idx) => {
            const startAngle = idx * angleStep;
            const endAngle = startAngle + angleStep;
            const path = getSectorPath(cx, cy, maxRadius, startAngle, endAngle);

            return (
              <path
                key={`bg-${idx}`}
                d={path}
                fill="rgba(212, 175, 55, 0.03)"
                stroke="rgba(212, 175, 55, 0.2)"
                strokeWidth="1"
                className="transition duration-300 hover:fill-amber-500/10 cursor-pointer"
              />
            );
          })}

          {/* Заполненные анимированные сегменты */}
          {sectors.map((sector, idx) => {
            const startAngle = idx * angleStep;
            const endAngle = startAngle + angleStep;
            const currentRadius = maxRadius * sector.value;
            const path = getSectorPath(cx, cy, currentRadius, startAngle, endAngle);

            return (
              <g key={`filled-${idx}`}>
                <motion.path
                  initial={{ d: getSectorPath(cx, cy, 0, startAngle, endAngle) }}
                  animate={{ d: path }}
                  transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                  fill={`url(#grad-standalone-${idx})`}
                  stroke={sector.rawScore > 0 ? sector.color : 'none'}
                  strokeWidth="1.5"
                  style={{
                    filter: sector.rawScore > 0 ? `drop-shadow(0 0 8px ${sector.glowColor})` : 'none',
                  }}
                  className="cursor-pointer"
                />
              </g>
            );
          })}

          {/* Медальоны и текстовые подписи (расширенная безопасная область 540x540) */}
          {sectors.map((sector, idx) => {
            const angle = idx * angleStep + angleStep / 2;
            const labelPos = polarToCartesian(cx, cy, maxRadius + 42, angle);
            const isRightSide = labelPos.x >= cx;
            const IconComponent = sector.icon;

            return (
              <g key={`label-${idx}`} className="select-none">
                {/* 3D Роскошный Медальон с иконкой */}
                <foreignObject
                  x={labelPos.x - 22}
                  y={labelPos.y - 22}
                  width="44"
                  height="44"
                >
                  <div 
                    className="flex items-center justify-center w-full h-full rounded-2xl transition-all duration-300 shadow-md border"
                    style={{
                      background: sector.rawScore > 0 
                        ? `linear-gradient(135deg, rgba(255,242,215,0.9), ${sector.color}44)` 
                        : 'rgba(255, 255, 255, 0.7)',
                      borderColor: sector.rawScore > 0 ? sector.color : 'rgba(212, 175, 55, 0.3)',
                      boxShadow: sector.rawScore > 0 ? `0 4px 14px ${sector.glowColor}` : '0 2px 6px rgba(0,0,0,0.05)',
                      color: sector.rawScore > 0 ? sector.color : '#8D5B4C',
                    }}
                  >
                    <IconComponent className="h-6 w-6 stroke-[2.2]" />
                  </div>
                </foreignObject>

                {/* Название сектора (с безопасным отступом) */}
                <text
                  x={isRightSide ? labelPos.x + 28 : labelPos.x - 28}
                  y={labelPos.y - 7}
                  textAnchor={isRightSide ? 'start' : 'end'}
                  dominantBaseline="middle"
                  fontSize="13 font-sans"
                  fontWeight="800"
                  fill={sector.rawScore > 0 ? '#2D1F17' : '#7A6B5D'}
                  className="tracking-wide"
                >
                  {sector.name}
                </text>

                {/* Процентный показатель */}
                <text
                  x={isRightSide ? labelPos.x + 28 : labelPos.x - 28}
                  y={labelPos.y + 11}
                  textAnchor={isRightSide ? 'start' : 'end'}
                  dominantBaseline="middle"
                  fill={sector.rawScore > 0 ? sector.color : '#A49383'}
                  fontSize="12"
                  fontWeight="bold"
                >
                  {sector.rawScore}%
                </text>
              </g>
            );
          })}

          {/* Центральный Ювелирный Компас */}
          <circle cx={cx} cy={cy} r="22" fill="#FFFBF2" stroke="url(#gold-border-grad)" strokeWidth="3" filter="url(#gold-glow-filter)" />
          <circle cx={cx} cy={cy} r="8" fill="#D4AF37" />
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">
            🎯
          </text>
        </svg>
      </div>
    );
  }

  // Стандартный режим (Карточка в боковой панели)
  const cx = 230;
  const cy = 200;
  const maxRadius = 158; // Крупное заполняющее колесо

  return (
    <div className="flex flex-col items-center justify-between p-5 glass-panel rounded-3xl w-full h-full space-y-4 border border-[#D4AF37]/30 shadow-xl bg-white/40 dark:bg-[#080C14]/80 backdrop-blur-xl">
      {/* Шапка карточки */}
      <div className="w-full flex items-center justify-between px-1">
        <div className="text-left space-y-0.5">
          <h3 className="text-base font-extrabold font-sans text-gray-900 dark:text-white tracking-wide">Карта Талантов</h3>
          <p className="text-xs text-[#7A8A9E] font-medium">Живой профиль ваших интересов</p>
        </div>
      </div>

      {/* Основной SVG Холст с увеличенным Колесом */}
      <div className="relative w-full aspect-square flex items-center justify-center max-w-[380px]">
        <svg width="100%" height="100%" viewBox="0 0 460 430" className="overflow-visible">
          <defs>
            {sectors.map((sector, idx) => (
              <radialGradient id={`grad-card-${idx}`} key={idx} cx="50%" cy="50%" r="50%" fx="35%" fy="35%">
                <stop offset="0%" stopColor={sector.gradStops[0]} stopOpacity={0.8} />
                <stop offset="65%" stopColor={sector.gradStops[1]} stopOpacity={0.85} />
                <stop offset="100%" stopColor={sector.gradStops[2]} stopOpacity={0.95} />
              </radialGradient>
            ))}

            <linearGradient id="card-gold-border" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF2D7" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#8D5B4C" />
            </linearGradient>
          </defs>

          {/* Тонкие линии сетки */}
          {[0.25, 0.5, 0.75, 1.0].map((scale, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={maxRadius * scale}
              fill="none"
              stroke="#D4AF37"
              strokeWidth="1"
              strokeDasharray={scale === 1.0 ? 'none' : '4 4'}
              className="opacity-25"
            />
          ))}

          {/* Лучевые разделители */}
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
                stroke="#D4AF37"
                strokeWidth="1.2"
                className="opacity-30"
              />
            );
          })}

          {/* Фоновые сектора */}
          {sectors.map((sector, idx) => {
            const startAngle = idx * angleStep;
            const endAngle = startAngle + angleStep;
            const path = getSectorPath(cx, cy, maxRadius, startAngle, endAngle);

            return (
              <path
                key={`bg-${idx}`}
                d={path}
                fill="rgba(212, 175, 55, 0.03)"
                stroke="rgba(212, 175, 55, 0.2)"
                strokeWidth="1"
                className="transition duration-300 hover:fill-amber-500/10 cursor-pointer"
              />
            );
          })}

          {/* Заполненные сектора */}
          {sectors.map((sector, idx) => {
            const startAngle = idx * angleStep;
            const endAngle = startAngle + angleStep;
            const currentRadius = maxRadius * sector.value;
            const path = getSectorPath(cx, cy, currentRadius, startAngle, endAngle);

            return (
              <g key={`filled-${idx}`}>
                <motion.path
                  initial={{ d: getSectorPath(cx, cy, 0, startAngle, endAngle) }}
                  animate={{ d: path }}
                  transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                  fill={`url(#grad-card-${idx})`}
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

          {/* Иконки-Медальоны талантов и процентные метки */}
          {sectors.map((sector, idx) => {
            const angle = idx * angleStep + angleStep / 2;
            const iconPos = polarToCartesian(cx, cy, maxRadius + 28, angle);
            const IconComponent = sector.icon;

            return (
              <g key={`label-${idx}`} className="select-none">
                <foreignObject
                  x={iconPos.x - 20}
                  y={iconPos.y - 20}
                  width="40"
                  height="40"
                >
                  <div 
                    className="flex flex-col items-center justify-center w-full h-full rounded-xl transition-all duration-300 shadow-sm border"
                    style={{
                      background: sector.rawScore > 0 
                        ? `linear-gradient(135deg, rgba(255,242,215,0.95), ${sector.color}33)` 
                        : 'rgba(255, 255, 255, 0.8)',
                      borderColor: sector.rawScore > 0 ? sector.color : 'rgba(212, 175, 55, 0.3)',
                      boxShadow: sector.rawScore > 0 ? `0 3px 10px ${sector.glowColor}` : 'none',
                      color: sector.rawScore > 0 ? sector.color : '#8D5B4C',
                    }}
                  >
                    <IconComponent className="h-5 w-5 stroke-[2.2]" />
                    <span className="text-[9px] font-bold leading-none mt-0.5" style={{ color: sector.rawScore > 0 ? sector.color : '#7A6B5D' }}>
                      {sector.rawScore}%
                    </span>
                  </div>
                </foreignObject>
              </g>
            );
          })}

          {/* Центр Колеса */}
          <circle cx={cx} cy={cy} r="18" fill="#FFFBF2" stroke="url(#card-gold-border)" strokeWidth="2.5" />
          <circle cx={cx} cy={cy} r="6" fill="#D4AF37" />
        </svg>
      </div>

      {/* Компактный 2-колоночный список секторов с подсказками */}
      <div className="w-full grid grid-cols-2 gap-x-3 gap-y-2 max-h-[200px] overflow-y-auto pr-1 pt-1 border-t border-[#D4AF37]/20">
        {sectors.map((sector, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg hover:bg-white/40 dark:hover:bg-white/5 transition">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: sector.color }} />
              <div className="flex flex-col min-w-0">
                <span className="text-gray-900 dark:text-white/90 font-bold tracking-wide font-sans truncate text-[10.5px] leading-tight">{sector.name}</span>
                <span className="text-[8.5px] text-[#7A8A9E] truncate leading-tight">{sector.description}</span>
              </div>
            </div>
            <span className="font-extrabold font-sans text-[11px] ml-1 shrink-0" style={{ color: sector.rawScore > 0 ? sector.color : '#7A6B5D' }}>
              {sector.rawScore}%
            </span>
          </div>
        ))}
      </div>

      <div className="text-[9.5px] text-[#7A8A9E] italic font-sans text-center">
        * Оценки обновляются в реальном времени из диалога.
      </div>
    </div>
  );
}
