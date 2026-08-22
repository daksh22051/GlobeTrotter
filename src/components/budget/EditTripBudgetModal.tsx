import React, { useState } from 'react';
import { X, Wallet, Check, AlertCircle } from 'lucide-react';
import { Trip } from '../../types/trip';
import { CurrencyCode } from '../../types/profile';
import { CURRENCIES, SUPPORTED_CURRENCIES, formatCurrency } from '../../utils/currency';

interface EditTripBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  onSaveBudget: (newBudget: number, newCurrency: CurrencyCode) => void;
}

export const EditTripBudgetModal: React.FC<EditTripBudgetModalProps> = ({
  isOpen,
  onClose,
  trip,
  onSaveBudget,
}) => {
  const [budget, setBudget] = useState(trip.budget ? trip.budget.toString() : '50000');
  const [currency, setCurrency] = useState<CurrencyCode>(trip.currency || 'INR');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const config = CURRENCIES[currency] || CURRENCIES.INR;

  const handlePresetSelect = (val: number) => {
    setBudget(val.toString());
    setError(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(budget);
    if (isNaN(parsed) || parsed <= 0) {
      setError('Please enter a valid trip budget greater than 0');
      return;
    }

    onSaveBudget(parsed, currency);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-3xl border border-[#EAE6DD] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#EAE6DD]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF2EE] border border-[#FFE0D6] flex items-center justify-center text-[#FF6B4A]">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#17201D]">
                Edit Trip Budget
              </h3>
              <p className="text-xs text-[#68736F]">
                {trip.destination} • {trip.name}
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

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-xs font-bold text-[#991B1B] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Currency selection */}
          <div>
            <label className="block text-xs font-black text-[#17201D] uppercase tracking-wider mb-1.5">
              Trip Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DD] text-xs font-bold text-[#17201D] focus:outline-none focus:border-[#FF6B4A]"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flagEmoji} {c.name} ({c.symbol} - {c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Budget Input */}
          <div>
            <label className="block text-xs font-black text-[#17201D] uppercase tracking-wider mb-1.5">
              Total Budget Limit
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-black text-[#8A9591]">
                {config.symbol}
              </span>
              <input
                type="number"
                step="any"
                min="100"
                value={budget}
                onChange={(e) => {
                  setBudget(e.target.value);
                  setError(null);
                }}
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DD] text-base font-black text-[#17201D] focus:outline-none focus:border-[#FF6B4A]"
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-[11px] font-bold text-[#8A9591] uppercase tracking-wider mb-2">
              Suggested Budget Presets
            </label>
            <div className="grid grid-cols-3 gap-2">
              {config.budgetPresets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handlePresetSelect(preset.value)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-extrabold border text-center transition-all cursor-pointer ${
                    parseInt(budget, 10) === preset.value
                      ? 'bg-[#17201D] text-white border-[#17201D]'
                      : 'bg-[#FAF8F5] text-[#17201D] border-[#EAE6DD] hover:border-[#17201D]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-[#EAE6DD]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full bg-[#FAF8F5] hover:bg-[#EAE6DD] text-[#17201D] text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#FF6B4A] hover:bg-[#E55837] text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
            >
              Save Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
