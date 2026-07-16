import React from 'react';
import { Compass } from 'lucide-react';

interface RpgProfessionCardProps {
  name: string;
  score: number;
  why: string;
}

export default function RpgProfessionCard({ name, score, why }: RpgProfessionCardProps) {
  const lowerName = name.toLowerCase();
  
  let analytic = 50;
  let creative = 50;
  let practical = 50;

  if (lowerName.includes('аналити') || lowerName.includes('програм') || lowerName.includes('инженер') || lowerName.includes('разработ')) {
    analytic = 85;
    practical = 70;
    creative = 45;
  } else if (lowerName.includes('дизайн') || lowerName.includes('арт') || lowerName.includes('худож') || lowerName.includes('creativ') || lowerName.includes('креатив') || lowerName.includes('писатель') || lowerName.includes('редактор')) {
    creative = 90;
    analytic = 40;
    practical = 55;
  } else if (lowerName.includes('консульт') || lowerName.includes('менеджер') || lowerName.includes('управлен') || lowerName.includes('лидер') || lowerName.includes('бизнес') || lowerName.includes('стартап')) {
    practical = 80;
    creative = 65;
    analytic = 60;
  }

  return (
    <div className="relative group overflow-hidden rounded-[24px] border border-white/5 bg-[#080C14]/40 p-5 space-y-4 hover:border-[#3B82F6]/30 hover:bg-[#3B82F6]/5 hover:shadow-[0_8px_30px_rgba(59,130,246,0.03)] transition-all duration-300 text-left">
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#3B82F6]/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none" />
      
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6] group-hover:scale-105 group-hover:bg-[#3B82F6] group-hover:text-white transition duration-300 shadow-inner">
          <Compass className="h-5.5 w-5.5" />
        </div>

        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-extrabold text-white text-xs md:text-sm truncate leading-snug font-sans group-hover:text-[#3B82F6] transition">
              {name}
            </h3>
            <span className="shrink-0 text-[9px] font-black px-2 py-0.5 bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20 rounded-full font-sans tracking-wide">
              {score}%
            </span>
          </div>
          <p className="text-[10px] text-[#7A8A9E] leading-relaxed line-clamp-3">
            {why}
          </p>
        </div>
      </div>

      <div className="border-t border-white/5 pt-3.5 space-y-2">
        <span className="text-[8px] uppercase tracking-widest font-extrabold text-[#7A8A9E] block mb-1 font-sans">RPG Характеристики</span>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[9px] font-bold text-white/70">
            <span>Аналитический склад</span>
            <span>{analytic}/100</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${analytic}%` }} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-[9px] font-bold text-white/70">
            <span>Креативный потенциал</span>
            <span>{creative}/100</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-pink-500 rounded-full transition-all duration-1000" style={{ width: `${creative}%` }} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-[9px] font-bold text-white/70">
            <span>Практические навыки</span>
            <span>{practical}/100</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: `${practical}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
