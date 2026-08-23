import React from 'react';
import { Wallet, Info, Check, Coins } from 'lucide-react';
import { CurrencyCode } from '../../types/profile';

interface CurrencyPreferencesProps {
  currency: CurrencyCode;
  onCurrencyChange: (curr: CurrencyCode) => void;
}

const CURRENCIES: { code: CurrencyCode; label: string; symbol: string; country: string }[] = [
  { code: 'INR', label: 'Indian Rupee', symbol: '₹', country: 'India' },
  { code: 'USD', label: 'US Dollar', symbol: '$', country: 'United States' },
  { code: 'EUR', label: 'Euro', symbol: '€', country: 'European Union' },
  { code: 'GBP', label: 'British Pound', symbol: '£', country: 'United Kingdom' },
  { code: 'JPY', label: 'Japanese Yen', symbol: '¥', country: 'Japan' },
  { code: 'AUD', label: 'Australian Dollar', symbol: 'A$', country: 'Australia' },
  { code: 'CAD', label: 'Canadian Dollar', symbol: 'C$', country: 'Canada' },
  { code: 'AED', label: 'UAE Dirham', symbol: 'د.إ', country: 'United Arab Emirates' },
  { code: 'SGD', label: 'Singapore Dollar', symbol: 'S$', country: 'Singapore' },
];

export const CurrencyPreferences: React.FC<CurrencyPreferencesProps> = ({
  currency,
  onCurrencyChange,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-[#EAE6DD] p-6 sm:p-8 shadow-xs space-y-6">
      <div>
        <h2 className="text-lg font-extrabold text-[#17201D] tracking-tight">Currency & Financials</h2>
        <p className="text-xs text-[#68736F] mt-0.5">
          Select your default currency for future trip budgeting and cost estimation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CURRENCIES.map((c) => {
          const isSelected = currency === c.code;
          return (
            <button
              key={c.code}
              type="button"
              onClick={() => onCurrencyChange(c.code)}
              className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                isSelected
                  ? 'bg-[#E8F8F5] border-[#20B8A6] shadow-xs ring-1 ring-[#20B8A6]/20'
                  : 'bg-[#FCFBF8] border-[#EAE6DD] hover:border-[#17201D]/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black ${
                    isSelected
                      ? 'bg-[#20B8A6] text-white shadow-2xs'
                      : 'bg-[#F4F1EA] text-[#17201D]'
                  }`}
                >
                  {c.symbol}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-[#17201D]">{c.code}</span>
                    <span className="text-[10px] text-[#838F8B]">({c.symbol})</span>
                  </div>
                  <p className="text-[11px] text-[#68736F] font-medium">{c.label}</p>
                </div>
              </div>

              {isSelected && <Check className="w-4 h-4 text-[#20B8A6]" />}
            </button>
          );
        })}
      </div>

      {/* Financial Scope Note */}
      <div className="p-3.5 rounded-2xl bg-[#FFF9F0] border border-[#FFE7C2] flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#E08A00] shrink-0 mt-0.5" />
        <div className="text-xs text-[#68736F] leading-relaxed">
          <span className="font-bold text-[#17201D]">Data Integrity Guarantee:</span> Changing your default
          currency applies to newly created trips. Existing active trips preserve their original currency settings
          without silent conversion.
        </div>
      </div>
    </div>
  );
};
