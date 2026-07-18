'use client';

import { Sparkles } from 'lucide-react';

export interface SkillFormulaCardSkill {
  code: string;
  nameRu: string;
  evidence: string;
}

export interface SkillFormulaCardProps {
  skills: SkillFormulaCardSkill[];
  applications: string[];
}

/**
 * Презентационный компонент "Твоя формула успеха: A + B + C" — три бейджа с
 * переносимыми компетенциями подростка (см. `app/lib/profile/skillFormula.ts`)
 * и список сфер, куда эта комбинация переносится.
 *
 * Чисто визуальный компонент: не делает запросов и не встроен ни в одну
 * страницу — интеграция в `app/report/page.tsx` выполняется отдельно.
 */
export default function SkillFormulaCard({ skills, applications }: SkillFormulaCardProps) {
  if (!skills || skills.length === 0) return null;

  return (
    <div className="glass-card rounded-[28px] p-8">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="h-5 w-5 text-[#3B82F6] theme-accent-text" />
        <h2 className="text-lg font-bold text-white">Твоя формула успеха</h2>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        {skills.map((skill, idx) => (
          <div key={skill.code} className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#3B82F6]/20 bg-[#3B82F6]/5 px-4 py-2 text-sm font-bold text-white">
              {skill.nameRu}
            </span>
            {idx < skills.length - 1 && (
              <span className="text-lg font-bold text-[#7A8A9E]">+</span>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-2 mb-6">
        {skills.map((skill) => (
          <p key={skill.code} className="text-xs text-[#7A8A9E] leading-relaxed">
            <span className="font-semibold text-white">{skill.nameRu}.</span> {skill.evidence}
          </p>
        ))}
      </div>

      {applications && applications.length > 0 && (
        <div>
          <h4 className="text-xs uppercase tracking-wider font-extrabold text-[#3B82F6] theme-subcard-title mb-2 font-sans">
            Где эта комбинация пригодится
          </h4>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-[#7A8A9E]">
            {applications.map((application, i) => (
              <li key={i}>{application}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
