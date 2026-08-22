import React, { useId } from 'react';
import { CurrencyCode, BudgetStyle } from '../../types/profile';
import { CURRENCIES, convertCurrency } from '../../utils/currency';
import { Sparkles, Coins, DollarSign } from 'lucide-react';

interface BudgetSelectorProps {
  budget: number;
  currency: CurrencyCode;
  budgetStyle: BudgetStyle;
  onBudgetChange: (amount: number) => void;
  onCurrencyChange: (currency: CurrencyCode) => void;
  onBudgetStyleChange: (style: BudgetStyle) => void;
}

const BUDGET_TIERS: {
  id: BudgetStyle;
  label: string;
  sublabel: string;
  emoji: string;
  defaultMultiplier: number;
}[] = [
  {
    id: 'budget_friendly',
    label: 'Budget Friendly',
    sublabel: 'Hostels, local transit & smart street eats',
    emoji: '🎒',
    defaultMultiplier: 0.5,
  },
  {
    id: 'balanced',
    label: 'Balanced',
    sublabel: 'Cozy boutique hotels & popular restaurants',
    emoji: '⚖️',
    defaultMultiplier: 1.0,
  },
  {
    id: 'comfort',
    label: 'Comfort',
    sublabel: '4-star resorts, private rides & fine dining',
    emoji: '✨',
    defaultMultiplier: 1.8,
  },
  {
    id: 'luxury',
    label: 'Luxury',
    sublabel: '5-star suites, private tours & VIP access',
    emoji: '👑',
    defaultMultiplier: 3.5,
  },
];

export const BudgetSelector: React.FC<BudgetSelectorProps> = ({
  budget,
  currency,
  budgetStyle,
  onBudgetChange,
  onCurrencyChange,
  onBudgetStyleChange,
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

  // Handle tier click -> updates both style and adapts slider value
  const handleTierSelect = (tier: typeof BUDGET_TIERS[number]) => {
    onBudgetStyleChange(tier.id);
    const calculatedTarget = Math.round((minBudget + (maxBudget - minBudget) * (tier.defaultMultiplier / 3.5)) / stepBudget) * stepBudget;
    onBudgetChange(Math.max(minBudget, Math.min(maxBudget, calculatedTarget)));
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Bar: Target Amount & Currency Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-br from-[#FFF8F5] via-[#FFF3EE] to-[#FFFBF9] border border-[#FFD9CE]">
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

        {/* Currency Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="trip-currency-select" className="text-xs font-bold text-[#68736F]">
            Currency:
          </label>
          <select
            id="trip-currency-select"
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#EAE6DD] text-xs font-extrabold text-[#17201D] shadow-2xs hover:border-[#FF6B4A] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/20 cursor-pointer"
          >
            {Object.values(CURRENCIES).map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.symbol}) — {c.name}
              </option>
            ))}
          </select>
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

      {/* Quick Budget Tiers Cards */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[#4A5551] mb-2.5">
          Budget Tier Style
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {BUDGET_TIERS.map((tier) => {
            const isSelected = budgetStyle === tier.id;
            return (
              <div
                key={tier.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => handleTierSelect(tier)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleTierSelect(tier)}
                className={`relative p-4 rounded-2xl border-2 text-left cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#FF6B4A] bg-[#FFF2EE] shadow-sm shadow-[#FF6B4A]/15 scale-[1.01]'
                    : 'border-[#EAE6DD] bg-white hover:border-[#D1CCC2] hover:bg-[#FAF9F5]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl" role="img" aria-hidden="true">
                      {tier.emoji}
                    </span>
                    {isSelected && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B4A]" />
                    )}
                  </div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-[#17201D] mb-1">
                    {tier.label}
                  </h4>
                  <p className="text-[11px] text-[#5E6B67] leading-relaxed">
                    {tier.sublabel}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
