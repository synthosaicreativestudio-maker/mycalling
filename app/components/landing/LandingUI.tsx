import type { ReactNode } from 'react';
import { useState } from 'react';

export function IconTimer() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_0_8px_var(--accent-svg-shadow)]">
      <defs>
        <linearGradient id="timerGrad" x1="8" y1="8" x2="40" y2="40">
          <stop offset="0%" stopColor="var(--accent-svg-1)" />
          <stop offset="100%" stopColor="var(--accent-svg-2)" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="18" stroke="url(#timerGrad)" strokeWidth="1" strokeDasharray="4 2" />
      <circle cx="24" cy="24" r="14" stroke="url(#timerGrad)" strokeWidth="1.5" />
      <line x1="24" y1="10" x2="24" y2="38" stroke="url(#timerGrad)" strokeWidth="0.5" strokeDasharray="2 2" />
      <line x1="10" y1="24" x2="38" y2="24" stroke="url(#timerGrad)" strokeWidth="0.5" strokeDasharray="2 2" />
      <line x1="24" y1="24" x2="24" y2="15" stroke="var(--accent-svg-2)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="24" y1="24" x2="32" y2="20" stroke="var(--accent-svg-1)" strokeWidth="1" strokeLinecap="round" />
      <circle cx="24" cy="24" r="2.5" fill="var(--accent-svg-1)" stroke="var(--bg-deep)" strokeWidth="1" />
    </svg>
  );
}

export function IconScience() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_0_8px_var(--accent-svg-shadow)]">
      <defs>
        <linearGradient id="sciGrad" x1="8" y1="8" x2="40" y2="40">
          <stop offset="0%" stopColor="var(--accent-svg-3)" />
          <stop offset="100%" stopColor="var(--accent-svg-2)" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="18" r="12" stroke="url(#sciGrad)" strokeWidth="1.2" />
      <circle cx="17" cy="30" r="12" stroke="url(#sciGrad)" strokeWidth="1.2" />
      <circle cx="31" cy="30" r="12" stroke="url(#sciGrad)" strokeWidth="1.2" />
      <circle cx="24" cy="26" r="3" fill="var(--accent-svg-3)" opacity="0.32" />
      <circle cx="24" cy="26" r="1" fill="var(--accent-svg-2)" />
    </svg>
  );
}

export function IconReport() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_0_8px_var(--accent-svg-shadow)]">
      <defs>
        <linearGradient id="repGrad" x1="12" y1="12" x2="36" y2="36">
          <stop offset="0%" stopColor="var(--accent-svg-1)" />
          <stop offset="50%" stopColor="var(--accent-svg-3)" />
          <stop offset="100%" stopColor="var(--accent-svg-2)" />
        </linearGradient>
      </defs>
      <path d="M24 8L38 18V32L24 42L10 32V18L24 8Z" stroke="url(#repGrad)" strokeWidth="1.2" strokeDasharray="3 2" />
      <line x1="24" y1="8" x2="24" y2="24" stroke="url(#repGrad)" strokeWidth="0.8" />
      <line x1="38" y1="18" x2="24" y2="24" stroke="url(#repGrad)" strokeWidth="0.8" />
      <line x1="38" y1="32" x2="24" y2="24" stroke="url(#repGrad)" strokeWidth="0.8" />
      <line x1="24" y1="42" x2="24" y2="24" stroke="url(#repGrad)" strokeWidth="0.8" />
      <line x1="10" y1="32" x2="24" y2="24" stroke="url(#repGrad)" strokeWidth="0.8" />
      <line x1="10" y1="18" x2="24" y2="24" stroke="url(#repGrad)" strokeWidth="0.8" />
      <circle cx="24" cy="8" r="2" fill="var(--accent-svg-1)" />
      <circle cx="38" cy="18" r="2" fill="var(--accent-svg-2)" />
      <circle cx="38" cy="32" r="2" fill="var(--accent-svg-3)" />
      <circle cx="24" cy="42" r="2" fill="var(--accent-svg-2)" />
      <circle cx="10" cy="32" r="2" fill="var(--accent-svg-3)" />
      <circle cx="10" cy="18" r="2" fill="var(--accent-svg-2)" />
      <circle cx="24" cy="24" r="3" fill="var(--bg-deep)" stroke="var(--accent-svg-2)" strokeWidth="1" />
    </svg>
  );
}

export function UspCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="glass-card rounded-[22px] p-8 text-center flex flex-col h-full group">
      <div className="flex justify-center mb-5 transition-transform duration-500 group-hover:scale-110">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white font-sans mb-3">{title}</h3>
      <p className="text-sm text-[var(--text-muted)] leading-relaxed font-sans flex-grow">{text}</p>
    </div>
  );
}

export function ForWhomCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="glass-card rounded-[22px] p-6 flex flex-col h-full space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-[#1E3A5F]/20 border border-[#3B82F6]/20 flex items-center justify-center shadow-sm shrink-0">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white font-sans">{title}</h3>
      <p className="text-sm text-[var(--text-muted)] leading-relaxed font-sans flex-grow">{text}</p>
    </div>
  );
}

export function TrustCard({ number, label, desc }: { number: string; label: string; desc: string }) {
  return (
    <div className="glass-card rounded-[22px] p-6 text-center flex flex-col h-full space-y-3">
      <div className="text-4xl font-extrabold text-[var(--accent-brown)] font-sans">{number}</div>
      <div className="text-sm font-bold uppercase tracking-wider text-[#60A5FA]">{label}</div>
      <p className="text-sm text-[var(--text-muted)] leading-relaxed font-sans flex-grow">{desc}</p>
    </div>
  );
}

export function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="glass-card rounded-[18px] overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <span className="text-sm font-semibold text-white pr-4">{question}</span>
        <span
          className={`text-[var(--accent-brown)] text-xl font-light flex-shrink-0 transition-transform ${isOpen ? "rotate-45" : ""}`}
        >
          +
        </span>
      </button>
      <div className={`overflow-hidden ${isOpen ? "block" : "hidden"}`}>
        <p className="px-5 pb-5 text-sm text-[var(--text-muted)] leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
}

export function ReviewCard({ author, text }: { author: string; text: string }) {
  return (
    <div className="glass-card rounded-[22px] p-6 flex flex-col h-full space-y-4">
      <div className="flex text-[#60A5FA] shrink-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        ))}
      </div>
      <p className="text-[var(--text-muted)] text-sm leading-relaxed italic flex-grow">«{text}»</p>
      <div className="font-bold text-white text-sm pt-2 border-t border-white/10 shrink-0">{author}</div>
    </div>
  );
}
