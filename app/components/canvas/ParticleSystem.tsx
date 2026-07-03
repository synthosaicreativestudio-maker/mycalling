'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { designConfig } from '@/app/config/design';

// Встроенный Vertex Shader
const vertexShader = `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;

  attribute float aScale;
  attribute vec3 aRandomness;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
      vec3 pos = position;

      // Легкий дрейф по синусоиде
      pos.x += sin(uTime * 0.1 + aRandomness.x * 6.28) * 0.3;
      pos.y += cos(uTime * 0.15 + aRandomness.y * 6.28) * 0.3;
      pos.z += sin(uTime * 0.08 + aRandomness.z * 6.28) * 0.3;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      // Размер с учетом дистанции до камеры
      gl_PointSize = uSize * aScale * uPixelRatio * (300.0 / -mvPosition.z);

      // Глубокий синий цвет
      vColor = vec3(0.23, 0.51, 0.96);
      
      // Плавное угасание по глубине
      vAlpha = clamp(1.0 - (-mvPosition.z / 38.0), 0.0, 1.0);
  }
`;

// Встроенный Fragment Shader
const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
      float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
      
      // Мягкий светящийся центр
      float strength = 0.05 / distanceToCenter;
      strength = pow(strength, 2.0);
      strength = clamp(strength - 0.1, 0.0, 1.0);
      
      float circle = 1.0 - smoothstep(0.15, 0.5, distanceToCenter);

      gl_FragColor = vec4(vColor, strength * circle * vAlpha * 0.65);
  }
`;

export function ParticleSystem() {
  const pointsRef = useRef<THREE.Points>(null);
  const { pixelRatio } = useThree();
  const count = designConfig.particleCount;

  // Генерация координат и атрибутов частиц
  const [positions, scales, randomness] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const randomness = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Облако в форме широкого эллипсоида
      positions[i * 3 + 0] = (Math.random() - 0.5) * 35; // X
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20; // Y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 25 - 5; // Z (чуть сдвинуто в глубь)

      scales[i] = Math.random() * 0.8 + 0.2;

      randomness[i * 3 + 0] = Math.random();
      randomness[i * 3 + 1] = Math.random();
      randomness[i * 3 + 2] = Math.random();
    }

    return [positions, scales, randomness];
  }, [count]);

  // Uniform-переменные для шейдерного материала
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 35.0 }, // Базовый размер частиц
      uPixelRatio: { value: pixelRatio },
    }),
    [pixelRatio]
  );

  // Обновление времени в каждом кадре
  useFrame((state) => {
    const elapsedTime = state.clock.getElapsedTime();
    if (pointsRef.current) {
      const material = pointsRef.current.material as THREE.ShaderMaterial;
      if (material.uniforms && material.uniforms.uTime) {
        material.uniforms.uTime.value = elapsedTime;
      }
      
      // Медленное вращение всего облака частиц
      pointsRef.current.rotation.y = elapsedTime * 0.015;
      pointsRef.current.rotation.x = elapsedTime * 0.005;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aScale"
          args={[scales, 1]}
        />
        <bufferAttribute
          attach="attributes-aRandomness"
          args={[randomness, 3]}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
