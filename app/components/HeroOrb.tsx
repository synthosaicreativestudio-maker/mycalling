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

    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 1400;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const colorA = new THREE.Color('#7c8cff');
    const colorB = new THREE.Color('#78d4ff');
    const colorMix = new THREE.Color();

    for (let i = 0; i < particleCount; i += 1) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * Math.PI * 2;
      const phi = Math.acos(2 * v - 1);
      const radius = 12 + Math.random() * 4;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      colorMix.lerpColors(colorA, colorB, Math.random());
      colors[i * 3] = colorMix.r;
      colors[i * 3 + 1] = colorMix.g;
      colors[i * 3 + 2] = colorMix.b;
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
    gradient.addColorStop(0.4, 'rgba(210,220,255,0.9)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    textureContext.fillStyle = gradient;
    textureContext.fillRect(0, 0, 32, 32);
    const texture = new THREE.CanvasTexture(textureCanvas);

    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        size: 0.55,
        map: texture,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    scene.add(particles);

    const orbitGroup = new THREE.Group();
    const orbitMaterial = new THREE.MeshBasicMaterial({
      color: '#9bb2ff',
      transparent: true,
      opacity: 0.22,
      wireframe: true
    });

    [11, 14.5, 17.5].forEach((radiusValue, index) => {
      const orbit = new THREE.Mesh(new THREE.TorusGeometry(radiusValue, 0.08, 12, 180), orbitMaterial.clone());
      orbit.rotation.x = index * 0.75 + 0.35;
      orbit.rotation.y = index * 0.55 + 0.2;
      orbitGroup.add(orbit);
    });

    scene.add(orbitGroup);

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(4.4, 32, 32),
      new THREE.MeshBasicMaterial({ color: '#94a7ff', transparent: true, opacity: 0.12 })
    );
    scene.add(core);

    const glowLight = new THREE.PointLight('#7c8cff', 14, 120);
    glowLight.position.set(0, 0, 10);
    scene.add(glowLight);

    const ambient = new THREE.AmbientLight('#93a6ff', 0.6);
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

      particles.rotation.y = elapsed * 0.08;
      particles.rotation.x = elapsed * 0.03;
      particles.position.x = currentX * 1.6;
      particles.position.y = -currentY * 1.2;

      orbitGroup.rotation.y = elapsed * 0.15;
      orbitGroup.rotation.x = elapsed * 0.04 + currentY * 0.12;
      orbitGroup.rotation.z = currentX * 0.08;

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
      orbitGroup.children.forEach((child) => {
        const mesh = child as THREE.Mesh;
        mesh.geometry.dispose();
        const material = mesh.material as THREE.Material;
        material.dispose();
      });
      core.geometry.dispose();
      (core.material as THREE.Material).dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="relative h-[360px] w-full overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(124,140,255,0.16),transparent_55%)] sm:h-[420px] lg:h-full lg:min-h-[520px]">
      <div ref={containerRef} className="absolute inset-0" />
      <div className="absolute inset-x-6 bottom-6 rounded-[24px] border border-white/10 bg-[#0b1125]/45 p-4 backdrop-blur-md">
        <p className="text-xs uppercase tracking-[0.22em] text-accentSoft">3D visual layer</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          Мягкая световая сфера символизирует многослойный профиль ученика: способности, интересы, поведение,
          личностные паттерны и мотивацию.
        </p>
      </div>
    </div>
  );
}
