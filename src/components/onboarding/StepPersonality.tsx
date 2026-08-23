import React from 'react';
import { motion } from 'motion/react';
import { TravelPersonality, PersonalityOption } from '../../types/profile';
import { Compass, Utensils, Landmark, Mountain, Palmtree, Camera, Sparkles, Check } from 'lucide-react';

interface StepPersonalityProps {
  personality: TravelPersonality;
  onPersonalityChange: (personality: TravelPersonality) => void;
  error?: string | null;
}

export const PERSONALITY_OPTIONS: (PersonalityOption & { icon: React.FC<{ className?: string }>; emoji: string })[] = [
  {
    id: 'explorer',
    title: 'THE EXPLORER',
    tagline: 'Always looking for the next adventure.',
    description: 'Thrives on off-the-beaten-path paths, spontaneous discoveries & uncovering hidden local corners.',
    badge: 'Curious & Bold',
    accentColor: '#FF6B4A',
    emoji: '🧭',
    icon: Compass,
  },
  {
    id: 'foodie',
    title: 'THE FOODIE',
    tagline: 'Local food is the best way to know a place.',
    description: 'Plans trips around street food stalls, secret wine cellars, culinary cooking classes & Michelin gems.',
    badge: 'Flavor Chaser',
    accentColor: '#FF9F1C',
    emoji: '🍜',
    icon: Utensils,
  },
  {
    id: 'culture_lover',
    title: 'THE CULTURE LOVER',
    tagline: 'Museums, history, art and local stories.',
    description: 'Drawn to ancient ruins, art galleries, historic walking tours & rich neighborhood traditions.',
    badge: 'Heritage & Art',
    accentColor: '#845EC2',
    emoji: '🏛',
    icon: Landmark,
  },
  {
    id: 'adventure_seeker',
    title: 'THE ADVENTURE SEEKER',
    tagline: 'Give me mountains, water and adrenaline.',
    description: 'Craves high-altitude treks, surfing swells, rugged wildlife safaris & pulse-pounding thrills.',
    badge: 'Adrenaline High',
    accentColor: '#20B8A6',
    emoji: '🧗',
    icon: Mountain,
  },
  {
    id: 'relaxer',
    title: 'THE RELAXER',
    tagline: 'Slow days, beautiful views and good food.',
    description: 'Loves beachfront hammocks, thermal spas, leisurely vineyard lunches & unhurried golden hours.',
    badge: 'Pure Zen',
    accentColor: '#2EC4B6',
    emoji: '🌴',
    icon: Palmtree,
  },
  {
    id: 'photographer',
    title: 'THE PHOTOGRAPHER',
    tagline: 'Every journey deserves a perfect frame.',
    description: 'Chases blue hour light, architectural angles, dramatic drone landscapes & timeless portraits.',
    badge: 'Visual Storyteller',
    accentColor: '#3D5A80',
    emoji: '📸',
    icon: Camera,
  },
];

export const StepPersonality: React.FC<StepPersonalityProps> = ({
  personality,
  onPersonalityChange,
  error,
}) => {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8ED] text-[#FF6B4A] text-xs font-bold mb-3 border border-[#FFE8D6]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 05 • Travel Personality</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17201D] tracking-tight mb-2">
          What's your travel personality?
        </h2>
        <p className="text-sm sm:text-base text-[#68736F] max-w-xl">
          Choose the archetype that best captures how you experience the world.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PERSONALITY_OPTIONS.map((item) => {
          const isSelected = personality === item.id;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => onPersonalityChange(item.id)}
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
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl select-none">{item.emoji}</span>
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-[#FF6B4A] text-white'
                          : 'bg-[#F4EFE6] text-[#68736F]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>

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

                <h3 className="text-base font-black text-[#17201D] tracking-tight mb-1 group-hover:text-[#FF6B4A] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs font-semibold text-[#FF6B4A] mb-2 italic">
                  "{item.tagline}"
                </p>
                <p className="text-xs text-[#68736F] leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#EAE6DD]/70 flex items-center justify-between text-[11px] font-bold text-[#8C9894]">
                <span>AI Archetype Profile</span>
                <span className="text-[#17201D]">
                  {isSelected ? '★ Active Archetype' : 'Select'}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
