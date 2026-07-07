'use client';

import { useState, useEffect } from 'react';
import { designConfig } from '../config/design';

export type PerformanceProfile = 'ultra' | 'high' | 'medium' | 'low' | 'mobile';

export function usePerformance() {
  const [profile, setProfile] = useState<PerformanceProfile>('medium');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Первичная классификация по User Agent и размеру экрана
    const ua = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|iphone|ipad|ipod|android|blackberry|iemobile|opera mini/i.test(ua);
    const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(ua);

    let initialProfile: PerformanceProfile = 'medium';

    if (isMobile) {
      initialProfile = 'mobile';
    } else if (isTablet) {
      initialProfile = 'low';
    } else {
      // Для Desktop по умолчанию даем 'high'
      initialProfile = 'high';
      
      // Если есть мощная видеокарта (через WebGL Debug Info)
      try {
        const canvas = document.createElement('canvas');
        const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
        if (gl) {
          const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
            // Если дискретная карта RTX, GTX, Radeon XT, Apple M1/M2/M3 Max/Pro
            if (
              renderer.includes('rtx') || 
              renderer.includes('gtx') || 
              renderer.includes('radeon pro') ||
              renderer.includes('apple m') && !renderer.includes('apple m1 gpu') // мощные чипы Apple
            ) {
              initialProfile = 'ultra';
            }
          }
        }
      } catch (e) {
        console.warn('Failed to detect GPU renderer info', e);
      }
    }

    setProfile(initialProfile);

    // 2. Мониторинг реального FPS для адаптивного понижения качества
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const checkFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 2000) { // Каждые 2 секунды
        const fps = (frameCount * 1000) / (currentTime - lastTime);
        
        // Если FPS сильно падает, понижаем качество
        if (fps < 40) {
          setProfile((current) => {
            if (current === 'ultra') return 'high';
            if (current === 'high') return 'medium';
            if (current === 'medium') return 'low';
            if (current === 'low') return 'mobile';
            return current;
          });
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationFrameId = requestAnimationFrame(checkFPS);
    };

    animationFrameId = requestAnimationFrame(checkFPS);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return {
    profile,
    config: designConfig.performanceProfiles[profile],
  };
}
