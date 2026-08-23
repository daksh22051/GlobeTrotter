import React from 'react';
import {
  TrendingDown,
  TrendingUp,
  Scale,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Trip } from '../../types/trip';
import { BudgetSnapshot } from '../../types/budget';
import { formatCurrency } from '../../utils/currency';

interface EstimatedVsActualCardProps {
  trip: Trip;
  snapshot: BudgetSnapshot;
  onOpenOptimizer: () => void;
}

export const EstimatedVsActualCard: React.FC<EstimatedVsActualCardProps> = ({
  trip,
  snapshot,
  onOpenOptimizer,
}) => {
  const currency = trip.currency || 'INR';
  const { estimatedCost, actualSpent, totalBudget, projectedCost } = snapshot;

  const difference = estimatedCost - actualSpent;
  const isBelowEstimate = actualSpent <= estimatedCost;
  const projectedSurplus = totalBudget - projectedCost;
  const isProjectedUnderBudget = projectedSurplus >= 0;

  return (
    <div className="w-full bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE6DD] shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#3B82F6]">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#17201D] tracking-tight">
                Estimated vs Actual
              </h3>
              <p className="text-xs text-[#68736F]">
                Planning variance & completion forecast
              </p>
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              isBelowEstimate
                ? 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]'
                : 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]'
            }`}
          >
            {isBelowEstimate ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : (
              <TrendingUp className="w-3.5 h-3.5" />
            )}
            <span>
              {isBelowEstimate ? 'Under Estimate' : 'Above Estimate'}
            </span>
          </div>
        </div>

        {/* Breakdown Row */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DD] mb-4 text-center">
          <div className="p-2">
            <div className="text-[11px] font-bold text-[#8A9591] uppercase">
              Estimated
            </div>
            <div className="text-sm sm:text-base font-black text-[#17201D] mt-0.5">
              {formatCurrency(estimatedCost, currency)}
            </div>
          </div>

          <div className="p-2 border-x border-[#EAE6DD]">
            <div className="text-[11px] font-bold text-[#8A9591] uppercase">
              Actual
            </div>
            <div className="text-sm sm:text-base font-black text-[#FF6B4A] mt-0.5">
              {formatCurrency(actualSpent, currency)}
            </div>
          </div>

          <div className="p-2">
            <div className="text-[11px] font-bold text-[#8A9591] uppercase">
              Difference
            </div>
            <div
              className={`text-sm sm:text-base font-black mt-0.5 ${
                difference >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
              }`}
            >
              {difference >= 0 ? '+' : ''}
              {formatCurrency(difference, currency)}
            </div>
          </div>
        </div>

        {/* Narrative Explanation */}
        <div className="p-3.5 rounded-2xl bg-[#FFFDF8] border border-[#EAE6DD] text-xs text-[#17201D] leading-relaxed mb-4">
          {isBelowEstimate ? (
            <p>
              <strong className="text-[#065F46] font-bold">On track: </strong>
              Your actual spending is currently{' '}
              <span className="font-extrabold text-[#17201D]">
                {formatCurrency(difference, currency)}
              </span>{' '}
              below the estimated trip cost.
            </p>
          ) : (
            <p>
              <strong className="text-[#991B1B] font-bold">Notice: </strong>
              You're spending faster than expected by{' '}
              <span className="font-extrabold text-[#17201D]">
                {formatCurrency(Math.abs(difference), currency)}
              </span>
              . Consider optimizing your upcoming stops.
            </p>
          )}
        </div>

        {/* Trip Completion Projection */}
        <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs leading-relaxed text-[#166534]">
            <span className="font-extrabold">Forecast: </span>
            {isProjectedUnderBudget ? (
              <span>
                At your current spending rate and scheduled itinerary, you're projected to finish approximately{' '}
                <strong>{formatCurrency(projectedSurplus, currency)}</strong> under budget.
              </span>
            ) : (
              <span>
                You may finish approximately{' '}
                <strong className="text-[#991B1B]">
                  {formatCurrency(Math.abs(projectedSurplus), currency)}
                </strong>{' '}
                over budget without adjusting upcoming stays or transport.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 mt-4 border-t border-[#EAE6DD] flex items-center justify-between">
        <span className="text-xs text-[#68736F]">
          Want to unlock extra savings?
        </span>
        <button
          type="button"
          onClick={onOpenOptimizer}
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#FF6B4A] hover:text-[#E55837] transition-colors cursor-pointer"
        >
          <span>Run Optimizer</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
