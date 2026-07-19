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
      glowColor: 'rgba(224, 122, 95, 0.65)',
      gradStops: ['#FFF5E4', '#E07A5F', '#9E4733'],
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
      glowColor: 'rgba(74, 144, 226, 0.65)',
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
      glowColor: 'rgba(155, 93, 229, 0.65)',
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
      glowColor: 'rgba(229, 186, 115, 0.65)',
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
      glowColor: 'rgba(42, 157, 143, 0.65)',
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
      glowColor: 'rgba(244, 162, 97, 0.65)',
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

  // 1. РЕЖИМ STANDALONE (Развернутое крупное модальное окно с безопасным полем 960x580)
  if (standalone) {
    const cx = 480;
    const cy = 290;
    const maxRadius = 205; // Огромное заполнительное колесо

    return (
      <div className="relative w-full h-full flex items-center justify-center p-1">
        <svg width="100%" height="100%" viewBox="0 0 960 580" className="overflow-visible w-full h-full">
          <defs>
            {/* Медно-золотые градиенты секторов */}
            {sectors.map((sector, idx) => (
              <radialGradient id={`grad-standalone-${idx}`} key={idx} cx="50%" cy="50%" r="50%" fx="35%" fy="35%">
                <stop offset="0%" stopColor={sector.gradStops[0]} stopOpacity={0.85} />
                <stop offset="60%" stopColor={sector.gradStops[1]} stopOpacity={0.9} />
                <stop offset="100%" stopColor={sector.gradStops[2]} stopOpacity={0.98} />
              </radialGradient>
            ))}

            {/* Металлический ободок из золотого шелка */}
            <linearGradient id="gold-metallic-ring" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF8E7" />
              <stop offset="30%" stopColor="#E6C280" />
              <stop offset="70%" stopColor="#B8860B" />
              <stop offset="100%" stopColor="#7A5210" />
            </linearGradient>

            {/* Драгоценое литое лицо монеты */}
            <radialGradient id="gold-coin-face" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="55%" stopColor="#FFF5DC" />
              <stop offset="100%" stopColor="#E6C280" />
            </radialGradient>

            {/* Объемная тень 3D золота */}
            <filter id="gold-3d-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#7A5210" floodOpacity="0.3" />
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
              strokeWidth="1.2"
              strokeDasharray={scale === 1.0 ? 'none' : '4 4'}
              className="opacity-30"
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
                strokeWidth="1.5"
                className="opacity-35"
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
                stroke="rgba(212, 175, 55, 0.25)"
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
                  strokeWidth="1.8"
                  style={{
                    filter: sector.rawScore > 0 ? `drop-shadow(0 0 12px ${sector.glowColor})` : 'none',
                  }}
                  className="cursor-pointer"
                />
              </g>
            );
          })}

          {/* ЮВЕЛИРНЫЕ 3D-МОНЕТЫ И ТЕКСТОВЫЕ ПОДПИСИ (С ШИРОКИМ ПОЛЕМ 820px) */}
          {sectors.map((sector, idx) => {
            const angle = idx * angleStep + angleStep / 2;
            const iconPos = polarToCartesian(cx, cy, maxRadius + 36, angle);
            const isRightSide = iconPos.x >= cx;
            const IconComponent = sector.icon;

            return (
              <g key={`label-${idx}`} className="select-none">
                {/* 3D Литая Золотая Монета */}
                <circle
                  cx={iconPos.x}
                  cy={iconPos.y}
                  r="24"
                  fill="url(#gold-coin-face)"
                  stroke="url(#gold-metallic-ring)"
                  strokeWidth="2.8"
                  filter="url(#gold-3d-shadow)"
                />
                <circle
                  cx={iconPos.x}
                  cy={iconPos.y}
                  r="20"
                  fill="none"
                  stroke={sector.rawScore > 0 ? sector.color : '#B8860B'}
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  opacity="0.6"
                />

                {/* Иконка внутри монеты */}
                <foreignObject
                  x={iconPos.x - 12}
                  y={iconPos.y - 12}
                  width="24"
                  height="24"
                >
                  <div className="flex items-center justify-center w-full h-full" style={{ color: sector.rawScore > 0 ? sector.color : '#7A5210' }}>
                    <IconComponent className="h-5 w-5 stroke-[2.4]" />
                  </div>
                </foreignObject>

                {/* Текст названия сектора (с безопасными отступами) */}
                <text
                  x={isRightSide ? iconPos.x + 34 : iconPos.x - 34}
                  y={iconPos.y - 8}
                  textAnchor={isRightSide ? 'start' : 'end'}
                  dominantBaseline="middle"
                  fontSize="14 font-sans"
                  fontWeight="800"
                  fill={sector.rawScore > 0 ? 'var(--text-primary)' : 'var(--text-muted)'}
                  className="tracking-wide"
                >
                  {sector.name}
                </text>

                {/* Драгоценная золотая капсула с процентом */}
                <g transform={`translate(${isRightSide ? iconPos.x + 34 : iconPos.x - 34}, ${iconPos.y + 12})`}>
                  <text
                    x={isRightSide ? '0' : '0'}
                    y="0"
                    textAnchor={isRightSide ? 'start' : 'end'}
                    dominantBaseline="middle"
                    fill={sector.rawScore > 0 ? sector.color : 'var(--text-muted)'}
                    fontSize="13"
                    fontWeight="900"
                  >
                    {sector.rawScore}%
                  </text>
                </g>
              </g>
            );
          })}

          {/* Центральный Драгоценный Компас */}
          <circle cx={cx} cy={cy} r="26" fill="#FFFBF2" stroke="url(#gold-metallic-ring)" strokeWidth="3.5" filter="url(#gold-3d-shadow)" />
          <circle cx={cx} cy={cy} r="10" fill="#D4AF37" />
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">
            🎯
          </text>
        </svg>
      </div>
    );
  }

  // 2. СТАНДАРТНЫЙ РЕЖИМ (Карточка на главном экране в боковой панели)
  const cx = 250;
  const cy = 250;
  const maxRadius = 210; // УВЕЛИЧЕНИЕ ДИАМЕТРА РОВНО НА +20% (со 175px до 210px!)

  return (
    <div className="flex flex-col items-center justify-between p-3 glass-panel rounded-3xl w-full h-full space-y-2 border border-[#D4AF37]/20 dark:border-[#D4AF37]/35 shadow-2xl bg-white/70 dark:bg-[#080C14]/70 backdrop-blur-2xl">
      {/* Шапка карточки */}
      <div className="w-full flex items-center justify-between px-2 pt-1">
        <div className="text-left space-y-0.5">
          <h3 className="text-base font-extrabold font-sans text-gray-900 dark:text-white tracking-wide">Карта Талантов</h3>
          <p className="text-[11px] text-[#7A8A9E] font-medium">Живой профиль ваших интересов</p>
        </div>
      </div>

      {/* Основной SVG Холст с +20% увеличенным Колесом */}
      <div className="relative w-full flex-1 flex items-center justify-center min-h-0">
        <svg width="100%" height="100%" viewBox="0 0 500 500" className="overflow-visible w-full h-full max-h-[440px]">
          <defs>
            {sectors.map((sector, idx) => (
              <radialGradient id={`grad-card-${idx}`} key={idx} cx="50%" cy="50%" r="50%" fx="35%" fy="35%">
                <stop offset="0%" stopColor={sector.gradStops[0]} stopOpacity={0.85} />
                <stop offset="60%" stopColor={sector.gradStops[1]} stopOpacity={0.9} />
                <stop offset="100%" stopColor={sector.gradStops[2]} stopOpacity={0.98} />
              </radialGradient>
            ))}

            <linearGradient id="gold-metallic-ring-card" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF8E7" />
              <stop offset="30%" stopColor="#E6C280" />
              <stop offset="70%" stopColor="#B8860B" />
              <stop offset="100%" stopColor="#7A5210" />
            </linearGradient>

            <radialGradient id="gold-coin-face-card" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="55%" stopColor="#FFF5DC" />
              <stop offset="100%" stopColor="#E6C280" />
            </radialGradient>

            <filter id="gold-3d-shadow-card" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="3.5" stdDeviation="4" floodColor="#7A5210" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Тонкие золотистые сетки */}
          {[0.25, 0.5, 0.75, 1.0].map((scale, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={maxRadius * scale}
              fill="none"
              stroke="#D4AF37"
              strokeWidth="1.2"
              strokeDasharray={scale === 1.0 ? 'none' : '4 4'}
              className="opacity-30"
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
                strokeWidth="1.3"
                className="opacity-35"
              />
            );
          })}

          {/* Фоновые пустые сегменты */}
          {sectors.map((sector, idx) => {
            const startAngle = idx * angleStep;
            const endAngle = startAngle + angleStep;
            const path = getSectorPath(cx, cy, maxRadius, startAngle, endAngle);

            return (
              <path
                key={`bg-${idx}`}
                d={path}
                fill="rgba(212, 175, 55, 0.03)"
                stroke="rgba(212, 175, 55, 0.25)"
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
                    filter: sector.rawScore > 0 ? `drop-shadow(0 0 12px ${sector.glowColor})` : 'none',
                  }}
                  className="cursor-pointer"
                />
              </g>
            );
          })}

          {/* 3D ЮВЕЛИРНЫЕ МОНЕТЫ ТАЛАНТОВ НА КАРТОЧКЕ */}
          {sectors.map((sector, idx) => {
            const angle = idx * angleStep + angleStep / 2;
            const iconPos = polarToCartesian(cx, cy, maxRadius, angle);
            const IconComponent = sector.icon;

            return (
              <g key={`label-${idx}`} className="select-none">
                {/* Внешняя 3D Литая Золотая Монета */}
                <circle
                  cx={iconPos.x}
                  cy={iconPos.y}
                  r="23"
                  fill="url(#gold-coin-face-card)"
                  stroke="url(#gold-metallic-ring-card)"
                  strokeWidth="2.5"
                  filter="url(#gold-3d-shadow-card)"
                />
                <circle
                  cx={iconPos.x}
                  cy={iconPos.y}
                  r="19"
                  fill="none"
                  stroke={sector.rawScore > 0 ? sector.color : '#B8860B'}
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  opacity="0.75"
                />

                {/* Векторная иконка в монете */}
                <foreignObject
                  x={iconPos.x - 12}
                  y={iconPos.y - 12}
                  width="24"
                  height="24"
                >
                  <div className="flex items-center justify-center w-full h-full" style={{ color: sector.rawScore > 0 ? sector.color : '#7A5210' }}>
                    <IconComponent className="h-5 w-5 stroke-[2.4]" />
                  </div>
                </foreignObject>

                {/* Драгоценная золотая капсула с процентом под монетой */}
                <g transform={`translate(${iconPos.x}, ${iconPos.y + 26})`}>
                  <rect
                    x="-19"
                    y="-8"
                    width="38"
                    height="16"
                    rx="8"
                    fill="#FFFBF2"
                    stroke="url(#gold-metallic-ring-card)"
                    strokeWidth="1.1"
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
                  />
                  <text
                    x="0"
                    y="0.5"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fontWeight="900"
                    fontFamily="sans-serif"
                    fill={sector.rawScore > 0 ? sector.color : '#7A6B5D'}
                  >
                    {sector.rawScore}%
                  </text>
                </g>
              </g>
            );
          })}

          {/* Центр Колеса */}
          <circle cx={cx} cy={cy} r="22" fill="#FFFBF2" stroke="url(#gold-metallic-ring-card)" strokeWidth="3" filter="url(#gold-3d-shadow-card)" />
          <circle cx={cx} cy={cy} r="8" fill="#D4AF37" />
        </svg>
      </div>

      {/* Компактный 2-колоночный список секторов с яркими медальонами */}
      <div className="w-full grid grid-cols-2 gap-x-2.5 gap-y-1.5 max-h-[180px] overflow-y-auto pr-1 pt-1.5 border-t border-[#D4AF37]/25">
        {sectors.map((sector, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 rounded-xl bg-white/40 dark:bg-white/5 border border-[#D4AF37]/15 hover:border-[#D4AF37]/40 transition">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: sector.color }} />
              <div className="flex flex-col min-w-0">
                <span className="text-gray-900 dark:text-white/90 font-bold tracking-wide font-sans truncate text-[10px] leading-tight">{sector.name}</span>
                <span className="text-[8px] text-[#7A8A9E] truncate leading-tight">{sector.description}</span>
              </div>
            </div>
            <span className="font-extrabold font-sans text-[10.5px] ml-1 shrink-0" style={{ color: sector.rawScore > 0 ? sector.color : '#7A6B5D' }}>
              {sector.rawScore}%
            </span>
          </div>
        ))}
      </div>

      <div className="text-[9px] text-[#7A8A9E] italic font-sans text-center">
        * Оценки обновляются в реальном времени из диалога.
      </div>
    </div>
  );
}
