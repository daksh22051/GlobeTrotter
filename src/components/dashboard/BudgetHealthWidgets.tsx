import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ShieldCheck, ArrowRight, Activity, Sparkles, Sliders } from 'lucide-react';
import { UserPreferences } from '../../types/profile';
import { formatCurrency, CURRENCY_MAP } from '../../utils/currency';

interface BudgetHealthWidgetsProps {
  preferences: UserPreferences | null;
}

export const BudgetHealthWidgets: React.FC<BudgetHealthWidgetsProps> = ({ preferences }) => {
  const navigate = useNavigate();

  const currency = preferences?.currency || 'INR';
  const budget = preferences?.budget || 50000;
  const budgetStyle = preferences?.budgetStyle || 'balanced';
  const formattedBudget = formatCurrency(budget, currency);

  const currencyConfig = CURRENCY_MAP[currency] || CURRENCY_MAP.INR;
  const minBudget = currencyConfig.minBudget;
  const maxBudget = currencyConfig.maxBudget;

  // Percentage within the current currency range
  const budgetPercent = Math.min(
    100,
    Math.max(10, Math.round(((budget - minBudget) / (maxBudget - minBudget)) * 100))
  );

  const budgetStyleLabel =
    budgetStyle === 'luxury'
      ? 'Luxury Tier'
      : budgetStyle === 'comfort'
      ? 'Comfort Tier'
      : budgetStyle === 'budget_friendly'
      ? 'Budget Friendly'
      : 'Balanced Tier';

  return (
    <section
      id="budget-health-widgets"
      aria-label="Budget and Trip Health"
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {/* Widget 1: Budget Preview */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE6DD] shadow-2xs flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FFF6DB] text-[#D97706] flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold text-[#17201D]">
                Your travel budget
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4F1EA] text-[#68736F] text-[10px] font-bold">
              {budgetStyleLabel}
            </span>
          </div>

          <div className="mt-3">
            <span className="text-[11px] font-semibold text-[#68736F] block">
              Preferred trip budget
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#17201D] tracking-tight">
              {formattedBudget}
            </div>
          </div>

          {/* Visual Range Indicator */}
          <div className="mt-3 space-y-1.5">
            <div className="w-full h-2 rounded-full bg-[#F4F1EA] overflow-hidden relative">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#20B8A6] to-[#FF6B4A] transition-all duration-500"
                style={{ width: `${budgetPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-medium text-[#98A29F]">
              <span>{formatCurrency(minBudget, currency)}</span>
              <span className="font-bold text-[#17201D]">Target: {formattedBudget}</span>
              <span>{formatCurrency(maxBudget, currency)}+</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-[#F4F1EA] flex items-center justify-between">
          <p className="text-[11px] text-[#68736F]">
            Itineraries will calibrate hotel & meal costs to this baseline.
          </p>
          <button
            type="button"
            onClick={() => navigate('/plan-trip')}
            className="text-xs font-bold text-[#FF6B4A] hover:text-[#E55837] inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <span>Plan within budget</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Widget 2: Trip Health Preview */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE6DD] shadow-2xs flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#DDF7F2] text-[#20B8A6] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold text-[#17201D]">
                Trip Health
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EDFAF7] text-[#20B8A6] text-[10px] font-bold flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Conflict Detector</span>
            </span>
          </div>

          <div className="mt-3 flex items-center gap-4">
            {/* Health Meter Graphic */}
            <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-[#20B8A6]/40 bg-[#F6FBFA] flex flex-col items-center justify-center shrink-0">
              <Activity className="w-5 h-5 text-[#20B8A6]/60" />
              <span className="text-[9px] font-extrabold text-[#20B8A6]">--</span>
            </div>

            <div>
              <p className="text-xs font-bold text-[#17201D]">
                Ready for your first itinerary
              </p>
              <p className="text-xs text-[#68736F] leading-relaxed mt-0.5">
                Your trip health score appears once you create a trip, checking travel buffers, transit times, and pace.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-[#F4F1EA] flex items-center justify-between">
          <span className="text-[11px] text-[#98A29F]">
            Real-time pace & schedule optimizer
          </span>
          <button
            type="button"
            onClick={() => navigate('/plan-trip')}
            className="text-xs font-bold text-[#20B8A6] hover:text-[#1CA393] inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Learn more</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
