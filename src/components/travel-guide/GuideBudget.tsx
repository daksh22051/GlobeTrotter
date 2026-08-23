import React from 'react';
import { Wallet, PieChart, TrendingUp, AlertCircle } from 'lucide-react';
import { BudgetSnapshot, CategorySummary } from '../../types/budget';
import { formatCurrency } from '../../utils/currency';
import { CurrencyCode } from '../../types/profile';

interface GuideBudgetProps {
  budgetSnapshot: BudgetSnapshot | null;
  categorySummaries: CategorySummary[];
  currency: string;
  totalBudget: number;
}

export const GuideBudget: React.FC<GuideBudgetProps> = ({
  budgetSnapshot,
  categorySummaries,
  currency,
  totalBudget,
}) => {
  const currencyCode = (currency || 'INR') as CurrencyCode;
  const totalSpent = budgetSnapshot ? budgetSnapshot.actualSpent : 0;
  const remaining = totalBudget - totalSpent;
  const percentage = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;

  return (
    <div className="bg-white rounded-3xl border border-[#EAE6DD] p-6 sm:p-8 shadow-xs space-y-6 break-inside-avoid">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#17201D] tracking-tight">
            Financial & Budget Breakdown
          </h2>
          <p className="text-xs text-[#68736F] mt-0.5">
            Overview of projected costs, spent expenses, and remaining funds.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#838F8B]">Total Budget</span>
            <p className="font-extrabold text-[#17201D] text-sm sm:text-base">
              {formatCurrency(totalBudget, currencyCode)}
            </p>
          </div>
          <div className="w-px h-8 bg-[#EAE6DD]" />
          <div>
            <span className="text-[10px] uppercase font-bold text-[#838F8B]">Total Spent</span>
            <p className="font-extrabold text-[#FF6B4A] text-sm sm:text-base">
              {formatCurrency(totalSpent, currencyCode)}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-[#68736F]">Budget Utilization</span>
          <span className={percentage > 100 ? 'text-[#D94F3D]' : 'text-[#20B8A6]'}>
            {percentage}% utilized
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-[#F4F1EA] overflow-hidden">
          <div
            className={`h-full transition-all rounded-full ${
              percentage > 100 ? 'bg-[#D94F3D]' : 'bg-[#20B8A6]'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Category breakdown cards */}
      {categorySummaries.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
          {categorySummaries.map((cat) => (
            <div
              key={cat.category}
              className="p-3.5 rounded-2xl bg-[#FCFBF8] border border-[#EAE6DD] space-y-1"
            >
              <div className="text-base mb-1">{cat.icon}</div>
              <p className="text-[11px] font-bold text-[#17201D] capitalize truncate">{cat.label}</p>
              <p className="text-xs font-black text-[#5E6B67]">
                {formatCurrency(cat.actual, currencyCode)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
