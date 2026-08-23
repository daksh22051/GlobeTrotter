import React from 'react';
import {
  Wallet,
  Calculator,
  Receipt,
  PiggyBank,
  Edit2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { Trip } from '../../types/trip';
import { BudgetSnapshot, BudgetHealth } from '../../types/budget';
import { formatCurrency } from '../../utils/currency';

interface BudgetHeroCardProps {
  trip: Trip;
  snapshot: BudgetSnapshot;
  health: BudgetHealth;
  onOpenEditBudget: () => void;
}

export const BudgetHeroCard: React.FC<BudgetHeroCardProps> = ({
  trip,
  snapshot,
  health,
  onOpenEditBudget,
}) => {
  const currency = trip.currency || 'INR';
  const percentageSpent = Math.max(0, snapshot.percentageSpent || 0);

  // Determine budget status text & styling
  let statusText = "You're comfortably within budget.";
  let statusBadgeBg = 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]';
  let progressColor = 'bg-[#10B981]'; // Emerald

  if (percentageSpent > 100) {
    statusText = 'Over budget — adjustments recommended';
    statusBadgeBg = 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]';
    progressColor = 'bg-[#EF4444]'; // Red
  } else if (percentageSpent >= 80) {
    statusText = 'Budget almost reached';
    statusBadgeBg = 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]';
    progressColor = 'bg-[#F59E0B]'; // Amber
  } else if (percentageSpent >= 60) {
    statusText = 'Watch your spending';
    statusBadgeBg = 'bg-[#FEF9C3] text-[#854D0E] border-[#FEF08A]';
    progressColor = 'bg-[#EAB308]'; // Yellow
  }

  const clampedProgress = Math.min(100, percentageSpent);

  return (
    <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE6DD] shadow-xs relative overflow-hidden">
      {/* Subtle decorative background tint */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#FFF2EE]/60 via-[#E6FAF8]/30 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

      {/* Top row: Card Title, Health Score & Edit Budget */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#FFF2EE] border border-[#FFE0D6] flex items-center justify-center text-[#FF6B4A] shadow-2xs">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#17201D] tracking-tight">
              Financial Overview
            </h2>
            <p className="text-xs text-[#68736F]">
              Live synchronized with your active itinerary & logged expenses
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Health Score Pill */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border ${health.badgeBg} border-opacity-70`}
            style={{ color: health.textColor }}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>
              Health: {health.score}/100 • {health.label}
            </span>
          </div>

          {/* Edit Budget Trigger */}
          <button
            type="button"
            onClick={onOpenEditBudget}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5F2EB] hover:bg-[#EAE6DD] text-[#17201D] text-xs font-bold transition-colors cursor-pointer"
            title="Edit Total Trip Budget"
          >
            <Edit2 className="w-3.5 h-3.5 text-[#5E6B67]" />
            <span>Edit Budget</span>
          </button>
        </div>
      </div>

      {/* 4 Core Financial Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 relative z-10">
        {/* Metric 1: Trip Budget */}
        <div className="bg-[#FAF8F5] rounded-2xl p-4 sm:p-5 border border-[#EAE6DD] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-[#8A9591] uppercase tracking-wider">
              Trip Budget
            </span>
            <Wallet className="w-4 h-4 text-[#8A9591]" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-[#17201D] tracking-tight">
              {formatCurrency(snapshot.totalBudget, currency)}
            </div>
            <div className="text-[11px] text-[#68736F] mt-0.5">
              Planned target limit
            </div>
          </div>
        </div>

        {/* Metric 2: Estimated Cost */}
        <div className="bg-[#FAF8F5] rounded-2xl p-4 sm:p-5 border border-[#EAE6DD] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-[#8A9591] uppercase tracking-wider">
              Estimated Cost
            </span>
            <Calculator className="w-4 h-4 text-[#3B82F6]" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-[#17201D] tracking-tight">
              {formatCurrency(snapshot.estimatedCost, currency)}
            </div>
            <div className="text-[11px] text-[#68736F] mt-0.5">
              Itinerary & stay forecast
            </div>
          </div>
        </div>

        {/* Metric 3: Actual Spent */}
        <div className="bg-[#FAF8F5] rounded-2xl p-4 sm:p-5 border border-[#EAE6DD] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-[#8A9591] uppercase tracking-wider">
              Actual Spent
            </span>
            <Receipt className="w-4 h-4 text-[#FF6B4A]" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-[#FF6B4A] tracking-tight">
              {formatCurrency(snapshot.actualSpent, currency)}
            </div>
            <div className="text-[11px] text-[#68736F] mt-0.5">
              Logged expenses ({percentageSpent}% of budget)
            </div>
          </div>
        </div>

        {/* Metric 4: Remaining Budget */}
        <div className="bg-[#FAF8F5] rounded-2xl p-4 sm:p-5 border border-[#EAE6DD] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-[#8A9591] uppercase tracking-wider">
              Remaining
            </span>
            <PiggyBank
              className={`w-4 h-4 ${
                snapshot.remaining >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
              }`}
            />
          </div>
          <div>
            <div
              className={`text-xl sm:text-2xl lg:text-3xl font-black tracking-tight ${
                snapshot.remaining >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
              }`}
            >
              {formatCurrency(snapshot.remaining, currency)}
            </div>
            <div className="text-[11px] text-[#68736F] mt-0.5">
              {snapshot.remaining >= 0 ? 'Available unspent balance' : 'Exceeded by amount'}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Ring & Bar Section */}
      <div className="bg-[#FAF8F5] rounded-2xl p-4 sm:p-5 border border-[#EAE6DD] relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-3 h-3 rounded-full ${
                percentageSpent > 100
                  ? 'bg-[#EF4444] animate-ping'
                  : percentageSpent >= 80
                  ? 'bg-[#F59E0B]'
                  : 'bg-[#10B981]'
              }`}
            />
            <span className="text-xs sm:text-sm font-bold text-[#17201D]">
              {formatCurrency(snapshot.actualSpent, currency)} spent of{' '}
              {formatCurrency(snapshot.totalBudget, currency)}{' '}
              <span className="text-[#8A9591]">({percentageSpent}%)</span>
            </span>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${statusBadgeBg}`}
          >
            {percentageSpent > 100 ? (
              <AlertTriangle className="w-3.5 h-3.5 text-[#991B1B]" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#065F46]" />
            )}
            <span>{statusText}</span>
          </div>
        </div>

        {/* Visual Progress Track */}
        <div className="w-full bg-[#EAE6DD] h-3.5 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${progressColor}`}
            style={{ width: `${clampedProgress}%` }}
          />
        </div>

        {/* Scale labels */}
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-[#8A9591] mt-2">
          <span>0% (Start)</span>
          <span>50%</span>
          <span>80% (Threshold)</span>
          <span>100% ({formatCurrency(snapshot.totalBudget, currency)})</span>
        </div>
      </div>
    </div>
  );
};
