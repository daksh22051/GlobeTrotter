import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserPreferences, TravelInterest } from '../../types/profile';
import { generatePersonalizationSummary } from '../../utils/personalization';
import { formatCurrency, CURRENCY_MAP } from '../../utils/currency';
import {
  Sparkles,
  Edit3,
  CheckCircle2,
  ArrowRight,
  Compass,
  Coins,
  Gauge,
  Globe,
  Heart,
  Loader2,
} from 'lucide-react';

interface StepReviewProps {
  preferences: UserPreferences;
  userName?: string;
  onEditStep: (stepNumber: number) => void;
  onFinish: () => Promise<void> | void;
}

const INTEREST_EMOJIS: Record<TravelInterest, string> = {
  food: '🍜 Food',
  mountains: '🏔 Mountains',
  beaches: '🏖 Beaches',
  history: '🏛 History',
  art: '🎨 Art',
  nature: '🌿 Nature',
  adventure: '🧗 Adventure',
  photography: '📸 Photography',
  shopping: '🛍 Shopping',
  nightlife: '🌃 Nightlife',
  spirituality: '🧘 Spirituality',
  architecture: '🏙 Architecture',
};

const STYLE_NAMES: Record<string, string> = {
  relaxed: 'Relaxed (Slow Mornings)',
  balanced: 'Balanced (Exploration + Rest)',
  packed: 'Packed (Action-Focused)',
};

const BUDGET_STYLE_NAMES: Record<string, string> = {
  budget_friendly: 'Budget Friendly',
  balanced: 'Balanced Value',
  comfort: 'Comfort First',
  luxury: 'Luxury & Bespoke',
};

const COMPANION_NAMES: Record<string, string> = {
  solo: 'Solo Adventurer',
  partner: 'With Partner',
  family: 'With Family',
  friends: 'With Friends',
  business: 'Business / Bleisure',
};

const PERSONALITY_NAMES: Record<string, string> = {
  explorer: 'The Explorer 🧭',
  foodie: 'The Foodie 🍜',
  culture_lover: 'The Culture Lover 🏛',
  adventure_seeker: 'The Adventure Seeker 🧗',
  relaxer: 'The Relaxer 🌴',
  photographer: 'The Photographer 📸',
};

export const StepReview: React.FC<StepReviewProps> = ({
  preferences,
  userName,
  onEditStep,
  onFinish,
}) => {
  const [isFinishing, setIsFinishing] = useState(false);
  const [isCompleteCelebration, setIsCompleteCelebration] = useState(false);

  const summary = generatePersonalizationSummary(preferences);
  const currencyConfig = CURRENCY_MAP[preferences.currency] || CURRENCY_MAP.INR;
  const formattedBudget = formatCurrency(preferences.budget, preferences.currency);

  const handleStartExploring = async () => {
    setIsFinishing(true);
    setIsCompleteCelebration(true);

    // Give 1.4s for the celebration animation before completing
    setTimeout(async () => {
      try {
        await onFinish();
      } catch {
        setIsFinishing(false);
        setIsCompleteCelebration(false);
      }
    }, 1400);
  };

  return (
    <div className="w-full relative">
      {/* Celebration Modal / Overlay */}
      <AnimatePresence>
        {isCompleteCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#17201D]/75 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full text-center border border-[#EAE6DD] shadow-2xl flex flex-col items-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
                className="w-16 h-16 rounded-full bg-[#DDF7F2] text-[#20B8A6] flex items-center justify-center mb-5 shadow-sm"
              >
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </motion.div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8ED] text-[#FF6B4A] text-xs font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Profile Generated</span>
              </div>

              <h3 className="text-2xl font-black text-[#17201D] mb-2">
                You're ready to explore{userName ? `, ${userName}` : ''}!
              </h3>
              <p className="text-sm text-[#68736F] mb-6 leading-relaxed">
                Personalizing your GlobeTrotter travel experience based on your unique DNA...
              </p>

              <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#FF6B4A]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Entering GlobeTrotter...</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Review Header */}
      <div className="mb-6 sm:mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8ED] text-[#FF6B4A] text-xs font-bold mb-3 border border-[#FFE8D6]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Final Review</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17201D] tracking-tight mb-2">
          Your GlobeTrotter profile is ready ✨
        </h2>
        <p className="text-sm sm:text-base text-[#68736F] max-w-xl">
          Review your custom travel DNA below. You can adjust any preference before we start recommending destinations.
        </p>
      </div>

      {/* AI Travel DNA Summary Banner */}
      <div className="bg-gradient-to-br from-[#FFF8ED] via-white to-[#F0FAF8] rounded-3xl p-6 sm:p-7 border border-[#FFE4C4] shadow-sm mb-6 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-[#FF6B4A] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#FF6B4A]">
            AI Travel Profile Summary
          </span>
        </div>

        <h3 className="text-lg sm:text-xl font-extrabold text-[#17201D] mb-2 leading-snug">
          {summary.headline}
        </h3>
        <p className="text-xs sm:text-sm text-[#68736F] leading-relaxed mb-4">
          {summary.description}
        </p>

        {/* Travel DNA Tag Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#EAE6DD]/70">
          <span className="text-[11px] font-bold text-[#8C9894] uppercase tracking-wider mr-1">
            Travel DNA:
          </span>
          {summary.travelDNA.map((tag, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-full text-xs font-bold bg-white text-[#17201D] border border-[#EAE6DD] shadow-2xs"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Structured Preference Cards Grid with Direct Edit Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Section 1: Travel Interests */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAE6DD] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#FF6B4A]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#17201D]">
                  Travel Interests ({preferences.interests.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => onEditStep(1)}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6B4A] hover:text-[#E55837] cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {preferences.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-2.5 py-1 rounded-lg bg-[#FDFBF7] border border-[#EAE6DD] text-xs font-semibold text-[#17201D]"
                >
                  {INTEREST_EMOJIS[interest] || interest}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Travel Style & Pace */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAE6DD] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-[#20B8A6]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#17201D]">
                  Travel Style & Pace
                </span>
              </div>
              <button
                type="button"
                onClick={() => onEditStep(2)}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6B4A] hover:text-[#E55837] cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            <div className="text-sm font-bold text-[#17201D]">
              {STYLE_NAMES[preferences.travelStyle] || preferences.travelStyle}
            </div>
            <div className="text-xs text-[#68736F] mt-1">
              Custom pace calibrated to <span className="font-bold text-[#17201D]">{preferences.travelStylePace}%</span> intensity.
            </div>
          </div>
        </div>

        {/* Section 3: Budget & Spend Tier */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAE6DD] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-[#FF9F1C]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#17201D]">
                  Target Budget
                </span>
              </div>
              <button
                type="button"
                onClick={() => onEditStep(3)}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6B4A] hover:text-[#E55837] cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            <div className="text-lg font-black text-[#17201D]">
              {formattedBudget} <span className="text-xs font-normal text-[#68736F]">/ per trip</span>
            </div>
            <div className="text-xs text-[#68736F] mt-1">
              Spend style:{' '}
              <span className="font-bold text-[#17201D]">
                {BUDGET_STYLE_NAMES[preferences.budgetStyle] || preferences.budgetStyle}
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Currency & Companions */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAE6DD] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#3D5A80]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#17201D]">
                  Currency & Companions
                </span>
              </div>
              <button
                type="button"
                onClick={() => onEditStep(4)}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6B4A] hover:text-[#E55837] cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            <div className="text-sm font-bold text-[#17201D]">
              {currencyConfig.flagEmoji} {currencyConfig.code} ({currencyConfig.name})
            </div>
            <div className="text-xs text-[#68736F] mt-1">
              Usually travels:{' '}
              <span className="font-bold text-[#17201D]">
                {COMPANION_NAMES[preferences.travelCompanion] || preferences.travelCompanion}
              </span>
            </div>
          </div>
        </div>

        {/* Section 5: Travel Personality (Full Width) */}
        <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-[#EAE6DD] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#FF6B4A]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#17201D]">
                  Travel Personality Archetype
                </span>
              </div>
              <button
                type="button"
                onClick={() => onEditStep(5)}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6B4A] hover:text-[#E55837] cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-base font-extrabold text-[#17201D]">
                {PERSONALITY_NAMES[preferences.travelPersonality] || preferences.travelPersonality}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#EAE6DD]">
        <span className="text-xs text-[#68736F] text-center sm:text-left">
          Preferences saved securely in your profile. You can update these anytime.
        </span>

        <button
          type="button"
          onClick={handleStartExploring}
          disabled={isFinishing}
          className="w-full sm:w-auto min-w-[220px] flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#FF6B4A] hover:bg-[#E55837] text-white text-base font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer disabled:opacity-75"
        >
          {isFinishing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Saving Profile...</span>
            </>
          ) : (
            <>
              <span>Start Exploring</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
