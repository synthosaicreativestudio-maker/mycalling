import type { ReactNode } from 'react';
import { useState } from 'react';

export function IconTimer() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_0_8px_rgba(140,110,75,0.12)]">
      <defs>
        <linearGradient id="timerGrad" x1="8" y1="8" x2="40" y2="40">
          <stop offset="0%" stopColor="#c2ab87" />
          <stop offset="100%" stopColor="#8c6e4b" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="18" stroke="url(#timerGrad)" strokeWidth="1" strokeDasharray="4 2" />
      <circle cx="24" cy="24" r="14" stroke="url(#timerGrad)" strokeWidth="1.5" />
      <line x1="24" y1="10" x2="24" y2="38" stroke="url(#timerGrad)" strokeWidth="0.5" strokeDasharray="2 2" />
      <line x1="10" y1="24" x2="38" y2="24" stroke="url(#timerGrad)" strokeWidth="0.5" strokeDasharray="2 2" />
      <line x1="24" y1="24" x2="24" y2="15" stroke="#8c6e4b" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="24" y1="24" x2="32" y2="20" stroke="#c2ab87" strokeWidth="1" strokeLinecap="round" />
      <circle cx="24" cy="24" r="2.5" fill="#c2ab87" stroke="#ffffff" strokeWidth="1" />
    </svg>
  );
}

export function IconScience() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_0_8px_rgba(140,110,75,0.14)]">
      <defs>
        <linearGradient id="sciGrad" x1="8" y1="8" x2="40" y2="40">
          <stop offset="0%" stopColor="#ecdcc3" />
          <stop offset="100%" stopColor="#8c6e4b" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="18" r="12" stroke="url(#sciGrad)" strokeWidth="1.2" />
      <circle cx="17" cy="30" r="12" stroke="url(#sciGrad)" strokeWidth="1.2" />
      <circle cx="31" cy="30" r="12" stroke="url(#sciGrad)" strokeWidth="1.2" />
      <circle cx="24" cy="26" r="3" fill="#ecdcc3" opacity="0.32" />
      <circle cx="24" cy="26" r="1" fill="#8c6e4b" />
    </svg>
  );
}

export function IconReport() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_0_8px_rgba(140,110,75,0.12)]">
      <defs>
        <linearGradient id="repGrad" x1="12" y1="12" x2="36" y2="36">
          <stop offset="0%" stopColor="#c2ab87" />
          <stop offset="50%" stopColor="#ecdcc3" />
          <stop offset="100%" stopColor="#8c6e4b" />
        </linearGradient>
      </defs>
      <path d="M24 8L38 18V32L24 42L10 32V18L24 8Z" stroke="url(#repGrad)" strokeWidth="1.2" strokeDasharray="3 2" />
      <line x1="24" y1="8" x2="24" y2="24" stroke="url(#repGrad)" strokeWidth="0.8" />
      <line x1="38" y1="18" x2="24" y2="24" stroke="url(#repGrad)" strokeWidth="0.8" />
      <line x1="38" y1="32" x2="24" y2="24" stroke="url(#repGrad)" strokeWidth="0.8" />
      <line x1="24" y1="42" x2="24" y2="24" stroke="url(#repGrad)" strokeWidth="0.8" />
      <line x1="10" y1="32" x2="24" y2="24" stroke="url(#repGrad)" strokeWidth="0.8" />
      <line x1="10" y1="18" x2="24" y2="24" stroke="url(#repGrad)" strokeWidth="0.8" />
      <circle cx="24" cy="8" r="2" fill="#c2ab87" />
      <circle cx="38" cy="18" r="2" fill="#8c6e4b" />
      <circle cx="38" cy="32" r="2" fill="#ecdcc3" />
      <circle cx="24" cy="42" r="2" fill="#8c6e4b" />
      <circle cx="10" cy="32" r="2" fill="#ecdcc3" />
      <circle cx="10" cy="18" r="2" fill="#8c6e4b" />
      <circle cx="24" cy="24" r="3" fill="#ffffff" stroke="#8c6e4b" strokeWidth="1" />
    </svg>
  );
}

export function UspCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="glass-card rounded-[22px] p-8 text-center space-y-5 group border border-white/60 bg-white/40">
      <div className="flex justify-center transition-transform duration-500 group-hover:scale-110">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-[#3d3123] font-sans">{title}</h3>
      <p className="text-sm text-[#736251] leading-relaxed font-sans">{text}</p>
    </div>
  );
}

export function ForWhomCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="glass-card rounded-[22px] p-6 space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-white/60 border border-white/80 flex items-center justify-center shadow-sm">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-[#3d3123] font-sans">{title}</h3>
      <p className="text-sm text-[#736251] leading-relaxed font-sans">{text}</p>
    </div>
  );
}

export function TrustCard({ number, label, desc }: { number: string; label: string; desc: string }) {
  return (
    <div className="glass-card rounded-[22px] p-6 text-center space-y-3">
      <div className="text-4xl font-extrabold text-[#8c6e4b] font-sans">{number}</div>
      <div className="text-sm font-bold uppercase tracking-wider text-[#b09e86]">{label}</div>
      <p className="text-sm text-[#736251] leading-relaxed font-sans">{desc}</p>
    </div>
  );
}

export function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="glass-card rounded-[18px] overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <span className="text-sm font-semibold text-[#3d3123] pr-4">{question}</span>
        <span
          className={`text-[#8c6e4b] text-xl font-light flex-shrink-0 transition-transform ${isOpen ? "rotate-45" : ""}`}
        >
          +
        </span>
      </button>
      <div
        className={`overflow-hidden ${isOpen ? "block" : "hidden"}`}
      >
        <p className="px-5 pb-5 text-sm text-[#736251] leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
}

export function ReviewCard({ author, text }: { author: string; text: string }) {
  return (
    <div className="glass-card rounded-[22px] p-6 space-y-4">
      <div className="flex text-[#c2ab87]">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        ))}
      </div>
      <p className="text-[#736251] text-sm leading-relaxed italic">«{text}»</p>
      <div className="font-bold text-[#3d3123] text-sm pt-2 border-t border-[#e2e8f0]/50">{author}</div>
    </div>
  );
}
