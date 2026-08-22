import React, { useState } from 'react';
import {
  Coins,
  Building2,
  Utensils,
  Plane,
  Compass,
  ShoppingBag,
  Sparkles,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
} from 'lucide-react';
import { EstimatedCategoryBreakdown } from '../../types/recommendation';
import { CurrencyCode } from '../../types/profile';
import { formatCurrency } from '../../utils/currency';

interface CostBreakdownProps {
  costEstimate: EstimatedCategoryBreakdown;
  currency: CurrencyCode;
  tripBudget: number;
  onOpenPersonalize?: () => void;
}

export const CostBreakdown: React.FC<CostBreakdownProps> = ({
  costEstimate,
  currency,
  tripBudget,
  onOpenPersonalize,
}) => {
  const [showOptimizeModal, setShowOptimizeModal] = useState(false);

  const percentOfBudget = Math.min(
    140,
    Math.round((costEstimate.totalEstimated / Math.max(1, tripBudget)) * 100)
  );

  const categories = [
    {
      name: 'Accommodation',
      amount: costEstimate.accommodation,
      percent: Math.round((costEstimate.accommodation / Math.max(1, costEstimate.totalEstimated)) * 100),
      icon: <Building2 className="w-4 h-4 text-[#20B8A6]" />,
      color: 'bg-[#20B8A6]',
    },
    {
      name: 'Food & Dining',
      amount: costEstimate.food,
      percent: Math.round((costEstimate.food / Math.max(1, costEstimate.totalEstimated)) * 100),
      icon: <Utensils className="w-4 h-4 text-[#F59E0B]" />,
      color: 'bg-[#F59E0B]',
    },
    {
      name: 'Transport',
      amount: costEstimate.transport,
      percent: Math.round((costEstimate.transport / Math.max(1, costEstimate.totalEstimated)) * 100),
      icon: <Plane className="w-4 h-4 text-[#3B82F6]" />,
      color: 'bg-[#3B82F6]',
    },
    {
      name: 'Activities & Tours',
      amount: costEstimate.activities,
      percent: Math.round((costEstimate.activities / Math.max(1, costEstimate.totalEstimated)) * 100),
      icon: <Compass className="w-4 h-4 text-[#6366F1]" />,
      color: 'bg-[#6366F1]',
    },
    {
      name: 'Shopping & Misc',
      amount: costEstimate.shoppingMisc,
      percent: Math.round((costEstimate.shoppingMisc / Math.max(1, costEstimate.totalEstimated)) * 100),
      icon: <ShoppingBag className="w-4 h-4 text-[#EC4899]" />,
      color: 'bg-[#EC4899]',
    },
  ];

  return (
    <div className="w-full bg-white rounded-3xl border border-[#EAE6DD] shadow-xs p-6 sm:p-8 mb-8 select-none">
      {/* Header & Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F0ECE1]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Coins className="w-5 h-5 text-[#FF6B4A]" />
            <h2 className="text-lg sm:text-xl font-black text-[#17201D] tracking-tight">
              Your estimated trip cost
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#68736F]">
            Projected total for your trip duration and travelers count.
          </p>
        </div>

        {/* Status Pill Badge */}
        <div className="flex items-center gap-2">
          {costEstimate.isOverBudget ? (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FEF2F2] border border-[#EF4444]/30 text-[#B91C1C] text-xs font-bold shadow-2xs">
              <XCircle className="w-3.5 h-3.5 text-[#EF4444]" />
              <span>{costEstimate.statusMessage}</span>
            </div>
          ) : costEstimate.isCloseToBudget ? (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFFBEB] border border-[#F59E0B]/30 text-[#B45309] text-xs font-bold shadow-2xs">
              <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>{costEstimate.statusMessage}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F0FDF4] border border-[#22C55E]/30 text-[#15803D] text-xs font-bold shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>{costEstimate.statusMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Numbers: Estimated Total vs Target Budget */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6">
        <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#EAE6DD]">
          <p className="text-[11px] uppercase font-bold text-[#838F8B] mb-1">Estimated Total</p>
          <p className="text-2xl sm:text-3xl font-black text-[#17201D]">
            {formatCurrency(costEstimate.totalEstimated, currency)}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#EAE6DD]">
          <p className="text-[11px] uppercase font-bold text-[#838F8B] mb-1">Target Budget</p>
          <p className="text-2xl sm:text-3xl font-black text-[#68736F]">
            {formatCurrency(tripBudget, currency)}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#EAE6DD]">
          <p className="text-[11px] uppercase font-bold text-[#838F8B] mb-1">
            {costEstimate.remainingOrOver >= 0 ? 'Remaining Buffer' : 'Projected Over'}
          </p>
          <p
            className={`text-2xl sm:text-3xl font-black ${
              costEstimate.remainingOrOver >= 0 ? 'text-[#179E8E]' : 'text-[#DC2626]'
            }`}
          >
            {costEstimate.remainingOrOver >= 0 ? '+' : '-'}
            {formatCurrency(Math.abs(costEstimate.remainingOrOver), currency)}
          </p>
        </div>
      </div>

      {/* Multi-segment Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-bold text-[#4E5955] mb-2">
          <span>Budget Utilization ({percentOfBudget}%)</span>
          <span>Target: {formatCurrency(tripBudget, currency)}</span>
        </div>
        <div className="w-full h-3 rounded-full bg-[#F4F1EA] overflow-hidden flex">
          {categories.map((cat) => (
            <div
              key={cat.name}
              style={{ width: `${(cat.amount / Math.max(1, costEstimate.totalEstimated)) * 100}%` }}
              className={`h-full ${cat.color} transition-all duration-500`}
              title={`${cat.name}: ${formatCurrency(cat.amount, currency)} (${cat.percent}%)`}
            />
          ))}
        </div>
      </div>

      {/* Category Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
        {categories.map((cat) => (
          <div key={cat.name} className="p-3.5 rounded-2xl bg-[#FCFBF8] border border-[#EAE6DD]">
            <div className="flex items-center gap-2 mb-1.5">
              {cat.icon}
              <span className="text-xs font-bold text-[#17201D] truncate">{cat.name}</span>
            </div>
            <p className="text-sm font-extrabold text-[#17201D]">
              {formatCurrency(cat.amount, currency)}
            </p>
            <p className="text-[10px] font-semibold text-[#838F8B]">{cat.percent}% of estimate</p>
          </div>
        ))}
      </div>

      {/* Footer: Confidence Indicator & Optimization CTA */}
      <div className="mt-6 pt-6 border-t border-[#F0ECE1] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#68736F]">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#838F8B] shrink-0" />
          <span>
            <strong className="text-[#17201D]">Estimate confidence: {costEstimate.confidence}</strong> — {costEstimate.confidenceReason}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowOptimizeModal(true)}
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#FF6B4A] hover:text-[#E55837] transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Optimize my trip budget</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Optimization Tips Modal */}
      {showOptimizeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE6DD] shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowOptimizeModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-[#F4F1EA] text-[#838F8B] hover:text-[#17201D] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-[#FF6B4A]" />
              <h3 className="text-lg font-black text-[#17201D]">Trip Budget Optimization Tips</h3>
            </div>

            <p className="text-xs sm:text-sm text-[#68736F] mb-6 leading-relaxed">
              Here is how you can adjust your trip parameters to maximize value and keep your costs comfortable:
            </p>

            <div className="space-y-3.5 mb-6">
              <div className="p-3.5 rounded-2xl bg-[#FFF9F6] border border-[#FF6B4A]/20">
                <h4 className="text-xs font-extrabold text-[#8C3A24] mb-1">1. Accommodation Flexibility</h4>
                <p className="text-xs text-[#68736F]">
                  Selecting boutique or apartment stays instead of luxury hotels can reduce total lodging expenditure by 25–35%.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F2FBF9] border border-[#20B8A6]/20">
                <h4 className="text-xs font-extrabold text-[#136C61] mb-1">2. Dining Mix Strategy</h4>
                <p className="text-xs text-[#68736F]">
                  Enjoying local market lunches and authentic street food allows you to budget for memorable fine dining on alternating evenings.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F4F1EA] border border-[#EAE6DD]">
                <h4 className="text-xs font-extrabold text-[#17201D] mb-1">3. City Transit Passes</h4>
                <p className="text-xs text-[#68736F]">
                  Pre-purchasing regional transit IC cards or multi-day metro passes cuts transport costs by over 40% compared to taxis.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowOptimizeModal(false)}
                className="px-4 py-2 rounded-full text-xs font-bold text-[#68736F] hover:bg-[#F4F1EA] cursor-pointer"
              >
                Close
              </button>
              {onOpenPersonalize && (
                <button
                  type="button"
                  onClick={() => {
                    setShowOptimizeModal(false);
                    onOpenPersonalize();
                  }}
                  className="px-5 py-2 rounded-full bg-[#FF6B4A] hover:bg-[#E55837] text-white text-xs font-extrabold shadow-xs cursor-pointer"
                >
                  Adjust Trip Budget
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
