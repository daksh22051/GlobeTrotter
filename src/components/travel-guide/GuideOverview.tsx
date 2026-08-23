import React from 'react';
import { Sparkles, Info, Compass, ShieldCheck, Heart, Lightbulb } from 'lucide-react';
import { GuideQuickFact } from '../../types/travelGuide';

interface GuideOverviewProps {
  quickFacts: GuideQuickFact[];
  travelNotes: string[];
  destination: string;
}

export const GuideOverview: React.FC<GuideOverviewProps> = ({
  quickFacts,
  travelNotes,
  destination,
}) => {
  return (
    <div className="space-y-6">
      {/* Quick Facts Matrix */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-[#17201D] tracking-tight mb-4">
          Trip Snapshot & Quick Facts
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickFacts.map((fact, idx) => (
            <div
              key={idx}
              className="p-4 rounded-3xl bg-white border border-[#EAE6DD] shadow-2xs space-y-1"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#838F8B]">
                {fact.label}
              </span>
              <p className="text-xs sm:text-sm font-extrabold text-[#17201D] truncate" title={fact.value}>
                {fact.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Editorial Overview / Travel Notes */}
      {travelNotes.length > 0 && (
        <div className="bg-gradient-to-tr from-[#FCFBF8] to-[#FFF9F0] rounded-3xl border border-[#FFE7C2] p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-[#E08A00]">
            <Lightbulb className="w-5 h-5" />
            <h3 className="text-sm sm:text-base font-black text-[#17201D] tracking-tight">
              Curator's Notes & Advice for {destination}
            </h3>
          </div>
          <div className="space-y-2.5">
            {travelNotes.map((note, idx) => (
              <p key={idx} className="text-xs sm:text-sm text-[#5E6B67] leading-relaxed">
                {note}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
