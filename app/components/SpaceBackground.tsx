'use client';

import { useEffect, useState } from 'react';

export function SpaceBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="fixed inset-0 -z-50 bg-[#050816]" />;
  }

  return (
    <div className="fixed inset-0 -z-50 h-full w-full overflow-hidden bg-[#050816] print:hidden">
      {/* Статический слой звездного неба */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-screen pointer-events-none select-none" 
        style={{ backgroundImage: "url('/assets/backgrounds/space-bg-static.png')" }} 
      />

      {/* Глубокие фоновые неоновые туманности и аврора */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,#0e1533_0%,#050816_70%)] opacity-75" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(124,140,255,0.14)_0%,transparent_50%),radial-gradient(circle_at_78%_24%,rgba(92,214,255,0.1)_0%,transparent_40%),radial-gradient(circle_at_62%_78%,rgba(144,98,255,0.1)_0%,transparent_50%)] blur-[40px]" />

      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 900"
      >
        <defs>
          <radialGradient id="auroraGlow" cx="30%" cy="30%" r="60%">
            <stop offset="0%" stop-color="#3c4eb8" stop-opacity="0.45" />
            <stop offset="40%" stop-color="#24317a" stop-opacity="0.2" />
            <stop offset="100%" stop-color="#050816" stop-opacity="0" />
          </radialGradient>

          <linearGradient id="bgOrbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#7c8cff" stop-opacity="0.25" />
            <stop offset="50%" stop-color="#a8b3ff" stop-opacity="0.1" />
            <stop offset="100%" stop-color="#7c8cff" stop-opacity="0.02" />
          </linearGradient>

          <filter id="pointGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="starGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="10" result="blur1" />
            <feGaussianBlur stdDeviation="3" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          <path id="pathOrbit1" d="M 900,680 A 250,110 0 1,0 1400,680 A 250,110 0 1,0 900,680" fill="none" />
          <path id="pathOrbit2" d="M 850,680 A 300,160 -15 1,0 1450,680 A 300,160 -15 1,0 850,680" fill="none" />
          <path id="pathOrbit3" d="M 770,680 A 380,240 25 1,0 1530,680 A 380,240 25 1,0 770,680" fill="none" />
        </defs>

        <circle cx="150" cy="150" r="450" fill="url(#auroraGlow)">
          <animate 
            attributeName="opacity" 
            values="0.6; 0.95; 0.6" 
            dur="10s" 
            repeatCount="indefinite" />
          <animateTransform
            attributeName="transform"
            type="scale"
            values="0.9; 1.1; 0.9"
            transform-origin="150 150"
            dur="12s"
            repeatCount="indefinite" />
        </circle>

        <g opacity="0.3">
          <circle cx="300" cy="200" r="1" fill="#fff" />
          <circle cx="750" cy="150" r="1.2" fill="#7c8cff" />
          <circle cx="500" cy="400" r="1" fill="#fff" />
          <circle cx="200" cy="600" r="1.5" fill="#a8b3ff" />
          <circle cx="650" cy="700" r="1" fill="#fff" />
          <circle cx="950" cy="250" r="1.2" fill="#fff" />
        </g>

        <g transform="translate(0, 0)">
          
          <ellipse cx="1150" cy="680" rx="250" ry="110" fill="none" stroke="url(#bgOrbitGrad)" stroke-width="1.5" />
          
          <ellipse cx="1150" cy="680" rx="300" ry="160" fill="none" stroke="url(#bgOrbitGrad)" stroke-width="1.2" transform="rotate(-15 1150 680)" />
          
          <ellipse cx="1150" cy="680" rx="380" ry="240" fill="none" stroke="url(#bgOrbitGrad)" stroke-width="1" stroke-dasharray="4 8" transform="rotate(25 1150 680)" opacity="0.7">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="25 1150 680"
              to="385 1150 680"
              dur="120s"
              repeatCount="indefinite" />
          </ellipse>

          <line x1="700" y1="800" x2="1350" y2="450" stroke="#7c8cff" stroke-width="1" opacity="0.3" stroke-dasharray="3 6" />
          <line x1="600" y1="850" x2="1400" y2="400" stroke="#7c8cff" stroke-width="1.2" opacity="0.2" />

          <circle r="4" fill="#a8b3ff" filter="url(#pointGlow)">
            <animateMotion dur="22s" repeatCount="indefinite">
              <mpath href="#pathOrbit1" />
            </animateMotion>
            <animate attributeName="opacity" values="0.7; 1; 0.7" dur="4s" repeatCount="indefinite" />
          </circle>

          <circle r="5" fill="#7c8cff" filter="url(#pointGlow)">
            <animateMotion dur="32s" repeatCount="indefinite" begin="5s">
              <mpath href="#pathOrbit2" />
            </animateMotion>
            <animate attributeName="opacity" values="0.6; 1; 0.6" dur="3s" repeatCount="indefinite" />
          </circle>

          <circle r="3" fill="#ffffff" filter="url(#pointGlow)" opacity="0.8">
            <animateMotion dur="18s" repeatCount="indefinite" begin="2s">
              <mpath href="#pathOrbit3" />
            </animateMotion>
          </circle>

          <g transform="translate(1240, 595)">
            <circle cx="0" cy="0" r="14" fill="#7c8cff" opacity="0.4" filter="url(#starGlow)">
              <animate attributeName="r" values="10; 16; 10" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx="0" cy="0" r="3.5" fill="#ffffff" filter="url(#starGlow)" />
            
            <line x1="-15" y1="0" x2="15" y2="0" stroke="#ffffff" stroke-width="1" opacity="0.9">
              <animate attributeName="opacity" values="0.6; 1; 0.6" dur="2s" repeatCount="indefinite" />
            </line>
            <line x1="0" y1="-15" x2="0" y2="15" stroke="#ffffff" stroke-width="1" opacity="0.9">
              <animate attributeName="opacity" values="0.6; 1; 0.6" dur="2s" repeatCount="indefinite" />
            </line>
          </g>

        </g>
      </svg>
    </div>
  );
}
