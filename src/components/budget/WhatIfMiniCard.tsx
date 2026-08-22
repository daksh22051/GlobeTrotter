import React, { useState } from 'react';
import { HelpCircle, Sparkles, ArrowRight, CheckCircle2, TrendingDown } from 'lucide-react';
import { Trip } from '../../types/trip';
import { formatCurrency } from '../../utils/currency';

interface WhatIfMiniCardProps {
  trip: Trip;
  onOpenOptimizer: () => void;
}

export const WhatIfMiniCard: React.FC<WhatIfMiniCardProps> = ({
  trip,
  onOpenOptimizer,
}) => {
  const currency = trip.currency || 'INR';
  const currentBudget = trip.budget || 50000;
  const [targetReductionPercent, setTargetReductionPercent] = useState<number>(20);

  const reducedBudget = Math.round(currentBudget * (1 - targetReductionPercent / 100));
  const savingsAmount = currentBudget - reducedBudget;

  return (
    <div className="w-full bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE6DD] shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFF2EE] border border-[#FFE0D6] flex items-center justify-center text-[#FF6B4A]">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#17201D] tracking-tight">
                "What if?" Budget Sandbox
              </h3>
              <p className="text-xs text-[#68736F]">
                Test tighter spending targets before you book
              </p>
            </div>
          </div>
        </div>

        {/* Target Percent Buttons */}
        <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DD] mb-4">
          <label className="block text-[11px] font-bold text-[#8A9591] uppercase tracking-wider mb-2">
            Simulate a budget reduction:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[10, 20, 30].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setTargetReductionPercent(pct)}
                className={`py-1.5 px-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                  targetReductionPercent === pct
                    ? 'bg-[#17201D] text-white border-[#17201D]'
                    : 'bg-white text-[#17201D] border-[#EAE6DD] hover:border-[#17201D]'
                }`}
              >
                -{pct}% ({formatCurrency(Math.round(currentBudget * (1 - pct / 100)), currency)})
              </button>
            ))}
          </div>
        </div>

        {/* Simulation Feedback Card */}
        <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#FFE0D6] space-y-2.5 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#17201D]">
              Simulated Target: {formatCurrency(reducedBudget, currency)}
            </span>
            <span className="text-xs font-black text-[#065F46] bg-[#D1FAE5] px-2 py-0.5 rounded-full">
              Save {formatCurrency(savingsAmount, currency)}
            </span>
          </div>

          <p className="text-xs text-[#5E6B67] leading-relaxed">
            ✨ <strong className="text-[#17201D]">Feasibility: </strong>
            Your itinerary can comfortably fit with 2 smart swaps: switching to a boutique guesthouse & using the 3-day express transit pass.
          </p>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onOpenOptimizer}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#FAF8F5] hover:bg-[#EAE6DD] text-[#17201D] text-xs font-extrabold border border-[#EAE6DD] transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FF6B4A]" />
          <span>Apply These Smart Swaps in Optimizer</span>
        </button>
      </div>
    </div>
  );
};
