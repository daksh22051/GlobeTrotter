import React from 'react';
import {
  CalendarDays,
  TrendingUp,
  Clock,
  Info,
  DollarSign,
} from 'lucide-react';
import { Trip } from '../../types/trip';
import { DailySpendPoint, Expense } from '../../types/budget';
import { formatCurrency } from '../../utils/currency';

interface DailySpendingCardProps {
  trip: Trip;
  expenses: Expense[];
  dailyPoints: DailySpendPoint[];
  remainingBudget: number;
}

export const DailySpendingCard: React.FC<DailySpendingCardProps> = ({
  trip,
  expenses,
  dailyPoints,
  remainingBudget,
}) => {
  const currency = trip.currency || 'INR';
  const duration = Math.max(1, trip.durationDays || 3);
  const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Number of active unique days with recorded spending
  const activeDaysCount = new Set(expenses.map((e) => e.date)).size;
  const avgDailySpend = activeDaysCount > 0 ? Math.round(totalSpent / activeDaysCount) : 0;
  const remainingDays = Math.max(1, duration - activeDaysCount);
  const remainingDailyAllowance = Math.round(Math.max(0, remainingBudget) / remainingDays);
  const plannedDailyAllowance = Math.round((trip.budget || 50000) / duration);

  // Maximum spend point for SVG chart height scaling
  const maxPointAmount = Math.max(...dailyPoints.map((p) => p.amount), 100);

  return (
    <div className="w-full bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE6DD] shadow-xs flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E6FAF8] border border-[#B2F0E8] flex items-center justify-center text-[#0D9488]">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#17201D] tracking-tight">
                Daily Spending & Allowance
              </h3>
              <p className="text-xs text-[#68736F]">
                Burn rate pacing across {duration} trip days
              </p>
            </div>
          </div>
        </div>

        {/* 2 Daily Rates Stat Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Average Daily Spend */}
          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DD]">
            <div className="flex items-center justify-between text-[#8A9591] mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Avg Daily Spend
              </span>
              <TrendingUp className="w-3.5 h-3.5 text-[#FF6B4A]" />
            </div>
            <div className="text-lg sm:text-xl font-black text-[#17201D]">
              {expenses.length > 0 ? (
                <span>
                  {formatCurrency(avgDailySpend, currency)}
                  <span className="text-xs font-bold text-[#8A9591]">/day</span>
                </span>
              ) : (
                <span className="text-sm font-bold text-[#8A9591]">No data yet</span>
              )}
            </div>
            <div className="text-[10px] text-[#68736F] mt-0.5">
              {activeDaysCount > 0
                ? `Across ${activeDaysCount} active ${activeDaysCount === 1 ? 'day' : 'days'}`
                : 'Awaiting first expense'}
            </div>
          </div>

          {/* Remaining Daily Allowance */}
          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DD]">
            <div className="flex items-center justify-between text-[#8A9591] mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {expenses.length > 0 ? 'Daily Allowance' : 'Planned Allowance'}
              </span>
              <Clock className="w-3.5 h-3.5 text-[#10B981]" />
            </div>
            <div className="text-lg sm:text-xl font-black text-[#10B981]">
              {formatCurrency(
                expenses.length > 0 ? remainingDailyAllowance : plannedDailyAllowance,
                currency
              )}
              <span className="text-xs font-bold text-[#8A9591]">/day</span>
            </div>
            <div className="text-[10px] text-[#68736F] mt-0.5">
              {expenses.length > 0
                ? `For next ${remainingDays} ${remainingDays === 1 ? 'day' : 'days'}`
                : `Budgeted for ${duration} days`}
            </div>
          </div>
        </div>

        {/* Spending Timeline Visualization */}
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DD]">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-extrabold text-[#17201D]">
              Spending Timeline
            </span>
            <span className="text-[10px] font-bold text-[#8A9591]">
              {dailyPoints.length} logged {dailyPoints.length === 1 ? 'day' : 'days'}
            </span>
          </div>

          {dailyPoints.length === 0 ? (
            <div className="py-8 text-center flex flex-col items-center justify-center text-[#8A9591]">
              <div className="w-10 h-10 rounded-full bg-white border border-[#EAE6DD] flex items-center justify-center mb-2">
                <Info className="w-4 h-4 text-[#8A9591]" />
              </div>
              <p className="text-xs font-bold text-[#17201D]">
                No spending recorded yet
              </p>
              <p className="text-[11px] text-[#68736F] mt-0.5">
                Add your first expense to visualize daily trends
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Responsive SVG Bar Timeline */}
              <div className="flex items-end gap-2 h-24 pt-4 border-b border-[#EAE6DD]">
                {dailyPoints.map((point) => {
                  const heightPercent = Math.max(12, Math.round((point.amount / maxPointAmount) * 100));
                  return (
                    <div
                      key={point.date}
                      className="flex-1 flex flex-col items-center justify-end h-full group relative"
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-[#17201D] text-white text-[10px] font-bold py-1 px-2 rounded-lg whitespace-nowrap z-20 shadow-md">
                        {point.dateDisplay}: {formatCurrency(point.amount, currency)} ({point.expensesCount} items)
                      </div>

                      {/* Bar */}
                      <div
                        className="w-full max-w-[32px] bg-gradient-to-t from-[#FF6B4A] to-[#FF8E72] rounded-t-md transition-all duration-300 group-hover:brightness-110"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Date labels below bars */}
              <div className="flex items-center justify-between text-[10px] font-bold text-[#8A9591]">
                <span>{dailyPoints[0]?.dateDisplay}</span>
                {dailyPoints.length > 2 && (
                  <span>{dailyPoints[Math.floor(dailyPoints.length / 2)]?.dateDisplay}</span>
                )}
                <span>{dailyPoints[dailyPoints.length - 1]?.dateDisplay}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
