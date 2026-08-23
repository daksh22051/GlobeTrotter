import React from 'react';
import {
  Sparkles,
  TrendingDown,
  AlertTriangle,
  Info,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';
import { BudgetInsight } from '../../types/budget';

interface SmartInsightsSectionProps {
  insights: BudgetInsight[];
}

export const SmartInsightsSection: React.FC<SmartInsightsSectionProps> = ({
  insights,
}) => {
  if (insights.length === 0) return null;

  return (
    <div className="w-full bg-[#FFFDF8] rounded-3xl p-6 sm:p-8 border border-[#FFE0D6] shadow-xs relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#FFF2EE] to-transparent rounded-full -mr-16 -mt-16 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF2EE] border border-[#FFE0D6] flex items-center justify-center text-[#FF6B4A] shadow-2xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#17201D] tracking-tight">
              Smart spending insights ✨
            </h3>
            <p className="text-xs text-[#68736F]">
              Live analytical observations generated from your real journey data
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-[#FF6B4A] text-xs font-bold border border-[#FFE0D6]">
          {insights.length} Active Insights
        </span>
      </div>

      {/* Insights Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 relative z-10">
        {insights.map((insight) => {
          let badgeBg = 'bg-[#FFF2EE] text-[#FF6B4A] border-[#FFE0D6]';
          let icon = <Sparkles className="w-4 h-4 text-[#FF6B4A]" />;

          if (insight.type === 'positive') {
            badgeBg = 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]';
            icon = <CheckCircle2 className="w-4 h-4 text-[#065F46]" />;
          } else if (insight.type === 'warning') {
            badgeBg = 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]';
            icon = <AlertTriangle className="w-4 h-4 text-[#991B1B]" />;
          } else if (insight.type === 'tip') {
            badgeBg = 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]';
            icon = <Lightbulb className="w-4 h-4 text-[#92400E]" />;
          } else {
            badgeBg = 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]';
            icon = <Info className="w-4 h-4 text-[#1E40AF]" />;
          }

          return (
            <div
              key={insight.id}
              className="p-4 rounded-2xl bg-white border border-[#EAE6DD] shadow-2xs hover:border-[#FF6B4A]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    {icon}
                    <h4 className="text-xs font-black text-[#17201D]">
                      {insight.title}
                    </h4>
                  </div>

                  {insight.metric && (
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${badgeBg}`}
                    >
                      {insight.metric}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#5E6B67] leading-relaxed">
                  {insight.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
