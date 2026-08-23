import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Compass, Route } from 'lucide-react';
import { User } from '../../types';
import { UserPreferences } from '../../types/profile';
import { TRAVEL_IMAGES } from '../../assets/images';

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
          {/* Main Editorial Headline */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#17201D] tracking-tight leading-[1.2]">
            Ready for your next adventure{firstName ? `, ${firstName}` : ''}?
          </h2>

          {/* Neutral welcome copy when no user-specific context is required. */}
          <p className="text-sm sm:text-base text-[#4A5551] leading-relaxed max-w-xl">
            Plan a trip at your own pace, discover new places, and keep every detail organized in one place.
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

          </div>
        </div>
      </div>
    </section>
  );
};
