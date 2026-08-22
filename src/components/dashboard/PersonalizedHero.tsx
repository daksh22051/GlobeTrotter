import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Compass, MapPin, Route } from 'lucide-react';
import { User } from '../../types';
import { UserPreferences } from '../../types/profile';
import { TRAVEL_IMAGES } from '../../assets/images';
import { formatCurrency } from '../../utils/currency';

interface PersonalizedHeroProps {
  currentUser: User | null;
  preferences: UserPreferences | null;
}

export const PersonalizedHero: React.FC<PersonalizedHeroProps> = ({
  currentUser,
  preferences,
}) => {
  const navigate = useNavigate();

  const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : '';
  const interests = preferences?.interests && preferences.interests.length > 0
    ? preferences.interests
    : ['nature', 'food', 'photography'];

  // Map interests to human readable labels
  const formattedInterests =
    interests.length === 1
      ? interests[0]
      : interests.length === 2
      ? `${interests[0]} and ${interests[1]}`
      : `${interests[0]}, ${interests[1]}, and ${interests[2]}`;

  const stylePace = preferences?.travelStyle || 'balanced';
  const currency = preferences?.currency || 'INR';
  const budget = preferences?.budget || 50000;
  const formattedBudget = formatCurrency(budget, currency);

  const personalityName = preferences?.travelPersonality
    ? preferences.travelPersonality
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : 'Explorer';

  return (
    <section
      id="personalized-hero"
      aria-label="Personalized Travel Hero"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFF8F3] via-white to-[#F0FAF8] border border-[#EAE6DD] shadow-xs p-6 sm:p-8 lg:p-10"
    >
      {/* Background Decorative Rings */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6B4A]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#20B8A6]/5 rounded-full blur-2xl translate-y-1/3 pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Personalized Copy & CTAs */}
        <div className="lg:col-span-7 space-y-5">
          {/* AI Personalized Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#FFE0D6] shadow-2xs">
            <div className="w-2 h-2 rounded-full bg-[#FF6B4A] animate-pulse" />
            <Sparkles className="w-3.5 h-3.5 text-[#FF6B4A]" />
            <span className="text-xs font-bold text-[#FF6B4A] tracking-wide">
              AI Tailored for {personalityName}
            </span>
          </div>

          {/* Main Editorial Headline */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#17201D] tracking-tight leading-[1.2]">
            Ready for your next adventure{firstName ? `, ${firstName}` : ''}?
          </h2>

          {/* Personalized Dynamic Subtext */}
          <p className="text-sm sm:text-base text-[#4A5551] leading-relaxed max-w-xl">
            Trips crafted around your passion for{' '}
            <span className="font-bold text-[#17201D] capitalize">{formattedInterests}</span>.
            Calibrated for a{' '}
            <span className="font-semibold text-[#17201D]">{stylePace} pace</span> with a typical{' '}
            <span className="font-semibold text-[#17201D]">{formattedBudget}</span> budget per trip.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/plan-trip')}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-[#FF6B4A] hover:bg-[#E55837] text-white text-sm font-bold shadow-md shadow-[#FF6B4A]/20 hover:shadow-lg hover:shadow-[#FF6B4A]/30 active:scale-[0.98] transition-all cursor-pointer group"
            >
              <span>Plan New Trip</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/explore')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-white hover:bg-[#F9F7F1] text-[#17201D] border border-[#EAE6DD] hover:border-[#D1CBC0] text-sm font-bold shadow-2xs transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#20B8A6]" />
              <span>Explore Destinations</span>
            </button>
          </div>

          {/* Live Micro DNA Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] font-medium text-[#68736F]">
            <span className="text-[#98A29F]">Your Travel DNA:</span>
            <span className="px-2.5 py-0.5 rounded-md bg-white border border-[#EAE6DD] text-[#17201D] font-semibold">
              {personalityName}
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-white border border-[#EAE6DD] text-[#17201D] font-semibold capitalize">
              {stylePace} Pace
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-white border border-[#EAE6DD] text-[#17201D] font-semibold">
              {formattedBudget} / trip
            </span>
          </div>
        </div>

        {/* Right Column: Premium Editorial Travel Visual */}
        <div className="lg:col-span-5 relative">
          <div className="relative mx-auto max-w-md lg:max-w-none">
            {/* Primary Visual Container */}
            <div className="relative rounded-3xl overflow-hidden shadow-lg border-4 border-white aspect-[4/3] sm:aspect-[16/11]">
              <img
                src={TRAVEL_IMAGES.dashboardHero}
                alt="Scenic travel road trip through mountain passes"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

              {/* Destination Tag inside image */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                  <MapPin className="w-3.5 h-3.5 text-[#FF8E72]" />
                  <span className="font-bold">Trending: Amalfi • Interlaken • Bali</span>
                </div>
              </div>
            </div>

            {/* Floating Editorial Badge */}
            <div className="absolute -top-3 -left-3 sm:-left-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#EAE6DD] shadow-md flex items-center gap-2.5 animate-bounce-subtle">
              <div className="w-7 h-7 rounded-xl bg-[#DDF7F2] text-[#20B8A6] flex items-center justify-center">
                <Route className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-wider font-bold text-[#20B8A6]">
                  Smart Route
                </p>
                <p className="text-xs font-extrabold text-[#17201D]">
                  Curated for you
                </p>
              </div>
            </div>

            {/* Floating Personal Match Pill */}
            <div className="absolute -bottom-3 -right-2 sm:-right-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-[#EAE6DD] shadow-md flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#20B8A6]" />
              <span className="text-xs font-bold text-[#17201D]">98% Preference Match</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
