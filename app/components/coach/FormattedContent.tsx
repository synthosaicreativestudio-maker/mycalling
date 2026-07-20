import React from 'react';

interface FormattedContentProps {
  content: string;
}

export const parseInlineElements = (text: string) => {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, idx) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          const clean = part.slice(1, -1);
          return (
            <span 
              key={idx} 
              className="inline-block px-2 py-0.5 mx-0.5 rounded bg-[var(--accent-wash-10)] text-[var(--accent-sky)] font-sans text-xs border border-[var(--accent-wash-25)] font-bold shadow-[0_0_10px_rgba(59,130,246,0.1)]"
            >
              {clean}
            </span>
          );
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          const clean = part.slice(2, -2);
          return (
            <strong key={idx} className="font-extrabold text-white">
              {clean}
            </strong>
          );
        }
        return part;
      })}
    </>
  );
};

export default function FormattedContent({ content }: FormattedContentProps) {
  // 1. Нормализуем слипшиеся списки профессий (1. `Генетик`)
  let processed = content.replace(/(\d+\.\s+`[^`]+`)/g, '\n$1');
  // 2. Нормализуем слипшиеся шаги плана (1) или `1)`)
  processed = processed.replace(/(?:`?(\d+)\)`?\s*)/g, '\n$1) ');
  // 3. Убираем дублирующиеся переносы строк
  processed = processed.replace(/\n\s*\n/g, '\n');

  const lines = processed.split('\n').filter(line => line.trim() !== '');

  // Проверим, содержит ли сообщение шаги плана, чтобы визуализировать их в виде Roadmap
  const hasRoadmapSteps = lines.some(line => line.match(/^\d+\)\s+/));

  if (hasRoadmapSteps) {
    return (
      <div className="space-y-4 my-2">
        {lines.map((line, i) => {
          const stepMatch = line.match(/^\s*(\d+)\)\s+(.*)/);
          if (stepMatch) {
            const num = stepMatch[1];
            const rest = stepMatch[2];
            return (
              <div key={i} className="flex gap-4 items-stretch">
                {/* Левая колонка: кружок с номером шага и светящаяся линия-коннектор */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="h-6 w-6 rounded-full bg-[#C4A484]/15 border border-[#C4A484]/30 text-[#C4A484] flex items-center justify-center text-xs font-bold shadow-[0_0_10px_rgba(196,164,132,0.15)] z-10 shrink-0">
                    {num}
                  </div>
                  {i < lines.length - 1 && (
                    <div className="w-[1.5px] flex-1 bg-gradient-to-b from-[#C4A484]/30 to-[#C4A484]/5 my-1" />
                  )}
                </div>
                {/* Правая колонка: карточка шага */}
                <div className="flex-1 p-3.5 rounded-2xl bg-gradient-to-r from-white/[0.03] to-transparent border border-white/5 shadow-inner transition hover:from-white/[0.05]">
                  <div className="text-sm text-[var(--text-primary)] leading-relaxed">
                    {parseInlineElements(rest)}
                  </div>
                </div>
              </div>
            );
          }

          // Рендерим обычные вводные или итоговые строки внутри плана
          return (
            <p key={i} className="text-sm text-[var(--text-primary)] leading-relaxed pl-1">
              {parseInlineElements(line)}
            </p>
          );
        })}
      </div>
    );
  }

  // Стандартный рендеринг списков профессий или простого текста
  return (
    <div className="space-y-2.5">
      {lines.map((line, i) => {
        const listMatch = line.match(/^(\d+)\.\s+(.*)/);
        if (listMatch) {
          const num = listMatch[1];
          const rest = listMatch[2];
          return (
            <div key={i} className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 shadow-inner my-1 transition hover:bg-white/[0.04]">
              <div className="h-6 w-6 rounded-full bg-[var(--accent-wash-10)] border border-[var(--accent-wash-20)] text-[var(--accent-brown)] flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5">
                 {num}
              </div>
              <div className="text-sm text-[var(--text-primary)] leading-relaxed flex-1">
                {parseInlineElements(rest)}
              </div>
            </div>
          );
        }
        return (
          <p key={i} className="text-sm text-[var(--text-primary)] leading-relaxed">
            {parseInlineElements(line)}
          </p>
        );
      })}
    </div>
  );
}
