import React, { useState, useEffect } from 'react';
import {
  X,
  SlidersHorizontal,
  Sparkles,
  Check,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { Trip } from '../../types/trip';
import { ExpenseCategory } from '../../types/budget';
import {
  autoAllocateBudget,
  CATEGORY_METADATA,
  DEFAULT_ALLOCATIONS,
} from '../../utils/budgetAllocator';
import { formatCurrency } from '../../utils/currency';

interface BudgetAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  currentAllocations: Record<ExpenseCategory, number>;
  onSaveAllocations: (allocations: Record<ExpenseCategory, number>) => void;
}

const CATEGORIES: ExpenseCategory[] = [
  'accommodation',
  'food',
  'transport',
  'activities',
  'shopping',
  'miscellaneous',
];

export const BudgetAllocationModal: React.FC<BudgetAllocationModalProps> = ({
  isOpen,
  onClose,
  trip,
  currentAllocations,
  onSaveAllocations,
}) => {
  const [allocations, setAllocations] = useState<Record<ExpenseCategory, number>>({
    ...currentAllocations,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAllocations({ ...currentAllocations });
    setError(null);
  }, [currentAllocations, isOpen]);

  if (!isOpen) return null;

  const totalPercentage: number = (Object.values(allocations) as number[]).reduce(
    (sum: number, v: number) => sum + (Number(v) || 0),
    0
  );
  const isValid = totalPercentage === 100;
  const currency = trip.currency || 'INR';
  const totalBudget = trip.budget || 50000;

  const handlePercentageChange = (cat: ExpenseCategory, val: number) => {
    const clamped = Math.max(0, Math.min(100, isNaN(val) ? 0 : val));
    setAllocations((prev) => ({ ...prev, [cat]: clamped }));
    setError(null);
  };

  const handleAutoAllocate = () => {
    const smart = autoAllocateBudget(trip);
    setAllocations(smart);
    setError(null);
  };

  const handleResetDefaults = () => {
    setAllocations({ ...DEFAULT_ALLOCATIONS });
    setError(null);
  };

  const handleSave = () => {
    if (!isValid) {
      setError(`Allocations must sum to exactly 100%. Currently at ${totalPercentage}%.`);
      return;
    }
    onSaveAllocations(allocations);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFFDF8] w-full max-w-lg rounded-3xl border border-[#EAE6DD] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#EAE6DD] bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F5F3FF] border border-[#DDD6FE] flex items-center justify-center text-[#8B5CF6]">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#17201D]">
                Budget Allocation
              </h3>
              <p className="text-xs text-[#68736F]">
                Define category budget distribution targets (Total: {formatCurrency(totalBudget, currency)})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#FAF8F5] hover:bg-[#EAE6DD] text-[#5E6B67] hover:text-[#17201D] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Total percentage status banner */}
        <div
          className={`px-6 py-3 border-b flex items-center justify-between text-xs font-bold ${
            isValid
              ? 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]'
              : 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
          }`}
        >
          <div className="flex items-center gap-2">
            {isValid ? (
              <Check className="w-4 h-4 text-[#065F46]" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#92400E]" />
            )}
            <span>
              {isValid
                ? 'Allocations balanced perfectly at 100%'
                : `Total: ${totalPercentage}% (${
                    totalPercentage > 100
                      ? `Exceeds by +${totalPercentage - 100}%`
                      : `Needs ${100 - totalPercentage}% more`
                  })`}
            </span>
          </div>

          {/* Quick Auto Allocate Button */}
          <button
            type="button"
            onClick={handleAutoAllocate}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-[#17201D] text-[11px] font-extrabold border border-current shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-[#FF6B4A]" />
            <span>Auto Allocate</span>
          </button>
        </div>

        {/* Sliders Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-xs font-bold text-[#991B1B] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {CATEGORIES.map((cat) => {
            const meta = CATEGORY_METADATA[cat];
            const pct = allocations[cat] || 0;
            const amount = Math.round((totalBudget * pct) / 100);

            return (
              <div
                key={cat}
                className="p-3.5 rounded-2xl bg-white border border-[#EAE6DD] space-y-2 hover:border-[#C4BEB1] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl" role="img" aria-label={meta.label}>
                      {meta.icon}
                    </span>
                    <div>
                      <span className="text-xs font-black text-[#17201D]">
                        {meta.label}
                      </span>
                      <span className="text-[11px] font-bold text-[#8A9591] ml-2">
                        ≈ {formatCurrency(amount, currency)}
                      </span>
                    </div>
                  </div>

                  {/* Number input */}
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={pct}
                      onChange={(e) =>
                        handlePercentageChange(cat, parseInt(e.target.value, 10))
                      }
                      className="w-14 px-2 py-1 text-right rounded-lg bg-[#FAF8F5] border border-[#EAE6DD] text-xs font-extrabold text-[#17201D] focus:outline-none focus:border-[#FF6B4A]"
                    />
                    <span className="text-xs font-bold text-[#8A9591]">%</span>
                  </div>
                </div>

                {/* Range Slider */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={pct}
                  onChange={(e) =>
                    handlePercentageChange(cat, parseInt(e.target.value, 10))
                  }
                  className="w-full h-2 bg-[#EAE6DD] rounded-lg appearance-none cursor-pointer accent-[#FF6B4A]"
                />
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#EAE6DD] bg-white flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#68736F] hover:text-[#17201D] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full bg-[#FAF8F5] hover:bg-[#EAE6DD] text-[#17201D] text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isValid}
              className="px-6 py-2 rounded-full bg-[#17201D] hover:bg-[#2A3833] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black shadow-xs transition-all cursor-pointer"
            >
              Save Allocation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
