'use client';

import type { CSSProperties, MouseEvent, MutableRefObject, RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

type PointerState = {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  active: boolean;
};

type TreeItem = {
  id: string;
  name: string;
  src: string;
  layer: 'core' | 'outer';
  style: CSSProperties;
  center: { x: number; y: number };
  phase: number;
};

type LeafItem = {
  id: number;
  src: string;
  style: CSSProperties;
  center: { x: number; y: number };
  phase: number;
};

const PROFESSION_ICONS: TreeItem[] = [
  {
    id: 'medicine',
    name: 'Медицина',
    src: '/assets/tree/webp/icon_medicine.webp',
    layer: 'core',
    style: { left: '26.8%', top: '20.0%', width: '10.5%' },
    center: { x: 32.05, y: 25.25 },
    phase: 0.2,
  },
  {
    id: 'engineering',
    name: 'Инженерия',
    src: '/assets/tree/webp/icon_engineering.webp',
    layer: 'core',
    style: { left: '40.2%', top: '10.5%', width: '10.8%' },
    center: { x: 45.6, y: 15.9 },
    phase: 1.1,
  },
  {
    id: 'business',
    name: 'Бизнес',
    src: '/assets/tree/webp/icon_business.webp',
    layer: 'core',
    style: { left: '55.0%', top: '10.9%', width: '11.0%' },
    center: { x: 60.5, y: 16.4 },
    phase: 2.2,
  },
  {
    id: 'science',
    name: 'Наука',
    src: '/assets/tree/webp/icon_science.webp',
    layer: 'core',
    style: { left: '68.6%', top: '20.4%', width: '10.5%' },
    center: { x: 73.85, y: 25.65 },
    phase: 3.1,
  },
  {
    id: 'technology',
    name: 'Технологии',
    src: '/assets/tree/webp/icon_technology.webp',
    layer: 'core',
    style: { left: '21.4%', top: '38.6%', width: '10.3%' },
    center: { x: 26.55, y: 43.75 },
    phase: 4.1,
  },
  {
    id: 'creativity',
    name: 'Творчество',
    src: '/assets/tree/webp/icon_creativity.webp',
    layer: 'core',
    style: { left: '72.2%', top: '39.0%', width: '10.5%' },
    center: { x: 77.45, y: 44.25 },
    phase: 5.0,
  },
  {
    id: 'education',
    name: 'Образование',
    src: '/assets/tree/webp/icon_education.webp',
    layer: 'outer',
    style: { left: '30.0%', top: '3.0%', width: '9.5%' },
    center: { x: 34.75, y: 7.75 },
    phase: 0.8,
  },
  {
    id: 'law',
    name: 'Право и общество',
    src: '/assets/tree/webp/icon_law.webp',
    layer: 'outer',
    style: { left: '60.5%', top: '3.0%', width: '9.5%' },
    center: { x: 65.25, y: 7.75 },
    phase: 1.8,
  },
  {
    id: 'ecology',
    name: 'Экология',
    src: '/assets/tree/webp/icon_ecology.webp',
    layer: 'outer',
    style: { left: '18.0%', top: '28.5%', width: '9.0%' },
    center: { x: 22.5, y: 33.0 },
    phase: 2.8,
  },
  {
    id: 'urban',
    name: 'Среда и строительство',
    src: '/assets/tree/webp/icon_urban.webp',
    layer: 'outer',
    style: { left: '80.0%', top: '28.5%', width: '9.0%' },
    center: { x: 84.5, y: 33.0 },
    phase: 3.8,
  },
];

const LEAVES: LeafItem[] = [
  { id: 1, src: '/assets/tree/webp/leaf_1.webp', style: { left: '32.03%', top: '48.14%', width: '7.52%' }, center: { x: 35.79, y: 50.43 }, phase: 0 },
  { id: 2, src: '/assets/tree/webp/leaf_2.webp', style: { left: '38.09%', top: '38.09%', width: '6.35%' }, center: { x: 41.26, y: 41.11 }, phase: 1.2 },
  { id: 3, src: '/assets/tree/webp/leaf_3.webp', style: { left: '38.48%', top: '28.71%', width: '3.91%' }, center: { x: 40.43, y: 31.54 }, phase: 2.4 },
  { id: 4, src: '/assets/tree/webp/leaf_4.webp', style: { left: '42.00%', top: '55.37%', width: '7.32%' }, center: { x: 45.66, y: 62.79 }, phase: 3.6 },
  { id: 5, src: '/assets/tree/webp/leaf_5.webp', style: { left: '47.85%', top: '29.20%', width: '5.18%' }, center: { x: 50.44, y: 34.81 }, phase: 4.8 },
  { id: 6, src: '/assets/tree/webp/leaf_6.webp', style: { left: '55.47%', top: '37.89%', width: '7.62%' }, center: { x: 59.28, y: 41.02 }, phase: 0.8 },
  { id: 7, src: '/assets/tree/webp/leaf_7.webp', style: { left: '60.35%', top: '47.85%', width: '7.91%' }, center: { x: 64.31, y: 50.29 }, phase: 2.0 },
  { id: 8, src: '/assets/tree/webp/leaf_8.webp', style: { left: '60.94%', top: '29.39%', width: '4.30%' }, center: { x: 63.09, y: 31.64 }, phase: 3.2 },
];

const crownParticles = Array.from({ length: 36 }, (_, index) => {
  const angle = -160 + index * 8.8;
  const radiusX = 30 + (index % 5) * 2.8;
  const radiusY = 22 + (index % 7) * 1.9;
  const rad = (angle * Math.PI) / 180;
  return {
    id: index,
    x: 50 + Math.cos(rad) * radiusX,
    y: 34 + Math.sin(rad) * radiusY,
    size: 1.15 + (index % 4) * 0.28,
    phase: index * 0.47,
  };
});

const ambientDust = Array.from({ length: 56 }, (_, index) => {
  const ring = index % 7;
  const column = index % 8;
  const x = 35 + column * 4.3 + (ring % 2 === 0 ? 0.9 : -0.9);
  const y = 16 + ring * 5.7 + (column % 3) * 0.55;
  return {
    id: index,
    x,
    y,
    size: 0.72 + (index % 4) * 0.12,
    phase: index * 0.31,
  };
});

const leafFilter = 'drop-shadow(0 10px 18px rgba(111, 151, 173, 0.12)) saturate(1.12) sepia(0.12) hue-rotate(-12deg) brightness(1.03) contrast(1.04)';
const professionFilter = 'drop-shadow(0 8px 16px rgba(111, 151, 173, 0.10)) saturate(1.08) sepia(0.08) hue-rotate(-10deg) brightness(1.02) contrast(1.03)';

export function InteractiveTree() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<PointerState>({ x: 50, y: 36, targetX: 50, targetY: 36, active: false });
  const [pointerSide, setPointerSide] = useState({ x: 50, y: 36, active: false });

  useEffect(() => {
    let animationFrame = 0;
    const updatePointer = () => {
      const pointer = pointerRef.current;
      pointer.x += (pointer.targetX - pointer.x) * 0.08;
      pointer.y += (pointer.targetY - pointer.y) * 0.08;
      setPointerSide({ x: pointer.x, y: pointer.y, active: pointer.active });
      animationFrame = requestAnimationFrame(updatePointer);
    };
    updatePointer();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    pointerRef.current.targetX = ((event.clientX - rect.left) / rect.width) * 100;
    pointerRef.current.targetY = ((event.clientY - rect.top) / rect.height) * 100;
    pointerRef.current.active = true;
  };

  const handleMouseLeave = () => {
    pointerRef.current.targetX = 50;
    pointerRef.current.targetY = 36;
    pointerRef.current.active = false;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="interactive-tree relative mx-auto aspect-square w-full max-w-[840px] select-none"
    >
      <CrownParticleHalo pointer={pointerSide} />
      <AmbientDust pointer={pointerSide} />

      <img
        src="/assets/tree/webp/tree_skeleton.webp"
        alt="Дерево призвания"
        className="absolute inset-0 z-10 h-full w-full object-contain pointer-events-none"
      />

      {LEAVES.map((leaf) => (
        <LeafElement key={leaf.id} leaf={leaf} pointerRef={pointerRef} containerRef={containerRef} />
      ))}

      {PROFESSION_ICONS.map((icon) => (
        <ProfessionIcon
          key={icon.id}
          icon={icon}
          pointerRef={pointerRef}
          containerRef={containerRef}
        />
      ))}
    </div>
  );
}

function CrownParticleHalo({ pointer }: { pointer: { x: number; y: number; active: boolean } }) {
  return (
    <div className="absolute inset-0 z-[8] pointer-events-none">
      {crownParticles.map((particle) => {
        const distanceToPointer = Math.hypot(pointer.x - particle.x, pointer.y - particle.y);
        const sideMatch = pointer.active && Math.sign(pointer.x - 50) === Math.sign(particle.x - 50);
        const activation = sideMatch ? Math.max(0, 1 - distanceToPointer / 34) : 0;
        const opacity = 0.08 + activation * 0.28;
        const scale = 0.82 + activation * 0.65;
        const driftX = activation * (pointer.x > 50 ? 6 : -6);
        const driftY = activation * ((pointer.y - 35) * 0.08);

        return (
          <motion.span
            key={particle.id}
            className="absolute rounded-full bg-[radial-gradient(circle,rgba(255,248,224,0.98)_0%,rgba(216,190,128,0.72)_38%,rgba(160,201,225,0.08)_100%)] shadow-[0_0_12px_rgba(216,190,128,0.2)]"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              opacity,
              scale,
              x: driftX,
              y: driftY,
            }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
}

function AmbientDust({ pointer }: { pointer: { x: number; y: number; active: boolean } }) {
  return (
    <div className="absolute inset-0 z-[9] pointer-events-none">
      {ambientDust.map((particle) => {
        const distanceToPointer = Math.hypot(pointer.x - particle.x, pointer.y - particle.y);
        const sideMatch = pointer.active && Math.sign(pointer.x - 50) === Math.sign(particle.x - 50);
        const activation = sideMatch ? Math.max(0, 1 - distanceToPointer / 42) : 0;
        const opacity = 0.05 + activation * 0.2;
        const scale = 0.74 + activation * 0.42;
        const driftX = Math.sin(particle.phase * 2.1) * 1.35;
        const driftY = Math.cos(particle.phase * 1.7) * 1.1;

        return (
          <motion.span
            key={particle.id}
            className="absolute rounded-full bg-[radial-gradient(circle,rgba(255,250,235,0.98)_0%,rgba(221,196,132,0.74)_34%,rgba(156,194,221,0.22)_62%,rgba(156,194,221,0)_100%)] shadow-[0_0_10px_rgba(221,196,132,0.14)]"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              opacity,
              scale,
              x: [0, driftX + activation * (pointer.x > 50 ? 2.8 : -2.8), 0],
              y: [0, driftY + activation * ((pointer.y - 34) * 0.05), 0],
            }}
            transition={{
              duration: 7 + (particle.id % 5) * 0.8,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </div>
  );
}

function LeafElement({
  leaf,
  pointerRef,
  containerRef,
}: {
  leaf: LeafItem;
  pointerRef: MutableRefObject<PointerState>;
  containerRef: RefObject<HTMLDivElement>;
}) {
  const [motionState, setMotionState] = useState({ x: 0, y: 0, rotate: 0 });

  useEffect(() => {
    let animationFrame = 0;
    const animateLeaf = () => {
      const time = Date.now() * 0.001;
      const pointer = pointerRef.current;
      let targetX = 0;
      let targetY = 0;

      if (containerRef.current) {
        const dx = pointer.x - leaf.center.x;
        const dy = pointer.y - leaf.center.y;
        const distance = Math.hypot(dx, dy);
        const force = pointer.active ? Math.max(0, 1 - distance / 46) : 0;
        const floatX = Math.sin(time * 0.58 + leaf.phase) * 1.25;
        const floatY = Math.sin(time * 0.74 + leaf.phase * 1.2) * 1.9 - 1.05;
        targetX = Math.max(-8, Math.min(8, dx * 0.11 * force + floatX));
        targetY = Math.max(-8, Math.min(8, dy * 0.08 * force + floatY));
      }

      setMotionState({
        x: targetX,
        y: targetY,
        rotate: Math.sin(time * 0.72 + leaf.phase) * 1.25,
      });

      animationFrame = requestAnimationFrame(animateLeaf);
    };

    animateLeaf();
    return () => cancelAnimationFrame(animationFrame);
  }, [containerRef, leaf.center.x, leaf.center.y, leaf.phase, pointerRef]);

  return (
    <motion.img
      src={leaf.src}
      alt=""
      aria-hidden="true"
      className="absolute z-20 select-none pointer-events-none"
      style={{ ...leaf.style, transformOrigin: 'center center', filter: leafFilter }}
      animate={motionState}
      transition={{ duration: 0.38, ease: 'easeOut' }}
    />
  );
}

function ProfessionIcon({
  icon,
  pointerRef,
  containerRef,
}: {
  icon: TreeItem;
  pointerRef: MutableRefObject<PointerState>;
  containerRef: RefObject<HTMLDivElement>;
}) {
  const [motionState, setMotionState] = useState({ x: 0, y: 0, rotate: 0 });

  useEffect(() => {
    let animationFrame = 0;
    const animateIcon = () => {
      const time = Date.now() * 0.001;
      const pointer = pointerRef.current;
      let targetX = 0;
      let targetY = 0;

      if (containerRef.current) {
        const dx = pointer.x - icon.center.x;
        const dy = pointer.y - icon.center.y;
        const distance = Math.hypot(dx, dy);
        const force = pointer.active ? Math.max(0, 1 - distance / 58) : 0;
        const floatX = Math.sin(time * 0.34 + icon.phase * 1.7) * 1.1;
        const floatY = Math.sin(time * 0.52 + icon.phase) * 1.7 - 0.8;
        targetX = Math.max(-15, Math.min(15, dx * 0.12 * force + floatX));
        targetY = Math.max(-15, Math.min(15, dy * 0.1 * force + floatY));
      }

      setMotionState({
        x: targetX,
        y: targetY,
        rotate: Math.sin(time * 0.48 + icon.phase) * 0.55,
      });

      animationFrame = requestAnimationFrame(animateIcon);
    };

    animateIcon();
    return () => cancelAnimationFrame(animationFrame);
  }, [containerRef, icon.center.x, icon.center.y, icon.phase, pointerRef]);

  return (
    <div
      style={icon.style}
      className={`absolute z-30 ${icon.layer === 'outer' ? 'opacity-[0.86]' : 'opacity-100'}`}
    >
      <motion.img
        src={icon.src}
        alt={icon.name}
        className="h-full w-full cursor-pointer object-contain"
        style={{ filter: professionFilter }}
        animate={{
          ...motionState,
          scale: icon.layer === 'outer' ? 0.92 : 0.985,
          opacity: icon.layer === 'outer' ? 0.88 : 0.98,
          filter: professionFilter,
        }}
        transition={{ duration: 0.62, ease: 'easeOut' }}
      />
    </div>
  );
}
