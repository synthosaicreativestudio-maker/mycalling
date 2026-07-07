'use client';

import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { ParticleSystem } from './ParticleSystem';

export function ParticleScene() {
  return (
    <Canvas
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        stencil: false,
        depth: false,
        preserveDrawingBuffer: true, // Сохраняем буфер для эффекта шлейфа
      }}
      onCreated={({ gl }) => {
        gl.autoClear = false; // Отключаем очистку для эффекта послесвечения
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'transparent',
      }}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={60} near={0.1} far={100}>
        {/* 
          Полноэкранный квад для затухания старых кадров.
          Цвет #040307 (темно-фиолетовый) создает спектральный сдвиг угасающих хвостов частиц в фиолетовый.
          Прозрачность 0.08 регулирует длину шлейфа (хвоста кометы).
        */}
        <mesh position={[0, 0, -0.15]}>
          <planeGeometry args={[2, 2]} />
          <meshBasicMaterial 
            color="#040307" 
            transparent 
            opacity={0.08} 
            depthWrite={false}
            depthTest={false}
          />
        </mesh>
      </PerspectiveCamera>

      <ambientLight intensity={0.8} />
      <ParticleSystem />
    </Canvas>
  );
}
