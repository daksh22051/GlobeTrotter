import React, { useId } from 'react';
import { CurrencyCode, BudgetStyle } from '../../types/profile';
import { CURRENCIES, convertCurrency } from '../../utils/currency';

interface BudgetSelectorProps {
  budget: number;
  currency: CurrencyCode;
  budgetStyle?: BudgetStyle;
  onBudgetChange: (amount: number) => void;
}

export const BudgetSelector: React.FC<BudgetSelectorProps> = ({
  budget,
  currency,
  budgetStyle,
  onBudgetChange,
}) => {
  const sliderId = useId();
  const currConfig = CURRENCIES[currency] || CURRENCIES.INR;

  // Base range for INR
  const baseMinINR = 5000;
  const baseMaxINR = 300000;
  const baseStepINR = 2500;

  // Converted range limits
  const minBudget = Math.round(convertCurrency(baseMinINR, 'INR', currency) / 50) * 50 || 50;
  const maxBudget = Math.round(convertCurrency(baseMaxINR, 'INR', currency) / 500) * 500 || 5000;
  const stepBudget = Math.max(10, Math.round(convertCurrency(baseStepINR, 'INR', currency) / 50) * 50);

  return (
    <div className="w-full space-y-6">
      {/* Target Amount */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#FFF8F5] via-[#FFF3EE] to-[#FFFBF9] border border-[#FFD9CE]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B4A] block mb-1">
            Trip Budget Target
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black text-[#17201D] tracking-tight">
              {currConfig.symbol}{budget.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-[#68736F] uppercase">
              {currency}
            </span>
          </div>
        </div>

      </div>

      {/* Slider Control */}
      <div className="space-y-2 px-1">
        <div className="flex items-center justify-between text-xs font-bold text-[#68736F]">
          <span>{currConfig.symbol}{minBudget.toLocaleString()}</span>
          <span className="text-[#FF6B4A] font-extrabold">Adjust Budget</span>
          <span>{currConfig.symbol}{maxBudget.toLocaleString()}+</span>
        </div>

        <input
          id={sliderId}
          type="range"
          min={minBudget}
          max={maxBudget}
          step={stepBudget}
          value={budget}
          onChange={(e) => onBudgetChange(Number(e.target.value))}
          className="w-full h-2.5 bg-[#EAE6DD] rounded-lg appearance-none cursor-pointer accent-[#FF6B4A] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/30"
          aria-label="Trip budget slider"
        />
      </div>

    </div>
  );
};
