'use client';

import { Canvas } from '@react-three/fiber';
import { ParticleSystem } from './ParticleSystem';
import { designConfig } from '@/app/config/design';

// Пост-эффекты подключаем динамически только если включено в конфиге
let EffectComposer: any = null;
let Bloom: any = null;

if (designConfig.enablePostprocessing) {
  try {
    const postprocessing = require('@react-three/postprocessing');
    EffectComposer = postprocessing.EffectComposer;
    Bloom = postprocessing.Bloom;
  } catch (e) {
    console.warn('Failed to load postprocessing libraries', e);
  }
}

export function ParticleScene() {
  const showEffects = designConfig.enablePostprocessing && EffectComposer && Bloom;

  return (
    <Canvas
      camera={{ position: [0, 0, 15], fov: 60, near: 0.1, far: 100 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        stencil: false,
        depth: false,
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
      <ambientLight intensity={0.5} />
      <ParticleSystem />
      
      {showEffects && (
        <EffectComposer>
          <Bloom
            intensity={1.0}
            luminanceThreshold={0.1}
            luminanceSmoothing={0.9}
            mipmapBlur={true}
          />
        </EffectComposer>
      )}
    </Canvas>
  );
}
