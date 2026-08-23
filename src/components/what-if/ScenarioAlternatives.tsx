import React from 'react';
import { WhatIfAlternative } from '../../types/intelligence';
import {
  Bed,
  Plane,
  Train,
  ArrowRight,
  TrendingDown,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { CurrencyCode } from '../../types/profile';

interface ScenarioAlternativesProps {
  alternatives: WhatIfAlternative[];
  currency: CurrencyCode;
}

export const ScenarioAlternatives: React.FC<ScenarioAlternativesProps> = ({
  alternatives,
  currency,
}) => {
  if (alternatives.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE6DD] shadow-2xs space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[#F4F1EA]">
        <div>
          <h3 className="text-sm font-extrabold text-[#17201D] uppercase tracking-wider">
            Optimized Trade-Off Alternatives
          </h3>
          <p className="text-xs text-[#838F8B]">
            Concrete replacement options calculated for this scenario
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {alternatives.map((alt) => (
          <div
            key={alt.id}
            className="p-5 rounded-2xl bg-[#F9F7F1] border border-[#EAE6DD] space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#17201D]">
                {alt.title}
              </span>
              {alt.savings > 0 && (
                <span className="text-xs font-black text-[#1F8A70] bg-[#E8F8F5] px-2.5 py-0.5 rounded-full border border-[#A3E5D8]">
                  Saves {formatCurrency(alt.savings, currency)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              {/* Current */}
              <div className="p-3 rounded-xl bg-white border border-[#EAE6DD] space-y-1">
                <span className="text-[10px] font-bold text-[#838F8B] uppercase tracking-wider block">
                  Current Selection
                </span>
                <span className="text-xs font-bold text-[#17201D] block">
                  {alt.currentChoice.name}
                </span>
                <span className="text-xs text-[#5E6B67] block">
                  {alt.currentChoice.detail}
                </span>
              </div>

              {/* Suggested Alternative */}
              <div className="p-3 rounded-xl bg-[#EAF8F5] border border-[#B2E6DC] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-[#168376] uppercase tracking-wider">
                    Simulated Choice
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#20B8A6]" />
                </div>
                <span className="text-xs font-bold text-[#17201D] block">
                  {alt.suggestedChoice.name}
                </span>
                <span className="text-xs text-[#168376] font-medium block">
                  {alt.suggestedChoice.detail}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#5E6B67] leading-relaxed">
              {alt.explanation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
