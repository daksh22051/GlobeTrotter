import React from 'react';
import { motion } from 'motion/react';
import { TravelStyle, TravelStyleOption } from '../../types/profile';
import { Compass, Coffee, Zap, Gauge, Check } from 'lucide-react';

interface StepTravelStyleProps {
  travelStyle: TravelStyle;
  pace: number; // 0 (Relaxed) to 100 (Packed)
  onStyleChange: (style: TravelStyle, pace: number) => void;
  onPaceChange: (pace: number) => void;
  error?: string | null;
}

export const TRAVEL_STYLES: TravelStyleOption[] = [
  {
    id: 'relaxed',
    label: 'Relaxed',
    description: 'Slow mornings, fewer plans, more time to soak in the atmosphere.',
    defaultPace: 15,
    badge: 'Chill & Mindful',
  },
  {
    id: 'balanced',
    label: 'Balanced',
    description: 'A little exploration, a little downtime. The sweet spot of travel.',
    defaultPace: 50,
    badge: 'Most Popular',
  },
  {
    id: 'packed',
    label: 'Packed',
    description: 'See more. Do more. Make every single day count with exciting itineraries.',
    defaultPace: 85,
    badge: 'High Energy',
  },
];

export const StepTravelStyle: React.FC<StepTravelStyleProps> = ({
  travelStyle,
  pace,
  onStyleChange,
  onPaceChange,
  error,
}) => {
  const handleCardClick = (styleOption: TravelStyleOption) => {
    onStyleChange(styleOption.id, styleOption.defaultPace);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    onPaceChange(val);

    // Auto-update the active card category based on the slider value
    if (val <= 33 && travelStyle !== 'relaxed') {
      onStyleChange('relaxed', val);
    } else if (val > 33 && val <= 66 && travelStyle !== 'balanced') {
      onStyleChange('balanced', val);
    } else if (val > 66 && travelStyle !== 'packed') {
      onStyleChange('packed', val);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8ED] text-[#FF6B4A] text-xs font-bold mb-3 border border-[#FFE8D6]">
          <Gauge className="w-3.5 h-3.5" />
          <span>Step 02 • Travel Pace & Style</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17201D] tracking-tight mb-2">
          How do you like to travel?
        </h2>
        <p className="text-sm sm:text-base text-[#68736F] max-w-xl">
          Tell us your ideal pace. We'll balance your days with the right mix of adventures and breathing room.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Visual Choice Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {TRAVEL_STYLES.map((option) => {
          const isSelected = travelStyle === option.id;
          const IconComponent =
            option.id === 'relaxed' ? Coffee : option.id === 'balanced' ? Compass : Zap;

          return (
            <motion.button
              key={option.id}
              type="button"
              onClick={() => handleCardClick(option)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              aria-pressed={isSelected}
              className={`p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative group ${
                isSelected
                  ? 'bg-[#FFF8ED] border-[#FF6B4A] shadow-md ring-2 ring-[#FF6B4A]/30'
                  : 'bg-white hover:bg-[#FDFBF7] border-[#EAE6DD] hover:border-[#D1C9BC]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-[#FF6B4A] text-white shadow-sm'
                        : 'bg-[#F4EFE6] text-[#17201D] group-hover:bg-[#EAE6DD]'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-[#20B8A6] text-white'
                        : 'bg-[#F4EFE6] text-[#68736F]'
                    }`}
                  >
                    {option.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#17201D] mb-1.5 group-hover:text-[#FF6B4A] transition-colors">
                  {option.label}
                </h3>
                <p className="text-xs text-[#68736F] leading-relaxed">
                  {option.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#EAE6DD]/70 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#8C9894]">
                  {option.id === 'relaxed' ? '1-2 activities/day' : option.id === 'balanced' ? '3-4 activities/day' : '5+ activities/day'}
                </span>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    isSelected
                      ? 'bg-[#20B8A6] text-white'
                      : 'border border-[#D1C9BC]'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Polished Travel Style Custom Slider */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#EAE6DD] shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B4A]">
              Fine-tune Pace
            </span>
            <h4 className="text-sm font-bold text-[#17201D]">
              Continuous Pace Slider
            </h4>
          </div>
          <div className="px-3 py-1 rounded-full bg-[#FFF8ED] text-[#17201D] text-xs font-bold border border-[#FFE8D6]">
            {pace < 33 ? '🌿 Slow & Relaxed' : pace < 67 ? '⚖️ Balanced Explorer' : '⚡ Fast-Paced Trailblazer'} ({pace}%)
          </div>
        </div>

        {/* Custom Track Range Slider */}
        <div className="relative py-4">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={pace}
            onChange={handleSliderChange}
            className="w-full h-2.5 bg-[#EAE6DD] rounded-lg appearance-none cursor-pointer accent-[#FF6B4A]"
            aria-label="Travel Pace Slider"
          />

          {/* Slider Labels */}
          <div className="flex items-center justify-between mt-2 text-xs font-bold text-[#68736F]">
            <button
              type="button"
              onClick={() => onStyleChange('relaxed', 15)}
              className={`hover:text-[#FF6B4A] transition-colors cursor-pointer ${
                travelStyle === 'relaxed' ? 'text-[#FF6B4A] font-extrabold' : ''
              }`}
            >
              ☕ Relaxed (0%)
            </button>
            <button
              type="button"
              onClick={() => onStyleChange('balanced', 50)}
              className={`hover:text-[#FF6B4A] transition-colors cursor-pointer ${
                travelStyle === 'balanced' ? 'text-[#FF6B4A] font-extrabold' : ''
              }`}
            >
              🧭 Balanced (50%)
            </button>
            <button
              type="button"
              onClick={() => onStyleChange('packed', 85)}
              className={`hover:text-[#FF6B4A] transition-colors cursor-pointer ${
                travelStyle === 'packed' ? 'text-[#FF6B4A] font-extrabold' : ''
              }`}
            >
              ⚡ Packed (100%)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
