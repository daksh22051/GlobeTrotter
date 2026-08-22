import React from 'react';
import { motion } from 'motion/react';
import { TravelInterest, InterestOption } from '../../types/profile';
import { Check, Sparkles } from 'lucide-react';

interface StepInterestsProps {
  selectedInterests: TravelInterest[];
  onChange: (interests: TravelInterest[]) => void;
  error?: string | null;
}

export const INTEREST_OPTIONS: InterestOption[] = [
  { id: 'food', label: 'Food & Culinary', emoji: '🍜', description: 'Street eats, fine dining & local recipes', category: 'Taste' },
  { id: 'mountains', label: 'Mountains', emoji: '🏔', description: 'Alpine peaks, fresh air & scenic ridges', category: 'Outdoors' },
  { id: 'beaches', label: 'Beaches & Coast', emoji: '🏖', description: 'Golden sands, turquoise waters & sunsets', category: 'Relax' },
  { id: 'history', label: 'History & Heritage', emoji: '🏛', description: 'Ancient ruins, castles & storied streets', category: 'Culture' },
  { id: 'art', label: 'Art & Culture', emoji: '🎨', description: 'World-class museums, galleries & crafts', category: 'Culture' },
  { id: 'nature', label: 'Untouched Nature', emoji: '🌿', description: 'National parks, lakes & serene wildlife', category: 'Outdoors' },
  { id: 'adventure', label: 'Adventure Sports', emoji: '🧗', description: 'Trekking, rafting, thrills & adrenaline', category: 'Active' },
  { id: 'photography', label: 'Photography', emoji: '📸', description: 'Iconic viewpoints & cinematic lighting', category: 'Creative' },
  { id: 'shopping', label: 'Shopping & Bazaars', emoji: '🛍', description: 'Local markets, designer boutiques & gifts', category: 'Lifestyle' },
  { id: 'nightlife', label: 'Nightlife & Lounges', emoji: '🌃', description: 'Rooftops, lively music & evening vibes', category: 'Lifestyle' },
  { id: 'spirituality', label: 'Spirituality & Zen', emoji: '🧘', description: 'Temples, yoga, wellness & mindful retreats', category: 'Wellness' },
  { id: 'architecture', label: 'Architecture', emoji: '🏙', description: 'Modern skylines, cathedrals & landmarks', category: 'Visual' },
];

export const StepInterests: React.FC<StepInterestsProps> = ({
  selectedInterests,
  onChange,
  error,
}) => {
  const toggleInterest = (id: TravelInterest) => {
    if (selectedInterests.includes(id)) {
      onChange(selectedInterests.filter((item) => item !== id));
    } else {
      onChange([...selectedInterests, id]);
    }
  };

  const selectAll = () => {
    if (selectedInterests.length === INTEREST_OPTIONS.length) {
      onChange(['food', 'mountains', 'beaches']);
    } else {
      onChange(INTEREST_OPTIONS.map((o) => o.id));
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8ED] text-[#FF6B4A] text-xs font-bold mb-3 border border-[#FFE8D6]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 01 • Travel Interests</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17201D] tracking-tight mb-2">
          What makes a trip unforgettable for you?
        </h2>
        <p className="text-sm sm:text-base text-[#68736F] max-w-xl">
          Pick everything you love. We'll use this to personalize your journeys.
        </p>
      </div>

      {/* Quick Filter / Counter Bar */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#EAE6DD]/70">
        <span className="text-xs font-bold text-[#17201D]">
          Selected:{' '}
          <span className={selectedInterests.length > 0 ? 'text-[#20B8A6]' : 'text-[#FF6B4A]'}>
            {selectedInterests.length} of {INTEREST_OPTIONS.length}
          </span>{' '}
          <span className="text-[#8C9894] font-normal">(Pick at least 1)</span>
        </span>
        <button
          type="button"
          onClick={selectAll}
          className="text-xs font-semibold text-[#68736F] hover:text-[#17201D] underline underline-offset-2 transition-colors cursor-pointer"
        >
          {selectedInterests.length === INTEREST_OPTIONS.length ? 'Reset to Core' : 'Select All'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
        {INTEREST_OPTIONS.map((option) => {
          const isSelected = selectedInterests.includes(option.id);

          return (
            <motion.button
              key={option.id}
              type="button"
              onClick={() => toggleInterest(option.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              aria-pressed={isSelected}
              className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start justify-between relative group ${
                isSelected
                  ? 'bg-[#FFF8ED] border-[#FF6B4A] shadow-sm ring-1 ring-[#FF6B4A]/30'
                  : 'bg-white hover:bg-[#FDFBF7] border-[#EAE6DD] hover:border-[#D1C9BC]'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl sm:text-3xl select-none leading-none pt-0.5">
                  {option.emoji}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-[#17201D] group-hover:text-[#FF6B4A] transition-colors">
                      {option.label}
                    </span>
                  </div>
                  <p className="text-xs text-[#68736F] mt-0.5 leading-snug line-clamp-1 sm:line-clamp-none">
                    {option.description}
                  </p>
                </div>
              </div>

              {/* Checkbox Indicator */}
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5 transition-all duration-200 ${
                  isSelected
                    ? 'bg-[#20B8A6] scale-100'
                    : 'bg-transparent border border-[#D1C9BC] scale-90 group-hover:border-[#8C9894]'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
