'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface WheelOfVocationProps {
  extractedData: Record<string, any>;
  standalone?: boolean;
}

export default function WheelOfVocation({ extractedData, standalone = false }: WheelOfVocationProps) {
  // Вычисляем статус заполненности полей
  const hasHobbies = !!extractedData.hobbies && extractedData.hobbies.trim().length > 6;
  const hasSchoolSubjects = !!extractedData.schoolSubjects && extractedData.schoolSubjects.trim().length > 6;
  const hasDreams = !!extractedData.dreams && extractedData.dreams.trim().length > 6;
  const hasIdols = !!extractedData.idols && extractedData.idols.trim().length > 6;
  const hasParents = !!extractedData.parents && extractedData.parents.trim().length > 6;
  const hasFears = !!extractedData.fears && extractedData.fears.trim().length > 6;
  const hasExperience = !!extractedData.experience && extractedData.experience.trim().length > 6;
  const hasWorkFormat = !!extractedData.workFormat && extractedData.workFormat.trim().length > 6;
  const hasThinkingType = !!extractedData.thinkingType && extractedData.thinkingType.trim().length > 6;
  const hasSuccessMeasure = !!extractedData.successMeasure && extractedData.successMeasure.trim().length > 6;
  const hasEnergySources = !!extractedData.energySources && extractedData.energySources.trim().length > 6;
  const hasTeamRole = !!extractedData.teamRole && extractedData.teamRole.trim().length > 6;
  const hasAutonomyStyle = !!extractedData.autonomyStyle && extractedData.autonomyStyle.trim().length > 6;
  const hasValues = !!extractedData.values && extractedData.values.trim().length > 6;
  const hasDecisionStyle = !!extractedData.decisionStyle && extractedData.decisionStyle.trim().length > 6;

  // Группируем по 8 секторам баланса
  const sectors = [
    {
      name: 'Интересы & Хобби',
      description: 'Любимые дела и школьные предметы',
      value: (hasHobbies ? 0.5 : 0) + (hasSchoolSubjects ? 0.5 : 0),
      color: '#38bdf8', // Голубой
      glowColor: 'rgba(56, 189, 248, 0.4)',
    },
    {
      name: 'Мечты & Образ будущего',
      description: 'Карьерные мечты и авторитеты',
      value: (hasDreams ? 0.5 : 0) + (hasIdols ? 0.5 : 0),
      color: '#a855f7', // Фиолетовый
      glowColor: 'rgba(168, 85, 247, 0.4)',
    },
    {
      name: 'Семейное влияние',
      description: 'Отношения и мнение родителей',
      value: hasParents ? 1.0 : 0,
      color: '#ec4899', // Розовый
      glowColor: 'rgba(236, 72, 153, 0.4)',
    },
    {
      name: 'Барьеры & Страхи',
      description: 'Что тревожит в выборе',
      value: hasFears ? 1.0 : 0,
      color: '#f97316', // Оранжевый
      glowColor: 'rgba(249, 115, 22, 0.4)',
    },
    {
      name: 'Опыт & Проекты',
      description: 'Практические пробы и кружки',
      value: hasExperience ? 1.0 : 0,
      color: '#10b981', // Зеленый
      glowColor: 'rgba(16, 185, 129, 0.4)',
    },
    {
      name: 'Формат & Мышление',
      description: 'Среда работы и тип ума',
      value: (hasWorkFormat ? 0.5 : 0) + (hasThinkingType ? 0.5 : 0),
      color: '#3b82f6', // Синий
      glowColor: 'rgba(59, 130, 246, 0.4)',
    },
    {
      name: 'Мотивация & Энергия',
      description: 'Что заряжает и мерило успеха',
      value: (hasSuccessMeasure ? 0.5 : 0) + (hasEnergySources ? 0.5 : 0),
      color: '#eab308', // Золотой
      glowColor: 'rgba(234, 179, 8, 0.4)',
    },
    {
      name: 'Ценности & Роли',
      description: 'Командный стиль и принципы',
      value: (hasTeamRole ? 0.33 : 0) + (hasAutonomyStyle ? 0.33 : 0) + ((hasValues || hasDecisionStyle) ? 0.34 : 0),
      color: '#84cc16', // Салатовый
      glowColor: 'rgba(132, 204, 22, 0.4)',
    },
  ];

  const cx = 200;
  const cy = 200;
  const maxRadius = 150;

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
            const angle = idx * 45;
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
            const startAngle = idx * 45;
            const endAngle = startAngle + 45;
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
            const startAngle = idx * 45;
            const endAngle = startAngle + 45;
            const currentRadius = maxRadius * sector.value;
            const path = getSectorPath(currentRadius, startAngle, endAngle);

            return (
              <g key={`filled-${idx}`}>
                <motion.path
                  initial={{ d: getSectorPath(0, startAngle, endAngle) }}
                  animate={{ d: path }}
                  transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                  fill={`url(#grad-${idx})`}
                  stroke={sector.value > 0 ? sector.color : 'none'}
                  strokeWidth="1.5"
                  style={{
                    filter: sector.value > 0 ? `drop-shadow(0 0 6px ${sector.glowColor})` : 'none',
                  }}
                  className="cursor-pointer"
                />
              </g>
            );
          })}

          {/* Внешние текстовые маркеры-иконки для секторов */}
          {sectors.map((sector, idx) => {
            const angle = idx * 45 + 22.5; // Центр сектора
            const labelPos = polarToCartesian(cx, cy, maxRadius + 28, angle);
            const isRightSide = labelPos.x > cx;

            return (
              <g key={`label-${idx}`} className="select-none">
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor={Math.abs(labelPos.x - cx) < 10 ? 'middle' : (isRightSide ? 'start' : 'end')}
                  dominantBaseline="middle"
                  fontSize="14"
                  fontWeight="800"
                  className={`transition duration-500 font-sans tracking-wide ${
                    sector.value > 0 ? 'theme-wheel-label-active' : 'theme-wheel-label-inactive'
                  }`}
                >
                  {sector.name}
                </text>
                <text
                  x={labelPos.x}
                  y={labelPos.y + 16}
                  textAnchor={Math.abs(labelPos.x - cx) < 10 ? 'middle' : (isRightSide ? 'start' : 'end')}
                  dominantBaseline="middle"
                  fill={sector.value > 0 ? sector.color : undefined}
                  fontSize="12"
                  fontWeight="bold"
                  className={`transition duration-500 font-sans ${
                    sector.value > 0 ? 'theme-wheel-value-active' : 'theme-wheel-value-inactive'
                  }`}
                >
                  {Math.round(sector.value * 100)}%
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
    <div className="flex flex-col items-center justify-center p-6 bg-[#040506]/30 backdrop-blur-xl border border-white/5 rounded-3xl w-full h-full space-y-6">
      <div className="text-center space-y-1">
        <h3 className="text-md font-bold font-sans text-white tracking-wide">Колесо Призвания</h3>
        <p className="text-xs text-[#7A8A9E] font-medium">Прогресс наполнения профиля талантов</p>
      </div>

      <div className="relative w-full max-w-[260px] aspect-square flex items-center justify-center">
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
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="1"
              strokeDasharray={scale === 1.0 ? 'none' : '4 4'}
            />
          ))}

          {/* Лучевые разделители секторов */}
          {sectors.map((_, idx) => {
            const angle = idx * 45;
            const target = polarToCartesian(cx, cy, maxRadius, angle);
            return (
              <line
                key={idx}
                x1={cx}
                y1={cy}
                x2={target.x}
                y2={target.y}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Рисуем фоновые пустые сегменты колеса */}
          {sectors.map((sector, idx) => {
            const startAngle = idx * 45;
            const endAngle = startAngle + 45;
            const path = getSectorPath(maxRadius, startAngle, endAngle);

            return (
              <path
                key={`bg-${idx}`}
                d={path}
                fill="rgba(255, 255, 255, 0.01)"
                stroke="rgba(255, 255, 255, 0.03)"
                strokeWidth="1"
                className="transition duration-500 hover:fill-white/[0.02] cursor-pointer"
              />
            );
          })}

          {/* Рисуем заполненные сегменты с анимацией */}
          {sectors.map((sector, idx) => {
            const startAngle = idx * 45;
            const endAngle = startAngle + 45;
            const currentRadius = maxRadius * sector.value;
            const path = getSectorPath(currentRadius, startAngle, endAngle);

            return (
              <g key={`filled-${idx}`}>
                <motion.path
                  initial={{ d: getSectorPath(0, startAngle, endAngle) }}
                  animate={{ d: path }}
                  transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                  fill={`url(#grad-${idx})`}
                  stroke={sector.value > 0 ? sector.color : 'none'}
                  strokeWidth="1.5"
                  style={{
                    filter: sector.value > 0 ? `drop-shadow(0 0 6px ${sector.glowColor})` : 'none',
                  }}
                  className="cursor-pointer"
                />
              </g>
            );
          })}

          {/* Внешние текстовые маркеры-иконки для секторов */}
          {sectors.map((sector, idx) => {
            const angle = idx * 45 + 22.5; // Центр сектора
            const labelPos = polarToCartesian(cx, cy, maxRadius + 24, angle);
            const isRightSide = labelPos.x > cx;

            return (
              <g key={`label-${idx}`} className="select-none">
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor={Math.abs(labelPos.x - cx) < 10 ? 'middle' : (isRightSide ? 'start' : 'end')}
                  dominantBaseline="middle"
                  fill={sector.value > 0 ? '#E8ECF0' : '#4E6178'}
                  fontSize="10"
                  fontWeight="bold"
                  className="transition duration-500 font-sans tracking-wide"
                >
                  {sector.name}
                </text>
                <text
                  x={labelPos.x}
                  y={labelPos.y + 11}
                  textAnchor={Math.abs(labelPos.x - cx) < 10 ? 'middle' : (isRightSide ? 'start' : 'end')}
                  dominantBaseline="middle"
                  fill={sector.value > 0 ? sector.color : '#2E3A4D'}
                  fontSize="8"
                  fontWeight="medium"
                  className="transition duration-500 font-sans"
                >
                  {Math.round(sector.value * 100)}%
                </text>
              </g>
            );
          })}

          {/* Центральный декоративный элемент с иконкой */}
          <circle cx={cx} cy={cy} r="18" fill="#040506" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="#3b82f6" fontSize="12" fontWeight="bold">
            🎯
          </text>
        </svg>
      </div>

      {/* Список сфер с прогрессом */}
      <div className="w-full space-y-2.5 max-h-[140px] overflow-y-auto pr-1">
        {sectors.map((sector, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sector.color }} />
              <div className="flex flex-col">
                <span className="text-white/90 font-medium tracking-wide font-sans">{sector.name}</span>
                <span className="text-[10px] text-[#7A8A9E]">{sector.description}</span>
              </div>
            </div>
            <span className="font-bold text-white/80 font-sans" style={{ color: sector.value > 0 ? sector.color : '#4E6178' }}>
              {Math.round(sector.value * 100)}%
            </span>
          </div>
        ))}
      </div>
      <div className="text-[9px] text-[#7A8A9E]/60 italic font-sans text-center mt-1">
        * Проценты отражают полноту извлеченных ИИ качественных данных по каждой сфере.
      </div>
    </div>
  );
}
