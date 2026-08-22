import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Lightbulb, Compass, Zap } from 'lucide-react';
import { UserPreferences } from '../../types/profile';
import { generatePersonalizationSummary } from '../../utils/personalization';

interface AIInsightCardProps {
  preferences: UserPreferences | null;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({ preferences }) => {
  const navigate = useNavigate();

  const effectivePrefs = preferences || {
    interests: ['mountains', 'nature', 'photography'],
    travelStyle: 'balanced',
    travelStylePace: 50,
    budget: 50000,
    budgetStyle: 'balanced',
    currency: 'INR',
    travelCompanion: 'friends',
    travelPersonality: 'explorer',
    isComplete: false,
    updatedAt: new Date().toISOString(),
  };

  const summary = generatePersonalizationSummary(effectivePrefs);

  return (
    <section
      id="ai-insight-card"
      aria-label="GlobeTrotter AI Insight"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1B2724] via-[#1E2E2A] to-[#16221F] text-white p-6 sm:p-8 shadow-md border border-[#2B3E39]"
    >
      {/* Subtle background glow accents */}
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-[#20B8A6]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#FF6B4A]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Side: Insight Text & DNA */}
        <div className="space-y-4 max-w-2xl">
          {/* Header Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#20B8A6]/20 border border-[#20B8A6]/40 text-[#5EEAD4] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Your GlobeTrotter Insight ✨</span>
          </div>

          {/* Core Dynamic Insight Statement */}
          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
              {summary.headline}
            </h3>
            <p className="text-xs sm:text-sm text-[#B4C4BF] leading-relaxed">
              {summary.description}
            </p>
          </div>

          {/* DNA Tag Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-semibold text-[#7E9690]">Preferences:</span>
            {summary.travelDNA.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/10 text-white text-[11px] font-medium backdrop-blur-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right Side: Action Trigger */}
        <div className="shrink-0 flex md:flex-col items-center sm:items-end justify-between gap-3 pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-white/10 md:pl-6">
          <div className="text-left md:text-right hidden sm:block">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#5EEAD4] block">
              Recommendation Engine
            </span>
            <span className="text-xs text-white/80 font-medium block">
              10+ matching spots
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/explore')}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#20B8A6] hover:bg-[#1CA393] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#20B8A6]/20 active:scale-95 transition-all cursor-pointer group whitespace-nowrap"
          >
            <span>Explore recommendations</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};
