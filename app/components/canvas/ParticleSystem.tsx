'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { designConfig } from '@/app/config/design';

const vertexShader = `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;

  attribute float aScale;
  attribute vec3 aRandomness;

  varying vec3 vColor;
  varying float vAlpha;

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
      vec3 pos = position;

      // Симуляция Flow Field с помощью 3D Simplex шума
      float noiseX = snoise(pos * 0.12 + vec3(uTime * 0.05, 0.0, 0.0));
      float noiseY = snoise(pos * 0.12 + vec3(0.0, uTime * 0.05, 0.0));
      float noiseZ = snoise(pos * 0.12 + vec3(0.0, 0.0, uTime * 0.05));

      pos.x += noiseX * 1.5 + sin(uTime * 0.05 + aRandomness.x * 6.28) * 0.2;
      pos.y += noiseY * 1.5 + cos(uTime * 0.08 + aRandomness.y * 6.28) * 0.2;
      pos.z += noiseZ * 1.5 + sin(uTime * 0.04 + aRandomness.z * 6.28) * 0.2;

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
