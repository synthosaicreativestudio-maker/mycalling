'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function HeroOrb() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#06060e', 0.006);

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const baseCount = 2500;
    const particleCount = baseCount * 3;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    const initialDirs: { x: number; y: number; z: number; r: number }[] = [];

    for (let i = 0; i < baseCount; i += 1) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * Math.PI * 2;
      const phi = Math.acos(2 * v - 1);
      const radius = 14 + Math.random() * 8;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      initialDirs.push({
        x: x / radius,
        y: y / radius,
        z: z / radius,
        r: radius
      });

      const colorMix = new THREE.Color();
      
      // g = 0 (Основа) — яркое золото
      colorMix.setHSL(0.12 + Math.random() * 0.04, 1.0, 0.65);
      colors[i * 3] = colorMix.r;
      colors[i * 3 + 1] = colorMix.g;
      colors[i * 3 + 2] = colorMix.b;

      // g = 1 (Хвост 1) — оранжевый
      colorMix.setHSL(0.08 + Math.random() * 0.03, 1.0, 0.52);
      colors[(i + baseCount) * 3] = colorMix.r;
      colors[(i + baseCount) * 3 + 1] = colorMix.g;
      colors[(i + baseCount) * 3 + 2] = colorMix.b;

      // g = 2 (Хвост 2) — оранжево-красный
      colorMix.setHSL(0.02 + Math.random() * 0.03, 1.0, 0.42);
      colors[(i + baseCount * 2) * 3] = colorMix.r;
      colors[(i + baseCount * 2) * 3 + 1] = colorMix.g;
      colors[(i + baseCount * 2) * 3 + 2] = colorMix.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = 32;
    textureCanvas.height = 32;
    const textureContext = textureCanvas.getContext('2d');

    if (!textureContext) {
      return;
    }

    const gradient = textureContext.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.25, 'rgba(255,215,0,1)');
    gradient.addColorStop(0.6, 'rgba(255,115,0,0.5)');
    gradient.addColorStop(1, 'rgba(255,115,0,0)');
    textureContext.fillStyle = gradient;
    textureContext.fillRect(0, 0, 32, 32);
    const texture = new THREE.CanvasTexture(textureCanvas);

    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        size: 0.28,
        map: texture,
        vertexColors: true,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    scene.add(particles);

    const glowLight = new THREE.PointLight('#ffa200', 8, 150);
    glowLight.position.set(0, 0, 10);
    scene.add(glowLight);

    const ambient = new THREE.AmbientLight('#ffea9f', 0.2);
    scene.add(ambient);

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    let frameId = 0;

    const onMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const onResize = () => {
      const nextWidth = container.clientWidth;
      const nextHeight = container.clientHeight;
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    };

    const clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      frameId = requestAnimationFrame(animate);

      currentX += (mouseX - currentX) * 0.03;
      currentY += (mouseY - currentY) * 0.03;

      const posAttr = particleGeometry.getAttribute('position') as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      for (let i = 0; i < baseCount; i += 1) {
        const dir = initialDirs[i];

        for (let g = 0; g < 3; g += 1) {
          const idx = i + g * baseCount;
          const t = elapsed - g * 0.055;

          const waveValue = Math.sin(dir.r * 1.8 - t * 4.5) * 0.65;
          const currentR = dir.r + waveValue;

          const rx = dir.x * currentR;
          const ry = dir.y * currentR;
          const rz = dir.z * currentR;

          const rotY = t * 0.06;
          const rotX = t * 0.025;

          const x1 = rx * Math.cos(rotY) - rz * Math.sin(rotY);
          const z1 = rx * Math.sin(rotY) + rz * Math.cos(rotY);

          const y2 = ry * Math.cos(rotX) - z1 * Math.sin(rotX);
          const z2 = ry * Math.sin(rotX) + z1 * Math.cos(rotX);

          posArray[idx * 3] = x1;
          posArray[idx * 3 + 1] = y2;
          posArray[idx * 3 + 2] = z2;
        }
      }
      posAttr.needsUpdate = true;

      particles.position.x = currentX * 2;
      particles.position.y = -currentY * 1.5;

      glowLight.intensity = 7 + Math.sin(elapsed * 1.2) * 1.0;

      renderer.render(scene, camera);
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove);
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      renderer.dispose();
      particleGeometry.dispose();
      texture.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div ref={containerRef} className="absolute inset-0" />
    </div>
  );
}
