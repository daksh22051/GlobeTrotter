import React from 'react';
import { Lightbulb, CheckCircle2 } from 'lucide-react';
import { AIInsightData } from '../../types/recommendation';

interface AIInsightCardProps {
  insight: AIInsightData;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({ insight }) => {
  return (
    <div className="w-full bg-gradient-to-br from-[#17201D] via-[#1E2825] to-[#141C1A] text-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#2A3733] mb-8 select-none relative overflow-hidden">
      {/* Decorative Subtle Background Element */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6B4A]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#20B8A6]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
        {/* Left Narrative Column */}
        <div className="flex-1 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#FF8E72] text-xs font-bold backdrop-blur-md">
            <span>GlobeTrotter's AI Insight</span>
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
            "{insight.highlight}"
          </h3>

          <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-2xl">
            {insight.description}
          </p>
        </div>

        {/* Right Advice Bullets */}
        {insight.adviceList && insight.adviceList.length > 0 && (
          <div className="w-full md:w-80 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-2.5 shrink-0">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#20B8A6]">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Smart Recommendation</span>
            </div>

            <div className="space-y-2">
              {insight.adviceList.map((advice, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-white/90 leading-snug">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#20B8A6] shrink-0 mt-0.5" />
                  <span>{advice}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
