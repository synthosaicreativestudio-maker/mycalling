import React from 'react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07090e]/85 backdrop-blur-md">
      <div className="flex flex-col items-center gap-5">
        {/* Премиальный спиннер */}
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute h-full w-full rounded-full border-2 border-[#3B82F6]/10"></div>
          <div className="absolute h-full w-full rounded-full border-t-2 border-[var(--accent-brown)] animate-spin"></div>
          <div className="h-8 w-8 rounded-full bg-white/5 animate-pulse"></div>
        </div>
        
        {/* Текстовый индикатор */}
        <div className="flex items-center gap-0.5 select-none font-sans text-[13px] tracking-[0.1em] uppercase text-gray-400">
          <span className="font-extrabold text-[var(--accent-brown)]">МОЁ</span>
          <span className="font-light text-white">ПРИЗВАНИЕ</span>
        </div>
      </div>
    </div>
  );
}
