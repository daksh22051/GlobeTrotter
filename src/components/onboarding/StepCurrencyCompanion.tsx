import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CurrencyCode, TravelCompanion, CompanionOption } from '../../types/profile';
import { SUPPORTED_CURRENCIES, CURRENCY_MAP } from '../../utils/currency';
import { Globe, Users, Search, Check, User, Heart, Baby, Briefcase } from 'lucide-react';

interface StepCurrencyCompanionProps {
  currency: CurrencyCode;
  companion: TravelCompanion;
  onCurrencyChange: (currency: CurrencyCode) => void;
  onCompanionChange: (companion: TravelCompanion) => void;
  error?: string | null;
}

export const COMPANION_OPTIONS: (CompanionOption & { icon: React.FC<{ className?: string }> })[] = [
  {
    id: 'solo',
    label: 'Solo',
    description: 'Independent travel, total flexibility & personal growth.',
    iconName: 'User',
    icon: User,
  },
  {
    id: 'partner',
    label: 'Partner',
    description: 'Romantic escapes, couple getaways & scenic dinners for two.',
    iconName: 'Heart',
    icon: Heart,
  },
  {
    id: 'family',
    label: 'Family',
    description: 'Kid-friendly activities, comfortable stays & memorable times.',
    iconName: 'Baby',
    icon: Baby,
  },
  {
    id: 'friends',
    label: 'Friends',
    description: 'High-energy group trips, road trips & shared late nights.',
    iconName: 'Users',
    icon: Users,
  },
  {
    id: 'business',
    label: 'Business',
    description: 'Work-ready stays, seamless transit & bleisure city stops.',
    iconName: 'Briefcase',
    icon: Briefcase,
  },
];

export const StepCurrencyCompanion: React.FC<StepCurrencyCompanionProps> = ({
  currency,
  companion,
  onCurrencyChange,
  onCompanionChange,
  error,
}) => {
  const [currencySearch, setCurrencySearch] = useState('');
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);

  const filteredCurrencies = SUPPORTED_CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
      c.name.toLowerCase().includes(currencySearch.toLowerCase())
  );

  const selectedCurrencyConfig = CURRENCY_MAP[currency] || CURRENCY_MAP.INR;

  const handleSelectCurrency = (code: CurrencyCode) => {
    onCurrencyChange(code);
    setIsCurrencyDropdownOpen(false);
    setCurrencySearch('');
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8ED] text-[#FF6B4A] text-xs font-bold mb-3 border border-[#FFE8D6]">
          <Globe className="w-3.5 h-3.5" />
          <span>Step 04 • Currency & Travel Crew</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17201D] tracking-tight mb-2">
          Make GlobeTrotter feel like yours.
        </h2>
        <p className="text-sm sm:text-base text-[#68736F] max-w-xl">
          Set your preferred display currency and choose who typically joins your wanderlust adventures.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Section 1: Preferred Currency */}
      <div className="mb-8 bg-white p-5 sm:p-6 rounded-2xl border border-[#EAE6DD] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <label className="text-sm font-bold text-[#17201D] block">
              Preferred Currency
            </label>
            <p className="text-xs text-[#68736F]">
              All future trip budgets, flight costs, and hotel estimates will display in this currency.
            </p>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 bg-[#F4EFE6] text-[#17201D] rounded-full self-start sm:self-auto">
            Active: {selectedCurrencyConfig.flagEmoji} {selectedCurrencyConfig.code} ({selectedCurrencyConfig.symbol})
          </span>
        </div>

        {/* Selected Currency Banner / Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
            className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-[#EAE6DD] hover:border-[#FF6B4A] bg-[#FFFDF8] transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedCurrencyConfig.flagEmoji}</span>
              <div>
                <div className="text-sm font-bold text-[#17201D]">
                  {selectedCurrencyConfig.code} — {selectedCurrencyConfig.name}
                </div>
                <div className="text-xs text-[#68736F]">
                  Symbol: {selectedCurrencyConfig.symbol}
                </div>
              </div>
            </div>
            <div className="text-xs font-bold text-[#FF6B4A] flex items-center gap-1">
              <span>{isCurrencyDropdownOpen ? 'Close' : 'Change Currency'}</span>
              <span>▾</span>
            </div>
          </button>

          {/* Searchable Dropdown Grid */}
          {isCurrencyDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-3 bg-white rounded-2xl border border-[#EAE6DD] shadow-lg"
            >
              {/* Search Field */}
              <div className="relative mb-3">
                <Search className="w-4 h-4 text-[#8C9894] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={currencySearch}
                  onChange={(e) => setCurrencySearch(e.target.value)}
                  placeholder="Search currency name or code..."
                  className="w-full pl-9 pr-3 py-2 bg-[#FDFBF7] border border-[#EAE6DD] rounded-xl text-xs text-[#17201D] focus:outline-none focus:border-[#FF6B4A]"
                />
              </div>

              {/* Currency list */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                {filteredCurrencies.map((c) => {
                  const isCurrent = currency === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleSelectCurrency(c.code)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#FFF8ED] border-[#FF6B4A] font-bold text-[#FF6B4A]'
                          : 'bg-white border-[#EAE6DD] hover:bg-[#F4EFE6] text-[#17201D]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-base">{c.flagEmoji}</span>
                        <span className="truncate">{c.code} ({c.symbol})</span>
                      </div>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-[#20B8A6] shrink-0 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Section 2: Travel Companions */}
      <div>
        <div className="mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#17201D]">
            Who do you usually travel with?
          </h3>
          <p className="text-xs text-[#68736F]">
            Helps us tailor accommodation sizes, pace, and group activities.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {COMPANION_OPTIONS.map((item) => {
            const isSelected = companion === item.id;
            const Icon = item.icon;

            return (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => onCompanionChange(item.id)}
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
                  <div className="flex items-center justify-between mb-3">
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
                    {item.label}
                  </h4>
                  <p className="text-[11px] text-[#68736F] leading-snug">
                    {item.description}
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
