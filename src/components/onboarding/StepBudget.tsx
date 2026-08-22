import React from 'react';
import { motion } from 'motion/react';
import { BudgetStyle, CurrencyCode, BudgetStyleOption } from '../../types/profile';
import { formatCurrency, CURRENCY_MAP } from '../../utils/currency';
import { Coins, Wallet, Sparkles, Gem, ShieldCheck, Check } from 'lucide-react';

interface StepBudgetProps {
  budget: number;
  budgetStyle: BudgetStyle;
  currency: CurrencyCode;
  onBudgetChange: (budget: number) => void;
  onBudgetStyleChange: (style: BudgetStyle) => void;
  error?: string | null;
}

export const BUDGET_STYLES: BudgetStyleOption[] = [
  {
    id: 'budget_friendly',
    label: 'Budget Friendly',
    description: 'Hostels, smart public transit & delicious local street food.',
    multiplier: 0.6,
  },
  {
    id: 'balanced',
    label: 'Balanced',
    description: 'Great boutique hotels, curated activities & strategic splurges.',
    multiplier: 1.0,
  },
  {
    id: 'comfort',
    label: 'Comfort',
    description: '4-star stays, private airport transfers & top-rated restaurants.',
    multiplier: 1.5,
  },
  {
    id: 'luxury',
    label: 'Luxury',
    description: '5-star resorts, private guides & Michelin-starred dining experiences.',
    multiplier: 2.5,
  },
];

export const StepBudget: React.FC<StepBudgetProps> = ({
  budget,
  budgetStyle,
  currency,
  onBudgetChange,
  onBudgetStyleChange,
  error,
}) => {
  const currencyConfig = CURRENCY_MAP[currency] || CURRENCY_MAP.INR;
  const formattedBudget = formatCurrency(budget, currency);

  const handlePresetClick = (amount: number) => {
    onBudgetChange(amount);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onBudgetChange(Number(e.target.value));
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8ED] text-[#FF6B4A] text-xs font-bold mb-3 border border-[#FFE8D6]">
          <Coins className="w-3.5 h-3.5" />
          <span>Step 03 • Budget Planning</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17201D] tracking-tight mb-2">
          What's your usual travel budget?
        </h2>
        <p className="text-sm sm:text-base text-[#68736F] max-w-xl">
          This helps GlobeTrotter recommend realistic trips with transparent cost estimates.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Prominent Budget Display Card */}
      <div className="bg-gradient-to-br from-white to-[#FDFBF7] rounded-3xl p-6 sm:p-8 border border-[#EAE6DD] shadow-sm mb-8 text-center relative overflow-hidden">
        {/* Subtle Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B4A]/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#20B8A6]/5 rounded-full blur-2xl pointer-events-none" />

        <span className="text-xs font-bold uppercase tracking-wider text-[#68736F] block mb-1">
          Estimated Target Budget
        </span>

        {/* Large Prominent Amount */}
        <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#17201D] tracking-tight my-2">
          {formattedBudget}
        </div>
        <span className="text-xs sm:text-sm font-semibold text-[#FF6B4A] bg-[#FFF8ED] px-3.5 py-1 rounded-full inline-block border border-[#FFE8D6]">
          per trip (average duration 5–7 days)
        </span>

        {/* Interactive Range Slider */}
        <div className="mt-6 max-w-xl mx-auto">
          <input
            type="range"
            min={currencyConfig.minBudget}
            max={currencyConfig.maxBudget}
            step={currencyConfig.stepBudget}
            value={budget}
            onChange={handleSliderChange}
            className="w-full h-3 bg-[#EAE6DD] rounded-lg appearance-none cursor-pointer accent-[#FF6B4A]"
            aria-label="Budget Slider"
          />

          <div className="flex items-center justify-between text-[11px] font-semibold text-[#8C9894] mt-2">
            <span>{formatCurrency(currencyConfig.minBudget, currency)}</span>
            <span>{formatCurrency(currencyConfig.maxBudget, currency)}+</span>
          </div>
        </div>

        {/* Preset Chips */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {currencyConfig.budgetPresets.map((preset) => {
            const isSelected = Math.abs(budget - preset.value) < currencyConfig.stepBudget / 2;
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => handlePresetClick(preset.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#17201D] text-white shadow-sm scale-105'
                    : 'bg-[#F4EFE6] text-[#68736F] hover:bg-[#EAE6DD] hover:text-[#17201D]'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Budget Style Choice Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#17201D]">
            Select Your Spend Style
          </h3>
          <span className="text-xs text-[#8C9894]">Pick 1 preference</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
          {BUDGET_STYLES.map((style) => {
            const isSelected = budgetStyle === style.id;
            const Icon =
              style.id === 'budget_friendly'
                ? Wallet
                : style.id === 'balanced'
                ? ShieldCheck
                : style.id === 'comfort'
                ? Sparkles
                : Gem;

            return (
              <motion.button
                key={style.id}
                type="button"
                onClick={() => onBudgetStyleChange(style.id)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                aria-pressed={isSelected}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative group ${
                  isSelected
                    ? 'bg-[#FFF8ED] border-[#FF6B4A] shadow-sm ring-1 ring-[#FF6B4A]/30'
                    : 'bg-white hover:bg-[#FDFBF7] border-[#EAE6DD] hover:border-[#D1C9BC]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isSelected
                          ? 'bg-[#FF6B4A] text-white shadow-xs'
                          : 'bg-[#F4EFE6] text-[#17201D] group-hover:bg-[#EAE6DD]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        isSelected
                          ? 'bg-[#20B8A6] text-white'
                          : 'border border-[#D1C9BC]'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-[#17201D] mb-1 group-hover:text-[#FF6B4A] transition-colors">
                    {style.label}
                  </h4>
                  <p className="text-xs text-[#68736F] leading-snug">
                    {style.description}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
