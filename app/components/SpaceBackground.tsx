'use client';

import { useEffect, useState } from 'react';

export function SpaceBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="fixed inset-0 -z-50 bg-[#fdfcfb]" />;
  }

  return (
    <div className="fixed inset-0 -z-50 h-full w-full overflow-hidden bg-[#fdfcfb] print:hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-30"
        style={{ backgroundImage: 'url(/assets/backgrounds/light-bg4.webp)' }}
      />
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(255,255,255,0.7)_0%,transparent_60%)] blur-[40px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_72%,rgba(215,189,121,0.045)_0%,transparent_52%)] blur-[54px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_48%,rgba(233,185,189,0.04)_0%,transparent_44%)] blur-[46px] pointer-events-none" />
    </div>
  );
}
