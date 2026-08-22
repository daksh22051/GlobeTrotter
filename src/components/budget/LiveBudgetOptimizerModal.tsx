import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Check,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  Hotel,
  Train,
  Utensils,
  Ticket,
  ChevronRight,
  AlertCircle,
  ThumbsDown,
  Layers,
} from 'lucide-react';
import { Trip } from '../../types/trip';
import { Itinerary } from '../../types/itinerary';
import {
  Expense,
  ExpenseCategory,
  BudgetOptimizationSuggestion,
  BudgetOptimizationResult,
} from '../../types/budget';
import { budgetOptimizationService } from '../../services/budgetOptimizationService';
import { formatCurrency } from '../../utils/currency';
import { CATEGORY_METADATA } from '../../utils/budgetAllocator';

interface LiveBudgetOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  itinerary: Itinerary | null;
  expenses: Expense[];
  allocations: Record<ExpenseCategory, number>;
  onOptimizationsApplied: (message: string) => void;
}

const STAGES = [
  'Analyzing your spending patterns...',
  'Scanning your scheduled itinerary items...',
  'Benchmarking local rates & alternatives in destination...',
  'Generating high-value savings opportunities...',
];

export const LiveBudgetOptimizerModal: React.FC<LiveBudgetOptimizerModalProps> = ({
  isOpen,
  onClose,
  trip,
  itinerary,
  expenses,
  allocations,
  onOptimizationsApplied,
}) => {
  const [stageIndex, setStageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<BudgetOptimizationResult | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [ignoredIds, setIgnoredIds] = useState<Set<string>>(new Set());
  const [appliedSavingsTotal, setAppliedSavingsTotal] = useState(0);

  const currency = trip.currency || 'INR';

  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    setStageIndex(0);
    setResult(null);
    setAppliedIds(new Set());
    setIgnoredIds(new Set());
    setAppliedSavingsTotal(0);

    // Staged animation progression
    const interval = setInterval(() => {
      setStageIndex((prev) => {
        if (prev < STAGES.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 600);

    // Load optimizations
    budgetOptimizationService
      .optimizeBudget(trip, itinerary, expenses, allocations)
      .then((res) => {
        setTimeout(() => {
          setResult(res);
          setIsLoading(false);
        }, 2500);
      });

    return () => {
      clearInterval(interval);
    };
  }, [isOpen, trip, itinerary, expenses, allocations]);

  if (!isOpen) return null;

  const handleApply = (suggestion: BudgetOptimizationSuggestion) => {
    if (appliedIds.has(suggestion.id)) return;

    const { appliedMessage } = budgetOptimizationService.applyOptimization(
      trip,
      itinerary,
      suggestion
    );

    setAppliedIds((prev) => new Set(prev).add(suggestion.id));
    setAppliedSavingsTotal((prev) => prev + suggestion.potentialSavings);
    onOptimizationsApplied(appliedMessage);
  };

  const handleIgnore = (suggestionId: string) => {
    setIgnoredIds((prev) => new Set(prev).add(suggestionId));
  };

  const getCategoryIcon = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'accommodation':
        return <Hotel className="w-4 h-4 text-[#8B5CF6]" />;
      case 'transport':
        return <Train className="w-4 h-4 text-[#3B82F6]" />;
      case 'food':
        return <Utensils className="w-4 h-4 text-[#FF6B4A]" />;
      case 'activities':
        return <Ticket className="w-4 h-4 text-[#0D9488]" />;
      default:
        return <Layers className="w-4 h-4 text-[#8A9591]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFFDF8] w-full max-w-3xl rounded-3xl border border-[#EAE6DD] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#EAE6DD] bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF6B4A] to-[#20B8A6] flex items-center justify-center text-white shadow-md shadow-[#FF6B4A]/20">
              <Sparkles className="w-5 h-5 text-[#FFF275]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-[#17201D]">
                  Live Budget Optimizer
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#FFF2EE] text-[#FF6B4A] text-[10px] font-extrabold border border-[#FFE0D6]">
                  AI Powered
                </span>
              </div>
              <p className="text-xs text-[#68736F]">
                Tailored savings for {trip.destination} without sacrificing experience quality
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

        {/* Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1">
          {isLoading ? (
            /* Staged Loading Animation View */
            <div className="py-16 px-4 text-center flex flex-col items-center justify-center max-w-md mx-auto">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-[#FFF2EE] border-2 border-[#FF6B4A]/30 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-10 h-10 text-[#FF6B4A] animate-spin-slow" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#20B8A6] flex items-center justify-center text-white shadow-sm animate-bounce">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>

              <h4 className="text-base sm:text-lg font-black text-[#17201D] mb-2">
                Optimizing your trip finances...
              </h4>
              <p className="text-xs font-bold text-[#FF6B4A] min-h-[20px] transition-all">
                {STAGES[stageIndex]}
              </p>

              {/* Progress dots */}
              <div className="flex items-center gap-2 mt-6">
                {STAGES.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx <= stageIndex
                        ? 'w-6 bg-[#FF6B4A]'
                        : 'w-2 bg-[#EAE6DD]'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : result ? (
            /* Results View */
            <>
              {/* Savings Hero Banner */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#17201D] to-[#2A3833] text-white shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#FF6B4A]/30 via-[#20B8A6]/20 to-transparent rounded-full -mr-12 -mt-12 pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-[#FFF275] text-xs font-extrabold mb-2 border border-white/10">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{result.suggestions.length} High-Impact Opportunities Found</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                      Save up to {formatCurrency(result.totalPotentialSavings, currency)}
                    </div>
                    <p className="text-xs text-[#CBD5E1] mt-1 max-w-md">
                      Projected trip cost after optimizations:{' '}
                      <strong className="text-white">
                        {formatCurrency(result.projectedTripCost, currency)}
                      </strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-center">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                        Projected Health
                      </div>
                      <div className="text-lg font-black text-[#34D399] flex items-center justify-center gap-1">
                        <ShieldCheck className="w-4 h-4" />
                        <span>{result.budgetHealthScore}/100</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Suggestions Cards List */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-[#17201D] uppercase tracking-wider">
                  Recommended Adjustments
                </h4>

                {result.suggestions.map((suggestion) => {
                  const isApplied = appliedIds.has(suggestion.id);
                  const isIgnored = ignoredIds.has(suggestion.id);

                  if (isIgnored) return null;

                  return (
                    <div
                      key={suggestion.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isApplied
                          ? 'bg-[#F0FDF4] border-[#86EFAC]'
                          : 'bg-white border-[#EAE6DD] hover:border-[#17201D]/30 shadow-2xs'
                      }`}
                    >
                      {/* Header with Title & Potential Savings Badge */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#EAE6DD] flex items-center justify-center">
                            {getCategoryIcon(suggestion.category)}
                          </div>
                          <div>
                            <h5 className="text-sm font-black text-[#17201D]">
                              {suggestion.title}
                            </h5>
                            <span className="text-[11px] font-bold text-[#8A9591] capitalize">
                              {suggestion.category} Optimization
                            </span>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#D1FAE5] text-[#065F46] text-xs font-black border border-[#A7F3D0] shrink-0">
                          <TrendingDown className="w-3.5 h-3.5" />
                          SAVE {formatCurrency(suggestion.potentialSavings, currency)}
                        </span>
                      </div>

                      {/* Before / After Comparison */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DD] mb-3 text-xs">
                        <div className="p-2 bg-white rounded-lg border border-[#EAE6DD]/60">
                          <span className="text-[10px] font-bold text-[#8A9591] uppercase block mb-0.5">
                            Current Planned Choice
                          </span>
                          <p className="font-bold text-[#17201D]">{suggestion.currentChoice}</p>
                          <span className="text-xs font-extrabold text-[#EF4444] mt-1 block">
                            {formatCurrency(suggestion.currentCost, currency)}
                          </span>
                        </div>

                        <div className="p-2 bg-white rounded-lg border border-[#B2F0E8]">
                          <span className="text-[10px] font-bold text-[#0D9488] uppercase block mb-0.5">
                            Smart Suggested Alternative
                          </span>
                          <p className="font-bold text-[#17201D]">
                            {suggestion.suggestedAlternative}
                          </p>
                          <span className="text-xs font-extrabold text-[#10B981] mt-1 block">
                            {formatCurrency(suggestion.suggestedCost, currency)}
                          </span>
                        </div>
                      </div>

                      {/* Reason Narrative */}
                      <p className="text-xs text-[#5E6B67] leading-relaxed mb-4">
                        <strong className="text-[#17201D]">Why this works: </strong>
                        {suggestion.reason}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#EAE6DD]">
                        <button
                          type="button"
                          onClick={() => handleIgnore(suggestion.id)}
                          className="text-xs font-bold text-[#8A9591] hover:text-[#17201D] transition-colors cursor-pointer"
                        >
                          Dismiss suggestion
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApply(suggestion)}
                          disabled={isApplied}
                          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                            isApplied
                              ? 'bg-[#10B981] text-white'
                              : 'bg-[#17201D] hover:bg-[#2A3833] text-white shadow-xs active:scale-95'
                          }`}
                        >
                          {isApplied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Applied ✓</span>
                            </>
                          ) : (
                            <>
                              <span>Apply Optimization</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#EAE6DD] bg-white flex items-center justify-between">
          <div className="text-xs text-[#68736F]">
            {appliedSavingsTotal > 0 && (
              <span className="font-bold text-[#065F46]">
                Applied savings so far: {formatCurrency(appliedSavingsTotal, currency)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[#17201D] hover:bg-[#2A3833] text-white text-xs font-black transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
