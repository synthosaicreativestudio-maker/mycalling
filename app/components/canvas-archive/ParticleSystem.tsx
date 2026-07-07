'use client';

import { useRef, useMemo, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { usePerformance } from '@/app/hooks/usePerformance';
import {
  generateSpaceCloud,
  generateHumanSilhouette,
  generateIndustrySymbol
} from '@/app/utils/vectorGenerators';

// Вершинный шейдер (vertex shader)
const vertexShader = `
uniform float uTime;
uniform float uPixelRatio;
uniform float uSize;
uniform float uTransitionProgress;
uniform float uFlowFieldStrength;

attribute float aScale;
attribute vec3 aRandomness;
attribute vec3 aTargetPosition;

varying vec3 vColor;
varying float vAlpha;
varying float vSpeed;

// Description : Array and textureless GLSL 2D/3D/4D simplex noise functions.
//      Author : Ian McEwan, Ashima Arts.
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){ 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - D.yyy;
  i = mod(i, 289.0 ); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  float n_ = 1.0/7.0; // N=7
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}

void main() {
    vec3 mixedPos = mix(position, aTargetPosition, uTransitionProgress);

    float noiseX = snoise(mixedPos * 0.08 + vec3(uTime * 0.08, 0.0, 0.0));
    float noiseY = snoise(mixedPos * 0.08 + vec3(0.0, uTime * 0.08, 0.0));
    float noiseZ = snoise(mixedPos * 0.08 + vec3(0.0, 0.0, uTime * 0.08));

    mixedPos.x += noiseX * uFlowFieldStrength + sin(uTime * 0.1 + aRandomness.x * 6.28) * 0.05;
    mixedPos.y += noiseY * uFlowFieldStrength + cos(uTime * 0.1 + aRandomness.y * 6.28) * 0.05;
    mixedPos.z += noiseZ * uFlowFieldStrength + sin(uTime * 0.08 + aRandomness.z * 6.28) * 0.05;

    vec4 mvPosition = modelViewMatrix * vec4(mixedPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    gl_PointSize = uSize * aScale * uPixelRatio * (300.0 / -mvPosition.z);

    vColor = mix(vec3(0.9, 0.95, 1.0), vec3(0.05, 0.35, 0.95), aRandomness.x);

    vAlpha = clamp(1.0 - (-mvPosition.z / 35.0), 0.0, 1.0);
    vSpeed = length(vec3(noiseX, noiseY, noiseZ)) * uFlowFieldStrength;
}
`;

// Фрагментный шейдер (fragment shader)
const fragmentShader = `
varying vec3 vColor;
varying float vAlpha;
varying float vSpeed;

void main() {
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    
    float strength = 0.04 / distanceToCenter;
    strength = pow(strength, 2.2);
    strength = clamp(strength - 0.05, 0.0, 1.0);
    
    float circle = 1.0 - smoothstep(0.18, 0.5, distanceToCenter);

    vec3 finalColor = mix(vColor, vec3(0.95, 0.98, 1.0), clamp(vSpeed * 0.2, 0.0, 0.5));

    gl_FragColor = vec4(finalColor, strength * circle * vAlpha * 0.7);
}
`;


// Описание цикла профессий и соответствующих им символов
const ANIMATION_CYCLE = [
  { profession: 'it', symbol: 'chip' },
  { profession: 'doctor', symbol: 'dna' },
  { profession: 'engineer', symbol: 'gear' },
  { profession: 'lawyer', symbol: 'scales' },
  { profession: 'scientist', symbol: 'atom' },
  { profession: 'teacher', symbol: 'book' },
  { profession: 'musician', symbol: 'palette' },
  { profession: 'entrepreneur', symbol: 'chart' },
  { profession: 'architect', symbol: 'gear' },
  { profession: 'builder', symbol: 'gear' }
];

export function ParticleSystem() {
  const pointsRef = useRef<THREE.Points>(null);
  const pixelRatio = useThree((state) => state.viewport.dpr);
  
  // Получаем количество частиц и эффекты на основе производительности устройства
  const { config } = usePerformance();
  // Фиксируем count при первом рендере, чтобы избежать пересоздания буферов
  const countRef = useRef(config.particleCount);
  const count = countRef.current;

  // Инициализация координат
  const [initialPositions, scales, randomness] = useMemo(() => {
    const pos = generateSpaceCloud(count);
    const scl = new Float32Array(count);
    const rnd = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      scl[i] = Math.random() * 0.7 + 0.3; // Размеры от 0.3 до 1.0
      rnd[i * 3 + 0] = Math.random();
      rnd[i * 3 + 1] = Math.random();
      rnd[i * 3 + 2] = Math.random();
    }
    return [pos, scl, rnd];
  }, [count]);

  // Uniform-переменные для шейдера
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 38.0 },
      uPixelRatio: { value: pixelRatio },
      uTransitionProgress: { value: 0.0 },
      uFlowFieldStrength: { value: 1.0 }
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Обновляем pixelRatio отдельно, не пересоздавая объект uniforms
  useEffect(() => {
    uniforms.uPixelRatio.value = pixelRatio;
  }, [pixelRatio, uniforms]);

  // Ссылки для хранения текущих массивов позиций на CPU
  const positionsState = useRef({
    currentSource: new Float32Array(initialPositions),
    currentTarget: new Float32Array(initialPositions),
    cycleIndex: 0,
    phase: 'space' // 'space' | 'human_morph' | 'human_hold' | 'space_morph_1' | 'symbol_morph' | 'symbol_hold' | 'space_morph_2'
  });

  // Обновление буферов геометрии
  const updateGeometryBuffers = useCallback(() => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    
    // Позиция источника (position)
    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
    if (posAttr && posAttr.array) {
      (posAttr.array as Float32Array).set(positionsState.current.currentSource);
      posAttr.needsUpdate = true;
    }

    // Позиция цели — R3F регистрирует атрибут под именем aTargetPosition (без префикса attributes-)
    const targetAttr = geom.getAttribute('aTargetPosition') as THREE.BufferAttribute;
    if (targetAttr && targetAttr.array) {
      (targetAttr.array as Float32Array).set(positionsState.current.currentTarget);
      targetAttr.needsUpdate = true;
    }
  }, []);

  // Запуск бесконечного цикла анимации (GSAP)
  useEffect(() => {
    const state = positionsState.current;
    let isActive = true;

    const runCycle = () => {
      if (!isActive || !pointsRef.current) return;

      const currentItem = ANIMATION_CYCLE[state.cycleIndex];

      // Фаза 1: Сборка в Человека профессии
      state.phase = 'human_morph';
      state.currentSource.set(state.currentTarget); // Старая цель становится источником
      state.currentTarget.set(generateHumanSilhouette(count, currentItem.profession));
      updateGeometryBuffers();

      // Сбрасываем прогресс и анимируем переход
      uniforms.uTransitionProgress.value = 0.0;
      
      const tl = gsap.timeline({
        onComplete: () => {
          if (!isActive) return;
          
          // Фаза 2: Удержание человека
          state.phase = 'human_hold';
          gsap.delayedCall(4.5, () => {
            if (!isActive) return;

            // Фаза 3: Распад в Космический поток
            state.phase = 'space_morph_1';
            state.currentSource.set(state.currentTarget);
            state.currentTarget.set(generateSpaceCloud(count));
            updateGeometryBuffers();
            
            uniforms.uTransitionProgress.value = 0.0;
            
            gsap.to(uniforms.uTransitionProgress, {
              value: 1.0,
              duration: 3.5,
              ease: 'power2.inOut',
              onStart: () => {
                gsap.to(uniforms.uFlowFieldStrength, { value: 1.8, duration: 1.5 });
              },
              onComplete: () => {
                if (!isActive) return;

                // Фаза 4: Сборка в Символ отрасли
                state.phase = 'symbol_morph';
                state.currentSource.set(state.currentTarget);
                state.currentTarget.set(generateIndustrySymbol(count, currentItem.symbol));
                updateGeometryBuffers();

                uniforms.uTransitionProgress.value = 0.0;

                gsap.to(uniforms.uTransitionProgress, {
                  value: 1.0,
                  duration: 3.5,
                  ease: 'power2.inOut',
                  onStart: () => {
                    gsap.to(uniforms.uFlowFieldStrength, { value: 0.1, duration: 2.0 });
                  },
                  onComplete: () => {
                    if (!isActive) return;

                    // Фаза 5: Удержание символа
                    state.phase = 'symbol_hold';
                    gsap.delayedCall(4.5, () => {
                      if (!isActive) return;

                      // Фаза 6: Распад в Космический поток перед следующей профессией
                      state.phase = 'space_morph_2';
                      state.currentSource.set(state.currentTarget);
                      state.currentTarget.set(generateSpaceCloud(count));
                      updateGeometryBuffers();

                      uniforms.uTransitionProgress.value = 0.0;

                      gsap.to(uniforms.uTransitionProgress, {
                        value: 1.0,
                        duration: 3.5,
                        ease: 'power2.inOut',
                        onStart: () => {
                          gsap.to(uniforms.uFlowFieldStrength, { value: 1.8, duration: 1.5 });
                        },
                        onComplete: () => {
                          if (!isActive) return;
                          
                          // Переходим к следующей профессии в цикле
                          state.cycleIndex = (state.cycleIndex + 1) % ANIMATION_CYCLE.length;
                          runCycle();
                        }
                      });
                    });
                  }
                });
              }
            });
          });
        }
      });

      tl.to(uniforms.uTransitionProgress, {
        value: 1.0,
        duration: 3.5,
        ease: 'power2.inOut',
        onStart: () => {
          // Уменьшаем силу хаотичного вихря для сборки четкого силуэта
          gsap.to(uniforms.uFlowFieldStrength, { value: 0.08, duration: 2.0 });
        }
      });
    };

    // Запускаем первую итерацию с небольшой задержкой для инициализации сцены
    const initTimeout = setTimeout(runCycle, 1500);

    return () => {
      isActive = false;
      clearTimeout(initTimeout);
      gsap.killTweensOf(uniforms.uTransitionProgress);
      gsap.killTweensOf(uniforms.uFlowFieldStrength);
    };
  }, [count, uniforms, updateGeometryBuffers]);

  // Обновление времени и медленное вращение сцены
  useFrame((state) => {
    const elapsedTime = state.clock.getElapsedTime();
    if (pointsRef.current) {
      const material = pointsRef.current.material as THREE.ShaderMaterial;
      if (material.uniforms && material.uniforms.uTime) {
        material.uniforms.uTime.value = elapsedTime;
      }
      
      // Медленное медитативное вращение всего облака частиц
      pointsRef.current.rotation.y = elapsedTime * 0.012;
      pointsRef.current.rotation.x = Math.sin(elapsedTime * 0.008) * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[initialPositions, 3]}
        />
        <bufferAttribute
          attach="attributes-aScale"
          args={[scales, 1]}
        />
        <bufferAttribute
          attach="attributes-aRandomness"
          args={[randomness, 3]}
        />
        <bufferAttribute
          attach="attributes-aTargetPosition"
          args={[initialPositions, 3]}
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
