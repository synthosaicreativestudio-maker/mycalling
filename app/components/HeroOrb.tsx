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
    scene.fog = new THREE.FogExp2('#050816', 0.012);

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.z = 42;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const baseCount = 850;
    const particleCount = baseCount * 3; // Базовые искры + 2 уровня хвостов
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    // Структура для базовых направлений движения
    const initialDirs: { x: number; y: number; z: number; r: number }[] = [];

    // Генерируем базовые частицы
    for (let i = 0; i < baseCount; i += 1) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * Math.PI * 2;
      const phi = Math.acos(2 * v - 1);
      const radius = 11 + Math.random() * 4.5;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      initialDirs.push({
        x: x / radius,
        y: y / radius,
        z: z / radius,
        r: radius
      });

      // Заполняем цвета для основы и хвостов
      // g = 0 (основа): Ярко-золотой/желтый
      // g = 1 (первый хвост): Насыщенный оранжево-золотой
      // g = 2 (второй хвост): Теплый оранжево-красный (эффект остывающей искры)
      const colorMix = new THREE.Color();
      
      // g = 0 (Основа)
      colorMix.setHSL(0.12 + Math.random() * 0.04, 1.0, 0.65); // Золотисто-желтый
      colors[i * 3] = colorMix.r;
      colors[i * 3 + 1] = colorMix.g;
      colors[i * 3 + 2] = colorMix.b;

      // g = 1 (Хвост 1)
      colorMix.setHSL(0.08 + Math.random() * 0.03, 1.0, 0.52); // Оранжевый
      colors[(i + baseCount) * 3] = colorMix.r;
      colors[(i + baseCount) * 3 + 1] = colorMix.g;
      colors[(i + baseCount) * 3 + 2] = colorMix.b;

      // g = 2 (Хвост 2)
      colorMix.setHSL(0.02 + Math.random() * 0.03, 1.0, 0.42); // Оранжево-красный
      colors[(i + baseCount * 2) * 3] = colorMix.r;
      colors[(i + baseCount * 2) * 3 + 1] = colorMix.g;
      colors[(i + baseCount * 2) * 3 + 2] = colorMix.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Создаем искристую золотую текстуру
    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = 32;
    textureCanvas.height = 32;
    const textureContext = textureCanvas.getContext('2d');

    if (!textureContext) {
      return;
    }

    const gradient = textureContext.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');       // Белое ядро искры
    gradient.addColorStop(0.25, 'rgba(255,215,0,1)');      // Чистое золото
    gradient.addColorStop(0.6, 'rgba(255,115,0,0.5)');     // Мягкая оранжевая корона
    gradient.addColorStop(1, 'rgba(255,115,0,0)');
    textureContext.fillStyle = gradient;
    textureContext.fillRect(0, 0, 32, 32);
    const texture = new THREE.CanvasTexture(textureCanvas);

    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        size: 0.68,
        map: texture,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    scene.add(particles);

    // Добавляем экваториальные золотые волны
    const wavesGroup = new THREE.Group();
    const waveMaterial = new THREE.MeshBasicMaterial({
      color: '#ffa200',
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const waveGeometry = new THREE.TorusGeometry(1, 0.035, 8, 64);
    const waveMeshes: THREE.Mesh[] = [];

    for (let i = 0; i < 3; i++) {
      const wave = new THREE.Mesh(waveGeometry, waveMaterial.clone());
      wave.rotation.x = Math.PI / 2; // Горизонтально
      wavesGroup.add(wave);
      waveMeshes.push(wave);
    }
    scene.add(wavesGroup);

    // Золотое ядро
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(4.2, 32, 32),
      new THREE.MeshBasicMaterial({ color: '#ffb300', transparent: true, opacity: 0.14 })
    );
    scene.add(core);

    // Золотой источник света
    const glowLight = new THREE.PointLight('#ffa200', 16, 120);
    glowLight.position.set(0, 0, 10);
    scene.add(glowLight);

    const ambient = new THREE.AmbientLight('#ffea9f', 0.45);
    scene.add(ambient);

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    let frameId = 0;

    const onMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
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

      currentX += (mouseX - currentX) * 0.04;
      currentY += (mouseY - currentY) * 0.04;

      const posAttr = particleGeometry.getAttribute('position') as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      // Рассчитываем позиции для основы и хвостов с отставанием во времени
      for (let i = 0; i < baseCount; i += 1) {
        const dir = initialDirs[i];

        for (let g = 0; g < 3; g += 1) {
          const idx = i + g * baseCount;
          // Время для конкретного сегмента хвоста (основа идет в реальном времени, хвосты отстают)
          const t = elapsed - g * 0.055;

          // Радиальное колебание ("дыхание" сферы)
          const waveValue = Math.sin(dir.r * 1.8 - t * 4.5) * 0.65;
          const currentR = dir.r + waveValue;

          const rx = dir.x * currentR;
          const ry = dir.y * currentR;
          const rz = dir.z * currentR;

          // Индивидуальное вращение для создания закручивающихся хвостов
          const rotY = t * 0.08;
          const rotX = t * 0.03;

          // Вращение по оси Y
          const x1 = rx * Math.cos(rotY) - rz * Math.sin(rotY);
          const z1 = rx * Math.sin(rotY) + rz * Math.cos(rotY);

          // Вращение по оси X
          const y2 = ry * Math.cos(rotX) - z1 * Math.sin(rotX);
          const z2 = ry * Math.sin(rotX) + z1 * Math.cos(rotX);

          posArray[idx * 3] = x1;
          posArray[idx * 3 + 1] = y2;
          posArray[idx * 3 + 2] = z2;
        }
      }
      posAttr.needsUpdate = true;

      // Анимируем золотые волны
      waveMeshes.forEach((wave, i) => {
        const progress = (elapsed * 0.35 + i / 3) % 1.0;
        const currentScale = 1 + progress * 20;
        wave.scale.setScalar(currentScale);

        let opacity = 0;
        if (progress < 0.15) {
          opacity = (progress / 0.15) * 0.28;
        } else {
          opacity = (1 - (progress - 0.15) / 0.85) * 0.28;
        }
        (wave.material as THREE.MeshBasicMaterial).opacity = opacity;
      });

      // Перемещение сферы за мышью
      particles.position.x = currentX * 1.6;
      particles.position.y = -currentY * 1.2;
      core.position.copy(particles.position);

      core.scale.setScalar(1 + Math.sin(elapsed * 1.2) * 0.04);
      glowLight.intensity = 14 + Math.sin(elapsed * 1.4) * 1.5;

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
      wavesGroup.children.forEach((child) => {
        const mesh = child as THREE.Mesh;
        const material = mesh.material as THREE.Material;
        material.dispose();
      });
      waveGeometry.dispose();
      core.geometry.dispose();
      (core.material as THREE.Material).dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[380px] lg:min-h-[550px] overflow-hidden">
      <div ref={containerRef} className="absolute inset-0" />
    </div>
  );
}
